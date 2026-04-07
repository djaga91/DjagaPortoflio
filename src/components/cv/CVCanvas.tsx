import React, { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import DOMPurify from "dompurify";
import { CVLayoutItem } from "../../services/api";

interface CVCanvasProps {
  previewHtml: string;
  isDragging: boolean;
  draggingType?: CVLayoutItem["type"];
  onDragOver?: (zone: "left" | "right" | null) => void;
}

// Types qui vont dans chaque colonne
const LEFT_COLUMN_TYPES: CVLayoutItem["type"][] = [
  "certification",
  "language",
  "skill",
];
const RIGHT_COLUMN_TYPES: CVLayoutItem["type"][] = [
  "experience",
  "education",
  "project",
  "bio",
];

// Zone de drop pour colonne gauche
const LeftColumnDropZone: React.FC<{
  isDragging: boolean;
  draggingType?: CVLayoutItem["type"];
  onDragOver: (zone: "left" | null) => void;
}> = ({ isDragging, draggingType, onDragOver }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "drop-zone-left",
    data: {
      accepts: LEFT_COLUMN_TYPES,
    },
  });

  const canAccept = draggingType && LEFT_COLUMN_TYPES.includes(draggingType);
  const isActive = isDragging && canAccept; // Afficher dès qu'on prend un badge compatible
  const isDisabled =
    isDragging && draggingType && !LEFT_COLUMN_TYPES.includes(draggingType);

  useEffect(() => {
    if (isOver && canAccept) {
      onDragOver("left");
    } else if (!isDragging || !canAccept) {
      onDragOver(null);
    }
  }, [isOver, canAccept, isDragging, onDragOver]);

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-0 top-0 w-[32%] z-20 transition-all pointer-events-auto ${
        isActive
          ? "bg-emerald-100/80 border-2 border-emerald-500 border-dashed"
          : isDisabled
            ? "bg-gray-100/50 opacity-50"
            : ""
      }`}
      style={{ height: "100%", minHeight: "100%" }}
    >
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-xl font-semibold animate-pulse">
            Insérer ici
          </div>
        </div>
      )}
    </div>
  );
};

// Zone de drop pour colonne droite
const RightColumnDropZone: React.FC<{
  isDragging: boolean;
  draggingType?: CVLayoutItem["type"];
  onDragOver: (zone: "right" | null) => void;
}> = ({ isDragging, draggingType, onDragOver }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "drop-zone-right",
    data: {
      accepts: RIGHT_COLUMN_TYPES,
    },
  });

  const canAccept = draggingType && RIGHT_COLUMN_TYPES.includes(draggingType);
  const isActive = isDragging && canAccept; // Afficher dès qu'on prend un badge compatible
  const isDisabled =
    isDragging && draggingType && !RIGHT_COLUMN_TYPES.includes(draggingType);

  useEffect(() => {
    if (isOver && canAccept) {
      onDragOver("right");
    } else if (!isDragging || !canAccept) {
      onDragOver(null);
    }
  }, [isOver, canAccept, isDragging, onDragOver]);

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-[32%] top-0 w-[68%] z-20 transition-all pointer-events-auto ${
        isActive
          ? "bg-purple-100/80 border-2 border-purple-500 border-dashed"
          : isDisabled
            ? "bg-gray-100/50 opacity-50"
            : ""
      }`}
      style={{ height: "100%", minHeight: "100%" }}
    >
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-xl font-semibold animate-pulse">
            Insérer ici
          </div>
        </div>
      )}
    </div>
  );
};

