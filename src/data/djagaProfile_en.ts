import { User, Profile, Experience, Education, Project, Skill, Language, Certification, PortfolioConfig } from "../types";

export const djagaUserEN: User = {
  id: "user-djaga",
  email: "djaganadane16@gmail.com",
  first_name: "Djaganadane",
  last_name: "MOUROUGAYANE",
  full_name: "Djaganadane MOUROUGAYANE",
  username: "djaga",
  is_superuser: false,
  is_active: true,
  email_verified: true,
  tier: "free",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const djagaProfileEN: Profile = {
  id: "profile-djaga",
  user_id: "user-djaga",
  bio: `I am an IT engineer graduating from Efrei Paris, specializing in Networks and Security. During my 3-year apprenticeship at Thales LAS, I built a hybrid skill set spanning software development, DevOps, and cybersecurity. I initially started on development tasks. I then identified an unmet security need within my team. I took the initiative to fill this gap and made security my core operational expertise.

I use a highly analytical approach in my work. I systematically compare, weigh, and optimize options to find the most cost-effective solutions. I apply this mindset to designing DevSecOps pipelines, leading entrepreneurial projects, and managing teams.

Alongside my main work, I successfully managed several independent projects. I conducted a security audit for a SaaS platform (Portfolia) and led a digital forensics project (Mimirian). I also co-authored a research framework on sovereign AI, which was presented at the ICONI 2025 international conference in Okinawa. My profile also features an entrepreneurial side. I launched and managed two ventures: an online jewelry store and a dark kitchen concept (Vel Express). I handled everything from initial design to operations, including marketing and logistics.

Regarding soft skills, I am the captain of an amateur 5-a-side football team. This role has taught me how to manage people and make decisions under pressure. I am also highly interested in geopolitics, digital marketing, and strategic analysis. These fields shape how I approach and solve complex problems.

I am not the best developer  but I am the one who understands tech AND knows how to make it drive business value.`,
  title: "Computer Engineer",
  location: "Paris, France",
  phone: "",
  linkedin_url: "https://www.linkedin.com/in/djagam/",
  github_url: "https://github.com/djaga91",
  portfolio_url: "",
  profile_picture_url: "",
  completeness: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const djagaExperiencesEN: Experience[] = [
  {
    id: "exp-1",
    user_id: "user-djaga",
    title: "Software Development Engineer (Apprentice)",
    company: "Thales LAS France",
    location: "Rungis, France",
    start_date: "2023-09-01",
    end_date: "2026-08-31",
    is_current: false,
    description: `Security and compliance

- Co-led with a senior engineer the compliance with ISO 27001 standards across about ten controls: production of audit evidence, formalization of documentation and certification preparation.

- Built attack scenarios using the Cyber Kill Chain and MITRE ATT&CK frameworks for each tool used by the team, enabling early identification of attack vectors.

- Hardened several Linux virtual machines using OpenSCAP, in line with the team's security baselines.

- Applied the IT department's internal security requirements within the team's deliverables to meet corporate standards.


DevSecOps

- Designed a testing pipeline (Faulty Projects) to validate the reliability of the security tools used by the development team: Semgrep, SonarQube, Grype, GitLab DepScan and ClamAV. The pipeline embeds deliberately vulnerable code, runs the scans of each tool against that code, and forwards the results to DefectDojo, the team's vulnerability manager. Multi-language coverage (Python, Java) across 3 severity levels (clean, moderate, aggressive) to verify each tool's ability to detect the expected flaws. Executed on a dedicated GitLab Runner inside an isolated Kubernetes cluster to safely host the malicious code.

- Co-created a GitLab CI/CD pipeline to deploy DefectDojo, the cyber team's central vulnerability manager. This automation ensures fast production rollouts, and the team still relies on this infrastructure daily.

- Mapped the architecture of Confluence and SonarQube and produced the related documentation for knowledge sharing within the team.


Infrastructure and cloud

- Developed dedicated Python scripts (one per resource type) querying the Azure APIs to automatically inventory the environment: VMs, DBaaS, users, user groups, costs and cluster instances. Published the inventories via GitLab Pages to give the team centralized visibility on the cloud estate.

- Developed a Python script that lists the team's hundred-plus GitLab access tokens, identifies their origin and generates an Excel report usable for security audits.

- Created and configured virtual machines on Azure to meet the team's specific needs. Managed application deployments to Kubernetes clusters via GitLab. Set up a dedicated GitLab Runner in an isolated cluster to execute security analyses for Faulty Projects.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/thales.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-ukm",
    user_id: "user-djaga",
    title: "Artificial Intelligence Research Assistant",
    company: "Universiti Kebangsaan Malaysia (UKM)",
    location: "Bangi, Malaysia",
    start_date: "2025-07-01",
    end_date: "2025-10-31",
    is_current: false,
    description: `Co-authored the theoretical framework of the Al Warisan project, a Malaysian-native AI dedicated to preserving and promoting the country's intangible cultural heritage (regional languages, oral traditions, cultural knowledge).

Work officially published as co-author in the proceedings of the international ICONI 2025 conference (Okinawa, Japan), a recognized forum on innovation and emerging technologies.

Worked directly with a team of Malaysian researchers in a fully English-speaking environment on issues of ethics, governance and technological sovereignty applied to AI.

Brought a European perspective on regulatory frameworks and methodological approaches to AI research.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/ukm.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-2",
    user_id: "user-djaga",
    title: "Store Manager",
    company: "Pallavi",
    location: "Saint-Denis, Réunion Island",
    start_date: "2023-06-01",
    end_date: "2023-08-31",
    is_current: false,
    description: `Managed commercial performance: daily revenue tracking, design of targeted promotional offers and tailoring of the merchandising to customer profiles.

Team management: shift planning, task allocation and hands-on support during peak hours.

Financial management: budget oversight, cash-flow monitoring and daily till reconciliation.

Supply chain: full ownership of inventory and replenishment across a varied product mix, with product rotation optimization to minimize stock-outs.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/pallavi.webp",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-3",
    user_id: "user-djaga",
    title: "Administrative and HR Assistant",
    company: "Mutex",
    location: "Châtillon, France",
    start_date: "2022-06-01",
    end_date: "2022-09-30",
    is_current: false,
    description: `Processed and validated over 1,000 insurance files during the assignment, with systematic compliance checks (signatures, dates, supporting documents).

Handled client relations by phone and email to bring non-compliant files into order: follow-ups, regulatory clarifications and guidance on completing missing documentation.

Supported payroll operations and various administrative HR tasks.

Built strong operational rigor in a regulated environment (insurance) and a zero-defect attention to detail.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/mutex.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-4",
    user_id: "user-djaga",
    title: "Event Coordinator and Youth Activity Leader",
    company: "Centre Social l'Amandier",
    location: "Vigneux-sur-Seine, France",
    start_date: "2020-06-01",
    end_date: "2021-08-31",
    is_current: false,
    description: `Event project management: full organization of municipal celebrations for children (planning, logistics, coordination of contributors).

Daily supervision of children and teenagers: developed a pedagogical approach grounded in active listening, patience and understanding of individual needs.

Budget management: activity planning within the budgets allocated by the local authority.

Design and delivery of custom-built thematic workshops, from research to hands-on implementation.

Coordination of multidisciplinary teams during key events.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/amandier.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaEducationsEN: Education[] = [
  {
    id: "edu-1",
    user_id: "user-djaga",
    degree: "Master's-level Engineering Degree — Specialization in Networks and Security",
    school: "Efrei Paris",
    field_of_study: "Networks and Security",
    start_date: "2023-09-01",
    end_date: "2026-06-30",
    is_current: false,
    location: "Villejuif, France",
    description: `Cybersecurity and compliance: ISO-based risk and audit management, secure architecture, vulnerability analysis, cyber defense and offense, cloud security, network security, pentesting, ethical hacking, and applied modern cryptography.

Systems, infrastructure and cloud: AWS deployment (subnets, multi-zone VLANs, S3), enterprise secure architectures (DNS, LDAP, Apache, DHCP), Linux and Windows administration, network supervision and quality of service, virtualization, databases, and container orchestration (Docker, Kubernetes).

DevOps and software development: complete CI/CD pipelines (Jenkins, GitLab), delivery management, multitasking programming, and development in C/C++ and web technologies.

Soft skills and business mindset: management, negotiation, interpersonal communication for project leaders, storytelling and rhetoric, innovation and marketing, political science, and professional English (Public Speaking, Business Communication, Debating).`,
    grade: null,
    logo_url: "images/logos/efrei.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "edu-2",
    user_id: "user-djaga",
    degree: "Bachelor's degree in Mathematics, Computer Science and Social Sciences (MIASHS)",
    school: "Université Paris 1 Panthéon-Sorbonne",
    field_of_study: "Mathematics, Computer Science and Social Sciences",
    start_date: "2020-09-01",
    end_date: "2023-06-30",
    is_current: false,
    location: "Paris, France",
    description: `Two completed years of the MIASHS Bachelor's program at Université Paris 1 Panthéon-Sorbonne, before joining the engineering program at Efrei Paris in September 2023.

Applied mathematics: mathematical cryptography, probability theory and statistics.

Algebra and numerical computation: data manipulation, vector calculus and resolution of complex systems.

Economics and analysis: macroeconomic theory (Keynes, Adam Smith) and written analyses of market dynamics.`,
    grade: null,
    logo_url: "images/logos/paris1.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaProjectsEN: Project[] = [
  {
    id: "proj-faulty-thales",
    user_id: "user-djaga",
    name: "DevSecOps Initiative - Faulty Projects (Thales) · January - August 2026",
    description: `Independently led, using Agile methodology (User Stories, Epics), a testing pipeline designed to validate the reliability of the cyber team's security tools.
→ The pipeline embeds deliberately vulnerable code, runs the scans of Semgrep, SonarQube, Grype, GitLab DepScan and ClamAV, then feeds the results into DefectDojo, the team's vulnerability manager.
→ Multi-language coverage (Python, Java) across 3 severity levels (clean, moderate, aggressive) to measure each tool's real ability to detect the expected flaws.
→ Outcome: a quality-control asset still in use by the team today to keep its detection chain reliable across all its projects.`,
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "ShieldAlert",
    order: 1,
    technologies: ["DevSecOps", "Agile", "Kubernetes", "GitLab CI"],
    features: ["Automated Scanning", "Orchestration", "Isolated Environment"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-portfolia",
    user_id: "user-djaga",
    name: "Functional Auditor & GRC - Portfolia.fr Project · January - March 2026",
    description: `Cybersecurity audit of the Portfolia.fr SaaS platform, conducted under the ISO 27017 (cloud security) and OWASP ASVS (application security) standards.
→ Acted as functional auditor and direct interlocutor with management: led interviews, assessed security governance and presented findings.
→ Surfaced critical risks the client was unaware of: no MFA, insecure JWT token storage, no SAST/DAST controls. Built a risk map to make them readable by non-technical decision-makers.
→ Delivered prioritized strategic recommendations to fix application flaws and harden the cloud infrastructure, turning a security blind spot into a concrete action plan.`,
    url_demo: "https://portfolia.fr",
    url_github: null,
    url_image: null,
    project_icon: "ClipboardCheck",
    order: 2,
    technologies: ["GRC", "Security Audit", "ISO 27017", "OWASP ASVS", "Cloud Security"],
    features: ["Risk Mapping", "Functional Audit", "Infra Recommendations"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-mimirian",
    user_id: "user-djaga",
    name: "Project Manager - Mimirian Platform · October 2025 - February 2026",
    description: `Led an ambitious student project: the design of Mimirian, a sovereign digital investigation platform for law enforcement and intelligence services.
→ Defined the product vision, built the go-to-market strategy and reached out to institutional partners.
→ Led the design of the Blind Alert innovation, a mechanism that lets multiple investigators collaborate on sensitive cases without revealing the content of their respective files.
→ Outcome: a project recognized by the jury for its quality, carried from the initial vision through to the defense and the official presentation video.`,
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "Shield",
    order: 3,
    technologies: ["Management", "Strategy", "Innovation", "Digital Sovereignty"],
    features: ["Project Management", "Blind Alert Design", "Launch Strategy"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-al-warisan",
    user_id: "user-djaga",
    name: "Co-author & Research Assistant - AI Project 'AL WARISAN' · July - October 2025",
    description: `Co-authored the theoretical framework of the Al Warisan project, a sovereign artificial intelligence commissioned by the Malaysian state to preserve the country's intangible cultural heritage.
→ International research collaboration between Universiti Kebangsaan Malaysia (the country's second-ranked national university) and Efrei Paris.
→ Official co-author of the scientific paper "Testing Criteria for AI Models: A Case Study of Al Warisan Project", published in the proceedings of the 17th international ICONI 2025 conference in Okinawa, Japan.
→ Work focused on governance, ethics and evaluation criteria applied to sovereign AI models.`,
    url_demo: "https://iconi.org/program_book",
    url_github: "/docs/projects/iconi2025-program.pdf",
    url_image: null,
    project_icon: "Brain",
    order: 4,
    technologies: ["AI", "Research", "Theoretical Framework", "Data Science"],
    features: ["Scientific Writing", "International Collaboration", "ICONI 2025 Presentation"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-entrepreneuriat",
    user_id: "user-djaga",
    name: "Entrepreneurship & Digital Commerce",
    description: `Independently launched and managed two commercial ventures, from concept to operational delivery.

Online jewelry store · 2019
→ Built and ran an end-to-end e-commerce store.
→ Grew a customer base and crafted a digital marketing strategy.
→ Revenue generated: €500.

Vel Express — Digital food service · 2022
→ Launched a made-to-order Indian food preparation and delivery business.
→ Managed operations, logistics and customer relationships.
→ Revenue generated: €1,000.`,
    url_demo: "/docs/projects/menu-vel-express.pdf",
    url_github: null,
    url_image: null,
    project_icon: "Briefcase",
    order: 5,
    technologies: ["Entrepreneurship", "Digital Commerce", "Operations Management", "Marketing"],
    features: ["Business Creation", "Sales Management", "Digital Marketing"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const djagaSkillsEN: Skill[] = [
  // 🛡️ Cybersecurity and Governance
  { id: "skill-1", user_id: "user-djaga", name: "Governance, Risk and Compliance (GRC)", category: "Cybersecurity and Governance" },
  { id: "skill-2", user_id: "user-djaga", name: "Cybersecurity", category: "Cybersecurity and Governance" },
  { id: "skill-3", user_id: "user-djaga", name: "ISO 27001 / 27017", category: "Cybersecurity and Governance" },
  { id: "skill-4", user_id: "user-djaga", name: "OWASP ASVS", category: "Cybersecurity and Governance" },
  { id: "skill-5", user_id: "user-djaga", name: "MITRE ATT&CK", category: "Cybersecurity and Governance" },
  { id: "skill-6", user_id: "user-djaga", name: "Cyber Kill Chain", category: "Cybersecurity and Governance" },
  { id: "skill-7", user_id: "user-djaga", name: "Threat Modeling", category: "Cybersecurity and Governance" },
  { id: "skill-8", user_id: "user-djaga", name: "Linux Hardening (OpenSCAP)", category: "Cybersecurity and Governance" },
  { id: "skill-9", user_id: "user-djaga", name: "Malware Analysis (Sandbox)", category: "Cybersecurity and Governance" },

  // ⚙️ DevSecOps and Pipelines
  { id: "skill-10", user_id: "user-djaga", name: "DevSecOps", category: "DevSecOps and Pipelines" },
  { id: "skill-11", user_id: "user-djaga", name: "GitLab CI/CD", category: "DevSecOps and Pipelines" },
  { id: "skill-12", user_id: "user-djaga", name: "DefectDojo", category: "DevSecOps and Pipelines" },
  { id: "skill-13", user_id: "user-djaga", name: "Semgrep", category: "DevSecOps and Pipelines" },
  { id: "skill-14", user_id: "user-djaga", name: "SonarQube", category: "DevSecOps and Pipelines" },
  { id: "skill-15", user_id: "user-djaga", name: "Grype", category: "DevSecOps and Pipelines" },
  { id: "skill-16", user_id: "user-djaga", name: "GitLab DepScan", category: "DevSecOps and Pipelines" },
  { id: "skill-17", user_id: "user-djaga", name: "ClamAV", category: "DevSecOps and Pipelines" },

  // ☁️ Cloud and Infrastructure
  { id: "skill-18", user_id: "user-djaga", name: "AWS", category: "Cloud and Infrastructure" },
  { id: "skill-19", user_id: "user-djaga", name: "Azure", category: "Cloud and Infrastructure" },
  { id: "skill-21", user_id: "user-djaga", name: "Kubernetes", category: "Cloud and Infrastructure" },
  { id: "skill-22", user_id: "user-djaga", name: "Networking", category: "Cloud and Infrastructure" },
  { id: "skill-23", user_id: "user-djaga", name: "Asset Management", category: "Cloud and Infrastructure" },

  // 💻 Development and Data
  { id: "skill-24", user_id: "user-djaga", name: "Python", category: "Development and Data" },
  { id: "skill-25", user_id: "user-djaga", name: "Bash", category: "Development and Data" },
  { id: "skill-26", user_id: "user-djaga", name: "YAML", category: "Development and Data" },
  { id: "skill-28", user_id: "user-djaga", name: "AI and Machine Learning Foundations", category: "Development and Data" },
  { id: "skill-29", user_id: "user-djaga", name: "Prompt Engineering and AI-augmented Development", category: "Development and Data" },

  // 🎯 Soft Skills
  { id: "skill-30", user_id: "user-djaga", name: "Project Management", category: "Management & Soft Skills" },
  { id: "skill-32", user_id: "user-djaga", name: "Technical Popularization", category: "Management & Soft Skills" },
  { id: "skill-33", user_id: "user-djaga", name: "Interpersonal Intelligence", category: "Management & Soft Skills" },
  { id: "skill-34", user_id: "user-djaga", name: "Intercultural Adaptability", category: "Management & Soft Skills" },
  { id: "skill-38", user_id: "user-djaga", name: "Marketing and Commercial Strategy", category: "Management & Soft Skills" },
];

export const djagaLanguagesEN: Language[] = [
  { id: "l1", user_id: "user-djaga", name: "French", level: "Native", code: "fr", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l2", user_id: "user-djaga", name: "English", level: "Fluent", code: "en", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l3", user_id: "user-djaga", name: "Tamil", level: "Native Speaker", code: "ta", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l4", user_id: "user-djaga", name: "Spanish", level: "Beginner (Understanding)", code: "es", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const djagaCertificationsEN: Certification[] = [
  {
    id: "cert-1",
    user_id: "user-djaga",
    name: "Stormshield Certification",
    issuer: "Stormshield",
    date_obtained: "2024",
    url: "/docs/certifications/Certification Stormshield.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "cert-2",
    user_id: "user-djaga",
    name: "TOEIC Listening and Reading",
    issuer: "ETS",
    date_obtained: "2024",
    url: "/docs/certifications/TOEIC-2024.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "cert-3",
    user_id: "user-djaga",
    name: "MOOC GdP - Project Management",
    issuer: "MOOC GdP",
    date_obtained: "2023",
    url: "/docs/certifications/Attestation de réussite MOOC GdP-Djaganadane.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "cert-4",
    user_id: "user-djaga",
    name: "Prévention Sup",
    issuer: "Prévention Sup",
    date_obtained: "2023",
    url: "/docs/certifications/Certification_Prevention_Sup.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaInterestsEN = [
  {
    id: "int-1",
    user_id: "user-djaga",
    icon: "🌍",
    name: "History, Geography and Geopolitics",
    description: "A real obsession. I like to pull on the thread. Learning that Alaska went from Russia to the United States for 7.2 million dollars, and I am off for a two-hour deep dive into the territorial reshuffles of the 19th century. That curiosity shapes how I approach almost any subject: trace the causes before judging the effects.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-2",
    user_id: "user-djaga",
    icon: "✈️",
    name: "Travel and Cultural Discovery",
    description: "Over twenty countries so far, with one clear goal: setting foot on every continent. Travel is my favorite way of learning. Understanding a culture from within, through conversations, food, scents. Far more telling than any book.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-3",
    user_id: "user-djaga",
    icon: "🚀",
    name: "Entrepreneurship and Digital Marketing",
    description: "I love building things, launching projects, seeing if they take off. Two ventures already (online store, on-demand food service), with their wins and their hard lessons. I am now upskilling in digital marketing to build something more solid next time.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-4",
    user_id: "user-djaga",
    icon: "⚽",
    name: "Football",
    description: "Captain of a 5-a-side team, I play every week. It is my own time, but it is also where I practice very concrete things: organizing, motivating, making a call in two seconds when everything is moving fast. What works on the pitch tends to work in the office too.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-5",
    user_id: "user-djaga",
    icon: "🚗",
    name: "Cars and Perfumery",
    description: "Two worlds I am discovering through their aesthetics. The design of a car, its lines, the way it occupies space. The bottle of a fragrance, its olfactive composition, the balance between a top note and a base. These are worlds where beauty is built with real craftsmanship, and that is what draws me in.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaConfigEN: PortfolioConfig = {
  template: "template1",
  colorMode: "dark",
  theme: {
    primaryColor: "#3B82F6",
    fontFamily: "Inter"
  },
  layout: [
    { id: "hero", type: "hero", visible: true, order: 0 },
    { id: "about", type: "about", visible: true, order: 1 },
    { id: "experiences", type: "experiences", visible: true, order: 2 },
    { id: "education", type: "education", visible: true, order: 3 },
    { id: "projects", type: "projects", visible: true, order: 4 },
    { id: "skills", type: "skills", visible: true, order: 5 },
    { id: "languages", type: "languages", visible: true, order: 6 },
    { id: "certifications", type: "certifications", visible: true, order: 7 },
    { id: "interests", type: "interests", visible: true, order: 8 },
    { id: "contact", type: "contact", visible: true, order: 9 }
  ],
  metadata: { version: 1 }
};
