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
  bio: `Ingénieur en informatique diplômé de l'Efrei Paris en spécialité Réseaux et Sécurité, j'ai construit en 3 ans d'alternance chez Thales LAS un parcours hybride entre développement, DevOps et cybersécurité. Initialement positionné sur des missions de développement, j'ai identifié un besoin non couvert sur le volet sécurité de mon équipe et fait de cette zone mon expertise opérationnelle.

Mon approche se caractérise par une démarche analytique systématique : comparer, pondérer et optimiser pour trouver la solution au meilleur ratio valeur/coût. Ce réflexe se traduit aussi bien dans la conception de pipelines DevSecOps que dans la conduite de projets entrepreneuriaux ou la gestion d'équipe.

En parallèle, j'ai mené plusieurs projets en autonomie : un audit de sécurité SaaS (Portfolia), un projet d'investigation numérique (Mimirian) et la co-rédaction d'un cadre de recherche sur l'IA souveraine pour la conférence ICONI 2025. Mon profil intègre aussi une dimension entrepreneuriale avec le lancement de deux activités : une boutique de bijoux en ligne et un concept de dark kitchen (Vel Express). J'ai géré ces projets de la conception à l'exécution, incluant le marketing et la logistique.

Côté soft skills, je suis capitaine d'une équipe de football amateur en 5 contre 5 un rôle qui m'a appris la gestion humaine et la prise de décision sous pression. Je nourris également un intérêt marqué pour la géopolitique, le marketing digital et l'analyse stratégique, autant de domaines qui structurent ma manière d'aborder les problèmes complexes.

Je ne suis pas le meilleur développeur mais je suis celui qui comprend la tech ET sait la rendre utile au business.`,
  title: "Ingénieur en informatique",
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

