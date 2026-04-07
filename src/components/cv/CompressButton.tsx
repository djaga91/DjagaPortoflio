import React, { useState } from "react";
import { Zap, Loader2, AlertTriangle, RotateCcw } from "lucide-react";

interface CompressButtonProps {
  percentage: number;
  onCompress?: (smartScale: boolean) => Promise<void>;
  onReset?: () => void;
  appliedZoom?: number; // Zoom déjà appliqué (si défini, on est déjà réduit)
}

export const CompressButton: React.FC<CompressButtonProps> = ({
  percentage,
  onCompress,
  onReset,
  appliedZoom,
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionApplied, setCompressionApplied] = useState(false);

  // Vérifier si on est déjà à la limite minimale (85%)
  const isAtMinZoom = appliedZoom !== undefined && appliedZoom <= 0.85;

  // Logique des 3 zones
  // IMPORTANT : Utiliser le pourcentage ajusté si un zoom est appliqué
  const adjustedPercentage =
    appliedZoom && appliedZoom < 1.0 ? percentage * appliedZoom : percentage;

  let buttonState: "hidden" | "active" | "disabled";

  if (adjustedPercentage <= 100) {
    buttonState = "hidden"; // Zone Verte : Pas de réduction nécessaire (ou déjà réduit)
  } else if (adjustedPercentage <= 120) {
    buttonState = "active"; // Zone Orange : Smart Scaling possible (100-120%)
  } else {
    buttonState = "disabled"; // Zone Rouge : Trop de contenu (>120%)
  }

  // IMPORTANT : Afficher le bouton de réinitialisation même en Zone Verte si un zoom a été appliqué
  const hasAppliedZoom = appliedZoom !== undefined && appliedZoom < 1.0;

  // Si on est en Zone Verte mais qu'un zoom a été appliqué, afficher juste le bouton de réinitialisation
  if (buttonState === "hidden" && hasAppliedZoom && onReset) {
    return (
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-theme-md hover:shadow-theme-lg text-sm"
        title="Réinitialiser la taille à 100%"
      >
        <RotateCcw size={16} />
        <span>Réinitialiser ({Math.round(appliedZoom * 100)}%)</span>
      </button>
    );
  }

  if (buttonState === "hidden") return null;

  const handleClick = async () => {
    if (onCompress && buttonState === "active") {
      setIsCompressing(true);
      try {
        await onCompress(true); // Passer smart_scale: true
        setCompressionApplied(true);
        // Reset après 3 secondes
        setTimeout(() => setCompressionApplied(false), 3000);
      } catch (error) {
        console.error("Erreur compression:", error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Zone Rouge : Afficher un message avec proposition
  if (buttonState === "disabled") {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-900 dark:text-red-200 mb-2">
              ⚠️ Votre CV dépasse ({Math.round(percentage)}%)
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mb-3">
              Le contenu est trop volumineux pour tenir sur une seule page. Vous
              avez deux options :
            </p>
            <div className="space-y-2">
              <button
                onClick={handleClick}
                disabled={isCompressing || isAtMinZoom}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCompressing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Réduction en cours...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Réduire pour faire rentrer sur 1 page
                  </>
                )}
              </button>
              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                ⚠️ Attention : La réduction peut rendre le texte moins lisible
                si le contenu dépasse 120%
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Zone Orange : Bouton actif
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleClick}
          disabled={isCompressing || compressionApplied || isAtMinZoom}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            compressionApplied
              ? "bg-green-500 text-white"
              : isAtMinZoom
                ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {isCompressing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Compression...
            </>
          ) : compressionApplied ? (
            <>
              <Zap size={18} />
              Compression appliquée !
            </>
          ) : isAtMinZoom ? (
            <>
              <AlertTriangle size={18} />
              Déjà à la limite minimale
            </>
          ) : (
            <>
              <Zap size={18} />
              Réduire pour faire rentrer sur 1 page
            </>
          )}
        </button>

        {compressionApplied && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-pulse">
              Réduction appliquée ! Le contenu rentre maintenant sur 1 page.
            </span>
            {appliedZoom && (
              <span className="text-xs text-theme-text-muted">
                Taille actuelle : {Math.round(appliedZoom * 100)}% (minimum :
                85% pour la lisibilité)
              </span>
            )}
          </div>
        )}

        {/* Bouton de réinitialisation si zoom appliqué - Toujours visible si une réduction a été faite */}
        {appliedZoom !== undefined && appliedZoom < 1.0 && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-theme-md hover:shadow-theme-lg text-sm"
            title="Réinitialiser la taille à 100%"
          >
            <RotateCcw size={16} />
            <span>Réinitialiser ({Math.round(appliedZoom * 100)}%)</span>
          </button>
        )}
      </div>

      {/* Message si déjà à la limite minimale */}
      {isAtMinZoom && !compressionApplied && (
        <div className="bg-amber-100 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 p-2 rounded-lg text-xs">
          <p className="font-semibold">
            ⚠️ Vous êtes déjà à la taille minimale (
            {Math.round((appliedZoom || 0) * 100)}%)
          </p>
          <p className="mt-1">
            Le texte est déjà réduit au maximum pour rester lisible. Impossible
            de réduire davantage sans rendre le CV illisible.
            {percentage > 100 && (
              <span className="block mt-1 font-medium">
                Vous devez supprimer du contenu ({Math.round(percentage)}% de
                remplissage).
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
