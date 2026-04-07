/**
 * Composant pour afficher un badge avec logo Simple Icons via Shields.io
 *
 * Utilise l'API Shields.io pour générer des badges avec logos Simple Icons
 * Documentation: https://shields.io/badges
 */

import React, { useState } from "react";
import { CircleDot } from "lucide-react";
import {
  getSimpleIconBadgeUrl,
  getDefaultColor,
} from "../../utils/simpleIconsMapper";

interface SimpleIconBadgeProps {
  skillName: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  style?: "flat" | "flat-square" | "plastic" | "for-the-badge";
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const SIZE_MAP = {
  sm: { height: 20, scale: 0.8 },
  md: { height: 24, scale: 1 },
  lg: { height: 28, scale: 1.2 },
};

export const SimpleIconBadge: React.FC<SimpleIconBadgeProps> = ({
  skillName,
  size = "md",
  showLabel = true,
  style = "flat",
  className = "",
  fallbackIcon,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const badgeUrl = getSimpleIconBadgeUrl(skillName, {
    style,
    color: getDefaultColor(skillName),
    label: showLabel ? skillName : "",
  });

  const sizeConfig = SIZE_MAP[size];

  // Si pas de badge URL ou erreur de chargement, afficher le fallback
  if (!badgeUrl || imageError) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {fallbackIcon || (
          <CircleDot
            className="text-theme-text-muted"
            size={sizeConfig.height}
            strokeWidth={2}
          />
        )}
        {showLabel && (
          <span className="ml-2 text-sm font-medium text-theme-text-primary">
            {skillName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={badgeUrl}
        alt={skillName}
        className={`transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: `${sizeConfig.height}px`,
          imageRendering: "crisp-edges",
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
      />
      {!imageLoaded && !imageError && (
        <div
          className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
          style={{
            width: `${sizeConfig.height * 4}px`,
            height: `${sizeConfig.height}px`,
          }}
        />
      )}
    </div>
  );
};
