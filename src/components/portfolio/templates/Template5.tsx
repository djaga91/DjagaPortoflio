import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Cpu,
  Briefcase,
  GraduationCap,
  Folder,
  Code,
  Send,
  Menu,
  X,
  Globe,
  Shield,
  Layout,
  Camera,
  Plus,
  Trash2,
  Sun,
  Moon,
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
import { SkillIcon } from "./SkillIcon";
import { HeroEditHint } from "./HeroEditHint";
import { Logo } from "../../Logo";
import { ProjectImageIconEditor } from "../ProjectImageIconEditor";
import { CVButton } from "../CVButton";
import { HeroBackgroundLayer } from "../HeroBackgroundLayer";
import { API_URL, portfolioAPI } from "../../../services/api";
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

/** Convertit le niveau de langue en pourcentage pour la barre de progression */
function languageLevelToPercent(level: string | null | undefined): number {
  if (!level || !String(level).trim()) return 50;
  const s = String(level).replace(/\s/g, "").toUpperCase();
  const num = parseInt(s.replace(/%/g, ""), 10);
  if (!Number.isNaN(num) && num >= 0 && num <= 100) return num;
  if (/^C2|MAITRISE|COURANT$/i.test(s)) return 95;
  if (/^C1$/i.test(s)) return 85;
  if (/^B2$/i.test(s)) return 70;
  if (/^B1$/i.test(s)) return 55;
  if (/^A2$/i.test(s)) return 40;
  if (/^A1$/i.test(s)) return 25;
  if (/^NATIVE|NATIF|BILINGUE$/i.test(s)) return 100;
  return 50;
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
      : date.toLocaleDateString("fr-FR", { year: "numeric" });
  };
  const start = fmt(startDate);
  const end = isCurrent ? "Présent" : fmt(endDate);
  return end !== "—" ? `${start} - ${end}` : start;
}

/** Calcule les années d'expérience à partir des expériences */
function computeYearsExperience(experiences: Experience[]): number {
  if (!experiences?.length) return 0;
  const dates: number[] = [];
  experiences.forEach((exp) => {
    const start = exp.start_date ? new Date(exp.start_date).getFullYear() : NaN;
    const end = exp.is_current
      ? new Date().getFullYear()
      : exp.end_date
        ? new Date(exp.end_date).getFullYear()
        : NaN;
    if (!Number.isNaN(start)) dates.push(start);
    if (!Number.isNaN(end)) dates.push(end);
  });
  if (dates.length === 0) return 0;
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  return Math.max(0, max - min);
}

