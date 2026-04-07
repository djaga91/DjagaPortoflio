import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Github,
  Linkedin,
  Mail,
  Camera,
  Pencil,
  Image as ImageIcon,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Globe,
  ChevronLeft,
  ChevronRight,
  Heart,
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
  isSectionVisible,
  getFontClass,
  getFontFamilyForRole,
} from "./templateUtils";
import { SkillIcon } from "./SkillIcon";
import { HeroEditHint } from "./HeroEditHint";
import { Logo } from "../../Logo";
import { ProjectImageIconEditor } from "../ProjectImageIconEditor";
import { CVButton } from "../CVButton";
import { HeroBackgroundLayer } from "../HeroBackgroundLayer";
import { API_URL } from "../../../services/api";

/** Base URL pour les polices importées (uploads) */
const apiBase = (API_URL || "").replace(/\/$/, "");
import { getAbsoluteImageUrl } from "../../../utils/imageUrl";
import * as LucideIcons from "lucide-react";
import { DragAndDropList } from "../DragAndDropList";
import { applyItemOrder, getItemOrder } from "../../../utils/itemOrder";
import { IconSelector } from "../../IconSelector";

function heroImageUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL || API_URL === "") {
    return url.startsWith("/") ? url : `/${url}`;
  }
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatExperiencePeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isCurrent: boolean,
): string {
  const fmt = (d: string | null | undefined) => {
    if (!d) return "—";
    const date = new Date(d);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  };
  const start = fmt(startDate);
  const end = isCurrent ? "Aujourd'hui" : fmt(endDate);
  return end !== "—" ? `${start} — ${end}` : start;
}

export interface Template6Props {
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
  isPreview?: boolean;
  showLogos?: boolean;
  itemOrder?: {
    projects?: string[];
    skills?: string[];
    certifications?: string[];
    interests?: string[];
    languages?: string[];
  };
  onItemOrderChange?: (itemOrder: {
    projects?: string[];
    skills?: string[];
    certifications?: string[];
    interests?: string[];
    languages?: string[];
  }) => void;
}

// Couleurs par défaut marron/beige
const DEFAULT_COLORS = {
  primaryDark: "#5e2933",
  primaryLight: "#815443",
  secondaryBeige: "#d2bdb1",
  accentBrown: "#7d5e4c",
  cream: "#f7f6f6",
  dark: "#0a0a0a",
  textLight: "#ffffff",
  textGray: "#b0b0b0",
  textDark: "#333333",
};

