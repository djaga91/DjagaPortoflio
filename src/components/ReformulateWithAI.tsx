/**
 * Composant pour reformuler un texte avec l'IA.
 *
 * Affiche un bouton flottant en haut à droite du champ de texte
 * avec un menu déroulant pour choisir le type de reformulation.
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { api } from "../services/api";

export interface ReformulateWithAIProps {
  /** Valeur actuelle du texte */
  value: string;
  /** Callback appelé quand le texte est reformulé */
  onTextChange: (newText: string) => void;
  /** Placeholder pour le champ de texte (optionnel) */
  placeholder?: string;
  /** Nombre de lignes pour le textarea */
  rows?: number;
  /** Classe CSS supplémentaire */
  className?: string;
  /** Si true, n'affiche que le bouton Reformuler (le parent fournit le textarea) */
  buttonOnly?: boolean;
}

type ReformulationType =
  | "more_professional"
  | "fix_grammar"
  | "more_concise"
  | "highlight_results";

const REFORMULATION_OPTIONS: Array<{
  value: ReformulationType;
  label: string;
  description: string;
}> = [
  {
    value: "more_professional",
    label: "Plus professionnel",
    description: "Rendre le texte plus formel et impactant",
  },
  {
    value: "fix_grammar",
    label: "Corriger orthographe & grammaire",
    description: "Corriger les erreurs de langue",
  },
  {
    value: "more_concise",
    label: "Plus concis",
    description: "Raccourcir tout en gardant l'essentiel",
  },
  {
    value: "highlight_results",
    label: "Mettre en valeur les résultats",
    description: "Utiliser des verbes d'action et des métriques",
  },
];

export const ReformulateWithAI: React.FC<ReformulateWithAIProps> = ({
  value,
  onTextChange,
  placeholder = "Décrivez...",
  rows = 4,
  className = "",
  buttonOnly = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMenu]);

  const handleReformulate = async (type: ReformulationType) => {
    if (!value.trim()) {
      setError("Veuillez d'abord saisir un texte à reformuler");
      setShowMenu(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowMenu(false);

    try {
      const response = await api.post("/api/ai/reformulate", {
        text: value,
        reformulation_type: type,
      });

      const reformulatedText = response.data.reformulated_text;
      onTextChange(reformulatedText);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Erreur lors de la reformulation. Veuillez réessayer.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonAndMenu = (
    <div
      className={
        buttonOnly ? "flex justify-end mt-2" : "absolute top-2 right-2 z-10"
      }
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors shadow-md ${
          isLoading
            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
            : value.trim()
              ? "bg-theme-accent-indigo hover:bg-indigo-700 text-white border-theme-accent-indigo hover:border-indigo-700 cursor-pointer"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-400 dark:border-gray-500 cursor-not-allowed opacity-60"
        }`}
        title={
          value.trim() ? "Reformuler avec l'IA" : "Saisissez d'abord un texte"
        }
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Reformulation...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            <span>Reformuler</span>
          </>
        )}
      </button>
      {showMenu && !isLoading && value.trim() && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
        >
          <div className="p-2 space-y-1">
            {REFORMULATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleReformulate(option.value)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={option.description}
              >
                <div className="font-medium text-theme-text-primary">
                  {option.label}
                </div>
                <div className="text-xs text-theme-text-secondary mt-0.5">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {!buttonOnly && (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => {
              onTextChange(e.target.value);
              setError(null);
            }}
            rows={rows}
            placeholder={placeholder}
            disabled={isLoading}
            className={`w-full px-3 py-2 pr-28 border rounded-lg bg-theme-input-bg text-theme-text-primary focus:ring-2 focus:ring-theme-accent-indigo focus:border-theme-accent-indigo ${
              error ? "border-red-500" : "border-theme-input-border"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {buttonAndMenu}
        </div>
      )}
      {buttonOnly && buttonAndMenu}
      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg z-10">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
