import React, { useState, useEffect } from "react";
import { GraduationCap, Briefcase } from "lucide-react";
import { logoAPI } from "../services/api";
import { generateDomainVariants } from "../utils/logoResolver";

interface LogoProps {
  name: string;
  type?: "company" | "school";
  size?: number;
  className?: string;
  showFallback?: boolean; // Afficher une icône si le logo ne charge pas
}

/**
 * Logos Hunter : on vérifie côté backend avant de mettre une URL en src.
 * Le navigateur ne charge que des URLs valides → plus de 404 dans la console.
 */
export const Logo: React.FC<LogoProps> = ({
  name,
  type = "company",
  size = 56,
  className = "",
  showFallback = false,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!name) {
      setLogoUrl(null);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const variants = generateDomainVariants(name);
    if (variants.length === 0) {
      setLogoUrl(null);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let cancelled = false;
    setLogoUrl(null);
    setHasError(false);
    setIsLoading(true);

    const tryVariant = (index: number) => {
      if (cancelled || index >= variants.length) {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
        return;
      }

      const domain = variants[index];
      logoAPI
        .checkDomain(domain)
        .then(({ url }) => {
          if (cancelled) return;
          if (url) {
            setLogoUrl(url);
            setHasError(false);
            setIsLoading(false);
          } else {
            // Essayer le domaine suivant
            tryVariant(index + 1);
          }
        })
        .catch(() => {
          if (cancelled) return;
          // Essayer le domaine suivant en cas d'erreur réseau
          tryVariant(index + 1);
        });
    };

    tryVariant(0);

    return () => {
      cancelled = true;
    };
  }, [name]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Si pas de nom, ne rien afficher
  if (!name) {
    return null;
  }

  // Si pas d'URL ou erreur sans fallback, ne rien afficher
  if (!logoUrl || (hasError && !showFallback)) {
    return null;
  }

  // Afficher le logo avec gestion du chargement et des erreurs
  return (
    <div
      className={`relative flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Loader en arrière-plan (seulement si on charge et pas d'erreur) */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-theme-bg-secondary" />
      )}

      {/* Fallback si erreur et showFallback activé */}
      {hasError && showFallback && (
        <div className="flex items-center justify-center w-full h-full">
          {type === "school" ? (
            <GraduationCap
              className="text-theme-text-muted"
              size={size * 0.5}
            />
          ) : (
            // Icône valise pour les entreprises sans logo
            <Briefcase className="text-theme-text-muted" size={size * 0.5} />
          )}
        </div>
      )}

      {/* Image : uniquement des URLs validées par le backend (pas de 404 en console) */}
      {!hasError && logoUrl && (
        <img
          src={logoUrl}
          alt={`Logo ${name}`}
          className="w-full h-full object-contain p-1"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
          // Vérifier si l'image est déjà chargée (cache)
          ref={(img) => {
            if (img && isLoading && img.complete && img.naturalHeight !== 0) {
              handleImageLoad();
            }
          }}
        />
      )}
    </div>
  );
};
