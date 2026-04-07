/**
 * VerifyEmailView - Page de vérification d'email
 *
 * Deux modes d'utilisation :
 * 1. Via lien magique : URL contient ?token=xxx → validation automatique
 * 2. Via code OTP : Formulaire de saisie du code 6 chiffres
 *
 * Design professionnel avec style cohérent LoginView.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Home,
} from "lucide-react";
import { authAPI } from "../services/api";
import { useGameStore } from "../store/gameStore";

type VerificationState = "loading" | "input" | "success" | "error";

export const VerifyEmailView: React.FC = () => {
  const { user, setView } = useGameStore();

  // États
  const [state, setState] = useState<VerificationState>("loading");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Pour le formulaire de code OTP
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs pour les inputs OTP
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer pour le renvoi
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Vérification automatique si token dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Mode lien magique
      verifyByToken(token);
    } else {
      // Mode saisie de code
      setState("input");
    }
  }, []);

  /**
   * Vérification via le lien magique (token)
   */
  const verifyByToken = async (token: string) => {
    setState("loading");
    setMessage("Validation de votre adresse email en cours...");

    try {
      const response = await authAPI.verifyEmailByToken(token);

      if (response.verified) {
        setState("success");
        setMessage(response.message);

        // Mettre à jour l'utilisateur dans le store si connecté
        if (response.user && user) {
          useGameStore.setState({ user: { ...user, email_verified: true } });
        }

        // Nettoyer l'URL
        window.history.replaceState({}, "", "/");

        // Redirection automatique après 3 secondes
        setTimeout(() => {
          setView("dashboard");
        }, 3000);
      } else {
        setState("error");
        setError(response.message || "La vérification a échoué");
      }
    } catch (err: any) {
      setState("error");
      const errorMessage =
        err.response?.data?.detail ||
        "Le lien de vérification est invalide ou expiré";
      setError(errorMessage);
    }
  };

  /**
   * Vérification via le code OTP
   */
  const verifyByCode = async () => {
    if (!user?.email) {
      setError("Veuillez vous connecter pour vérifier votre email");
      return;
    }

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Veuillez saisir les 6 chiffres du code");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await authAPI.verifyEmailByCode({
        email: user.email,
        code: fullCode,
      });

      if (response.verified) {
        setState("success");
        setMessage(response.message);

        // Mettre à jour l'utilisateur dans le store
        if (response.user && user) {
          useGameStore.setState({ user: { ...user, email_verified: true } });
        }

        // Nettoyer l'URL
        window.history.replaceState({}, "", "/");

        // Redirection automatique après 3 secondes
        setTimeout(() => {
          setView("dashboard");
        }, 3000);
      } else {
        setError(response.message || "Code invalide");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "Code invalide ou expiré";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renvoyer le code de vérification
   */
  const handleResend = async () => {
    if (!user?.email || resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const response = await authAPI.resendVerification({ email: user.email });
      setMessage(response.message);
      setResendCooldown(60); // 60 secondes de cooldown
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "Erreur lors du renvoi du code";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Gestion des inputs OTP
   */
  const handleCodeChange = (index: number, value: string) => {
    // Accepter uniquement les chiffres
    const digit = value.replace(/\D/g, "").slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus sur l'input suivant
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace : effacer et revenir en arrière
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Enter : soumettre si complet
    if (e.key === "Enter" && code.join("").length === 6) {
      verifyByCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData) {
      const newCode = [...code];
      pastedData.split("").forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);

      // Focus sur le dernier champ rempli ou le suivant
      const lastFilledIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  // Rendu conditionnel selon l'état
  const renderContent = () => {
    switch (state) {
      case "loading":
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#6366F1] animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-theme-text-primary mb-2">
              Vérification en cours...
            </h2>
            <p className="text-theme-text-secondary">
              {message || "Veuillez patienter"}
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-theme-text-primary mb-2">
              Email vérifié !
            </h2>
            <p className="text-theme-text-secondary mb-6">{message}</p>
            <p className="text-sm text-theme-text-muted mb-6">
              Redirection automatique dans quelques secondes...
            </p>
            <button
              onClick={() => setView("dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6366F1] hover:bg-[#5558E3] text-white font-semibold rounded-xl transition-colors"
            >
              Accéder au tableau de bord
              <ArrowRight size={18} />
            </button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-theme-text-primary mb-2">
              Vérification échouée
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setState("input")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6366F1] hover:bg-[#5558E3] text-white font-semibold rounded-xl transition-colors"
              >
                Saisir le code manuellement
              </button>
              <button
                onClick={() => setView("landing")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-text-primary font-semibold rounded-xl transition-colors"
              >
                <Home size={18} />
                Retour à l'accueil
              </button>
            </div>
          </div>
        );

      case "input":
      default:
        return (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#6366F1]" />
              </div>
              <h2 className="text-xl font-bold text-theme-text-primary mb-2">
                Vérification de votre email
              </h2>
              <p className="text-theme-text-secondary text-sm">
                {user?.email ? (
                  <>
                    Un code à 6 chiffres a été envoyé à{" "}
                    <span className="font-medium text-theme-text-primary">
                      {user.email}
                    </span>
                  </>
                ) : (
                  "Connectez-vous pour vérifier votre email"
                )}
              </p>
            </div>

            {/* Message de succès après renvoi */}
            {message && !error && (
              <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm text-center">
                {message}
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Input OTP */}
            <div
              className="flex justify-center gap-2 sm:gap-3 mb-6"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-theme-bg-secondary border-2 border-theme-border rounded-xl focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all text-theme-text-primary"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            {/* Bouton de validation */}
            <button
              onClick={verifyByCode}
              disabled={isSubmitting || code.join("").length !== 6}
              className="w-full py-3 bg-[#6366F1] hover:bg-[#5558E3] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  Valider le code
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Lien de renvoi */}
            <div className="mt-6 text-center">
              <button
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0 || !user?.email}
                className="text-sm text-[#6366F1] hover:text-[#5558E3] font-medium disabled:text-theme-text-muted disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {isResending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Envoi...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw size={14} />
                    Renvoyer dans {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Renvoyer le code
                  </>
                )}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 transform -rotate-3 overflow-hidden">
            <img
              src="/logo.svg"
              alt="Portfolia"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-theme-card border border-theme-border rounded-2xl p-6 sm:p-8 shadow-theme-xl">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-theme-text-muted text-xs">
            © 2025 PortfoliA. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};
