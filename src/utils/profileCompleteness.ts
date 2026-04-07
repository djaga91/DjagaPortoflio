/**
 * Utilitaires pour le calcul de complétude du profil et génération de missions
 */

import type {
  Profile,
  Experience,
  Education,
  Project,
  Language,
  Certification,
  Skill,
  Interest,
} from "../types";

/** Sections de la page Mon Profil (ProfileEditorView) */
export const PROFILE_SECTIONS = [
  "objectif",
  "bio",
  "contact",
  "experiences",
  "educations",
  "projects",
  "languages",
  "certifications",
  "interests",
  "skills",
] as const;

/**
 * Mappe un id de mission (profileCompleteness) vers l'id de section dans ProfileEditorView.
 * Utilisé pour scroller vers la section concernée quand on clique sur un objectif ou conseil.
 */
export function getProfileSectionForMissionId(missionId: string): string {
  const CONTACT_SECTIONS = [
    "location",
    "phone",
    "linkedin",
    "github",
    "portfolio",
  ];
  if (CONTACT_SECTIONS.includes(missionId)) return "contact";
  if (PROFILE_SECTIONS.includes(missionId as (typeof PROFILE_SECTIONS)[number]))
    return missionId;
  if (missionId === "experience") return "experiences";
  if (missionId === "education") return "educations";
  if (missionId === "project") return "projects";
  if (missionId === "language") return "languages";
  if (missionId === "certification") return "certifications";
  return "bio"; // fallback : section bio
}

export interface CompletenessResult {
  percentage: number;
  score: number;
  maxScore: number;
  missingItems: Mission[];
  nextMissions: Mission[];
}

export interface Mission {
  id: string;
  label: string;
  points: number;
  action: () => void;
  icon: string;
  priority: number;
}

/**
 * Calcule la complétude du profil selon les critères backend
 */
export function calculateCompleteness(
  profile: Profile | null,
  experiences: Experience[],
  educations: Education[],
  projects: Project[],
  languages: Language[],
  certifications: Certification[],
  skills: Skill[],
  interests: Interest[] = [],
  objectivesCount: number = 0, // Mots-clés / objectifs professionnels (Mon Objectif)
): CompletenessResult {
  let score = 0;
  let maxScore = 100;
  const missingItems: Mission[] = [];

  // === Informations de base (40 points) ===
  // Bio (10 points) - ÉDITABLE dans l'interface
  if (!profile?.bio || profile.bio.trim().length === 0) {
    missingItems.push({
      id: "bio",
      label: "Ajouter une bio professionnelle",
      points: 10,
      action: () => {},
      icon: "📝",
      priority: 1,
    });
  } else {
    score += 10;
  }

  // Location (5 points) - ÉDITABLE dans l'interface
  if (!profile?.location || profile.location.trim().length === 0) {
    missingItems.push({
      id: "location",
      label: "Ajouter votre localisation",
      points: 5,
      action: () => {},
      icon: "📍",
      priority: 3,
    });
  } else {
    score += 5;
  }

  // Phone (5 points) - ÉDITABLE dans l'interface
  if (!profile?.phone || profile.phone.trim().length === 0) {
    missingItems.push({
      id: "phone",
      label: "Ajouter votre numéro de téléphone",
      points: 5,
      action: () => {},
      icon: "📞",
      priority: 4,
    });
  } else {
    score += 5;
  }

  // LinkedIn (5 points) - ÉDITABLE dans l'interface
  if (!profile?.linkedin_url || profile.linkedin_url.trim().length === 0) {
    missingItems.push({
      id: "linkedin",
      label: "Ajouter votre profil LinkedIn",
      points: 5,
      action: () => {},
      icon: "💼",
      priority: 3,
    });
  } else {
    score += 5;
  }

  // GitHub (5 points) - ÉDITABLE dans l'interface
  if (!profile?.github_url || profile.github_url.trim().length === 0) {
    missingItems.push({
      id: "github",
      label: "Ajouter votre profil GitHub",
      points: 5,
      action: () => {},
      icon: "💻",
      priority: 3,
    });
  } else {
    score += 5;
  }

  // Portfolio (5 points) - ÉDITABLE dans l'interface
  if (!profile?.portfolio_url || profile.portfolio_url.trim().length === 0) {
    missingItems.push({
      id: "portfolio",
      label: "Ajouter votre portfolio",
      points: 5,
      action: () => {},
      icon: "🌐",
      priority: 3,
    });
  } else {
    score += 5;
  }

  if (!skills || skills.length < 3) {
    const remaining = 3 - (skills?.length || 0);
    missingItems.push({
      id: "skills",
      label: `Ajouter ${remaining} compétence${remaining > 1 ? "s" : ""} (${skills?.length || 0}/3)`,
      points: 5,
      action: () => {},
      icon: "⚡",
      priority: 2,
    });
  } else {
    score += 5;
  }

  // === Expériences (20 points) ===
  if (!experiences || experiences.length === 0) {
    missingItems.push({
      id: "experiences",
      label: "Ajouter votre première expérience",
      points: 20,
      action: () => {},
      icon: "💼",
      priority: 1,
    });
  } else {
    score += 20;
  }

  // === Éducation (15 points) ===
  if (!educations || educations.length === 0) {
    missingItems.push({
      id: "educations",
      label: "Ajouter votre première formation",
      points: 15,
      action: () => {},
      icon: "🎓",
      priority: 2,
    });
  } else {
    score += 15;
  }

  // === Projets (10 points) ===
  if (!projects || projects.length === 0) {
    missingItems.push({
      id: "projects",
      label: "Ajouter votre premier projet",
      points: 10,
      action: () => {},
      icon: "🚀",
      priority: 3,
    });
  } else {
    score += 10;
  }

  // === Langues (10 points) ===
  if (!languages || languages.length === 0) {
    missingItems.push({
      id: "languages",
      label: "Ajouter votre première langue",
      points: 10,
      action: () => {},
      icon: "🌍",
      priority: 3,
    });
  } else {
    score += 10;
  }

  // === Certifications (5 points) ===
  if (!certifications || certifications.length === 0) {
    missingItems.push({
      id: "certifications",
      label: "Ajouter votre première certification",
      points: 5,
      action: () => {},
      icon: "🏆",
      priority: 4,
    });
  } else {
    score += 5;
  }

  // === Centres d'intérêt (optionnel mais recommandé)
  maxScore += 5;
  if (!interests || interests.length === 0) {
    missingItems.push({
      id: "interests",
      label: "Ajouter vos centres d'intérêt",
      points: 5,
      action: () => {},
      icon: "🎨",
      priority: 4,
    });
  } else {
    score += 5;
  }

  // === Mon Objectif (10 points pour la complétude, +100 pts XP en récompense)
  maxScore += 10;
  if (objectivesCount === 0) {
    missingItems.push({
      id: "objectif",
      label: "Définir votre objectif professionnel",
      points: 100,
      action: () => {},
      icon: "🎯",
      priority: 1,
    });
  } else {
    score += 10;
  }

  // Trier par priorité et prendre les 2-3 premières missions
  const nextMissions = missingItems
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  return {
    percentage: Math.min(Math.round((score / maxScore) * 100), 100),
    score,
    maxScore,
    missingItems,
    nextMissions,
  };
}

