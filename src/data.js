// Single source of truth for every word on the site.
// Both the 3D city panels and the 2D "recruiter view" render from this file.

export const GH_USER = 'Chaitanya697';
export const AVATAR = 'https://avatars.githubusercontent.com/u/147988385?v=4&s=400';

export const profile = {
  name: 'Chaitanya P Desai',
  short: 'CPD',
  roles: ['Software Engineer', 'Cloud & DevOps', 'AI / ML'],
  location: 'Chennai, India',
  summary:
    'Final-year B.Tech Computer Science (IT) student at SRM Institute of Science and Technology (CGPA 9.2/10, 2027 batch). ' +
    'I build across the stack: full-stack features in React, TypeScript, C# and .NET from my internship at ARIEOTECH; ' +
    'cloud platforms on AWS with Terraform, Docker, Kubernetes and Jenkins; and ML/NLP pipelines over 31,000+ court judgments with PySpark and LegalBERT.',
  badges: [
    { k: '9.2', v: 'CGPA / 10' },
    { k: 'IEEE', v: 'Lead author' },
    { k: 'GRiD 8.0', v: 'National semi-finalist' },
    { k: 'OCI', v: 'AI Foundations certified' },
  ],
  lookingFor: 'Open to SDE, Cloud/DevOps and AI/ML roles, and to freelance projects with a clear scope.',
  links: {
    github: 'https://github.com/Chaitanya697',
    linkedin: 'https://www.linkedin.com/in/chaitanya-desai-5a9848328',
    email: 'chaitupdesai@gmail.com',
  },
  resumes: [
    { label: 'SDE résumé', file: 'assets/resume/Chaitanya_P_Desai_SDE_Resume.pdf' },
    { label: 'Cloud & DevOps résumé', file: 'assets/resume/Chaitanya_P_Desai_Cloud_DevOps_Resume.pdf' },
    { label: 'AI / ML résumé', file: 'assets/resume/Chaitanya_P_Desai_AIML_Resume.pdf' },
  ],
};

const gh = (r) => `https://github.com/Chaitanya697/${r}`;

export const projects = [
  {
    name: 'Fintel', tag: 'Financial Risk Intelligence Platform', when: 'Sep 2026 – Present', team: 'Team of 3',
    url: gh('fintel-risk-intelligence'),
    summary: 'Tells an investor how risky their portfolio is, why, and what could happen under market stress.',
    points: [
      'Random Forest + Gradient Boosting + XGBoost ensemble classifying risk (Low / Medium / High) from 10 engineered features such as volatility, beta, VaR and correlation.',
      '9,000 sample portfolios from NIFTY-50 data (49 stocks, 5,305 trading days); trained on 2001–2016, tested on unseen 2017–2020: ~53% accuracy vs a 34% baseline.',
      'Terraform-provisioned AWS (versioned S3, 3 ECR repos with scan-on-push, EC2 with Docker, Jenkins and k3s) and an 8-stage Jenkins pipeline.',
      '3 containerised services on Kubernetes with readiness/liveness probes, IAM instance roles (no keys in code) and Prometheus + Grafana monitoring.',
    ],
    stack: ['Python', 'Flask', 'scikit-learn', 'XGBoost', 'AWS', 'Terraform', 'Kubernetes', 'Jenkins', 'Grafana'],
    metrics: [['53%', 'vs 34% baseline'], ['9,000', 'training portfolios'], ['8', 'pipeline stages']],
  },
  {
    name: 'GridRelief', tag: 'Federated Disaster-Relief Coordination', url: gh('gridrelief'),
    summary: 'Independent relief centres share scarce resources; competing requests are ranked by one rule, and the network keeps working when a service fails.',
    points: [
      'Event-driven FastAPI microservices (centre, request, allocation) over RabbitMQ with a durable queue, so requests survive an allocation-service outage.',
      'Live dashboard with a guided failure-and-recovery demo, driven through the Docker Engine API.',
    ],
    stack: ['Python', 'FastAPI', 'RabbitMQ', 'Docker Compose'],
    metrics: [['5', 'containers'], ['5', 'event types'], ['0', 'requests lost in outage']],
  },
  {
    name: 'Tikaa Delivery Pipeline', tag: 'CI/CD · Blue-Green · DevSecOps', url: gh('devops-pbl3'),
    summary: 'Three Jenkins pipelines that build, release and security-scan a Flask app on k3s.',
    points: [
      'Blue-green releases that switch Service traffic only after an in-cluster health check, with automatic rollback.',
      'Security gate with Bandit, pip-audit, Gitleaks and Trivy; non-root container; Flask upgraded after pip-audit flagged a CVE.',
    ],
    stack: ['Jenkins', 'Docker', 'Kubernetes (k3s)', 'Trivy', 'Gitleaks', 'Flask'],
    metrics: [['3', 'pipelines'], ['4', 'scanners'], ['Auto', 'rollback']],
  },
  {
    name: 'NoteSeek', tag: 'Search Engine for Study Notes', url: gh('Noteseek'),
    summary: 'Ask a doubt and get the best-matching notes, ranked by four information-retrieval models.',
    points: [
      'Vector Space (TF-IDF), BM25, Boolean and language-model retrieval with Rocchio relevance feedback.',
      'KNN, Naive Bayes and SVM classification, K-Means and hierarchical clustering, PDF/PPTX upload, and evaluation with MAP, NDCG and P@K.',
    ],
    stack: ['Python', 'Flask', 'NLTK', 'scikit-learn'],
    metrics: [['4', 'retrieval models'], ['5', 'ML algorithms'], ['6', 'eval metrics']],
  },
  {
    name: 'ShieldGig', tag: 'Parametric Income Insurance · Guidewire DEVTrails 2026', url: gh('shieldgig-devtrails-2026'),
    summary: 'AI-powered parametric income insurance for q-commerce delivery partners, with automatic weather and disruption triggers.',
    points: ['Hackathon design and React prototype: persona research, weekly premium model, parametric triggers and an AI/ML plan.'],
    stack: ['React', 'Tailwind CSS', 'AI/ML design'],
  },
  {
    name: 'BudgetBuddy', tag: 'Personal Finance Tracker', url: gh('BudgetBuddy'),
    summary: 'Full-stack budgeting app with auth, transactions, a savings-rate dashboard and spending charts.',
    points: ['Passport auth with scrypt-hashed passwords, Zod-validated REST API, Drizzle ORM on PostgreSQL.'],
    stack: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Drizzle'],
  },
  {
    name: 'Quiz Leaderboard', tag: 'Bajaj API Challenge', url: gh('bajaj_Quiz_Leaderboardapp_RA2311031010043'),
    summary: 'Polls a quiz validator API, de-duplicates rounds and submits a ranked leaderboard.',
    points: ['HashSet de-duplication on roundId + participant, HashMap aggregation, sorted submission.'],
    stack: ['Java', 'REST'],
  },
];

