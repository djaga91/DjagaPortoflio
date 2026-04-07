/**
 * NotFoundView - Page 404 personnalisée
 */

import React from "react";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { useGameStore } from "../store/gameStore";

const NotFoundView: React.FC = () => {
  const { setView, isAuthenticated } = useGameStore();

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-theme-bg-secondary rounded-full flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-theme-text-tertiary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-orange/20 rounded-full animate-pulse" />
          <div className="absolute -bottom-1 -left-4 w-6 h-6 bg-brand-violet/20 rounded-full animate-pulse delay-150" />
        </div>

        {/* Code d'erreur */}
        <h1 className="text-7xl font-bold text-theme-text-primary mb-2">404</h1>

        {/* Titre */}
        <h2 className="text-2xl font-semibold text-theme-text-primary mb-3">
          Page introuvable
        </h2>

        {/* Description */}
        <p className="text-theme-text-secondary mb-8 leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée. Pas
          d'inquiétude, vous pouvez retourner à l'accueil.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setView(isAuthenticated ? "dashboard" : "landing")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange text-white font-medium rounded-xl hover:bg-brand-orange/90 transition-colors duration-200"
            aria-label="Retourner à l'accueil"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme-bg-secondary text-theme-text-primary font-medium rounded-xl hover:bg-theme-bg-tertiary transition-colors duration-200 border border-theme-border"
            aria-label="Retourner à la page précédente"
          >
            <ArrowLeft className="w-5 h-5" />
            Page précédente
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-theme-border">
          <p className="text-sm text-theme-text-tertiary mb-4">
            Pages populaires
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setView("dashboard")}
                  className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:text-theme-text-primary transition-colors duration-200"
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => setView("profile")}
                  className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:text-theme-text-primary transition-colors duration-200"
                >
                  Mon profil
                </button>
                <button
                  onClick={() => setView("cv_template_selection")}
                  className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:text-theme-text-primary transition-colors duration-200"
                >
                  Générer un CV
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView("landing")}
                  className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:text-theme-text-primary transition-colors duration-200"
                >
                  Accueil
                </button>
                <button
                  onClick={() => setView("login")}
                  className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:text-theme-text-primary transition-colors duration-200"
                >
                  Connexion
                </button>
                <button
                  onClick={() => setView("pricing")}
                  className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:text-theme-text-primary transition-colors duration-200"
                >
                  Tarifs
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
