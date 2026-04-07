import type { GameState, SetState, GetState } from "./types";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "./types";

type TemplateSlice = Pick<
  GameState,
  | "selectedTemplateId"
  | "isEditingExistingTemplate"
  | "portfolioTemplateOverrides"
  | "templateCustomization"
  | "setSelectedTemplateId"
  | "setIsEditingExistingTemplate"
  | "setPortfolioTemplateOverrides"
  | "selectTemplate"
  | "updateTemplateCustomization"
  | "toggleSection"
  | "reorderSections"
  | "reorderBigSectionsTemplate4"
  | "reorderSectionsTemplate5"
  | "resetTemplateCustomization"
>;

export const createTemplateSlice = (
  set: SetState,
  _get: GetState,
): TemplateSlice => ({
  selectedTemplateId: null,
  isEditingExistingTemplate: false,
  portfolioTemplateOverrides: null,
  templateCustomization: {
    colorTheme: "light",
    fontFamily: "sans",
    sections: [
      { id: "about", label: "À propos", visible: true },
      { id: "experiences", label: "Expériences", visible: true },
      { id: "education", label: "Formation", visible: true },
      { id: "projects", label: "Projets", visible: true },
      { id: "skills", label: "Compétences", visible: true },
      { id: "languages", label: "Langues", visible: true },
      { id: "certifications", label: "Certifications", visible: true },
      { id: "interests", label: "Centres d'intérêt", visible: true },
      { id: "contact", label: "Contact", visible: true },
    ],
    projectsLayout: "grid",
    showLogos: true,
    template5ColumnOrder: {
      educationCertifications: "education_left",
      languagesInterests: "languages_left",
    },
  },

  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  setIsEditingExistingTemplate: (isEditing) =>
    set({ isEditingExistingTemplate: isEditing }),

  setPortfolioTemplateOverrides: (o) =>
    set((state) => ({
      portfolioTemplateOverrides:
        typeof o === "function" ? o(state.portfolioTemplateOverrides) : o,
    })),

  selectTemplate: (id) => {
    const templates: Record<
      string,
      { baseTheme: "light" | "dark" | "blue" | "purple" }
    > = {
      template1: { baseTheme: "dark" },
      template2: { baseTheme: "light" },
      template3: { baseTheme: "light" },
      template4: { baseTheme: "light" },
      template5: { baseTheme: "dark" },
      template6: { baseTheme: "light" },
    };

    const template = templates[id] || { baseTheme: "light" };

    set({
      selectedTemplateId: id,
      isEditingExistingTemplate: false,
      templateCustomization: {
        colorTheme: template.baseTheme,
        fontFamily: "sans",
        sections: [
          { id: "about", label: "À propos", visible: true },
          { id: "experiences", label: "Expériences", visible: true },
          { id: "education", label: "Formation", visible: true },
          { id: "projects", label: "Projets", visible: true },
          { id: "skills", label: "Compétences", visible: true },
          { id: "languages", label: "Langues", visible: true },
          { id: "certifications", label: "Certifications", visible: true },
          { id: "interests", label: "Centres d'intérêt", visible: true },
          { id: "contact", label: "Contact", visible: true },
        ],
        projectsLayout: "grid",
      },
    });
  },

  updateTemplateCustomization: (updates) =>
    set((state) => ({
      templateCustomization: { ...state.templateCustomization, ...updates },
    })),

  toggleSection: (sectionId) =>
    set((state) => ({
      templateCustomization: {
        ...state.templateCustomization,
        sections: state.templateCustomization.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s,
        ),
      },
    })),

  reorderSections: (dragIndex, hoverIndex) =>
    set((state) => {
      const newSections = [...state.templateCustomization.sections];
      const [draggedItem] = newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, draggedItem);
      return {
        templateCustomization: {
          ...state.templateCustomization,
          sections: newSections,
        },
      };
    }),

  reorderBigSectionsTemplate4: (orderedBlockIds) =>
    set((state) => {
      const byId = new Map(
        state.templateCustomization.sections.map((s) => [s.id, s]),
      );
      const stackIds = [
        "education",
        "skills",
        "languages",
        "certifications",
        "interests",
      ];
      const result: Array<{ id: string; label: string; visible: boolean }> = [];
      result.push(
        byId.get("about") ?? { id: "about", label: "À propos", visible: true },
      );
      for (const blockId of orderedBlockIds) {
        if (blockId === "stack") {
          for (const sid of stackIds) {
            result.push(
              byId.get(sid) ?? { id: sid, label: sid, visible: true },
            );
          }
        } else {
          const s = byId.get(blockId);
          if (s) result.push(s);
        }
      }
      const labels: Record<string, string> = {
        about: "À propos",
        experiences: "Expériences",
        education: "Formation",
        projects: "Projets",
        skills: "Compétences",
        languages: "Langues",
        certifications: "Certifications",
        interests: "Centres d'intérêt",
        contact: "Contact",
      };
      return {
        templateCustomization: {
          ...state.templateCustomization,
          sections: result.map((s) => ({
            ...s,
            label: labels[s.id] ?? s.label,
          })),
        },
      };
    }),

  reorderSectionsTemplate5: (orderedBlockIds) =>
    set((state) => {
      const byId = new Map(
        state.templateCustomization.sections.map((s) => [s.id, s]),
      );
      const labels: Record<string, string> = {
        about: "À propos",
        experiences: "Expériences",
        education: "Formation",
        projects: "Projets",
        skills: "Compétences",
        languages: "Langues",
        certifications: "Certifications",
        interests: "Centres d'intérêt",
        contact: "Contact",
      };
      const result: Array<{ id: string; label: string; visible: boolean }> = [];
      for (const blockId of orderedBlockIds) {
        if (blockId === "about") {
          result.push(
            byId.get("about") ?? {
              id: "about",
              label: "À propos",
              visible: true,
            },
          );
        } else if (blockId === "education_certifications") {
          result.push(
            byId.get("education") ?? {
              id: "education",
              label: "Formation",
              visible: true,
            },
          );
          result.push(
            byId.get("certifications") ?? {
              id: "certifications",
              label: "Certifications",
              visible: true,
            },
          );
        } else if (blockId === "languages_interests") {
          result.push(
            byId.get("languages") ?? {
              id: "languages",
              label: "Langues",
              visible: true,
            },
          );
          result.push(
            byId.get("interests") ?? {
              id: "interests",
              label: "Centres d'intérêt",
              visible: true,
            },
          );
        } else {
          const s = byId.get(blockId);
          if (s) result.push(s);
        }
      }
      return {
        templateCustomization: {
          ...state.templateCustomization,
          sections: result.map((s) => ({
            ...s,
            label: labels[s.id] ?? s.label,
          })),
        },
      };
    }),

  resetTemplateCustomization: () =>
    set({ templateCustomization: DEFAULT_TEMPLATE_CUSTOMIZATION }),
});
