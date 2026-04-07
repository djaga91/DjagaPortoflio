/**
 * Composant pour modifier l'image ou l'icône d'un projet directement depuis le portfolio
 */

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { projectsAPI } from "../../services/api";
import { IconSelector } from "../IconSelector";
import { useGameStore } from "../../store/gameStore";
import type { Project } from "../../services/api";

interface ProjectImageIconEditorProps {
  project: Project;
  onUpdate: () => void;
  isDark?: boolean;
}

export const ProjectImageIconEditor: React.FC<ProjectImageIconEditorProps> = ({
  project,
  onUpdate,
  isDark = false,
}) => {
  const { updateProject } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [displayType, setDisplayType] = useState<"image" | "icon">(
    project.project_icon ? "icon" : "image",
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project.id) return;
    setIsUploading(true);
    try {
      const { url_image } = await projectsAPI.uploadImage(project.id, file);
      await updateProject(project.id, {
        url_image,
        project_icon: null, // Retirer l'icône si on met une image
      });
      onUpdate();
      setIsOpen(false);
    } catch (err) {
      console.error("Erreur upload image projet:", err);
      alert(
        "Erreur lors du téléversement. Vérifiez le format (JPG, PNG, GIF, WEBP) et la taille.",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleIconSelect = async (iconName: string | null) => {
    try {
      await updateProject(project.id, {
        project_icon: iconName,
        url_image: null, // Retirer l'image si on met une icône
      });
      onUpdate();
      setIsOpen(false);
    } catch (err) {
      console.error("Erreur mise à jour icône:", err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <>
      {/* Bouton flottant sur le projet */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Empêcher l'ouverture du modal de description du projet
          setIsOpen(true);
        }}
        className={`absolute top-2 right-2 z-40 p-2 rounded-lg backdrop-blur-sm transition-all hover:scale-110 ${
          isDark
            ? "bg-black/50 text-white hover:bg-black/70"
            : "bg-white/80 text-gray-900 hover:bg-white"
        } shadow-lg`}
        title="Modifier l'image ou l'icône"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ImageIcon size={18} />
      </button>

      {/* Modal d'édition - rendu avec portal pour sortir du conteneur du projet */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={(e) => {
              e.stopPropagation(); // Empêcher la propagation vers le parent
              setIsOpen(false); // Fermer le modal si on clique sur le fond
            }}
          >
            <div
              className="w-full max-w-2xl bg-theme-card rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()} // Empêcher la fermeture si on clique sur le contenu
            >
              {/* Header */}
              <div className="p-6 border-b border-theme-card-border flex justify-between items-center">
                <h3 className="text-xl font-bold text-theme-text-primary">
                  Modifier le visuel du projet : {project.name}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-theme-bg-secondary rounded-xl transition-colors"
                >
                  <X size={24} className="text-theme-text-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Toggle Image/Icône */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setDisplayType("image")}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      displayType === "image"
                        ? "bg-[#6366F1] text-white shadow-lg"
                        : "bg-theme-bg-secondary text-theme-text-muted hover:bg-theme-bg-secondary/80"
                    }`}
                  >
                    <ImageIcon size={16} className="inline mr-2" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayType("icon")}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      displayType === "icon"
                        ? "bg-[#6366F1] text-white shadow-lg"
                        : "bg-theme-bg-secondary text-theme-text-muted hover:bg-theme-bg-secondary/80"
                    }`}
                  >
                    🎨 Icône
                  </button>
                </div>

                {/* Section Image */}
                {displayType === "image" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Téléversement…
                        </>
                      ) : (
                        <>
                          <ImageIcon size={18} />
                          Téléverser une image
                        </>
                      )}
                    </button>
                    {project.url_image && (
                      <p className="text-xs text-theme-text-muted mt-2 text-center">
                        Image actuelle définie
                      </p>
                    )}
                  </div>
                )}

                {/* Section Icône */}
                {displayType === "icon" && (
                  <IconSelector
                    selectedIcon={project.project_icon || null}
                    onSelectIcon={handleIconSelect}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
