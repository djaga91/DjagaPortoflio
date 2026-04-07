/**
 * Utilitaires partagés pour les templates de portfolio
 */

/** Template 5 : ordre des colonnes pour les paires Formation|Certifications et Langues|Centres d'intérêt */
export type Template5ColumnOrder = {
  educationCertifications: "education_left" | "certifications_left";
  languagesInterests: "languages_left" | "interests_left";
};

/** Rôle typographique (templates 1–5) : titre hero, sous-titres, gros item, petit item, description */
export type FontRole = "titles" | "subtitles" | "item" | "itemSmall" | "body";

/** Polices par rôle (nom de famille CSS, preset ou custom) */
export type TemplateFontsConfig = {
  titles?: string;
  subtitles?: string;
  item?: string;
  itemSmall?: string;
  body?: string;
};

/** Police personnalisée importée par l'utilisateur */
export type CustomFontItem = {
  id: string;
  name: string;
  url: string;
};

export interface TemplateCustomization {
  colorTheme: "light" | "dark" | "blue" | "purple";
  fontFamily: "sans" | "serif" | "mono";
  /** Templates 1–5 : polices par rôle (titres, sous-titres, gros item, petit item, description). Valeur = id preset ou nom custom. */
  templateFonts?: TemplateFontsConfig;
  /** Polices importées par l'utilisateur (fichier .ttf/.otf) pour les templates 1–5 */
  customFonts?: CustomFontItem[];
  sections: Array<{
    id: string;
    label: string;
    visible: boolean;
  }>;
  projectsLayout: "grid" | "list";
  template5ColumnOrder?: Template5ColumnOrder;
  template6_colors?: Record<string, string>;
  /** Alias camelCase pour template6_colors (utilisé côté frontend) */
  template6Colors?: Record<string, string>;
  /** Ordre personnalisé des items par section */
  itemOrder?: Record<string, string[]>;
  cvId?: string | null;
  cvUrl?: string | null;
  lang?: "fr" | "en";
}

/** Identifiant des templates 1 à 5 */
export type Template1To5Id =
  | "template1"
  | "template2"
  | "template3"
  | "template4"
  | "template5";

/** Couleurs d'origine par template (palette par défaut avant personnalisation) */
export const ORIGINAL_TEMPLATE_COLORS: Record<
  Template1To5Id,
  Record<string, string>
> = {
  template1: {},
  template2: {},
  template3: {},
  template4: {},
  template5: {},
};

/** Polices prédéfinies (Google Fonts ou système). id = clé pour stockage, family = valeur font-family CSS. */
export const PRESET_FONTS: Array<{
  id: string;
  name: string;
  family: string;
  googleFontId?: string;
}> = [
  {
    id: "inter",
    name: "Inter",
    family: "Inter, system-ui, sans-serif",
    googleFontId: "Inter",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: '"Playfair Display", Georgia, serif',
    googleFontId: "Playfair+Display",
  },
  {
    id: "space_mono",
    name: "Space Mono",
    family: '"Space Mono", Menlo, monospace',
    googleFontId: "Space+Mono",
  },
  {
    id: "roboto",
    name: "Roboto",
    family: "Roboto, system-ui, sans-serif",
    googleFontId: "Roboto",
  },
  {
    id: "open_sans",
    name: "Open Sans",
    family: '"Open Sans", system-ui, sans-serif',
    googleFontId: "Open+Sans",
  },
  {
    id: "lato",
    name: "Lato",
    family: "Lato, system-ui, sans-serif",
    googleFontId: "Lato",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat, system-ui, sans-serif",
    googleFontId: "Montserrat",
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "Poppins, system-ui, sans-serif",
    googleFontId: "Poppins",
  },
  {
    id: "raleway",
    name: "Raleway",
    family: "Raleway, system-ui, sans-serif",
    googleFontId: "Raleway",
  },
  {
    id: "oswald",
    name: "Oswald",
    family: "Oswald, system-ui, sans-serif",
    googleFontId: "Oswald",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    family: "Merriweather, Georgia, serif",
    googleFontId: "Merriweather",
  },
  {
    id: "source_sans",
    name: "Source Sans 3",
    family: '"Source Sans 3", system-ui, sans-serif',
    googleFontId: "Source+Sans+3",
  },
  {
    id: "dm_sans",
    name: "DM Sans",
    family: '"DM Sans", system-ui, sans-serif',
    googleFontId: "DM+Sans",
  },
  {
    id: "manrope",
    name: "Manrope",
    family: "Manrope, system-ui, sans-serif",
    googleFontId: "Manrope",
  },
  {
    id: "outfit",
    name: "Outfit",
    family: "Outfit, system-ui, sans-serif",
    googleFontId: "Outfit",
  },
];

/** Retourne la font-family CSS pour un rôle (templates 1–5). Utilise templateFonts ou fallback sur fontFamily legacy. */
export function getFontFamilyForRole(
  customization: TemplateCustomization | undefined,
  role: FontRole,
): string {
  const fonts = customization?.templateFonts;
  const key = role;
  const value = fonts?.[key];
  if (value) {
    const preset = PRESET_FONTS.find((p) => p.id === value || p.name === value);
    if (preset) return preset.family;
    const custom = customization?.customFonts?.find(
      (c) => c.name === value || c.id === value,
    );
    if (custom) return `"${custom.name}", sans-serif`;
    return value.includes(",") ? value : `"${value}", sans-serif`;
  }
  return getFontClassToFamily(getFontClass(customization));
}

