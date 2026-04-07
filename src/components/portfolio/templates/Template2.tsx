import React, { useState, useEffect, useRef } from "react";
import {
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
  Check,
  ExternalLink,
  GraduationCap,
  Calendar,
  Moon,
  Sun,
  LayoutGrid,
  Code,
  Camera,
  ArrowRight,
  Sparkles,
  Heart,
  Trash2,
  Plus,
  Pencil,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
} from "lucide-react";
import {
  User,
  Profile,
  Experience,
  Education,
  Project,
  Skill,
  Language,
  Certification,
  Interest,
  TemplateOverrides,
} from "../../../types";
import {
  TemplateCustomization,
  getFontClass,
  getVisibleSectionsInOrder,
  getFontFamilyForRole,
} from "./templateUtils";
import { HeroEditHint } from "./HeroEditHint";
import { Logo } from "../../Logo";
import { ProjectImageIconEditor } from "../ProjectImageIconEditor";
import { CVButton } from "../CVButton";
import { HeroBackgroundLayer } from "../HeroBackgroundLayer";
import { portfolioAPI, API_URL } from "../../../services/api";
import { SkillIcon } from "./SkillIcon";
import { getAbsoluteImageUrl } from "../../../utils/imageUrl";
import * as LucideIcons from "lucide-react";
import { DragAndDropList } from "../DragAndDropList";
import { applyItemOrder, getItemOrder } from "../../../utils/itemOrder";

/** Construit l'URL absolue pour une image (ex: /uploads/... → API_URL + path) */
function heroImageUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Si API_URL est vide (proxy Vite), utiliser l'URL relative telle quelle
  if (!API_URL || API_URL === "") {
    return url.startsWith("/") ? url : `/${url}`;
  }
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

interface Template2Props {
  user: User | null;
  profile: Profile | null;
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  interests?: Interest[];
  theme?: "light" | "dark";
  customization?: TemplateCustomization;
  onThemeChange?: (theme: "light" | "dark") => void;
  templateOverrides?: TemplateOverrides | null;
  isEditable?: boolean;
  onHeroOverridesChange?: (overrides: Partial<TemplateOverrides>) => void;
  /** true = preview (éditeur, contenu serré), false = page publique (contenu large) */
  isPreview?: boolean;
  showLogos?: boolean;
  /** Ordre personnalisé des items (projets, compétences, etc.) */
  itemOrder?: {
    projects?: string[];
    skills?: string[];
    certifications?: string[];
    interests?: string[];
    languages?: string[];
  };
  /** Callback quand l'utilisateur réorganise les items */
  onItemOrderChange?: (itemOrder: {
    projects?: string[];
    skills?: string[];
    certifications?: string[];
    interests?: string[];
    languages?: string[];
  }) => void;
}

