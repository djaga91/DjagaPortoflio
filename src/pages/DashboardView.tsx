import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  Mic,
  Mail,
  Lightbulb,
  Zap,
  Crown,
  Target,
} from "lucide-react";
import {
  gamificationAPI,
  matchingAPI,
  jobNotificationsAPI,
  JobOffer,
} from "../services/api";
import { useGameStore } from "../store/gameStore";
import { ViewType } from "../types";
import {
  calculateCompleteness,
  generateDailyAdvice,
  validateAndFixAdvice,
  isAdviceAlreadyCompleted,
  getProfileSectionForMissionId,
} from "../utils/profileCompleteness";
import { AIUsageWidget } from "../components/AIUsageWidget";
import { BadgesPreview } from "../components/BadgesPreview";
import { AIBadge } from "../components/AIBadge";
import { DailyObjectivesCard } from "../components/DailyObjectivesCard";
import { JobNotificationsCard } from "../components/JobNotificationsCard";
import { LegendaryBadgeAnimation } from "../components/LegendaryBadgeAnimation";

export const DashboardView: React.FC = () => {
  const {
    user,
    profile,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    skills,
    interests,
    gamification,
    setView,
  } = useGameStore();

  // Vérifier si l'utilisateur a le badge légendaire
  const hasLegendaryBadge =
    gamification?.badges?.includes("legendary") || false;

  // État pour l'animation du badge légendaire
  const [showLegendaryAnimation, setShowLegendaryAnimation] = useState(false);

  // Vérifier si l'animation du badge légendaire doit être affichée
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Vérifier si le badge a été débloqué ET si l'utilisateur vient de "Offres"
    const legendaryAnimationShown = localStorage.getItem(
      `legendary_animation_shown_${user.id}`,
    );
    const shouldShowAnimation = localStorage.getItem(
      `show_legendary_animation_${user.id}`,
    );

    // Afficher l'animation si le flag est présent ET qu'elle n'a jamais été montrée
    if (shouldShowAnimation === "true" && legendaryAnimationShown !== "true") {
      // Afficher l'animation
      setShowLegendaryAnimation(true);

      // Marquer l'animation comme vue
      localStorage.setItem(`legendary_animation_shown_${user.id}`, "true");

      // Nettoyer le flag de déclenchement
      localStorage.removeItem(`show_legendary_animation_${user.id}`);
    }
  }, [hasLegendaryBadge, user?.id, gamification?.badges]);

  // State pour le prochain jalon (depuis le backend)
  const [nextMilestone, setNextMilestone] = useState<{
    id: string;
    name: string;
    description: string;
    icon: string;
  } | null>(null);
  const [backendCompleteness, setBackendCompleteness] = useState<number | null>(
    null,
  );
  const [savedOffers, setSavedOffers] = useState<JobOffer[]>([]);
  const [keywordsCount, setKeywordsCount] = useState<number>(0);

  // Charger le nombre de mots-clés (objectif professionnel) pour la complétude et le conseil du jour
  useEffect(() => {
    if (!user) {
      setKeywordsCount(0);
      return;
    }
    jobNotificationsAPI
      .getKeywords()
      .then((keywords) => setKeywordsCount(keywords.length))
      .catch(() => setKeywordsCount(0));
  }, [user?.id]);

  // Charger la complétude depuis le backend
  useEffect(() => {
    const fetchCompleteness = async () => {
      try {
        const data = await gamificationAPI.getCompleteness();
        setBackendCompleteness(data.score);
        setNextMilestone(data.next_milestone);
      } catch (err) {
        console.error("Erreur chargement complétude:", err);
      }
    };

    fetchCompleteness();
  }, [profile, experiences, educations, projects, skills]);

  // Charger les offres sauvegardées pour calculer les objectifs
  useEffect(() => {
    const loadSavedOffers = async () => {
      try {
        const offers = await matchingAPI.getSavedOffers();
        setSavedOffers(offers);
      } catch (err) {
        console.error("Erreur chargement offres sauvegardées:", err);
      }
    };

    loadSavedOffers();
  }, []);

  // Navigation vers le prochain objectif
  const navigateToMilestone = useCallback(
    (milestoneId: string) => {
      const milestoneRoutes: Record<string, ViewType> = {
        photo: "profile",
        bio: "profile",
        contact: "profile",
        experience_1: "profile",
        experience_2: "profile",
        education_1: "profile",
        skills_5: "profile",
        skills_10: "profile",
        project_1: "profile",
        language_1: "profile",
        social_links: "profile",
        cv_generated: "cv_forge",
        cover_letter: "cover_letters",
      };

      const destination = milestoneRoutes[milestoneId] || "profile";
      setView(destination);
    },
    [setView],
  );

  // Calculer la complétude réelle du profil (objectivesCount = mots-clés = objectif professionnel déjà défini)
  const completenessResult = useMemo(() => {
    return calculateCompleteness(
      profile,
      experiences,
      educations || [],
      projects || [],
      languages || [],
      certifications || [],
      skills,
      interests || [],
      keywordsCount,
    );
  }, [
    profile,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    skills,
    interests,
    keywordsCount,
  ]);

  const completeness = backendCompleteness || completenessResult.percentage;

  // Vérifier si l'utilisateur a trouvé un job
  const hasFoundJob =
    hasLegendaryBadge || (savedOffers && savedOffers.some((o) => o.job_found));

  // Calculer le nombre de jours depuis que le job a été trouvé
  const daysSinceJobFound = useMemo(() => {
    if (!hasFoundJob) return 0;

    // Trouver l'offre avec job_found et sa date
    const jobOffer = savedOffers?.find((o) => o.job_found && o.job_found_at);
    if (!jobOffer?.job_found_at) {
      // Si pas de date, considérer que c'est aujourd'hui (jour 0)
      return 0;
    }

    const jobFoundDate = new Date(jobOffer.job_found_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    jobFoundDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - jobFoundDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }, [hasFoundJob, savedOffers]);

  // Générer le conseil du jour basé sur la complétude réelle
  // Utiliser localStorage pour n'afficher qu'un seul conseil par jour
  // IMPORTANT : Invalider le cache si hasFoundJob change pour forcer la régénération
  const dailyAdvice = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const storageKey = `daily_advice_${user?.id || "guest"}_${today}`;
    const CACHE_VERSION = "v2"; // Version du cache (incrémenter pour invalider les anciens conseils)
    const stored = localStorage.getItem(storageKey);

    // Si on a trouvé un job, générer un nouveau conseil chaque jour
    if (hasFoundJob) {
      // Générer un nouveau conseil basé sur le nombre de jours depuis que le job a été trouvé
      const advice = generateDailyAdvice(
        completenessResult,
        profile,
        hasFoundJob,
        daysSinceJobFound,
        experiences,
        educations,
        projects,
        languages,
        certifications,
        skills,
        interests,
      );

      // Sauvegarder pour aujourd'hui avec version du cache
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...advice, _cacheVersion: CACHE_VERSION }),
      );

      return advice;
    }

    // Si on n'a pas trouvé de job, utiliser le système normal (conseil basé sur complétude)
    // Si on a déjà un conseil pour aujourd'hui, le réutiliser SEULEMENT s'il n'est pas de type "job trouvé"
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // Invalider les anciens conseils qui n'ont pas la version du cache
        if (parsed._cacheVersion !== CACHE_VERSION) {
          localStorage.removeItem(storageKey);
          // Sortir du try pour régénérer un nouveau conseil
          throw new Error("Cache version mismatch");
        }

        // Vérifier que ce n'est pas un conseil "job trouvé" : vérifier si c'est un conseil de JOB_FOUND_ADVICE_BANK
        // Les conseils "job trouvé" ont des titres spécifiques ou des messages caractéristiques
        const isJobFoundAdvice =
          parsed.title?.includes("nouveau poste") ||
          parsed.title?.includes("Félicitations pour votre nouveau poste") ||
          parsed.title?.includes("Préparez votre intégration") ||
          parsed.title?.includes("Documentez votre succès") ||
          parsed.title?.includes("Continuez à développer") ||
          parsed.title?.includes("Partagez votre réussite") ||
          parsed.title?.includes("Préparez-vous pour l'avenir") ||
          parsed.title?.includes("Célébrez et préparez") ||
          parsed.title?.includes("Mettez à jour vos réseaux") ||
          parsed.title?.includes("Ajoutez vos nouvelles compétences") ||
          parsed.title?.includes("Préparez votre période") ||
          parsed.title?.includes("Restez actif professionnellement") ||
          parsed.title?.includes("Valorisez votre nouveau rôle") ||
          parsed.title?.includes("Construisez votre réputation") ||
          parsed.title?.includes("Développez votre réseau") ||
          parsed.message?.includes("nouveau poste") ||
          parsed.message?.includes("nouveau job") ||
          parsed.message?.includes("nouveau rôle");

        // Vérifier si c'est l'ancien conseil de localisation problématique (à invalider)
        const isOldLocationAdvice = parsed.message?.includes(
          "« France » ou « Remote » peut suffire",
        );

        // Vérifier si c'est un conseil sur le téléphone avec une mauvaise action (à corriger ou invalider)
        const isPhoneAdvice =
          parsed.message?.includes("téléphone") ||
          parsed.message?.includes("numéro") ||
          parsed.message?.includes("messagerie") ||
          parsed.title?.includes("téléphone") ||
          parsed.title?.includes("numéro") ||
          parsed.title?.includes("accessible");
        const hasWrongPhoneAction =
          isPhoneAdvice &&
          parsed.action !== "Ajouter mon téléphone" &&
          parsed.action !== "Ajouter votre numéro de téléphone";

        // Si le conseil parle de localisation, forcer actionType et action pour rediriger vers le profil
        if (
          parsed.message?.includes("localisation") ||
          parsed.title?.includes("localisation")
        ) {
          parsed.actionType = "profile";
          parsed.action = "Préciser ma localisation";
        }

        // Si le conseil parle de téléphone/numéro/messagerie, forcer actionType et action pour rediriger vers le profil
        if (isPhoneAdvice) {
          parsed.actionType = "profile";
          parsed.action = "Ajouter mon téléphone";
        }

        // Si le conseil parle de langues/niveaux, forcer actionType vers language et action dédiée
        const isLanguageAdvice =
          parsed.message?.includes("langue") ||
          parsed.title?.includes("langue") ||
          parsed.message?.includes("C1") ||
          parsed.message?.includes("B2");
        if (isLanguageAdvice) {
          parsed.actionType = "language";
          parsed.action = "Ajouter mes langues";
        }

        // Validation et correction automatique de la cohérence pour tous les conseils mis en cache
        const validatedAdvice = validateAndFixAdvice(parsed);

        // Vérifier si le conseil en cache concerne une action déjà complétée
        const isAlreadyCompleted = isAdviceAlreadyCompleted(
          validatedAdvice,
          profile,
          experiences,
          educations,
          projects,
          languages,
          certifications,
          skills,
          interests,
          keywordsCount,
        );

        // Si c'est un conseil téléphone avec mauvaise action, invalider le cache pour forcer la régénération
        if (hasWrongPhoneAction) {
          localStorage.removeItem(storageKey);
        }

        // Si le conseil concerne une action déjà faite, invalider le cache et régénérer
        if (isAlreadyCompleted) {
          localStorage.removeItem(storageKey);
          // Continuer pour régénérer un nouveau conseil
        } else if (
          !isJobFoundAdvice &&
          !isOldLocationAdvice &&
          !hasWrongPhoneAction
        ) {
          // Retourner le conseil validé et corrigé seulement s'il n'est pas déjà complété
          return validatedAdvice;
        }
        // Si c'est un conseil "job trouvé" ou l'ancien conseil de localisation, on invalide le cache et on régénère
        localStorage.removeItem(storageKey);
      } catch (e) {
        // Si erreur de parsing, générer un nouveau conseil
      }
    }

    // Générer un nouveau conseil normal
    const advice = generateDailyAdvice(
      completenessResult,
      profile,
      false,
      0,
      experiences,
      educations,
      projects,
      languages,
      certifications,
      skills,
      interests,
    );

    // Si le conseil parle de localisation OU si la prochaine mission est 'location', forcer actionType et action
    const nextMissionIsLocation =
      completenessResult.nextMissions[0]?.id === "location";
    if (
      nextMissionIsLocation ||
      advice.message?.includes("localisation") ||
      advice.title?.includes("localisation")
    ) {
      advice.actionType = "profile";
      // Si la mission est 'location', utiliser le label de la mission, sinon utiliser l'action par défaut
      advice.action = nextMissionIsLocation
        ? completenessResult.nextMissions[0].label
        : "Préciser ma localisation";
    }

    // Si le conseil parle de téléphone/numéro/messagerie, forcer actionType et action pour rediriger vers le profil
    if (
      advice.message?.includes("téléphone") ||
      advice.message?.includes("numéro") ||
      advice.message?.includes("messagerie") ||
      advice.title?.includes("téléphone") ||
      advice.title?.includes("numéro") ||
      advice.title?.includes("accessible")
    ) {
      advice.actionType = "profile";
      advice.action = "Ajouter mon téléphone";
    }

    // Sauvegarder pour aujourd'hui avec version du cache
    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...advice, _cacheVersion: CACHE_VERSION }),
    );

    return advice;
  }, [
    completenessResult,
    profile,
    hasFoundJob,
    daysSinceJobFound,
    user?.id,
    keywordsCount,
  ]);

  // Gérer les actions du conseil
  const handleAdviceAction = () => {
    // Actions qui doivent rester sur le dashboard (ne pas rediriger)
    const stayOnDashboardActions = ["Voir mes objectifs", "Voir mes alertes"];
    if (stayOnDashboardActions.includes(dailyAdvice.action)) {
      // Rester sur le dashboard, peut-être scroller vers la section concernée
      // Les objectifs et alertes sont déjà visibles sur le dashboard
      return;
    }

    switch (dailyAdvice.actionType) {
      case "bio":
      case "profile":
      case "experiences":
      case "experience":
      case "educations":
      case "education":
      case "projects":
      case "project":
      case "languages":
      case "language":
      case "certifications":
      case "certification":
      case "skills":
      case "linkedin":
      case "github":
      case "portfolio":
      case "location":
      case "phone":
      case "photo":
      case "interests":
      case "objectif":
        // Tous ces types redirigent vers la section concernée du profil
        useGameStore.setState({
          profileScrollToSection: getProfileSectionForMissionId(
            dailyAdvice.actionType,
          ),
          view: "profile",
        });
        break;
      case "jobs":
        // Actions liées aux offres : rediriger vers la page Offres (recherche + boutons)
        setView("matching");
        break;
      default:
        // Par défaut, rediriger vers le profil
        setView("profile");
        break;
    }
  };

  // Les missions sont maintenant intégrées dans les objectifs du jour, plus besoin de missionsWithActions

  // Les objectifs quotidiens sont maintenant gérés par DailyObjectivesCard

  // Vérifier si on doit lancer l'onboarding après création de compte
  // Note: La logique d'onboarding a été déplacée dans le Layout
  // pour que le renard et les contrôles persistent entre les vues lors de la navigation

  return (
    <div className="min-h-screen pb-24 md:pb-8 animate-in fade-in duration-500">
      {/* Animation du badge légendaire */}
      <LegendaryBadgeAnimation
        show={showLegendaryAnimation}
        onComplete={() => setShowLegendaryAnimation(false)}
      />

      {/* Styles pour les animations */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(168, 85, 247, 0.2); }
          50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.6), 0 0 60px rgba(168, 85, 247, 0.3); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
        @keyframes float-fox {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shine 3s ease-in-out infinite;
        }
        .animate-float-fox { animation: float-fox 4s ease-in-out infinite; }
      `}</style>

      {/* Email Verification Banner */}
      {user && !user.email_verified && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 backdrop-blur-xl border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Vérifiez votre adresse email
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Débloquez le plein potentiel de PortfoliA en confirmant votre
                email.
              </p>
            </div>
          </div>
          <button
            onClick={() => setView("verify_email")}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95"
          >
            <Mail size={16} />
            Vérifier maintenant
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          HEADER - Welcome Area avec Barre de Progression Premium
      ═══════════════════════════════════════════════════════════════ */}
      <header className="mb-6 sm:mb-8 md:mb-10">
        {/* TOUJOURS sur même ligne (flex-row) - Responsive sizing */}
        <div className="flex flex-row items-center lg:items-end justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Gauche : Greeting - Compressible */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white mb-0.5 sm:mb-1 md:mb-2 leading-tight">
              Bonjour, {user?.full_name?.split(" ")[0] || "User"}{" "}
              <span className="inline-block hover:animate-bounce cursor-default">
                👋
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {hasLegendaryBadge && savedOffers.find((o) => o.job_found) ? (
                <>
                  Futur.e{" "}
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    {savedOffers.find((o) => o.job_found)?.title}
                  </span>{" "}
                  🎉
                </>
              ) : (
                <>Prêt à décrocher ce job ? 🚀</>
              )}
            </p>
          </div>

          {/* Droite : Barre de Progression - Largeur fixe minimale */}
          <div className="w-32 sm:w-48 md:w-64 lg:w-80 xl:w-96 flex-shrink-0 relative">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Profil
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {completeness}%
              </span>
            </div>

            {/* Barre de progression avec glow */}
            <div className="relative h-2.5 sm:h-3 md:h-4 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/50">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 rounded-full transition-all duration-1000 ease-out animate-glow-pulse animate-shine"
                style={{ width: `${completeness}%` }}
              />
              {/* Particules brillantes */}
              <div
                className="absolute inset-y-0 right-0 w-1.5 sm:w-2 bg-white/50 rounded-full blur-sm"
                style={{ left: `calc(${completeness}% - 4px)` }}
              />
            </div>

            {/* Prochain objectif - Hidden sur très petits mobiles */}
            {nextMilestone && (
              <button
                onClick={() => navigateToMilestone(nextMilestone.id)}
                className="hidden sm:flex mt-2 md:mt-3 w-full items-center gap-1.5 md:gap-2 text-left group"
              >
                <span className="text-sm md:text-base lg:text-lg">
                  {nextMilestone.icon}
                </span>
                <span className="text-[10px] md:text-xs text-slate-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors truncate">
                  Prochain :{" "}
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-300">
                    {nextMilestone.name}
                  </span>
                </span>
                <ArrowUpRight
                  size={12}
                  className="text-slate-400 dark:text-slate-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 ml-auto transition-colors md:w-3.5 md:h-3.5"
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          BENTO GRID - Layout Principal
          Mobile: grid-cols-2 (layout équilibré) | Desktop: grid-cols-3
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
        {/* ─────────────────────────────────────────────────────────────
            ROW 1 : FOX INTERVIEW (2/3) + CRÉDITS (1/3)
        ───────────────────────────────────────────────────────────── */}

        {/* HERO CARD - Fox Interview - Full width toujours */}
        <div
          onClick={() => setView("fox_interview")}
          className="col-span-2 md:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-2 border-orange-400/40 dark:border-orange-500/30 hover:border-orange-500/70 dark:hover:border-orange-500/60 shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-500"
          data-onboarding="fox-interview"
        >
          {/* Badge - Plus petit sur mobile */}
          <AIBadge
            position="top-right"
            size="sm"
            variant="prominent"
            featureName="l'entretien avec Fox"
            className="!top-3 !right-3 sm:!top-4 sm:!right-4 z-20"
          />

          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            {/* Fox Mascot - Réduit sur mobile, progressif */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 group-hover:shadow-orange-500/60 transition-all duration-500 animate-float-fox">
                <img
                  src="/logo.svg"
                  alt="Fox"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain drop-shadow-lg"
                />
              </div>
              {/* Glow ring */}
              <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-[1.5rem] sm:rounded-[2rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white group-hover:text-orange-50 transition-colors">
                  Racontez votre vie à Fox 🦊
                </h2>
              </div>
              <p className="text-slate-300 dark:text-slate-400 text-xs sm:text-sm md:text-base mb-4 sm:mb-5 max-w-lg leading-relaxed">
                Pas envie de remplir des formulaires ?{" "}
                <span className="text-white font-semibold">
                  Discutez avec Fox
                </span>
                , notre assistant intelligent. Texte ou voix, il s'occupe de
                tout !
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* CTA Juicy - Réduit sur mobile */}
                <button className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300">
                  <MessageCircle size={16} className="sm:w-5 sm:h-5" />
                  <span>Démarrer l'interview</span>
                  <ArrowUpRight
                    size={14}
                    className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </button>

                <div className="hidden sm:flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Mic size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">
                    Dictée vocale disponible
                  </span>
                </div>
              </div>
            </div>

            {/* XP Badge flottant - Plus compact sur mobile */}
            <div className="absolute top-14 right-3 sm:top-16 sm:right-4 md:relative md:top-0 md:right-0">
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs sm:text-sm font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg shadow-orange-500/40 flex items-center gap-1 sm:gap-1.5">
                <Sparkles size={14} className="sm:w-4 sm:h-4" />
                +100 pts
              </div>
            </div>
          </div>
        </div>

        {/* CRÉDITS - Ultra responsive (1 col) */}
        <div className="col-span-1 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl p-3 sm:p-4 md:p-6 group hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-500 flex flex-col">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <Zap
                  size={14}
                  className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-white"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-[11px] sm:text-xs md:text-sm truncate leading-tight">
                  Crédits
                </h3>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider hidden min-[360px]:block truncate">
                  Utilisations
                </p>
              </div>
            </div>

            {/* Widget AI intégré - Flexible */}
            <div className="flex-1">
              <AIUsageWidget compact />
            </div>
          </div>

          {/* Decorative circuit lines - hidden on small screens */}
          <div className="hidden md:block absolute bottom-0 right-0 w-20 h-20 lg:w-24 lg:h-24 opacity-10 dark:opacity-10 pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-indigo-500"
            >
              <path
                d="M10 90 L10 50 L50 50 L50 10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="10" cy="90" r="3" fill="currentColor" />
              <circle cx="50" cy="10" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ROW 2 : OBJECTIFS DU JOUR + CONSEIL DU JOUR
        ───────────────────────────────────────────────────────────── */}

        {/* OBJECTIFS DU JOUR - Visible partout maintenant */}
        <div className="col-span-2 md:col-span-1" data-onboarding="objectives">
          <DailyObjectivesCard
            hasLegendaryBadge={
              gamification?.badges?.includes("legendary") || false
            }
          />
        </div>

        {/* CONSEIL DU JOUR - Prend la place de "Prochaines étapes" */}
        <div
          className="col-span-2 md:col-span-1 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl p-3 sm:p-4 md:p-6 hover:border-yellow-300 dark:hover:border-yellow-500/20 transition-all duration-500 relative overflow-hidden flex flex-col"
          data-onboarding="daily-advice"
        >
          {/* Glow ampoule */}
          <div className="absolute -top-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 bg-yellow-400/20 dark:bg-yellow-500/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25 flex-shrink-0">
                <Lightbulb
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-white"
                />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base">
                Conseil du jour
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
              {dailyAdvice.message}
            </p>

            <button
              onClick={handleAdviceAction}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-500/20 dark:to-orange-500/20 hover:from-yellow-200 hover:to-orange-200 dark:hover:from-yellow-500/30 dark:hover:to-orange-500/30 border border-yellow-300 dark:border-yellow-500/20 hover:border-yellow-400 dark:hover:border-yellow-500/40 text-yellow-700 dark:text-yellow-400 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm"
            >
              {dailyAdvice.action}
              <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ROW 3 : MES BADGES (sous Crédits) + ALERTES OFFRES (sous Mes badges)
        ───────────────────────────────────────────────────────────── */}

        {/* MES BADGES - Sous Crédits - Reste éclairé pendant l'animation légendaire */}
        <div
          data-onboarding="badges"
          className={`col-span-1 md:col-span-1 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl p-3 sm:p-4 md:p-6 hover:border-amber-300 dark:hover:border-amber-500/20 transition-all duration-500 flex flex-col ${
            showLegendaryAnimation
              ? "relative z-[9999] !bg-white dark:!bg-slate-900 shadow-2xl shadow-amber-500/50 border-amber-400 dark:border-amber-500 ring-4 ring-amber-400/50 dark:ring-amber-500/50"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
              <Crown
                size={16}
                className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-white"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base truncate">
                Mes Badges
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                Succès débloqués
              </p>
            </div>
          </div>

          {/* Badges Preview intégré avec style */}
          <BadgesPreview compact />
        </div>

        {/* ALERTES OFFRES - Sous Mes badges */}
        <div className="col-span-1 md:col-span-1" data-onboarding="job-alerts">
          <JobNotificationsCard />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ROW 4 : RECHERCHE D'OFFRES (remontée)
        ───────────────────────────────────────────────────────────── */}

        {/* FEEDBACK & SUGGESTIONS - Visible sur mobile uniquement */}
        <div className="col-span-2 md:hidden">
          <MatchingCard />
        </div>

        {/* MATCHING WIDGET - Full width mobile, 2/3 desktop - REMONTÉ */}
        <div
          className="col-span-2 md:col-span-2 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl p-3 sm:p-4 md:p-6 relative overflow-hidden"
          data-onboarding="search-offers"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-5 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Sparkles
                  size={14}
                  className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-indigo-500 dark:text-indigo-400"
                />
                <span className="text-[10px] sm:text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  Recherche
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg md:text-xl text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Recherche d'offres
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Trouvez les offres d'emploi qui correspondent à vos critères de
                recherche.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 relative z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setView("matching");
                }}
                className="relative z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer active:scale-95"
                type="button"
              >
                <Sparkles size={14} className="sm:w-4 sm:h-4" />
                Rechercher
              </button>
            </div>
          </div>

          {/* Decorative gradient */}
          <div className="absolute bottom-0 right-0 w-64 h-32 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-tl-full pointer-events-none z-0" />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// L'ancien composant DailyObjectiveCard a été remplacé par DailyObjectivesCard dans components/

// Carte Smart Matching
function MatchingCard() {
  const { setView } = useGameStore();

  return (
    <button
      onClick={() => setView("matching")}
      className="w-full h-full flex flex-col text-left rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-indigo-500/30 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] p-3 sm:p-4 md:p-6 hover:border-indigo-400 dark:hover:border-indigo-400/50 transition-all duration-500 group"
    >
      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
          <Target
            size={16}
            className="sm:w-[18px] sm:h-[18px] md:w-[22px] md:h-[22px] text-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors text-xs sm:text-sm md:text-base truncate">
              Smart Matching
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3 line-clamp-2">
            Trouvez les entreprises qui correspondent parfaitement à votre
            profil grâce à notre algorithme de matching intelligent.
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
            <span>Lancer le matching</span>
            <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </button>
  );
}
