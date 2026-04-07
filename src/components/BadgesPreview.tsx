/**
 * BadgesPreview - Aperçu compact des badges pour le dashboard.
 *
 * Affiche les derniers badges débloqués et un lien vers la collection complète.
 */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy, ChevronRight, Award, X, Lock, Flame } from "lucide-react";
import { gamificationAPI } from "../services/api";
import { useGameStore } from "../store/gameStore";
import { BadgeIcon } from "./BadgeIcon";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xp_reward?: number;
  criteria?: string;
}

interface BadgesData {
  earned: Badge[];
  available: Badge[];
  total: number;
  earned_count: number;
}

// Couleurs par rareté (bordure)
const RARITY_BORDER: Record<string, string> = {
  common: "border-slate-200 dark:border-slate-600",
  uncommon: "border-emerald-300 dark:border-emerald-600",
  rare: "border-blue-300 dark:border-blue-600",
  epic: "border-purple-400 dark:border-purple-500",
  legendary: "border-amber-400 dark:border-amber-500",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-slate-50 dark:bg-slate-800/50",
  uncommon: "bg-emerald-50 dark:bg-emerald-900/30",
  rare: "bg-blue-50 dark:bg-blue-900/30",
  epic: "bg-purple-50 dark:bg-purple-900/30",
  legendary: "bg-amber-50 dark:bg-amber-900/30",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Commun",
  uncommon: "Peu commun",
  rare: "Rare",
  epic: "Épique",
  legendary: "Légendaire",
};

const RARITY_TEXT: Record<string, string> = {
  common: "text-slate-500 dark:text-slate-400",
  uncommon: "text-emerald-600 dark:text-emerald-400",
  rare: "text-blue-600 dark:text-blue-400",
  epic: "text-purple-600 dark:text-purple-400",
  legendary: "text-amber-600 dark:text-amber-400",
};

interface BadgesPreviewProps {
  compact?: boolean;
}

// Composant Tooltip avec position fixe
const TooltipFixed: React.FC<{
  badge: Badge;
  anchorElement: HTMLElement;
}> = ({ badge, anchorElement }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const rect = anchorElement.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 = 256px
      const tooltipHeight = 150; // Estimation
      setPosition({
        top: rect.top - tooltipHeight - 12, // mb-3 (12px)
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      });
    };

    updatePosition();
    const scrollContainer = anchorElement.closest(".overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updatePosition, true);
    }
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", updatePosition, true);
      }
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorElement]);

  if (!document.body) return null;
  return createPortal(
    <div
      className="fixed w-56 sm:w-64 p-3 bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[10001] pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(0)",
      }}
    >
      <p className="text-xs text-slate-300 mb-2 leading-relaxed">
        {badge.description}
      </p>
      {badge.criteria && (
        <div className="text-[10px] text-amber-400 bg-amber-900/30 px-2 py-1 rounded-lg">
          <span className="font-semibold">Comment l'obtenir :</span>{" "}
          {badge.criteria}
        </div>
      )}
      {/* Flèche */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-b border-r border-slate-700 rotate-45" />
    </div>,
    document.body,
  );
};

interface DailyStreakData {
  consecutive_days: number;
  target_badge_id: string;
  target_badge_name: string;
  target_days: number;
  has_streak: boolean;
  today_completed?: boolean;
}

