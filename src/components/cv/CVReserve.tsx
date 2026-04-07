import React, { useState, useRef } from "react";
import { GripVertical, Search, X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CVLayoutItem, CVItemsResponse } from "../../services/api";

interface CVReserveProps {
  cvItems: CVItemsResponse;
  layout: CVLayoutItem[];
  onRemoveItem: (type: CVLayoutItem["type"], id: string) => void;
  onAddItem: (type: CVLayoutItem["type"], id: string) => void;
}

type ItemType = CVLayoutItem["type"];
type TabType = "all" | "left" | "right";

// Couleurs par catégorie pour les items (avec support dark mode)
const TYPE_COLORS: Record<
  ItemType,
  {
    bg: string;
    border: string;
    text: string;
    selectedBg: string;
    selectedBorder: string;
    iconColor: string;
  }
> = {
  skill: {
    bg: "bg-theme-card",
    border: "border-emerald-300 dark:border-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
    selectedBg: "bg-emerald-100 dark:bg-emerald-900/30",
    selectedBorder: "border-emerald-500 dark:border-emerald-400",
    iconColor: "text-emerald-400 dark:text-emerald-500",
  },
  language: {
    bg: "bg-theme-card",
    border: "border-purple-300 dark:border-purple-600",
    text: "text-purple-700 dark:text-purple-300",
    selectedBg: "bg-purple-100 dark:bg-purple-900/30",
    selectedBorder: "border-purple-500 dark:border-purple-400",
    iconColor: "text-purple-400 dark:text-purple-500",
  },
  certification: {
    bg: "bg-theme-card",
    border: "border-orange-300 dark:border-orange-600",
    text: "text-orange-700 dark:text-orange-300",
    selectedBg: "bg-orange-100 dark:bg-orange-900/30",
    selectedBorder: "border-orange-500 dark:border-orange-400",
    iconColor: "text-orange-400 dark:text-orange-500",
  },
  interest: {
    bg: "bg-theme-card",
    border: "border-pink-300 dark:border-pink-600",
    text: "text-pink-700 dark:text-pink-300",
    selectedBg: "bg-pink-100 dark:bg-pink-900/30",
    selectedBorder: "border-pink-500 dark:border-pink-400",
    iconColor: "text-pink-400 dark:text-pink-500",
  },
  experience: {
    bg: "bg-theme-card",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-300",
    selectedBg: "bg-blue-100 dark:bg-blue-900/30",
    selectedBorder: "border-blue-500 dark:border-blue-400",
    iconColor: "text-blue-400 dark:text-blue-500",
  },
  education: {
    bg: "bg-theme-card",
    border: "border-teal-300 dark:border-teal-600",
    text: "text-teal-700 dark:text-teal-300",
    selectedBg: "bg-teal-100 dark:bg-teal-900/30",
    selectedBorder: "border-teal-500 dark:border-teal-400",
    iconColor: "text-teal-400 dark:text-teal-500",
  },
  project: {
    bg: "bg-theme-card",
    border: "border-rose-300 dark:border-rose-600",
    text: "text-rose-700 dark:text-rose-300",
    selectedBg: "bg-rose-100 dark:bg-rose-900/30",
    selectedBorder: "border-rose-500 dark:border-rose-400",
    iconColor: "text-rose-400 dark:text-rose-500",
  },
  bio: {
    bg: "bg-theme-card",
    border: "border-indigo-300 dark:border-indigo-600",
    text: "text-indigo-700 dark:text-indigo-300",
    selectedBg: "bg-indigo-100 dark:bg-indigo-900/30",
    selectedBorder: "border-indigo-500 dark:border-indigo-400",
    iconColor: "text-indigo-400 dark:text-indigo-500",
  },
};

