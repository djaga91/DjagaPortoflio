/**
 * BadgeIcon - Affiche l'icône d'un badge avec les couleurs de rareté.
 */

import React from "react";
import {
  Medal,
  Crown,
  Languages,
  Megaphone,
  Lightbulb,
  Target,
  BookOpen,
  Briefcase,
  GraduationCap,
  Zap,
  Users,
  Rocket,
  FileText,
  Feather,
  TrendingUp,
  Sprout,
  Camera,
  Library,
  Star,
  Globe,
  Link,
  PawPrint,
  Award,
  PenTool,
  MessageSquare,
  Trophy,
  Building2,
  Hammer,
  LucideIcon,
} from "lucide-react";

// Mapping badge ID -> Icône Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  // Profil
  first_steps: Sprout,
  photographer: Camera,
  storyteller: BookOpen,

  // Carrière
  first_job: Briefcase,
  experienced: Building2,
  veteran: Medal,
  scholar: Library,
  academic: GraduationCap,
  certified: Award,

  // Compétences
  skilled: Star,
  expert: Zap,
  master: Crown,
  polyglot: Globe,
  linguist: Languages,

  // Social
  networker: Link,
  social_butterfly: Users,
  influencer: Megaphone,

  // Créateur
  builder: Hammer,
  innovator: Lightbulb,
  cv_master: FileText,
  writer: Feather,
  prolific_writer: PenTool,

  // Jalons
  halfway: TrendingUp,
  job_ready: Target,
  complete_profile: Trophy,

  // Spéciaux
  early_adopter: Rocket,
  feedback_hero: MessageSquare,
  fox_friend: PawPrint,

  // Ancien badge "connected" (rétrocompat)
  connected: Link,

  // Badges candidatures et objectifs
  job_seeker_5: Target,
  job_seeker_10: Target,
  interview_master: MessageSquare,
  hard_worker: Zap,
  hard_worker_14: Zap,
  hard_worker_30: Zap,
  thanos: Crown,
  legendary: Crown,
};

// Couleurs par rareté
const RARITY_STYLES: Record<string, { container: string; icon: string }> = {
  common: {
    container:
      "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    icon: "text-slate-600 dark:text-slate-400",
  },
  uncommon: {
    container:
      "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  rare: {
    container:
      "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600",
    icon: "text-blue-600 dark:text-blue-400",
  },
  epic: {
    container:
      "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 shadow-md shadow-purple-200/50 dark:shadow-purple-900/30",
    icon: "text-purple-600 dark:text-purple-400",
  },
  legendary: {
    container:
      "bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30",
    icon: "text-amber-600 dark:text-amber-400",
  },
};

interface BadgeIconProps {
  badgeId: string;
  rarity: string;
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  badgeId,
  rarity,
  size = "md",
  locked = false,
  className = "",
}) => {
  const IconComponent = ICON_MAP[badgeId] || Star;
  const styles = RARITY_STYLES[rarity] || RARITY_STYLES.common;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full border-2 flex items-center justify-center
        transition-transform hover:scale-[1.02]
        ${locked ? "bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-600 opacity-50" : styles.container}
        ${className}
      `}
    >
      <IconComponent
        size={iconSizes[size]}
        strokeWidth={2}
        className={locked ? "text-slate-400 dark:text-slate-500" : styles.icon}
      />
    </div>
  );
};

export default BadgeIcon;
