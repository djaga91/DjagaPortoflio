import React from "react";
import {
  FileText,
  Layout,
  ArrowRight,
  MousePointer2,
  Move,
  Download,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { CVTemplatePreview } from "../components/cv/CVTemplatePreview";

export const CVTemplateSelectionView: React.FC = () => {
  const { setView } = useGameStore();

  // Nettoyer le localStorage au chargement pour forcer un nouveau choix
  React.useEffect(() => {
    localStorage.removeItem("selected_cv_template");
  }, []);

  const handleSelectTemplate = (template: "modern" | "academic-latex") => {
    // Stocker le template choisi dans le localStorage pour que CVGeneratorView le récupère
    localStorage.setItem("selected_cv_template", template);
    // Rediriger vers la page de génération CV
    setView("cv_generate");
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      {/* Container principal centré */}
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-4">
            Choisissez votre template CV
          </h1>
          <p className="text-lg text-theme-text-secondary max-w-2xl mx-auto">
            Sélectionnez le style qui correspond le mieux à votre profil
            professionnel
          </p>
        </div>

        {/* Templates Grid - Centré */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 mb-6 md:mb-8 w-full">
          {/* Template Modern */}
          <div className="w-full md:w-[500px] group">
            <div
              onClick={() => handleSelectTemplate("modern")}
              className="cursor-pointer bg-white dark:bg-theme-card rounded-2xl overflow-hidden hover:border-2 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-2xl transform"
            >
              {/* Header de la carte */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Layout size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-theme-text-primary">
                        CV Modern
                      </h3>
                      <p className="text-sm text-theme-text-secondary font-medium">
                        2 colonnes
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={24}
                    className="text-theme-text-secondary group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1"
                  />
                </div>
              </div>

              {/* Aperçu visuel du CV */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 overflow-hidden min-h-[500px] flex items-center justify-center">
                <CVTemplatePreview template="modern" />
              </div>

              {/* Description et badges sous l'image */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-theme-text-secondary mb-4 leading-relaxed text-sm">
                  Design moderne et professionnel avec mise en page en deux
                  colonnes. Idéal pour la plupart des secteurs d'activité.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                    Moderne
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                    2 colonnes
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                    Polyvalent
                  </span>
                </div>
              </div>

              {/* Footer avec CTA */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-center">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Cliquez pour sélectionner ce template
                </span>
              </div>
            </div>
          </div>

          {/* Template Academic LaTeX */}
          <div className="w-full md:w-[500px] group">
            <div
              onClick={() => handleSelectTemplate("academic-latex")}
              className="cursor-pointer bg-white dark:bg-theme-card rounded-2xl overflow-hidden hover:border-2 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl transform"
            >
              {/* Header de la carte */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <FileText size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-theme-text-primary">
                        CV LaTeX
                      </h3>
                      <p className="text-sm text-theme-text-secondary font-medium">
                        Type Finance
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={24}
                    className="text-theme-text-secondary group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-1"
                  />
                </div>
              </div>

              {/* Aperçu visuel du CV */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 overflow-hidden min-h-[500px] flex items-center justify-center">
                <CVTemplatePreview template="academic-latex" />
              </div>

              {/* Description et badges sous l'image */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-theme-text-secondary mb-4 leading-relaxed text-sm">
                  Style académique et élégant inspiré du LaTeX. Parfait pour les
                  secteurs de la finance, de la recherche et du conseil.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                    Académique
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                    1 colonne
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                    Finance
                  </span>
                </div>
              </div>

              {/* Footer avec CTA */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-center">
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Cliquez pour sélectionner ce template
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section - Avec nouvelle couleur et mention drag and drop */}
        <div className="mt-6 md:mt-8 p-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800 w-full max-w-[872px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <MousePointer2 size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              Simple et intuitif
            </h2>
          </div>
          <p className="text-purple-800 dark:text-purple-200 mb-6 text-lg font-medium">
            Créez votre CV en quelques minutes grâce à notre interface drag and
            drop
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-theme-card/60 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Choisissez votre template
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Sélectionnez le style qui vous convient
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-theme-card/60 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Move className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Drag & Drop
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Glissez-déposez vos sections pour personnaliser
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-theme-card/60 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Téléchargez en PDF
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Exportez votre CV professionnel instantanément
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
