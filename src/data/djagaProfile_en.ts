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
  bio: `Hello, my name is Djaganadane Mourougayane. I am 23 years old. I am finishing my Master's-level engineering co-op program at Efrei, majoring in Networks and Security.

At Thales, I work as a Software Development Engineer. I initially started with software development and DevOps tasks, but I soon noticed that my team needed help with security. I decided to fill this gap. This was not planned, but it has become one of my biggest strengths to date. I can now easily work in both software development and cybersecurity and integrate these subjects seamlessly. Through engineering school and various practical networking and security projects, I strengthened my foundational technical skills.

Outside of work, I am a very curious person. I have a keen interest in History and geopolitics. I enjoy researching topics deeply and learning new things. For example, learning that Alaska was Russian before being sold to the United States for $7.2 million is fascinating, and I could read about it for hours! More recently, I discovered a real passion for cars and fragrances.

I also have a habit of optimizing everything. In any situation, I compare my options and take a strategic approach to find the best value and outcome. I do this whether I am choosing a fast-food meal, buying a fragrance, or managing a budget. Though this habit often amuses my friends and family, it is exactly what makes me highly efficient when managing resources or solving complex problems.

Additionally, I have a strong interest in entrepreneurship, which stemmed from dropshipping jewelry in high school. This first experience taught me a lot about sales and management. Today, I am seriously interested in digital marketing. I am looking forward to launching a real project in this field soon.

Regarding my hobbies, football is a very important part of my life. I play five-a-side football with my team every week and lead them as captain. This role has taught me as much about people management and resource distribution as any professional experience.

I will finish my co-op program and get my degree in the near future. I am eagerly awaiting new career opportunities.`,
  title: "Computer Engineer",
  location: "Paris, France",
  phone: "",
  linkedin_url: "https://www.linkedin.com/in/-a39a571ab/",
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
    title: "Software Development Engineer (Apprentice - DevSecOps)",
    company: "Thales LAS France",
    location: "Rungis, France",
    start_date: "2023-09-01",
    end_date: "2026-08-31",
    is_current: false,
    description: `Development and Automation (DevSecOps)
-DevSecOps Pipeline Design ("Faulty Projects"): Creation of an automated test environment to evaluate the relevance of vulnerability scanning tools (Semgrep, SonarQube, Grype, GitLab DepScan).
-Data Centralization: Integration and aggregation of analysis reports into the DefectDojo security dashboard.
-Infrastructure & Cloud: Pipeline deployment on isolated Kubernetes (K8s) clusters and Azure VM management (provisioning and security).
-Development: Automation of internal tool inventory via Python scripts.

Governance, Risk and Compliance (GRC)
-ISO 27001 Standard: Steering compliance with security standards and producing audit evidence.
-Asset Management: Development of Python scripts interacting with Azure APIs for automated inventory of resources (VMs, DBaaS, users), published as detailed reporting pages via GitLab Pages for complete IT visibility.
-Security Approval: Application of security best practices imposed by the IT department within the support team.
-Threat Modeling: Creation of attack scenarios using Cyber Kill Chain and MITRE ATT&CK for each tool used by the team.
-Technical Documentation: Writing guides and creating architecture diagrams for the tools used.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/thales.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-ukm",
    user_id: "user-djaga",
    title: "Research Assistant in Artificial Intelligence",
    company: "Universiti Kebangsaan Malaysia (UKM)",
    location: "Malaysia",
    start_date: "2025-07-01",
    end_date: "2025-09-30",
    is_current: false,
    description: `Government Project: Contribution to a major state project aimed at developing sovereign AI for Malaysia.
