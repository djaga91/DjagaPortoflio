import React, { useState, useEffect, useRef } from "react";
import { X, Zap, CheckCircle, Lightbulb, ChevronDown } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import type { SkillCreate } from "../services/api";
import { SKILLS_DATABASE, SKILL_SUGGESTIONS } from "../config/skillsReference";

interface SkillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_GROUPS = [
  {
    label: "Technique",
    icon: "💻",
    categories: [
      "Langage de programmation",
      "Framework & Bibliothèque",
      "Base de données",
      "Data & Machine Learning",
      "Data Engineering & Big Data",
      "Cloud & DevOps",
      "Cybersécurité",
    ],
  },
  {
    label: "Outils",
    icon: "🛠️",
    categories: [
      "Outils de développement",
      "Outils collaboratifs & Productivité",
      "Outils bureautiques",
    ],
  },
  {
    label: "Design & Création",
    icon: "🎨",
    categories: ["Design & Créativité"],
  },
  {
    label: "Business & Management",
    icon: "💼",
    categories: [
      "Gestion de projet & Produit",
      "Marketing & Communication",
      "Business & Finance",
    ],
  },
  {
    label: "Compétences transversales",
    icon: "🤝",
    categories: ["Soft Skills", "Langues"],
  },
  {
    label: "Métiers techniques",
    icon: "⚙️",
    categories: [
      "Ingénierie & CAO",
      "Architecture & Construction",
      "Transport & Logistique",
    ],
  },
  {
    label: "Autres domaines",
    icon: "🏥",
    categories: [
      "Certifications & Permis",
      "Santé & Social",
      "Hôtellerie & Restauration",
      "Sciences & Recherche",
    ],
  },
  {
    label: "Divers",
    icon: "➕",
    categories: ["Autre"],
  },
];

