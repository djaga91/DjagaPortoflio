/**
 * Composant pour afficher les objectifs quotidiens.
 *
 * Affiche un résumé dans une carte compacte, et une popup détaillée au clic.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Target,
  CheckCircle2,
  FileText,
  Briefcase,
  GraduationCap,
  Rocket,
  Globe,
  Award,
  Heart,
  Camera,
  Search,
  Mail,
  Phone,
  Link,
  MapPin,
  Zap,
  MessageSquare,
  Trophy,
  LucideIcon,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import {
  DailyObjectivesState,
  DailyObjective,
  getOrCreateDailyObjectives,
  isPermanentlyCompletedObjective,
  isProfileCompleteEnough,
  syncObjectivesWithOffers,
} from "../utils/dailyObjectives";
import {
  calculateCompleteness,
  getProfileSectionForMissionId,
} from "../utils/profileCompleteness";
import {
  matchingAPI,
  gamificationAPI,
  jobNotificationsAPI,
  JobOffer,
} from "../services/api";

interface DailyObjectivesCardProps {
  hasLegendaryBadge: boolean;
}

/**
 * Mapping des types d'objectifs vers les icônes Lucide
 */
const OBJECTIVE_ICON_MAP: Record<string, LucideIcon> = {
  // Complétion profil
  bio: FileText,
  experiences: Briefcase,
  educations: GraduationCap,
  projects: Rocket,
  languages: Globe,
  certifications: Award,
  interests: Heart,
  photo: Camera,
  linkedin: Link,
  github: Link,
  portfolio: Globe,
  location: MapPin,
  phone: Phone,
  skills: Zap,

  // Objectif professionnel (Mon Objectif)
  objective: Target,
  objectif: Target,

  // Matching et offres
  launch_matching: Search,
  apply: FileText,
  cover_letter: Mail,
  followup: Phone,
  interview: MessageSquare,
  status_update: Trophy, // Icône plus excitante pour le résultat final
};

/**
 * Fonction pour obtenir l'icône Lucide correspondant à un objectif
 */
function getObjectiveIcon(objective: DailyObjective): LucideIcon {
  // Pour les objectifs de profil, extraire l'ID depuis "profile_xxx"
  if (objective.id.startsWith("profile_")) {
    const profileId = objective.id.replace("profile_", "");
    return OBJECTIVE_ICON_MAP[profileId] || Target;
  }

  // Pour les autres objectifs, utiliser l'ID directement
  if (objective.id.startsWith("apply_")) {
    return OBJECTIVE_ICON_MAP["apply"] || FileText;
  }
  if (objective.id.startsWith("cover_letter_")) {
    return OBJECTIVE_ICON_MAP["cover_letter"] || Mail;
  }
  if (objective.id.startsWith("followup_")) {
    return OBJECTIVE_ICON_MAP["followup"] || Phone;
  }
  if (objective.id.startsWith("interview_")) {
    return OBJECTIVE_ICON_MAP["interview"] || MessageSquare;
  }
  if (objective.id.startsWith("prepare_fox_")) {
    return OBJECTIVE_ICON_MAP["prepare_fox"] || MessageSquare;
  }
  if (objective.id.startsWith("status_update_")) {
    return OBJECTIVE_ICON_MAP["status_update"] || Target;
  }

  return OBJECTIVE_ICON_MAP[objective.id] || Target;
}

