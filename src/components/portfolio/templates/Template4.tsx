import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Camera,
  Plus,
  Pencil,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
} from "lucide-react";
import { API_URL, portfolioAPI } from "../../../services/api";
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
  getVisibleSectionsInOrder,
  getFontFamilyForRole,
} from "./templateUtils";
import { HeroEditHint } from "./HeroEditHint";
import { Logo } from "../../Logo";
import { ProjectImageIconEditor } from "../ProjectImageIconEditor";
import { CVButton } from "../CVButton";
import { HeroBackgroundLayer } from "../HeroBackgroundLayer";
import { SkillIcon } from "./SkillIcon";
import { getAbsoluteImageUrl } from "../../../utils/imageUrl";
import * as LucideIcons from "lucide-react";
import { DragAndDropList } from "../DragAndDropList";
import { applyItemOrder, getItemOrder } from "../../../utils/itemOrder";

const ACCENT = "#FF3300";
const GRID_COLOR = "#d4d4d4";

/** URL absolue pour une image (ex: /uploads/... → API_URL + path) */
function heroImageUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

interface Template4Props {
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

export const Template4: React.FC<Template4Props> = ({
  user,
  profile,
  experiences = [],
  educations = [],
  projects = [],
  skills = [],
  languages = [],
  certifications = [],
  interests = [],
  customization,
  templateOverrides,
  isEditable = false,
  onHeroOverridesChange,
  isPreview = false,
  showLogos = true,
  itemOrder,
  onItemOrderChange,
}) => {
  const [editingField, setEditingField] = useState<
    "badge" | "title" | "subtitle" | "bio" | "contact_cta" | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  // Refs pour la section "À propos" personnalisée
  const aboutTextareaRef = useRef<HTMLTextAreaElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [, setAboutImageUploading] = useState(false);

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

  const checkSectionVisible = (sectionId: string) =>
    isSectionVisible(sectionId, customization);
  const visibleSectionsInOrder = getVisibleSectionsInOrder(customization);

  /** Blocs réordonnables (sans changer la structure : lignes/colonnes). Ordre = toolbar drag-and-drop. */
  const blockIds = [
    "about",
    "experiences",
    "projects",
    "stack",
    "contact",
  ] as const;
  type Template4BlockId = (typeof blockIds)[number];
  const stackSectionIds = [
    "education",
    "skills",
    "languages",
    "certifications",
    "interests",
  ];
  const sectionOrderIndex = (sectionId: string) => {
    const i = visibleSectionsInOrder.findIndex((s) => s.id === sectionId);
    return i >= 0 ? i : 999;
  };
  const blockOrderIndex = (blockId: string) => {
    if (blockId === "stack") {
      return Math.min(...stackSectionIds.map((id) => sectionOrderIndex(id)));
    }
    return sectionOrderIndex(blockId);
  };
  const orderedBlocks = [...blockIds].sort(
    (a, b) => blockOrderIndex(a) - blockOrderIndex(b),
  );

  /** Numéros 01., 02., 03., 04. (et 05. si stack en dernière position) selon l'ordre des blocs */
  const getBlockNumbers = (
    blockId: Template4BlockId,
  ): [string, string | null] => {
    const pos = orderedBlocks.indexOf(blockId);
    if (pos < 0) return ["01.", null];
    const n1 = String(pos + 1).padStart(2, "0") + ".";
    if (blockId === "stack") {
      const n2 = String(pos + 2).padStart(2, "0") + ".";
      return [n1, n2];
    }
    return [n1, null];
  };

  // Hero : exactement comme Template 1 — hero_title (override) > profile.title > full_name
  const heroBadgeText =
    (templateOverrides?.hero_badge_text?.trim() || undefined) ??
    "DISPONIBLE POUR OPPORTUNITÉS";
  const heroBadgeVisible = templateOverrides?.hero_badge_visible !== false;
  const heroTitle =
    (templateOverrides?.hero_title?.trim() || undefined) ??
    profile?.title ??
    user?.full_name ??
    user?.username ??
    "Mon Portfolio";
  const heroBio =
    (templateOverrides?.hero_bio?.trim() || undefined) ?? profile?.bio ?? "";
  const heroSubtitle =
    (templateOverrides?.hero_subtitle?.trim() || undefined) ??
    `Bonjour, je suis ${(user?.full_name || profile?.title || user?.username || "").trim().split(" ")[0] || "Alex"}`;

  const firstName =
    (user?.full_name ?? "").trim().split(/\s+/)[0] || user?.username || "";
  const heroImageSrc = heroImageUrl(
    templateOverrides?.hero_image_url ?? profile?.profile_picture_url ?? null,
  );

  // Section "À propos" : utiliser bio profil ou section personnalisée
  const useCustomAbout = templateOverrides?.about_use_custom === true;
  const aboutText = useCustomAbout
    ? templateOverrides?.about_text || ""
    : profile?.bio || "";
  const aboutImageUrl = useCustomAbout
    ? templateOverrides?.about_image_url
    : null;

  const contactCtaText =
    (templateOverrides?.contact_cta_text?.trim() || undefined) ??
    "Vous avez un projet complexe ou une architecture à optimiser ? Discutons-en.";

  const commitHeroEdit = () => {
    if (!onHeroOverridesChange || editingField === null) return;
    const next = { ...templateOverrides } as Partial<TemplateOverrides>;
    if (editingField === "badge")
      next.hero_badge_text = editingValue.trim() || undefined;
    if (editingField === "title")
      next.hero_title = editingValue.trim() || undefined;
    if (editingField === "subtitle")
      next.hero_subtitle = editingValue.trim() || undefined;
    if (editingField === "bio") next.hero_bio = editingValue;
    if (editingField === "contact_cta")
      next.contact_cta_text = editingValue.trim() || undefined;
    onHeroOverridesChange(next);
    setEditingField(null);
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  // Ajuster automatiquement la hauteur du textarea "À propos"
  useEffect(() => {
    if (aboutTextareaRef.current && isEditable && useCustomAbout) {
      aboutTextareaRef.current.style.height = "auto";
      aboutTextareaRef.current.style.height = `${aboutTextareaRef.current.scrollHeight}px`;
    }
  }, [aboutText, isEditable, useCustomAbout, templateOverrides?.about_layout]);

  // Données comme Template1
  const location = profile?.location || "";
  const email = user?.email || "";
  const githubUrl = profile?.github_url || "";
  const linkedinUrl = profile?.linkedin_url || "";
  const expertise =
    profile?.title?.trim() ||
    (skills.length > 0
      ? skills
          .slice(0, 3)
          .map((s) => s.name)
          .join(" & ")
      : "") ||
    "Développement full stack et ingénierie des données";

  let formattedProjects: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    tags: string[];
    num: string;
    project?: any;
    icon?: string | null;
    image?: string | null;
  }> = [];
  try {
    formattedProjects = (Array.isArray(orderedProjects) ? orderedProjects : [])
      .filter((p: Project) => p?.name || p?.description)
      .map((project: Project, idx: number) => ({
        id: project?.id || `p-${idx}`,
        title: project?.name || "",
        category:
          project?.technologies && Array.isArray(project.technologies)
            ? project.technologies[0] || "Projet"
            : "Projet",
        description: project?.description || "",
        tags:
          project?.technologies && Array.isArray(project.technologies)
            ? project.technologies.slice(0, 3)
            : [],
        num: String(idx + 1).padStart(2, "0"),
        image: project?.url_image || null,
        icon: project?.project_icon || null,
        project: project, // Garder la référence au projet complet pour l'éditeur
      }));
  } catch (error) {
    console.error("❌ [Template4] Erreur formatage projets:", error);
    formattedProjects = [];
  }

  const formattedExperiences = (
    Array.isArray(experiences) ? experiences : []
  ).map((exp, _i) => {
    let details: string[] = [];
    if (
      exp.achievements &&
      Array.isArray(exp.achievements) &&
      exp.achievements.length > 0
    ) {
      details = exp.achievements;
    } else if (exp.description) {
      details = [exp.description];
    }
    const yearStr = exp.is_current
      ? `${new Date(exp.start_date).getFullYear()} — Présent`
      : exp.end_date
        ? `${new Date(exp.start_date).getFullYear()} — ${new Date(exp.end_date).getFullYear()}`
        : `${new Date(exp.start_date).getFullYear()}`;
    return {
      role: exp.title || "Poste",
      company: exp.company || "Entreprise",
      year: yearStr,
      details: details[0] || "",
    };
  });

  const marqueeSkills =
    skills.length > 0
      ? skills.slice(0, 8).map((s) => s.name)
      : [
          "React",
          "Node.js",
          "Python",
          "Architecture Distribuée",
          "Performance",
          "UI Design",
        ];

  if (!user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] text-[#111]">
        <p className="text-lg">Chargement du portfolio...</p>
      </div>
    );
  }

