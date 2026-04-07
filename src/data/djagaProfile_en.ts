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

At Thales, I work as a Software Development Engineer. I started with software development and DevOps tasks. I noticed that my team needed help with security. I decided to fill this gap. This was not planned, but it became one of my biggest strengths. Today, I easily work in both software development and cybersecurity. My engineering school strengthened this technical foundation through many practical networking and security projects.

Outside of work, I am a very curious person. History and geopolitics fascinate me. I enjoy researching topics deeply. For example, learning that Alaska was Russian before being sold to the United States for $7.2 million will make me research the topic for hours. More recently, I discovered a real passion for cars and fragrances.

I also have a habit of optimizing everything. In any situation, I compare and optimize my options to find the best value. I do this whether I am choosing a fast-food meal, buying a fragrance, or managing a budget. This habit often amuses my friends and family. However, it is exactly what makes me highly efficient when managing resources or solving complex problems.

I have a strong interest in entrepreneurship. I started by dropshipping jewelry. This first experience taught me a lot about sales and management. Today, I am seriously interested in digital marketing. I want to start a real project in this field.

Soccer is a very important part of my life. I play 5-a-side soccer with my team every week. I am the team captain. This role has taught me as much about people management as any professional experience.

I will finish my co-op program and get my degree very soon. I am currently open to new career opportunities.`,
  title: "Computer Engineer",
  location: "Paris, France",
  phone: "",
  linkedin_url: "https://www.linkedin.com/in/djaganadane/",
  github_url: "https://github.com/djaga91",
  portfolio_url: "",
  profile_picture_url: "/legacy_html/images/moi.jpg",
  completeness: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const djagaExperiencesEN: Experience[] = [
  {
    id: "exp-1",
    user_id: "user-djaga",
    title: "Work-Study Software Development Engineer (DevSecOps)",
    company: "Thales LAS France",
    location: "Rungis, France",
    start_date: "2023-09-01",
    end_date: "2026-08-31",
    is_current: true,
    description: `Development and Automation (DevSecOps)
-DevSecOps Pipeline Design ("Faulty Projects"): Creation of an automated test environment to evaluate the relevance of vulnerability scanning tools (Semgrep, SonarQube, Grype, GitLab DepScan).
-Data Centralization: Integration and aggregation of analysis reports into the DefectDojo security dashboard.
-Infrastructure & Cloud: Pipeline deployment on isolated Kubernetes (K8s) clusters and Azure VM management (provisioning and security).
-Development: Automation of internal tool inventory via Python scripts.

Governance, Risk and Compliance (GRC)
-ISO 27001 Standard: Steering compliance with security standards and producing audit evidence.
-Asset Management: Development of Python scripts for automated inventory of tools and software, ensuring complete visibility of the IT park.
-Security Approval: Application of security best practices imposed by the IT department within the support team.
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
    end_date: "2026-08-31",
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
    end_date: "2022-06-30",
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

export const djagaProjectsEN: Project[] = [];

