import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { OAuthButtons } from "../components/OAuthButtons";
import { validateEmail } from "../utils/validation";

export const LoginView: React.FC = () => {
  const {
    login,
    register,
    showLoginModal,
    setShowLoginModal,
    isLoading,
    setView,
  } = useGameStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLoginModal]);

  // Calculate scale to fit viewport height
  useEffect(() => {
    if (!showLoginModal || !modalRef.current) return;

    const calculateScale = () => {
      const modal = modalRef.current;
      if (!modal) return;

      const viewportHeight = window.innerHeight;
      const padding = 16; // Padding top and bottom (8px each)
      const availableHeight = viewportHeight - padding;

      // Get natural height of modal content (including all children)
      const modalRect = modal.getBoundingClientRect();
      const naturalHeight = modal.scrollHeight || modalRect.height;

      // Calculate scale needed to fit
      const calculatedScale = Math.min(1, availableHeight / naturalHeight);

      // Apply scale with minimum of 0.65 to prevent too small (still readable)
      setScale(Math.max(0.65, Math.min(1, calculatedScale)));
    };

    // Calculate immediately
    calculateScale();

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    resizeObserver.observe(modalRef.current);

    // Recalculate on window resize
    window.addEventListener("resize", calculateScale);

    // Recalculate after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(calculateScale, 50);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateScale);
      clearTimeout(timeoutId);
    };
  }, [showLoginModal, isRegister, error]);

  // Si le modal n'est pas demandé, ne rien afficher
  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation côté client pour l'inscription
    if (isRegister) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setError(emailValidation.message || "Email invalide");
        setLoading(false);
        return;
      }

      // Validation : au moins le prénom doit être rempli
      if (!firstName.trim()) {
        setError("Le prénom est requis");
        setLoading(false);
        return;
      }

      if (!termsAccepted) {
        setError("Vous devez accepter les Conditions Générales d'Utilisation");
        setLoading(false);
        return;
      }
    }

    try {
      if (isRegister) {
        // Récupérer la source d'acquisition depuis localStorage (définie par App.tsx)
        const acquisitionSource =
          localStorage.getItem("acquisition_source") || undefined;

        // Inscription via le store (gère tout : API, token, chargement données)
        await register({
          email,
          password,
          username,
          first_name: firstName.trim(),
          last_name: lastName.trim() || undefined,
          terms_accepted: termsAccepted,
          acquisition_source: acquisitionSource,
        });

        // Nettoyer la source d'acquisition après inscription réussie
        localStorage.removeItem("acquisition_source");
      } else {
        // Connexion via le store (gère tout : API, token, chargement données)
        await login({
          email,
          password,
        });
      }

      // Le store gère déjà la fermeture du modal et le chargement des données
      // Pas besoin de faire quoi que ce soit ici
    } catch (err: any) {
      console.error("Erreur login/register:", err);

      // Parser l'erreur backend
      const status = err.response?.status;
      const isServerError = status === 500 || status === 503;
      let errorMessage = isServerError
        ? "Service temporairement indisponible. Réessayez dans quelques instants."
        : "Erreur de connexion. Vérifiez vos identifiants.";

      if (!isServerError && err.response?.data?.detail) {
        const detail = err.response.data.detail;

        // Si c'est un array (erreurs de validation Pydantic)
        if (Array.isArray(detail)) {
          // Transformer les erreurs techniques en messages clairs
          const friendlyMessages = detail.map((e: any) => {
            const field = e.loc?.[1]; // Nom du champ (ex: "username", "email")
            const type = e.type; // Type d'erreur (ex: "string_pattern_mismatch")

            // Messages personnalisés selon le champ et le type d'erreur
            if (field === "username" && type === "string_pattern_mismatch") {
              return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets (-) et underscores (_). Pas d'espaces.";
            }
            if (field === "email" && type === "value_error") {
              return "Adresse email invalide.";
            }
            if (field === "password" && type === "string_too_short") {
              return "Le mot de passe doit contenir au moins 8 caractères.";
            }

            // Message par défaut
            return e.msg || e;
          });
          errorMessage = friendlyMessages.join(" ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        ref={modalRef}
        className="w-full max-w-md relative z-10"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.15s ease-out",
          willChange: "transform",
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-theme-card hover:bg-theme-card-hover rounded-full flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary transition-colors z-20 shadow-lg border border-theme-border"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
        <div className="bg-theme-card border border-theme-border rounded-xl sm:rounded-2xl md:rounded-[2rem] p-3 sm:p-5 md:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-3 sm:mb-5 md:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg shadow-orange-200 dark:shadow-orange-900/50 transform -rotate-3 overflow-hidden">
              <img
                src="/logo.svg"
                alt="Portfolia"
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 object-contain"
              />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-theme-text-primary mb-1 sm:mb-1.5 md:mb-2">
              {isRegister ? "Créer un compte" : "Connexion"}
            </h1>
            <p className="text-theme-text-tertiary text-[11px] sm:text-xs md:text-sm">
              {isRegister
                ? "Rejoignez Portfolia et boostez votre carrière"
                : "Accédez à votre profil professionnel"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-2 sm:mb-3 md:mb-6 p-2 sm:p-2.5 md:p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 text-red-600 dark:text-red-400 text-[11px] sm:text-xs md:text-sm">
              <AlertCircle
                size={14}
                className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-2.5 sm:space-y-3 md:space-y-4"
          >
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-theme-text-secondary mb-1 sm:mb-1.5 md:mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg sm:rounded-xl px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-theme-text-primary focus:border-theme-accent-indigo focus:ring-1 focus:ring-theme-accent-indigo outline-none transition-all"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-theme-text-secondary mb-1 sm:mb-1.5 md:mb-2">
                    Nom de famille{" "}
                    <span className="text-theme-text-muted text-[10px]">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg sm:rounded-xl px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-theme-text-primary focus:border-theme-accent-indigo focus:ring-1 focus:ring-theme-accent-indigo outline-none transition-all"
                    placeholder="Dupont"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-theme-text-secondary mb-1 sm:mb-1.5 md:mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/\s/g, "_"))
                    } // Remplace automatiquement les espaces par des underscores
                    className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg sm:rounded-xl px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-theme-text-primary focus:border-theme-accent-indigo focus:ring-1 focus:ring-theme-accent-indigo outline-none transition-all"
                    placeholder="jean_dupont"
                  />
                  <p className="mt-1 text-[10px] sm:text-xs text-theme-text-muted">
                    Lettres, chiffres, tirets et underscores uniquement (pas
                    d'espaces)
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-theme-text-secondary mb-1 sm:mb-1.5 md:mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                  size={16}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg sm:rounded-xl pl-8 sm:pl-9 md:pl-11 pr-2.5 sm:pr-3 md:pr-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-theme-text-primary focus:border-theme-accent-indigo focus:ring-1 focus:ring-theme-accent-indigo outline-none transition-all"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
                <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-theme-text-secondary">
                  Mot de passe
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setView("forgot_password");
                      window.history.pushState({}, "", "/forgot-password");
                    }}
                    className="text-[10px] sm:text-xs text-theme-accent-indigo hover:opacity-80 font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                  size={16}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg sm:rounded-xl pl-8 sm:pl-9 md:pl-11 pr-2.5 sm:pr-3 md:pr-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-theme-text-primary focus:border-theme-accent-indigo focus:ring-1 focus:ring-theme-accent-indigo outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {/* Case à cocher CGU - Uniquement pour l'inscription */}
            {isRegister && (
              <div className="flex items-start gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {termsAccepted ? (
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-theme-accent-orange" />
                  ) : (
                    <Square className="w-4 h-4 sm:w-5 sm:h-5 text-theme-text-muted hover:text-theme-text-secondary transition-colors" />
                  )}
                </button>
                <p className="text-[10px] sm:text-xs text-theme-text-secondary leading-relaxed">
                  J'accepte les{" "}
                  <a
                    href="/legal?tab=cgu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-accent-indigo hover:underline font-medium"
                  >
                    Conditions Générales d'Utilisation
                  </a>{" "}
                  et la{" "}
                  <a
                    href="/legal?tab=privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-accent-indigo hover:underline font-medium"
                  >
                    Politique de Confidentialité
                  </a>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full bg-theme-accent-orange hover:opacity-90 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-orange-200 dark:shadow-orange-900/50 text-xs sm:text-sm md:text-base"
            >
              {loading || isLoading ? (
                <span>Chargement...</span>
              ) : (
                <>
                  {isRegister ? (
                    <UserPlus
                      size={16}
                      className="sm:w-4 sm:h-4 md:w-5 md:h-5"
                    />
                  ) : (
                    <LogIn size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  )}
                  <span>{isRegister ? "S'inscrire" : "Se connecter"}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2.5 sm:my-3 md:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-theme-border"></div>
            </div>
            <div className="relative flex justify-center text-[11px] sm:text-xs md:text-sm">
              <span className="px-1.5 sm:px-2 bg-theme-card text-theme-text-tertiary">
                Ou
              </span>
            </div>
          </div>

          {/* OAuth Buttons - CGU toujours requises en mode login (on ne sait pas si c'est une inscription ou connexion) */}
          <OAuthButtons mode="login" />

          {/* Toggle */}
          <div className="mt-2.5 sm:mt-3 md:mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-[11px] sm:text-xs md:text-sm text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
            >
              {isRegister ? (
                <>
                  Déjà inscrit ?{" "}
                  <span className="text-theme-accent-indigo font-medium">
                    Se connecter
                  </span>
                </>
              ) : (
                <>
                  Pas encore de compte ?{" "}
                  <span className="text-theme-accent-indigo font-medium">
                    S'inscrire
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-2.5 sm:mt-3 md:mt-6 text-center">
          <p className="text-theme-text-tertiary text-[11px] sm:text-xs md:text-sm">
            Connectez-vous pour sauvegarder vos données
          </p>
        </div>
      </div>
    </div>
  );
};