  const maxW = "max-w-[1600px]";
  const fontTitles = getFontFamilyForRole(customization, "titles");
  const fontSubtitles = getFontFamilyForRole(customization, "subtitles");
  const fontItem = getFontFamilyForRole(customization, "item");
  const fontItemSmall = getFontFamilyForRole(customization, "itemSmall");
  const fontBody = getFontFamilyForRole(customization, "body");
  const customFonts = customization?.customFonts ?? [];
  const apiBase = (API_URL || "").replace(/\/$/, "");

  return (
    <div
      data-template="4"
      className="min-h-screen bg-[#F2F2F2] text-[#111] font-sans selection:bg-[#FF3300] selection:text-white overflow-x-hidden"
      style={{
        fontFamily: fontBody,
        ["--font-titles" as string]: fontTitles,
        ["--font-subtitles" as string]: fontSubtitles,
        ["--font-item" as string]: fontItem,
        ["--font-item-small" as string]: fontItemSmall,
        ["--font-body" as string]: fontBody,
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
        [data-template="4"] h1 { font-family: var(--font-titles) !important; }
        [data-template="4"] h2, [data-template="4"] h5, [data-template="4"] h6 { font-family: var(--font-subtitles) !important; }
        [data-template="4"] .text-sm, [data-template="4"] .text-xs { font-family: var(--font-subtitles) !important; }
        [data-template="4"] h3, [data-template="4"] h4, [data-template="4"] p, [data-template="4"] li, [data-template="4"] .text-base { font-family: var(--font-body) !important; }
        [data-template="4"] .portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="4"] .portfolio-font-item-small { font-family: var(--font-item-small) !important; }
        [data-template="4"] .portfolio-nav-title { font-family: var(--font-titles) !important; }
        [data-template="4"] .portfolio-section-intro { font-family: var(--font-body) !important; }
        [data-template="4"] .portfolio-font-subtitle { font-family: var(--font-subtitles) !important; }
      `}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;600;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .bg-grid {
          background-image:
            linear-gradient(to right, ${GRID_COLOR} 1px, transparent 1px),
            linear-gradient(to bottom, ${GRID_COLOR} 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .marquee-container { overflow: hidden; white-space: nowrap; }
        .marquee-content { display: inline-block; animation: marquee 20s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* Header — sticky en preview pour rester visible dans la zone de prévisualisation, fixed en page publique */}
      <header
        className={`left-0 w-full z-50 bg-[#F2F2F2] border-b border-black flex justify-between items-stretch h-16 ${isPreview ? "sticky top-0" : "fixed top-0"}`}
      >
        <div className="flex items-center px-6 border-r border-black bg-white">
          <span className="w-3 h-3 bg-[#FF3300] mr-3 rounded-none" />
          <span className="portfolio-nav-title font-bold tracking-tight text-lg">
            Portfolio
          </span>
        </div>
        <nav className="hidden md:flex flex-1 justify-end items-stretch font-mono text-sm uppercase tracking-wider">
          {[
            { id: "bio", label: "Bio" },
            { id: "projets", label: "Projets" },
            { id: "experience", label: "Expérience" },
            { id: "stack", label: "Compétences" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="px-8 border-l border-black hover:bg-[#FF3300] hover:text-white transition-colors flex items-center"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className="px-8 border-l border-black bg-black text-white hover:bg-[#FF3300] transition-colors flex items-center gap-2"
          >
            Contact{" "}
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
          </button>
          <div className="px-4 border-l border-black flex items-center">
            <CVButton
              cvId={customization?.cvId}
              cvUrl={customization?.cvUrl}
              variant="ghost"
              size="sm"
              className="text-[#111] hover:text-white hover:bg-[#FF3300]"
            />
          </div>
        </nav>
      </header>

      <main
        className={`border-l border-black border-r ${maxW} mx-auto bg-white min-h-screen relative shadow-2xl ${isPreview ? "pt-0" : "pt-16"}`}
      >
        {/* Hero */}
        <section
          id="bio"
          className="min-h-[85vh] flex flex-col relative overflow-hidden"
        >
          <HeroBackgroundLayer
            type={templateOverrides?.hero_background_type ?? "default"}
            imageUrl={templateOverrides?.hero_background_image_url}
            overlayColor="rgb(255,255,255)"
            overlayOpacity={0.8}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          </HeroBackgroundLayer>
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-center relative z-10 w-full">
            <div className="max-w-4xl">
              {/* Badge éditable */}
              {heroBadgeVisible ? (
                <div
                  className={`group/hero-badge relative font-mono text-sm md:text-base text-gray-500 mb-6 flex items-center gap-2 ${isEditable && onHeroOverridesChange ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    isEditable &&
                    onHeroOverridesChange &&
                    (setEditingValue(heroBadgeText), setEditingField("badge"))
                  }
                  role={isEditable ? "button" : undefined}
                >
                  <HeroEditHint
                    show={isEditable && !!onHeroOverridesChange}
                    groupName="hero-badge"
                    position="inline"
                    className="text-[#FF3300]"
                  />
                  <span style={{ color: ACCENT }}>●</span>
                  {editingField === "badge" &&
                  isEditable &&
                  onHeroOverridesChange ? (
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
                      className="flex-1 min-w-[200px] bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#111]"
                    />
                  ) : (
                    <span>{heroBadgeText}</span>
                  )}
                </div>
              ) : null}

              {/* Titre hero — exactement comme Template 1 : hero_title (override) > profile.title > full_name */}
              <h1 className="text-6xl md:text-9xl font-extrabold leading-[0.9] tracking-tighter mb-8 text-black">
                <div className="relative group/hero-title inline-block">
                  <HeroEditHint
                    show={isEditable && !!onHeroOverridesChange}
                    groupName="hero-title"
                    className="text-[#FF3300]"
                  />
                  {editingField === "title" &&
                  isEditable &&
                  onHeroOverridesChange ? (
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
                      className="w-full max-w-md bg-transparent border-b-2 border-black focus:outline-none"
                    />
                  ) : (
                    <span
                      onClick={() =>
                        isEditable &&
                        onHeroOverridesChange &&
                        (setEditingValue(heroTitle), setEditingField("title"))
                      }
                      role={isEditable ? "button" : undefined}
                      className={
                        isEditable ? "cursor-pointer hover:opacity-80" : ""
                      }
                    >
                      {heroTitle}
                    </span>
                  )}
                </div>
              </h1>
              <div className="w-24 h-2 bg-[#FF3300] mb-6" />
              {/* Bonjour, je suis [nom] — éditable (comme Template 5) */}
              <div className="relative group/hero-subtitle mb-6">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-subtitle"
                  position="inline"
                  className="text-[#FF3300] mr-1.5"
                  size={16}
                />
                {editingField === "subtitle" &&
                isEditable &&
                onHeroOverridesChange ? (
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
                    className="text-lg md:text-xl font-medium text-gray-700 bg-transparent border-b-2 border-gray-400 focus:border-[#FF3300] focus:outline-none min-w-[200px]"
                    placeholder="Bonjour, je suis..."
                  />
                ) : (
                  <p
                    className={`text-lg md:text-xl font-medium text-gray-700 ${isEditable && onHeroOverridesChange ? "cursor-pointer hover:underline hover:text-black" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroSubtitle),
                      setEditingField("subtitle"))
                    }
                    role={
                      isEditable && onHeroOverridesChange ? "button" : undefined
                    }
                  >
                    {heroSubtitle}
                  </p>
                )}
              </div>
            </div>
            {/* Bio + photo : photo à droite avec bon padding au bord */}
            <div className="flex items-start justify-between gap-8 w-full mt-0 pr-8 md:pr-12 lg:pr-16 xl:pr-20">
              <div className="relative group/hero-bio min-w-0 flex-1 max-w-2xl">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-bio"
                  className="text-[#FF3300]"
                />
                {editingField === "bio" &&
                isEditable &&
                onHeroOverridesChange ? (
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    autoFocus
                    rows={3}
                    className="w-full text-xl md:text-2xl font-light leading-snug text-gray-800 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FF3300]"
                    placeholder="Petite bio pour le hero..."
                  />
                ) : (
                  <p
                    className={`text-xl md:text-2xl font-light leading-snug text-gray-800 ${isEditable && onHeroOverridesChange ? "cursor-pointer hover:underline" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroBio || ""), setEditingField("bio"))
                    }
                    role={isEditable ? "button" : undefined}
                  >
                    {heroBio ||
                      (isEditable
                        ? "Cliquez pour ajouter une courte bio (visible dans le hero)."
                        : "Je conçois des architectures logicielles robustes et des interfaces précises.")}
                  </p>
                )}
              </div>
              {/* Photo de profil — à droite, modifiable au survol (comme templates 1–3) */}
              <div
                className={`relative group/hero-photo w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#FF3300] bg-gray-200 ${isEditable && onHeroOverridesChange ? "cursor-pointer" : ""}`}
                onClick={() =>
                  isEditable &&
                  onHeroOverridesChange &&
                  heroFileInputRef.current?.click()
                }
                role={
                  isEditable && onHeroOverridesChange ? "button" : undefined
                }
                aria-label={
                  isEditable && onHeroOverridesChange
                    ? "Changer la photo du hero"
                    : undefined
                }
              >
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-photo"
                  className="text-white top-2 right-2 z-10"
                />
                {heroImageSrc ? (
                  <img
                    src={heroImageSrc}
                    alt={firstName || "Photo de profil"}
                    className="w-full h-full object-cover opacity-90 group-hover/hero-photo:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-bold text-gray-500">
                    {(firstName || user?.username || "?")[0].toUpperCase()}
                  </div>
                )}
                {isEditable && onHeroOverridesChange && (
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
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/hero-photo:opacity-100 transition-opacity flex items-center justify-center rounded-full">
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

          {/* Bottom Bar Hero */}
          <div className="border-t border-black grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
            <div className="p-6 flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <span className="font-mono text-xs text-gray-400 uppercase mb-2">
                Localisation
              </span>
              <span className="font-bold text-lg">
                {location || "Paris, France"}
              </span>
            </div>
            <div className="p-6 flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <span className="font-mono text-xs text-gray-400 uppercase mb-2">
                Compétences
              </span>
              <span className="font-bold text-lg">{expertise}</span>
            </div>
            <button
              type="button"
              onClick={() => scrollTo("projets")}
              className="p-6 group bg-black text-white hover:bg-[#FF3300] transition-colors flex justify-between items-center cursor-pointer text-left w-full"
            >
              <span className="font-mono uppercase">Voir le travail</span>
              <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
            </button>
          </div>
        </section>

        {/* Marquee */}
        <div className="border-t border-b border-black bg-[#FF3300] text-white py-3 overflow-hidden font-mono text-sm uppercase font-bold tracking-widest">
          <div className="marquee-container">
            <div className="marquee-content">
              {marqueeSkills.join(" • ")} • {marqueeSkills.join(" • ")}
            </div>
          </div>
        </div>

        {/* Blocs réordonnables : about, experiences, projects, stack, contact — ordre = toolbar drag-and-drop, numéros adaptés */}
        {orderedBlocks.map((blockId) => {
          if (blockId === "about") {
            const [num] = getBlockNumbers("about");
            if (!checkSectionVisible("about")) return null;
            const layout = templateOverrides?.about_layout || "image_top";
            const hasImage = !!aboutImageUrl;
            const hasText = !!aboutText;

            if (!hasImage && !hasText) return null;

            return (
              <section key="about" id="about" className="border-t border-black">
                <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                          {num}
                        </h2>
                        <h3 className="font-mono text-sm uppercase text-gray-500">
                          À propos
                        </h3>
                      </div>
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
                                className={`px-2 py-1 text-[10px] rounded border border-black transition-all flex items-center justify-center ${
                                  (templateOverrides?.about_layout ||
                                    "image_top") === layout.value
                                    ? "bg-black text-white"
                                    : "bg-white hover:bg-gray-100"
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
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-black transition-all hover:shadow-md ${
                          useCustomAbout
                            ? "bg-gray-100 hover:bg-gray-200"
                            : "bg-white hover:bg-gray-50"
                        }`}
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
                </div>
                <div className="p-8 md:p-12">
                  {(() => {
                    const imageEl = hasImage ? (
                      <div
                        className={`relative group ${
                          layout === "image_top" || layout === "image_bottom"
                            ? "mb-6 flex justify-center"
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
                              ? "w-full max-w-lg h-auto object-cover border border-black"
                              : "w-full max-w-2xl h-64 sm:h-80 object-cover border border-black"
                          }`}
                          onError={(e) => {
                            const finalUrl =
                              getAbsoluteImageUrl(aboutImageUrl) ||
                              heroImageUrl(aboutImageUrl) ||
                              aboutImageUrl;
                            console.error(
                              "❌ [Template4] Erreur chargement image about:",
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
                                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-black transition-all opacity-0 group-hover:opacity-100 bg-white"
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
                      <div className="relative group">
                        {/* Boutons d'alignement directement au-dessus du texte */}
                        {isEditable &&
                          onHeroOverridesChange &&
                          useCustomAbout && (
                            <div className="flex justify-end gap-1 mb-2">
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
                                    className={`px-2 py-1 text-[10px] rounded border border-black transition-all flex items-center justify-center ${
                                      (templateOverrides?.about_text_align ||
                                        "center") === align.value
                                        ? "bg-black text-white"
                                        : "bg-white hover:bg-gray-100"
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
                              className="absolute -top-8 right-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-black transition-all opacity-0 group-hover:opacity-100 z-10 bg-white"
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
                            className={`w-full text-lg md:text-xl leading-relaxed mb-4 sm:mb-6 whitespace-pre-wrap rounded-lg border border-black px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-black ${
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
                            className={`portfolio-section-intro text-lg md:text-xl leading-relaxed whitespace-pre-wrap ${
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
          if (blockId === "experiences") {
            const [num] = getBlockNumbers("experiences");
            if (
              !checkSectionVisible("experiences") ||
              formattedExperiences.length === 0
            )
              return null;
            return (
              <section
                key="experiences"
                id="experience"
                className="grid md:grid-cols-12 min-h-0 border-t border-black"
              >
                <div className="md:col-span-3 p-8 border-b md:border-b-0 md:border-r border-black bg-[#F9F9F9]">
                  <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                    {num}
                  </h2>
                  <h3 className="font-mono text-sm uppercase text-gray-500">
                    Parcours Pro
                  </h3>
                  <p className="mt-8 text-sm text-gray-600 leading-relaxed">
                    Une progression constante dans des environnements techniques
                    exigeants.
                  </p>
                </div>
                <div className="md:col-span-9">
                  {formattedExperiences.map((job, i) => (
                    <div
                      key={i}
                      className="group border-b border-black last:border-b-0 p-8 md:p-12 hover:bg-gray-50 transition-colors relative overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 w-1 h-full bg-[#FF3300] transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {showLogos && (
                            <Logo
                              name={job.company}
                              type="company"
                              size={56}
                              className="mt-1 flex-shrink-0"
                              showFallback={false}
                            />
                          )}
                          <div>
                            <h4 className="portfolio-font-item text-2xl md:text-3xl font-bold">
                              {job.role}
                            </h4>
                            <div className="portfolio-font-item-small text-lg font-medium text-gray-800 mb-2 mt-1">
                              {job.company}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-sm bg-black text-white px-3 py-1 mt-2 md:mt-0 inline-block">
                          {job.year}
                        </span>
                      </div>
                      {job.details && (
                        <p className="portfolio-section-intro text-gray-500 font-mono text-sm max-w-2xl whitespace-pre-line">
                          {job.details
                            .replace(/^-\s+/gm, "→ ")
                            .replace(/\n-\s+/g, "\n→ ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          if (blockId === "projects") {
            const [num] = getBlockNumbers("projects");
            if (
              !checkSectionVisible("projects") ||
              formattedProjects.length === 0
            )
              return null;
            return (
              <section
                key="projects"
                id="projets"
                className="border-t border-black"
              >
                <div className="p-8 md:p-12 border-b border-black flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                      {num}
                    </h2>
                    <h3 className="font-mono text-sm uppercase text-gray-500">
                      Sélection de Projets
                    </h3>
                  </div>
                </div>
                {isEditable &&
                onItemOrderChange &&
                formattedProjects.length > 0 ? (
                  <DragAndDropList
                    items={formattedProjects}
                    onReorder={(reorderedProjects) => {
                      const newOrder = getItemOrder(
                        reorderedProjects,
                        (p: any) => p.id,
                      );
                      onItemOrderChange({
                        ...itemOrder,
                        projects: newOrder,
                      });
                    }}
                    getItemId={(p: any) => p.id}
                    disabled={!isEditable}
                    className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black"
                    strategy="grid"
                    renderItem={(project: any, _idx: number) => (
                      <div
                        key={project.id}
                        className="group relative min-h-[400px] flex flex-col p-8 hover:bg-[#111] hover:text-white transition-all duration-500"
                      >
                        {/* Image ou Icône - hauteur fixe */}
                        <div className="w-full aspect-video bg-gray-200 border border-black mb-6 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all flex-shrink-0">
                          {isEditable && project.project && (
                            <ProjectImageIconEditor
                              project={project.project}
                              onUpdate={() => {}}
                              isDark={false}
                            />
                          )}
                          {project.icon ? (
                            // Afficher l'icône Lucide
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              {(() => {
                                const IconComponent =
                                  (LucideIcons as any)[project.icon] ||
                                  LucideIcons.Code;
                                return (
                                  <IconComponent
                                    size={64}
                                    className="text-black"
                                  />
                                );
                              })()}
                            </div>
                          ) : project.image ? (
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <div
                                className="absolute inset-0 bg-white opacity-20"
                                style={{
                                  backgroundImage:
                                    "radial-gradient(#000 1px, transparent 1px)",
                                  backgroundSize: "10px 10px",
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center font-mono text-6xl font-bold opacity-10 group-hover:opacity-20">
                                {project.num}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Contenu avec hauteurs fixes pour alignement */}
                        <div className="flex flex-col flex-1">
                          {/* Tags - hauteur minimale fixe */}
                          <div className="flex flex-wrap gap-2 mb-4 min-h-[28px] items-start">
                            {(project.tags.length
                              ? project.tags
                              : [project.category]
                            ).map((tag: string) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono uppercase border border-current px-2 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Titre - hauteur minimale fixe */}
                          <h3 className="portfolio-font-item text-3xl font-bold leading-tight mb-1 min-h-[72px] flex items-start">
                            {project.title}
                          </h3>

                          {/* Catégorie - hauteur fixe */}
                          <span className="font-mono text-xs uppercase opacity-70 mb-4 block min-h-[20px]">
                            {project.category}
                          </span>

                          {/* Description - prend l'espace restant */}
                          <p className="portfolio-section-intro text-sm opacity-80 leading-relaxed border-t border-dashed border-current pt-4 flex-1 whitespace-pre-line">
                            {(project.description || "Aucune description.")
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </p>
                        </div>

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF3300]">
                          <ArrowUpRight size={32} />
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
                    {formattedProjects.map((project, _idx) => (
                      <div
                        key={project.id}
                        className="group relative min-h-[400px] flex flex-col p-8 hover:bg-[#111] hover:text-white transition-all duration-500"
                      >
                        <div className="w-full aspect-video bg-gray-200 border border-black mb-6 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all flex-shrink-0">
                          {isEditable && project.project && (
                            <ProjectImageIconEditor
                              project={project.project}
                              onUpdate={() => {}}
                              isDark={false}
                            />
                          )}
                          {project.icon ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              {(() => {
                                const IconComponent =
                                  (LucideIcons as any)[project.icon] ||
                                  LucideIcons.Code;
                                return (
                                  <IconComponent
                                    size={64}
                                    className="text-black"
                                  />
                                );
                              })()}
                            </div>
                          ) : project.image ? (
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <div
                                className="absolute inset-0 bg-white opacity-20"
                                style={{
                                  backgroundImage:
                                    "radial-gradient(#000 1px, transparent 1px)",
                                  backgroundSize: "10px 10px",
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center font-mono text-6xl font-bold opacity-10 group-hover:opacity-20">
                                {project.num}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex flex-wrap gap-2 mb-4 min-h-[28px] items-start">
                            {(project.tags.length
                              ? project.tags
                              : [project.category]
                            ).map((tag: string) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono uppercase border border-current px-2 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="portfolio-font-item text-3xl font-bold leading-tight mb-1 min-h-[72px] flex items-start">
                            {project.title}
                          </h3>
                          <span className="font-mono text-xs uppercase opacity-70 mb-4 block min-h-[20px]">
                            {project.category}
                          </span>
                          <p className="portfolio-section-intro text-sm opacity-80 leading-relaxed border-t border-dashed border-current pt-4 flex-1 whitespace-pre-line">
                            {(project.description || "Aucune description.")
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </p>
                        </div>
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF3300]">
                          <ArrowUpRight size={32} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }
          if (blockId === "stack") {
            const hasAnyStackVisible = stackSectionIds.some((id) =>
              checkSectionVisible(id),
            );
            if (!hasAnyStackVisible) return null;
            const [numFormation, numCompetences] = getBlockNumbers("stack");
            return (
              <section
                key="stack"
                id="stack"
                className="grid md:grid-cols-2 border-t border-black"
              >
                {/* Formation (éducation) + Certifications — visibilité selon personnalisation */}
                <div className="border-b md:border-b-0 md:border-r border-black p-8 md:p-12">
                  {checkSectionVisible("education") && (
                    <>
                      <h2 className="text-4xl font-extrabold tracking-tight mb-8">
                        {numFormation} Formation
                      </h2>
                      <div className="space-y-8">
                        {(Array.isArray(educations) ? educations : [])
                          .slice(0, 4)
                          .map((edu, i) => (
                            <div
                              key={edu.id || i}
                              className="pl-6 border-l-2 border-gray-300 hover:border-[#FF3300] transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                {showLogos && (
                                  <Logo
                                    name={edu.school}
                                    type="school"
                                    size={48}
                                    className="mt-1 flex-shrink-0"
                                    showFallback={false}
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="portfolio-font-item-small text-xl font-bold">
                                    {edu.degree || "Diplôme"}
                                  </h4>
                                  <div className="text-gray-500 font-mono text-sm mb-2">
                                    {edu.end_date
                                      ? `${new Date(edu.start_date).getFullYear()} • ${new Date(edu.end_date).getFullYear()}`
                                      : new Date(
                                          edu.start_date,
                                        ).getFullYear()}{" "}
                                    •{" "}
                                    <span className="portfolio-font-item">
                                      {edu.school || "École"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {edu.field_of_study && (
                                <p className="portfolio-section-intro text-sm">
                                  {edu.field_of_study}
                                </p>
                              )}
                              {edu.description && (
                                <p className="portfolio-section-intro text-sm text-gray-600">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  {checkSectionVisible("certifications") &&
                    certifications.length > 0 && (
                      <div className="pt-8 mt-8 border-t border-dashed border-gray-300">
                        <h5 className="font-mono text-xs uppercase text-gray-500 mb-4">
                          Certifications
                        </h5>
                        {isEditable &&
                        onItemOrderChange &&
                        orderedCertifications.length > 0 ? (
                          <DragAndDropList
                            items={orderedCertifications.slice(0, 5)}
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
                            className="flex flex-col gap-2"
                            strategy="vertical"
                            buttonSize="small"
                            renderItem={(cert: Certification) => (
                              <div
                                key={cert.id}
                                className="group flex items-center gap-2 text-sm font-medium"
                              >
                                <div className="w-1.5 h-1.5 bg-black rounded-none" />{" "}
                                {cert.name}
                              </div>
                            )}
                          />
                        ) : (
                          <div className="flex flex-col gap-2">
                            {orderedCertifications.slice(0, 5).map((cert) => (
                              <div
                                key={cert.id}
                                className="group flex items-center gap-2 text-sm font-medium"
                              >
                                <div className="w-1.5 h-1.5 bg-black rounded-none" />{" "}
                                {cert.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Compétences + Langues + Intérêts — visibilité selon personnalisation */}
                <div className="bg-[#111] text-white p-8 md:p-12">
                  {(checkSectionVisible("skills") ||
                    checkSectionVisible("languages") ||
                    checkSectionVisible("interests")) && (
                    <h2 className="text-4xl font-extrabold tracking-tight mb-12 text-white">
                      {numCompetences ?? "04."} Compétences
                    </h2>
                  )}
                  <div className="grid grid-cols-2 gap-12">
                    {checkSectionVisible("skills") && (
                      <div className="min-w-0">
                        <h3 className="font-mono text-[#FF3300] text-sm uppercase mb-6">
                          Technique
                        </h3>
                        {isEditable &&
                        onItemOrderChange &&
                        orderedSkills.length > 0 ? (
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
                            className="flex flex-wrap gap-2"
                            strategy="grid"
                            buttonSize="small"
                            renderItem={(skill: Skill) => (
                              <span
                                key={skill.id}
                                className="group inline-flex items-center gap-2 px-3 py-1.5 border border-[#FF3300] text-[#FF3300] font-medium text-sm"
                              >
                                <SkillIcon
                                  skillName={skill.name}
                                  size={16}
                                  useBadge={true}
                                  showLabel={false}
                                />
                                {skill.name}
                              </span>
                            )}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(orderedSkills.length ? orderedSkills : []).map(
                              (skill) => (
                                <span
                                  key={skill.id}
                                  className="group inline-flex items-center gap-2 px-3 py-1.5 border border-[#FF3300] text-[#FF3300] font-medium text-sm"
                                >
                                  <SkillIcon
                                    skillName={skill.name}
                                    size={16}
                                    useBadge={true}
                                    showLabel={false}
                                  />
                                  {skill.name}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {(checkSectionVisible("languages") ||
                      checkSectionVisible("interests")) && (
                      <div>
                        <h3 className="font-mono text-[#FF3300] text-sm uppercase mb-6">
                          Langues & Intérêts
                        </h3>
                        {checkSectionVisible("languages") && (
                          <ul className="space-y-4 text-sm">
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
                                className="space-y-4"
                                strategy="vertical"
                                buttonSize="small"
                                renderItem={(lang: Language) => (
                                  <li
                                    key={lang.id}
                                    className="group flex items-center gap-3"
                                  >
                                    <span className="w-8 text-gray-500">
                                      {(lang.name || "")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </span>
                                    {lang.level || "—"}
                                  </li>
                                )}
                              />
                            ) : (
                              <>
                                {(Array.isArray(orderedLanguages)
                                  ? orderedLanguages
                                  : []
                                ).map((lang) => (
                                  <li
                                    key={lang.id}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="w-8 text-gray-500">
                                      {(lang.name || "")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </span>
                                    {lang.level || "—"}
                                  </li>
                                ))}
                              </>
                            )}
                          </ul>
                        )}
                        {checkSectionVisible("interests") &&
                          orderedInterests.length > 0 && (
                            <div className="mt-8">
                              {isEditable && onItemOrderChange ? (
                                <DragAndDropList
                                  items={orderedInterests.slice(0, 6)}
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
                                  className="flex flex-wrap gap-2"
                                  strategy="grid"
                                  buttonSize="small"
                                  renderItem={(interest: Interest) => (
                                    <span
                                      key={interest.id}
                                      className="portfolio-font-item group px-2 py-1 bg-white/10 rounded-sm text-xs text-gray-300"
                                    >
                                      {interest.name}
                                    </span>
                                  )}
                                />
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {orderedInterests
                                    .slice(0, 6)
                                    .map((interest) => (
                                      <span
                                        key={interest.id}
                                        className="portfolio-font-item px-2 py-1 bg-white/10 rounded-sm text-xs text-gray-300"
                                      >
                                        {interest.name}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          }
          if (blockId === "contact") {
            if (!checkSectionVisible("contact")) return null;
            return (
              <section
                key="contact"
                id="contact"
                className="bg-[#FF3300] text-white p-8 md:p-20 text-center relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">
                    PARLONS-EN
                  </h2>
                  <div className="text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto">
                    {editingField === "contact_cta" &&
                    isEditable &&
                    onHeroOverridesChange ? (
                      <textarea
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={commitHeroEdit}
                        autoFocus
                        rows={2}
                        className="w-full bg-white/10 rounded px-3 py-2 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white"
                        placeholder="Ex: Vous avez un projet complexe ou une architecture à optimiser ? Discutons-en."
                      />
                    ) : (
                      <p
                        className={
                          isEditable && onHeroOverridesChange
                            ? "cursor-pointer hover:underline hover:opacity-90"
                            : ""
                        }
                        onClick={() =>
                          isEditable &&
                          onHeroOverridesChange &&
                          (setEditingValue(contactCtaText),
                          setEditingField("contact_cta"))
                        }
                        role={
                          isEditable && onHeroOverridesChange
                            ? "button"
                            : undefined
                        }
                      >
                        {contactCtaText}
                      </p>
                    )}
                  </div>
                  <a
                    href={email ? `mailto:${email}` : "#"}
                    className="inline-block bg-white text-black px-12 py-5 font-bold text-lg hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 shadow-xl"
                  >
                    <span className="portfolio-font-subtitle">
                      Démarrer une conversation
                    </span>
                  </a>
                  <div className="mt-20 flex justify-center gap-12">
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black transition-colors"
                      >
                        <Github size={32} />
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black transition-colors"
                      >
                        <Linkedin size={32} />
                      </a>
                    )}
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-black transition-colors"
                      >
                        <Mail size={32} />
                      </a>
                    )}
                  </div>
                  <div className="mt-12 pt-12 border-t border-white/20 font-mono text-sm opacity-90">
                    <p>
                      © {new Date().getFullYear()}{" "}
                      {user?.full_name ||
                        profile?.title ||
                        user?.username ||
                        "PortfoliA"}{" "}
                      • CONÇU EN STYLE SUISSE
                    </p>
                    {(user?.full_name || email || profile?.phone) && (
                      <p className="mt-2 text-xs opacity-80 flex flex-wrap justify-center gap-x-4 gap-y-1">
                        {user?.full_name && <span>{user.full_name}</span>}
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className="hover:text-black transition-colors"
                          >
                            {email}
                          </a>
                        )}
                        {profile?.phone && (
                          <a
                            href={`tel:${profile.phone}`}
                            className="hover:text-black transition-colors"
                          >
                            {profile.phone}
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black opacity-10 pointer-events-none whitespace-nowrap">
                  CONTACT
                </div>
              </section>
            );
          }
          return null;
        })}
      </main>
    </div>
  );
};
