/**
 * LegendaryBadgeAnimation - Animation de célébration du badge Légendaire
 * Renard couronné + bulle "Prends ta couronne toi aussi !"
 * Affichée sur le dashboard après avoir coché "Je suis pris" ET obtenu le badge légendaire
 */

import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import foxCrownedAnimation from "../../public/fox-crowned.json";

interface LegendaryBadgeAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export const LegendaryBadgeAnimation: React.FC<
  LegendaryBadgeAnimationProps
> = ({ show, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // Animation visible pendant 6 secondes (un peu plus long pour laisser l'utilisateur savourer)
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 600); // Attendre la fin de l'animation de sortie
      }, 6000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [show, onComplete]);

  if (!show && !isVisible) {
    return null;
  }

  // Fermer l'animation au clic
  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  return (
    <>
      {/* Overlay sombre (fond noir transparent) - Cliquable pour fermer */}
      <div
        onClick={handleClick}
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 z-[9998] cursor-pointer ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Animation en bas à gauche */}
      <div
        className={`fixed bottom-0 left-0 flex items-end gap-0 p-8 z-[10000] transition-all duration-600 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        {/* Animation Lottie du renard couronné - ENCORE PLUS GRANDE pour célébrer */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
          <Lottie
            animationData={foxCrownedAnimation}
            loop={true}
            className="w-full h-full drop-shadow-2xl"
          />
        </div>

        {/* Bulle de texte stylisée - plus haute, au-dessus du renard */}
        <div className="relative mb-40 -ml-8 animate-bounce-slow self-end">
          {/* Triangle pointer vers le renard */}
          <div className="absolute -left-2 bottom-4 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white dark:border-r-slate-800 border-b-[8px] border-b-transparent filter drop-shadow-lg" />

          {/* Bulle avec glow doré (effet légendaire) */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl px-5 py-3 shadow-2xl shadow-amber-500/50 border-2 border-amber-400 dark:border-amber-500">
            {/* Glow effect doré */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 dark:from-amber-500/20 dark:to-yellow-500/20 rounded-2xl blur-xl" />

            {/* Texte */}
            <p className="relative text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">
              Prends ta couronne toi aussi ! 👑
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