export const research = {
  publication: {
    title: 'Comparative Study of Clustering Algorithms for Geospatial Legal Data Analysis',
    venue: 'ICRCICN 2025 · IEEE', role: 'Lead Author',
  },
  items: [
    {
      name: 'Geospatial Analysis of Indian Legal Data', when: 'Aug 2025 – Nov 2025',
      points: [
        'Scalable PySpark pipeline that cleans and processes 31,000+ judgments and generates LegalBERT embeddings.',
        'Benchmarked K-Means, GMM, DBSCAN and LDA using Silhouette and AIC/BIC; mapped regional litigation hotspots from geospatial metadata.',
      ],
      stack: ['PySpark', 'GeoPandas', 'LegalBERT', 'Python'],
    },
    {
      name: 'Judicial Digital Twin', when: 'Mar 2026 – Jun 2026',
      points: [
        'Full-stack digital twin of the judicial system: React dashboard on a PostgreSQL / pgvector backend.',
        'Dask + LegalBERT embeddings at scale; clustering and entropy metrics to detect inconsistencies across decisions.',
      ],
      stack: ['React', 'PostgreSQL', 'pgvector', 'Dask', 'LegalBERT'],
    },
  ],
};

export const experience = [
  {
    role: 'Software Development Intern', org: 'ARIEOTECH', when: 'Jun 2025 – Jul 2025',
    points: [
      'Developed full-stack features for a driving-school management system using React, TypeScript, C# and .NET.',
      'Implemented C#/.NET backend logic and SQL Server data handling.',
      'Translated business requirements into technical specifications with stakeholders.',
    ],
    stack: ['React', 'TypeScript', 'C#', '.NET', 'SQL Server'],
  },
];

export const education = [
  { level: 'B.Tech, Computer Science (IT)', school: 'SRM Institute of Science and Technology, Kattankulathur, Chennai', when: '2023 – 2027', score: 'CGPA 9.2 / 10',
    note: 'Core: Data Structures & Algorithms, OOP, DBMS, Operating Systems, Computer Networks.' },
  { level: 'Class XII · CBSE', school: "St. Wilfred's School, Panvel", when: '2023', score: '74.6%' },
  { level: 'Class X · ICSE', school: 'Ryan International School, Kharghar', when: '2021', score: '90%' },
];

