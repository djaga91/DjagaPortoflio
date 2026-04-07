import { authAPI, organizationsAPI } from "../../services/api";
import type { GameState, SetState, GetState, ViewType } from "./types";

type InitSlice = Pick<GameState, "initialize">;

export const createInitSlice = (set: SetState, get: GetState): InitSlice => ({
  initialize: async () => {
    set({ isInitializing: true });
    const hasLocalToken = !!localStorage.getItem("access_token");

    try {
      const user = await authAPI.getMe();
      set({ user, isAuthenticated: true });

      await Promise.all([
        get().fetchProfile(),
        get().fetchExperiences(),
        get().fetchEducations(),
        get().fetchProjects(),
        get().fetchLanguages(),
        get().fetchCertifications(),
        get().fetchInterests(),
        get().fetchSkills(),
        get().loadGamification(),
      ]);

      get().loadPersistedMatchingResults();
      await get().updateStreak();

      let targetView: ViewType = "dashboard";

      try {
        const { items } = await organizationsAPI.getMyOrganizations();
        if (items?.length > 0) {
          const org = items[0];
          organizationsAPI.setCurrentOrganization(org);
          const role = org.user_role || "";
          if (
            org.type === "school" &&
            ["admin", "coach", "teacher", "viewer"].includes(role)
          ) {
            targetView = "school_dashboard";
          } else if (
            org.type === "company" &&
            ["company_admin", "recruiter"].includes(role)
          ) {
            targetView = "company_dashboard";
          }
        } else {
          organizationsAPI.setCurrentOrganization(null);
        }
      } catch (e) {
        console.warn("Impossible de charger les organisations:", e);
        organizationsAPI.setCurrentOrganization(null);
      }

      set({ view: targetView, isInitializing: false });
    } catch (error) {
      console.error("Erreur initialization:", error);
      if (hasLocalToken) {
        get().logout();
      }
      const hasCache = get().loadGuestGamification();
      if (!hasCache) {
        set({
          gamification: {
            xp: 0,
            level: 1,
            badges: [],
            streak: 0,
            last_activity: new Date().toISOString(),
            xp_to_next_level: 100,
          },
        });
      }
      set({
        view: "landing",
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },
});