export const CVCanvas: React.FC<CVCanvasProps> = ({
  previewHtml,
  isDragging,
  draggingType,
  onDragOver,
}) => {
  const [activeZone, setActiveZone] = useState<"left" | "right" | null>(null);
  const [bodyContent, setBodyContent] = useState<string>("");

  const handleDragOver = (zone: "left" | "right" | null) => {
    setActiveZone(zone);
    onDragOver?.(zone);
  };

  // Extraire le contenu du body depuis le HTML complet
  useEffect(() => {
    if (!previewHtml || previewHtml.trim().length === 0) {
      setBodyContent("");
      return;
    }

    // Créer un parser DOM temporaire pour extraire proprement le contenu
    const parser = new DOMParser();
    const doc = parser.parseFromString(previewHtml, "text/html");

    // Extraire les styles du <head>
    const headStyles = Array.from(doc.head.querySelectorAll("style"))
      .map((style) => style.outerHTML)
      .join("");

    // Extraire le contenu du <body>
    const bodyElement = doc.body;
    if (bodyElement) {
      const bodyContent = headStyles + bodyElement.innerHTML;

      // Vérifier que le contenu n'est pas vide
      if (bodyContent.trim().length === 0) {
        console.error("❌ CVCanvas - bodyContent est vide après extraction !", {
          previewHtmlLength: previewHtml.length,
          previewHtmlStart: previewHtml.substring(0, 500),
        });
      }

      setBodyContent(bodyContent);
    } else {
      // Si pas de <body>, essayer de trouver le contenu directement
      // Peut-être que le HTML est juste le contenu sans structure complète
      const bodyMatch = previewHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        const headMatch = previewHtml.match(/<head[^>]*>([\s\S]*)<\/head>/i);
        let stylesHtml = "";
        if (headMatch && headMatch[1]) {
          const styleMatch = headMatch[1].match(
            /<style[^>]*>([\s\S]*)<\/style>/gi,
          );
          if (styleMatch) {
            stylesHtml = styleMatch.join("");
          }
        }
        setBodyContent(stylesHtml + bodyMatch[1]);
      } else {
        // Dernier recours : utiliser le HTML tel quel
        console.warn(
          "⚠️ CVCanvas - Pas de <body> trouvé, utilisation du HTML tel quel",
          {
            previewHtmlLength: previewHtml.length,
            previewHtmlStart: previewHtml.substring(0, 200),
          },
        );
        setBodyContent(previewHtml);
      }
    }
  }, [previewHtml]);

  return (
    <div className="relative w-full h-full">
      {/* Preview HTML en arrière-plan */}
      {bodyContent && bodyContent.trim().length > 0 ? (
        <div
          className={`relative z-0 transition-all duration-200 ${
            activeZone === "left"
              ? "[&_.cv-sidebar]:brightness-110 [&_.cv-main]:opacity-40 [&_.cv-main]:grayscale"
              : activeZone === "right"
                ? "[&_.cv-main]:brightness-110 [&_.cv-sidebar]:opacity-40 [&_.cv-sidebar]:grayscale"
                : isDragging &&
                    draggingType &&
                    LEFT_COLUMN_TYPES.includes(draggingType)
                  ? "[&_.cv-main]:opacity-50 [&_.cv-main]:grayscale"
                  : isDragging &&
                      draggingType &&
                      RIGHT_COLUMN_TYPES.includes(draggingType)
                    ? "[&_.cv-sidebar]:opacity-50 [&_.cv-sidebar]:grayscale"
                    : ""
          }`}
          dangerouslySetInnerHTML={{
            __html: (() => {
              // IMPORTANT : Le contenu du CV vient du backend et est déjà sécurisé
              // DOMPurify supprime les balises <style> par défaut, ce qui casse l'affichage
              // On extrait d'abord les styles, puis on sanitize le reste, puis on réinjecte les styles

              // 1. Extraire les styles du bodyContent original
              const styleMatches =
                bodyContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
              const stylesHtml = styleMatches.join("");

              // 2. Retirer les styles du contenu avant sanitization
              const contentWithoutStyles = bodyContent.replace(
                /<style[^>]*>[\s\S]*?<\/style>/gi,
                "",
              );

              // 3. Sanitizer le contenu sans les styles
              const sanitized = DOMPurify.sanitize(contentWithoutStyles, {
                ALLOWED_TAGS: [
                  "div",
                  "span",
                  "p",
                  "h1",
                  "h2",
                  "h3",
                  "h4",
                  "h5",
                  "h6",
                  "a",
                  "ul",
                  "ol",
                  "li",
                  "strong",
                  "em",
                  "b",
                  "i",
                  "br",
                  "hr",
                  "img",
                  "section",
                  "header",
                  "main",
                  "article",
                  "aside",
                  "footer",
                  "svg",
                  "path",
                  "g",
                  "circle",
                  "rect",
                  "line",
                  "polyline",
                  "polygon",
                  "ellipse",
                  "text",
                  "tspan",
                ],
                ALLOWED_ATTR: [
                  "class",
                  "id",
                  "style",
                  "href",
                  "src",
                  "alt",
                  "title",
                  "target",
                  "rel",
                  "viewBox",
                  "xmlns",
                  "d",
                  "fill",
                  "stroke",
                  "stroke-width",
                  "stroke-linecap",
                  "stroke-linejoin",
                  "width",
                  "height",
                  "x",
                  "y",
                  "cx",
                  "cy",
                  "r",
                  "rx",
                  "ry",
                  "x1",
                  "y1",
                  "x2",
                  "y2",
                  "points",
                  "transform",
                ],
                ALLOWED_URI_REGEXP:
                  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                KEEP_CONTENT: true,
                FORCE_BODY: false,
                ADD_ATTR: ["class", "id", "style"],
              });

              // 4. Réinjecter les styles au début (ils doivent être dans le <head> ou au début du body)
              return stylesHtml + sanitized;
            })(),
          }}
          style={{
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 1,
            minHeight: "100%",
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>HTML vide ou invalide</p>
        </div>
      )}

      {/* Zones de drop superposées */}
      {isDragging && (
        <>
          <LeftColumnDropZone
            isDragging={isDragging}
            draggingType={draggingType}
            onDragOver={handleDragOver}
          />
          <RightColumnDropZone
            isDragging={isDragging}
            draggingType={draggingType}
            onDragOver={handleDragOver}
          />
        </>
      )}
    </div>
  );
};
