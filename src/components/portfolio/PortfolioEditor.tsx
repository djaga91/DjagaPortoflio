import React from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PortfolioSection,
  PortfolioSectionType,
  PortfolioSectionInfo,
} from "../../types";

interface PortfolioEditorProps {
  sections: PortfolioSection[];
  onReorder: (sections: PortfolioSection[]) => void;
  onToggleVisibility: (sectionId: string) => void;
}

// Informations sur chaque section
const SECTION_INFOS: Record<PortfolioSectionType, PortfolioSectionInfo> = {
  hero: {
    type: "hero",
    label: "Hero",
    icon: "👤",
    description: "Section principale avec photo et nom",
    defaultVisible: true,
    defaultOrder: 0,
  },
  about: {
    type: "about",
    label: "À propos",
    icon: "📝",
    description: "Biographie et description",
    defaultVisible: true,
    defaultOrder: 1,
  },
  experiences: {
    type: "experiences",
    label: "Expériences",
    icon: "💼",
    description: "Liste des expériences professionnelles",
    defaultVisible: true,
    defaultOrder: 2,
  },
  education: {
    type: "education",
    label: "Formation",
    icon: "🎓",
    description: "Parcours éducatif",
    defaultVisible: true,
    defaultOrder: 3,
  },
  projects: {
    type: "projects",
    label: "Projets",
    icon: "🚀",
    description: "Portfolio de projets",
    defaultVisible: true,
    defaultOrder: 4,
  },
  skills: {
    type: "skills",
    label: "Compétences",
    icon: "⚡",
    description: "Liste des compétences",
    defaultVisible: true,
    defaultOrder: 5,
  },
  languages: {
    type: "languages",
    label: "Langues",
    icon: "🌍",
    description: "Langues maîtrisées",
    defaultVisible: true,
    defaultOrder: 6,
  },
  certifications: {
    type: "certifications",
    label: "Certifications",
    icon: "🏆",
    description: "Certifications obtenues",
    defaultVisible: true,
    defaultOrder: 7,
  },
  interests: {
    type: "interests",
    label: "Centres d'intérêt",
    icon: "🎯",
    description: "Centres d'intérêt",
    defaultVisible: true,
    defaultOrder: 8,
  },
  contact: {
    type: "contact",
    label: "Contact",
    icon: "📧",
    description: "Liens sociaux et contact",
    defaultVisible: true,
    defaultOrder: 9,
  },
};

// Composant pour une section draggable
interface SortableSectionItemProps {
  section: PortfolioSection;
  onToggleVisibility: (sectionId: string) => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  onToggleVisibility,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const sectionInfo = SECTION_INFOS[section.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-theme-card border-2 rounded-xl p-4 mb-3 transition-all ${
        section.visible
          ? "border-theme-border hover:border-orange-500 hover:shadow-md"
          : "border-theme-border-secondary opacity-60"
      } ${isDragging ? "shadow-xl border-orange-500 z-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        {/* Handle de drag - plus visible */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-theme-text-muted hover:text-orange-500 transition-colors p-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
          title="Glissez pour réorganiser"
        >
          <GripVertical size={20} />
        </div>

        {/* Icône */}
        <div className="text-2xl">{sectionInfo.icon}</div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{sectionInfo.icon}</span>
            <h3 className="font-semibold text-theme-text-primary">
              {sectionInfo.label}
            </h3>
            {!section.visible && (
              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                Masquée
              </span>
            )}
          </div>
          <p className="text-sm text-theme-text-muted mt-1">
            {sectionInfo.description}
          </p>
        </div>

        {/* Toggle visibility */}
        <button
          onClick={() => onToggleVisibility(section.id)}
          className={`p-2 rounded-lg transition-colors ${
            section.visible
              ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
              : "text-theme-text-muted hover:bg-theme-bg-tertiary"
          }`}
          title={section.visible ? "Masquer la section" : "Afficher la section"}
        >
          {section.visible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
    </div>
  );
};

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  sections,
  onReorder,
  onToggleVisibility,
}) => {
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    // Mettre à jour les ordres
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    onReorder(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    // Mettre à jour les ordres
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    onReorder(newSections);
  };

  // Trier les sections par ordre
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {/* Instructions d'utilisation */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 mb-2">
        <p className="text-xs text-orange-800 dark:text-orange-200 font-medium mb-1">
          💡 Glissez pour réorganiser, cliquez sur l'œil pour afficher/masquer
        </p>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {sortedSections.length === 0 ? (
          <div className="text-center text-theme-text-muted text-sm py-8">
            Aucune section disponible
          </div>
        ) : (
          <SortableContext
            items={sortedSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedSections.map((section, index) => (
                <div key={section.id} className="relative group">
                  <SortableSectionItem
                    section={section}
                    onToggleVisibility={onToggleVisibility}
                  />
                  {/* Boutons de déplacement */}
                  <div className="absolute right-14 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={`p-1 rounded ${
                        index === 0
                          ? "text-theme-text-muted/30 cursor-not-allowed"
                          : "text-theme-text-muted hover:bg-theme-bg-tertiary hover:text-theme-text-primary"
                      }`}
                      title="Monter"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sortedSections.length - 1}
                      className={`p-1 rounded ${
                        index === sortedSections.length - 1
                          ? "text-theme-text-muted/30 cursor-not-allowed"
                          : "text-theme-text-muted hover:bg-theme-bg-tertiary hover:text-theme-text-primary"
                      }`}
                      title="Descendre"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};
