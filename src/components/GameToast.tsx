import React from "react";
import {
  X,
  FileText,
  ArrowRight,
  Check,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import { Toast } from "../types";

interface GameToastProps extends Toast {
  onClose?: () => void;
}

export const GameToast: React.FC<GameToastProps> = ({
  title,
  message,
  type,
  icon,
  onClose,
  onClick,
  stats,
  // persistent est géré dans App.tsx pour la durée du toast
}) => {
  const displayIcon =
    icon ||
    (type === "level_up"
      ? "⭐"
      : type === "error"
        ? "❌"
        : type === "cv_import"
          ? "📄"
          : "✅");
  const displayTitle =
    title ||
    (type === "level_up"
      ? "PROMOTION !"
      : type === "error"
        ? "ERREUR"
        : "OBJECTIF ATTEINT");

  // Style spécifique pour l'import CV
  if (type === "cv_import") {
    return (
      <div className="fixed top-24 right-4 z-[140] animate-in slide-in-from-right duration-300">
        <div
          onClick={onClick}
          className={`
            p-5 rounded-2xl border shadow-theme-xl backdrop-blur-md min-w-[340px] max-w-[400px]
            bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30
            border-emerald-200 dark:border-emerald-700
            ${onClick ? "cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-200" : ""}
            relative
          `}
        >
          {/* Close button */}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-theme-text-muted hover:text-theme-text-primary transition-all duration-200 hover:scale-[1.02] active:scale-95"
              aria-label="Fermer la notification"
            >
              <X size={14} />
            </button>
          )}

          {/* Header avec icône */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Check
                size={24}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="flex-1 pr-6">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">
                {displayTitle}
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {typeof message === "object"
                  ? (message as any).message ||
                    (message as any).detail ||
                    JSON.stringify(message)
                  : message}
              </p>
            </div>
          </div>

          {/* Stats si présentes */}
          {stats && (
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-white/60 dark:bg-slate-800/40 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <PlusCircle size={14} />
                  <span className="font-bold text-lg">{stats.created}</span>
                </div>
                <div className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                  créés
                </div>
              </div>
              <div className="flex-1 bg-white/60 dark:bg-slate-800/40 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                  <RefreshCw size={14} />
                  <span className="font-bold text-lg">{stats.updated}</span>
                </div>
                <div className="text-xs text-blue-700/70 dark:text-blue-300/70">
                  mis à jour
                </div>
              </div>
              <div className="flex-1 bg-white/60 dark:bg-slate-800/40 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400">
                  <FileText size={14} />
                  <span className="font-bold text-lg">{stats.skills}</span>
                </div>
                <div className="text-xs text-purple-700/70 dark:text-purple-300/70">
                  compétences
                </div>
              </div>
            </div>
          )}

          {/* CTA cliquable */}
          {onClick && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-700/70 dark:text-emerald-300/70">
                Cliquez pour voir votre profil
              </span>
              <ArrowRight
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Toast standard pour les autres types
  return (
    <div className="fixed top-24 right-4 z-[140] animate-in slide-in-from-right duration-300">
      <div
        onClick={onClick}
        className={`
          p-4 rounded-2xl border shadow-theme-lg backdrop-blur-md flex items-center gap-4 min-w-[300px] bg-theme-card relative
          ${type === "level_up" ? "border-[#6366F1]/30" : type === "error" ? "border-red-200 dark:border-red-800" : "border-[#FF8C42]/30"}
          ${onClick ? "cursor-pointer hover:shadow-xl transition-all duration-200" : ""}
        `}
      >
        <div className="text-2xl">{displayIcon}</div>
        <div className="flex-1">
          <h4
            className={`font-bold uppercase text-xs tracking-wider ${
              type === "level_up"
                ? "text-[#6366F1]"
                : type === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-[#FF8C42]"
            }`}
          >
            {displayTitle}
          </h4>
          <p className="text-theme-text-secondary text-sm font-medium">
            {typeof message === "object"
              ? (message as any).message ||
                (message as any).detail ||
                JSON.stringify(message)
              : message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-theme-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-text-muted hover:text-theme-text-primary transition-all duration-200 hover:scale-[1.02] active:scale-95"
            aria-label="Fermer la notification"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
