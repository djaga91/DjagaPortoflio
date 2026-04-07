/**
 * LoginAnimation - Animation de bienvenue après connexion
 * Renard qui bosse + bulle "Prêt à bosser ?"
 */

import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import foxWorkingAnimation from "../fox-working.json";

interface LoginAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export const LoginAnimation: React.FC<LoginAnimationProps> = ({
  show,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Animation visible pendant 3 secondes si aucune interaction
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 600); // Attendre la fin de l'animation de sortie
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

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
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 z-[9999] cursor-pointer ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Animation en bas à gauche */}
      <div
        className={`fixed bottom-0 left-0 flex items-end gap-0 p-8 z-[10000] transition-all duration-600 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        {/* Animation Lottie du renard qui bosse - PLUS GRANDE - Cliquable pour fermer */}
        <div
          onClick={handleClick}
          className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <Lottie
            animationData={foxWorkingAnimation}
            loop={true}
            className="w-full h-full drop-shadow-2xl"
          />
        </div>

        {/* Bulle de texte stylisée - COLLÉE AU RENARD - Cliquable pour fermer */}
        <div
          onClick={handleClick}
          className="relative mb-36 -ml-6 animate-bounce-slow cursor-pointer"
        >
          {/* Triangle pointer vers le renard */}
          <div className="absolute -left-2 bottom-6 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white dark:border-r-slate-800 border-b-[8px] border-b-transparent filter drop-shadow-lg" />

          {/* Bulle avec glow */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl px-5 py-3 shadow-2xl shadow-orange-500/50 border-2 border-orange-400 dark:border-orange-500 hover:scale-105 transition-transform duration-200">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 dark:from-orange-500/20 dark:to-yellow-500/20 rounded-2xl blur-xl" />

            {/* Texte */}
            <p className="relative text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">
              Prêt à bosser ? 💼
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
