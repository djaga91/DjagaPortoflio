/**
 * FeedbackFloater - Bouton flottant Feedback (Desktop).
 *
 * Ouvre Featurebase avec authentification SSO sécurisée (JWT).
 * Le token est généré côté serveur pour éviter les données en clair.
 *
 * Visible uniquement sur desktop (le mobile utilise le FAB central).
 */

import React, { useCallback, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { authAPI } from "../services/api";

// URL de base Featurebase
const FEATUREBASE_BASE_URL = "https://portfolia.featurebase.app";

export const FeedbackFloater: React.FC = () => {
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    // Si non authentifié, ouvrir Featurebase directement (mode anonyme)
    if (!isAuthenticated) {
      window.open(FEATUREBASE_BASE_URL, "_blank", "noopener,noreferrer");
      return;
    }

    // Si authentifié, récupérer le token SSO et ouvrir avec authentification
    setIsLoading(true);
    try {
      const { token } = await authAPI.getFeaturebaseToken();

      // Ouvrir Featurebase avec le token JWT dans l'URL
      // Featurebase accepte le token via le paramètre `jwt`
      const url = `${FEATUREBASE_BASE_URL}?jwt=${encodeURIComponent(token)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("❌ Erreur récupération token Featurebase:", error);
      // Fallback: ouvrir sans SSO
      window.open(FEATUREBASE_BASE_URL, "_blank", "noopener,noreferrer");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="hidden md:block fixed bottom-8 right-8 z-50 group transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-wait"
      title="Feedback & Suggestions"
    >
      <div className="relative">
        {/* Bulle d'encouragement toujours visible */}
        <div className="absolute bottom-full right-0 mb-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          Aidez-nous à améliorer l'app ! ✨{/* Flèche pointant vers le bas */}
          <div className="absolute -bottom-1 right-4 w-2 h-2 bg-indigo-600 rotate-45" />
        </div>

        {/* Pulse ring animation */}
        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
        <div className="absolute inset-0 rounded-full bg-purple-400 animate-pulse opacity-10" />

        <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-theme-card">
          {isLoading ? (
            <Loader2 className="text-white animate-spin" size={24} />
          ) : (
            <MessageSquare className="text-white" size={24} />
          )}
        </div>

        {/* Badge "Nouveau" */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-theme-card animate-pulse z-10" />
      </div>
    </button>
  );
};
