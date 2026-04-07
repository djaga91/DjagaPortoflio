import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Palette,
  Grid,
  List,
  RotateCcw,
  Move,
  Check,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Upload,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Image,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { portfolioAPI, API_URL } from "../../services/api";
import { getAbsoluteImageUrl } from "../../utils/imageUrl";
import { resizeImageFile } from "../../utils/resizeImage";
import { CVSelector } from "./CVSelector";
import {
  PRESET_FONTS,
  type FontRole,
  type CustomFontItem,
} from "./templates/templateUtils";

/** Template 4 : les 4 blocs réordonnables (sans "about" qui est toujours en premier). */
const TEMPLATE4_BIG_BLOCK_IDS = [
  "experiences",
  "projects",
  "stack",
  "contact",
] as const;
type Template4BigBlockId = (typeof TEMPLATE4_BIG_BLOCK_IDS)[number];

const TEMPLATE4_BIG_LABELS: Record<Template4BigBlockId, string> = {
  experiences: "Expériences",
  projects: "Projets",
  stack: "Formation & Compétences",
  contact: "Contact",
};

/** Template 4 : petites sections (visibilité uniquement, pas de drag). */
const TEMPLATE4_SMALL_SECTIONS: Array<{ id: string; label: string }> = [
  { id: "education", label: "Formation" },
  { id: "skills", label: "Compétences" },
  { id: "languages", label: "Langues" },
  { id: "certifications", label: "Certifications" },
  { id: "interests", label: "Centres d'intérêt" },
];

const STACK_SECTION_IDS = [
  "education",
  "skills",
  "languages",
  "certifications",
  "interests",
];

/** Déduit l'ordre des 4 blocs template 4 à partir de templateCustomization.sections. */
function getTemplate4BigBlockOrder(
  sections: Array<{ id: string }>,
): Template4BigBlockId[] {
  const seen = new Set<Template4BigBlockId>();
  const order: Template4BigBlockId[] = [];
  for (const s of sections) {
    let block: Template4BigBlockId | null = null;
    if (s.id === "experiences") block = "experiences";
    else if (s.id === "projects") block = "projects";
    else if (s.id === "contact") block = "contact";
    else if (STACK_SECTION_IDS.includes(s.id)) block = "stack";
    if (block && !seen.has(block)) {
      seen.add(block);
      order.push(block);
    }
  }
  for (const b of TEMPLATE4_BIG_BLOCK_IDS) {
    if (!seen.has(b)) order.push(b);
  }
  return order;
}

const DEFAULT_TEMPLATE5_COLUMN_ORDER = {
  educationCertifications: "education_left" as const,
  languagesInterests: "languages_left" as const,
};

/** Template 5 : les 7 blocs réordonnables (sous-sections regroupées, pas déplaçables séparément). */
const TEMPLATE5_BLOCK_IDS = [
  "about",
  "experiences",
  "education_certifications",
  "projects",
  "skills",
  "languages_interests",
  "contact",
] as const;
type Template5BlockId = (typeof TEMPLATE5_BLOCK_IDS)[number];

const TEMPLATE5_BLOCK_LABELS: Record<Template5BlockId, string> = {
  about: "À propos",
  experiences: "Expériences",
  education_certifications: "Formation & Certifications",
  projects: "Projets",
  skills: "Compétences",
  languages_interests: "Langues & Centres d'intérêt",
  contact: "Contact",
};

/** Déduit l'ordre des 7 blocs template 5 à partir des 9 sections. */
function getTemplate5BlockOrder(
  sections: Array<{ id: string }>,
): Template5BlockId[] {
  const seen = new Set<Template5BlockId>();
  const order: Template5BlockId[] = [];
  for (const s of sections) {
    if (s.id === "about") {
      if (!seen.has("about")) {
        seen.add("about");
        order.push("about");
      }
      continue;
    }
    if (s.id === "education" || s.id === "certifications") {
      if (!seen.has("education_certifications")) {
        seen.add("education_certifications");
        order.push("education_certifications");
      }
      continue;
    }
    if (s.id === "languages" || s.id === "interests") {
      if (!seen.has("languages_interests")) {
        seen.add("languages_interests");
        order.push("languages_interests");
      }
      continue;
    }
    const t5Single: Template5BlockId[] = [
      "experiences",
      "projects",
      "skills",
      "contact",
    ];
    if (t5Single.includes(s.id as Template5BlockId)) {
      order.push(s.id as Template5BlockId);
      seen.add(s.id as Template5BlockId);
    }
  }
  for (const b of TEMPLATE5_BLOCK_IDS) {
    if (!seen.has(b)) order.push(b);
  }
  return order;
}

/** Section Polices pour templates 1–5 : titre, sous-titres, gros item, petit item, description */
const FONT_ROLES: { key: FontRole; label: string }[] = [
  { key: "titles", label: "Titre (présentation CV)" },
  { key: "subtitles", label: "Sous-titres (sections, accroche)" },
  {
    key: "item",
    label: "Gros item (poste, école, projet, compétence, langue, certif)",
  },
  { key: "itemSmall", label: "Petit item (entreprise, type de formation)" },
  { key: "body", label: "Description (reste du texte)" },
];

