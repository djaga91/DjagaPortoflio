/**
 * Mapper pour convertir les noms de compétences en slugs Simple Icons
 * Utilisé pour générer les URLs Shields.io avec les logos Simple Icons
 *
 * Documentation Simple Icons : https://simpleicons.org/
 * API Shields.io : https://shields.io/badges
 *
 * Note: Certaines compétences "soft skills" n'ont pas de logo technique
 * et utilisent des icônes Lucide à la place (voir SkillIcon.tsx)
 */

/**
 * Liste des compétences considérées comme "soft skills" sans logo technique
 * Ces compétences utiliseront des icônes Lucide au lieu de logos Simple Icons
 */
export const SOFT_SKILLS_WITHOUT_TECH_LOGOS = [
  "gestion de projet",
  "project management",
  "management",
  "leadership",
  "communication",
  "teamwork",
  "collaboration",
  "agile",
  "scrum",
  "kanban",
  "méthodologie agile",
  "gestion d'équipe",
  "team management",
];

/**
 * Technologies sans logo Simple Icons qui utilisent des icônes Lucide
 */
export const TECH_WITHOUT_SIMPLE_ICONS = [
  "sql", // Pas de logo SQL générique dans Simple Icons
  "api",
  "apis",
  "rest",
  "rest api",
  "restful",
  "restful api",
];

/**
 * Mapping des noms de compétences vers les slugs Simple Icons
 * Format : { "nom compétence": "slug-simple-icons" }
 */
const SKILL_TO_SIMPLE_ICON_SLUG: Record<string, string> = {
  // Langages de programmation
  python: "python",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  java: "java",
  "c++": "cplusplus",
  cpp: "cplusplus",
  "c#": "csharp",
  csharp: "csharp",
  "c sharp": "csharp",
  go: "go",
  golang: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  r: "r",
  matlab: "matlab",

  // Frameworks Frontend
  react: "react",
  reactjs: "react",
  vue: "vue.js",
  vuejs: "vue.js",
  "vue.js": "vue.js",
  angular: "angular",
  svelte: "svelte",
  "next.js": "next.js",
  nextjs: "next.js",
  next: "next.js",
  nuxt: "nuxt.js",
  nuxtjs: "nuxt.js",
  "nuxt.js": "nuxt.js",

  // Frameworks Backend
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  node: "nodedotjs",
  express: "express",
  nestjs: "nestjs",
  django: "django",
  flask: "flask",
  fastapi: "fastapi",
  spring: "spring",
  laravel: "laravel",
  symfony: "symfony",
  rails: "rubyonrails",
  "ruby on rails": "rubyonrails",

  // Bases de données
  // Note: SQL n'a pas de logo Simple Icons dédié, utilise PostgreSQL comme fallback
  sql: "postgresql", // Pas de logo SQL dans Simple Icons, utilise PostgreSQL
  postgresql: "postgresql",
  postgres: "postgresql",
  mysql: "mysql",
  mongodb: "mongodb",
  mongo: "mongodb",
  redis: "redis",
  sqlite: "sqlite",
  oracle: "oracle",
  "sql server": "microsoftsqlserver",
  mssql: "microsoftsqlserver",
  cassandra: "apachecassandra",
  elasticsearch: "elasticsearch",
  neo4j: "neo4j",

  // Cloud & DevOps
  aws: "amazonaws",
  "amazon web services": "amazonaws",
  azure: "microsoftazure",
  "microsoft azure": "microsoftazure",
  gcp: "googlecloud",
  "google cloud": "googlecloud",
  "google cloud platform": "googlecloud",
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  terraform: "terraform",
  ansible: "ansible",
  jenkins: "jenkins",
  gitlab: "gitlab",
  github: "github",
  git: "git",
  "github actions": "githubactions",
  circleci: "circleci",
  "travis ci": "travisci",
  travisci: "travisci",

  // Outils & Bibliothèques
  pandas: "pandas",
  numpy: "numpy",
  tensorflow: "tensorflow",
  pytorch: "pytorch",
  "scikit-learn": "scikitlearn",
  scikitlearn: "scikitlearn",
  keras: "keras",
  jupyter: "jupyter",
  "jupyter notebook": "jupyter",
  jupyternotebook: "jupyter",
  jupyterlab: "jupyter",
  colab: "googlecolab",
  "google colab": "googlecolab",
  googlecolab: "googlecolab",
  graphql: "graphql",
  // Note: REST/API n'ont pas de logo Simple Icons dédié, seront gérés avec icônes Lucide
  // 'rest': 'rest', // Pas de logo REST dans Simple Icons
  // 'api': 'rest', // Pas de logo API dans Simple Icons
  apache: "apache",
  nginx: "nginx",
  rabbitmq: "rabbitmq",
  kafka: "apachekafka",
  "apache kafka": "apachekafka",

  // Frontend Tools
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  bootstrap: "bootstrap",
  webpack: "webpack",
  vite: "vite",
  rollup: "rollup.js",
  babel: "babel",

  // Mobile
  "react native": "react",
  reactnative: "react",
  flutter: "flutter",
  ionic: "ionic",
  xamarin: "xamarin",

  // Design
  figma: "figma",
  "adobe xd": "adobexd",
  adobexd: "adobexd",
  sketch: "sketch",
  photoshop: "adobephotoshop",
  illustrator: "adobeillustrator",
  invision: "invision",

  // Microsoft Office & Suite
  "microsoft office": "office",
  "microsoft office suite": "office",
  "office suite": "office",
  "ms office": "office",
  office: "office",
  excel: "excel",
  "microsoft excel": "excel",
  "ms excel": "excel",
  word: "microsoftword",
  "microsoft word": "microsoftword",
  "ms word": "microsoftword",
  powerpoint: "microsoftpowerpoint",
  "microsoft powerpoint": "microsoftpowerpoint",
  "ms powerpoint": "microsoftpowerpoint",
  outlook: "microsoftoutlook",
  "microsoft outlook": "microsoftoutlook",
  teams: "microsoftteams",
  "microsoft teams": "microsoftteams",
  sharepoint: "microsoftsharepoint",
  "microsoft sharepoint": "microsoftsharepoint",

  // Machine Learning & Data Science
  "machine learning": "tensorflow", // Pas d'icône spécifique ML, utilise TensorFlow
  ml: "tensorflow",
  "deep learning": "pytorch",
  "data science": "pandas",
  datascience: "pandas",
  "data analysis": "pandas",
  dataanalytics: "pandas",
  hadoop: "apachehadoop", // Peut ne pas exister, fallback géré
  "apache hadoop": "apachehadoop",

  // Autres
  linux: "linux",
  ubuntu: "ubuntu",
  debian: "debian",
  windows: "microsoft",
  macos: "apple",
  ios: "apple",
  android: "android",
  firebase: "firebase",
  supabase: "supabase",
  vercel: "vercel",
  netlify: "netlify",
  heroku: "heroku",
};

