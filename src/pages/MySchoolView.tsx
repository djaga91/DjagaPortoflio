/**
 * MySchoolView - Page "Mon école" pour les étudiants
 *
 * Affiche le nom de l'école, un classement par points (cohorte ou école)
 * et un Wall of Fame (étudiants ayant trouvé un job).
 * Mise à jour en temps réel (polling).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import {
  GraduationCap,
  Trophy,
  Award,
  Users,
  Zap,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  schoolStudentAPI,
  matchingAPI,
  RankingEntry,
  WallOfFameEntry,
  PeerBadgesResponse,
} from "../services/api";
import { useGameStore } from "../store/gameStore";
import { getAbsoluteImageUrl } from "../utils/imageUrl";
import { X } from "lucide-react";
import { BadgeIcon } from "../components/BadgeIcon";

const POLL_INTERVAL_MS = 12_000; // Mise à jour toutes les 12 secondes

type TabId = "ranking" | "wall_of_fame";
type Scope = "cohort" | "school";

export default function MySchoolView() {
  const { setView, user } = useGameStore();
  const currentUserId = user?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState<{
    school_name: string;
    cohort_name: string | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("ranking");
  const [scope, setScope] = useState<Scope>("cohort");
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  /** Rang précédent par user_id (pour afficher flèche montée / descente) */
  const [previousRankByUserId, setPreviousRankByUserId] = useState<
    Record<string, number>
  >({});
  const scopeChangedRef = useRef(false);
  const [wallOfFame, setWallOfFame] = useState<WallOfFameEntry[]>([]);
  const [winnerLottieData, setWinnerLottieData] = useState<object | null>(null);
  const [numberOneLottieData, setNumberOneLottieData] = useState<object | null>(
    null,
  );
  /** Entrée du classement ou Wall of Fame sélectionnée pour afficher la modale badges (avatar, user_id, badges). */
  const [selectedPeer, setSelectedPeer] = useState<{
    user_id: string;
    username: string;
    profile_picture_url: string | null;
  } | null>(null);
  const [peerBadgesData, setPeerBadgesData] =
    useState<PeerBadgesResponse | null>(null);
  const [loadingPeerBadges, setLoadingPeerBadges] = useState(false);
  /** Offre "Je suis pris" de l'utilisateur courant (pour le bouton œil visibilité Wall of Fame). */
  const [myJobFoundOffer, setMyJobFoundOffer] = useState<{
    id: string;
    wall_of_fame_show_employer: boolean;
  } | null>(null);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  useEffect(() => {
    fetch("/winner.json")
      .then((r) => r.json())
      .then(setWinnerLottieData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/numberone.json")
      .then((r) => r.json())
      .then(setNumberOneLottieData)
      .catch(() => {});
  }, []);

  const fetchMySchool = useCallback(async () => {
    try {
      const data = await schoolStudentAPI.getMySchool();
      setSchool({
        school_name: data.school_name,
        cohort_name: data.cohort_name,
      });
      setError(null);
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "response" in e
          ? (
              e as {
                response?: { status?: number; data?: { detail?: string } };
              }
            ).response?.data?.detail
          : "Impossible de charger les données de l'école";
      setError(typeof message === "string" ? message : "Erreur de chargement");
      setSchool(null);
    }
  }, []);

  const fetchRanking = useCallback(async () => {
    try {
      const data = await schoolStudentAPI.getRanking(scope);
      setRanking((prev) => {
        if (!scopeChangedRef.current) {
          const oldMap: Record<string, number> = {};
          prev.forEach((e) => {
            oldMap[e.user_id] = e.rank;
          });
          setPreviousRankByUserId(oldMap);
        }
        scopeChangedRef.current = false;
        return data.entries;
      });
    } catch {
      setRanking([]);
    }
  }, [scope]);

  const fetchWallOfFame = useCallback(async () => {
    try {
      const data = await schoolStudentAPI.getWallOfFame(scope);
      setWallOfFame(data.entries);
    } catch {
      setWallOfFame([]);
    }
  }, [scope]);

  const refreshAll = useCallback(async () => {
    await fetchMySchool();
    await fetchRanking();
    await fetchWallOfFame();
  }, [fetchMySchool, fetchRanking, fetchWallOfFame]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      await fetchMySchool();
      if (cancelled) return;
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchMySchool]);

  useEffect(() => {
    if (!school) return;
    scopeChangedRef.current = true; // Ne pas utiliser l'ancien classement comme "précédent" après changement de scope
    setPreviousRankByUserId({});
    fetchRanking();
    fetchWallOfFame();
  }, [school, scope, fetchRanking, fetchWallOfFame]);

  // Polling pour mise à jour en temps réel
  useEffect(() => {
    if (!school) return;
    const interval = setInterval(() => {
      fetchRanking();
      fetchWallOfFame();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [school, scope, fetchRanking, fetchWallOfFame]);

  const fetchPeerBadges = useCallback(
    async (userId: string, silent = false) => {
      if (!silent) setLoadingPeerBadges(true);
      try {
        const data = await schoolStudentAPI.getPeerBadges(userId);
        setPeerBadgesData(data);
      } catch {
        if (!silent) setPeerBadgesData(null);
      } finally {
        if (!silent) setLoadingPeerBadges(false);
      }
    },
    [],
  );

  const openPeerBadges = useCallback(
    async (entry: RankingEntry | WallOfFameEntry) => {
      setSelectedPeer({
        user_id: entry.user_id,
        username: entry.username,
        profile_picture_url: entry.profile_picture_url ?? null,
      });
      setPeerBadgesData(null);
      await fetchPeerBadges(entry.user_id);
    },
    [fetchPeerBadges],
  );

  const closePeerBadges = useCallback(() => {
    setSelectedPeer(null);
    setPeerBadgesData(null);
  }, []);

  // Rafraîchir les badges du peer en arrière-plan tant que la modale est ouverte (mise à jour si l'étudiant gagne un nouveau badge)
  useEffect(() => {
    if (!selectedPeer) return;
    const interval = setInterval(() => {
      fetchPeerBadges(selectedPeer.user_id, true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedPeer?.user_id, fetchPeerBadges]);

  // Charger l'offre "Je suis pris" de l'utilisateur quand il est dans le Wall of Fame (pour le bouton œil)
  useEffect(() => {
    if (activeTab !== "wall_of_fame" || !currentUserId) return;
    const isInWallOfFame = wallOfFame.some((e) => e.user_id === currentUserId);
    if (!isInWallOfFame) {
      setMyJobFoundOffer(null);
      return;
    }
    let cancelled = false;
    matchingAPI
      .getSavedOffers()
      .then((offers) => {
        if (cancelled) return;
        const jobFoundOffers = offers.filter((o) => o.job_found);
        if (jobFoundOffers.length > 0) {
          // IMPORTANT : aligner avec le backend (Wall of Fame = offre job_found la plus récente)
          const jobFound = jobFoundOffers.reduce((best, cur) => {
            const bestTs = best.job_found_at
              ? new Date(best.job_found_at).getTime()
              : -1;
            const curTs = cur.job_found_at
              ? new Date(cur.job_found_at).getTime()
              : -1;
            // Si pas de dates, garder le premier trouvé ; sinon prendre la plus récente
            if (curTs === -1 && bestTs === -1) return best;
            return curTs > bestTs ? cur : best;
          }, jobFoundOffers[0]);
          setMyJobFoundOffer({
            id:
              typeof jobFound.id === "string"
                ? jobFound.id
                : String(jobFound.id),
            wall_of_fame_show_employer: Boolean(
              jobFound.wall_of_fame_show_employer,
            ),
          });
        } else {
          setMyJobFoundOffer(null);
        }
      })
      .catch(() => {
        if (!cancelled) setMyJobFoundOffer(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, currentUserId, wallOfFame]);

  const toggleWallOfFameVisibility = useCallback(async () => {
    if (!myJobFoundOffer || togglingVisibility) return;
    setTogglingVisibility(true);
    try {
      const nextVisible = !myJobFoundOffer.wall_of_fame_show_employer;
      const res = await schoolStudentAPI.setWallOfFameVisibility(nextVisible);
      setMyJobFoundOffer((prev) =>
        prev
          ? {
              ...prev,
              wall_of_fame_show_employer: res.wall_of_fame_show_employer,
            }
          : null,
      );
      await fetchWallOfFame();
    } catch (err) {
      console.error(
        "[MySchoolView] Erreur toggle visibilité Wall of Fame:",
        err,
      );
    } finally {
      setTogglingVisibility(false);
    }
  }, [myJobFoundOffer, togglingVisibility, fetchWallOfFame]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-theme-text-secondary">
            Chargement de votre école...
          </p>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 font-medium">
            {error || "Données indisponibles"}
          </p>
          <p className="text-theme-text-secondary text-sm mt-2">
            Cette page est réservée aux étudiants rattachés à une école.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <button
        onClick={() => setView("dashboard")}
        className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary mb-6 transition"
      >
        <ChevronLeft className="w-5 h-5" />
        Retour
      </button>

      {/* Nom de l'école en grand - gamifié */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg shadow-orange-500/30 mb-4">
          <GraduationCap className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary tracking-tight">
          {school.school_name}
        </h1>
        {school.cohort_name && (
          <p className="text-theme-text-secondary mt-2 text-lg">
            {school.cohort_name}
          </p>
        )}
      </div>

      {/* Tabs : Classement | Wall of Fame */}
      <div className="flex rounded-2xl bg-theme-bg-secondary border border-theme-border p-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("ranking")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition ${
            activeTab === "ranking"
              ? "bg-theme-card text-orange-600 dark:text-orange-400 shadow-theme-sm border border-theme-border"
              : "text-theme-text-secondary hover:text-theme-text-primary"
          }`}
        >
          <Trophy className="w-5 h-5" />
          Classement
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("wall_of_fame")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition ${
            activeTab === "wall_of_fame"
              ? "bg-theme-card text-amber-600 dark:text-amber-400 shadow-theme-sm border border-theme-border"
              : "text-theme-text-secondary hover:text-theme-text-primary"
          }`}
        >
          <Award className="w-5 h-5" />
          Wall of Fame
        </button>
      </div>

      {/* Scope : Cohorte | École */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex rounded-xl bg-theme-bg-secondary border border-theme-border p-0.5">
          <button
            type="button"
            onClick={() => setScope("cohort")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              scope === "cohort"
                ? "bg-orange-500 text-white"
                : "text-theme-text-secondary hover:text-theme-text-primary"
            }`}
          >
            Ma cohorte
          </button>
          <button
            type="button"
            onClick={() => setScope("school")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              scope === "school"
                ? "bg-orange-500 text-white"
                : "text-theme-text-secondary hover:text-theme-text-primary"
            }`}
          >
            Toute l'école
          </button>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary text-sm transition"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Contenu Classement */}
      {activeTab === "ranking" && (
        <div className="space-y-6">
          {ranking.length === 0 ? (
            <div className="bg-theme-card border border-theme-card-border rounded-2xl p-8 text-center text-theme-text-secondary">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun classement disponible pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Podium Top 3 : 2e à gauche, 1er au centre (plus haut), 3e à droite */}
              {ranking.length >= 1 &&
                (() => {
                  const first = ranking.find((e) => e.rank === 1);
                  const second = ranking.find((e) => e.rank === 2);
                  const third = ranking.find((e) => e.rank === 3);
                  const podiumOrder = [second, first, third].filter(Boolean);
                  const podiumColors = [
                    "bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-500 dark:to-slate-700 border-slate-300 dark:border-slate-600 shadow-lg shadow-slate-400/30 dark:shadow-slate-600/30",
                    "bg-gradient-to-b from-amber-300 to-yellow-500 dark:from-amber-500 dark:to-amber-700 border-amber-400 dark:border-amber-600 shadow-xl shadow-amber-500/40 dark:shadow-amber-600/40",
                    "bg-gradient-to-b from-amber-700 to-amber-900 dark:from-amber-800 dark:to-amber-950 border-amber-600 dark:border-amber-700 shadow-lg shadow-amber-700/30 dark:shadow-amber-800/30",
                  ];
                  const podiumMinHeights = [
                    "min-h-[180px] sm:min-h-[200px]",
                    "min-h-[220px] sm:min-h-[240px]",
                    "min-h-[180px] sm:min-h-[200px]",
                  ];
                  const podiumRanks = [2, 1, 3];
                  return (
                    <div className="flex items-end justify-center gap-2 sm:gap-4 pb-0">
                      {podiumOrder.map((entry, idx) => {
                        if (!entry) return null;
                        const rank = podiumRanks[idx];
                        const prevRank = previousRankByUserId[entry.user_id];
                        const trend =
                          prevRank === undefined
                            ? null
                            : entry.rank < prevRank
                              ? "up"
                              : entry.rank > prevRank
                                ? "down"
                                : null;
                        return (
                          <div
                            key={entry.user_id}
                            className="flex-1 max-w-[140px] sm:max-w-[160px] flex flex-col items-center"
                          >
                            <div className="flex items-end gap-1 w-full justify-center">
                              <button
                                type="button"
                                onClick={() => openPeerBadges(entry)}
                                className={`flex-1 flex flex-col items-center rounded-t-2xl border-2 pt-4 cursor-pointer hover:opacity-95 transition ${podiumColors[idx]} ${podiumMinHeights[idx]}`}
                              >
                                <span className="text-xs font-bold text-white/90 dark:text-white/95 mb-1">
                                  {rank === 1 ? "1er" : `${rank}e`}
                                </span>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/30 bg-theme-bg-secondary shadow-md flex-shrink-0 mb-2">
                                  {entry.profile_picture_url ? (
                                    <img
                                      src={
                                        getAbsoluteImageUrl(
                                          entry.profile_picture_url,
                                        ) || ""
                                      }
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <p
                                  className="text-sm font-semibold text-center truncate w-full px-1 text-white drop-shadow-sm"
                                  title={entry.username}
                                >
                                  @{entry.username}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-white/95 text-xs font-medium">
                                  <Zap className="w-3.5 h-3.5" />
                                  {entry.xp} pts
                                </div>
                                {rank === 1 && (
                                  <div className="mt-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden">
                                    {numberOneLottieData ? (
                                      <Lottie
                                        animationData={numberOneLottieData}
                                        loop
                                        className="w-full h-full object-contain"
                                        style={{ margin: 0 }}
                                      />
                                    ) : (
                                      <span className="text-2xl">🥇</span>
                                    )}
                                  </div>
                                )}
                                {rank === 2 && (
                                  <span className="mt-2 text-xl">🥈</span>
                                )}
                                {rank === 3 && (
                                  <span className="mt-2 text-xl">🥉</span>
                                )}
                              </button>
                              {trend === "up" && (
                                <ChevronUp
                                  className="w-5 h-5 text-emerald-400 dark:text-emerald-300 flex-shrink-0 mb-2"
                                  aria-label="Monté au classement"
                                />
                              )}
                              {trend === "down" && (
                                <ChevronDown
                                  className="w-5 h-5 text-red-400 dark:text-red-300 flex-shrink-0 mb-2"
                                  aria-label="Descendu au classement"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              {/* Liste des rangs 4+ */}
              {ranking.filter((e) => e.rank >= 4).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-theme-text-muted px-1">
                    Suite du classement
                  </p>
                  {ranking
                    .filter((e) => e.rank >= 4)
                    .map((entry) => {
                      const isCurrentUser = currentUserId === entry.user_id;
                      const prevRank = previousRankByUserId[entry.user_id];
                      const trend =
                        prevRank === undefined
                          ? null
                          : entry.rank < prevRank
                            ? "up"
                            : entry.rank > prevRank
                              ? "down"
                              : null;
                      return (
                        <button
                          type="button"
                          key={entry.user_id}
                          onClick={() => openPeerBadges(entry)}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl border transition bg-theme-bg-secondary/80 dark:bg-theme-bg-secondary/60 border-theme-border hover:border-theme-text-muted/30 cursor-pointer text-left ${
                            isCurrentUser
                              ? "ring-2 ring-orange-400 dark:ring-orange-500"
                              : ""
                          }`}
                        >
                          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-theme-card border border-theme-border font-bold text-theme-text-secondary text-sm">
                            #{entry.rank}
                          </div>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-theme-border bg-theme-bg-secondary">
                            {entry.profile_picture_url ? (
                              <img
                                src={
                                  getAbsoluteImageUrl(
                                    entry.profile_picture_url,
                                  ) || ""
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate text-sm ${isCurrentUser ? "text-orange-600 dark:text-orange-400" : "text-theme-text-primary"}`}
                            >
                              @{entry.username}
                              {isCurrentUser && (
                                <span className="ml-1 text-xs">(vous)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
                              <Zap className="w-3.5 h-3.5 text-orange-500" />
                              <span>{entry.xp} pts</span>
                              <span className="text-theme-text-muted">•</span>
                              <span>Niveau {entry.level}</span>
                            </div>
                          </div>
                          {trend === "up" && (
                            <ChevronUp
                              className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 ml-auto"
                              aria-label="Monté au classement"
                            />
                          )}
                          {trend === "down" && (
                            <ChevronDown
                              className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 ml-auto"
                              aria-label="Descendu au classement"
                            />
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Contenu Wall of Fame - un seul cadre doré */}
      {activeTab === "wall_of_fame" && (
        <div className="rounded-2xl border-2 border-amber-400/60 dark:border-amber-500/50 bg-gradient-to-b from-amber-500/15 via-yellow-500/10 to-amber-600/5 dark:from-amber-600/20 dark:via-amber-700/10 dark:to-amber-800/10 shadow-lg shadow-amber-500/10 dark:shadow-amber-900/20 overflow-hidden">
          {/* Animation Lottie en haut, centrée */}
          <div className="flex justify-center pt-6 pb-4">
            {winnerLottieData && (
              <div className="w-full max-w-[260px] h-[130px] flex items-center justify-center">
                <Lottie
                  animationData={winnerLottieData}
                  loop
                  className="w-full h-full object-contain"
                  style={{ margin: 0 }}
                />
              </div>
            )}
          </div>
          {/* Liste ou message vide */}
          <div className="px-4 pb-6 space-y-3">
            {wallOfFame.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-amber-700 dark:text-amber-300 font-medium">
                  Soyez le premier à rejoindre le Wall of Fame ! Décrochez votre
                  premier job !
                </p>
              </div>
            ) : (
              wallOfFame.map((entry) => {
                const isCurrentUser = currentUserId === entry.user_id;
                const showEmployer = Boolean(
                  entry.job_title || entry.company_name,
                );
                const visibilityOn =
                  isCurrentUser && myJobFoundOffer
                    ? myJobFoundOffer.wall_of_fame_show_employer
                    : showEmployer;
                return (
                  <div
                    key={entry.user_id}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl bg-theme-card/50 dark:bg-theme-bg-secondary/50 border border-theme-border transition ${
                      isCurrentUser
                        ? "ring-2 ring-amber-400 dark:ring-amber-500"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openPeerBadges(entry)}
                      className="flex items-center gap-4 flex-1 min-w-0 text-left hover:opacity-90"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/50 bg-theme-bg-secondary">
                        {entry.profile_picture_url ? (
                          <img
                            src={
                              getAbsoluteImageUrl(entry.profile_picture_url) ||
                              ""
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold truncate ${isCurrentUser ? "text-amber-600 dark:text-amber-400" : "text-theme-text-primary"}`}
                        >
                          @{entry.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs">(vous)</span>
                          )}
                        </p>
                        {entry.job_found_at && (
                          <p className="text-sm text-theme-text-secondary">
                            Embauché le{" "}
                            {new Date(entry.job_found_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                        {isCurrentUser
                          ? visibilityOn && (
                              <p className="text-sm text-theme-text-secondary mt-0.5 flex items-center gap-2">
                                {[entry.job_title, entry.company_name].filter(
                                  Boolean,
                                ).length > 0
                                  ? [entry.job_title, entry.company_name]
                                      .filter(Boolean)
                                      .join(" · ")
                                  : "Poste et entreprise visibles"}
                              </p>
                            )
                          : (entry.job_title || entry.company_name) && (
                              <p className="text-sm text-theme-text-secondary mt-0.5">
                                {[entry.job_title, entry.company_name]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                      </div>
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isCurrentUser && myJobFoundOffer && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWallOfFameVisibility();
                          }}
                          disabled={togglingVisibility}
                          className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-theme-bg-secondary/80 relative z-10 shrink-0"
                          title={
                            myJobFoundOffer.wall_of_fame_show_employer
                              ? "Masquer poste et entreprise"
                              : "Afficher poste et entreprise"
                          }
                          aria-label={
                            myJobFoundOffer.wall_of_fame_show_employer
                              ? "Visible"
                              : "Masqué"
                          }
                        >
                          {togglingVisibility ? (
                            <Loader2 className="w-5 h-5 text-theme-text-muted animate-spin" />
                          ) : myJobFoundOffer.wall_of_fame_show_employer ? (
                            <Eye className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-red-500 dark:text-red-400" />
                          )}
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium">
                        <Award className="w-4 h-4" />
                        Embauché
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Badges du candidat (classement / wall of fame) */}
      {selectedPeer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
          onClick={closePeerBadges}
          aria-hidden="true"
        >
          <div
            className="bg-theme-card border border-theme-card-border rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="peer-badges-title"
          >
            <div className="flex items-center justify-between p-4 border-b border-theme-border">
              <h2
                id="peer-badges-title"
                className="text-lg font-semibold text-theme-text-primary"
              >
                Profil étudiant
              </h2>
              <button
                type="button"
                onClick={closePeerBadges}
                className="p-2 rounded-lg hover:bg-theme-bg-tertiary text-theme-text-muted hover:text-theme-text-primary transition"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {/* Avatar + nom + user_id */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-theme-border bg-theme-bg-secondary flex-shrink-0 mb-3">
                  {selectedPeer.profile_picture_url ? (
                    <img
                      src={
                        getAbsoluteImageUrl(selectedPeer.profile_picture_url) ||
                        ""
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPeer.username}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-lg font-semibold text-theme-text-primary">
                  @{selectedPeer.username}
                </p>
              </div>

              {loadingPeerBadges ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
              ) : peerBadgesData ? (
                <>
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-theme-bg-secondary border border-theme-border">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-theme-text-secondary">
                      {peerBadgesData.xp} pts
                    </span>
                    <span className="text-theme-text-muted">•</span>
                    <span className="text-sm text-theme-text-secondary">
                      Niveau {peerBadgesData.level}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-theme-text-secondary mb-3">
                    Badges obtenus
                  </p>
                  {peerBadgesData.badges.length === 0 ? (
                    <p className="text-theme-text-muted text-sm text-center py-6">
                      Aucun badge débloqué pour le moment.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                      {peerBadgesData.badges.map((badge) => {
                        const RARITY_CARD_CLASS: Record<string, string> = {
                          common:
                            "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                          uncommon:
                            "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
                          rare: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600",
                          epic: "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 shadow-md shadow-purple-200/50 dark:shadow-purple-900/30",
                          legendary:
                            "bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30",
                        };
                        const style =
                          RARITY_CARD_CLASS[badge.rarity] ||
                          RARITY_CARD_CLASS.common;
                        return (
                          <div
                            key={badge.id}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${style}`}
                          >
                            <div className="flex items-center justify-center mb-2">
                              <BadgeIcon
                                badgeId={badge.id}
                                rarity={badge.rarity}
                                size="md"
                              />
                            </div>
                            <h4 className="text-sm font-bold text-center mb-1 text-theme-text-primary">
                              {badge.name}
                            </h4>
                            {badge.description && (
                              <p className="text-xs text-center text-theme-text-secondary line-clamp-2">
                                {badge.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-theme-text-muted text-sm text-center py-6">
                  Impossible de charger les badges.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
