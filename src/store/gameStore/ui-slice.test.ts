import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./index";

describe("UI Slice", () => {
  beforeEach(() => {
    useGameStore.setState({
      view: "landing",
      activeToast: null,
      showConfetti: false,
      profileScrollToSection: null,
      studentProfilesPreselectedCohortName: null,
      backgroundTask: { active: false, type: null, message: "" },
    });
  });

  it("setView change la vue courante", () => {
    useGameStore.getState().setView("dashboard");
    expect(useGameStore.getState().view).toBe("dashboard");
  });

  it("setActiveToast definit et efface un toast", () => {
    const toast = { type: "success" as const, title: "OK", message: "Done" };
    useGameStore.getState().setActiveToast(toast);
    expect(useGameStore.getState().activeToast).toEqual(toast);

    useGameStore.getState().setActiveToast(null);
    expect(useGameStore.getState().activeToast).toBeNull();
  });

  it("setShowConfetti toggle le confetti", () => {
    useGameStore.getState().setShowConfetti(true);
    expect(useGameStore.getState().showConfetti).toBe(true);

    useGameStore.getState().setShowConfetti(false);
    expect(useGameStore.getState().showConfetti).toBe(false);
  });

  it("setProfileScrollToSection stocke et efface la section", () => {
    useGameStore.getState().setProfileScrollToSection("skills");
    expect(useGameStore.getState().profileScrollToSection).toBe("skills");

    useGameStore.getState().setProfileScrollToSection(null);
    expect(useGameStore.getState().profileScrollToSection).toBeNull();
  });

  it("setBackgroundTask met a jour la tache en arriere-plan", () => {
    useGameStore.getState().setBackgroundTask({
      active: true,
      type: "cv_import",
      message: "Import en cours...",
    });

    const task = useGameStore.getState().backgroundTask;
    expect(task.active).toBe(true);
    expect(task.type).toBe("cv_import");
    expect(task.message).toBe("Import en cours...");
  });

  it("setBackgroundTask preserve type/message si non fournis", () => {
    useGameStore.getState().setBackgroundTask({
      active: true,
      type: "ai_processing",
      message: "Traitement IA",
    });

    useGameStore.getState().setBackgroundTask({ active: false });

    const task = useGameStore.getState().backgroundTask;
    expect(task.active).toBe(false);
    expect(task.type).toBe("ai_processing");
    expect(task.message).toBe("Traitement IA");
  });
});
