import React, { useState, useCallback, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Users,
  LogOut,
  MessageSquare,
  Bug,
  Briefcase,
  Loader2,
  Shield,
  Sparkles,
  TrendingUp,
  Settings,
  ArrowUpRight,
  File,
  Building2,
  Eye,
  X,
  GraduationCap,
  Hash,
  ClipboardList,
  Search,
} from "lucide-react";
import {
  gamificationAPI,
  organizationsAPI,
  schoolStudentAPI,
} from "../services/api";
import { useGameStore } from "../store/gameStore";
import { LEVEL_THRESHOLDS } from "../types";
import { Footer } from "./Footer";
import { ThemeSwitcher, ThemeSwitcherMobile } from "./ThemeSwitcher";
import NotificationBell from "./NotificationBell";
import { authAPI } from "../services/api";
import { getAbsoluteImageUrl } from "../utils/imageUrl";
import { OnboardingTutorial } from "./OnboardingTutorial";

// URL de base Featurebase
const FEATUREBASE_BASE_URL = "https://portfolia.featurebase.app";

// Icône Discord (Clyde)
const DiscordIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    user,
    profile,
    gamification,
    view,
    setView,
    logout,
    isAuthenticated,
    backgroundTask,
    setGamification,
  } = useGameStore();
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false);
  const [isDiscordLinked, setIsDiscordLinked] = useState(false);
  const hasBackgroundTask = backgroundTask.active;

  // Mode "Voir en tant qu'utilisateur" pour les comptes B2B
  const [userMode, setUserMode] = useState(() => {
    return localStorage.getItem("b2b_user_mode") === "true";
  });

  const toggleUserMode = useCallback(() => {
    const newValue = !userMode;
    setUserMode(newValue);
    localStorage.setItem("b2b_user_mode", newValue ? "true" : "false");
  }, [userMode]);

  // Score de complétude et prochain jalon pour le header mobile
  const [completenessScore, setCompletenessScore] = useState<number>(0);
  const [nextMilestoneId, setNextMilestoneId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      gamificationAPI
        .getCompleteness()
        .then((data) => {
          setCompletenessScore(data.score);
          setNextMilestoneId(data.next_milestone?.id || null);
        })
        .catch(() => {
          setCompletenessScore(0);
          setNextMilestoneId(null);
        });
    }
  }, [isAuthenticated, view]); // Recharger quand on change de vue

  // Rafraîchir les stats gamification (XP) quand une offre est mise à jour (postulation, entretien, etc.)
  useEffect(() => {
    const refreshGamification = async () => {
      if (!isAuthenticated) return;
      try {
        const stats = await gamificationAPI.getStats();
        setGamification(stats);
      } catch {
        // Ignorer les erreurs silencieusement
      }
    };
    window.addEventListener("offerUpdated", refreshGamification);
    return () =>
      window.removeEventListener("offerUpdated", refreshGamification);
  }, [isAuthenticated, setGamification]);

  // Navigation vers le prochain objectif
  const navigateToMilestone = useCallback(() => {
    if (!nextMilestoneId) {
      setView("profile");
      return;
    }

    // Mapping milestone ID → page de destination
    const milestoneRoutes: Record<string, string> = {
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
      cv_generated: "cv_template_selection",
      cover_letter: "cover_letters",
    };

    const destination = milestoneRoutes[nextMilestoneId] || "profile";
    setView(destination as typeof view);
  }, [nextMilestoneId, setView]);

  // Ouvrir Featurebase avec SSO sécurisé (JWT)
  const openFeaturebase = useCallback(async () => {
    // Si non authentifié, ouvrir directement (mode anonyme)
    if (!isAuthenticated) {
      window.open(FEATUREBASE_BASE_URL, "_blank", "noopener,noreferrer");
      return;
    }

    // Si authentifié, récupérer le token SSO
    setIsLoadingFeedback(true);
    try {
      const { token } = await authAPI.getFeaturebaseToken();
      const url = `${FEATUREBASE_BASE_URL}?jwt=${encodeURIComponent(token)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("❌ Erreur récupération token Featurebase:", error);
      // Fallback: ouvrir sans SSO
      window.open(FEATUREBASE_BASE_URL, "_blank", "noopener,noreferrer");
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [isAuthenticated]);

  // Lier le compte Discord
  const handleDiscordLink = useCallback(async () => {
    if (!isAuthenticated) return;

    // Si déjà lié, ouvrir Discord directement
    if (isDiscordLinked) {
      window.open(
        "https://discord.gg/aNThMsyAhZ",
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    setIsLoadingDiscord(true);
    try {
      const { discordAPI } = await import("../services/api");
      const { url } = await discordAPI.getAuthUrl();
      // Redirection vers Discord OAuth
      window.location.href = url;
    } catch (error) {
      console.error("❌ Erreur liaison Discord:", error);
      alert("Erreur lors de la liaison Discord. Veuillez réessayer.");
      setIsLoadingDiscord(false);
    }
  }, [isAuthenticated, isDiscordLinked]);

  // Vérifier le statut Discord au chargement
  useEffect(() => {
    const checkDiscordStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const { discordAPI } = await import("../services/api");
        const status = await discordAPI.getStatus();
        setIsDiscordLinked(status.linked);
      } catch (error) {
        console.error("Erreur vérification Discord:", error);
      }
    };
    checkDiscordStatus();
  }, [isAuthenticated]);

  // Vérifier si l'utilisateur est admin
  const isAdmin = Boolean(user?.is_superuser) === true;

  // Vérifier les appartenances à des organisations B2B
  const currentOrgType = localStorage.getItem("current_org_type");
  const currentOrgRole = localStorage.getItem("current_org_role");
  const currentOrgName =
    localStorage.getItem("current_org_name") ||
    (currentOrgType === "school" ? "École" : "Entreprise");
  const hasSchoolOrg = currentOrgType === "school";
  const hasCompanyOrg = currentOrgType === "company";
  const isSchoolStaff =
    hasSchoolOrg &&
    ["admin", "coach", "teacher", "viewer"].includes(currentOrgRole || "");
  const isSchoolStudent = hasSchoolOrg && currentOrgRole === "student";
  const isCompanyStaff =
    hasCompanyOrg &&
    ["company_admin", "recruiter"].includes(currentOrgRole || "");

  // "Mon école" visible uniquement si l'utilisateur est étudiant dans au moins une école (vérifié via API)
  const [hasSchoolStudentMembership, setHasSchoolStudentMembership] =
    useState(false);
  const [mySchoolData, setMySchoolData] = useState<{
    school_name: string;
    cohort_name: string | null;
  } | null>(null);
  useEffect(() => {
    if (!isAuthenticated) {
      setHasSchoolStudentMembership(false);
      setMySchoolData(null);
      return;
    }
    organizationsAPI
      .getMyOrganizations()
      .then(({ items }) => {
        const isStudentInSchool = items.some(
          (o) => o.type === "school" && o.user_role === "student",
        );
        setHasSchoolStudentMembership(isStudentInSchool);
      })
      .catch(() => setHasSchoolStudentMembership(false));
  }, [isAuthenticated]);

  // Charger école + cohorte pour affichage sur le profil (étudiants)
  useEffect(() => {
    if (!isAuthenticated || !isSchoolStudent) {
      setMySchoolData(null);
      return;
    }
    schoolStudentAPI
      .getMySchool()
      .then((data) =>
        setMySchoolData({
          school_name: data.school_name,
          cohort_name: data.cohort_name ?? null,
        }),
      )
      .catch(() => setMySchoolData(null));
  }, [isAuthenticated, isSchoolStudent]);

  // Déterminer si on est dans un contexte B2B (école ou entreprise)
  const isB2BContext = isSchoolStaff || isCompanyStaff;

  // Afficher les menus utilisateur si :
  // - Pas dans un contexte B2B, OU
  // - Dans un contexte B2B mais en mode "voir en tant qu'utilisateur"
  const showUserMenus = !isB2BContext || userMode;

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  // Calculer le pourcentage de progression vers le prochain niveau
  const calculateProgress = () => {
    const currentLevel = gamification.level;
    const currentXP = gamification.xp;
    const levelStartXP = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelXP =
      LEVEL_THRESHOLDS[currentLevel] ||
      LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const xpInCurrentLevel = currentXP - levelStartXP;
    const xpNeededForNextLevel = nextLevelXP - levelStartXP;
    return {
      percentage:
        xpNeededForNextLevel > 0
          ? (xpInCurrentLevel / xpNeededForNextLevel) * 100
          : 0,
      currentXP: xpInCurrentLevel,
      neededXP: xpNeededForNextLevel,
      level: currentLevel,
    };
  };

  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 22; // rayon = 22 pour un cercle plus large

  return (
    <>
      {/* Onboarding Tutorial - Rendu au niveau du Layout pour persister entre les vues */}
      <OnboardingTutorial userId={user?.id} />

      {/* SIDEBAR BUREAU */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-theme-card border-r border-theme-border flex-col z-30 transition-colors duration-300">
        {/* Header fixe - Logo + Theme Switcher */}
        <div className="p-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30 transform -rotate-3 overflow-hidden">
              <img
                src="/logo.svg"
                alt="Portfolia"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-theme-text-primary">
              Portfolia
            </span>
          </div>
          {/* Theme Switcher Desktop */}
          <ThemeSwitcher variant="icon-only" size="sm" />
        </div>

        {/* Navigation scrollable - overscroll-contain empêche la propagation du scroll à la page */}
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto min-h-0 overscroll-contain">
          {/* Bannière B2B avec bouton mode utilisateur */}
          {isB2BContext && (
            <div
              className={`mb-4 p-3 rounded-xl border ${
                hasSchoolOrg
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {hasSchoolOrg ? (
                  <GraduationCap
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                ) : (
                  <Building2
                    size={16}
                    className="text-purple-600 dark:text-purple-400"
                  />
                )}
                <span
                  className={`text-xs font-bold ${
                    hasSchoolOrg
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {currentOrgName}
                </span>
              </div>
              <button
                onClick={toggleUserMode}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  userMode
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                    : "bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-secondary border border-theme-border"
                }`}
              >
                <Eye size={14} />
                {userMode
                  ? "Quitter mode utilisateur"
                  : "Voir en tant qu'utilisateur"}
              </button>
            </div>
          )}

          {/* Bannière mode utilisateur actif */}
          {isB2BContext && userMode && (
            <div className="mb-2 p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center justify-between">
              <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                Mode utilisateur actif
              </span>
              <button
                onClick={toggleUserMode}
                className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded transition"
              >
                <X size={14} className="text-orange-600 dark:text-orange-400" />
              </button>
            </div>
          )}

          {[
            // Menus utilisateur (visibles uniquement si showUserMenus)
            ...(showUserMenus
              ? [
                  {
                    id: "dashboard",
                    label: "Mon Bureau",
                    icon: LayoutDashboard,
                  },
                  { id: "profile", label: "Mon Profil", icon: User },
                  { id: "documents", label: "Mes Documents", icon: File },
                  { id: "mes_offres", label: "Offres", icon: Search },
                  { id: "portfolio", label: "Mon Portfolio", icon: Briefcase },
                  ...(hasSchoolStudentMembership
                    ? [
                        {
                          id: "my_school",
                          label: "Mon école",
                          icon: GraduationCap,
                        },
                      ]
                    : []),
                  // Note: "Ma Situation Pro" a été retiré de la navigation principale.
                  // L'accès se fait désormais via les liens d'enquête envoyés par l'école
                  // ou via les triggers automatiques (modal in-app).
                  { id: "settings", label: "Paramètres", icon: Settings },
                ]
              : []),
            // Liens B2B École si l'utilisateur est staff d'une école
            ...(isSchoolStaff
              ? [
                  {
                    id: "school_dashboard",
                    label: "Espace École",
                    icon: Building2,
                    color: "blue",
                  },
                  {
                    id: "student_profiles",
                    label: "Profils Étudiants",
                    icon: Users,
                    color: "blue",
                  },
                  {
                    id: "invite_codes",
                    label: "Codes d'invitation",
                    icon: Hash,
                    color: "indigo",
                  },
                  {
                    id: "survey_campaigns",
                    label: "Enquêtes Insertion",
                    icon: ClipboardList,
                    color: "green",
                  },
                  {
                    id: "partner_jobs",
                    label: "Offres Partenaires",
                    icon: Briefcase,
                    color: "green",
                  },
                  {
                    id: "analytics",
                    label: "Analytics",
                    icon: TrendingUp,
                    color: "purple",
                  },
                ]
              : []),
            // Liens B2B Entreprise si l'utilisateur est staff d'une entreprise
            ...(isCompanyStaff
              ? [
                  {
                    id: "company_dashboard",
                    label: "Espace Entreprise",
                    icon: Building2,
                    color: "purple",
                  },
                  {
                    id: "jobs",
                    label: "Offres",
                    icon: Search,
                    color: "purple",
                  },
                  {
                    id: "student_search",
                    label: "Rechercher Talents",
                    icon: Users,
                    color: "green",
                  },
                  {
                    id: "partnerships",
                    label: "Écoles Partenaires",
                    icon: GraduationCap,
                    color: "blue",
                  },
                  {
                    id: "invite_codes",
                    label: "Codes d'invitation",
                    icon: Hash,
                    color: "indigo",
                  },
                  {
                    id: "analytics",
                    label: "Analytics",
                    icon: TrendingUp,
                    color: "purple",
                  },
                ]
              : []),
            // Options Admin uniquement pour les superusers
            ...(isAdmin
              ? [
                  { id: "admin", label: "Admin", icon: Shield },
                  { id: "admin_users", label: "Utilisateurs", icon: Users },
                  {
                    id: "admin_analytics",
                    label: "Analytics",
                    icon: TrendingUp,
                  },
                  { id: "debug", label: "Debug", icon: Bug },
                ]
              : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              data-onboarding={
                item.id === "profile"
                  ? "menu-profile"
                  : item.id === "documents"
                    ? "menu-documents"
                    : item.id === "mes_offres"
                      ? "menu-offers"
                      : item.id === "portfolio"
                        ? "menu-portfolio"
                        : item.id === "settings"
                          ? "menu-settings"
                          : undefined
              }
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                view === item.id
                  ? item.id === "debug"
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold"
                    : "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold"
                  : "text-theme-text-tertiary hover:bg-theme-bg-tertiary hover:text-theme-text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={
                    view === item.id
                      ? item.id === "debug"
                        ? "text-purple-500"
                        : "text-orange-500"
                      : "text-theme-text-muted group-hover:text-theme-text-secondary"
                  }
                />
                <span className="text-sm">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer fixe - Profil utilisateur + Déconnexion */}
        <div className="p-4 border-t border-theme-border-secondary flex-shrink-0">
          <div
            onClick={() => setView("profile")}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-theme-bg-tertiary cursor-pointer transition group relative"
          >
            <div className="relative group/profile">
              {/* Cercle de progression du niveau - plus large et juicy */}
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                  {/* Cercle de fond */}
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    fill="none"
                    className="stroke-theme-border"
                    strokeWidth="4"
                  />
                  {/* Cercle de progression avec gradient */}
                  <defs>
                    <linearGradient
                      id="progress-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FF8C42" />
                      <stop offset="100%" stopColor="#FF6B2B" />
                    </linearGradient>
                    <linearGradient
                      id="loading-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Cercle de progression normal ou animation de chargement */}
                  {hasBackgroundTask ? (
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="url(#loading-gradient)"
                      strokeWidth="4"
                      strokeDasharray="30 10"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      className="animate-spin"
                      style={{
                        transformOrigin: "28px 28px",
                        animation: "spin 1.5s linear infinite",
                      }}
                    />
                  ) : (
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="url(#progress-gradient)"
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={
                        circumference * (1 - progress.percentage / 100)
                      }
                      strokeLinecap="round"
                      className="transition-all duration-500"
                      filter="url(#glow)"
                      style={{
                        boxShadow: "0 0 10px rgba(255, 140, 66, 0.5)",
                      }}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-11 h-11 rounded-full bg-theme-bg-tertiary overflow-hidden border-2 shadow-md transition-all ${
                      hasBackgroundTask
                        ? "border-emerald-400 dark:border-emerald-600"
                        : "border-theme-card group-hover:border-orange-200 dark:group-hover:border-orange-800 group-hover:shadow-lg"
                    }`}
                  >
                    {profile?.profile_picture_url ? (
                      <img
                        src={
                          getAbsoluteImageUrl(profile.profile_picture_url) || ""
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "default"}`}
                        alt="Avatar"
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Indicateur de statut : vert = en ligne, pulse = tâche en cours */}
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-theme-card rounded-full shadow-sm ${
                  hasBackgroundTask
                    ? "bg-gradient-to-r from-emerald-500 to-blue-500 animate-pulse"
                    : "bg-green-500"
                }`}
              ></div>

              {/* Tooltip au survol */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/profile:opacity-100 pointer-events-none transition-all duration-300 transform translate-x-2 group-hover/profile:translate-x-0 z-50 whitespace-nowrap">
                <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700">
                  {hasBackgroundTask ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles
                          size={14}
                          className="text-emerald-400 animate-pulse"
                        />
                        <span className="text-emerald-400 font-bold">
                          Traitement en cours
                        </span>
                      </div>
                      <div className="text-slate-300">
                        {backgroundTask.message || "Analyse IA..."}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#FF8C42] font-bold">
                          Niveau {progress.level}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        {progress.currentXP} / {progress.neededXP} XP
                      </div>
                    </>
                  )}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-slate-900 border-b-[6px] border-b-transparent"></div>
                </div>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-theme-text-primary truncate">
                {gamification?.badges?.includes("legendary") ? (
                  <>
                    <span className="text-yellow-600 dark:text-yellow-400">
                      {user?.full_name || "Invité"}
                    </span>{" "}
                    <span className="inline-block animate-bounce">🐐</span>
                  </>
                ) : (
                  user?.full_name || "Invité"
                )}
              </div>
              <div className="text-xs text-theme-text-muted truncate">
                {!isAuthenticated
                  ? "Mode Invité"
                  : isCompanyStaff
                    ? currentOrgRole === "company_admin"
                      ? "Admin Entreprise"
                      : "Recruteur"
                    : isSchoolStaff
                      ? currentOrgRole === "admin"
                        ? "Admin École"
                        : currentOrgRole === "coach"
                          ? "Coach"
                          : currentOrgRole === "teacher"
                            ? "Professeur"
                            : "Staff"
                      : isSchoolStudent
                        ? "Étudiant"
                        : "Utilisateur"}
              </div>
              {/* Même design que Mon Profil : la classe (cohorte) pour étudiants, école pour staff */}
              {hasSchoolOrg && (
                <div className="flex items-center gap-2 mt-1.5 min-w-0">
                  <GraduationCap
                    size={18}
                    className="text-blue-500 dark:text-blue-400 flex-shrink-0"
                  />
                  <span className="text-base font-bold text-blue-500 dark:text-blue-400 truncate">
                    {isSchoolStudent &&
                    (mySchoolData?.cohort_name || mySchoolData?.school_name)
                      ? mySchoolData.cohort_name || mySchoolData.school_name
                      : currentOrgName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bouton Discord - Liaison de compte ou accès communauté */}
          <button
            onClick={handleDiscordLink}
            disabled={isLoadingDiscord || !isAuthenticated}
            className="w-full mt-6 flex flex-col gap-1 px-4 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              {isLoadingDiscord ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <DiscordIcon size={20} />
              )}
              <span className="text-center">
                {isDiscordLinked
                  ? "Besoin d'aide ?"
                  : "Rejoignez notre Discord !"}
              </span>
            </div>
            <span className="text-xs font-normal text-white/90 group-hover:text-white transition-colors text-center">
              {isDiscordLinked
                ? "Rejoignez la communauté Discord"
                : "Liez votre compte Discord"}
            </span>
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-theme-text-tertiary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          )}
        </div>
      </aside>

      {/* TOP BAR MOBILE */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-theme-nav-bg/80 backdrop-blur-md border-b border-theme-nav-border z-30 px-4 py-3 flex justify-between items-center transition-colors duration-300">
        {/* Gauche : Logo + Username + Discord */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-md overflow-hidden">
            <img
              src="/logo.svg"
              alt="Portfolia"
              className="w-6 h-6 object-contain"
            />
          </div>
          <button
            onClick={() => setView("profile")}
            className="flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="hidden min-[360px]:block text-sm font-bold text-theme-text-primary">
              {isAuthenticated ? user?.username || "Guest" : "Guest"}
            </span>
          </button>

          {/* Icône Discord mobile - Liaison compte */}
          <button
            onClick={handleDiscordLink}
            disabled={isLoadingDiscord || !isAuthenticated}
            className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition-all active:scale-95 group disabled:opacity-50"
          >
            {isLoadingDiscord ? (
              <Loader2 size={14} className="text-white animate-spin" />
            ) : (
              <DiscordIcon size={14} className="text-white" />
            )}
            {/* Indicateur de liaison */}
            {!isLoadingDiscord && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                <ArrowUpRight size={10} className="text-[#5865F2]" />
              </div>
            )}
          </button>
        </div>

        {/* Droite : Pourcentage + Paramètres + Thème */}
        <div className="flex items-center gap-2">
          {/* Score de complétude mobile */}
          <div
            onClick={navigateToMilestone}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs cursor-pointer transition-all active:scale-95 ${
              completenessScore >= 80
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                : completenessScore >= 50
                  ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                  : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <TrendingUp size={12} />
            <span>{completenessScore}%</span>
          </div>

          {/* Bouton Paramètres */}
          <button
            onClick={() => setView("settings")}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-theme-bg-tertiary hover:bg-theme-card-hover active:scale-95 transition-all"
          >
            <Settings size={18} className="text-theme-text-secondary" />
          </button>

          {/* Bouton Déconnexion */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-theme-bg-tertiary hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-95 transition-all group"
              title="Déconnexion"
            >
              <LogOut
                size={18}
                className="text-theme-text-secondary group-hover:text-red-500 transition-colors"
              />
            </button>
          )}

          {/* Theme Switcher Mobile */}
          <ThemeSwitcherMobile />
        </div>
      </header>

      {/* FLOATING NOTIFICATION BAR - Top Left */}
      <div className="fixed top-4 left-4 md:left-[calc(16rem+1rem)] z-50 flex items-center gap-2">
        <NotificationBell />
      </div>

      {/* MAIN CONTENT */}
      <main className="md:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto pt-20 md:pt-16 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* FOOTER (Desktop uniquement - caché sur mobile car nav en bas) */}
      <div className="hidden md:block md:ml-64">
        <Footer variant="minimal" />
      </div>

      {/* NAV MOBILE - 4 onglets + FAB central flottant */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-theme-nav-bg/95 backdrop-blur-md border-t border-theme-nav-border z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-colors duration-300">
        {/* Bannière mode B2B mobile */}
        {isB2BContext && !userMode && (
          <div
            className={`px-4 py-2 border-b flex items-center justify-between ${
              hasSchoolOrg
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {hasSchoolOrg ? (
                <GraduationCap
                  size={14}
                  className="text-blue-600 dark:text-blue-400"
                />
              ) : (
                <Building2
                  size={14}
                  className="text-purple-600 dark:text-purple-400"
                />
              )}
              <span
                className={`text-xs font-medium ${
                  hasSchoolOrg
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-purple-700 dark:text-purple-300"
                }`}
              >
                {currentOrgName}
              </span>
            </div>
            <button
              onClick={toggleUserMode}
              className="flex items-center gap-1 px-2 py-1 bg-theme-card rounded-lg text-xs text-theme-text-secondary border border-theme-border"
            >
              <Eye size={12} />
              Mode utilisateur
            </button>
          </div>
        )}

        {/* Bannière mode utilisateur actif mobile */}
        {isB2BContext && userMode && (
          <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 border-b border-orange-200 dark:border-orange-800 flex items-center justify-between">
            <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
              Mode utilisateur actif
            </span>
            <button
              onClick={toggleUserMode}
              className="flex items-center gap-1 px-2 py-1 bg-orange-200 dark:bg-orange-800/50 rounded-lg text-xs text-orange-700 dark:text-orange-300"
            >
              <X size={12} />
              Quitter
            </button>
          </div>
        )}

        {/* FAB Feedback flottant au centre - positionné en absolute */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-50">
          <div className="relative flex flex-col items-center">
            {/* Bulle d'encouragement compacte et centrée */}
            <div className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
              Améliorez l'app ! ✨{/* Flèche pointant vers le bas */}
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rotate-45" />
            </div>

            <button
              onClick={openFeaturebase}
              disabled={isLoadingFeedback}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-300/50 dark:shadow-purple-900/50 border-4 border-theme-card hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-70"
              title="Feedback & Suggestions"
            >
              {isLoadingFeedback ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <MessageSquare size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation mobile - change selon le contexte */}
        {showUserMenus ? (
          /* Navigation utilisateur standard */
          <div className="flex justify-between items-center px-8 py-2 pb-safe">
            {/* Gauche: Accueil */}
            <button
              onClick={() => setView("dashboard")}
              className={`flex flex-col items-center justify-center w-14 h-12 gap-0.5 rounded-xl transition-all ${
                view === "dashboard"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <LayoutDashboard
                size={22}
                strokeWidth={view === "dashboard" ? 2.5 : 2}
              />
              <span className="text-[9px] font-semibold">Accueil</span>
            </button>

            {/* Gauche-centre: Documents */}
            <button
              onClick={() => setView("documents")}
              className={`flex flex-col items-center justify-center w-14 h-12 gap-0.5 rounded-xl transition-all ${
                view === "documents"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <File size={22} strokeWidth={view === "documents" ? 2.5 : 2} />
              <span className="text-[9px] font-semibold">Documents</span>
            </button>

            {/* Espace central pour le FAB */}
            <div className="w-14" />

            {/* Droite-centre: Portfolio */}
            <button
              onClick={() => setView("portfolio")}
              className={`flex flex-col items-center justify-center w-14 h-12 gap-0.5 rounded-xl transition-all ${
                view === "portfolio"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <Briefcase
                size={22}
                strokeWidth={view === "portfolio" ? 2.5 : 2}
              />
              <span className="text-[9px] font-semibold">Portfolio</span>
            </button>

            {/* Droite: Profil */}
            <button
              onClick={() => setView("profile")}
              className={`flex flex-col items-center justify-center w-14 h-12 gap-0.5 rounded-xl transition-all ${
                view === "profile"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <User size={22} strokeWidth={view === "profile" ? 2.5 : 2} />
              <span className="text-[9px] font-semibold">Profil</span>
            </button>
          </div>
        ) : (
          /* Navigation B2B */
          <div className="flex justify-around items-center px-4 py-2 pb-safe">
            {/* Dashboard B2B */}
            <button
              onClick={() =>
                setView(hasSchoolOrg ? "school_dashboard" : "company_dashboard")
              }
              className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 rounded-xl transition-all ${
                view === "school_dashboard" || view === "company_dashboard"
                  ? hasSchoolOrg
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-purple-600 dark:text-purple-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <LayoutDashboard
                size={22}
                strokeWidth={
                  view === "school_dashboard" || view === "company_dashboard"
                    ? 2.5
                    : 2
                }
              />
              <span className="text-[9px] font-semibold">Dashboard</span>
            </button>

            {/* Membres / Étudiants */}
            <button
              onClick={() => setView("invite_members")}
              className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 rounded-xl transition-all ${
                view === "invite_members"
                  ? hasSchoolOrg
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-purple-600 dark:text-purple-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <User
                size={22}
                strokeWidth={view === "invite_members" ? 2.5 : 2}
              />
              <span className="text-[9px] font-semibold">
                {hasSchoolOrg ? "Étudiants" : "Équipe"}
              </span>
            </button>

            {/* Espace central pour le FAB */}
            <div className="w-14" />

            {/* Cohortes (école) ou Offres (entreprise) */}
            {hasSchoolOrg ? (
              <button
                onClick={() => setView("cohorts")}
                className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 rounded-xl transition-all ${
                  view === "cohorts"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-theme-text-muted active:bg-theme-bg-tertiary"
                }`}
              >
                <GraduationCap
                  size={22}
                  strokeWidth={view === "cohorts" ? 2.5 : 2}
                />
                <span className="text-[9px] font-semibold">Cohortes</span>
              </button>
            ) : (
              <button
                onClick={() => setView("jobs")}
                className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 rounded-xl transition-all ${
                  view === "jobs"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-theme-text-muted active:bg-theme-bg-tertiary"
                }`}
              >
                <Briefcase size={22} strokeWidth={view === "jobs" ? 2.5 : 2} />
                <span className="text-[9px] font-semibold">Offres</span>
              </button>
            )}

            {/* Partenariats */}
            <button
              onClick={() => setView("partnerships")}
              className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 rounded-xl transition-all ${
                view === "partnerships"
                  ? hasSchoolOrg
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-purple-600 dark:text-purple-400"
                  : "text-theme-text-muted active:bg-theme-bg-tertiary"
              }`}
            >
              <Building2
                size={22}
                strokeWidth={view === "partnerships" ? 2.5 : 2}
              />
              <span className="text-[9px] font-semibold">Partenaires</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
};
