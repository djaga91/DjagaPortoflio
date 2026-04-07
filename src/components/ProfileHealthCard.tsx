/**
 * ProfileHealthCard - Carte de santé du profil avec détails de progression.
 */

import React from "react";
import { Activity, TrendingUp } from "lucide-react";
import type { Profile, Experience, Skill } from "../services/api";
import type { CompletenessResult } from "../utils/profileCompleteness";

interface ProfileHealthCardProps {
  completeness: CompletenessResult;
  experiences: Experience[];
  skills: Skill[];
  profile: Profile | null;
}

// Barre de progression avec label - Version améliorée
const ProgressBar: React.FC<{
  label: string;
  value: number;
  color: string;
  icon?: string;
}> = ({ label, value, color, icon }) => (
  <div className="group">
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-theme-text-secondary flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span
        className={`font-bold ${value === 100 ? "text-emerald-500" : "text-theme-text-primary"}`}
      >
        {value}%{value === 100 && <span className="ml-1">✓</span>}
      </span>
    </div>
    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color} ${value === 100 ? "animate-pulse" : ""}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export const ProfileHealthCard: React.FC<ProfileHealthCardProps> = ({
  completeness,
  experiences,
  skills,
  profile,
}) => {
  // Calculer les métriques de santé
  const baseInfoPercent = Math.round(
    (profile?.bio ? 25 : 0) +
      (profile?.title ? 25 : 0) +
      (profile?.profile_picture_url ? 25 : 0) +
      (profile?.phone || profile?.location ? 25 : 0) || 0,
  );

  const experiencePercent = Math.min(100, experiences.length * 50);
  const skillsPercent = Math.min(100, skills.length * 10);

  const totalPercent = completeness.percentage;

  return (
    <div className="bg-theme-card rounded-[2rem] p-6 border border-theme-card-border shadow-theme-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-emerald-500" />
        <h3 className="font-bold text-theme-text-primary">Santé du Profil</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Cercle de progression */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={
                totalPercent >= 70
                  ? "#10B981"
                  : totalPercent >= 40
                    ? "#FF8C42"
                    : "#6366F1"
              }
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * totalPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bold text-xl text-theme-text-primary">
              {totalPercent}%
            </span>
            <span className="text-[10px] text-theme-text-muted">Complet</span>
          </div>
        </div>

        {/* Barres de progression par catégorie - Améliorées */}
        <div className="flex-1 space-y-3 w-full">
          <ProgressBar
            label="Infos de base"
            value={baseInfoPercent}
            color="bg-gradient-to-r from-emerald-400 to-emerald-500"
            icon="👤"
          />
          <ProgressBar
            label="Expériences"
            value={experiencePercent}
            color="bg-gradient-to-r from-orange-400 to-orange-500"
            icon="💼"
          />
          <ProgressBar
            label="Compétences"
            value={skillsPercent}
            color="bg-gradient-to-r from-indigo-400 to-indigo-500"
            icon="⚡"
          />
        </div>
      </div>

      {/* Conseil d'amélioration */}
      {totalPercent < 100 && (
        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <TrendingUp size={14} />
            <span className="text-xs font-semibold">
              {totalPercent < 30
                ? "Ajoutez une photo et une bio pour commencer !"
                : totalPercent < 60
                  ? "Complétez vos expériences pour un meilleur profil"
                  : "Ajoutez plus de compétences pour vous démarquer"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