export const DailyObjectivesCard: React.FC<DailyObjectivesCardProps> = ({
  hasLegendaryBadge,
}) => {
  const {
    setView,
    user,
    profile,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    skills,
    interests,
  } = useGameStore();
  const [savedOffers, setSavedOffers] = useState<JobOffer[]>([]);
  const [objectivesState, setObjectivesState] =
    useState<DailyObjectivesState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializingObjectives, setIsInitializingObjectives] =
    useState(true);
  const [hasLoadedOffers, setHasLoadedOffers] = useState(false); // Flag pour éviter boucle infinie
  const [keywordsCount, setKeywordsCount] = useState(0); // Cache pour éviter appels répétés
  const hasCalledCompleteTodayRef = useRef<string | null>(null); // Date (YYYY-MM-DD) pour laquelle on a déjà appelé l'API

  // Charger les offres sauvegardées
  const loadOffers = async () => {
    try {
      const offers = await matchingAPI.getSavedOffers();
      setSavedOffers(offers);
      setHasLoadedOffers(true);
    } catch (err) {
      console.error("Erreur chargement offres:", err);
      setHasLoadedOffers(true); // Marquer comme chargé même en erreur pour éviter boucle
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les keywords une seule fois
  const loadKeywords = async () => {
    try {
      const keywords = await jobNotificationsAPI.getKeywords();
      setKeywordsCount(keywords.length);
    } catch (_) {
      // Ignorer
    }
  };

  useEffect(() => {
    if (user) {
      loadOffers();
      loadKeywords();
    }
  }, [user]);

  // Recharger les offres périodiquement — pas de polling quand objectifs déjà complétés (évite clignotement)
  useEffect(() => {
    if (!user) return;
    if (objectivesState?.allCompleted) return;

    const interval = setInterval(() => {
      loadOffers();
    }, 5000);

    // Recharger quand la fenêtre reprend le focus (utilisateur revient sur la page)
    const handleFocus = () => {
      loadOffers();
    };
    window.addEventListener("focus", handleFocus);

    // Recharger quand on reçoit un événement de mise à jour d'offre
    const handleOfferUpdate = () => {
      loadOffers();
    };
    window.addEventListener("offerUpdated", handleOfferUpdate as EventListener);

    // Recharger quand une offre est sauvegardée (pour valider "Lancer le matching")
    const handleOfferSaved = () => {
      loadOffers();
    };
    window.addEventListener("offerSaved", handleOfferSaved as EventListener);

    // Recharger quand le profil est mis à jour (pour valider les objectifs de complétion)
    const handleProfileUpdate = () => {
      // Forcer la synchronisation des objectifs
      if (objectivesState) {
        const profileData = {
          profile,
          experiences,
          educations: educations || [],
          projects: projects || [],
          languages: languages || [],
          certifications: certifications || [],
          skills: skills || [],
          interests: interests || [],
        };
        const syncedState = syncObjectivesWithOffers(
          savedOffers,
          profileData,
          user?.id || null,
        );
        if (syncedState) {
          // Restaurer les actions manquantes
          syncedState.objectives = syncedState.objectives.map((obj) => {
            if (!obj.action || typeof obj.action !== "function") {
              if (obj.id === "review_offers") {
                obj.action = () => setView("mes_offres");
              } else if (obj.id === "launch_matching") {
                obj.action = () => setView("matching");
              } else if (obj.id.startsWith("profile_")) {
                const missionId = obj.id
                  .replace(/^profile_/, "")
                  .replace(/_generic$/, "");
                const section = getProfileSectionForMissionId(missionId);
                obj.action = () =>
                  useGameStore.setState({
                    profileScrollToSection: section,
                    view: "profile",
                  });
              } else if (
                obj.id.startsWith("default_") ||
                obj.id.startsWith("generic_")
              ) {
                obj.action = () =>
                  useGameStore.setState({
                    profileScrollToSection: "bio",
                    view: "profile",
                  });
              } else if (
                obj.id.startsWith("cover_letter_") ||
                obj.id.startsWith("followup_") ||
                obj.id.startsWith("apply_") ||
                obj.id.startsWith("interview_") ||
                obj.id.startsWith("status_update_") ||
                obj.id.startsWith("test_")
              ) {
                // Tous les objectifs liés aux offres doivent rediriger vers mes_offres
                obj.action = () => setView("mes_offres");
              } else if (obj.offer) {
                obj.action = () => setView("mes_offres");
              } else {
                // Fallback : rediriger vers le profil
                obj.action = () => setView("profile");
              }
            }
            return obj;
          });
          setObjectivesState({ ...syncedState });
        }
      }
    };
    window.addEventListener(
      "profileUpdated",
      handleProfileUpdate as EventListener,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "offerUpdated",
        handleOfferUpdate as EventListener,
      );
      window.removeEventListener(
        "offerSaved",
        handleOfferSaved as EventListener,
      );
      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdate as EventListener,
      );
    };
  }, [user, objectivesState?.allCompleted]);

  // Initialiser ou récupérer les objectifs — ne pas ré-écraser si déjà complétés aujourd'hui
  useEffect(() => {
    if (!isLoading && user && hasLoadedOffers) {
      const today = new Date().toISOString().split("T")[0];
      if (objectivesState?.allCompleted && objectivesState?.date === today) {
        setIsInitializingObjectives(false);
        return;
      }
      // Afficher le loader uniquement au premier chargement (évite le clignotement au polling)
      if (!objectivesState) {
        setIsInitializingObjectives(true);
      }
      const initObjectives = async () => {
        try {
          // keywordsCount est déjà chargé via loadKeywords() au montage

          // Calculer la complétude du profil (keywordsCount = objectifs professionnels déjà définis)
          const completenessResult = calculateCompleteness(
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

          // Convertir TOUTES les missions manquantes en format compatible (ordre: profil complet d'abord)
          const profileMissions = [...completenessResult.missingItems]
            .sort((a, b) => a.priority - b.priority)
            .map((mission) => ({
              id: mission.id,
              label: mission.label,
              icon: mission.icon,
              points: mission.points,
              action: () => {
                const section = getProfileSectionForMissionId(mission.id);
                useGameStore.setState({
                  profileScrollToSection: section,
                  view: "profile",
                });
              },
            }));

          // Vérifier si l'utilisateur a déjà lancé le matching (a des offres sauvegardées)
          const hasLaunchedMatching = savedOffers.length > 0;

          // Préparer les données du profil pour la synchronisation (dont keywordsCount pour profile_objective)
          const profileData = {
            profile,
            experiences,
            educations: educations || [],
            projects: projects || [],
            languages: languages || [],
            certifications: certifications || [],
            skills: skills || [],
            interests: interests || [],
            keywordsCount,
          };

          const state = getOrCreateDailyObjectives(
            savedOffers,
            (view: string) => setView(view as any),
            user?.id || null,
            profileMissions,
            hasLaunchedMatching,
            profileData,
          );

          // Vérifier qu'on a toujours 3 objectifs, sinon forcer la régénération
          if (state.objectives.length < 3) {
            console.warn(
              `[DailyObjectivesCard] ⚠️ Seulement ${state.objectives.length} objectifs, régénération forcée...`,
            );
            const storageKey = `daily_objectives_state_${user?.id || "guest"}`;
            localStorage.removeItem(storageKey);

            const newState = getOrCreateDailyObjectives(
              savedOffers,
              (view: string) => setView(view as any),
              user?.id || null,
              profileMissions,
              hasLaunchedMatching,
              profileData,
            );
            setObjectivesState(newState);
          } else {
            setObjectivesState(state);
          }
        } catch (error) {
          console.error("Erreur initialisation objectifs:", error);
          const profileData = {
            profile,
            experiences,
            educations: educations || [],
            projects: projects || [],
            languages: languages || [],
            certifications: certifications || [],
            skills: skills || [],
            interests: interests || [],
          };
          const state = getOrCreateDailyObjectives(
            savedOffers,
            (view: string) => setView(view as any),
            user?.id || null,
            [],
            false,
            profileData,
          );
          setObjectivesState(state);
        } finally {
          setIsInitializingObjectives(false);
        }
      };
      initObjectives();
    } else if (!user) {
      setIsInitializingObjectives(false);
    }
    // Dépendre de hasLoadedOffers pour que l'init s'exécute une fois les offres chargées (objectifs peuvent en dépendre).
  }, [
    isLoading,
    user,
    hasLoadedOffers,
    setView,
    profile,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    skills,
  ]);

  // Quand les objectifs du jour sont déjà tous complétés (ex. état restauré depuis localStorage),
  // appeler l'API au moins une fois pour enregistrer la date côté backend (streak Bosseur).
  const today = new Date().toISOString().split("T")[0];
  useEffect(() => {
    if (!objectivesState?.allCompleted || objectivesState.date !== today) {
      return;
    }
    if (hasCalledCompleteTodayRef.current === today) {
      return;
    }
    hasCalledCompleteTodayRef.current = today;
    gamificationAPI
      .completeDailyObjectives()
      .then((result) => {
        useGameStore.getState().loadGamification();
        if (result.bosseur_streak) {
          useGameStore.getState().setBosseurStreak(result.bosseur_streak);
        }
      })
      .catch((err) => {
        console.error(
          "[DailyObjectivesCard] ❌ Erreur completeDailyObjectives:",
          err,
        );
        hasCalledCompleteTodayRef.current = null;
      });
  }, [objectivesState?.allCompleted, objectivesState?.date, today]);

  // Synchroniser avec l'état actuel des offres et du profil — ne rien faire si déjà tout complété
  useEffect(() => {
    if (!objectivesState || isLoading) {
      return;
    }
    if (objectivesState.allCompleted) {
      return;
    }

    // NE PAS recharger les offres ici - c'est déjà fait au montage et par l'interval
    // Cela causait une boucle infinie quand savedOffers était vide
    if (!hasLoadedOffers) {
      return;
    }

    const runSync = async () => {
      // Utiliser keywordsCount mis en cache (pas d'appel API ici)
      const profileData = {
        profile,
        experiences,
        educations: educations || [],
        projects: projects || [],
        languages: languages || [],
        certifications: certifications || [],
        skills: skills || [],
        interests: interests || [],
        keywordsCount,
      };

      const syncedState = syncObjectivesWithOffers(
        savedOffers,
        profileData,
        user?.id || null,
      );
      if (syncedState) {
        // Restaurer les actions manquantes (perdues lors de la sérialisation dans localStorage)
        syncedState.objectives = syncedState.objectives.map((obj) => {
          // Si l'action est manquante ou n'est pas une fonction, la restaurer
          if (!obj.action || typeof obj.action !== "function") {
            if (obj.id === "review_offers") {
              obj.action = () => setView("mes_offres");
            } else if (obj.id === "launch_matching") {
              obj.action = () => setView("matching");
            } else if (obj.id.startsWith("profile_")) {
              const missionId = obj.id
                .replace(/^profile_/, "")
                .replace(/_generic$/, "");
              const section = getProfileSectionForMissionId(missionId);
              obj.action = () =>
                useGameStore.setState({
                  profileScrollToSection: section,
                  view: "profile",
                });
            } else if (
              obj.id.startsWith("default_") ||
              obj.id.startsWith("generic_")
            ) {
              obj.action = () =>
                useGameStore.setState({
                  profileScrollToSection: "bio",
                  view: "profile",
                });
            } else if (obj.offer) {
              // Pour les objectifs avec offre, naviguer vers mes_offres
              obj.action = () => setView("mes_offres");
            } else {
              // Action par défaut : rediriger vers le profil
              obj.action = () => setView("profile");
            }
          }
          return obj;
        });

        // Ne pas repasser en arrière : si on affiche déjà "Objectifs complétés", ne pas écraser
        // avec un état non complété (évite le clignotement avec "Lancer le matching")
        if (objectivesState.allCompleted && !syncedState.allCompleted) {
          return;
        }

        // Vérifier s'il y a eu des changements
        const hasChanges = syncedState.objectives.some((obj, idx) => {
          const oldObj = objectivesState.objectives[idx];
          return !oldObj || oldObj.completed !== obj.completed;
        });

        if (hasChanges) {
          setObjectivesState({ ...syncedState });
        }

        // Si tous les objectifs sont complétés, enregistrer au backend (au moins une fois par jour)
        // On appelle même si completedAt est déjà set (état restauré / autre session) pour que le streak soit enregistré
        const today = new Date().toISOString().split("T")[0];
        if (
          syncedState.allCompleted &&
          syncedState.date === today &&
          hasCalledCompleteTodayRef.current !== today
        ) {
          hasCalledCompleteTodayRef.current = today;
          gamificationAPI
            .completeDailyObjectives()
            .then((result) => {
              const { loadGamification, setActiveToast, setBosseurStreak } =
                useGameStore.getState();
              loadGamification();
              if (result.bosseur_streak)
                setBosseurStreak(result.bosseur_streak);
              if (result.new_badges && result.new_badges.length > 0) {
                const badgeNames = result.new_badges
                  .map((b) => b.name)
                  .join(", ");
                setActiveToast({
                  type: "success",
                  title: "Badge débloqué !",
                  message: `Badge${result.new_badges.length > 1 ? "s" : ""} débloqué${result.new_badges.length > 1 ? "s" : ""} : ${badgeNames} !`,
                });
              }
            })
            .catch((err) => {
              console.error("Erreur enregistrement objectifs complétés:", err);
              hasCalledCompleteTodayRef.current = null; // permettre de réessayer
            });
        }
      }
    };
    runSync();
  }, [
    savedOffers,
    objectivesState,
    isLoading,
    hasLoadedOffers,
    keywordsCount,
    profile,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    skills,
    user?.id,
  ]);

  // Si l'utilisateur a le badge légendaire
  if (hasLegendaryBadge) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 shadow-xl p-4 sm:p-5 md:p-6 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
            <span className="text-3xl sm:text-4xl">🐐</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
            Félicitations ! 🎉
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            Vous avez trouvé votre emploi ! Profitez de cette pause méritée.
          </p>
        </div>
      </div>
    );
  }

  // Pendant le chargement initial ou l'initialisation des objectifs, afficher un loader
  if (isLoading || isInitializingObjectives || !objectivesState) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl p-3 sm:p-4 md:p-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <Target
              size={18}
              className="sm:w-5 sm:h-5 text-white animate-pulse"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Objectifs du jour
            </h3>
          </div>
        </div>
        <div className="w-full flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Si tous les objectifs sont complétés : priorité pour éviter tout clignotement avec "Lancer le matching"
  if (objectivesState.allCompleted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 shadow-xl p-4 sm:p-5 md:p-6 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
            <CheckCircle2 size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
            Objectifs complétés ! 🎉
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            Excellent travail ! Revenez demain pour de nouveaux objectifs.
          </p>
        </div>
      </div>
    );
  }

  // Si aucune offre sauvegardée ou aucun objectif (seulement après le chargement complet)
  if (objectivesState.objectives.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/30 shadow-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/50">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <Target size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
            Lancer le matching
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 max-w-xs leading-relaxed">
            Trouvez des offres et débloquez de nouveaux objectifs
          </p>
          <button
            onClick={() => setView("matching")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <Search size={16} />
            <span className="text-sm">Rechercher des offres</span>
          </button>
        </div>
      </div>
    );
  }

  // Données profil complètes pour exclure les objectifs définitivement complétés (ex. "Compléter votre profil" si profil déjà rempli)
  const fullProfileData = {
    profile,
    experiences: experiences || [],
    educations: educations || [],
    projects: projects || [],
    languages: languages || [],
    certifications: certifications || [],
    skills: skills || [],
    interests: interests || [],
    keywordsCount,
  };

  // Ne jamais afficher les objectifs définitivement complétés (ex. "Compléter votre profil" quand le profil est à 100 %)
  const visibleObjectives = objectivesState.objectives.filter(
    (o) => !isPermanentlyCompletedObjective(o.id, fullProfileData),
  );
  const hiddenCount =
    objectivesState.objectives.length - visibleObjectives.length;

  // Si le profil est complet et qu'on a moins de 3 objectifs (ex. "Compléter votre profil" n'a jamais été ajouté), compter les slots manquants comme complétés pour afficher x/3 correct
  const profileComplete = isProfileCompleteEnough(fullProfileData);
  const missingSlots =
    profileComplete && objectivesState.objectives.length < 3
      ? 3 - objectivesState.objectives.length
      : 0;

  // Complétés = complétés parmi les visibles + objectifs masqués (ex. "Compléter votre profil") + slots manquants quand profil déjà complet
  const completedAmongVisible = visibleObjectives.filter(
    (obj) => obj.completed,
  ).length;
  const completedCount = completedAmongVisible + hiddenCount + missingSlots;
  const totalForDenominator = Math.max(3, objectivesState.objectives.length);

  // Afficher les 3 premiers objectifs non complétés parmi les objectifs visibles
  const incompleteObjectives = visibleObjectives.filter(
    (obj) => !obj.completed,
  );
  const displayObjectives = incompleteObjectives.slice(0, 3);

  // Fonction pour naviguer vers la fiche de l'offre (même logique que pour les notifications)
  const navigateToOffer = (objective: DailyObjective) => {
    if (objective.offer?.id) {
      // Utiliser la même logique que pour les notifications
      localStorage.setItem("mes_offres_from_notification", "true");
      localStorage.setItem(
        "mes_offres_notification_offer_ids",
        JSON.stringify([objective.offer.id]),
      );
      // Utiliser requestAnimationFrame pour garantir que localStorage est écrit avant la redirection
      requestAnimationFrame(() => {
        setView("mes_offres");
      });
    } else {
      // Fallback : aller vers mes_offres sans offre spécifique
      setView("mes_offres");
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-left rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl p-3 sm:p-4 md:p-5 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/30">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
          <Target size={18} className="sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
            Objectifs du jour
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            {completedCount}/{totalForDenominator} complétés
          </p>
        </div>
      </div>

      {/* Liste des objectifs */}
      <div className="space-y-1.5 flex-1">
        {displayObjectives.map((objective) => {
          const handleClick = () => {
            if (objective.id === "launch_matching") {
              setView("matching");
            } else if (objective.id === "review_offers") {
              setView("mes_offres");
            } else if (objective.id.startsWith("profile_")) {
              const missionId = objective.id
                .replace(/^profile_/, "")
                .replace(/_generic$/, "");
              const section = getProfileSectionForMissionId(missionId);
              useGameStore.setState({
                profileScrollToSection: section,
                view: "profile",
              });
            } else if (
              objective.id.startsWith("default_") ||
              objective.id.startsWith("generic_")
            ) {
              useGameStore.setState({
                profileScrollToSection: "bio",
                view: "profile",
              });
            } else if (objective.id.startsWith("prepare_fox_")) {
              if (objective.offer?.apply_url) {
                useGameStore.getState().setPrepareFoxOffer({
                  offerUrl: objective.offer.apply_url,
                  offerTitle: objective.offer.title,
                });
                setView("prepare_fox");
              } else {
                localStorage.setItem("mes_offres_from_notification", "true");
                localStorage.setItem(
                  "mes_offres_notification_offer_ids",
                  JSON.stringify([objective.offer!.id]),
                );
                requestAnimationFrame(() => setView("mes_offres"));
              }
            } else if (
              objective.id.startsWith("cover_letter_") ||
              objective.id.startsWith("followup_") ||
              objective.id.startsWith("apply_") ||
              objective.id.startsWith("interview_") ||
              objective.id.startsWith("status_update_") ||
              objective.id.startsWith("test_")
            ) {
              // Tous les objectifs liés aux offres doivent rediriger vers mes_offres avec scroll vers l'offre
              if (objective.offer?.id) {
                // Utiliser la même logique que pour les notifications
                localStorage.setItem("mes_offres_from_notification", "true");
                localStorage.setItem(
                  "mes_offres_notification_offer_ids",
                  JSON.stringify([objective.offer.id]),
                );
                requestAnimationFrame(() => {
                  setView("mes_offres");
                });
              } else {
                // Fallback : rediriger vers mes_offres sans scroll spécifique
                setView("mes_offres");
              }
            } else if (objective.offer) {
              navigateToOffer(objective);
            } else if (
              objective.action &&
              typeof objective.action === "function"
            ) {
              objective.action();
            } else {
              // Fallback : rediriger vers le profil pour les objectifs sans action définie
              console.warn(
                `[DailyObjectivesCard] Objectif ${objective.id} n'a pas d'action définie, redirection vers profil`,
              );
              setView("profile");
            }
          };

          const IconComponent = getObjectiveIcon(objective);

          return (
            <button
              key={objective.id}
              onClick={handleClick}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 text-left ${
                objective.completed
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30"
                  : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-500/30"
              }`}
            >
              {/* Icône */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  objective.completed
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-indigo-100 dark:bg-indigo-900/30"
                }`}
              >
                <IconComponent
                  size={14}
                  className={
                    objective.completed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-indigo-600 dark:text-indigo-400"
                  }
                />
              </div>

              {/* Texte */}
              <div className="min-w-0 flex-1">
                <span
                  className={`text-[11px] sm:text-xs truncate block font-medium ${
                    objective.completed
                      ? "text-emerald-700 dark:text-emerald-400 line-through"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {objective.shortDescription}
                </span>
                {objective.offer?.company_name && (
                  <span className="text-[9px] text-slate-500 dark:text-slate-500 truncate block">
                    {objective.offer.company_name}
                  </span>
                )}
                {(objective.id.startsWith("default_") ||
                  objective.id.startsWith("generic_")) &&
                  !objective.completed && (
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      Cliquez pour accéder à votre profil
                    </span>
                  )}
              </div>

              {/* Check */}
              {objective.completed ? (
                <CheckCircle2
                  size={16}
                  className="text-emerald-500 flex-shrink-0"
                />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// La popup a été supprimée, on garde uniquement l'affichage dans la section
