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

Mon péché mignon, c'est le theorycraft. Peu importe la situation choisir un menu au fast-food, acheter un parfum, allouer un budget  je vais systématiquement comparer, peser, optimiser pour trouver le meilleur rapport plaisir-coût. Ce réflexe, qui amuse souvent mon entourage, est en réalité ce qui me rend efficace dès qu'il s'agit de gérer des ressources ou de trouver une solution à un problème contraint.

J'ai aussi un goût prononcé pour l'entrepreneuriat. J'ai commencé par faire du dropshipping sur des bijoux une première expérience qui m'a beaucoup appris sur la vente et la gestion. Aujourd'hui, je m'intéresse sérieusement au marketing digital, avec l'envie de me lancer dans quelque chose de concret dans ce domaine.

Le football occupe une place à part dans ma vie. Je pourrais y jouer 24h sur 24 sans m'en lasser et toutes les semaines, je retrouve mon équipe pour des matchs en 5 contre 5. J'en suis le capitaine, un rôle qui m'a autant appris sur la gestion humaine que n'importe quelle expérience professionnelle.

Je termine mon alternance et obtiens mon diplôme prochainement. Je suis ouvert à de nouvelles opportunités.`,
  title: "Ingénieur en informatique",
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
-Asset Management : Développement de scripts Python pour l'inventaire automatisé des outils et logiciels, assurant une visibilité complète du parc informatique.
-Homologation de sécurité : Application des bonnes pratiques de sécurité imposées par la DSI au sein de l'équipe support.
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
    end_date: "2026-08-31",
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
    end_date: "2022-06-30",
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

export const djagaProjectsFR: Project[] = [];

export const djagaSkillsFR: Skill[] = [
  // --- AXES DU GRAPHIQUE RADAR (Les 5 premiers) ---
  { id: "radar-1", user_id: "user-djaga", name: "Management & Soft Skills", category: "Management et Soft Skills", level: "100%", years_experience: null, order: 1 },
  { id: "radar-2", user_id: "user-djaga", name: "Gouvernance et Conformité (GRC)", category: "Concept et Domaines", level: "80%", years_experience: null, order: 2 },
  { id: "radar-3", user_id: "user-djaga", name: "DevSecOps & Analyse", category: "Concept et Domaines", level: "60%", years_experience: null, order: 3 },
  { id: "radar-4", user_id: "user-djaga", name: "Langages & IA", category: "Langages", level: "70%", years_experience: null, order: 4 },
  { id: "radar-5", user_id: "user-djaga", name: "Cloud & Infrastructure", category: "Cloud & DevOps", level: "50%", years_experience: null, order: 5 },

  // --- 1. CONCEPT & DOMAINES ---
  { id: "c-1", user_id: "user-djaga", name: "Gouvernance et Conformité (GRC)", category: "Concept et Domaines", level: "90%", years_experience: null, order: 11 },
  { id: "c-2", user_id: "user-djaga", name: "DevSecOps & Analyse", category: "Concept et Domaines", level: "85%", years_experience: null, order: 12 },
  { id: "c-3", user_id: "user-djaga", name: "Cybersécurité", category: "Concept et Domaines", level: "88%", years_experience: null, order: 13 },
  { id: "c-4", user_id: "user-djaga", name: "Intelligence Artificielle", category: "Concept et Domaines", level: "85%", years_experience: null, order: 14 },
  { id: "c-5", user_id: "user-djaga", name: "Réseaux (Networks)", category: "Concept et Domaines", level: "75%", years_experience: null, order: 15 },
  { id: "c-6", user_id: "user-djaga", name: "Asset Management", category: "Concept et Domaines", level: "90%", years_experience: null, order: 16 },
  { id: "c-7", user_id: "user-djaga", name: "Gestion financière", category: "Concept et Domaines", level: "82%", years_experience: null, order: 17 },

  // --- 2. LANGAGES ---
  { id: "l-1", user_id: "user-djaga", name: "Python", category: "Langages", level: "85%", years_experience: null, order: 21 },
  { id: "l-2", user_id: "user-djaga", name: "Bash", category: "Langages", level: "80%", years_experience: null, order: 22 },
  { id: "l-3", user_id: "user-djaga", name: "YAML", category: "Langages", level: "85%", years_experience: null, order: 23 },
  { id: "l-4", user_id: "user-djaga", name: "Prompt Engineering (IA)", category: "Langages", level: "95%", years_experience: null, order: 24 },

  // --- 3. MANAGEMENT & SOFT SKILLS ---
  { id: "ms-1", user_id: "user-djaga", name: "Gestion de projet", category: "Management et Soft Skills", level: "95%", years_experience: null, order: 31 },
  { id: "ms-2", user_id: "user-djaga", name: "Management d'équipe", category: "Management et Soft Skills", level: "92%", years_experience: null, order: 32 },
  { id: "ms-3", user_id: "user-djaga", name: "Intelligence relationnelle", category: "Management et Soft Skills", level: "98%", years_experience: null, order: 33 },
  { id: "ms-4", user_id: "user-djaga", name: "Événementiel", category: "Management et Soft Skills", level: "90%", years_experience: null, order: 34 },

  // --- 4. CLOUD & DEVOPS ---
  { id: "cd-1", user_id: "user-djaga", name: "AWS", category: "Cloud & DevOps", level: "70%", years_experience: null, order: 41 },
  { id: "cd-2", user_id: "user-djaga", name: "Azure", category: "Cloud & DevOps", level: "65%", years_experience: null, order: 42 },
  { id: "cd-3", user_id: "user-djaga", name: "Docker", category: "Cloud & DevOps", level: "75%", years_experience: null, order: 43 },
  { id: "cd-4", user_id: "user-djaga", name: "Kubernetes", category: "Cloud & DevOps", level: "65%", years_experience: null, order: 44 },
  { id: "cd-5", user_id: "user-djaga", name: "GitLab CI", category: "Cloud & DevOps", level: "85%", years_experience: null, order: 45 },

  // --- 5. OUTILS DE SÉCURITÉ ---
  { id: "os-1", user_id: "user-djaga", name: "DefectDojo", category: "Outils de Sécurité", level: "85%", years_experience: null, order: 51 },
  { id: "os-2", user_id: "user-djaga", name: "Semgrep", category: "Outils de Sécurité", level: "88%", years_experience: null, order: 52 },
  { id: "os-3", user_id: "user-djaga", name: "SonarQube", category: "Outils de Sécurité", level: "82%", years_experience: null, order: 53 },
  { id: "os-4", user_id: "user-djaga", name: "Grype", category: "Outils de Sécurité", level: "80%", years_experience: null, order: 54 }
];

export const djagaLanguagesFR: Language[] = [
  { id: "l1", user_id: "user-djaga", name: "Français", level: "Natif", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "l2", user_id: "user-djaga", name: "Anglais", level: "Courant", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const djagaCertificationsFR: Certification[] = [];

export const djagaConfigFR: PortfolioConfig = {
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
