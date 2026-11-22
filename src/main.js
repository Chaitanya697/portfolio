import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { towers, profile, AVATAR } from './data.js';
import { createCity } from './city.js';
import { buildLandmarks } from './landmarks.js';
import { Director, OVERVIEW } from './camera.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Achievements, createShards, keySequences, Terminal, consoleEgg } from './secrets.js';
import { store, clamp, isTypingTarget } from './util.js';

THREE.ColorManagement.enabled = false;

const sleep = (ms, token) => new Promise((r) => { const id = setTimeout(r, ms); if (token) token.cancel = () => { clearTimeout(id); r(); }; });
const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasWebGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();

const audio = new Audio();
let ui, ach;
const api = {};
const state = { active: null, tour: null, visited: new Set(), firstVisit: 0, legend: store.get('legend', false), started: false, three: null };

const handlers = {
  explore: () => { audio.click(); api.startExplore?.(); },
  tour: () => { audio.click(); api.runTour?.(); },
  classic: (on) => setClassic(on),
  go: (id) => api.go?.(id),
  closePanel: () => api.closePanel?.(),
  next: (d) => { const i = Math.max(0, towers.findIndex((t) => t.id === state.active)); api.go?.(towers[(i + d + towers.length) % towers.length].id); },
  home: () => { api.stopTour?.(); api.closePanel?.(true); },
  sound: () => { const on = audio.enable(!audio.on); ui.setSound(on); store.set('sound', on); if (on) audio.chime(1); },
  track: (k) => { if (k === 'email') ach?.unlock('hire'); },
};

ui = new UI(handlers);
ach = new Achievements(ui, audio);
consoleEgg();
window.hire = () => { ach.unlock('hire'); location.href = `mailto:${profile.links.email}?subject=${encodeURIComponent("Let's work together")}`; return '✉ opening your mail client…'; };

if (!hasWebGL) {
  ui.hideLoader(); setClassic(true, false);
} else {
  boot().catch((e) => { console.error(e); ui.hideLoader(); setClassic(true, false); ui.toast('3D view unavailable', 'Showing the classic view instead'); });
}

function setClassic(on, webgl = hasWebGL) {
  ui.showClassic(on, webgl && !!state.three);
  if (!state.three) return;
  state.three.renderer.setAnimationLoop(on ? null : state.three.loop);
  if (on) { api.closePanel?.(false); api.stopTour?.(); ui.showIntro(false); }
  else if (!state.started) ui.showIntro(true);
}