export interface Template5Props {
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
  /** Callback pour mettre à jour le niveau d'une langue (template 5 : barre de progression) */
  onLanguageLevelChange?: (languageId: string, level: string) => void;
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

export const Template5: React.FC<Template5Props> = ({
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
  templateOverrides,
  isEditable = false,
  onThemeChange,
  onHeroOverridesChange,
  onLanguageLevelChange,
  isPreview = false,
  showLogos = true,
  itemOrder,
  onItemOrderChange,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const [time, setTime] = useState(new Date());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingField, setEditingField] = useState<
    "badge" | "subtitle" | "title" | "bio" | null
  >(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (initialTheme !== theme) setTheme(initialTheme);
  }, [initialTheme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    onThemeChange?.(next);
  };
  const [editingValue, setEditingValue] = useState("");
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  // Refs pour la section "À propos" personnalisée
  const aboutTextareaRef = useRef<HTMLTextAreaElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [, setAboutImageUploading] = useState(false);

  const checkSectionVisible = (sectionId: string) =>
    isSectionVisible(sectionId, customization);
  const visibleSectionsInOrder = getVisibleSectionsInOrder(customization);
  const t5ColumnOrder = customization?.template5ColumnOrder ?? {
    educationCertifications: "education_left" as const,
    languagesInterests: "languages_left" as const,
  };

  /** Enregistre la modification hero (comme Template1/Template4) */
  const commitHeroEdit = () => {
    if (!onHeroOverridesChange || editingField === null) return;
    const next = { ...templateOverrides } as Partial<TemplateOverrides>;
    if (editingField === "badge")
      next.hero_badge_text = editingValue.trim() || undefined;
    if (editingField === "subtitle")
      next.hero_subtitle = editingValue.trim() || undefined;
    if (editingField === "title")
      next.hero_title = editingValue.trim() || undefined;
    if (editingField === "bio") next.hero_bio = editingValue;
    onHeroOverridesChange(next);
    setEditingField(null);
  };
  const fontClass = getFontClass(customization || undefined);
  const fontTitles = getFontFamilyForRole(customization || undefined, "titles");
  const fontSubtitles = getFontFamilyForRole(
    customization || undefined,
    "subtitles",
  );
  const fontItem = getFontFamilyForRole(customization || undefined, "item");
  const fontItemSmall = getFontFamilyForRole(
    customization || undefined,
    "itemSmall",
  );
  const fontBody = getFontFamilyForRole(customization || undefined, "body");
  const customFonts = customization?.customFonts ?? [];
  const apiBase = (API_URL || "").replace(/\/$/, "");

  // Hero : même logique que Template1 (surcharges > profil > user)
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
    "Bonjour, je suis";
  const heroBio = templateOverrides?.hero_bio ?? profile?.bio ?? "";
  const heroBadgeText =
    (templateOverrides?.hero_badge_text?.trim() || undefined) ??
    "Disponible pour freelance";
  const heroBadgeVisible = templateOverrides?.hero_badge_visible !== false;

  const fullName = user?.full_name || profile?.title || user?.username || "";
  const bio = profile?.bio || "";

  // Section "À propos" : utiliser bio profil ou section personnalisée
  const useCustomAbout = templateOverrides?.about_use_custom === true;
  const aboutText = useCustomAbout
    ? templateOverrides?.about_text || ""
    : profile?.bio || "";
  const aboutImageUrl = useCustomAbout
    ? templateOverrides?.about_image_url
    : null;
  const location = profile?.location || "";
  const email = user?.email || "";
  const githubUrl = profile?.github_url || "";
  const linkedinUrl = profile?.linkedin_url || "";

  // Ajuster automatiquement la hauteur du textarea "À propos"
  useEffect(() => {
    if (aboutTextareaRef.current && isEditable && useCustomAbout) {
      aboutTextareaRef.current.style.height = "auto";
      aboutTextareaRef.current.style.height = `${aboutTextareaRef.current.scrollHeight}px`;
    }
  }, [aboutText, isEditable, useCustomAbout, templateOverrides?.about_layout]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(windowHeight > 0 ? totalScroll / windowHeight : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("fr-FR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Appliquer l'ordre personnalisé aux items AVANT de les utiliser
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

  // Données dérivées du profil — "Auto-détecté" / "Autres" → "Mes compétences techniques"
  // Utiliser orderedSkills pour respecter l'ordre personnalisé
  const skillsByCategory: Array<{ category: string; items: string[] }> =
    (() => {
      const map = new Map<string, string[]>();
      const normalizeCategory = (raw: string | null | undefined) => {
        const r = (raw || "").trim();
        if (
          !r ||
          /^auto\s*[-]?détecté?$/i.test(r) ||
          /^auto\s*[-]?detected$/i.test(r) ||
          /^autres$/i.test(r)
        ) {
          return "Mes compétences techniques";
        }
        return r;
      };
      (orderedSkills || []).forEach((s) => {
        const cat = normalizeCategory(s.category);
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(s.name || "");
      });
      return Array.from(map.entries()).map(([category, items]) => ({
        category,
        items,
      }));
    })();

  const formattedExperiences = (experiences || []).map((exp) => ({
    role: exp.title || "",
    company: exp.company || "",
    period: formatExperiencePeriod(
      exp.start_date,
      exp.end_date,
      exp.is_current,
    ),
    desc:
      exp.description ||
      (exp.achievements && exp.achievements.length
        ? exp.achievements.join(" ")
        : ""),
    tags: exp.technologies || [],
  }));

  const formattedEducations = (educations || []).map((edu) => ({
    degree: edu.degree || "",
    school: edu.school || "",
    year: edu.end_date
      ? new Date(edu.end_date).getFullYear().toString()
      : edu.start_date
        ? new Date(edu.start_date).getFullYear().toString()
        : "—",
    honors: edu.grade || "",
  }));

  const formattedProjects = (orderedProjects || []).map((proj) => ({
    title: proj.name || "",
    type: (proj.technologies && proj.technologies[0]) || "Projet",
    desc: proj.description || "",
    tech: (proj.technologies && proj.technologies.join(" / ")) || "",
    link: proj.url_demo || "",
    github: proj.url_github || "",
    image: proj.url_image || null,
    icon: proj.project_icon || null,
    project: proj, // Garder la référence au projet complet pour l'éditeur
  }));

  const formattedLanguages = (orderedLanguages || []).map((lang) => ({
    label: lang.name || "",
    status: lang.level || "",
    integrity: `${languageLevelToPercent(lang.level)}%`,
    code: lang.id ? lang.id.slice(0, 5).toUpperCase() : "",
  }));

  const formattedCerts = (orderedCertifications || []).map((cert) => ({
    id: cert.issuer || cert.id?.slice(0, 8) || "",
    label: cert.name || "",
    date: cert.date_obtained || "",
    hash: cert.id ? cert.id.slice(-6) : "cert",
  }));

  const interestsForAddons = (orderedInterests || []).map((i) => ({
    label: i.name || "",
    sub: "",
  }));

  const yearsExp = computeYearsExperience(experiences);
  const projectCount = (projects || []).length;

  /** Index d'ordre d'affichage pour le drag-and-drop (templateCustomization.sections). */
  const sectionOrderIndex = (sectionId: string): number => {
    const idx = visibleSectionsInOrder.findIndex((s) => s.id === sectionId);
    return idx >= 0 ? idx : 999;
  };
  const navLinks = [
    ...(checkSectionVisible("skills")
      ? [{ label: "COMPÉTENCES", href: "#stack" }]
      : []),
    ...(checkSectionVisible("experiences")
      ? [{ label: "EXPÉRIENCES", href: "#experience" }]
      : []),
    ...(checkSectionVisible("projects")
      ? [{ label: "PROJETS", href: "#projects" }]
      : []),
    ...(checkSectionVisible("education")
      ? [{ label: "FORMATION", href: "#education" }]
      : []),
  ];

  if (!user && !profile) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center font-mono ${isDark ? "bg-[#050505] text-[#e0e0e0]" : "bg-[#f5f5f5] text-[#111]"}`}
      >
        <p>Chargement du portfolio...</p>
      </div>
    );
  }

  const gridColor = isDark ? "#1a1a1a" : "#e5e5e5";

  return (
    <div
      data-theme={theme}
      data-template="5"
      className={`min-h-screen font-mono selection:bg-[#ccff00] selection:text-black overflow-x-hidden scroll-smooth ${fontClass} ${isDark ? "bg-[#050505] text-[#e0e0e0]" : "bg-[#f5f5f5] text-[#111]"}`}
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
        [data-template="5"] h1 { font-family: var(--font-titles) !important; }
        [data-template="5"] h2, [data-template="5"] h5, [data-template="5"] h6 { font-family: var(--font-subtitles) !important; }
        [data-template="5"] .text-sm, [data-template="5"] .text-xs { font-family: var(--font-subtitles) !important; }
        [data-template="5"] h3, [data-template="5"] h4, [data-template="5"] p, [data-template="5"] li, [data-template="5"] .text-base { font-family: var(--font-body) !important; }
        [data-template="5"] .portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="5"] .portfolio-font-item-small { font-family: var(--font-item-small) !important; }
        [data-template="5"] .portfolio-nav-title { font-family: var(--font-subtitles) !important; }
        [data-template="5"] .portfolio-section-intro { font-family: var(--font-body) !important; }
        [data-template="5"] p.portfolio-section-intro,
        [data-template="5"] .portfolio-section-intro.text-sm,
        [data-template="5"] .portfolio-section-intro.text-base { font-family: var(--font-body) !important; }
        [data-template="5"] .portfolio-font-subtitle { font-family: var(--font-subtitles) !important; }
        /* Zone À propos : police description en édition et en publié, sans .text-sm qui force les sous-titres */
        [data-template="5"] .portfolio-about-text { font-family: var(--font-body) !important; font-size: 0.875rem; line-height: 1.625; }
        @media (min-width: 768px) {
          [data-template="5"] .portfolio-about-text { font-size: 1rem; }
        }
        /* Éviter que les 3 lignes du hero (sous-titre, nom, Portfolio) soient coupées */
        [data-template="5"] header .hero-title-block,
        [data-template="5"] header .hero-title-block h1 { overflow: visible !important; }
        [data-template="5"] header .hero-title-block h1 { line-height: 1.15 !important; padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
      `}</style>
      {/* Grille de fond */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Nav — sticky en preview pour rester visible dans la zone de prévisualisation */}
      <nav
        className={`left-0 w-full z-50 flex justify-between items-center px-4 py-3 border-b text-xs md:text-sm uppercase tracking-widest ${isPreview ? "sticky top-0" : "fixed top-0"} ${isDark ? "border-[#333] bg-[#050505]/95" : "border-[#e0e0e0] bg-white/95"} backdrop-blur-md`}
      >
        <div className="flex items-center gap-4 z-50">
          <div
            className={`w-3 h-3 animate-pulse ${isDark ? "bg-[#ccff00]" : "bg-[#16a34a]"}`}
          />
          <a
            href="#"
            className={`portfolio-nav-title font-bold transition-colors ${isDark ? "hover:text-[#ccff00]" : "hover:text-[#16a34a]"}`}
          >
            Portfolio
          </a>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={`px-4 py-2 transition-all ${isDark ? "text-[#666] hover:text-[#ccff00] hover:bg-[#111]" : "text-[#666] hover:text-[#16a34a] hover:bg-[#f0f0f0]"}`}
            >
              [ {link.label} ]
            </a>
          ))}
          <a
            href="#contact"
            className={`ml-4 px-4 py-2 font-bold transition-all ${isDark ? "border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black" : "border border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a] hover:text-white"}`}
          >
            CONTACT
          </a>
          <CVButton
            cvId={customization?.cvId}
            cvUrl={customization?.cvUrl}
            variant="ghost"
            size="sm"
            className={
              isDark
                ? "text-[#666] hover:text-[#ccff00] hover:bg-[#111]"
                : "text-[#666] hover:text-[#16a34a] hover:bg-[#f0f0f0]"
            }
          />
        </div>
        <div className="flex items-center gap-4 z-50">
          {(isPreview || isEditable) && (
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded transition-colors ${isDark ? "hover:bg-[#111] text-[#ccff00]" : "hover:bg-[#f0f0f0] text-[#16a34a]"}`}
              aria-label="Changer le thème"
              title={isDark ? "Mode jour" : "Mode nuit"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <div
            className={`font-bold font-mono hidden sm:block ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
          >
            {formatTime(time)}
          </div>
          <button
            type="button"
            onClick={toggleMobileMenu}
            className={`md:hidden transition-colors ${isDark ? "text-white hover:text-[#ccff00]" : "text-[#111] hover:text-[#16a34a]"}`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div
            className={`absolute top-full left-0 w-full flex flex-col p-4 gap-4 md:hidden shadow-2xl animate-in slide-in-from-top-5 duration-200 border-b ${isDark ? "bg-[#0a0a0a] border-[#333]" : "bg-white border-[#e0e0e0]"}`}
          >
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 border-b ${isDark ? "text-[#888] hover:text-[#ccff00] border-[#222]" : "text-[#666] hover:text-[#16a34a] border-[#eee]"}`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-center py-3 font-bold mt-2 ${isDark ? "bg-[#ccff00] text-black" : "bg-[#16a34a] text-white"}`}
            >
              CONTACT
            </a>
            <div className="pt-2 border-t border-[#222] dark:border-[#eee] mt-2 flex justify-center">
              <CVButton
                cvId={customization?.cvId}
                cvUrl={customization?.cvUrl}
                variant="ghost"
                size="sm"
                className={
                  isDark
                    ? "text-[#888] hover:text-[#ccff00] hover:bg-[#111]"
                    : "text-[#666] hover:text-[#16a34a] hover:bg-[#f0f0f0]"
                }
              />
            </div>
          </div>
        )}
      </nav>

      {/* Scroll bar */}
      <div
        className={`fixed right-0 top-0 w-1 h-full z-50 hidden md:block ${isDark ? "bg-[#111]" : "bg-[#e5e5e5]"}`}
      >
        <div
          className={`w-full ${isDark ? "bg-[#ccff00]" : "bg-[#16a34a]"}`}
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Header */}
      <header
        className={`relative z-10 pb-20 px-4 md:px-12 border-b overflow-visible ${isDark ? "border-[#333]" : "border-[#e0e0e0]"} ${isPreview ? "pt-8" : "pt-32"}`}
      >
        <HeroBackgroundLayer
          type={templateOverrides?.hero_background_type ?? "default"}
          imageUrl={templateOverrides?.hero_background_image_url}
          overlayColor={isDark ? "rgb(5,5,5)" : "rgb(245,245,245)"}
          overlayOpacity={0.8}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        />
        <div className="max-w-7xl mx-auto w-full min-w-0 overflow-visible relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <p
              className={`mb-4 md:mb-0 text-xs ${isDark ? "text-[#666]" : "text-[#666]"}`}
            >
              [ IDENTITÉ ]
            </p>
            {heroBadgeVisible ? (
              <div
                className={`group/badge relative flex items-center gap-2 border px-3 py-1 ${isEditable && onHeroOverridesChange ? "cursor-pointer" : ""} ${isDark ? "border-[#333] bg-[#111] hover:border-[#ccff00]/50" : "border-[#e0e0e0] bg-[#f0f0f0] hover:border-[#16a34a]/50"}`}
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
                  className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
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
                    className={`flex-1 min-w-[120px] bg-transparent border-none focus:outline-none text-xs ${isDark ? "text-[#ccff00] placeholder:text-[#ccff00]/60" : "text-[#16a34a] placeholder:text-[#16a34a]/60"}`}
                    placeholder="Disponible pour freelance"
                  />
                ) : (
                  <>
                    <div
                      className={`w-2 h-2 rounded-full ${isDark ? "bg-[#ccff00]" : "bg-[#16a34a]"}`}
                    />
                    <span
                      className={`text-xs ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                    >
                      {heroBadgeText.replace(/\s/g, " ")}
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
                      className="p-0.5 rounded bg-red-500/90 text-white opacity-0 group-hover/badge:opacity-100 ml-1 transition-opacity"
                      title="Supprimer le badge"
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
                className={`flex items-center gap-2 border border-dashed px-3 py-1 ${isDark ? "border-[#333] text-[#555] hover:border-[#ccff00]/50 hover:text-[#ccff00]" : "border-[#ccc] text-[#666] hover:border-[#16a34a]/50 hover:text-[#16a34a]"}`}
              >
                <Plus className="w-3 h-3" />
                <span className="text-xs">Ajouter un badge</span>
              </button>
            ) : null}
          </div>
          <div className="hero-title-block w-full overflow-visible mb-12 pt-6 pb-8 md:pt-8 md:pb-10">
            <h1
              className={`relative text-5xl md:text-8xl font-black tracking-tighter mix-blend-screen ${isDark ? "" : ""}`}
              style={{ width: "100%", overflow: "visible" }}
            >
              <div className="relative group/hero-subtitle inline-block max-w-full pt-1">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-subtitle"
                  className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
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
                    className={`block w-full text-2xl md:text-4xl bg-transparent border-b focus:outline-none mb-2 ${isDark ? "border-[#ccff00]/50 text-white" : "border-[#16a34a]/50 text-[#111]"}`}
                    placeholder="Bonjour je suis..."
                  />
                ) : (
                  <span
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroSubtitle),
                      setEditingField("subtitle"))
                    }
                    className={`inline-block break-words ${isEditable ? "cursor-pointer hover:opacity-80" : ""}`}
                    style={{
                      maxWidth: "100%",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {heroSubtitle}
                  </span>
                )}
              </div>
              <div className="h-3 md:h-4" aria-hidden="true" />
              <div className="relative group/hero-title inline-block max-w-full py-1">
                <HeroEditHint
                  show={isEditable && !!onHeroOverridesChange}
                  groupName="hero-title"
                  className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
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
                    className={`block w-full text-4xl md:text-7xl bg-transparent border-b focus:outline-none text-transparent bg-clip-text ${isDark ? "border-[#ccff00]/50 bg-gradient-to-r from-[#666] to-[#333]" : "border-[#16a34a]/50 bg-gradient-to-r from-[#444] to-[#222]"}`}
                    placeholder="Votre nom"
                  />
                ) : (
                  <span
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroTitle), setEditingField("title"))
                    }
                    className={`inline-block break-words text-transparent bg-clip-text bg-gradient-to-r ${isDark ? "from-[#666] to-[#333]" : "from-[#444] to-[#222]"} ${isEditable ? "cursor-pointer hover:opacity-80" : ""}`}
                    style={{
                      maxWidth: "100%",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {heroTitle}
                  </span>
                )}
              </div>
              <div className="h-3 md:h-4" aria-hidden="true" />
              <span
                className={`inline-block break-words pt-1 ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                style={{
                  maxWidth: "100%",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                Portfolio
              </span>
            </h1>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-px border ${isDark ? "bg-[#333] border-[#333]" : "bg-[#e0e0e0] border-[#e0e0e0]"}`}
          >
            <div
              className={`col-span-1 md:col-span-4 relative h-80 md:h-auto group/hero-photo overflow-hidden border-b md:border-b-0 ${isEditable && onHeroOverridesChange ? "cursor-pointer" : ""} ${isDark ? "bg-[#050505] border-[#333]" : "bg-white border-[#e0e0e0]"}`}
              onClick={() =>
                isEditable &&
                onHeroOverridesChange &&
                heroFileInputRef.current?.click()
              }
              role={isEditable ? "button" : undefined}
            >
              <HeroEditHint
                show={isEditable && !!onHeroOverridesChange}
                groupName="hero-photo"
                className={
                  isDark
                    ? "text-[#ccff00] top-2 right-2"
                    : "text-[#16a34a] top-2 right-2"
                }
              />
              {heroImageSrc ? (
                <img
                  src={heroImageSrc}
                  alt="Profil"
                  className="w-full h-full object-cover filter grayscale contrast-125 group-hover/hero-photo:contrast-100 transition-all duration-500"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-4xl font-black ${isDark ? "bg-[#111] text-[#333]" : "bg-[#f0f0f0] text-[#999]"}`}
                >
                  ?
                </div>
              )}
              <div
                className={`absolute inset-0 mix-blend-multiply opacity-0 group-hover/hero-photo:opacity-60 transition-opacity duration-300 ${isDark ? "bg-[#ccff00]" : "bg-[#16a34a]"}`}
              />
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/hero-photo:opacity-100 transition-opacity flex items-center justify-center">
                    {heroImageUploading ? (
                      <span className="text-white text-sm">Chargement…</span>
                    ) : (
                      <span className="text-white text-sm flex items-center gap-2">
                        <Camera size={20} /> Changer la photo
                      </span>
                    )}
                  </div>
                </>
              )}
              <div
                className={`absolute bottom-2 left-2 px-2 py-1 text-[10px] border ${isDark ? "bg-black text-[#ccff00] border-[#ccff00]" : "bg-[#111] text-[#16a34a] border-[#16a34a]"}`}
              >
                IMG_REF_001
              </div>
            </div>
            <div
              className={`col-span-1 md:col-span-5 p-6 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r ${isDark ? "bg-[#050505] border-[#333]" : "bg-white border-[#e0e0e0]"}`}
            >
              <div
                className={`text-xs font-mono mb-6 ${isDark ? "text-[#555]" : "text-[#666]"}`}
              >
                {location && (
                  <p>
                    LOCALISATION: {location.toUpperCase().replace(/\s/g, "_")}
                  </p>
                )}
                <p>DISPONIBILITÉ : TÉLÉTRAVAIL / HYBRIDE</p>
              </div>
              <div className="flex gap-4">
                <a
                  href="#projects"
                  className={`px-4 py-3 font-bold uppercase transition-colors flex items-center gap-2 text-sm ${isDark ? "bg-[#ccff00] text-black hover:bg-white" : "bg-[#16a34a] text-white hover:bg-[#15803d]"}`}
                >
                  Projets <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#contact"
                  className={`border px-4 py-3 font-bold uppercase transition-colors text-sm ${isDark ? "border-[#333] text-white hover:bg-[#111]" : "border-[#ccc] text-[#111] hover:bg-[#f0f0f0]"}`}
                >
                  Contact
                </a>
              </div>
            </div>
            <div
              className={`col-span-1 md:col-span-3 flex flex-col ${isDark ? "bg-[#050505]" : "bg-[#fafafa]"}`}
            >
              <div
                className={`flex-1 border-b p-6 flex flex-col justify-center transition-colors group cursor-default ${isDark ? "border-[#333] hover:bg-[#111]" : "border-[#e0e0e0] hover:bg-[#f0f0f0]"}`}
              >
                <span
                  className={`text-xs mb-1 ${isDark ? "text-[#666] group-hover:text-[#ccff00]" : "text-[#666] group-hover:text-[#16a34a]"}`}
                >
                  ANNÉES_EXP
                </span>
                <span
                  className={`portfolio-font-item text-4xl font-bold ${isDark ? "" : "text-[#111]"}`}
                >
                  {String(yearsExp).padStart(2, "0")}
                  <span className={isDark ? "text-[#333]" : "text-[#999]"}>
                    .00
                  </span>
                </span>
              </div>
              <div
                className={`flex-1 border-b p-6 flex flex-col justify-center transition-colors group cursor-default ${isDark ? "border-[#333] hover:bg-[#111]" : "border-[#e0e0e0] hover:bg-[#f0f0f0]"}`}
              >
                <span
                  className={`text-xs mb-1 ${isDark ? "text-[#666] group-hover:text-[#ccff00]" : "text-[#666] group-hover:text-[#16a34a]"}`}
                >
                  PROJETS
                </span>
                <span
                  className={`portfolio-font-item text-4xl font-bold ${isDark ? "" : "text-[#111]"}`}
                >
                  {String(projectCount).padStart(2, "0")}
                  <span className={isDark ? "text-[#333]" : "text-[#999]"}>
                    .00
                  </span>
                </span>
              </div>
              <div
                className={`flex-1 p-6 flex flex-col justify-center transition-colors group cursor-default ${isDark ? "hover:bg-[#111]" : "hover:bg-[#f0f0f0]"}`}
              >
                <span
                  className={`text-xs mb-1 ${isDark ? "text-[#666] group-hover:text-[#ccff00]" : "text-[#666] group-hover:text-[#16a34a]"}`}
                >
                  DISPONIBILITÉ
                </span>
                <span
                  className={`portfolio-font-item text-4xl font-bold ${isDark ? "" : "text-[#111]"}`}
                >
                  99
                  <span className={isDark ? "text-[#333]" : "text-[#999]"}>
                    .9%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Marquee — Compétences techniques avec CSS expert UI/UX */}
      <div
        className={`marquee-skills-band border-b overflow-hidden relative ${isDark ? "border-[#333]" : "border-[#e0e0e0]"}`}
      >
        <div className="marquee-skills-track">
          {[
            ...(skills?.length
              ? skills.map((s) => s.name)
              : [
                  "React",
                  "TypeScript",
                  "Node.js",
                  "Python",
                  "Docker",
                  "SQL",
                  "API REST",
                  "UI/UX",
                ]),
            ...(skills?.length
              ? skills.map((s) => s.name)
              : [
                  "React",
                  "TypeScript",
                  "Node.js",
                  "Python",
                  "Docker",
                  "SQL",
                  "API REST",
                  "UI/UX",
                ]),
          ].map((skillName, i) => (
            <span key={`${skillName}-${i}`} className="marquee-skill-tag">
              <span className="marquee-skill-dot" />
              <span className="portfolio-font-item">{skillName}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sections ordonnées selon la barre de personnalisation (drag-and-drop) */}
      <div className="flex flex-col">
        {/* Section À propos — déplacée du hero */}
        {checkSectionVisible("about") &&
          (() => {
            const layout = templateOverrides?.about_layout || "image_top";
            const hasImage = !!aboutImageUrl;
            const displayText = useCustomAbout
              ? aboutText
              : heroBio || bio || "";
            const hasText = !!displayText;

            if (!hasImage && !hasText) return null;

            return (
              <section
                id="about"
                className={`py-20 px-4 md:px-12 border-b ${isDark ? "border-[#333] bg-[#050505]" : "border-[#e0e0e0] bg-white"}`}
                style={{ order: sectionOrderIndex("about") }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <h2
                        className={`portfolio-font-subtitle text-2xl md:text-3xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                      >
                        <span
                          className={`mr-2 ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                        >
                          //
                        </span>
                        À propos de moi
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
                                      ? "bg-[#ccff00] text-black border-[#ccff00]"
                                      : "bg-[#16a34a] text-white border-[#16a34a]"
                                    : isDark
                                      ? "border-[#333] hover:bg-[#111] text-[#999]"
                                      : "border-[#e0e0e0] hover:bg-[#f0f0f0] text-[#666]"
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
                              ? "rgba(204, 255, 0, 0.1)"
                              : "rgba(22, 163, 74, 0.05)",
                          borderColor: useCustomAbout
                            ? isDark
                              ? "rgba(148, 163, 184, 0.3)"
                              : "rgba(148, 163, 184, 0.2)"
                            : isDark
                              ? "rgba(204, 255, 0, 0.3)"
                              : "rgba(22, 163, 74, 0.2)",
                          color: useCustomAbout
                            ? isDark
                              ? "rgb(148, 163, 184)"
                              : "rgb(71, 85, 105)"
                            : isDark
                              ? "rgb(204, 255, 0)"
                              : "rgb(22, 163, 74)",
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
                              ? "w-full max-w-lg h-auto object-cover rounded border border-[#333]"
                              : "w-full max-w-2xl h-64 sm:h-80 object-cover rounded border border-[#333]"
                          }`}
                          onError={(e) => {
                            const finalUrl =
                              getAbsoluteImageUrl(aboutImageUrl) ||
                              heroImageUrl(aboutImageUrl) ||
                              aboutImageUrl;
                            console.error(
                              "❌ [Template5] Erreur chargement image about:",
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
                                    ? "rgba(204, 255, 0, 0.9)"
                                    : "rgba(22, 163, 74, 0.95)",
                                  borderColor: isDark
                                    ? "rgba(204, 255, 0, 0.5)"
                                    : "rgba(22, 163, 74, 0.3)",
                                  color: isDark ? "black" : "white",
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
                                    className={`px-2 py-1 text-[10px] rounded border transition-all flex items-center justify-center ${
                                      (templateOverrides?.about_text_align ||
                                        "center") === align.value
                                        ? isDark
                                          ? "bg-[#ccff00] text-black border-[#ccff00]"
                                          : "bg-[#16a34a] text-white border-[#16a34a]"
                                        : isDark
                                          ? "border-[#333] hover:bg-[#111] text-[#999]"
                                          : "border-[#e0e0e0] hover:bg-[#f0f0f0] text-[#666]"
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
                                  ? "rgba(204, 255, 0, 0.9)"
                                  : "rgba(22, 163, 74, 0.95)",
                                borderColor: isDark
                                  ? "rgba(204, 255, 0, 0.5)"
                                  : "rgba(22, 163, 74, 0.3)",
                                color: isDark ? "black" : "white",
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
                            className={`w-full portfolio-about-text bg-transparent border focus:outline-none rounded px-2 py-1 mb-6 resize-none ${
                              templateOverrides?.about_text_align === "left"
                                ? "text-left"
                                : templateOverrides?.about_text_align ===
                                    "right"
                                  ? "text-right"
                                  : "text-center"
                            } ${isDark ? "border-[#ccff00]/50 text-[#999] focus:text-white focus:border-[#ccff00]" : "border-[#16a34a]/50 text-[#666] focus:text-[#111] focus:border-[#16a34a]"}`}
                            style={{ minHeight: "6rem" }}
                            placeholder="Écrivez votre section À propos personnalisée..."
                          />
                        ) : (
                          <p
                            className={`portfolio-section-intro portfolio-about-text leading-relaxed mb-6 whitespace-pre-wrap ${
                              templateOverrides?.about_text_align === "left"
                                ? "text-left"
                                : templateOverrides?.about_text_align ===
                                    "right"
                                  ? "text-right"
                                  : "text-center"
                            } ${isDark ? "text-[#999] hover:text-white" : "text-[#666] hover:text-[#111]"}`}
                          >
                            {displayText ||
                              (isEditable
                                ? "Cliquez pour ajouter une bio. Construction d'interfaces web haute performance."
                                : "Construction d'interfaces web haute performance. Pas de décoration inutile, juste de la fonction pure et de l'esthétique brute.")}
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
          })()}

        {/* Stack (Compétences) — Design expert UI/UX */}
        {checkSectionVisible("skills") && (
          <section
            id="stack"
            className={`skills-section py-20 px-4 md:px-12 border-b relative overflow-hidden w-full ${isDark ? "border-[#333]" : "border-[#e0e0e0]"}`}
            style={{ order: sectionOrderIndex("skills") }}
          >
            <div
              className={`absolute inset-0 pointer-events-none ${isDark ? "bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" : "bg-gradient-to-b from-[#f5f5f5] via-[#fafafa] to-[#f5f5f5]"}`}
            />
            <div
              className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none ${isDark ? "bg-[#ccff00]/[0.02]" : "bg-[#16a34a]/[0.03]"}`}
            />
            <div
              className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none ${isDark ? "bg-[#ccff00]/[0.015]" : "bg-[#16a34a]/[0.02]"}`}
            />
            <div className="w-full max-w-[1920px] mx-auto relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl border flex items-center justify-center ${isDark ? "border-[#ccff00]/30 bg-[#ccff00]/5" : "border-[#16a34a]/30 bg-[#16a34a]/5"}`}
                  >
                    <Cpu
                      className={`w-7 h-7 ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`portfolio-font-subtitle text-2xl md:text-3xl font-black uppercase tracking-tight ${isDark ? "text-white" : "text-[#111]"}`}
                    >
                      Compétences{" "}
                      <span
                        className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                      >
                        &
                      </span>{" "}
                      Qualifications
                    </h3>
                    <p className="text-[#666] text-sm mt-1">
                      Technologies et outils maîtrisés
                    </p>
                  </div>
                </div>
                <div
                  className={`flex-1 h-px md:ml-8 ${isDark ? "bg-gradient-to-r from-[#333] via-[#ccff00]/20 to-transparent" : "bg-gradient-to-r from-[#e0e0e0] via-[#16a34a]/20 to-transparent"}`}
                />
              </div>

              <div
                className={`grid gap-6 md:gap-8 ${
                  skillsByCategory.length <= 1
                    ? "grid-cols-1"
                    : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {(skillsByCategory.length
                  ? skillsByCategory
                  : [{ category: "Mes compétences techniques", items: [] }]
                ).map((skillGroup, i) => {
                  const normalizeCategory = (
                    raw: string | null | undefined,
                  ) => {
                    const r = (raw || "").trim();
                    if (
                      !r ||
                      /^auto\s*[-]?détecté?$/i.test(r) ||
                      /^auto\s*[-]?detected$/i.test(r) ||
                      /^autres$/i.test(r)
                    ) {
                      return "Mes compétences techniques";
                    }
                    return r;
                  };
                  // Trouver les compétences Skill correspondantes à ce groupe
                  const groupSkills = orderedSkills.filter(
                    (s) =>
                      normalizeCategory(s.category) === skillGroup.category,
                  );

                  return (
                    <div
                      key={i}
                      className={`skill-category-card group relative rounded-2xl border backdrop-blur-sm p-6 md:p-8 transition-all duration-500 overflow-hidden ${isDark ? "border-[#333] bg-[#080808]/80 hover:border-[#ccff00]/40" : "border-[#e0e0e0] bg-white/90 hover:border-[#16a34a]/40"}`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? "bg-gradient-to-br from-[#ccff00]/[0.03] to-transparent" : "bg-gradient-to-br from-[#16a34a]/[0.05] to-transparent"}`}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDark ? "bg-[#ccff00]/10 border border-[#ccff00]/20 group-hover:bg-[#ccff00]/20 group-hover:border-[#ccff00]/40" : "bg-[#16a34a]/10 border border-[#16a34a]/20 group-hover:bg-[#16a34a]/20 group-hover:border-[#16a34a]/40"}`}
                          >
                            <Code
                              className={`w-5 h-5 ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                            />
                          </div>
                          <h4
                            className={`font-bold text-sm tracking-[0.2em] uppercase ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                          >
                            {skillGroup.category.replace(/\s/g, "_")}
                          </h4>
                          <span
                            className={`ml-auto text-xs font-mono px-2 py-1 rounded ${isDark ? "text-[#555] bg-[#111] border border-[#222]" : "text-[#666] bg-[#f0f0f0] border border-[#e0e0e0]"}`}
                          >
                            {groupSkills.length}{" "}
                            {groupSkills.length > 1
                              ? "compétences"
                              : "compétence"}
                          </span>
                        </div>
                        {isEditable &&
                        onItemOrderChange &&
                        groupSkills.length > 0 ? (
                          <DragAndDropList
                            items={groupSkills}
                            onReorder={(reorderedGroupSkills) => {
                              // Reconstruire la liste complète avec le nouvel ordre pour ce groupe
                              const allSkillsFlat: Skill[] = [];
                              skillsByCategory.forEach((cat) => {
                                if (cat.category === skillGroup.category) {
                                  allSkillsFlat.push(...reorderedGroupSkills);
                                } else {
                                  const otherGroupSkills = orderedSkills.filter(
                                    (s) =>
                                      normalizeCategory(s.category) ===
                                      cat.category,
                                  );
                                  allSkillsFlat.push(...otherGroupSkills);
                                }
                              });
                              const newOrder = getItemOrder(
                                allSkillsFlat,
                                (s) => s.id || s.name,
                              );
                              onItemOrderChange({
                                ...itemOrder,
                                skills: newOrder,
                              });
                            }}
                            getItemId={(s) => s.id || s.name}
                            disabled={!isEditable}
                            className="flex flex-wrap gap-3"
                            strategy="grid"
                            buttonSize="small"
                            renderItem={(skill, j) => (
                              <div
                                className={`skill-pill group/pill inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 cursor-default ${isDark ? "border-[#222] bg-[#0a0a0a] hover:border-[#ccff00]/50 hover:bg-[#ccff00]/5" : "border-[#e0e0e0] bg-[#fafafa] hover:border-[#16a34a]/50 hover:bg-[#16a34a]/5"}`}
                                style={{ animationDelay: `${j * 30}ms` }}
                              >
                                <span className="skill-pill-icon opacity-80 group-hover/pill:opacity-100 transition-opacity">
                                  <SkillIcon
                                    skillName={skill.name}
                                    size={18}
                                    useBadge={true}
                                    showLabel={false}
                                  />
                                </span>
                                <span
                                  className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDark ? "text-[#bbb] group-hover/pill:text-white" : "text-[#555] group-hover/pill:text-[#111]"}`}
                                >
                                  {skill.name}
                                </span>
                                <span
                                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isDark ? "bg-[#333] group-hover/pill:bg-[#ccff00] group-hover/pill:shadow-[0_0_8px_#ccff00]" : "bg-[#ccc] group-hover/pill:bg-[#16a34a] group-hover/pill:shadow-[0_0_8px_#16a34a]"}`}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {groupSkills.length ? (
                              groupSkills.map((skill, j) => (
                                <div
                                  key={skill.id || j}
                                  className={`skill-pill group/pill inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 cursor-default ${isDark ? "border-[#222] bg-[#0a0a0a] hover:border-[#ccff00]/50 hover:bg-[#ccff00]/5" : "border-[#e0e0e0] bg-[#fafafa] hover:border-[#16a34a]/50 hover:bg-[#16a34a]/5"}`}
                                  style={{ animationDelay: `${j * 30}ms` }}
                                >
                                  <span className="skill-pill-icon opacity-80 group-hover/pill:opacity-100 transition-opacity">
                                    <SkillIcon
                                      skillName={skill.name}
                                      size={18}
                                      useBadge={true}
                                      showLabel={false}
                                    />
                                  </span>
                                  <span
                                    className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDark ? "text-[#bbb] group-hover/pill:text-white" : "text-[#555] group-hover/pill:text-[#111]"}`}
                                  >
                                    {skill.name}
                                  </span>
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isDark ? "bg-[#333] group-hover/pill:bg-[#ccff00] group-hover/pill:shadow-[0_0_8px_#ccff00]" : "bg-[#ccc] group-hover/pill:bg-[#16a34a] group-hover/pill:shadow-[0_0_8px_#16a34a]"}`}
                                  />
                                </div>
                              ))
                            ) : (
                              <span
                                className={`text-sm py-4 ${isDark ? "text-[#555]" : "text-[#666]"}`}
                              >
                                — Aucune compétence
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Experience (Runtime_History) */}
        {checkSectionVisible("experiences") &&
          formattedExperiences.length > 0 && (
            <section
              id="experience"
              className={`py-20 px-4 md:px-12 border-b ${isDark ? "border-[#333]" : "border-[#e0e0e0] bg-[#fafafa]"}`}
              style={{ order: sectionOrderIndex("experiences") }}
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4">
                  <div className="flex items-center gap-4 mb-6">
                    <Briefcase
                      className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                    />
                    <h3
                      className={`portfolio-font-subtitle text-2xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                    >
                      Expériences
                    </h3>
                  </div>
                  <p className="text-[#666] text-sm">
                    Journal d&apos;exécution professionnel. Traçabilité complète
                    des rôles et déploiements majeurs.
                  </p>
                </div>
                <div className="md:w-3/4 space-y-8">
                  {formattedExperiences.map((job, i) => (
                    <div key={i} className="relative pl-8 md:pl-0 group">
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-px md:hidden ${isDark ? "bg-[#333]" : "bg-[#e0e0e0]"}`}
                      />
                      <div
                        className={`flex flex-col md:flex-row gap-6 items-start md:border-b md:pb-8 md:group-last:border-0 ${isDark ? "md:border-[#333]" : "md:border-[#e0e0e0]"}`}
                      >
                        <div className="md:w-1/4 pt-1">
                          <span
                            className={`portfolio-font-item-small font-bold text-lg md:text-xl block ${isDark ? "text-[#ccff00]" : "text-[#16a34a]"}`}
                          >
                            {job.period}
                          </span>
                          <span className="text-[#666] text-xs uppercase tracking-wider">
                            DATE
                          </span>
                        </div>
                        <div className="md:w-3/4">
                          <div className="flex items-start gap-4 mb-1">
                            {showLogos && (
                              <Logo
                                name={job.company}
                                type="company"
                                size={56}
                                className="mt-1 flex-shrink-0"
                                showFallback={false}
                              />
                            )}
                            <div className="flex-1">
                              <h4
                                className={`text-xl md:text-2xl font-bold mb-1 transition-colors ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                              >
                                <span className="portfolio-font-item">
                                  {job.role}
                                </span>
                              </h4>
                              <p
                                className={`portfolio-font-item-small text-sm uppercase mb-4 tracking-wider ${isDark ? "text-[#999]" : "text-[#666]"}`}
                              >
                                @{job.company}
                              </p>
                            </div>
                          </div>
                          <p
                            className={`mb-4 leading-relaxed max-w-2xl whitespace-pre-line ${isDark ? "text-[#bbb]" : "text-[#555]"}`}
                          >
                            {job.desc
                              .replace(/^-\s+/gm, "→ ")
                              .replace(/\n-\s+/g, "\n→ ")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag, t) => (
                              <span
                                key={t}
                                className={`px-2 py-1 border text-[10px] uppercase transition-colors cursor-default ${isDark ? "border-[#333] text-[#666] hover:border-[#ccff00] hover:text-[#ccff00]" : "border-[#e0e0e0] text-[#666] hover:border-[#16a34a] hover:text-[#16a34a]"}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        {/* Projects (Deployed_Modules) */}
        {checkSectionVisible("projects") && formattedProjects.length > 0 && (
          <section
            id="projects"
            className={`py-20 px-4 md:px-12 border-b ${isDark ? "border-[#333] bg-[#080808]" : "border-[#e0e0e0] bg-[#f5f5f5]"}`}
            style={{ order: sectionOrderIndex("projects") }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-12 justify-between">
                <div className="flex items-center gap-4">
                  <Folder
                    className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                  />
                  <h3
                    className={`portfolio-font-subtitle text-2xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                  >
                    Projets_Déployés
                  </h3>
                </div>
                <span className="text-[#666] text-xs hidden md:block">
                  INDEXATION : TERMINÉE
                </span>
              </div>
              {isEditable &&
              onItemOrderChange &&
              formattedProjects.length > 0 ? (
                <DragAndDropList
                  items={formattedProjects}
                  onReorder={(reorderedProjects) => {
                    const newOrder = getItemOrder(
                      reorderedProjects,
                      (p: any) => p.project?.id || p.title,
                    );
                    onItemOrderChange({
                      ...itemOrder,
                      projects: newOrder,
                    });
                  }}
                  getItemId={(p: any) => p.project?.id || p.title}
                  disabled={!isEditable}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  strategy="grid"
                  renderItem={(proj: any, i: number) => (
                    <div
                      key={i}
                      className={`group border p-6 transition-all duration-300 flex flex-col h-full relative ${isDark ? "border-[#333] bg-[#050505] hover:border-[#ccff00]" : "border-[#e0e0e0] bg-white hover:border-[#16a34a]"}`}
                    >
                      {isEditable && proj.project && (
                        <ProjectImageIconEditor
                          project={proj.project}
                          onUpdate={() => {}}
                          isDark={isDark}
                        />
                      )}
                      <div className="flex justify-between items-start mb-6">
                        {proj.icon ? (
                          // Afficher l'icône Lucide au lieu de Code
                          <div
                            className={`w-10 h-10 border flex items-center justify-center transition-colors ${isDark ? "border-[#333] bg-[#111] group-hover:bg-[#ccff00]" : "border-[#e0e0e0] bg-[#f5f5f5] group-hover:bg-[#16a34a]"}`}
                          >
                            {(() => {
                              const IconComponent =
                                (LucideIcons as any)[proj.icon] ||
                                LucideIcons.Code;
                              return (
                                <IconComponent
                                  className={`w-5 h-5 transition-colors ${isDark ? "text-[#666] group-hover:text-black" : "text-[#666] group-hover:text-white"}`}
                                />
                              );
                            })()}
                          </div>
                        ) : proj.image ? (
                          // Afficher l'image en miniature
                          <div className="w-10 h-10 border overflow-hidden flex-shrink-0">
                            <img
                              src={proj.image}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 border flex items-center justify-center transition-colors ${isDark ? "border-[#333] bg-[#111] group-hover:bg-[#ccff00]" : "border-[#e0e0e0] bg-[#f5f5f5] group-hover:bg-[#16a34a]"}`}
                          >
                            <Code
                              className={`w-5 h-5 transition-colors ${isDark ? "text-[#666] group-hover:text-black" : "text-[#666] group-hover:text-white"}`}
                            />
                          </div>
                        )}
                        <span
                          className={`text-[10px] border px-2 py-1 uppercase ${isDark ? "border-[#333] text-[#666]" : "border-[#e0e0e0] text-[#666]"}`}
                        >
                          {proj.type}
                        </span>
                      </div>
                      <h4
                        className={`portfolio-font-item text-xl font-bold mb-2 transition-colors ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                      >
                        {proj.title}
                      </h4>
                      <p
                        className={`portfolio-section-intro text-sm mb-8 flex-grow whitespace-pre-line ${isDark ? "text-[#888]" : "text-[#666]"}`}
                      >
                        {proj.desc
                          .replace(/^-\s+/gm, "→ ")
                          .replace(/\n-\s+/g, "\n→ ")}
                      </p>
                      <div
                        className={`mt-auto border-t pt-4 flex justify-between items-center ${isDark ? "border-[#333]" : "border-[#e0e0e0]"}`}
                      >
                        <span
                          className={`text-[10px] font-mono ${isDark ? "text-[#555]" : "text-[#666]"}`}
                        >
                          {proj.tech}
                        </span>
                        {(proj.link || proj.github) && (
                          <a
                            href={proj.link || proj.github || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-all ${isDark ? "text-[#666] group-hover:text-[#ccff00]" : "text-[#666] group-hover:text-[#16a34a]"}`}
                          >
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formattedProjects.map((proj, i) => (
                    <div
                      key={i}
                      className={`group border p-6 transition-all duration-300 flex flex-col h-full relative ${isDark ? "border-[#333] bg-[#050505] hover:border-[#ccff00]" : "border-[#e0e0e0] bg-white hover:border-[#16a34a]"}`}
                    >
                      {isEditable && proj.project && (
                        <ProjectImageIconEditor
                          project={proj.project}
                          onUpdate={() => {}}
                          isDark={isDark}
                        />
                      )}
                      <div className="flex justify-between items-start mb-6">
                        {proj.icon ? (
                          <div
                            className={`w-10 h-10 border flex items-center justify-center transition-colors ${isDark ? "border-[#333] bg-[#111] group-hover:bg-[#ccff00]" : "border-[#e0e0e0] bg-[#f5f5f5] group-hover:bg-[#16a34a]"}`}
                          >
                            {(() => {
                              const IconComponent =
                                (LucideIcons as any)[proj.icon] ||
                                LucideIcons.Code;
                              return (
                                <IconComponent
                                  className={`w-5 h-5 transition-colors ${isDark ? "text-[#666] group-hover:text-black" : "text-[#666] group-hover:text-white"}`}
                                />
                              );
                            })()}
                          </div>
                        ) : proj.image ? (
                          <div className="w-10 h-10 border overflow-hidden flex-shrink-0">
                            <img
                              src={proj.image}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 border flex items-center justify-center transition-colors ${isDark ? "border-[#333] bg-[#111] group-hover:bg-[#ccff00]" : "border-[#e0e0e0] bg-[#f5f5f5] group-hover:bg-[#16a34a]"}`}
                          >
                            <Code
                              className={`w-5 h-5 transition-colors ${isDark ? "text-[#666] group-hover:text-black" : "text-[#666] group-hover:text-white"}`}
                            />
                          </div>
                        )}
                        <span
                          className={`text-[10px] border px-2 py-1 uppercase ${isDark ? "border-[#333] text-[#666]" : "border-[#e0e0e0] text-[#666]"}`}
                        >
                          {proj.type}
                        </span>
                      </div>
                      <h4
                        className={`portfolio-font-item text-xl font-bold mb-2 transition-colors ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                      >
                        {proj.title}
                      </h4>
                      <p
                        className={`portfolio-section-intro text-sm mb-8 flex-grow whitespace-pre-line ${isDark ? "text-[#888]" : "text-[#666]"}`}
                      >
                        {proj.desc
                          .replace(/^-\s+/gm, "→ ")
                          .replace(/\n-\s+/g, "\n→ ")}
                      </p>
                      <div
                        className={`mt-auto border-t pt-4 flex justify-between items-center ${isDark ? "border-[#333]" : "border-[#e0e0e0]"}`}
                      >
                        <span
                          className={`text-[10px] font-mono ${isDark ? "text-[#555]" : "text-[#666]"}`}
                        >
                          {proj.tech}
                        </span>
                        {(proj.link || proj.github) && (
                          <a
                            href={proj.link || proj.github || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-all ${isDark ? "text-[#666] group-hover:text-[#ccff00]" : "text-[#666] group-hover:text-[#16a34a]"}`}
                          >
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Education + Certifications — ordre des colonnes selon template5ColumnOrder */}
        {(checkSectionVisible("education") ||
          checkSectionVisible("certifications")) &&
          (() => {
            const educationCol = (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <GraduationCap
                    className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                  />
                  <h3
                    className={`portfolio-font-subtitle text-xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                  >
                    Formation
                  </h3>
                </div>
                <div className="space-y-6">
                  {formattedEducations.length ? (
                    formattedEducations.map((edu, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-12 text-sm font-bold text-[#666] pt-1">
                          {edu.year}
                        </div>
                        <div
                          className={`flex-1 pb-6 border-b group-last:border-0 ${isDark ? "border-[#333]" : "border-[#e0e0e0]"}`}
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
                              <h4
                                className={`portfolio-font-item font-bold text-lg transition-colors ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                              >
                                {edu.school}
                              </h4>
                              <p
                                className={`portfolio-font-item-small text-sm uppercase tracking-wide ${isDark ? "text-[#888]" : "text-[#666]"}`}
                              >
                                {edu.degree}
                              </p>
                            </div>
                          </div>
                          {edu.honors && (
                            <p
                              className={`portfolio-section-intro text-xs mt-1 font-mono ${isDark ? "text-[#555]" : "text-[#666]"}`}
                            >
                              MENTIONS : {edu.honors}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-sm ${isDark ? "text-[#555]" : "text-[#666]"}`}
                    >
                      Aucune formation renseignée
                    </p>
                  )}
                </div>
              </div>
            );
            const certificationsCol = (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <Shield
                    className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                  />
                  <h3
                    className={`portfolio-font-subtitle text-xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                  >
                    Certifications
                  </h3>
                </div>
                {isEditable &&
                onItemOrderChange &&
                formattedCerts.length > 0 ? (
                  <DragAndDropList
                    items={formattedCerts}
                    onReorder={(reorderedCerts) => {
                      const newOrder = getItemOrder(
                        reorderedCerts,
                        (c: any) => c.hash,
                      );
                      onItemOrderChange({
                        ...itemOrder,
                        certifications: newOrder,
                      });
                    }}
                    getItemId={(c: any) => c.hash}
                    disabled={!isEditable}
                    className={`border ${isDark ? "border-[#333] bg-[#0a0a0a]" : "border-[#e0e0e0] bg-[#fafafa]"}`}
                    strategy="vertical"
                    buttonSize="small"
                    renderItem={(cert: any, i: number) => (
                      <div
                        key={i}
                        className={`group flex justify-between items-center p-4 border-b last:border-0 transition-colors cursor-crosshair ${isDark ? "border-[#333] hover:bg-[#111]" : "border-[#e0e0e0] hover:bg-[#f0f0f0]"}`}
                      >
                        <div>
                          <div
                            className={`text-sm font-bold transition-colors ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                          >
                            {cert.label}
                          </div>
                          <div
                            className={`text-[10px] uppercase ${isDark ? "text-[#555]" : "text-[#666]"}`}
                          >
                            ID: {cert.id}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-[10px] font-mono transition-colors ${isDark ? "bg-[#151515] text-[#666] group-hover:bg-[#ccff00] group-hover:text-black" : "bg-[#e5e5e5] text-[#666] group-hover:bg-[#16a34a] group-hover:text-white"}`}
                          >
                            #{cert.hash}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div
                    className={`border ${isDark ? "border-[#333] bg-[#0a0a0a]" : "border-[#e0e0e0] bg-[#fafafa]"}`}
                  >
                    {formattedCerts.length ? (
                      formattedCerts.map((cert, i) => (
                        <div
                          key={i}
                          className={`group flex justify-between items-center p-4 border-b last:border-0 transition-colors cursor-crosshair ${isDark ? "border-[#333] hover:bg-[#111]" : "border-[#e0e0e0] hover:bg-[#f0f0f0]"}`}
                        >
                          <div>
                            <div
                              className={`text-sm font-bold transition-colors ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                            >
                              {cert.label}
                            </div>
                            <div
                              className={`text-[10px] uppercase ${isDark ? "text-[#555]" : "text-[#666]"}`}
                            >
                              ID: {cert.id}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 text-[10px] font-mono transition-colors ${isDark ? "bg-[#151515] text-[#666] group-hover:bg-[#ccff00] group-hover:text-black" : "bg-[#e5e5e5] text-[#666] group-hover:bg-[#16a34a] group-hover:text-white"}`}
                            >
                              #{cert.hash}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className={`p-4 text-sm ${isDark ? "text-[#555]" : "text-[#666]"}`}
                      >
                        Aucune certification
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
            const leftCol =
              t5ColumnOrder.educationCertifications === "education_left"
                ? educationCol
                : certificationsCol;
            const rightCol =
              t5ColumnOrder.educationCertifications === "education_left"
                ? certificationsCol
                : educationCol;
            return (
              <section
                id="education"
                className={`py-20 px-4 md:px-12 border-b ${isDark ? "border-[#333] bg-[#050505]" : "border-[#e0e0e0] bg-white"}`}
                style={{
                  order: Math.min(
                    sectionOrderIndex("education"),
                    sectionOrderIndex("certifications"),
                  ),
                }}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
                  {checkSectionVisible("education") &&
                  checkSectionVisible("certifications") ? (
                    <>
                      <div>{leftCol}</div>
                      <div>{rightCol}</div>
                    </>
                  ) : checkSectionVisible("education") ? (
                    <div>{educationCol}</div>
                  ) : (
                    <div>{certificationsCol}</div>
                  )}
                </div>
              </section>
            );
          })()}

        {/* Langues + Centres d'intérêt — ordre des colonnes + sélecteur de niveau (barre de progression) */}
        {(checkSectionVisible("languages") ||
          checkSectionVisible("interests")) &&
          (() => {
            const LANGUAGE_LEVELS = [
              { value: "A1", label: "A1 Débutant" },
              { value: "A2", label: "A2 Élémentaire" },
              { value: "B1", label: "B1 Intermédiaire" },
              { value: "B2", label: "B2 Avancé" },
              { value: "C1", label: "C1 Autonome" },
              { value: "C2", label: "C2 Maîtrise" },
              { value: "Natif", label: "Natif / Bilingue" },
            ];
            const languagesCol = (
              <div className="md:w-1/2">
                <div className="flex items-center gap-4 mb-8">
                  <Globe
                    className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                  />
                  <h3
                    className={`portfolio-font-subtitle text-xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                  >
                    Langues
                  </h3>
                </div>
                {isEditable &&
                onItemOrderChange &&
                formattedLanguages.length > 0 ? (
                  <DragAndDropList
                    items={formattedLanguages}
                    onReorder={(reorderedLanguages) => {
                      const newOrder = getItemOrder(
                        reorderedLanguages,
                        (l: any) => l.code || l.label,
                      );
                      onItemOrderChange({
                        ...itemOrder,
                        languages: newOrder,
                      });
                    }}
                    getItemId={(l: any) => l.code || l.label}
                    disabled={!isEditable}
                    className="space-y-4"
                    strategy="vertical"
                    buttonSize="small"
                    renderItem={(lang: any, index: number) => {
                      const langEntity = orderedLanguages[index];
                      const percent = languageLevelToPercent(
                        langEntity?.level ?? lang.status,
                      );
                      return (
                        <div
                          key={langEntity?.id ?? index}
                          className={`group flex items-center justify-between gap-4 p-4 border transition-colors ${isDark ? "border-[#333] bg-[#050505] hover:border-[#ccff00]" : "border-[#e0e0e0] bg-white hover:border-[#16a34a]"}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <span
                              className={`text-sm font-bold transition-colors shrink-0 ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                            >
                              {lang.label}
                            </span>
                            {lang.code && (
                              <span
                                className={`text-[10px] px-1 text-[#666] shrink-0 ${isDark ? "bg-[#111]" : "bg-[#f0f0f0]"}`}
                              >
                                {lang.code}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {isEditable &&
                            onLanguageLevelChange &&
                            langEntity ? (
                              <select
                                value={langEntity.level || ""}
                                onChange={(e) =>
                                  onLanguageLevelChange(
                                    langEntity.id,
                                    e.target.value,
                                  )
                                }
                                className={`text-xs font-mono border px-2 py-1 rounded focus:outline-none focus:ring-2 ${isDark ? "bg-[#111] border-[#333] text-[#ccff00] focus:ring-[#ccff00]/50" : "bg-white border-[#e0e0e0] text-[#16a34a] focus:ring-[#16a34a]/50"}`}
                                title="Niveau de maîtrise"
                              >
                                {LANGUAGE_LEVELS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : null}
                            <div
                              className={`w-24 h-1.5 ${isDark ? "bg-[#222]" : "bg-[#e5e5e5]"}`}
                            >
                              <div
                                className={`h-full transition-all ${isDark ? "bg-[#ccff00]" : "bg-[#16a34a]"}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            {!isEditable || !onLanguageLevelChange ? (
                              <span
                                className={`text-[10px] ${isDark ? "text-[#555]" : "text-[#666]"}`}
                              >
                                {lang.status}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {formattedLanguages.length ? (
                      formattedLanguages.map((lang, index) => {
                        const langEntity = orderedLanguages[index];
                        const percent = languageLevelToPercent(
                          langEntity?.level ?? lang.status,
                        );
                        return (
                          <div
                            key={langEntity?.id ?? index}
                            className={`group flex items-center justify-between gap-4 p-4 border transition-colors ${isDark ? "border-[#333] bg-[#050505] hover:border-[#ccff00]" : "border-[#e0e0e0] bg-white hover:border-[#16a34a]"}`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <span
                                className={`text-sm font-bold transition-colors shrink-0 ${isDark ? "text-white group-hover:text-[#ccff00]" : "text-[#111] group-hover:text-[#16a34a]"}`}
                              >
                                {lang.label}
                              </span>
                              {lang.code && (
                                <span
                                  className={`text-[10px] px-1 text-[#666] shrink-0 ${isDark ? "bg-[#111]" : "bg-[#f0f0f0]"}`}
                                >
                                  {lang.code}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {isEditable &&
                              onLanguageLevelChange &&
                              langEntity ? (
                                <select
                                  value={langEntity.level || ""}
                                  onChange={(e) =>
                                    onLanguageLevelChange(
                                      langEntity.id,
                                      e.target.value,
                                    )
                                  }
                                  className={`text-xs font-mono border px-2 py-1 rounded focus:outline-none focus:ring-2 ${isDark ? "bg-[#111] border-[#333] text-[#ccff00] focus:ring-[#ccff00]/50" : "bg-white border-[#e0e0e0] text-[#16a34a] focus:ring-[#16a34a]/50"}`}
                                  title="Niveau de maîtrise"
                                >
                                  {LANGUAGE_LEVELS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : null}
                              <div
                                className={`w-24 h-1.5 ${isDark ? "bg-[#222]" : "bg-[#e5e5e5]"}`}
                              >
                                <div
                                  className={`h-full transition-all ${isDark ? "bg-[#ccff00]" : "bg-[#16a34a]"}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              {!isEditable || !onLanguageLevelChange ? (
                                <span
                                  className={`text-[10px] ${isDark ? "text-[#555]" : "text-[#666]"}`}
                                >
                                  {lang.status}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p
                        className={`text-sm ${isDark ? "text-[#555]" : "text-[#666]"}`}
                      >
                        Aucune langue renseignée
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
            const interestsCol = (
              <div className="md:w-1/2">
                <div className="flex items-center gap-4 mb-8">
                  <Layout
                    className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}
                  />
                  <h3
                    className={`portfolio-font-subtitle text-xl font-bold uppercase ${isDark ? "text-white" : "text-[#111]"}`}
                  >
                    Centres_intérêt
                  </h3>
                </div>
                {isEditable &&
                onItemOrderChange &&
                interestsForAddons.length > 0 ? (
                  <DragAndDropList
                    items={interestsForAddons.slice(0, 4)}
                    onReorder={(reorderedInterests) => {
                      // Trouver les IDs correspondants dans orderedInterests
                      const reorderedIds: string[] = [];
                      reorderedInterests.forEach((interest) => {
                        const found = orderedInterests.find(
                          (i) => i.name === interest.label,
                        );
                        if (found) reorderedIds.push(found.id);
                      });
                      // Ajouter les autres centres d'intérêt qui ne sont pas dans les 4 premiers
                      orderedInterests.forEach((interest) => {
                        if (!reorderedIds.includes(interest.id)) {
                          reorderedIds.push(interest.id);
                        }
                      });
                      onItemOrderChange({
                        ...itemOrder,
                        interests: reorderedIds,
                      });
                    }}
                    getItemId={(item) => {
                      const interest = orderedInterests.find(
                        (i) => i.name === item.label,
                      );
                      return interest?.id || item.label;
                    }}
                    disabled={!isEditable}
                    className="grid grid-cols-2 gap-4"
                    strategy="grid"
                    buttonSize="small"
                    renderItem={(item, _idx) => (
                      <div
                        className={`p-4 border text-center transition-colors cursor-pointer min-w-0 overflow-hidden ${isDark ? "border-[#333] bg-[#050505] hover:bg-[#111] hover:text-[#ccff00]" : "border-[#e0e0e0] bg-white hover:bg-[#f0f0f0] hover:text-[#16a34a]"}`}
                      >
                        <div
                          className={`portfolio-font-item text-sm font-bold break-words whitespace-normal ${isDark ? "text-white" : "text-[#111]"}`}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            lineHeight: "1.4",
                          }}
                        >
                          {item.label.replace(/\s/g, "_")}
                        </div>
                        {item.sub && (
                          <div
                            className={`text-[10px] uppercase tracking-wider mt-1 ${isDark ? "text-[#444]" : "text-[#666]"}`}
                          >
                            [{item.sub}]
                          </div>
                        )}
                      </div>
                    )}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {interestsForAddons.length ? (
                      interestsForAddons.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-4 border text-center transition-colors cursor-pointer min-w-0 overflow-hidden ${isDark ? "border-[#333] bg-[#050505] hover:bg-[#111] hover:text-[#ccff00]" : "border-[#e0e0e0] bg-white hover:bg-[#f0f0f0] hover:text-[#16a34a]"}`}
                        >
                          <div
                            className={`portfolio-font-item text-sm font-bold break-words whitespace-normal ${isDark ? "text-white" : "text-[#111]"}`}
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                              lineHeight: "1.4",
                            }}
                          >
                            {item.label.replace(/\s/g, "_")}
                          </div>
                          {item.sub && (
                            <div
                              className={`text-[10px] uppercase tracking-wider mt-1 ${isDark ? "text-[#444]" : "text-[#666]"}`}
                            >
                              [{item.sub}]
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p
                        className={`text-sm col-span-2 ${isDark ? "text-[#555]" : "text-[#666]"}`}
                      >
                        Aucun centre d&apos;intérêt
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
            const leftCol =
              t5ColumnOrder.languagesInterests === "languages_left"
                ? languagesCol
                : interestsCol;
            const rightCol =
              t5ColumnOrder.languagesInterests === "languages_left"
                ? interestsCol
                : languagesCol;
            return (
              <section
                className={`py-20 px-4 md:px-12 border-b ${isDark ? "border-[#333] bg-[#080808]" : "border-[#e0e0e0] bg-[#fafafa]"}`}
                style={{
                  order: Math.min(
                    sectionOrderIndex("languages"),
                    sectionOrderIndex("interests"),
                  ),
                }}
              >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                  {checkSectionVisible("languages") &&
                  checkSectionVisible("interests") ? (
                    <>
                      <div className="md:w-1/2">{leftCol}</div>
                      <div className="md:w-1/2">{rightCol}</div>
                    </>
                  ) : checkSectionVisible("languages") ? (
                    languagesCol
                  ) : (
                    interestsCol
                  )}
                </div>
              </section>
            );
          })()}

        {/* Contact Footer */}
        {checkSectionVisible("contact") && (
          <footer
            id="contact"
            className={`py-20 px-4 md:px-12 relative overflow-hidden ${isDark ? "bg-[#000]" : "bg-[#f0f0f0]"}`}
            style={{ order: sectionOrderIndex("contact") }}
          >
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black pointer-events-none whitespace-nowrap select-none ${isDark ? "text-[#080808]" : "text-[#e5e5e5]"}`}
            >
              CONTACT
            </div>
            <div className="max-w-4xl mx-auto relative z-10 text-center">
              <h2
                className={`text-4xl md:text-6xl font-black uppercase mb-8 ${isDark ? "text-white mix-blend-difference" : "text-[#111]"}`}
              >
                Établir le{" "}
                <span className={isDark ? "text-[#ccff00]" : "text-[#16a34a]"}>
                  contact
                </span>
              </h2>
              <p
                className={`mb-12 max-w-lg mx-auto ${isDark ? "text-[#888]" : "text-[#666]"}`}
              >
                Prêt à déployer votre prochain système ? Envoyez un signal.
                Réponse estimée sous 24 cycles horaires.
              </p>
              <a
                href={email ? `mailto:${email}` : "#"}
                className={`inline-flex items-center gap-3 px-8 py-4 font-bold text-lg uppercase hover:scale-105 transition-all mb-16 ${isDark ? "bg-[#ccff00] text-black hover:bg-white" : "bg-[#16a34a] text-white hover:bg-[#15803d]"}`}
              >
                <Send className="w-5 h-5" />
                <span className="portfolio-font-subtitle">
                  Envoyer un message
                </span>
              </a>
              <div
                className={`grid grid-cols-1 md:grid-cols-3 gap-px border max-w-2xl mx-auto ${isDark ? "bg-[#222] border-[#222]" : "bg-[#e0e0e0] border-[#e0e0e0]"}`}
              >
                {[
                  { label: "GITHUB", href: githubUrl },
                  { label: "LINKEDIN", href: linkedinUrl },
                  { label: "EMAIL", href: email ? `mailto:${email}` : "#" },
                ].map((net) => (
                  <a
                    key={net.label}
                    href={net.href || "#"}
                    target={net.href?.startsWith("http") ? "_blank" : undefined}
                    rel={
                      net.href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={`py-4 transition-colors font-mono text-sm uppercase tracking-widest ${isDark ? "bg-[#050505] hover:bg-[#111] hover:text-[#ccff00] text-white" : "bg-white hover:bg-[#f5f5f5] hover:text-[#16a34a] text-[#111]"}`}
                  >
                    {net.label}
                  </a>
                ))}
              </div>
              <div
                className={`mt-16 text-xs uppercase tracking-[0.2em] ${isDark ? "text-[#333]" : "text-[#555]"}`}
              >
                <p>
                  © {new Date().getFullYear()} {fullName || "PORTFOLIO"}. TOUS
                  DROITS RÉSERVÉS.
                </p>
                {(fullName || email || profile?.phone) && (
                  <p
                    className={`mt-2 normal-case tracking-normal flex flex-wrap justify-center gap-x-4 gap-y-1 ${isDark ? "text-[#444]" : "text-[#666]"}`}
                  >
                    {fullName && <span>{fullName}</span>}
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className={
                          isDark
                            ? "hover:text-[#ccff00] transition-colors"
                            : "hover:text-[#16a34a] transition-colors"
                        }
                      >
                        {email}
                      </a>
                    )}
                    {profile?.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className={
                          isDark
                            ? "hover:text-[#ccff00] transition-colors"
                            : "hover:text-[#16a34a] transition-colors"
                        }
                      >
                        {profile.phone}
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        /* Marquee Compétences — Expert UI Design */
        .marquee-skills-band {
          background: linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
          padding: 1rem 0;
          position: relative;
        }
        .marquee-skills-band::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #0a0a0a 0%, transparent 15%, transparent 85%, #0a0a0a 100%);
          pointer-events: none;
          z-index: 2;
        }
        .marquee-skills-track {
          display: flex;
          gap: 1.5rem 2.5rem;
          white-space: nowrap;
          animation: marquee-skills 35s linear infinite;
          width: max-content;
        }
        @keyframes marquee-skills {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-skill-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(204, 255, 0, 0.08) 0%, rgba(204, 255, 0, 0.02) 100%);
          border: 1px solid rgba(204, 255, 0, 0.2);
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ccff00;
          box-shadow: 0 0 20px rgba(204, 255, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .marquee-skill-tag:hover {
          background: linear-gradient(135deg, rgba(204, 255, 0, 0.15) 0%, rgba(204, 255, 0, 0.08) 100%);
          border-color: rgba(204, 255, 0, 0.5);
          box-shadow: 0 0 30px rgba(204, 255, 0, 0.12);
          transform: scale(1.05);
        }
        .marquee-skill-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ccff00;
          box-shadow: 0 0 8px #ccff00;
          animation: skill-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes skill-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        /* Section Compétences — animations et polish */
        .skills-section .skill-category-card {
          animation: skill-card-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        @keyframes skill-card-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skill-pill {
          animation: skill-pill-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        @keyframes skill-pill-fade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .skill-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(204, 255, 0, 0.08);
        }
        .skill-category-card:hover {
          box-shadow: 0 0 40px rgba(204, 255, 0, 0.06);
        }
        [data-theme="light"] .skill-pill:hover {
          box-shadow: 0 4px 20px rgba(22, 163, 74, 0.12);
        }
        [data-theme="light"] .skill-category-card:hover {
          box-shadow: 0 0 40px rgba(22, 163, 74, 0.08);
        }
        /* Mode jour (light) — overrides */
        [data-theme="light"] .marquee-skills-band {
          background: linear-gradient(135deg, #f0f0f0 0%, #fafafa 50%, #f0f0f0 100%);
        }
        [data-theme="light"] .marquee-skills-band::before {
          background: linear-gradient(90deg, #f5f5f5 0%, transparent 15%, transparent 85%, #f5f5f5 100%);
        }
        [data-theme="light"] .marquee-skill-tag {
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(22, 163, 74, 0.02) 100%);
          border-color: rgba(22, 163, 74, 0.3);
          color: #15803d;
        }
        [data-theme="light"] .marquee-skill-tag:hover {
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(22, 163, 74, 0.08) 100%);
          border-color: rgba(22, 163, 74, 0.5);
          box-shadow: 0 0 30px rgba(22, 163, 74, 0.15);
        }
        [data-theme="light"] .marquee-skill-dot {
          background: #16a34a;
          box-shadow: 0 0 8px #16a34a;
        }
      `}</style>
    </div>
  );
};
