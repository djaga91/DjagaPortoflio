import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  Send,
  Moon,
  Sun,
  ArrowRight,
  Zap,
  Shield,
  Award,
  CheckCircle,
  Heart,
  Plus,
  Briefcase,
  RotateCcw,
  Sparkles,
  Layers,
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
import { ProjectImageIconEditor } from "../ProjectImageIconEditor";
import { CVButton } from "../CVButton";
import { HeroBackgroundLayer } from "../HeroBackgroundLayer";
import * as LucideIcons from "lucide-react";
import { API_URL } from "../../../services/api";
import { DragAndDropList } from "../DragAndDropList";
import { applyItemOrder, getItemOrder } from "../../../utils/itemOrder";
import { useTheme } from "../../../contexts/ThemeContext";

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface Template1Props {
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
  /** Surcharges hero (photo, titre, sous-titre, bio) — n'affectent pas le profil */
  templateOverrides?: TemplateOverrides | null;
  /** Mode édition : photo hero modifiable au survol, texte éditable */
  isEditable?: boolean;
  /** Callback quand l'utilisateur modifie les surcharges hero (photo ou texte) */
  onHeroOverridesChange?: (overrides: Partial<TemplateOverrides>) => void;
  /** true = preview (éditeur, contenu serré), false = page publique (contenu large) */
  isPreview?: boolean;
  /** Afficher les logos des entreprises et écoles */
  showLogos?: boolean;
  /** Ordre personnalisé des items (projets, compétences, etc.) */
  itemOrder?: {
    projects?: string[];
    skills?: string[];
    certifications?: string[];
    interests?: string[];
    languages?: string[];
  };
  lang?: "fr" | "en";
  /** Callback quand l'utilisateur réorganise les items */
  onItemOrderChange?: (itemOrder: {
    projects?: string[];
    skills?: string[];
    certifications?: string[];
    interests?: string[];
    languages?: string[];
  }) => void;
}

// --- Hook Typing Effect (Minimal Futuriste) ---
function useTypingEffect(
  text: string,
  speedMs: number = 50,
  enabled: boolean = true,
): string {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(t);
      }
    }, speedMs);
    return () => clearInterval(t);
  }, [text, speedMs, enabled]);
  return displayed;
}