export const certifications = [
  'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate',
  'NPTEL · Python for Data Science',
  'NPTEL · Programming in Java',
];

export const extracurricular = {
  leadership: [
    { role: 'Committee Head', org: 'Aaruush, SRM IST', when: 'Jun 2025 – Jun 2026',
      text: "Led a committee team planning and executing events; point of contact for the flagship event 'Cognixion'." },
    { role: 'Event Coordinator', org: 'Aaruush, SRM IST', when: 'Jul 2024 – May 2025',
      text: 'Promoted to Committee Head; core member of the team hosting E-Summit.' },
  ],
  competitions: [
    { name: 'Flipkart GRiD 8.0', result: 'National Semi-Finalist', when: 'Sep 2026' },
    { name: 'Guidewire DEVTrails 2026', result: 'Participant · built ShieldGig', when: '2026' },
    { name: 'DayZero Hackathon, SRM IST', result: 'Participant', when: '' },
  ],
  sports: ['Football', 'Badminton', 'Table tennis'],
};

export const current = {
  active: 'Fintel',
  next: [
    { name: 'Deployment website', status: 'Planning', text: 'Next up: a website to take my projects live for anyone to try.' },
    { name: 'This city', status: 'Live', text: "The portfolio you're exploring: Three.js, custom GLSL shaders, zero frameworks." },
  ],
};

export const skills = [
  ['Languages', ['Python', 'Java', 'C++', 'C', 'C#', 'JavaScript', 'TypeScript', 'SQL', 'Bash']],
  ['Full-stack', ['React', '.NET / ASP.NET Core', 'Flask', 'FastAPI', 'Express', 'REST APIs', 'Microservices', 'HTML / CSS']],
  ['Cloud & DevOps', ['AWS (EC2, S3, ECR, IAM)', 'Oracle Cloud', 'Terraform', 'Docker', 'Kubernetes (k3s)', 'Jenkins', 'Prometheus', 'Grafana']],
  ['AI / ML & NLP', ['scikit-learn', 'XGBoost', 'Ensemble learning', 'LegalBERT', 'pgvector', 'K-Means / GMM / DBSCAN', 'LDA']],
  ['Data', ['PySpark', 'Dask', 'Pandas', 'NumPy', 'GeoPandas', 'Power BI']],
  ['Databases', ['PostgreSQL', 'SQL Server', 'MySQL', 'SQLite']],
  ['Core CS', ['DSA', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks']],
];

export const services = [
  ['Python & automation', 'Scripts, Excel / CSV / PDF processing, API integrations'],
  ['Data', 'Cleaning, analysis and small dashboards'],
  ['Frontend', 'React / TypeScript bug fixes and features'],
  ['Backend', 'REST APIs in ASP.NET Core, Flask, FastAPI or Express'],
  ['Databases', 'SQL queries, schema design and fixes'],
  ['Deployment', 'Docker, CI/CD pipelines and AWS setup'],
];

// Landmark towers. Positions are on the city grid (world units ≈ metres).
export const towers = [
  { id: 'hq', name: 'Chaitanya HQ', label: 'ABOUT', color: '#7cc4ff', pos: [0, 0], h: 210, kind: 'hq' },
  { id: 'repo', name: 'The Repository', label: 'GITHUB & PROJECTS', color: '#3fb950', pos: [-144, -96], h: 170, kind: 'repo' },
  { id: 'build', name: 'Construction Yard', label: 'CURRENT PROJECTS', color: '#ffb340', pos: [144, -96], h: 150, kind: 'build' },
  { id: 'lab', name: 'Research Lab', label: 'RESEARCH & IEEE', color: '#b78bff', pos: [-192, 48], h: 140, kind: 'lab' },
  { id: 'xp', name: 'Experience Tower', label: 'EXPERIENCE', color: '#4fd1c5', pos: [192, 48], h: 160, kind: 'xp' },
  { id: 'academy', name: 'The Academy', label: 'EDUCATION', color: '#f0c674', pos: [-96, 192], h: 120, kind: 'academy' },
  { id: 'arena', name: 'The Arena', label: 'EXTRACURRICULAR', color: '#ff6b6b', pos: [96, 192], h: 70, kind: 'arena' },
  { id: 'skills', name: 'Signal Billboard', label: 'SKILLS', color: '#ff4fd8', pos: [0, -192], h: 130, kind: 'skills' },
  { id: 'beacon', name: 'Comms Beacon', label: 'CONTACT & HIRE', color: '#ff3b3b', pos: [0, 288], h: 190, kind: 'beacon' },
];
