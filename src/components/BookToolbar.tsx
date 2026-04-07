import React, { useState } from "react";
import { Palette, Type, FileText, RotateCcw, Sun, Moon } from "lucide-react";
import type { BookConfig } from "../types";

interface BookToolbarProps {
  config: BookConfig;
  onChange: (updates: Partial<BookConfig>) => void;
  onReset: () => void;
}

const COLOR_PRESETS = [
  {
    name: "Architecture Classique",
    palette: {
      background: "#FAF9F6",
      text: "#1A1A2E",
      accent: "#B8860B",
      page: "#FFFFFF",
    },
  },
  {
    name: "Béton Brut",
    palette: {
      background: "#E8E4DE",
      text: "#2C2C2C",
      accent: "#8B7355",
      page: "#F5F0EB",
    },
  },
  {
    name: "Nuit Architecte",
    palette: {
      background: "#0F0F1A",
      text: "#E8E4DE",
      accent: "#C9A96E",
      page: "#1A1A2E",
    },
  },
  {
    name: "Minimaliste Blanc",
    palette: {
      background: "#FFFFFF",
      text: "#111111",
      accent: "#333333",
      page: "#FAFAFA",
    },
  },
  {
    name: "Terracotta",
    palette: {
      background: "#FDF5ED",
      text: "#3C2415",
      accent: "#C4613A",
      page: "#FFFFFF",
    },
  },
];

const FONT_OPTIONS = [
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond" },
  { label: "Libre Baskerville", value: "Libre Baskerville" },
  { label: "DM Serif Display", value: "DM Serif Display" },
  { label: "Inter", value: "Inter" },
  { label: "Poppins", value: "Poppins" },
  { label: "Montserrat", value: "Montserrat" },
];

export const BookToolbar: React.FC<BookToolbarProps> = ({
  config,
  onChange,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<"colors" | "fonts" | "info">(
    "colors",
  );

  const tabs = [
    { id: "colors" as const, icon: Palette, label: "Couleurs" },
    { id: "fonts" as const, icon: Type, label: "Polices" },
    { id: "info" as const, icon: FileText, label: "Textes" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === id
                ? "text-amber-700 dark:text-amber-400 border-b-2 border-amber-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Couleurs */}
        {activeTab === "colors" && (
          <>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Palettes
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onChange({ palette: preset.palette })}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                      JSON.stringify(config.palette) ===
                      JSON.stringify(preset.palette)
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex gap-1">
                      {Object.values(preset.palette).map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Couleurs individuelles
              </h4>
              {(["background", "text", "accent", "page"] as const).map(
                (key) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.palette[key]}
                      onChange={(e) =>
                        onChange({
                          palette: { ...config.palette, [key]: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-gray-500 capitalize">
                      {key}
                    </span>
                  </div>
                ),
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mode sombre
              </span>
              <button
                onClick={() => onChange({ dark_mode: !config.dark_mode })}
                aria-label={
                  config.dark_mode
                    ? "Désactiver le mode sombre"
                    : "Activer le mode sombre"
                }
                className={`p-2 rounded-lg transition-colors ${
                  config.dark_mode
                    ? "bg-gray-700 text-amber-400"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {config.dark_mode ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
            </div>
          </>
        )}

        {/* Polices */}
        {activeTab === "fonts" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Police des titres
              </label>
              <select
                value={config.font_title}
                onChange={(e) => onChange({ font_title: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                {FONT_OPTIONS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Police du corps
              </label>
              <select
                value={config.font_body}
                onChange={(e) => onChange({ font_body: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                {FONT_OPTIONS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ fontFamily: config.font_title }}
            >
              <p
                className="text-lg font-bold"
                style={{ fontFamily: config.font_title }}
              >
                Aperçu Titre
              </p>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: config.font_body }}
              >
                Aperçu du texte de corps avec la police sélectionnée.
              </p>
            </div>
          </div>
        )}

        {/* Textes et infos */}
        {activeTab === "info" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Titre du book
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Mon Portfolio d'Architecture"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Sous-titre
              </label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Projets & Réalisations"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={config.contact_email}
                onChange={(e) => onChange({ contact_email: e.target.value })}
                placeholder="contact@example.com"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={config.contact_phone}
                onChange={(e) => onChange({ contact_phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Afficher les badges
              </span>
              <button
                onClick={() => onChange({ show_badges: !config.show_badges })}
                className={`w-10 h-6 rounded-full transition-colors ${
                  config.show_badges ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                    config.show_badges ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bouton CV
              </span>
              <button
                onClick={() =>
                  onChange({ show_cv_button: !config.show_cv_button })
                }
                className={`w-10 h-6 rounded-full transition-colors ${
                  config.show_cv_button ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                    config.show_cv_button ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 mt-2 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default BookToolbar;
