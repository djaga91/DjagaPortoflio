import React, { ErrorInfo, Suspense } from "react";
import {
  PortfolioConfig,
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
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ExperiencesSection } from "./sections/ExperiencesSection";
import { EducationSection } from "./sections/EducationSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { ContactSection } from "./sections/ContactSection";
import { Template1 } from "./templates/Template1";
import { Template2 } from "./templates/Template2";
import { Template3 } from "./templates/Template3";
import { Template4 } from "./templates/Template4";
import { Template5 } from "./templates/Template5";
import { Template6 } from "./templates/Template6";
import {
  cssFontToFrontend,
  colorModeToColorTheme,
  backendSectionsToFrontend,
  type TemplateCustomization,
} from "./templates/templateUtils";
import { applyItemOrder } from "../../utils/itemOrder";

// Error Boundary pour capturer les erreurs de rendu
class TemplateErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erreur rendu template:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return <>{this.props.children}</>;
  }
}

interface PortfolioPreviewProps {
  config: PortfolioConfig;
  user: User | null;
  profile: Profile | null;
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  interests?: Interest[];
  onConfigChange?: (config: PortfolioConfig) => void;
  onLanguageLevelChange?: (id: string, level: string) => void;
  isPreview?: boolean;
  lang?: "fr" | "en";
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  config,
  user,
  profile,
  experiences,
  educations,
  projects,
  skills,
  languages,
  certifications,
  interests = [],
  onConfigChange,
  isPreview = false,
  lang = "fr",
}) => {
  // Afficher un message si les données essentielles manquent
  if (!user && !profile) {
    return (
      <div className="w-full bg-theme-bg-primary p-8">
        <div className="text-center">
          <p className="text-theme-text-primary mb-4">
            Chargement de votre portfolio...
          </p>
          <p className="text-theme-text-muted text-sm">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  // Vérifier que la config a un layout valide
  if (!config || !config.layout || !Array.isArray(config.layout)) {
    console.error("❌ [PortfolioPreview] Config invalide:", config);
    return (
      <div className="w-full bg-theme-bg-primary p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur de configuration</p>
          <p className="text-theme-text-muted text-sm">
            La configuration du portfolio est invalide
          </p>
        </div>
      </div>
    );
  }

  // Trier les sections par ordre et filtrer celles qui sont visibles
  const visibleSections = config.layout
    .filter((section) => section && section.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Définir showLogos au niveau du composant pour qu'il soit accessible partout
  const showLogos = config.showLogos !== false; // Par défaut true

  // Filtrer les données selon les sélections
  const selectedItems = config.selectedItems || {};

  // Si selectedItems.experiences est défini ET non vide, filtrer, sinon afficher tout
  const filteredExperiences =
    selectedItems.experiences && selectedItems.experiences.length > 0
      ? experiences.filter((exp) => {
          const expId = String(exp.id);
          const selectedIds = selectedItems.experiences!.map((id) =>
            String(id),
          );
          return selectedIds.includes(expId);
        })
      : experiences;
  const filteredEducations =
    selectedItems.educations && selectedItems.educations.length > 0
      ? educations.filter((edu) => {
          const eduId = String(edu.id);
          const selectedIds = selectedItems.educations!.map((id) => String(id));
          return selectedIds.includes(eduId);
        })
      : educations;
  const filteredProjects =
    selectedItems.projects && selectedItems.projects.length > 0
      ? projects.filter((proj) => {
          // Comparer les IDs en les convertissant en strings pour éviter les problèmes de type
          const projId = String(proj.id);
          const selectedIds = selectedItems.projects!.map((id) => String(id));
          const isIncluded = selectedIds.includes(projId);
          return isIncluded;
        })
      : projects;

  const filteredSkills =
    selectedItems.skills && selectedItems.skills.length > 0
      ? skills.filter((skill) => selectedItems.skills!.includes(skill.name))
      : skills;
  const filteredLanguages =
    selectedItems.languages && selectedItems.languages.length > 0
      ? languages.filter((lang) => {
          const langId = String(lang.id);
          const selectedIds = selectedItems.languages!.map((id) => String(id));
          return selectedIds.includes(langId);
        })
      : languages;
  const filteredCertifications =
    selectedItems.certifications && selectedItems.certifications.length > 0
      ? certifications.filter((cert) => {
          const certId = String(cert.id);
          const selectedIds = selectedItems.certifications!.map((id) =>
            String(id),
          );
          return selectedIds.includes(certId);
        })
      : certifications;
  const filteredInterests =
    selectedItems.interests && selectedItems.interests.length > 0
      ? interests.filter((interest) => {
          const interestId = String(interest.id);
          const selectedIds = selectedItems.interests!.map((id) => String(id));
          return selectedIds.includes(interestId);
        })
      : interests;

  // Appliquer l'ordre personnalisé si disponible
  const itemOrder = config.itemOrder;
  const orderedProjects =
    itemOrder?.projects && itemOrder.projects.length > 0
      ? applyItemOrder(filteredProjects, itemOrder.projects, (p) => p.id)
      : filteredProjects;

  const orderedSkills =
    itemOrder?.skills && itemOrder.skills.length > 0
      ? applyItemOrder(filteredSkills, itemOrder.skills, (s) => s.id || s.name)
      : filteredSkills;

  const orderedLanguages =
    itemOrder?.languages && itemOrder.languages.length > 0
      ? applyItemOrder(filteredLanguages, itemOrder.languages, (l) => l.id)
      : filteredLanguages;

  const orderedCertifications =
    itemOrder?.certifications && itemOrder.certifications.length > 0
      ? applyItemOrder(
          filteredCertifications,
          itemOrder.certifications,
          (c) => c.id,
        )
      : filteredCertifications;

  const orderedInterests =
    itemOrder?.interests && itemOrder.interests.length > 0
      ? applyItemOrder(filteredInterests, itemOrder.interests, (i) => i.id)
      : filteredInterests;

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return <HeroSection key="hero" user={user} profile={profile} />;
      case "about":
        return <AboutSection key="about" profile={profile} />;
      case "experiences":
        return (
          <ExperiencesSection
            key="experiences"
            experiences={filteredExperiences}
            showLogos={showLogos}
          />
        );
      case "education":
        return (
          <EducationSection
            key="education"
            educations={filteredEducations}
            showLogos={showLogos}
          />
        );
      case "projects":
        return <ProjectsSection key="projects" projects={orderedProjects} />;
      case "skills":
        return <SkillsSection key="skills" skills={orderedSkills} />;
      case "languages":
        return (
          <LanguagesSection key="languages" languages={orderedLanguages} />
        );
      case "certifications":
        return (
          <CertificationsSection
            key="certifications"
            certifications={orderedCertifications}
          />
        );
      case "contact":
        return <ContactSection key="contact" profile={profile} />;
      default:
        return null;
    }
  };

  // Si un template personnalisé est sélectionné, utiliser le template
  const currentTemplate = config.template || "default";
  const currentColorMode = config.colorMode || "dark";

  // Convertir la config backend vers TemplateCustomization pour les templates (template6 couleurs depuis templateOverrides)
  const rawOverrides = config.templateOverrides as
    | Record<string, unknown>
    | null
    | undefined;
  const template6ColorsFromConfig = (rawOverrides?.template6_colors ??
    rawOverrides?.template6Colors) as
    | TemplateCustomization["template6Colors"]
    | undefined;
  const fontTitles = rawOverrides?.font_titles as string | undefined;
  const fontSubtitles = rawOverrides?.font_subtitles as string | undefined;
  const fontItem = rawOverrides?.font_item as string | undefined;
  const fontItemSmall = rawOverrides?.font_item_small as string | undefined;
  const fontBody = rawOverrides?.font_body as string | undefined;
  const customFontsFromConfig = rawOverrides?.custom_fonts as
    | TemplateCustomization["customFonts"]
    | undefined;
  const customization: TemplateCustomization = {
    fontFamily: cssFontToFrontend(config.theme?.fontFamily),
    colorTheme: colorModeToColorTheme(config.colorMode),
    sections: backendSectionsToFrontend(config.layout, lang),
    projectsLayout: "grid", // Par défaut, peut être amélioré plus tard
    cvId: config.cvId || null, // Inclure le cvId pour le bouton CV
    cvUrl: config.cvUrl || null, // Inclure l'URL du CV pour la vue publique
    ...(template6ColorsFromConfig &&
    Object.keys(template6ColorsFromConfig).length > 0
      ? { template6Colors: template6ColorsFromConfig }
      : {}),
    ...(fontTitles != null ||
    fontSubtitles != null ||
    fontItem != null ||
    fontItemSmall != null ||
    fontBody != null
      ? {
          templateFonts: {
            titles: fontTitles,
            subtitles: fontSubtitles,
            item: fontItem,
            itemSmall: fontItemSmall,
            body: fontBody,
          },
        }
      : {}),
    ...(Array.isArray(customFontsFromConfig) && customFontsFromConfig.length > 0
      ? { customFonts: customFontsFromConfig }
      : {}),
    lang,
  };

  // Utiliser une key unique basée sur le template (et fond hero) pour forcer le re-render et permettre l'autoplay vidéo
  const rawOverridesForKey = config.templateOverrides as
    | Record<string, unknown>
    | null
    | undefined;
  const heroBgType = rawOverridesForKey?.hero_background_type ?? "default";
  const templateKey = `${currentTemplate}-${currentColorMode}-${customization.fontFamily}-${heroBgType}`;

  if (currentTemplate && currentTemplate !== "default") {
    switch (currentTemplate) {
      case "template1":
        return (
          <TemplateErrorBoundary
            key={templateKey}
            fallback={
              <div className="w-full bg-theme-bg-primary p-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    Erreur lors du chargement du template
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Retour au template classique...
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="w-full bg-theme-bg-primary p-8">
                  <div className="text-center">
                    <p className="text-theme-text-primary mb-4">
                      Chargement du template...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                </div>
              }
            >
              <Template1
                key={templateKey}
                user={user || null}
                profile={profile || null}
                experiences={filteredExperiences}
                educations={filteredEducations}
                showLogos={showLogos}
                projects={orderedProjects}
                skills={orderedSkills}
                languages={orderedLanguages}
                certifications={orderedCertifications}
                interests={orderedInterests}
                itemOrder={itemOrder}
                theme={currentColorMode as "light" | "dark"}
                customization={customization}
                templateOverrides={config.templateOverrides}
                isEditable={isPreview}
                lang={lang}
                onThemeChange={(newTheme) => {
                  // Mettre à jour la config avec le nouveau thème
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      colorMode: newTheme,
                    });
                  }
                }}
                onItemOrderChange={(newItemOrder) => {
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      itemOrder: newItemOrder,
                    });
                  }
                }}
              />
            </Suspense>
          </TemplateErrorBoundary>
        );
      case "template2":
        return (
          <TemplateErrorBoundary
            key={templateKey}
            fallback={
              <div className="w-full bg-theme-bg-primary p-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    Erreur lors du chargement du template
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Retour au template classique...
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="w-full bg-theme-bg-primary p-8">
                  <div className="text-center">
                    <p className="text-theme-text-primary mb-4">
                      Chargement du template...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                </div>
              }
            >
              <Template2
                key={templateKey}
                user={user || null}
                profile={profile || null}
                experiences={filteredExperiences}
                educations={filteredEducations}
                showLogos={showLogos}
                projects={orderedProjects}
                skills={orderedSkills}
                languages={orderedLanguages}
                certifications={orderedCertifications}
                interests={orderedInterests}
                itemOrder={itemOrder}
                isEditable={isPreview}
                theme={currentColorMode as "light" | "dark"}
                customization={customization}
                templateOverrides={config.templateOverrides}
                onThemeChange={(newTheme) => {
                  // Mettre à jour la config avec le nouveau thème
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      colorMode: newTheme,
                    });
                  }
                }}
                onItemOrderChange={(newItemOrder) => {
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      itemOrder: newItemOrder,
                    });
                  }
                }}
              />
            </Suspense>
          </TemplateErrorBoundary>
        );
      case "template3":
        return (
          <TemplateErrorBoundary
            key={templateKey}
            fallback={
              <div className="w-full bg-theme-bg-primary p-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    Erreur lors du chargement du template
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Retour au template classique...
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="w-full bg-theme-bg-primary p-8">
                  <div className="text-center">
                    <p className="text-theme-text-primary mb-4">
                      Chargement du template...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                </div>
              }
            >
              <Template3
                key={templateKey}
                user={user || null}
                profile={profile || null}
                experiences={filteredExperiences}
                educations={filteredEducations}
                showLogos={showLogos}
                projects={orderedProjects}
                skills={orderedSkills}
                languages={orderedLanguages}
                certifications={orderedCertifications}
                interests={orderedInterests}
                itemOrder={itemOrder}
                theme={currentColorMode as "light" | "dark"}
                customization={customization}
                templateOverrides={config.templateOverrides}
                onThemeChange={(newTheme) => {
                  // Mettre à jour la config avec le nouveau thème
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      colorMode: newTheme,
                    });
                  }
                }}
              />
            </Suspense>
          </TemplateErrorBoundary>
        );
      case "template4":
        return (
          <TemplateErrorBoundary
            key={templateKey}
            fallback={
              <div className="w-full bg-theme-bg-primary p-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    Erreur lors du chargement du template
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Retour au template classique...
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="w-full bg-theme-bg-primary p-8">
                  <div className="text-center">
                    <p className="text-theme-text-primary mb-4">
                      Chargement du template...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                </div>
              }
            >
              <Template4
                key={templateKey}
                user={user || null}
                profile={profile || null}
                experiences={filteredExperiences}
                educations={filteredEducations}
                showLogos={showLogos}
                projects={orderedProjects}
                skills={orderedSkills}
                languages={orderedLanguages}
                certifications={orderedCertifications}
                interests={orderedInterests}
                itemOrder={itemOrder}
                isEditable={isPreview}
                theme={currentColorMode as "light" | "dark"}
                customization={customization}
                templateOverrides={config.templateOverrides}
                onThemeChange={(newTheme) => {
                  // Mettre à jour la config avec le nouveau thème
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      colorMode: newTheme,
                    });
                  }
                }}
                onItemOrderChange={(newItemOrder) => {
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      itemOrder: newItemOrder,
                    });
                  }
                }}
              />
            </Suspense>
          </TemplateErrorBoundary>
        );
      case "template5":
        return (
          <TemplateErrorBoundary
            key={templateKey}
            fallback={
              <div className="w-full bg-theme-bg-primary p-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    Erreur lors du chargement du template
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Retour au template classique...
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="w-full bg-theme-bg-primary p-8">
                  <div className="text-center">
                    <p className="text-theme-text-primary mb-4">
                      Chargement du template...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                </div>
              }
            >
              <Template5
                key={templateKey}
                user={user || null}
                profile={profile || null}
                experiences={filteredExperiences}
                educations={filteredEducations}
                showLogos={showLogos}
                projects={orderedProjects}
                skills={orderedSkills}
                languages={orderedLanguages}
                certifications={orderedCertifications}
                interests={orderedInterests}
                itemOrder={itemOrder}
                isEditable={isPreview}
                theme={currentColorMode as "light" | "dark"}
                customization={customization}
                templateOverrides={config.templateOverrides}
                onThemeChange={(newTheme) => {
                  // Mettre à jour la config avec le nouveau thème
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      colorMode: newTheme,
                    });
                  }
                }}
                isPreview={isPreview}
                onItemOrderChange={(newItemOrder) => {
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      itemOrder: newItemOrder,
                    });
                  }
                }}
              />
            </Suspense>
          </TemplateErrorBoundary>
        );
      case "template6":
        return (
          <TemplateErrorBoundary
            key={templateKey}
            fallback={
              <div className="w-full bg-theme-bg-primary p-8">
                <div className="text-center">
                  <p className="text-red-500 mb-4">
                    Erreur lors du chargement du template
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Retour au template classique...
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="w-full bg-theme-bg-primary p-8">
                  <div className="text-center">
                    <p className="text-theme-text-primary mb-4">
                      Chargement du template...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                </div>
              }
            >
              <Template6
                key={templateKey}
                user={user || null}
                profile={profile || null}
                experiences={filteredExperiences}
                educations={filteredEducations}
                showLogos={showLogos}
                projects={orderedProjects}
                skills={orderedSkills}
                languages={orderedLanguages}
                certifications={orderedCertifications}
                interests={orderedInterests}
                itemOrder={itemOrder}
                isEditable={isPreview}
                theme={currentColorMode as "light" | "dark"}
                customization={customization}
                templateOverrides={config.templateOverrides}
                onHeroOverridesChange={(overrides) => {
                  // Mettre à jour les templateOverrides dans la config
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      templateOverrides: {
                        ...config.templateOverrides,
                        ...overrides,
                      },
                    });
                  }
                }}
                onThemeChange={(newTheme) => {
                  // Mettre à jour la config avec le nouveau thème
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      colorMode: newTheme,
                    });
                  }
                }}
                isPreview={isPreview}
                onItemOrderChange={(newItemOrder) => {
                  if (onConfigChange) {
                    onConfigChange({
                      ...config,
                      itemOrder: newItemOrder,
                    });
                  }
                }}
              />
            </Suspense>
          </TemplateErrorBoundary>
        );
      default:
        // Fallback sur le rendu par sections (template par défaut)
        break;
    }
  }

  // Rendu par défaut (sections individuelles)
  return (
    <div className="w-full bg-theme-bg-primary">
      {visibleSections.length > 0 ? (
        visibleSections.map((section) => renderSection(section.type))
      ) : (
        <div className="w-full bg-theme-bg-primary p-8">
          <div className="text-center">
            <p className="text-theme-text-primary mb-4">
              Aucune section visible
            </p>
            <p className="text-theme-text-muted text-sm">
              Veuillez activer au moins une section dans la configuration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