Research and Design: Writing the theoretical framework for the "IA-Warisan" project, a native Malaysian AI.
Academic Excellence: Research work conducted at the country's second-best university.`,
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
    company: "Pallavi Boutique",
    location: "Saint-Denis, La Réunion",
    start_date: "2023-06-01",
    end_date: "2023-08-31",
    is_current: false,
    description: `Sales performance: Generation of an average turnover of €800 per day.
Management: Supervision and organization of the work of a team of 3 people.
Financial management: Budget steering, cash flow monitoring, and daily cash management.
Marketing and Sales: Shelving and creation of promotional offers tailored to the clientele.
Logistics: Complete management of stocks and supplies.`,
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
    description: `Contract management: Verification of insurance contract compliance for companies and individuals (controlling dates and signatures).
Customer relations: Following up with clients to correct errors and complete non-compliant files.
Productivity: Full processing and validation of 1,000 insurance files over the period.
Human Resources: Payroll management and assistance with HR administrative tasks.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/mutex.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-4",
    user_id: "user-djaga",
    title: "Event Coordinator and Youth Counselor",
    company: "Centre Social l'Amandier",
    location: "Vigneux-sur-Seine, France",
    start_date: "2020-06-01",
    end_date: "2021-09-30",
    is_current: false,
    description: `Event project management: Complete organization of city festivals for local children.
Animation and Supervision: Daily care and supervision of children. Developed strong listening and interpersonal skills.
Budget management: Planning activities within the allocated budget.
Activity creation: Research, development, and animation of workshops.
Teamwork: Personnel coordination for events.`,
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
    degree: "Engineering Degree (Master's) - Specialization in Networks and Security",
    school: "Efrei Paris",
    field_of_study: "Networks & Security",
    start_date: "2023-09-01",
    end_date: "2026-06-30",
    is_current: false,
    location: "Villejuif, France",
    description: `Cloud & Infrastructure: Instance deployment on AWS (subnets, multi-zone VLANs, S3 buckets). Orchestration management with Docker Swarm and Portainer.
Cybersecurity: Securing virtual machines. Malware analysis in isolated environment (sandbox). Configuration of secure network parks.
DevOps: Creation of complete CI/CD pipelines with Jenkins and Docker.
Artificial Intelligence: Comparison and testing of machine learning algorithms (Random Forest, SVM, K-Means).`,
    grade: null,
    logo_url: "images/logos/efrei.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "edu-2",
    user_id: "user-djaga",
    degree: "Bachelor's in MIASHS (Mathematics and Computer Science) - [2 years completed]",
    school: "Paris 1 Panthéon-Sorbonne",
    field_of_study: "Human Sciences & Mathematics",
    start_date: "2020-09-01",
    end_date: "2023-06-30",
    is_current: false,
    location: "Paris, France",
    description: `Applied Mathematics: Learning mathematical cryptography, probability, and statistics.