function getFontClassToFamily(fontClass: string): string {
  if (fontClass === "font-serif") return FONT_FRONTEND_TO_CSS.serif;
  if (fontClass === "font-mono") return FONT_FRONTEND_TO_CSS.mono;
  return FONT_FRONTEND_TO_CSS.sans;
}

/**
 * Vérifie si une section est visible selon la configuration
 */
export const isSectionVisible = (
  sectionId: string,
  customization?: TemplateCustomization,
): boolean => {
  if (!customization?.sections) return true; // Par défaut, tout est visible
  const section = customization.sections.find((s) => s.id === sectionId);
  return section?.visible ?? true;
};

/**
 * Obtient la classe CSS pour la typographie
 */
export const getFontClass = (customization?: TemplateCustomization): string => {
  const fontFamily = customization?.fontFamily || "sans";
  return fontFamily === "serif"
    ? "font-serif"
    : fontFamily === "mono"
      ? "font-mono"
      : "font-sans";
};

/**
 * Obtient le layout pour les projets
 */
export const getProjectsLayout = (
  customization?: TemplateCustomization,
): "grid" | "list" => {
  return customization?.projectsLayout || "grid";
};

/**
 * Obtient les classes CSS pour le layout projets
 */
export const getProjectsLayoutClasses = (
  customization?: TemplateCustomization,
): string => {
  const layout = getProjectsLayout(customization);
  return layout === "grid"
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
    : "flex flex-col gap-6";
};

/**
 * Obtient les sections dans l'ordre défini par la configuration
 */
export const getOrderedSections = (
  customization?: TemplateCustomization,
): Array<{
  id: string;
  label: string;
  visible: boolean;
}> => {
  if (!customization?.sections) {
    return [
      { id: "about", label: "À propos", visible: true },
      { id: "experiences", label: "Expériences", visible: true },
      { id: "education", label: "Formation", visible: true },
      { id: "projects", label: "Projets", visible: true },
      { id: "skills", label: "Compétences", visible: true },
      { id: "languages", label: "Langues", visible: true },
      { id: "certifications", label: "Certifications", visible: true },
      { id: "interests", label: "Centres d'intérêt", visible: true },
      { id: "contact", label: "Contact", visible: true },
    ];
  }
  return customization.sections;
};

/**
 * Obtient l'ordre d'affichage des sections selon la configuration
 * Retourne un objet qui mappe sectionId -> order (0, 1, 2, 3...)
 */
export const getSectionOrder = (
  customization?: TemplateCustomization,
): Record<string, number> => {
  if (!customization?.sections) {
    return {
      about: 0,
      experiences: 1,
      education: 2,
      projects: 3,
      skills: 4,
      languages: 5,
      certifications: 6,
      interests: 7,
      contact: 8,
    };
  }
  const order: Record<string, number> = {};
  customization.sections.forEach((section, index) => {
    order[section.id] = index;
  });
  return order;
};

/**
 * Ordre par défaut des sections (utilisé quand aucune config n'est fournie).
 */
const DEFAULT_SECTIONS_LIST = [
  { id: "about", label: "À propos", visible: true },
  { id: "experiences", label: "Expériences", visible: true },
  { id: "education", label: "Formation", visible: true },
  { id: "projects", label: "Projets", visible: true },
  { id: "skills", label: "Compétences", visible: true },
  { id: "languages", label: "Langues", visible: true },
  { id: "certifications", label: "Certifications", visible: true },
  { id: "interests", label: "Centres d'intérêt", visible: true },
  { id: "contact", label: "Contact", visible: true },
];

/**
 * Obtient les sections visibles dans l'ordre défini par la configuration.
 * L'ordre affiché = ordre dans customization.sections (celui de la barre de personnalisation),
 * pour que le drag-and-drop dans la toolbar se reflète immédiatement dans le template.
 */
export const getVisibleSectionsInOrder = (
  customization?: TemplateCustomization,
): Array<{
  id: string;
  label: string;
  visible: boolean;
}> => {
  if (
    !customization?.sections ||
    !Array.isArray(customization.sections) ||
    customization.sections.length === 0
  ) {
    return DEFAULT_SECTIONS_LIST;
  }

  // Utiliser l'ordre de customization.sections (celui défini par l'utilisateur dans la toolbar)
  return customization.sections.filter((section) => section.visible);
};

/**
 * CONVERSION BACKEND ↔ FRONTEND
 *
 * Le backend stocke fontFamily comme une string CSS complète : "Inter, system-ui, -apple-system, sans-serif"
 * Le frontend utilise des valeurs simples : "sans" | "serif" | "mono"
 */

