/**
 * AIBadge - Badge de transparence IA
 *
 * Affiche un petit badge "IA" stylisé sur les fonctionnalités utilisant l'intelligence artificielle.
 * Au clic, affiche un modal explicatif sur le partage de données et les limites de l'IA.
 * Le modal utilise un portal React pour s'afficher au-dessus de tout le contenu.
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, AlertTriangle, Shield, Info } from "lucide-react";

/**
 * Composant Modal séparé pour le portal
 */
const AIInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}> = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div
        className="bg-theme-card rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "zoomIn 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-text-primary">
                Fonctionnalité propulsée par l'IA
              </h2>
              <p className="text-sm text-theme-text-muted">
                Transparence sur l'utilisation de l'intelligence artificielle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-theme-bg-secondary text-theme-text-muted hover:text-theme-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="space-y-4">
          {/* Alerte principale */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Résultats générés par IA
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  Les contenus générés par l'IA peuvent contenir des{" "}
                  <strong>inexactitudes ou "hallucinations"</strong>. Vous
                  restez le <strong>garant de la fiabilité</strong> des
                  informations produites. Relisez et vérifiez toujours avant
                  d'utiliser ces contenus.
                </p>
              </div>
            </div>
          </div>

          {/* Partage de données */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield
                className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">
                  Partage de données
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  En utilisant {featureName}, vos données sont transmises à un
                  service d'IA tiers (Google Gemini ou OpenAI) pour traitement.
                  Ces données sont utilisées uniquement pour générer votre
                  contenu et ne sont pas conservées par ces services.
                </p>
              </div>
            </div>
          </div>

          {/* Info complémentaire */}
          <div className="bg-theme-bg-secondary rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info
                className="text-theme-text-muted flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-theme-text-primary mb-1">
                  Bonnes pratiques
                </h3>
                <ul className="text-sm text-theme-text-secondary space-y-1">
                  <li>
                    • <strong>Relisez</strong> toujours les contenus générés
                  </li>
                  <li>
                    • <strong>Personnalisez</strong> les suggestions à votre
                    style
                  </li>
                  <li>
                    • <strong>Vérifiez</strong> les faits et dates mentionnés
                  </li>
                  <li>
                    • <strong>Adaptez</strong> le ton à votre contexte
                    professionnel
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40"
          >
            J'ai compris
          </button>
        </div>
      </div>

      {/* Styles inline pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
};

interface AIBadgeProps {
  /** Position du badge */
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "inline";
  /** Taille du badge */
  size?: "sm" | "md" | "lg";
  /** Variante de style */
  variant?: "default" | "minimal" | "prominent";
  /** Classe CSS additionnelle */
  className?: string;
  /** Nom de la fonctionnalité pour le message */
  featureName?: string;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  position = "top-right",
  size = "sm",
  variant = "default",
  className = "",
  featureName = "cette fonctionnalité",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Classes de position
  const positionClasses = {
    "top-right": "absolute -top-1 -right-1",
    "top-left": "absolute -top-1 -left-1",
    "bottom-right": "absolute -bottom-1 -right-1",
    "bottom-left": "absolute -bottom-1 -left-1",
    inline: "relative inline-flex",
  };

  // Classes de taille
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] gap-0.5",
    md: "px-2 py-1 text-xs gap-1",
    lg: "px-2.5 py-1.5 text-sm gap-1.5",
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  // Classes de variante
  const variantClasses = {
    default:
      "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30",
    minimal:
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700",
    prominent:
      "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/40 animate-pulse",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la propagation au parent (ex: carte cliquable)
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Badge */}
      <button
        onClick={handleClick}
        className={`
          ${position !== "inline" ? positionClasses[position] : ""}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          inline-flex items-center font-bold rounded-full
          cursor-pointer hover:scale-[1.02] active:scale-95
          transition-all duration-200 z-10
          ${className}
        `}
        title="Fonctionnalité propulsée par l'IA - Cliquez pour en savoir plus"
        aria-label="Information sur l'utilisation de l'IA"
      >
        <Sparkles size={iconSizes[size]} className="flex-shrink-0" />
        <span>IA</span>
      </button>

      {/* Modal via Portal */}
      <AIInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureName={featureName}
      />
    </>
  );
};

/**
 * Version inline pour les titres et labels
 */
export const AIBadgeInline: React.FC<{
  className?: string;
  featureName?: string;
}> = ({ className = "", featureName }) => (
  <AIBadge
    position="inline"
    size="sm"
    variant="minimal"
    className={className}
    featureName={featureName}
  />
);

export default AIBadge;