const FontsSection: React.FC<{
  templateFonts?: {
    titles?: string;
    subtitles?: string;
    item?: string;
    itemSmall?: string;
    body?: string;
  };
  customFonts: CustomFontItem[];
  updateTemplateCustomization: (
    u: Partial<{
      templateFonts: {
        titles?: string;
        subtitles?: string;
        item?: string;
        itemSmall?: string;
        body?: string;
      };
      customFonts: CustomFontItem[];
    }>,
  ) => void;
  setActiveToast: (
    t: { type: "success" | "error"; title: string; message: string } | null,
  ) => void;
}> = ({
  templateFonts,
  customFonts,
  updateTemplateCustomization,
  setActiveToast,
}) => {
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Charger les Google Fonts utilisées
  useEffect(() => {
    const ids = new Set<string>();
    FONT_ROLES.forEach(({ key }) => {
      const val = templateFonts?.[key];
      if (val) {
        const preset = PRESET_FONTS.find((p) => p.id === val || p.name === val);
        if (preset?.googleFontId) ids.add(preset.googleFontId);
      }
    });
    ids.forEach((googleFontId) => {
      const existing = document.querySelector(
        `link[href*="fonts.googleapis.com"][href*="${googleFontId}"]`,
      );
      if (existing) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${googleFontId}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [templateFonts]);

  const allFontOptions = [
    ...PRESET_FONTS.map((p) => ({
      value: p.id,
      label: p.name,
      type: "preset" as const,
    })),
    ...customFonts.map((c) => ({
      value: c.name,
      label: `${c.name} (importée)`,
      type: "custom" as const,
    })),
  ];

  const handleFontChange = (role: FontRole, value: string) => {
    updateTemplateCustomization({
      templateFonts: { ...templateFonts, [role]: value || undefined },
    });
  };

  const handleImportFont = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (![".ttf", ".otf"].some((x) => file.name?.toLowerCase().endsWith(x))) {
      setActiveToast({
        title: "Erreur",
        message: "Format accepté : .ttf ou .otf",
        type: "error",
      });
      return;
    }
    e.target.value = "";
    setUploading(true);
    try {
      const { url, suggestedName } = await portfolioAPI.uploadFont(file);
      const baseUrl = API_URL.replace(/\/$/, "");
      const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
      const newFont: CustomFontItem = {
        id: `custom-${Date.now()}`,
        name: suggestedName || "Ma police",
        url: fullUrl,
      };
      const nextCustom = [...(customFonts || []), newFont];
      updateTemplateCustomization({
        customFonts: nextCustom,
        templateFonts: {
          ...templateFonts,
          body: templateFonts?.body || newFont.name,
        },
      });
      setActiveToast({
        type: "success",
        title: "Police importée",
        message: `"${newFont.name}" est disponible et appliquée aux paragraphes.`,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      const message =
        status === 404
          ? "Route upload-font introuvable. Vérifiez que le backend est démarré et à jour (POST /api/portfolio/upload-font)."
          : (typeof detail === "string" ? detail : detail?.message) ||
            "Erreur lors de l'import.";
      setActiveToast({ type: "error", title: "Import impossible", message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Type size={12} /> Polices
      </label>
      <p className="text-[10px] text-slate-400">
        Titre / Sous-titres / Gros item / Petit item / Description (templates
        1–6)
      </p>
      {FONT_ROLES.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block">
            {label}
          </label>
          <select
            value={templateFonts?.[key] ?? ""}
            onChange={(e) => handleFontChange(key, e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="">Par défaut (selon thème)</option>
            {allFontOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div>
        <input
          ref={fontInputRef}
          type="file"
          accept=".ttf,.otf"
          className="hidden"
          onChange={handleImportFont}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fontInputRef.current?.click()}
          className="flex items-center gap-2 w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Upload size={14} />{" "}
          {uploading ? "Import en cours…" : "Importer une police (.ttf / .otf)"}
        </button>
      </div>
    </div>
  );
};

export const PortfolioToolbar: React.FC = () => {
  const {
    selectedTemplateId,
    templateCustomization,
    updateTemplateCustomization,
    toggleSection,
    reorderSections,
    reorderBigSectionsTemplate4,
    reorderSectionsTemplate5,
    resetTemplateCustomization,
    experiences,
    educations,
    projects,
    skills,
    languages,
    certifications,
    interests,
    portfolioTemplateOverrides,
    setPortfolioTemplateOverrides,
    setActiveToast,
  } = useGameStore();
  const isTemplate4 = selectedTemplateId === "template4";
  const isTemplate5 = selectedTemplateId === "template5";
  const isTemplate6 = selectedTemplateId === "template6";
  const isTemplate1To5 = [
    "template1",
    "template2",
    "template3",
    "template4",
    "template5",
  ].includes(selectedTemplateId ?? "");
  const t5Col =
    templateCustomization.template5ColumnOrder ??
    DEFAULT_TEMPLATE5_COLUMN_ORDER;
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggingItemIndex, setDraggingItemIndex] = useState<number | null>(
    null,
  );
  /** Template 4 : index parmi les 4 blocs réordonnables (0 = experiences, 1 = projects, 2 = stack, 3 = contact). */
  const [draggingBigIndex, setDraggingBigIndex] = useState<number | null>(null);
  /** Template 5 : index parmi les 7 blocs réordonnables. */
  const [draggingT5Index, setDraggingT5Index] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const [isUploadingHeroBackground, setIsUploadingHeroBackground] =
    useState(false);
  const heroBackgroundInputRef = useRef<HTMLInputElement>(null);

  const dragRef = useRef<HTMLDivElement>(null);

  /** Template 4 : ordre actuel des 4 blocs (experiences, projects, stack, contact). */
  const template4BigOrder = useMemo(
    () => getTemplate4BigBlockOrder(templateCustomization.sections),
    [templateCustomization.sections],
  );
  /** Template 5 : ordre actuel des 7 blocs. */
  const template5BlockOrder = useMemo(
    () => getTemplate5BlockOrder(templateCustomization.sections),
    [templateCustomization.sections],
  );
  const offsetRef = useRef({ x: 0, y: 0 });

  // Toolbar Drag Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 0);

      setPosition({
        x: Math.max(0, Math.min(e.clientX - offsetRef.current.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - offsetRef.current.y, maxY)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startToolbarDrag = (e: React.MouseEvent) => {
    // Only drag if clicking header, not buttons inside
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input")
    )
      return;

    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // List Item Drag Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    // Make the dragged element semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggingItemIndex === null || draggingItemIndex === index) return;

    // Only reorder if we're actually moving to a different position
    const newIndex = index;
    const oldIndex = draggingItemIndex;

    if (newIndex !== oldIndex) {
      reorderSections(oldIndex, newIndex);
      setDraggingItemIndex(newIndex);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggingItemIndex(null);
  };

  // Template 4 : drag-and-drop des 4 grandes sections uniquement
  const handleBigDragStart = (e: React.DragEvent, index: number) => {
    setDraggingBigIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    if (e.currentTarget instanceof HTMLElement)
      e.currentTarget.style.opacity = "0.5";
  };

  const handleBigDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggingBigIndex === null || draggingBigIndex === index) return;
    const newOrder = [...template4BigOrder];
    const [removed] = newOrder.splice(draggingBigIndex, 1);
    newOrder.splice(index, 0, removed);
    reorderBigSectionsTemplate4(
      newOrder as ["experiences" | "projects" | "stack" | "contact"],
    );
    setDraggingBigIndex(index);
  };

  const handleBigDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement)
      e.currentTarget.style.opacity = "1";
    setDraggingBigIndex(null);
  };

  // Template 5 : drag-and-drop des 7 blocs (sans sous-sections séparées)
  const handleT5DragStart = (e: React.DragEvent, index: number) => {
    setDraggingT5Index(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    if (e.currentTarget instanceof HTMLElement)
      e.currentTarget.style.opacity = "0.5";
  };

  const handleT5DragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggingT5Index === null || draggingT5Index === index) return;
    const newOrder = [...template5BlockOrder];
    const [removed] = newOrder.splice(draggingT5Index, 1);
    newOrder.splice(index, 0, removed);
    reorderSectionsTemplate5(
      newOrder as [
        | "about"
        | "experiences"
        | "education_certifications"
        | "projects"
        | "skills"
        | "languages_interests"
        | "contact",
      ],
    );
    setDraggingT5Index(index);
  };

  const handleT5DragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement)
      e.currentTarget.style.opacity = "1";
    setDraggingT5Index(null);
  };

  return (
    <div
      ref={dragRef}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className="fixed top-0 left-0 w-72 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-slate-700 ring-1 ring-black/5 z-[99999] overflow-hidden"
    >
      {/* Header (Drag Handle) */}
      <div
        onMouseDown={startToolbarDrag}
        className="bg-slate-100/50 dark:bg-slate-700/50 px-4 py-3 border-b border-slate-200 dark:border-slate-600 flex items-center justify-between cursor-move select-none"
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
          <Palette size={16} />
          Personnalisation
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 rounded transition-colors"
            title={isMinimized ? "Développer" : "Réduire"}
          >
            {isMinimized ? (
              <ChevronUp size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
          </button>
          <Move size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          {/* Theme Colors — masqué pour template 4 (un seul mode jour) et template 6 (couleurs personnalisables) */}
          {!isTemplate4 && !isTemplate6 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Thème
              </label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() =>
                      updateTemplateCustomization({ colorTheme: theme })
                    }
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform active:scale-95 ${
                      templateCustomization.colorTheme === theme
                        ? "border-slate-500 dark:border-slate-400 scale-110"
                        : "border-transparent"
                    } ${
                      theme === "light"
                        ? "bg-white shadow-sm ring-1 ring-slate-200"
                        : "bg-slate-900"
                    }`}
                  >
                    {templateCustomization.colorTheme === theme && (
                      <Check
                        size={14}
                        className={
                          theme === "light" ? "text-black" : "text-white"
                        }
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Polices — Templates 1 à 6 : titre, sous-titres, gros item, petit item, description + import */}
          {(isTemplate1To5 || isTemplate6) && (
            <FontsSection
              templateFonts={templateCustomization.templateFonts}
              customFonts={templateCustomization.customFonts ?? []}
              updateTemplateCustomization={updateTemplateCustomization}
              setActiveToast={setActiveToast}
            />
          )}

          {/* Template 6 : Sélecteur de couleurs */}
          {isTemplate6 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Couleurs du template
              </label>
              <p className="text-[10px] text-slate-400">
                Personnalisez les couleurs marron/beige par défaut
              </p>
              {[
                {
                  key: "primaryDark",
                  label: "Titres & Navigation",
                  default: "#5e2933",
                  description:
                    "Couleur principale pour les titres et la barre de navigation",
                },
                {
                  key: "primaryLight",
                  label: "Sous-titres & Accents",
                  default: "#815443",
                  description:
                    "Couleur pour les sous-titres et éléments d'accentuation",
                },
                {
                  key: "secondaryBeige",
                  label: "Éléments décoratifs",
                  default: "#d2bdb1",
                  description: "Couleur pour les éléments décoratifs et icônes",
                },
                {
                  key: "accentBrown",
                  label: "Fonds de sections",
                  default: "#7d5e4c",
                  description: "Couleur pour les fonds de cartes et sections",
                },
                {
                  key: "cream",
                  label: "Fond général",
                  default: "#f7f6f6",
                  description: "Couleur de fond principale du template",
                },
              ].map(({ key, label, default: defaultColor, description }) => {
                const currentColor =
                  templateCustomization.template6_colors?.[key] || defaultColor;
                return (
                  <div key={key} className="space-y-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block">
                        {label}
                      </label>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => {
                          updateTemplateCustomization({
                            template6_colors: {
                              ...templateCustomization.template6_colors,
                              [key]: e.target.value,
                            },
                          });
                        }}
                        className="w-10 h-8 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^#[0-9A-F]{6}$/i.test(value)) {
                            updateTemplateCustomization({
                              template6_colors: {
                                ...templateCustomization.template6_colors,
                                [key]: value,
                              },
                            });
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder={defaultColor}
                      />
                      <button
                        onClick={() => {
                          updateTemplateCustomization({
                            template6_colors: {
                              ...templateCustomization.template6_colors,
                              [key]: defaultColor,
                            },
                          });
                        }}
                        className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        title="Réinitialiser"
                      >
                        ↺
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sections Reordering & Visibility — Template 4 : Grandes / Petites sections ; autres templates : liste unique */}
          {isTemplate4 ? (
            <div className="space-y-4">
              {/* Grandes sections : À propos (fixe) + 4 blocs réordonnables */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Grandes sections
                </label>
                <span className="text-[10px] text-slate-400 block">
                  (Glisser pour réordonner)
                </span>
                <div className="flex flex-col gap-2">
                  {/* À propos : toujours en premier, pas de drag */}
                  {(() => {
                    const aboutSection = templateCustomization.sections.find(
                      (s) => s.id === "about",
                    );
                    if (!aboutSection) return null;
                    return (
                      <div className="flex items-center gap-3 p-2 rounded-lg border bg-white dark:bg-slate-700 border-transparent">
                        <div className="w-5 flex-shrink-0" aria-hidden />
                        <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={aboutSection.visible}
                            onChange={() => toggleSection("about")}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="select-none">À propos</span>
                        </label>
                      </div>
                    );
                  })()}
                  {/* 4 blocs réordonnables */}
                  {template4BigOrder.map((blockId, index) => {
                    const visible =
                      blockId === "stack"
                        ? templateCustomization.sections.some(
                            (s) =>
                              STACK_SECTION_IDS.includes(s.id) && s.visible,
                          )
                        : (templateCustomization.sections.find(
                            (s) => s.id === blockId,
                          )?.visible ?? true);
                    return (
                      <div
                        key={blockId}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleBigDragStart(e, index);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBigDragOver(e, index);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDragEnd={(e) => {
                          e.stopPropagation();
                          handleBigDragEnd(e);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${
                          draggingBigIndex === index
                            ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 opacity-50"
                            : "bg-white dark:bg-slate-700 border-transparent hover:border-slate-100 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                        } ${draggingBigIndex !== null ? "cursor-move" : ""}`}
                      >
                        <div
                          className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-500 hover:text-slate-500 p-1"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={14} />
                        </div>
                        <label
                          className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={() => {
                              if (blockId === "stack") {
                                const anyVisible =
                                  templateCustomization.sections.some(
                                    (s) =>
                                      STACK_SECTION_IDS.includes(s.id) &&
                                      s.visible,
                                  );
                                STACK_SECTION_IDS.forEach((id) => {
                                  const s = templateCustomization.sections.find(
                                    (x) => x.id === id,
                                  );
                                  if (s && s.visible === anyVisible)
                                    toggleSection(id);
                                });
                              } else {
                                toggleSection(blockId);
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="select-none">
                            {TEMPLATE4_BIG_LABELS[blockId]}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Petites sections : visibilité uniquement (pas de drag) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Petites sections
                </label>
                <span className="text-[10px] text-slate-400 block">
                  (Masquer / afficher)
                </span>
                <div className="flex flex-col gap-2">
                  {TEMPLATE4_SMALL_SECTIONS.map(({ id, label }) => {
                    const section = templateCustomization.sections.find(
                      (s) => s.id === id,
                    );
                    const visible = section?.visible ?? true;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 p-2 rounded-lg border bg-white dark:bg-slate-700 border-transparent"
                      >
                        <div className="w-5 flex-shrink-0" aria-hidden />
                        <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={() => toggleSection(id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="select-none">{label}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : isTemplate5 ? (
            /* Template 5 : 7 blocs déplaçables uniquement (sous-sections Formation|Certifications et Langues|Centres d'intérêt regroupées) */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sections
                </label>
                <span className="text-[10px] text-slate-400">
                  (Glisser pour réordonner)
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {template5BlockOrder.map((blockId, index) => {
                  const visible =
                    blockId === "education_certifications"
                      ? templateCustomization.sections.some(
                          (s) =>
                            (s.id === "education" ||
                              s.id === "certifications") &&
                            s.visible,
                        )
                      : blockId === "languages_interests"
                        ? templateCustomization.sections.some(
                            (s) =>
                              (s.id === "languages" || s.id === "interests") &&
                              s.visible,
                          )
                        : (templateCustomization.sections.find(
                            (s) => s.id === blockId,
                          )?.visible ?? true);
                  return (
                    <div
                      key={blockId}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleT5DragStart(e, index);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleT5DragOver(e, index);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        handleT5DragEnd(e);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${
                        draggingT5Index === index
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 opacity-50"
                          : "bg-white dark:bg-slate-700 border-transparent hover:border-slate-100 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                      } ${draggingT5Index !== null ? "cursor-move" : ""}`}
                    >
                      <div
                        className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-500 hover:text-slate-500 p-1"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={14} />
                      </div>
                      <label
                        className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={visible}
                          onChange={() => {
                            if (blockId === "education_certifications") {
                              const anyVisible =
                                templateCustomization.sections.some(
                                  (s) =>
                                    (s.id === "education" ||
                                      s.id === "certifications") &&
                                    s.visible,
                                );
                              ["education", "certifications"].forEach((id) => {
                                const s = templateCustomization.sections.find(
                                  (x) => x.id === id,
                                );
                                if (s && s.visible === anyVisible)
                                  toggleSection(id);
                              });
                            } else if (blockId === "languages_interests") {
                              const anyVisible =
                                templateCustomization.sections.some(
                                  (s) =>
                                    (s.id === "languages" ||
                                      s.id === "interests") &&
                                    s.visible,
                                );
                              ["languages", "interests"].forEach((id) => {
                                const s = templateCustomization.sections.find(
                                  (x) => x.id === id,
                                );
                                if (s && s.visible === anyVisible)
                                  toggleSection(id);
                              });
                            } else {
                              toggleSection(blockId);
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                        />
                        <span className="select-none">
                          {TEMPLATE5_BLOCK_LABELS[blockId]}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sections
                </label>
                <span className="text-[10px] text-slate-400">
                  (Glisser pour réordonner)
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {templateCustomization.sections.map((section, index) => (
                  <div
                    key={section.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(e, index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDragOver(e, index);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      handleDragEnd(e);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${
                      draggingItemIndex === index
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 opacity-50"
                        : "bg-white dark:bg-slate-700 border-transparent hover:border-slate-100 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    } ${draggingItemIndex !== null ? "cursor-move" : ""}`}
                  >
                    <div
                      className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 p-1"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical size={14} />
                    </div>
                    <label
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSection(section.id);
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                      />
                      <span className="capitalize select-none">
                        {section.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template 5 : disposition des colonnes pour les paires (Formation|Certifications, Langues|Centres d'intérêt) */}
          {isTemplate5 && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Disposition des colonnes
              </label>
              <p className="text-[10px] text-slate-400">
                Choisir quelle section est à gauche dans les blocs à deux
                colonnes.
              </p>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Formation & Certifications
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateTemplateCustomization({
                          template5ColumnOrder: {
                            ...t5Col,
                            educationCertifications: "education_left",
                          },
                        })
                      }
                      className={`flex-1 py-2 px-3 text-xs rounded-lg border transition-all ${
                        t5Col.educationCertifications === "education_left"
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Formation à gauche
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTemplateCustomization({
                          template5ColumnOrder: {
                            ...t5Col,
                            educationCertifications: "certifications_left",
                          },
                        })
                      }
                      className={`flex-1 py-2 px-3 text-xs rounded-lg border transition-all ${
                        t5Col.educationCertifications === "certifications_left"
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Certifications à gauche
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Langues & Centres d&apos;intérêt
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateTemplateCustomization({
                          template5ColumnOrder: {
                            ...t5Col,
                            languagesInterests: "languages_left",
                          },
                        })
                      }
                      className={`flex-1 py-2 px-3 text-xs rounded-lg border transition-all ${
                        t5Col.languagesInterests === "languages_left"
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Langues à gauche
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTemplateCustomization({
                          template5ColumnOrder: {
                            ...t5Col,
                            languagesInterests: "interests_left",
                          },
                        })
                      }
                      className={`flex-1 py-2 px-3 text-xs rounded-lg border transition-all ${
                        t5Col.languagesInterests === "interests_left"
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Centres d&apos;intérêt à gauche
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Layout */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mise en page Projets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  updateTemplateCustomization({ projectsLayout: "grid" })
                }
                className={`flex items-center justify-center gap-2 py-2 text-sm rounded-lg border transition-all ${
                  templateCustomization.projectsLayout === "grid"
                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Grid size={16} /> Grid
              </button>
              <button
                onClick={() =>
                  updateTemplateCustomization({ projectsLayout: "list" })
                }
                className={`flex items-center justify-center gap-2 py-2 text-sm rounded-lg border transition-all ${
                  templateCustomization.projectsLayout === "list"
                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <List size={16} /> List
              </button>
            </div>
          </div>

          {/* Logos */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Logos
            </label>
            <button
              onClick={() =>
                updateTemplateCustomization({
                  showLogos: !templateCustomization.showLogos,
                })
              }
              className={`w-full flex items-center justify-center gap-2 py-2 text-sm rounded-lg border transition-all ${
                templateCustomization.showLogos !== false
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                  : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {templateCustomization.showLogos !== false ? (
                <>
                  <Eye size={16} />
                  <span>Masquer les logos</span>
                </>
              ) : (
                <>
                  <EyeOff size={16} />
                  <span>Afficher les logos</span>
                </>
              )}
            </button>
          </div>

          {/* Fond du hero : Défaut / Photo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fond du hero
            </label>
            <input
              ref={heroBackgroundInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file || !portfolioTemplateOverrides) return;
                try {
                  setIsUploadingHeroBackground(true);
                  const resizedBlob = await resizeImageFile(file, 1920, 0.8);
                  const resizedFile = new File(
                    [resizedBlob],
                    file.name || "hero.jpg",
                    { type: "image/jpeg" },
                  );
                  const { hero_image_url } =
                    await portfolioAPI.uploadHeroImage(resizedFile);
                  setPortfolioTemplateOverrides((prev) => ({
                    ...prev,
                    hero_background_type: "photo",
                    hero_background_image_url: hero_image_url,
                  }));
                  setActiveToast?.({
                    type: "success",
                    title: "Fond hero",
                    message: "Image de fond enregistrée.",
                  });
                } catch (err) {
                  setActiveToast?.({
                    type: "error",
                    title: "Erreur",
                    message: "Impossible d'uploader l'image.",
                  });
                } finally {
                  setIsUploadingHeroBackground(false);
                }
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "default" as const, label: "Défaut", icon: Palette },
                { value: "photo" as const, label: "Photo", icon: Image },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (opt.value === "photo") {
                        heroBackgroundInputRef.current?.click();
                        return;
                      }
                      setPortfolioTemplateOverrides((prev) => ({
                        ...prev,
                        hero_background_type: opt.value,
                        ...(opt.value === "default"
                          ? { hero_background_image_url: null }
                          : {}),
                      }));
                    }}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      (portfolioTemplateOverrides?.hero_background_type ||
                        "default") === opt.value
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                        : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {(portfolioTemplateOverrides?.hero_background_type || "default") ===
              "photo" &&
              portfolioTemplateOverrides?.hero_background_image_url && (
                <div className="flex items-center gap-2">
                  <img
                    src={
                      getAbsoluteImageUrl(
                        portfolioTemplateOverrides.hero_background_image_url,
                      ) || portfolioTemplateOverrides.hero_background_image_url
                    }
                    alt="Fond hero"
                    className="w-12 h-12 rounded object-cover border border-slate-200 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => heroBackgroundInputRef.current?.click()}
                    disabled={isUploadingHeroBackground}
                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    {isUploadingHeroBackground ? "Upload..." : "Changer"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPortfolioTemplateOverrides((prev) => ({
                        ...prev,
                        hero_background_type: "default",
                        hero_background_image_url: null,
                      }))
                    }
                    className="p-1 rounded bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30"
                    title="Retirer le fond"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
          </div>

          {/* Section À propos personnalisée */}
          {templateCustomization.sections.some((s) => s.id === "about") && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Section À propos
              </label>
              <div className="space-y-2">
                {/* Choix entre bio profil ou section personnalisée */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPortfolioTemplateOverrides((prev) => ({
                        ...prev,
                        about_use_custom: false,
                      }));
                    }}
                    className={`py-2 px-3 text-xs rounded-lg border transition-all ${
                      !portfolioTemplateOverrides?.about_use_custom
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                        : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Bio profil
                  </button>
                  <button
                    onClick={() => {
                      setPortfolioTemplateOverrides((prev) => ({
                        ...prev,
                        about_use_custom: true,
                        // Initialiser les valeurs par défaut si elles n'existent pas
                        about_layout: prev?.about_layout ?? "image_top",
                        about_text_align: prev?.about_text_align ?? "center",
                      }));
                    }}
                    className={`py-2 px-3 text-xs rounded-lg border transition-all ${
                      portfolioTemplateOverrides?.about_use_custom
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                        : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Personnalisée
                  </button>
                </div>

                {/* Si section personnalisée activée */}
                {portfolioTemplateOverrides?.about_use_custom && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {/* Disposition photo/texte - Toujours affichée si section personnalisée */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                        Disposition
                      </label>
                      <div className="grid grid-cols-2 gap-2">
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
                              setPortfolioTemplateOverrides((prev) => ({
                                ...prev,
                                about_layout: layout.value as any,
                              }));
                            }}
                            className={`py-2 px-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 ${
                              (portfolioTemplateOverrides?.about_layout ||
                                "image_top") === layout.value
                                ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                                : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <span>{layout.icon}</span>
                            <span className="text-[10px]">{layout.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Texte personnalisé */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                        Texte personnalisé
                      </label>
                      <textarea
                        value={portfolioTemplateOverrides?.about_text || ""}
                        onChange={(e) => {
                          setPortfolioTemplateOverrides((prev) => ({
                            ...prev,
                            about_text: e.target.value,
                          }));
                        }}
                        placeholder="Écrivez votre section À propos personnalisée..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                        rows={4}
                      />
                      {/* Alignement du texte - Toujours affiché si section personnalisée */}
                      <div className="mt-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                          Alignement du texte
                        </label>
                        <div className="flex gap-2">
                          {[
                            { value: "left", label: "Gauche", icon: AlignLeft },
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
                                  setPortfolioTemplateOverrides((prev) => ({
                                    ...prev,
                                    about_text_align: align.value as any,
                                  }));
                                }}
                                className={`flex-1 py-2 px-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 ${
                                  (portfolioTemplateOverrides?.about_text_align ||
                                    "center") === align.value
                                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                                title={align.label}
                              >
                                <Icon size={14} />
                                <span className="text-[10px] hidden sm:inline">
                                  {align.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Upload photo */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                        Photo (max 10 Mo)
                      </label>
                      {portfolioTemplateOverrides?.about_image_url ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <img
                              src={
                                getAbsoluteImageUrl(
                                  portfolioTemplateOverrides.about_image_url,
                                ) ||
                                portfolioTemplateOverrides.about_image_url ||
                                undefined
                              }
                              alt="À propos"
                              className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                              onError={(e) => {
                                const finalUrl =
                                  getAbsoluteImageUrl(
                                    portfolioTemplateOverrides.about_image_url,
                                  ) ||
                                  portfolioTemplateOverrides.about_image_url;
                                console.error(
                                  "❌ [PortfolioToolbar] Erreur chargement image about:",
                                  {
                                    original:
                                      portfolioTemplateOverrides.about_image_url,
                                    getAbsoluteImageUrl: getAbsoluteImageUrl(
                                      portfolioTemplateOverrides.about_image_url,
                                    ),
                                    finalUrl,
                                    API_URL,
                                  },
                                );
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <button
                              onClick={async () => {
                                setPortfolioTemplateOverrides((prev) => ({
                                  ...prev,
                                  about_image_url: null,
                                }));
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <input
                            key={
                              portfolioTemplateOverrides?.about_image_url ??
                              "about-img-input"
                            }
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingAboutImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              e.target.value = "";

                              const maxSizeMB = 10;
                              if (file.size > maxSizeMB * 1024 * 1024) {
                                setActiveToast({
                                  icon: "❌",
                                  title: "Fichier trop volumineux",
                                  message: `La taille maximale est de ${maxSizeMB} Mo`,
                                  type: "error",
                                  points: 0,
                                });
                                return;
                              }

                              setIsUploadingAboutImage(true);
                              try {
                                const blob = await resizeImageFile(file);
                                const resizedFile = new File(
                                  [blob],
                                  (file.name.replace(/\.[^.]+$/, "") ||
                                    "image") + ".jpg",
                                  { type: "image/jpeg" },
                                );
                                const formData = new FormData();
                                formData.append("file", resizedFile);
                                const response =
                                  await portfolioAPI.uploadAboutImage(formData);
                                setPortfolioTemplateOverrides((prev) => ({
                                  ...prev,
                                  about_image_url: response.about_image_url,
                                }));
                                setActiveToast({
                                  icon: "✅",
                                  title: "Photo uploadée",
                                  message:
                                    "La photo a été uploadée avec succès",
                                  type: "success",
                                  points: 0,
                                });
                              } catch (error: any) {
                                console.error(
                                  "Erreur upload photo about:",
                                  error,
                                );
                                setActiveToast({
                                  icon: "❌",
                                  title: "Erreur upload",
                                  message:
                                    error?.response?.data?.detail ||
                                    error?.message ||
                                    "Impossible d'uploader la photo",
                                  type: "error",
                                  points: 0,
                                });
                              } finally {
                                setIsUploadingAboutImage(false);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <label
                          className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg transition-colors ${isUploadingAboutImage ? "opacity-60 cursor-wait" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                        >
                          <div className="flex flex-col items-center justify-center pt-2">
                            {isUploadingAboutImage ? (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Chargement...
                              </span>
                            ) : (
                              <>
                                <Upload
                                  size={20}
                                  className="text-slate-400 mb-1"
                                />
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Cliquer pour uploader
                                </span>
                              </>
                            )}
                          </div>
                          <input
                            key={
                              portfolioTemplateOverrides?.about_image_url ??
                              "about-img-empty"
                            }
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingAboutImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              e.target.value = "";

                              const maxSizeMB = 10;
                              if (file.size > maxSizeMB * 1024 * 1024) {
                                setActiveToast({
                                  icon: "❌",
                                  title: "Fichier trop volumineux",
                                  message: `La taille maximale est de ${maxSizeMB} Mo`,
                                  type: "error",
                                  points: 0,
                                });
                                return;
                              }

                              setIsUploadingAboutImage(true);
                              try {
                                const blob = await resizeImageFile(file);
                                const resizedFile = new File(
                                  [blob],
                                  (file.name.replace(/\.[^.]+$/, "") ||
                                    "image") + ".jpg",
                                  { type: "image/jpeg" },
                                );
                                const formData = new FormData();
                                formData.append("file", resizedFile);
                                const response =
                                  await portfolioAPI.uploadAboutImage(formData);
                                setPortfolioTemplateOverrides((prev) => ({
                                  ...prev,
                                  about_image_url: response.about_image_url,
                                }));
                                setActiveToast({
                                  icon: "✅",
                                  title: "Photo uploadée",
                                  message:
                                    "La photo a été uploadée avec succès",
                                  type: "success",
                                  points: 0,
                                });
                              } catch (error: any) {
                                console.error(
                                  "Erreur upload photo about:",
                                  error,
                                );
                                setActiveToast({
                                  icon: "❌",
                                  title: "Erreur upload",
                                  message:
                                    error?.response?.data?.detail ||
                                    error?.message ||
                                    "Impossible d'uploader la photo",
                                  type: "error",
                                  points: 0,
                                });
                              } finally {
                                setIsUploadingAboutImage(false);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CV Selection */}
          <CVSelector
            selectedCvId={templateCustomization.cvId}
            selectedCvUrl={templateCustomization.cvUrl}
            onSelectCV={(cvId, cvUrl) =>
              updateTemplateCustomization({
                cvId: cvId ?? null,
                cvUrl: cvUrl ?? null,
              })
            }
          />

          {/* Item Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sélection des items
            </label>
            <span className="text-[10px] text-slate-400 block">
              Choisir quels items afficher dans chaque section
            </span>

            {/* Expériences */}
            {templateCustomization.sections.some(
              (s) => s.id === "experiences" && s.visible,
            ) &&
              experiences.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Expériences
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {experiences.map((exp) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.experiences ||
                        templateCustomization.selectedItems.experiences.includes(
                          exp.id,
                        );
                      return (
                        <label
                          key={exp.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              // Si selectedItems.experiences est undefined, toutes sont sélectionnées
                              // Il faut donc utiliser tous les IDs comme base
                              const allIds = experiences.map((e) => e.id);
                              const current =
                                templateCustomization.selectedItems
                                  ?.experiences || allIds;
                              const newSelected = isSelected
                                ? current.filter((id) => id !== exp.id)
                                : [...current, exp.id];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  experiences:
                                    newSelected.length === experiences.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {exp.title} {exp.company ? `@ ${exp.company}` : ""}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Formations */}
            {templateCustomization.sections.some(
              (s) => s.id === "education" && s.visible,
            ) &&
              educations.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Formations
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {educations.map((edu) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.educations ||
                        templateCustomization.selectedItems.educations.includes(
                          edu.id,
                        );
                      return (
                        <label
                          key={edu.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const allIds = educations.map((e) => e.id);
                              const current =
                                templateCustomization.selectedItems
                                  ?.educations || allIds;
                              const newSelected = isSelected
                                ? current.filter((id) => id !== edu.id)
                                : [...current, edu.id];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  educations:
                                    newSelected.length === educations.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {edu.degree} {edu.school ? `@ ${edu.school}` : ""}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Projets */}
            {templateCustomization.sections.some(
              (s) => s.id === "projects" && s.visible,
            ) &&
              projects.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Projets
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {projects.map((proj) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.projects ||
                        templateCustomization.selectedItems.projects.includes(
                          proj.id,
                        );
                      return (
                        <label
                          key={proj.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const allIds = projects.map((p) => p.id);
                              const current =
                                templateCustomization.selectedItems?.projects ||
                                allIds;
                              const newSelected = isSelected
                                ? current.filter((id) => id !== proj.id)
                                : [...current, proj.id];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  projects:
                                    newSelected.length === projects.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {proj.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Compétences */}
            {templateCustomization.sections.some(
              (s) => s.id === "skills" && s.visible,
            ) &&
              skills.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Compétences
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {skills.map((skill) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.skills ||
                        templateCustomization.selectedItems.skills.includes(
                          skill.name,
                        );
                      return (
                        <label
                          key={skill.name}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const allNames = skills.map((s) => s.name);
                              const current =
                                templateCustomization.selectedItems?.skills ||
                                allNames;
                              const newSelected = isSelected
                                ? current.filter((name) => name !== skill.name)
                                : [...current, skill.name];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  skills:
                                    newSelected.length === skills.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {skill.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Langues */}
            {templateCustomization.sections.some(
              (s) => s.id === "languages" && s.visible,
            ) &&
              languages.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Langues
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {languages.map((lang) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.languages ||
                        templateCustomization.selectedItems.languages.includes(
                          lang.id,
                        );
                      return (
                        <label
                          key={lang.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const allIds = languages.map((l) => l.id);
                              const current =
                                templateCustomization.selectedItems
                                  ?.languages || allIds;
                              const newSelected = isSelected
                                ? current.filter((id) => id !== lang.id)
                                : [...current, lang.id];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  languages:
                                    newSelected.length === languages.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {lang.name} ({lang.level})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Certifications */}
            {templateCustomization.sections.some(
              (s) => s.id === "certifications" && s.visible,
            ) &&
              certifications.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Certifications
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {certifications.map((cert) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.certifications ||
                        templateCustomization.selectedItems.certifications.includes(
                          cert.id,
                        );
                      return (
                        <label
                          key={cert.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const allIds = certifications.map((c) => c.id);
                              const current =
                                templateCustomization.selectedItems
                                  ?.certifications || allIds;
                              const newSelected = isSelected
                                ? current.filter((id) => id !== cert.id)
                                : [...current, cert.id];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  certifications:
                                    newSelected.length === certifications.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {cert.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Centres d'intérêt */}
            {templateCustomization.sections.some(
              (s) => s.id === "interests" && s.visible,
            ) &&
              interests.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Centres d'intérêt
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {interests.map((interest) => {
                      const isSelected =
                        !templateCustomization.selectedItems?.interests ||
                        templateCustomization.selectedItems.interests.includes(
                          interest.id,
                        );
                      return (
                        <label
                          key={interest.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const allIds = interests.map((i) => i.id);
                              const current =
                                templateCustomization.selectedItems
                                  ?.interests || allIds;
                              const newSelected = isSelected
                                ? current.filter((id) => id !== interest.id)
                                : [...current, interest.id];
                              updateTemplateCustomization({
                                selectedItems: {
                                  ...templateCustomization.selectedItems,
                                  interests:
                                    newSelected.length === interests.length
                                      ? undefined
                                      : newSelected,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-slate-800"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                            {interest.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

          {/* Reset */}
          <button
            onClick={resetTemplateCustomization}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <RotateCcw size={14} /> Réinitialiser le design
          </button>
        </div>
      )}
    </div>
  );
};
