import React, { useState } from "react";
import { Github, CheckSquare, Square } from "lucide-react";
import { API_URL } from "../services/api";

interface OAuthButtonsProps {
  mode?: "login" | "dashboard";
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  mode = "login",
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Ajouter un paramètre pour indiquer au backend qu'on vient du frontend-game
  const frontendParam = "?frontend=game";

  // En mode login, on demande TOUJOURS les CGU car on ne sait pas si c'est une inscription ou connexion
  // En mode dashboard (liaison de compte), pas besoin car l'utilisateur est déjà inscrit
  const requireTerms = mode === "login";

  // Vérifier si on peut cliquer
  const canClick = !requireTerms || termsAccepted;

  // Boutons carrés pour login, boutons rectangulaires pour dashboard
  const buttonClass =
    mode === "login"
      ? `w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center border-2 border-theme-border rounded-lg sm:rounded-xl bg-theme-card text-theme-text-secondary transition-all ${
          canClick
            ? "hover:bg-theme-card-hover hover:border-theme-text-muted hover:shadow-md cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`
      : `inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-theme-border rounded-xl bg-theme-card text-theme-text-secondary transition-all text-sm font-medium ${
          canClick
            ? "hover:bg-theme-card-hover hover:border-theme-text-muted"
            : "opacity-50 cursor-not-allowed"
        }`;

  // Handler pour les clics OAuth
  const handleOAuthClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!canClick) {
      e.preventDefault();
      return;
    }
    // Laisser le navigateur suivre le lien normalement
  };

  return (
    <div className="space-y-3">
      {/* Checkbox CGU pour OAuth (uniquement si requireTerms) */}
      {requireTerms && (
        <div className="flex items-start gap-2 sm:gap-3 px-1">
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
              CGU
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

      <div
        className={
          mode === "login"
            ? "flex items-center justify-center gap-2.5 sm:gap-3 md:gap-4"
            : "flex flex-wrap gap-3"
        }
      >
        {/* GitHub */}
        <a
          href={`${API_URL}/api/auth/github/initiate${frontendParam}`}
          onClick={handleOAuthClick}
          className={buttonClass}
          title={
            canClick
              ? "Continuer avec GitHub"
              : "Acceptez les CGU pour continuer"
          }
          aria-label="Continuer avec GitHub"
        >
          <Github
            size={20}
            className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-theme-text-primary"
          />
          {mode !== "login" && <span>GitHub</span>}
        </a>

        {/* Google */}
        <a
          href={`${API_URL}/api/auth/google/initiate${frontendParam}`}
          onClick={handleOAuthClick}
          className={buttonClass}
          title={
            canClick
              ? "Continuer avec Google"
              : "Acceptez les CGU pour continuer"
          }
          aria-label="Continuer avec Google"
        >
          <svg
            className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
            viewBox="0 0 24 24"
          >
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
          {mode !== "login" && <span>Google</span>}
        </a>

        {/* LinkedIn */}
        <a
          href={`${API_URL}/api/auth/linkedin/initiate${frontendParam}`}
          onClick={handleOAuthClick}
          className={buttonClass}
          title={
            canClick
              ? "Continuer avec LinkedIn"
              : "Acceptez les CGU pour continuer"
          }
          aria-label="Continuer avec LinkedIn"
        >
          <svg
            className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
            fill="#0077B5"
            viewBox="0 0 24 24"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          {mode !== "login" && <span>LinkedIn</span>}
        </a>
      </div>
    </div>
  );
};