export const SkillFormModal: React.FC<SkillFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createSkill, requireAuth, skills } = useGameStore();

  const [formData, setFormData] = useState<SkillCreate>({
    name: "",
    category: undefined,
    order: 0,
  });

  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = "hidden";

      setFormData({
        name: "",
        category: undefined,
        order: skills.length,
      });
      setShowSuggestions(false);
    }

    // Cleanup: restore body scroll when modal closes
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, skills.length]);

  useEffect(() => {
    if (formData.name.length > 0) {
      const filtered = SKILL_SUGGESTIONS.filter(
        (skill) =>
          skill.toLowerCase().includes(formData.name.toLowerCase()) &&
          skill.toLowerCase() !== formData.name.toLowerCase(),
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.name]);

  // Fermer le dropdown des catégories si on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    requireAuth(async () => {
      try {
        await createSkill(formData);
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Auto-remplir la catégorie si la compétence est dans la database
    const category = SKILLS_DATABASE[suggestion] || formData.category;
    setFormData({ ...formData, name: suggestion, category });
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-theme-card rounded-2xl md:rounded-3xl shadow-theme-xl w-full max-w-2xl mx-auto max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-5 md:p-6 lg:p-8 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative flex justify-between items-start gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="bg-white/20 backdrop-blur-sm p-2 md:p-3 rounded-xl md:rounded-2xl flex-shrink-0">
                <Zap className="text-white" size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                  Ajouter une compétence
                </h2>
                <p className="text-yellow-50 text-xs md:text-sm mt-0.5 md:mt-1 truncate">
                  Ajoutez une nouvelle compétence
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur-sm p-2 rounded-xl hover:bg-white/30 transition-colors text-white flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form - scrollable pour ne pas couper le dropdown catégories */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6 lg:p-8 space-y-4 md:space-y-5"
        >
          {/* Nom de la compétence */}
          <div className="relative">
            <label className="block text-sm font-bold text-theme-text-primary mb-2 flex items-center gap-2">
              Compétence <span className="text-red-500">*</span>
              {formData.name && SKILLS_DATABASE[formData.name] && (
                <span className="text-xs font-normal bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
                  <CheckCircle size={10} />
                  Reconnue
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: React, Python, Leadership..."
              required
              autoFocus
              className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-theme-text-primary focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
            />

            {/* Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-theme-card rounded-2xl shadow-theme-xl border border-theme-border overflow-hidden backdrop-blur-sm">
                  {/* Header élégant */}
                  <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={12} className="text-white" />
                      <p className="text-[10px] font-bold text-white tracking-wider uppercase">
                        Suggestions
                      </p>
                      <span className="ml-auto text-[10px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full">
                        {filteredSuggestions.length}
                      </span>
                    </div>
                  </div>

                  {/* Liste scrollable */}
                  <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    {filteredSuggestions.map((suggestion) => {
                      const category = SKILLS_DATABASE[suggestion];
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-yellow-50/80 hover:via-orange-50/50 hover:to-transparent dark:hover:from-yellow-900/20 dark:hover:via-orange-900/10 dark:hover:to-transparent transition-all duration-200 border-b border-theme-card-border last:border-0 group relative"
                        >
                          {/* Barre latérale au hover */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />

                          <div className="flex items-center justify-between gap-3 pl-3">
                            {/* Nom de la compétence */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-orange-500 group-hover:scale-125 transition-all duration-200 shadow-sm" />
                              <span className="font-semibold text-sm text-theme-text-secondary group-hover:text-theme-text-primary transition-colors truncate">
                                {suggestion}
                              </span>
                            </div>

                            {/* Badge catégorie */}
                            {category && (
                              <span className="flex-shrink-0 text-[9px] font-bold text-theme-text-muted bg-theme-bg-secondary px-2 py-0.5 rounded-md group-hover:bg-gradient-to-r group-hover:from-yellow-100 group-hover:to-orange-100 dark:group-hover:from-yellow-900/30 dark:group-hover:to-orange-900/30 group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-all duration-200 uppercase tracking-wide">
                                {category}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer avec indication */}
                  <div className="bg-theme-bg-secondary px-3 py-1.5 border-t border-theme-card-border">
                    <p className="text-[9px] text-theme-text-muted text-center font-medium tracking-wide">
                      Cliquez pour sélectionner • Catégorie auto-assignée
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Catégorie - Custom Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-bold text-theme-text-primary mb-2">
              Catégorie{" "}
              <span className="text-theme-text-muted font-normal text-xs">
                (optionnel)
              </span>
            </label>

            {/* Bouton principal */}
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full bg-gradient-to-br from-theme-bg-secondary to-theme-bg-secondary/50 border-2 border-theme-border rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 text-left flex items-center justify-between gap-2 md:gap-3 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all group"
            >
              <div className="flex items-center gap-2 md:gap-2.5 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover:scale-125 transition-transform flex-shrink-0" />
                <span
                  className={`text-sm md:text-base font-semibold truncate ${formData.category ? "text-theme-text-primary" : "text-theme-text-muted"}`}
                >
                  {formData.category || "Sélectionnez une catégorie"}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-theme-text-muted transition-transform duration-200 flex-shrink-0 ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown personnalisé - liste scrollable pour atteindre "Divers" */}
            {showCategoryDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-theme-card rounded-2xl shadow-theme-xl border border-theme-border overflow-hidden backdrop-blur-sm max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain custom-scrollbar">
                  {CATEGORY_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {/* Header du groupe (non sticky pour permettre le scroll jusqu'en bas) */}
                      <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 px-3 py-1.5 border-b border-theme-border">
                        <p className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                          <span>{group.icon}</span>
                          {group.label}
                        </p>
                      </div>
                      {/* Catégories du groupe */}
                      {group.categories.map((category, catIndex) => (
                        <button
                          key={catIndex}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category });
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/10 transition-all duration-200 border-b border-theme-card-border last:border-0 group relative ${
                            formData.category === category
                              ? "bg-yellow-50 dark:bg-yellow-900/20"
                              : ""
                          }`}
                        >
                          {/* Barre latérale si sélectionné */}
                          {formData.category === category && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-orange-500" />
                          )}

                          <div className="flex items-center gap-2.5 pl-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                formData.category === category
                                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 scale-125"
                                  : "bg-theme-text-muted group-hover:bg-yellow-400 group-hover:scale-[1.02]"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium transition-colors ${
                                formData.category === category
                                  ? "text-yellow-700 dark:text-yellow-400 font-semibold"
                                  : "text-theme-text-secondary group-hover:text-theme-text-primary"
                              }`}
                            >
                              {category}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info badge */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-2.5 md:p-3 flex items-start gap-2">
            <Lightbulb
              className="text-yellow-500 flex-shrink-0 mt-0.5"
              size={14}
            />
            <div className="text-xs text-slate-700 min-w-0">
              <p className="font-bold text-yellow-700 mb-0.5 md:mb-1 flex items-center gap-2">
                💡 Astuces
              </p>
              <ul className="text-slate-600 space-y-0.5 list-disc list-inside">
                <li className="truncate">
                  <span className="font-bold text-yellow-600">+10 pts</span> par
                  compétence
                </li>
                <li className="truncate hidden sm:list-item">
                  <span className="font-semibold">
                    {Object.keys(SKILLS_DATABASE).length}+ compétences
                  </span>{" "}
                  reconnues
                </li>
              </ul>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-theme-card-border p-4 md:p-6 flex gap-2 md:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-theme-bg-secondary text-theme-text-primary rounded-xl text-sm md:text-base font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
            className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl text-sm md:text-base font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};
