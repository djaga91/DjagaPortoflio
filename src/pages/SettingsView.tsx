/**
 * SettingsView - Page des paramètres utilisateur
 *
 * Gère :
 * - Liaisons de comptes (Discord, GitHub, Google, LinkedIn)
 * - Modification du nom (prénom + nom séparés)
 * - Préférences de compte
 * - Zone de danger (suppression de compte)
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { discordAPI, authAPI, API_URL } from "../services/api";
import { DiscordStatus } from "../types";
import { storageSync } from "../services/storage";
import {
  Settings,
  Link2,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  User,
  Trash2,
  AlertTriangle,
  Mail,
  CheckCircle,
  XCircle,
  Download,
  Shield,
  Bell,
  Eye,
} from "lucide-react";

// Icône Discord (SVG personnalisé)
const DiscordIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// Icône GitHub
const GitHubIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// Icône LinkedIn
const LinkedInIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// Icône Google
const GoogleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const SettingsView = () => {
  const { user, profile, setView, setActiveToast } = useGameStore();
  const frontendParam = "?frontend=game";

  // État Discord
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(
    null,
  );
  const [discordLoading, setDiscordLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  // État modification nom
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // État suppression compte
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Initialiser prénom/nom depuis first_name et last_name
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [user]);

  // Charger le statut Discord au montage
  useEffect(() => {
    const loadDiscordStatus = async () => {
      try {
        const status = await discordAPI.getStatus();
        setDiscordStatus(status);
      } catch (error) {
        console.error("Erreur chargement statut Discord:", error);
      } finally {
        setDiscordLoading(false);
      }
    };

    loadDiscordStatus();

    // Vérifier si on revient d'un callback Discord
    const params = new URLSearchParams(window.location.search);
    if (params.get("discord") === "success") {
      setActiveToast({
        type: "success",
        title: "Discord lié !",
        message: "Votre compte Discord a été lié avec succès",
        icon: "🎉",
      });
      window.history.replaceState({}, "", "/settings");
      loadDiscordStatus();
    }
  }, [setActiveToast]);

  // Sauvegarder le nom
  const handleSaveName = async () => {
    if (!firstName.trim()) {
      setNameError("Le prénom est requis");
      return;
    }

    setIsSavingName(true);
    setNameError("");

    try {
      const response = await authAPI.updateFullName({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
      });
      useGameStore.setState({ user: response.user });
      storageSync.setItem("user", JSON.stringify(response.user));
      setIsEditingName(false);
      setActiveToast({
        type: "success",
        title: "Nom mis à jour",
        message: "Votre nom a été modifié avec succès",
        icon: "✅",
      });
    } catch (err: any) {
      console.error("Erreur mise à jour nom:", err);
      setNameError(
        err.response?.data?.detail || "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  // Lier Discord
  const handleLinkDiscord = async () => {
    try {
      const { url } = await discordAPI.getAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error("Erreur liaison Discord:", error);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible d'initier la liaison Discord",
        icon: "❌",
      });
    }
  };

  // Synchroniser les rôles Discord
  const handleSyncRoles = async () => {
    setSyncLoading(true);
    try {
      const result = await discordAPI.syncRoles();
      if (result.success) {
        setActiveToast({
          type: "success",
          title: "Rôles synchronisés !",
          message: result.message,
          icon: "✅",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Erreur sync Discord:", error);
      setActiveToast({
        type: "error",
        title: "Erreur de synchronisation",
        message:
          error.response?.data?.detail ||
          "Impossible de synchroniser les rôles",
        icon: "❌",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  // Délier Discord
  const handleUnlinkDiscord = async () => {
    if (!confirm("Êtes-vous sûr de vouloir délier votre compte Discord ?")) {
      return;
    }

    setUnlinkLoading(true);
    try {
      await discordAPI.unlink();
      setDiscordStatus({
        linked: false,
        discord_id: null,
        discord_username: null,
        message: "Aucun compte Discord lié",
      });
      setActiveToast({
        type: "success",
        title: "Discord délié",
        message: "Votre compte Discord a été délié",
        icon: "🔓",
      });
    } catch (error: any) {
      console.error("Erreur unlink Discord:", error);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message:
          error.response?.data?.detail || "Impossible de délier le compte",
        icon: "❌",
      });
    } finally {
      setUnlinkLoading(false);
    }
  };

  // Suppression de compte
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "supprimer mon compte") {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await authAPI.deleteAccount();
      storageSync.removeItem("access_token");
      storageSync.removeItem("user");
      window.location.href = "/";
    } catch (err: any) {
      console.error("Erreur suppression compte:", err);
      setDeleteError(
        err.response?.data?.detail ||
          "Une erreur est survenue lors de la suppression du compte",
      );
      setIsDeleting(false);
    }
  };

  // Définition des comptes liés
  const linkedAccounts = [
    {
      id: "github",
      name: "GitHub",
      icon: <GitHubIcon className="w-7 h-7" />,
      color: "#24292e",
      bgColor: "bg-slate-800",
      isConnected: !!profile?.github_url,
      url: profile?.github_url,
      connectUrl: `${API_URL}/api/auth/github/initiate${frontendParam}`,
      description:
        "Importez automatiquement vos repositories et projets publics",
      benefits: [
        "Import de vos projets GitHub",
        "Détection des technologies",
        "Lien vers vos repos",
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <LinkedInIcon className="w-7 h-7" />,
      color: "#0A66C2",
      bgColor: "bg-[#0A66C2]",
      isConnected: !!profile?.linkedin_url,
      url: profile?.linkedin_url,
      connectUrl: `${API_URL}/api/auth/linkedin/initiate${frontendParam}`,
      description: "Récupérez l'URL de votre profil LinkedIn pour votre CV",
      benefits: ["Lien LinkedIn sur votre CV", "Visibilité professionnelle"],
    },
    {
      id: "google",
      name: "Google",
      icon: <GoogleIcon className="w-7 h-7" />,
      color: "#4285F4",
      bgColor: "bg-white",
      isConnected: !!profile?.google_access_token,
      url: null,
      connectUrl: `${API_URL}/api/auth/google/initiate${frontendParam}`,
      description: "Connexion rapide avec votre compte Google",
      benefits: ["Connexion simplifiée", "Pas de mot de passe à retenir"],
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <div className="bg-theme-card border-b border-theme-card-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("dashboard")}
              className="p-2 rounded-xl bg-theme-bg-secondary hover:bg-theme-bg-primary border border-theme-border transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-text-primary">
                  Paramètres
                </h1>
                <p className="text-sm text-theme-text-secondary">
                  Gérez votre compte et vos préférences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Section : Profil */}
        <section>
          <h2 className="text-lg font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Profil
          </h2>

          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-6">
            {/* Email & Vérification */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border-2 mb-4 transition-all bg-theme-bg-secondary border-theme-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-theme-text-primary truncate text-sm sm:text-base">
                      {user?.email}
                    </span>
                    {user?.email_verified ? (
                      <CheckCircle
                        size={16}
                        className="text-green-500 flex-shrink-0"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="text-amber-500 flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-xs text-theme-text-muted">
                    {user?.email_verified
                      ? "Email vérifié"
                      : "Email non vérifié"}
                  </p>
                </div>
              </div>
              {!user?.email_verified && (
                <button
                  onClick={() => setView("verify_email")}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-lg transition-colors flex-shrink-0 w-full sm:w-auto text-center"
                >
                  Vérifier
                </button>
              )}
            </div>

            {/* Nom modifiable */}
            <div className="border-t border-theme-border pt-4">
              <label className="block text-sm font-medium text-theme-text-secondary mb-3">
                Nom complet
              </label>

              {isEditingName ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-theme-text-muted mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setNameError("");
                        }}
                        className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Jean"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-text-muted mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setNameError("");
                        }}
                        className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-500">{nameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isSavingName ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        // Reset
                        if (user) {
                          setFirstName(user.first_name || "");
                          setLastName(user.last_name || "");
                        }
                        setNameError("");
                      }}
                      className="px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-primary border border-theme-border text-theme-text-primary font-medium rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-theme-text-primary font-medium">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.first_name ||
                          user?.full_name ||
                          "Non renseigné"}
                    </p>
                    <p className="text-xs text-theme-text-muted">
                      @{user?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              )}
            </div>

            {/* Plan */}
            <div className="border-t border-theme-border pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                    Plan
                  </label>
                  <p className="text-theme-text-primary font-medium capitalize flex items-center gap-2">
                    <Shield size={16} className="text-indigo-500" />
                    {user?.tier || "Free"}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  Gratuit
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section : Liaisons de comptes */}
        <section>
          <h2 className="text-lg font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-500" />
            Comptes liés
          </h2>

          <div className="space-y-4">
            {/* Carte Discord */}
            <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#5865F2] flex items-center justify-center flex-shrink-0">
                    <DiscordIcon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-theme-text-primary">
                        Discord
                      </h3>
                      {discordLoading ? (
                        <Loader2 className="w-4 h-4 text-theme-text-muted animate-spin" />
                      ) : discordStatus?.linked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Lié
                        </span>
                      ) : null}
                    </div>

                    {discordLoading ? (
                      <p className="text-sm text-theme-text-muted">
                        Chargement...
                      </p>
                    ) : discordStatus?.linked ? (
                      <p className="text-sm text-theme-text-secondary">
                        Connecté en tant que{" "}
                        <span className="font-medium text-[#5865F2]">
                          {discordStatus.discord_username}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-theme-text-muted">
                        Synchronisez vos rôles Discord avec votre progression
                        PortfoliA
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        "Rôles automatiques",
                        "Badges → Rôles",
                        "XP → Grades",
                      ].map((benefit) => (
                        <span
                          key={benefit}
                          className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Discord */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {discordLoading ? null : discordStatus?.linked ? (
                    <>
                      <button
                        onClick={handleSyncRoles}
                        disabled={syncLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {syncLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Synchroniser
                      </button>
                      <a
                        href="https://discord.gg/aNThMsyAhZ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-bg-secondary hover:bg-theme-bg-primary border border-theme-border text-theme-text-primary font-medium text-sm transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Serveur
                      </a>
                      <button
                        onClick={handleUnlinkDiscord}
                        disabled={unlinkLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {unlinkLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        Délier
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleLinkDiscord}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30"
                    >
                      <DiscordIcon className="w-4 h-4" />
                      Lier Discord
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Autres comptes (GitHub, LinkedIn, Google) */}
            {linkedAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        account.id === "google"
                          ? "bg-white border border-gray-200"
                          : account.bgColor
                      }`}
                      style={
                        account.id !== "google"
                          ? { backgroundColor: account.color }
                          : undefined
                      }
                    >
                      {account.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-theme-text-primary">
                          {account.name}
                        </h3>
                        {account.isConnected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                            <Check className="w-3 h-3" />
                            Lié
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-theme-text-muted mb-2">
                        {account.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {account.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="text-xs px-2 py-0.5 bg-theme-bg-secondary text-theme-text-secondary rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {account.isConnected ? (
                      <>
                        {account.url && (
                          <a
                            href={account.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium text-sm transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Voir profil
                          </a>
                        )}
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Connecté
                        </span>
                      </>
                    ) : (
                      <a
                        href={account.connectUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium text-sm transition-colors shadow-lg"
                        style={{ backgroundColor: account.color }}
                      >
                        {account.icon}
                        Connecter {account.name}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section : Préférences (placeholder pour le futur) */}
        <section>
          <h2 className="text-lg font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Préférences
          </h2>

          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-6 opacity-60">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-theme-text-muted" />
                  <span className="text-sm text-theme-text-primary">
                    Notifications email
                  </span>
                </div>
                <span className="text-xs text-theme-text-muted">Bientôt</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye size={20} className="text-theme-text-muted" />
                  <span className="text-sm text-theme-text-primary">
                    Profil public
                  </span>
                </div>
                <span className="text-xs text-theme-text-muted">Bientôt</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-theme-text-muted" />
                  <span className="text-sm text-theme-text-primary">
                    Exporter mes données
                  </span>
                </div>
                <span className="text-xs text-theme-text-muted">Bientôt</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section : Zone de Danger */}
        <section>
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zone de Danger
          </h2>

          <div className="bg-theme-card rounded-2xl border-2 border-red-200 dark:border-red-800 shadow-theme-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-semibold text-theme-text-primary">
                  Supprimer mon compte
                </h4>
                <p className="text-sm text-theme-text-secondary">
                  Cette action supprimera définitivement toutes vos données
                  (profil, CV, expériences, XP...).
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-500 text-red-500 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </div>
        </section>

        {/* Informations compte */}
        <section className="pb-8">
          <p className="text-center text-xs text-theme-text-muted">
            Membre depuis{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
        </section>
      </div>

      {/* Modale suppression compte */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-theme-card rounded-2xl shadow-theme-xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary">
                  Êtes-vous absolument sûr ?
                </h2>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Cette action est irréversible.</strong> Toutes vos
                données (Profil, XP, CVs, expériences, compétences) seront
                effacées définitivement.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Écrivez{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  "supprimer mon compte"
                </span>{" "}
                pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                placeholder="supprimer mon compte"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="flex-1 py-3 bg-theme-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-text-primary font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmText.toLowerCase() !== "supprimer mon compte" ||
                  isDeleting
                }
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