export const djagaSkillsEN: Skill[] = [
  // --- RADAR CHART AXES (First 5) ---
  { id: "radar-1", user_id: "user-djaga", name: "Management & Soft Skills", category: "Management and Soft Skills", level: "100%", years_experience: null, order: 1 },
  { id: "radar-2", user_id: "user-djaga", name: "Governance and Compliance (GRC)", category: "Concept and Domains", level: "80%", years_experience: null, order: 2 },
  { id: "radar-3", user_id: "user-djaga", name: "DevSecOps & Analysis", category: "Concept and Domains", level: "60%", years_experience: null, order: 3 },
  { id: "radar-4", user_id: "user-djaga", name: "Languages & AI", category: "Languages", level: "70%", years_experience: null, order: 4 },
  { id: "radar-5", user_id: "user-djaga", name: "Cloud & Infrastructure", category: "Cloud and DevOps", level: "50%", years_experience: null, order: 5 },

  // --- 1. CONCEPT & DOMAINS ---
  { id: "c-1", user_id: "user-djaga", name: "Governance and Compliance (GRC)", category: "Concept and Domains", level: "90%", years_experience: null, order: 11 },
  { id: "c-2", user_id: "user-djaga", name: "DevSecOps & Analysis", category: "Concept and Domains", level: "85%", years_experience: null, order: 12 },
  { id: "c-3", user_id: "user-djaga", name: "Cybersecurity", category: "Concept and Domains", level: "88%", years_experience: null, order: 13 },
  { id: "c-4", user_id: "user-djaga", name: "Artificial Intelligence", category: "Concept and Domains", level: "85%", years_experience: null, order: 14 },
  { id: "c-5", user_id: "user-djaga", name: "Networks", category: "Concept and Domains", level: "75%", years_experience: null, order: 15 },
  { id: "c-6", user_id: "user-djaga", name: "Asset Management", category: "Concept and Domains", level: "90%", years_experience: null, order: 16 },
  { id: "c-7", user_id: "user-djaga", name: "Financial Management", category: "Concept and Domains", level: "82%", years_experience: null, order: 17 },

  // --- 2. LANGUAGES ---
  { id: "l-1", user_id: "user-djaga", name: "Python", category: "Languages", level: "85%", years_experience: null, order: 21 },
  { id: "l-2", user_id: "user-djaga", name: "Bash", category: "Languages", level: "80%", years_experience: null, order: 22 },
  { id: "l-3", user_id: "user-djaga", name: "YAML", category: "Languages", level: "85%", years_experience: null, order: 23 },
  { id: "l-4", user_id: "user-djaga", name: "Prompt Engineering (AI)", category: "Languages", level: "95%", years_experience: null, order: 24 },

  // --- 3. MANAGEMENT & SOFT SKILLS ---
  { id: "ms-1", user_id: "user-djaga", name: "Project Management", category: "Management and Soft Skills", level: "95%", years_experience: null, order: 31 },
  { id: "ms-2", user_id: "user-djaga", name: "Team Management", category: "Management and Soft Skills", level: "92%", years_experience: null, order: 32 },
  { id: "ms-3", user_id: "user-djaga", name: "Interpersonal Intelligence", category: "Management and Soft Skills", level: "98%", years_experience: null, order: 33 },
  { id: "ms-4", user_id: "user-djaga", name: "Event Planning", category: "Management and Soft Skills", level: "90%", years_experience: null, order: 34 },

  // --- 4. CLOUD & DEVOPS ---
  { id: "cd-1", user_id: "user-djaga", name: "AWS", category: "Cloud and DevOps", level: "70%", years_experience: null, order: 41 },
  { id: "cd-2", user_id: "user-djaga", name: "Azure", category: "Cloud and DevOps", level: "65%", years_experience: null, order: 42 },
  { id: "cd-3", user_id: "user-djaga", name: "Docker", category: "Cloud and DevOps", level: "75%", years_experience: null, order: 43 },
  { id: "cd-4", user_id: "user-djaga", name: "Kubernetes", category: "Cloud and DevOps", level: "65%", years_experience: null, order: 44 },
  { id: "cd-5", user_id: "user-djaga", name: "GitLab CI", category: "Cloud and DevOps", level: "85%", years_experience: null, order: 45 },

  // --- 5. SECURITY TOOLS ---
  { id: "os-1", user_id: "user-djaga", name: "DefectDojo", category: "Security Tools", level: "85%", years_experience: null, order: 51 },
  { id: "os-2", user_id: "user-djaga", name: "Semgrep", category: "Security Tools", level: "88%", years_experience: null, order: 52 },
  { id: "os-3", user_id: "user-djaga", name: "SonarQube", category: "Security Tools", level: "82%", years_experience: null, order: 53 },
  { id: "os-4", user_id: "user-djaga", name: "Grype", category: "Security Tools", level: "80%", years_experience: null, order: 54 }
];

export const djagaLanguagesEN: Language[] = [
  { id: "l1", user_id: "user-djaga", name: "French", level: "Native", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l2", user_id: "user-djaga", name: "English", level: "Fluent", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const djagaCertificationsEN: Certification[] = [];

export const djagaConfigEN: PortfolioConfig = {
  template: "template1",
  colorMode: "dark",
  theme: {
    primaryColor: "#FF8C42",
    fontFamily: "Inter"
  },
  layout: [
    { id: "hero", type: "hero", visible: true, order: 0 },
    { id: "about", type: "about", visible: true, order: 1 },
    { id: "experience", type: "experiences", visible: true, order: 2 },
    { id: "education", type: "education", visible: true, order: 3 },
    { id: "projects", type: "projects", visible: true, order: 4 },
    { id: "skills", type: "skills", visible: true, order: 5 },
    { id: "contact", type: "contact", visible: true, order: 6 }
  ],
  metadata: { version: 1 }
};
