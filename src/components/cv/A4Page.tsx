import React, { useRef, useEffect, useState } from "react";
import {
  useDualColumnDensity,
  DualColumnDensity,
} from "../../hooks/useDualColumnDensity";
import {
  useSingleColumnDensity,
  SingleColumnDensity,
} from "../../hooks/useSingleColumnDensity";

interface A4PageProps {
  children: React.ReactNode;
  onHeightChange?: (height: number, percentage: number) => void;
  onDensityChange?: (density: DualColumnDensity | SingleColumnDensity) => void;
  previewZoom?: number; // Zoom appliqué au preview (1.0 = 100%)
  layoutKey?: string; // Clé pour forcer le recalcul quand le layout change
  isSingleColumn?: boolean; // Si true, utilise single column (LaTeX), sinon dual column (modern)
}

const A4_HEIGHT_PX = 1123; // 297mm à 96 DPI
const A4_WIDTH_PX = 794; // 210mm à 96 DPI

export const A4Page: React.FC<A4PageProps> = ({
  children,
  onHeightChange,
  onDensityChange,
  previewZoom = 1.0,
  layoutKey,
  isSingleColumn = false,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLElement>(null);
  const rightColRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLElement>(null);
  const [percentage, setPercentage] = useState(0);

  // Trouver les colonnes ou le body dans le HTML injecté
  useEffect(() => {
    const findElements = () => {
      if (pageRef.current) {
        if (isSingleColumn) {
          // Pour LaTeX : trouver .cv-body
          const body = pageRef.current.querySelector(".cv-body") as HTMLElement;
          if (body) {
            (bodyRef as React.MutableRefObject<HTMLElement>).current = body;
          }
        } else {
          // Pour modern : trouver .cv-sidebar et .cv-main
          const sidebar = pageRef.current.querySelector(
            ".cv-sidebar",
          ) as HTMLElement;
          const main = pageRef.current.querySelector(".cv-main") as HTMLElement;

          if (sidebar) {
            (leftColRef as React.MutableRefObject<HTMLElement>).current =
              sidebar;
          }
          if (main) {
            (rightColRef as React.MutableRefObject<HTMLElement>).current = main;
          }
        }
      }
    };

    findElements();
    const interval = setInterval(findElements, 200);
    return () => clearInterval(interval);
  }, [children, isSingleColumn]);

  // Utiliser le bon hook selon le mode
  const dualDensity = useDualColumnDensity(
    leftColRef,
    rightColRef,
    [children, layoutKey], // Recalculer quand children ou layout change (pas previewZoom)
  );

  const singleDensity = useSingleColumnDensity(bodyRef, [children, layoutKey]);

  const density = isSingleColumn ? singleDensity : dualDensity;

  // Passer les résultats via callback
  useEffect(() => {
    if (onDensityChange) {
      onDensityChange(density);
    }
  }, [density, onDensityChange]);

  useEffect(() => {
    const measureHeight = () => {
      if (pageRef.current) {
        // Mesurer uniquement la colonne principale (cv-main) qui peut dépasser
        // La sidebar (cv-sidebar) a toujours une hauteur fixe, donc on l'ignore
        const cvMain = pageRef.current.querySelector(".cv-main") as HTMLElement;
        const cvContainer = pageRef.current.querySelector(
          ".cv-container",
        ) as HTMLElement;

        if (cvMain) {
          // Forcer le recalcul en accédant à offsetHeight
          cvMain.offsetHeight;

          // scrollHeight donne la hauteur réelle du contenu de la colonne principale
          const mainHeight = cvMain.scrollHeight;

          // Si on a le conteneur, on peut aussi mesurer le header pour avoir la hauteur totale
          let headerHeight = 0;
          if (cvContainer) {
            const cvHeader = cvContainer.querySelector(
              ".cv-header",
            ) as HTMLElement;
            if (cvHeader) {
              headerHeight =
                cvHeader.offsetHeight ||
                cvHeader.getBoundingClientRect().height ||
                0;
            }
          }

          // Hauteur totale = header + colonne principale (la sidebar est ignorée car fixe)
          const totalHeight = headerHeight + mainHeight;

          const calculatedPercentage = Math.min(
            (totalHeight / A4_HEIGHT_PX) * 100,
            110,
          );
          setPercentage(calculatedPercentage);
          onHeightChange?.(totalHeight, calculatedPercentage);
        } else if (cvContainer) {
          // Fallback : mesurer le conteneur complet si cv-main n'existe pas
          cvContainer.offsetHeight;
          const currentHeight = cvContainer.scrollHeight;
          const calculatedPercentage = Math.min(
            (currentHeight / A4_HEIGHT_PX) * 100,
            110,
          );
          setPercentage(calculatedPercentage);
          onHeightChange?.(currentHeight, calculatedPercentage);
        } else {
          // Dernier fallback : mesurer le conteneur parent
          const currentHeight = pageRef.current.scrollHeight;
          const calculatedPercentage = Math.min(
            (currentHeight / A4_HEIGHT_PX) * 100,
            110,
          );
          setPercentage(calculatedPercentage);
          onHeightChange?.(currentHeight, calculatedPercentage);
        }
      }
    };

    // Mesurer après un court délai pour laisser le HTML se rendre
    const initialTimeout = setTimeout(measureHeight, 200);

    // Observer les changements de taille
    const observer = new ResizeObserver(() => {
      measureHeight();
    });

    if (pageRef.current) {
      observer.observe(pageRef.current);
    }

    // Observer aussi les changements dans le contenu HTML injecté
    const interval = setInterval(measureHeight, 400);

    // Observer les mutations DOM pour détecter les changements dans le HTML injecté
    const mutationObserver = new MutationObserver(() => {
      setTimeout(measureHeight, 50);
    });

    if (pageRef.current) {
      mutationObserver.observe(pageRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => {
      clearTimeout(initialTimeout);
      observer.disconnect();
      clearInterval(interval);
      mutationObserver.disconnect();
    };
  }, [children, onHeightChange]);

  // Appliquer le zoom au conteneur CV si défini
  // IMPORTANT : Surveiller aussi children (qui change quand previewHtml change) pour réappliquer le zoom
  useEffect(() => {
    if (pageRef.current) {
      const container = pageRef.current.querySelector(
        ".cv-container",
      ) as HTMLElement;
      if (container) {
        if (previewZoom !== 1.0) {
          // IMPORTANT : Appliquer le zoom immédiatement et forcer un reflow
          container.style.transform = `scale(${previewZoom})`;
          container.style.transformOrigin = "top center";
          container.style.width = `${100 / previewZoom}%`;
          // S'assurer que le fond blanc continue même avec le zoom
          container.style.background = "white";
          // Forcer un reflow pour s'assurer que le zoom est appliqué
          container.offsetHeight; // Force reflow
        } else {
          // Réinitialiser le zoom si on revient à 100%
          container.style.transform = "";
          container.style.transformOrigin = "";
          container.style.width = "";
          // Le fond blanc vient uniquement du .cv-container qui s'étend
          container.style.background = "white";
          // Le body n'a pas besoin de fond blanc séparé - il hérite du parent pour éviter les superpositions
          const cvBody = container.querySelector(".cv-body") as HTMLElement;
          if (cvBody) {
            cvBody.style.background = "transparent";
          }

          // Attendre un peu pour que le DOM se mette à jour
          // IMPORTANT : Le cadre visuel (.cv-preview-container) doit rester à la taille A4 exacte
          // Mais le contenu (.cv-container) peut dépasser avec un fond blanc qui continue
          setTimeout(() => {
            // Le conteneur parent (.cv-preview-container) reste à A4_HEIGHT_PX (taille A4 exacte)
            // Ne pas modifier sa hauteur - elle doit rester fixe à A4_HEIGHT_PX
            // Le contenu (.cv-container) à l'intérieur peut dépasser avec overflow: visible
            // Forcer un reflow pour que le fond blanc se réadapte
            container.offsetHeight; // Force reflow sur le container
            // Forcer aussi un reflow sur le body si présent
            if (cvBody) {
              cvBody.offsetHeight; // Force reflow
            }
          }, 50);
        }
      }
    }
  }, [previewZoom, children]); // Ajouter children pour réappliquer le zoom quand le HTML change

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerScale, setContainerScale] = useState<number>(1.0);

  // Calculer le scale pour adapter à la largeur maximale de la fenêtre
  // La hauteur n'est pas limitée - on permet le scroll vertical si nécessaire
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        // Largeur disponible = largeur du wrapper - padding du parent (p-4 = 16px de chaque côté = 32px)
        const containerWidth = wrapperRef.current.clientWidth - 32;

        // Calculer le scale basé UNIQUEMENT sur la largeur pour prendre le maximum d'espace
        const scaleWidth = containerWidth / A4_WIDTH_PX;
        const scale = Math.min(1.0, Math.max(0.4, scaleWidth)); // Min 40% pour rester lisible, max 100%

        setContainerScale(scale);
      }
    };

    // Attendre un peu que le DOM soit prêt
    const timeout = setTimeout(updateScale, 100);
    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    window.addEventListener("resize", updateScale);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="cv-preview-wrapper relative w-full"
      style={{ overflow: "visible", background: "transparent" }}
    >
      {/* Zone A4 avec dimensions FIXES en pixels CSS pour les calculs, mais adaptée visuellement à la fenêtre */}
      {/* IMPORTANT : Les dimensions CSS sont fixes (794px × 1123px) pour que les mesures soient constantes */}
      {/* Mais on applique un scale pour adapter visuellement à la fenêtre */}
      <div
        ref={pageRef}
        className="cv-preview-container relative mx-auto"
        style={{
          width: `${A4_WIDTH_PX}px`, // Largeur FIXE : 794px (taille A4 exacte)
          height: `${A4_HEIGHT_PX}px`, // Hauteur FIXE : 1123px (taille A4 exacte) - Le cadre représente une feuille A4
          minWidth: `${A4_WIDTH_PX}px`, // Force la largeur minimale
          maxWidth: `${A4_WIDTH_PX}px`, // Force la largeur maximale
          maxHeight: `${A4_HEIGHT_PX}px`, // Force la hauteur maximale (taille A4)
          position: "relative",
          overflow: "visible", // Permettre au contenu de dépasser pour être visible (le fond blanc continue)
          boxSizing: "border-box", // Inclure padding/border dans les dimensions
          // Appliquer le scale pour adapter visuellement à la fenêtre
          // Les dimensions restent fixes (794px × 1123px) pour représenter une feuille A4
          transform: containerScale < 1.0 ? `scale(${containerScale})` : "none",
          transformOrigin: "top center",
          // Pas de fond blanc ici pour éviter la superposition - le fond blanc vient du .cv-container
          background: "transparent",
          // Pas de marginBottom pour éviter les décalages
          // Le conteneur parent gère le centrage
          // Pas de border pour éviter le cadre supplémentaire
        }}
      >
        {children}

        {/* Ligne de fin de page A4 (pointillés rouges visibles) - Positionnée au-dessus de la marge du bas */}
        {/* Cette ligne indique la limite de la page A4, même si le contenu dépasse */}
        <div
          className="absolute left-0 right-0 z-30 pointer-events-none"
          style={{
            top: `${A4_HEIGHT_PX - 22.675}px`, // Position: hauteur A4 - padding bottom (6mm = 22.675px, réduit de moitié)
            height: "3px",
            borderTop: "3px dashed #ef4444",
            opacity: 1,
            boxShadow: "0 0 4px rgba(239, 68, 68, 0.5)",
            backgroundColor: "transparent",
          }}
        />

        {/* Zone de sécurité (95-100%) */}
        {percentage >= 95 && percentage < 100 && (
          <div
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{
              top: `${A4_HEIGHT_PX - 22.675}px`, // Position: hauteur A4 - padding bottom (6mm = 22.675px)
              height: `${(percentage - 95) * 20}px`,
              background:
                "linear-gradient(to top, rgba(251, 191, 36, 0.1), transparent)",
            }}
          />
        )}
      </div>

      {/* Style pour permettre le scroll dans le preview et adapter la sidebar */}
      {/* IMPORTANT : Le conteneur .cv-container doit avoir les dimensions A4 exactes */}
      <style>{`
        .cv-preview-container {
          /* Dimensions FIXES en pixels CSS - exactement 794px × 1123px (taille A4) */
          /* Le cadre visuel représente une feuille A4 exacte */
          width: ${A4_WIDTH_PX}px !important;
          height: ${A4_HEIGHT_PX}px !important;
          min-width: ${A4_WIDTH_PX}px !important;
          max-width: ${A4_WIDTH_PX}px !important;
          min-height: ${A4_HEIGHT_PX}px !important;
          max-height: ${A4_HEIGHT_PX}px !important;
          /* Le contenu peut dépasser (overflow: visible) mais le cadre reste à A4 */
          /* Pas de fond blanc ici - seul le .cv-container a un fond blanc qui suit les badges */
          /* Le trait rouge indique déjà la limite A4 */
          background: transparent !important;
        }
        .cv-preview-container .cv-container {
          overflow: visible !important;
          max-height: none !important;
          height: auto !important;
          min-height: ${A4_HEIGHT_PX}px !important;
          width: 100% !important;
          /* Le conteneur CV garde ses dimensions réelles en pixels CSS */
          /* Le fond blanc continue en dessous de la limite A4 pour que le contenu ne soit pas coupé */
          /* C'est le SEUL fond blanc - il suit les badges jusqu'en bas */
          background: white !important;
          /* S'assurer que le fond blanc s'étend sur toute la hauteur du contenu, pas seulement A4 */
          background-size: 100% auto !important;
          background-repeat: repeat-y !important;
        }
        /* Le body n'a pas besoin de fond blanc séparé - il hérite du parent .cv-container */
        /* Cela évite les superpositions de fond blanc */
        .cv-preview-container .cv-container .cv-body {
          background: transparent !important;
        }
        .cv-preview-container .cv-container .cv-sidebar {
          /* Le fond gris de la sidebar s'arrête à la limite A4, mais le fond blanc continue */
        }
        .cv-preview-container .cv-sidebar {
          height: auto !important;
          min-height: auto !important;
          max-height: none !important;
          /* Le fond gris s'adapte maintenant à la hauteur réelle du contenu */
        }
        .cv-preview-container .cv-body {
          height: auto !important;
          min-height: auto !important;
          max-height: none !important;
          /* Le body s'adapte aussi à la hauteur réelle */
        }
      `}</style>
    </div>
  );
};