// --- Composant utilitaire pour l'animation au défilement ---
const RevealOnScroll: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;

    const setup = () => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        setIsVisible(true);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.05, rootMargin: "0px 0px -80px 0px" },
      );
      observer.observe(el);
    };

    const raf = requestAnimationFrame(setup);
    return () => {
      cancelAnimationFrame(raf);
      if (observer) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/** Construit l'URL absolue pour une image (ex: /uploads/... → API_URL + path) */
function heroImageUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL || API_URL === "") {
    return url.startsWith("/") ? url : `/${url}`;
  }
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const Template1: React.FC<Template1Props> = ({
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
  isPreview = false,
  itemOrder,
  onItemOrderChange,
  lang = "fr",
}) => {
  const { resolvedTheme, toggleTheme: globalToggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState<"light" | "dark">(resolvedTheme);
  const [hasError] = useState(false);
  const [errorMessage] = useState<string | null>(null);

  // Largeur des sections : preview = plus serré, page publique = plus large
  const sectionMaxW = isPreview ? "max-w-5xl" : "max-w-7xl";
  const sectionMaxNarrow = isPreview ? "max-w-4xl" : "max-w-6xl";
  const sectionMaxContact = isPreview ? "max-w-3xl" : "max-w-4xl";

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

  // Valeurs hero : surcharges template > profil / user (chaîne vide = utiliser défaut)
  const heroImageSrc = heroImageUrl(
    templateOverrides?.hero_image_url ?? profile?.profile_picture_url ?? null,
  );
  const heroTitle =
    (templateOverrides?.hero_title?.trim() || undefined) ??
    profile?.title ??
    user?.full_name ??
    user?.username ??
    "My Portfolio";
  const heroSubtitle =
    (templateOverrides?.hero_subtitle?.trim() || undefined) ??
    `${lang === "en" ? "Hello, I am" : "Bonjour, je suis"} ${(user?.full_name || profile?.title || user?.username || "").trim().split(" ")[0] || "Alex"}`;
  const heroBio = templateOverrides?.hero_bio ?? "";
  const [editingField, setEditingField] = useState<
    "subtitle" | "title" | "bio" | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const [projectModal, setProjectModal] = useState<{
    title: string;
    category?: string;
    description: string;
    link?: string;
    github?: string;
  } | null>(null);
  // Refs for auto-sizing textareas
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const aboutTextareaRef = useRef<HTMLTextAreaElement>(null);

  const typedTitle = useTypingEffect(heroTitle, 55, true);

  const commitHeroEdit = () => {
    if (!onHeroOverridesChange || editingField === null) return;
    const next = { ...templateOverrides } as Partial<TemplateOverrides>;
    if (editingField === "subtitle")
      next.hero_subtitle = editingValue.trim() || undefined;
    if (editingField === "title")
      next.hero_title = editingValue.trim() || undefined;
    if (editingField === "bio") next.hero_bio = editingValue;
    onHeroOverridesChange(next);
    setEditingField(null);
  };

  // Keep local theme in sync with global resolved theme when it changes externally
  useEffect(() => {
    setTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ["home", ...visibleSectionsInOrder.map(s => s.id)];
      const scrollPosition = window.scrollY + 100;

      for (const section of sectionIds) {
        const element = document.getElementById(section);
        if (
          element &&
          element.offsetTop <= scrollPosition &&
          element.offsetTop + element.offsetHeight > scrollPosition
        ) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    globalToggleTheme();
    onThemeChange?.(resolvedTheme === "dark" ? "light" : "dark");
  };

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isDark = resolvedTheme === "dark";

  // Données formatées (avec vérifications de sécurité)
  // IMPORTANT : n'afficher que des informations réellement présentes dans le profil / user
  const fullName = user?.full_name || profile?.title || user?.username || "";
  const bio = profile?.bio || "";
  const location = profile?.location || "";

  // Section "À propos" : utiliser bio profil ou section personnalisée
  const useCustomAbout = templateOverrides?.about_use_custom === true;
  const aboutText = useCustomAbout
    ? templateOverrides?.about_text || ""
    : profile?.bio || "";
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

  // Gestion des erreurs
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-2xl mb-4 text-indigo-500">❌ Erreur de rendu</p>
          <p className="text-slate-400 mb-4">
            {errorMessage || "Une erreur est survenue"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  // Vérifier que les données essentielles existent
  if (!user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Chargement du portfolio...</p>
          <p className="text-slate-400 text-sm">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  // Formater les projets — inclure project_icon et url_image
  let formattedProjects: any[] = [];
  try {
    formattedProjects = (Array.isArray(projects) ? projects : [])
      .filter((project: any) => project?.name || project?.description)
      .map((project: any) => ({
        id: project?.id || `project-${Math.random()}`,
        title: project?.name || "",
        category:
          project?.technologies && Array.isArray(project.technologies)
            ? project.technologies.join(" / ")
            : "",
        image:
          project?.url_image && project.url_image.trim()
            ? project.url_image
            : null,
        icon: project?.project_icon || null,
        description: project?.description || "",
        link: project?.url_demo || "",
        github: project?.url_github || "",
        // Garder la référence au projet complet pour l'éditeur
        project: project,
      }));

    // Appliquer l'ordre personnalisé si disponible
    if (itemOrder?.projects && itemOrder.projects.length > 0) {
      formattedProjects = applyItemOrder(
        formattedProjects,
        itemOrder.projects,
        (p: any) => p.id,
      );
    }
  } catch (error: any) {
    console.error("❌ [Template1] Erreur formatage projets:", error);
    formattedProjects = [];
  }

  // Séparer les axes radar des compétences normales
  const radarSkills = (skills || []).filter((s) => s.category === "__radar__").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const nonRadarSkills = (skills || []).filter((s) => s.category !== "__radar__");

  // Appliquer l'ordre personnalisé aux autres items
  const orderedSkills =
    itemOrder?.skills && itemOrder.skills.length > 0
      ? applyItemOrder(nonRadarSkills, itemOrder.skills, (s) => s.id || s.name)
      : nonRadarSkills;

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

  // Fonction pour recharger les projets après modification
  const refreshProjects = () => {
    // Le store sera mis à jour automatiquement via fetchProjects dans ProjectImageIconEditor
    // Cette fonction est appelée après la mise à jour pour déclencher un re-render
  };

  return (
    <div
      data-template="1"
      className={`min-h-screen w-full ${isDark ? "bg-slate-900 text-slate-100" : "bg-amber-50 text-stone-900"} ${fontClass} selection:bg-blue-500 selection:text-white overflow-visible`}
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
        [data-template="1"] h1 { font-family: var(--font-titles) !important; }
        [data-template="1"] .portfolio-font-title { font-family: var(--font-titles) !important; }
        [data-template="1"] h2, [data-template="1"] h5, [data-template="1"] h6 { font-family: var(--font-subtitles) !important; }
        [data-template="1"] .text-sm, [data-template="1"] .text-xs { font-family: var(--font-subtitles) !important; }
        [data-template="1"] h3, [data-template="1"] h4, [data-template="1"] p, [data-template="1"] li, [data-template="1"] .text-base { font-family: var(--font-body) !important; }
        [data-template="1"] .portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="1"] .group\/badge .portfolio-font-item,
        [data-template="1"] .group\/badge input.portfolio-font-item { font-family: var(--font-item) !important; }
        [data-template="1"] .portfolio-font-item-small { font-family: var(--font-item-small) !important; }
        [data-template="1"] .portfolio-nav-title { font-family: var(--font-subtitles) !important; }
        [data-template="1"] .portfolio-section-intro { font-family: var(--font-body) !important; }
        [data-template="1"] .portfolio-font-subtitle { font-family: var(--font-subtitles) !important; }
        [data-template="1"] footer.portfolio-footer-text,
        [data-template="1"] footer.portfolio-footer-text p { font-family: var(--font-body) !important; }
        /* Polices personnalisées : ne pas couper le titre hero. padding-top/bottom du .hero-title-wrap = inline dans le JSX */
        [data-template="1"] #home,
        [data-template="1"] .hero-title-wrap,
        [data-template="1"] .hero-title-wrap h1 { overflow: visible !important; }
        [data-template="1"] .hero-title-wrap h1 { line-height: 1.5 !important; }
      `}</style>
      {/* --- Styles globaux pour les animations personnalisées --- */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glass-nav {
          background: ${isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(250, 245, 235, 0.95)"};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"};
          box-shadow: ${isDark ? "0 4px 12px -2px rgba(0, 0, 0, 0.4)" : "0 4px 12px -2px rgba(0, 0, 0, 0.15)"};
        }
        .glass-card {
          background: ${isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(250, 245, 235, 0.7)"};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.1)"};
        }
        .template-primary-gradient {
          background: linear-gradient(to right, #f97316, #dc2626);
        }
        /* Masonry + 3D hover (Minimal Futuriste) */
        .portfolio-masonry {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .portfolio-masonry {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .portfolio-masonry {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .portfolio-card-project {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .hero-delay-100 { animation-delay: 100ms; }
        .hero-delay-200 { animation-delay: 200ms; }
        .hero-delay-300 { animation-delay: 300ms; }
        .hero-delay-500 { animation-delay: 500ms; }
        .hero-delay-700 { animation-delay: 700ms; }
        .hero-delay-1000 { animation-delay: 1000ms; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 5s ease infinite;
        }
      `}</style>

      {/* --- Navbar --- */}
      <nav className="sticky top-0 left-0 right-0 w-full z-30 glass-nav transition-all duration-300 overflow-hidden">
        <div
          className={`w-full ${sectionMaxW} mx-auto px-3 sm:px-4 lg:px-6 xl:px-8`}
        >
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 min-w-0">
            {/* Logo - avec contrainte de largeur pour éviter le débordement */}
            <div
              className="flex-shrink-0 cursor-pointer min-w-0 max-w-[50%] sm:max-w-none"
              onClick={() => {
                scrollTo("home");
                setIsMenuOpen(false);
              }}
            >
              <span className="portfolio-nav-title text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 truncate block">
                PORTFOLIO
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 xl:gap-4 flex-shrink-0 min-w-0">
              <div className="flex items-center gap-1 lg:gap-2 xl:gap-4">
                {[
                  { label: lang === "en" ? "Home" : "Accueil", id: "home" },
                  ...visibleSectionsInOrder
                    .filter(s => s.id !== "hero")
                    .map(s => ({
                      label: s.label,
                      id: s.id
                    }))
                ].map(({ label, id }) => {
                  const scrollId = id;
                  // Pour l'accueil, on scroll vers le hero (id=home)
                  // Les autres sections sont déjà checkées par visibleSectionsInOrder
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(scrollId)}
                      className={`px-2 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors duration-300 whitespace-nowrap flex-shrink-0 ${
                        activeSection === id
                          ? `${isDark ? "text-blue-400 bg-white/5" : "text-blue-600 bg-blue-50"}`
                          : `${isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-blue-50"}`
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {/* Bouton CV */}
              <CVButton
                cvId={customization?.cvId}
                cvUrl={customization?.cvUrl}
                variant="ghost"
                size="sm"
                className={
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              />
              {/* Toggle Theme */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 xl:p-2 rounded-lg flex-shrink-0 ${isDark ? "bg-white/5 hover:bg-white/10 text-slate-100" : "bg-slate-200 hover:bg-slate-300 text-slate-900"} transition-colors`}
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {theme === "dark" ? (
                  <Sun size={16} className="xl:w-5 xl:h-5" />
                ) : (
                  <Moon size={16} className="xl:w-5 xl:h-5" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg ${isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-200 text-slate-600 hover:text-slate-900"} transition-colors flex-shrink-0`}
                aria-label="Changer le thème"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0`}
                aria-label="Ouvrir le menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <>
            {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
            <div
              className="fixed inset-0 bg-black/20 z-[9998] md:hidden"
              onClick={() => setIsMenuOpen(false)}
              style={{ position: "fixed" }}
            />
            <div
              className={`md:hidden glass-nav absolute top-full left-0 right-0 w-full max-w-full border-b ${isDark ? "border-slate-700" : "border-slate-200"} z-50 shadow-lg overflow-hidden`}
            >
              <div className="px-3 pt-2 pb-3 space-y-1 w-full">
                {[
                  { label: lang === "en" ? "Home" : "Accueil", id: "home" },
                  ...visibleSectionsInOrder
                    .filter(s => s.id !== "hero")
                    .map(s => ({
                      label: s.label,
                      id: s.id
                    }))
                ].map(({ label, id }) => (
                  <button
                    key={id}
                    onClick={() => {
                      scrollTo(id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2.5 text-sm font-medium ${isDark ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-slate-900 hover:bg-blue-50"} rounded-md transition-colors truncate`}
                  >
                    {label}
                  </button>
                ))}
                {/* Bouton CV dans le menu mobile */}
                <div className="pt-2 border-t border-slate-700 dark:border-slate-200 mt-2">
                  <div className="flex justify-center">
                    <CVButton
                      cvId={customization?.cvId}
                      cvUrl={customization?.cvUrl}
                      variant="ghost"
                      size="sm"
                      className={
                        isDark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* --- Hero Section : design refonte template ok (couleurs Template 1 = blue/rouge) --- */}
      {/* --- Section Hero - Premium Facelift --- */}
      <section
        id="home"
        className={`relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden ${isDark ? "bg-[#0b0f1a]" : "bg-slate-50"}`}
      >
        {/* Background GIF/Video Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50 md:opacity-60"
          >
            <source src="https://media.tenor.com/_YljgR4MJOkAAAPo/chill.mp4" type="video/mp4" />
          </video>
          {/* Subtle Overlay to ensure readability */}
          <div className={`absolute inset-0 ${isDark ? "bg-[#0b0f1a]/50" : "bg-white/30"}`} />
        </div>

        {/* Glow Blobs Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-indigo-600/10 rounded-full blur-[100px] animate-blob [animation-delay:2s]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[80px] animate-blob [animation-delay:4s]" />
        </div>

        <div
          className={`${sectionMaxW} mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20`}
        >
          {/* Partie gauche : texte */}
          <div className="flex-1 space-y-8 text-center md:text-left overflow-visible">
            <div
              className="animate-fade-in-up hero-delay-100 overflow-visible flex flex-col"
              style={{ gap: "12px" }}
            >
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
                    className={`portfolio-font-item block w-full bg-transparent border-b border-blue-500/50 focus:border-blue-500 focus:outline-none text-lg md:text-xl font-medium ${isDark ? "text-white/90" : "text-slate-800"}`}
                    placeholder={lang === "en" ? "Hello, I am..." : "Bonjour, je suis…"}
                  />
                ) : (
                  <h2
                    className={`portfolio-font-item block text-lg md:text-xl font-medium tracking-tight ${isDark ? "text-blue-400" : "text-blue-600"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroSubtitle),
                      setEditingField("subtitle"))
                    }
                    role={isEditable ? "button" : undefined}
                    title={isEditable ? (lang === "en" ? "Click to edit" : "Cliquer pour modifier") : undefined}
                  >
                    {heroSubtitle}
                  </h2>
                )}
              </div>
              <div
                className="hero-title-wrap relative group/hero-title overflow-visible"
                style={{ paddingTop: "4px", paddingBottom: "6px" }}
              >
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
                    className="portfolio-font-title block w-full text-4xl md:text-6xl font-black bg-transparent border-b border-blue-500/50 focus:border-blue-500 focus:outline-none text-white"
                    placeholder={lang === "en" ? "Your name or title" : "Votre nom ou titre"}
                  />
                ) : (
                  <h1
                    className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-1 -mx-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                    onClick={() =>
                      isEditable &&
                      onHeroOverridesChange &&
                      (setEditingValue(heroTitle), setEditingField("title"))
                    }
                    role={isEditable ? "button" : undefined}
                    title={isEditable ? (lang === "en" ? "Click to edit" : "Cliquer pour modifier") : undefined}
                    aria-live="polite"
                  >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-indigo-500 drop-shadow-sm">
                      {editingField === "title" ? heroTitle : typedTitle}
                      {editingField !== "title" &&
                        typedTitle.length < heroTitle.length && (
                          <span className="inline-block w-[3px] h-[0.8em] bg-blue-500 ml-1 animate-pulse" />
                        )}
                    </span>
                  </h1>
                )}
              </div>
            </div>

            <div className="relative group/hero-bio animate-fade-in-up hero-delay-200">
              <HeroEditHint
                show={isEditable && !!onHeroOverridesChange}
                groupName="hero-bio"
                className={isDark ? "text-blue-300" : "text-blue-600"}
              />
              {isEditable && onHeroOverridesChange && editingField === "bio" ? (
                <textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={commitHeroEdit}
                  autoFocus
                  rows={3}
                  className={`block w-full max-w-lg mx-auto md:mx-0 text-lg md:text-xl resize-none overflow-hidden bg-transparent border border-blue-500/50 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 leading-relaxed ${isDark ? "text-gray-400" : "text-slate-600"}`}
                  placeholder={lang === "en" ? "Write a short hook for the hero..." : "Écrivez une accroche courte pour le hero..."}
                />
              ) : (
                <p
                  className={`text-lg md:text-xl max-w-lg mx-auto md:mx-0 leading-relaxed font-light ${!heroBio && isEditable ? "text-slate-500 italic" : isDark ? "text-slate-400" : "text-slate-600"} ${isEditable && onHeroOverridesChange ? "cursor-pointer rounded px-2 -mx-2 py-1 hover:ring-2 hover:ring-blue-500/40" : ""}`}
                  onClick={() =>
                    isEditable &&
                    onHeroOverridesChange &&
                    (setEditingValue(heroBio), setEditingField("bio"))
                  }
                  role={isEditable ? "button" : undefined}
                  title={isEditable ? (lang === "en" ? "Click to edit" : "Cliquer pour modifier") : undefined}
                >
                  {heroBio ||
                    (isEditable
                      ? (lang === "en" ? "Click to write a hook for the hero." : "Cliquez pour écrire une accroche pour le hero.")
                      : "")}
                </p>
              )}
            </div>

            <div
              className={`flex justify-center md:justify-start gap-8 pt-4 animate-fade-in-up hero-delay-500 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:scale-125 transition-all transform duration-300"
              >
                <Github size={24} />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 hover:scale-125 transition-all transform duration-300"
              >
                <Linkedin size={24} />
              </a>
              <a
                href={`mailto:${email}`}
                className="hover:text-blue-500 hover:scale-125 transition-all transform duration-300"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center relative animate-fade-in-up hero-delay-300 mt-12 md:mt-0">
            {/* Cercles orbitaux futuristes */}
            <div
              className={`absolute w-[450px] h-[450px] border rounded-full animate-spin-slow opacity-20 ${isDark ? "border-blue-500" : "border-slate-300"}`}
            />
            <div
              className={`absolute w-[320px] h-[320px] border border-dashed rounded-full animate-[spin_20s_linear_infinite_reverse] opacity-20 ${isDark ? "border-indigo-500" : "border-slate-400"}`}
            />

            <div className="relative group/hero-photo w-64 h-64 md:w-80 md:h-80">
              <HeroEditHint
                show={isEditable}
                groupName="hero-photo"
                className="top-2 right-2 text-white/90"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-2xl opacity-20 group-hover/hero-photo:opacity-40 transition duration-1000" />
              <div
                className={`relative w-full h-full rounded-full overflow-hidden ring-4 ${isDark ? "ring-white/5 bg-[#0a0f1d]" : "ring-white bg-white"} flex items-center justify-center transition-all duration-700 transform group-hover/hero-photo:scale-105 shadow-2xl ${isEditable ? "cursor-pointer" : ""}`}
                onClick={() => isEditable && heroFileInputRef.current?.click()}
                role={isEditable ? "button" : undefined}
                aria-label={isEditable ? (lang === "en" ? "Change photo" : "Changer la photo") : undefined}
              >
                {heroImageSrc ? (
                  <img
                    src={heroImageSrc}
                    alt="Photo hero"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/hero-photo:scale-110"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500"}`}
                  >
                    <span className="text-5xl font-bold">
                      {(user?.full_name || user?.username || "?")[0]}
                    </span>
                  </div>
                )}
              </div>

              <div
                onClick={() => scrollTo("experiences")}
                className={`absolute -bottom-8 -left-8 glass-premium p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-float hover-glow group cursor-pointer`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                  {experiences.length > 0 ? `${experiences.length}+` : "0"}
                </div>
                <div className="text-left">
                  <p
                    className={`text-[10px] uppercase font-bold tracking-[0.2em] ${isDark ? "text-blue-400/80" : "text-blue-600/80"}`}
                  >
                    {lang === "en" ? "Professional" : "Expériences"}
                  </p>
                  <p
                    className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {lang === "en" ? "Experience" : "Professionnelles"}
                  </p>
                </div>
              </div>

              <div
                onClick={() => scrollTo("projects")}
                className={`absolute -top-6 -right-10 glass-premium p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-float hero-delay-700 hover-glow group cursor-pointer`}
              >
                <div className="text-left">
                  <p
                    className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500`}
                  >
                    {projects.length > 0 ? projects.length : "0"}+
                  </p>
                  <p
                    className={`text-[10px] uppercase font-bold tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {lang === "en" ? "Projects" : "Projets"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons Call to action - Premium Shimmer */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center gap-8 pb-8 pt-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up hero-delay-700">
            <button
              onClick={() => scrollTo("projects")}
              className="group relative px-10 py-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex items-center gap-3">
                {lang === "en" ? "See my projects" : "Voir mes projets"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </span>
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className={`px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 border backdrop-blur-md ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white/50 text-slate-900 hover:bg-white"}`}
            >
              {lang === "en" ? "Contact me" : "Me contacter"}
            </button>
          </div>
          <div
            onClick={() => scrollTo("about")}
            className={`animate-bounce-slow mt-8 cursor-pointer ${isDark ? "text-blue-500/50" : "text-slate-400"}`}
            title={lang === "en" ? "Scroll down" : "Défiler vers le bas"}
          >
            <ChevronDown size={40} />
          </div>
        </div>
      </section>

      {/* --- Sections dynamiques --- */}
      {visibleSectionsInOrder.map((section, sectionIndex) => {
        if (section.id === "about") {
          const showSkillsInAbout =
            checkSectionVisible("skills") &&
            visibleSectionsInOrder.findIndex((s) => s.id === "skills") ===
              sectionIndex + 1;
          return (
            <section
              key={section.id}
              id="about"
              className={`py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-900/50" : "bg-white/50"} relative`}
            >
              <div className={`${sectionMaxW} mx-auto px-4 sm:px-6 lg:px-8`}>
                <div
                  className={`grid grid-cols-1 ${showSkillsInAbout ? "md:grid-cols-2" : ""} gap-8 sm:gap-12 lg:gap-16 items-start md:items-center`}
                >
                  <RevealOnScroll>
                    <div>
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                          <h2
                            className={`text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 sm:gap-3 ${isDark ? "text-slate-100" : "text-slate-900"}`}
                          >
                            <span
                              className={`w-8 sm:w-12 h-1 ${isDark ? "bg-blue-500" : "bg-blue-600"} rounded-full`}
                            ></span>
                            {lang === "en" ? "About" : "À Propos"}
                          </h2>
                          {isEditable &&
                            onHeroOverridesChange &&
                            useCustomAbout && (
                              <div className="flex gap-1 ml-2">
                                {[
                                  { value: "image_top", label: "Top", icon: "⬆️" },
                                  { value: "image_bottom", label: "Bottom", icon: "⬇️" },
                                  { value: "image_left", label: "Left", icon: "⬅️" },
                                  { value: "image_right", label: "Right", icon: "➡️" },
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
                                onHeroOverridesChange({
                                  about_use_custom: false,
                                });
                              } else {
                                onHeroOverridesChange({
                                  about_use_custom: true,
                                  about_layout:
                                    templateOverrides?.about_layout ??
                                    "image_top",
                                  about_text_align:
                                    templateOverrides?.about_text_align ??
                                    "center",
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
                                  ? "rgba(249, 115, 22, 0.1)"
                                  : "rgba(249, 115, 22, 0.05)",
                              borderColor: useCustomAbout
                                ? isDark
                                  ? "rgba(148, 163, 184, 0.3)"
                                  : "rgba(148, 163, 184, 0.2)"
                                : isDark
                                  ? "rgba(249, 115, 22, 0.3)"
                                  : "rgba(249, 115, 22, 0.2)",
                              color: useCustomAbout
                                ? isDark
                                  ? "rgb(148, 163, 184)"
                                  : "rgb(71, 85, 105)"
                                : isDark
                                  ? "rgb(251, 146, 60)"
                                  : "rgb(234, 88, 12)",
                            }}
                            title={
                              useCustomAbout
                                ? (lang === "en" ? "Use profile bio" : "Utiliser la bio du profil")
                                : (lang === "en" ? "Customize" : "Personnaliser")
                            }
                          >
                            {useCustomAbout ? (
                              <>
                                <RotateCcw size={14} />
                                {lang === "en" ? "Profile Bio" : "Bio profil"}
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                {lang === "en" ? "Customize" : "Personnaliser"}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {(() => {
                        return (
                          <div className="mt-8">
                            {/* Main Bio Card */}
                            <div className={`glass-premium p-8 sm:p-10 rounded-3xl relative overflow-hidden group animate-fade-in-up hover-glow`}>
                              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                              <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                                {lang === "en" 
                                  ? "No matter where I am, I will find a way to thrive !" 
                                  : "Peu importe où je me retrouve, je trouverai comment prospérer"}
                              </h3>
                              <p className={`text-lg leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"} font-light whitespace-pre-line`}>
                                {aboutText || (useCustomAbout ? "" : bio)}
                              </p>
                              

                            </div>
                          </div>
                        );
                      })()}
                      {location && (
                        <p
                          className={`${isDark ? "text-slate-400" : "text-slate-600"} text-base sm:text-lg leading-relaxed mb-6 sm:mb-8`}
                        >
                          📍 {location}
                        </p>
                      )}

                      <div className="flex gap-4">
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 glass-card rounded-full ${isDark ? "text-slate-400" : "text-slate-600"} ${isDark ? "text-blue-400" : "text-blue-600"} hover:border-blue-500/50 transition-all`}
                          >
                            <Github size={24} />
                          </a>
                        )}
                        {linkedinUrl && (
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 glass-card rounded-full ${isDark ? "text-slate-400" : "text-slate-600"} ${isDark ? "text-blue-400" : "text-blue-600"} hover:border-blue-500/50 transition-all`}
                          >
                            <Linkedin size={24} />
                          </a>
                        )}
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className={`p-3 glass-card rounded-full ${isDark ? "text-slate-400" : "text-slate-600"} ${isDark ? "text-blue-400" : "text-blue-600"} hover:border-blue-500/50 transition-all`}
                          >
                            <Mail size={24} />
                          </a>
                        )}
                      </div>
                    </div>
                  </RevealOnScroll>

                  {showSkillsInAbout && (
                    <RevealOnScroll delay={200}>
                      <div
                        className={`glass-card p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl relative overflow-hidden ${isDark ? "bg-slate-800/30" : "bg-stone-50/90"}`}
                      >
                        <div
                          className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 ${isDark ? "bg-blue-500/10" : "bg-blue-50"} rounded-full filter blur-2xl -mr-8 sm:-mr-10 -mt-8 sm:-mt-10`}
                        ></div>
                        <h3
                          className={`text-lg sm:text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"} mb-4 sm:mb-6`}
                        >
                          {lang === "en" ? "Technical Skills" : "Compétences Techniques"}
                        </h3>

                        {Array.isArray(skills) && skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {skills.map((skill, index) => (
                              <div
                                key={index}
                                className={`group relative px-4 py-2.5 rounded-xl border transition-all duration-300 hover:scale-105
                                  ${
                                    isDark
                                      ? "bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                                      : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg"
                                  }`}
                              >
                                {/* Glow effect */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                                <div className="relative z-10 flex items-center gap-2">
                                  <SkillIcon
                                    skillName={skill.name}
                                    size={18}
                                    className="flex-shrink-0"
                                  />
                                  <span
                                    className={`portfolio-font-item font-medium text-sm ${isDark ? "text-white" : "text-slate-800"}`}
                                  >
                                    {skill.name}
                                  </span>
                                  {skill.level &&
                                    String(skill.level).trim() &&
                                    !/^not\s*specified$/i.test(
                                      String(skill.level).trim(),
                                    ) && (
                                      <span
                                        className={`ml-1 px-1.5 py-0.5 rounded text-xs ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"}`}
                                      >
                                        {typeof skill.level === "number"
                                          ? `${skill.level}%`
                                          : skill.level}
                                      </span>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p
                            className={
                              isDark ? "text-slate-400" : "text-slate-600"
                            }
                          >
                            Aucune compétence renseignée
                          </p>
                        )}
                      </div>
                    </RevealOnScroll>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // Section Skills (si pas intégrée dans About)
        if (section.id === "skills") {
          const isAfterAbout =
            sectionIndex > 0 &&
            visibleSectionsInOrder[sectionIndex - 1].id === "about";
          if (isAfterAbout) return null; // Déjà affichée dans About

          // Appliquer l'ordre personnalisé aux compétences avant de les grouper par catégorie
          const skillsToGrid =
            itemOrder?.skills && itemOrder.skills.length > 0
              ? applyItemOrder(
                  orderedSkills,
                  itemOrder.skills,
                  (s) => s.id || s.name,
                )
              : orderedSkills;

          // orderedSkills already excludes __radar__ items — no slice needed
          const skillsToGroup = skillsToGrid;

          // Grouper les compétences par catégorie (ne jamais afficher "Auto-detected" → Autres)
          const skillsByCategory = (
            Array.isArray(skillsToGroup) ? skillsToGroup : []
          ).reduce((acc: Record<string, typeof skillsToGroup>, skill) => {
            const raw = skill.category || "Autres";
            const category = /^auto\s*[-]?detected$/i.test(raw)
              ? "Autres"
              : raw;
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill);
            return acc;
          }, {});

          // Couleurs par catégorie
          const categoryColors: Record<
            string,
            { bg: string; text: string; border: string; gradient: string }
          > = {
            Frontend: {
              bg: "from-blue-500/20 to-cyan-500/20",
              text: "text-blue-400",
              border: "border-blue-500/30",
              gradient: "from-blue-500 to-cyan-500",
            },
            Backend: {
              bg: "from-green-500/20 to-emerald-500/20",
              text: "text-green-400",
              border: "border-green-500/30",
              gradient: "from-green-500 to-emerald-500",
            },
            Database: {
              bg: "from-purple-500/20 to-violet-500/20",
              text: "text-purple-400",
              border: "border-purple-500/30",
              gradient: "from-purple-500 to-violet-500",
            },
            DevOps: {
              bg: "from-blue-500/20 to-indigo-500/20",
              text: "text-blue-400",
              border: "border-blue-500/30",
              gradient: "from-blue-500 to-indigo-500",
            },
            Mobile: {
              bg: "from-pink-500/20 to-cyan-500/20",
              text: "text-pink-400",
              border: "border-pink-500/30",
              gradient: "from-pink-500 to-cyan-500",
            },
            Design: {
              bg: "from-yellow-500/20 to-sky-500/20",
              text: "text-yellow-400",
              border: "border-yellow-500/30",
              gradient: "from-yellow-500 to-sky-500",
            },
            Autres: {
              bg: "from-slate-500/20 to-gray-500/20",
              text: "text-slate-400",
              border: "border-slate-500/30",
              gradient: "from-slate-500 to-gray-500",
            },
            "Gouvernance, Risques et Conformité (GRC)": {
              bg: "from-sky-500/20 to-yellow-500/20",
              text: "text-sky-400",
              border: "border-sky-500/30",
              gradient: "from-sky-600 to-yellow-500",
            },
            "Governance, Risk and Compliance (GRC)": {
              bg: "from-sky-500/20 to-yellow-500/20",
              text: "text-sky-400",
              border: "border-sky-500/30",
              gradient: "from-sky-600 to-yellow-500",
            },
            "Concept et Domaines": {
              bg: "from-blue-500/20 to-cyan-500/20",
              text: "text-blue-400",
              border: "border-blue-500/30",
              gradient: "from-blue-600 to-cyan-500",
            },
            "Concept and Domains": {
              bg: "from-blue-500/20 to-cyan-500/20",
              text: "text-blue-400",
              border: "border-blue-500/30",
              gradient: "from-blue-600 to-cyan-500",
            },
            "Langages et Scripts": {
              bg: "from-emerald-500/20 to-teal-500/20",
              text: "text-emerald-400",
              border: "border-emerald-500/30",
              gradient: "from-emerald-600 to-teal-500",
            },
            "Languages and Scripts": {
              bg: "from-emerald-500/20 to-teal-500/20",
              text: "text-emerald-400",
              border: "border-emerald-500/30",
              gradient: "from-emerald-600 to-teal-500",
            },
            "Outils de Sécurité": {
              bg: "from-indigo-500/20 to-blue-500/20",
              text: "text-indigo-400",
              border: "border-indigo-500/30",
              gradient: "from-indigo-600 to-blue-500",
            },
            "Security Tools": {
              bg: "from-indigo-500/20 to-blue-500/20",
              text: "text-indigo-400",
              border: "border-indigo-500/30",
              gradient: "from-indigo-600 to-blue-500",
            },
            "Cloud & DevOps": {
              bg: "from-cyan-500/20 to-blue-500/20",
              text: "text-cyan-400",
              border: "border-cyan-500/30",
              gradient: "from-cyan-600 to-blue-500",
            },
            "Cloud and DevOps": {
              bg: "from-cyan-500/20 to-blue-500/20",
              text: "text-cyan-400",
              border: "border-cyan-500/30",
              gradient: "from-cyan-600 to-blue-500",
            },
            "Management et Soft Skills": {
              bg: "from-indigo-500/20 to-purple-500/20",
              text: "text-indigo-400",
              border: "border-indigo-500/30",
              gradient: "from-indigo-600 to-purple-500",
            },
            "Management and Soft Skills": {
              bg: "from-indigo-500/20 to-purple-500/20",
              text: "text-indigo-400",
              border: "border-indigo-500/30",
              gradient: "from-indigo-600 to-purple-500",
            },
            // ── Nouvelles catégories ─────────────────────────
            "Management & Leadership": {
              bg: "from-blue-600/20 to-indigo-500/20",
              text: "text-blue-400",
              border: "border-blue-500/30",
              gradient: "from-blue-600 to-indigo-500",
            },
            "Business & Operations": {
              bg: "from-green-500/20 to-emerald-500/20",
              text: "text-green-400",
              border: "border-green-500/30",
              gradient: "from-green-600 to-emerald-500",
            },
            "Business & Opérations": {
              bg: "from-green-500/20 to-emerald-500/20",
              text: "text-green-400",
              border: "border-green-500/30",
              gradient: "from-green-600 to-emerald-500",
            },
            "Soft Skills": {
              bg: "from-violet-500/20 to-purple-500/20",
              text: "text-violet-400",
              border: "border-violet-500/30",
              gradient: "from-violet-600 to-purple-500",
            },
            "Langages": {
              bg: "from-emerald-500/20 to-teal-500/20",
              text: "text-emerald-400",
              border: "border-emerald-500/30",
              gradient: "from-emerald-600 to-teal-500",
            },
            "Languages": {
              bg: "from-emerald-500/20 to-teal-500/20",
              text: "text-emerald-400",
              border: "border-emerald-500/30",
              gradient: "from-emerald-600 to-teal-500",
            },
          };

          const getColors = (category: string) =>
            categoryColors[category] || categoryColors["Autres"];

          return (
            <section
              key={section.id}
              id="skills"
              className={`py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-900" : "bg-transparent"} relative overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className={`absolute -top-40 -right-40 w-80 h-80 ${isDark ? "bg-blue-500/5" : "bg-blue-100"} rounded-full blur-3xl`}
                ></div>
                <div
                  className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDark ? "bg-blue-500/5" : "bg-blue-100"} rounded-full blur-3xl`}
                ></div>
              </div>

              <div className={`${sectionMaxW} mx-auto px-4 sm:px-6 lg:px-8 relative z-10`}>
                <RevealOnScroll>
                  <div className="text-center mb-12 sm:mb-16">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                      {lang === "en" ? "Skills" : "Compétences"}
                    </span>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {lang === "en" ? "My Skills" : "Mes Compétences"}
                    </h2>
                    <p className={`mt-4 text-lg ${isDark ? "text-slate-400" : "text-slate-600"} max-w-2xl mx-auto`}>
                      {lang === "en" ? "Technologies and tools I master" : "Technologies et outils que je maîtrise"}
                    </p>
                  </div>
                </RevealOnScroll>

                {/* Radar chart */}
                {radarSkills.length >= 3 && (
                  <RevealOnScroll delay={100}>
                    <div className={`mb-12 sm:mb-16 max-w-lg mx-auto p-6 rounded-2xl ${isDark ? "bg-slate-800/40" : "bg-stone-50/80"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      <h3 className={`text-center text-sm font-semibold mb-4 ${isDark ? "text-slate-400" : "text-slate-500"} uppercase tracking-widest`}>
                        {lang === "en" ? "Skill Overview" : "Vue d'ensemble"}
                      </h3>
                      <Radar
                        data={{
                          labels: radarSkills.map((s) => {
                            const name = s.name || "";
                            // Wrap long labels
                            if (name.length > 10) return name.split(" ");
                            return name;
                          }),
                          datasets: [{
                            label: lang === "en" ? "Level" : "Niveau",
                            data: radarSkills.map((s) => {
                              const str = String(s.level ?? "0").replace(/%/g, "").trim();
                              const n = parseFloat(str);
                              // Values are 0-100, convert to 0-5 scale
                              const val = Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
                              return Math.round(val / 20 * 10) / 10; // 0-5 with 1 decimal
                            }),
                            backgroundColor: isDark ? "rgba(249, 115, 22, 0.2)" : "rgba(249, 115, 22, 0.15)",
                            borderColor: isDark ? "rgb(251, 146, 60)" : "rgb(234, 88, 12)",
                            borderWidth: 2,
                            pointBackgroundColor: isDark ? "rgb(251, 146, 60)" : "rgb(234, 88, 12)",
                            pointRadius: 4,
                            pointHoverRadius: 6,
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          layout: { padding: { top: 20, bottom: 20, left: 20, right: 20 } },
                          scales: {
                            r: {
                              min: 0,
                              max: 5,
                              ticks: {
                                stepSize: 1,
                                display: true,
                                color: isDark ? "rgba(148,163,184,0.5)" : "rgba(71,85,105,0.4)",
                                font: { size: 9 },
                                backdropColor: "transparent",
                              },
                              grid: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
                              angleLines: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
                              pointLabels: {
                                color: isDark ? "#94a3b8" : "#475569",
                                font: { size: 11, weight: 600 },
                                padding: 8,
                              },
                            },
                          },
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: (ctx) => ` ${ctx.parsed.r}/5`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </RevealOnScroll>
                )}

                {Object.keys(skillsByCategory).length > 0 ? (
                  <div className="space-y-10">
                    {Object.entries(skillsByCategory).map(([category, categorySkills], catIndex) => {
                      const colors = getColors(category);
                      return (
                        <RevealOnScroll key={category} delay={catIndex * 100}>
                          <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? `bg-gradient-to-br ${colors.bg} border-white/5` : "bg-white border-slate-200 shadow-lg"}`}>
                            <div className="flex items-center gap-3 mb-6">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                              <h3 className={`portfolio-font-item text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{category}</h3>
                              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${isDark ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-600"}`}>
                                {categorySkills.length} {lang === "en" ? "skill" : "compétence"}{categorySkills.length > 1 ? "s" : ""}
                              </span>
                            </div>

                            {isEditable && onItemOrderChange ? (
                              <DragAndDropList
                                items={categorySkills}
                                onReorder={(reorderedSkills) => {
                                  const allSkillsFlat: Skill[] = [];
                                  Object.entries(skillsByCategory).forEach(([cat, skills]) => {
                                    allSkillsFlat.push(...(cat === category ? reorderedSkills : skills));
                                  });
                                  onItemOrderChange({ ...itemOrder, skills: getItemOrder(allSkillsFlat, (s) => s.id || s.name) });
                                }}
                                getItemId={(s) => s.id || s.name}
                                disabled={!isEditable}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
                                strategy="grid"
                                renderItem={(skill: Skill, skillIndex: number) => (
                                  <div key={skillIndex} className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-default ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105" : "bg-slate-50 border-slate-200 hover:bg-white hover:shadow-lg hover:scale-105 hover:border-blue-200"}`}>
                                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                    <div className="relative z-10 text-center">
                                      <div className="mx-auto mb-3 flex items-center justify-center">
                                        <SkillIcon skillName={skill.name} size={22} />
                                      </div>
                                      <p className={`portfolio-font-item font-medium text-sm ${isDark ? "text-white" : "text-slate-900"} break-words`}>{skill.name}</p>
                                    </div>
                                  </div>
                                )}
                              />
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {categorySkills.map((skill, skillIndex) => (
                                  <div key={skillIndex} className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-default ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105" : "bg-slate-50 border-slate-200 hover:bg-white hover:shadow-lg hover:scale-105 hover:border-blue-200"}`}>
                                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                    <div className="relative z-10 text-center">
                                      <div className="mx-auto mb-3 flex items-center justify-center">
                                        <SkillIcon skillName={skill.name} size={22} />
                                      </div>
                                      <p className={`portfolio-font-item font-medium text-sm ${isDark ? "text-white" : "text-slate-900"} break-words`}>
                                        {skill.name}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </RevealOnScroll>
                      );
                    })}
                  </div>
                ) : (
                  <RevealOnScroll>
                    <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${isDark ? "border-slate-700 text-slate-500" : "border-slate-300 text-slate-400"}`}>
                      <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">{lang === "en" ? "No skills enteindigo" : "Aucune compétence renseignée"}</p>
                    </div>
                  </RevealOnScroll>
                )}
              </div>
            </section>
          );
        }

        // Section Projects
        if (section.id === "projects") {
          if (formattedProjects.length === 0) {
            return (
              <section key={section.id} id="projects" className={`py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-900/50" : "bg-transparent"}`}>
                <div className={`${sectionMaxNarrow} mx-auto px-4 sm:px-6 lg:px-8`}>
                  <RevealOnScroll>
                    <div className="flex items-center gap-3 mb-10 sm:mb-14">
                      <span className={`w-10 h-1 rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`} aria-hidden />
                      <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {lang === "en" ? "My Projects" : "Mes Projets"}
                      </h2>
                    </div>
                  </RevealOnScroll>
                  <RevealOnScroll>
                    <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDark ? "border-slate-800 bg-slate-900/30 text-slate-500" : "border-slate-200 bg-white/50 text-slate-400"}`}>
                      <Layers size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium mb-2">{lang === "en" ? "Work in progress" : "En cours de préparation"}</p>
                      <p className="text-sm max-w-sm mx-auto opacity-70">
                        {lang === "en" ? "I am currently cataloging my projects. Check back soon!" : "Je suis en train de répertorier mes projets. Revenez bientôt !"}
                      </p>
                    </div>
                  </RevealOnScroll>
                </div>
              </section>
            );
          }

          const renderProjectCard = (project: any, index: number) => (
            <RevealOnScroll key={project.id} delay={index * 100}>
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setProjectModal({
                    title: project.title,
                    category: project.category,
                    description: project.description || (lang === "en" ? "No description available." : "Aucune description."),
                    link: project.link,
                    github: project.github,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProjectModal({
                      title: project.title,
                      category: project.category,
                      description: project.description || (lang === "en" ? "No description available." : "Aucune description."),
                      link: project.link,
                      github: project.github,
                    });
                  }
                }}
                className={`group portfolio-card-project w-full text-left glass-card rounded-lg sm:rounded-xl overflow-hidden border ${isDark ? "border-slate-700/50 bg-slate-800/30" : "border-slate-200 bg-stone-50/90"} h-full min-h-[380px] sm:min-h-[400px] flex flex-col transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer`}
              >
                {/* Image ou Icône : project_icon > url_image > placeholder */}
                <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] overflow-hidden flex-shrink-0">
                  {isEditable && project.project && (
                    <ProjectImageIconEditor
                      project={project.project}
                      onUpdate={refreshProjects}
                      isDark={isDark}
                    />
                  )}
                  {project.icon ? (
                    // Afficher l'icône Lucide - remplir tout l'espace comme les photos
                    <div
                      className={`absolute inset-0 w-full h-full flex items-center justify-center ${isDark ? "bg-slate-800/80" : "bg-slate-100"}`}
                    >
                      {(() => {
                        const IconComponent = (LucideIcons as any)[
                          project.icon
                        ];
                        if (!IconComponent) {
                          return (
                            <LucideIcons.Code
                              className={`w-full h-full p-12 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                              strokeWidth={1.5}
                            />
                          );
                        }
                        return (
                          <IconComponent
                            className={`w-full h-full p-12 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            strokeWidth={1.5}
                          />
                        );
                      })()}
                    </div>
                  ) : project.image ? (
                    <img
                      src={project.image}
                      alt={project.title || "Projet"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${isDark ? "bg-slate-800/80" : "bg-slate-100"}`}
                    >
                      <svg
                        viewBox="0 0 120 80"
                        className="w-24 h-16 sm:w-28 sm:h-20 text-blue-500/60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <rect x="8" y="12" width="104" height="56" rx="4" />
                        <path d="M8 24h104" />
                        <circle cx="16" cy="20" r="2" />
                        <circle cx="22" cy="20" r="2" />
                        <circle cx="28" cy="20" r="2" />
                        <path d="M16 36h24M16 44h32M16 52h20" />
                      </svg>
                    </div>
                  )}
                  {project.category && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                      <span
                        className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${isDark ? "bg-black/60 border-blue-500/30 text-blue-400" : "bg-stone-50/90 border-blue-600/50 text-blue-600"}`}
                      >
                        <span className="hidden sm:inline">
                          {project.category}
                        </span>
                        <span className="sm:hidden">{lang === "en" ? "Project" : "Projet"}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col gap-3 min-h-[160px]">
                  {project.title && (
                    <h3
                      className={`portfolio-font-item text-lg sm:text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    >
                      {project.title}
                    </h3>
                  )}
                  <p
                    className={`portfolio-section-intro ${isDark ? "text-slate-400" : "text-slate-600"} text-sm sm:text-base flex-1 whitespace-pre-line`}
                  >
                    {(project.description || (lang === "en" ? "No description available." : "Aucune description."))
                      .replace(/^-\s+/gm, "→ ")
                      .replace(/\n-\s+/g, "\n→ ")}
                  </p>
                  <span
                    className={`text-sm font-medium mt-auto ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  >
                    {lang === "en" ? "View description →" : "Voir la description →"}
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          );

          return (
            <section
              key={section.id}
              id="projects"
              className={`py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-800/30" : "bg-transparent"}`}
            >
              <div className={`${sectionMaxW} mx-auto px-4 sm:px-6 lg:px-8`}>
                <RevealOnScroll>
                  <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2
                      className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 ${isDark ? "text-slate-100" : "text-slate-900"} px-4`}
                    >
                      {lang === "en" ? "Recent Projects" : "Mes Projets Récents"}
                    </h2>
                  </div>
                </RevealOnScroll>

                {isEditable && onItemOrderChange ? (
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
                    className="portfolio-masonry"
                    strategy="grid"
                    renderItem={renderProjectCard}
                  />
                ) : (
                  <div className="portfolio-masonry">
                    {formattedProjects.map((project, index) =>
                      renderProjectCard(project, index),
                    )}
                  </div>
                )}
              </div>

              {/* Modal projet : description complète + liens */}
              {projectModal && (
                <>
                  <div
                    className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                    onClick={() => setProjectModal(null)}
                    aria-hidden
                  />
                  <div
                    className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl ${isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"} p-6 sm:p-8`}
                    role="dialog"
                    aria-modal
                    aria-labelledby="project-modal-title"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2
                        id="project-modal-title"
                        className={`text-xl sm:text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        {projectModal.title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setProjectModal(null)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                        aria-label={lang === "en" ? "Close" : "Fermer"}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    {projectModal.category && (
                      <p
                        className={`text-sm font-medium mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                      >
                        {projectModal.category}
                      </p>
                    )}
                    <p
                      className={`text-base leading-relaxed whitespace-pre-wrap mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {projectModal.description
                        .replace(/^-\s+/gm, "→ ")
                        .replace(/\n-\s+/g, "\n→ ")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {projectModal.github && (
                        <a
                          href={projectModal.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
                        >
                          {String(projectModal.github).toLowerCase().endsWith(".pdf") ? (
                            <>
                              <LucideIcons.FileText size={18} /> {lang === "en" ? "Proof of Publication" : "Preuve de Publication"}
                            </>
                          ) : (
                            <>
                              <Github size={18} /> {lang === "en" ? "Source code" : "Code source"}
                            </>
                          )}
                        </a>
                      )}
                      {projectModal.link && (
                        <a
                          href={projectModal.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                        >
                          {String(projectModal.link).toLowerCase().endsWith(".pdf") ? (
                            <>
                              <LucideIcons.FileText size={18} /> {String(projectModal.title).toLowerCase().includes("vel express") ? (lang === "en" ? "View Menu" : "Voir le menu") : (lang === "en" ? "View Document" : "Voir le document")}
                            </>
                          ) : (
                            <>
                              <ExternalLink size={18} /> {lang === "en" ? "View website" : "Voir le site"}
                            </>
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          );
        }

        // Section Experiences (Timeline verticale — design épuré et lisible)
        if ((section.id === "experiences" || section.id === "experience") && experiences.length > 0) {
          return (
            <section
              key={section.id}
              id={section.id}
              className={`py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-800/30" : "bg-transparent"}`}
            >
              <div
                className={`${sectionMaxNarrow} mx-auto px-4 sm:px-6 lg:px-8`}
              >
                <RevealOnScroll>
                  <div className="flex items-center gap-3 mb-10 sm:mb-14">
                    <span
                      className={`w-10 h-1 rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
                      aria-hidden
                    />
                    <h2
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    >
                      {lang === "en" ? "Work Experience" : "Expériences Professionnelles"}
                    </h2>
                  </div>
                </RevealOnScroll>
                <div className="relative pl-4 sm:pl-6">
                  {/* Ligne verticale avec dégradé */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-px rounded-full"
                    style={{
                      background: isDark
                        ? "linear-gradient(to bottom, rgb(249 115 22 / 0.5), rgb(148 163 184 / 0.4), rgb(148 163 184 / 0.2))"
                        : "linear-gradient(to bottom, rgb(234 88 12 / 0.6), rgb(203 213 225 / 0.5), rgb(226 232 240 / 0.3))",
                    }}
                    aria-hidden
                  />
                  <div className="space-y-8 sm:space-y-10">
                    {experiences.map((exp, index) => {
                      let descriptionItems: string[] = [];
                      if (
                        exp.achievements &&
                        Array.isArray(exp.achievements) &&
                        exp.achievements.length > 0
                      ) {
                        descriptionItems = exp.achievements;
                      } else if (exp.description) {
                        // Split by newline to handle structuindigo descriptions
                        descriptionItems = exp.description
                          .split("\n")
                          .filter((line) => line.trim().length > 0);
                      }
                      
                      const safeDate = (
                        d: string | null | undefined,
                      ): string => {
                        if (!d) return "—";
                        const date = new Date(d);
                        return Number.isNaN(date.getTime())
                          ? "—"
                          : date.toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
                              month: "short",
                              year: "numeric",
                            });
                      };
                      const startStr = safeDate(exp.start_date);
                      const endStr = exp.is_current
                        ? (lang === "en" ? "Present" : "Présent")
                        : safeDate(exp.end_date);
                      const dateStr =
                        exp.end_date || exp.is_current
                          ? `${startStr} - ${endStr}`
                          : startStr;

                      return (
                        <RevealOnScroll
                          key={exp.id || index}
                          delay={index * 100}
                        >
                          <div className="relative flex gap-8 sm:gap-10 md:gap-12 group">
                            {/* Nœud timeline : bulle avec icône + date en dessous */}
                            <div className="relative z-10 flex-shrink-0 flex flex-col items-center gap-3 min-w-[100px]">
                              <div
                                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg ${
                                  isDark
                                    ? "bg-slate-800/80 border border-white/10 text-blue-400 group-hover:border-blue-500/50"
                                    : "bg-white border border-slate-200 text-blue-600 group-hover:border-blue-400"
                                }`}
                              >
                                {exp.logo_url ? (
                                  <img
                                    src={exp.logo_url}
                                    alt={exp.company}
                                    className="w-full h-full object-contain rounded-2xl"
                                  />
                                ) : (
                                  <Briefcase
                                    className="w-7 h-7"
                                    strokeWidth={1.5}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center leading-tight w-full px-0.5 ${isDark ? "text-slate-500 group-hover:text-blue-400" : "text-slate-400 group-hover:text-blue-600"} transition-colors duration-500`}
                              >
                                {dateStr}
                              </span>
                            </div>
                            {/* Carte contenu - Glass Premium */}
                            <div
                              className={`flex-1 min-w-0 glass-premium rounded-3xl p-6 sm:p-8 transition-all duration-500 hover-glow group-hover:-translate-y-1`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex items-start gap-5 flex-1 min-w-0">
                                  <div className="min-w-0 flex-1">
                                    <h3
                                      className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                                    >
                                      {exp.title || (lang === "en" ? "Position" : "Poste")}
                                    </h3>
                                    <p
                                      className={`text-base sm:text-lg font-semibold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500`}
                                    >
                                      {exp.company || (lang === "en" ? "Company" : "Entreprise")}
                                      {exp.location && (
                                        <span
                                          className={`font-normal ml-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                                        >
                                          · {exp.location}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {exp.is_current && (
                                  <span
                                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex-shrink-0 ${
                                      isDark
                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                        : "bg-blue-50 text-blue-600 border border-blue-100"
                                    }`}
                                  >
                                    {lang === "en" ? "Current" : "En cours"}
                                  </span>
                                )}
                              </div>
                              
                              {descriptionItems.length > 0 && (
                                <ul
                                  className={`mt-6 space-y-4 ${isDark ? "text-slate-400" : "text-slate-600"} text-sm sm:text-base`}
                                >
                                  {descriptionItems.map((item, i) => {
                                    const trimmedItem = item.trim();
                                    const isBullet = trimmedItem.startsWith("-");
                                    const isHeader = !isBullet && !trimmedItem.includes(":") && trimmedItem.length < 60;
                                    const cleanItem = isBullet ? trimmedItem.substring(1).trim() : trimmedItem;

                                    if (isHeader) {
                                      return (
                                        <li key={i} className="pt-2 first:pt-0 list-none">
                                          <span className={`font-bold text-base sm:text-lg ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                            {cleanItem}
                                          </span>
                                        </li>
                                      );
                                    }

                                    return (
                                      <li
                                        key={i}
                                        className="flex items-start gap-3 group/item"
                                      >
                                        <LucideIcons.CheckCircle
                                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-blue-500/60" : "text-blue-500"} group-hover/item:scale-110 transition-transform`}
                                          strokeWidth={2}
                                          aria-hidden
                                        />
                                        <span className="leading-relaxed">
                                          {(cleanItem.includes(" : ") || cleanItem.includes(": ")) ? (
                                            <>
                                              <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                                {cleanItem.split(":")[0]}:
                                              </span>
                                              {cleanItem.split(":").slice(1).join(":")}
                                            </>
                                          ) : (
                                            cleanItem
                                          )}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </div>
                        </RevealOnScroll>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Section Education
        if (section.id === "education" && educations.length > 0) {
          return (
            <section
              key={section.id}
              id="education"
              className={`py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-900/50" : "bg-transparent"}`}
            >
              <div className={`${sectionMaxNarrow} mx-auto px-4 sm:px-6 lg:px-8`}>
                <RevealOnScroll>
                  <div className="flex items-center gap-3 mb-10 sm:mb-14">
                    <span className={`w-10 h-1 rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`} aria-hidden />
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {lang === "en" ? "Education" : "Formation"}
                    </h2>
                  </div>
                </RevealOnScroll>
                <div className="space-y-6">
                  {educations.map((edu, index) => {
                    const safeEduDate = (d: string | null | undefined): string => {
                      if (!d) return "";
                      const date = new Date(d);
                      return Number.isNaN(date.getTime())
                        ? ""
                        : date.toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
                            month: "long",
                            year: "numeric",
                          });
                    };

                    const startStr = safeEduDate(edu.start_date);
                    const endStr = edu.is_current
                      ? (lang === "en" ? "Present" : "Présent")
                      : safeEduDate(edu.end_date);

                    const yearStr = (edu.end_date || edu.is_current)
                      ? `${startStr} - ${endStr}`
                      : startStr;

                    const educationDescriptionItems = edu.description
                      ? edu.description.split("\n").filter(l => l.trim().length > 0)
                      : [];

                    return (
                      <RevealOnScroll key={edu.id || index} delay={index * 150}>
                        <div
                          className={`p-6 sm:p-8 rounded-3xl relative overflow-hidden hover-glow transition-all duration-500 group ${isDark ? "glass-premium" : "bg-white border border-slate-200"}`}
                        >
                          <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-700" />
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-6 flex-1">
                              {edu.logo_url && (
                                <div
                                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg flex-shrink-0 ${
                                    isDark
                                      ? "bg-slate-800/80 border border-white/10"
                                      : "bg-white border border-slate-200"
                                  }`}
                                >
                                  <img
                                    src={edu.logo_url}
                                    alt={edu.school}
                                    className="w-full h-full object-contain rounded-2xl"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3
                                  className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}
                                >
                                  {edu.school || "École"}
                                </h3>
                                <p
                                  className={`text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-2`}
                                >
                                  {edu.degree || "Diplôme"}
                                </p>
                                {edu.field_of_study && (
                                  <p
                                    className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"} mb-3 font-medium uppercase tracking-wider`}
                                  >
                                    {edu.field_of_study}
                                  </p>
                                )}
                                {educationDescriptionItems.length > 0 && (
                                  <ul
                                    className={`mt-4 space-y-4 ${isDark ? "text-slate-400" : "text-slate-600"} text-sm sm:text-base`}
                                  >
                                    {educationDescriptionItems.map((item, i) => {
                                      const trimmedItem = item.trim();
                                      const isBullet = trimmedItem.startsWith("-");
                                      const isHeader = !isBullet && !trimmedItem.includes(":") && trimmedItem.length < 60;
                                      const cleanItem = isBullet ? trimmedItem.substring(1).trim() : trimmedItem;

                                      if (isHeader) {
                                        return (
                                          <li key={i} className="pt-2 first:pt-0 list-none">
                                            <span className={`font-bold text-base sm:text-lg ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                              {cleanItem}
                                            </span>
                                          </li>
                                        );
                                      }

                                      return (
                                        <li
                                          key={i}
                                          className="flex items-start gap-3 group/item"
                                        >
                                          <LucideIcons.CheckCircle
                                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-blue-500/60" : "text-blue-500"} group-hover/item:scale-110 transition-transform`}
                                            strokeWidth={2}
                                            aria-hidden
                                          />
                                          <span className="leading-relaxed">
                                            {(cleanItem.includes(" : ") || cleanItem.includes(": ")) ? (
                                              <>
                                                <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                                  {cleanItem.split(":")[0]}:
                                                </span>
                                                {cleanItem.split(":").slice(1).join(":")}
                                              </>
                                            ) : (
                                              cleanItem
                                            )}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            </div>
                            <span
                              className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"} whitespace-nowrap bg-white/5 px-4 py-2 rounded-xl border border-white/5`}
                            >
                              {yearStr}
                            </span>
                          </div>
                        </div>
                      </RevealOnScroll>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // Section Langues — grille cartes style HUD (couleurs Template 1 : blue/rouge) — affichée même vide
        if (section.id === "languages") {
          return (
            <section
              key={section.id}
              id="languages"
              className={`relative z-10 py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-900/50" : "bg-transparent"}`}
            >
              <div
                className={`${sectionMaxNarrow} mx-auto px-6 sm:px-8 lg:px-10`}
              >
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
                  <RevealOnScroll>
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap
                          className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        />
                        <span
                          className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          {lang === "en" ? "Linguistic Proficiency" : "Maîtrise linguistique"}
                        </span>
                      </div>
                      <h2
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        {lang === "en" ? "Languages" : "Langues"}
                      </h2>
                      <p
                        className={`portfolio-section-intro text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {lang === "en"
                          ? "Spoken languages and level of proficiency for international collaboration."
                          : "Langues parlées et niveau de maîtrise pour une collaboration internationale."}
                      </p>
                    </div>
                  </RevealOnScroll>
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
                      className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
                      strategy="grid"
                      buttonSize="small"
                      renderItem={(lang: Language, index: number) => {
                        const code =
                          (lang.name || "").slice(0, 2).toUpperCase() || "—";
                        return (
                          <RevealOnScroll
                            key={lang.id || index}
                            delay={index * 80}
                          >
                            <div
                              className={`group relative rounded-2xl backdrop-blur-sm border p-5 sm:p-6 min-w-0 transition-all duration-300 hover:-translate-y-1 ${isDark ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/10" : "bg-stone-50/90 hover:bg-white border-slate-200 hover:border-blue-200 shadow-sm"}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div
                                  className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden ${isDark ? "bg-slate-800 border border-white/10 text-slate-400 group-hover:text-blue-400" : "bg-slate-100 border border-slate-200 text-slate-600 group-hover:text-blue-600"}`}
                                >
                                  {lang.code === 'ta' ? (
                                    <span className="text-2xl pt-1">த</span>
                                  ) : lang.code ? (
                                    <img 
                                      src={`/icons/languages/${lang.code}.svg`}
                                      alt={lang.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerText = code;
                                      }}
                                    />
                                  ) : (
                                    code
                                  )}
                                </div>
                                <Zap
                                  className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100" : "text-slate-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100"} transition-opacity`}
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h3
                                  className={`portfolio-font-item text-lg font-semibold break-words ${isDark ? "text-white group-hover:text-blue-100" : "text-slate-900 group-hover:text-blue-800"}`}
                                >
                                  {lang.name}
                                </h3>
                                {lang.level &&
                                  String(lang.level).trim() &&
                                  !/^not\s*specified$/i.test(
                                    String(lang.level).trim(),
                                  ) && (
                                    <p
                                      className={`text-xs uppercase tracking-wider break-words ${isDark ? "text-slate-500 group-hover:text-slate-400" : "text-slate-500"}`}
                                    >
                                      {lang.level}
                                    </p>
                                  )}
                              </div>
                              <div
                                className={`absolute top-0 right-0 p-2 opacity-20 ${isDark ? "" : "border-slate-300"}`}
                              >
                                <div
                                  className={`w-2 h-2 border-t border-r ${isDark ? "border-white" : "border-slate-400"}`}
                                />
                              </div>
                            </div>
                          </RevealOnScroll>
                        );
                      }}
                    />
                  ) : (
                    <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                      {orderedLanguages.length > 0 ? (
                        orderedLanguages.map((lang, index) => {
                          const code =
                            (lang.name || "").slice(0, 2).toUpperCase() || "—";
                          return (
                            <RevealOnScroll
                              key={lang.id || index}
                              delay={index * 80}
                            >
                              <div
                                className={`group relative rounded-2xl backdrop-blur-sm border p-5 sm:p-6 min-w-0 transition-all duration-300 hover:-translate-y-1 ${isDark ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/10" : "bg-stone-50/90 hover:bg-white border-slate-200 hover:border-blue-200 shadow-sm"}`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div
                                    className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${isDark ? "bg-slate-800 border border-white/10 text-slate-400 group-hover:text-blue-400" : "bg-slate-100 border border-slate-200 text-slate-600 group-hover:text-blue-600"}`}
                                  >
                                    {lang.code === 'ta' ? (
                                      <span className="text-xl pt-1">த</span>
                                    ) : lang.code ? (
                                      <img 
                                        src={`/icons/languages/${lang.code}.svg`}
                                        alt={lang.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          (e.target as HTMLImageElement).parentElement!.innerText = code;
                                        }}
                                      />
                                    ) : (
                                      code
                                    )}
                                  </div>
                                  <Zap
                                    className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100" : "text-slate-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100"} transition-opacity`}
                                  />
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <h3
                                    className={`portfolio-font-item text-lg font-semibold break-words ${isDark ? "text-white group-hover:text-blue-100" : "text-slate-900 group-hover:text-blue-800"}`}
                                  >
                                    {lang.name}
                                  </h3>
                                  {lang.level &&
                                    String(lang.level).trim() &&
                                    !/^not\s*specified$/i.test(
                                      String(lang.level).trim(),
                                    ) && (
                                      <p
                                        className={`text-xs uppercase tracking-wider break-words ${isDark ? "text-slate-500 group-hover:text-slate-400" : "text-slate-500"}`}
                                      >
                                        {lang.level}
                                      </p>
                                    )}
                                </div>
                                <div
                                  className={`absolute top-0 right-0 p-2 opacity-20 ${isDark ? "" : "border-slate-300"}`}
                                >
                                  <div
                                    className={`w-2 h-2 border-t border-r ${isDark ? "border-white" : "border-slate-400"}`}
                                  />
                                </div>
                              </div>
                            </RevealOnScroll>
                          );
                        })
                      ) : (
                        <div
                          className={`col-span-full rounded-2xl border border-dashed p-8 text-center ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50"}`}
                        >
                          <Zap
                            className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          />
                          <p
                            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                          >
                            {lang === "en" 
                              ? "No languages recorded. Add them to your profile." 
                              : "Aucune langue renseignée. Ajoutez-en dans votre profil."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // Section Certifications — liste style HUD (couleurs Template 1 : blue/rouge) — affichée même vide
        if (section.id === "certifications") {
          return (
            <section
              key={section.id}
              id="certifications"
              className={`relative z-10 py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-900/30" : "bg-white/50"}`}
            >
              <div
                className={`${sectionMaxNarrow} mx-auto px-6 sm:px-8 lg:px-10`}
              >
                <div className="flex flex-col lg:flex-row-reverse gap-10 lg:gap-14 items-start">
                  <RevealOnScroll>
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-3 lg:text-right">
                      <h2
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        Certifications
                      </h2>
                    </div>
                  </RevealOnScroll>
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
                      className="w-full min-w-0 space-y-4"
                      buttonSize="small"
                      renderItem={(cert: Certification, index: number) => (
                        <RevealOnScroll
                          key={cert.id || index}
                          delay={index * 80}
                        >
                          <div
                            className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 rounded-xl border transition-all duration-300 ${isDark ? "bg-white/[0.02] border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04]" : "bg-stone-50/90 border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
                          >
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "bg-blue-500" : "bg-blue-500"}`}
                            />
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              <div
                                className={`p-3 flex-shrink-0 rounded-full transition-transform duration-300 ${isDark ? "bg-white/5 text-blue-300 group-hover:scale-110" : "bg-blue-50 text-blue-600 group-hover:scale-110"}`}
                              >
                                <Award className="w-6 h-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`portfolio-font-item text-base sm:text-lg font-medium break-words ${isDark ? "text-white group-hover:text-blue-200" : "text-slate-900 group-hover:text-blue-800"}`}
                                >
                                  {cert.name}
                                </h4>
                                <p
                                  className={`text-sm break-words ${isDark ? "text-slate-500" : "text-slate-600"}`}
                                >
                                  {cert.issuer} •{" "}
                                  <span
                                    className={`font-mono text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}
                                  >
                                    {cert.date_obtained
                                      ? new Date(
                                          cert.date_obtained,
                                        ).getFullYear()
                                      : "—"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 pl-12 sm:pl-0">
                              {cert.url && (
                                <a
                                  href={cert.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 ${
                                    isDark
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40"
                                      : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:border-blue-200"
                                  }`}
                                >
                                  <LucideIcons.FileText size={14} className="flex-shrink-0" />
                                  {lang === "en" ? "CONSULT" : "CONSULTER"}
                                </a>
                              )}
                            </div>
                          </div>
                        </RevealOnScroll>
                      )}
                    />
                  ) : (
                    <div className="w-full min-w-0 space-y-4">
                      {orderedCertifications.length > 0 ? (
                        orderedCertifications.map((cert, index) => (
                          <RevealOnScroll
                            key={cert.id || index}
                            delay={index * 80}
                          >
                            <div
                              className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 rounded-xl border transition-all duration-300 ${isDark ? "bg-white/[0.02] border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04]" : "bg-stone-50/90 border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
                            >
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "bg-blue-500" : "bg-blue-500"}`}
                              />
                              <div className="flex items-start gap-4 min-w-0 flex-1">
                                <div
                                  className={`p-3 flex-shrink-0 rounded-full transition-transform duration-300 ${isDark ? "bg-white/5 text-blue-300 group-hover:scale-110" : "bg-blue-50 text-blue-600 group-hover:scale-110"}`}
                                >
                                  <Award className="w-6 h-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4
                                    className={`portfolio-font-item text-base sm:text-lg font-medium break-words ${isDark ? "text-white group-hover:text-blue-200" : "text-slate-900 group-hover:text-blue-800"}`}
                                  >
                                    {cert.name}
                                  </h4>
                                  <p
                                    className={`text-sm break-words ${isDark ? "text-slate-500" : "text-slate-600"}`}
                                  >
                                    {cert.issuer} •{" "}
                                    <span
                                      className={`font-mono text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}
                                    >
                                      {cert.date_obtained
                                        ? new Date(
                                            cert.date_obtained,
                                          ).getFullYear()
                                        : "—"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 pl-12 sm:pl-0">
                                {cert.url && (
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 ${
                                      isDark
                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40"
                                        : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:border-blue-200"
                                    }`}
                                  >
                                    <LucideIcons.FileText size={14} className="flex-shrink-0" />
                                    {lang === "en" ? "VIEW" : "CONSULTER"}
                                  </a>
                                )}
                              </div>
                            </div>
                          </RevealOnScroll>
                        ))
                      ) : (
                        <div
                          className={`rounded-xl border border-dashed p-6 text-center ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50"}`}
                        >
                          <Award
                            className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          />
                          <p
                            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                          >
                            Aucune certification renseignée. Ajoutez-en dans
                            votre profil.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // Section Centres d'intérêt / Passions — affichée même vide
        if (section.id === "interests") {
          return (
            <section
              key={section.id}
              id="interests"
              className={`relative z-10 py-12 sm:py-16 lg:py-24 ${isDark ? "bg-slate-800/30" : "bg-stone-200/60"}`}
            >
              <div
                className={`${sectionMaxNarrow} mx-auto px-6 sm:px-8 lg:px-10`}
              >
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
                  <RevealOnScroll>
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart
                          className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        />
                        <span
                          className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          {lang === "en" ? "Passions & Interests" : "Passions & centres d'intérêt"}
                        </span>
                      </div>
                      <h2
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        {lang === "en" ? "What drives me" : "Ce qui me motive"}
                      </h2>
                      <p
                        className={`portfolio-section-intro text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {lang === "en"
                           ? "Fields and topics that fuel my curiosity and daily motivation."
                           : "Domaines et sujets qui nourrissent ma curiosité et ma motivation au quotidien."}
                      </p>
                    </div>
                  </RevealOnScroll>
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
                        <RevealOnScroll
                          key={interest.id || index}
                          delay={index * 60}
                        >
                          <span
                            className={`portfolio-font-item group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${isDark ? "bg-white/[0.03] border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] text-slate-200" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-800"}`}
                          >
                            <Heart
                              className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-500"}`}
                            />
                            {interest.name}
                          </span>
                        </RevealOnScroll>
                      )}
                    />
                  ) : (
                    <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orderedInterests && orderedInterests.length > 0 ? (
                        orderedInterests.map((interest, index) => (
                          <RevealOnScroll
                            key={interest.id || index}
                            delay={index * 60}
                          >
                            <div
                              className={`group relative flex gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isDark ? "bg-white/[0.03] border-white/5 hover:border-blue-500/30 hover:bg-white/[0.06]" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
                            >
                              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                                {(interest as any).icon || "❤️"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className={`portfolio-font-item font-semibold text-sm sm:text-base mb-1 ${isDark ? "text-white group-hover:text-blue-200" : "text-slate-900 group-hover:text-blue-700"}`}>
                                  {interest.name}
                                </h4>
                                {(interest as any).description && (
                                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    {(interest as any).description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </RevealOnScroll>
                        ))
                      ) : (
                        <div
                          className={`rounded-xl border border-dashed p-6 text-center ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50"}`}
                        >
                          <Heart
                            className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          />
                          <p
                            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
                          >
                            {lang === "en"
                              ? "No interests recorded. Add them to your profile."
                              : "Aucun centre d'intérêt renseigné. Ajoutez-en dans votre profil."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // Section Contact (Glassmorphism renforcé - Minimal Futuriste)
        if (section.id === "contact") {
          return (
            <section
              key={section.id}
              id="contact"
              className={`py-12 sm:py-16 lg:py-24 relative overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
            >
              {/* Decorative background - Responsive */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] ${isDark ? "bg-blue-600/10" : "bg-blue-200/30"} rounded-full filter blur-3xl -z-10 pointer-events-none`}
              ></div>
              <div
                className={`${sectionMaxContact} mx-auto px-4 sm:px-6 lg:px-8`}
              >
                <RevealOnScroll>
                  <div
                    className={`rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center border ${isDark ? "border-slate-700/80 bg-slate-800/40" : "border-slate-200/80 bg-white/70"} shadow-2xl backdrop-blur-xl`}
                  >
                    <h2
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-8 ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    >
                      {lang === "en" ? "Want to contact me?" : "Vous voulez me contacter ?"}
                    </h2>
                    <p
                      className={`text-lg sm:text-xl ${isDark ? "text-slate-300" : "text-slate-700"} mb-10`}
                    >
                      {lang === "en"
                        ? "Send a message to this email:"
                        : "Envoyez un message à cet email :"}{" "}
                      <a
                        href="mailto:djaganadane16@gmail.com"
                        className="font-bold text-blue-500 hover:text-blue-400 transition-colors break-all"
                      >
                        djaganadane16@gmail.com
                      </a>
                    </p>
                    <div className="flex justify-center">
                      <a
                        href="mailto:djaganadane16@gmail.com"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1 flex items-center gap-3"
                      >
                        {lang === "en" ? "Send an email" : "Envoyer un email"}{" "}
                        <Send size={20} />
                      </a>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* --- Footer --- (police description = .portfolio-footer-text) */}
      <footer
        className={`portfolio-footer-text py-6 sm:py-8 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"} text-center px-4`}
      >
        <p
          className={`${isDark ? "text-slate-500" : "text-slate-400"} text-xs sm:text-sm`}
        >
          © {new Date().getFullYear()} {fullName}. {lang === "en" ? "Designed and developed with" : "Conçu et développé avec"}{" "}
          <span className="text-indigo-500">❤</span> {lang === "en" ? "and React" : "et React"}.
        </p>
        {(fullName || email || profile?.phone) && (
          <p
            className={`${isDark ? "text-slate-500" : "text-slate-400"} text-xs mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1`}
          >
            {fullName && <span>{fullName}</span>}
            {email && (
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
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
    </div>
  );
};