export const Template6: React.FC<Template6Props> = ({
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
  templateOverrides,
  isEditable = false,
  onHeroOverridesChange,
  isPreview = false,
  showLogos = true,
  itemOrder,
  onItemOrderChange,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingField, setEditingField] = useState<
    "badge" | "title" | "subtitle" | "bio" | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const aboutTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setAboutImageUploading] = useState(false);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);

  // États pour les carousels
  const [projectsCarouselIndex, setProjectsCarouselIndex] = useState(0);
  const [educationsCarouselIndex, setEducationsCarouselIndex] = useState(0);
  const [experiencesCarouselIndex, setExperiencesCarouselIndex] = useState(0);

  // États pour l'édition des highlights
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<
    number | null
  >(null);
  const [editingHighlightField, setEditingHighlightField] = useState<
    "title" | "description" | "icon" | null
  >(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState(false);
  const [editingSectionDescription, setEditingSectionDescription] =
    useState(false);
  // État local pour la valeur en cours d'édition des highlights (évite les re-renders)
  const [editingHighlightValue, setEditingHighlightValue] =
    useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editingStateRef = useRef<{
    index: number | null;
    field: "title" | "description" | "icon" | null;
  }>({ index: null, field: null });
  const [, setForceRender] = useState(0);

  // Titre et description de la section Highlights
  const highlightsSectionTitle =
    templateOverrides?.template6_highlights_title || "Mes atouts";
  const highlightsSectionDescription =
    templateOverrides?.template6_highlights_description ||
    "Découvrez mes compétences et qualités";

  // Highlights par défaut
  const DEFAULT_HIGHLIGHTS = [
    {
      icon: "Code",
      title: "Data Analysis",
      description: "Analyse et visualisation de données",
    },
    {
      icon: "Briefcase",
      title: "Data Engineering",
      description: "Pipelines ETL et architectures data",
    },
    {
      icon: "Award",
      title: "Data Science",
      description: "Machine Learning et IA",
    },
    {
      icon: "Globe",
      title: "Innovant",
      description: "Toujours à la recherche de solutions créatives",
    },
    {
      icon: "GraduationCap",
      title: "Collaboratif",
      description: "Travail d'équipe et communication",
    },
    {
      icon: "Award",
      title: "Curieux",
      description: "Apprentissage continu et veille technologique",
    },
  ];

  // Obtenir les highlights (personnalisés ou par défaut) - recalculé quand templateOverrides change
  const highlights = useMemo(() => {
    return templateOverrides?.template6_highlights &&
      templateOverrides.template6_highlights.length > 0
      ? templateOverrides.template6_highlights
      : DEFAULT_HIGHLIGHTS;
  }, [templateOverrides?.template6_highlights]);

  // Fonction pour mettre à jour un highlight
  const updateHighlight = (
    index: number,
    field: "icon" | "title" | "description",
    value: string,
  ) => {
    if (!onHeroOverridesChange) return;

    const updatedHighlights = [...highlights];
    updatedHighlights[index] = {
      ...updatedHighlights[index],
      [field]: value,
    };

    onHeroOverridesChange({
      ...(templateOverrides || {}),
      template6_highlights: updatedHighlights,
    });
  };

  // Couleurs personnalisables (avec valeurs par défaut marron/beige)
  const tc = customization?.template6_colors;
  const colors = {
    primaryDark: tc?.primaryDark || DEFAULT_COLORS.primaryDark,
    primaryLight: tc?.primaryLight || DEFAULT_COLORS.primaryLight,
    secondaryBeige: tc?.secondaryBeige || DEFAULT_COLORS.secondaryBeige,
    accentBrown: tc?.accentBrown || DEFAULT_COLORS.accentBrown,
    cream: tc?.cream || DEFAULT_COLORS.cream,
    dark: tc?.dark || DEFAULT_COLORS.dark,
    textLight: tc?.textLight || DEFAULT_COLORS.textLight,
    textGray: tc?.textGray || DEFAULT_COLORS.textGray,
    textDark: tc?.textDark || DEFAULT_COLORS.textDark,
  };

  useEffect(() => {
    if (initialTheme !== theme) setTheme(initialTheme);
  }, [initialTheme]);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const checkSectionVisible = (sectionId: string) =>
    isSectionVisible(sectionId, customization);

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

  const commitHeroEdit = () => {
    if (!onHeroOverridesChange || editingField === null) return;
    const next = { ...templateOverrides } as Partial<TemplateOverrides>;
    if (editingField === "badge")
      next.hero_badge_text = editingValue.trim() || undefined;
    if (editingField === "subtitle")
      next.hero_subtitle = editingValue.trim() || undefined;
    if (editingField === "title") {
      // Garder la valeur telle quelle (l'utilisateur peut modifier "Je suis " s'il le souhaite)
      next.hero_title = editingValue.trim() || undefined;
    }
    if (editingField === "bio") next.hero_bio = editingValue;
    onHeroOverridesChange(next);
    setEditingField(null);
  };

  const fontClass = getFontClass(customization || undefined);
  const fontTitles = getFontFamilyForRole(customization, "titles");
  const fontSubtitles = getFontFamilyForRole(customization, "subtitles");
  const fontItem = getFontFamilyForRole(customization, "item");
  const fontItemSmall = getFontFamilyForRole(customization, "itemSmall");
  const fontBody = getFontFamilyForRole(customization, "body");
  const customFonts = customization?.customFonts ?? [];

  // Hero data
  const heroImageSrc = heroImageUrl(
    templateOverrides?.hero_image_url ?? profile?.profile_picture_url ?? null,
  );

  // Valeur par défaut pour le titre : "Je suis [prénom nom]"
  const defaultHeroTitle = user?.full_name
    ? `Je suis ${user.full_name}`
    : profile?.title
      ? `Je suis ${profile.title}`
      : user?.username
        ? `Je suis ${user.username}`
        : "Je suis";
  const heroTitle =
    (templateOverrides?.hero_title?.trim() || undefined) ?? defaultHeroTitle;

  // Valeur par défaut pour le sous-titre : "Diplômé de [nom de la dernière école]"
  const lastEducation =
    educations.length > 0
      ? educations.sort((a, b) => {
          const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
          const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
          return dateB - dateA;
        })[0]
      : null;
  const defaultHeroSubtitle = lastEducation?.school
    ? `Diplômé de ${lastEducation.school}`
    : "Bonjour, je suis";
  const heroSubtitle =
    (templateOverrides?.hero_subtitle?.trim() || undefined) ??
    defaultHeroSubtitle;

  // Valeur par défaut pour le badge : "Disponible à partir de" (vide)
  const heroBadgeText =
    (templateOverrides?.hero_badge_text?.trim() || undefined) ??
    "Disponible à partir de";
  const heroBadgeVisible = templateOverrides?.hero_badge_visible !== false;

  const fullName = user?.full_name || profile?.title || user?.username || "";
  const email = user?.email || "";
  const githubUrl = profile?.github_url || "";
  const linkedinUrl = profile?.linkedin_url || "";

  // Gestion section About (bio profil vs section personnalisée)
  const useCustomAbout = templateOverrides?.about_use_custom === true;
  const aboutText = useCustomAbout
    ? templateOverrides?.about_text || ""
    : profile?.bio || "";
  const aboutImageUrl = useCustomAbout
    ? templateOverrides?.about_image_url
    : null;

  if (!user && !profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: colors.cream }}
      >
        <p className="text-lg" style={{ color: colors.textDark }}>
          Chargement du portfolio...
        </p>
      </div>
    );
  }

  return (
    <div
      data-template="6"
      data-theme={theme}
      className={`min-h-screen font-mono ${fontClass}`}
      style={
        {
          background: colors.cream,
          color: colors.textDark,
          fontFamily: fontBody,
          "--font-titles": fontTitles,
          "--font-subtitles": fontSubtitles,
          "--font-item": fontItem,
          "--font-item-small": fontItemSmall,
          "--font-body": fontBody,
          "--primary-dark": colors.primaryDark,
          "--primary-light": colors.primaryLight,
          "--secondary-beige": colors.secondaryBeige,
          "--accent-brown": colors.accentBrown,
          "--cream": colors.cream,
          "--text-light": colors.textLight,
          "--text-gray": colors.textGray,
          "--text-dark": colors.textDark,
        } as React.CSSProperties
      }
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
        [data-template="6"] h1 { font-family: var(--font-titles) !important; }
        [data-template="6"] .portfolio-font-title { font-family: var(--font-titles) !important; }
        [data-template="6"] h2, [data-template="6"] h5, [data-template="6"] h6 { font-family: var(--font-subtitles) !important; }
        [data-template="6"] .text-sm, [data-template="6"] .text-xs { font-family: var(--font-subtitles) !important; }
        [data-template="6"] h3, [data-template="6"] h4, [data-template="6"] p, [data-template="6"] li, [data-template="6"] .text-base { font-family: var(--font-body) !important; }
        [data-template="6"] .portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="6"] .portfolio-font-item-small { font-family: var(--font-item-small) !important; }
        [data-template="6"] .portfolio-nav-title { font-family: var(--font-subtitles) !important; }
        [data-template="6"] .portfolio-section-intro { font-family: var(--font-body) !important; }
        [data-template="6"] .portfolio-font-subtitle { font-family: var(--font-subtitles) !important; }
        [data-template="6"] footer.portfolio-footer-text,
        [data-template="6"] footer.portfolio-footer-text p { font-family: var(--font-body) !important; }
      `}</style>
      {/* Navigation */}
      <nav
        className={`${isPreview ? "sticky" : "fixed"} top-0 left-0 right-0 w-full z-[99998] transition-all shadow-sm`}
        style={{
          background: `${colors.cream}E6`,
          backdropFilter: "blur(10px)",
          borderBottom: `2px solid ${colors.primaryDark}20`,
          padding: "1rem 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            onClick={() => scrollTo("home")}
            className="portfolio-nav-title text-xl font-bold text-left"
            style={{ color: colors.primaryDark }}
          >
            {fullName || "Portfolio"}
          </button>

          <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
            {checkSectionVisible("about") && (
              <li>
                <button
                  onClick={() => scrollTo("about")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Moi
                </button>
              </li>
            )}
            {checkSectionVisible("experiences") &&
              checkSectionVisible("education") && (
                <li>
                  <button
                    onClick={() => scrollTo("parcours")}
                    className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                    style={{ color: colors.textDark }}
                  >
                    Parcours
                  </button>
                </li>
              )}
            {checkSectionVisible("projects") && (
              <li>
                <button
                  onClick={() => scrollTo("projects")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Projets
                </button>
              </li>
            )}
            {checkSectionVisible("skills") && (
              <li>
                <button
                  onClick={() => scrollTo("skills")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Compétences
                </button>
              </li>
            )}
            {checkSectionVisible("education") && (
              <li>
                <button
                  onClick={() => scrollTo("formation")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Formation
                </button>
              </li>
            )}
            {checkSectionVisible("experiences") && (
              <li>
                <button
                  onClick={() => scrollTo("experience")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Expérience
                </button>
              </li>
            )}
            {checkSectionVisible("interests") && (
              <li>
                <button
                  onClick={() => scrollTo("interests")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Centres d'intérêt
                </button>
              </li>
            )}
            {checkSectionVisible("contact") && (
              <li>
                <button
                  onClick={() => scrollTo("contact")}
                  className="text-sm font-medium uppercase transition-colors hover:opacity-70"
                  style={{ color: colors.textDark }}
                >
                  Contact
                </button>
              </li>
            )}
            <li>
              <CVButton
                cvId={customization?.cvId}
                cvUrl={customization?.cvUrl}
                variant="ghost"
                size="sm"
              />
            </li>
            {linkedinUrl && (
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl transition-transform hover:scale-110"
                  style={{ color: colors.primaryDark }}
                >
                  <Linkedin />
                </a>
              </li>
            )}
            {githubUrl && (
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl transition-transform hover:scale-110"
                  style={{ color: colors.primaryDark }}
                >
                  <Github />
                </a>
              </li>
            )}
          </ul>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
            style={{ color: colors.primaryDark }}
          >
            <span
              className={`w-6 h-0.5 transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
              style={{ background: colors.primaryDark }}
            />
            <span
              className={`w-6 h-0.5 transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`}
              style={{ background: colors.primaryDark }}
            />
            <span
              className={`w-6 h-0.5 transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              style={{ background: colors.primaryDark }}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 w-full p-4 shadow-lg"
            style={{ background: colors.cream }}
          >
            <ul className="flex flex-col gap-4">
              {checkSectionVisible("about") && (
                <li>
                  <button
                    onClick={() => scrollTo("about")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Moi
                  </button>
                </li>
              )}
              {checkSectionVisible("experiences") &&
                checkSectionVisible("education") && (
                  <li>
                    <button
                      onClick={() => scrollTo("parcours")}
                      className="text-sm font-medium uppercase text-left w-full"
                      style={{ color: colors.textDark }}
                    >
                      Parcours
                    </button>
                  </li>
                )}
              {checkSectionVisible("projects") && (
                <li>
                  <button
                    onClick={() => scrollTo("projects")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Projets
                  </button>
                </li>
              )}
              {checkSectionVisible("skills") && (
                <li>
                  <button
                    onClick={() => scrollTo("skills")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Compétences
                  </button>
                </li>
              )}
              {checkSectionVisible("education") && (
                <li>
                  <button
                    onClick={() => scrollTo("formation")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Formation
                  </button>
                </li>
              )}
              {checkSectionVisible("experiences") && (
                <li>
                  <button
                    onClick={() => scrollTo("experience")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Expérience
                  </button>
                </li>
              )}
              {checkSectionVisible("interests") && (
                <li>
                  <button
                    onClick={() => scrollTo("interests")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Centres d'intérêt
                  </button>
                </li>
              )}
              {checkSectionVisible("contact") && (
                <li>
                  <button
                    onClick={() => scrollTo("contact")}
                    className="text-sm font-medium uppercase text-left w-full"
                    style={{ color: colors.textDark }}
                  >
                    Contact
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section
          id="home"
          className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8"
          style={{ background: colors.primaryDark }}
        >
          <HeroBackgroundLayer
            type={templateOverrides?.hero_background_type ?? "default"}
            imageUrl={templateOverrides?.hero_background_image_url}
            overlayColor={colors.primaryDark}
            overlayOpacity={0.8}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            {/* Wave shapes background */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute w-[150%] h-[150%] opacity-30 rounded-[40%_50%_35%_45%] -top-1/2 -left-1/4 animate-[wave_20s_ease-in-out_infinite]"
                style={{ background: colors.primaryLight }}
              />
              <div
                className="absolute w-[150%] h-[150%] opacity-30 rounded-[45%_40%_50%_35%] -bottom-1/2 -right-1/4 animate-[wave_25s_ease-in-out_infinite_reverse]"
                style={{ background: colors.accentBrown }}
              />
            </div>
          </HeroBackgroundLayer>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Hero Text avec bulles de chat */}
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                {heroImageSrc ? (
                  <div className="relative group">
                    <img
                      src={heroImageSrc}
                      alt={fullName}
                      className="w-24 h-24 rounded-full border-4 object-cover shadow-2xl"
                      style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                    />
                    {isEditable && onHeroOverridesChange && (
                      <HeroEditHint show={true} groupName="hero-photo" />
                    )}
                    {isEditable && onHeroOverridesChange && (
                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setHeroImageUploading(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const response = await fetch(
                              `${API_URL}/api/profile/picture`,
                              {
                                method: "POST",
                                credentials: "include",
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                                },
                                body: formData,
                              },
                            );
                            const data = await response.json();
                            if (data.url) {
                              onHeroOverridesChange({
                                hero_image_url: data.url,
                              });
                            }
                          } catch (err) {
                            console.error("Erreur upload photo:", err);
                          } finally {
                            setHeroImageUploading(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl font-bold shadow-2xl"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      background: colors.primaryLight,
                      color: colors.textLight,
                    }}
                  >
                    {fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {isEditable && onHeroOverridesChange && (
                  <button
                    onClick={() => heroFileInputRef.current?.click()}
                    className="p-2 rounded-lg backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: colors.textLight,
                    }}
                    title="Changer la photo"
                  >
                    {heroImageUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={20} />
                    )}
                  </button>
                )}
                <div
                  className="px-4 py-2 rounded-full backdrop-blur-sm shadow-lg text-sm font-semibold"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    color: colors.textDark,
                  }}
                >
                  Bonjour !
                </div>
              </div>

              {/* Bulles de chat */}
              {isEditable && editingField === "title" ? (
                <div
                  className="px-6 py-4 rounded-[25px] backdrop-blur-sm shadow-lg text-lg font-semibold inline-block relative animate-[slideInLeft_0.6s_ease-out]"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    color: colors.textDark,
                  }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitHeroEdit();
                      }
                      if (e.key === "Escape") {
                        setEditingField(null);
                        setEditingValue("");
                      }
                    }}
                    className="bg-transparent border-none outline-none font-semibold w-full"
                    style={{ color: colors.textDark }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className={`portfolio-font-item px-6 py-4 rounded-[25px] backdrop-blur-sm shadow-lg text-lg font-semibold inline-block relative animate-[slideInLeft_0.6s_ease-out] ${isEditable ? "cursor-pointer hover:opacity-80" : ""}`}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    color: colors.textDark,
                  }}
                  onClick={
                    isEditable
                      ? () => {
                          setEditingField("title");
                          // Garder "Je suis " dans le champ d'édition
                          setEditingValue(heroTitle);
                        }
                      : undefined
                  }
                >
                  {heroTitle}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField("title");
                        // Garder "Je suis " dans le champ d'édition
                        setEditingValue(heroTitle);
                      }}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: colors.primaryDark }}
                      title="Modifier"
                    >
                      <Pencil size={10} />
                    </button>
                  )}
                </div>
              )}
              {isEditable && editingField === "subtitle" ? (
                <div
                  className="px-6 py-4 rounded-[25px] backdrop-blur-sm shadow-lg text-lg font-semibold inline-block relative animate-[slideInLeft_0.6s_ease-out]"
                  style={{
                    animationDelay: "0.2s",
                    background: "rgba(255, 255, 255, 0.95)",
                    color: colors.textDark,
                  }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitHeroEdit();
                      }
                      if (e.key === "Escape") {
                        setEditingField(null);
                        setEditingValue("");
                      }
                    }}
                    className="bg-transparent border-none outline-none font-semibold w-full"
                    style={{ color: colors.textDark }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className={`portfolio-font-item px-6 py-4 rounded-[25px] backdrop-blur-sm shadow-lg text-lg font-semibold inline-block relative animate-[slideInLeft_0.6s_ease-out] group ${isEditable ? "cursor-pointer hover:opacity-80" : ""}`}
                  style={{
                    animationDelay: "0.2s",
                    background: "rgba(255, 255, 255, 0.95)",
                    color: colors.textDark,
                  }}
                  onClick={
                    isEditable
                      ? () => {
                          setEditingField("subtitle");
                          setEditingValue(heroSubtitle);
                        }
                      : undefined
                  }
                >
                  {heroSubtitle}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField("subtitle");
                        setEditingValue(heroSubtitle);
                      }}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: colors.primaryDark }}
                      title="Modifier"
                    >
                      <Pencil size={10} />
                    </button>
                  )}
                </div>
              )}
              {isEditable && editingField === "badge" ? (
                <div
                  className="px-6 py-4 rounded-[25px] backdrop-blur-sm shadow-lg text-lg font-semibold inline-block relative animate-[slideInLeft_0.6s_ease-out]"
                  style={{
                    animationDelay: "0.4s",
                    background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accentBrown} 100%)`,
                    color: colors.textLight,
                  }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitHeroEdit();
                      }
                      if (e.key === "Escape") {
                        setEditingField(null);
                        setEditingValue("");
                      }
                    }}
                    className="bg-transparent border-none outline-none font-semibold w-full"
                    style={{ color: colors.textLight }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className={`portfolio-font-item px-6 py-4 rounded-[25px] backdrop-blur-sm shadow-lg text-lg font-semibold inline-block relative animate-[slideInLeft_0.6s_ease-out] group ${isEditable ? "cursor-pointer hover:opacity-80" : ""}`}
                  style={{
                    animationDelay: "0.4s",
                    background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accentBrown} 100%)`,
                    color: colors.textLight,
                  }}
                  onClick={
                    isEditable && heroBadgeVisible
                      ? () => {
                          setEditingField("badge");
                          setEditingValue(heroBadgeText);
                        }
                      : undefined
                  }
                >
                  {heroBadgeVisible && heroBadgeText}
                  {isEditable && heroBadgeVisible && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField("badge");
                        setEditingValue(heroBadgeText);
                      }}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: colors.primaryDark }}
                      title="Modifier"
                    >
                      <Pencil size={10} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Hero Image avec cartes flottantes */}
            <div className="relative hidden lg:flex justify-center items-center h-[500px]">
              {highlights.slice(0, 3).map((highlight, idx) => {
                const IconComponent =
                  (LucideIcons as any)[highlight.icon] || Code;
                const positions = [
                  { top: "10%", left: "10%", delay: "0s" },
                  { top: "50%", right: "10%", delay: "-2s" },
                  { bottom: "10%", left: "20%", delay: "-4s" },
                ];
                const pos = positions[idx];

                return (
                  <div
                    key={idx}
                    className={`absolute px-6 py-4 rounded-2xl backdrop-blur-sm border shadow-lg flex items-center gap-4 animate-[float_6s_ease-in-out_infinite] ${isEditable ? "group" : ""}`}
                    style={{
                      ...pos,
                      animationDelay: pos.delay,
                      background: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      color: colors.textLight,
                      pointerEvents:
                        editingHighlightIndex === idx &&
                        editingHighlightField === "title"
                          ? "auto"
                          : "auto",
                    }}
                    onMouseDown={(e) => {
                      if (
                        isEditable &&
                        editingHighlightIndex === idx &&
                        editingHighlightField === "title"
                      ) {
                        e.stopPropagation();
                      }
                    }}
                    onClick={(e) => {
                      if (isEditable) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {isEditable &&
                    editingHighlightIndex === idx &&
                    editingHighlightField === "icon" ? (
                      <div className="z-50 relative">
                        <IconSelector
                          selectedIcon={highlight.icon}
                          onSelectIcon={(iconName) => {
                            if (iconName) {
                              updateHighlight(idx, "icon", iconName);
                            }
                            setEditingHighlightIndex(null);
                            setEditingHighlightField(null);
                          }}
                          className="bg-white p-4 rounded-lg shadow-lg border"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <IconComponent
                          size={32}
                          style={{ color: colors.secondaryBeige }}
                        />
                        {isEditable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingHighlightIndex(idx);
                              setEditingHighlightField("icon");
                            }}
                            className="absolute -top-1 -right-1 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all z-20"
                            style={{ color: colors.primaryDark }}
                            title="Modifier l'icône"
                          >
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                    )}
                    {isEditable &&
                    editingHighlightIndex === idx &&
                    editingHighlightField === "title" ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingHighlightValue}
                          onChange={(e) => {
                            e.stopPropagation();
                            setEditingHighlightValue(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                editingHighlightValue.trim() !== highlight.title
                              ) {
                                updateHighlight(
                                  idx,
                                  "title",
                                  editingHighlightValue.trim() ||
                                    highlight.title,
                                );
                              }
                              setEditingHighlightIndex(null);
                              setEditingHighlightField(null);
                              setEditingHighlightValue("");
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingHighlightIndex(null);
                              setEditingHighlightField(null);
                              setEditingHighlightValue("");
                            }
                          }}
                          className="bg-white/95 border-2 border-blue-500 rounded px-2 py-1 font-semibold text-gray-800 flex-1 min-w-[120px] outline-none focus:bg-white focus:border-blue-600 z-50"
                          autoFocus
                          ref={(input) => {
                            if (input && inputRef.current !== input) {
                              inputRef.current = input;
                              // Sauvegarder la position de scroll avant le focus
                              const scrollY = window.scrollY;
                              // Sélectionner seulement la première fois
                              requestAnimationFrame(() => {
                                setTimeout(() => {
                                  input.focus({ preventScroll: true });
                                  const len = input.value.length;
                                  input.setSelectionRange(len, len); // Placer le curseur à la fin au lieu de tout sélectionner
                                  // Restaurer la position de scroll immédiatement
                                  requestAnimationFrame(() => {
                                    window.scrollTo({
                                      top: scrollY,
                                      behavior: "instant",
                                    });
                                  });
                                }, 10);
                              });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              editingHighlightValue.trim() !== highlight.title
                            ) {
                              updateHighlight(
                                idx,
                                "title",
                                editingHighlightValue.trim() || highlight.title,
                              );
                            }
                            setEditingHighlightIndex(null);
                            setEditingHighlightField(null);
                            setEditingHighlightValue("");
                          }}
                          className="p-1 rounded bg-green-500 text-white z-50"
                          title="Sauvegarder"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-2">
                        <span className="portfolio-font-item font-semibold">
                          {highlight.title}
                        </span>
                        {isEditable && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                              // Empêcher le scroll
                              const scrollY = window.scrollY;
                              if (
                                editingStateRef.current.index === idx &&
                                editingStateRef.current.field === "title"
                              ) {
                                return;
                              }
                              editingStateRef.current = {
                                index: idx,
                                field: "title",
                              };
                              setEditingHighlightValue(highlight.title);
                              setEditingHighlightIndex(idx);
                              setEditingHighlightField("title");
                              setForceRender((prev) => prev + 1); // Forcer le re-render
                              // Restaurer la position de scroll après un court délai
                              setTimeout(() => {
                                if (window.scrollY !== scrollY) {
                                  window.scrollTo(0, scrollY);
                                }
                              }, 10);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            className="highlight-edit-button p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all z-20"
                            style={{ color: colors.primaryDark }}
                            title="Modifier le titre"
                          >
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scroll Indicator */}
            <div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
              style={{ color: colors.textLight }}
            >
              <div
                className="w-6 h-10 rounded-full border-2 relative"
                style={{ borderColor: colors.textLight }}
              >
                <div
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-2 rounded-full animate-scroll"
                  style={{ background: colors.secondaryBeige }}
                />
              </div>
              <span className="text-sm">Scroll</span>
            </div>
          </div>
        </section>

        {/* À propos */}
        {checkSectionVisible("about") && (
          <section
            id="about"
            className="py-20 px-4 sm:px-6 lg:px-8"
            style={{ background: colors.cream }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: `rgba(129, 84, 67, 0.1)`,
                    color: colors.primaryLight,
                  }}
                >
                  Qui suis-je ?
                </span>
                <h2
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: colors.primaryDark }}
                >
                  À propos
                </h2>
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
                    className="mt-4 px-4 py-2 text-sm font-medium rounded-lg border transition-all hover:shadow-md"
                    style={{
                      backgroundColor: useCustomAbout
                        ? "rgba(129, 84, 67, 0.1)"
                        : "rgba(129, 84, 67, 0.05)",
                      borderColor: useCustomAbout
                        ? colors.primaryLight
                        : colors.primaryDark,
                      color: useCustomAbout
                        ? colors.textDark
                        : colors.primaryDark,
                    }}
                    title={
                      useCustomAbout
                        ? "Utiliser la bio du profil"
                        : "Passer en mode personnalisé"
                    }
                  >
                    {useCustomAbout ? "Bio profil" : "Personnaliser"}
                  </button>
                )}
              </div>

              {useCustomAbout && aboutImageUrl ? (
                // Mode personnalisé : texte + image
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
                  <div className="relative">
                    {aboutImageUrl && (
                      <div className="relative group">
                        <img
                          src={
                            getAbsoluteImageUrl(aboutImageUrl) ||
                            heroImageUrl(aboutImageUrl) ||
                            aboutImageUrl ||
                            undefined
                          }
                          alt="À propos"
                          className="w-full aspect-square rounded-2xl shadow-2xl object-cover"
                        />
                        {isEditable && onHeroOverridesChange && (
                          <button
                            onClick={() => aboutImageInputRef.current?.click()}
                            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all opacity-0 group-hover:opacity-100"
                            style={{
                              backgroundColor: colors.primaryDark,
                              borderColor: colors.primaryLight,
                              color: colors.textLight,
                            }}
                            title="Modifier l'image"
                          >
                            <ImageIcon size={14} className="inline mr-1" />
                            Modifier
                          </button>
                        )}
                        {isEditable && onHeroOverridesChange && (
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
                                const response = await fetch(
                                  `${API_URL}/api/portfolio/about-image`,
                                  {
                                    method: "POST",
                                    credentials: "include",
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                                    },
                                    body: formData,
                                  },
                                );
                                const data = await response.json();
                                if (data.about_image_url) {
                                  onHeroOverridesChange({
                                    ...(templateOverrides || {}),
                                    about_image_url: data.about_image_url,
                                  });
                                }
                              } catch (err) {
                                console.error("Upload about image:", err);
                              } finally {
                                setAboutImageUploading(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="space-y-4 text-lg"
                    style={{ color: colors.textDark }}
                  >
                    <h3
                      className="text-2xl font-bold mb-4"
                      style={{ color: colors.primaryDark }}
                    >
                      Qui suis-je ?
                    </h3>
                    {isEditable && onHeroOverridesChange ? (
                      <textarea
                        ref={aboutTextareaRef}
                        value={aboutText}
                        onChange={(e) => {
                          setEditingValue(e.target.value);
                          if (onHeroOverridesChange) {
                            onHeroOverridesChange({
                              ...(templateOverrides || {}),
                              about_text: e.target.value,
                            });
                          }
                        }}
                        className="w-full p-4 rounded-lg border min-h-[320px] resize-y"
                        style={{
                          borderColor: colors.primaryLight,
                          color: colors.textDark,
                          minHeight: "20rem",
                        }}
                        rows={18}
                        placeholder="Votre texte personnalisé..."
                      />
                    ) : (
                      <p className="portfolio-section-intro leading-relaxed whitespace-pre-line">
                        {aboutText ||
                          "Votre texte personnalisé apparaîtra ici."}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Mode bio profil : texte uniquement, pas d'image
                <div className="mb-12">
                  <div className="max-w-3xl mx-auto">
                    <div
                      className="space-y-4 text-lg text-center"
                      style={{ color: colors.textDark }}
                    >
                      <h3
                        className="text-2xl font-bold mb-4"
                        style={{ color: colors.primaryDark }}
                      >
                        Qui suis-je ?
                      </h3>
                      {isEditable && onHeroOverridesChange ? (
                        <textarea
                          value={aboutText}
                          onChange={(e) => {
                            if (onHeroOverridesChange) {
                              onHeroOverridesChange({
                                ...(templateOverrides || {}),
                                about_text: e.target.value,
                              });
                            }
                          }}
                          className="w-full p-4 rounded-lg border min-h-[320px] resize-y text-left"
                          style={{
                            borderColor: colors.primaryLight,
                            color: colors.textDark,
                            minHeight: "20rem",
                          }}
                          rows={18}
                          placeholder="Votre bio professionnelle apparaîtra ici."
                        />
                      ) : (
                        <p className="portfolio-section-intro leading-relaxed whitespace-pre-line">
                          {aboutText ||
                            "Votre bio professionnelle apparaîtra ici."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights Section Title & Description */}
              <div className="text-center mb-8 mt-12">
                {isEditable && editingSectionTitle ? (
                  <input
                    type="text"
                    value={highlightsSectionTitle}
                    onChange={(e) => {
                      if (onHeroOverridesChange) {
                        onHeroOverridesChange({
                          ...(templateOverrides || {}),
                          template6_highlights_title: e.target.value,
                        });
                      }
                    }}
                    onBlur={() => setEditingSectionTitle(false)}
                    className="text-3xl md:text-4xl font-bold mb-4 p-2 rounded border text-center"
                    style={{ color: colors.primaryDark }}
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-3xl md:text-4xl font-bold mb-4 cursor-pointer"
                    style={{ color: colors.primaryDark }}
                    onClick={
                      isEditable
                        ? () => setEditingSectionTitle(true)
                        : undefined
                    }
                  >
                    {highlightsSectionTitle}
                  </h2>
                )}
                {isEditable && editingSectionDescription ? (
                  <textarea
                    value={highlightsSectionDescription}
                    onChange={(e) => {
                      if (onHeroOverridesChange) {
                        onHeroOverridesChange({
                          ...(templateOverrides || {}),
                          template6_highlights_description: e.target.value,
                        });
                      }
                    }}
                    onBlur={() => setEditingSectionDescription(false)}
                    className="text-lg p-2 rounded border text-center w-full max-w-2xl mx-auto resize-none"
                    style={{ color: colors.textGray }}
                    rows={2}
                    autoFocus
                  />
                ) : (
                  <p
                    className="portfolio-section-intro text-lg cursor-pointer"
                    style={{ color: colors.textGray }}
                    onClick={
                      isEditable
                        ? () => setEditingSectionDescription(true)
                        : undefined
                    }
                  >
                    {highlightsSectionDescription}
                  </p>
                )}
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {highlights.map((highlight, idx) => {
                  const IconComponent =
                    (LucideIcons as any)[highlight.icon] || Code;

                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl text-center transition-all hover:-translate-y-1 ${isEditable ? "relative group" : ""}`}
                      style={{
                        background: `rgba(129, 84, 67, 0.05)`,
                      }}
                      onClick={(e) => {
                        // Empêcher le clic sur le conteneur d'interférer avec les boutons
                        if ((e.target as HTMLElement).closest("button")) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {isEditable &&
                      editingHighlightIndex === idx &&
                      editingHighlightField === "icon" ? (
                        <div className="mb-4 z-50 relative">
                          <IconSelector
                            selectedIcon={highlight.icon}
                            onSelectIcon={(iconName) => {
                              if (iconName) {
                                updateHighlight(idx, "icon", iconName);
                              }
                              setEditingHighlightIndex(null);
                              setEditingHighlightField(null);
                            }}
                            className="bg-white p-4 rounded-lg shadow-lg border"
                          />
                        </div>
                      ) : (
                        <div className="relative flex justify-center mb-4">
                          <IconComponent
                            size={40}
                            style={{ color: colors.primaryLight }}
                          />
                          {isEditable && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingHighlightIndex(idx);
                                setEditingHighlightField("icon");
                              }}
                              className="absolute -top-1 -right-1 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all z-10"
                              style={{ color: colors.primaryDark }}
                              title="Modifier l'icône"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                      )}
                      {isEditable &&
                      editingStateRef.current.index === idx &&
                      editingStateRef.current.field === "title" ? (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 justify-center">
                            <input
                              type="text"
                              value={editingHighlightValue}
                              onChange={(e) => {
                                e.stopPropagation();
                                setEditingHighlightValue(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") {
                                  if (
                                    editingHighlightValue.trim() !==
                                    highlight.title
                                  ) {
                                    updateHighlight(
                                      idx,
                                      "title",
                                      editingHighlightValue.trim() ||
                                        highlight.title,
                                    );
                                  }
                                  editingStateRef.current = {
                                    index: null,
                                    field: null,
                                  };
                                  setEditingHighlightIndex(null);
                                  setEditingHighlightField(null);
                                  setEditingHighlightValue("");
                                  setForceRender((prev) => prev + 1);
                                }
                                if (e.key === "Escape") {
                                  editingStateRef.current = {
                                    index: null,
                                    field: null,
                                  };
                                  setEditingHighlightIndex(null);
                                  setEditingHighlightField(null);
                                  setEditingHighlightValue("");
                                  setForceRender((prev) => prev + 1);
                                }
                              }}
                              className="text-lg font-bold p-2 rounded border text-center"
                              style={{ color: colors.primaryDark }}
                              autoFocus
                              ref={(input) => {
                                if (input && inputRef.current !== input) {
                                  inputRef.current = input;
                                  // Sauvegarder la position de scroll avant le focus
                                  const scrollY = window.scrollY;
                                  // Placer le curseur à la fin au lieu de tout sélectionner
                                  requestAnimationFrame(() => {
                                    setTimeout(() => {
                                      input.focus({ preventScroll: true });
                                      const len = input.value.length;
                                      input.setSelectionRange(len, len);
                                      // Restaurer la position de scroll immédiatement
                                      requestAnimationFrame(() => {
                                        window.scrollTo({
                                          top: scrollY,
                                          behavior: "instant",
                                        });
                                      });
                                    }, 10);
                                  });
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  editingHighlightValue.trim() !==
                                  highlight.title
                                ) {
                                  updateHighlight(
                                    idx,
                                    "title",
                                    editingHighlightValue.trim() ||
                                      highlight.title,
                                  );
                                }
                                editingStateRef.current = {
                                  index: null,
                                  field: null,
                                };
                                setEditingHighlightIndex(null);
                                setEditingHighlightField(null);
                                setEditingHighlightValue("");
                              }}
                              className="p-1 rounded bg-green-500 text-white"
                              title="Sauvegarder"
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative mb-2">
                          <div className="flex justify-center items-center gap-2">
                            <h4
                              className="portfolio-font-item text-lg font-bold"
                              style={{ color: colors.primaryDark }}
                            >
                              {highlight.title}
                            </h4>
                            {isEditable && (
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.nativeEvent.stopImmediatePropagation();
                                  if (
                                    editingStateRef.current.index === idx &&
                                    editingStateRef.current.field === "title"
                                  ) {
                                    return;
                                  }
                                  editingStateRef.current = {
                                    index: idx,
                                    field: "title",
                                  };
                                  setEditingHighlightValue(highlight.title);
                                  setEditingHighlightIndex(idx);
                                  setEditingHighlightField("title");
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.nativeEvent.stopImmediatePropagation();
                                }}
                                className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all relative z-20"
                                style={{ color: colors.primaryDark }}
                                title="Modifier le titre"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {isEditable &&
                      editingHighlightIndex === idx &&
                      editingHighlightField === "description" ? (
                        <div>
                          <textarea
                            value={highlight.description}
                            onChange={(e) =>
                              updateHighlight(
                                idx,
                                "description",
                                e.target.value,
                              )
                            }
                            onBlur={() => {
                              setEditingHighlightIndex(null);
                              setEditingHighlightField(null);
                            }}
                            className="w-full text-sm p-2 rounded border resize-none text-center"
                            style={{ color: colors.textGray }}
                            rows={2}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="relative flex justify-center items-center gap-2">
                          <p
                            className="portfolio-section-intro text-sm"
                            style={{ color: colors.textGray }}
                          >
                            {highlight.description}
                          </p>
                          {isEditable && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingHighlightIndex(idx);
                                setEditingHighlightField("description");
                              }}
                              className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all z-10"
                              style={{ color: colors.primaryDark }}
                              title="Modifier la description"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Parcours (Timeline bifurquée) */}
        {checkSectionVisible("experiences") &&
          checkSectionVisible("education") && (
            <section
              id="parcours"
              className="py-20 px-4 sm:px-6 lg:px-8 relative"
              style={{
                background: `linear-gradient(to bottom, ${colors.cream} 0%, rgba(210, 189, 177, 0.1) 100%)`,
              }}
            >
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <span
                    className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{
                      background: `rgba(129, 84, 67, 0.1)`,
                      color: colors.primaryLight,
                    }}
                  >
                    Mon Histoire
                  </span>
                  <h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: colors.primaryDark }}
                  >
                    Mon Parcours
                  </h2>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Ligne centrale */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 w-1 top-0 bottom-0 rounded"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryLight} 100%)`,
                    }}
                  />

                  {/* Combiner formations et expériences par date */}
                  {[...educations, ...experiences]
                    .sort((a, b) => {
                      const dateA = new Date(a.start_date || 0).getTime();
                      const dateB = new Date(b.start_date || 0).getTime();
                      return dateB - dateA;
                    })
                    .slice(0, 8)
                    .map((item, idx) => {
                      const isEducation = "school" in item;
                      const isLeft = idx % 2 === 0;

                      return (
                        <div
                          key={item.id}
                          className={`flex ${isLeft ? "justify-start" : "justify-end"} mb-10 relative`}
                        >
                          <div
                            className={`w-[80%] max-w-md rounded-2xl p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl relative ${
                              isLeft ? "text-right" : "text-left"
                            }`}
                            style={{
                              background: "white",
                              border: `2px solid transparent`,
                            }}
                          >
                            <div
                              className={`absolute top-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                isLeft
                                  ? "right-0 translate-x-1/2 -translate-y-1/2"
                                  : "left-0 -translate-x-1/2 -translate-y-1/2"
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryLight} 100%)`,
                                color: colors.textLight,
                              }}
                            >
                              {isEducation ? (
                                <GraduationCap size={24} />
                              ) : (
                                <Briefcase size={24} />
                              )}
                            </div>
                            <small
                              className="portfolio-font-item-small block font-semibold mb-2"
                              style={{ color: colors.primaryLight }}
                            >
                              {formatExperiencePeriod(
                                item.start_date,
                                item.end_date,
                                "is_current" in item ? item.is_current : false,
                              )}
                            </small>
                            <h4
                              className="portfolio-font-item text-xl font-bold mb-2"
                              style={{ color: colors.primaryDark }}
                            >
                              {isEducation ? item.school : item.company}
                            </h4>
                            <p
                              className="portfolio-font-item"
                              style={{ color: colors.textDark }}
                            >
                              {isEducation ? item.degree : item.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

        {/* Projets */}
        {checkSectionVisible("projects") && orderedProjects.length > 0 && (
          <section
            id="projects"
            className="py-20 px-4 sm:px-6 lg:px-8"
            style={{ background: colors.cream }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: `rgba(129, 84, 67, 0.1)`,
                    color: colors.primaryLight,
                  }}
                >
                  Mes réalisations
                </span>
                <h2
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: colors.primaryDark }}
                >
                  Projets
                </h2>
              </div>

              {/* Carousel Projets */}
              <div className="relative">
                {orderedProjects.length > 3 && (
                  <>
                    <button
                      onClick={() =>
                        setProjectsCarouselIndex(
                          Math.max(0, projectsCarouselIndex - 1),
                        )
                      }
                      disabled={projectsCarouselIndex === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
                      style={{
                        background: colors.primaryDark,
                        color: colors.textLight,
                      }}
                      aria-label="Précédent"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() =>
                        setProjectsCarouselIndex(
                          Math.min(
                            Math.ceil(orderedProjects.length / 3) - 1,
                            projectsCarouselIndex + 1,
                          ),
                        )
                      }
                      disabled={
                        projectsCarouselIndex >=
                        Math.ceil(orderedProjects.length / 3) - 1
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
                      style={{
                        background: colors.primaryDark,
                        color: colors.textLight,
                      }}
                      aria-label="Suivant"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="overflow-hidden pl-12 md:pl-16 pr-4">
                  <div
                    className="flex transition-transform duration-500 ease-in-out gap-8"
                    style={{
                      transform: `translateX(-${projectsCarouselIndex * (100 / 3)}%)`,
                    }}
                  >
                    {orderedProjects.map((project: Project) => (
                      <div
                        key={project.id}
                        className="flex-shrink-0 w-full md:w-[calc(33.333%-1.33rem)]"
                      >
                        <div
                          className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-opacity-50 flex flex-col h-full"
                          style={{
                            borderColor: colors.primaryLight,
                            minHeight: "500px",
                          }}
                        >
                          <div
                            className="relative h-64 flex items-center justify-center overflow-hidden group flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accentBrown} 100%)`,
                            }}
                          >
                            {isEditable && project && (
                              <ProjectImageIconEditor
                                project={project}
                                onUpdate={() => {}}
                                isDark={false}
                              />
                            )}
                            {project.project_icon ? (
                              <div className="w-full h-full flex items-center justify-center">
                                {(() => {
                                  const IconComponent =
                                    (LucideIcons as any)[
                                      project.project_icon
                                    ] || Code;
                                  return (
                                    <IconComponent
                                      size={64}
                                      style={{ color: colors.textLight }}
                                    />
                                  );
                                })()}
                              </div>
                            ) : project.url_image ? (
                              <img
                                src={
                                  getAbsoluteImageUrl(project.url_image) ??
                                  undefined
                                }
                                alt={project.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Code
                                size={64}
                                style={{ color: colors.textLight }}
                              />
                            )}
                            {project.url_github && (
                              <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={project.url_github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                  style={{ color: colors.primaryDark }}
                                >
                                  <Github size={32} />
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <h3
                              className="portfolio-font-item text-xl font-bold mb-2"
                              style={{ color: colors.primaryDark }}
                            >
                              {project.name}
                            </h3>
                            {project.technologies &&
                              project.technologies.length > 0 && (
                                <h4
                                  className="text-sm italic mb-3"
                                  style={{ color: colors.primaryLight }}
                                >
                                  {project.technologies[0]}
                                </h4>
                              )}
                            <p
                              className="portfolio-section-intro mb-4 leading-relaxed whitespace-pre-line flex-grow"
                              style={{ color: colors.textDark }}
                            >
                              {(project.description || "Aucune description.")
                                .replace(/^-\s+/gm, "→ ")
                                .replace(/\n-\s+/g, "\n→ ")}
                            </p>
                            {project.url_github && (
                              <a
                                href={project.url_github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 mt-auto"
                                style={{
                                  borderColor: colors.primaryLight,
                                  color: colors.primaryDark,
                                }}
                              >
                                <Github size={18} />
                                Dépôt GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Compétences */}
        {checkSectionVisible("skills") && orderedSkills.length > 0 && (
          <section
            id="skills"
            className="py-20 px-4 sm:px-6 lg:px-8"
            style={{ background: colors.cream }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: `rgba(129, 84, 67, 0.1)`,
                    color: colors.primaryLight,
                  }}
                >
                  Mes atouts
                </span>
                <h2
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: colors.primaryDark }}
                >
                  Compétences Techniques
                </h2>
              </div>

              {isEditable && onItemOrderChange && orderedSkills.length > 0 ? (
                <DragAndDropList
                  items={orderedSkills}
                  onReorder={(reorderedSkills) => {
                    const newOrder = getItemOrder(
                      reorderedSkills,
                      (s) => s.id || s.name,
                    );
                    onItemOrderChange({
                      ...itemOrder,
                      skills: newOrder,
                    });
                  }}
                  getItemId={(s) => s.id || s.name}
                  disabled={!isEditable}
                  className="flex flex-wrap justify-center gap-6"
                  strategy="grid"
                  buttonSize="small"
                  renderItem={(skill: Skill) => (
                    <div
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110"
                      style={{
                        background: "white",
                        boxShadow: "0 4px 15px rgba(94, 41, 51, 0.1)",
                      }}
                    >
                      <SkillIcon
                        skillName={skill.name}
                        size={48}
                        useBadge={true}
                        showLabel={false}
                      />
                      <span
                        className="text-sm font-semibold text-center"
                        style={{ color: colors.textDark }}
                      >
                        {skill.name}
                      </span>
                    </div>
                  )}
                />
              ) : (
                <div className="flex flex-wrap justify-center gap-6">
                  {orderedSkills.map((skill: Skill) => (
                    <div
                      key={skill.id || skill.name}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110"
                      style={{
                        background: "white",
                        boxShadow: "0 4px 15px rgba(94, 41, 51, 0.1)",
                      }}
                    >
                      <SkillIcon
                        skillName={skill.name}
                        size={48}
                        useBadge={true}
                        showLabel={false}
                      />
                      <span
                        className="text-sm font-semibold text-center"
                        style={{ color: colors.textDark }}
                      >
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Langues */}
              {checkSectionVisible("languages") &&
                orderedLanguages.length > 0 && (
                  <>
                    <h3
                      className="portfolio-font-subtitle text-center text-2xl font-bold mt-16 mb-8"
                      style={{ color: colors.primaryDark }}
                    >
                      Langues
                    </h3>
                    {isEditable && onItemOrderChange ? (
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
                        className="flex flex-wrap justify-center gap-6"
                        strategy="grid"
                        buttonSize="small"
                        renderItem={(lang: Language) => (
                          <div
                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110"
                            style={{
                              background: "white",
                              boxShadow: "0 4px 15px rgba(94, 41, 51, 0.1)",
                            }}
                          >
                            <Globe
                              size={48}
                              style={{ color: colors.primaryLight }}
                            />
                            <span
                              className="text-sm font-semibold text-center"
                              style={{ color: colors.textDark }}
                            >
                              {lang.name}
                            </span>
                            {lang.level && (
                              <span
                                className="text-xs"
                                style={{ color: colors.textGray }}
                              >
                                {lang.level}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    ) : (
                      <div className="flex flex-wrap justify-center gap-6">
                        {orderedLanguages.map((lang: Language) => (
                          <div
                            key={lang.id}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110"
                            style={{
                              background: "white",
                              boxShadow: "0 4px 15px rgba(94, 41, 51, 0.1)",
                            }}
                          >
                            <Globe
                              size={48}
                              style={{ color: colors.primaryLight }}
                            />
                            <span
                              className="text-sm font-semibold text-center"
                              style={{ color: colors.textDark }}
                            >
                              {lang.name}
                            </span>
                            {lang.level && (
                              <span
                                className="text-xs"
                                style={{ color: colors.textGray }}
                              >
                                {lang.level}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

              {/* Certifications */}
              {checkSectionVisible("certifications") &&
                orderedCertifications.length > 0 && (
                  <>
                    <h3
                      className="portfolio-font-subtitle text-center text-2xl font-bold mt-16 mb-8"
                      style={{ color: colors.primaryDark }}
                    >
                      Certifications
                    </h3>
                    {isEditable && onItemOrderChange ? (
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
                        className="flex flex-wrap justify-center gap-6"
                        strategy="grid"
                        buttonSize="small"
                        renderItem={(cert: Certification) => (
                          <div
                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110"
                            style={{
                              background: "white",
                              boxShadow: "0 4px 15px rgba(94, 41, 51, 0.1)",
                            }}
                          >
                            <Award
                              size={48}
                              style={{ color: colors.primaryLight }}
                            />
                            <span
                              className="text-sm font-semibold text-center"
                              style={{ color: colors.textDark }}
                            >
                              {cert.name}
                            </span>
                            {cert.issuer && (
                              <span
                                className="text-xs"
                                style={{ color: colors.textGray }}
                              >
                                {cert.issuer}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    ) : (
                      <div className="flex flex-wrap justify-center gap-6">
                        {orderedCertifications.map((cert: Certification) => (
                          <div
                            key={cert.id}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110"
                            style={{
                              background: "white",
                              boxShadow: "0 4px 15px rgba(94, 41, 51, 0.1)",
                            }}
                          >
                            <Award
                              size={48}
                              style={{ color: colors.primaryLight }}
                            />
                            <span
                              className="text-sm font-semibold text-center"
                              style={{ color: colors.textDark }}
                            >
                              {cert.name}
                            </span>
                            {cert.issuer && (
                              <span
                                className="text-xs"
                                style={{ color: colors.textGray }}
                              >
                                {cert.issuer}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
            </div>
          </section>
        )}

        {/* Formation */}
        {checkSectionVisible("education") && educations.length > 0 && (
          <section
            id="formation"
            className="py-20 px-4 sm:px-6 lg:px-8"
            style={{ background: colors.cream }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: `rgba(129, 84, 67, 0.1)`,
                    color: colors.primaryLight,
                  }}
                >
                  Mes études
                </span>
                <h2
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: colors.primaryDark }}
                >
                  Formation
                </h2>
              </div>

              {/* Carousel Formations */}
              <div className="relative">
                {educations.length > 3 && (
                  <>
                    <button
                      onClick={() =>
                        setEducationsCarouselIndex(
                          Math.max(0, educationsCarouselIndex - 1),
                        )
                      }
                      disabled={educationsCarouselIndex === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
                      style={{
                        background: colors.primaryDark,
                        color: colors.textLight,
                      }}
                      aria-label="Précédent"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() =>
                        setEducationsCarouselIndex(
                          Math.min(
                            Math.ceil(educations.length / 3) - 1,
                            educationsCarouselIndex + 1,
                          ),
                        )
                      }
                      disabled={
                        educationsCarouselIndex >=
                        Math.ceil(educations.length / 3) - 1
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
                      style={{
                        background: colors.primaryDark,
                        color: colors.textLight,
                      }}
                      aria-label="Suivant"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="overflow-hidden pl-12 md:pl-16 pr-4">
                  <div
                    className="flex transition-transform duration-500 ease-in-out gap-8"
                    style={{
                      transform: `translateX(-${educationsCarouselIndex * (100 / 3)}%)`,
                    }}
                  >
                    {educations.map((edu: Education) => (
                      <div
                        key={edu.id}
                        className="flex-shrink-0 w-full md:w-[calc(33.333%-1.33rem)]"
                      >
                        <div
                          className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-opacity-50 flex flex-col h-full"
                          style={{
                            borderColor: colors.primaryLight,
                            minHeight: "350px",
                          }}
                        >
                          <div
                            className="p-6 flex items-center justify-center h-32 flex-shrink-0"
                            style={{
                              background: `${colors.primaryDark}15`,
                            }}
                          >
                            {showLogos ? (
                              <Logo
                                name={edu.school}
                                type="school"
                                size={96}
                                showFallback={false}
                              />
                            ) : (
                              <GraduationCap
                                size={64}
                                style={{ color: colors.primaryLight }}
                              />
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <h3
                              className="portfolio-font-item text-xl font-bold mb-2"
                              style={{ color: colors.primaryDark }}
                            >
                              {edu.school}
                            </h3>
                            <h4
                              className="portfolio-font-item text-sm font-semibold mb-2"
                              style={{ color: colors.primaryLight }}
                            >
                              {edu.degree}
                            </h4>
                            <p
                              className="text-sm mb-3"
                              style={{ color: colors.textDark }}
                            >
                              {formatExperiencePeriod(
                                edu.start_date,
                                edu.end_date,
                                false,
                              )}
                            </p>
                            {edu.grade && (
                              <p
                                className="portfolio-section-intro text-xs mt-auto"
                                style={{ color: colors.textGray }}
                              >
                                {edu.grade}
                              </p>
                            )}
                            {edu.field_of_study && (
                              <p
                                className="portfolio-section-intro text-sm mt-1"
                                style={{ color: colors.textGray }}
                              >
                                {edu.field_of_study}
                              </p>
                            )}
                            {edu.description && (
                              <p
                                className="portfolio-section-intro text-sm mt-1 whitespace-pre-line"
                                style={{ color: colors.textGray }}
                              >
                                {edu.description
                                  .replace(/^-\s+/gm, "→ ")
                                  .replace(/\n-\s+/g, "\n→ ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Expérience */}
        {checkSectionVisible("experiences") && experiences.length > 0 && (
          <section
            id="experience"
            className="py-20 px-4 sm:px-6 lg:px-8"
            style={{ background: colors.cream }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: `rgba(129, 84, 67, 0.1)`,
                    color: colors.primaryLight,
                  }}
                >
                  Mon parcours professionnel
                </span>
                <h2
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: colors.primaryDark }}
                >
                  Expérience Professionnelle
                </h2>
              </div>

              {/* Carousel Expériences */}
              <div className="relative">
                {experiences.length > 3 && (
                  <>
                    <button
                      onClick={() =>
                        setExperiencesCarouselIndex(
                          Math.max(0, experiencesCarouselIndex - 1),
                        )
                      }
                      disabled={experiencesCarouselIndex === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
                      style={{
                        background: colors.primaryDark,
                        color: colors.textLight,
                      }}
                      aria-label="Précédent"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() =>
                        setExperiencesCarouselIndex(
                          Math.min(
                            Math.ceil(experiences.length / 3) - 1,
                            experiencesCarouselIndex + 1,
                          ),
                        )
                      }
                      disabled={
                        experiencesCarouselIndex >=
                        Math.ceil(experiences.length / 3) - 1
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
                      style={{
                        background: colors.primaryDark,
                        color: colors.textLight,
                      }}
                      aria-label="Suivant"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="overflow-hidden pl-12 md:pl-16 pr-4">
                  <div
                    className="flex transition-transform duration-500 ease-in-out gap-8"
                    style={{
                      transform: `translateX(-${experiencesCarouselIndex * (100 / 3)}%)`,
                    }}
                  >
                    {experiences.map((exp: Experience) => (
                      <div
                        key={exp.id}
                        className="flex-shrink-0 w-full md:w-[calc(33.333%-1.33rem)]"
                      >
                        <div
                          className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-opacity-50 flex flex-col h-full"
                          style={{
                            borderColor: colors.primaryLight,
                            minHeight: "400px",
                          }}
                        >
                          <div
                            className="p-6 flex items-center justify-center h-32 flex-shrink-0"
                            style={{
                              background: `${colors.primaryDark}15`,
                            }}
                          >
                            {showLogos ? (
                              <Logo
                                name={exp.company}
                                type="company"
                                size={96}
                                showFallback={false}
                              />
                            ) : (
                              <Briefcase
                                size={64}
                                style={{ color: colors.primaryLight }}
                              />
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <h3
                              className="portfolio-font-item text-xl font-bold mb-2"
                              style={{ color: colors.primaryDark }}
                            >
                              {exp.title}
                            </h3>
                            <h4
                              className="portfolio-font-item-small text-sm font-semibold mb-2"
                              style={{ color: colors.primaryLight }}
                            >
                              {exp.company}
                            </h4>
                            <p
                              className="text-sm italic mb-3"
                              style={{ color: colors.textGray }}
                            >
                              {formatExperiencePeriod(
                                exp.start_date,
                                exp.end_date,
                                exp.is_current,
                              )}
                            </p>
                            {exp.description && (
                              <p
                                className="portfolio-section-intro text-sm leading-relaxed whitespace-pre-line flex-grow"
                                style={{ color: colors.textDark }}
                              >
                                {exp.description
                                  .replace(/^-\s+/gm, "→ ")
                                  .replace(/\n-\s+/g, "\n→ ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Styles CSS pour animations */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scroll {
          0% { top: 8px; opacity: 1; }
          100% { top: 24px; opacity: 0; }
        }
      `}</style>

      {/* Section Centres d'intérêt */}
      {checkSectionVisible("interests") && orderedInterests.length > 0 && (
        <section
          id="interests"
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ background: colors.cream }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span
                className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                style={{
                  background: `rgba(129, 84, 67, 0.1)`,
                  color: colors.primaryLight,
                }}
              >
                Centres d'intérêt
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: colors.primaryDark }}
              >
                Ce qui me{" "}
                <span style={{ color: colors.primaryLight }}>motive</span>
              </h2>
              <p
                className="portfolio-section-intro text-lg max-w-2xl mx-auto"
                style={{ color: colors.textGray }}
              >
                Domaines et sujets qui nourrissent ma curiosité et ma motivation
                au quotidien.
              </p>
            </div>

            <div className="flex justify-center">
              {isEditable && onItemOrderChange ? (
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
                  className="flex flex-wrap gap-4 justify-center"
                  strategy="grid"
                  buttonSize="small"
                  renderItem={(interest: Interest) => (
                    <div
                      key={interest.id}
                      className="px-6 py-3 rounded-xl border-2 transition-all hover:scale-105 flex items-center gap-2"
                      style={{
                        borderColor: colors.primaryLight,
                        background: `${colors.primaryLight}10`,
                        color: colors.primaryDark,
                      }}
                    >
                      <Heart size={18} style={{ color: colors.primaryLight }} />
                      <span className="portfolio-font-item font-medium">
                        {interest.name}
                      </span>
                    </div>
                  )}
                />
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  {orderedInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="px-6 py-3 rounded-xl border-2 transition-all hover:scale-105 flex items-center gap-2"
                      style={{
                        borderColor: colors.primaryLight,
                        background: `${colors.primaryLight}10`,
                        color: colors.primaryDark,
                      }}
                    >
                      <Heart size={18} style={{ color: colors.primaryLight }} />
                      <span className="portfolio-font-item font-medium">
                        {interest.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section Contact */}
      {checkSectionVisible("contact") && (
        <section
          id="contact"
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ background: colors.cream }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <span
                className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
                style={{
                  background: `rgba(129, 84, 67, 0.1)`,
                  color: colors.primaryLight,
                }}
              >
                Contact
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: colors.primaryDark }}
              >
                Prêt à{" "}
                <span style={{ color: colors.primaryLight }}>collaborer</span> ?
              </h2>
              <p
                className="portfolio-section-intro text-lg max-w-2xl mx-auto"
                style={{ color: colors.textGray }}
              >
                Je suis toujours à la recherche de nouveaux défis techniques et
                de projets innovants.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="portfolio-font-item px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center gap-3"
                  style={{
                    background: colors.primaryDark,
                    color: colors.textLight,
                  }}
                >
                  <Mail size={20} />
                  Envoyer un message
                </a>
              )}
            </div>

            <div className="flex justify-center gap-6 mb-8">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{
                    background: colors.primaryDark,
                    color: colors.textLight,
                  }}
                  title="GitHub"
                >
                  <Github size={24} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{
                    background: colors.primaryDark,
                    color: colors.textLight,
                  }}
                  title="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{
                    background: colors.primaryDark,
                    color: colors.textLight,
                  }}
                  title="Email"
                >
                  <Mail size={24} />
                </a>
              )}
            </div>

            <div
              className="pt-8 border-t"
              style={{ borderColor: `${colors.primaryLight}33` }}
            >
              <p
                className="portfolio-footer-text portfolio-section-intro text-sm"
                style={{ color: colors.textGray }}
              >
                © {new Date().getFullYear()} {fullName || "PortfoliA"}. Tous
                droits réservés.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
