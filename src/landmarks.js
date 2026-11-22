import * as THREE from 'three';
import * as S from './shaders.js';

const C = (h) => new THREE.Color(h);

function label(t) {
  const c = document.createElement('canvas'); c.width = 768; c.height = 200;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(6,10,20,0.72)';
  const r = 26, w = 740, h = 150, x = 14, y = 10;
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();
  g.strokeStyle = t.color; g.lineWidth = 4; g.globalAlpha = 0.9; g.stroke(); g.globalAlpha = 1;
  // waypoint diamond
  g.save(); g.translate(78, 85); g.rotate(Math.PI / 4); g.fillStyle = t.color; g.fillRect(-20, -20, 40, 40); g.restore();
  g.fillStyle = t.color; g.font = '600 34px "Inter", sans-serif'; g.textBaseline = 'middle';
  g.fillText(t.label, 128, 58);
  g.fillStyle = '#eef3ff'; g.font = '800 56px "Inter Display", "Inter", sans-serif';
  g.fillText(t.name, 128, 112);
  // pointer
  g.fillStyle = t.color; g.beginPath(); g.moveTo(364, 160); g.lineTo(404, 160); g.lineTo(384, 192); g.fill();
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true, fog: false }));
  sp.scale.set(57.6, 15, 1); sp.renderOrder = 20; sp.center.set(0.5, 0);
  return sp;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return { tex: t, canvas: c };
}

