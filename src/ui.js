import { esc } from './util.js';
import { profile, projects, research, experience, education, certifications, extracurricular, current, skills, services, towers, AVATAR } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const ext = (href, text, cls = '') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;
const chips = (arr) => `<ul class="chips">${arr.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
const metrics = (m) => (m ? `<div class="metrics">${m.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>` : '');
const bullets = (p) => `<ul class="bul">${p.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
const avatar = (cls) => `<img class="${cls}" src="${AVATAR}" alt="Chaitanya P Desai" width="160" height="160" referrerpolicy="no-referrer" onerror="this.classList.add('noimg')">`;
const resumeBtns = () => `<div class="btnrow">${profile.resumes.map((r) => `<a class="btn ghost" href="${r.file}" target="_blank" rel="noopener" data-track="resume">⤓ ${esc(r.label)}</a>`).join('')}</div>`;
const mail = `mailto:${profile.links.email}?subject=${encodeURIComponent('Hello Chaitanya')}`;

function projectCard(p, open = false) {
  return `<article class="card proj">
    <header><h4>${esc(p.name)}</h4>${p.when ? `<span class="when">${esc(p.when)}</span>` : ''}</header>
    <p class="tag">${esc(p.tag)}${p.team ? ` · ${esc(p.team)}` : ''}</p>
    <p>${esc(p.summary)}</p>${metrics(p.metrics)}
    <details ${open ? 'open' : ''}><summary>Engineering details</summary>${bullets(p.points)}</details>
    ${chips(p.stack)}
    <p class="more">${ext(p.url, 'View code ↗')}</p></article>`;
}

export const sections = {
  hq: () => `
    <div class="about-head">${avatar('ph')}<div><h3>${esc(profile.name)}</h3><p class="roles">${profile.roles.map(esc).join(' · ')}</p><p class="loc">${esc(profile.location)}</p></div></div>
    <p class="lead">${esc(profile.summary)}</p>
    <div class="badges">${profile.badges.map((b) => `<div><b>${esc(b.k)}</b><span>${esc(b.v)}</span></div>`).join('')}</div>
    <p class="status"><i></i>${esc(profile.lookingFor)}</p>
    <div class="btnrow">${ext(profile.links.github, 'GitHub ↗', 'btn')}${ext(profile.links.linkedin, 'LinkedIn ↗', 'btn')}<a class="btn" href="${mail}" data-track="email">Email ✉</a></div>
    <h5>Résumés</h5>${resumeBtns()}`,
  repo: () => `
    <p class="lead">Everything I build is public on GitHub. Featured work first; every card links to the code.</p>
    <div class="btnrow">${ext(profile.links.github, 'Open my GitHub profile ↗', 'btn')}</div>
    ${projects.map((p, i) => projectCard(p, i === 0)).join('')}`,
  build: () => {
    const f = projects.find((p) => p.name === current.active);
    return `<p class="lead">What's on the workbench right now.</p>
      <div class="live"><i></i>ACTIVE BUILD</div>${projectCard(f, true)}
      <h5>Up next</h5>${current.next.map((n) => `<article class="card"><header><h4>${esc(n.name)}</h4><span class="pill">${esc(n.status)}</span></header><p>${esc(n.text)}</p></article>`).join('')}`;
  },
  lab: () => `
    <article class="card pub"><span class="pill">${esc(research.publication.role)}</span><h4>${esc(research.publication.title)}</h4><p class="tag">${esc(research.publication.venue)}</p></article>
    ${research.items.map((r) => `<article class="card"><header><h4>${esc(r.name)}</h4><span class="when">${esc(r.when)}</span></header>${bullets(r.points)}${chips(r.stack)}</article>`).join('')}`,
  xp: () => experience.map((e) => `<article class="card"><header><h4>${esc(e.role)}</h4><span class="when">${esc(e.when)}</span></header><p class="tag">${esc(e.org)}</p>${bullets(e.points)}${chips(e.stack)}</article>`).join(''),
  academy: () => `
    <ol class="floors">${education.map((e, i) => `<li><span class="fl">FLOOR ${education.length - i}</span><div><h4>${esc(e.level)}</h4><p>${esc(e.school)}</p><p class="tag">${esc(e.when)} · <b>${esc(e.score)}</b></p>${e.note ? `<p class="note">${esc(e.note)}</p>` : ''}</div></li>`).join('')}</ol>
    <h5>Certifications</h5>${bullets(certifications)}`,
  arena: () => `
    <h5>Leadership</h5>${extracurricular.leadership.map((l) => `<article class="card"><header><h4>${esc(l.role)}</h4><span class="when">${esc(l.when)}</span></header><p class="tag">${esc(l.org)}</p><p>${esc(l.text)}</p></article>`).join('')}
    <h5>Competitions & hackathons</h5><ul class="trophies">${extracurricular.competitions.map((c) => `<li><b>${esc(c.name)}</b><span>${esc(c.result)}${c.when ? ` · ${esc(c.when)}` : ''}</span></li>`).join('')}</ul>
    <h5>On the field</h5>${chips(extracurricular.sports)}`,
  skills: () => skills.map(([g, list]) => `<div class="skillgrp"><h5>${esc(g)}</h5>${chips(list)}</div>`).join(''),
  beacon: () => `
    <p class="lead">Hiring, collaborating, or have a small project? The beacon is always on.</p>
    <div class="btnrow"><a class="btn primary" href="${mail}" data-track="email">✉ ${esc(profile.links.email)}</a><button class="btn ghost" data-copy="${esc(profile.links.email)}">Copy email</button></div>
    <div class="btnrow">${ext(profile.links.linkedin, 'LinkedIn ↗', 'btn')}${ext(profile.links.github, 'GitHub ↗', 'btn')}</div>
    <h5>Résumés</h5>${resumeBtns()}
    <h5>Freelance services</h5><table class="svc">${services.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>
    <p class="note">Clear scope → fixed price → working code with documentation.</p>`,
};

export class UI {
  constructor(handlers) {
    this.h = handlers;
    this.panel = $('#panel'); this.panelBody = $('#panel .body'); this.tooltip = $('#tooltip');
    this.buildNav(); this.buildMinimap(); this.buildIntro(); this.buildClassic(); this.bindGlobal();
  }

  buildIntro() {
    $('#intro .card-inner').innerHTML = `
      <div class="who">${avatar('ph big')}<div><p class="kicker">// PLAYER PROFILE</p><h1>${esc(profile.name)}</h1><p class="roles">${profile.roles.map(esc).join('  ·  ')}</p></div></div>
      <p class="lead">${esc(profile.summary)}</p>
      <div class="badges">${profile.badges.map((b) => `<div><b>${esc(b.k)}</b><span>${esc(b.v)}</span></div>`).join('')}</div>
      <div class="btnrow cta"><button class="btn primary" id="btnExplore">Explore the city →</button><button class="btn" id="btnTour">▶ Take the tour</button><button class="btn ghost" id="btnClassic">Recruiter view</button></div>
      <p class="tiny"><span class="mouse">Drag to look around · scroll to zoom · click any tower</span><span class="touch">Drag to look · pinch to zoom · tap any tower</span></p>`;
    $('#btnExplore').onclick = () => this.h.explore();
    $('#btnTour').onclick = () => this.h.tour();
    $('#btnClassic').onclick = () => this.h.classic(true);
  }

  showIntro(on) { $('#intro').hidden = !on; document.body.classList.toggle('intro-on', on); if (on) setTimeout(() => $('#btnExplore')?.focus({ preventScroll: true }), 50); }

  buildNav() {
    $('#districts').innerHTML = towers.map((t, i) => `<button data-go="${t.id}" style="--accent:${t.color}" title="${esc(t.name)} (${i + 1})"><i></i><span>${esc(t.label)}</span></button>`).join('');
    $('#districts').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) this.h.go(b.dataset.go); });
  }

  buildMinimap() {
    const S = 0.27, off = 80;
    const roads = []; for (let c = -432 + 24; c < 460; c += 48) roads.push(`<line x1="${c * S + off}" y1="0" x2="${c * S + off}" y2="160"/><line y1="${c * S + off}" x1="0" y2="${c * S + off}" x2="160"/>`);
    $('#minimap').innerHTML = `<svg viewBox="0 0 160 160" aria-label="City map"><g class="roads">${roads.join('')}</g>
      ${towers.map((t) => `<g class="mm-t" data-go="${t.id}" transform="translate(${t.pos[0] * S + off},${t.pos[1] * S + off})"><title>${esc(t.name)}</title><circle r="9" class="hit"/><rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="${t.color}"/></g>`).join('')}
      <g id="mm-cam"><path d="M0,-7 L5,5 L0,2 L-5,5 Z"/></g></svg><span>CITY MAP</span>`;
    $('#minimap').addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) this.h.go(g.dataset.go); });
    this.mmCam = $('#mm-cam'); this.mmS = S; this.mmOff = off;
  }

  updateMinimap(cam, target) {
    const x = cam.position.x * this.mmS + this.mmOff, y = cam.position.z * this.mmS + this.mmOff;
    const ang = Math.atan2(target.x - cam.position.x, -(target.z - cam.position.z)) * 180 / Math.PI;
    this.mmCam.setAttribute('transform', `translate(${Math.max(4, Math.min(156, x)).toFixed(1)},${Math.max(4, Math.min(156, y)).toFixed(1)}) rotate(${ang.toFixed(0)})`);
  }

  openPanel(t) {
    this.panel.style.setProperty('--accent', t.color);
    $('#panel .kicker').textContent = t.label;
    $('#panel h2').textContent = t.name;
    this.panelBody.innerHTML = sections[t.id]();
    this.panel.hidden = false; this.panel.scrollTop = 0; this.panelBody.scrollTop = 0;
    requestAnimationFrame(() => this.panel.classList.add('open'));
    document.querySelectorAll('#districts [data-go]').forEach((b) => b.classList.toggle('on', b.dataset.go === t.id));
    setTimeout(() => $('#panel h2').focus({ preventScroll: true }), 60);
  }

  closePanel() {
    this.panel.classList.remove('open');
    document.querySelectorAll('#districts [data-go]').forEach((b) => b.classList.remove('on'));
    clearTimeout(this._pt); this._pt = setTimeout(() => { if (!this.panel.classList.contains('open')) this.panel.hidden = true; }, 350);
  }
  get panelOpen() { return this.panel.classList.contains('open'); }

  showTooltip(t, x, y) {
    if (!t) { this.tooltip.hidden = true; return; }
    this.tooltip.hidden = false; this.tooltip.style.setProperty('--accent', t.color);
    this.tooltip.innerHTML = `<small>${esc(t.label)}</small>${esc(t.name)}<em>click to swing over</em>`;
    this.tooltip.style.transform = `translate(${x + 16}px, ${y + 16}px)`;
  }

  caption(t, i, n) {
    const c = $('#caption');
    if (!t) { c.hidden = true; return; }
    c.hidden = false; c.style.setProperty('--accent', t.color);
    const blurb = { hq: profile.lookingFor, repo: `${projects.length} public projects, from fintech ML to DevSecOps.`, build: 'Active build: Fintel, a cloud-native risk intelligence platform.',
      lab: 'IEEE lead author: clustering 31,000+ Indian court judgments.', xp: 'Software Development Intern at ARIEOTECH: React, C#, .NET, SQL Server.',
      academy: 'B.Tech CSE (IT) at SRM IST · CGPA 9.2 / 10.', arena: 'Aaruush Committee Head · Flipkart GRiD 8.0 National Semi-Finalist.',
      skills: 'Python · Java · React · .NET · AWS · Terraform · Kubernetes · PySpark', beacon: 'Want to work together? Click the beacon any time.' }[t.id];
    c.innerHTML = `<small>${i + 1} / ${n} · ${esc(t.label)}</small><b>${esc(t.name)}</b><p>${esc(blurb)}</p><span>Esc to stop the tour</span>`;
  }

  toast(title, sub = '', kind = '') {
    const el = document.createElement('div'); el.className = `toast ${kind}`;
    el.innerHTML = `<i>${kind === 'ach' ? '🏆' : kind === 'shard' ? '◆' : '•'}</i><div><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
    const box = $('#toasts'); while (box.children.length >= 4) box.firstChild.remove();
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, 4200);
  }

  setShards(n, total) { const e = $('#shardHud'); e.hidden = n === 0; e.innerHTML = `<i>◆</i> ${n} / ${total}`; e.title = 'Data shards found'; }

  buildClassic() {
    const S = sections;
    const order = [['about', 'About', S.hq], ['experience', 'Experience', S.xp], ['projects', 'Projects', S.repo], ['current', 'Current build', S.build], ['research', 'Research', S.lab],
      ['education', 'Education', S.academy], ['extracurricular', 'Extracurricular', S.arena], ['skills', 'Skills', S.skills], ['contact', 'Contact', S.beacon]];
    $('#classic').innerHTML = `
      <nav class="cnav"><b>${esc(profile.name)}</b><div>${order.map(([id, n]) => `<a href="#c-${id}">${esc(n)}</a>`).join('')}</div>
        <button class="btn primary" id="btnCity">Enter the 3D city</button></nav>
      <main>${order.map(([id, n, f]) => `<section id="c-${id}"><h2>${esc(n)}</h2>${f()}</section>`).join('')}
      <footer>© ${new Date().getFullYear()} ${esc(profile.name)} · Built with Three.js and custom shaders</footer></main>`;
    $('#btnCity').onclick = () => this.h.classic(false);
  }

  showClassic(on, webgl = true) {
    $('#classic').hidden = !on; document.body.classList.toggle('classic-on', on);
    $('#btnCity').hidden = !webgl;
    if (on) $('#classic').scrollTop = 0;
  }

  bindGlobal() {
    document.addEventListener('click', (e) => {
      const c = e.target.closest('[data-copy]');
      if (c) { navigator.clipboard?.writeText(c.dataset.copy).then(() => this.toast('Email copied', c.dataset.copy), () => this.toast('Copy failed', 'Select the address instead')); }
      const tr = e.target.closest('[data-track]'); if (tr) this.h.track?.(tr.dataset.track);
    });
    $('#panel .close').onclick = () => this.h.closePanel();
    $('#panel .next').onclick = () => this.h.next(1);
    $('#panel .prev').onclick = () => this.h.next(-1);
    $('#btnHome').onclick = () => this.h.home();
    $('#btnTourHud').onclick = () => this.h.tour();
    $('#btnRecruiter').onclick = () => this.h.classic(true);
    $('#btnSound').onclick = () => this.h.sound();
    $('#btnHelp').onclick = () => { $('#help').hidden = !$('#help').hidden; };
    $('#help .close').onclick = () => { $('#help').hidden = true; };
  }

  setSound(on) { $('#btnSound').setAttribute('aria-pressed', on); $('#btnSound').textContent = on ? '🔊' : '🔈'; }

  loading(p, msg) { $('#loader .bar i').style.width = `${Math.round(p * 100)}%`; if (msg) $('#loader .msg').textContent = msg; }
  hideLoader() { const l = $('#loader'); l.classList.add('done'); setTimeout(() => l.remove(), 700); }
}
