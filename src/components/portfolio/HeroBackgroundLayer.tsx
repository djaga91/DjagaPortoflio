import React from "react";
import { getAbsoluteImageUrl } from "../../utils/imageUrl";

export interface HeroBackgroundLayerProps {
  /** 'default' | 'photo' */
  type?: "default" | "photo" | null;
  imageUrl?: string | null;
  /** Contenu par défaut (dégradés) quand type === 'default' ou non défini */
  children?: React.ReactNode;
  /** Classe du conteneur (ex: absolute inset-0 z-0) */
  className?: string;
  /** Couleur du filtre (fond du hero) pour faire ressortir le titre. Ex: rgb(15,23,42) ou #0f172a */
  overlayColor?: string | null;
  /** Opacité du filtre (0–1). Défaut 0.8 pour bien faire ressortir le texte sur la photo */
  overlayOpacity?: number | null;
}

const DEFAULT_OVERLAY_COLOR = "rgb(15, 23, 42)";
const DEFAULT_OVERLAY_OPACITY = 0.8;

/**
 * Affiche le fond du hero : dégradés (défaut) ou image.
 * Un filtre (couleur du hero + opacité) recouvre la photo pour faire ressortir le titre.
 */
export const HeroBackgroundLayer: React.FC<HeroBackgroundLayerProps> = ({
  type,
  imageUrl,
  children,
  className = "absolute inset-0 z-0 pointer-events-none overflow-hidden",
  overlayColor,
  overlayOpacity,
}) => {
  const color = overlayColor ?? DEFAULT_OVERLAY_COLOR;
  const opacity = overlayOpacity ?? DEFAULT_OVERLAY_OPACITY;

  const rawUrl =
    type === "photo" && imageUrl
      ? getAbsoluteImageUrl(imageUrl) || imageUrl
      : null;
  const resolvedImageUrl =
    rawUrl &&
    (rawUrl.startsWith("http://") ||
      rawUrl.startsWith("https://") ||
      rawUrl.startsWith("/"))
      ? rawUrl
      : null;

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: color,
    opacity,
    pointerEvents: "none",
  };

  if (type === "photo" && resolvedImageUrl) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          backgroundImage: `url(${resolvedImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={overlayStyle} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};