const _lp = new THREE.Vector3();
export function buildLandmarks(scene, towers, U, quality, avatarUrl) {
  const out = [];
  const boxGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);

  for (const t of towers) {
    const [x, z] = t.pos;
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const accent = C(t.color);
    const mat = (extra = {}) => new THREE.ShaderMaterial({
      vertexShader: S.buildingVert, fragmentShader: S.buildingFrag,
      uniforms: { ...U, uSeed: { value: x * 0.13 + z * 0.07 + 3 }, uAccent: { value: accent }, uAccentMix: { value: 0.35 },
        uCyl: { value: extra.cyl ? 1 : 0 }, uRadius: { value: extra.radius || 1 }, uCenter: { value: new THREE.Vector2(x, z) } },
    });
    const tm = mat();
    const edgeMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.85, fog: false });
    const glowMat = new THREE.MeshBasicMaterial({ color: accent, fog: false });
    const animated = [];

    const block = (w, h, d, px = 0, py = 0, pz = 0, edges = true, m = tm) => {
      const mesh = new THREE.Mesh(boxGeo, m); mesh.scale.set(w, h, d); mesh.position.set(px, py, pz); g.add(mesh);
      if (edges) {
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)), edgeMat);
        e.position.set(px, py, pz); g.add(e);
      }
      return mesh;
    };
    const glowBand = (w, d, y, th = 1.2) => {
      const b = new THREE.Group(); b.position.y = y; g.add(b);
      for (const [sx, sz, px, pz] of [[w + 0.8, 0.8, 0, d / 2], [w + 0.8, 0.8, 0, -d / 2], [0.8, d + 0.8, w / 2, 0], [0.8, d + 0.8, -w / 2, 0]]) {
        const m = new THREE.Mesh(boxGeo, glowMat); m.scale.set(sx, th, sz); m.position.set(px, 0, pz); b.add(m);
      }
      return b;
    };
    const blinker = (px, py, pz, color = 0xff2a1a, size = 2.2) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 8), new THREE.MeshBasicMaterial({ color, fog: false, transparent: true }));
      m.position.set(px, py, pz); g.add(m); animated.push((tt) => { m.material.opacity = 0.25 + 0.75 * (Math.sin(tt * 3 + px) > 0.2 ? 1 : 0); }); return m;
    };

    let top = t.h;
    switch (t.kind) {
      case 'hq': {
        block(34, 64, 34); glowBand(34, 34, 64);
        block(28, 70, 28, 0, 64); glowBand(28, 28, 134);
        block(20, 52, 20, 0, 134); glowBand(20, 20, 186);
        block(12, 14, 12, 0, 186);
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.6, 30, 8).translate(0, 15, 0), glowMat); spire.position.y = 200; g.add(spire);
        blinker(0, 231, 0);
        // photo screen on the front face
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), glowMat); frame.position.set(0, 100, 14.05); g.add(frame);
        const ph = canvasTex(256, 256, (c, w, h) => {
          c.fillStyle = '#0b1220'; c.fillRect(0, 0, w, h); c.fillStyle = t.color; c.font = '800 96px "Inter Display", sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CPD', w / 2, h / 2);
        });
        const photo = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ map: ph.tex, fog: false }));
        photo.position.set(0, 100, 14.1); g.add(photo);
        const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
        loader.load(avatarUrl, (tex) => { photo.material.map = tex; photo.material.needsUpdate = true; }, undefined, () => {});
        const nm = canvasTex(512, 96, (c, w, h) => {
          c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.fillStyle = '#eaf2ff'; c.font = '800 54px "Inter Display", sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CHAITANYA P DESAI', w / 2, h / 2);
        });
        const name = new THREE.Mesh(new THREE.PlaneGeometry(26, 4.9), new THREE.MeshBasicMaterial({ map: nm.tex, transparent: true, fog: false }));
        name.position.set(0, 84, 14.1); g.add(name);
        top = 231; break;
      }
      case 'repo': {
        block(30, 150, 30); glowBand(30, 30, 150);
        const crown = new THREE.Mesh(new THREE.OctahedronGeometry(10, 0), new THREE.MeshBasicMaterial({ color: accent, wireframe: true, fog: false }));
        crown.position.y = 166; g.add(crown); animated.push((tt) => { crown.rotation.y = tt * 0.6; });
        const sign = canvasTex(512, 300, (c, w, h) => {
          c.fillStyle = '#04110a'; c.fillRect(0, 0, w, h); c.strokeStyle = t.color; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16);
          c.fillStyle = t.color; c.textAlign = 'center'; c.font = '800 130px ui-monospace, monospace'; c.fillText('</>', w / 2, 150);
          c.font = '700 54px "Inter Display", sans-serif'; c.fillText('GITHUB', w / 2, 240);
        });
        for (const [px, pz, ry] of [[0, 15.05, 0], [15.05, 0, Math.PI / 2]]) {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), new THREE.MeshBasicMaterial({ map: sign.tex, fog: false }));
          p.position.set(px, 128, pz); p.rotation.y = ry; g.add(p);
        }
        top = 176; break;
      }
      case 'build': {
        block(28, 92, 28); glowBand(28, 28, 92);
        // unfinished skeleton
        const sk = new THREE.Group();
        const skMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.75, fog: false });
        sk.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(28, 48, 28, 1, 1, 1).translate(0, 24, 0)), skMat));
        for (let y = 0; y <= 48; y += 8) {
          const fl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(28, 0.01, 28)), skMat); fl.position.y = y; sk.add(fl);
        }
        for (const [px, pz] of [[-14, -14], [14, -14], [-14, 14], [14, 14], [0, -14], [0, 14], [-14, 0], [14, 0]]) {
          const col = new THREE.Mesh(boxGeo, glowMat); col.scale.set(0.7, 48, 0.7); col.position.set(px, 0, pz); sk.add(col);
        }
        sk.position.y = 92; g.add(sk);
        // crane
        const mast = new THREE.Mesh(boxGeo, glowMat); mast.scale.set(1.6, 86, 1.6); mast.position.set(10, 92, 10); g.add(mast);
        const jib = new THREE.Group(); jib.position.set(10, 176, 10); g.add(jib);
        const arm = new THREE.Mesh(boxGeo, glowMat); arm.scale.set(56, 1.4, 1.4); arm.position.set(14, 0, 0); jib.add(arm);
        const cw = new THREE.Mesh(boxGeo, tm); cw.scale.set(6, 4, 4); cw.position.set(-14, -2, 0); jib.add(cw);
        const cable = new THREE.Mesh(boxGeo, glowMat); cable.scale.set(0.25, 30, 0.25); cable.position.set(34, -30, 0); jib.add(cable);
        const load = new THREE.Mesh(boxGeo, tm); load.scale.set(5, 3, 5); load.position.set(34, -33, 0); jib.add(load);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a1a, fog: false, transparent: true }));
        tip.position.set(42, 1, 0); jib.add(tip);
        animated.push((tt) => { jib.rotation.y = Math.sin(tt * 0.18) * 1.3; tip.material.opacity = Math.sin(tt * 4) > 0 ? 1 : 0.2; });
        top = 178; break;
      }
      case 'lab': {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 112, 40, 1, false).translate(0, 56, 0), mat({ cyl: true, radius: 16 }));
        g.add(cyl);
        const ring0 = new THREE.Mesh(new THREE.TorusGeometry(16.4, 0.6, 6, 64).rotateX(Math.PI / 2), glowMat); ring0.position.y = 112; g.add(ring0);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(15.6, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.28, fog: false, depthWrite: false }));
        dome.position.y = 112; g.add(dome);
        const domeWire = new THREE.Mesh(dome.geometry, new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.5, fog: false }));
        domeWire.position.y = 112; g.add(domeWire);
        const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(27, 0.45, 6, 96), glowMat); orbit1.position.y = 118; g.add(orbit1);
        const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(22, 0.35, 6, 96), glowMat); orbit2.position.y = 118; g.add(orbit2);
        animated.push((tt) => { orbit1.rotation.set(Math.PI / 2 + 0.5, tt * 0.5, 0); orbit2.rotation.set(Math.PI / 2 - 0.7, -tt * 0.7, 0.4); });
        blinker(0, 129, 0, 0xb78bff, 1.6);
        top = 142; break;
      }
      case 'xp': {
        block(17, 160, 17, -9, 0, 0); glowBand(17, 17, 160).position.x = -9;
        block(17, 138, 17, 10, 0, 0); glowBand(17, 17, 138).position.x = 10;
        const bridge = new THREE.Mesh(boxGeo, glowMat); bridge.scale.set(4, 5, 9); bridge.position.set(0.5, 98, 0); g.add(bridge);
        const bridge2 = new THREE.Mesh(boxGeo, glowMat); bridge2.scale.set(4, 3, 7); bridge2.position.set(0.5, 60, 0); g.add(bridge2);
        blinker(-9, 162, 0); blinker(10, 140, 0);
        top = 164; break;
      }
      case 'academy': {
        block(34, 24, 28); glowBand(34, 28, 24, 0.8);
        for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(boxGeo, glowMat); c.scale.set(1, 20, 1); c.position.set(-15 + i * 5, 0, 15); g.add(c); }
        block(16, 82, 16, 0, 24); glowBand(16, 16, 106);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(12.5, 18, 4).rotateY(Math.PI / 4).translate(0, 9, 0),
          new THREE.MeshBasicMaterial({ color: accent, wireframe: true, fog: false }));
        roof.position.y = 106; g.add(roof);
        // live clock: shows the visitor's real local time
        const ck = canvasTex(256, 256, () => {});
        const drawClock = () => {
          const c = ck.canvas.getContext('2d'); const now = new Date(); const w = 256;
          c.clearRect(0, 0, w, w); c.fillStyle = '#fff8e6'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill();
          c.strokeStyle = t.color; c.lineWidth = 12; c.stroke();
          c.strokeStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.lineWidth = 6; c.beginPath(); c.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); c.lineTo(128 + Math.sin(a) * 108, 128 - Math.cos(a) * 108); c.stroke(); }
          const hA = ((now.getHours() % 12) + now.getMinutes() / 60) / 12 * Math.PI * 2, mA = now.getMinutes() / 60 * Math.PI * 2;
          c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(hA) * 56, 128 - Math.cos(hA) * 56); c.stroke();
          c.lineWidth = 7; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(mA) * 88, 128 - Math.cos(mA) * 88); c.stroke();
          ck.tex.needsUpdate = true;
        };
        drawClock(); setInterval(drawClock, 20000);
        const clock = new THREE.Mesh(new THREE.CircleGeometry(5.5, 32), new THREE.MeshBasicMaterial({ map: ck.tex, fog: false }));
        clock.position.set(0, 96, 8.06); g.add(clock);
        top = 124; break;
      }
      case 'arena': {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 20, 48, 1, true).translate(0, 10, 0), mat({ cyl: true, radius: 17 }));
        g.add(ring);
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(16.6, 13, 20, 48, 1, true).translate(0, 10, 0), new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.BackSide }));
        g.add(inner);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(17, 0.6, 6, 64).rotateX(Math.PI / 2), glowMat); rim.position.y = 20; g.add(rim);
        const field = canvasTex(256, 256, (c, w, h) => {
          for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#1d6b33' : '#22803c'; c.fillRect(0, i * 32, w, 32); }
          c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; c.strokeRect(20, 20, w - 40, h - 40);
          c.beginPath(); c.moveTo(20, h / 2); c.lineTo(w - 20, h / 2); c.stroke(); c.beginPath(); c.arc(w / 2, h / 2, 30, 0, 7); c.stroke();
        });
        const pitch = new THREE.Mesh(new THREE.CircleGeometry(13, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: field.tex }));
        pitch.position.y = 1.2; g.add(pitch);
        const coneGeo = new THREE.ConeGeometry(11, 62, 24, 1, true).rotateX(Math.PI).translate(0, 31, 0);
        const UP = new THREE.Vector3(0, 1, 0);
        for (const [px, pz] of [[-15, -15], [15, -15], [-15, 15], [15, 15]]) {
          const m = new THREE.Mesh(boxGeo, glowMat); m.scale.set(1.4, 64, 1.4); m.position.set(px, 0, pz); g.add(m);
          const lamp = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false })); lamp.scale.set(6, 3, 1.2);
          lamp.position.set(px, 64, pz); lamp.lookAt(x, 64, z); g.add(lamp);
          const beam = new THREE.Mesh(coneGeo, new THREE.ShaderMaterial({ vertexShader: S.beamVert, fragmentShader: S.beamFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
            uniforms: { uColor: { value: C(0xfff2c8) }, uOpacity: { value: 0.2 }, uDir: { value: 0 } } }));
          beam.position.set(px, 63, pz);
          beam.quaternion.setFromUnitVectors(UP, new THREE.Vector3(-px * 0.7, -62, -pz * 0.7).normalize()); g.add(beam);
        }
        top = 70; break;
      }
      case 'skills': {
        block(26, 132, 26); glowBand(26, 26, 132);
        const words = ['PYTHON', 'REACT', 'AWS', 'TERRAFORM', 'KUBERNETES', 'DOCKER', 'JENKINS', 'C# · .NET', 'JAVA', 'TYPESCRIPT', 'PYSPARK', 'XGBOOST', 'LEGALBERT', 'POSTGRESQL', 'SQL SERVER', 'GRAFANA'];
        const cols = ['#ff4fd8', '#4fe3ff', '#ffe14f', '#7dff8a'];
        const scr = canvasTex(512, 1024, (c, w, h) => {
          c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
          c.textAlign = 'center'; c.font = '800 56px "Inter Display", sans-serif';
          words.forEach((wd, i) => { c.fillStyle = cols[i % 4]; c.shadowColor = cols[i % 4]; c.shadowBlur = 18; c.fillText(wd, w / 2, 56 + i * 64); });
        });
        scr.tex.wrapT = THREE.RepeatWrapping; scr.tex.repeat.set(1, 0.5);
        for (const [px, pz, ry] of [[0, 13.05, 0], [13.05, 0, Math.PI / 2], [-13.05, 0, -Math.PI / 2], [0, -13.05, Math.PI]]) {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(22, 66), new THREE.MeshBasicMaterial({ map: scr.tex, fog: false }));
          p.position.set(px, 86, pz); p.rotation.y = ry; g.add(p);
        }
        animated.push((tt) => { scr.tex.offset.y = (tt * 0.035) % 1; });
        blinker(0, 134, 0, 0xff4fd8, 1.8);
        top = 136; break;
      }
      case 'beacon': {
        block(30, 36, 30); glowBand(30, 30, 36);
        const mastM = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 4.2, 150, 8).translate(0, 75, 0), tm); mastM.position.y = 36; g.add(mastM);
        const lattice = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.6, 5, 150, 4, 10).translate(0, 75, 0)), edgeMat);
        lattice.position.y = 36; g.add(lattice);
        const deck = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 2, 24), glowMat); deck.position.y = 160; g.add(deck);
        const head = new THREE.Group(); head.position.y = 188; g.add(head);
        const coneGeo = new THREE.ConeGeometry(42, 520, 32, 1, true).rotateX(Math.PI).translate(0, 260, 0);
        if (quality.searchlights) {
          for (const k of [0, 1]) {
            const b = new THREE.Mesh(coneGeo, new THREE.ShaderMaterial({ vertexShader: S.beamVert, fragmentShader: S.beamFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
              uniforms: { uColor: { value: C(0xbfd8ff) }, uOpacity: { value: 0.09 }, uDir: { value: 0 } } }));
            b.rotation.z = k ? 0.42 : -0.42; const pivot = new THREE.Group(); pivot.add(b); head.add(pivot);
            animated.push((tt) => { pivot.rotation.y = tt * 0.25 + k * Math.PI; });
          }
        }
        const lamp = blinker(0, 190, 0, 0xff3b3b, 3);
        lamp.scale.setScalar(1);
        top = 194; break;
      }
    }

    // waypoint label + hover/active beam
    const lab = label(t); lab.position.set(0, top + 14, 0); g.add(lab);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 520, 32, 1, true).translate(0, 260, 0),
      new THREE.ShaderMaterial({ vertexShader: S.beamVert, fragmentShader: S.beamFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: accent }, uOpacity: { value: 0 }, uDir: { value: 1 } } }));
    beam.renderOrder = 5; g.add(beam);
    // invisible hit volume for picking
    const hit = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ visible: false }));
    hit.scale.set(t.kind === 'arena' ? 40 : 36, top + 24, t.kind === 'arena' ? 40 : 36); g.add(hit);
    hit.userData = { kind: 'tower', id: t.id };

    let beamTarget = 0;
    out.push({
      ...t, group: g, hit, sprite: lab, top, center: new THREE.Vector3(x, 0, z),
      setState(s) { beamTarget = s === 'active' ? 0.55 : s === 'hover' ? 0.3 : 0; edgeMat.opacity = s ? 1 : 0.85; },
      update(tt, dt, cam) {
        const ds = THREE.MathUtils.clamp(cam.position.distanceTo(_lp.set(x, top + 14, z)) / 300, 0.75, 2.1);
        lab.scale.set(57.6 * ds, 15 * ds, 1);
        for (const a of animated) a(tt);
        beam.material.uniforms.uOpacity.value += (beamTarget - beam.material.uniforms.uOpacity.value) * Math.min(1, dt * 6);
        beam.visible = beam.material.uniforms.uOpacity.value > 0.003;
        lab.material.opacity = 0.85 + 0.15 * Math.sin(tt * 2 + x);
      },
    });
  }
  return out;
}
