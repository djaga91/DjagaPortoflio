import React, { useState, useRef, useEffect } from "react";
import { Palette, X } from "lucide-react";

interface ColorPickerProps {
  primaryColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: "Bleu", color: "#2563eb" },
  { name: "Vert", color: "#059669" },
  { name: "Violet", color: "#7c3aed" },
  { name: "Rouge", color: "#dc2626" },
  { name: "Orange", color: "#ea580c" },
  { name: "Rose", color: "#db2777" },
  { name: "Indigo", color: "#4f46e5" },
  { name: "Emeraude", color: "#10b981" },
  { name: "Ambre", color: "#f59e0b" },
  { name: "Cyan", color: "#06b6d4" },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  primaryColor,
  onColorChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(primaryColor);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Synchroniser customColor avec primaryColor quand il change de l'extérieur
  useEffect(() => {
    setCustomColor(primaryColor);
  }, [primaryColor]);

  // Fermer le picker si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetClick = (color: string) => {
    // Appliquer la couleur immédiatement
    onColorChange(color);
    setCustomColor(color);
    // Ne pas fermer le picker pour permettre de voir le changement immédiatement
    // setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div ref={pickerRef} className="relative">
      {/* Bouton d'ouverture - Version compacte horizontale */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-theme-card rounded-lg border-2 border-theme-border hover:border-emerald-500 transition-all shadow-theme-sm hover:shadow-theme-md"
        title="Changer la couleur"
      >
        <Palette size={18} className="text-theme-text-secondary" />
        <div
          className="w-8 h-8 rounded-lg border-2 border-theme-border shadow-sm"
          style={{ backgroundColor: primaryColor }}
        />
        <span className="text-sm font-semibold text-theme-text-secondary">
          Couleur
        </span>
      </button>

      {/* Palette déroulante */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-theme-card rounded-xl border-2 border-theme-card-border shadow-theme-xl z-50 p-4 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-theme-text-secondary">
              Choisir une couleur
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-theme-bg-secondary rounded transition-colors"
            >
              <X size={16} className="text-theme-text-muted" />
            </button>
          </div>

          {/* Couleurs prédéfinies */}
          <div className="mb-4">
            <label className="text-xs font-medium text-theme-text-muted mb-2 block">
              Couleurs prédéfinies
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => handlePresetClick(preset.color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-[1.05] ${
                    primaryColor === preset.color
                      ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900"
                      : "border-theme-border hover:border-theme-text-muted"
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Personnalisation */}
          <div>
            <label className="text-xs font-medium text-theme-text-muted mb-2 block">
              Personnaliser
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-12 rounded-lg border-2 border-theme-border cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setCustomColor(color);
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                      onColorChange(color);
                    }
                  }}
                  placeholder="#2563eb"
                  className="w-full px-3 py-2 text-sm border border-theme-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-theme-bg-secondary text-theme-text-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
