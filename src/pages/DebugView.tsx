import React, { useState, useEffect } from "react";
import {
  Bug,
  UserPlus,
  Trash2,
  FileText,
  User,
  Loader,
  Shield,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { CVImportView } from "./CVImportView";
import { ProfileEditorView } from "./ProfileEditorView";
import { api, API_URL } from "../services/api";

type DebugStep = "create" | "import" | "profile" | "done";

export const DebugView: React.FC = () => {
  const {
    user,
    isAuthenticated,
    refreshUser,
    setView,
    fetchProfile,
    fetchExperiences,
    fetchEducations,
    fetchProjects,
    fetchSkills,
    fetchLanguages,
    fetchCertifications,
  } = useGameStore();

  const [step, setStep] = useState<DebugStep>("create");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugUserId, setDebugUserId] = useState<string | null>(() => {
    // Charger depuis localStorage au montage
    return localStorage.getItem("debug_user_id");
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    // Charger depuis localStorage au montage
    return localStorage.getItem("debug_admin_token");
  });

  // Vérifier si l'utilisateur actuel est le user temporaire
  const isDebugUser = Boolean(debugUserId && user?.id === debugUserId);

  // NE PAS passer automatiquement à 'import' si on est admin
  // L'admin doit d'abord créer un user temporaire via handleCreateUser()
  // Cet useEffect est désactivé pour le flow de debug
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     if (step === 'create') {
  //       setStep('import');
  //     }
  //   }
  // }, [isAuthenticated, user, step]);

  // Recharger les données quand on passe à l'étape 'profile' pour s'assurer qu'on a les bonnes données
  useEffect(() => {
    if (step === "profile" && isAuthenticated && user) {
      Promise.all([
        fetchProfile(),
        fetchExperiences(),
        fetchEducations(),
        fetchProjects(),
        fetchSkills(),
        fetchLanguages(),
        fetchCertifications(),
      ]).catch(console.error);
    }
  }, [
    step,
    isAuthenticated,
    user,
    debugUserId,
    isDebugUser,
    fetchProfile,
    fetchExperiences,
    fetchEducations,
    fetchProjects,
    fetchSkills,
    fetchLanguages,
    fetchCertifications,
  ]);

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);

      // 1. Sauvegarder le token admin AVANT de créer le user temporaire
      const adminTokenToSave = localStorage.getItem("access_token");
      const adminUserToSave = localStorage.getItem("user");
      if (adminTokenToSave) {
        setAdminToken(adminTokenToSave);
        localStorage.setItem("debug_admin_token", adminTokenToSave);
        if (adminUserToSave) {
          localStorage.setItem("debug_admin_user", adminUserToSave);
        }
      }

      // 2. Créer le user temporaire via l'API register
      // Générer un email, username et password vraiment uniques
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const uniqueEmail = `debug${uniqueId}@test.com`;
      const uniqueUsername = `dbg${Date.now()}`;
      // Générer un password aléatoire sécurisé (pas de password fixe en production)
      const randomPassword = `Dbg${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 4).toUpperCase()}!@#`;

      const registerData = {
        email: uniqueEmail,
        password: randomPassword,
        full_name: "Debug User",
        username: uniqueUsername,
      };

      // Utiliser axios directement SANS l'intercepteur qui ajoute le token admin
      const axios = (await import("axios")).default;

      let response;
      try {
        const axiosResponse = await axios.post(
          `${API_URL}/api/auth/register`,
          registerData,
          {
            headers: { "Content-Type": "application/json" },
          },
        );
        response = axiosResponse.data;
      } catch (registerError: any) {
        console.error("❌ [DEBUG] Détail erreur register:", {
          status: registerError.response?.status,
          statusText: registerError.response?.statusText,
          data: registerError.response?.data,
          message: registerError.message,
        });
        throw new Error(
          registerError.response?.data?.detail ||
            JSON.stringify(registerError.response?.data) ||
            registerError.message,
        );
      }

      // 3. Stocker l'ID du user temporaire
      setDebugUserId(response.user.id);
      localStorage.setItem("debug_user_id", response.user.id);
      localStorage.setItem("debug_user_email", response.user.email);

      // 4. Mettre à jour localStorage avec le token du user temporaire
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // 5. Vérifier que le token est bien celui du user temporaire
      const verifiedToken = localStorage.getItem("access_token");
      if (verifiedToken !== response.access_token) {
        throw new Error(
          "Le token n'a pas été correctement mis à jour dans localStorage",
        );
      }

      // 6. Mettre à jour le store avec le user temporaire (SANS appeler initialize qui réécrit tout)
      useGameStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        showLoginModal: false,
        // Réinitialiser les données du profil pour le nouveau user
        profile: null,
        experiences: [],
        educations: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
      });

      // 7. Charger les données du profil du user temporaire (qui seront vides car c'est un nouveau user)
      const {
        fetchProfile,
        fetchExperiences,
        fetchEducations,
        fetchProjects,
        fetchSkills,
        fetchLanguages,
        fetchCertifications,
      } = useGameStore.getState();
      await Promise.all([
        fetchProfile(),
        fetchExperiences(),
        fetchEducations(),
        fetchProjects(),
        fetchSkills(),
        fetchLanguages(),
        fetchCertifications(),
      ]);

      // 8. Vérification finale
      const finalUser = useGameStore.getState().user;
      const finalToken = localStorage.getItem("access_token");
      const isUserMatch = finalUser?.id === response.user.id;
      const isTokenMatch = finalToken === response.access_token;

      if (!isUserMatch || !isTokenMatch) {
        throw new Error(
          "Erreur de synchronisation: le user temporaire n'a pas été correctement configuré",
        );
      }

      setStep("import");
    } catch (error: any) {
      // Afficher le détail de l'erreur du backend
      const errorDetail =
        error.response?.data?.detail ||
        error.message ||
        "Impossible de créer le user temporaire";
      console.error("❌ [DEBUG] Erreur création user temporaire:", {
        message: error.message,
        status: error.response?.status,
        detail: error.response?.data?.detail,
        data: error.response?.data,
      });
      alert(`Erreur: ${errorDetail}`);

      // En cas d'erreur, restaurer le token admin
      const savedAdminToken = localStorage.getItem("debug_admin_token");
      const savedAdminUser = localStorage.getItem("debug_admin_user");
      if (savedAdminToken) {
        localStorage.setItem("access_token", savedAdminToken);
        if (savedAdminUser) {
          localStorage.setItem("user", savedAdminUser);
          useGameStore.setState({ user: JSON.parse(savedAdminUser) });
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    const userIdToDelete = debugUserId || localStorage.getItem("debug_user_id");
    const userEmailToDelete =
      localStorage.getItem("debug_user_email") || "user temporaire";

    if (!userIdToDelete) {
      console.error("❌ [DEBUG] Aucun user temporaire à supprimer");
      alert("Aucun user temporaire trouvé. Créez d'abord un user temporaire.");
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur de debug (${userEmailToDelete}) ?`,
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // 1. Restaurer le token admin pour pouvoir supprimer le user temporaire
      const savedAdminToken =
        adminToken || localStorage.getItem("debug_admin_token");
      const savedAdminUser = localStorage.getItem("debug_admin_user");

      if (savedAdminToken) {
        localStorage.setItem("access_token", savedAdminToken);
        if (savedAdminUser) {
          localStorage.setItem("user", savedAdminUser);
          useGameStore.setState({ user: JSON.parse(savedAdminUser) });
        }
        // Rafraîchir le user depuis l'API pour s'assurer qu'on a le bon
        await refreshUser();
      } else {
        throw new Error(
          "Token admin non trouvé. Impossible de supprimer le user temporaire.",
        );
      }

      // 2. Supprimer le user temporaire par ID (endpoint admin)
      await api.delete(`/api/users/${userIdToDelete}`);

      // 3. Nettoyer localStorage
      setDebugUserId(null);
      setAdminToken(null);
      localStorage.removeItem("debug_user_id");
      localStorage.removeItem("debug_user_email");
      localStorage.removeItem("debug_admin_token");
      localStorage.removeItem("debug_admin_user");

      // 4. Réinitialiser l'état pour un nouveau test
      setStep("create");

      // 5. Recharger les données de l'admin
      await Promise.all([
        fetchProfile(),
        fetchExperiences(),
        fetchEducations(),
        fetchProjects(),
        fetchSkills(),
        fetchLanguages(),
        fetchCertifications(),
      ]);

      alert(
        "User temporaire supprimé avec succès. Vous êtes reconnecté en tant qu'admin.",
      );
    } catch (error: any) {
      console.error("❌ [DEBUG] Erreur suppression user debug:", error);
      alert(
        `Erreur lors de la suppression: ${error.response?.data?.detail || error.message}`,
      );

      // En cas d'erreur, essayer de restaurer le token admin
      const savedAdminToken =
        adminToken || localStorage.getItem("debug_admin_token");
      const savedAdminUser = localStorage.getItem("debug_admin_user");
      if (savedAdminToken) {
        localStorage.setItem("access_token", savedAdminToken);
        if (savedAdminUser) {
          localStorage.setItem("user", savedAdminUser);
          useGameStore.setState({ user: JSON.parse(savedAdminUser) });
        }
        await refreshUser();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCVImported = () => {
    setStep("profile");
    // Recharger les données après import
    Promise.all([
      fetchProfile(),
      fetchExperiences(),
      fetchEducations(),
      fetchProjects(),
      fetchSkills(),
      fetchLanguages(),
      fetchCertifications(),
    ]).catch(console.error);
  };

  // Rafraîchir le user au montage si connecté (pour détecter les changements de statut admin)
  useEffect(() => {
    if (isAuthenticated && !isRefreshing) {
      setIsRefreshing(true);
      refreshUser()
        .catch(console.error)
        .finally(() => setIsRefreshing(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Seulement au montage ou changement d'auth

  // Vérifier si l'utilisateur est admin (vérification robuste)
  const isAdmin = Boolean(user?.is_superuser) === true;

  // Vérifier si on a accès à la page Debug :
  // - Soit on est admin
  // - Soit on est le user temporaire créé par un admin (debugUserId existe et on a un admin token sauvegardé)
  const hasDebugAccess =
    isAdmin || (isDebugUser && localStorage.getItem("debug_admin_token"));

  // Si l'utilisateur n'a pas accès, afficher un message d'erreur
  if (isAuthenticated && !hasDebugAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Accès refusé
          </h2>
          <p className="text-slate-600 mb-6">
            Cette page est réservée aux administrateurs uniquement.
          </p>
          <button
            onClick={() => setView("dashboard")}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Bandeau de sécurité - DEV ONLY */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm">
            <span className="font-semibold text-amber-800">
              ⚠️ Page de développement uniquement
            </span>
            <span className="text-amber-700 ml-2">
              Cette page permet de tester l'import CV avec des comptes
              temporaires. Ne pas utiliser en production.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Debug */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bug className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Mode Debug
                  </h1>
                  {/* Toujours afficher le badge pour debug, même si isAdmin est false */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      isAdmin
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>{isAdmin ? "Admin" : "Non-Admin"}</span>
                  </div>
                  {/* Debug: Afficher la valeur brute */}
                  <div className="text-xs text-slate-400">
                    (is_superuser: {String(user?.is_superuser)})
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Page de test pour l'import CV et le profil
                </p>
              </div>
            </div>

            {isAuthenticated && user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {isDebugUser ? (
                      <span className="text-orange-600">
                        🔧 {user.email} (User Temporaire)
                      </span>
                    ) : (
                      <span>
                        {user.email}{" "}
                        {isAdmin && (
                          <span className="text-purple-600">(Admin)</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    User ID: {user.id.slice(0, 8)}... | Admin:{" "}
                    {isAdmin ? "✅" : "❌"} | is_superuser:{" "}
                    {String(user.is_superuser)}
                    {isDebugUser && " | ⚠️ User temporaire"}
                    {debugUserId &&
                      ` | Debug ID: ${debugUserId.slice(0, 8)}...`}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      await refreshUser();
                    } catch (error) {
                      console.error("❌ [DEBUG] Erreur refresh manuel:", error);
                    } finally {
                      setIsRefreshing(false);
                    }
                  }}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Rafraîchir le statut admin"
                >
                  {isRefreshing ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Loader className="w-4 h-4" />
                  )}
                  <span>Refresh</span>
                </button>
                {/* Afficher le bouton de suppression seulement si on est connecté avec le user temporaire OU si on est admin et qu'un debugUserId existe */}
                {(isDebugUser || (isAdmin && debugUserId)) && (
                  <button
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      isDebugUser
                        ? "Supprimer ce user temporaire"
                        : "Supprimer le user temporaire créé"
                    }
                  >
                    {isDeleting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Suppression...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer User Temporaire</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Steps Indicator */}
          <div className="mt-6 flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${step === "create" ? "text-orange-600" : step === "import" || step === "profile" ? "text-green-600" : "text-slate-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "create" ? "bg-orange-100" : step === "import" || step === "profile" ? "bg-green-100" : "bg-slate-100"}`}
              >
                {step === "create" ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium">Créer User</span>
            </div>
            <div
              className={`flex-1 h-1 ${step === "import" || step === "profile" ? "bg-green-200" : "bg-slate-200"}`}
            />
            <div
              className={`flex items-center gap-2 ${step === "import" ? "text-orange-600" : step === "profile" ? "text-green-600" : "text-slate-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "import" ? "bg-orange-100" : step === "profile" ? "bg-green-100" : "bg-slate-100"}`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Importer CV</span>
            </div>
            <div
              className={`flex-1 h-1 ${step === "profile" ? "bg-green-200" : "bg-slate-200"}`}
            />
            <div
              className={`flex items-center gap-2 ${step === "profile" ? "text-orange-600" : "text-slate-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "profile" ? "bg-orange-100" : "bg-slate-100"}`}
              >
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Voir Profil</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === "create" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Créer un utilisateur temporaire
              </h2>
              <p className="text-slate-600 mb-6">
                Un utilisateur de test sera créé pour tester l'import CV et
                l'affichage du profil.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
                <div className="text-sm text-slate-600 mb-2">
                  Credentials du user temporaire :
                </div>
                <div className="font-mono text-sm text-slate-900 break-all">
                  Email : debug[timestamp]@test.com
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Email, username et mot de passe générés automatiquement de
                  façon sécurisée
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  🔒 Le compte sera supprimé à la fin du test
                </div>
              </div>
              <button
                onClick={handleCreateUser}
                disabled={isCreating}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Créer l'utilisateur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "import" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Étape 2 : Importer un CV
              </h2>
              <button
                onClick={() => setStep("profile")}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Passer cette étape →
              </button>
            </div>
            {/* Vérifier que le user temporaire est bien connecté */}
            {isDebugUser ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  ✅ Connecté avec le user temporaire :{" "}
                  <strong>{user?.email}</strong>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Le CV sera importé dans ce compte temporaire
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">
                  ⚠️ Attention : Vous n'êtes pas connecté avec le user
                  temporaire !
                </div>
                <div className="text-xs text-red-600 mt-1">
                  User actuel : <strong>{user?.email}</strong> | Debug User ID
                  attendu : {debugUserId?.slice(0, 8)}...
                </div>
                <div className="text-xs text-red-600 mt-1">
                  Le CV sera importé dans le compte actuel, pas dans le user
                  temporaire.
                </div>
              </div>
            )}
            <CVImportView onImported={handleCVImported} />
          </div>
        )}

        {step === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Étape 3 : Profil de l'utilisateur
              </h2>
              <button
                onClick={() => setStep("import")}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← Retour à l'import
              </button>
            </div>
            <ProfileEditorView />
          </div>
        )}
      </div>
    </div>
  );
};
