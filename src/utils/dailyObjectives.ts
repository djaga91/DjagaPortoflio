/**
 * Utilitaires pour gérer les objectifs quotidiens.
 *
 * Système de 3 objectifs par jour avec suivi de complétion.
 * Reset automatique à minuit.
 */

import { JobOffer } from "../services/api";
import { calculateCompleteness } from "./profileCompleteness";

interface ProfileDataBase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experiences?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  educations?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skills?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  languages?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  certifications?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interests?: any[];
  keywordsCount?: number;
}

export interface DailyObjective {
  id: string;
  priority: number;
  icon: string;
  title: string;
  description: string;
  shortDescription: string; // Pour l'affichage dans la carte compacte
  action: () => void;
  offer?: JobOffer; // Offre associée (si applicable)
  completed: boolean;
  completedAt?: string; // ISO date string
}

/** Version du format des objectifs - incrémenter pour invalider le cache */
const OBJECTIVES_STATE_VERSION = 5;

export interface DailyObjectivesState {
  date: string; // YYYY-MM-DD
  objectives: DailyObjective[];
  allCompleted: boolean;
  completedAt?: string; // ISO date string quand les 3 sont complétés
  _v?: number; // Version pour invalidation cache
}

/**
 * Génère la clé de stockage pour un utilisateur donné.
 */
function getStorageKey(userId: string | null): string {
  if (!userId) {
    // Fallback pour les utilisateurs non connectés (ne devrait pas arriver)
    return "daily_objectives_state_guest";
  }
  return `daily_objectives_state_${userId}`;
}

/**
 * Vérifie si on est un nouveau jour (après minuit).
 */
function isNewDay(lastDate: string | null): boolean {
  if (!lastDate) return true;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return lastDate !== today;
}

/**
 * Charge l'état des objectifs depuis localStorage pour un utilisateur donné.
 */
export function loadDailyObjectivesState(
  userId: string | null,
): DailyObjectivesState | null {
  try {
    const storageKey = getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const state: DailyObjectivesState = JSON.parse(stored);

    // Si version obsolète, invalider le cache (régénération avec la nouvelle logique)
    if (!state._v || state._v < OBJECTIVES_STATE_VERSION) {
      return null;
    }

    // Si c'est un nouveau jour, réinitialiser
    if (isNewDay(state.date)) {
      return null; // Indique qu'il faut créer de nouveaux objectifs
    }

    return state;
  } catch (err) {
    console.error("Erreur chargement objectifs quotidiens:", err);
    return null;
  }
}

/**
 * Sauvegarde l'état des objectifs dans localStorage pour un utilisateur donné.
 */
export function saveDailyObjectivesState(
  state: DailyObjectivesState,
  userId: string | null,
): void {
  try {
    const storageKey = getStorageKey(userId);
    const toSave = { ...state, _v: OBJECTIVES_STATE_VERSION };
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  } catch (err) {
    console.error("Erreur sauvegarde objectifs quotidiens:", err);
  }
}

/**
 * Marque un objectif comme complété.
 */
export function completeObjective(
  objectiveId: string,
  userId: string | null = null,
): void {
  const state = loadDailyObjectivesState(userId);
  if (!state) return;

  const objective = state.objectives.find((obj) => obj.id === objectiveId);
  if (!objective || objective.completed) return;

  objective.completed = true;
  objective.completedAt = new Date().toISOString();

  // Vérifier si tous les objectifs sont complétés
  const allCompleted = state.objectives.every((obj) => obj.completed);
  if (allCompleted && !state.allCompleted) {
    state.allCompleted = true;
    state.completedAt = new Date().toISOString();
  }

  saveDailyObjectivesState(state, userId);
}

/**
 * Génère les 3 objectifs quotidiens.
 * Ordre de priorité :
 * 1. Complétion du profil (missions de complétion)
 * 2. Lancer le matching (si pas encore lancé)
 * 3. Objectifs concernant les offres (postuler, lettre, suivi, etc.)
 */
