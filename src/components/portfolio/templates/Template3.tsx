import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Globe,
  Mail,
  Linkedin,
  Github,
  Terminal,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Camera,
  Trash2,
  Plus,
  Moon,
  Sun,
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
  isSectionVisible,
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

function heroImageUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Si API_URL est vide (proxy Vite), utiliser l'URL relative telle quelle
  if (!API_URL || API_URL === "") {
    return url.startsWith("/") ? url : `/${url}`;
  }
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

interface Template3Props {
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
  onSkillLevelChange?: (skillId: string, level: string) => void | Promise<void>;
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

export const Template3: React.FC<Template3Props> = ({
  user,
  profile,
  experiences = [],
  educations = [],
  projects = [],
  skills = [],
  languages = [],
  certifications = [],
  interests = [],
  theme: initialTheme = "dark",
  customization,
  onThemeChange,
  templateOverrides,
  isEditable = false,
  onHeroOverridesChange,
  onSkillLevelChange,
  isPreview = false,
  showLogos = true,
  itemOrder,
  onItemOrderChange,
}) => {
  const [_activeSection, _setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  const sectionMaxW = isPreview ? "max-w-5xl" : "max-w-7xl";
  const heroImageSrc = heroImageUrl(
    templateOverrides?.hero_image_url ?? profile?.profile_picture_url ?? null,
  );
  const rawHeroTitle =
    (templateOverrides?.hero_title?.trim() || undefined) ??
    profile?.title ??
    user?.full_name ??
    user?.username ??
    "Mon Portfolio";
  /** Sépare prénom et nom s'ils sont collés (ex. AliNahas → Ali Nahas) : espace avant une majuscule qui suit une minuscule */
  const formatNameWithSpace = (s: string) =>
    (s || "").replace(/([a-zà-ÿ])([A-ZÀ-Ÿ])/g, "$1 $2").trim();
  const heroTitle =
    typeof rawHeroTitle === "string" && rawHeroTitle.length > 0
      ? formatNameWithSpace(rawHeroTitle)
      : rawHeroTitle;
  const heroSubtitle =
    (templateOverrides?.hero_subtitle?.trim() || undefined) ??
    `Bonjour, je suis ${(user?.full_name || profile?.title || user?.username || "").trim().split(" ")[0] || "Alex"}`;
  const heroBio = templateOverrides?.hero_bio ?? profile?.bio ?? "";
  const heroBadgeText =
    (templateOverrides?.hero_badge_text?.trim() || undefined) ??
    "Disponible pour opportunités";
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

  type FormattedProject = {
    id: string;
    title: string;
    cat: string;
    desc: string;
    tags: string[];
    link: string;
    image: string | null;
  };
  const [projectModal, setProjectModal] = useState<FormattedProject | null>(
    null,
  );

  const skillLevelDebounceRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(
    () => () => {
      Object.values(skillLevelDebounceRef.current).forEach(clearTimeout);
    },
    [],
  );
  useEffect(() => {
    setSliderValues((prev) => {
      const next = { ...prev };
      (skills || []).forEach((sk) => {
        if (sk.id) delete next[sk.id];
      });
      return next;
    });
  }, [skills]);

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

  const handleHeroImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onHeroOverridesChange) return;
    setHeroImageUploading(true);
    try {
      const { hero_image_url } = await portfolioAPI.uploadHeroImage(file);
      onHeroOverridesChange({ ...templateOverrides, hero_image_url });
    } catch (err) {
      console.error("Upload hero image:", err);
    } finally {
      setHeroImageUploading(false);
      e.target.value = "";
    }
  };

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
  const fontClass = getFontClass(customization);
  const fontTitles = getFontFamilyForRole(customization, "titles");
  const fontSubtitles = getFontFamilyForRole(customization, "subtitles");
  const fontItem = getFontFamilyForRole(customization, "item");
  const fontItemSmall = getFontFamilyForRole(customization, "itemSmall");
  const fontBody = getFontFamilyForRole(customization, "body");
  const customFonts = customization?.customFonts ?? [];
  const apiBase = (API_URL || "").replace(/\/$/, "");
  const visibleSectionsInOrder = getVisibleSectionsInOrder(customization);
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-[#1a1a1a]" : "bg-white";
  const cardShadow = "shadow-xl";
  const borderSubtle = isDark ? "border-white/10" : "border-gray-200";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const accentPurpleText = isDark ? "text-purple-400" : "text-purple-600";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const sectionIndexMap = new Map(
    visibleSectionsInOrder.map((s, i) => [s.id, i]),
  );

  /** Sections qui s'affichent seules (pleine largeur) comme à l'origine ; les autres peuvent être côte à côte */
  const fullWidthSectionIds = new Set<string>(["about", "projects"]);
  const sectionRows: Array<
    Array<{ id: string; label: string; visible: boolean }>
  > = [];
  let i = 0;
  while (i < visibleSectionsInOrder.length) {
    const section = visibleSectionsInOrder[i];
    if (fullWidthSectionIds.has(section.id)) {
      sectionRows.push([section]);
      i += 1;
    } else {
      const row = [section];
      i += 1;
      if (
        i < visibleSectionsInOrder.length &&
        !fullWidthSectionIds.has(visibleSectionsInOrder[i].id)
      ) {
        row.push(visibleSectionsInOrder[i]);
        i += 1;
      }
      sectionRows.push(row);
    }
  }

  /** Numéro de section (00, 01, 02...) selon l'ordre actuel après drag-and-drop */
  const getSectionNumber = (sectionId: string) =>
    String(sectionIndexMap.get(sectionId) ?? 0).padStart(2, "0") + ".";

  /** Rend le contenu d'une section (pour la grille 2 colonnes : qui était à côté peut se retrouver seule et inversement) */
  const renderSectionBlock = (section: {
    id: string;
    label: string;
    visible: boolean;
  }): React.ReactNode => {
    const num = getSectionNumber(section.id);
    switch (section.id) {
      case "about":
        if (!aboutText && !profile?.bio) return null;
        const layout = templateOverrides?.about_layout || "image_top";
        const hasImage = !!aboutImageUrl;
        const hasText = !!(aboutText || profile?.bio);

        const imageEl = hasImage ? (
          <div
            className={`relative group ${
              layout === "image_top" || layout === "image_bottom"
                ? "mb-4 flex justify-center"
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
                  ? "w-full max-w-md h-auto object-cover rounded-lg"
                  : "w-full max-w-xl h-64 object-cover rounded-lg"
              }`}
              onError={(e) => {
                const finalUrl =
                  getAbsoluteImageUrl(aboutImageUrl) ||
                  heroImageUrl(aboutImageUrl) ||
                  aboutImageUrl;
                console.error("❌ [Template3] Erreur chargement image about:", {
                  original: aboutImageUrl,
                  getAbsoluteImageUrl: getAbsoluteImageUrl(aboutImageUrl),
                  heroImageUrl: heroImageUrl(aboutImageUrl),
                  finalUrl,
                  API_URL,
                });
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {isEditable && onHeroOverridesChange && useCustomAbout && (
              <>
                <button
                  onClick={() => aboutImageInputRef.current?.click()}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-all opacity-0 group-hover:opacity-100"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(139, 92, 246, 0.9)"
                      : "rgba(139, 92, 246, 0.95)",
                    borderColor: isDark
                      ? "rgba(139, 92, 246, 0.5)"
                      : "rgba(139, 92, 246, 0.3)",
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
                        await portfolioAPI.uploadAboutImage(formData);
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
            {isEditable && onHeroOverridesChange && useCustomAbout && (
              <div className="flex justify-end gap-1 mb-2">
                {[
                  { value: "left", label: "Gauche", icon: AlignLeft },
                  { value: "center", label: "Centre", icon: AlignCenter },
                  { value: "right", label: "Droite", icon: AlignRight },
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
                        (templateOverrides?.about_text_align || "center") ===
                        align.value
                          ? isDark
                            ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                            : "bg-violet-100 border-violet-300 text-violet-700"
                          : isDark
                            ? "border-slate-600 hover:bg-slate-700 text-slate-400"
                            : "border-slate-300 hover:bg-slate-100 text-slate-600"
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
                      ? "rgba(139, 92, 246, 0.9)"
                      : "rgba(139, 92, 246, 0.95)",
                    borderColor: isDark
                      ? "rgba(139, 92, 246, 0.5)"
                      : "rgba(139, 92, 246, 0.3)",
                    color: "white",
                  }}
                  title="Modifier le texte"
                >
                  <Pencil size={12} />
                  Modifier
                </button>
              )}
            {isEditable && onHeroOverridesChange && useCustomAbout ? (
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
                className={`w-full ${isDark ? "text-slate-400 bg-slate-800/50 border-slate-700" : "text-slate-600 bg-white/80 border-slate-200"} text-lg max-w-2xl leading-relaxed mb-4 sm:mb-6 whitespace-pre-wrap rounded-lg border px-3 py-2 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ${
                  templateOverrides?.about_text_align === "left"
                    ? "text-left"
                    : templateOverrides?.about_text_align === "right"
                      ? "text-right"
                      : "text-center"
                }`}
                style={{ minHeight: "6rem" }}
                placeholder="Écrivez votre section À propos personnalisée..."
              />
            ) : (
              <p
                className={`portfolio-section-intro text-lg max-w-2xl leading-relaxed whitespace-pre-wrap ${
                  templateOverrides?.about_text_align === "left"
                    ? "text-left"
                    : templateOverrides?.about_text_align === "right"
                      ? "text-right"
                      : "text-center"
                } ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {aboutText || profile?.bio || ""}
              </p>
            )}
          </div>
        ) : null;

        return (
          <section
            id="about"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span
                      className={`font-mono ${isDark ? "text-violet-500" : "text-violet-600"}`}
                    >
                      {num}
                    </span>
                    <span>À propos</span>
                  </h2>
                  {/* Boutons de disposition directement au-dessus du titre */}
                  {isEditable && onHeroOverridesChange && useCustomAbout && (
                    <div className="flex gap-1 ml-2">
                      {[
                        { value: "image_top", label: "Photo haut", icon: "⬆️" },
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
                            (templateOverrides?.about_layout || "image_top") ===
                            layout.value
                              ? isDark
                                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                                : "bg-violet-100 border-violet-300 text-violet-700"
                              : isDark
                                ? "border-slate-600 hover:bg-slate-700 text-slate-400"
                                : "border-slate-300 hover:bg-slate-100 text-slate-600"
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
                          ? "rgba(139, 92, 246, 0.1)"
                          : "rgba(139, 92, 246, 0.05)",
                      borderColor: useCustomAbout
                        ? isDark
                          ? "rgba(148, 163, 184, 0.3)"
                          : "rgba(148, 163, 184, 0.2)"
                        : isDark
                          ? "rgba(139, 92, 246, 0.3)"
                          : "rgba(139, 92, 246, 0.2)",
                      color: useCustomAbout
                        ? isDark
                          ? "rgb(148, 163, 184)"
                          : "rgb(71, 85, 105)"
                        : isDark
                          ? "rgb(196, 181, 253)"
                          : "rgb(124, 58, 237)",
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
              {layout === "image_top" && (
                <div className="flex flex-col">
                  {imageEl}
                  <div className="w-full">{textEl}</div>
                </div>
              )}
              {layout === "image_bottom" && (
                <div className="flex flex-col">
                  <div className="w-full">{textEl}</div>
                  {imageEl}
                </div>
              )}
              {layout === "image_left" && (
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0 md:self-center">{imageEl}</div>
                  <div className="flex-1">{textEl}</div>
                </div>
              )}
              {layout === "image_right" && (
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">{textEl}</div>
                  <div className="flex-shrink-0 md:self-center">{imageEl}</div>
                </div>
              )}
            </div>
          </section>
        );
      case "experiences":
        if (experiences.length === 0) return null;
        return (
          <section
            id="experience"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <h2 className={`text-2xl font-bold mb-8 flex items-center gap-3`}>
              <span className="text-violet-500 font-mono">{num}</span>{" "}
              Expérience
            </h2>
            <div
              className={`space-y-10 border-l ml-3 pl-8 relative ${isDark ? "border-violet-900/50" : "border-violet-200"}`}
            >
              {experiences.map((job, idx) => {
                const dateStr = job.is_current
                  ? `${new Date(job.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - Présent`
                  : job.end_date
                    ? `${new Date(job.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - ${new Date(job.end_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`
                    : `${new Date(job.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - Présent`;
                const descItems =
                  job.achievements &&
                  Array.isArray(job.achievements) &&
                  job.achievements.length > 0
                    ? job.achievements
                    : job.description
                      ? [job.description]
                      : [];
                const descFormatted =
                  descItems.length > 0
                    ? descItems
                        .join("\n")
                        .replace(/\s+-\s+/g, "\n→ ")
                        .replace(/^-\s+/gm, "→ ")
                        .replace(/\n-\s+/g, "\n→ ")
                    : "";
                return (
                  <div key={job.id || idx} className="relative group">
                    <span
                      className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-2 border-violet-600 group-hover:bg-violet-500 transition-colors shadow-[0_0_10px_rgba(124,58,237,0.4)] ${isDark ? "bg-[#050505]" : "bg-slate-50"}`}
                    />
                    <h3
                      className={`portfolio-font-item text-xl font-bold group-hover:text-violet-300 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      {job.title}
                    </h3>
                    <div className="portfolio-font-subtitle text-sm font-mono text-violet-400 mb-2">
                      {job.company} | {dateStr}
                    </div>
                    {descFormatted && (
                      <p
                        className={`portfolio-section-intro text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {descFormatted}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      case "education":
        if (educations.length === 0) return null;
        return (
          <section
            id="education"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <h2 className={`text-2xl font-bold mb-8 flex items-center gap-3`}>
              <span className="text-fuchsia-500 font-mono">{num}</span>{" "}
              Formation
            </h2>
            <div className="space-y-6">
              {educations.map((edu, idx) => {
                const yearStr = edu.is_current
                  ? `${new Date(edu.start_date).getFullYear()} - En cours`
                  : edu.end_date
                    ? `${new Date(edu.start_date).getFullYear()} - ${new Date(edu.end_date).getFullYear()}`
                    : `${new Date(edu.start_date).getFullYear()}`;
                return (
                  <div
                    key={edu.id || idx}
                    className={`glass-panel p-6 rounded-xl hover:border-fuchsia-500/50 transition-colors duration-300 group`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`h-1 w-12 rounded-full group-hover:w-20 transition-all duration-500 ${isDark ? "bg-fuchsia-500/50" : "bg-fuchsia-400/50"}`}
                      />
                      <span
                        className={`font-mono text-xs px-2 py-1 rounded border ${isDark ? "text-slate-500 bg-slate-900 border-slate-800" : "text-slate-600 bg-slate-100 border-slate-200"}`}
                      >
                        {yearStr}
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mt-4">
                      {showLogos && (
                        <Logo
                          name={edu.school}
                          type="school"
                          size={56}
                          className="flex-shrink-0"
                          showFallback={false}
                        />
                      )}
                      <div className="flex-1">
                        <h3
                          className={`portfolio-font-item-small text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {edu.degree}
                        </h3>
                        <p
                          className={`portfolio-font-item text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {edu.school}
                        </p>
                        {edu.field_of_study && (
                          <p
                            className={`portfolio-section-intro text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {edu.field_of_study}
                          </p>
                        )}
                        {edu.description && (
                          <p
                            className={`portfolio-section-intro text-sm mt-1 whitespace-pre-line ${isDark ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {edu.description
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </p>
                        )}
                        {edu.grade && (
                          <p
                            className={`portfolio-section-intro text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {edu.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      case "projects":
        if (formattedProjects.length === 0) return null;
        return (
          <section
            id="projets"
            className={`py-6 relative z-10 border-y ${isDark ? "bg-[#08080a] border-white/5" : "bg-slate-100/50 border-slate-200"}`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-end flex-wrap gap-4">
                <h2
                  className={`text-2xl md:text-4xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Projets <span className="text-violet-500">Récents</span>
                </h2>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-violet-400 hover:text-white flex items-center gap-2"
                  >
                    Voir Github <Github size={16} />
                  </a>
                )}
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
                  className="grid md:grid-cols-2 gap-6"
                  strategy="grid"
                  renderItem={(proj: any) => (
                    <div
                      key={proj.id}
                      onClick={() => setProjectModal(proj)}
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-500 cursor-pointer h-full min-h-[380px] flex flex-col ${isDark ? "bg-[#0e0e12] border-white/5 hover:border-violet-500/50" : "bg-white border-slate-200 hover:border-violet-400/50"}`}
                    >
                      <div
                        className={`h-40 relative flex-shrink-0 group-hover:scale-105 transition-transform duration-700 overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
                      >
                        {isEditable && proj.project && (
                          <ProjectImageIconEditor
                            project={proj.project}
                            onUpdate={() => {}}
                            isDark={isDark}
                          />
                        )}
                        {proj.icon ? (
                          // Afficher l'icône Lucide
                          <div className="w-full h-full flex items-center justify-center">
                            {(() => {
                              const IconComponent =
                                (LucideIcons as any)[proj.icon] ||
                                LucideIcons.Code;
                              return (
                                <IconComponent
                                  size={64}
                                  className="text-violet-400"
                                />
                              );
                            })()}
                          </div>
                        ) : proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-mono text-violet-300/70 tracking-widest">
                              PROJECT
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 relative flex-1 flex flex-col min-h-[140px]">
                        <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">
                          {proj.cat}
                        </span>
                        <h3
                          className={`portfolio-font-item text-lg font-bold mb-1 mt-1 ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {proj.title}
                        </h3>
                        <p
                          className={`portfolio-section-intro text-sm line-clamp-2 flex-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {proj.desc}
                        </p>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {formattedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setProjectModal(proj)}
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-500 cursor-pointer h-full min-h-[380px] flex flex-col ${isDark ? "bg-[#0e0e12] border-white/5 hover:border-violet-500/50" : "bg-white border-slate-200 hover:border-violet-400/50"}`}
                    >
                      <div
                        className={`h-40 relative flex-shrink-0 group-hover:scale-105 transition-transform duration-700 overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
                      >
                        {isEditable && proj.project && (
                          <ProjectImageIconEditor
                            project={proj.project}
                            onUpdate={() => {}}
                            isDark={isDark}
                          />
                        )}
                        {proj.icon ? (
                          <div className="w-full h-full flex items-center justify-center">
                            {(() => {
                              const IconComponent =
                                (LucideIcons as any)[proj.icon] ||
                                LucideIcons.Code;
                              return (
                                <IconComponent
                                  size={64}
                                  className="text-violet-400"
                                />
                              );
                            })()}
                          </div>
                        ) : proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-mono text-violet-300/70 tracking-widest">
                              PROJECT
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 relative flex-1 flex flex-col min-h-[140px]">
                        <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">
                          {proj.cat}
                        </span>
                        <h3
                          className={`portfolio-font-item text-lg font-bold mb-1 mt-1 ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {proj.title}
                        </h3>
                        <p
                          className={`portfolio-section-intro text-sm line-clamp-2 flex-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {proj.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      case "skills":
        if (orderedSkills.length === 0) return null;
        const col1 = orderedSkills.slice(
          0,
          Math.ceil(orderedSkills.length / 2),
        );
        const col2 = orderedSkills.slice(Math.ceil(orderedSkills.length / 2));
        return (
          <section
            id="competences"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <h3
              className={`portfolio-font-subtitle text-2xl font-bold mb-6 flex items-center gap-2`}
            >
              <Terminal className="text-fuchsia-500" /> Compétences techniques
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {[col1, col2].map((col, colIdx) => (
                <div key={colIdx} className="space-y-4">
                  {isEditable && onItemOrderChange && col.length > 0 ? (
                    <DragAndDropList
                      items={col}
                      onReorder={(reorderedCol) => {
                        const allSkills =
                          colIdx === 0
                            ? [...reorderedCol, ...col2]
                            : [...col1, ...reorderedCol];
                        const finalOrder = getItemOrder(
                          allSkills,
                          (s) => s.id || s.name,
                        );
                        onItemOrderChange({
                          ...itemOrder,
                          skills: finalOrder,
                        });
                      }}
                      getItemId={(s) => s.id || s.name}
                      disabled={!isEditable}
                      className="space-y-4"
                      strategy="vertical"
                      buttonSize="small"
                      renderItem={(sk, _idx) => {
                        const levelStr = sk.level || "50%";
                        const pct =
                          typeof levelStr === "string" && levelStr.includes("%")
                            ? parseInt(levelStr.replace(/%/g, ""), 10)
                            : 50;
                        const numPct = Number.isNaN(pct)
                          ? 50
                          : Math.min(100, Math.max(0, pct));
                        const displayPct =
                          sk.id && sliderValues[sk.id] !== undefined
                            ? sliderValues[sk.id]
                            : numPct;
                        const canEditLevel =
                          (isPreview || isEditable) &&
                          onSkillLevelChange &&
                          sk.id;
                        return (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1 gap-2">
                              <div className="flex items-center gap-2">
                                <SkillIcon
                                  skillName={sk.name}
                                  size={16}
                                  useBadge={true}
                                  showLabel={false}
                                />
                                <span
                                  className={`portfolio-font-item ${isDark ? "text-white" : "text-slate-900"}`}
                                >
                                  {sk.name}
                                </span>
                              </div>
                              <span className="text-fuchsia-400 font-mono">
                                {displayPct}%
                              </span>
                            </div>
                            {canEditLevel ? (
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={displayPct}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10);
                                  setSliderValues((prev) => ({
                                    ...prev,
                                    [sk.id!]: value,
                                  }));
                                  const refs = skillLevelDebounceRef.current;
                                  if (refs[sk.id!]) clearTimeout(refs[sk.id!]);
                                  refs[sk.id!] = setTimeout(() => {
                                    onSkillLevelChange!(sk.id!, `${value}%`);
                                    delete refs[sk.id!];
                                  }, 400);
                                }}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-500"
                                style={{
                                  background: isDark
                                    ? `linear-gradient(to right, rgb(139 92 246) 0%, rgb(139 92 246) ${displayPct}%, rgb(30 41 59) ${displayPct}%, rgb(30 41 59) 100%)`
                                    : `linear-gradient(to right, rgb(124 58 237) 0%, rgb(124 58 237) ${displayPct}%, rgb(226 232 240) ${displayPct}%, rgb(226 232 240) 100%)`,
                                }}
                              />
                            ) : (
                              <div
                                className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-300"
                                  style={{ width: `${displayPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                  ) : (
                    col.map((sk) => {
                      const levelStr = sk.level || "50%";
                      const pct =
                        typeof levelStr === "string" && levelStr.includes("%")
                          ? parseInt(levelStr.replace(/%/g, ""), 10)
                          : 50;
                      const numPct = Number.isNaN(pct)
                        ? 50
                        : Math.min(100, Math.max(0, pct));
                      const displayPct =
                        sk.id && sliderValues[sk.id] !== undefined
                          ? sliderValues[sk.id]
                          : numPct;
                      const canEditLevel =
                        (isPreview || isEditable) &&
                        onSkillLevelChange &&
                        sk.id;
                      return (
                        <div key={sk.id}>
                          <div className="flex items-center justify-between text-sm mb-1 gap-2">
                            <div className="flex items-center gap-2">
                              <SkillIcon
                                skillName={sk.name}
                                size={16}
                                useBadge={true}
                                showLabel={false}
                              />
                              <span
                                className={`portfolio-font-item ${isDark ? "text-white" : "text-slate-900"}`}
                              >
                                {sk.name}
                              </span>
                            </div>
                            <span className="text-fuchsia-400 font-mono">
                              {displayPct}%
                            </span>
                          </div>
                          {canEditLevel ? (
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={displayPct}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                setSliderValues((prev) => ({
                                  ...prev,
                                  [sk.id!]: value,
                                }));
                                const refs = skillLevelDebounceRef.current;
                                if (refs[sk.id!]) clearTimeout(refs[sk.id!]);
                                refs[sk.id!] = setTimeout(() => {
                                  onSkillLevelChange!(sk.id!, `${value}%`);
                                  delete refs[sk.id!];
                                }, 400);
                              }}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-500"
                              style={{
                                background: isDark
                                  ? `linear-gradient(to right, rgb(139 92 246) 0%, rgb(139 92 246) ${displayPct}%, rgb(30 41 59) ${displayPct}%, rgb(30 41 59) 100%)`
                                  : `linear-gradient(to right, rgb(124 58 237) 0%, rgb(124 58 237) ${displayPct}%, rgb(226 232 240) ${displayPct}%, rgb(226 232 240) 100%)`,
                              }}
                            />
                          ) : (
                            <div
                              className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-300"
                                style={{ width: `${displayPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      case "languages":
        if (languages.length === 0) return null;
        return (
          <section
            id="languages"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <h3
              className={`portfolio-font-subtitle text-xl font-bold mb-4 flex items-center gap-2`}
            >
              <Globe className="text-violet-400" /> Langues
            </h3>
            {isEditable && onItemOrderChange && orderedLanguages.length > 0 ? (
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
                className="space-y-3"
                buttonSize="small"
                renderItem={(lang: Language) => (
                  <div
                    key={lang.id}
                    className={`group flex items-center justify-between p-2 rounded ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                  >
                    <span
                      className={`portfolio-font-item ${isDark ? "text-slate-200" : "text-slate-800"}`}
                    >
                      {lang.name}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded border ${isDark ? "text-violet-300 bg-violet-500/10 border-violet-500/20" : "text-violet-600 bg-violet-100 border-violet-200"}`}
                    >
                      {lang.level || "—"}
                    </span>
                  </div>
                )}
              />
            ) : (
              <div className="space-y-3">
                {orderedLanguages.map((lang) => (
                  <div
                    key={lang.id}
                    className={`group flex items-center justify-between p-2 rounded ${isDark ? "bg-white/5" : "bg-slate-100"}`}
                  >
                    <span
                      className={`portfolio-font-item ${isDark ? "text-slate-200" : "text-slate-800"}`}
                    >
                      {lang.name}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded border ${isDark ? "text-violet-300 bg-violet-500/10 border-violet-500/20" : "text-violet-600 bg-violet-100 border-violet-200"}`}
                    >
                      {lang.level || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      case "certifications":
        if (certifications.length === 0) return null;
        return (
          <section
            id="certifications"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <h3
              className={`portfolio-font-subtitle text-lg font-bold mb-6 flex items-center gap-2`}
            >
              <span className="w-2 h-2 bg-violet-500 rounded-sm" />{" "}
              Certifications
            </h3>
            {isEditable &&
            onItemOrderChange &&
            orderedCertifications.length > 0 ? (
              <DragAndDropList
                items={orderedCertifications}
                onReorder={(reorderedCerts) => {
                  const newOrder = getItemOrder(reorderedCerts, (c) => c.id);
                  onItemOrderChange({
                    ...itemOrder,
                    certifications: newOrder,
                  });
                }}
                getItemId={(c) => c.id}
                disabled={!isEditable}
                className="flex flex-wrap gap-3"
                strategy="grid"
                buttonSize="small"
                renderItem={(c: Certification) => (
                  <span
                    key={c.id}
                    className={`portfolio-font-item group px-4 py-2 rounded text-xs font-mono border transition-colors cursor-default ${isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-violet-500/50 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:border-violet-400 hover:text-slate-900"}`}
                  >
                    {c.name}
                  </span>
                )}
              />
            ) : (
              <div className="flex flex-wrap gap-3">
                {orderedCertifications.map((c) => (
                  <span
                    key={c.id}
                    className={`portfolio-font-item group px-4 py-2 rounded text-xs font-mono border transition-colors cursor-default ${isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-violet-500/50 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:border-violet-400 hover:text-slate-900"}`}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </section>
        );
      case "interests":
        return (
          <section
            id="interests"
            className={`py-6 relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <h3
              className={`portfolio-font-subtitle text-lg font-bold mb-6 flex items-center gap-2`}
            >
              <span className="w-2 h-2 bg-violet-500 rounded-sm" /> Intérêts
            </h3>
            {isEditable && onItemOrderChange && orderedInterests.length > 0 ? (
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
                className="flex flex-wrap gap-2"
                strategy="grid"
                buttonSize="small"
                renderItem={(item, _idx) => (
                  <span
                    className={`portfolio-font-item px-4 py-2 rounded-full border text-xs ${isDark ? "border-slate-700 bg-slate-900/50 text-slate-300 hover:border-violet-500" : "border-slate-300 bg-slate-50 text-slate-600 hover:border-violet-400"}`}
                  >
                    {item.name}
                  </span>
                )}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {orderedInterests && orderedInterests.length > 0 ? (
                  orderedInterests.map((item) => (
                    <span
                      key={item.id || item.name}
                      className={`portfolio-font-item px-4 py-2 rounded-full border text-xs ${isDark ? "border-slate-700 bg-slate-900/50 text-slate-300 hover:border-violet-500" : "border-slate-300 bg-slate-50 text-slate-600 hover:border-violet-400"}`}
                    >
                      {item.name}
                    </span>
                  ))
                ) : (
                  <p
                    className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                  >
                    Aucun centre d&apos;intérêt renseigné.
                  </p>
                )}
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (initialTheme !== theme) setTheme(initialTheme);
  }, [initialTheme, theme]);

  // Ajuster automatiquement la hauteur du textarea "À propos"
  useEffect(() => {
    if (aboutTextareaRef.current && isEditable && useCustomAbout) {
      aboutTextareaRef.current.style.height = "auto";
      aboutTextareaRef.current.style.height = `${aboutTextareaRef.current.scrollHeight}px`;
    }
  }, [aboutText, isEditable, useCustomAbout, templateOverrides?.about_layout]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
    }
  };
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const displayName = user?.full_name || user?.username || "Portfolio";
  const displayNameFormatted = formatNameWithSpace(displayName);
  const initials =
    displayNameFormatted
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "PO";
  const githubUrl = profile?.github_url || "";
  const linkedinUrl = profile?.linkedin_url || "";
  const email = user?.email || "";

  const formattedProjects = (
    Array.isArray(orderedProjects) ? orderedProjects : []
  )
    .filter((p: Project) => p?.name || p?.description)
    .map((p: Project) => ({
      id: p?.id || `p-${Math.random()}`,
      title: p?.name || "",
      cat: p?.technologies?.slice(0, 2).join(" / ") || "Projet",
      desc: p?.description || "",
      tags: Array.isArray(p?.technologies) ? p.technologies : [],
      link: p?.url_demo || "",
      image: p?.url_image || null,
      icon: p?.project_icon || null,
      project: p, // Garder la référence au projet complet pour l'éditeur
    }));

  if (!user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <p>Chargement du portfolio...</p>
      </div>
    );
  }

  return (
    <div
      data-template="3"
      className={`min-h-screen overflow-x-hidden selection:bg-violet-500 selection:text-white ${fontClass} ${isDark ? "bg-[#050505] text-slate-200" : "bg-slate-50 text-slate-800"}`}
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
        [data-template="3"] h1 { font-family: var(--font-titles) !important; }
        [data-template="3"] h2, [data-template="3"] h5, [data-template="3"] h6 { font-family: var(--font-subtitles) !important; }
        [data-template="3"] .text-sm, [data-template="3"] .text-xs { font-family: var(--font-subtitles) !important; }
        [data-template="3"] h3, [data-template="3"] h4, [data-template="3"] p, [data-template="3"] li, [data-template="3"] .text-base { font-family: var(--font-body) !important; }
        [data-template="3"] .portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="3"] .portfolio-font-item-small { font-family: var(--font-item-small) !important; }
        [data-template="3"] .portfolio-nav-title { font-family: var(--font-titles) !important; }
        [data-template="3"] .portfolio-section-intro { font-family: var(--font-body) !important; }
        [data-template="3"] .portfolio-font-subtitle { font-family: var(--font-subtitles) !important; }
      `}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;400;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${isDark ? "#0a0a0a" : "#f1f5f9"}; }
        ::-webkit-scrollbar-thumb { background: #6d28d9; border-radius: 4px; }
        .glass-panel { background: ${isDark ? "rgba(15, 15, 20, 0.6)" : "rgba(255,255,255,0.8)"}; backdrop-filter: blur(12px); border: 1px solid ${isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.15)"}; }
        .grid-bg { background-size: 50px 50px; background-image: linear-gradient(to right, rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.05) 1px, transparent 1px); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-40" />
        {isDark && (
          <>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-600 rounded-full blur-[120px] opacity-15" />
          </>
        )}
      </div>

      <nav
        className={`left-0 w-full z-50 transition-all duration-300 ${isPreview ? "sticky top-0" : "fixed top-0"} ${scrolled ? (isDark ? "bg-[#050505]/90 border-b border-violet-900/30 backdrop-blur-md py-4" : "bg-white/90 border-b border-slate-200 backdrop-blur-md py-4") : "py-6"}`}
      >
        <div
          className={`${sectionMaxW} mx-auto px-4 sm:px-6 flex justify-between items-center`}
        >
          <button
            onClick={() => scrollTo("home")}
            className="text-xl sm:text-2xl font-bold tracking-tighter flex items-center gap-2"
          >
            <span
              className={`w-3 h-3 rounded-sm ${isDark ? "bg-violet-500" : "bg-violet-600"}`}
            />
            <span
              className={`portfolio-nav-title ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {formatNameWithSpace(profile?.title || displayName).slice(
                0,
                14,
              ) || "PORTFOLIO"}
              <span className="text-violet-400">.</span>
            </span>
          </button>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-sm">
            {checkSectionVisible("about") && (
              <button
                onClick={() => scrollTo("about")}
                className={`relative group ${isDark ? "text-slate-400 hover:text-violet-300" : "text-slate-600 hover:text-violet-600"}`}
              >
                <span className="text-violet-500 mr-1 opacity-0 group-hover:opacity-100">
                  {"//"}
                </span>
                À propos
              </button>
            )}
            {checkSectionVisible("experiences") && (
              <button
                onClick={() => scrollTo("experience")}
                className={`relative group ${isDark ? "text-slate-400 hover:text-violet-300" : "text-slate-600 hover:text-violet-600"}`}
              >
                <span className="text-violet-500 mr-1 opacity-0 group-hover:opacity-100">
                  {"//"}
                </span>
                Expérience
              </button>
            )}
            {checkSectionVisible("projects") && (
              <button
                onClick={() => scrollTo("projets")}
                className={`relative group ${isDark ? "text-slate-400 hover:text-violet-300" : "text-slate-600 hover:text-violet-600"}`}
              >
                <span className="text-violet-500 mr-1 opacity-0 group-hover:opacity-100">
                  {"//"}
                </span>
                Projets
              </button>
            )}
            {checkSectionVisible("skills") && (
              <button
                onClick={() => scrollTo("competences")}
                className={`relative group ${isDark ? "text-slate-400 hover:text-violet-300" : "text-slate-600 hover:text-violet-600"}`}
              >
                <span className="text-violet-500 mr-1 opacity-0 group-hover:opacity-100">
                  {"//"}
                </span>
                Compétences
              </button>
            )}
            <button
              onClick={() => scrollTo("contact")}
              className={
                isDark
                  ? "px-4 py-2 border border-violet-500/50 text-violet-300 hover:bg-violet-500/10 rounded"
                  : "px-4 py-2 border border-violet-400 text-violet-600 hover:bg-violet-50 rounded"
              }
            >
              Contact
            </button>
            <CVButton
              cvId={customization?.cvId}
              cvUrl={customization?.cvUrl}
              variant="ghost"
              size="sm"
              className={
                isDark
                  ? "text-slate-400 hover:text-violet-300 hover:bg-white/10"
                  : "text-slate-600 hover:text-violet-600 hover:bg-slate-200"
              }
            />
            {(isPreview || isEditable) && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded ${isDark ? "hover:bg-white/10 text-amber-400" : "hover:bg-slate-200 text-slate-600"}`}
                aria-label="Thème"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
          <div className="flex md:hidden items-center gap-2">
            {(isPreview || isEditable) && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded ${isDark ? "text-amber-400" : "text-slate-600"}`}
                aria-label="Thème"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 ${isDark ? "text-white" : "text-slate-900"}`}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className={`md:hidden border-t ${isDark ? "bg-[#050505] border-violet-900/30" : "bg-white border-slate-200"} px-6 py-4 space-y-3`}
          >
            {checkSectionVisible("about") && (
              <button
                onClick={() => scrollTo("about")}
                className={`block w-full text-left font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                À propos
              </button>
            )}
            {checkSectionVisible("experiences") && (
              <button
                onClick={() => scrollTo("experience")}
                className={`block w-full text-left font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Expérience
              </button>
            )}
            {checkSectionVisible("projects") && (
              <button
                onClick={() => scrollTo("projets")}
                className={`block w-full text-left font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Projets
              </button>
            )}
            {checkSectionVisible("skills") && (
              <button
                onClick={() => scrollTo("competences")}
                className={`block w-full text-left font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Compétences
              </button>
            )}
            <button
              onClick={() => scrollTo("contact")}
              className={`block w-full text-left font-mono text-violet-400`}
            >
              Contact
            </button>
            <div className="pt-2 border-t border-violet-900/30 dark:border-slate-200 mt-2 flex justify-center">
              <CVButton
                cvId={customization?.cvId}
                cvUrl={customization?.cvUrl}
                variant="ghost"
                size="sm"
                className={
                  isDark
                    ? "text-slate-400 hover:text-violet-300 hover:bg-white/10"
                    : "text-slate-600 hover:text-violet-600 hover:bg-slate-200"
                }
              />
            </div>
          </div>
        )}
      </nav>

      <section
        id="home"
        className={`relative min-h-screen flex items-center pt-16 sm:pt-20 z-10 ${sectionMaxW} mx-auto px-4 sm:px-6`}
      >
        <HeroBackgroundLayer
          type={templateOverrides?.hero_background_type ?? "default"}
          imageUrl={templateOverrides?.hero_background_image_url}
          overlayColor={isDark ? "rgb(5,5,5)" : "rgb(248,250,252)"}
          overlayOpacity={0.8}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        />
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          <div className="space-y-6">
            {heroBadgeVisible ? (
              <div
                className={`group/badge relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-widest ${isDark ? "bg-violet-900/20 border-violet-500/30 text-violet-300" : "bg-violet-100 border-violet-300 text-violet-700"} ${isEditable && onHeroOverridesChange ? "cursor-pointer" : ""}`}
                onClick={() =>
                  isEditable &&
                  onHeroOverridesChange &&
                  (setEditingValue(heroBadgeText), setEditingField("badge"))
                }
                role={isEditable ? "button" : undefined}
              >
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="badge"
                  position="inline"
                  className={isDark ? "text-violet-400" : "text-violet-600"}
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
                    className="flex-1 min-w-[140px] bg-transparent border-none focus:outline-none text-violet-300"
                    placeholder="Badge"
                  />
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {heroBadgeText}
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
                      className="ml-1 p-0.5 rounded bg-red-500/80 text-white opacity-0 group-hover/badge:opacity-100"
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
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed ${isDark ? "border-violet-500/30 text-violet-400" : "border-violet-400 text-violet-600"}`}
              >
                <Plus className="w-3 h-3" /> Ajouter un badge
              </button>
            ) : null}

            <div className="relative group/hero-subtitle">
              <HeroEditHint
                show={isEditable && !!onHeroOverridesChange}
                groupName="hero-subtitle"
                className={isDark ? "text-violet-400" : "text-violet-600"}
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
                    e.key === "Enter" && (e.preventDefault(), commitHeroEdit())
                  }
                  autoFocus
                  className={`block w-full mb-2 bg-transparent border-b focus:outline-none text-lg md:text-xl ${isDark ? "text-slate-400 border-violet-500/50" : "text-slate-600 border-violet-400"}`}
                  placeholder="Bonjour, je suis…"
                />
              ) : (
                <h2
                  className={`block text-lg md:text-xl mb-2 ${isDark ? "text-slate-400" : "text-slate-600"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-violet-500/40" : ""}`}
                  onClick={() =>
                    isEditable &&
                    onHeroOverridesChange &&
                    (setEditingValue(heroSubtitle), setEditingField("subtitle"))
                  }
                  role={isEditable ? "button" : undefined}
                >
                  {heroSubtitle}
                </h2>
              )}
            </div>

            <div className="relative group/hero-title">
              <HeroEditHint
                show={isEditable && !!onHeroOverridesChange}
                groupName="hero-title"
                className={isDark ? "text-violet-400" : "text-violet-600"}
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
                    e.key === "Enter" && (e.preventDefault(), commitHeroEdit())
                  }
                  autoFocus
                  className={`block w-full text-4xl sm:text-6xl md:text-8xl font-bold leading-tight bg-transparent border-b focus:outline-none ${isDark ? "text-white border-violet-500/50" : "text-slate-900 border-violet-400"}`}
                  placeholder="Votre nom ou titre"
                />
              ) : (
                <h1
                  className={`text-4xl sm:text-6xl md:text-8xl font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-violet-500/40" : ""}`}
                  onClick={() =>
                    isEditable &&
                    onHeroOverridesChange &&
                    (setEditingValue(heroTitle), setEditingField("title"))
                  }
                  role={isEditable ? "button" : undefined}
                >
                  {heroTitle}
                </h1>
              )}
            </div>

            {(heroBio || (isEditable && onHeroOverridesChange)) && (
              <div className="relative group/hero-bio">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-bio"
                  className={isDark ? "text-violet-400" : "text-violet-600"}
                />
                {isEditable &&
                onHeroOverridesChange &&
                editingField === "bio" ? (
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitHeroEdit}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      (e.preventDefault(), commitHeroEdit())
                    }
                    autoFocus
                    rows={3}
                    className={`block w-full text-lg md:text-xl bg-transparent border-b focus:outline-none resize-none ${isDark ? "text-slate-400 border-violet-500/50" : "text-slate-600 border-violet-400"}`}
                    placeholder="Courte bio ou accroche"
                  />
                ) : (
                  <p
                    className={`text-lg md:text-xl max-w-lg leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-violet-500/40" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroBio || ""), setEditingField("bio"))
                    }
                    role={isEditable ? "button" : undefined}
                  >
                    {heroBio ||
                      (isEditable && onHeroOverridesChange
                        ? "Ajoutez une courte bio…"
                        : "")}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => scrollTo("projets")}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-sm transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center gap-2"
              >
                <span className="portfolio-font-subtitle">
                  Voir mes travaux
                </span>{" "}
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-6 pt-8 text-slate-500">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-violet-400 transition-colors"
                >
                  <Github size={24} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  <Linkedin size={24} />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="hover:text-fuchsia-400 transition-colors"
                >
                  <Mail size={24} />
                </a>
              )}
            </div>
          </div>

          <div className="relative hidden lg:block overflow-visible">
            <div className="relative w-full aspect-square max-w-md mx-auto animate-float overflow-visible">
              <div
                className={`absolute inset-0 rounded-full border backdrop-blur-sm z-0 ${isDark ? "bg-gradient-to-tr from-violet-600/20 to-transparent border-violet-500/20" : "bg-gradient-to-tr from-violet-200/40 to-transparent border-violet-300/40"}`}
              />
              <div className="absolute inset-4 border border-fuchsia-500/30 rounded-full flex items-center justify-center overflow-hidden z-[1] group/hero-photo">
                <HeroEditHint
                  show={isEditable}
                  groupName="hero-photo"
                  className="text-violet-400 top-2 right-2 z-10"
                />
                <div
                  className={`w-3/4 h-3/4 rounded-full border relative overflow-hidden ${isDark ? "bg-violet-900/10 border-violet-400/40" : "bg-violet-100/50 border-violet-300/50"} ${isEditable ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    isEditable && heroFileInputRef.current?.click()
                  }
                  role={isEditable ? "button" : undefined}
                >
                  {heroImageSrc ? (
                    <img
                      src={heroImageSrc}
                      alt={displayName}
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center ${isDark ? "text-violet-200/50" : "text-violet-400/60"}`}
                    >
                      <span className="font-mono text-xs border border-violet-500/30 px-2 py-1 rounded">
                        SYSTEM_ONLINE
                      </span>
                      <span className="mt-2 text-2xl font-bold">
                        {initials}
                      </span>
                    </div>
                  )}
                  {isEditable && (
                    <>
                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleHeroImageChange}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        {heroImageUploading ? (
                          <span className="text-white text-sm">
                            Chargement…
                          </span>
                        ) : (
                          <span className="text-white text-sm flex items-center gap-2">
                            <Camera size={20} /> Changer la photo
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div
                className={`absolute -right-4 top-20 p-4 glass-panel rounded-lg border-l-4 border-violet-500 max-w-[180px] z-20`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white" : "text-slate-800"}`}
                  >
                    Expériences
                  </span>
                </div>
                <div
                  className={`w-full h-1 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}
                >
                  <div
                    className="bg-violet-400 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (experiences.length || 0) * 25)}%`,
                    }}
                  />
                </div>
                <div className="text-right text-[10px] text-violet-300 mt-1 font-mono">
                  {experiences.length}+ exp
                </div>
              </div>
              <div
                className={`absolute -left-8 bottom-20 p-4 glass-panel rounded-lg border-l-4 border-fuchsia-500 max-w-[200px] z-20`}
              >
                <div
                  className={`text-xs font-mono mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  PROJET RÉCENT
                </div>
                <div
                  className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {projects[0]?.name || "Portfolio"}
                </div>
                {projects[0]?.technologies &&
                  projects[0].technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {projects[0].technologies.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] font-mono text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sections en grille 2 colonnes : ordre = toolbar (drag to order). Paires (0,1), (2,3)... dernière seule si impair --- */}
      {sectionRows.map((row, rowIdx) => {
        const cells = row
          .map((s) => ({ section: s, content: renderSectionBlock(s) }))
          .filter(
            (c) =>
              c.content != null &&
              c.section.id !== "contact" &&
              c.section.id !== "languages" &&
              c.section.id !== "certifications",
          );
        if (cells.length === 0) return null;
        return (
          <div
            key={rowIdx}
            className={`${sectionMaxW} mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:gap-8 relative z-10 ${cells.length === 2 ? "md:grid-cols-2" : ""}`}
          >
            {cells.map((cell) => (
              <div
                key={cell.section.id}
                className={cells.length === 1 ? "md:col-span-2" : ""}
              >
                {cell.content}
              </div>
            ))}
          </div>
        );
      })}

      {/* Modal projet */}
      {projectModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setProjectModal(null)}
          >
            <div
              className={`max-w-lg w-full rounded-2xl p-6 shadow-xl ${isDark ? "bg-[#0e0e12] border border-violet-900/30" : "bg-white border border-slate-200"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3
                  className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {projectModal.title}
                </h3>
                <button
                  onClick={() => setProjectModal(null)}
                  className={`p-1 rounded ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
              <p className={`text-sm font-mono text-violet-400 uppercase mb-2`}>
                {projectModal.cat}
              </p>
              <p
                className={`mb-4 leading-relaxed whitespace-pre-line ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {projectModal.desc
                  .replace(/^-\s+/gm, "→ ")
                  .replace(/\n-\s+/g, "\n→ ")}
              </p>
              {projectModal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {projectModal.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded text-xs font-mono ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {projectModal.link && (
                <a
                  href={projectModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
                >
                  Voir le projet <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Langues et Certifications toujours ensemble, après toutes les autres sections mais avant le contact */}
      {(checkSectionVisible("languages") && languages.length > 0) ||
      (checkSectionVisible("certifications") && certifications.length > 0) ? (
        <div
          className={`${sectionMaxW} mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:gap-8 relative z-10 ${checkSectionVisible("languages") && languages.length > 0 && checkSectionVisible("certifications") && certifications.length > 0 ? "md:grid-cols-2" : ""}`}
        >
          {checkSectionVisible("languages") && languages.length > 0 && (
            <div
              className={
                checkSectionVisible("languages") &&
                languages.length > 0 &&
                checkSectionVisible("certifications") &&
                certifications.length > 0
                  ? ""
                  : "md:col-span-2"
              }
            >
              {renderSectionBlock({
                id: "languages",
                label: "Langues",
                visible: true,
              })}
            </div>
          )}
          {checkSectionVisible("certifications") &&
            certifications.length > 0 && (
              <div
                className={
                  checkSectionVisible("languages") &&
                  languages.length > 0 &&
                  checkSectionVisible("certifications") &&
                  certifications.length > 0
                    ? ""
                    : "md:col-span-2"
                }
              >
                {renderSectionBlock({
                  id: "certifications",
                  label: "Certifications",
                  visible: true,
                })}
              </div>
            )}
        </div>
      ) : null}

      {/* Contact toujours à la toute fin, après toutes les sections y compris certifications */}
      {checkSectionVisible("contact") && (
        <footer
          id="contact"
          className={`py-6 border-t relative z-10 ${isDark ? "border-violet-900/30 bg-[#020202]" : "border-slate-200 bg-slate-50"}`}
        >
          <div className="text-center">
            <h2
              className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Prêt à <span className="text-fuchsia-500">collaborer</span> ?
            </h2>
            <p
              className={`portfolio-section-intro mb-8 max-w-xl mx-auto text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Je suis toujours à la recherche de nouveaux défis techniques.
            </p>
            <a
              href={`mailto:${email}`}
              className={`inline-block px-8 py-3 font-bold rounded-lg shadow-lg transition-all hover:scale-105 mb-8 ${isDark ? "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30" : "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20"}`}
            >
              <span className="portfolio-font-subtitle">
                Envoyer un message
              </span>
            </a>
            <div className="flex justify-center gap-6">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-all ${isDark ? "bg-slate-900 text-slate-400 hover:text-white hover:bg-violet-600" : "bg-slate-200 text-slate-600 hover:text-white hover:bg-violet-600"}`}
                >
                  <Github size={20} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-all ${isDark ? "bg-slate-900 text-slate-400 hover:text-white hover:bg-violet-600" : "bg-slate-200 text-slate-600 hover:text-white hover:bg-violet-600"}`}
                >
                  <Linkedin size={20} />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={`p-2 rounded-full transition-all ${isDark ? "bg-slate-900 text-slate-400 hover:text-white hover:bg-violet-600" : "bg-slate-200 text-slate-600 hover:text-white hover:bg-violet-600"}`}
                >
                  <Mail size={20} />
                </a>
              )}
            </div>
            <p
              className={`text-xs font-mono mt-4 ${isDark ? "text-slate-600" : "text-slate-500"}`}
            >
              &copy; {new Date().getFullYear()}{" "}
              {user?.full_name || user?.username || "PortfoliA"}
            </p>
          </div>
        </footer>
      )}

      {/* _removed_main_sections */}
      {false && (
        <section
          id="experiences"
          className={`py-20 px-6 ${isDark ? "bg-[#151515]" : "bg-gray-100"}`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
              Expériences Professionnelles
            </h2>
            <div className="space-y-8">
              {experiences.map((exp, index) => {
                // Gérer les descriptions : achievements (tableau) OU description (string)
                let descriptionItems: string[] = [];
                if (
                  exp.achievements &&
                  Array.isArray(exp.achievements) &&
                  exp.achievements.length > 0
                ) {
                  descriptionItems = exp.achievements;
                } else if (exp.description) {
                  descriptionItems = [exp.description];
                }

                const dateStr = exp.is_current
                  ? `${new Date(exp.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - Présent`
                  : exp.end_date
                    ? `${new Date(exp.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - ${new Date(exp.end_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`
                    : `${new Date(exp.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} - Présent`;

                return (
                  <div
                    key={exp.id || index}
                    className={`${cardBg} ${cardShadow} p-6 md:p-8 rounded-[2rem] border ${borderSubtle}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {showLogos && (
                          <Logo
                            name={exp.company}
                            type="company"
                            size={56}
                            className="mt-1 flex-shrink-0"
                            showFallback={false}
                          />
                        )}
                        <div className="flex-1">
                          <h3
                            className={`portfolio-font-item text-xl md:text-2xl font-bold ${textMain} mb-2`}
                          >
                            {exp.title || "Poste"}
                          </h3>
                          <p
                            className={`portfolio-font-item-small text-lg ${accentPurpleText} font-medium`}
                          >
                            {exp.company || "Entreprise"}
                            {exp.location && ` • ${exp.location}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm ${textMuted} whitespace-nowrap`}
                      >
                        {dateStr}
                      </span>
                    </div>
                    {descriptionItems.length > 0 && (
                      <div
                        className={`space-y-2 ${textMuted} whitespace-pre-line`}
                      >
                        {descriptionItems.map((item, i) => (
                          <div
                            key={i}
                            className="text-sm md:text-base leading-relaxed"
                          >
                            {item
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        /* 3D Flip Animation Utilities */
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};
