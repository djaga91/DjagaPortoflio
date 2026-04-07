import { authAPI, profileAPI } from "../../services/api";
import { formatAuthErrorDetail } from "../../utils/formatAuthError";
import type { GameState, SetState, GetState, ViewType } from "./types";

type AuthSlice = Pick<
  GameState,
  | "user"
  | "profile"
  | "isAuthenticated"
  | "isInitializing"
  | "isLoading"
  | "showLoginModal"
  | "pendingRedirect"
  | "login"
  | "register"
  | "logout"
  | "deleteAccount"
  | "refreshUser"
  | "setShowLoginModal"
  | "requireAuth"
  | "fetchProfile"
  | "updateProfile"
  | "uploadPicture"
>;

export const createAuthSlice = (set: SetState, get: GetState): AuthSlice => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  showLoginModal: false,
  pendingRedirect: null,

  login: async (data) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.login(data);

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        showLoginModal: false,
      });

      await get().initialize();

      const storedRedirect = localStorage.getItem(
        "pendingRedirect",
      ) as ViewType | null;
      const redirectTo = storedRedirect || get().pendingRedirect;

      if (redirectTo) {
        set({ view: redirectTo, pendingRedirect: null });
        localStorage.removeItem("pendingRedirect");
      }
    } catch (error: unknown) {
      console.error("Erreur login:", error);
      set({ isLoading: false });
      const axiosErr = error as {
        response?: { status?: number; data?: { detail?: string } };
      };
      const status = axiosErr.response?.status;
      const isServerError = status === 500 || status === 503;
      const message = isServerError
        ? "Service temporairement indisponible. Réessayez dans quelques instants."
        : axiosErr.response?.data?.detail || "Email ou mot de passe incorrect";
      set({
        activeToast: {
          type: "error",
          title: "Erreur de connexion",
          message,
        },
      });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.register(data);

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      const storedRedirect = localStorage.getItem(
        "pendingRedirect",
      ) as ViewType | null;
      const redirectTo = storedRedirect || get().pendingRedirect || "dashboard";

      if (redirectTo === "dashboard") {
        localStorage.setItem(
          `pending_onboarding_${response.user.id}`,
          "immediate",
        );
        localStorage.removeItem(`onboarding_seen_${response.user.id}`);
      } else if (redirectTo === "cv_import") {
        localStorage.setItem(
          `pending_onboarding_${response.user.id}`,
          "after_cv_import",
        );
        localStorage.removeItem(`onboarding_seen_${response.user.id}`);
      } else {
        localStorage.setItem(
          `pending_onboarding_${response.user.id}`,
          "immediate",
        );
        localStorage.removeItem(`onboarding_seen_${response.user.id}`);
      }

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        showLoginModal: false,
      });

      await get().initialize();
      await get().transferGuestGamification();
      await get().addPts(50, "Bienvenue sur PortfoliA !");
      await get().unlockBadge("first_steps");

      set({ view: redirectTo, pendingRedirect: null });
      localStorage.removeItem("pendingRedirect");
    } catch (error: unknown) {
      console.error("Erreur register:", error);
      set({ isLoading: false });
      const axiosErr = error as { response?: { data?: { detail?: unknown } } };
      const detail = axiosErr.response?.data?.detail;
      const message = formatAuthErrorDetail(detail);
      set({
        activeToast: {
          type: "error",
          title: "Erreur d'inscription",
          message,
        },
      });
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    await authAPI.logout();

    localStorage.removeItem("current_org_id");
    localStorage.removeItem("current_org_type");
    localStorage.removeItem("current_org_role");
    localStorage.removeItem("current_org_name");
    localStorage.removeItem("b2b_user_mode");

    const hasCache = get().loadGuestGamification();

    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      experiences: [],
      skills: [],
      matchingOffers: [],
      searchQuery: "",
      contractTypeFilter: "",
      locationFilter: "",
      hasSearched: false,
      view: "landing",
    });

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
  },

  deleteAccount: async () => {
    try {
      await authAPI.deleteAccount();
      await authAPI.logout();

      localStorage.removeItem("current_org_id");
      localStorage.removeItem("current_org_type");
      localStorage.removeItem("current_org_role");
      localStorage.removeItem("current_org_name");
      localStorage.removeItem("b2b_user_mode");

      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        experiences: [],
        educations: [],
        projects: [],
        languages: [],
        certifications: [],
        skills: [],
        view: "landing",
        gamification: {
          xp: 0,
          level: 1,
          badges: [],
          streak: 0,
          last_activity: new Date().toISOString(),
          xp_to_next_level: 100,
        },
      });
    } catch (error: unknown) {
      console.error("Erreur suppression compte:", error);
      throw error;
    }
  },

  refreshUser: async () => {
    try {
      const user = await authAPI.getMe();
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch (error: unknown) {
      console.error("Erreur refresh user:", error);
      const axiosErr = error as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        await get().logout();
      }
      throw error;
    }
  },

  setShowLoginModal: (show, redirectTo) => {
    if (redirectTo) {
      localStorage.setItem("pendingRedirect", redirectTo);
    } else if (!show) {
      localStorage.removeItem("pendingRedirect");
    }

    set({
      showLoginModal: show,
      pendingRedirect: redirectTo || null,
    });
  },

  requireAuth: (action) => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) {
      set({ showLoginModal: true });
    } else {
      action();
    }
  },

  // Profile actions
  fetchProfile: async () => {
    try {
      const profile = await profileAPI.getMe();
      set({ profile });
    } catch (error) {
      console.error("Erreur fetch profile:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const profile = await profileAPI.updateMe(data);
      set({ profile });

      if (data.bio && !get().profile?.bio) {
        await get().addPts(30, "Première bio ajoutée !");
        await get().unlockBadge("writer");
      }

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ PROFIL ENREGISTRÉ",
          message: "Vos modifications ont été sauvegardées.",
        },
      });
    } catch (error) {
      console.error("Erreur update profile:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible de sauvegarder.",
        },
      });
    }
  },

  uploadPicture: async (file) => {
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        set({
          activeToast: {
            type: "error",
            title: "✗ Fichier trop volumineux",
            message: `Le fichier fait ${fileSizeMB} MB. La taille maximale est de 5 MB.`,
          },
        });
        return;
      }

      await profileAPI.uploadPicture(file);
      await get().fetchProfile();
      await get().addPts(15, "Photo de profil ajoutée !");

      set({
        activeToast: {
          type: "success",
          title: "✓ PHOTO UPLOADÉE",
          message: "+15 pts",
        },
      });
    } catch (error: unknown) {
      console.error("Erreur upload picture:", error);
      const axiosErr = error as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const errorMessage =
        axiosErr.response?.data?.detail ||
        axiosErr.message ||
        "Impossible d'uploader la photo.";
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: errorMessage,
        },
      });
    }
  },
});
