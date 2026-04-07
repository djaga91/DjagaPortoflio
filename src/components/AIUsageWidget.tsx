/**
 * AIUsageWidget - Widget ludique affichant l'usage IA de l'utilisateur.
 *
 * Affiche :
 * - Le tier de l'utilisateur (Free, Pro, Admin)
 * - L'usage par feature avec des jauges colorées
 * - Le temps restant avant le reset mensuel (1er du mois suivant)
 *
 * Design ludique avec animations et couleurs selon le niveau d'usage.
 * Les limites sont mensuelles avec reset calendaire.
 */

import React, { useEffect, useState } from "react";
import {
  Zap,
  Clock,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Building2,
  GraduationCap,
} from "lucide-react";
import { api } from "../services/api";

interface FeatureUsage {
  display_name: string;
  icon: string;
  used: number;
  limit: number;
  remaining: number;
  percent: number;
  is_available: boolean;
  min_session_allowance: number;
}

interface PremiumViaOrg {
  org_name: string;
  org_type: string;
  expires_at?: string;
}

interface AIUsageData {
  tier: string;
  tier_display: string;
  is_unlimited: boolean;
  premium_via_org?: PremiumViaOrg | null;
  features: Record<string, FeatureUsage>;
  total_this_month: number;
  reset_at: string;
  days_until_reset: number;
}

// Couleurs par niveau d'usage
const getUsageColor = (percent: number): string => {
  if (percent >= 90) return "from-red-500 to-rose-600";
  if (percent >= 70) return "from-orange-500 to-amber-500";
  if (percent >= 50) return "from-yellow-400 to-orange-400";
  return "from-emerald-400 to-green-500";
};

const getUsageTextColor = (percent: number): string => {
  if (percent >= 90) return "text-red-500";
  if (percent >= 70) return "text-orange-500";
  if (percent >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-emerald-500";
};

// Badge tier avec style
const TierBadge: React.FC<{ tier: string; isUnlimited: boolean }> = ({
  tier,
  isUnlimited,
}) => {
  const tierStyles: Record<string, string> = {
    free: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    pro: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
    enterprise: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    admin: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
  };

  const tierIcons: Record<string, React.ReactNode> = {
    free: <Zap size={10} className="sm:w-3 sm:h-3" />,
    pro: <Sparkles size={10} className="sm:w-3 sm:h-3" />,
    enterprise: <Crown size={10} className="sm:w-3 sm:h-3" />,
    admin: <Crown size={10} className="sm:w-3 sm:h-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${tierStyles[tier] || tierStyles.free}`}
    >
      {tierIcons[tier]}
      <span className="hidden min-[360px]:inline">
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
      <span className="min-[360px]:hidden">{tier.charAt(0).toUpperCase()}</span>
      {isUnlimited && " ∞"}
    </span>
  );
};

// Jauge d'usage individuelle
const UsageBar: React.FC<{ feature: FeatureUsage; isUnlimited: boolean }> = ({
  feature,
  isUnlimited,
}) => {
  const percent = Math.min(100, feature.percent);

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xl" title={feature.display_name}>
        {feature.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-theme-text-secondary truncate">
            {feature.display_name}
          </span>
          <span
            className={`text-xs font-bold ${isUnlimited ? "text-emerald-500" : getUsageTextColor(percent)}`}
          >
            {isUnlimited ? "∞" : `${feature.used}/${feature.limit}`}
          </span>
        </div>
        <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${isUnlimited ? "from-emerald-400 to-green-500" : getUsageColor(percent)} transition-all duration-500`}
            style={{ width: isUnlimited ? "10%" : `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Calcul du temps restant avant reset mensuel
const TimeUntilReset: React.FC<{ resetAt: string; daysUntilReset: number }> = ({
  resetAt,
  daysUntilReset,
}) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const reset = new Date(resetAt);
      const diff = reset.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Maintenant");
        return;
      }

      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days > 1) {
        setTimeLeft(`${days} jours`);
      } else if (days === 1) {
        // Moins de 24h, afficher les heures
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours > 0) {
          setTimeLeft(`${hours}h`);
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          setTimeLeft(`${minutes}min`);
        }
      } else {
        setTimeLeft("1 jour");
      }
    };

    calculateTimeLeft();
    // Update every hour for monthly tracking (less frequent than daily)
    const interval = setInterval(calculateTimeLeft, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [resetAt, daysUntilReset]);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-theme-text-tertiary flex-shrink-0">
      <Clock size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
      <span className="whitespace-nowrap">Reset {timeLeft}</span>
    </div>
  );
};

interface AIUsageWidgetProps {
  compact?: boolean;
}