async function boot() {
  const cores = navigator.hardwareConcurrency || 4;
  const tierName = mobile ? 'low' : cores <= 4 ? 'medium' : 'high';
  const TIERS = {
    high: { suburbs: 560, cityRadius: 456, carsPerLane: 3, rain: 2600, searchlights: true, pr: Math.min(devicePixelRatio, 1.75) },
    medium: { suburbs: 440, cityRadius: 384, carsPerLane: 2, rain: 1500, searchlights: true, pr: Math.min(devicePixelRatio, 1.3) },
    low: { suburbs: 200, cityRadius: 300, carsPerLane: 1, rain: 700, searchlights: false, pr: Math.min(devicePixelRatio, 1.2) },
  };
  const quality = TIERS[tierName];
  ui.loading(0.08, 'Loading fonts…');
  await Promise.race([Promise.all([document.fonts.load('800 40px "Inter Display"'), document.fonts.load('600 30px "Inter"')]).catch(() => {}), sleep(2500)]);

  ui.loading(0.25, 'Raising the skyline…');
  await sleep(16);
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 1.5, powerPreference: 'high-performance', stencil: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(quality.pr); renderer.setSize(innerWidth, innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mobile ? 62 : 52, innerWidth / innerHeight, 1, 4200);
  camera.position.set(0, 1100, 760); camera.lookAt(0, 0, 0);

  const city = createCity(scene, quality, towers);
  ui.loading(0.5, 'Wiring the traffic grid…'); await sleep(16);
  const marks = buildLandmarks(scene, towers, city.U, quality, AVATAR);
  const byId = Object.fromEntries(marks.map((m) => [m.id, m]));
  const shards = createShards(scene, city.lots, city.U);
  const taken = new Set(store.get('shards', []));
  shards.list.forEach((s) => { if (taken.has(s.id)) { s.taken = true; s.grp.visible = false; } });
  ui.setShards(taken.size, shards.list.length);
  if (taken.has('s5')) shards.list[5].hidden = false;

  ui.loading(0.72, 'Calibrating the grapple line…'); await sleep(16);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, minDistance: 40, maxDistance: 780, maxPolarAngle: 1.43, minPolarAngle: 0.12, rotateSpeed: 0.55, zoomSpeed: 0.8, panSpeed: 0.7, autoRotateSpeed: 0.35 });
  controls.target.set(0, 0, 0); controls.enabled = false;
  const director = new Director(camera, controls, scene, {
    onStart: (swing) => { if (swing) audio.whoosh(); },
  });
  director.obstacles = marks.map((m) => ({ id: m.id, x: m.pos[0], z: m.pos[1], r: m.kind === 'lab' ? 32 : m.kind === 'arena' ? 26 : 24, h: m.top }));
  director.lots = city.lots.filter((b) => !b.sub);
  renderer.compile(scene, camera);
  ui.loading(1, 'Entering the city…');

  // ---------- picking
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(); let pickPending = false, hover = null, lastMove = performance.now();
  const towerHits = marks.map((m) => m.hit);
  const pick = () => {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...shards.hits(), city.moon, ...towerHits], false);
    return hits[0]?.object;
  };
  const setHover = (id) => {
    if (hover === id) return; hover = id;
    marks.forEach((m) => m.setState(m.id === state.active ? 'active' : m.id === id ? 'hover' : null));
    canvas.style.cursor = id ? 'pointer' : '';
  };
  let down = null;
  canvas.addEventListener('pointermove', (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pickPending = e.pointerType === 'mouse'; state.mx = e.clientX; state.my = e.clientY;
    lastMove = performance.now(); controls.autoRotate = false;
  });
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; controls.autoRotate = false; lastMove = performance.now(); hideHint(); });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || performance.now() - down.t > 600) { down = null; return; }
    down = null; ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const o = pick(); if (!o) return;
    if (o.userData.kind === 'tower') go(o.userData.id);
    else if (o.userData.kind === 'shard') collect(o.userData.id);
    else if (o.userData.kind === 'moon') moonClick();
  });
  canvas.addEventListener('pointerleave', () => { setHover(null); ui.showTooltip(null); });
  canvas.addEventListener('wheel', () => { controls.autoRotate = false; lastMove = performance.now(); hideHint(); }, { passive: true });

  // ---------- shards & secrets
  let moonClicks = 0;
  function moonClick() {
    moonClicks++; audio.click();
    if (moonClicks === 3) {
      ach.unlock('stargazer');
      const s = shards.list[5];
      if (!s.taken) { s.grp.visible = true; s.hidden = false; ui.toast('Something fell from the moon…', 'A data shard is drifting above the city', 'shard'); }
    }
  }
  function collect(id) {
    const s = shards.list.find((x) => x.id === id); if (!s || s.taken) return;
    s.taken = true; s.dying = 0.001; taken.add(id); store.set('shards', [...taken]);
    audio.chime(1); ui.setShards(taken.size, shards.list.length);
    ui.toast(`Data shard recovered · ${taken.size} / ${shards.list.length}`, taken.size < shards.list.length ? 'Keep looking. They glow on rooftops.' : '', 'shard');
    ach.unlock('shard');
    if (taken.size === shards.list.length) {
      state.legend = true; store.set('legend', true); ach.unlock('legend');
      city.setNeon(true); city.launchFireworks(byId.hq.center, byId.hq.top);
      setTimeout(() => city.launchFireworks(byId.hq.center, byId.hq.top), 2600);
      ui.toast('Neon Night unlocked', 'The city lights up for you. Type `neon off` in the terminal to switch back.', 'ach');
    }
  }

  const term = new Terminal({
    go: (id) => go(id), tour: () => runTour(), palette: (p) => city.setPalette(p), storm: (on) => setStorm(on),
    neon: (on) => city.setNeon(on), legend: () => state.legend, achievements: () => ach.list(),
    hire: () => window.hire(), freeSwing: () => freeSwing(), onOpen: () => ach.unlock('root'),
  });
  function setStorm(on) { city.setStorm(on); if (on) { ach.unlock('storm'); ui.toast('⛈ Storm mode', 'Enter the code again, or type `weather clear` in the terminal'); } }
  keySequences({ konami: () => setStorm(!city.storm), swing: () => freeSwing() });

  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;
    if (e.key === 'Escape') {
      if (term.open) term.toggle(false); else if (!document.getElementById('help').hidden) document.getElementById('help').hidden = true;
      else if (state.tour) stopTour(); else if (ui.panelOpen) closePanel(true);
      return;
    }
    if (document.body.classList.contains('classic-on')) return;
    if (e.key === '/' || e.key === '`' || e.key === '~') { e.preventDefault(); term.toggle(); return; }
    if (e.key === '?') { const h = document.getElementById('help'); h.hidden = !h.hidden; return; }
    const n = parseInt(e.key, 10); if (n >= 1 && n <= towers.length && !e.metaKey && !e.ctrlKey) go(towers[n - 1].id);
    if (ui.panelOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.shiftKey) handlers.next(e.key === 'ArrowRight' ? 1 : -1);
  });

  // ---------- navigation
  async function go(id, fromTour = false) {
    const t = byId[id]; if (!t) return;
    if (!fromTour) stopTour();
    if (!state.started) { state.started = true; ui.showIntro(false); }
    hideHint(); director.cancel();
    state.active = id; ui.closePanel(); setHover(null); marks.forEach((m) => m.setState(m.id === id ? 'active' : null));
    const v = director.focusFor(t, mobile, !fromTour);
    const ok = await director.travelTo(v.pos, v.look);
    if (!ok || state.active !== id) return;
    ach.unlock('first_swing');
    if (fromTour) return;
    ui.openPanel(t); audio.click();
    if (!state.visited.size) state.firstVisit = performance.now();
    state.visited.add(id);
    if (state.visited.size === towers.length) { ach.unlock('explorer'); if (performance.now() - state.firstVisit < 120000) ach.unlock('speedrun'); }
  }
  async function closePanel(fly = true) {
    ui.closePanel(); state.active = null; marks.forEach((m) => m.setState(null));
    if (fly && state.started) { director.cancel(); await director.travelTo(OVERVIEW.pos, OVERVIEW.look); }
  }
  function stopTour() { if (state.tour) { state.tour.stop = true; state.tour.sleep?.cancel?.(); state.tour = null; ui.caption(null); director.cancel(); } }
  async function runTour() {
    stopTour(); if (!state.started) { state.started = true; ui.showIntro(false); }
    closePanel(false); const tour = (state.tour = { stop: false, sleep: {} });
    for (let i = 0; i < towers.length; i++) {
      if (tour.stop) return;
      state.active = towers[i].id; marks.forEach((m) => m.setState(m.id === towers[i].id ? 'active' : null));
      await go(towers[i].id, true); if (tour.stop) return;
      ui.caption(byId[towers[i].id], i, towers.length);
      await sleep(3800, tour.sleep); if (tour.stop) return;
    }
    ui.caption(null); state.tour = null; state.active = null; marks.forEach((m) => m.setState(null));
    ach.unlock('tourist'); await director.travelTo(OVERVIEW.pos, OVERVIEW.look);
    ui.toast('Tour complete', 'Click any tower to dive into the details');
  }
  async function freeSwing() {
    if (!state.started) { state.started = true; ui.showIntro(false); }
    stopTour(); closePanel(false);
    const pts = [[-220, 90, 160], [-260, 120, -120], [-40, 70, -280], [230, 110, -180], [250, 80, 140], [60, 140, 330]].map((p) => new THREE.Vector3(...p));
    for (let i = 0; i < pts.length; i++) {
      const look = pts[(i + 1) % pts.length].clone(); look.y -= 30;
      const ok = await director.travelTo(pts[i], look, { dur: 1.7 }); if (!ok) return;
    }
    ach.unlock('showoff'); await director.travelTo(OVERVIEW.pos, OVERVIEW.look);
  }
  async function startExplore() {
    state.started = true; ui.showIntro(false);
    await director.travelTo(OVERVIEW.pos, OVERVIEW.look);
    showHint();
  }

  // ---------- hint
  const hint = document.getElementById('hint');
  function showHint() { if (!store.get('hinted', false)) hint.hidden = false; }
  function hideHint() { if (!hint.hidden) { hint.hidden = true; store.set('hinted', true); } }

  // ---------- adaptive quality
  let frames = 0, acc = 0, pr = quality.pr, warned = false;
  function adapt(dt) {
    if (!state.started || director.busy) return;
    frames++; acc += dt;
    if (acc < 2.5) return;
    const fps = frames / acc; frames = 0; acc = 0;
    if (fps < (mobile || ui.panelOpen ? 24 : 42) && pr > 0.7) { pr = Math.max(0.7, pr * 0.8); renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); city.setPR(pr); }
    else if (fps < 24 && !warned) { warned = true; ui.toast('Running slowly on this device', 'Try the Recruiter view (top right) for a lighter page'); }
  }

  // ---------- loop
  let last = performance.now(), t = 0, mmTick = 0;
  const loop = () => {
    const now = performance.now();
    // 30 fps cap on phones, and on every device while a panel is being read: smooth, cool and battery-friendly
    const cap = mobile || (ui.panelOpen && !director.busy) ? 1000 / 30 - 2 : 0;
    if (cap && now - last < cap) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
    director.update(dt);
    // keep the orbit target inside the city
    const tg = controls.target; const r = Math.hypot(tg.x, tg.z); if (r > 330) { tg.x *= 330 / r; tg.z *= 330 / r; } tg.y = clamp(tg.y, 0, 220);
    if (!director.busy && state.started && !ui.panelOpen && !state.tour && performance.now() - lastMove > 25000) controls.autoRotate = true;
    city.update(t, dt, camera); marks.forEach((m) => m.update(t, dt, camera)); shards.update(t, dt);
    if (pickPending && !director.busy) {
      pickPending = false; const o = pick();
      const id = o?.userData.kind === 'tower' ? o.userData.id : null;
      setHover(id); canvas.style.cursor = o ? 'pointer' : '';
      ui.showTooltip(id && id !== state.active ? byId[id] : null, state.mx, state.my);
    }
    if (++mmTick % 6 === 0) ui.updateMinimap(camera, controls.target);
    adapt(dt);
    renderer.render(scene, camera);
  };
  state.three = { renderer, loop };
  Object.assign(api, { go, closePanel, stopTour, runTour, startExplore, freeSwing });
  renderer.setAnimationLoop(loop);
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  if (store.get('sound', false)) { /* audio needs a user gesture; restore label only */ ui.setSound(false); }
  const h = new Date().getHours(); if (h >= 0 && h < 5) setTimeout(() => ach.unlock('owl'), 6000);

  // debug/test hook (only with ?debug)
  if (new URLSearchParams(location.search).has('debug')) window.__city = { go, runTour, freeSwing, collect, moonClick, setStorm, city, director, shards, marks, camera, controls, renderer, closePanel, term, state };

  ui.hideLoader();
  if (reducedMotion) { setClassic(true); return; }
  // intro: dive from the clouds to the HQ rooftop
  await director.travelTo(new THREE.Vector3(70, 236, 96), new THREE.Vector3(-40, 150, -220), { swing: false, dur: 3.6 });
  if (!state.started) ui.showIntro(true);
}
