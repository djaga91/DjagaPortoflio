import React, { useState } from "react";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { authAPI } from "../services/api";
import { useGameStore } from "../store/gameStore";

export const ForgotPasswordView: React.FC = () => {
  const { setView, setShowLoginModal } = useGameStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      // On affiche toujours un message de succès pour éviter l'énumération d'emails
      // Le backend devrait aussi retourner 200 même si l'email n'existe pas
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const goToLanding = () => {
    setView("landing");
    window.history.replaceState({}, "", "/");
  };

  const openLogin = () => {
    setView("landing");
    window.history.replaceState({}, "", "/");
    setTimeout(() => setShowLoginModal(true), 100);
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Retour */}
        <button
          onClick={goToLanding}
          className="inline-flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Retour à l'accueil</span>
        </button>

        <div className="bg-theme-card border border-theme-border rounded-2xl p-6 sm:p-8 shadow-theme-xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 transform -rotate-3 overflow-hidden">
              <img
                src="/logo.svg"
                alt="PortfoliA"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-theme-text-primary mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-theme-text-secondary text-sm">
              Pas de panique, on vous envoie un lien de réinitialisation.
            </p>
          </div>

          {success ? (
            /* État succès */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Email envoyé !
              </h2>
              <p className="text-theme-text-secondary text-sm mb-6">
                Si un compte existe avec l'adresse{" "}
                <strong className="text-theme-text-primary">{email}</strong>,
                vous recevrez un lien de réinitialisation dans quelques
                instants.
              </p>
              <p className="text-theme-text-muted text-xs mb-6">
                Pensez à vérifier vos spams si vous ne recevez rien.
              </p>
              <button
                onClick={goToLanding}
                className="inline-flex items-center justify-center gap-2 w-full bg-[#FF8C42] hover:bg-[#E07230] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
              >
                Retour à l'accueil
              </button>
            </div>
          ) : (
            /* Formulaire */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl pl-11 pr-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF8C42] hover:bg-[#E07230] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <span>Envoyer le lien</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  onClick={openLogin}
                  className="text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                >
                  Vous vous souvenez ?{" "}
                  <span className="text-[#6366F1] font-medium">
                    Se connecter
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
