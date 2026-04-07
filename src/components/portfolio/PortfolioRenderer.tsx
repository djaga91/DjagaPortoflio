import React from "react";
import { useGameStore } from "../../store/gameStore";
import {
  Template1,
  Template2,
  Template3,
  Template4,
  Template5,
} from "./templates";
import { Template6 } from "./templates/Template6";

export const PortfolioRenderer: React.FC = () => {
  const {
    templateCustomization,
    selectedTemplateId,
    user,
    profile,
    experiences,
    educations,
    projects,
    skills,
    languages,
    certifications,
    interests,
    portfolioTemplateOverrides,
    setPortfolioTemplateOverrides,
    updateSkill,
  } = useGameStore();

  // Convertir colorTheme en theme pour les templates existants
  const getThemeForTemplate = (): "light" | "dark" => {
    if (templateCustomization.colorTheme === "dark") return "dark";
    return "light";
  };

  const theme = getThemeForTemplate();

  // Filtrer les données selon les sélections
  const selectedItems = templateCustomization.selectedItems || {};
  // Si selectedItems.experiences est défini ET non vide, filtrer, sinon afficher tout
  const filteredExperiences =
    selectedItems.experiences && selectedItems.experiences.length > 0
      ? (experiences || []).filter((exp) =>
          selectedItems.experiences!.includes(exp.id),
        )
      : experiences || [];
  const filteredEducations =
    selectedItems.educations && selectedItems.educations.length > 0
      ? (educations || []).filter((edu) =>
          selectedItems.educations!.includes(edu.id),
        )
      : educations || [];
  const filteredProjects =
    selectedItems.projects && selectedItems.projects.length > 0
      ? (projects || []).filter((proj) =>
          selectedItems.projects!.includes(proj.id),
        )
      : projects || [];
  const filteredSkills =
    selectedItems.skills && selectedItems.skills.length > 0
      ? (skills || []).filter((skill) =>
          selectedItems.skills!.includes(skill.name),
        )
      : skills || [];
  const filteredLanguages =
    selectedItems.languages && selectedItems.languages.length > 0
      ? (languages || []).filter((lang) =>
          selectedItems.languages!.includes(lang.id),
        )
      : languages || [];
  const filteredCertifications =
    selectedItems.certifications && selectedItems.certifications.length > 0
      ? (certifications || []).filter((cert) =>
          selectedItems.certifications!.includes(cert.id),
        )
      : certifications || [];
  const filteredInterests =
    selectedItems.interests && selectedItems.interests.length > 0
      ? (interests || []).filter((interest) =>
          selectedItems.interests!.includes(interest.id),
        )
      : interests || [];

  // Appliquer l'ordre personnalisé aux items
  const itemOrder = templateCustomization.itemOrder;

  // Props communes pour tous les templates (mode éditeur : isEditable + overrides hero)
  const commonProps = {
    user,
    profile,
    experiences: filteredExperiences,
    educations: filteredEducations,
    projects: filteredProjects,
    skills: filteredSkills,
    languages: filteredLanguages,
    certifications: filteredCertifications,
    interests: filteredInterests,
    theme,
    customization: templateCustomization,
    onThemeChange: (newTheme: "light" | "dark") => {
      useGameStore.setState({
        templateCustomization: {
          ...templateCustomization,
          colorTheme: newTheme === "dark" ? "dark" : "light",
        },
      });
    },
    templateOverrides: portfolioTemplateOverrides ?? undefined,
    isEditable: true,
    showLogos: templateCustomization.showLogos !== false, // Par défaut true
    onHeroOverridesChange: setPortfolioTemplateOverrides
      ? (o: Partial<import("../../types").TemplateOverrides>) => {
          setPortfolioTemplateOverrides((prev) => ({ ...(prev ?? {}), ...o }));
        }
      : undefined,
    itemOrder: itemOrder,
    onItemOrderChange: (newItemOrder: typeof itemOrder) => {
      useGameStore.setState({
        templateCustomization: {
          ...templateCustomization,
          itemOrder: newItemOrder,
        },
      });
    },
  };

  // Appliquer la typographie via une classe CSS globale
  React.useEffect(() => {
    const fontClass =
      templateCustomization.fontFamily === "serif"
        ? "font-serif"
        : templateCustomization.fontFamily === "mono"
          ? "font-mono"
          : "font-sans";

    // Appliquer la classe au document body ou à un conteneur parent
    const container = document.querySelector(".portfolio-container");
    if (container) {
      container.className = `portfolio-container ${fontClass}`;
    }
  }, [templateCustomization.fontFamily]);

  // Rendre le template approprié selon l'ID sélectionné
  if (!selectedTemplateId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Aucun template sélectionné
          </p>
        </div>
      </div>
    );
  }

  const fontClass =
    templateCustomization.fontFamily === "serif"
      ? "font-serif"
      : templateCustomization.fontFamily === "mono"
        ? "font-mono"
        : "font-sans";

  switch (selectedTemplateId) {
    case "template1":
      return (
        <div className={`portfolio-container ${fontClass}`}>
          <Template1 {...commonProps} />
        </div>
      );
    case "template2":
      return (
        <div className={`portfolio-container ${fontClass}`}>
          <Template2 {...commonProps} />
        </div>
      );
    case "template3":
      return (
        <div className={`portfolio-container ${fontClass}`}>
          <Template3
            {...commonProps}
            theme={
              templateCustomization.colorTheme === "light" ? "light" : "dark"
            }
            isPreview={true}
            onSkillLevelChange={
              updateSkill
                ? (skillId, level) => updateSkill(skillId, { level })
                : undefined
            }
          />
        </div>
      );
    case "template4":
      return (
        <div className={`portfolio-container ${fontClass}`}>
          <Template4 {...commonProps} isPreview={true} />
        </div>
      );
    case "template5":
      return (
        <div className={`portfolio-container ${fontClass}`}>
          <Template5 {...commonProps} isPreview={true} />
        </div>
      );
    case "template6":
      return (
        <div className={`portfolio-container ${fontClass}`}>
          <Template6 {...commonProps} isPreview={true} />
        </div>
      );
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Template non trouvé
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Template ID: {selectedTemplateId || "aucun"}
            </p>
          </div>
        </div>
      );
  }
};
