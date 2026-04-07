import React, { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { cvAPI } from "../../services/api";
import { getAbsoluteImageUrl } from "../../utils/imageUrl";

interface CVButtonProps {
  cvId?: string | null | undefined;
  cvUrl?: string | null | undefined; // URL directe du CV (pour vue publique)
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const CVButton: React.FC<CVButtonProps> = ({
  cvId,
  cvUrl: cvUrlProp,
  className = "",
  variant = "default",
  size = "md",
}) => {
  const [cvUrl, setCvUrl] = useState<string | null>(cvUrlProp || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si cvUrl est fourni directement, l'utiliser
    if (cvUrlProp) {
      setCvUrl(cvUrlProp);
      return;
    }

    // Sinon, récupérer l'URL depuis l'API si cvId est fourni
    const fetchCVUrl = async () => {
      if (!cvId) {
        setCvUrl(null);
        return;
      }

      try {
        setIsLoading(true);
        const response = await cvAPI.list();
        const cv = response.cvs.find((c) => c.id === cvId);
        if (cv) {
          setCvUrl(cv.cv_url);
        } else {
          setCvUrl(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du CV:", error);
        setCvUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVUrl();
  }, [cvId, cvUrlProp]);

  const handleClick = () => {
    if (!cvUrl) return;

    // Ouvrir le CV dans un nouvel onglet
    const absoluteUrl = getAbsoluteImageUrl(cvUrl) || cvUrl;
    window.open(absoluteUrl, "_blank", "noopener,noreferrer");
  };

  if (!cvUrl) {
    return null; // Ne pas afficher le bouton si aucun CV n'est associé
  }

  const iconSize = size === "sm" ? 18 : size === "lg" ? 24 : 20;
  const paddingClass = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2";

  const variantClasses = {
    default: "bg-orange-500 hover:bg-orange-600 text-white",
    outline:
      "border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    ghost: "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${paddingClass}
        ${variantClasses[variant]}
        inline-flex items-center justify-center rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title="Télécharger mon CV"
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <FileText size={iconSize} />
      )}
    </button>
  );
};
