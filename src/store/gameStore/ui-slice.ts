import type { GameState, SetState, GetState, GamificationStats } from "./types";

type UISlice = Pick<
  GameState,
  | "view"
  | "profileScrollToSection"
  | "studentProfilesPreselectedCohortName"
  | "activeToast"
  | "showConfetti"
  | "backgroundTask"
  | "setView"
  | "setProfileScrollToSection"
  | "setStudentProfilesPreselectedCohort"
  | "setActiveToast"
  | "setGamification"
  | "setBosseurStreak"
  | "setShowConfetti"
  | "setBackgroundTask"
>;

export const createUISlice = (_set: SetState, _get: GetState): UISlice => ({
  view: "landing",
  profileScrollToSection: null,
  studentProfilesPreselectedCohortName: null,
  activeToast: null,
  showConfetti: false,
  backgroundTask: {
    active: false,
    type: null,
    message: "",
  },

  setView: (view) => _set({ view }),
  setProfileScrollToSection: (section) =>
    _set({ profileScrollToSection: section }),
  setStudentProfilesPreselectedCohort: (name) =>
    _set({ studentProfilesPreselectedCohortName: name }),
  setActiveToast: (toast) => _set({ activeToast: toast }),
  setGamification: (stats: GamificationStats) => _set({ gamification: stats }),
  setBosseurStreak: (data) => _set({ bosseurStreak: data }),
  setShowConfetti: (show) => _set({ showConfetti: show }),
  setBackgroundTask: (task) =>
    _set((state) => ({
      backgroundTask: {
        active: task.active,
        type: task.type ?? state.backgroundTask.type,
        message: task.message ?? state.backgroundTask.message,
      },
    })),
});
