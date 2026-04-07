/**
 * ThemeContext - Système de gestion de thème Light/Dark
 *
 * Fonctionnalités :
 * - Détection automatique de prefers-color-scheme au premier chargement
 * - Persistance dans localStorage
 * - Sauvegarde API pour utilisateurs connectés (optionnel)
 * - Transitions fluides entre les modes
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useGameStore } from "../store/gameStore";
import { api } from "../services/api";

// Types
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  /** Le thème actuel choisi par l'utilisateur (peut être 'system') */
  theme: Theme;
  /** Le thème réellement appliqué (toujours 'light' ou 'dark') */
  resolvedTheme: ResolvedTheme;
  /** Change le thème */
  setTheme: (theme: Theme) => void;
  /** Toggle entre light et dark */
  toggleTheme: () => void;
  /** Indique si le thème est en cours de chargement */
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Clé localStorage
const THEME_STORAGE_KEY = "portfolia-theme";

/**
 * Détecte la préférence système de l'utilisateur
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Récupère le thème sauvegardé dans localStorage
 */
function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return null;
}

/**
 * Applique le thème au document HTML
 */
function applyTheme(resolvedTheme: ResolvedTheme) {
  const root = document.documentElement;

  // Ajouter une classe de transition temporaire
  root.classList.add("theme-transition");

  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Mettre à jour la meta theme-color pour les navigateurs mobiles
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      resolvedTheme === "dark" ? "#0F172A" : "#F8FAFC",
    );
  }

  // Retirer la classe de transition après l'animation
  setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 300);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Thème par défaut si aucune préférence n'est trouvée */
  defaultTheme?: Theme;
  /** Désactive la sauvegarde API (utile pour les tests) */
  disableApiSync?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
  disableApiSync = false,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Essayer de récupérer le thème stocké, sinon utiliser le défaut
    return getStoredTheme() ?? defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const stored = getStoredTheme() ?? defaultTheme;
    return stored === "system" ? getSystemTheme() : stored;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer l'état d'authentification depuis le store
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  /**
   * Résout le thème effectif (light ou dark)
   */
  const resolveTheme = useCallback((themeValue: Theme): ResolvedTheme => {
    if (themeValue === "system") {
      return getSystemTheme();
    }
    return themeValue;
  }, []);

  /**
   * Met à jour le thème
   */
  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme);
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);

      // Sauvegarder dans localStorage
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);

      // Appliquer immédiatement
      applyTheme(resolved);

      // Si connecté et sync API activé, sauvegarder côté serveur
      if (isAuthenticated && !disableApiSync) {
        try {
          await api.patch("/api/profiles/me", { theme_preference: newTheme });
        } catch (error) {
          // Silencieux - la préférence locale est suffisante
          console.warn(
            "[Theme] Impossible de sauvegarder la préférence serveur:",
            error,
          );
        }
      }
    },
    [isAuthenticated, disableApiSync, resolveTheme],
  );

  /**
   * Bascule entre light et dark
   */
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  /**
   * Initialisation : charger le thème depuis localStorage ou système
   */
  useEffect(() => {
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme ?? defaultTheme;
    const resolved = resolveTheme(initialTheme);

    setThemeState(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setIsLoading(false);
  }, [defaultTheme, resolveTheme]);

  /**
   * Écouter les changements de prefers-color-scheme
   */
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? "dark" : "light";
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  /**
   * Charger la préférence depuis l'API si l'utilisateur se connecte
   */
  useEffect(() => {
    if (!isAuthenticated || disableApiSync) return;

    const loadServerPreference = async () => {
      try {
        const response = await api.get("/api/profiles/me");
        const serverTheme = response.data?.theme_preference as
          | Theme
          | undefined;

        if (
          serverTheme &&
          (serverTheme === "light" ||
            serverTheme === "dark" ||
            serverTheme === "system")
        ) {
          // Le serveur a une préférence, l'appliquer
          setThemeState(serverTheme);
          const resolved = resolveTheme(serverTheme);
          setResolvedTheme(resolved);
          localStorage.setItem(THEME_STORAGE_KEY, serverTheme);
          applyTheme(resolved);
        }
      } catch {
        // Silencieux - utiliser la préférence locale
      }
    };

    loadServerPreference();
  }, [isAuthenticated, disableApiSync, resolveTheme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte de thème
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Script à injecter dans <head> pour éviter le flash de mauvais thème
 * À utiliser dans index.html si nécessaire
 */
export const themeInitScript = `
  (function() {
    const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    let theme = stored || 'system';

    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
`;
