/**
 * OnboardingTutorial - Système d'onboarding interactif avec animations Lottie
 *
 * Présente les fonctionnalités de PortfoliA aux nouveaux utilisateurs avec :
 * - Animations Lottie (renard)
 * - Focus/highlight sur les éléments de l'interface
 * - Bulles de texte explicatives
 * - Navigation entre les étapes
 * - Indicateur de progression
 * - Possibilité de passer/sauter
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import Lottie from "lottie-react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
// Import des animations Lottie
import foxHelloAnimation from "../assets/animations/FoxHello.json";
import frontendDeveloperAnimation from "../assets/animations/FrontendDeveloper-3.json";
import { useGameStore } from "../store/gameStore";
import { ViewType } from "../types";

interface OnboardingStep {
  id: string;
  page: "dashboard" | "matching";
  navigateToView?: ViewType; // Vue à afficher pendant cette étape
  animation?: "foxHello" | "frontendDeveloper";
  message: string;
  targetSelector?: string; // Sélecteur CSS pour l'élément à mettre en focus
  actionButton?: {
    text: string;
    onClick: () => void;
  };
  skipToNext?: boolean; // Passer automatiquement à l'étape suivante après un délai
  foxPosition?: "left" | "right"; // Position du renard (défaut: left)
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  // Étape 1 : Racontez votre vie à Fox
  {
    id: "fox-interview",
    page: "dashboard",
    navigateToView: "dashboard",
    animation: "foxHello",
    message:
      "Racontez votre vie à Fox : discutez avec lui pour remplir votre profil sans formulaire !",
    targetSelector: '[data-onboarding="fox-interview"]',
    foxPosition: "right",
  },
  // Étape 2 : Objectifs du jour
  {
    id: "objectives",
    page: "dashboard",
    navigateToView: "dashboard",
    animation: "foxHello",
    message:
      "Objectifs du jour : si vous êtes perdu, chaque jour vous aurez des choses à faire.",
    targetSelector: '[data-onboarding="objectives"]',
  },
  // Étape 3 : Menu latéral - Mon Profil (reste sur Mon Bureau, on montre juste le lien)
  {
    id: "menu-profile",
    page: "dashboard",
    navigateToView: "dashboard",
    animation: "foxHello",
    message:
      "Complétez votre profil à 100 % : expériences, formations, compétences, objectif… Vous y accéderez via Mon Profil dans le menu.",
    targetSelector: '[data-onboarding="menu-profile"]',
    foxPosition: "right",
  },
  // Étape 4 : Mes documents (reste sur Mon Bureau)
  {
    id: "menu-documents",
    page: "dashboard",
    navigateToView: "dashboard",
    animation: "foxHello",
    message:
      "Mes documents : générez vos CV et lettres de motivation depuis le menu.",
    targetSelector: '[data-onboarding="menu-documents"]',
    foxPosition: "right",
  },
  // Étape 5 : Mon portfolio (reste sur Mon Bureau)
  {
    id: "menu-portfolio",
    page: "dashboard",
    navigateToView: "dashboard",
    animation: "foxHello",
    message:
      "Mon portfolio : créez votre site personnel et partagez-le via le menu.",
    targetSelector: '[data-onboarding="menu-portfolio"]',
    foxPosition: "right",
  },
  // Étape 6 : Offres (reste sur Mon Bureau)
  {
    id: "search-offers",
    page: "dashboard",
    navigateToView: "dashboard",
    animation: "foxHello",
    message:
      "Pour finir, trouvez des offres : cliquez sur Offres dans le menu latéral quand vous serez prêt !",
    targetSelector: '[data-onboarding="menu-offers"]',
    foxPosition: "right",
  },
];

interface OnboardingTutorialProps {
  userId?: string;
  onComplete?: () => void;
  forceShow?: boolean; // Force l'affichage même si déjà complété
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  userId,
  onComplete,
  forceShow = false,
}) => {
  const { view, setView } = useGameStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [_targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const previousTargetRef = useRef<HTMLElement | null>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // Fonction pour vérifier si on doit afficher le tutoriel
  const checkShouldShowTutorial = () => {
    if (!userId) return false;

    // Ne JAMAIS lancer le tutoriel sur les pages d'onboarding (cv_import, fox_interview, onboarding_flow)
    // même pendant le court instant avant la redirection
    if (
      view === "cv_import" ||
      view === "fox_interview" ||
      view === "onboarding_flow"
    ) {
      return false;
    }

    // Si forceShow est activé, afficher l'onboarding
    if (forceShow) return true;

    const completedKey = `onboarding_completed_${userId}`;
    const completed = localStorage.getItem(completedKey);

    if (completed === "true") {
      // Onboarding déjà complété, ne pas afficher
      return false;
    }

    // Vérifier le flag pending_onboarding pour savoir si on doit attendre (ex: après import CV)
    const pendingOnboarding = localStorage.getItem(
      `pending_onboarding_${userId}`,
    );

    // Si le flag est 'after_cv_import' ou 'after_fox_interview', ne PAS lancer le tutoriel maintenant
    // Il sera lancé après l'import réussi du CV ou après la fin de Fox Interview
    if (
      pendingOnboarding === "after_cv_import" ||
      pendingOnboarding === "after_fox_interview"
    ) {
      return false;
    }

    // Si le flag est 'immediate', lancer le tutoriel (même si onboarding_seen existe)
    // MAIS seulement si on est sur le dashboard (pas sur les pages d'onboarding)
    if (pendingOnboarding === "immediate" && view === "dashboard") {
      return true;
    }

    // Afficher l'onboarding pour les nouveaux utilisateurs
    // On peut aussi vérifier si c'est la première visite
    const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${userId}`);
    return !hasSeenOnboarding;
  };

  // Vérifier si l'onboarding a déjà été complété
  useEffect(() => {
    const shouldShow = checkShouldShowTutorial();
    setIsVisible(shouldShow);

    if (shouldShow && userId) {
      // Marquer comme vu pour éviter les relances multiples
      // MAIS seulement si ce n'est pas un flag 'immediate' (qui force le lancement)
      const pendingOnboarding = localStorage.getItem(
        `pending_onboarding_${userId}`,
      );
      if (pendingOnboarding !== "immediate") {
        const hasSeenOnboarding = localStorage.getItem(
          `onboarding_seen_${userId}`,
        );
        if (!hasSeenOnboarding) {
          localStorage.setItem(`onboarding_seen_${userId}`, "true");
        }
      }
    }
  }, [userId, forceShow, view]); // Ajouter 'view' pour relancer la vérification quand on arrive sur le dashboard après import

  // Rester sur Mon Bureau : forcer le dashboard pendant l'onboarding et mettre en évidence la cible
  useEffect(() => {
    if (!isVisible || !currentStep) return;

    // Nettoyer immédiatement avant de faire quoi que ce soit
    cleanupAllHighlights();

    const targetView = currentStep.navigateToView || currentStep.page;

    // Toujours afficher le dashboard pendant l'onboarding (on ne navigue jamais ailleurs)
    if (targetView !== view) {
      setView(targetView as ViewType);
      setTimeout(() => {
        findAndHighlightTarget();
      }, 500);
    } else {
      setTimeout(() => {
        findAndHighlightTarget();
      }, 10);
    }
  }, [currentStepIndex, view, isVisible, currentStep]);

  // Fonction pour nettoyer TOUS les éléments avec le highlight (agressive)
  const cleanupAllHighlights = () => {
    // Nettoyer tous les éléments avec la classe onboarding-highlight dans tout le document
    const allHighlighted = document.querySelectorAll(
      ".onboarding-highlight, .onboarding-highlight-notifications",
    );
    allHighlighted.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.remove(
        "onboarding-highlight",
        "onboarding-highlight-notifications",
      );
      htmlEl.style.removeProperty("--onboarding-z-index");
    });

    // Nettoyer aussi la référence
    if (previousTargetRef.current) {
      previousTargetRef.current = null;
    }
  };

  // Trouver et mettre en évidence l'élément cible
  const findAndHighlightTarget = () => {
    // Nettoyer TOUS les highlights IMMÉDIATEMENT (sans délai, de manière synchrone)
    cleanupAllHighlights();

    if (!currentStep?.targetSelector) {
      setTargetElement(null);
      return;
    }

    // Utiliser requestAnimationFrame pour s'assurer que le nettoyage est effectif avant d'ajouter le nouveau highlight
    requestAnimationFrame(() => {
      // Nettoyer à nouveau au cas où (sécurité)
      cleanupAllHighlights();

      // Utiliser un autre requestAnimationFrame pour être sûr que le nettoyage est appliqué
      requestAnimationFrame(() => {
        const element = document.querySelector(
          currentStep.targetSelector!,
        ) as HTMLElement;
        if (element) {
          setTargetElement(element);
          previousTargetRef.current = element;

          // Ajouter la classe de mise en valeur (style badge légendaire)
          element.classList.add("onboarding-highlight");

          // Scroller vers l'élément
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setTargetElement(null);
        }
      });
    });
  };

  // Nettoyer les styles IMMÉDIATEMENT quand on change d'étape (synchrone avec le rendu)
  useLayoutEffect(() => {
    // Nettoyer immédiatement et de manière synchrone quand on change d'étape
    // useLayoutEffect s'exécute AVANT que le navigateur ne peigne l'écran
    cleanupAllHighlights();

    return () => {
      // Nettoyer aussi au cleanup
      cleanupAllHighlights();
    };
  }, [currentStepIndex]);

  // Passer à l'étape suivante
  const nextStep = () => {
    // Nettoyer TOUS les highlights IMMÉDIATEMENT et de manière synchrone avant de changer d'étape
    cleanupAllHighlights();

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  // Étape précédente
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Compléter l'onboarding
  const completeOnboarding = () => {
    // Nettoyer les styles de l'élément cible
    if (previousTargetRef.current) {
      const prev = previousTargetRef.current;
      prev.classList.remove("onboarding-highlight");
      prev.style.removeProperty("--onboarding-z-index");
    }

    if (userId) {
      localStorage.setItem(`onboarding_completed_${userId}`, "true");
      localStorage.removeItem(`onboarding_seen_${userId}`);
    }
    setIsVisible(false);
    setTargetElement(null);
    previousTargetRef.current = null;
    onComplete?.();
  };

  // Passer l'onboarding
  const skipOnboarding = () => {
    completeOnboarding();
  };

  // Gérer le clic sur le bouton d'action (on reste sur Mon Bureau, pas de navigation)
  const handleActionClick = () => {
    if (currentStep.actionButton) {
      currentStep.actionButton.onClick();
      setTimeout(() => {
        nextStep();
      }, 500);
    }
  };

  if (!isVisible || !currentStep) {
    return null;
  }

  // Obtenir l'animation Lottie
  const getAnimation = () => {
    switch (currentStep.animation) {
      case "foxHello":
        return foxHelloAnimation;
      case "frontendDeveloper":
        return frontendDeveloperAnimation;
      default:
        return foxHelloAnimation;
    }
  };

  // Note: getTargetPosition() a été supprimée car non utilisée actuellement
  // Elle était prévue pour positionner des éléments de highlight basés sur targetElement

  return (
    <>
      {/* Styles CSS pour la mise en valeur des sections */}
      <style>{`
        .onboarding-highlight {
          position: relative !important;
          z-index: var(--onboarding-z-index, 9999) !important;
          background-color: rgb(255, 255, 255) !important;
          border-color: rgb(251, 146, 60) !important;
          box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.5), 0 0 0 8px rgba(249, 115, 22, 0.2) !important;
          outline: 4px solid rgba(251, 146, 60, 0.8) !important;
          outline-offset: 6px !important;
          transition: all 0.3s ease !important;
          animation: onboarding-pulse 1.5s ease-in-out infinite !important;
          transform: scale(1.05) !important;
        }

        .dark .onboarding-highlight {
          background-color: rgb(15, 23, 42) !important;
          border-color: rgb(249, 115, 22) !important;
          outline-color: rgba(249, 115, 22, 0.8) !important;
          box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.6), 0 0 0 8px rgba(249, 115, 22, 0.3) !important;
        }

        @keyframes onboarding-pulse {
          0%, 100% {
            box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.5), 0 0 0 8px rgba(249, 115, 22, 0.2);
            outline-color: rgba(251, 146, 60, 0.8);
            transform: scale(1.05);
          }
          50% {
            box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.9), 0 0 0 12px rgba(249, 115, 22, 0.4);
            outline-color: rgba(251, 146, 60, 1);
            transform: scale(1.08);
          }
        }

        /* Style spécial pour la cloche de notifications - Plus visible */
        .onboarding-highlight-notifications {
          transform: scale(1.15) !important;
          box-shadow: 0 0 0 12px rgba(249, 115, 22, 0.3),
                      0 0 0 20px rgba(249, 115, 22, 0.15),
                      0 0 40px rgba(249, 115, 22, 0.6),
                      0 0 80px rgba(249, 115, 22, 0.4),
                      0 25px 50px -12px rgba(249, 115, 22, 0.8) !important;
          outline: 6px solid rgba(251, 146, 60, 1) !important;
          outline-offset: 10px !important;
          animation: onboarding-pulse-notifications 1s ease-in-out infinite !important;
          background-color: rgb(255, 247, 237) !important;
        }

        .dark .onboarding-highlight-notifications {
          background-color: rgb(30, 20, 10) !important;
          box-shadow: 0 0 0 12px rgba(249, 115, 22, 0.4),
                      0 0 0 20px rgba(249, 115, 22, 0.2),
                      0 0 40px rgba(249, 115, 22, 0.7),
                      0 0 80px rgba(249, 115, 22, 0.5),
                      0 25px 50px -12px rgba(249, 115, 22, 0.9) !important;
        }

        @keyframes onboarding-pulse-notifications {
          0%, 100% {
            box-shadow: 0 0 0 12px rgba(249, 115, 22, 0.3),
                        0 0 0 20px rgba(249, 115, 22, 0.15),
                        0 0 40px rgba(249, 115, 22, 0.6),
                        0 0 80px rgba(249, 115, 22, 0.4),
                        0 25px 50px -12px rgba(249, 115, 22, 0.8);
            outline-color: rgba(251, 146, 60, 1);
            transform: scale(1.15);
          }
          50% {
            box-shadow: 0 0 0 16px rgba(249, 115, 22, 0.5),
                        0 0 0 28px rgba(249, 115, 22, 0.25),
                        0 0 60px rgba(249, 115, 22, 0.8),
                        0 0 100px rgba(249, 115, 22, 0.6),
                        0 25px 50px -12px rgba(249, 115, 22, 1);
            outline-color: rgba(251, 146, 60, 1);
            transform: scale(1.2);
          }
        }
      `}</style>

      {/* Overlay sombre - Clic pour passer à l'étape suivante */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] transition-opacity duration-300 cursor-pointer"
        onClick={(e) => {
          // Passer à l'étape suivante en cliquant sur la page
          // Ne pas déclencher si on clique sur la bulle ou les contrôles
          if (e.target === overlayRef.current) {
            nextStep();
          }
        }}
        style={
          currentStep?.id?.startsWith("menu-") ||
          currentStep?.id === "search-offers"
            ? {
                // Pas de blur sur la sidebar : on laisse juste le fond assombri à droite
                background:
                  "linear-gradient(to right, transparent 0%, transparent 256px, rgba(0, 0, 0, 0.6) 256px, rgba(0, 0, 0, 0.6) 100%)",
              }
            : {
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(4px)",
              }
        }
      >
        {/* Bordure orange sur la sidebar pendant les étapes menu (sans masquer le contenu) */}
        {(currentStep?.id?.startsWith("menu-") ||
          currentStep?.id === "search-offers") && (
          <div className="absolute left-64 top-0 bottom-0 w-0.5 bg-orange-400/30 pointer-events-none z-[9999]" />
        )}
      </div>

      {/* Renard fixe sur le côté (gauche ou droite selon l'étape) avec bulle de texte à côté */}
      <>
        <div
          className={`fixed ${currentStep?.foxPosition === "right" ? "right-4" : "left-4"} bottom-24 z-[10000] pointer-events-none hidden md:flex items-end gap-4`}
        >
          {/* Animation Lottie du renard */}
          <div className="w-32 h-32 lg:w-40 lg:h-40 flex-shrink-0">
            <Lottie
              lottieRef={animationRef}
              animationData={getAnimation()}
              loop={true}
              className="w-full h-full"
            />
          </div>

          {/* Bulle de dialogue à côté du renard - Style bulle de BD */}
          <div
            className={`relative mb-32 pointer-events-auto ${currentStep?.foxPosition === "right" ? "order-first" : ""}`}
          >
            {/* Queue de bulle pointant vers le renard (style BD) */}
            <div
              className={`absolute ${currentStep?.foxPosition === "right" ? "-right-3" : "-left-3"} bottom-6 w-0 h-0`}
            >
              {/* Queue principale */}
              {currentStep?.foxPosition === "right" ? (
                <>
                  <div className="absolute right-0 top-0 w-0 h-0 border-t-[10px] border-t-transparent border-l-[14px] border-l-white dark:border-l-slate-800 border-b-[10px] border-b-transparent" />
                  <div className="absolute right-[1px] top-[1px] w-0 h-0 border-t-[10px] border-t-transparent border-l-[14px] border-l-slate-200 dark:border-l-slate-700 border-b-[10px] border-b-transparent opacity-50" />
                </>
              ) : (
                <>
                  <div className="absolute left-0 top-0 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-white dark:border-r-slate-800 border-b-[10px] border-b-transparent" />
                  <div className="absolute left-[1px] top-[1px] w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-slate-200 dark:border-r-slate-700 border-b-[10px] border-b-transparent opacity-50" />
                </>
              )}
            </div>

            {/* Bulle de dialogue avec style BD */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl px-6 py-4 shadow-2xl shadow-orange-500/30 border-3 border-orange-400 dark:border-orange-500 min-w-[280px] max-w-[400px]">
              {/* Glow effect orange subtil */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-rose-400/10 dark:from-orange-500/10 dark:to-rose-500/10 rounded-3xl blur-xl" />

              {/* Bouton fermer en haut à droite */}
              <button
                onClick={skipOnboarding}
                className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
                aria-label="Fermer l'onboarding"
              >
                <X size={16} className="text-slate-500 dark:text-slate-400" />
              </button>

              {/* Texte dans la bulle */}
              <p className="relative text-sm md:text-base font-semibold text-slate-900 dark:text-white pr-6 leading-relaxed">
                {currentStep.message}
              </p>

              {/* Bouton d'action si présent */}
              {currentStep.actionButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick();
                  }}
                  className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 text-sm cursor-pointer"
                  type="button"
                >
                  {currentStep.actionButton.text}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contrôles de navigation */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[10001] bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-2xl border-2 border-orange-500 flex items-center gap-4">
          {/* Bouton précédent */}
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft
              size={20}
              className="text-slate-700 dark:text-slate-300"
            />
          </button>

          {/* Indicateur de progression */}
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Étape {currentStepIndex + 1} sur {totalSteps}
            </span>
          </div>

          {/* Bouton suivant */}
          <button
            onClick={nextStep}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ChevronRight
              size={20}
              className="text-slate-700 dark:text-slate-300"
            />
          </button>

          {/* Bouton "Passer" - Plus visible et explicite */}
          <button
            onClick={skipOnboarding}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ml-2 flex items-center gap-2"
            title="Passer l'onboarding"
          >
            <X size={18} className="text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
              Passer
            </span>
          </button>
        </div>
      </>
    </>
  );
};
