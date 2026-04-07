import { useState, useEffect, RefObject, useRef, useCallback } from "react";

// Hauteur A4 standard en pixels (96 DPI)
const A4_HEIGHT_PX = 1123;

export interface SingleColumnDensity {
  global: number; // Pourcentage global
  isOverflowing: boolean;
  totalHeight: number; // Hauteur réelle en px
}

export const useSingleColumnDensity = (
  bodyRef: RefObject<HTMLElement>,
  dependencies: any[] = [], // Dépendances pour recalculer (layout, previewHtml, etc.)
): SingleColumnDensity => {
  const [density, setDensity] = useState<SingleColumnDensity>({
    global: 0,
    isOverflowing: false,
    totalHeight: 0,
  });

  // Ref pour éviter les mises à jour inutiles
  const lastDensityRef = useRef<SingleColumnDensity | null>(null);
  const isMeasuringRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measureHeight = useCallback(() => {
    // Éviter les appels simultanés
    if (isMeasuringRef.current) {
      return;
    }

    // Attendre que la ref soit initialisée
    if (!bodyRef.current) {
      // Nettoyer le timeout précédent
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      // Réessayer après un court délai si la ref n'est pas encore prête
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
    const container = bodyRef.current.closest(".cv-container") as HTMLElement;

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

      // Si le padding n'est pas mesurable (0), utiliser la valeur par défaut du template LaTeX
      // 8mm = 30.24px à 96 DPI (8 * 3.78)
      if (containerPaddingTop === 0) {
        containerPaddingTop = 30.24; // 8mm par défaut (template LaTeX)
      }
      if (containerPaddingBottom === 0) {
        containerPaddingBottom = 30.24; // 8mm par défaut (template LaTeX)
      }

      // Trouver le header
      const header = container.querySelector(".cv-header") as HTMLElement;
      if (header) {
        // scrollHeight retourne toujours la hauteur réelle du contenu en pixels CSS
        // indépendamment de la taille de l'écran ou du zoom
        header.offsetHeight; // Force reflow
        const headerScrollHeight =
          header.scrollHeight || header.offsetHeight || 0;
        // IMPORTANT : Inclure la marge du bas du header dans la hauteur totale
        // (le template LaTeX a margin-bottom: 6pt qui doit être compté)
        const headerStyle = window.getComputedStyle(header);
        const headerMarginBottom = parseFloat(headerStyle.marginBottom) || 0;
        headerHeight = headerScrollHeight + headerMarginBottom;
      }
    }

    // 2. Mesurer la hauteur réelle du CONTENU du body
    // IMPORTANT : scrollHeight retourne toujours la hauteur réelle du contenu en pixels CSS
    // indépendamment de la taille de l'écran, du zoom, ou du redimensionnement de la fenêtre
    // C'est la valeur absolue en pixels CSS, pas en pixels écran
    bodyRef.current.offsetHeight; // Force reflow

    // scrollHeight est la hauteur réelle du contenu en pixels CSS (toujours la même)
    const bodyHeight = bodyRef.current.scrollHeight;

    // 3. Hauteur totale = padding-top + header + body + padding-bottom
    const totalHeight =
      containerPaddingTop + headerHeight + bodyHeight + containerPaddingBottom;

    // 4. Calculer le pourcentage
    const globalPct = (totalHeight / A4_HEIGHT_PX) * 100;

    const newDensity: SingleColumnDensity = {
      global: Math.round(globalPct * 10) / 10, // 1 décimale
      isOverflowing: globalPct > 100,
      totalHeight: totalHeight,
    };

    // Éviter les mises à jour inutiles : comparer avec la dernière valeur
    const lastDensity = lastDensityRef.current;
    if (
      !lastDensity ||
      Math.abs(lastDensity.global - newDensity.global) > 0.1 ||
      lastDensity.isOverflowing !== newDensity.isOverflowing
    ) {
      lastDensityRef.current = newDensity;
      setDensity(newDensity);
    }

    isMeasuringRef.current = false;
  }, [bodyRef]);

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
    let lastBodyScrollHeight = 0;

    const observer = new ResizeObserver(() => {
      // Vérifier si le changement vient vraiment du contenu (scrollHeight a changé)
      // IMPORTANT : scrollHeight retourne toujours la hauteur réelle en pixels CSS,
      // indépendamment de la taille de l'écran. Si scrollHeight n'a pas changé,
      // c'est juste un redimensionnement de fenêtre, on ignore.
      if (bodyRef.current) {
        const currentBodyScrollHeight = bodyRef.current.scrollHeight;

        // Ne mesurer que si scrollHeight a vraiment changé (changement de contenu)
        if (currentBodyScrollHeight !== lastBodyScrollHeight) {
          lastBodyScrollHeight = currentBodyScrollHeight;
          debouncedMeasure();
        }
        // Sinon, c'est juste un redimensionnement de fenêtre, on ignore
      }
    });

    if (bodyRef.current) {
      // Initialiser le scrollHeight
      lastBodyScrollHeight = bodyRef.current.scrollHeight;
      observer.observe(bodyRef.current);
    }

    // Observer les mutations DOM pour détecter les changements dans le HTML injecté
    const mutationObserver = new MutationObserver(debouncedMeasure);

    if (bodyRef.current) {
      mutationObserver.observe(bodyRef.current, {
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
  }, [bodyRef, measureHeight, ...dependencies]);

  return density;
};