export function generateDailyObjectives(
  savedOffers: JobOffer[],
  setView: (view: string) => void,
  profileMissions?: Array<{
    id: string;
    label: string;
    icon: string;
    points: number;
    action: () => void;
  }>,
  hasLaunchedMatching?: boolean,
): DailyObjective[] {
  const objectives: DailyObjective[] = [];

  // PRIORITÉ 1 : Toutes les missions de complétion du profil d'abord (sections non remplies)
  // Règle : on affiche TOUTES les missions profil (jusqu'à 3) avant les objectifs entreprise/matching
  if (profileMissions && profileMissions.length > 0) {
    const maxProfileMissions = Math.min(3, profileMissions.length);
    for (const mission of profileMissions.slice(0, maxProfileMissions)) {
      objectives.push({
        id: `profile_${mission.id}`,
        priority: 1,
        icon: mission.icon,
        title: mission.label,
        description: mission.label,
        shortDescription: mission.label,
        action: mission.action,
        completed: false,
      });
    }
  }

  // Si on a déjà 3 objectifs, on s'arrête ici
  if (objectives.length >= 3) {
    return objectives;
  }

  // PRIORITÉ 2 : Lancer le matching (uniquement si plus de missions profil à afficher)
  // Ne pas proposer le matching tant qu'il reste des sections du profil à compléter
  if (
    objectives.length < 3 &&
    !hasLaunchedMatching &&
    savedOffers.length === 0
  ) {
    const hasMoreProfileMissions =
      profileMissions && profileMissions.length > objectives.length;
    if (!hasMoreProfileMissions) {
      objectives.push({
        id: "launch_matching",
        priority: 2,
        icon: "🔍",
        title: "Lancer le matching",
        description:
          "Débloquer de nouveaux objectifs en lançant votre recherche",
        shortDescription: "Lancer le matching",
        action: () => setView("matching"),
        completed: false,
      });
    }
  }

  // Si on a déjà 3 objectifs, on s'arrête ici
  if (objectives.length >= 3) {
    return objectives;
  }

  // PRIORITÉ 3 : Objectifs concernant les offres (si on a des offres sauvegardées)
  // Ne pas retourner ici si < 3 objectifs : on doit atteindre la boucle "ensure 3" plus bas
  if (savedOffers.length > 0) {
    // PRIORITÉ 3 : Postuler à une offre (offres sauvegardées mais pas encore postulées)
    const offersToApply = savedOffers.filter(
      (o) => !o.is_applied && !o.rejected && !o.job_found,
    );
    if (offersToApply.length > 0 && objectives.length < 3) {
      const offer = offersToApply[0];
      const titleShort =
        offer.title.length > 30
          ? offer.title.substring(0, 30) + "..."
          : offer.title;
      objectives.push({
        id: `apply_${offer.id}`,
        priority: 3,
        icon: "📝",
        title: "Postuler à une offre",
        description: `Postulez à "${offer.title}" chez ${offer.company_name || "cette entreprise"}`,
        shortDescription: `Postuler à "${titleShort}"`,
        action: () => setView("mes_offres"),
        offer,
        completed: false,
      });
    }

    // PRIORITÉ 3.5 : Relancer une offre (date de relance définie et arrivée à échéance aujourd'hui)
    // Priorité élevée car l'utilisateur a explicitement défini une date
    const offersWithFollowupDue = savedOffers.filter((o) => {
      if (!o.followup_date || o.rejected || o.job_found) {
        return false;
      }

      const followupDate = new Date(o.followup_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      followupDate.setHours(0, 0, 0, 0);

      // La date de relance est aujourd'hui ou dans le passé
      return followupDate <= today;
    });

    if (offersWithFollowupDue.length > 0 && objectives.length < 3) {
      // Trier par date de relance (les plus anciennes en premier)
      offersWithFollowupDue.sort((a, b) => {
        const dateA = a.followup_date ? new Date(a.followup_date).getTime() : 0;
        const dateB = b.followup_date ? new Date(b.followup_date).getTime() : 0;
        return dateA - dateB;
      });

      const offer = offersWithFollowupDue[0];
      const titleShort =
        offer.title.length > 30
          ? offer.title.substring(0, 30) + "..."
          : offer.title;
      objectives.push({
        id: `followup_scheduled_${offer.id}`,
        priority: 3.5,
        icon: "📞",
        title: "Relancer l'offre",
        description: `Relancez "${offer.title}" chez ${offer.company_name || "cette entreprise"} (date prévue: ${offer.followup_date ? new Date(offer.followup_date).toLocaleDateString("fr-FR") : "aujourd'hui"})`,
        shortDescription: `Relancer "${titleShort}"`,
        action: () => setView("mes_offres"),
        offer,
        completed: false,
      });
    }

    // PRIORITÉ 4 : Envoyer une lettre de motivation (offres postulées mais lettre non envoyée)
    const offersNeedingCoverLetter = savedOffers.filter(
      (o) =>
        o.is_applied && !o.cover_letter_sent && !o.rejected && !o.job_found,
    );
    if (offersNeedingCoverLetter.length > 0 && objectives.length < 3) {
      const offer = offersNeedingCoverLetter[0];
      const titleShort =
        offer.title.length > 30
          ? offer.title.substring(0, 30) + "..."
          : offer.title;
      objectives.push({
        id: `cover_letter_${offer.id}`,
        priority: 4,
        icon: "✉️",
        title: "Envoyer une lettre de motivation",
        description: `Envoyez votre lettre pour "${offer.title}" chez ${offer.company_name || "cette entreprise"}`,
        shortDescription: `Lettre pour "${titleShort}"`,
        action: () => setView("mes_offres"),
        offer,
        completed: false,
      });
    }

    // PRIORITÉ 5 : Relancer une candidature (offres postulées mais pas de nouvelles, et postulées il y a au moins 1,5 semaine)
    const DAYS_BEFORE_FOLLOWUP = 11; // 1,5 semaine ≈ 10,5 jours, on arrondit à 11
    const offersToFollowUp = savedOffers.filter((o) => {
      if (
        !o.is_applied ||
        o.contacted_by_email ||
        o.contacted_by_phone ||
        o.rejected ||
        o.job_found
      ) {
        return false;
      }

      // Vérifier que la candidature date d'au moins 1,5 semaine (11 jours)
      if (o.applied_at) {
        const appliedDate = new Date(o.applied_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appliedDate.setHours(0, 0, 0, 0);

        const daysSinceApplication = Math.floor(
          (today.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Ne proposer la relance que si au moins 1,5 semaine s'est écoulée
        if (daysSinceApplication < DAYS_BEFORE_FOLLOWUP) {
          return false;
        }
      } else {
        // Si pas de date, ne pas proposer la relance (sécurité)
        return false;
      }

      return true;
    });

    if (offersToFollowUp.length > 0 && objectives.length < 3) {
      const offer = offersToFollowUp[0];
      const titleShort =
        offer.title.length > 30
          ? offer.title.substring(0, 30) + "..."
          : offer.title;
      objectives.push({
        id: `followup_${offer.id}`,
        priority: 5,
        icon: "📞",
        title: "Relancer une candidature",
        description: `Relancez "${offer.title}" chez ${offer.company_name || "cette entreprise"}`,
        shortDescription: `Relancer "${titleShort}"`,
        action: () => setView("mes_offres"),
        offer,
        completed: false,
      });
    }

    // PRIORITÉ 5.8 : Réaliser un entretien technique avec Fox (Prépare-moi Fox)
    // Une seule fois par offre : affiché seulement si entretien technique prévu et aucune session Prépare-moi Fox encore faite.
    if (objectives.length < 3) {
      const offersEligibleForPrepareFox = savedOffers.filter((o) => {
        if (o.rejected || o.job_found) return false;
        if (o.technical_interview_scheduled !== true) return false;
        const hasDonePrepareFox =
          (o.prepare_fox_sessions?.length ?? 0) > 0 ||
          o.prepare_fox_score != null;
        return !hasDonePrepareFox;
      });

      if (offersEligibleForPrepareFox.length > 0) {
        const offer = offersEligibleForPrepareFox[0];
        const titleShort =
          offer.title.length > 30
            ? offer.title.substring(0, 30) + "..."
            : offer.title;
        objectives.push({
          id: `prepare_fox_${offer.id}`,
          priority: 5.8,
          icon: "🦊",
          title: "Réaliser un entretien technique avec Fox",
          description: `Préparez-vous à l'entretien technique pour "${offer.title}" chez ${offer.company_name || "cette entreprise"} avec le coach Fox.`,
          shortDescription: `Entretien Fox : "${titleShort}"`,
          action: () => setView("mes_offres"),
          offer,
          completed: false,
        });
      }
    }

    // PRIORITÉ 6 : Préparer un entretien (entretien prévu aujourd'hui ou demain)
    if (objectives.length < 3) {
      const upcomingInterviews = savedOffers.filter((o) => {
        if (o.rejected || o.job_found) return false;
        const hrDate = o.hr_interview_date
          ? new Date(o.hr_interview_date)
          : null;
        const techDate = o.technical_interview_date
          ? new Date(o.technical_interview_date)
          : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (hrDate) {
          hrDate.setHours(0, 0, 0, 0);
          if (
            hrDate.getTime() === today.getTime() ||
            hrDate.getTime() === today.getTime() + 86400000
          ) {
            return true;
          }
        }
        if (techDate) {
          techDate.setHours(0, 0, 0, 0);
          if (
            techDate.getTime() === today.getTime() ||
            techDate.getTime() === today.getTime() + 86400000
          ) {
            return true;
          }
        }
        return false;
      });

      if (upcomingInterviews.length > 0) {
        const offer = upcomingInterviews[0];
        const interviewDate =
          offer.hr_interview_date || offer.technical_interview_date;
        const date = interviewDate
          ? new Date(interviewDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })
          : "bientôt";
        const titleShort =
          offer.title.length > 30
            ? offer.title.substring(0, 30) + "..."
            : offer.title;
        objectives.push({
          id: `interview_${offer.id}`,
          priority: 6,
          icon: "🎯",
          title: "Préparer votre entretien",
          description: `Entretien prévu le ${date} pour "${offer.title}" chez ${offer.company_name || "cette entreprise"}`,
          shortDescription: `Entretien "${titleShort}"`,
          action: () => setView("mes_offres"),
          offer,
          completed: false,
        });
      }
    }

    // PRIORITÉ 7 : Découvrir le résultat final (offres avec TOUT rempli + 1 semaine d'attente)
    // Ne s'affiche QUE si :
    // - L'offre est postulée (is_applied = true)
    // - L'offre n'est PAS refusée (rejected = false)
    // - L'offre n'est PAS "Je suis pris" (job_found = false)
    // - TOUTES les étapes significatives sont complétées (pas juste une)
    // - Au moins 7 jours (1 semaine) se sont écoulés depuis le dernier événement significatif
    if (objectives.length < 3) {
      const offersReadyForFinalStatus = savedOffers.filter((o) => {
        // Conditions de base : postulée, pas refusée, pas "je suis pris"
        if (!o.is_applied || o.rejected || o.job_found) {
          return false;
        }

        // Vérifier que TOUT est rempli : toutes les étapes significatives doivent être complétées
        // On considère qu'une offre est "complète" si elle a au moins :
        // - Une candidature (applied_at)
        // - ET au moins 3 étapes significatives complétées parmi :
        //   - Contacté (email ou téléphone)
        //   - Relance reçue
        //   - Entretien RH programmé
        //   - Entretien technique programmé
        //   - Test demandé
        //   - Test complété
        const significantSteps = [
          o.contacted_by_email,
          o.contacted_by_phone,
          o.follow_up_received,
          o.hr_interview_scheduled,
          o.technical_interview_scheduled,
          o.test_requested,
          o.test_completed,
        ].filter(Boolean).length;

        // Il faut au moins 3 étapes significatives complétées pour considérer que "tout est rempli"
        if (significantSteps < 3) {
          return false; // Pas assez d'étapes complétées
        }

        // Trouver la date du dernier événement significatif
        const lastEventDates: (string | null | undefined)[] = [];

        if (o.contacted_at) lastEventDates.push(o.contacted_at);
        if (o.follow_up_at) lastEventDates.push(o.follow_up_at);
        if (o.hr_interview_date) lastEventDates.push(o.hr_interview_date);
        if (o.technical_interview_date)
          lastEventDates.push(o.technical_interview_date);
        if (o.test_completed_at) lastEventDates.push(o.test_completed_at);
        if (o.test_scheduled_date) lastEventDates.push(o.test_scheduled_date);
        if (o.cover_letter_sent_at) lastEventDates.push(o.cover_letter_sent_at);
        if (o.applied_at) lastEventDates.push(o.applied_at);

        // Si aucun événement avec date, ne pas proposer
        const validDates = lastEventDates.filter((d) => d != null) as string[];
        if (validDates.length === 0) {
          return false;
        }

        // Trouver la date la plus récente
        const mostRecentDate = new Date(
          Math.max(...validDates.map((d) => new Date(d).getTime())),
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        mostRecentDate.setHours(0, 0, 0, 0);

        // Vérifier qu'au moins 7 jours (1 semaine) se sont écoulés depuis le dernier événement
        const daysSinceLastEvent = Math.floor(
          (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Proposer seulement si 7 jours ou plus se sont écoulés
        return daysSinceLastEvent >= 7;
      });

      if (offersReadyForFinalStatus.length > 0) {
        const offer = offersReadyForFinalStatus[0];
        const titleShort =
          offer.title.length > 30
            ? offer.title.substring(0, 30) + "..."
            : offer.title;

        // Trouver la date du dernier événement pour personnaliser le message
        const lastEventDates: (string | null | undefined)[] = [];
        if (offer.test_completed_at)
          lastEventDates.push(offer.test_completed_at);
        if (offer.technical_interview_date)
          lastEventDates.push(offer.technical_interview_date);
        if (offer.hr_interview_date)
          lastEventDates.push(offer.hr_interview_date);
        if (offer.follow_up_at) lastEventDates.push(offer.follow_up_at);
        if (offer.contacted_at) lastEventDates.push(offer.contacted_at);
        if (offer.applied_at) lastEventDates.push(offer.applied_at);

        objectives.push({
          id: `status_update_${offer.id}`,
          priority: 7,
          icon: "🏆",
          title: "Découvrir le résultat final",
          description: `Il est temps de découvrir le résultat pour "${offer.title}" chez ${offer.company_name || "cette entreprise"} ! Une semaine s'est écoulée depuis votre dernière action. Cochez "Je suis pris !" 🎉 ou "Refus" selon le résultat.`,
          shortDescription: `Résultat final : "${titleShort}"`,
          action: () => setView("mes_offres"),
          offer,
          completed: false,
        });
      }
    }
  } // fin if (savedOffers.length > 0)

  // S'ASSURER QU'ON A TOUJOURS 3 OBJECTIFS
  // Si on a moins de 3 objectifs, compléter avec des objectifs génériques
  while (objectives.length < 3) {
    // Si on a des offres sauvegardées mais pas encore d'objectif "Postuler", en ajouter un
    if (
      savedOffers.length > 0 &&
      !objectives.some((obj) => obj.id.startsWith("apply_"))
    ) {
      const offersToApply = savedOffers.filter(
        (o) => !o.is_applied && !o.rejected && !o.job_found,
      );
      if (offersToApply.length > 0) {
        const offer = offersToApply[0];
        const titleShort =
          offer.title.length > 30
            ? offer.title.substring(0, 30) + "..."
            : offer.title;
        objectives.push({
          id: `apply_${offer.id}_${objectives.length}`, // Ajouter un suffixe pour éviter les doublons
          priority: 3,
          icon: "📝",
          title: "Postuler à une offre",
          description: `Postulez à "${offer.title}" chez ${offer.company_name || "cette entreprise"}`,
          shortDescription: `Postuler à "${titleShort}"`,
          action: () => setView("mes_offres"),
          offer,
          completed: false,
        });
        continue;
      }
    }

    // Si on a des missions profil restantes, en ajouter une
    const profileObjectiveCount = objectives.filter((obj) =>
      obj.id.startsWith("profile_"),
    ).length;
    if (profileMissions && profileMissions.length > profileObjectiveCount) {
      const usedProfileIds = objectives
        .filter((obj) => obj.id.startsWith("profile_"))
        .map((obj) => obj.id.replace(/^profile_/, "").replace(/_generic$/, ""));
      const remainingMissions = profileMissions.filter(
        (m) => !usedProfileIds.includes(m.id),
      );
      if (remainingMissions.length > 0) {
        const mission = remainingMissions[0];
        objectives.push({
          id: `profile_${mission.id}`,
          priority: 1,
          icon: mission.icon,
          title: mission.label,
          description: mission.label,
          shortDescription: mission.label,
          action: mission.action,
          completed: false,
        });
        continue;
      }
    }

    // Si on a des offres sauvegardées, proposer de les consulter
    if (
      savedOffers.length > 0 &&
      !objectives.some((obj) => obj.id === "review_offers")
    ) {
      objectives.push({
        id: "review_offers",
        priority: 8,
        icon: "📋",
        title: "Consulter vos offres",
        description:
          "Consultez vos offres sauvegardées et mettez à jour leur statut",
        shortDescription: "Consulter vos offres",
        action: () => setView("mes_offres"),
        completed: false,
      });
      continue;
    }

    // Dernier recours : objectif générique de complétion du profil
    if (profileMissions && profileMissions.length > 0) {
      const mission = profileMissions[0];
      objectives.push({
        id: `profile_${mission.id}_generic`,
        priority: 1,
        icon: mission.icon,
        title: mission.label,
        description: mission.label,
        shortDescription: mission.label,
        action: mission.action,
        completed: false,
      });
      continue;
    }

    // Si vraiment rien n'est disponible, créer un objectif par défaut
    objectives.push({
      id: `default_${objectives.length}`,
      priority: 9,
      icon: "🎯",
      title: "Compléter votre profil",
      description:
        "Cliquez pour accéder à votre profil et ajouter des informations (expériences, formations, compétences, etc.)",
      shortDescription: "Compléter votre profil",
      action: () => setView("profile"),
      completed: false,
    });
  }

  return objectives;
}

/** True si la section À propos (bio) est remplie ou au moins 2 sections significatives. */
export function isProfileCompleteEnough(
  profileData?: ProfileDataBase,
): boolean {
  if (!profileData) return false;
  const hasBio = (profileData.profile?.bio?.trim?.()?.length ?? 0) > 0;
  const sectionsFilled = [
    hasBio,
    (profileData.profile?.location?.trim?.()?.length ?? 0) > 0,
    (profileData.profile?.phone?.trim?.()?.length ?? 0) > 0,
    (profileData.experiences?.length ?? 0) > 0,
    (profileData.educations?.length ?? 0) > 0,
    (profileData.projects?.length ?? 0) > 0,
    (profileData.skills?.length ?? 0) >= 1,
    (profileData.languages?.length ?? 0) > 0,
  ].filter(Boolean).length;
  return hasBio || sectionsFilled >= 2;
}

/** Garde au plus un objectif "Compléter votre profil" (priorité 9 / default_ / generic_). */
function deduplicateCompleteProfileObjectives(
  objectives: DailyObjective[],
): DailyObjective[] {
  const isCompleteProfile = (o: DailyObjective) =>
    o.priority === 9 &&
    (o.id.startsWith("default_") || o.id.startsWith("generic_"));
  let seen = false;
  return objectives.filter((o) => {
    if (isCompleteProfile(o)) {
      if (seen) return false;
      seen = true;
    }
    return true;
  });
}

/** Objectifs "définitifs" : une fois complétés (ex. objectif pro, GitHub, profil déjà rempli), ils ne comptent plus comme objectif du jour. */
export function isPermanentlyCompletedObjective(
  objectiveId: string,
  profileData?: ProfileDataBase,
): boolean {
  if (!profileData) return false;
  if (
    objectiveId === "profile_objective" ||
    objectiveId === "profile_objectif"
  ) {
    return (profileData.keywordsCount ?? 0) >= 1;
  }
  if (objectiveId === "profile_github") {
    return Boolean(profileData.profile?.github_url?.trim?.());
  }
  if (objectiveId === "profile_portfolio") {
    return Boolean(profileData.profile?.portfolio_url?.trim?.());
  }
  if (
    objectiveId.startsWith("default_") ||
    objectiveId.startsWith("generic_")
  ) {
    return isProfileCompleteEnough(profileData);
  }
  return false;
}

/**
 * Initialise ou récupère les objectifs du jour.
 */
export function getOrCreateDailyObjectives(
  savedOffers: JobOffer[],
  setView: (view: string) => void,
  userId: string | null,
  profileMissions?: Array<{
    id: string;
    label: string;
    icon: string;
    points: number;
    action: () => void;
  }>,
  hasLaunchedMatching?: boolean,
  profileData?: ProfileDataBase,
): DailyObjectivesState {
  const state = loadDailyObjectivesState(userId);
  const today = new Date().toISOString().split("T")[0];

  // Si on a un état valide pour aujourd'hui, le synchroniser avec l'état actuel
  if (state && state.date === today) {
    // Retirer les objectifs "définitivement complétés" (ex. objectif pro une fois rempli) pour ne pas afficher "1/3" avec un objectif qui n'en est plus un
    const beforeCount = state.objectives.length;
    state.objectives = state.objectives.filter(
      (o) => !isPermanentlyCompletedObjective(o.id, profileData),
    );
    if (state.objectives.length < beforeCount) {
      state.allCompleted = false;
    }

    // Si on a moins de 3 objectifs (après filtrage ou déjà le cas), compléter avec de nouveaux objectifs
    if (state.objectives.length < 3) {
      const existingIds = new Set(state.objectives.map((obj) => obj.id));
      const newObjectives = generateDailyObjectives(
        savedOffers,
        setView,
        profileMissions,
        hasLaunchedMatching,
      );

      // Ajouter les objectifs manquants (ni déjà présents ni définitivement complétés)
      for (const newObj of newObjectives) {
        if (
          state.objectives.length < 3 &&
          !existingIds.has(newObj.id) &&
          !isPermanentlyCompletedObjective(newObj.id, profileData)
        ) {
          state.objectives.push(newObj);
          existingIds.add(newObj.id);
        }
      }
      state.objectives = deduplicateCompleteProfileObjectives(state.objectives);

      // Si on a toujours moins de 3, ajouter au plus un "Compléter votre profil" (et seulement si le profil n'est pas déjà assez rempli)
      const hasCompleteProfileObj = state.objectives.some(
        (o) =>
          o.priority === 9 &&
          (o.id.startsWith("default_") || o.id.startsWith("generic_")),
      );
      if (
        state.objectives.length < 3 &&
        !hasCompleteProfileObj &&
        profileData &&
        !isProfileCompleteEnough(profileData)
      ) {
        state.objectives.push({
          id: `generic_${state.objectives.length}`,
          priority: 9,
          icon: "🎯",
          title: "Compléter votre profil",
          description:
            "Cliquez pour accéder à votre profil et ajouter des informations (expériences, formations, compétences, etc.)",
          shortDescription: "Compléter votre profil",
          action: () => setView("profile"),
          completed: false,
        });
      }
      while (state.objectives.length < 3) {
        if (!state.objectives.some((o) => o.id === "review_offers")) {
          state.objectives.push({
            id: "review_offers",
            priority: 8,
            icon: "📋",
            title: "Consulter vos offres",
            description:
              "Consultez vos offres sauvegardées et mettez à jour leur statut",
            shortDescription: "Consulter vos offres",
            action: () => setView("mes_offres"),
            completed: false,
          });
        } else {
          break;
        }
      }

      state.objectives = deduplicateCompleteProfileObjectives(state.objectives);
      saveDailyObjectivesState(state, userId);
    }

    // Synchroniser immédiatement pour détecter les actions déjà effectuées
    const syncedState = syncObjectivesWithOffers(
      savedOffers,
      profileData,
      userId,
    );
    if (syncedState) {
      return syncedState;
    }
    return state;
  }

  // Sinon, générer de nouveaux objectifs (dédupliquer "Compléter votre profil", compléter à 3 si besoin)
  let objectives = deduplicateCompleteProfileObjectives(
    generateDailyObjectives(
      savedOffers,
      setView,
      profileMissions,
      hasLaunchedMatching,
    ),
  );
  if (
    objectives.length < 3 &&
    !objectives.some((o) => o.id === "review_offers")
  ) {
    objectives = [
      ...objectives,
      {
        id: "review_offers",
        priority: 8,
        icon: "📋",
        title: "Consulter vos offres",
        description:
          "Consultez vos offres sauvegardées et mettez à jour leur statut",
        shortDescription: "Consulter vos offres",
        action: () => setView("mes_offres"),
        completed: false,
      },
    ];
  }
  if (
    objectives.length < 3 &&
    !objectives.some((o) => o.id === "launch_matching") &&
    !hasLaunchedMatching
  ) {
    objectives = [
      ...objectives,
      {
        id: "launch_matching",
        priority: 2,
        icon: "🔍",
        title: "Lancer le matching",
        description: "Trouvez des offres qui correspondent à votre profil",
        shortDescription: "Lancer le matching",
        action: () => setView("matching"),
        completed: false,
      },
    ];
  }

  const newState: DailyObjectivesState = {
    date: today,
    objectives,
    allCompleted: false,
  };

  // Synchroniser immédiatement les nouveaux objectifs pour détecter les actions déjà effectuées
  const syncedNewState = syncObjectivesWithOffers(
    savedOffers,
    profileData,
    userId,
  );
  if (syncedNewState) {
    return syncedNewState;
  }

  saveDailyObjectivesState(newState, userId);
  return newState;
}

/**
 * Vérifie si un objectif est complété en fonction de l'état actuel des offres et du profil.
 */
export function checkObjectiveCompletion(
  objective: DailyObjective,
  savedOffers: JobOffer[],
  profileData?: ProfileDataBase,
): boolean {
  // Objectif "Définir votre objectif professionnel" (profile_objective ou profile_objectif) : complété si au moins 1 mot-clé
  if (
    objective.id === "profile_objective" ||
    objective.id === "profile_objectif"
  ) {
    return (profileData?.keywordsCount ?? 0) >= 1;
  }

  // Objectifs de profil (priorité 1)
  if (objective.priority === 1 && objective.id.startsWith("profile_")) {
    if (!profileData) return false;

    try {
      // Extraire l'ID de mission (retirer le préfixe profile_ et le suffixe _generic)
      const missionId = objective.id
        .replace(/^profile_/, "")
        .replace(/_generic$/, "");
      const completenessResult = calculateCompleteness(
        (profileData.profile ?? null) as Parameters<
          typeof calculateCompleteness
        >[0],
        (profileData.experiences || []) as Parameters<
          typeof calculateCompleteness
        >[1],
        (profileData.educations || []) as Parameters<
          typeof calculateCompleteness
        >[2],
        (profileData.projects || []) as Parameters<
          typeof calculateCompleteness
        >[3],
        (profileData.languages || []) as Parameters<
          typeof calculateCompleteness
        >[4],
        (profileData.certifications || []) as Parameters<
          typeof calculateCompleteness
        >[5],
        (profileData.skills || []) as Parameters<
          typeof calculateCompleteness
        >[6],
        (profileData.interests || []) as Parameters<
          typeof calculateCompleteness
        >[7],
        profileData.keywordsCount ?? 0,
      );

      // Vérifier si la mission est toujours dans missingItems (non complétée)
      const stillMissing = completenessResult.missingItems.some(
        (m: { id: string }) => m.id === missionId,
      );
      return !stillMissing;
    } catch (error) {
      console.error("Erreur vérification objectif profil:", error);
      return false;
    }
  }

  // Objectif "Lancer le matching" (priorité 2)
  if (objective.id === "launch_matching") {
    return savedOffers.length > 0; // Complété si on a des offres sauvegardées
  }

  // Objectif "Réaliser un entretien technique avec Fox" (prepare_fox_offerId)
  if (objective.id.startsWith("prepare_fox_")) {
    const offerId = objective.id.replace(/^prepare_fox_/, "");
    const offer = savedOffers.find((o) => String(o.id) === String(offerId));
    if (!offer) return false;
    return (
      (offer.prepare_fox_sessions?.length ?? 0) > 0 ||
      offer.prepare_fox_score != null
    );
  }

  // Objectif "Consulter vos offres" (priorité 8)
  if (objective.id === "review_offers") {
    // Vérifier si l'utilisateur a consulté la page "Mes Offres" aujourd'hui
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const visitedKey = `mes_offres_visited_${today}`;
    const hasVisited = localStorage.getItem(visitedKey) === "true";
    return hasVisited;
  }

  // Objectifs d'offres (priorité 3+)
  if (!objective.offer) {
    return false;
  }

  const objectiveOfferId = objective.offer.id;
  const offer = savedOffers.find(
    (o) => String(o.id) === String(objectiveOfferId),
  );

  if (!offer) {
    return false;
  }

  // Gérer les priorités avec if/else pour supporter 3.5
  if (objective.priority === 3) {
    // Postuler
    return offer.is_applied === true;
  } else if (objective.priority === 3.5) {
    // Relancer (date de relance définie)
    // L'objectif est complété si l'utilisateur a contacté (email ou téléphone) OU si la date de relance a été supprimée/dépassée
    const hasContacted =
      offer.contacted_by_email === true || offer.contacted_by_phone === true;
    // Si la date de relance n'existe plus ou est dans le passé et qu'on a contacté, c'est complété
    if (hasContacted) {
      return true;
    }
    // Sinon, vérifier si la date de relance est toujours valide (pas encore passée)
    if (offer.followup_date) {
      const followupDate = new Date(offer.followup_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      followupDate.setHours(0, 0, 0, 0);
      // Si la date est passée et qu'on n'a pas encore contacté, l'objectif reste actif
      return false;
    }
    // Si pas de date de relance, l'objectif est complété (l'utilisateur l'a peut-être supprimée)
    return true;
  } else if (objective.priority === 4) {
    // Lettre de motivation
    return offer.cover_letter_sent === true;
  } else if (objective.priority === 5) {
    // Relancer (automatique après 7 jours)
    return (
      offer.contacted_by_email === true || offer.contacted_by_phone === true
    );
  } else if (objective.priority === 6) {
    // Entretien
    // L'entretien est complété si :
    // 1. On a passé la date (date < aujourd'hui)
    // 2. OU l'utilisateur a marqué l'entretien comme "passé" (hr_interview_completed ou technical_interview_completed)
    const interviewDate =
      offer.hr_interview_date || offer.technical_interview_date;
    const hrCompleted = offer.hr_interview_completed === true;
    const techCompleted = offer.technical_interview_completed === true;

    // Si l'utilisateur a marqué l'entretien comme passé, c'est complété
    if (hrCompleted || techCompleted) {
      return true;
    }

    // Sinon, vérifier si la date est dans le passé
    if (interviewDate) {
      const date = new Date(interviewDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date.getTime() < today.getTime();
    }
    return false;
  } else if (objective.priority === 7) {
    // Mettre à jour le statut
    return offer.job_found === true || offer.rejected === true;
  }

  // Objectifs génériques par défaut (priorité 9) - "Compléter votre profil"
  if (
    objective.priority === 9 &&
    (objective.id.startsWith("default_") || objective.id.startsWith("generic_"))
  ) {
    // Ne JAMAIS marquer complété juste pour avoir visité la page.
    // Complété si la section "À propos" (bio) est remplie OU au moins 2 sections significatives.
    const hasBio = (profileData?.profile?.bio?.trim?.()?.length ?? 0) > 0;
    const sectionsFilled = [
      hasBio,
      (profileData?.profile?.location?.trim?.()?.length ?? 0) > 0,
      (profileData?.profile?.phone?.trim?.()?.length ?? 0) > 0,
      (profileData?.experiences?.length ?? 0) > 0,
      (profileData?.educations?.length ?? 0) > 0,
      (profileData?.projects?.length ?? 0) > 0,
      (profileData?.skills?.length ?? 0) >= 1,
      (profileData?.languages?.length ?? 0) > 0,
    ].filter(Boolean).length;
    return hasBio || sectionsFilled >= 2;
  }

  // Si aucun cas ne correspond, retourner false
  return false;
}

/**
 * Synchronise l'état des objectifs avec l'état actuel des offres et du profil.
 */
export function syncObjectivesWithOffers(
  savedOffers: JobOffer[],
  profileData?: ProfileDataBase,
  userId?: string | null,
): DailyObjectivesState | null {
  const state = loadDailyObjectivesState(userId || null);
  if (!state) return null;

  let hasChanges = false;

  // Ne pas supprimer "Compléter votre profil" de l'état : on le masque uniquement à l'affichage quand le profil est complet,
  // pour que le compteur "x/3 complétés" reste correct (l'objectif masqué compte comme complété).

  // S'assurer qu'on a toujours 3 objectifs (au plus un "Compléter votre profil", et seulement si le profil n'est pas déjà rempli)
  if (state.objectives.length < 3) {
    const existingIds = new Set(state.objectives.map((obj) => obj.id));
    const hasCompleteProfileObj = state.objectives.some(
      (o) =>
        o.priority === 9 &&
        (o.id.startsWith("default_") || o.id.startsWith("generic_")),
    );

    if (
      !hasCompleteProfileObj &&
      profileData &&
      !isProfileCompleteEnough(profileData)
    ) {
      const genericId = `generic_sync_${state.objectives.length}`;
      if (!existingIds.has(genericId)) {
        state.objectives.push({
          id: genericId,
          priority: 9,
          icon: "🎯",
          title: "Compléter votre profil",
          description:
            "Cliquez pour accéder à votre profil et ajouter des informations (expériences, formations, compétences, etc.)",
          shortDescription: "Compléter votre profil",
          action: () => {},
          completed: false,
        });
        existingIds.add(genericId);
      }
    }
    while (
      state.objectives.length < 3 &&
      !state.objectives.some((o) => o.id === "review_offers")
    ) {
      state.objectives.push({
        id: "review_offers",
        priority: 8,
        icon: "📋",
        title: "Consulter vos offres",
        description:
          "Consultez vos offres sauvegardées et mettez à jour leur statut",
        shortDescription: "Consulter vos offres",
        action: () => {},
        completed: false,
      });
    }
    state.objectives = deduplicateCompleteProfileObjectives(state.objectives);
  }

  // Vérifier chaque objectif
  for (const objective of state.objectives) {
    if (objective.completed) {
      continue; // Déjà complété
    }

    const isCompleted = checkObjectiveCompletion(
      objective,
      savedOffers,
      profileData,
    );
    if (isCompleted && !objective.completed) {
      objective.completed = true;
      objective.completedAt = new Date().toISOString();
      hasChanges = true;
    }
  }

  // Vérifier si tous sont complétés
  const allCompleted = state.objectives.every((obj) => obj.completed);
  if (allCompleted && !state.allCompleted) {
    state.allCompleted = true;
    state.completedAt = new Date().toISOString();
    hasChanges = true;
  }

  if (hasChanges) {
    saveDailyObjectivesState(state, userId || null);
  }

  return state;
}
