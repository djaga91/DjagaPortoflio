import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  GripVertical,
  Save,
  Settings,
  Moon,
  Sun,
  Palette,
  Layout,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PortfolioConfig,
  PortfolioSection,
  PortfolioTemplate,
  User,
  Profile,
  Experience,
  Education,
  Project,
  Skill,
  Language,
  Certification,
  Interest,
} from "../../types";
import { portfolioAPI } from "../../services/api";
import { useGameStore } from "../../store/gameStore";
import { PortfolioEditor } from "./PortfolioEditor";
import { PortfolioPreview } from "./PortfolioPreview";

interface PortfolioBuilderProps {
  user: User | null;
  profile: Profile | null;
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  interests?: Interest[];
}

// Configuration par défaut
const DEFAULT_CONFIG: PortfolioConfig = {
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
    { id: "contact", type: "contact", visible: true, order: 9 },
  ],
  template: "template1", // Template par défaut
  colorMode: "dark", // Mode sombre par défaut
  theme: {
    primaryColor: "#FF8C42",
    fontFamily: "Inter",
  },
  showLogos: true, // Afficher les logos par défaut
};

export const PortfolioBuilder: React.FC<PortfolioBuilderProps> = ({
  user,
  profile,
  experiences,
  educations,
  projects,
  skills,
  languages,
  certifications,
  interests = [],
}) => {
  const { setActiveToast, updateLanguage } = useGameStore();
  const [config, setConfig] = useState<PortfolioConfig>(DEFAULT_CONFIG);
  const [_isEditMode, _setIsEditMode] = useState(false); // TODO: implémenter mode édition
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSections, setShowSections] = useState(true); // État pour l'accordéon des sections
  const [showTheme, setShowTheme] = useState(false); // État pour l'accordéon du thème
  const [showLogosOptions, setShowLogosOptions] = useState(false); // État pour l'accordéon des logos
  const [portfolioPublicUrl, setPortfolioPublicUrl] = useState<string | null>(
    null,
  );

  // État pour les onglets mobile (Outils vs Preview)
  const [mobileTab, setMobileTab] = useState<"tools" | "preview">("tools");

  // Toggle mode clair/sombre
  const handleToggleColorMode = () => {
    setConfig({
      ...config,
      colorMode: config.colorMode === "dark" ? "light" : "dark",
    });
  };

  // Toggle affichage des logos
  const handleToggleLogos = () => {
    setConfig({
      ...config,
      showLogos: !config.showLogos,
    });
  };

  // Templates disponibles
  const availableTemplates: Array<{
    value: PortfolioTemplate;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      value: "template1",
      label: "Template Moderne",
      description: "Design moderne avec animations",
      icon: "✨",
    },
    {
      value: "template2",
      label: "Template Minimaliste",
      description: "Design épuré et professionnel",
      icon: "🎨",
    },
    {
      value: "template3",
      label: "Template Créatif",
      description: "Design créatif avec masonry layout",
      icon: "🚀",
    },
    {
      value: "template4",
      label: "Template Artistique",
      description: "Design artistique et moderne",
      icon: "🎭",
    },
    {
      value: "template5",
      label: "Template Système",
      description: "Style HUD / terminal avec grille et lime",
      icon: "🖥️",
    },
    {
      value: "template6",
      label: "Template Élégant",
      description: "Design marron/beige avec timeline bifurquée",
      icon: "🎯",
    },
    {
      value: "default",
      label: "Template Classique",
      description: "Sections individuelles classiques",
      icon: "📄",
    },
  ];

  // Changer de template (avec sauvegarde automatique après 1 seconde)
  const handleTemplateChange = async (template: PortfolioTemplate) => {
    // Ne pas changer si c'est le même template
    if (config.template === template) {
      return;
    }

    // S'assurer que template et colorMode sont toujours présents
    const newConfig: PortfolioConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      template: template || DEFAULT_CONFIG.template,
      colorMode: config.colorMode || DEFAULT_CONFIG.colorMode,
    };
    setConfig(newConfig);

    // Fermer le dropdown après sélection
    setShowTemplateSelector(false);

    // Sauvegarder automatiquement après un délai
    setTimeout(async () => {
      try {
        await portfolioAPI.saveConfig(newConfig);
        setActiveToast({
          icon: "✅",
          title: "Template mis à jour",
          message: `Le template "${template}" a été appliqué`,
          type: "success",
          points: 0,
        });
      } catch (error) {
        console.error("Erreur sauvegarde template:", error);
        setActiveToast({
          icon: "❌",
          title: "Erreur",
          message: "Impossible de sauvegarder le template",
          type: "error",
          points: 0,
        });
      }
    }, 1000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    // TouchSensor pour mobile avec délai pour permettre le scroll
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Attendre 250ms avant d'activer le drag
        tolerance: 5, // Tolérance de 5px pour permettre le scroll
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Charger la configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await portfolioAPI.getConfig();
        // Fusionner avec les valeurs par défaut pour s'assurer que template et colorMode existent
        const mergedConfig: PortfolioConfig = {
          ...DEFAULT_CONFIG,
          ...savedConfig,
          layout: savedConfig.layout || DEFAULT_CONFIG.layout,
          theme: savedConfig.theme || DEFAULT_CONFIG.theme,
          template: savedConfig.template || DEFAULT_CONFIG.template,
          colorMode: savedConfig.colorMode || DEFAULT_CONFIG.colorMode,
          showLogos:
            savedConfig.showLogos !== undefined
              ? savedConfig.showLogos
              : DEFAULT_CONFIG.showLogos,
          templateOverrides:
            savedConfig.templateOverrides ?? DEFAULT_CONFIG.templateOverrides,
          itemOrder: savedConfig.itemOrder ?? DEFAULT_CONFIG.itemOrder,
        };
        setConfig(mergedConfig);
      } catch (error) {
        console.error("Erreur chargement config portfolio:", error);
        // Utiliser la config par défaut en cas d'erreur
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Générer l'URL publique du portfolio
  useEffect(() => {
    if (user && profile) {
      // Si l'utilisateur a un portfolio_url, l'utiliser
      if (profile.portfolio_url) {
        setPortfolioPublicUrl(profile.portfolio_url);
      } else {
        // Sinon, générer un lien basé sur l'username
        // ⚠️ Sur mobile (capacitor://), utiliser l'URL de production
        const baseUrl = window.location.origin.startsWith("capacitor://")
          ? "https://portfolia.fr"
          : window.location.origin;
        const username = user.username || user.email.split("@")[0];
        setPortfolioPublicUrl(`${baseUrl}/portfolio/${username}`);
      }
    }
  }, [user, profile]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    if (!showTemplateSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const container = document.querySelector(".template-selector-container");
      if (container && !container.contains(target)) {
        setShowTemplateSelector(false);
      }
    };

    // Utiliser un délai pour éviter que le click sur le bouton ne ferme immédiatement
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTemplateSelector]);

  // Copier le lien du portfolio
  const handleCopyPortfolioLink = async () => {
    if (portfolioPublicUrl) {
      try {
        await navigator.clipboard.writeText(portfolioPublicUrl);
        setActiveToast({
          icon: "✅",
          title: "Lien copié",
          message:
            "Le lien de votre portfolio a été copié dans le presse-papier",
          type: "success",
          points: 0,
        });
      } catch (error) {
        console.error("Erreur copie:", error);
      }
    }
  };

  // Sauvegarder automatiquement avec debounce (pour les changements autres que template)
  // Le template est sauvegardé directement dans handleTemplateChange
  useEffect(() => {
    if (isLoading) return;

    // Ne pas sauvegarder si c'est juste le template qui change (géré dans handleTemplateChange)
    const timeoutId = setTimeout(async () => {
      try {
        // S'assurer que template et colorMode sont toujours présents avant sauvegarde
        const configToSave: PortfolioConfig = {
          ...DEFAULT_CONFIG,
          ...config,
          template: config.template || DEFAULT_CONFIG.template,
          colorMode: config.colorMode || DEFAULT_CONFIG.colorMode,
        };
        await portfolioAPI.saveConfig(configToSave);
      } catch (error) {
        console.error("Erreur sauvegarde automatique:", error);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [
    config.layout,
    config.colorMode,
    config.theme,
    config.showLogos,
    isLoading,
  ]); // Exclure config.template des dépendances

  // Gérer le drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = config.layout.findIndex(
      (section) => section.id === active.id,
    );
    const newIndex = config.layout.findIndex(
      (section) => section.id === over.id,
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const newLayout = arrayMove(config.layout, oldIndex, newIndex);
      // Mettre à jour les ordres
      newLayout.forEach((section, index) => {
        section.order = index;
      });

      setConfig({
        ...config,
        layout: newLayout,
      });
    }

    setActiveId(null);
  };

  // Toggle visibilité d'une section
  const handleToggleVisibility = (sectionId: string) => {
    setConfig({
      ...config,
      layout: config.layout.map((section) =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section,
      ),
    });
  };

  // Réorganiser les sections (pour les boutons haut/bas)
  const handleReorder = (newSections: PortfolioSection[]) => {
    setConfig({
      ...config,
      layout: newSections,
    });
  };

  // Sauvegarder manuellement
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // S'assurer que template et colorMode sont toujours présents avant sauvegarde
      const configToSave: PortfolioConfig = {
        ...DEFAULT_CONFIG,
        ...config,
        template: config.template || DEFAULT_CONFIG.template,
        colorMode: config.colorMode || DEFAULT_CONFIG.colorMode,
      };
      await portfolioAPI.saveConfig(configToSave);
      setActiveToast({
        icon: "✅",
        title: "Configuration sauvegardée",
        message: "Votre portfolio a été mis à jour avec succès",
        type: "success",
        points: 0,
      });
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setActiveToast({
        icon: "❌",
        title: "Erreur",
        message: "Impossible de sauvegarder la configuration",
        type: "error",
        points: 0,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-theme-text-muted">
          Chargement de votre portfolio...
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-theme-bg-primary p-4 transition-colors duration-300">
        <div className="max-w-[1920px] mx-auto pt-8 px-4 lg:px-6 xl:px-8">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-theme-text-primary mb-1">
              Mon Portfolio
            </h1>
            <p className="text-xs text-theme-text-secondary">
              Personnalisez votre portfolio en choisissant un template et en
              organisant vos sections.
            </p>
          </div>

          {/* Boutons en haut à droite */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSaving ? (
                <>
                  <Save size={16} className="animate-pulse" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              )}
            </button>
            {portfolioPublicUrl && (
              <>
                <a
                  href={portfolioPublicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-theme-bg-secondary text-theme-text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-theme-bg-tertiary hover:text-theme-text-primary transition-colors text-sm"
                  title="Voir mon portfolio public"
                >
                  <ExternalLink size={16} />
                  Voir
                </a>
                <button
                  onClick={handleCopyPortfolioLink}
                  className="flex items-center gap-2 bg-theme-bg-secondary text-theme-text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-theme-bg-tertiary hover:text-theme-text-primary transition-colors text-sm"
                  title="Copier le lien"
                >
                  <Copy size={16} />
                </button>
              </>
            )}
          </div>

          {/* Onglets Mobile */}
          <div className="lg:hidden flex mb-4 bg-theme-card rounded-xl p-1 border border-theme-card-border">
            <button
              onClick={() => setMobileTab("tools")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mobileTab === "tools"
                  ? "bg-orange-500 text-white"
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              ⚙️ Options
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mobileTab === "preview"
                  ? "bg-orange-500 text-white"
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              👁️ Aperçu
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-start">
            {/* Colonne gauche : Outils (style épuré comme CV) */}
            {/* Sur mobile : visible uniquement si onglet "tools" actif */}
            <div
              className={`w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col ${
                mobileTab !== "tools" ? "hidden lg:flex" : "flex"
              }`}
              style={{ height: "auto", maxHeight: "calc(100vh - 220px)" }}
            >
              <div className="bg-theme-card rounded-xl border border-theme-card-border shadow-theme-sm transition-colors duration-300 flex flex-col h-full overflow-hidden">
                <div className="p-3 space-y-3 flex-shrink-0 border-b border-theme-border">
                  {/* Section Templates */}
                  <div className="template-selector-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTemplateSelector(!showTemplateSelector);
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Layout size={16} className="text-orange-500" />
                        <span className="text-xs font-semibold text-theme-text-primary">
                          Template
                        </span>
                      </div>
                      {showTemplateSelector ? (
                        <ChevronDown
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      )}
                    </button>

                    {showTemplateSelector && (
                      <div
                        className="mt-2 space-y-1.5 pl-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {availableTemplates.map((template) => {
                          const isSelected =
                            (config.template || "default") === template.value;
                          return (
                            <button
                              key={template.value}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTemplateChange(template.value);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors text-xs cursor-pointer ${
                                isSelected
                                  ? "bg-orange-500/20 border border-orange-500/50 text-orange-500"
                                  : "hover:bg-theme-bg-tertiary text-theme-text-primary"
                              }`}
                              type="button"
                            >
                              <div className="flex items-center gap-2">
                                <span>{template.icon}</span>
                                <span className="font-medium">
                                  {template.label}
                                </span>
                                {isSelected && (
                                  <div className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section Thème */}
                  <div>
                    <button
                      onClick={() => setShowTheme(!showTheme)}
                      className="w-full flex items-center justify-between p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={16} className="text-orange-500" />
                        <span className="text-xs font-semibold text-theme-text-primary">
                          Thème
                        </span>
                      </div>
                      {showTheme ? (
                        <ChevronDown
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      )}
                    </button>

                    {showTheme && (
                      <div className="mt-2 pl-6">
                        <button
                          onClick={handleToggleColorMode}
                          className="w-full flex items-center gap-2 px-2 py-1.5 bg-theme-bg-tertiary hover:bg-theme-bg-secondary rounded-lg transition-colors text-xs text-theme-text-primary"
                        >
                          {config.colorMode === "dark" ? (
                            <>
                              <Sun size={14} className="text-orange-500" />
                              <span>Mode clair</span>
                            </>
                          ) : (
                            <>
                              <Moon size={14} className="text-orange-500" />
                              <span>Mode sombre</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section Logos */}
                  <div>
                    <button
                      onClick={() => setShowLogosOptions(!showLogosOptions)}
                      className="w-full flex items-center justify-between p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-orange-500" />
                        <span className="text-xs font-semibold text-theme-text-primary">
                          Logos
                        </span>
                      </div>
                      {showLogosOptions ? (
                        <ChevronDown
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      )}
                    </button>

                    {showLogosOptions && (
                      <div className="mt-2 pl-6">
                        <button
                          onClick={handleToggleLogos}
                          className="w-full flex items-center gap-2 px-2 py-1.5 bg-theme-bg-tertiary hover:bg-theme-bg-secondary rounded-lg transition-colors text-xs text-theme-text-primary"
                        >
                          {config.showLogos !== false ? (
                            <>
                              <Eye size={14} className="text-orange-500" />
                              <span>Masquer les logos</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} className="text-orange-500" />
                              <span>Afficher les logos</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Sections (uniquement en mode édition) */}
                {_isEditMode && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3">
                    <button
                      onClick={() => setShowSections(!showSections)}
                      className="w-full flex items-center justify-between p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Settings size={16} className="text-orange-500" />
                        <span className="text-xs font-semibold text-theme-text-primary">
                          Sections
                        </span>
                      </div>
                      {showSections ? (
                        <ChevronDown
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-theme-text-secondary"
                        />
                      )}
                    </button>

                    {showSections && (
                      <div className="mt-2">
                        <PortfolioEditor
                          sections={config.layout}
                          onReorder={handleReorder}
                          onToggleVisibility={handleToggleVisibility}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : Preview du portfolio */}
            {/* Sur mobile : visible uniquement si onglet "preview" actif */}
            <div
              className={`flex-1 w-full flex flex-col ${
                mobileTab !== "preview" ? "hidden lg:flex" : "flex"
              }`}
              style={{ minHeight: "400px", maxHeight: "calc(100vh - 220px)" }}
            >
              <div className="bg-theme-card rounded-xl border border-theme-card-border shadow-theme-lg relative overflow-y-auto overflow-x-hidden transition-colors duration-300 flex-1 min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-theme-text-muted">
                        Chargement de votre portfolio...
                      </p>
                    </div>
                  </div>
                ) : !user || !profile ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-theme-text-primary mb-2">
                        Données manquantes
                      </p>
                      <p className="text-theme-text-muted text-sm">
                        Veuillez compléter votre profil pour voir votre
                        portfolio
                      </p>
                    </div>
                  </div>
                ) : (
                  <PortfolioPreview
                    key={`preview-${config.template || "default"}-${config.colorMode || "dark"}`} // Key pour forcer le re-render quand template ou colorMode change
                    config={config}
                    user={user}
                    profile={profile}
                    experiences={experiences || []}
                    educations={educations || []}
                    projects={projects || []}
                    skills={skills || []}
                    languages={languages || []}
                    certifications={certifications || []}
                    interests={Array.isArray(interests) ? interests : []}
                    onConfigChange={setConfig}
                    onLanguageLevelChange={
                      updateLanguage
                        ? (id, level) => updateLanguage(id, { level })
                        : undefined
                    }
                    isPreview={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-theme-card border-2 border-orange-500 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <GripVertical size={20} className="text-orange-500" />
              <span className="font-semibold text-theme-text-primary">
                {config.layout.find((s) => s.id === activeId)?.type || ""}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
