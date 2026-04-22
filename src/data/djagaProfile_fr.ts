import { User, Profile, Experience, Education, Project, Skill, Language, Certification, PortfolioConfig } from "../types";

export const djagaUserFR: User = {
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

export const djagaProfileFR: Profile = {
  id: "profile-djaga",
  user_id: "user-djaga",
  bio: `Bonjour, je m'appelle Djaganadane Mourougayane, j'ai 23 ans et je termine un cycle ingénieur en alternance à l'Efrei, spécialité Réseaux et Sécurité.

Mon parcours illustre assez bien cette idée. Chez Thales, où j'évolue en tant qu'ingénieur développement informatique, j'ai démarré sur des missions de développement et de DevOps. En observant les besoins de mon équipe, j'ai identifié un manque sur la sécurité et j'ai décidé de le combler. Ce n'était pas prévu, mais c'est devenu l'une de mes plus grandes forces : aujourd'hui, je navigue naturellement entre développement et cybersécurité. L'école a consolidé ce socle technique avec de nombreux projets concrets en réseaux et sécurité.

En dehors du travail, je suis quelqu'un que la curiosité ne quitte jamais. L'histoire et la géopolitique me fascinent depuis longtemps pas de manière académique, mais parce que je ne peux pas m'empêcher de creuser. Apprendre que l'Alaska était russe avant d'être vendu aux États-Unis pour 7,2 millions de dollars, c'est le genre de détail qui me fait passer deux heures à remonter le fil. Plus récemment, je me suis découvert une vraie passion pour les voitures et les parfums.

Ma force, c'est le theorycraft. Peu importe la situation choisir un menu au fast-food, acheter un parfum, allouer un budget  je vais systématiquement comparer, peser, optimiser pour trouver le meilleur rapport plaisir-coût. Ce réflexe, qui amuse souvent mon entourage, est en réalité ce qui me rend efficace dès qu'il s'agit de gérer des ressources ou de trouver une solution à un problème contraint.

J'ai aussi un goût prononcé pour l'entrepreneuriat. J'ai commencé par faire du dropshipping sur des bijoux une première expérience qui m'a beaucoup appris sur la vente et la gestion. Aujourd'hui, je m'intéresse sérieusement au marketing digital, avec l'envie de me lancer dans quelque chose de concret dans ce domaine.

Le football occupe une place à part dans ma vie. Je pourrais y jouer 24h sur 24 sans m'en lasser et toutes les semaines, je retrouve mon équipe pour des matchs en 5 contre 5. J'en suis le capitaine, un rôle qui m'a autant appris sur la gestion humaine que n'importe quelle expérience professionnelle.

Je termine mon alternance et obtiens mon diplôme prochainement. Je suis ouvert à de nouvelles opportunités.`,
  title: "Ingénieur en informatique",
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

export const djagaExperiencesFR: Experience[] = [
  {
    id: "exp-1",
    user_id: "user-djaga",
    title: "Alternant en développement informatique (DevSecOps)",
    company: "Thales LAS France",
    location: "Rungis, France",
    start_date: "2023-09-01",
    end_date: "2026-08-31",
    is_current: false,
    description: `Développement et Automatisation (DevSecOps)
-Conception d'un pipeline DevSecOps (Projet "Faulty Projects") : Création d'un environnement de test automatisé pour évaluer la pertinence d'outils de scan de vulnérabilités (Semgrep, SonarQube, Grype, GitLab DepScan).
-Centralisation des données : Intégration et agrégation des rapports d'analyses vers le dashboard de sécurité DefectDojo.
-Infrastructure & Cloud : Déploiement de pipelines sur des clusters Kubernetes (K8s) isolés et gestion de VM sur Azure (provisionnement et sécurisation).
-Développement : Automatisation de l'inventaire des outils internes via des scripts Python.

Gouvernance, Risques et Conformité (GRC)
-Norme ISO 27001 : Pilotage du respect des standards de sécurité et production des preuves d'audit.
-Asset Management : Développement de scripts Python exploitant les API Azure pour l'inventaire automatisé des ressources (VM, DBaaS, utilisateurs), publiés sous forme de pages de reporting détaillées via GitLab Pages pour une visibilité complète du parc informatique.
-Homologation de sécurité : Application des bonnes pratiques de sécurité imposées par la DSI au sein de l'équipe support.
-Threat Modeling : Création de scénarios d'attaque basés sur la Cyber Kill Chain et MITRE ATT&CK pour chaque outil utilisé par l'équipe.
-Documentation technique : Rédaction de guides et création de schémas d’architecture des outils utilisés.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/thales.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-ukm",
    user_id: "user-djaga",
    title: "Assistant de Recherche en Intelligence Artificielle",
    company: "Universiti Kebangsaan Malaysia (UKM)",
    location: "Malaisie",
    start_date: "2025-07-01",
    end_date: "2025-09-30",
    is_current: false,
    description: `Projet gouvernemental : Contribution à un projet d'État majeur visant à développer une intelligence artificielle souveraine pour la Malaisie.
Recherche et conception : Rédaction du framework théorique pour le projet "IA-Warisan", une IA native malaisienne.
Excellence académique : Travail de recherche réalisé au sein de la deuxième meilleure université du pays.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/ukm.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-2",
    user_id: "user-djaga",
    title: "Gérant de boutique",
    company: "Boutique Pallavi",
    location: "Saint-Denis, La Réunion",
    start_date: "2023-06-01",
    end_date: "2023-08-31",
    is_current: false,
    description: `Performance commerciale : Génération d'un chiffre d'affaires moyen de 800 € par jour.
Management : Encadrement et organisation du travail d'une équipe de 3 personnes.
Gestion financière : Pilotage du budget, suivi de la trésorerie et tenue quotidienne de la caisse.
Marketing et Vente : Mise en rayon et création d'offres promotionnelles adaptées à la clientèle.
Logistique : Gestion complète des stocks et des approvisionnements.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/pallavi.webp",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-3",
    user_id: "user-djaga",
    title: "Assistant Administratif et RH",
    company: "Mutex",
    location: "Châtillon, France",
    start_date: "2022-06-01",
    end_date: "2022-09-30",
    is_current: false,
    description: `Gestion des contrats : Vérification de la conformité des contrats d'assurance pour les entreprises et les particuliers (contrôle des dates et des signatures).
Relation client : Relance des clients pour corriger les erreurs et compléter les dossiers non conformes.
Productivité : Traitement complet et validation de 1 000 dossiers d'assurance sur la période.
Ressources Humaines : Gestion de la paie et assistance sur les missions administratives RH.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/mutex.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-4",
    user_id: "user-djaga",
    title: "Coordinateur d'événements et Animateur",
    company: "Centre Social l'Amandier",
    location: "Vigneux-sur-Seine, France",
    start_date: "2020-06-01",
    end_date: "2021-09-30",
    is_current: false,
    description: `Gestion de projet événementiel : Organisation complète des fêtes de la ville pour les enfants de la commune.
Animation et Encadrement : Prise en charge des enfants au quotidien. Développement d'une forte capacité d'écoute et de compréhension des personnes.
Gestion budgétaire : Planification des activités en respectant le budget alloué.
Création d'activités : Recherche, élaboration et animation d'ateliers.
Travail en équipe : Coordination du personnel pour les événements.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/amandier.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaEducationsFR: Education[] = [
  {
    id: "edu-1",
    user_id: "user-djaga",
    degree: "Diplôme d'Ingénieur (Bac +5) - Spécialité Réseaux et Sécurité",
    school: "Efrei Paris",
    field_of_study: "Réseaux & Sécurité",
    start_date: "2023-09-01",
    end_date: "2026-06-30",
    is_current: false,
    location: "Villejuif, France",
    description: `Cloud & Infrastructure : Déploiement d'instances sur AWS (sous-réseaux, VLAN multi-zones, buckets S3). Gestion de l'orchestration avec Docker Swarm et Portainer.
Cybersécurité : Sécurisation de machines virtuelles. Analyse de malwares en environnement isolé (sandbox). Configuration de parcs réseaux sécurisés.
DevOps : Création de pipelines CI/CD complets avec Jenkins et Docker.
Intelligence Artificielle : Comparaison et test d'algorithmes de machine learning (Random Forest, SVM, K-Means).`,
    grade: null,
    logo_url: "images/logos/efrei.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "edu-2",
    user_id: "user-djaga",
    degree: "Licence MIASHS (Mathématiques et Informatique) - [2 ans effectués]",
    school: "Université Paris 1 Panthéon-Sorbonne",
    field_of_study: "Sciences Humaines & Mathématiques",
    start_date: "2020-09-01",
    end_date: "2023-06-30",
    is_current: false,
    location: "Paris, France",
    description: `Mathématiques appliquées : Apprentissage de la cryptographie mathématique, des probabilités et des statistiques.
Algèbre et calcul : Manipulation de données numériques, calcul vectoriel et résolution de systèmes complexes.
Économie et analyse : Étude des théories macroéconomiques (Keynes, Adam Smith) et rédaction d'analyses sur les dynamiques de marché.`,
    grade: null,
    logo_url: "images/logos/paris1.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaProjectsFR: Project[] = [
  {
    id: "proj-mimirian",
    user_id: "user-djaga",
    name: "Chef de Projet - Plateforme Mimirian",
    description: "Pilotage d'un projet étudiant pour créer Mimirian, une plateforme d'investigation numérique souveraine pour les services d'enquête.\n- Définition des fonctionnalités, élaboration de la stratégie de lancement et recherche de partenaires.\n- Direction de la conception de l'innovation 'Blind Alert' pour permettre une collaboration sécurisée entre enquêteurs sans révéler le contenu des dossiers.\n- Préparation des soutenances orales et présentation officielle du projet avec réalisation d'une vidéo promotionnelle.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "Shield",
    order: 1,
    technologies: ["Management", "Stratégie", "Innovation", "Souveraineté Numérique"],
    features: ["Gestion de projet", "Conception Blind Alert", "Stratégie de lancement"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-al-warisan",
    user_id: "user-djaga",
    name: "Co-auteur et Assistant de Recherche - Projet IA 'AL WARISAN'",
    description: "Rédaction d'un framework théorique pour le projet 'Al Warisan', commandité par l'État malaisien pour créer une intelligence artificielle souveraine.\n- Collaboration de recherche internationale entre l'Universiti Kebangsaan Malaysia et l'Efrei Paris.\n- Co-auteur de l'article scientifique 'Testing Criteria's for Al Model: A Case Study of Al Warisan Project'.\n- Présentation du projet à la 17ème conférence internationale ICONI 2025 à Okinawa, au Japon.",
    url_demo: "https://iconi.org/program_book",
    url_github: "/docs/projects/iconi2025-program.pdf",
    url_image: null,
    project_icon: "Brain",
    order: 2,
    technologies: ["IA", "Recherche", "Framework Théorique", "Data Science"],
    features: ["Rédaction scientifique", "Collaboration internationale", "Présentation ICONI 2025"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-faulty-thales",
    user_id: "user-djaga",
    name: "Pilote de Projet DevSecOps - 'Faulty Projects' (Thales)",
    description: "Gestion autonome en méthode Agile avec création des User Stories et des Epics.\n- Création de projets multi-langages (Python, Node.js, JS) sur GitLab avec 4 niveaux d'injection de code (agressif, modéré, faible, sain) pour évaluer les outils d'analyse (Semgrep, SonarQube, Grype, GitLab DepScan).\n- Mise en place d'un projet central ('CCC') agissant comme chef d'orchestre pour déclencher automatiquement les scans de sécurité dans tous les projets enfants.\n- Exécution des analyses via un GitLab Runner spécifique, déployé dans un cluster Kubernetes dédié, pour garantir une isolation maximale du code malveillant.\n- Récupération automatisée des rapports d'analyse par le projet central et importation directe vers le dashboard de sécurité DefectDojo.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "Settings",
    order: 3,
    technologies: ["DevSecOps", "GitLab CI", "Kubernetes", "Semgrep", "SonarQube", "DefectDojo"],
    features: ["Méthode Agile", "Automation de scans", "Isolation en cluster K8s"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-portfolia",
    user_id: "user-djaga",
    name: "Auditeur Fonctionnel et GRC - Projet Portfolia.fr",
    description: "Réalisation d'un audit de cybersécurité pour la plateforme SaaS Portfolia.fr, en s'appuyant sur les standards ISO 27017 (Sécurité Cloud) et OWASP ASVS.\n- Rôle d'auditeur fonctionnel et d'intermédiaire privilégié auprès de la direction pour la conduite des entretiens et l'évaluation de la gouvernance de sécurité.\n- Formulation des constats de terrain et participation à la création d'une cartographie des risques. Identification de vulnérabilités critiques (absence de MFA, stockage non sécurisé des tokens JWT, manque de contrôles SAST/DAST).\n- Élaboration de recommandations stratégiques hiérarchisées pour corriger les failles applicatives et durcir l'infrastructure cloud hébergée sur DigitalOcean.",
    url_demo: "https://portfolia.fr",
    url_github: null,
    url_image: null,
    project_icon: "ClipboardCheck",
    order: 4,
    technologies: ["GRC", "Audit de Sécurité", "ISO 27017", "OWASP ASVS", "Cloud Security"],
    features: ["Cartographie des risques", "Audit fonctionnel", "Recommandations infra"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-iso27001-thales",
    user_id: "user-djaga",
    name: "Homologation de Sécurité et Norme ISO 27001 (Thales)",
    description: "Pilotage de la mise en conformité de l'équipe Support selon la norme de sécurité ISO 27001.\n- Application des directives de sécurité imposées par la DSI.\n- Collecte et production des preuves nécessaires pour les audits de sécurité.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "CheckCircle",
    order: 5,
    technologies: ["ISO 27001", "Conformité", "GRC", "Audit"],
    features: ["Pilotage conformité", "Collecte de preuves de sécurité"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-dropshipping",
    user_id: "user-djaga",
    name: "E-commerce (Dropshipping)",
    description: "Lancement et gestion complète d'une boutique de bijoux via le réseau social Snapchat.\n- Génération d'un chiffre d'affaires de 500 €.",
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "ShoppingBag",
    order: 6,
    technologies: ["E-commerce", "Snapchat Marketing", "Sales"],
    features: ["Lancement de boutique", "Gestion commerciale"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-vel-express",
    user_id: "user-djaga",
    name: "Vel Express - Restauration digitale",
    description: "Préparation et vente de spécialités indiennes via le réseau social Snapchat.\n- Génération d'un chiffre d'affaires de 1 000 €.",
    url_demo: "/docs/projects/menu-vel-express.pdf",
    url_github: null,
    url_image: null,
    project_icon: "Utensils",
    order: 7,
    technologies: ["Operations", "Ventes", "Marketing Digital"],
    features: ["Gestion opérationnelle", "Marketing Snapchat"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const djagaSkillsFR: Skill[] = [
  // ── AXES DU RADAR (ne pas modifier) ──────────────────────
  { id: "radar-1", user_id: "user-djaga", name: "GRC",            category: "__radar__", level: "80",  years_experience: null, order: 1 },
  { id: "radar-2", user_id: "user-djaga", name: "Management",     category: "__radar__", level: "100", years_experience: null, order: 2 },
  { id: "radar-3", user_id: "user-djaga", name: "DevSecOps",      category: "__radar__", level: "70",  years_experience: null, order: 3 },
  { id: "radar-4", user_id: "user-djaga", name: "Infra & Cloud",  category: "__radar__", level: "50",  years_experience: null, order: 4 },
  { id: "radar-5", user_id: "user-djaga", name: "Cybersécurité",  category: "__radar__", level: "70",  years_experience: null, order: 5 },
  { id: "radar-6", user_id: "user-djaga", name: "IA",             category: "__radar__", level: "70",  years_experience: null, order: 6 },

  // ── 1. CONCEPT & DOMAINES ───────────────────────────────
  { id: "c-1",  user_id: "user-djaga", name: "Cybersécurité",                               category: "Concept et Domaines", level: "70%", years_experience: null, order: 11 },
  { id: "c-2",  user_id: "user-djaga", name: "DevSecOps",                                   category: "Concept et Domaines", level: "70%", years_experience: null, order: 12 },
  { id: "c-3",  user_id: "user-djaga", name: "Gouvernance (GRC)",                           category: "Concept et Domaines", level: "80%", years_experience: null, order: 13 },
  { id: "c-4",  user_id: "user-djaga", name: "Intelligence Artificielle",                   category: "Concept et Domaines", level: "70%", years_experience: null, order: 14 },
  { id: "c-5",  user_id: "user-djaga", name: "Réseaux",                                     category: "Concept et Domaines", level: "75%", years_experience: null, order: 15 },
  { id: "c-6",  user_id: "user-djaga", name: "Asset Management",                            category: "Concept et Domaines", level: "90%", years_experience: null, order: 16 },
  { id: "c-7",  user_id: "user-djaga", name: "Analyse de données (Stats & Calcul numérique)", category: "Concept et Domaines", level: "70%", years_experience: null, order: 17 },

  // ── 2. LANGAGES ─────────────────────────────────────────
  { id: "l-1",  user_id: "user-djaga", name: "Python",                category: "Langages", level: "85%", years_experience: null, order: 21 },
  { id: "l-2",  user_id: "user-djaga", name: "Bash",                  category: "Langages", level: "80%", years_experience: null, order: 22 },
  { id: "l-3",  user_id: "user-djaga", name: "YAML",                  category: "Langages", level: "85%", years_experience: null, order: 23 },
  { id: "l-4",  user_id: "user-djaga", name: "Prompt Engineering (IA)", category: "Langages", level: "95%", years_experience: null, order: 24 },

  // ── 3. CLOUD & DEVOPS ────────────────────────────────────
  { id: "cd-1", user_id: "user-djaga", name: "AWS",                                         category: "Cloud & DevOps", level: "70%", years_experience: null, order: 31 },
  { id: "cd-2", user_id: "user-djaga", name: "Azure",                                       category: "Cloud & DevOps", level: "65%", years_experience: null, order: 32 },
  { id: "cd-3", user_id: "user-djaga", name: "Terraform (Infrastructure as Code)",          category: "Cloud & DevOps", level: "60%", years_experience: null, order: 33 },
  { id: "cd-4", user_id: "user-djaga", name: "Docker",                                      category: "Cloud & DevOps", level: "75%", years_experience: null, order: 34 },
  { id: "cd-5", user_id: "user-djaga", name: "Kubernetes",                                  category: "Cloud & DevOps", level: "65%", years_experience: null, order: 35 },
  { id: "cd-6", user_id: "user-djaga", name: "GitLab CI (Design de Pipelines)",             category: "Cloud & DevOps", level: "85%", years_experience: null, order: 36 },
  { id: "cd-7", user_id: "user-djaga", name: "Configuration Subnets & VLANs",               category: "Cloud & DevOps", level: "70%", years_experience: null, order: 37 },
  { id: "cd-8", user_id: "user-djaga", name: "Gestion de VMs & Hyperviseurs (VMware, VirtualBox)", category: "Cloud & DevOps", level: "65%", years_experience: null, order: 38 },

  // ── 4. OUTILS DE SÉCURITÉ ──────────────────────────────────
  { id: "os-1", user_id: "user-djaga", name: "DefectDojo (Vulnerability Management)", category: "Outils de Sécurité", level: "85%", years_experience: null, order: 41 },
  { id: "os-2", user_id: "user-djaga", name: "Semgrep",                               category: "Outils de Sécurité", level: "88%", years_experience: null, order: 42 },
  { id: "os-3", user_id: "user-djaga", name: "SonarQube",                             category: "Outils de Sécurité", level: "82%", years_experience: null, order: 43 },
  { id: "os-4", user_id: "user-djaga", name: "Grype",                                 category: "Outils de Sécurité", level: "80%", years_experience: null, order: 44 },
  { id: "os-5", user_id: "user-djaga", name: "GitLab DepScan",                        category: "Outils de Sécurité", level: "80%", years_experience: null, order: 45 },
  { id: "os-6", user_id: "user-djaga", name: "Analyse de Malware (Sandbox)",          category: "Outils de Sécurité", level: "75%", years_experience: null, order: 46 },

  // ── 5. BUSINESS & OPÉRATIONS ───────────────────────────────
  { id: "bo-1", user_id: "user-djaga", name: "Marketing & Stratégie commerciale",             category: "Business & Opérations", level: "80%", years_experience: null, order: 51 },
  { id: "bo-2", user_id: "user-djaga", name: "Vente & Relation Client",                       category: "Business & Opérations", level: "85%", years_experience: null, order: 52 },
  { id: "bo-3", user_id: "user-djaga", name: "Gestion Financière (Trésorerie, Budget, Caisse)", category: "Business & Opérations", level: "82%", years_experience: null, order: 53 },
  { id: "bo-4", user_id: "user-djaga", name: "Logistique & Gestion de stocks",               category: "Business & Opérations", level: "80%", years_experience: null, order: 54 },
  { id: "bo-5", user_id: "user-djaga", name: "Gestion de Contrats & RH",                     category: "Business & Opérations", level: "78%", years_experience: null, order: 55 },

  // ── 6. MANAGEMENT & LEADERSHIP ─────────────────────────────
  { id: "ml-1", user_id: "user-djaga", name: "Gestion de Projet",                            category: "Management & Leadership", level: "95%", years_experience: null, order: 61 },
  { id: "ml-2", user_id: "user-djaga", name: "Management d'Équipe (Supervision & Coordination)", category: "Management & Leadership", level: "92%", years_experience: null, order: 62 },
  { id: "ml-3", user_id: "user-djaga", name: "Organisation d'Événements (Festivals & Ateliers)", category: "Management & Leadership", level: "90%", years_experience: null, order: 63 },
  { id: "ml-4", user_id: "user-djaga", name: "Pack Office (Word, Excel, OneNote, etc.)",                    category: "Management & Leadership", level: "88%", years_experience: null, order: 64 },

  // ── 7. SOFT SKILLS ────────────────────────────────────────
  { id: "ss-1", user_id: "user-djaga", name: "Intelligence relationnelle",       category: "Soft Skills", level: "98%", years_experience: null, order: 71 },
  { id: "ss-2", user_id: "user-djaga", name: "Aisance relationnelle & Networking", category: "Soft Skills", level: "95%", years_experience: null, order: 72 },
  { id: "ss-3", user_id: "user-djaga", name: "Leadership & Autonomie",            category: "Soft Skills", level: "90%", years_experience: null, order: 73 },
  { id: "ss-4", user_id: "user-djaga", name: "Analyse et résolution de problèmes", category: "Soft Skills", level: "88%", years_experience: null, order: 74 },
  { id: "ss-5", user_id: "user-djaga", name: "Adaptabilité interculturelle",       category: "Soft Skills", level: "92%", years_experience: null, order: 75 },
  { id: "ss-6", user_id: "user-djaga", name: "Rigueur & Conformité",               category: "Soft Skills", level: "90%", years_experience: null, order: 76 },
  { id: "ss-7", user_id: "user-djaga", name: "Vulgarisation technique",            category: "Soft Skills", level: "85%", years_experience: null, order: 77 },
];


export const djagaLanguagesFR: Language[] = [
  { id: "l1", user_id: "user-djaga", name: "Français", level: "Natif", code: "fr", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l2", user_id: "user-djaga", name: "Anglais", level: "Courant", code: "en", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l3", user_id: "user-djaga", name: "Tamoul", level: "Langue Maternelle", code: "ta", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l4", user_id: "user-djaga", name: "Espagnol", level: "Débutant (Compréhension)", code: "es", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const djagaCertificationsFR: Certification[] = [
  {
    id: "cert-1",
    user_id: "user-djaga",
    name: "Certification Stormshield",
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
    name: "MOOC GdP - Gestion de Projet",
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

export const djagaInterestsFR = [
  {
    id: "int-1",
    user_id: "user-djaga",
    icon: "🌍",
    name: "Histoire, Géographie & Géopolitique",
    description: "Je suis très intéressé par ces trois domaines. J'aime faire des recherches détaillées pour comprendre l'évolution du monde et les enjeux internationaux.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-2",
    user_id: "user-djaga",
    icon: "⚽",
    name: "Football (Five)",
    description: "Je joue au foot à 5 toutes les semaines avec mon équipe. C'est un moment de sport et de détente essentiel pour moi.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-3",
    user_id: "user-djaga",
    icon: "🚀",
    name: "Entrepreneuriat & Marketing Digital",
    description: "La création de projets m'intéresse beaucoup. Je me forme activement au marketing digital pour lancer ma prochaine activité.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-4",
    user_id: "user-djaga",
    icon: "🚗",
    name: "Automobile & Parfumerie",
    description: "Ce sont deux univers que je commence tout juste à explorer et qui éveillent beaucoup ma curiosité.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-5",
    user_id: "user-djaga",
    icon: "✈️",
    name: "Voyages & Découverte",
    description: "J'ai déjà visité plus d'une vingtaine de pays à travers le monde. Mon grand but est de poser un pied sur chaque continent !",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaConfigFR: PortfolioConfig = {
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