// Composant draggable pour un item
interface DraggableItemProps {
  type: ItemType;
  id: string;
  label: string;
  isInLayout: boolean;
  category?: string;
  onRemove: (type: ItemType, id: string) => void;
  onAdd: (type: ItemType, id: string) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  type,
  id,
  label,
  isInLayout,
  category,
  onRemove,
  onAdd,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `reserve-${type}-${id}`,
      data: {
        type,
        id,
        source: "reserve",
      },
    });

  const colors = TYPE_COLORS[type] || TYPE_COLORS.skill;
  const style = isDragging
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-1.5 p-2 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${
        isInLayout
          ? `${colors.selectedBg} ${colors.selectedBorder} shadow-theme-sm`
          : `${colors.bg} ${colors.border} hover:shadow-theme-md hover:scale-[1.01]`
      } ${isDragging ? "opacity-0 pointer-events-none h-0 overflow-hidden" : ""}`}
    >
      <div className="cursor-grab active:cursor-grabbing flex-shrink-0 pointer-events-none">
        <GripVertical
          size={14}
          className={isInLayout ? colors.text : colors.iconColor}
        />
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <p
          className={`text-xs font-medium truncate ${isInLayout ? colors.text : "text-theme-text-primary"}`}
        >
          {label}
        </p>
        {category && (
          <p
            className={`text-[10px] truncate ${isInLayout ? colors.text + "/70" : "text-theme-text-muted"}`}
          >
            {category}
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0 pointer-events-auto">
        {isInLayout ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(type, id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Retirer du CV"
          >
            <X size={14} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(type, id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-[10px] font-medium bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
            title="Ajouter au CV"
          >
            Ajouter
          </button>
        )}
      </div>
    </div>
  );
};

export const CVReserve: React.FC<CVReserveProps> = ({
  cvItems,
  layout,
  onRemoveItem,
  onAddItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Refs pour chaque section pour le scroll
  const skillSectionRef = useRef<HTMLDivElement>(null);
  const languageSectionRef = useRef<HTMLDivElement>(null);
  const certificationSectionRef = useRef<HTMLDivElement>(null);
  const interestSectionRef = useRef<HTMLDivElement>(null);
  const experienceSectionRef = useRef<HTMLDivElement>(null);
  const educationSectionRef = useRef<HTMLDivElement>(null);
  const projectSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fonction pour scroller vers une section (uniquement dans la Réserve)
  const scrollToSection = (type: ItemType) => {
    const refs: Record<ItemType, React.RefObject<HTMLDivElement> | null> = {
      skill: skillSectionRef,
      language: languageSectionRef,
      certification: certificationSectionRef,
      interest: interestSectionRef,
      experience: experienceSectionRef,
      education: educationSectionRef,
      project: projectSectionRef,
      bio: null,
    };

    const ref = refs[type];
    const container = scrollContainerRef.current;

    if (ref?.current && container) {
      // Calculer la position relative de la section dans le conteneur
      const containerRect = container.getBoundingClientRect();
      const sectionRect = ref.current.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const relativeTop = sectionRect.top - containerRect.top + scrollTop;

      // Scroller uniquement dans le conteneur
      container.scrollTo({
        top: relativeTop - 16, // 16px de padding en haut
        behavior: "smooth",
      });
    }
  };

  // Vérifier si un item est dans le layout
  const isInLayout = (type: ItemType, id: string) => {
    return layout.some((item) => item.type === type && item.id === id);
  };

  // Filtrer les items selon le tab actif
  const getFilteredItems = () => {
    let items: Array<{
      type: ItemType;
      id: string;
      label: string;
      category?: string;
    }> = [];

    if (activeTab === "left" || activeTab === "all") {
      // Certifications
      cvItems.certifications.items.forEach((cert) => {
        items.push({
          type: "certification",
          id: cert.id,
          label: `${cert.name} - ${cert.issuer}`,
          category: cert.date_obtained
            ? new Date(cert.date_obtained).getFullYear().toString()
            : undefined,
        });
      });

      // Langues
      cvItems.languages.items.forEach((lang) => {
        items.push({
          type: "language",
          id: lang.id,
          label: `${lang.name} (${lang.level})`,
        });
      });

      // Compétences (sans catégorie - uniquement le nom)
      cvItems.skills.items.forEach((skill) => {
        items.push({
          type: "skill",
          id: skill.id,
          label: skill.name,
          // Catégorie non affichée pour les compétences dans le CV
        });
      });

      // Centres d'intérêt
      if (cvItems.interests && cvItems.interests.items) {
        cvItems.interests.items.forEach((interest) => {
          items.push({
            type: "interest",
            id: interest.id,
            label: interest.name,
          });
        });
      }
    }

    if (activeTab === "right" || activeTab === "all") {
      // Expériences
      cvItems.experiences.items.forEach((exp) => {
        items.push({
          type: "experience",
          id: exp.id,
          label: `${exp.title} - ${exp.company}`,
          category: exp.start_date
            ? new Date(exp.start_date).getFullYear().toString()
            : undefined,
        });
      });

      // Formations
      cvItems.education.items.forEach((edu) => {
        items.push({
          type: "education",
          id: edu.id,
          label: `${edu.degree} - ${edu.school}`,
          category: edu.end_date
            ? new Date(edu.end_date).getFullYear().toString()
            : undefined,
        });
      });

      // Projets
      cvItems.projects.items.forEach((proj) => {
        items.push({
          type: "project",
          id: proj.id,
          label: proj.name,
        });
      });
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query)),
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="h-full flex flex-col bg-theme-card rounded-lg border border-theme-card-border shadow-theme-sm transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-theme-border">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-3">
          La Réserve
        </h3>

        {/* Recherche */}
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-theme-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-theme-bg-secondary text-theme-text-primary transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setActiveTab("left")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === "left"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            Gauche
          </button>
          <button
            onClick={() => setActiveTab("right")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === "right"
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            Droite
          </button>
        </div>

        {/* Indicateur de catégories sous les tabs - Cliquables - Centré et légèrement plus petit */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {activeTab === "left" || activeTab === "all" ? (
            <>
              <button
                onClick={() => scrollToSection("skill")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
              >
                Compétences
              </button>
              <button
                onClick={() => scrollToSection("language")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
              >
                Langues
              </button>
              <button
                onClick={() => scrollToSection("certification")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors cursor-pointer"
              >
                Certifications
              </button>
              <button
                onClick={() => scrollToSection("interest")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors cursor-pointer"
              >
                Centres d'intérêt
              </button>
            </>
          ) : null}
          {activeTab === "right" || activeTab === "all" ? (
            <>
              <button
                onClick={() => scrollToSection("experience")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
              >
                Expériences
              </button>
              <button
                onClick={() => scrollToSection("education")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
              >
                Formations
              </button>
              <button
                onClick={() => scrollToSection("project")}
                className="text-[11px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-medium hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
              >
                Projets
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Liste des items - Groupés par catégorie */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-4"
      >
        {filteredItems.length === 0 ? (
          <div className="text-center text-theme-text-muted text-sm py-8">
            {searchQuery ? "Aucun résultat" : "Aucun élément disponible"}
          </div>
        ) : (
          <>
            {/* Compétences */}
            {filteredItems.some((item) => item.type === "skill") && (
              <div ref={skillSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.skill.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Compétences
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "skill")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Langues */}
            {filteredItems.some((item) => item.type === "language") && (
              <div ref={languageSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.language.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-purple-500" />
                  Langues
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "language")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {filteredItems.some((item) => item.type === "certification") && (
              <div ref={certificationSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.certification.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-orange-500" />
                  Certifications
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "certification")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Centres d'intérêt */}
            {filteredItems.some((item) => item.type === "interest") && (
              <div ref={interestSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.interest.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-pink-500" />
                  Centres d'intérêt
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "interest")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Expériences */}
            {filteredItems.some((item) => item.type === "experience") && (
              <div ref={experienceSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.experience.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-blue-500" />
                  Expériences
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "experience")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Formations */}
            {filteredItems.some((item) => item.type === "education") && (
              <div ref={educationSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.education.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-teal-500" />
                  Formations
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "education")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Projets */}
            {filteredItems.some((item) => item.type === "project") && (
              <div ref={projectSectionRef}>
                <h4
                  className={`text-[10px] font-semibold ${TYPE_COLORS.project.text} uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-rose-500" />
                  Projets
                </h4>
                <div className="space-y-1.5">
                  {filteredItems
                    .filter((item) => item.type === "project")
                    .map((item) => (
                      <DraggableItem
                        key={`${item.type}-${item.id}`}
                        type={item.type}
                        id={item.id}
                        label={item.label}
                        category={item.category}
                        isInLayout={isInLayout(item.type, item.id)}
                        onRemove={onRemoveItem}
                        onAdd={onAddItem}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