export const AIUsageWidget: React.FC<AIUsageWidgetProps> = ({
  compact = false,
}) => {
  const [usage, setUsage] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await api.get("/api/users/me/ai-usage");
        setUsage(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch AI usage:", err);
        setError("Impossible de charger");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    // Refresh every 5 minutes
    const interval = setInterval(fetchUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    if (compact) {
      return (
        <div className="animate-pulse space-y-2">
          <div className="h-2.5 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      );
    }
    return (
      <div className="bg-theme-card rounded-2xl p-4 border border-theme-card-border animate-pulse">
        <div className="h-4 bg-theme-bg-tertiary rounded w-32 mb-3"></div>
        <div className="space-y-2">
          <div className="h-2 bg-theme-bg-tertiary rounded"></div>
          <div className="h-2 bg-theme-bg-tertiary rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    if (compact) {
      return (
        <div className="text-[10px] sm:text-xs text-red-400 truncate">
          Erreur chargement
        </div>
      );
    }
    return (
      <div className="bg-theme-card rounded-2xl p-4 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-500">
          <AlertTriangle size={16} />
          <span className="text-sm">{error || "Erreur"}</span>
        </div>
      </div>
    );
  }

  // Features réellement utilisées (dans l'ordre d'importance)
  // Ces features correspondent aux vraies fonctionnalités IA implémentées
  const ACTIVE_FEATURES = [
    "cv_parser",
    "fox_interview",
    "prepare_fox",
    "text_reformulator",
    "description_generator",
    "bio_generator",
    "cover_letter",
    "job_matching",
  ];
  const sortedFeatures = ACTIVE_FEATURES.filter(
    (key) => usage.features[key],
  ).map((key) => ({ key, ...usage.features[key] }));

  // Calculer le total usage percent (moyenne pondérée)
  let totalPercent = usage.is_unlimited
    ? 0
    : Math.round(
        sortedFeatures.reduce((acc, f) => acc + f.percent, 0) /
          sortedFeatures.length,
      );

  // Si le matching IA a été utilisé au moins une fois, afficher au moins 75% pour refléter la consommation importante
  if (
    !usage.is_unlimited &&
    usage.features["job_matching"] &&
    usage.features["job_matching"].percent > 0
  ) {
    totalPercent = Math.max(totalPercent, 75);
  }

  // Mode compact pour le dashboard Bento
  if (compact) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {/* Tier Badge */}
        <div className="flex items-center justify-between gap-2">
          <TierBadge tier={usage.tier} isUnlimited={usage.is_unlimited} />
          <TimeUntilReset
            resetAt={usage.reset_at}
            daysUntilReset={usage.days_until_reset}
          />
        </div>

        {/* Badge Premium via Organisation */}
        {usage.premium_via_org && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            {usage.premium_via_org.org_type === "school" ? (
              <GraduationCap
                size={12}
                className="text-indigo-500 flex-shrink-0"
              />
            ) : (
              <Building2 size={12} className="text-indigo-500 flex-shrink-0" />
            )}
            <span className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-300 truncate">
              Premium offert par {usage.premium_via_org.org_name}
            </span>
          </div>
        )}

        {/* Barre globale */}
        {!usage.is_unlimited && (
          <div>
            <div className="flex justify-between items-center mb-1 sm:mb-1.5">
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Usage ce mois
              </span>
              <span
                className={`text-xs sm:text-sm font-bold ${getUsageTextColor(totalPercent)} flex-shrink-0`}
              >
                {totalPercent}%
              </span>
            </div>
            <div className="h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              {totalPercent === 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-[8px] text-slate-400 dark:text-slate-500">
                    Prêt à utiliser ✨
                  </span>
                </div>
              ) : (
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getUsageColor(totalPercent)} transition-all duration-500`}
                  style={{ width: `${totalPercent}%` }}
                />
              )}
            </div>
          </div>
        )}

        {usage.is_unlimited && (
          <div className="text-center py-1.5 sm:py-2">
            <span className="text-emerald-500 dark:text-emerald-400 font-bold text-base sm:text-lg">
              ∞
            </span>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Illimité
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-theme-card rounded-2xl p-4 border border-theme-card-border shadow-theme-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-text-primary">
              Crédits IA
            </h3>
            <TierBadge tier={usage.tier} isUnlimited={usage.is_unlimited} />
          </div>
        </div>
        <TimeUntilReset
          resetAt={usage.reset_at}
          daysUntilReset={usage.days_until_reset}
        />
      </div>

      {/* Badge Premium via Organisation */}
      {usage.premium_via_org && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          {usage.premium_via_org.org_type === "school" ? (
            <GraduationCap
              size={16}
              className="text-indigo-500 flex-shrink-0"
            />
          ) : (
            <Building2 size={16} className="text-indigo-500 flex-shrink-0" />
          )}
          <span className="text-xs text-indigo-600 dark:text-indigo-300">
            Premium offert par <strong>{usage.premium_via_org.org_name}</strong>
          </span>
        </div>
      )}

      {/* Résumé compact */}
      {!usage.is_unlimited && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-theme-text-tertiary">
              Usage global ce mois
            </span>
            <span
              className={`text-xs font-bold ${getUsageTextColor(totalPercent)}`}
            >
              {totalPercent}%
            </span>
          </div>
          <div className="h-2.5 bg-theme-bg-tertiary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getUsageColor(totalPercent)} transition-all duration-500`}
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Bouton expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-xs text-theme-text-secondary hover:text-theme-text-primary transition-colors"
      >
        <span>
          {isExpanded ? "Masquer le détail" : "Voir le détail par feature"}
        </span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Détail par feature (expandable) */}
      {isExpanded && (
        <div className="pt-2 border-t border-theme-border space-y-1 animate-in slide-in-from-top-2 duration-200">
          {sortedFeatures.map((feature) => (
            <UsageBar
              key={feature.key}
              feature={feature}
              isUnlimited={usage.is_unlimited}
            />
          ))}
        </div>
      )}

      {/* Message si proche de la limite */}
      {!usage.is_unlimited && totalPercent >= 80 && (
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-300">
            ⚠️ Vous approchez de votre limite mensuelle.
            {usage.tier === "free" &&
              " Passez à Pro pour des limites plus élevées."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIUsageWidget;