/**
 * Normalise le nom d'une compétence pour la recherche dans le mapping
 */
function normalizeSkillName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/g, "");
}

/**
 * Trouve le slug Simple Icons correspondant à une compétence
 *
 * @param skillName Nom de la compétence (ex: "Docker", "Python", "React.js")
 * @returns Slug Simple Icons ou null si non trouvé
 */
export function getSimpleIconSlug(skillName: string): string | null {
  if (!skillName || !skillName.trim()) {
    return null;
  }

  const normalized = normalizeSkillName(skillName);

  // 1. Recherche exacte d'abord (priorité maximale)
  if (SKILL_TO_SIMPLE_ICON_SLUG[normalized]) {
    return SKILL_TO_SIMPLE_ICON_SLUG[normalized];
  }

  // 2. Recherche de correspondance de mots complets (priorité haute)
  // Trie par longueur décroissante pour prioriser les correspondances les plus spécifiques
  const sortedEntries = Object.entries(SKILL_TO_SIMPLE_ICON_SLUG).sort(
    ([a], [b]) => b.length - a.length,
  );

  for (const [key, slug] of sortedEntries) {
    // Éviter les faux positifs : ne pas matcher sur des mots trop courts (< 3 caractères)
    // sauf si c'est une correspondance exacte ou si le mot entier correspond
    if (key.length < 3 && normalized !== key) {
      continue;
    }

    // Correspondance exacte de mot complet (avec limites de mots)
    const keyWords = key.split(/\s+/);

    // Si tous les mots de la clé sont présents dans le nom normalisé (ordre respecté)
    if (
      keyWords.every((kw, idx) => {
        const searchStart =
          idx === 0
            ? 0
            : normalized.indexOf(keyWords[idx - 1]) + keyWords[idx - 1].length;
        return normalized.indexOf(kw, searchStart) !== -1;
      })
    ) {
      return slug;
    }

    // Correspondance exacte de mot complet (le nom contient la clé comme mot complet)
    const wordBoundaryRegex = new RegExp(
      `\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    if (wordBoundaryRegex.test(normalized)) {
      return slug;
    }
  }

  // 3. Recherche partielle stricte (seulement si la clé fait au moins 4 caractères)
  // Pour éviter les faux positifs comme "r" dans "office"
  for (const [key, slug] of sortedEntries) {
    if (key.length >= 4) {
      // Le nom normalisé contient la clé comme sous-chaîne significative
      if (normalized.includes(key)) {
        return slug;
      }
    }
  }

  // 4. Si le nom normalisé ressemble déjà à un slug (pas d'espaces, tout en minuscules)
  const slugLike = normalized
    .replace(/\s+/g, "")
    .replace(/\./g, "dot")
    .replace(/-/g, "");
  if (SKILL_TO_SIMPLE_ICON_SLUG[slugLike]) {
    return SKILL_TO_SIMPLE_ICON_SLUG[slugLike];
  }

  return null;
}

/**
 * Génère l'URL Shields.io pour un badge avec logo Simple Icons
 *
 * @param skillName Nom de la compétence
 * @param options Options pour le badge (couleur, style, etc.)
 * @returns URL Shields.io ou null si le slug n'est pas trouvé
 */
export function getSimpleIconBadgeUrl(
  skillName: string,
  options: {
    logoColor?: string;
    label?: string;
    color?: string;
    style?: "flat" | "flat-square" | "plastic" | "for-the-badge";
  } = {},
): string | null {
  const slug = getSimpleIconSlug(skillName);
  if (!slug) {
    return null;
  }

  const {
    logoColor = "white",
    label = skillName,
    color = "3776AB", // Couleur par défaut (bleu Python)
    style = "flat",
  } = options;

  // Encoder le label pour l'URL
  const encodedLabel = encodeURIComponent(label);

  // Construire l'URL Shields.io
  // Format: https://img.shields.io/badge/-{label}-{color}?logo={slug}&logoColor={logoColor}&style={style}
  // Note: Pour les logos Microsoft, utiliser le format avec logoColor=white pour meilleure visibilité
  const logoColorParam = slug.startsWith("microsoft") ? "white" : logoColor;
  return `https://img.shields.io/badge/-${encodedLabel}-${color}?logo=${slug}&logoColor=${logoColorParam}&style=${style}`;
}

/**
 * Couleurs par défaut pour certaines technologies populaires
 */
const DEFAULT_COLORS: Record<string, string> = {
  python: "3776AB",
  javascript: "F7DF1E",
  typescript: "3178C6",
  react: "61DAFB",
  "vue.js": "4FC08D",
  angular: "DD0031",
  nodejs: "339933",
  docker: "2496ED",
  kubernetes: "326CE5",
  aws: "FF9900",
  azure: "0089D6",
  gcp: "4285F4",
  postgresql: "4169E1",
  mongodb: "47A248",
  redis: "DC382D",
  git: "F05032",
  github: "181717",
  gitlab: "FC6D26",
  terraform: "7B42BC",
  ansible: "EE0000",
  jenkins: "D24939",
  html5: "E34F26",
  css3: "1572B6",
  tailwindcss: "06B6D4",
  bootstrap: "7952B3",
  figma: "F24E1E",
  firebase: "FFCA28",
  vercel: "000000",
  netlify: "00C7B7",
  // Microsoft Office
  microsoft: "00A4EF",
  office: "D83B01",
  excel: "217346",
  microsoftword: "2B579A",
  microsoftpowerpoint: "D24726",
  microsoftoutlook: "0078D4",
  microsoftteams: "6264A7",
  microsoftsharepoint: "0078D4",
  // ML & Data Science
  tensorflow: "FF6F00",
  pytorch: "EE4C2C",
  pandas: "150458",
  jupyter: "F37626",
  numpy: "013243",
  scikitlearn: "F7931E",
  googlecolab: "F9AB00",
  csharp: "239120",
  apachehadoop: "66CCFF", // Couleur Apache si disponible
  // Note: SQL n'a pas de couleur car utilise icône Lucide (Database)
};

/**
 * Obtient la couleur par défaut pour une compétence
 */
export function getDefaultColor(skillName: string): string {
  const slug = getSimpleIconSlug(skillName);
  if (slug && DEFAULT_COLORS[slug]) {
    return DEFAULT_COLORS[slug];
  }
  return "3776AB"; // Bleu par défaut
}
