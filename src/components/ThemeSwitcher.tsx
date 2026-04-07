/**
 * ThemeSwitcher - Composant de toggle Light/Dark mode
 *
 * Design professionnel avec :
 * - Animation fluide du toggle
 * - Icônes Soleil/Lune animées
 * - Accessible (aria-label, keyboard navigation)
 * - Responsive (s'adapte au contexte)
 */

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "../contexts/ThemeContext";

interface ThemeSwitcherProps {
  /** Variante d'affichage */
  variant?: "toggle" | "dropdown" | "icon-only";
  /** Taille du composant */
  size?: "sm" | "md" | "lg";
  /** Classe CSS additionnelle */
  className?: string;
  /** Afficher le label textuel */
  showLabel?: boolean;
}

/**
 * Composant Toggle simple Light/Dark
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = "toggle",
  size = "md",
  className = "",
  showLabel = false,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Dimensions selon la taille
  const sizes = {
    sm: {
      toggle: "w-12 h-6",
      icon: 14,
      dot: "w-4 h-4",
      translate: "translate-x-6",
    },
    md: {
      toggle: "w-14 h-7",
      icon: 16,
      dot: "w-5 h-5",
      translate: "translate-x-7",
    },
    lg: {
      toggle: "w-16 h-8",
      icon: 18,
      dot: "w-6 h-6",
      translate: "translate-x-8",
    },
  };

  const s = sizes[size];
  const isDark = resolvedTheme === "dark";

  if (variant === "icon-only") {
    return (
      <button
        onClick={toggleTheme}
        className={`
          p-2 rounded-xl transition-all duration-300
          bg-theme-bg-tertiary hover:bg-theme-card-hover
          border border-theme-border
          text-theme-text-secondary hover:text-theme-text-primary
          focus:outline-none focus:ring-2 focus:ring-theme-input-focus focus:ring-offset-2
          dark:focus:ring-offset-slate-900
          ${className}
        `}
        aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        title={isDark ? "Mode clair" : "Mode sombre"}
      >
        <div className="relative w-5 h-5">
          {/* Soleil */}
          <Sun
            size={20}
            className={`
              absolute inset-0 transition-all duration-300
              ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
              text-amber-500
            `}
          />
          {/* Lune */}
          <Moon
            size={20}
            className={`
              absolute inset-0 transition-all duration-300
              ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
              text-indigo-400
            `}
          />
        </div>
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-bg-tertiary border border-theme-border">
          {(["light", "dark", "system"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${
                  theme === t
                    ? "bg-theme-card text-theme-accent-orange shadow-sm"
                    : "text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-card-hover"
                }
              `}
              aria-label={
                t === "light"
                  ? "Mode clair"
                  : t === "dark"
                    ? "Mode sombre"
                    : "Suivre le système"
              }
              title={
                t === "light" ? "Clair" : t === "dark" ? "Sombre" : "Système"
              }
            >
              {t === "light" && <Sun size={s.icon} />}
              {t === "dark" && <Moon size={s.icon} />}
              {t === "system" && <Monitor size={s.icon} />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Variant: toggle (default)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-theme-text-secondary">
          {isDark ? "Mode sombre" : "Mode clair"}
        </span>
      )}

      <button
        onClick={toggleTheme}
        className={`
          relative ${s.toggle} rounded-full p-1
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-theme-input-focus focus:ring-offset-2
          dark:focus:ring-offset-slate-900
          ${
            isDark
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30"
              : "bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-orange-500/30"
          }
        `}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      >
        {/* Dot qui se déplace */}
        <span
          className={`
            flex items-center justify-center
            ${s.dot} rounded-full bg-white shadow-md
            transform transition-transform duration-300 ease-in-out
            ${isDark ? s.translate : "translate-x-0"}
          `}
        >
          {/* Icône dans le dot */}
          <Sun
            size={s.icon - 4}
            className={`
              absolute transition-all duration-300
              ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
              text-amber-500
            `}
          />
          <Moon
            size={s.icon - 4}
            className={`
              absolute transition-all duration-300
              ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
              text-indigo-500
            `}
          />
        </span>

        {/* Icônes de fond pour effet visuel */}
        <Sun
          size={s.icon - 2}
          className={`
            absolute left-1.5 top-1/2 -translate-y-1/2
            transition-opacity duration-300
            ${isDark ? "opacity-30" : "opacity-0"}
            text-white
          `}
        />
        <Moon
          size={s.icon - 2}
          className={`
            absolute right-1.5 top-1/2 -translate-y-1/2
            transition-opacity duration-300
            ${isDark ? "opacity-0" : "opacity-30"}
            text-white
          `}
        />
      </button>
    </div>
  );
};

/**
 * Version compacte pour la navigation mobile
 */
export const ThemeSwitcherMobile: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center
        w-8 h-8 rounded-lg
        bg-theme-bg-tertiary
        text-theme-text-secondary hover:text-theme-text-primary
        hover:bg-theme-card-hover
        transition-all duration-200 active:scale-95
        ${className}
      `}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      <div className="relative w-[18px] h-[18px]">
        <Sun
          size={18}
          className={`
            absolute inset-0 transition-all duration-300
            ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
            text-amber-500
          `}
        />
        <Moon
          size={18}
          className={`
            absolute inset-0 transition-all duration-300
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
            text-indigo-400
          `}
        />
      </div>
    </button>
  );
};

export default ThemeSwitcher;
