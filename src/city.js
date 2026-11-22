import * as THREE from 'three';
import * as S from './shaders.js';
import { rng, lerp } from './util.js';

export const PALETTES = {
  night:  { zenith: 0x03050d, mid: 0x0a1330, horizon: 0x2b1a45, glow: 0x5a2a1c, fog: 0x0b0f24, dens: 0.00135, lit: 0.42, base: 0x0c1220, lamp: 0xffa64d, stars: 1.0 },
  dusk:   { zenith: 0x141a45, mid: 0x3a2c6a, horizon: 0xc8605a, glow: 0x7a3a24, fog: 0x2a2545, dens: 0.00125, lit: 0.30, base: 0x141a2c, lamp: 0xffa64d, stars: 0.35 },
  dawn:   { zenith: 0x1a2a55, mid: 0x5a5f9a, horizon: 0xe8a07c, glow: 0x6a4030, fog: 0x4c5677, dens: 0.0012, lit: 0.18, base: 0x1a2233, lamp: 0xc98a4d, stars: 0.12 },
  golden: { zenith: 0x2f5c9e, mid: 0x6f98c6, horizon: 0xf0be8a, glow: 0x6a5030, fog: 0x8ea3bd, dens: 0.0011, lit: 0.08, base: 0x2a3448, lamp: 0x6a5a3a, stars: 0.0 },
};

const col = (h) => new THREE.Color(h);