// Mapping des polices CSS vers les valeurs frontend
const FONT_CSS_TO_FRONTEND: Record<string, "sans" | "serif" | "mono"> = {
  Inter: "sans",
  "system-ui": "sans",
  "-apple-system": "sans",
  "Playfair Display": "serif",
  Georgia: "serif",
  "Space Mono": "mono",
  Menlo: "mono",
};

// Mapping inverse : frontend → CSS
const FONT_FRONTEND_TO_CSS: Record<"sans" | "serif" | "mono", string> = {
  sans: "Inter, system-ui, -apple-system, sans-serif",
  serif: "Playfair Display, Georgia, serif",
  mono: "Space Mono, Menlo, monospace",
};

/**
 * Convertit une fontFamily CSS (backend) vers une valeur frontend (sans/serif/mono)
 */
export const cssFontToFrontend = (
  cssFont?: string | null,
): "sans" | "serif" | "mono" => {
  if (!cssFont) return "sans";

  // Extraire le premier nom de police (avant la première virgule)
  const firstFont = cssFont.split(",")[0].trim();

  // Chercher dans le mapping
  for (const [cssKey, frontendValue] of Object.entries(FONT_CSS_TO_FRONTEND)) {
    if (firstFont.includes(cssKey)) {
      return frontendValue;
    }
  }

  // Par défaut, si on trouve "serif" ou "mono" dans la string, on peut deviner
  if (cssFont.toLowerCase().includes("serif")) return "serif";
  if (cssFont.toLowerCase().includes("mono")) return "mono";

  return "sans";
};

/**
 * Convertit une valeur frontend (sans/serif/mono) vers une fontFamily CSS (backend)
 */
export const frontendFontToCSS = (
  frontendFont: "sans" | "serif" | "mono",
): string => {
  return FONT_FRONTEND_TO_CSS[frontendFont] || FONT_FRONTEND_TO_CSS.sans;
};

/**
 * Convertit colorMode (backend: 'light' | 'dark') vers colorTheme (frontend: 'light' | 'dark' | 'blue' | 'purple')
 */
export const colorModeToColorTheme = (
  colorMode?: string | null,
): "light" | "dark" | "blue" | "purple" => {
  if (!colorMode) return "light";
  // Pour l'instant, on ne supporte que light/dark dans le backend
  // Les thèmes blue/purple sont uniquement frontend
  return colorMode === "dark" ? "dark" : "light";
};

/**
 * Convertit colorTheme (frontend) vers colorMode (backend)
 */
export const colorThemeToColorMode = (
  colorTheme: "light" | "dark" | "blue" | "purple",
): "light" | "dark" => {
  // Les thèmes blue/purple sont convertis en light pour le backend
  return colorTheme === "dark" ? "dark" : "light";
};

const SECTION_LABELS_EN: Record<string, string> = {
  hero: "Hero",
  about: "About",
  experiences: "Experiences",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  languages: "Languages",
  certifications: "Certifications",
  interests: "Interests",
  contact: "Contact",
};

const SECTION_LABELS_FR: Record<string, string> = {
  hero: "Hero",
  about: "À propos",
  experiences: "Expériences",
  education: "Formation",
  projects: "Projets",
  skills: "Compétences",
  languages: "Langues",
  certifications: "Certifications",
  interests: "Centres d'intérêt",
  contact: "Contact",
};

/**
 * Mapping des IDs de sections backend vers les labels frontend
 */
export const getSectionLabels = (lang: "fr" | "en" = "fr"): Record<string, string> => {
  return lang === "en" ? SECTION_LABELS_EN : SECTION_LABELS_FR;
};

/** Ordre par défaut des sections (inclut langues, certifications, centres d'intérêt) */
const DEFAULT_SECTION_IDS = [
  "about",
  "experiences",
  "education",
  "projects",
  "skills",
  "languages",
  "certifications",
  "interests",
  "contact",
] as const;

/**
 * Convertit les sections du backend (PortfolioSectionConfig) vers le format frontend.
 * Préserve l'ordre sauvegardé (order) pour que le drag-to-order soit appliqué en preview ET sur la page publique.
 * Fusionne avec les sections par défaut pour que langues, certifications, centres d'intérêt soient présentes.
 */
export const backendSectionsToFrontend = (
  backendSections?: Array<{
    id: string;
    type: string;
    visible: boolean;
    order: number;
  }>,
  lang: "fr" | "en" = "fr",
): Array<{
  id: string;
  label: string;
  visible: boolean;
}> => {
  const labels = getSectionLabels(lang);
  const defaultList = DEFAULT_SECTION_IDS.map((id) => ({
    id,
    label: labels[id] || id,
    visible: true,
  }));

  if (!backendSections || backendSections.length === 0) {
    return defaultList;
  }

  const sorted = [...backendSections].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  const byId = new Map(
    sorted.map((s) => [
      s.id,
      { id: s.id, label: labels[s.id] || s.id, visible: s.visible },
    ]),
  );
  const orderFromBackend = sorted.map((s) => s.id);
  const missingIds = DEFAULT_SECTION_IDS.filter((id) => !byId.has(id));
  const resultOrder = [...orderFromBackend, ...missingIds];

  return resultOrder.map(
    (id) =>
      byId.get(id) ?? { id, label: labels[id] || id, visible: true },
  );
};