export const djagaExperiencesFR: Experience[] = [
  {
    id: "exp-1",
    user_id: "user-djaga",
    title: "Alternant en développement informatique",
    company: "Thales LAS France",
    location: "Rungis, France",
    start_date: "2023-09-01",
    end_date: "2026-08-31",
    is_current: false,
    description: `Sécurité et conformité

- Co-pilotage avec un ingénieur senior du respect des standards ISO 27001 sur une dizaine de contrôles : production des preuves d'audit, formalisation de la documentation et préparation à la certification.

- Construction de scénarios d'attaque selon les frameworks Cyber Kill Chain et MITRE ATT&CK pour chaque outil utilisé par l'équipe, permettant d'identifier en amont les vecteurs d'attaque.

- Renforcement de la sécurité de plusieurs machines virtuelles Linux via OpenSCAP, conformément aux référentiels de sécurité de l'équipe.

- Application des exigences de sécurité de la DSI dans les projets livrés par l'équipe pour répondre aux standards internes du groupe.


DevSecOps

- Conception d'un pipeline de test (Faulty Projects) pour valider la fiabilité des outils de sécurité utilisés par l'équipe de développement : Semgrep, SonarQube, Grype, GitLab DepScan et ClamAV. Le pipeline embarque du code volontairement vulnérable, exécute les scans des différents outils sur ce code, puis envoie les résultats vers DefectDojo, le gestionnaire de vulnérabilités de l'équipe. Couverture multi-langages (Python, Java) sur 3 niveaux de gravité (clean, modéré, agressif) pour vérifier la capacité de chaque outil à détecter les failles attendues. Exécution sur GitLab Runner dédié dans un cluster Kubernetes isolé pour garantir la sûreté du code malveillant.

- Création en binôme d'un pipeline GitLab CI/CD pour déployer DefectDojo, le gestionnaire central des vulnérabilités de l'équipe cyber. Cette automatisation garantit une mise en production rapide et l'équipe utilise toujours cette infrastructure au quotidien.

- Cartographie de l'architecture de Confluence et SonarQube, production de la documentation associée pour le partage de connaissances avec l'équipe.


Infrastructure et cloud

- Développement de scripts Python dédiés (un par type de ressource) interrogeant les API Azure pour inventorier automatiquement l'environnement : VMs, DBaaS, utilisateurs, groupes d'utilisateurs, coûts et instances de clusters. Publication des inventaires via GitLab Pages pour offrir à l'équipe une visibilité centralisée du parc cloud.

- Développement d'un script Python qui liste la centaine de tokens d'accès GitLab de l'équipe, identifie leur provenance et génère un tableau Excel exploitable pour les audits de sécurité.

- Création et configuration de machines virtuelles sur Azure pour répondre aux besoins spécifiques de l'équipe. Pilotage des déploiements applicatifs vers des clusters Kubernetes via GitLab. Mise en place d'un GitLab Runner dédié dans un cluster isolé pour exécuter les analyses de sécurité de Faulty Projects.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/thales.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-ukm",
    user_id: "user-djaga",
    title: "Assistant de recherche en intelligence artificielle",
    company: "Universiti Kebangsaan Malaysia (UKM)",
    location: "Bangi, Malaisie",
    start_date: "2025-07-01",
    end_date: "2025-10-31",
    is_current: false,
    description: `Co-rédaction du framework théorique du projet Al Warisan, une IA native malaisienne dédiée à la préservation et à la valorisation du patrimoine immatériel du pays (langues régionales, traditions orales, savoirs culturels).

Travaux publiés en tant que co-auteur officiel dans les actes de la conférence internationale ICONI 2025 (Okinawa, Japon), un congrès reconnu sur l'innovation et les technologies émergentes.

Collaboration directe avec une équipe de chercheurs malaisiens dans un environnement multilingue (anglais professionnel) sur les enjeux d'éthique, de gouvernance et de souveraineté technologique appliqués à l'IA.

Apport d'une perspective européenne sur les cadres réglementaires et méthodologiques de la recherche en IA.`,
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
    company: "Pallavi",
    location: "Saint-Denis, La Réunion",
    start_date: "2023-06-01",
    end_date: "2023-08-31",
    is_current: false,
    description: `Pilotage de la performance commerciale : suivi du chiffre d'affaires quotidien, conception d'offres promotionnelles ciblées et adaptation de la mise en rayon aux profils de clientèle.

Management d'équipe : organisation des plannings, répartition des missions et accompagnement opérationnel sur les périodes de forte affluence.

Gestion financière : pilotage du budget, suivi de la trésorerie et tenue quotidienne de la caisse.

Supply chain : gestion complète des stocks et des approvisionnements sur un assortiment varié, optimisation de la rotation produits pour limiter les ruptures.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/pallavi.webp",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-3",
    user_id: "user-djaga",
    title: "Assistant administratif et RH",
    company: "Mutex",
    location: "Châtillon, France",
    start_date: "2022-06-01",
    end_date: "2022-09-30",
    is_current: false,
    description: `Traitement et validation de plus de 1 000 dossiers d'assurance sur la durée de la mission, avec contrôle systématique de la conformité documentaire (signatures, dates, pièces justificatives).

Relation client par téléphone et email pour la régularisation des dossiers non conformes : relances, explications réglementaires et accompagnement à la complétion des documents manquants.

Appui aux opérations de paie et assistance sur des missions administratives RH transverses.

Acquisition d'une rigueur opérationnelle dans un environnement réglementé (assurance) et d'un sens du détail orienté zéro défaut.`,
    achievements: null,
    technologies: null,
    logo_url: "images/logos/mutex.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "exp-4",
    user_id: "user-djaga",
    title: "Coordinateur d'événements et animateur",
    company: "Centre Social l'Amandier",
    location: "Vigneux-sur-Seine, France",
    start_date: "2020-06-01",
    end_date: "2021-08-31",
    is_current: false,
    description: `Pilotage de projet événementiel : organisation complète des festivités municipales pour enfants (planification, logistique, coordination des intervenants).

Encadrement quotidien d'enfants et d'adolescents : développement d'une posture pédagogique fondée sur l'écoute, la patience et la compréhension des besoins individuels.

Gestion budgétaire : planification des activités dans le respect strict des enveloppes allouées par la collectivité.

Conception et animation d'ateliers thématiques sur mesure, de la phase de recherche à la mise en œuvre opérationnelle.

Coordination d'équipes pluridisciplinaires sur les temps forts événementiels.`,
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
    degree: "Diplôme d'ingénieur (Bac+5) — Spécialité Réseaux et Sécurité",
    school: "Efrei Paris",
    field_of_study: "Réseaux et Sécurité",
    start_date: "2023-09-01",
    end_date: "2026-06-30",
    is_current: false,
    location: "Villejuif, France",
    description: `Cybersécurité et conformité : audit et gestion des risques selon les normes ISO, architecture sécurisée, analyse de vulnérabilités, cyber défense et attaque, sécurité cloud, sécurité réseau, pentest, ethical hacking et cryptographie moderne appliquée.

Systèmes, infrastructures et cloud : déploiement sur AWS (sous-réseaux, VLAN multi-zones, S3), architectures sécurisées d'entreprise (DNS, LDAP, Apache, DHCP), administration Linux et Windows, supervision et qualité de service, virtualisation, bases de données, et orchestration de conteneurs (Docker, Kubernetes).

DevOps et développement : pipelines CI/CD complets (Jenkins, GitLab), delivery management, programmation multitâches, développement en C/C++ et web.

Soft skills et culture business : management, négociation, communication interpersonnelle pour chefs de projet, storytelling et rhétorique, innovation et marketing, sciences politiques, anglais professionnel (Public Speaking, Business Communication, Debating).`,
    grade: null,
    logo_url: "images/logos/efrei.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "edu-2",
    user_id: "user-djaga",
    degree: "Licence MIASHS (Mathématiques et Informatique appliquées aux sciences humaines et sociales)",
    school: "Université Paris 1 Panthéon-Sorbonne",
    field_of_study: "Mathématiques, Informatique et Sciences sociales",
    start_date: "2020-09-01",
    end_date: "2023-06-30",
    is_current: false,
    location: "Paris, France",
    description: `Deux années validées de licence MIASHS à l'Université Paris 1 Panthéon-Sorbonne, avant intégration du cycle ingénieur de l'Efrei Paris en septembre 2023.

Mathématiques appliquées : cryptographie mathématique, probabilités et statistiques.

Algèbre et calcul numérique : manipulation de données, calcul vectoriel et résolution de systèmes complexes.

Économie et analyse : étude des théories macroéconomiques (Keynes, Adam Smith) et rédaction d'analyses sur les dynamiques de marché.`,
    grade: null,
    logo_url: "images/logos/paris1.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const djagaProjectsFR: Project[] = [
  {
    id: "proj-faulty-thales",
    user_id: "user-djaga",
    name: "Initiative DevSecOps - Faulty Projects (Thales) · Janvier - Août 2026",
    description: `Pilotage en autonomie et en méthode Agile (User Stories, Epics) d'un pipeline de test conçu pour valider la fiabilité des outils de sécurité de l'équipe cyber.
→ Le pipeline embarque du code volontairement vulnérable, lance les scans de Semgrep, SonarQube, Grype, GitLab DepScan et ClamAV, puis remonte les résultats vers DefectDojo, le gestionnaire de vulnérabilités de l'équipe.
→ Couverture multi-langages (Python, Java) sur 3 niveaux de gravité (clean, modéré, agressif) pour mesurer la capacité réelle de chaque outil à détecter les failles attendues.
→ Résultat : un outil de contrôle qualité que l'équipe utilise toujours aujourd'hui pour fiabiliser sa chaîne de détection sur l'ensemble de ses projets.`,
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "ShieldAlert",
    order: 1,
    technologies: ["DevSecOps", "Agile", "Kubernetes", "GitLab CI"],
    features: ["Automatisation des scans", "Orchestration", "Environnement isolé"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-portfolia",
    user_id: "user-djaga",
    name: "Auditeur Fonctionnel et GRC - Projet Portfolia.fr · Janvier - Mars 2026",
    description: `Audit de cybersécurité de la plateforme SaaS Portfolia.fr, conduit selon les standards ISO 27017 (sécurité cloud) et OWASP ASVS (sécurité applicative).
→ Rôle d'auditeur fonctionnel et d'interlocuteur direct de la direction : conduite des entretiens, évaluation de la gouvernance de sécurité et restitution des constats.
→ Mise au jour de risques critiques que le client ignorait : absence de MFA, stockage non sécurisé des tokens JWT, absence de contrôles SAST/DAST. Construction d'une cartographie des risques pour les rendre lisibles par des décideurs non techniques.
→ Recommandations stratégiques hiérarchisées pour corriger les failles applicatives et durcir l'infrastructure cloud, transformant un angle mort de sécurité en plan d'action concret.`,
    url_demo: "https://portfolia.fr",
    url_github: null,
    url_image: null,
    project_icon: "ClipboardCheck",
    order: 2,
    technologies: ["GRC", "Audit de Sécurité", "ISO 27017", "OWASP ASVS", "Cloud Security"],
    features: ["Cartographie des risques", "Audit fonctionnel", "Recommandations infra"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-mimirian",
    user_id: "user-djaga",
    name: "Chef de Projet - Plateforme Mimirian · Octobre 2025 - Février 2026",
    description: `Pilotage d'un projet étudiant ambitieux : la conception de Mimirian, une plateforme d'investigation numérique souveraine destinée aux services d'enquête.
→ Définition de la vision produit, élaboration de la stratégie de lancement et démarchage de partenaires institutionnels.
→ Direction de la conception de l'innovation Blind Alert, un mécanisme permettant à plusieurs enquêteurs de collaborer sur des affaires sensibles sans révéler le contenu de leurs dossiers respectifs.
→ Résultat : un projet distingué par le jury pour sa qualité, porté de la vision initiale jusqu'à la soutenance et la vidéo de présentation officielle.`,
    url_demo: null,
    url_github: null,
    url_image: null,
    project_icon: "Shield",
    order: 3,
    technologies: ["Management", "Stratégie", "Innovation", "Souveraineté Numérique"],
    features: ["Gestion de projet", "Conception Blind Alert", "Stratégie de lancement"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-al-warisan",
    user_id: "user-djaga",
    name: "Co-auteur et Assistant de Recherche - Projet IA 'AL WARISAN' · Juillet - Octobre 2025",
    description: `Co-rédaction du framework théorique du projet Al Warisan, une intelligence artificielle souveraine commanditée par l'État malaisien pour préserver le patrimoine immatériel du pays.
→ Collaboration de recherche internationale entre l'Universiti Kebangsaan Malaysia (deuxième université nationale) et l'Efrei Paris.
→ Co-auteur officiel de l'article scientifique « Testing Criteria for AI Models: A Case Study of Al Warisan Project », publié dans les actes de la 17ème conférence internationale ICONI 2025 à Okinawa, au Japon.
→ Travaux portant sur les enjeux de gouvernance, d'éthique et de critères d'évaluation appliqués aux modèles d'IA souverains.`,
    url_demo: "https://iconi.org/program_book",
    url_github: "/docs/projects/iconi2025-program.pdf",
    url_image: null,
    project_icon: "Brain",
    order: 4,
    technologies: ["IA", "Recherche", "Framework Théorique", "Data Science"],
    features: ["Rédaction scientifique", "Collaboration internationale", "Présentation ICONI 2025"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-entrepreneuriat",
    user_id: "user-djaga",
    name: "Entrepreneuriat & Commerce Digital",
    description: `Lancement et gestion en autonomie de deux activités commerciales, de la conception au pilotage opérationnel.

Boutique de bijoux en ligne · 2019
→ Création et gestion complète d'une boutique e-commerce.
→ Développement d'une clientèle et élaboration d'une stratégie de marketing digital.
→ Chiffre d'affaires généré : 500 €.

Vel Express — Restauration digitale · 2022
→ Lancement d'une activité de préparation et vente de spécialités indiennes à la demande.
→ Pilotage des opérations, de la logistique et de la relation client.
→ Chiffre d'affaires généré : 1 000 €.`,
    url_demo: "/docs/projects/menu-vel-express.pdf",
    url_github: null,
    url_image: null,
    project_icon: "Briefcase",
    order: 5,
    technologies: ["Entrepreneuriat", "Commerce Digital", "Gestion Opérationnelle", "Marketing"],
    features: ["Création d'activité", "Gestion commerciale", "Marketing digital"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const djagaSkillsFR: Skill[] = [
  // 🛡️ Cybersécurité et Gouvernance
  { id: "skill-1", user_id: "user-djaga", name: "Gouvernance, Risques et Conformité (GRC)", category: "Cybersécurité et Gouvernance" },
  { id: "skill-2", user_id: "user-djaga", name: "Cybersécurité", category: "Cybersécurité et Gouvernance" },
  { id: "skill-3", user_id: "user-djaga", name: "ISO 27001 / 27017", category: "Cybersécurité et Gouvernance" },
  { id: "skill-4", user_id: "user-djaga", name: "OWASP ASVS", category: "Cybersécurité et Gouvernance" },
  { id: "skill-5", user_id: "user-djaga", name: "MITRE ATT&CK", category: "Cybersécurité et Gouvernance" },
  { id: "skill-6", user_id: "user-djaga", name: "Cyber Kill Chain", category: "Cybersécurité et Gouvernance" },
  { id: "skill-7", user_id: "user-djaga", name: "Threat Modeling", category: "Cybersécurité et Gouvernance" },
  { id: "skill-8", user_id: "user-djaga", name: "Hardening Linux (OpenSCAP)", category: "Cybersécurité et Gouvernance" },
  { id: "skill-9", user_id: "user-djaga", name: "Analyse de malware (sandbox)", category: "Cybersécurité et Gouvernance" },

  // ⚙️ DevSecOps et Pipelines
  { id: "skill-10", user_id: "user-djaga", name: "DevSecOps", category: "DevSecOps et Pipelines" },
  { id: "skill-11", user_id: "user-djaga", name: "GitLab CI/CD", category: "DevSecOps et Pipelines" },
  { id: "skill-12", user_id: "user-djaga", name: "DefectDojo", category: "DevSecOps et Pipelines" },
  { id: "skill-13", user_id: "user-djaga", name: "Semgrep", category: "DevSecOps et Pipelines" },
  { id: "skill-14", user_id: "user-djaga", name: "SonarQube", category: "DevSecOps et Pipelines" },
  { id: "skill-15", user_id: "user-djaga", name: "Grype", category: "DevSecOps et Pipelines" },
  { id: "skill-16", user_id: "user-djaga", name: "GitLab DepScan", category: "DevSecOps et Pipelines" },
  { id: "skill-17", user_id: "user-djaga", name: "ClamAV", category: "DevSecOps et Pipelines" },

  // ☁️ Cloud et Infrastructure
  { id: "skill-18", user_id: "user-djaga", name: "AWS", category: "Cloud et Infrastructure" },
  { id: "skill-19", user_id: "user-djaga", name: "Azure", category: "Cloud et Infrastructure" },
  { id: "skill-21", user_id: "user-djaga", name: "Kubernetes", category: "Cloud et Infrastructure" },
  { id: "skill-22", user_id: "user-djaga", name: "Réseaux", category: "Cloud et Infrastructure" },
  { id: "skill-23", user_id: "user-djaga", name: "Asset Management", category: "Cloud et Infrastructure" },

  // 💻 Développement et Data
  { id: "skill-24", user_id: "user-djaga", name: "Python", category: "Développement et Data" },
  { id: "skill-25", user_id: "user-djaga", name: "Bash", category: "Développement et Data" },
  { id: "skill-26", user_id: "user-djaga", name: "YAML", category: "Développement et Data" },
  { id: "skill-28", user_id: "user-djaga", name: "Notions IA et Machine Learning", category: "Développement et Data" },
  { id: "skill-29", user_id: "user-djaga", name: "Prompt Engineering et IA appliquée au développement", category: "Développement et Data" },

  // 🎯 Soft Skills
  { id: "skill-30", user_id: "user-djaga", name: "Gestion de projet", category: "Pilotage et Soft Skills" },
  { id: "skill-32", user_id: "user-djaga", name: "Vulgarisation technique", category: "Pilotage et Soft Skills" },
  { id: "skill-33", user_id: "user-djaga", name: "Intelligence relationnelle", category: "Pilotage et Soft Skills" },
  { id: "skill-34", user_id: "user-djaga", name: "Adaptabilité interculturelle", category: "Pilotage et Soft Skills" },
  { id: "skill-38", user_id: "user-djaga", name: "Marketing et stratégie commerciale", category: "Pilotage et Soft Skills" },
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
    name: "Histoire, géographie et géopolitique",
    description: "Une vraie obsession. J'aime tirer le fil. Apprendre que l'Alaska est passé de la Russie aux États-Unis pour 7,2 millions de dollars, et c'est parti pour deux heures de lecture sur les recompositions territoriales du XIXe siècle. Cette curiosité nourrit ma façon d'aborder n'importe quel sujet : remonter aux causes avant de juger les effets.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-2",
    user_id: "user-djaga",
    icon: "✈️",
    name: "Voyages et découverte culturelle",
    description: "Plus d'une vingtaine de pays au compteur, et un objectif clair : poser le pied sur chaque continent. Voyager, c'est ma façon préférée d'apprendre. Comprendre une culture de l'intérieur, par les conversations, la nourriture, les odeurs. Bien plus parlant qu'un livre.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-3",
    user_id: "user-djaga",
    icon: "🚀",
    name: "Entrepreneuriat et marketing digital",
    description: "J'aime créer des choses, monter des projets, voir si ça prend. Deux ventures déjà lancées (boutique en ligne, restauration à la demande), avec leurs réussites et leurs galères. Aujourd'hui je me forme au marketing digital pour bâtir un projet plus solide la prochaine fois.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-4",
    user_id: "user-djaga",
    icon: "⚽",
    name: "Football",
    description: "Capitaine d'une équipe en 5 contre 5, je joue chaque semaine. C'est mon moment à moi, mais c'est aussi là que je travaille des trucs très concrets : organiser, motiver, prendre une décision en deux secondes quand tout va vite. Ce qui fonctionne sur le terrain fonctionne souvent au bureau.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "int-5",
    user_id: "user-djaga",
    icon: "🚗",
    name: "Automobile et parfumerie",
    description: "Deux univers que je découvre par leur esthétique. Le design d'une voiture, ses lignes, la manière dont elle occupe l'espace. Le flacon d'un parfum, sa composition olfactive, l'équilibre d'une note de tête et d'un fond. Ce sont des univers où la beauté se construit avec une vraie exigence, et c'est ça qui m'attire.",
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
