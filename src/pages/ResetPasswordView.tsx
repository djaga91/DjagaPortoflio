import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { authAPI } from "../services/api";
import { useGameStore } from "../store/gameStore";

export const ResetPasswordView: React.FC = () => {
  const { setView, setShowLoginModal } = useGameStore();

  // Extraire le token depuis l'URL
  const path = window.location.pathname;
  const token = path.startsWith("/reset-password/")
    ? path.replace("/reset-password/", "")
    : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Validation du mot de passe
  const passwordChecks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.hasNumber &&
    passwordChecks.hasLetter;
  const canSubmit = isPasswordValid && passwordChecks.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;

    setError("");
    setLoading(true);

    try {
      await authAPI.resetPassword({
        token,
        new_password: password,
      });
      setSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        "Une erreur est survenue. Le lien est peut-être expiré.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToForgotPassword = () => {
    setView("forgot_password");
    window.history.replaceState({}, "", "/forgot-password");
  };

  const goToLandingAndLogin = () => {
    setView("landing");
    window.history.replaceState({}, "", "/");
    setTimeout(() => setShowLoginModal(true), 100);
  };

  const goToLanding = () => {
    setView("landing");
    window.history.replaceState({}, "", "/");
  };

  // Si pas de token dans l'URL
  if (!token) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-theme-card border border-theme-border rounded-2xl p-8 shadow-theme-xl">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-theme-text-primary mb-2">
              Lien invalide
            </h1>
            <p className="text-theme-text-secondary text-sm mb-6">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>
            <button
              onClick={goToForgotPassword}
              className="inline-flex items-center justify-center gap-2 w-full bg-[#FF8C42] hover:bg-[#E07230] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
            >
              Demander un nouveau lien
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Nouveau mot de passe
            </h1>
            <p className="text-theme-text-secondary text-sm">
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>
          </div>

          {success ? (
            /* État succès */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Mot de passe modifié !
              </h2>
              <p className="text-theme-text-secondary text-sm mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez
                maintenant vous connecter.
              </p>
              <button
                onClick={goToLandingAndLogin}
                className="inline-flex items-center justify-center gap-2 w-full bg-[#FF8C42] hover:bg-[#E07230] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
              >
                Se connecter
              </button>
            </div>
          ) : (
            /* Formulaire */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl pl-11 pr-12 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Indicateurs de force */}
              <div className="space-y-2 text-xs">
                <div
                  className={`flex items-center gap-2 ${passwordChecks.length ? "text-green-600 dark:text-green-400" : "text-theme-text-muted"}`}
                >
                  <CheckCircle
                    size={14}
                    className={
                      passwordChecks.length ? "opacity-100" : "opacity-30"
                    }
                  />
                  <span>Au moins 8 caractères</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.hasLetter ? "text-green-600 dark:text-green-400" : "text-theme-text-muted"}`}
                >
                  <CheckCircle
                    size={14}
                    className={
                      passwordChecks.hasLetter ? "opacity-100" : "opacity-30"
                    }
                  />
                  <span>Contient une lettre</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.hasNumber ? "text-green-600 dark:text-green-400" : "text-theme-text-muted"}`}
                >
                  <CheckCircle
                    size={14}
                    className={
                      passwordChecks.hasNumber ? "opacity-100" : "opacity-30"
                    }
                  />
                  <span>Contient un chiffre</span>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                    size={18}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-theme-bg-secondary border rounded-xl pl-11 pr-12 py-3 text-theme-text-primary focus:ring-1 outline-none transition-all ${
                      confirmPassword.length > 0
                        ? passwordChecks.match
                          ? "border-green-300 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
                          : "border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500"
                        : "border-theme-border focus:border-[#6366F1] focus:ring-[#6366F1]"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text-secondary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordChecks.match && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full bg-[#FF8C42] hover:bg-[#E07230] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Modification...</span>
                  </>
                ) : (
                  <span>Modifier le mot de passe</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