Algebra and Calculus: Numerical data manipulation, vector calculus, and complex system solving.
Economics and Analysis: Study of macroeconomic theories (Keynes, Adam Smith) and writing analyses on market dynamics.`,
    grade: null,
    logo_url: "images/logos/paris1.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaProjectsEN: Project[] = [
  {
    id: "proj-mimirian",
    user_id: "user-djaga",
    name: "Project Manager - Mimirian Platform",
    description: "Led a student project to create Mimirian, a sovereign digital investigation platform for law enforcement agencies.\n- Defined features, developed the launch strategy, and searched for partners.\n- Directed the design of the 'Blind Alert' innovation to enable secure collaboration between investigators without revealing case contents.\n- Prepared oral defenses and official project presentation, including a promotional video.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "Shield",
    order: 1,
    technologies: ["Management", "Strategy", "Innovation", "Digital Sovereignty"],
    features: ["Project Management", "Blind Alert Design", "Launch Strategy"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-al-warisan",
    user_id: "user-djaga",
    name: "Co-author & Research Assistant - AI Project 'AL WARISAN'",
    description: "Wrote a theoretical framework for the 'Al Warisan' project, commissioned by the Malaysian government to create a sovereign artificial intelligence.\n- International research collaboration between Universiti Kebangsaan Malaysia and Efrei Paris.\n- Co-author of the scientific paper 'Testing Criteria for AI Models: A Case Study of AI Warisan Project'.\n- Presented the project at the 17th International Conference on ICONI 2025 in Okinawa, Japan.",
    url_demo: "https://iconi.org/program_book",
    url_github: "/docs/projects/iconi2025-program.pdf",
    url_image: null,
    project_icon: "Brain",
    order: 2,
    technologies: ["AI", "Research", "Theoretical Framework", "Data Science"],
    features: ["Scientific Writing", "International Collaboration", "ICONI 2025 Presentation"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-faulty-thales",
    user_id: "user-djaga",
    name: "DevSecOps Project Lead - 'Faulty Projects' (Thales)",
    description: "Autonomous Agile management, including the creation of User Stories and Epics.\n- Created multi-language projects (Python, Node.js, JS) on GitLab with 4 levels of code injection (aggressive, moderate, low, clean) to evaluate static analysis tools (Semgrep, SonarQube, Grype, GitLab DepScan).\n- Implemented a central project ('CCC') acting as an orchestrator to automatically trigger security scans in all child projects.\n- Executed analyses via a specific GitLab Runner deployed in a dedicated Kubernetes cluster to ensure maximum isolation of malicious code.\n- Automated retrieval of analysis reports by the central project and direct import into the DefectDojo security dashboard.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "Settings",
    order: 3,
    technologies: ["DevSecOps", "GitLab CI", "Kubernetes", "Semgrep", "SonarQube", "DefectDojo"],
    features: ["Agile Methodology", "Scan Automation", "K8s Cluster Isolation"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-portfolia",
    user_id: "user-djaga",
    name: "Functional Auditor & GRC - Portfolia.fr Project",
    description: "Performed a cybersecurity audit for the Portfolia.fr SaaS platform based on ISO 27017 (Cloud Security) and OWASP ASVS standards.\n- Served as a functional auditor and key intermediary for management, conducting interviews and evaluating security governance.\n- Formulated field findings and participated in risk mapping. Identified critical vulnerabilities (lack of MFA, insecure JWT token storage, lack of SAST/DAST controls).\n- Developed prioritized strategic recommendations to fix application flaws and harden the cloud infrastructure hosted on DigitalOcean.",
    url_demo: "https://portfolia.fr",
    url_github: null,
    url_image: null,
    project_icon: "ClipboardCheck",
    order: 4,
    technologies: ["GRC", "Security Audit", "ISO 27017", "OWASP ASVS", "Cloud Security"],
    features: ["Risk Mapping", "Functional Audit", "Infra Recommendations"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-iso27001-thales",
    user_id: "user-djaga",
    name: "Security Accreditation & ISO 27001 Standard (Thales)",
    description: "Led the compliance process for the Support team according to the ISO 27001 security standard.\n- Applied security directives imposed by the IT department (DSI).\n- Collected and produced the necessary evidence for security audits.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "CheckCircle",
    order: 5,
    technologies: ["ISO 27001", "Compliance", "GRC", "Security Audit"],
    features: ["Compliance Management", "Security Evidence Collection"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-dropshipping",
    user_id: "user-djaga",
    name: "E-commerce (Dropshipping)",
    description: "Launched and managed a jewelry boutique via the Snapchat social network.\n- Generated a turnover of €500.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "ShoppingBag",
    order: 6,
    technologies: ["E-commerce", "Snapchat Marketing", "Sales"],
    features: ["Store Launch", "Sales Management"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-vel-express",
    user_id: "user-djaga",
    name: "Vel Express - Digital Catering",
    description: "Preparation and sale of Indian specialties via the Snapchat social network.\n- Generated a turnover of €1,000.",
    url_demo: "/docs/projects/menu-vel-express.pdf",
    url_github: null,
    url_image: null,
    project_icon: "Utensils",
    order: 7,
    technologies: ["Operations", "Sales", "Digital Marketing"],
    features: ["Operational Management", "Snapchat Marketing"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const djagaSkillsEN: Skill[] = [
  // ── RADAR AXES (ne pas modifier) ─────────────────────────
  { id: "radar-1", user_id: "user-djaga", name: "GRC",           category: "__radar__", level: "80",  years_experience: null, order: 1 },
  { id: "radar-2", user_id: "user-djaga", name: "Management",    category: "__radar__", level: "100", years_experience: null, order: 2 },
  { id: "radar-3", user_id: "user-djaga", name: "DevSecOps",     category: "__radar__", level: "70",  years_experience: null, order: 3 },
  { id: "radar-4", user_id: "user-djaga", name: "Infra & Cloud", category: "__radar__", level: "50",  years_experience: null, order: 4 },
  { id: "radar-5", user_id: "user-djaga", name: "Cybersecurity", category: "__radar__", level: "70",  years_experience: null, order: 5 },
  { id: "radar-6", user_id: "user-djaga", name: "AI",            category: "__radar__", level: "70",  years_experience: null, order: 6 },

  // ── 1. CONCEPT AND DOMAINS ───────────────────────────────
  { id: "c-1",  user_id: "user-djaga", name: "Cybersecurity",                                  category: "Concept and Domains", level: "70%", years_experience: null, order: 11 },
  { id: "c-2",  user_id: "user-djaga", name: "DevSecOps",                                      category: "Concept and Domains", level: "70%", years_experience: null, order: 12 },
  { id: "c-3",  user_id: "user-djaga", name: "Governance (GRC)",                               category: "Concept and Domains", level: "80%", years_experience: null, order: 13 },
  { id: "c-4",  user_id: "user-djaga", name: "Artificial Intelligence",                        category: "Concept and Domains", level: "70%", years_experience: null, order: 14 },
  { id: "c-5",  user_id: "user-djaga", name: "Networks",                                       category: "Concept and Domains", level: "75%", years_experience: null, order: 15 },
  { id: "c-6",  user_id: "user-djaga", name: "Asset Management",                               category: "Concept and Domains", level: "90%", years_experience: null, order: 16 },
  { id: "c-7",  user_id: "user-djaga", name: "Data Analysis (Statistics & Numerical Computing)", category: "Concept and Domains", level: "70%", years_experience: null, order: 17 },

  // ── 2. LANGUAGES ─────────────────────────────────────────
  { id: "l-1",  user_id: "user-djaga", name: "Python",                  category: "Languages", level: "85%", years_experience: null, order: 21 },
  { id: "l-2",  user_id: "user-djaga", name: "Bash",                    category: "Languages", level: "80%", years_experience: null, order: 22 },
  { id: "l-3",  user_id: "user-djaga", name: "YAML",                    category: "Languages", level: "85%", years_experience: null, order: 23 },
  { id: "l-4",  user_id: "user-djaga", name: "Prompt Engineering (AI)", category: "Languages", level: "95%", years_experience: null, order: 24 },

  // ── 3. CLOUD & DEVOPS ────────────────────────────────────
  { id: "cd-1", user_id: "user-djaga", name: "AWS",                                        category: "Cloud & DevOps", level: "70%", years_experience: null, order: 31 },
  { id: "cd-2", user_id: "user-djaga", name: "Azure",                                      category: "Cloud & DevOps", level: "65%", years_experience: null, order: 32 },
  { id: "cd-3", user_id: "user-djaga", name: "Terraform (Infrastructure as Code)",         category: "Cloud & DevOps", level: "60%", years_experience: null, order: 33 },
  { id: "cd-4", user_id: "user-djaga", name: "Docker",                                     category: "Cloud & DevOps", level: "75%", years_experience: null, order: 34 },
  { id: "cd-5", user_id: "user-djaga", name: "Kubernetes",                                 category: "Cloud & DevOps", level: "65%", years_experience: null, order: 35 },
  { id: "cd-6", user_id: "user-djaga", name: "GitLab CI (Pipeline Design)",                category: "Cloud & DevOps", level: "85%", years_experience: null, order: 36 },
  { id: "cd-7", user_id: "user-djaga", name: "Subnets & VLANs Configuration",              category: "Cloud & DevOps", level: "70%", years_experience: null, order: 37 },
  { id: "cd-8", user_id: "user-djaga", name: "VM & Hypervisor Management (VMware, VirtualBox)", category: "Cloud & DevOps", level: "65%", years_experience: null, order: 38 },

  // ── 4. SECURITY TOOLS ─────────────────────────────────────
  { id: "os-1", user_id: "user-djaga", name: "DefectDojo (Vulnerability Management)", category: "Security Tools", level: "85%", years_experience: null, order: 41 },
  { id: "os-2", user_id: "user-djaga", name: "Semgrep",                               category: "Security Tools", level: "88%", years_experience: null, order: 42 },
  { id: "os-3", user_id: "user-djaga", name: "SonarQube",                             category: "Security Tools", level: "82%", years_experience: null, order: 43 },
  { id: "os-4", user_id: "user-djaga", name: "Grype",                                 category: "Security Tools", level: "80%", years_experience: null, order: 44 },
  { id: "os-5", user_id: "user-djaga", name: "GitLab DepScan",                        category: "Security Tools", level: "80%", years_experience: null, order: 45 },
  { id: "os-6", user_id: "user-djaga", name: "Malware Analysis (Sandbox)",            category: "Security Tools", level: "75%", years_experience: null, order: 46 },

  // ── 5. BUSINESS & OPERATIONS ──────────────────────────────
  { id: "bo-1", user_id: "user-djaga", name: "Marketing & Commercial Strategy",                        category: "Business & Operations", level: "80%", years_experience: null, order: 51 },
  { id: "bo-2", user_id: "user-djaga", name: "Sales & Customer Relations",                              category: "Business & Operations", level: "85%", years_experience: null, order: 52 },
  { id: "bo-3", user_id: "user-djaga", name: "Financial Management (Cash flow, Budget, Cash register)", category: "Business & Operations", level: "82%", years_experience: null, order: 53 },
  { id: "bo-4", user_id: "user-djaga", name: "Logistics & Inventory Management",                        category: "Business & Operations", level: "80%", years_experience: null, order: 54 },
  { id: "bo-5", user_id: "user-djaga", name: "Contract & HR Management",                                category: "Business & Operations", level: "78%", years_experience: null, order: 55 },

  // ── 6. MANAGEMENT & LEADERSHIP ────────────────────────────
  { id: "ml-1", user_id: "user-djaga", name: "Project Management",                            category: "Management & Leadership", level: "95%", years_experience: null, order: 61 },
  { id: "ml-2", user_id: "user-djaga", name: "Team Management (Supervision & Coordination)", category: "Management & Leadership", level: "92%", years_experience: null, order: 62 },
  { id: "ml-3", user_id: "user-djaga", name: "Event Planning (Festivals & Workshops)",       category: "Management & Leadership", level: "90%", years_experience: null, order: 63 },
  { id: "ml-4", user_id: "user-djaga", name: "Microsoft Office (Word, Excel, OneNote, etc.)",              category: "Management & Leadership", level: "88%", years_experience: null, order: 64 },

  // ── 7. SOFT SKILLS ────────────────────────────────────────
  { id: "ss-1", user_id: "user-djaga", name: "Interpersonal Intelligence",       category: "Soft Skills", level: "98%", years_experience: null, order: 71 },
  { id: "ss-2", user_id: "user-djaga", name: "Interpersonal Ease & Networking",     category: "Soft Skills", level: "95%", years_experience: null, order: 72 },
  { id: "ss-3", user_id: "user-djaga", name: "Leadership & Autonomy",               category: "Soft Skills", level: "90%", years_experience: null, order: 73 },
  { id: "ss-4", user_id: "user-djaga", name: "Problem Analysis & Solving",         category: "Soft Skills", level: "88%", years_experience: null, order: 74 },
  { id: "ss-5", user_id: "user-djaga", name: "Intercultural Adaptability",          category: "Soft Skills", level: "92%", years_experience: null, order: 75 },
  { id: "ss-6", user_id: "user-djaga", name: "Rigor & Compliance",                  category: "Soft Skills", level: "90%", years_experience: null, order: 76 },
  { id: "ss-7", user_id: "user-djaga", name: "Technical Popularization",            category: "Soft Skills", level: "85%", years_experience: null, order: 77 },
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
    name: "History, Geography & Geopolitics",
    description: "I am very interested in these three fields. I enjoy doing detailed research to understand the evolution of the world and international issues.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-2",
    user_id: "user-djaga",
    icon: "⚽",
    name: "Football (Five-a-side)",
    description: "I play five-a-side football every week with my team. It's an essential moment of sport and relaxation for me.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-3",
    user_id: "user-djaga",
    icon: "🚀",
    name: "Entrepreneurship & Digital Marketing",
    description: "Creating projects interests me a lot. I am actively training in digital marketing to launch my next venture.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-4",
    user_id: "user-djaga",
    icon: "🚗",
    name: "Cars & Fragrances",
    description: "These are two worlds I am just beginning to explore, and they spark a lot of curiosity in me.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-5",
    user_id: "user-djaga",
    icon: "✈️",
    name: "Travel & Discovery",
    description: "I have already visited more than twenty countries around the world. My great goal is to set foot on every continent!",
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
