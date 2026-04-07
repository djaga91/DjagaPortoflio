import React, { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { Layout, ExternalLink, ArrowRight, Edit } from "lucide-react";
import { portfolioAPI } from "../services/api";
import {
  cssFontToFrontend,
  colorModeToColorTheme,
  backendSectionsToFrontend,
} from "../components/portfolio/templates/templateUtils";

export const PortfolioView: React.FC = () => {
  const {
    setView,
    user,
    profile,
    fetchProfile,
    updateTemplateCustomization,
    setSelectedTemplateId,
    setIsEditingExistingTemplate,
    setPortfolioTemplateOverrides,
  } = useGameStore();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // Recharger le profil quand on revient sur cette page (pour détecter les changements de portfolio_url)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchProfile();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, fetchProfile]);

  // Recharger le profil quand on navigue vers cette vue (pour détecter les changements récents)
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // Générer l'URL du portfolio public
  const getPortfolioUrl = () => {
    if (profile?.portfolio_url) {
      return profile.portfolio_url;
    }
    if (user?.username) {
      // ⚠️ Sur mobile (capacitor://), utiliser l'URL de production
      const baseUrl = window.location.origin.startsWith("capacitor://")
        ? "https://portfolia.fr"
        : window.location.origin;
      return `${baseUrl}/portfolio/${user.username}`;
    }
    return null;
  };

  const portfolioUrl = getPortfolioUrl();

  // Vérifier si l'utilisateur a un site portfolio externe (pas généré par PortfoliA)
  // Un portfolio externe est une URL qui n'est pas une URL PortfoliA générée
  const hasExternalPortfolio = (() => {
    if (!profile?.portfolio_url || !profile.portfolio_url.trim()) {
      return false;
    }
    const url = profile.portfolio_url.trim().toLowerCase();

    // Vérifier si c'est une URL PortfoliA générée
    // Format attendu : http(s)://domain/portfolio/username ou domain/portfolio/username
    const portfoliaDomainPattern = /(portfolia\.fr|localhost|127\.0\.0\.1)/;
    const portfoliaPathPattern = /\/portfolio\/[^\/]+$/;

    // Vérifier si l'URL contient le domaine PortfoliA ET le chemin /portfolio/username
    const hasPortfoliaDomain = portfoliaDomainPattern.test(url);
    const hasPortfoliaPath = portfoliaPathPattern.test(url);

    // C'est une URL PortfoliA si elle contient le domaine ET le chemin /portfolio/username
    // OU si elle commence par /portfolio/ (URL relative)
    const isPortfoliAUrl =
      (hasPortfoliaDomain && hasPortfoliaPath) ||
      url.startsWith("/portfolio/") ||
      url.startsWith("portfolio/");

    // Si ce n'est pas une URL PortfoliA, c'est un portfolio externe
    return !isPortfoliAUrl;
  })();

  const handleViewPortfolio = () => {
    if (portfolioUrl) {
      window.open(portfolioUrl, "_blank");
    }
  };

  const handleEditPortfolio = async () => {
    try {
      // Charger la config sauvegardée depuis le backend
      const savedConfig = await portfolioAPI.getConfig();

      // Convertir la config backend vers le format frontend
      const frontendFont = cssFontToFrontend(savedConfig.theme?.fontFamily);
      const frontendColorTheme = colorModeToColorTheme(savedConfig.colorMode);
      const frontendSections = backendSectionsToFrontend(savedConfig.layout);

      // Mettre à jour le store avec la config sauvegardée
      // et indiquer qu'on est en mode "modifier" (pas "nouveau template")
      if (savedConfig.template) {
        setSelectedTemplateId(savedConfig.template);
      }
      const overrides: Record<string, unknown> =
        savedConfig.templateOverrides ?? {};
      const savedTemplate6Colors = (overrides.template6_colors ??
        overrides.template6Colors) as Record<string, string> | undefined;
      const templateFontsFromApi = {
        titles: (overrides.font_titles as string | undefined) ?? undefined,
        subtitles:
          (overrides.font_subtitles as string | undefined) ?? undefined,
        item: (overrides.font_item as string | undefined) ?? undefined,
        itemSmall:
          (overrides.font_item_small as string | undefined) ?? undefined,
        body: (overrides.font_body as string | undefined) ?? undefined,
      };
      updateTemplateCustomization({
        fontFamily: frontendFont,
        colorTheme: frontendColorTheme,
        sections: frontendSections,
        showLogos:
          savedConfig.showLogos !== undefined ? savedConfig.showLogos : true,
        selectedItems: savedConfig.selectedItems || undefined, // IMPORTANT: Charger selectedItems
        ...(savedTemplate6Colors && Object.keys(savedTemplate6Colors).length > 0
          ? { template6Colors: savedTemplate6Colors }
          : {}),
        templateFonts: templateFontsFromApi,
        ...(Array.isArray(overrides.custom_fonts) &&
        overrides.custom_fonts.length > 0
          ? { customFonts: overrides.custom_fonts }
          : {}),
      });

      // Charger les templateOverrides (inclut about_use_custom, about_text, about_image_url, font_*)
      // IMPORTANT: Ne PAS utiliser ?? pour about_layout et about_text_align si about_use_custom est true
      // Car ?? remplace undefined/null par la valeur par défaut, même si la valeur existe dans la DB
      const overridesWithDefaults: any = { ...overrides };
      if (overridesWithDefaults.about_use_custom === true) {
        // Seulement initialiser si le champ n'existe vraiment pas dans l'objet
        if (
          !("about_layout" in overridesWithDefaults) ||
          overridesWithDefaults.about_layout === null ||
          overridesWithDefaults.about_layout === undefined
        ) {
          overridesWithDefaults.about_layout = "image_top";
        }
        if (
          !("about_text_align" in overridesWithDefaults) ||
          overridesWithDefaults.about_text_align === null ||
          overridesWithDefaults.about_text_align === undefined
        ) {
          overridesWithDefaults.about_text_align = "center";
        }
      }
      setPortfolioTemplateOverrides(overridesWithDefaults);

      // Marquer qu'on est en mode "modifier le portfolio existant"
      setIsEditingExistingTemplate(true);

      // Aller vers l'éditeur
      setView("template_editor");
    } catch (error) {
      console.error("❌ Erreur chargement config portfolio:", error);
      // En cas d'erreur, aller quand même vers l'éditeur avec le template par défaut
      // (ou afficher un message d'erreur)
      setView("template_editor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto pt-4 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8">
          Mon Portfolio
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Carte 1: Découvrir les modèles */}
          {hasExternalPortfolio ? (
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg border-2 border-slate-200 dark:border-slate-700 opacity-75">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
                      <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Découvrir les modèles
                    </h2>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                    <p className="text-sm sm:text-base text-orange-800 dark:text-orange-200 font-medium mb-2">
                      ⚠️ Vous avez déjà votre propre site portfolio
                    </p>
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                      Vous utilisez déjà un site portfolio externe. Pour créer
                      un portfolio PortfoliA, veuillez d'abord supprimer votre
                      URL portfolio personnalisée dans les paramètres de votre
                      profil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setView("templates_list")}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-orange-500"
            >
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Découvrir les modèles
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                    Explorez notre collection de templates professionnels et
                    choisissez celui qui vous correspond le mieux.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-500 font-medium group-hover:gap-4 transition-all text-sm sm:text-base">
                <span>Commencer</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Carte 2: Mon portfolio actuel */}
          <div
            className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 ${
              !portfolioUrl ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Mon portfolio actuel
                  </h2>
                </div>
                {portfolioUrl ? (
                  <>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                      Consultez votre portfolio public ou modifiez-le selon vos
                      besoins.
                    </p>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded mb-3 sm:mb-4 truncate overflow-hidden max-w-full">
                      {portfolioUrl}
                    </div>
                  </>
                ) : (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                    Créez votre portfolio en choisissant un modèle ci-contre.
                  </p>
                )}
              </div>
            </div>
            {portfolioUrl ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={handleViewPortfolio}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg text-sm sm:text-base"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Voir</span>
                </button>
                <button
                  onClick={handleEditPortfolio}
                  disabled={hasExternalPortfolio}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    hasExternalPortfolio
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:shadow-lg"
                  }`}
                  title={
                    hasExternalPortfolio
                      ? "Impossible de modifier : vous utilisez un portfolio externe"
                      : ""
                  }
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 font-medium text-sm sm:text-base">
                <span>Indisponible</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