export function createCity(scene, quality, landmarks) {
  const R = quality.cityRadius;
  const rand = rng(697);

  // shared uniforms (same {value} objects are referenced by every material)
  const U = {
    uTime: { value: 0 }, uLit: { value: 0.42 }, uNeon: { value: 0 }, uFlash: { value: 0 },
    uFog: { value: col(PALETTES.night.fog) }, uFogDens: { value: PALETTES.night.dens },
    uBase: { value: col(PALETTES.night.base) }, uWarm: { value: col(0xffcf8a) }, uCool: { value: col(0x9fd0ff) },
  };

  // ---------- sky
  const skyU = {
    uZenith: { value: col(PALETTES.night.zenith) }, uMid: { value: col(PALETTES.night.mid) },
    uHorizon: { value: col(PALETTES.night.horizon) }, uGlow: { value: col(PALETTES.night.glow) },
    uTime: U.uTime, uStars: { value: 1 }, uFlash: U.uFlash, uFog: U.uFog,
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16),
    new THREE.ShaderMaterial({ vertexShader: S.skyVert, fragmentShader: S.skyFrag, uniforms: skyU, side: THREE.BackSide, depthWrite: false }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  scene.add(sky);

  // ---------- moon
  const moonTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const glow = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    glow.addColorStop(0, 'rgba(255,244,220,0.35)'); glow.addColorStop(1, 'rgba(255,244,220,0)');
    g.fillStyle = glow; g.fillRect(0, 0, 256, 256);
    const disc = g.createRadialGradient(112, 112, 6, 128, 128, 46);
    disc.addColorStop(0, '#fffaf0'); disc.addColorStop(1, '#e6dcc4');
    g.fillStyle = disc; g.beginPath(); g.arc(128, 128, 44, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(160,150,130,0.25)';
    [[112, 116, 9], [142, 136, 6], [126, 148, 5], [146, 108, 4]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false, transparent: true }));
  moon.position.set(-720, 560, -1150); moon.scale.setScalar(260); moon.renderOrder = -9;
  moon.userData.kind = 'moon';
  scene.add(moon);

  // ---------- ground
  const groundU = { ...U, uRoad: { value: col(0x0a0d14) }, uWalk: { value: col(0x161a23) }, uLamp: { value: col(PALETTES.night.lamp) }, uCity: { value: R } };
  const ground = new THREE.Mesh(new THREE.CircleGeometry(3300, 72).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({ vertexShader: S.groundVert, fragmentShader: S.groundFrag, uniforms: groundU }));
  scene.add(ground);

  // ---------- skyline (one instanced draw call)
  const occupied = landmarks.map((t) => ({ x: t.pos[0], z: t.pos[1], h: t.h }));
  const lots = [];
  for (let bx = -R; bx <= R; bx += 48) {
    for (let bz = -R; bz <= R; bz += 48) {
      if (Math.hypot(bx, bz) > R + 10) continue;
      if (occupied.some((o) => Math.abs(o.x - bx) < 30 && Math.abs(o.z - bz) < 30)) continue;
      const near = occupied.reduce((m, o) => Math.min(m, Math.hypot(o.x - bx, o.z - bz)), 1e9);
      const nearH = occupied.reduce((m, o) => (Math.hypot(o.x - bx, o.z - bz) < 125 ? Math.min(m, o.h) : m), 1e9);
      const d = Math.hypot(bx, bz);
      const make = (x, z, w, dd) => {
        let h = (16 + 105 * Math.exp(-((d / 240) ** 2))) * (0.45 + rand() * 1.0);
        if (rand() < 0.06) h *= 1.75;
        if (near < 125) h = Math.min(h, nearH * (near < 70 ? 0.5 : 0.68));
        h = Math.max(8, Math.min(h, 250));
        lots.push({ x, z, w, d: dd, h });
      };
      if (rand() < 0.35) make(bx, bz, 26 + rand() * 8, 26 + rand() * 8);
      else for (const ox of [-9, 9]) for (const oz of [-9, 9]) if (rand() < 0.85) make(bx + ox, bz + oz, 13 + rand() * 3, 13 + rand() * 3);
    }
  }
  // outskirts: low-rise suburbs out to the horizon so the city never ends in a void
  const OUT = R + quality.suburbs;
  for (let bx = -OUT; bx <= OUT; bx += 48) {
    for (let bz = -OUT; bz <= OUT; bz += 48) {
      const d = Math.hypot(bx, bz); if (d <= R + 10 || d > OUT) continue;
      const k = (d - R) / quality.suburbs;
      const n = rand() < 0.45 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const w = 14 + rand() * 18;
        lots.push({ x: bx + (n > 1 ? (i ? 9 : -9) : 0), z: bz + (rand() - 0.5) * 8, w: n > 1 ? 14 : w, d: 14 + rand() * 16, h: (6 + rand() * 30) * (1 - k * 0.6), sub: true });
      }
    }
  }
  const boxGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const bMat = new THREE.ShaderMaterial({
    vertexShader: S.buildingVert, fragmentShader: S.buildingFrag,
    uniforms: { ...U, uSeed: { value: 0 }, uAccent: { value: col(0x000000) }, uAccentMix: { value: 0 }, uCyl: { value: 0 }, uRadius: { value: 1 }, uCenter: { value: new THREE.Vector2() } },
  });
  const skyline = new THREE.InstancedMesh(boxGeo, bMat, lots.length);
  const seeds = new Float32Array(lots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  lots.forEach((b, i) => { m4.compose(v.set(b.x, 0, b.z), q, s.set(b.w, b.h, b.d)); skyline.setMatrixAt(i, m4); seeds[i] = rand() * 100; });
  boxGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  skyline.computeBoundingSphere();
  scene.add(skyline);

  // ---------- aviation lights on tall roofs
  const tall = lots.filter((b) => b.h > 95);
  const avPos = new Float32Array(tall.length * 3), avPh = new Float32Array(tall.length);
  tall.forEach((b, i) => { avPos.set([b.x, b.h + 1.5, b.z], i * 3); avPh[i] = rand(); });
  const avGeo = new THREE.BufferGeometry();
  avGeo.setAttribute('position', new THREE.BufferAttribute(avPos, 3));
  avGeo.setAttribute('aPhase', new THREE.BufferAttribute(avPh, 1));
  const pr = { value: quality.pr };
  const aviation = new THREE.Points(avGeo, new THREE.ShaderMaterial({
    vertexShader: S.beaconVert, fragmentShader: S.glowFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: U.uTime, uSize: { value: 9 }, uPR: pr },
  }));
  scene.add(aviation);

  // ---------- traffic (fully animated on the GPU)
  const cars = [];
  for (let c = -R + 24; c <= R; c += 48) {
    for (const axis of [0, 1]) {
      for (const lane of [-2.6, 2.6]) {
        const dir = lane > 0 ? 1 : -1;
        for (let k = 0; k < quality.carsPerLane; k++) {
          cars.push({ axis, coord: c + lane, speed: dir * (16 + rand() * 14), offset: rand() * R * 2,
            color: dir > 0 ? [1, 0.9, 0.72] : [1, 0.16, 0.1] });
        }
      }
    }
  }
  const tGeo = new THREE.BufferGeometry();
  const n = cars.length;
  const f = (k) => new Float32Array(n * k);
  const aAxis = f(1), aCoord = f(1), aSpeed = f(1), aOffset = f(1), aColor = f(3), pos = f(3);
  cars.forEach((c, i) => { aAxis[i] = c.axis; aCoord[i] = c.coord; aSpeed[i] = c.speed; aOffset[i] = c.offset; aColor.set(c.color, i * 3); });
  tGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  tGeo.setAttribute('aAxis', new THREE.BufferAttribute(aAxis, 1));
  tGeo.setAttribute('aCoord', new THREE.BufferAttribute(aCoord, 1));
  tGeo.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));
  tGeo.setAttribute('aOffset', new THREE.BufferAttribute(aOffset, 1));
  tGeo.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
  const traffic = new THREE.Points(tGeo, new THREE.ShaderMaterial({
    vertexShader: S.trafficVert, fragmentShader: S.glowFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: U.uTime, uSpan: { value: R }, uSize: { value: 5.5 }, uPR: pr },
  }));
  traffic.frustumCulled = false;
  scene.add(traffic);

  // ---------- rain (hidden storm mode)
  const drops = quality.rain;
  const rPos = new Float32Array(drops * 6), rSeed = new Float32Array(drops * 6);
  for (let i = 0; i < drops; i++) {
    const a = [rand(), rand(), rand()];
    rPos.set([0, 0, 0, 0, 1, 0], i * 6); rSeed.set([...a, ...a], i * 6);
  }
  const rGeo = new THREE.BufferGeometry();
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  rGeo.setAttribute('aSeed', new THREE.BufferAttribute(rSeed, 3));
  const rainU = { uTime: U.uTime, uOn: { value: 0 }, uCam: { value: new THREE.Vector3() } };
  const rain = new THREE.LineSegments(rGeo, new THREE.ShaderMaterial({
    vertexShader: S.rainVert, fragmentShader: S.rainFrag, uniforms: rainU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  rain.frustumCulled = false; rain.visible = false;
  scene.add(rain);

  // ---------- fireworks (hidden reward)
  const FW = 6, PER = 110;
  const fwDir = new Float32Array(FW * PER * 3), fwB = new Float32Array(FW * PER), fwC = new Float32Array(FW * PER * 3);
  const fwPalette = [[1, 0.3, 0.8], [0.3, 0.9, 1], [1, 0.8, 0.3], [0.5, 1, 0.5], [0.8, 0.5, 1], [1, 0.4, 0.3]];
  for (let b = 0; b < FW; b++) for (let i = 0; i < PER; i++) {
    const k = b * PER + i; const u = rand() * 2 - 1, th = rand() * Math.PI * 2, rr = Math.sqrt(1 - u * u) * (0.7 + rand() * 0.3);
    fwDir.set([rr * Math.cos(th), u * (0.7 + rand() * 0.3), rr * Math.sin(th)], k * 3); fwB[k] = b; fwC.set(fwPalette[b], k * 3);
  }
  const fwGeo = new THREE.BufferGeometry();
  fwGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FW * PER * 3), 3));
  fwGeo.setAttribute('aDir', new THREE.BufferAttribute(fwDir, 3));
  fwGeo.setAttribute('aBurst', new THREE.BufferAttribute(fwB, 1));
  fwGeo.setAttribute('aColor', new THREE.BufferAttribute(fwC, 3));
  const fwU = { uTime: U.uTime, uStart: { value: -100 }, uPR: pr, uOrigins: { value: Array.from({ length: FW }, () => new THREE.Vector3()) } };
  const fireworks = new THREE.Points(fwGeo, new THREE.ShaderMaterial({
    vertexShader: S.fireworkVert, fragmentShader: S.glowFrag, uniforms: fwU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  fireworks.frustumCulled = false; fireworks.visible = false;
  scene.add(fireworks);

  // ---------- palette transitions
  const cur = { ...PALETTES.night }; let from = null, to = null, pt = 1;
  function applyPalette(p) {
    skyU.uZenith.value.setHex(p.zenith); skyU.uMid.value.setHex(p.mid); skyU.uHorizon.value.setHex(p.horizon); skyU.uGlow.value.setHex(p.glow);
    U.uFog.value.setHex(p.fog); U.uFogDens.value = p.dens; U.uLit.value = p.lit; U.uBase.value.setHex(p.base);
    groundU.uLamp.value.setHex(p.lamp); skyU.uStars.value = p.stars; scene.background = null;
  }
  const mixHex = (a, b, t) => col(a).lerp(col(b), t).getHex();
  function setPalette(name) { if (!PALETTES[name]) return false; from = { ...cur }; to = PALETTES[name]; pt = 0; return true; }

  let storm = false, nextFlash = 0, flash = 0;
  function setStorm(on) { storm = on; rain.visible = on; rainU.uOn.value = on ? 1 : 0; }
  function launchFireworks(center, top) {
    fwU.uOrigins.value.forEach((o, i) => o.set(center.x + (rand() - 0.5) * 120, top + 40 + rand() * 70, center.z + (rand() - 0.5) * 80));
    fwU.uStart.value = U.uTime.value; fireworks.visible = true;
  }
  let neonTarget = 0;

  function update(t, dt, camera) {
    U.uTime.value = t;
    if (pt < 1) {
      pt = Math.min(1, pt + dt / 2.2);
      for (const k of Object.keys(to)) {
        cur[k] = typeof to[k] === 'number' && k !== 'dens' && k !== 'lit' && k !== 'stars' ? mixHex(from[k], to[k], pt) : lerp(from[k], to[k], pt);
      }
      applyPalette(cur);
    }
    U.uNeon.value += (neonTarget - U.uNeon.value) * Math.min(1, dt * 1.5);
    rainU.uCam.value.copy(camera.position);
    if (storm && t > nextFlash) { flash = 1; nextFlash = t + 4 + Math.random() * 7; }
    flash = Math.max(0, flash - dt * 4.5);
    U.uFlash.value = flash > 0.6 || (flash > 0.2 && flash < 0.35) ? flash : 0;
    if (fireworks.visible && t - fwU.uStart.value > 9) fireworks.visible = false;
  }
  applyPalette(cur);

  return {
    U, lots, moon, update, setPalette, setStorm, launchFireworks,
    setNeon: (on) => { neonTarget = on ? 1 : 0; },
    get storm() { return storm; }, setPR: (v) => { pr.value = v; },
    stats: { buildings: lots.length, cars: n },
  };
}
