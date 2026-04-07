import React, { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { PortfolioToolbar } from "../components/portfolio/PortfolioToolbar";
import { PortfolioRenderer } from "../components/portfolio/PortfolioRenderer";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { portfolioAPI } from "../services/api";
import {
  cssFontToFrontend,
  frontendFontToCSS,
  colorModeToColorTheme,
  colorThemeToColorMode,
  backendSectionsToFrontend,
} from "../components/portfolio/templates/templateUtils";
import { getItemOrder } from "../utils/itemOrder";

export const TemplateEditorView: React.FC = () => {
  const {
    selectedTemplateId,
    templateCustomization,
    isEditingExistingTemplate,
    portfolioTemplateOverrides,
    setPortfolioTemplateOverrides,
    setView,
    fetchProfile,
    fetchExperiences,
    fetchProjects,
    fetchSkills,
    fetchLanguages,
    fetchCertifications,
    fetchInterests,
    isAuthenticated,
    setActiveToast,
    user,
    profile,
    projects,
    updateTemplateCustomization,
    setSelectedTemplateId,
    updateProfile,
  } = useGameStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Charger toutes les données du profil (dont langues, certifications, centres d'intérêt) pour le template
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        fetchProfile(),
        fetchExperiences(),
        fetchProjects(),
        fetchSkills(),
        fetchLanguages(),
        fetchCertifications(),
        fetchInterests(),
      ]);
    }
  }, [
    isAuthenticated,
    fetchProfile,
    fetchExperiences,
    fetchProjects,
    fetchSkills,
    fetchLanguages,
    fetchCertifications,
    fetchInterests,
  ]);

  // Charger la configuration du portfolio depuis le backend
  // IMPORTANT: Toujours charger selectedItems même si on change de template
  useEffect(() => {
    const loadPortfolioConfig = async () => {
      if (!isAuthenticated || !selectedTemplateId) {
        setIsLoadingConfig(false);
        return;
      }

      try {
        const savedConfig = await portfolioAPI.getConfig();

        // Charger la config sauvegardée seulement si elle correspond au template sélectionné
        if (
          savedConfig.template === selectedTemplateId &&
          isEditingExistingTemplate
        ) {
          // Convertir la config backend vers le format frontend
          const frontendFont = cssFontToFrontend(savedConfig.theme?.fontFamily);
          const frontendColorTheme = colorModeToColorTheme(
            savedConfig.colorMode,
          );
          const frontendSections = backendSectionsToFrontend(
            savedConfig.layout,
          );

          // Mettre à jour le store avec la config chargée
          const tplOv = savedConfig.templateOverrides as
            | Record<string, any>
            | null
            | undefined;
          const savedTemplate6Colors = (tplOv?.template6_colors ??
            tplOv?.template6Colors) as Record<string, string> | undefined;
          const savedFontTitles = tplOv?.font_titles as string | undefined;
          const savedFontSubtitles = tplOv?.font_subtitles as
            | string
            | undefined;
          const savedFontItem = tplOv?.font_item as string | undefined;
          const savedFontItemSmall = tplOv?.font_item_small as
            | string
            | undefined;
          const savedFontBody = tplOv?.font_body as string | undefined;
          const savedCustomFonts = tplOv?.custom_fonts as
            | Array<{ id: string; name: string; url: string }>
            | undefined;
          updateTemplateCustomization({
            fontFamily: frontendFont,
            colorTheme: frontendColorTheme,
            sections: frontendSections,
            showLogos:
              savedConfig.showLogos !== undefined
                ? savedConfig.showLogos
                : true,
            selectedItems: savedConfig.selectedItems || undefined,
            itemOrder: savedConfig.itemOrder || undefined,
            cvId: savedConfig.cvId || null,
            cvUrl: savedConfig.cvUrl || null,
            ...(savedTemplate6Colors &&
            Object.keys(savedTemplate6Colors).length > 0
              ? { template6Colors: savedTemplate6Colors }
              : {}),
            ...(savedFontTitles != null ||
            savedFontSubtitles != null ||
            savedFontItem != null ||
            savedFontItemSmall != null ||
            savedFontBody != null
              ? {
                  templateFonts: {
                    titles: savedFontTitles,
                    subtitles: savedFontSubtitles,
                    item: savedFontItem,
                    itemSmall: savedFontItemSmall,
                    body: savedFontBody,
                  },
                }
              : {}),
            ...(Array.isArray(savedCustomFonts) && savedCustomFonts.length > 0
              ? { customFonts: savedCustomFonts }
              : {}),
          });
          // Charger les surcharges hero / template (photo hero, titre, bio, template6_highlights)
          const overridesRaw = savedConfig.templateOverrides ?? {};
          const overrides =
            typeof overridesRaw === "object" &&
            overridesRaw !== null &&
            !Array.isArray(overridesRaw)
              ? { ...overridesRaw }
              : {};
          // IMPORTANT: Ne PAS utiliser ?? pour about_layout et about_text_align si about_use_custom est true
          // Car ?? remplace undefined/null par la valeur par défaut, même si la valeur existe dans la DB
          // On doit seulement initialiser si le champ est vraiment absent (pas dans l'objet)
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
        } else {
          // Même si le template est différent ou mode nouveau : charger itemOrder, selectedItems, templateOverrides pour ne pas perdre les modifs
          const updates: Parameters<typeof updateTemplateCustomization>[0] = {};
          if (savedConfig.selectedItems) {
            updates.selectedItems = savedConfig.selectedItems;
          }
          if (
            savedConfig.itemOrder != null &&
            typeof savedConfig.itemOrder === "object"
          ) {
            updates.itemOrder = savedConfig.itemOrder;
          }
          if (
            savedConfig.cvId !== undefined ||
            savedConfig.cvUrl !== undefined
          ) {
            updates.cvId = savedConfig.cvId ?? null;
            updates.cvUrl = savedConfig.cvUrl ?? null;
          }
          const savedTemplate6Colors = (savedConfig.templateOverrides
            ?.template6_colors ??
            savedConfig.templateOverrides?.template6Colors) as
            | Record<string, string>
            | undefined;
          if (
            savedTemplate6Colors &&
            Object.keys(savedTemplate6Colors).length > 0
          ) {
            updates.template6_colors = savedTemplate6Colors;
          }
          const tplOv2 = savedConfig.templateOverrides as
            | Record<string, any>
            | null
            | undefined;
          const savedFontTitles = tplOv2?.font_titles as string | undefined;
          const savedFontSubtitles = tplOv2?.font_subtitles as
            | string
            | undefined;
          const savedFontItem = tplOv2?.font_item as string | undefined;
          const savedFontItemSmall = tplOv2?.font_item_small as
            | string
            | undefined;
          const savedFontBody = tplOv2?.font_body as string | undefined;
          const savedCustomFonts = tplOv2?.custom_fonts as
            | Array<{ id: string; name: string; url: string }>
            | undefined;
          (updates as any).templateFonts = {
            titles: savedFontTitles ?? undefined,
            subtitles: savedFontSubtitles ?? undefined,
            item: savedFontItem ?? undefined,
            itemSmall: savedFontItemSmall ?? undefined,
            body: savedFontBody ?? undefined,
          };
          if (Array.isArray(savedCustomFonts) && savedCustomFonts.length > 0) {
            (updates as any).customFonts = savedCustomFonts;
          } else if (
            savedConfig.templateOverrides &&
            "custom_fonts" in savedConfig.templateOverrides
          ) {
            (updates as any).customFonts = [];
          }
          if (Object.keys(updates).length > 0) {
            updateTemplateCustomization(updates);
          }

          if (savedConfig.templateOverrides) {
            const toRaw = savedConfig.templateOverrides;
            const toPlain =
              typeof toRaw === "object" &&
              toRaw !== null &&
              !Array.isArray(toRaw)
                ? { ...toRaw }
                : {};
            const overridesWithDefaults: any = { ...toPlain };
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
          }
        }
      } catch (error) {
        console.error(
          "❌ [TemplateEditorView] Erreur chargement config:",
          error,
        );
        // En cas d'erreur, on continue avec les valeurs par défaut
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadPortfolioConfig();
  }, [
    isAuthenticated,
    selectedTemplateId,
    isEditingExistingTemplate,
    updateTemplateCustomization,
    setPortfolioTemplateOverrides,
  ]);

  const handleBack = () => {
    setSelectedTemplateId(null);
    setView("templates_list");
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convertir la customisation frontend vers le format backend (inclut les surcharges hero)
      // IMPORTANT: Toujours inclure templateOverrides s'il existe (même vide)
      // Cela garantit que les champs about_* sont sauvegardés même si about_use_custom est false
      const baseOverrides = portfolioTemplateOverrides ?? {};

      // Nettoyer templateOverrides : inclure tous les champs définis, même s'ils sont null/undefined
      // (contrairement à selectedItems, on veut garder tous les champs pour la persistance)
      // IMPORTANT: Toujours inclure about_layout et about_text_align avec leurs valeurs par défaut si about_use_custom est true
      // CRITIQUE: Toujours créer templateOverridesForSave si baseOverrides contient des champs about_*
      // ou si about_use_custom est true, pour garantir la persistance
      const templateOverridesForSave = (() => {
        // Commencer par copier tous les champs de baseOverrides
        const cleaned: any = { ...baseOverrides };

        // Si about_use_custom est true, s'assurer que about_layout et about_text_align sont définis
        // IMPORTANT: Préserver les valeurs existantes de baseOverrides si elles sont définies
        // Ne les remplacer par les valeurs par défaut QUE si elles sont vraiment absentes/null/undefined/vides
        if (cleaned.about_use_custom === true) {
          // cleaned est déjà une copie de baseOverrides, donc les valeurs devraient déjà être présentes
          // Mais on vérifie quand même pour s'assurer qu'elles sont définies
          if (
            !("about_layout" in cleaned) ||
            cleaned.about_layout === null ||
            cleaned.about_layout === undefined ||
            cleaned.about_layout === ""
          ) {
            cleaned.about_layout = "image_top";
          }

          if (
            !("about_text_align" in cleaned) ||
            cleaned.about_text_align === null ||
            cleaned.about_text_align === undefined ||
            cleaned.about_text_align === ""
          ) {
            cleaned.about_text_align = "center";
          }
        }

        // Retourner cleaned seulement s'il contient au moins un champ (pour éviter d'envoyer un objet vide)
        // MAIS si about_use_custom est true, on doit toujours retourner cleaned même s'il est vide
        // Template 6 : persister les couleurs personnalisées
        if (
          templateCustomization.template6_colors &&
          Object.keys(templateCustomization.template6_colors).length > 0
        ) {
          cleaned.template6_colors = {
            ...templateCustomization.template6_colors,
          };
        }
        // Templates 1–6 : toujours envoyer les polices (valeur ou null) pour que le backend écrase les anciennes
        // Sinon en "réinitialiser" ou changement de police, le merge backend garde les anciennes valeurs
        const isTemplate1To6 =
          selectedTemplateId &&
          [
            "template1",
            "template2",
            "template3",
            "template4",
            "template5",
            "template6",
          ].includes(selectedTemplateId);
        if (isTemplate1To6) {
          const tf = templateCustomization.templateFonts;
          cleaned.font_titles = tf?.titles ?? null;
          cleaned.font_subtitles = tf?.subtitles ?? null;
          cleaned.font_item = tf?.item ?? null;
          cleaned.font_item_small = tf?.itemSmall ?? null;
          cleaned.font_body = tf?.body ?? null;
        }
        if (
          templateCustomization.customFonts &&
          templateCustomization.customFonts.length > 0
        ) {
          cleaned.custom_fonts = templateCustomization.customFonts;
        } else if (isTemplate1To6) {
          cleaned.custom_fonts = null;
        }
        // IMPORTANT: Inclure aussi si template6_highlights existe (même vide) pour persister les modifications
        if (
          Object.keys(cleaned).length > 0 ||
          cleaned.about_use_custom === true ||
          cleaned.template6_highlights !== undefined
        ) {
          return cleaned;
        }
        return undefined;
      })();

      // CRITIQUE: S'assurer que templateOverridesForSave contient bien about_layout et about_text_align
      // avant de l'assigner à config.templateOverrides
      if (
        templateOverridesForSave &&
        templateOverridesForSave.about_use_custom === true
      ) {
        if (
          !("about_layout" in templateOverridesForSave) ||
          templateOverridesForSave.about_layout === null ||
          templateOverridesForSave.about_layout === undefined ||
          templateOverridesForSave.about_layout === ""
        ) {
          console.warn(
            "⚠️ [TemplateEditorView] about_layout manquant dans templateOverridesForSave, FORCÉ à image_top",
          );
          templateOverridesForSave.about_layout = "image_top";
        }
        if (
          !("about_text_align" in templateOverridesForSave) ||
          templateOverridesForSave.about_text_align === null ||
          templateOverridesForSave.about_text_align === undefined ||
          templateOverridesForSave.about_text_align === ""
        ) {
          console.warn(
            "⚠️ [TemplateEditorView] about_text_align manquant dans templateOverridesForSave, FORCÉ à center",
          );
          templateOverridesForSave.about_text_align = "center";
        }
      }

      const config = {
        template: selectedTemplateId as any,
        colorMode: colorThemeToColorMode(templateCustomization.colorTheme),
        layout: templateCustomization.sections.map((section, index) => ({
          id: section.id,
          type: section.id as any,
          visible: section.visible,
          order: index,
        })),
        theme: {
          primaryColor: "#FF8C42",
          fontFamily: frontendFontToCSS(templateCustomization.fontFamily),
        },
        templateOverrides: templateOverridesForSave,
        showLogos:
          templateCustomization.showLogos !== undefined
            ? templateCustomization.showLogos
            : true,
        // Nettoyer selectedItems : ne garder que les tableaux non vides ET non-undefined
        // IMPORTANT: Si un champ est undefined, cela signifie "tous sélectionnés", donc on ne l'inclut pas
        // Si un champ est un tableau, cela signifie "seulement ceux-là sont sélectionnés", donc on l'inclut
        selectedItems: templateCustomization.selectedItems
          ? (() => {
              const cleaned: any = {};
              const si = templateCustomization.selectedItems;

              // Inclure seulement les champs qui sont des tableaux (pas undefined)
              if (
                si.experiences &&
                Array.isArray(si.experiences) &&
                si.experiences.length > 0
              ) {
                cleaned.experiences = si.experiences;
              }
              if (
                si.educations &&
                Array.isArray(si.educations) &&
                si.educations.length > 0
              ) {
                cleaned.educations = si.educations;
              }
              if (
                si.projects &&
                Array.isArray(si.projects) &&
                si.projects.length > 0
              ) {
                cleaned.projects = si.projects;
              }
              if (
                si.skills &&
                Array.isArray(si.skills) &&
                si.skills.length > 0
              ) {
                cleaned.skills = si.skills;
              }
              if (
                si.languages &&
                Array.isArray(si.languages) &&
                si.languages.length > 0
              ) {
                cleaned.languages = si.languages;
              }
              if (
                si.certifications &&
                Array.isArray(si.certifications) &&
                si.certifications.length > 0
              ) {
                cleaned.certifications = si.certifications;
              }
              if (
                si.interests &&
                Array.isArray(si.interests) &&
                si.interests.length > 0
              ) {
                cleaned.interests = si.interests;
              }

              // Retourner undefined seulement si aucun champ n'est sélectionné (tous sont undefined)
              // Sinon, retourner l'objet cleaned même s'il n'a qu'un seul champ
              return Object.keys(cleaned).length > 0 ? cleaned : undefined;
            })()
          : undefined,
        // Toujours persister l'ordre des projets pour que la page publique affiche le même ordre que l'éditeur
        itemOrder: (() => {
          const existing = templateCustomization.itemOrder;
          const projectIds = existing?.projects?.length
            ? existing.projects
            : projects?.length
              ? getItemOrder(projects, (p) => p.id)
              : undefined;
          if (!existing && !projectIds?.length) return undefined;
          return {
            ...(existing ?? {}),
            projects: projectIds ?? existing?.projects ?? [],
          };
        })(),
        cvId: templateCustomization.cvId || null,
        cvUrl: templateCustomization.cvUrl || null,
      };

      // CRITIQUE template6 : forcer template6_highlights depuis le store dans le payload (éviter toute perte)
      if (selectedTemplateId === "template6") {
        const fromStore = portfolioTemplateOverrides?.template6_highlights;
        const hasHighlights =
          (fromStore?.length ?? 0) > 0 || fromStore !== undefined;
        if (
          hasHighlights ||
          portfolioTemplateOverrides?.template6_highlights_title !==
            undefined ||
          portfolioTemplateOverrides?.template6_highlights_description !==
            undefined
        ) {
          if (!config.templateOverrides) {
            config.templateOverrides = {
              ...(portfolioTemplateOverrides ?? {}),
            };
          }
          config.templateOverrides.template6_highlights = Array.isArray(
            fromStore,
          )
            ? [...fromStore]
            : [];
          if (
            portfolioTemplateOverrides?.template6_highlights_title !== undefined
          ) {
            config.templateOverrides.template6_highlights_title =
              portfolioTemplateOverrides.template6_highlights_title;
          }
          if (
            portfolioTemplateOverrides?.template6_highlights_description !==
            undefined
          ) {
            config.templateOverrides.template6_highlights_description =
              portfolioTemplateOverrides.template6_highlights_description;
          }
        }
      }

      // Vérifier que templateOverrides contient bien about_layout et about_text_align
      // CRITIQUE: S'assurer que les valeurs de templateOverridesForSave sont bien dans config.templateOverrides
      if (
        config.templateOverrides &&
        config.templateOverrides.about_use_custom === true
      ) {
        // Vérifier si about_layout est absent ou vide (null, undefined, "")
        if (
          !("about_layout" in config.templateOverrides) ||
          config.templateOverrides.about_layout === null ||
          config.templateOverrides.about_layout === undefined ||
          config.templateOverrides.about_layout === ""
        ) {
          // Essayer de récupérer depuis templateOverridesForSave d'abord
          const fallbackValue =
            templateOverridesForSave?.about_layout || "image_top";
          console.warn(
            `⚠️ [TemplateEditorView] about_layout manquant dans config.templateOverrides, FORCÉ à "${fallbackValue}"`,
          );
          config.templateOverrides.about_layout = fallbackValue;
        }
        // Vérifier si about_text_align est absent ou vide (null, undefined, "")
        if (
          !("about_text_align" in config.templateOverrides) ||
          config.templateOverrides.about_text_align === null ||
          config.templateOverrides.about_text_align === undefined ||
          config.templateOverrides.about_text_align === ""
        ) {
          // Essayer de récupérer depuis templateOverridesForSave d'abord
          const fallbackValue =
            templateOverridesForSave?.about_text_align || "center";
          console.warn(
            `⚠️ [TemplateEditorView] about_text_align manquant dans config.templateOverrides, FORCÉ à "${fallbackValue}"`,
          );
          config.templateOverrides.about_text_align = fallbackValue;
        }
      }

      // VÉRIFICATION FINALE: S'assurer que about_layout et about_text_align sont bien dans config.templateOverrides
      if (
        config.templateOverrides &&
        config.templateOverrides.about_use_custom === true
      ) {
        const hasLayout =
          "about_layout" in config.templateOverrides &&
          config.templateOverrides.about_layout !== null &&
          config.templateOverrides.about_layout !== undefined &&
          config.templateOverrides.about_layout !== "";
        const hasTextAlign =
          "about_text_align" in config.templateOverrides &&
          config.templateOverrides.about_text_align !== null &&
          config.templateOverrides.about_text_align !== undefined &&
          config.templateOverrides.about_text_align !== "";

        if (!hasLayout || !hasTextAlign) {
          console.error(
            "❌ [TemplateEditorView] ERREUR CRITIQUE: about_layout ou about_text_align manquants AVANT envoi au backend!",
            {
              hasLayout,
              hasTextAlign,
              about_layout: config.templateOverrides.about_layout,
              about_text_align: config.templateOverrides.about_text_align,
              templateOverridesForSave,
              templateOverridesForSaveAbout: templateOverridesForSave
                ? {
                    about_layout: templateOverridesForSave.about_layout,
                    about_text_align: templateOverridesForSave.about_text_align,
                  }
                : null,
            },
          );
        }
      }

      // Vérifier que selectedItems est bien présent dans l'objet config
      if (!config.selectedItems) {
        console.warn(
          "⚠️ [TemplateEditorView] selectedItems est undefined dans config!",
        );
      }

      // VÉRIFICATION FINALE AVANT ENVOI: S'assurer que about_layout et about_text_align sont bien dans config.templateOverrides
      if (
        config.templateOverrides &&
        config.templateOverrides.about_use_custom === true
      ) {
        const finalCheck = {
          hasLayout: "about_layout" in config.templateOverrides,
          hasTextAlign: "about_text_align" in config.templateOverrides,
          layoutValue: config.templateOverrides.about_layout,
          textAlignValue: config.templateOverrides.about_text_align,
        };

        if (!finalCheck.hasLayout || !finalCheck.hasTextAlign) {
          console.error(
            "❌ [TemplateEditorView] ERREUR CRITIQUE: about_layout ou about_text_align manquants AVANT envoi!",
            {
              configTemplateOverrides: config.templateOverrides,
              templateOverridesForSave,
              baseOverrides,
            },
          );
        }
      }

      // Copie JSON propre pour garantir que template6_highlights (et tout) est bien sérialisé
      const configToSend = JSON.parse(JSON.stringify(config)) as typeof config;
      if (
        selectedTemplateId === "template6" &&
        portfolioTemplateOverrides?.template6_highlights != null
      ) {
        if (!configToSend.templateOverrides)
          configToSend.templateOverrides = {};
        configToSend.templateOverrides.template6_highlights =
          portfolioTemplateOverrides.template6_highlights;
      }
      await portfolioAPI.saveConfig(configToSend);

      // Mettre à jour automatiquement portfolio_url avec l'URL PortfoliA générée
      if (user?.username) {
        try {
          // Générer l'URL du portfolio PortfoliA
          // ⚠️ Sur mobile (capacitor://), utiliser l'URL de production
          const baseUrl = window.location.origin.startsWith("capacitor://")
            ? "https://portfolia.fr"
            : window.location.origin;
          const portfoliaUrl = `${baseUrl}/portfolio/${user.username}`;

          // Mettre à jour le profil avec l'URL PortfoliA
          await updateProfile({
            portfolio_url: portfoliaUrl,
          });

          // Recharger le profil pour avoir les données à jour
          await fetchProfile();
        } catch (profileError) {
          console.error(
            "⚠️ [TemplateEditorView] Erreur mise à jour portfolio_url:",
            profileError,
          );
          // Ne pas bloquer la sauvegarde si la mise à jour du profil échoue
        }
      }

      setActiveToast({
        type: "success",
        title: "✓ Portfolio enregistré",
        message: "Vos modifications ont été sauvegardées avec succès",
        icon: "✅",
      });
    } catch (error) {
      console.error("❌ [TemplateEditorView] Erreur sauvegarde:", error);
      setActiveToast({
        type: "error",
        title: "✗ Erreur",
        message: "Impossible de sauvegarder le portfolio",
        icon: "❌",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPortfolio = () => {
    const portfolioUrl = getPortfolioUrl();
    if (portfolioUrl) {
      window.open(portfolioUrl, "_blank");
    } else {
      setActiveToast({
        type: "warning",
        title: "Portfolio non disponible",
        message: "Veuillez d'abord enregistrer votre portfolio",
        icon: "⚠️",
      });
    }
  };

  if (!selectedTemplateId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Aucun template sélectionné
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retour aux templates
          </button>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant le chargement de la config
  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Chargement de la configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-slate-900 relative overflow-hidden">
      {/* Top Navigation - avec Safe Area pour l'encoche mobile */}
      <div
        className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-[120] flex items-center px-6 justify-between"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          height: "calc(4rem + env(safe-area-inset-top, 0px))",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Retour</span>
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-slate-600 mx-2"></div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Éditeur de Portfolio
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Save size={16} className="animate-pulse" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Publier
              </>
            )}
          </button>
          {getPortfolioUrl() && (
            <button
              onClick={handleViewPortfolio}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium transition-colors"
            >
              <ExternalLink size={16} />
              Voir
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="pt-24 pb-12 px-4 md:px-12 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden min-h-[800px] bg-white dark:bg-slate-800 ring-1 ring-black/5">
          <PortfolioRenderer />
        </div>
      </div>

      {/* Draggable Toolbar */}
      <PortfolioToolbar />
    </div>
  );
};
