import React, { useState, useEffect } from "react";
import { X, Check, Globe } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import type { LanguageCreate } from "../services/api";

interface LanguageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LanguageFormModal: React.FC<LanguageFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createLanguage, requireAuth } = useGameStore();
  const [formData, setFormData] = useState<LanguageCreate>({
    name: "",
    level: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", level: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        await createLanguage(formData);
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    });
  };

  if (!isOpen) return null;

  const levels = ["Natif", "Courant", "B2", "B1", "A2", "A1", "Scolaire"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-theme-card rounded-[2rem] shadow-theme-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-theme-card-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-theme-text-primary">
            Ajouter une langue
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-bg-secondary rounded-xl transition-colors"
          >
            <X size={24} className="text-theme-text-muted" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-theme-text-primary mb-2">
              <Globe size={16} className="inline mr-2" /> Langue *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
              placeholder="Ex: Français, English, Español"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-theme-text-primary mb-2">
              Niveau *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
              className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
            >
              <option value="">Sélectionner un niveau</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-theme-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-text-primary font-semibold rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#6366F1] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300/50 dark:hover:shadow-indigo-800/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check size={20} className="animate-pulse" /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
