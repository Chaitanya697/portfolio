/* The Chaitanya Chronicles: content, panels, mascot and extras. No libraries. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const gh = (r) => `https://github.com/Chaitanya697/${r}`;
  const EMAIL = 'chaitupdesai@gmail.com';

  /* ================= content ================= */
  const summary = 'Final-year B.Tech Computer Science (IT) student at SRM Institute of Science and Technology (CGPA 9.2/10, 2027 batch). I build across the stack: full-stack features in React, TypeScript, C# and .NET; cloud platforms on AWS with Terraform, Docker, Kubernetes and Jenkins; and ML/NLP pipelines over 31,000+ court judgments.';

  const facts = [
    ['9.2', 'CGPA / 10', 'B.Tech CSE (IT), SRM IST · 2027'],
    ['IEEE', 'Lead author', 'ICRCICN 2025 · clustering legal data'],
    ['GRiD 8.0', 'National semi-finalist', 'Flipkart Early Careers · Sep 2026'],
    ['SDE intern', 'ARIEOTECH', 'React · C# · .NET · SQL Server'],
  ];

  const resumes = [
    ['SDE résumé', 'assets/resume/Chaitanya_P_Desai_SDE_Resume.pdf'],
    ['Cloud & DevOps résumé', 'assets/resume/Chaitanya_P_Desai_Cloud_DevOps_Resume.pdf'],
    ['AI / ML résumé', 'assets/resume/Chaitanya_P_Desai_AIML_Resume.pdf'],
  ];

  const experience = [{
    role: 'Software Development Intern', org: 'ARIEOTECH', when: 'Jun 2025 – Jul 2025',
    points: [
      'Developed full-stack features for a driving-school management system using React, TypeScript, C# and .NET.',
      'Implemented C#/.NET backend logic and SQL Server data handling.',
      'Translated business requirements into technical specifications in collaboration with stakeholders.',
    ],
    stack: ['React', 'TypeScript', 'C#', '.NET', 'SQL Server'],
  }];

  const fintel = {
    name: 'Fintel', tag: 'Financial Risk Intelligence Platform', when: 'Sep 2026 – Present · Team of 3', repo: 'fintel-risk-intelligence',
    summary: 'Tells an investor how risky their portfolio is, why, and what could happen under market stress.',
    metrics: [['53%', 'accuracy vs a 34% baseline'], ['9,000', 'training portfolios'], ['8', 'Jenkins pipeline stages']],
    points: [
      'Random Forest + Gradient Boosting + XGBoost ensemble classifying risk (Low / Medium / High) from 10 engineered features such as volatility, beta, VaR and correlation.',
      '9,000 sample portfolios from NIFTY-50 data (49 stocks, 5,305 trading days); trained on 2001–2016 and tested on unseen 2017–2020.',
      'Terraform-provisioned AWS: versioned S3, 3 ECR repositories with scan-on-push, a security group and an EC2 host with Docker, Jenkins and k3s.',
      '3 containerised services on Kubernetes with readiness/liveness probes, IAM instance roles (no keys in code), Kubernetes Secrets and Prometheus + Grafana monitoring.',
    ],
    stack: ['Python', 'Flask', 'scikit-learn', 'XGBoost', 'AWS', 'Terraform', 'Kubernetes', 'Jenkins', 'Grafana'],
  };

  const projects = [
    { name: 'GridRelief', tag: 'Federated disaster-relief coordination', repo: 'gridrelief', color: 'blue', sfx: 'NO DOWNTIME!',
      summary: 'Relief centres share scarce supplies; competing requests are ranked by one rule, and the network keeps working when a service fails.',
      metrics: [['5', 'containers'], ['5', 'event types'], ['0', 'requests lost in outage']],
      points: ['Event-driven FastAPI microservices over RabbitMQ with a durable queue.', 'Live dashboard with a guided failure-and-recovery demo driven through the Docker Engine API.'],
      stack: ['Python', 'FastAPI', 'RabbitMQ', 'Docker'] },
    { name: 'Tikaa Delivery Pipeline', tag: 'CI/CD · blue-green · DevSecOps', repo: 'devops-pbl3', color: '', sfx: 'SECURED!',
      summary: 'Three Jenkins pipelines that build, release and security-scan a Flask app on k3s.',
      metrics: [['3', 'pipelines'], ['4', 'scanners'], ['Auto', 'rollback']],
      points: ['Blue-green releases that switch traffic only after an in-cluster health check, with automatic rollback.', 'Security gate: Bandit, pip-audit, Gitleaks and Trivy; non-root container.'],
      stack: ['Jenkins', 'Docker', 'k3s', 'Trivy', 'Flask'] },
    { name: 'NoteSeek', tag: 'Search engine for study notes', repo: 'Noteseek', color: 'yel', sfx: 'FOUND IT!',
      summary: 'Ask a doubt and get the best-matching notes, ranked by four information-retrieval models.',
      metrics: [['4', 'retrieval models'], ['5', 'ML algorithms'], ['6', 'eval metrics']],
      points: ['Vector Space (TF-IDF), BM25, Boolean and language-model retrieval with Rocchio feedback.', 'KNN, Naive Bayes, SVM, K-Means and hierarchical clustering; PDF/PPTX upload; MAP, NDCG and P@K evaluation.'],
      stack: ['Python', 'Flask', 'NLTK', 'scikit-learn'] },
    { name: 'ShieldGig', tag: 'Guidewire DEVTrails 2026', repo: 'shieldgig-devtrails-2026', color: '', sfx: '',
      summary: 'AI-powered parametric income insurance for q-commerce delivery partners, with automatic disruption triggers.',
      points: ['Persona research, a weekly premium model, parametric triggers and an AI/ML plan, with a React prototype.'],
      stack: ['React', 'Tailwind CSS', 'AI/ML design'] },
    { name: 'BudgetBuddy', tag: 'Personal finance tracker', repo: 'BudgetBuddy', color: 'red', sfx: '',
      summary: 'Full-stack budgeting app with auth, transactions, a savings-rate dashboard and spending charts.',
      points: ['Passport auth with scrypt-hashed passwords, a Zod-validated REST API and Drizzle ORM on PostgreSQL.'],
      stack: ['React', 'TypeScript', 'Express', 'PostgreSQL'] },
    { name: 'Quiz Leaderboard', tag: 'Bajaj API challenge', repo: 'bajaj_Quiz_Leaderboardapp_RA2311031010043', color: '', sfx: '',
      summary: 'Polls a quiz validator API, de-duplicates rounds and submits a ranked leaderboard.',
      points: ['HashSet de-duplication on roundId + participant, HashMap aggregation and a sorted submission.'],
      stack: ['Java', 'REST'] },
  ];

  const research = [
    { cap: 'ICRCICN 2025 · IEEE', color: 'yel', w: 's5', h: 'Lead author', body: '<p><i>Comparative Study of Clustering Algorithms for Geospatial Legal Data Analysis</i></p>', sfx: 'PUBLISHED!' },
    { cap: 'Aug 2025 – Nov 2025', color: '', w: 's7', h: 'Geospatial Analysis of Indian Legal Data',
      body: `<div class="big">31,000+</div><p class="muted"><b>court judgments processed</b></p><ul class="bul"><li>Scalable PySpark pipeline that cleans the judgments and generates LegalBERT embeddings.</li><li>Benchmarked K-Means, GMM, DBSCAN and LDA using Silhouette and AIC/BIC; mapped regional litigation hotspots from geospatial metadata.</li></ul>`,
      stack: ['PySpark', 'GeoPandas', 'LegalBERT', 'Python'] },
    { cap: 'Mar 2026 – Jun 2026', color: 'blue', w: 's12', h: 'Judicial Digital Twin',
      body: '<p>A full-stack digital twin of the judicial system: a React dashboard on a PostgreSQL / pgvector backend. Court judgments are preprocessed and embedded at scale with Dask and LegalBERT, and clustering and entropy metrics detect inconsistencies across decisions.</p>',
      stack: ['React', 'PostgreSQL', 'pgvector', 'Dask', 'LegalBERT'] },
  ];

  const education = [
    ['2023–27', 'B.Tech, Computer Science (IT)', 'SRM Institute of Science and Technology, Kattankulathur, Chennai · Core: DSA, OOP, DBMS, Operating Systems, Computer Networks', '9.2 CGPA'],
    ['2023', 'Class XII · CBSE', "St. Wilfred's School, Panvel", '74.6%'],
    ['2021', 'Class X · ICSE', 'Ryan International School, Kharghar', '90%'],
  ];
  const certs = ['Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate', 'NPTEL · Python for Data Science', 'NPTEL · Programming in Java'];

  const skills = [
    ['Languages', ['Python', 'Java', 'C++', 'C', 'C#', 'JavaScript', 'TypeScript', 'SQL', 'Bash'], 'red'],
    ['Full-stack', ['React', '.NET / ASP.NET Core', 'Flask', 'FastAPI', 'Express', 'REST APIs', 'Microservices'], ''],
    ['Cloud & DevOps', ['AWS (EC2, S3, ECR, IAM)', 'Oracle Cloud', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'Prometheus', 'Grafana'], 'blue'],
    ['AI / ML & NLP', ['scikit-learn', 'XGBoost', 'Ensemble learning', 'LegalBERT', 'pgvector', 'K-Means / GMM / DBSCAN', 'LDA'], 'yel'],
    ['Data', ['PySpark', 'Dask', 'Pandas', 'NumPy', 'GeoPandas', 'Power BI'], ''],
    ['Databases & core CS', ['PostgreSQL', 'SQL Server', 'MySQL', 'SQLite', 'DSA', 'OOP', 'DBMS', 'OS', 'Networks'], ''],
  ];

  const services = [
    ['Python & automation', 'Scripts, Excel / CSV / PDF processing, API integrations'],
    ['Data', 'Cleaning, analysis and small dashboards'],
    ['Frontend', 'React / TypeScript bug fixes and features'],
    ['Backend', 'REST APIs in ASP.NET Core, Flask, FastAPI or Express'],
    ['Databases', 'SQL queries, schema design and fixes'],
    ['Deployment', 'Docker, CI/CD pipelines and AWS setup'],
  ];

  const chapters = [['experience', 'Experience'], ['work', 'Projects'], ['research', 'Research'], ['now', 'Now'], ['education', 'Education'], ['leadership', 'Leadership'], ['skills', 'Skills'], ['contact', 'Contact']];

  /* ================= render ================= */
  const chips = (a) => `<ul class="chips">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const metrics = (m) => (m ? `<div class="metrics">${m.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>` : '');
  const bullets = (p) => `<ul class="bul">${p.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const code = (repo, label = 'View the code ↗') => `<p class="more"><a href="${gh(repo)}" target="_blank" rel="noopener">${label}</a></p>`;

  $('#summary').textContent = summary;
  // name drops in letter by letter, but words never break
  let n = 0;
  $('#title').innerHTML = 'Chaitanya P Desai'.split(' ').map((w) => `<span class="w">${w.split('').map((c) => `<span style="--i:${n++}">${c}</span>`).join('')}</span>`).join(' ');
  $('#nav').innerHTML = chapters.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('');

  $('#facts').innerHTML = facts.map(([k, v, s]) => `<div class="fact"><b>${esc(k)}</b><span>${esc(v)}</span><small>${esc(s)}</small></div>`).join('') +
    `<div class="fact" style="grid-column:1/-1;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between"><span>Looking for SDE, Cloud/DevOps or AI/ML roles, and freelance projects.</span><div class="cta">${resumes.map(([t, f]) => `<a class="btn sm" href="${f}" target="_blank" rel="noopener">⤓ ${esc(t)}</a>`).join('')}</div></div>`;

  $('#xpGrid').innerHTML = experience.map((e) => `<article class="p s8"><span class="cap">${esc(e.when)}</span><h3>${esc(e.role)}</h3><p class="tag">${esc(e.org)}</p>${bullets(e.points)}${chips(e.stack)}<span class="sfx">SHIPPED!</span></article>`).join('') +
    `<article class="p s4 yel"><span class="cap">The brief</span><h3>Driving-school management system</h3><p>Real users, real business rules: from requirements to C#/.NET backend logic, SQL Server data and a React + TypeScript frontend.</p></article>`;

  $('#featured').innerHTML = `<div class="grid" style="margin-bottom:20px"><article class="p s12 red"><span class="cap">Featured · ${esc(fintel.when)}</span><span class="sfx">DEPLOYED!</span>
    <h3 style="font-size:clamp(34px,4vw,48px)">${esc(fintel.name)}</h3><p class="tag">${esc(fintel.tag)}</p><p style="font-size:19px;max-width:62ch">${esc(fintel.summary)}</p>${metrics(fintel.metrics)}
    <details><summary>Engineering details</summary>${bullets(fintel.points)}</details>${chips(fintel.stack)}${code(fintel.repo, 'View Fintel on GitHub ↗')}</article></div>`;

  $('#projGrid').innerHTML = projects.map((p) => `<article class="p ${p.color}"><span class="cap">${esc(p.tag)}</span>${p.sfx ? `<span class="sfx">${esc(p.sfx)}</span>` : ''}
    <h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p>${metrics(p.metrics)}<details><summary>How it works</summary>${bullets(p.points)}</details>${chips(p.stack)}${code(p.repo)}</article>`).join('');

  $('#resGrid').innerHTML = research.map((r) => `<article class="p ${r.w} ${r.color}"><span class="cap">${esc(r.cap)}</span>${r.sfx ? `<span class="sfx">${esc(r.sfx)}</span>` : ''}<h3>${esc(r.h)}</h3>${r.body}${r.stack ? chips(r.stack) : ''}</article>`).join('');

  $('#nowGrid').innerHTML = `<article class="p s6 blue"><span class="cap">Active build · since Sep 2026</span><h3>Fintel</h3><p>Hardening the platform: ensemble ML, stress tests and the AWS + Kubernetes delivery pipeline.</p><p class="more"><a href="#work">See the project above ↑</a></p></article>
    <article class="p s3"><span class="cap">Planning</span><h3>Deployment website</h3><p>A site to take my projects live so anyone can try them.</p></article>
    <article class="p s3 yel"><span class="cap">Live</span><h3>This comic</h3><p>Hand-built HTML, CSS and JavaScript. No frameworks. Try clicking the little hero at the bottom.</p></article>`;

  $('#eduGrid').innerHTML = `<div class="s12 timeline">${education.map(([y, l, s, sc], i) => `<article class="p edu" style="--i:${i}"><span class="yr">${esc(y)}</span><div><h3>${esc(l)}</h3><p class="muted" style="margin:0">${esc(s)}</p></div><span class="score">${esc(sc)}</span></article>`).join('')}</div>
    <article class="p s12 yel"><span class="cap">Certifications</span>${bullets(certs)}</article>`;

  $('#leadGrid').innerHTML = `<article class="p s7 blue"><span class="cap">Aaruush, SRM IST · Jun 2025 – Jun 2026</span><h3>Committee Head</h3><p>Led a committee team planning and executing events; point of contact for the flagship event <b>Cognixion</b>. Promoted from Event Coordinator (Jul 2024 – May 2025); core member of the team hosting E-Summit.</p></article>
    <article class="p s5 red"><span class="cap">Flipkart Early Careers · Sep 2026</span><span class="sfx">WHAM!</span><h3>Flipkart GRiD 8.0</h3><div class="big">Semi-finalist</div><p><b>National level</b></p></article>
    <article class="p"><span class="cap">Hackathon · 2026</span><h3>Guidewire DEVTrails</h3><p>Built <b>ShieldGig</b>: parametric income insurance for delivery partners.</p></article>
    <article class="p"><span class="cap">Hackathon · SRM IST</span><h3>DayZero</h3><p>Participant in SRM's in-house hackathon.</p></article>
    <article class="p yel"><span class="cap">Off duty</span><h3>On the field</h3>${chips(['Football', 'Badminton', 'Table tennis'])}</article>`;

  $('#skillGrid').innerHTML = skills.map(([g, l, c]) => `<article class="p ${c}"><span class="cap">Power</span><h3>${esc(g)}</h3>${chips(l)}</article>`).join('');

  $('#svcGrid').innerHTML = `<article class="p s7"><span class="cap">Freelance</span><h3>What I can build for you</h3>
      <ul class="bul">${services.map(([a, b]) => `<li><b>${esc(a)}:</b> ${esc(b)}</li>`).join('')}</ul></article>
    <article class="p s5 yel"><span class="cap">How I work</span><h3>Simple and clear</h3><ol class="steps"><li>Scope</li><li>Fixed price</li><li>Build</li><li>Deliver + docs</li></ol>
      <p style="margin-top:12px">You know the price and the deliverable before any work starts.</p></article>`;
  $('#resumes').innerHTML = resumes.map(([t, f]) => `<a class="btn" href="${f}" target="_blank" rel="noopener">⤓ ${esc(t)}</a>`).join('');

  /* ================= reveal + scroll spy ================= */
  document.querySelectorAll('.grid').forEach((g) => [...g.children].forEach((c, i) => { if (!c.style.getPropertyValue('--i')) c.style.setProperty('--i', i % 4); }));
  const reveal = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.p, .chap').forEach((el) => reveal.observe(el));

  const navLinks = [...document.querySelectorAll('#nav a')];
  const buddy = $('#buddy');
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    const on = navLinks.find((a) => a.classList.contains('on')); const nav = $('#nav');
    if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + on.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    buddy.dataset.gear = e.target.dataset.gear || 'none';
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section').forEach((s) => spy.observe(s));

  /* ================= small helpers ================= */
  const toast = $('#toast'); let tt;
  const say = (m) => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2300); };
  const copyEmail = () => navigator.clipboard?.writeText(EMAIL).then(() => say('Email copied!'), () => say(EMAIL)) ?? say(EMAIL);
  document.addEventListener('click', (e) => {
    const s = e.target.closest('.sfx');
    if (s) { s.classList.remove('again'); void s.offsetWidth; s.classList.add('again'); }
    if (e.target.closest('[data-copy]')) copyEmail();
  });

  /* ================= mascot ================= */
  const bubble = $('#say'), flip = $('#flip'), pupils = $('#inky .pupils');
  const lines = {
    tickle: ['Hehe, that tickles!', 'Hey! Watch the cape!', 'Ooh, a visitor!', 'Careful, I bruise easily.'],
    facts: ['Fun fact: CGPA 9.2!', 'He published at IEEE as lead author.', '31,000+ court judgments, clustered!', "Fintel beats a 34% baseline with 53%.", 'National semi-finalist at Flipkart GRiD 8.0.', 'He shipped .NET + React at ARIEOTECH.', 'Psst… press / to jump anywhere.', 'There is a secret code. Think arcade.'],
  };
  let fi = 0, bubbleT;
  const speak = (t, ms = 2600) => { bubble.textContent = t; bubble.classList.add('on'); clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove('on'), ms); };
  const W = () => innerWidth - (innerWidth < 700 ? 52 : 64);
  let x = 24, vx = 0, target = 24, dir = 1, mouseX = null, mouseY = 0, lastMove = performance.now(), busy = false, hidden = false, wanderAt = 0;

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouseX = e.clientX; mouseY = e.clientY; lastMove = performance.now();
    const r = buddy.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 200)) * (dir < 0 ? -1 : 1);
    const dy = Math.max(-1, Math.min(1, (e.clientY - r.top) / 300));
    pupils.setAttribute('transform', `translate(${(dx * 1.5).toFixed(2)},${(dy * 1.2).toFixed(2)})`);
  }, { passive: true });

  if (fine) buddy.addEventListener('pointerenter', () => {
    if (busy) return;
    buddy.classList.remove('tickle'); void buddy.offsetWidth; buddy.classList.add('tickle');
    speak(lines.tickle[Math.floor(Math.random() * lines.tickle.length)], 1600);
    target = x + (mouseX != null && mouseX > x + 32 ? -90 : 90);   // scoot away from the cursor
  });
  buddy.addEventListener('click', () => {
    if (busy) return; busy = true;
    buddy.classList.remove('jump'); void buddy.offsetWidth; buddy.classList.add('jump');
    speak(lines.facts[fi++ % lines.facts.length], 3000);
    setTimeout(() => { buddy.classList.remove('jump'); busy = false; }, 720);
  });
  buddy.addEventListener('dblclick', () => { hidden = true; buddy.classList.add('hide'); say('Hero hidden · press H to bring him back'); });

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!hidden && !reduce) {
      const idle = now - lastMove > 7000;
      if (fine && mouseX != null && !idle) {
        // follow the cursor, stopping a little short of it
        const goal = Math.max(8, Math.min(W() - 8, mouseX - 32 - 70 * Math.sign(mouseX - 32 - x || 1)));
        if (Math.abs(goal - x) > 60) target = goal;
      } else if (now > wanderAt) {
        target = 8 + Math.random() * (W() - 16); wanderAt = now + 5000 + Math.random() * 6000;
      }
      target = Math.max(8, Math.min(W() - 8, target));
      const want = Math.max(-240, Math.min(240, (target - x) * 3));
      vx += (want - vx) * Math.min(1, dt * 6);
      if (Math.abs(target - x) < 4) vx *= 0.8;
      x += vx * dt;
      const running = Math.abs(vx) > 18;
      buddy.classList.toggle('run', running);
      buddy.classList.toggle('idle', !running && idle);
      if (Math.abs(vx) > 8) { const d = vx > 0 ? 1 : -1; if (d !== dir) { dir = d; flip.classList.toggle('left', dir < 0); } }
      buddy.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      const side = x > innerWidth - 190 ? 'r' : x < 130 ? 'l' : '';
      if (side !== bubble.dataset.side) { bubble.dataset.side = side; bubble.classList.toggle('r', side === 'r'); bubble.classList.toggle('l', side === 'l'); }
    }
    requestAnimationFrame(tick);
  }
  buddy.style.transform = `translate3d(${x}px,0,0)`;
  requestAnimationFrame(tick);
  setTimeout(() => speak(fine ? 'Hi! I follow your mouse. Click me!' : 'Hi! Tap me for fun facts!', 3200), 1800);

  /* ================= quick-jump palette ================= */
  const items = [
    ...chapters.map(([id, t]) => ({ t, k: 'Chapter', go: () => location.assign('#' + id) })),
    { t: 'Back to the cover', k: 'Top', go: () => location.assign('#top') },
    ...[fintel, ...projects].map((p) => ({ t: p.name, k: 'Project', go: () => window.open(gh(p.repo), '_blank', 'noopener') })),
    ...resumes.map(([t, f]) => ({ t: `Open ${t}`, k: 'PDF', go: () => window.open(f, '_blank', 'noopener') })),
    { t: 'Copy email address', k: 'Action', go: copyEmail },
    { t: 'Open GitHub', k: 'Link', go: () => window.open('https://github.com/Chaitanya697', '_blank', 'noopener') },
    { t: 'Open LinkedIn', k: 'Link', go: () => window.open('https://www.linkedin.com/in/chaitanya-desai-5a9848328', '_blank', 'noopener') },
    { t: 'Summon the hero', k: 'Fun', go: () => { hidden = false; buddy.classList.remove('hide'); speak("I'm back!"); } },
  ];
  const pal = $('#pal'), palIn = $('#palIn'), palList = $('#palList');
  let sel = 0, shown = items;
  const draw = () => {
    const q = palIn.value.trim().toLowerCase();
    shown = items.filter((i) => (i.t + ' ' + i.k).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    palList.innerHTML = shown.map((i, j) => `<li role="option" aria-selected="${j === sel}" class="${j === sel ? 'on' : ''}" data-j="${j}">${esc(i.t)}<small>${esc(i.k)}</small></li>`).join('') || '<li>No matches</li>';
  };
  const openPal = () => { pal.hidden = false; palIn.value = ''; sel = 0; draw(); palIn.focus(); };
  const closePal = () => { pal.hidden = true; };
  const run = (i) => { if (!i) return; closePal(); i.go(); };
  $('#openPal').addEventListener('click', openPal);
  palIn.addEventListener('input', () => { sel = 0; draw(); });
  palIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { sel = Math.min(shown.length - 1, sel + 1); draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); }
    else if (e.key === 'Enter') run(shown[sel]);
    else if (e.key === 'Escape') closePal();
  });
  palList.addEventListener('click', (e) => { const li = e.target.closest('[data-j]'); if (li) run(shown[+li.dataset.j]); });
  pal.addEventListener('click', (e) => { if (e.target === pal) closePal(); });

  /* ================= keyboard + secrets ================= */
  const K = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let buf = '';
  let kseq = [];
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if (typing) return;
    const k = e.key.toLowerCase();
    if (k === '/' ) { e.preventDefault(); openPal(); return; }
    if (k === 'escape') closePal();
    if (k === 'h' && hidden) { hidden = false; buddy.classList.remove('hide'); speak("I'm back!"); }
    kseq.push(k); if (kseq.length > K.length) kseq.shift();
    if (K.every((v, i) => kseq[i] === v)) { kseq = []; document.body.classList.toggle('noir'); say(document.body.classList.contains('noir') ? 'Secret noir edition unlocked!' : 'Back to full colour'); }
    if (k.length === 1) {
      buf = (buf + k).slice(-6);
      if (buf.endsWith('hire')) {
        buf = '';
        buddy.classList.add('hire'); speak('Hire Chaitanya! Email below ↓', 3500);
        setTimeout(() => buddy.classList.remove('hire'), 4000);
        location.assign('#contact');
      }
    }
  });

  console.log('%cThe Chaitanya Chronicles', 'font:28px Bangers,Impact,sans-serif;color:#e63946;-webkit-text-stroke:1px #000');
  console.log('%cReading the source? Respect. Hand-built, no frameworks.\nType hire() here, or press / on the page.', 'font:14px sans-serif');
  window.hire = () => { location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's work together")}`; return 'Opening your mail client…'; };
})();