export const Template2: React.FC<Template2Props> = ({
  user,
  profile,
  experiences = [],
  educations = [],
  projects = [],
  skills = [],
  languages = [],
  certifications = [],
  interests = [],
  theme: initialTheme = "light",
  customization,
  onThemeChange,
  templateOverrides,
  isEditable = false,
  onHeroOverridesChange,
  isPreview = false,
  showLogos = true,
  itemOrder,
  onItemOrderChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  // Largeur des sections : preview = plus serré, page publique = plus large
  const sectionMaxW = isPreview ? "max-w-5xl" : "max-w-7xl";
  const heroMaxW = isPreview ? "max-w-4xl" : "max-w-6xl";
  const sectionMaxNarrow = isPreview ? "max-w-4xl" : "max-w-6xl";

  // Hero : mêmes sources que Template1 (surcharges > profil)
  const heroImageSrc = heroImageUrl(
    templateOverrides?.hero_image_url ?? profile?.profile_picture_url ?? null,
  );
  const heroTitle =
    (templateOverrides?.hero_title?.trim() || undefined) ??
    profile?.title ??
    user?.full_name ??
    user?.username ??
    "Mon Portfolio";
  const heroSubtitle =
    (templateOverrides?.hero_subtitle?.trim() || undefined) ??
    `Bonjour, je suis ${(user?.full_name || profile?.title || user?.username || "").trim().split(" ")[0] || "Alex"}`;
  const heroBio = templateOverrides?.hero_bio ?? "";
  const heroBadgeText =
    (templateOverrides?.hero_badge_text?.trim() || undefined) ??
    "Disponible pour freelance";
  const heroBadgeVisible = templateOverrides?.hero_badge_visible !== false;

  // Section "À propos" : utiliser bio profil ou section personnalisée
  const useCustomAbout = templateOverrides?.about_use_custom === true;
  const aboutText = useCustomAbout
    ? templateOverrides?.about_text || ""
    : profile?.bio || "";
  const aboutImageUrl = useCustomAbout
    ? templateOverrides?.about_image_url
    : null;

  const [editingField, setEditingField] = useState<
    "subtitle" | "title" | "bio" | "badge" | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  // Refs pour la section "À propos" personnalisée
  const aboutTextareaRef = useRef<HTMLTextAreaElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [, setAboutImageUploading] = useState(false);

  const commitHeroEdit = () => {
    if (!onHeroOverridesChange || editingField === null) return;
    const next = { ...templateOverrides } as Partial<TemplateOverrides>;
    if (editingField === "subtitle")
      next.hero_subtitle = editingValue.trim() || undefined;
    if (editingField === "title")
      next.hero_title = editingValue.trim() || undefined;
    if (editingField === "bio") next.hero_bio = editingValue;
    if (editingField === "badge")
      next.hero_badge_text = editingValue.trim() || undefined;
    onHeroOverridesChange(next);
    setEditingField(null);
  };

  // Utiliser les fonctions utilitaires
  const fontClass = getFontClass(customization);
  const fontTitles = getFontFamilyForRole(customization, "titles");
  const fontSubtitles = getFontFamilyForRole(customization, "subtitles");
  const fontItem = getFontFamilyForRole(customization, "item");
  const fontItemSmall = getFontFamilyForRole(customization, "itemSmall");
  const fontBody = getFontFamilyForRole(customization, "body");
  const customFonts = customization?.customFonts ?? [];
  const apiBase = (API_URL || "").replace(/\/$/, "");
  const visibleSectionsInOrder = getVisibleSectionsInOrder(customization);

  // Appliquer l'ordre personnalisé aux items
  const orderedProjects =
    itemOrder?.projects && itemOrder.projects.length > 0
      ? applyItemOrder(projects, itemOrder.projects, (p) => p.id)
      : projects;

  const orderedSkills =
    itemOrder?.skills && itemOrder.skills.length > 0
      ? applyItemOrder(skills, itemOrder.skills, (s) => s.id || s.name)
      : skills;

  const orderedCertifications =
    itemOrder?.certifications && itemOrder.certifications.length > 0
      ? applyItemOrder(certifications, itemOrder.certifications, (c) => c.id)
      : certifications;

  const orderedInterests =
    itemOrder?.interests && itemOrder.interests.length > 0
      ? applyItemOrder(interests || [], itemOrder.interests, (i) => i.id)
      : interests || [];

  const orderedLanguages =
    itemOrder?.languages && itemOrder.languages.length > 0
      ? applyItemOrder(languages, itemOrder.languages, (l) => l.id)
      : languages;

  const isDark = theme === "dark";

  // Mettre à jour le thème quand initialTheme change
  useEffect(() => {
    if (initialTheme !== theme) {
      setTheme(initialTheme);
    }
  }, [initialTheme, theme]);

  // Ajuster automatiquement la hauteur du textarea "À propos"
  useEffect(() => {
    if (aboutTextareaRef.current && isEditable && useCustomAbout) {
      aboutTextareaRef.current.style.height = "auto";
      aboutTextareaRef.current.style.height = `${aboutTextareaRef.current.scrollHeight}px`;
    }
  }, [aboutText, isEditable, useCustomAbout, templateOverrides?.about_layout]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  // Fonction de scroll smooth
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Formater les expériences
  const formattedExperiences = (experiences || []).map((exp) => {
    // Gérer les descriptions : achievements (tableau) OU description (string) convertie en tableau
    let descriptionItems: string[] = [];
    if (
      exp.achievements &&
      Array.isArray(exp.achievements) &&
      exp.achievements.length > 0
    ) {
      descriptionItems = exp.achievements;
    } else if (exp.description) {
      // Si description est une string, la convertir en tableau
      descriptionItems = [exp.description];
    }

    return {
      company: exp.company || "Entreprise",
      role: exp.title || "Poste",
      at: `@ ${exp.company || "Entreprise"}`,
      date: exp.is_current
        ? `${new Date(exp.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - Présent`
        : exp.end_date
          ? `${new Date(exp.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - ${new Date(exp.end_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`
          : `${new Date(exp.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - Présent`,
      description: descriptionItems,
      active: exp.is_current,
    };
  });

  // Grouper les compétences par catégorie — n'exclure que la section "Autres" et les noms "autres"/"supérieur"/"inférieur"
  // Les compétences "Auto-detected" ou sans catégorie sont affichées sous "Compétences"
  const SKIP_SKILL_NAMES = /^(autres|supérieur|inférieur)$/i;
  const SKIP_CATEGORY = /^autres$/i; // n'afficher aucune section dont le titre est exactement "Autres"
  const skillsByCategory: Record<string, string[]> = {};
  (orderedSkills || []).forEach((skill) => {
    const name = (skill.name || "").trim();
    if (!name || SKIP_SKILL_NAMES.test(name)) return;
    const raw = (skill.category || "").trim();
    const category =
      /^auto\s*[-]?detected$/i.test(raw) || !raw ? "Compétences" : raw;
    if (SKIP_CATEGORY.test(category)) return;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(name);
  });
  const skillsByCategoryFiltered = Object.fromEntries(
    Object.entries(skillsByCategory).filter(
      ([cat]) => !SKIP_CATEGORY.test(cat),
    ),
  );

  // Nom complet pour le header (prénom + espace + nom)
  const fullNameDisplay =
    (user?.full_name || profile?.title || user?.username || "Portfolio")
      .trim()
      .replace(/\s+/g, " ") || "Portfolio";

  // Formater les formations
  const formattedEducations = (educations || []).map((edu) => ({
    school: edu.school || "École",
    degree: edu.degree || "Diplôme",
    year: edu.is_current
      ? `${new Date(edu.start_date).getFullYear()} - En cours`
      : edu.end_date
        ? `${new Date(edu.start_date).getFullYear()} - ${new Date(edu.end_date).getFullYear()}`
        : `${new Date(edu.start_date).getFullYear()}`,
    description:
      edu.description || edu.field_of_study || "Formation académique",
  }));

  // Vérification de sécurité : s'assurer que le composant retourne toujours quelque chose
  if (!user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-xl mb-4">Chargement du portfolio...</p>
          <p className="text-gray-500 text-sm">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-template="2"
      className={`min-h-screen w-full font-sans selection:bg-blue-200 selection:text-blue-900 ${fontClass} ${
        isDark ? "bg-neutral-950 text-neutral-100" : "bg-white text-gray-900"
      }`}
      style={{
        ["--font-titles" as string]: fontTitles,
        ["--font-subtitles" as string]: fontSubtitles,
        ["--font-item" as string]: fontItem,
        ["--font-item-small" as string]: fontItemSmall,
        ["--font-body" as string]: fontBody,
        fontFamily: fontBody,
      }}
    >
      {customFonts.length > 0 && (
        <style>{`
          ${customFonts
            .map((f) => {
              const url = f.url.startsWith("http")
                ? f.url
                : `${apiBase}${f.url}`;
              const safeName = f.name.replace(/"/g, '\\"');
              return `@font-face { font-family: "${safeName}"; src: url("${url}"); }`;
            })
            .join("\n")}
        `}</style>
      )}
      <style>{`
        [data-template="2"] h1 { font-family: var(--font-titles) !important; }
        [data-template="2"] .portfolio-font-title { font-family: var(--font-titles) !important; }
        [data-template="2"] h2, [data-template="2"] h5, [data-template="2"] h6 { font-family: var(--font-subtitles) !important; }
        [data-template="2"] .text-sm, [data-template="2"] .text-xs { font-family: var(--font-subtitles) !important; }
        [data-template="2"] h3, [data-template="2"] h4, [data-template="2"] p, [data-template="2"] li, [data-template="2"] .text-base { font-family: var(--font-body) !important; }
        [data-template="2"] .portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="2"] .group\/badge .portfolio-font-item,
        [data-template="2"] .group\/badge input.portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="2"] .portfolio-font-item-small { font-family: var(--font-item-small) !important; }
        [data-template="2"] .portfolio-font-subtitle { font-family: var(--font-subtitles) !important; }
        [data-template="2"] .portfolio-nav-title { font-family: var(--font-titles) !important; }
        [data-template="2"] .portfolio-section-intro { font-family: var(--font-body) !important; }
      `}</style>
      {/* Navbar — mode nuit: barre noire nette, liens lisibles */}
      <nav
        className={`sticky top-0 left-0 right-0 w-full z-30 transition-all duration-300 overflow-hidden ${
          isDark
            ? "bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800"
            : "bg-white/90 backdrop-blur-md border-b border-gray-100"
        }`}
      >
        <div
          className={`${sectionMaxW} mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center`}
        >
          <div
            className={`portfolio-nav-title font-bold text-lg sm:text-xl tracking-tight cursor-pointer ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            onClick={() => scrollTo("home")}
          >
            {fullNameDisplay}
            <span className="text-blue-600">.</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("home");
              }}
              className={`portfolio-font-subtitle transition-colors font-medium ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Accueil
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("projects");
              }}
              className={`portfolio-font-subtitle transition-colors font-medium ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Projets
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("about");
              }}
              className={`portfolio-font-subtitle transition-colors font-medium ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              À propos
            </a>
            <a
              href="#experience"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("experience");
              }}
              className={`portfolio-font-subtitle transition-colors font-medium ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Expérience
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Bouton CV */}
            <CVButton
              cvId={customization?.cvId}
              cvUrl={customization?.cvUrl}
              variant="ghost"
              size="sm"
              className={
                isDark
                  ? "text-neutral-200 hover:text-blue-400 hover:bg-neutral-800"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }
            />
            {/* Toggle thème : uniquement en Preview (éditeur), pas sur la page publique */}
            {isPreview && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? "hover:bg-neutral-800" : "hover:bg-gray-100"
                }`}
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {theme === "dark" ? (
                  <Sun
                    size={18}
                    className={isDark ? "text-amber-400" : "text-gray-600"}
                  />
                ) : (
                  <Moon
                    size={18}
                    className={isDark ? "text-neutral-400" : "text-gray-600"}
                  />
                )}
              </button>
            )}
            <button
              className={`p-2 rounded-full transition-colors ${
                isDark ? "hover:bg-neutral-800" : "hover:bg-gray-100"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? "bg-blue-600 text-white" : "bg-black text-white"
                }`}
              >
                <Mail size={16} />
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isPreview && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isDark
                    ? "hover:bg-neutral-800 text-neutral-200"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                aria-label="Changer le thème"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-colors ${
                isDark
                  ? "text-neutral-200 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden border-t ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-gray-100"
            } px-4 sm:px-6 py-4 space-y-4 shadow-lg`}
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("home");
                setIsMenuOpen(false);
              }}
              className={`portfolio-font-subtitle block font-medium transition-colors ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Accueil
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("projects");
                setIsMenuOpen(false);
              }}
              className={`portfolio-font-subtitle block font-medium transition-colors ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Projets
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("about");
                setIsMenuOpen(false);
              }}
              className={`portfolio-font-subtitle block font-medium transition-colors ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              À propos
            </a>
            <a
              href="#experience"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("experience");
                setIsMenuOpen(false);
              }}
              className={`portfolio-font-subtitle block font-medium transition-colors ${
                isDark
                  ? "text-neutral-200 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Expérience
            </a>
            <div className="pt-2 border-t border-neutral-800 dark:border-gray-100 mt-2 flex justify-center">
              <CVButton
                cvId={customization?.cvId}
                cvUrl={customization?.cvUrl}
                variant="ghost"
                size="sm"
                className={
                  isDark
                    ? "text-neutral-200 hover:text-blue-400 hover:bg-neutral-800"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                }
              />
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section — mode nuit: fond noir franc, contrastes nets */}
        <section
          id="home"
          className={`relative min-h-screen overflow-hidden ${isDark ? "bg-neutral-950 text-white" : "bg-white text-gray-900"}`}
        >
          <HeroBackgroundLayer
            type={templateOverrides?.hero_background_type ?? "default"}
            imageUrl={templateOverrides?.hero_background_image_url}
            overlayColor={isDark ? "rgb(10,10,10)" : "rgb(255,255,255)"}
            overlayOpacity={0.8}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          />
          <div
            className={`relative z-10 ${heroMaxW} mx-auto px-4 sm:px-6 min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between pt-12 gap-12 lg:gap-0`}
          >
            {/* Colonne gauche : texte (éditable) */}
            <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Badge hero — comme Template1 : modifier le texte (clic), supprimer (poubelle au survol), réafficher (« Ajouter un badge ») */}
              {heroBadgeVisible ? (
                <div
                  className={`group/badge relative inline-flex items-center gap-2 px-3 py-1 rounded-full border mx-auto lg:mx-0 ${isDark ? "bg-neutral-900 border-neutral-700 text-neutral-100" : "bg-blue-50 border-blue-200"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-2 -mx-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                  onClick={() =>
                    isEditable &&
                    onHeroOverridesChange &&
                    (setEditingValue(heroBadgeText), setEditingField("badge"))
                  }
                  role={isEditable ? "button" : undefined}
                  title={
                    isEditable
                      ? "Cliquer pour modifier le texte du badge"
                      : undefined
                  }
                >
                  <HeroEditHint
                    show={isEditable && !!onHeroOverridesChange}
                    groupName="badge"
                    position="inline"
                    className={isDark ? "text-blue-300" : "text-blue-600"}
                  />
                  {isEditable &&
                  onHeroOverridesChange &&
                  editingField === "badge" ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={commitHeroEdit}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), commitHeroEdit())
                      }
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className={`portfolio-font-item flex-1 min-w-[120px] bg-transparent border-none focus:outline-none text-[0.75rem] font-medium tracking-wide ${isDark ? "text-blue-300 placeholder-neutral-500" : "text-blue-700"}`}
                      placeholder="Ex: Disponible pour freelance"
                    />
                  ) : (
                    <>
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                      </span>
                      <span
                        className={`portfolio-font-item text-[0.75rem] font-medium tracking-wide ${isDark ? "text-blue-300" : "text-blue-700"}`}
                      >
                        {heroBadgeText || "Disponible pour freelance"}
                      </span>
                    </>
                  )}
                  {isEditable &&
                    onHeroOverridesChange &&
                    editingField !== "badge" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onHeroOverridesChange({
                            ...templateOverrides,
                            hero_badge_visible: false,
                          });
                        }}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500/90 text-white opacity-0 group-hover/badge:opacity-100 hover:bg-red-600 transition-all"
                        title="Supprimer le badge"
                        aria-label="Supprimer le badge"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                </div>
              ) : isEditable && onHeroOverridesChange ? (
                <button
                  type="button"
                  onClick={() =>
                    onHeroOverridesChange({
                      ...templateOverrides,
                      hero_badge_visible: true,
                    })
                  }
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed mx-auto lg:mx-0 animate-fade-in-up ${isDark ? "border-neutral-600 text-neutral-400 hover:border-blue-500 hover:text-blue-400" : "border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600"}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Ajouter un badge</span>
                </button>
              ) : null}

              {/* Subtitle (éditable) */}
              <div className="relative group/hero-subtitle">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-subtitle"
                  className={isDark ? "text-blue-300" : "text-blue-600"}
                />
                {isEditable &&
                onHeroOverridesChange &&
                editingField === "subtitle" ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), commitHeroEdit())
                    }
                    autoFocus
                    className={`portfolio-font-item block w-full font-medium text-base sm:text-lg bg-transparent border-b focus:outline-none ${isDark ? "text-neutral-200 border-neutral-600 focus:border-blue-500" : "text-gray-600 border-blue-500/50 focus:border-blue-500"}`}
                    placeholder="Bonjour, je suis…"
                  />
                ) : (
                  <div
                    className={`portfolio-font-item font-medium text-base sm:text-lg ${isDark ? "text-neutral-200" : "text-gray-600"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroSubtitle),
                      setEditingField("subtitle"))
                    }
                    role={isEditable ? "button" : undefined}
                    title={isEditable ? "Cliquer pour modifier" : undefined}
                  >
                    {heroSubtitle}{" "}
                    <span className="inline-block animate-wave">👋</span>
                  </div>
                )}
              </div>

              {/* Titre (éditable) */}
              <div className="relative group/hero-title">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-title"
                  className={isDark ? "text-blue-300" : "text-blue-600"}
                />
                {isEditable &&
                onHeroOverridesChange &&
                editingField === "title" ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), commitHeroEdit())
                    }
                    autoFocus
                    className={`portfolio-font-title block w-full text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] bg-transparent border-b focus:outline-none ${isDark ? "text-white border-neutral-600 focus:border-blue-500 placeholder-neutral-500" : "text-gray-900 border-blue-500/50 focus:border-blue-500 placeholder-slate-400"}`}
                    placeholder="Votre nom ou titre"
                  />
                ) : (
                  <h1
                    className={`text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroTitle), setEditingField("title"))
                    }
                    role={isEditable ? "button" : undefined}
                    title={isEditable ? "Cliquer pour modifier" : undefined}
                  >
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {heroTitle}
                    </span>
                    <Sparkles
                      className={`inline-block w-6 h-6 lg:w-8 lg:h-8 ml-2 mb-1 align-middle ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    />
                  </h1>
                )}
              </div>

              {/* Description / Bio (éditable) */}
              <div className="relative group/hero-bio">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-bio"
                  className={isDark ? "text-blue-300" : "text-blue-600"}
                />
                {isEditable &&
                onHeroOverridesChange &&
                editingField === "bio" ? (
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    autoFocus
                    rows={3}
                    className={`block w-full max-w-xl mx-auto lg:mx-0 text-lg bg-transparent border focus:outline-none rounded-lg px-3 py-2 leading-relaxed ${isDark ? "text-neutral-200 border-neutral-600 focus:border-blue-500" : "text-gray-600 border-blue-500/50 focus:border-blue-500"}`}
                    placeholder="Écrivez une accroche pour le hero…"
                  />
                ) : (
                  <p
                    className={`text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed ${!heroBio && isEditable ? "italic" : ""} ${isDark ? "text-neutral-300" : "text-gray-600"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-2 -mx-2 py-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroBio), setEditingField("bio"))
                    }
                    role={isEditable ? "button" : undefined}
                    title={isEditable ? "Cliquer pour modifier" : undefined}
                  >
                    {heroBio ||
                      (isEditable
                        ? "Cliquez pour écrire une accroche pour le hero…"
                        : profile?.bio ||
                          "Je suis un développeur frontend basé en France, je vous aide à créer de beaux sites web que vos utilisateurs adoreront.")}
                  </p>
                )}
              </div>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => scrollTo("projects")}
                  className={`group relative px-8 py-4 font-semibold rounded-xl overflow-hidden transition-transform hover:scale-105 active:scale-95 ${isDark ? "bg-white text-black" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  <span className="portfolio-font-subtitle relative z-10 flex items-center gap-2">
                    Voir mon portfolio
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
                <button
                  onClick={() => {
                    const contactSection =
                      document.getElementById("contact") ||
                      document.getElementById("about");
                    if (contactSection)
                      contactSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    else if (user?.email)
                      window.location.href = `mailto:${user.email}`;
                  }}
                  className={`px-8 py-4 rounded-xl border font-medium transition-all flex items-center gap-2 ${isDark ? "border-neutral-600 bg-neutral-900 hover:bg-neutral-800 text-white" : "border-blue-200 bg-white hover:bg-blue-50 text-gray-800"}`}
                >
                  <Mail className="w-4 h-4 opacity-70" />
                  <span className="portfolio-font-subtitle">Me contacter</span>
                </button>
              </div>
            </div>

            {/* Colonne droite : photo (effets uniquement au survol) */}
            <div className="flex-1 flex justify-center lg:justify-end relative">
              <div className="relative w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] lg:w-[380px] lg:h-[480px] group/photo">
                <HeroEditHint
                  show={isEditable}
                  groupName="photo"
                  className={
                    isDark
                      ? "text-blue-300 top-2 right-2"
                      : "text-blue-600 top-2 right-2"
                  }
                />
                {/* Cadre photo : bordures bleues */}
                <div
                  className={`absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl ${isDark ? "ring-2 ring-neutral-700 bg-neutral-900" : "ring-2 ring-blue-100 bg-slate-100"}`}
                >
                  {heroImageSrc ? (
                    <img
                      src={heroImageSrc}
                      alt="Portrait"
                      className="w-full h-full object-cover grayscale group-hover/photo:grayscale-0 group-hover/photo:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-6xl font-bold ${isDark ? "text-neutral-500 bg-neutral-900" : "text-slate-400 bg-slate-100"}`}
                    >
                      {(user?.full_name || user?.username || "?")[0]}
                    </div>
                  )}
                  {/* Overlay au survol : uniquement pour changer la photo (mode édition) */}
                  {isEditable && (
                    <>
                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !onHeroOverridesChange) return;
                          setHeroImageUploading(true);
                          try {
                            const { hero_image_url } =
                              await portfolioAPI.uploadHeroImage(file);
                            onHeroOverridesChange({
                              ...templateOverrides,
                              hero_image_url,
                            });
                          } catch (err) {
                            console.error("Upload hero image:", err);
                          } finally {
                            setHeroImageUploading(false);
                            e.target.value = "";
                          }
                        }}
                      />
                      <div
                        className={`absolute inset-0 flex items-center justify-center rounded-[2rem] opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 cursor-pointer ${isDark ? "bg-neutral-950/90" : "bg-black/50"}`}
                        onClick={() => heroFileInputRef.current?.click()}
                        role="button"
                        aria-label="Changer la photo du hero"
                      >
                        {heroImageUploading ? (
                          <span className="text-white text-sm font-medium">
                            Chargement…
                          </span>
                        ) : (
                          <span className="text-white text-sm font-medium flex items-center gap-2">
                            <Camera size={20} /> Changer la photo
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sections dynamiques selon l'ordre de templateCustomization.sections (drag to order dans la barre de personnalisation) */}
        {visibleSectionsInOrder.map((section) => {
          if (section.id === "projects") {
            if (projects.length === 0) return null;
            return (
              <section
                key={section.id}
                id="projects"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-900" : "bg-gray-50/50"
                }`}
              >
                <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
                  <h2
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Projets sélectionnés
                    <span
                      className={isDark ? "text-blue-400" : "text-blue-600"}
                    >
                      .
                    </span>
                  </h2>
                  <div className="w-16 md:w-20 h-1 md:h-1.5 bg-blue-600 rounded-full"></div>
                </div>
                {isEditable &&
                onItemOrderChange &&
                orderedProjects.length > 0 ? (
                  <DragAndDropList
                    items={orderedProjects}
                    onReorder={(reorderedProjects) => {
                      const newOrder = getItemOrder(
                        reorderedProjects,
                        (p) => p.id,
                      );
                      onItemOrderChange({
                        ...itemOrder,
                        projects: newOrder,
                      });
                    }}
                    getItemId={(p) => p.id}
                    disabled={!isEditable}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    strategy="grid"
                    renderItem={(project: Project, index: number) => (
                      <div
                        key={project.id || index}
                        className={`group rounded-2xl overflow-hidden shadow-sm border hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 transform hover:-translate-y-1 h-full min-h-[380px] flex flex-col ${
                          isDark
                            ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="h-40 md:h-48 overflow-hidden relative flex-shrink-0">
                          {isEditable && (
                            <ProjectImageIconEditor
                              project={project}
                              onUpdate={() => {}}
                              isDark={isDark}
                            />
                          )}
                          <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                          {project.project_icon ? (
                            // Afficher l'icône Lucide
                            <div
                              className={`w-full h-full flex items-center justify-center ${isDark ? "bg-neutral-800" : "bg-gradient-to-br from-blue-100 to-blue-200"}`}
                            >
                              {(() => {
                                const IconComponent =
                                  (LucideIcons as any)[project.project_icon] ||
                                  LucideIcons.Code;
                                return (
                                  <IconComponent
                                    size={64}
                                    className={
                                      isDark ? "text-blue-400" : "text-blue-600"
                                    }
                                  />
                                );
                              })()}
                            </div>
                          ) : project.url_image ? (
                            <img
                              src={project.url_image}
                              alt={project.name}
                              className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${isDark ? "bg-neutral-800" : "bg-gradient-to-br from-blue-100 to-blue-200"}`}
                            >
                              <LayoutGrid
                                size={48}
                                className={
                                  isDark ? "text-neutral-500" : "text-blue-400"
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:p-8">
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3
                              className={`portfolio-font-item text-lg md:text-xl font-bold group-hover:text-blue-600 transition-colors ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {project.name}
                            </h3>
                            {project.url_demo && (
                              <a
                                href={project.url_demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink
                                  size={16}
                                  className={`group-hover:text-blue-600 transition-colors md:w-[18px] md:h-[18px] ${
                                    isDark
                                      ? "text-neutral-400 group-hover:text-blue-400"
                                      : "text-gray-400"
                                  }`}
                                />
                              </a>
                            )}
                          </div>
                          <p
                            className={`portfolio-section-intro text-sm leading-relaxed mb-4 md:mb-6 whitespace-pre-line flex-1 ${
                              isDark ? "text-neutral-300" : "text-gray-500"
                            }`}
                          >
                            {(
                              project.description ||
                              "Aucune description disponible."
                            )
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </p>
                          {project.technologies &&
                            project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tag, i) => (
                                  <span
                                    key={i}
                                    className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full border ${
                                      isDark
                                        ? "bg-neutral-700 text-neutral-200 border-neutral-600"
                                        : "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {orderedProjects.map((project, index) => (
                      <div
                        key={project.id || index}
                        className={`group rounded-2xl overflow-hidden shadow-sm border hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 transform hover:-translate-y-1 h-full min-h-[380px] flex flex-col ${
                          isDark
                            ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="h-40 md:h-48 overflow-hidden relative flex-shrink-0">
                          {isEditable && (
                            <ProjectImageIconEditor
                              project={project}
                              onUpdate={() => {}}
                              isDark={isDark}
                            />
                          )}
                          <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                          {project.project_icon ? (
                            <div
                              className={`w-full h-full flex items-center justify-center ${isDark ? "bg-neutral-800" : "bg-gradient-to-br from-blue-100 to-blue-200"}`}
                            >
                              {(() => {
                                const IconComponent =
                                  (LucideIcons as any)[project.project_icon] ||
                                  LucideIcons.Code;
                                return (
                                  <IconComponent
                                    size={64}
                                    className={
                                      isDark ? "text-blue-400" : "text-blue-600"
                                    }
                                  />
                                );
                              })()}
                            </div>
                          ) : project.url_image ? (
                            <img
                              src={project.url_image}
                              alt={project.name}
                              className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${isDark ? "bg-neutral-800" : "bg-gradient-to-br from-blue-100 to-blue-200"}`}
                            >
                              <LayoutGrid
                                size={48}
                                className={
                                  isDark ? "text-neutral-500" : "text-blue-400"
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:p-8 flex-1 flex flex-col min-h-[140px]">
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3
                              className={`portfolio-font-item text-lg md:text-xl font-bold group-hover:text-blue-600 transition-colors ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {project.name}
                            </h3>
                            {project.url_demo && (
                              <a
                                href={project.url_demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink
                                  size={16}
                                  className={`group-hover:text-blue-600 transition-colors md:w-[18px] md:h-[18px] ${
                                    isDark
                                      ? "text-neutral-400 group-hover:text-blue-400"
                                      : "text-gray-400"
                                  }`}
                                />
                              </a>
                            )}
                          </div>
                          <p
                            className={`portfolio-section-intro text-sm leading-relaxed mb-4 md:mb-6 whitespace-pre-line flex-1 ${
                              isDark ? "text-neutral-300" : "text-gray-500"
                            }`}
                          >
                            {(
                              project.description ||
                              "Aucune description disponible."
                            )
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </p>
                          {project.technologies &&
                            project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tag, i) => (
                                  <span
                                    key={i}
                                    className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full border ${
                                      isDark
                                        ? "bg-neutral-700 text-neutral-200 border-neutral-600"
                                        : "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }
          if (section.id === "about") {
            return (
              <section
                key={section.id}
                id="about"
                className={`py-6 sm:py-8 md:py-10 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-950" : "bg-white"
                }`}
              >
                <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2
                        className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        À propos de moi
                        <span
                          className={isDark ? "text-blue-400" : "text-blue-600"}
                        >
                          .
                        </span>
                      </h2>
                      {/* Boutons de disposition directement au-dessus du titre */}
                      {isEditable &&
                        onHeroOverridesChange &&
                        useCustomAbout && (
                          <div className="flex gap-1 ml-2">
                            {[
                              {
                                value: "image_top",
                                label: "Photo haut",
                                icon: "⬆️",
                              },
                              {
                                value: "image_bottom",
                                label: "Photo bas",
                                icon: "⬇️",
                              },
                              {
                                value: "image_left",
                                label: "Photo gauche",
                                icon: "⬅️",
                              },
                              {
                                value: "image_right",
                                label: "Photo droite",
                                icon: "➡️",
                              },
                            ].map((layout) => (
                              <button
                                key={layout.value}
                                onClick={() => {
                                  if (onHeroOverridesChange) {
                                    onHeroOverridesChange({
                                      ...templateOverrides,
                                      about_layout: layout.value as any,
                                    });
                                  }
                                }}
                                className={`px-2 py-1 text-[10px] rounded border transition-all flex items-center justify-center ${
                                  (templateOverrides?.about_layout ||
                                    "image_top") === layout.value
                                    ? isDark
                                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                      : "bg-blue-100 border-blue-300 text-blue-700"
                                    : isDark
                                      ? "border-neutral-600 hover:bg-neutral-700 text-neutral-400"
                                      : "border-gray-300 hover:bg-gray-100 text-gray-600"
                                }`}
                                title={layout.label}
                              >
                                <span>{layout.icon}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                    {isEditable && onHeroOverridesChange && (
                      <button
                        onClick={() => {
                          if (useCustomAbout) {
                            // Passer à la bio profil
                            onHeroOverridesChange({
                              about_use_custom: false,
                            });
                          } else {
                            // Passer en mode personnalisé
                            onHeroOverridesChange({
                              about_use_custom: true,
                              about_layout:
                                templateOverrides?.about_layout ?? "image_top",
                              about_text_align:
                                templateOverrides?.about_text_align ?? "center",
                            });
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:shadow-md"
                        style={{
                          backgroundColor: useCustomAbout
                            ? isDark
                              ? "rgba(148, 163, 184, 0.1)"
                              : "rgba(148, 163, 184, 0.05)"
                            : isDark
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(59, 130, 246, 0.05)",
                          borderColor: useCustomAbout
                            ? isDark
                              ? "rgba(148, 163, 184, 0.3)"
                              : "rgba(148, 163, 184, 0.2)"
                            : isDark
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(59, 130, 246, 0.2)",
                          color: useCustomAbout
                            ? isDark
                              ? "rgb(148, 163, 184)"
                              : "rgb(71, 85, 105)"
                            : isDark
                              ? "rgb(147, 197, 253)"
                              : "rgb(37, 99, 235)",
                        }}
                        title={
                          useCustomAbout
                            ? "Utiliser la bio du profil"
                            : "Passer en mode personnalisé"
                        }
                      >
                        {useCustomAbout ? (
                          <>
                            <RotateCcw size={14} />
                            Bio profil
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            Personnaliser
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {(() => {
                    const layout =
                      templateOverrides?.about_layout || "image_top";
                    const hasImage = !!aboutImageUrl;
                    const hasText = !!aboutText;

                    if (!hasImage && !hasText) {
                      return (
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div
                            className={`w-1.5 h-16 sm:h-24 rounded-full flex-shrink-0 mt-2 ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                          ></div>
                          <p
                            className={`flex-1 min-w-0 text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-wrap ${
                              isDark ? "text-neutral-300" : "text-gray-500"
                            }`}
                          >
                            {
                              "Développer de beaux sites web fonctionnels est ce que j'aime faire, et c'est pourquoi je donne le meilleur de moi-même dans chaque nouveau défi."
                            }
                          </p>
                        </div>
                      );
                    }

                    const imageEl = hasImage ? (
                      <div
                        className={`relative group ${
                          layout === "image_top" || layout === "image_bottom"
                            ? "mb-6 sm:mb-8 flex justify-center"
                            : "flex items-center self-start"
                        }`}
                      >
                        <img
                          src={
                            getAbsoluteImageUrl(aboutImageUrl) ||
                            heroImageUrl(aboutImageUrl) ||
                            aboutImageUrl ||
                            undefined
                          }
                          alt="À propos"
                          className={`${
                            layout === "image_left" || layout === "image_right"
                              ? "w-full max-w-lg h-auto object-cover rounded-lg"
                              : "w-full max-w-2xl h-64 sm:h-80 object-cover rounded-lg"
                          }`}
                          onError={(e) => {
                            const finalUrl =
                              getAbsoluteImageUrl(aboutImageUrl) ||
                              heroImageUrl(aboutImageUrl) ||
                              aboutImageUrl;
                            console.error(
                              "❌ [Template2] Erreur chargement image about:",
                              {
                                original: aboutImageUrl,
                                getAbsoluteImageUrl:
                                  getAbsoluteImageUrl(aboutImageUrl),
                                heroImageUrl: heroImageUrl(aboutImageUrl),
                                finalUrl,
                                API_URL,
                              },
                            );
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        {isEditable &&
                          onHeroOverridesChange &&
                          useCustomAbout && (
                            <>
                              <button
                                onClick={() =>
                                  aboutImageInputRef.current?.click()
                                }
                                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-all opacity-0 group-hover:opacity-100"
                                style={{
                                  backgroundColor: isDark
                                    ? "rgba(59, 130, 246, 0.9)"
                                    : "rgba(59, 130, 246, 0.95)",
                                  borderColor: isDark
                                    ? "rgba(59, 130, 246, 0.5)"
                                    : "rgba(59, 130, 246, 0.3)",
                                  color: "white",
                                }}
                                title="Modifier l'image"
                              >
                                <ImageIcon size={12} />
                                Modifier
                              </button>
                              <input
                                ref={aboutImageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file || !onHeroOverridesChange) return;
                                  setAboutImageUploading(true);
                                  try {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    const response =
                                      await portfolioAPI.uploadAboutImage(
                                        formData,
                                      );
                                    onHeroOverridesChange({
                                      ...templateOverrides,
                                      about_image_url: response.about_image_url,
                                    });
                                  } catch (err) {
                                    console.error("Upload about image:", err);
                                  } finally {
                                    setAboutImageUploading(false);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </>
                          )}
                      </div>
                    ) : null;

                    const textEl = hasText ? (
                      <div
                        className={`relative group flex items-start gap-3 sm:gap-4 ${
                          templateOverrides?.about_text_align === "center"
                            ? "justify-center"
                            : templateOverrides?.about_text_align === "right"
                              ? "justify-end"
                              : ""
                        }`}
                      >
                        {!useCustomAbout && (
                          <div
                            className={`w-1.5 h-16 sm:h-24 rounded-full flex-shrink-0 mt-2 ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                          ></div>
                        )}
                        {/* Boutons d'alignement directement au-dessus du texte */}
                        {isEditable &&
                          onHeroOverridesChange &&
                          useCustomAbout && (
                            <div className="absolute -top-6 right-0 flex gap-1">
                              {[
                                {
                                  value: "left",
                                  label: "Gauche",
                                  icon: AlignLeft,
                                },
                                {
                                  value: "center",
                                  label: "Centre",
                                  icon: AlignCenter,
                                },
                                {
                                  value: "right",
                                  label: "Droite",
                                  icon: AlignRight,
                                },
                              ].map((align) => {
                                const Icon = align.icon;
                                return (
                                  <button
                                    key={align.value}
                                    onClick={() => {
                                      if (onHeroOverridesChange) {
                                        onHeroOverridesChange({
                                          ...templateOverrides,
                                          about_text_align: align.value as any,
                                        });
                                      }
                                    }}
                                    className={`px-2 py-1 text-[10px] rounded border transition-all flex items-center justify-center ${
                                      (templateOverrides?.about_text_align ||
                                        "center") === align.value
                                        ? isDark
                                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                          : "bg-blue-100 border-blue-300 text-blue-700"
                                        : isDark
                                          ? "border-neutral-600 hover:bg-neutral-700 text-neutral-400"
                                          : "border-gray-300 hover:bg-gray-100 text-gray-600"
                                    }`}
                                    title={align.label}
                                  >
                                    <Icon size={12} />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        {isEditable &&
                          onHeroOverridesChange &&
                          useCustomAbout &&
                          aboutText && (
                            <button
                              onClick={() => {
                                aboutTextareaRef.current?.focus();
                                aboutTextareaRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                              }}
                              className="absolute -top-8 right-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-all opacity-0 group-hover:opacity-100 z-10"
                              style={{
                                backgroundColor: isDark
                                  ? "rgba(59, 130, 246, 0.9)"
                                  : "rgba(59, 130, 246, 0.95)",
                                borderColor: isDark
                                  ? "rgba(59, 130, 246, 0.5)"
                                  : "rgba(59, 130, 246, 0.3)",
                                color: "white",
                              }}
                              title="Modifier le texte"
                            >
                              <Pencil size={12} />
                              Modifier
                            </button>
                          )}
                        {isEditable &&
                        onHeroOverridesChange &&
                        useCustomAbout ? (
                          <textarea
                            ref={aboutTextareaRef}
                            value={aboutText}
                            onChange={(e) => {
                              if (onHeroOverridesChange) {
                                onHeroOverridesChange({
                                  ...templateOverrides,
                                  about_text: e.target.value,
                                });
                              }
                              if (aboutTextareaRef.current) {
                                aboutTextareaRef.current.style.height = "auto";
                                aboutTextareaRef.current.style.height = `${aboutTextareaRef.current.scrollHeight}px`;
                              }
                            }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = "auto";
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                            className={`w-full ${isDark ? "text-neutral-300 bg-neutral-800/50 border-neutral-700" : "text-gray-500 bg-white/80 border-gray-200"} text-lg sm:text-xl md:text-2xl leading-relaxed mb-4 sm:mb-6 whitespace-pre-wrap rounded-lg border px-3 py-2 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              templateOverrides?.about_text_align === "center"
                                ? "text-center"
                                : templateOverrides?.about_text_align ===
                                    "right"
                                  ? "text-right"
                                  : "text-left"
                            }`}
                            style={{ minHeight: "6rem" }}
                            placeholder="Écrivez votre section À propos personnalisée..."
                          />
                        ) : (
                          <p
                            className={`portfolio-section-intro ${!useCustomAbout ? "flex-1" : "w-full"} min-w-0 text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-wrap ${
                              isDark ? "text-neutral-300" : "text-gray-500"
                            } ${
                              templateOverrides?.about_text_align === "center"
                                ? "text-center"
                                : templateOverrides?.about_text_align ===
                                    "right"
                                  ? "text-right"
                                  : "text-left"
                            }`}
                          >
                            {aboutText}
                          </p>
                        )}
                      </div>
                    ) : null;

                    if (layout === "image_top") {
                      return (
                        <div className="flex flex-col">
                          {imageEl}
                          <div className="w-full">{textEl}</div>
                        </div>
                      );
                    } else if (layout === "image_bottom") {
                      return (
                        <div className="flex flex-col">
                          <div className="w-full">{textEl}</div>
                          {imageEl}
                        </div>
                      );
                    } else if (layout === "image_left") {
                      return (
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                          <div className="flex-shrink-0 md:self-center">
                            {imageEl}
                          </div>
                          <div className="flex-1">{textEl}</div>
                        </div>
                      );
                    } else if (layout === "image_right") {
                      return (
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                          <div className="flex-1">{textEl}</div>
                          <div className="flex-shrink-0 md:self-center">
                            {imageEl}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </section>
            );
          }
          if (section.id === "experiences") {
            if (formattedExperiences.length === 0) return null;
            return (
              <section
                key={section.id}
                id="experience"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-900" : "bg-white"
                }`}
              >
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Expérience
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    .
                  </span>
                </h2>
                <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                  {/* Sidebar List */}
                  <div className="md:w-48 flex-shrink-0 relative">
                    {/* Vertical Line */}
                    <div
                      className={`absolute left-0 top-2 bottom-2 w-[2px] hidden md:block ${isDark ? "bg-neutral-700" : "bg-gray-100"}`}
                    ></div>

                    <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-4 md:gap-0 pl-4 md:pl-0 scrollbar-hide">
                      {formattedExperiences.map((job, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTab(index)}
                          className={`portfolio-font-item-small relative pl-4 md:pl-6 py-2 md:py-3 text-left text-base md:text-lg font-bold transition-all md:ml-0 whitespace-nowrap md:whitespace-normal ${
                            activeTab === index
                              ? isDark
                                ? "text-white"
                                : "text-black"
                              : isDark
                                ? "text-neutral-400 hover:text-neutral-200"
                                : "text-gray-300 hover:text-gray-400"
                          }`}
                        >
                          {/* Active Indicator Line for Desktop */}
                          {activeTab === index && (
                            <div
                              className={`absolute left-[-1px] top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r hidden md:block ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                            ></div>
                          )}
                          {job.company}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 animate-fade-in max-w-2xl">
                    <div className="flex items-center gap-4 mb-2">
                      {showLogos &&
                        formattedExperiences[activeTab]?.company && (
                          <Logo
                            name={formattedExperiences[activeTab].company}
                            type="company"
                            size={64}
                            className="flex-shrink-0"
                            showFallback={false}
                          />
                        )}
                      <div>
                        <h3
                          className={`text-2xl md:text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}
                        >
                          <span className="portfolio-font-item">
                            {formattedExperiences[activeTab]?.role}
                          </span>{" "}
                          <span
                            className={`portfolio-font-item-small ${isDark ? "text-blue-400" : "text-blue-600"}`}
                          >
                            {formattedExperiences[activeTab]?.at}
                          </span>
                        </h3>
                      </div>
                    </div>
                    <p
                      className={`text-xs md:text-sm font-medium mb-6 md:mb-10 tracking-wide uppercase ${isDark ? "text-neutral-400" : "text-gray-400"}`}
                    >
                      {formattedExperiences[activeTab]?.date}
                    </p>

                    <ul className="space-y-3 sm:space-y-4">
                      {(formattedExperiences[activeTab]?.description || []).map(
                        (item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-1.5 min-w-[12px] flex-shrink-0">
                              <Check
                                size={16}
                                className={
                                  isDark ? "text-blue-400" : "text-blue-600"
                                }
                              />
                            </span>
                            <p
                              className={`leading-relaxed whitespace-pre-line ${
                                isDark ? "text-neutral-300" : "text-gray-600"
                              }`}
                            >
                              {item
                                .replace(/^-\s+/gm, "→ ")
                                .replace(/\n-\s+/g, "\n→ ")}
                            </p>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </section>
            );
          }
          if (section.id === "education") {
            if (formattedEducations.length === 0) return null;
            return (
              <section
                key={section.id}
                id="education"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-950" : "bg-gray-50/50"
                }`}
              >
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Formation
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    .
                  </span>
                </h2>
                <div className={`grid gap-6 md:gap-8 ${sectionMaxNarrow}`}>
                  {formattedEducations.map((edu, index) => (
                    <div
                      key={index}
                      className={`flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-start p-6 md:p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${
                        isDark
                          ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      {showLogos ? (
                        <Logo
                          name={edu.school}
                          type="school"
                          size={64}
                          className="flex-shrink-0"
                          showFallback={false}
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                        >
                          <GraduationCap size={28} className="md:w-8 md:h-8" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                          <h3
                            className={`portfolio-font-item text-lg md:text-xl font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {edu.school}
                          </h3>
                          <div
                            className={`flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1 rounded-full w-fit ${
                              isDark
                                ? "text-neutral-300 bg-neutral-700"
                                : "text-gray-400 bg-gray-50"
                            }`}
                          >
                            <Calendar
                              size={12}
                              className="md:w-[14px] md:h-[14px]"
                            />
                            {edu.year}
                          </div>
                        </div>
                        <div
                          className={`portfolio-font-item-small font-medium mb-3 md:mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          {edu.degree}
                        </div>
                        <p
                          className={`portfolio-section-intro leading-relaxed text-sm ${
                            isDark ? "text-neutral-300" : "text-gray-500"
                          }`}
                        >
                          {edu.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          if (section.id === "skills") {
            if (Object.keys(skillsByCategoryFiltered).length === 0) return null;
            return (
              <section
                key={section.id}
                id="skills"
                className={`relative py-16 sm:py-20 md:py-24 overflow-hidden ${
                  isDark ? "bg-neutral-900" : "bg-gray-50"
                }`}
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${
                      isDark ? "bg-blue-600/20" : "opacity-20 bg-blue-200"
                    }`}
                  ></div>
                  <div
                    className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl ${
                      isDark ? "bg-blue-500/15" : "opacity-10 bg-blue-300"
                    }`}
                  ></div>
                </div>

                <div
                  className={`${sectionMaxW} mx-auto px-4 sm:px-6 lg:px-8 relative z-10`}
                >
                  <div className="text-center mb-12 sm:mb-16">
                    <span
                      className={`portfolio-font-subtitle inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                        isDark
                          ? "bg-blue-500/25 text-blue-300"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      Compétences
                    </span>
                    <h2
                      className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Compétences
                      <span
                        className={isDark ? "text-blue-400" : "text-blue-600"}
                      >
                        .
                      </span>
                    </h2>
                    <p
                      className={`mt-4 text-lg max-w-2xl mx-auto ${
                        isDark ? "text-neutral-400" : "text-gray-500"
                      }`}
                    >
                      Technologies et outils que je maîtrise
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {Object.entries(skillsByCategoryFiltered).map(
                      ([category, items]) => (
                        <div
                          key={category}
                          className={`rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-xl ${
                            Object.keys(skillsByCategoryFiltered).length === 1
                              ? "md:col-span-2 lg:col-span-3"
                              : ""
                          } ${
                            isDark
                              ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/50"
                              : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${isDark ? "bg-blue-500 shadow-blue-500/30" : "bg-blue-600 shadow-blue-500/30"}`}
                            >
                              <Code size={20} />
                            </div>
                            <h3
                              className={`portfolio-font-subtitle text-lg sm:text-xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {category}
                            </h3>
                            <span
                              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                                isDark
                                  ? "bg-neutral-700 text-neutral-200"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {items.length} compétence
                              {items.length > 1 ? "s" : ""}
                            </span>
                          </div>

                          {isEditable && onItemOrderChange ? (
                            <DragAndDropList
                              items={items}
                              onReorder={(reorderedItems) => {
                                // Reconstruire la liste complète des compétences avec le nouvel ordre pour cette catégorie
                                const allSkillsFlat: string[] = [];
                                Object.entries(
                                  skillsByCategoryFiltered,
                                ).forEach(([cat, skillNames]) => {
                                  if (cat === category) {
                                    allSkillsFlat.push(...reorderedItems);
                                  } else {
                                    allSkillsFlat.push(...skillNames);
                                  }
                                });
                                // Trouver les IDs correspondants dans orderedSkills
                                const skillIds = allSkillsFlat.map((name) => {
                                  const skill = orderedSkills.find(
                                    (s) => s.name === name,
                                  );
                                  return skill?.id || skill?.name || name;
                                });
                                onItemOrderChange({
                                  ...itemOrder,
                                  skills: skillIds,
                                });
                              }}
                              getItemId={(name) => name}
                              disabled={!isEditable}
                              className="flex flex-wrap gap-2 sm:gap-3"
                              strategy="grid"
                              buttonSize="small"
                              renderItem={(name: string, index: number) => (
                                <span
                                  key={index}
                                  className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                    isDark
                                      ? "bg-neutral-700 text-neutral-200 border border-neutral-600 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-300"
                                      : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                  }`}
                                >
                                  <SkillIcon
                                    skillName={name}
                                    size={16}
                                    useBadge={true}
                                    showLabel={false}
                                  />
                                  <span className="portfolio-font-item">
                                    {name}
                                  </span>
                                </span>
                              )}
                            />
                          ) : (
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {items.map((name, index) => (
                                <span
                                  key={index}
                                  className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                    isDark
                                      ? "bg-neutral-700 text-neutral-200 border border-neutral-600 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-300"
                                      : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                  }`}
                                >
                                  <SkillIcon
                                    skillName={name}
                                    size={16}
                                    useBadge={true}
                                    showLabel={false}
                                  />
                                  <span className="portfolio-font-item">
                                    {name}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </section>
            );
          }
          if (section.id === "languages") {
            if (languages.length === 0) return null;
            return (
              <section
                key={section.id}
                id="languages"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-950" : "bg-gray-50/50"
                }`}
              >
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Langues
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    .
                  </span>
                </h2>
                {isEditable &&
                onItemOrderChange &&
                orderedLanguages.length > 0 ? (
                  <DragAndDropList
                    items={orderedLanguages}
                    onReorder={(reorderedLanguages) => {
                      const newOrder = getItemOrder(
                        reorderedLanguages,
                        (l) => l.id,
                      );
                      onItemOrderChange({
                        ...itemOrder,
                        languages: newOrder,
                      });
                    }}
                    getItemId={(l) => l.id}
                    disabled={!isEditable}
                    className={`grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${sectionMaxNarrow}`}
                    strategy="grid"
                    buttonSize="small"
                    renderItem={(lang: Language, index: number) => (
                      <div
                        key={lang.id || index}
                        className={`group rounded-xl p-4 md:p-6 border shadow-sm hover:shadow-md transition-shadow ${
                          isDark
                            ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`portfolio-font-item text-lg md:text-xl font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {lang.name}
                          </h3>
                          <span
                            className={`text-sm font-medium px-3 py-1 rounded-full ${
                              isDark
                                ? "text-neutral-300 bg-neutral-700"
                                : "text-gray-400 bg-gray-50"
                            }`}
                          >
                            {lang.level}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div
                    className={`grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${sectionMaxNarrow}`}
                  >
                    {orderedLanguages.map((lang, index) => (
                      <div
                        key={lang.id || index}
                        className={`group rounded-xl p-4 md:p-6 border shadow-sm hover:shadow-md transition-shadow ${
                          isDark
                            ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`portfolio-font-item text-lg md:text-xl font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {lang.name}
                          </h3>
                          <span
                            className={`text-sm font-medium px-3 py-1 rounded-full ${
                              isDark
                                ? "text-neutral-300 bg-neutral-700"
                                : "text-gray-400 bg-gray-50"
                            }`}
                          >
                            {lang.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }
          if (section.id === "certifications") {
            if (certifications.length === 0) return null;
            return (
              <section
                key={section.id}
                id="certifications"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-900" : "bg-white"
                }`}
              >
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Certifications
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    .
                  </span>
                </h2>
                {isEditable &&
                onItemOrderChange &&
                orderedCertifications.length > 0 ? (
                  <DragAndDropList
                    items={orderedCertifications}
                    onReorder={(reorderedCerts) => {
                      const newOrder = getItemOrder(
                        reorderedCerts,
                        (c) => c.id,
                      );
                      onItemOrderChange({
                        ...itemOrder,
                        certifications: newOrder,
                      });
                    }}
                    getItemId={(c) => c.id}
                    disabled={!isEditable}
                    className={`grid md:grid-cols-2 gap-6 md:gap-8 ${sectionMaxNarrow}`}
                    strategy="grid"
                    buttonSize="small"
                    renderItem={(cert: Certification, index: number) => (
                      <div
                        key={cert.id || index}
                        className={`group rounded-xl p-6 md:p-8 border shadow-sm hover:shadow-md transition-shadow ${
                          isDark
                            ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3
                              className={`portfolio-font-item text-lg md:text-xl font-bold mb-1 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {cert.name}
                            </h3>
                            <p
                              className={`text-sm ${isDark ? "text-neutral-300" : "text-gray-500"}`}
                            >
                              {cert.issuer}
                            </p>
                          </div>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={
                                isDark
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-700"
                              }
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                        </div>
                        <p
                          className={`text-xs ${isDark ? "text-neutral-400" : "text-gray-400"}`}
                        >
                          {new Date(cert.date_obtained).toLocaleDateString(
                            "fr-FR",
                            {
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    )}
                  />
                ) : (
                  <div
                    className={`grid md:grid-cols-2 gap-6 md:gap-8 ${sectionMaxNarrow}`}
                  >
                    {orderedCertifications.map((cert, index) => (
                      <div
                        key={cert.id || index}
                        className={`group rounded-xl p-6 md:p-8 border shadow-sm hover:shadow-md transition-shadow ${
                          isDark
                            ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/40"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3
                              className={`text-lg md:text-xl font-bold mb-1 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {cert.name}
                            </h3>
                            <p
                              className={`text-sm ${isDark ? "text-neutral-300" : "text-gray-500"}`}
                            >
                              {cert.issuer}
                            </p>
                          </div>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={
                                isDark
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-700"
                              }
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                        </div>
                        <p
                          className={`text-xs ${isDark ? "text-neutral-400" : "text-gray-400"}`}
                        >
                          {new Date(cert.date_obtained).toLocaleDateString(
                            "fr-FR",
                            {
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }
          if (section.id === "interests") {
            return (
              <section
                key={section.id}
                id="interests"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 ${
                  isDark ? "bg-neutral-950" : "bg-gray-50/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
                  <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart
                        className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                      />
                      <span
                        className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}
                      >
                        Passions & centres d'intérêt
                      </span>
                    </div>
                    <h2
                      className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Ce qui me motive
                      <span
                        className={isDark ? "text-blue-400" : "text-blue-600"}
                      >
                        .
                      </span>
                    </h2>
                    <p
                      className={`portfolio-section-intro text-sm leading-relaxed ${isDark ? "text-neutral-400" : "text-gray-600"}`}
                    >
                      Domaines et sujets qui nourrissent ma curiosité et ma
                      motivation au quotidien.
                    </p>
                  </div>
                  {isEditable &&
                  onItemOrderChange &&
                  orderedInterests.length > 0 ? (
                    <DragAndDropList
                      items={orderedInterests}
                      onReorder={(reorderedInterests) => {
                        const newOrder = getItemOrder(
                          reorderedInterests,
                          (i) => i.id,
                        );
                        onItemOrderChange({
                          ...itemOrder,
                          interests: newOrder,
                        });
                      }}
                      getItemId={(i) => i.id}
                      disabled={!isEditable}
                      className="w-full min-w-0 flex flex-wrap gap-3"
                      strategy="grid"
                      buttonSize="small"
                      renderItem={(interest: Interest, index: number) => (
                        <span
                          key={interest.id || index}
                          className={`portfolio-font-item group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                            isDark
                              ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/50 hover:bg-neutral-700 text-neutral-200"
                              : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md text-slate-800"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-500"}`}
                          />
                          {interest.name}
                        </span>
                      )}
                    />
                  ) : (
                    <div className="w-full min-w-0 flex flex-wrap gap-3">
                      {orderedInterests && orderedInterests.length > 0 ? (
                        orderedInterests.map((interest, index) => (
                          <span
                            key={interest.id || index}
                            className={`portfolio-font-item group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                              isDark
                                ? "bg-neutral-800 border-neutral-700 hover:border-blue-500/50 hover:bg-neutral-700 text-neutral-200"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md text-slate-800"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-500"}`}
                            />
                            {interest.name}
                          </span>
                        ))
                      ) : (
                        <div
                          className={`rounded-xl border border-dashed p-6 text-center ${
                            isDark
                              ? "border-neutral-700 bg-neutral-800/50"
                              : "border-gray-200 bg-white/50"
                          }`}
                        >
                          <Heart
                            className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-neutral-500" : "text-slate-400"}`}
                          />
                          <p
                            className={`text-sm ${isDark ? "text-neutral-500" : "text-gray-500"}`}
                          >
                            Aucun centre d'intérêt renseigné. Ajoutez-en dans
                            votre profil.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          }
          if (section.id === "contact") {
            return (
              <section
                key={section.id}
                id="contact"
                className={`py-12 sm:py-16 md:py-20 ${sectionMaxW} mx-auto px-4 sm:px-6 pb-24 md:pb-32 ${
                  isDark ? "bg-neutral-900" : "bg-gray-50/50"
                }`}
              >
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Contact
                  <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                    .
                  </span>
                </h2>
                <div className="max-w-2xl mx-auto text-center">
                  <p
                    className={`portfolio-font-item text-lg mb-8 ${isDark ? "text-neutral-300" : "text-gray-400"}`}
                  >
                    Prêt à collaborer ? N'hésitez pas à me contacter.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {user?.email && (
                      <a
                        href={`mailto:${user.email}`}
                        className={`portfolio-font-item px-8 py-3.5 rounded-full font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                          isDark
                            ? "bg-blue-500 text-white hover:bg-blue-400"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        <Mail size={18} />
                        Envoyer un email
                      </a>
                    )}
                    {profile?.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`portfolio-font-item px-8 py-3.5 rounded-full font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                          isDark
                            ? "bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 hover:border-blue-500/40"
                            : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Linkedin size={18} />
                        LinkedIn
                      </a>
                    )}
                    {profile?.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`portfolio-font-item px-8 py-3.5 rounded-full font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                          isDark
                            ? "bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 hover:border-blue-500/40"
                            : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Github size={18} />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </section>
            );
          }
          return null;
        })}

        {/* Footer */}
        <footer
          className={`py-6 border-t ${isDark ? "border-neutral-800 bg-neutral-950" : "border-gray-200 bg-white"} text-center px-4`}
        >
          <p
            className={`${isDark ? "text-neutral-500" : "text-gray-500"} text-xs sm:text-sm`}
          >
            © {new Date().getFullYear()}{" "}
            {user?.full_name || profile?.title || user?.username || "PortfoliA"}
            .
          </p>
          {(user?.full_name || user?.email || profile?.phone) && (
            <p
              className={`${isDark ? "text-neutral-500" : "text-gray-500"} text-xs mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1`}
            >
              {user?.full_name && <span>{user.full_name}</span>}
              {user?.email && (
                <a href={`mailto:${user.email}`} className="hover:underline">
                  {user.email}
                </a>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone}`} className="hover:underline">
                  {profile.phone}
                </a>
              )}
            </p>
          )}
        </footer>
      </main>

      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave 2s infinite;
          transform-origin: 70% 70%;
        }
        @keyframes particle-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -40px) scale(1.5); } }
        @keyframes particle-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-35px, 30px) scale(1.4); } }
        @keyframes particle-3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 25px) scale(1.6); } }
        @keyframes particle-4 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-25px, -35px) scale(1.7); } }
        @keyframes particle-5 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -20px) scale(1.3); } }
        .animate-particle-1 { animation: particle-1 4s ease-in-out infinite; }
        .animate-particle-2 { animation: particle-2 5s ease-in-out infinite; }
        .animate-particle-3 { animation: particle-3 4.5s ease-in-out infinite; }
        .animate-particle-4 { animation: particle-4 5.5s ease-in-out infinite; }
        .animate-particle-5 { animation: particle-5 4.8s ease-in-out infinite; }

        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Custom Scrollbar for the inner content */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #e5e7eb;
            border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #d1d5db;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
