import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore, DEFAULT_TEMPLATE_CUSTOMIZATION } from "./index";

describe("Template Slice", () => {
  beforeEach(() => {
    useGameStore.getState().resetTemplateCustomization();
    useGameStore.setState({
      selectedTemplateId: null,
      isEditingExistingTemplate: false,
      portfolioTemplateOverrides: null,
    });
  });

  it("selectTemplate change le template et reinitialise la customization", () => {
    useGameStore.getState().selectTemplate("template1");

    const state = useGameStore.getState();
    expect(state.selectedTemplateId).toBe("template1");
    expect(state.isEditingExistingTemplate).toBe(false);
    expect(state.templateCustomization.colorTheme).toBe("dark");
  });

  it("selectTemplate applique le bon theme de base par template", () => {
    useGameStore.getState().selectTemplate("template2");
    expect(useGameStore.getState().templateCustomization.colorTheme).toBe(
      "light",
    );

    useGameStore.getState().selectTemplate("template5");
    expect(useGameStore.getState().templateCustomization.colorTheme).toBe(
      "dark",
    );
  });

  it("updateTemplateCustomization merge les mises a jour", () => {
    useGameStore.getState().updateTemplateCustomization({
      colorTheme: "blue",
      fontFamily: "serif",
    });

    const customization = useGameStore.getState().templateCustomization;
    expect(customization.colorTheme).toBe("blue");
    expect(customization.fontFamily).toBe("serif");
    expect(customization.sections.length).toBeGreaterThan(0);
  });

  it("toggleSection inverse la visibilite d'une section", () => {
    const aboutBefore = useGameStore
      .getState()
      .templateCustomization.sections.find((s) => s.id === "about");
    expect(aboutBefore?.visible).toBe(true);

    useGameStore.getState().toggleSection("about");

    const aboutAfter = useGameStore
      .getState()
      .templateCustomization.sections.find((s) => s.id === "about");
    expect(aboutAfter?.visible).toBe(false);
  });

  it("reorderSections deplace une section", () => {
    const sectionsBefore =
      useGameStore.getState().templateCustomization.sections;
    const firstId = sectionsBefore[0].id;
    const secondId = sectionsBefore[1].id;

    useGameStore.getState().reorderSections(0, 1);

    const sectionsAfter =
      useGameStore.getState().templateCustomization.sections;
    expect(sectionsAfter[0].id).toBe(secondId);
    expect(sectionsAfter[1].id).toBe(firstId);
  });

  it("resetTemplateCustomization retablit les valeurs par defaut", () => {
    useGameStore.getState().updateTemplateCustomization({
      colorTheme: "purple",
      fontFamily: "mono",
    });

    useGameStore.getState().resetTemplateCustomization();

    const customization = useGameStore.getState().templateCustomization;
    expect(customization.colorTheme).toBe(
      DEFAULT_TEMPLATE_CUSTOMIZATION.colorTheme,
    );
    expect(customization.fontFamily).toBe(
      DEFAULT_TEMPLATE_CUSTOMIZATION.fontFamily,
    );
  });

  it("setPortfolioTemplateOverrides accepte une valeur ou une fonction", () => {
    useGameStore
      .getState()
      .setPortfolioTemplateOverrides({ hero_title: "Mon Portfolio" } as any);
    expect(useGameStore.getState().portfolioTemplateOverrides).toEqual({
      hero_title: "Mon Portfolio",
    });

    useGameStore
      .getState()
      .setPortfolioTemplateOverrides(
        (prev) => ({ ...prev, hero_subtitle: "Dev" }) as any,
      );
    expect(useGameStore.getState().portfolioTemplateOverrides).toEqual({
      hero_title: "Mon Portfolio",
      hero_subtitle: "Dev",
    });
  });
});
