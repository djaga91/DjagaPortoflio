import React, { useEffect, useRef, useState } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { useGameStore } from "../store/gameStore";

export const OnboardingView: React.FC = () => {
  const { setView, addPts, unlockBadge, isAuthenticated } = useGameStore();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Nettoyer les anciennes données d'onboarding du localStorage au chargement
  useEffect(() => {
    // Supprimer les anciennes données d'onboarding qui pourraient causer des problèmes
    localStorage.removeItem("portfolia_onboarding_data");
  }, []);

  // Calculate scale to fit viewport height
  useEffect(() => {
    if (!containerRef.current) return;

    const calculateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const viewportHeight = window.innerHeight;
      const padding = 32; // Total padding (16px top + 16px bottom)
      const availableHeight = viewportHeight - padding;

      // Get natural height of container content
      const naturalHeight = container.scrollHeight || container.clientHeight;

      // Calculate scale needed to fit
      const calculatedScale = Math.min(1, availableHeight / naturalHeight);

      // Apply scale with minimum of 0.7 to prevent too small (still readable)
      setScale(Math.max(0.7, Math.min(1, calculatedScale)));
    };

    // Calculate immediately
    calculateScale();

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    resizeObserver.observe(containerRef.current);

    // Recalculate on window resize
    window.addEventListener("resize", calculateScale);

    // Recalculate after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(calculateScale, 50);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateScale);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleStart = async () => {
    // Si authentifié, donner les récompenses
    if (isAuthenticated) {
      await addPts(50, "Bienvenue sur PortfoliA !");
      await unlockBadge("first_steps");
    }

    // Aller au dashboard (mode guest ou authentifié)
    setView("dashboard");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-theme-bg-primary p-4 overflow-hidden">
      <div
        ref={containerRef}
        className="max-w-md w-full bg-theme-card border border-theme-card-border p-8 rounded-[2rem] shadow-theme-sm relative z-10 animate-in zoom-in duration-500"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.15s ease-out",
          willChange: "transform",
        }}
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 transform -rotate-3 overflow-hidden">
            <img
              src="/logo.svg"
              alt="Portfolia"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-theme-text-primary mb-2">
            Bienvenue sur Portfolia
          </h1>
          <p className="text-theme-text-secondary">
            Construisez et optimisez votre profil professionnel de manière
            interactive.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 p-4 bg-theme-bg-secondary rounded-2xl border border-theme-card-border">
            <div className="w-10 h-10 rounded-xl bg-[#FF8C42] flex items-center justify-center font-bold text-white">
              1
            </div>
            <div className="flex-1 text-theme-text-primary text-sm font-semibold">
              Créez votre profil professionnel
            </div>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div className="flex items-center gap-4 p-4 bg-theme-bg-secondary rounded-2xl border border-theme-card-border opacity-50">
            <div className="w-10 h-10 rounded-xl bg-theme-border flex items-center justify-center font-bold text-theme-text-muted">
              2
            </div>
            <div className="flex-1 text-theme-text-muted text-sm font-semibold">
              Gagnez vos premiers points
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-theme-bg-secondary rounded-2xl border border-theme-card-border opacity-50">
            <div className="w-10 h-10 rounded-xl bg-theme-border flex items-center justify-center font-bold text-theme-text-muted">
              3
            </div>
            <div className="flex-1 text-theme-text-muted text-sm font-semibold">
              Débloquez le tableau de bord
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 bg-[#FF8C42] hover:bg-[#E07230] rounded-xl font-bold text-white shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Zap size={20} className="fill-white" />
          Commencer
        </button>
      </div>
    </div>
  );
};
