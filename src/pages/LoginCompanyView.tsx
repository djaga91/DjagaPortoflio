/**
 * LoginCompanyView - Page de connexion pour le personnel d'entreprise
 *
 * Redirige vers le dashboard entreprise après connexion.
 */

import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import type { ViewType } from "../types";
import { api } from "../services/api";

export default function LoginCompanyView() {
  const { setView, setActiveToast } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      // Login classique
      const response = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Mettre à jour le store - connexion réussie
      useGameStore.setState({
        user,
        isAuthenticated: true,
      });

      // Vérifier les organisations de l'utilisateur
      let targetView: ViewType = "dashboard"; // Par défaut, dashboard utilisateur classique
      let toastMessage = "Bienvenue sur PortfoliA !";
      let toastIcon = "🦊";

      try {
        const orgsResponse = await api.get("/api/organizations/me/all");
        const orgs = orgsResponse.data.items || [];

        // Trouver une organisation entreprise
        const companyOrg = orgs.find(
          (org: { type: string; user_role: string }) =>
            org.type === "company" &&
            ["company_admin", "recruiter"].includes(org.user_role),
        );

        // Trouver une organisation école
        const schoolOrg = orgs.find(
          (org: { type: string; user_role: string }) =>
            org.type === "school" &&
            ["admin", "coach", "teacher", "viewer"].includes(org.user_role),
        );

        if (companyOrg) {
          // Priorité à l'espace entreprise (puisqu'on vient du portail entreprise)
          localStorage.setItem("current_org_id", companyOrg.id);
          localStorage.setItem("current_org_type", "company");
          localStorage.setItem("current_org_role", companyOrg.user_role);
          localStorage.setItem("current_org_name", companyOrg.name);
          targetView = "company_dashboard";
          toastMessage = `Bienvenue dans l'espace ${companyOrg.name}`;
          toastIcon = "🏢";
        } else if (schoolOrg) {
          // Sinon, espace école si disponible
          localStorage.setItem("current_org_id", schoolOrg.id);
          localStorage.setItem("current_org_type", "school");
          localStorage.setItem("current_org_role", schoolOrg.user_role);
          localStorage.setItem("current_org_name", schoolOrg.name);
          targetView = "school_dashboard";
          toastMessage = `Bienvenue dans l'espace ${schoolOrg.name}`;
          toastIcon = "🎓";
        }
        // Sinon on garde le dashboard par défaut
      } catch (orgErr) {
        console.warn("Impossible de récupérer les organisations:", orgErr);
        // Continue avec le dashboard par défaut
      }

      setActiveToast({
        type: "success",
        title: "Connexion réussie !",
        message: toastMessage,
        icon: toastIcon,
      });

      // Rediriger vers le dashboard approprié
      setView(targetView);
    } catch (err: any) {
      console.error("Erreur connexion entreprise:", err);
      setError(err.response?.data?.detail || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => setView("landing")}
          className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>

        {/* Card */}
        <div className="bg-theme-card border border-theme-card-border rounded-2xl p-8 shadow-theme-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-theme-text-primary">
              Espace Entreprise
            </h1>
            <p className="text-theme-text-secondary mt-2">
              Connectez-vous à votre espace recruteur
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Email professionnel
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="recruteur@techcorp.io"
                  className="w-full pl-12 pr-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-theme-text-muted text-sm">
              Vous êtes candidat ?{" "}
              <button
                onClick={() => setView("landing")}
                className="text-purple-500 hover:text-purple-400"
              >
                Connectez-vous ici
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="mt-6 text-center text-sm text-theme-text-muted">
          Cette page est réservée aux entreprises partenaires.
          <br />
          (Admin entreprise, Recruteur)
        </p>
      </div>
    </div>
  );
}
