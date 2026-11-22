import * as THREE from 'three';
import { esc, store, rng, isTypingTarget } from './util.js';
import { profile, towers, projects, skills } from './data.js';

export const ACHIEVEMENTS = {
  first_swing: ['First Swing', 'Took your first swing across the city'],
  explorer: ['City Explorer', 'Visited all nine landmarks'],
  speedrun: ['Speedrunner', 'All nine landmarks in under two minutes'],
  tourist: ['Tourist', 'Completed the guided tour'],
  shard: ['Shiny!', 'Found your first data shard'],
  legend: ['City Legend', 'Recovered every data shard'],
  stargazer: ['Stargazer', 'Most people never look up'],
  storm: ['Storm Chaser', 'Summoned the storm'],
  root: ['Root Access', 'Opened the terminal'],
  owl: ['Night Owl', 'Exploring the city after midnight'],
  showoff: ['Show-off', 'Pulled off a free-swing run'],
  hire: ['Good Taste', 'Reached out to hire Chaitanya'],
};

export class Achievements {
  constructor(ui, audio) { this.ui = ui; this.audio = audio; this.got = new Set(store.get('ach', [])); }
  unlock(id) {
    if (this.got.has(id) || !ACHIEVEMENTS[id]) return;
    this.got.add(id); store.set('ach', [...this.got]);
    this.ui.toast(`Achievement unlocked: ${ACHIEVEMENTS[id][0]}`, ACHIEVEMENTS[id][1], 'ach'); this.audio.chime(2);
  }
  list() { return Object.entries(ACHIEVEMENTS).map(([id, [n, d]]) => `${this.got.has(id) ? '[x]' : '[ ]'} ${n.padEnd(15)} ${this.got.has(id) ? d : '???'}`); }
}

// ---------------------------------------------------------------- data shards
export function createShards(scene, lots, U) {
  const r = rng(2027);
  const cands = lots.filter((b) => b.h > 55 && Math.hypot(b.x, b.z) > 90);
  const picks = [];
  const zones = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1]];
  for (const [sx, sz] of zones) {
    const zone = cands.filter((b) => Math.sign(b.x) === sx || sx === 0).filter((b) => Math.sign(b.z) === sz);
    if (zone.length) picks.push(zone[Math.floor(r() * zone.length)]);
  }
  const geo = new THREE.OctahedronGeometry(2.6, 0);
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(120,255,240,1)'); gr.addColorStop(1, 'rgba(120,255,240,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const make = (pos, id) => {
    const grp = new THREE.Group(); grp.position.copy(pos);
    const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x7affea, fog: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    halo.scale.setScalar(18); grp.add(core, halo);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(9, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData = { kind: 'shard', id }; grp.add(hit);
    scene.add(grp);
    return { id, grp, core, halo, hit, taken: false, dying: 0 };
  };
  const shards = picks.map((b, i) => make(new THREE.Vector3(b.x, b.h + 6, b.z), `s${i}`));
  // the sixth one is out of this world: it only appears after the moon is clicked
  const moonShard = make(new THREE.Vector3(-300, 260, -480), 's5'); moonShard.grp.visible = false; moonShard.hidden = true;
  shards.push(moonShard);
  return {
    list: shards,
    hits: () => shards.filter((s) => !s.taken && s.grp.visible).map((s) => s.hit),
    update(t, dt) {
      for (const s of shards) {
        if (!s.grp.visible) continue;
        s.core.rotation.y = t * 1.6; s.core.rotation.x = Math.sin(t) * 0.4;
        s.grp.position.y += Math.sin(t * 2 + s.grp.position.x) * 0.01;
        s.halo.material.opacity = 0.55 + 0.45 * Math.sin(t * 3 + s.grp.position.z);
        if (s.dying) { s.dying += dt; const k = 1 + s.dying * 6; s.grp.scale.setScalar(k); s.core.material.opacity = s.halo.material.opacity = Math.max(0, 1 - s.dying * 2.5);
          s.core.material.transparent = true; if (s.dying > 0.45) s.grp.visible = false; }
      }
    },
  };
}

// ---------------------------------------------------------------- key sequences
export function keySequences(map) {
  const buf = [];
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;
    buf.push(e.key.toLowerCase()); if (buf.length > 12) buf.shift();
    if (KONAMI.every((k, i) => buf[buf.length - KONAMI.length + i] === k)) { buf.length = 0; map.konami?.(); return; }
    const word = buf.join('');
    for (const w of Object.keys(map)) if (w !== 'konami' && word.endsWith(w)) { buf.length = 0; map[w](); }
  });
}

