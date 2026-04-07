import React from "react";

interface CVTemplatePreviewProps {
  template: "modern" | "academic-latex";
}

export const CVTemplatePreview: React.FC<CVTemplatePreviewProps> = ({
  template,
}) => {
  // Utiliser des images statiques pour les deux templates
  const imagePath =
    template === "modern" ? "/cv-preview-modern" : "/cv-preview-latex";

  const altText =
    template === "modern"
      ? "Aperçu CV Modern - Template moderne avec mise en page deux colonnes"
      : "Aperçu CV LaTeX - Template académique avec mise en page professionnelle";

  return (
    <div
      className="w-full overflow-hidden bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center"
      style={{ minHeight: "500px" }}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={imagePath}
          alt={altText}
          className="w-full h-auto rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          style={{ maxHeight: "600px", objectFit: "contain" }}
          onError={(e) => {
            // Fallback si l'image ne charge pas - afficher un placeholder
            console.error(`Erreur chargement image preview ${template}`);
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            // Afficher un message d'erreur stylisé
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 p-8">
                  <p class="text-sm">Image preview non disponible</p>
                  <p class="text-xs mt-2">Placez l'image dans /public${imagePath}</p>
                </div>
              `;
            }
          }}
        />
      </div>
    </div>
  );
};