/**
 * Génère un conseil du jour basé sur la complétude
 */
export interface DailyAdvice {
  title: string;
  message: string;
  action: string;
  actionType:
    | "bio"
    | "experience"
    | "education"
    | "project"
    | "language"
    | "certification"
    | "skills"
    | "profile"
    | "jobs"
    | "experiences"
    | "educations"
    | "projects"
    | "languages"
    | "certifications"
    | "linkedin"
    | "github"
    | "portfolio"
    | "location"
    | "phone"
    | "photo"
    | "interests"
    | "objectif";
}

// Banque de conseils pour les utilisateurs qui ont trouvé un job
const JOB_FOUND_ADVICE_BANK: DailyAdvice[] = [
  {
    title: "Félicitations pour votre nouveau poste ! 🎉",
    message:
      "Maintenant que vous avez décroché ce job, pensez à mettre à jour votre profil avec votre nouveau poste.",
    action: "Mettre à jour mon profil",
    actionType: "profile",
  },
  {
    title: "Partagez votre réussite",
    message:
      "Vous avez trouvé un job ! Pensez à ajouter cette nouvelle expérience à votre portfolio pour documenter votre parcours.",
    action: "Ajouter mon expérience",
    actionType: "experience",
  },
  {
    title: "Développez votre réseau",
    message:
      "Maintenant que vous êtes en poste, c'est le moment idéal pour développer votre réseau professionnel.",
    action: "Compléter mon profil",
    actionType: "profile",
  },
];

