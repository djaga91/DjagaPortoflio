import { useState, useEffect, RefObject, useRef, useCallback } from "react";

// Hauteur A4 standard en pixels (96 DPI)
const A4_HEIGHT_PX = 1123;

export interface DualColumnDensity {
  left: number; // Pourcentage colonne gauche
  right: number; // Pourcentage colonne droite
  global: number; // Pourcentage global (max des deux)
  isOverflowing: boolean;
  overflowingColumn: "left" | "right" | "both" | null;
  leftHeight: number; // Hauteur réelle en px
  rightHeight: number; // Hauteur réelle en px
}

export const useDualColumnDensity = (
  leftColRef: RefObject<HTMLElement>,
  rightColRef: RefObject<HTMLElement>,
  dependencies: any[] = [], // Dépendances pour recalculer (layout, previewHtml, etc.)
): DualColumnDensity => {
  const [density, setDensity] = useState<DualColumnDensity>({
    left: 0,
    right: 0,
    global: 0,
    isOverflowing: false,
    overflowingColumn: null,
    leftHeight: 0,
    rightHeight: 0,
  });

  // Ref pour éviter les mises à jour inutiles
  const lastDensityRef = useRef<DualColumnDensity | null>(null);
  const isMeasuringRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measureHeight = useCallback(() => {
    // Éviter les appels simultanés
    if (isMeasuringRef.current) {
      return;
    }

    // Attendre que les refs soient initialisées
    if (!leftColRef.current || !rightColRef.current) {
      // Nettoyer le timeout précédent
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      // Réessayer après un court délai si les refs ne sont pas encore prêtes
      retryTimeoutRef.current = setTimeout(() => {
        isMeasuringRef.current = false;
        measureHeight();
      }, 100);
      return;
    }

    isMeasuringRef.current = true;

    // 1. Trouver le conteneur et mesurer le padding + header
    let containerPaddingTop = 0;
    let containerPaddingBottom = 0;
    let headerHeight = 0;
    const container = leftColRef.current.closest(
      ".cv-container",
    ) as HTMLElement;

    if (container) {
      // IMPORTANT : Mesurer les valeurs CSS réelles, pas les valeurs rendues
      // getComputedStyle retourne les valeurs en pixels CSS, indépendamment de la taille de l'écran
      const computedStyle = window.getComputedStyle(container);

      // Récupérer les valeurs CSS brutes (en pixels CSS, pas pixels écran)
      // Ces valeurs sont toujours les mêmes, peu importe la taille de la fenêtre
      const paddingTopValue = computedStyle.paddingTop;
      const paddingBottomValue = computedStyle.paddingBottom;

      containerPaddingTop = parseFloat(paddingTopValue) || 0;
      containerPaddingBottom = parseFloat(paddingBottomValue) || 0;

      // Si le padding n'est pas mesurable (0), utiliser la valeur par défaut du template
      if (containerPaddingTop === 0) {
        containerPaddingTop = 45.35; // 12mm à 96 DPI
      }
      if (containerPaddingBottom === 0) {
        containerPaddingBottom = 22.675; // 6mm à 96 DPI (réduit de moitié)
      }

      // Trouver le header
      const header = container.querySelector(".cv-header") as HTMLElement;
      if (header) {
        // scrollHeight retourne toujours la hauteur réelle du contenu en pixels CSS
        // indépendamment de la taille de l'écran ou du zoom
        header.offsetHeight; // Force reflow
        headerHeight = header.scrollHeight || header.offsetHeight || 0;
      }
    }

    // 2. Mesurer la hauteur réelle du CONTENU de chaque colonne
    // IMPORTANT : scrollHeight retourne toujours la hauteur réelle du contenu en pixels CSS
    // indépendamment de la taille de l'écran, du zoom, ou du redimensionnement de la fenêtre
    // C'est la valeur absolue en pixels CSS, pas en pixels écran
    leftColRef.current.offsetHeight; // Force reflow
    rightColRef.current.offsetHeight; // Force reflow

    // scrollHeight est la hauteur réelle du contenu en pixels CSS (toujours la même)
    const leftColHeight = leftColRef.current.scrollHeight;
    const rightColHeight = rightColRef.current.scrollHeight;

    // 3. Hauteur totale = padding-top + header + colonne + padding-bottom (pour chaque colonne)
    const leftTotalHeight =
      containerPaddingTop +
      headerHeight +
      leftColHeight +
      containerPaddingBottom;
    const rightTotalHeight =
      containerPaddingTop +
      headerHeight +
      rightColHeight +
      containerPaddingBottom;

    // 4. Calculer les pourcentages (padding + header + colonne + padding)
    const leftPct = (leftTotalHeight / A4_HEIGHT_PX) * 100;
    const rightPct = (rightTotalHeight / A4_HEIGHT_PX) * 100;

    // 5. Le score global est déterminé par la colonne la plus haute (tout inclus)
    const maxHeight = Math.max(leftTotalHeight, rightTotalHeight);
    const globalPct = (maxHeight / A4_HEIGHT_PX) * 100;

    // 6. Identifier le coupable
    let culprit: "left" | "right" | "both" | null = null;
    if (leftPct > 100 && rightPct > 100) culprit = "both";
    else if (leftPct > 100) culprit = "left";
    else if (rightPct > 100) culprit = "right";

    const newDensity: DualColumnDensity = {
      left: Math.round(leftPct * 10) / 10, // 1 décimale
      right: Math.round(rightPct * 10) / 10,
      global: Math.round(globalPct * 10) / 10,
      isOverflowing: globalPct > 100,
      overflowingColumn: culprit,
      leftHeight: leftTotalHeight, // Hauteur totale (header + colonne)
      rightHeight: rightTotalHeight, // Hauteur totale (header + colonne)
    };

    // Éviter les mises à jour inutiles : comparer avec la dernière valeur
    const lastDensity = lastDensityRef.current;
    if (
      !lastDensity ||
      Math.abs(lastDensity.left - newDensity.left) > 0.1 ||
      Math.abs(lastDensity.right - newDensity.right) > 0.1 ||
      Math.abs(lastDensity.global - newDensity.global) > 0.1 ||
      lastDensity.isOverflowing !== newDensity.isOverflowing ||
      lastDensity.overflowingColumn !== newDensity.overflowingColumn
    ) {
      lastDensityRef.current = newDensity;
      setDensity(newDensity);
    }

    isMeasuringRef.current = false;
  }, [leftColRef, rightColRef]);

  useEffect(() => {
    // Debounce pour éviter trop de mises à jour
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
    const debouncedMeasure = () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        measureHeight();
      }, 100);
    };

    // Mesurer immédiatement (avec un petit délai pour laisser le DOM se stabiliser)
    const initialTimeout = setTimeout(measureHeight, 50);

    // Observer les changements de taille UNIQUEMENT pour les changements de contenu
    // IMPORTANT : scrollHeight retourne toujours la hauteur réelle en pixels CSS,
    // indépendamment de la taille de l'écran. On ne doit mesurer que si scrollHeight change.
    let lastLeftScrollHeight = 0;
    let lastRightScrollHeight = 0;

    const observer = new ResizeObserver(() => {
      // Vérifier si le changement vient vraiment du contenu (scrollHeight a changé)
      // IMPORTANT : scrollHeight retourne toujours la hauteur réelle en pixels CSS,
      // indépendamment de la taille de l'écran. Si scrollHeight n'a pas changé,
      // c'est juste un redimensionnement de fenêtre, on ignore.
      if (leftColRef.current && rightColRef.current) {
        const currentLeftScrollHeight = leftColRef.current.scrollHeight;
        const currentRightScrollHeight = rightColRef.current.scrollHeight;

        // Ne mesurer que si scrollHeight a vraiment changé (changement de contenu)
        if (
          currentLeftScrollHeight !== lastLeftScrollHeight ||
          currentRightScrollHeight !== lastRightScrollHeight
        ) {
          lastLeftScrollHeight = currentLeftScrollHeight;
          lastRightScrollHeight = currentRightScrollHeight;
          debouncedMeasure();
        }
        // Sinon, c'est juste un redimensionnement de fenêtre, on ignore
      }
    });

    if (leftColRef.current) {
      // Initialiser les scrollHeights
      lastLeftScrollHeight = leftColRef.current.scrollHeight;
      observer.observe(leftColRef.current);
    }
    if (rightColRef.current) {
      // Initialiser les scrollHeights
      lastRightScrollHeight = rightColRef.current.scrollHeight;
      observer.observe(rightColRef.current);
    }

    // Observer les mutations DOM pour détecter les changements dans le HTML injecté
    const mutationObserver = new MutationObserver(debouncedMeasure);

    if (leftColRef.current) {
      mutationObserver.observe(leftColRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
    if (rightColRef.current) {
      mutationObserver.observe(rightColRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    // Intervalle de sécurité pour les changements dans le HTML injecté (moins fréquent)
    const interval = setInterval(debouncedMeasure, 500);

    return () => {
      clearTimeout(initialTimeout);
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      observer.disconnect();
      mutationObserver.disconnect();
      clearInterval(interval);
      isMeasuringRef.current = false;
    };
  }, [leftColRef, rightColRef, measureHeight, ...dependencies]);

  return density;
};