// ---------------------------------------------------------------- terminal
export class Terminal {
  constructor(api) {
    this.api = api; this.el = document.getElementById('terminal'); this.out = this.el.querySelector('.out'); this.inp = this.el.querySelector('input');
    this.hist = []; this.hi = 0;
    this.inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const v = this.inp.value.trim(); this.inp.value = ''; if (v) { this.hist.push(v); this.hi = this.hist.length; } this.run(v); }
      else if (e.key === 'ArrowUp') { this.hi = Math.max(0, this.hi - 1); this.inp.value = this.hist[this.hi] || ''; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { this.hi = Math.min(this.hist.length, this.hi + 1); this.inp.value = this.hist[this.hi] || ''; e.preventDefault(); }
      else if (e.key === 'Escape') { this.toggle(false); }
      else if (e.key === 'Tab') { e.preventDefault(); this.complete(); }
      e.stopPropagation();
    });
    this.el.querySelector('.close').onclick = () => this.toggle(false);
    this.el.addEventListener('click', () => this.inp.focus());
  }
  get open() { return !this.el.hidden; }
  toggle(on = !this.open) {
    this.el.hidden = !on;
    if (on) {
      if (!this.booted) { this.booted = true; this.print(`CPD-OS v2.7 · city mainframe\nWelcome, visitor. Type <b>help</b> for commands.`, true); }
      setTimeout(() => this.inp.focus(), 30); this.api.onOpen?.();
    } else this.inp.blur();
  }
  print(s, html = false) { const p = document.createElement('pre'); if (html) p.innerHTML = s; else p.textContent = s; this.out.appendChild(p); this.out.scrollTop = this.out.scrollHeight; }
  complete() {
    const cmds = Object.keys(this.cmds());
    const m = cmds.filter((c) => c.startsWith(this.inp.value)); if (m.length === 1) this.inp.value = m[0] + ' ';
    else if (m.length) this.print(m.join('  '));
  }
  cmds() {
    const a = this.api; const ids = towers.map((t) => t.id);
    return {
      help: () => [
        'about            who is Chaitanya', 'ls               list the landmarks', 'open <id>        swing to a landmark (also: cd)',
        'projects         list projects', 'skills           print the skill tree', 'resume [sde|cloud|aiml]   open a résumé',
        'contact          how to reach me', 'tour             guided tour', 'time <night|dusk|dawn|golden>', 'weather <rain|clear>',
        'achievements     your progress', 'shards           a hint', 'clear · exit', '', '…and a few commands that are not listed.'].join('\n'),
      about: () => `${profile.name}\n${profile.roles.join(' · ')}\n\n${profile.summary}`,
      whoami: () => 'visitor@city  (but you probably meant: about)',
      ls: () => towers.map((t) => `${t.id.padEnd(9)} ${t.name.padEnd(20)} ${t.label}`).join('\n'),
      open: (id) => (ids.includes(id) ? (a.go(id), `swinging to ${id}…`) : `no such landmark: ${id || '(none)'}. try: ls`),
      cd: (id) => this.cmds().open(id),
      projects: () => projects.map((p) => `• ${p.name.padEnd(24)} ${p.tag}`).join('\n'),
      skills: () => skills.map(([g, l]) => `${g}\n  └─ ${l.join(', ')}`).join('\n'),
      resume: (k = 'sde') => { const r = { sde: 0, cloud: 1, aiml: 2 }[k]; if (r == null) return 'usage: resume [sde|cloud|aiml]'; window.open(profile.resumes[r].file, '_blank', 'noopener'); return `opening ${profile.resumes[r].label}…`; },
      contact: () => `email     ${profile.links.email}\nlinkedin  ${profile.links.linkedin}\ngithub    ${profile.links.github}`,
      tour: () => { this.toggle(false); a.tour(); return 'starting tour…'; },
      time: (p) => (a.palette(p) ? `sky set to ${p}` : 'usage: time <night|dusk|dawn|golden>'),
      weather: (w) => (w === 'rain' || w === 'storm' ? (a.storm(true), 'storm incoming ⛈') : w === 'clear' ? (a.storm(false), 'skies clearing') : 'usage: weather <rain|clear>'),
      neon: (v) => (v === 'off' ? (a.neon(false), 'neon off') : a.legend() ? (a.neon(true), 'neon on') : 'locked. recover every data shard first.'),
      achievements: () => a.achievements().join('\n'),
      shards: () => 'Six data shards glow on the rooftops. Five are in the city.\nThe sixth? Look up.',
      sudo: (...args) => { if (args.join(' ').startsWith('rm')) return 'Nice try. This city has backups.'; if (args.join(' ').includes('hire')) { a.hire(); return 'permission granted. opening your mail client…'; } return 'usage: sudo hire chaitanya'; },
      hire: () => this.cmds().sudo('hire'),
      matrix: () => { this.el.classList.add('matrix'); setTimeout(() => this.el.classList.remove('matrix'), 4000); return 'wake up, visitor…'; },
      swing: () => { this.toggle(false); a.freeSwing(); return 'hold on tight'; },
      date: () => new Date().toString(), echo: (...s) => s.join(' '),
      github: () => { window.open(profile.links.github, '_blank', 'noopener'); return 'opening GitHub…'; },
      linkedin: () => { window.open(profile.links.linkedin, '_blank', 'noopener'); return 'opening LinkedIn…'; },
      clear: () => { this.out.innerHTML = ''; return ''; }, exit: () => { this.toggle(false); return ''; },
    };
  }
  run(line) {
    this.print(`<span class="ps">visitor@city:~$</span> ${esc(line)}`, true);
    if (!line) return;
    const [cmd, ...args] = line.toLowerCase().split(/\s+/);
    const fn = this.cmds()[cmd];
    const res = fn ? fn(...args) : `command not found: ${cmd}. type help`;
    if (res) this.print(res);
  }
}

export function consoleEgg() {
  const art = [
    '   ▄▄▄▄  ▄▄▄▄▄  ▄▄▄▄ ',
    '  █      █   █  █   █',
    '  █      █▀▀▀   █   █',
    '   ▀▀▀▀  ▀      ▀▀▀▀ ',
  ].join('\n');
  console.log(`%c${art}`, 'color:#3fb950;font-family:monospace;font-weight:700');
  console.log('%cLooking under the hood? Respect.\n%cThis city is hand-built with Three.js and custom GLSL. No frameworks.\nType %chire()%c here, or press %c/%c on the page.',
    'color:#e6edf3;font-size:14px;font-weight:700', 'color:#9198a1', 'color:#7cc4ff;font-weight:700', 'color:#9198a1', 'color:#7cc4ff;font-weight:700', 'color:#9198a1');
}
