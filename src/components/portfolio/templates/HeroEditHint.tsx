import React from "react";
import { Pencil } from "lucide-react";

export interface HeroEditHintProps {
  /** Afficher l’indicateur (ex: en mode édition uniquement) */
  show?: boolean;
  /** Nom du groupe Tailwind pour le hover (ex: "badge" si parent a group/badge) */
  groupName?: string;
  /** Classes additionnelles (couleur selon le template) */
  className?: string;
  /** Taille de l’icône en pixels */
  size?: number;
  position?: "inline" | "corner";
}

/**
 * Indicateur visuel « modifiable » pour les éléments du hero.
 * Icône stylo toujours visible en Preview pour indiquer les zones modifiables (pas en ligne).
 */
export const HeroEditHint: React.FC<HeroEditHintProps> = ({
  show = true,
  groupName: _groupName,
  className = "",
  size = 20,
  position = "corner",
}) => {
  if (!show) return null;

  const positionClass =
    position === "corner"
      ? "absolute top-0 right-0 -translate-y-0.5 translate-x-0.5"
      : "inline-flex ml-1.5 align-middle";

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 opacity-80 pointer-events-none ${positionClass} ${className}`}
      title="Modifiable — cliquez pour éditer"
      aria-hidden
    >
      <Pencil size={size} strokeWidth={2} />
    </span>
  );
};