export function generateDailyAdvice(
  completeness: CompletenessResult,
  _profile: Profile | null,
  hasFoundJob: boolean = false,
  daysSinceJobFound: number = 0,
  _experiences?: Experience[],
  _educations?: Education[],
  _projects?: Project[],
  _languages?: Language[],
  _certifications?: Certification[],
  _skills?: Skill[],
  _interests?: Interest[],
): DailyAdvice {
  // Si l'utilisateur a trouvé un job, proposer des conseils adaptés
  if (hasFoundJob) {
    // Utiliser le jour depuis le job trouvé pour varier les conseils
    const adviceIndex = daysSinceJobFound % JOB_FOUND_ADVICE_BANK.length;
    return JOB_FOUND_ADVICE_BANK[adviceIndex];
  }

  if (completeness.percentage === 100) {
    return {
      title: "Votre profil est au top ! 🎉",
      message:
        "Excellent travail ! Votre profil est complet à 100%. Consultez les offres matchées pour trouver votre prochain job.",
      action: "Voir les offres",
      actionType: "jobs",
    };
  }

  const topMission = completeness.nextMissions[0];
  if (!topMission) {
    return {
      title: "Complétez votre profil",
      message: `Votre profil est complété à ${completeness.percentage}%. Continuez à l'enrichir pour améliorer votre visibilité.`,
      action: "Compléter mon profil",
      actionType: "profile",
    };
  }

  // Messages de conseil pour chaque type de mission
  // Note: Seules les missions éditables dans l'interface ont des messages
  const messages: Record<string, string> = {
    bio: "Les recruteurs passent en moyenne 7 secondes sur un CV. Votre bio professionnelle est la première chose qu'ils voient. Rédigez une accroche percutante qui vous démarque !",
    experiences:
      "Un CV sans expérience professionnelle passe rarement le premier filtre. Même un stage, un job étudiant ou un projet personnel compte !",
    educations:
      "Vos formations montrent votre parcours académique et votre niveau de qualification. Ajoutez-les pour compléter votre profil.",
    projects:
      "Les projets démontrent vos compétences pratiques et votre capacité à mener des initiatives. Montrez ce que vous savez faire !",
    languages:
      "Les langues sont un atout majeur dans le monde professionnel. Ajoutez-les pour montrer votre polyvalence.",
    certifications:
      "Les certifications valident vos compétences et montrent votre engagement dans votre développement professionnel.",
    skills:
      "Les recruteurs cherchent des profils avec au moins 3 compétences clés. Enrichissez votre profil en ajoutant vos compétences principales !",
    location:
      "Préciser votre localisation aide les recruteurs à vous proposer des offres adaptées.",
    phone:
      "Ajouter votre numéro de téléphone permet aux recruteurs de vous contacter directement.",
    linkedin:
      "Connecter votre profil LinkedIn augmente votre crédibilité auprès des recruteurs.",
    github:
      "Partager votre GitHub permet de montrer vos projets et compétences techniques.",
  };

  return {
    title: topMission.label,
    message:
      messages[topMission.id] ||
      `Complétez cette section pour gagner ${topMission.points} points et améliorer votre profil.`,
    action: topMission.label,
    actionType: topMission.id as DailyAdvice["actionType"],
  };
}

/**
 * Vérifie si un conseil est déjà complété (pour éviter d'afficher un conseil obsolète)
 */
export function isAdviceAlreadyCompleted(
  advice: DailyAdvice,
  profile: Profile | null,
  experiences?: Experience[],
  educations?: Education[],
  projects?: Project[],
  languages?: Language[],
  certifications?: Certification[],
  skills?: Skill[],
  _interests?: Interest[],
  objectivesCount: number = 0, // Mots-clés / objectif professionnel déjà défini
): boolean {
  if (!advice) return false;

  // Vérification basée sur les données réelles
  switch (advice.actionType) {
    case "objectif":
      return objectivesCount >= 1;
    case "bio":
      return !!profile?.bio && profile.bio.trim().length > 0;
    case "location":
      return !!profile?.location && profile.location.trim().length > 0;
    case "phone":
      return !!profile?.phone && profile.phone.trim().length > 0;
    case "linkedin":
      return !!profile?.linkedin_url && profile.linkedin_url.trim().length > 0;
    case "github":
      return !!profile?.github_url && profile.github_url.trim().length > 0;
    case "experience":
    case "experiences":
      return (experiences?.length ?? 0) > 0;
    case "education":
    case "educations":
      return (educations?.length ?? 0) > 0;
    case "project":
    case "projects":
      return (projects?.length ?? 0) > 0;
    case "language":
    case "languages":
      return (languages?.length ?? 0) > 0;
    case "certification":
    case "certifications":
      return (certifications?.length ?? 0) > 0;
    case "skills":
      return (skills?.length ?? 0) >= 3;
    default:
      return false;
  }
}

/**
 * Valide et corrige un conseil récupéré du cache
 */
export function validateAndFixAdvice(advice: DailyAdvice): DailyAdvice {
  // S'assurer que tous les champs requis sont présents
  return {
    title: advice.title || "Conseil du jour",
    message: advice.message || "Continuez à améliorer votre profil !",
    action: advice.action || "Compléter mon profil",
    actionType: advice.actionType || "profile",
  };
}