export const BadgesPreview: React.FC<BadgesPreviewProps> = ({
  compact = false,
}) => {
  const [badges, setBadges] = useState<BadgesData | null>(null);
  const [bosseurStreak, setBosseurStreak] = useState<DailyStreakData | null>(
    null,
  );
  const storeBosseurStreak = useGameStore((s) => s.bosseurStreak);
  const displayStreak = storeBosseurStreak ?? bosseurStreak;
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const badgesData = await gamificationAPI.getBadges().catch(() => null);
        const streakData = await gamificationAPI
          .getBosseurStreak()
          .catch(() => null);
        if (badgesData) setBadges(badgesData);
        const streak = badgesData?.bosseur_streak ?? streakData ?? null;
        if (streak && typeof streak === "object") {
          setBosseurStreak(streak);
          useGameStore.getState().setBosseurStreak(streak);
        }
      } catch (err) {
        console.error("Erreur chargement badges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // Recharger badges + streak à l'ouverture de la modale (streak à jour pour ne pas disparaître le lendemain)
  useEffect(() => {
    if (!isModalOpen) return;
    Promise.all([
      gamificationAPI.getBadges().catch(() => null),
      gamificationAPI.getBosseurStreak().catch(() => null),
    ])
      .then(([badgesData, streakData]) => {
        if (badgesData) setBadges(badgesData);
        const streak = badgesData?.bosseur_streak ?? streakData ?? null;
        if (streak && typeof streak === "object") {
          setBosseurStreak(streak);
          useGameStore.getState().setBosseurStreak(streak);
        }
      })
      .catch((err) => console.error("[BadgesPreview] erreur refetch:", err));
  }, [isModalOpen]);

  // Gestion du scroll du body quand la modale est ouverte (Solution Robuste)
  useEffect(() => {
    if (isModalOpen && document.body) {
      // Sauvegarder la position actuelle du scroll
      const scrollY = window.scrollY;

      // Bloquer le scroll sur body et html
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (document.documentElement)
        document.documentElement.style.overflow = "hidden";

      // Cleanup: restaurer le scroll (gardes pour déconnexion / unmount)
      return () => {
        if (document.body) {
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
        }
        if (document.documentElement)
          document.documentElement.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isModalOpen]);

  if (loading) {
    if (compact) {
      return (
        <div className="animate-pulse">
          <div className="flex gap-2 mb-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"
              ></div>
            ))}
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        </div>
      );
    }
    return (
      <div className="bg-theme-card rounded-[2rem] p-6 border border-theme-card-border animate-pulse">
        <div className="h-5 bg-theme-bg-tertiary rounded w-32 mb-4"></div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-12 h-12 bg-theme-bg-tertiary rounded-full"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!badges) {
    return null;
  }

  // Prendre les badges débloqués (2-3 en mode compact selon écran, 6 sinon) — accès safe
  const earnedList = Array.isArray(badges.earned) ? badges.earned : [];
  const totalBadges = Math.max(1, Number(badges.total) || 1);
  const earnedCount = Math.max(
    0,
    Number(badges.earned_count) ?? earnedList.length,
  );
  const recentBadges = earnedList.slice(0, compact ? 3 : 6);
  const progress = Math.min(100, Math.round((earnedCount / totalBadges) * 100));

  // Mode compact pour le dashboard Bento
  if (compact) {
    return (
      <div>
        {/* Badges visuels - Responsive : 2 sur très petit écran, 3 sur écran plus large */}
        {recentBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {recentBadges.map((badge, index) => (
              <div
                key={badge.id}
                className={`relative group cursor-pointer ${index >= 2 ? "hidden min-[380px]:block" : ""}`}
                onClick={() => setIsModalOpen(true)}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 border-2 border-amber-300 dark:border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-[1.02] group-hover:border-amber-400 transition-all duration-300">
                  <BadgeIcon
                    badgeId={badge.id}
                    rarity={badge.rarity}
                    size="md"
                  />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            ))}
            {/* Plus indicator - Plus petit sur mobile */}
            {earnedCount < totalBadges && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                  +{totalBadges - earnedCount}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Trophy
              size={24}
              className="text-slate-400 dark:text-slate-600 mx-auto mb-2"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complétez votre profil pour débloquer des badges
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Progression
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {earnedCount}/{totalBadges}
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Streak : affiché uniquement dans la modale "Mes badges" (pas sur le bureau pour ne pas surcharger) */}

        {/* View All Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
        >
          Voir tous les badges
          <ChevronRight size={14} />
        </button>

        {/* Grande Modale Collection (Overlay Premium) - React Portal */}
        {isModalOpen &&
          document.body &&
          createPortal(
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="relative w-full max-w-5xl h-[90vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glow Effects Background */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header Sticky */}
                <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                  <div className="p-6 lg:p-8">
                    {/* Titre & Fermer */}
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                          <Trophy size={28} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-2xl lg:text-3xl font-black text-white mb-1">
                            Collection de Badges
                          </h2>
                          <p className="text-slate-400 text-sm">
                            Vos succès et accomplissements professionnels
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 group flex-shrink-0"
                      >
                        <X
                          size={24}
                          className="text-slate-400 group-hover:text-white transition-colors"
                        />
                      </button>
                    </div>

                    {/* Message Discord - Permanent */}
                    <div className="mb-6 flex items-center justify-center gap-2 px-3 py-2 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-[#5865F2] flex-shrink-0"
                      >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold text-[#5865F2] text-center">
                        Gagnez des rôles exclusifs sur Discord grâce à vos
                        badges !
                      </span>
                    </div>

                    {/* Barre de Progression Large */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                          Progression
                        </span>
                        <span className="text-2xl font-black text-white">
                          {earnedCount} / {totalBadges}
                        </span>
                      </div>
                      <div className="relative h-4 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-1000 shadow-lg shadow-orange-500/50"
                          style={{
                            width: `${Math.min(100, Math.round((earnedCount / totalBadges) * 100))}%`,
                          }}
                        />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                      <p className="text-center text-sm font-bold text-amber-400">
                        {Math.min(
                          100,
                          Math.round((earnedCount / totalBadges) * 100),
                        )}
                        % complété
                      </p>
                    </div>
                  </div>
                </div>

                {/* Corps Scrollable */}
                <div className="overflow-y-auto overflow-x-hidden h-[calc(90vh-240px)] px-6 lg:px-8 pt-6 pb-16 relative">
                  {/* STREAK EN COURS — version safe (pas de division par zéro) */}
                  {displayStreak != null &&
                    (() => {
                      const d = Math.max(
                        0,
                        Number(displayStreak.consecutive_days) || 0,
                      );
                      const t = Math.max(
                        1,
                        Number(displayStreak.target_days) || 7,
                      );
                      if (d >= t) return null;
                      const ratio = t > 0 ? d / t : 0;
                      return (
                        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30">
                          <div className="flex items-center gap-3 mb-3">
                            <Flame
                              className={`text-orange-500 flex-shrink-0 ${displayStreak.today_completed === false ? "animate-pulse" : "animate-pulse-slow"}`}
                              size={20}
                            />
                            <h3 className="text-lg font-black text-white uppercase tracking-wide">
                              Série en cours
                            </h3>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">
                            {displayStreak.target_badge_name ?? "Régulier"} :{" "}
                            <span className="font-bold text-amber-400">
                              {d} / {t}
                            </span>
                          </p>
                          <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, ratio * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            {displayStreak.today_completed === false
                              ? "Objectifs du jour à faire pour continuer la série (la flamme clignote jusqu'à ce que vous les accomplissiez)."
                              : "Accomplissez les objectifs du jour pour continuer la série."}
                          </p>
                        </div>
                      );
                    })()}

                  {/* Badges Débloqués */}
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <Award className="text-amber-500" size={20} />
                      <h3 className="text-lg font-black text-white uppercase tracking-wide">
                        Débloqués ({earnedList.length})
                      </h3>
                    </div>

                    {/* Grille Responsive Premium avec padding pour éviter que les badges soient coupés */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                        {earnedList.map((badge, index) => (
                          <div
                            key={badge.id}
                            ref={(el) => {
                              if (hoveredBadge?.id === badge.id && el) {
                                setTooltipRef(el);
                              }
                            }}
                            className={`group relative p-4 rounded-2xl border-2 ${RARITY_BORDER[badge.rarity]} ${RARITY_BG[badge.rarity]}
                          hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 cursor-pointer
                          animate-in fade-in slide-in-from-bottom-4`}
                            style={{
                              animationDelay: `${index * 30}ms`,
                              animationFillMode: "backwards",
                            }}
                            onMouseEnter={(e) => {
                              setHoveredBadge(badge);
                              setTooltipRef(e.currentTarget);
                            }}
                            onMouseLeave={() => {
                              setHoveredBadge(null);
                              setTooltipRef(null);
                            }}
                          >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/0 via-amber-500/0 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex flex-col items-center text-center gap-2">
                              {/* Icône Badge */}
                              <div className="mb-1">
                                <BadgeIcon
                                  badgeId={badge.id}
                                  rarity={badge.rarity}
                                  size="lg"
                                />
                              </div>

                              {/* Nom */}
                              <p className="text-xs lg:text-sm font-bold text-theme-text-primary line-clamp-2 leading-tight">
                                {badge.name}
                              </p>

                              {/* Rareté */}
                              <p
                                className={`text-[10px] font-semibold uppercase ${RARITY_TEXT[badge.rarity]}`}
                              >
                                {RARITY_LABELS[badge.rarity]}
                              </p>

                              {/* Points */}
                              {badge.xp_reward && (
                                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                                  +{badge.xp_reward} pts
                                </div>
                              )}
                            </div>

                            {/* Tooltip hover avec description - Position fixed pour passer devant le header */}
                            {hoveredBadge?.id === badge.id && tooltipRef && (
                              <TooltipFixed
                                badge={badge}
                                anchorElement={tooltipRef}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Badges Bloqués */}
                  {badges.available.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Lock className="text-slate-500" size={20} />
                        <h3 className="text-lg font-black text-slate-400 uppercase tracking-wide">
                          À Débloquer ({badges.available.length})
                        </h3>
                      </div>

                      {/* Grille avec padding pour éviter que les badges soient coupés */}
                      <div className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                          {badges.available.map((badge, index) => (
                            <div
                              key={badge.id}
                              ref={(el) => {
                                if (hoveredBadge?.id === badge.id && el) {
                                  setTooltipRef(el);
                                }
                              }}
                              className="group relative p-4 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30
                            grayscale hover:grayscale-0 opacity-50 hover:opacity-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                              style={{
                                animationDelay: `${index * 30}ms`,
                                animationFillMode: "backwards",
                              }}
                              onMouseEnter={(e) => {
                                setHoveredBadge(badge);
                                setTooltipRef(e.currentTarget);
                              }}
                              onMouseLeave={() => {
                                setHoveredBadge(null);
                                setTooltipRef(null);
                              }}
                            >
                              <div className="relative flex flex-col items-center text-center gap-2">
                                {/* Icône Badge Locked */}
                                <div className="relative mb-1">
                                  <BadgeIcon
                                    badgeId={badge.id}
                                    rarity={badge.rarity}
                                    size="lg"
                                    locked
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Lock
                                      size={20}
                                      className="text-slate-500"
                                    />
                                  </div>
                                </div>

                                {/* Nom */}
                                <p className="text-xs lg:text-sm font-bold text-slate-400 line-clamp-2 leading-tight">
                                  {badge.name}
                                </p>

                                {/* Rareté */}
                                <p className="text-[10px] font-semibold uppercase text-slate-600">
                                  {RARITY_LABELS[badge.rarity]}
                                </p>
                              </div>

                              {/* Tooltip hover avec description et critères - Position fixed pour passer devant le header */}
                              {hoveredBadge?.id === badge.id && tooltipRef && (
                                <TooltipFixed
                                  badge={badge}
                                  anchorElement={tooltipRef}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  // Mode non-compact (carte complète)

  return (
    <div className="bg-theme-card rounded-[2rem] p-6 border border-theme-card-border shadow-theme-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h3 className="font-bold text-theme-text-primary">Mes Badges</h3>
        </div>
        <span className="text-xs font-bold text-theme-text-muted">
          {earnedCount}/{totalBadges}
        </span>
      </div>

      {/* Badges Grid */}
      {recentBadges.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {recentBadges.map((badge) => (
            <div
              key={badge.id}
              className="relative cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              onMouseEnter={() => setHoveredBadge(badge)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <BadgeIcon badgeId={badge.id} rarity={badge.rarity} size="md" />

              {/* Tooltip avec description complète */}
              {hoveredBadge?.id === badge.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-56 p-2.5 sm:p-3 bg-theme-card border border-theme-border rounded-xl shadow-xl z-[10000] pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeIcon
                      badgeId={badge.id}
                      rarity={badge.rarity}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-theme-text-primary truncate">
                        {badge.name}
                      </p>
                      <p
                        className={`text-[10px] font-semibold uppercase ${RARITY_TEXT[badge.rarity]}`}
                      >
                        {RARITY_LABELS[badge.rarity]}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-theme-text-secondary leading-relaxed break-words mb-2">
                    {badge.description}
                  </p>
                  {badge.criteria && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg mb-2">
                      <span className="font-semibold">🎯 Débloquez-le :</span>{" "}
                      {badge.criteria}
                    </div>
                  )}
                  {badge.xp_reward && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      +{badge.xp_reward} pts
                    </p>
                  )}
                  {/* Flèche */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-theme-card border-b border-r border-theme-border rotate-45" />
                </div>
              )}
            </div>
          ))}
          {/* Placeholder pour badges restants */}
          {earnedCount < totalBadges && (
            <div
              onClick={() => setIsModalOpen(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 bg-theme-bg-tertiary cursor-pointer hover:bg-theme-bg-secondary transition-colors"
            >
              <span className="text-xs font-bold text-theme-text-muted">
                +{totalBadges - earnedCount}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-4 p-4 bg-theme-bg-secondary rounded-xl">
          <Trophy size={24} className="text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-theme-text-primary">
              Commencez votre collection !
            </p>
            <p className="text-xs text-theme-text-muted">
              Complétez votre profil pour débloquer des badges
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Message streak + flamme (objectifs du jour) — ne disparaît pas le lendemain */}
      {displayStreak != null &&
        (() => {
          const days = Math.max(0, Number(displayStreak.consecutive_days) || 0);
          const target = Math.max(1, Number(displayStreak.target_days) || 7);
          if (days >= target) return null;
          const ratio = Math.min(1, days / target);
          const todayDone = displayStreak.today_completed === true;
          return (
            <div className="mb-4 p-3 rounded-xl bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
              <Flame
                size={28}
                className={`text-orange-500 transition-all duration-300 flex-shrink-0 ${todayDone ? "animate-pulse-slow" : "animate-pulse fill-orange-500/80"} ${ratio >= 0.5 ? "fill-orange-500" : ""}`}
                style={{
                  opacity: 0.5 + 0.5 * ratio,
                  filter: `drop-shadow(0 0 ${4 + 8 * ratio}px rgba(249, 115, 22, 0.5))`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-theme-text-primary">
                  {todayDone
                    ? "Accomplissez les objectifs du jour pour continuer la série."
                    : "Objectifs du jour à faire pour continuer la série."}
                </p>
                <p className="text-xs text-theme-text-muted">
                  Série :{" "}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {days}
                  </span>{" "}
                  jour{days > 1 ? "s" : ""} · Prochain :{" "}
                  {displayStreak.target_badge_name ?? "Régulier"} ({days}/
                  {target})
                </p>
              </div>
            </div>
          );
        })()}

      {/* View All Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-theme-bg-secondary hover:bg-theme-bg-tertiary rounded-xl text-sm font-medium text-theme-text-secondary transition-colors group"
      >
        Voir tous les badges
        <ChevronRight
          size={16}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>

      {/* Grande Modale Collection (Overlay Premium) - React Portal */}
      {isModalOpen &&
        document.body &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative w-full max-w-5xl h-[90vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effects Background */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header Sticky */}
              <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                <div className="p-6 lg:p-8">
                  {/* Titre & Fermer */}
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <Trophy size={28} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-1">
                          Collection de Badges
                        </h2>
                        <p className="text-slate-400 text-sm">
                          Vos succès et accomplissements professionnels
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 group flex-shrink-0"
                    >
                      <X
                        size={24}
                        className="text-slate-400 group-hover:text-white transition-colors"
                      />
                    </button>
                  </div>

                  {/* Message Discord - Permanent */}
                  <div className="mb-6 flex items-center justify-center gap-2 px-3 py-2 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-[#5865F2] flex-shrink-0"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold text-[#5865F2] text-center">
                      Gagnez des rôles exclusifs sur Discord grâce à vos badges
                      !
                    </span>
                  </div>

                  {/* Barre de Progression Large */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                        Progression
                      </span>
                      <span className="text-2xl font-black text-white">
                        {earnedCount} / {totalBadges}
                      </span>
                    </div>
                    <div className="relative h-4 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-1000 shadow-lg shadow-orange-500/50"
                        style={{
                          width: `${Math.min(100, Math.round((earnedCount / totalBadges) * 100))}%`,
                        }}
                      />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                    <p className="text-center text-sm font-bold text-amber-400">
                      {Math.min(
                        100,
                        Math.round((earnedCount / totalBadges) * 100),
                      )}
                      % complété
                    </p>
                  </div>
                </div>
              </div>

              {/* Corps Scrollable */}
              <div className="overflow-y-auto overflow-x-hidden h-[calc(90vh-240px)] px-6 lg:px-8 pt-6 pb-16">
                {/* STREAK EN COURS — version safe (pas de division par zéro) */}
                {displayStreak != null &&
                  (() => {
                    const d = Math.max(
                      0,
                      Number(displayStreak.consecutive_days) || 0,
                    );
                    const t = Math.max(
                      1,
                      Number(displayStreak.target_days) || 7,
                    );
                    if (d >= t) return null;
                    const ratio = t > 0 ? d / t : 0;
                    return (
                      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Flame
                            className={`text-orange-500 flex-shrink-0 ${displayStreak.today_completed === false ? "animate-pulse" : "animate-pulse-slow"}`}
                            size={20}
                          />
                          <h3 className="text-lg font-black text-white uppercase tracking-wide">
                            Série en cours
                          </h3>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">
                          {displayStreak.target_badge_name ?? "Régulier"} :{" "}
                          <span className="font-bold text-amber-400">
                            {d} / {t}
                          </span>
                        </p>
                        <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, ratio * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {displayStreak.today_completed === false
                            ? "Objectifs du jour à faire pour continuer la série (la flamme clignote jusqu'à ce que vous les accomplissiez)."
                            : "Accomplissez les objectifs du jour pour continuer la série."}
                        </p>
                      </div>
                    );
                  })()}

                {/* Badges Débloqués */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="text-amber-500" size={20} />
                    <h3 className="text-lg font-black text-white uppercase tracking-wide">
                      Débloqués ({earnedList.length})
                    </h3>
                  </div>

                  {/* Grille Responsive Premium avec padding pour éviter que les badges soient coupés */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                      {earnedList.map((badge, index) => (
                        <div
                          key={badge.id}
                          ref={(el) => {
                            if (hoveredBadge?.id === badge.id && el) {
                              setTooltipRef(el);
                            }
                          }}
                          className={`group relative p-4 rounded-2xl border-2 ${RARITY_BORDER[badge.rarity]} ${RARITY_BG[badge.rarity]}
                        hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 cursor-pointer
                        animate-in fade-in slide-in-from-bottom-4`}
                          style={{
                            animationDelay: `${index * 30}ms`,
                            animationFillMode: "backwards",
                          }}
                          onMouseEnter={(e) => {
                            setHoveredBadge(badge);
                            setTooltipRef(e.currentTarget);
                          }}
                          onMouseLeave={() => {
                            setHoveredBadge(null);
                            setTooltipRef(null);
                          }}
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/0 via-amber-500/0 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="relative flex flex-col items-center text-center gap-2">
                            {/* Icône Badge */}
                            <div className="mb-1">
                              <BadgeIcon
                                badgeId={badge.id}
                                rarity={badge.rarity}
                                size="lg"
                              />
                            </div>

                            {/* Nom */}
                            <p className="text-xs lg:text-sm font-bold text-theme-text-primary line-clamp-2 leading-tight">
                              {badge.name}
                            </p>

                            {/* Rareté */}
                            <p
                              className={`text-[10px] font-semibold uppercase ${RARITY_TEXT[badge.rarity]}`}
                            >
                              {RARITY_LABELS[badge.rarity]}
                            </p>

                            {/* Points */}
                            {badge.xp_reward && (
                              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                                +{badge.xp_reward}
                              </div>
                            )}
                          </div>

                          {/* Tooltip hover avec description - Position fixed pour passer devant le header */}
                          {hoveredBadge?.id === badge.id && tooltipRef && (
                            <TooltipFixed
                              badge={badge}
                              anchorElement={tooltipRef}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Badges Bloqués */}
                {badges.available.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="text-slate-500" size={20} />
                      <h3 className="text-lg font-black text-slate-400 uppercase tracking-wide">
                        À Débloquer ({badges.available.length})
                      </h3>
                    </div>

                    {/* Grille avec padding pour éviter que les badges soient coupés */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                        {badges.available.map((badge, index) => (
                          <div
                            key={badge.id}
                            ref={(el) => {
                              if (hoveredBadge?.id === badge.id && el) {
                                setTooltipRef(el);
                              }
                            }}
                            className="group relative p-4 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30
                          grayscale hover:grayscale-0 opacity-50 hover:opacity-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                            style={{
                              animationDelay: `${index * 30}ms`,
                              animationFillMode: "backwards",
                            }}
                            onMouseEnter={(e) => {
                              setHoveredBadge(badge);
                              setTooltipRef(e.currentTarget);
                            }}
                            onMouseLeave={() => {
                              setHoveredBadge(null);
                              setTooltipRef(null);
                            }}
                          >
                            <div className="relative flex flex-col items-center text-center gap-2">
                              {/* Icône Badge Locked */}
                              <div className="relative mb-1">
                                <BadgeIcon
                                  badgeId={badge.id}
                                  rarity={badge.rarity}
                                  size="lg"
                                  locked
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Lock size={20} className="text-slate-500" />
                                </div>
                              </div>

                              {/* Nom */}
                              <p className="text-xs lg:text-sm font-bold text-slate-400 line-clamp-2 leading-tight">
                                {badge.name}
                              </p>

                              {/* Rareté */}
                              <p className="text-[10px] font-semibold uppercase text-slate-600">
                                {RARITY_LABELS[badge.rarity]}
                              </p>
                            </div>

                            {/* Tooltip hover avec description et critères - Position fixed pour passer devant le header */}
                            {hoveredBadge?.id === badge.id && tooltipRef && (
                              <TooltipFixed
                                badge={badge}
                                anchorElement={tooltipRef}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
