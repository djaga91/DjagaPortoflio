import {
  gamificationAPI,
  educationsAPI,
  projectsAPI,
  interestsAPI,
  languagesAPI,
} from "../../services/api";
import { LEVEL_THRESHOLDS, LEVEL_TITLES, BADGE_DEFINITIONS } from "../../types";
import type { GameState, SetState, GetState } from "./types";

type GamificationSlice = Pick<
  GameState,
  | "gamification"
  | "bosseurStreak"
  | "addPts"
  | "unlockBadge"
  | "updateStreak"
  | "loadGamification"
  | "saveGuestGamification"
  | "loadGuestGamification"
  | "clearGuestGamification"
  | "transferGuestGamification"
  | "syncOnboardingProfile"
>;

export const createGamificationSlice = (
  set: SetState,
  get: GetState,
): GamificationSlice => ({
  gamification: {
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,
    last_activity: new Date().toISOString(),
    xp_to_next_level: 100,
  },
  bosseurStreak: null,

  saveGuestGamification: () => {
    const { gamification } = get();
    localStorage.setItem(
      "guest_gamification",
      JSON.stringify({
        xp: gamification.xp,
        badges: gamification.badges,
        last_activity: gamification.last_activity,
      }),
    );
  },

  loadGuestGamification: () => {
    try {
      const cached = localStorage.getItem("guest_gamification");
      if (cached) {
        const data = JSON.parse(cached);
        const currentLevel =
          LEVEL_THRESHOLDS.findIndex((threshold, i) => {
            const next = LEVEL_THRESHOLDS[i + 1];
            return (
              data.xp >= threshold && (next === undefined || data.xp < next)
            );
          }) + 1;

        set({
          gamification: {
            xp: data.xp,
            level: currentLevel,
            badges: data.badges || [],
            streak: 0,
            last_activity: data.last_activity || new Date().toISOString(),
            xp_to_next_level: LEVEL_THRESHOLDS[currentLevel] || 100,
          },
        });
        return true;
      }
    } catch (error) {
      console.error("Erreur chargement cache guest:", error);
    }
    return false;
  },

  clearGuestGamification: () => {
    localStorage.removeItem("guest_gamification");
  },

  transferGuestGamification: async () => {
    try {
      const cached = localStorage.getItem("guest_gamification");
      if (!cached) return;

      const data = JSON.parse(cached);

      if (data.xp > 0) {
        await gamificationAPI.addXP(
          data.xp,
          "Points transférés depuis le mode guest",
        );
      }

      if (data.badges && data.badges.length > 0) {
        for (const badgeId of data.badges) {
          try {
            await gamificationAPI.unlockBadge(badgeId);
          } catch {
            // Badge déjà débloqué
          }
        }
      }

      const stats = await gamificationAPI.getStats();
      set({ gamification: stats });

      localStorage.removeItem("guest_gamification");
    } catch (error) {
      console.error("Erreur transfert données guest:", error);
    }
  },

  syncOnboardingProfile: async (data) => {
    try {
      if (data.educationDegree?.trim() || data.educationSchool?.trim()) {
        try {
          const educationData: any = {
            degree: (data.educationDegree || "Formation").trim(),
            school: (data.educationSchool || "Établissement").trim(),
            is_current: false,
          };
          const education = await educationsAPI.create(educationData);
          set((state) => ({ educations: [education, ...state.educations] }));
        } catch (e: any) {
          console.error(
            "❌ [syncOnboardingProfile] Erreur création formation:",
            e,
          );
          console.error("❌ [syncOnboardingProfile] Détails erreur:", {
            message: e?.message,
            response: e?.response?.data,
            status: e?.response?.status,
          });
        }
      }

      if (data.projectName?.trim()) {
        try {
          const project = await projectsAPI.create({
            name: data.projectName.trim(),
            description: data.projectDescription?.trim() || null,
          });
          set((state) => ({ projects: [project, ...state.projects] }));
        } catch (e) {
          console.error(
            "❌ [syncOnboardingProfile] Erreur création projet:",
            e,
          );
        }
      }

      const interests = Array.isArray(data.interests) ? data.interests : [];
      if (interests.length > 0) {
        try {
          for (const name of interests) {
            if (typeof name === "string" && name.trim()) {
              await interestsAPI.create({ name: name.trim() });
            }
          }
        } catch (e) {
          console.error(
            "❌ [syncOnboardingProfile] Erreur création centres d'intérêt:",
            e,
          );
        }
      }

      const languages = Array.isArray(data.languages) ? data.languages : [];
      if (languages.length > 0) {
        try {
          for (const item of languages) {
            if (item && typeof item.name === "string" && item.name.trim()) {
              await languagesAPI.create({
                name: item.name.trim(),
                level: (item.level && String(item.level).trim()) || "Courant",
              });
            }
          }
        } catch (e) {
          console.error(
            "❌ [syncOnboardingProfile] Erreur création langues:",
            e,
          );
        }
      }

      await Promise.all([
        get().fetchEducations(),
        get().fetchProjects(),
        get().fetchInterests(),
        get().fetchLanguages(),
      ]);
    } catch (e) {
      console.error("❌ [syncOnboardingProfile] Erreur globale:", e);
      throw e;
    }
  },

  loadGamification: async () => {
    try {
      try {
        await gamificationAPI.recalculate();
      } catch (recalcError) {
        console.warn(
          "⚠️ [Gamification] Erreur recalcul XP (non bloquant):",
          recalcError,
        );
      }

      const stats = await gamificationAPI.getStats();
      set({ gamification: stats });
    } catch (error) {
      console.error("Erreur load gamification:", error);
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
  },

  addPts: async (amount, reason) => {
    const { isAuthenticated, gamification } = get();

    if (!isAuthenticated) {
      const newXP = gamification.xp + amount;
      const currentLevel =
        LEVEL_THRESHOLDS.findIndex((threshold, i) => {
          const next = LEVEL_THRESHOLDS[i + 1];
          return newXP >= threshold && (next === undefined || newXP < next);
        }) + 1;
      const oldLevel = gamification.level;

      const updatedGamification = {
        ...gamification,
        xp: newXP,
        level: currentLevel,
        xp_to_next_level: LEVEL_THRESHOLDS[currentLevel] || 100,
      };
      set({ gamification: updatedGamification });

      get().saveGuestGamification();

      if (currentLevel > oldLevel) {
        set({ showConfetti: true });
        setTimeout(() => set({ showConfetti: false }), 3000);

        set({
          activeToast: {
            type: "level_up",
            title: "PROMOTION !",
            message: `Vous passez au niveau ${LEVEL_TITLES[currentLevel - 1]} !`,
            icon: "🎉",
          },
        });
      } else {
        set({
          activeToast: {
            type: "xp",
            title: `+${amount} pts`,
            message: reason,
            icon: "⭐",
          },
        });
      }
      return;
    }

    try {
      const response = await gamificationAPI.addXP(amount, reason);

      const stats = await gamificationAPI.getStats();
      set({ gamification: stats });

      if (response.level_up && response.new_level) {
        set({ showConfetti: true });
        setTimeout(() => set({ showConfetti: false }), 3000);

        set({
          activeToast: {
            type: "level_up",
            title: "PROMOTION !",
            message: `Vous passez au niveau ${LEVEL_TITLES[response.new_level - 1]} !`,
            icon: "🎉",
          },
        });
      } else {
        set({
          activeToast: {
            type: "xp",
            title: `+${amount} pts`,
            message: reason,
            icon: "⭐",
          },
        });
      }
    } catch (error) {
      console.error("Erreur add XP:", error);
      set({
        activeToast: {
          type: "error",
          title: "Erreur",
          message: "Impossible d'ajouter les points.",
        },
      });
    }
  },

  unlockBadge: async (badgeId) => {
    const { isAuthenticated, gamification } = get();

    if (!isAuthenticated) {
      if (gamification.badges.includes(badgeId)) {
        return;
      }

      const updatedBadges = [...gamification.badges, badgeId];
      set({ gamification: { ...gamification, badges: updatedBadges } });

      get().saveGuestGamification();

      const badgeDef = BADGE_DEFINITIONS[badgeId];
      set({
        activeToast: {
          type: "badge",
          title: "SUCCÈS DÉBLOQUÉ",
          message: badgeDef ? badgeDef.name : `Badge ${badgeId}`,
          icon: "🏆",
        },
      });
      return;
    }

    try {
      const response = await gamificationAPI.unlockBadge(badgeId);

      const stats = await gamificationAPI.getStats();
      set({ gamification: stats });

      if (!response.already_unlocked) {
        const badgeDef = BADGE_DEFINITIONS[badgeId];
        set({
          activeToast: {
            type: "badge",
            title: "SUCCÈS DÉBLOQUÉ",
            message: badgeDef ? badgeDef.name : `Badge ${badgeId}`,
            icon: "🏆",
          },
        });
      }
    } catch (error) {
      console.error("Erreur unlock badge:", error);
    }
  },

  updateStreak: async () => {
    try {
      await gamificationAPI.updateStreak();

      const stats = await gamificationAPI.getStats();
      set({ gamification: stats });

      if (stats.streak >= 7 && !stats.badges.includes("on_fire")) {
        await get().unlockBadge("on_fire");
      }
    } catch (error) {
      console.error("Erreur update streak:", error);
    }
  },
});
