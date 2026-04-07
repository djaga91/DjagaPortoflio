import React from "react";
import { DualColumnDensity } from "../../hooks/useDualColumnDensity";
import { SingleColumnDensity } from "../../hooks/useSingleColumnDensity";

interface DensityMeterProps {
  density: DualColumnDensity | SingleColumnDensity;
  appliedZoom?: number; // Zoom appliqué au preview
}

export const DensityMeter: React.FC<DensityMeterProps> = ({
  density,
  appliedZoom,
}) => {
  // Détecter si c'est dual ou single column
  const isDualColumn = "left" in density && "right" in density;

  const global = density.global;
  const isOverflowing = density.isOverflowing;

  // Pour dual column
  const left = isDualColumn ? (density as DualColumnDensity).left : 0;
  const right = isDualColumn ? (density as DualColumnDensity).right : 0;
  const overflowingColumn = isDualColumn
    ? (density as DualColumnDensity).overflowingColumn
    : null;

  // Ajuster les pourcentages si un zoom est appliqué au preview
  // Utiliser appliedZoom (qui peut être previewZoom ou le zoom du backend)
  const zoomToUse = appliedZoom && appliedZoom < 1.0 ? appliedZoom : 1.0;
  const adjustedGlobal = global * zoomToUse;
  const adjustedLeft = left * zoomToUse;
  const adjustedRight = right * zoomToUse;

  // Déterminer la couleur et le message pour le global (utiliser adjustedGlobal pour tenir compte du zoom)
  // IMPORTANT : Si un zoom est appliqué (adjustedGlobal <= 100), on considère que c'est OK
  let color: string;
  let bgColor: string;
  let message: string;

  // Si un zoom est appliqué et que adjustedGlobal <= 100, c'est parfait (pas de warning)
  const hasZoomApplied = zoomToUse < 1.0;
  const isWithinLimit = adjustedGlobal <= 100;

  if (hasZoomApplied && isWithinLimit) {
    // Zoom appliqué et contenu rentre : c'est parfait
    color = "#10b981"; // Vert
    bgColor = "bg-green-500";
    message = "Parfait ! Le contenu rentre sur 1 page.";
  } else if (adjustedGlobal < 60) {
    color = "#3b82f6"; // Bleu
    bgColor = "bg-blue-500";
    message = "C'est un peu léger, ajoutez du contenu !";
  } else if (adjustedGlobal < 95) {
    color = "#10b981"; // Vert
    bgColor = "bg-green-500";
    message = "Superbe densité. Votre CV est pro.";
  } else if (adjustedGlobal < 100) {
    color = "#f59e0b"; // Orange
    bgColor = "bg-orange-500";
    message = "Vous optimisez l'espace à fond ! Attention à la marge.";
  } else if (adjustedGlobal <= 120) {
    // Entre 100% et 120% : OK, pas de warning (zone orange pour compression)
    color = "#f59e0b"; // Orange
    bgColor = "bg-orange-500";
    message =
      "Le contenu dépasse légèrement. Vous pouvez activer la compression.";
  } else {
    // > 120% : Warning rouge
    color = "#ef4444"; // Rouge
    bgColor = "bg-red-500";
    message =
      "Oups ! Trop de contenu. Supprimez des sections ou acceptez une 2ème page.";
  }

  // Ne plus limiter à 110%, afficher la vraie valeur
  // Mais limiter visuellement la barre à 120% max pour l'affichage
  const displayMax = 120; // Maximum visuel pour la barre
  const clampedForDisplay = Math.min(adjustedGlobal, displayMax);

  return (
    <div className="w-full space-y-2">
      {/* Barre de progression globale */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-theme-text-primary">
              Remplissage global
            </span>
            {appliedZoom && appliedZoom < 1.0 && (
              <span className="text-xs text-theme-text-muted bg-theme-bg-secondary px-1.5 py-0.5 rounded">
                Zoom: {Math.round(appliedZoom * 100)}%
              </span>
            )}
          </div>
          <span className="text-sm font-bold" style={{ color }}>
            {Math.round(adjustedGlobal)}%
          </span>
        </div>
        <div className="relative w-full h-4 bg-theme-bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${bgColor}`}
            style={{
              width: `${Math.min(clampedForDisplay, 100)}%`,
            }}
          />
          {/* Ligne à 100% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-600 opacity-70"
            style={{ left: "100%" }}
          />
          {/* Indicateur de débordement */}
          {adjustedGlobal > 100 && (
            <div
              className="absolute top-0 bottom-0 bg-red-500 opacity-60"
              style={{
                left: "100%",
                width: `${Math.min(((adjustedGlobal - 100) / displayMax) * 100, 100)}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Détails des colonnes - Afficher seulement si dual column (left > 0) */}
      {left > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Colonne gauche */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-theme-text-secondary">
                Gauche
              </span>
              <span
                className={`text-xs font-bold ${adjustedLeft > 100 ? "text-red-600 dark:text-red-400" : adjustedLeft > 90 ? "text-orange-600 dark:text-orange-400" : "text-theme-text-secondary"}`}
              >
                {Math.round(adjustedLeft)}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-theme-bg-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  adjustedLeft > 100
                    ? "bg-red-500"
                    : adjustedLeft > 90
                      ? "bg-orange-500"
                      : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min(adjustedLeft, 100)}%`,
                }}
              />
              {adjustedLeft > 100 && (
                <div
                  className="absolute top-0 bottom-0 bg-red-700 opacity-60"
                  style={{
                    left: "100%",
                    width: `${adjustedLeft - 100}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-theme-text-secondary">
                Droite
              </span>
              <span
                className={`text-xs font-bold ${adjustedRight > 100 ? "text-red-600 dark:text-red-400" : adjustedRight > 90 ? "text-orange-600 dark:text-orange-400" : "text-theme-text-secondary"}`}
              >
                {Math.round(adjustedRight)}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-theme-bg-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  adjustedRight > 100
                    ? "bg-red-500"
                    : adjustedRight > 90
                      ? "bg-orange-500"
                      : "bg-purple-500"
                }`}
                style={{
                  width: `${Math.min(adjustedRight, 100)}%`,
                }}
              />
              {adjustedRight > 100 && (
                <div
                  className="absolute top-0 bottom-0 bg-red-700 opacity-60"
                  style={{
                    left: "100%",
                    width: `${adjustedRight - 100}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message de feedback précis - SEULEMENT si pas de zoom appliqué ET que ça dépasse vraiment (>120%) */}
      {!hasZoomApplied && adjustedGlobal > 120 && isOverflowing && (
        <div
          className={`p-1.5 rounded text-xs font-medium text-center ${
            overflowingColumn === "both"
              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              : overflowingColumn
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
          }`}
        >
          ⚠️{" "}
          {overflowingColumn ? (
            <>
              La colonne{" "}
              <strong>
                {overflowingColumn === "left"
                  ? "gauche"
                  : overflowingColumn === "right"
                    ? "droite"
                    : "des deux"}
              </strong>{" "}
              dépasse !
            </>
          ) : (
            <>Le contenu dépasse !</>
          )}
        </div>
      )}

      {/* Message général - Plus compact */}
      {!isOverflowing && (
        <div className="text-center">
          <span className="text-xs font-medium" style={{ color }}>
            {message}
          </span>
        </div>
      )}
    </div>
  );
};
