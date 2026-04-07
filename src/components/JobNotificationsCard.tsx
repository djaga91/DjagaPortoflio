/**
 * JobNotificationsCard - Carte de notifications d'offres d'emploi.
 *
 * Permet à l'utilisateur de :
 * - Gérer ses mots-clés de recherche
 * - Voir les notifications récentes
 * - Accéder rapidement aux nouvelles offres
 */

import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Plus,
  X,
  CheckCircle,
  ExternalLink,
  Search,
  Bookmark,
  MapPin,
  Briefcase,
  List,
  Layers,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  jobNotificationsAPI,
  matchingAPI,
  JobNotificationKeyword,
  JobNotification,
  JobOffer,
} from "../services/api";
import { useGameStore } from "../store/gameStore";
import { PreApplyModal } from "./PreApplyModal";
import { OffersSwipeView } from "./OffersSwipeView";
import {
  formatOfferDescriptionFull,
  getOfferPreview,
} from "../utils/offerDescription";
import { Logo } from "./Logo";

export interface JobNotificationsCardProps {
  /** En mode modal : pas de bordure ni fond carte autour du contenu */
  noFrame?: boolean;
  /** Callback appelé avant la redirection (pour fermer le modal parent) */
  onBeforeRedirect?: () => void;
}

const STORAGE_KEY_REJECTED_ALERTS = (userId: string) =>
  `alerts_rejected_offer_ids_${userId || "guest"}`;

export const JobNotificationsCard: React.FC<JobNotificationsCardProps> = ({
  noFrame = false,
}) => {
  const { user, setActiveToast, gamification, setView } = useGameStore();
  const cardClass = noFrame
    ? "p-6"
    : "bg-theme-card rounded-2xl p-6 border border-theme-card-border shadow-theme-sm";
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [savedOffers, setSavedOffers] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<JobNotificationKeyword[]>([]);
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<JobNotification | null>(null);
  const [notificationOffers, setNotificationOffers] = useState<JobOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [preApplyOffer, setPreApplyOffer] = useState<JobOffer | null>(null);
  const [alertsDisplayMode, setAlertsDisplayMode] = useState<"list" | "swipe">(
    () => {
      const stored = localStorage.getItem("alerts_display_mode");
      return stored === "swipe" || stored === "list" ? stored : "list";
    },
  );
  const [rejectedOfferIds, setRejectedOfferIds] = useState<Set<string>>(
    () => new Set(),
  );

  // Charger les offres refusées persistées (au montage et quand user change)
  useEffect(() => {
    const uid = user?.id || "guest";
    const key = STORAGE_KEY_REJECTED_ALERTS(uid);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr) && arr.length > 0) {
          setRejectedOfferIds(new Set(arr));
        }
      }
    } catch (_) {}
  }, [user?.id]);

  // Persister les offres refusées (Tinder alertes) pour survivre à déconnexion / autre onglet
  useEffect(() => {
    const key = STORAGE_KEY_REJECTED_ALERTS(user?.id || "guest");
    if (rejectedOfferIds.size > 0) {
      localStorage.setItem(key, JSON.stringify([...rejectedOfferIds]));
    } else {
      localStorage.removeItem(key);
    }
  }, [rejectedOfferIds, user?.id]);

  // Vérifier si l'utilisateur a trouvé un job
  const hasFoundJob =
    gamification?.badges?.includes("legendary") ||
    (savedOffers && savedOffers.some((o) => o.job_found));

  // Charger les données
  useEffect(() => {
    loadData();
    // Charger les offres sauvegardées pour vérifier si un job a été trouvé
    const loadSavedOffers = async () => {
      try {
        const offers = await matchingAPI.getSavedOffers();
        setSavedOffers(offers);
      } catch (err) {
        console.error("Erreur chargement offres:", err);
      }
    };
    loadSavedOffers();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keywordsData, notificationsData] = await Promise.all([
        jobNotificationsAPI.getKeywords(),
        jobNotificationsAPI.getNotifications(10, 0),
      ]);
      setKeywords(keywordsData);

      // L'API ne retourne que les notifications du jour (celle de la veille n'apparaît plus)
      setNotifications(notificationsData.notifications);
      setUnreadCount(notificationsData.unread_count);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      setAdding(true);
      const keyword = await jobNotificationsAPI.addKeyword(newKeyword.trim());
      setKeywords([keyword, ...keywords]);
      setNewKeyword("");
      setShowAddKeyword(false);
      setActiveToast({
        type: "success",
        title: "✅ Mot-clé ajouté",
        message: `Vous recevrez des notifications pour "${keyword.keyword}"`,
        icon: "🔔",
        duration: 3000,
      });
    } catch (err: any) {
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message:
          err.response?.data?.detail || "Impossible d'ajouter le mot-clé",
        icon: "⚠️",
        duration: 4000,
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await jobNotificationsAPI.deleteKeyword(keywordId);
      setKeywords(keywords.filter((k) => k.id !== keywordId));
      setActiveToast({
        type: "success",
        title: "✅ Mot-clé supprimé",
        message: "Les notifications pour ce mot-clé sont désactivées",
        icon: "🗑️",
        duration: 2000,
      });
    } catch (err) {
      console.error("Erreur suppression mot-clé:", err);
    }
  };

  // @ts-expect-error - Function reserved for future use (keyword toggle feature)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleKeyword = async (keyword: JobNotificationKeyword) => {
    try {
      const updated = await jobNotificationsAPI.updateKeyword(
        keyword.id,
        !keyword.is_active,
      );
      setKeywords(keywords.map((k) => (k.id === keyword.id ? updated : k)));
    } catch (err) {
      console.error("Erreur mise à jour mot-clé:", err);
    }
  };

  // Note: handleViewOffers supprimé car non utilisé (la redirection se fait autrement)

  const handleSaveOffer = async (offer: JobOffer) => {
    try {
      // dataset_id peut être 0 ou None pour les offres depuis job_offers
      // Le backend utilisera source + source_id dans ce cas
      if (!offer.source || !offer.source_id) {
        setActiveToast({
          type: "error",
          title: "❌ Erreur",
          message:
            "Impossible de sauvegarder cette offre (données incomplètes)",
          icon: "⚠️",
          duration: 3000,
        });
        return;
      }

      const savedOffer = await matchingAPI.saveOffer({
        dataset_id: offer.dataset_id || 0, // 0 indique qu'on utilise source + source_id
        title: offer.title,
        description: offer.description,
        full_description: offer.full_description,
        category: offer.category,
        contract_type: offer.contract_type,
        match_score: offer.match_score || 0,
        company_name: offer.company_name,
        location: offer.location,
        location_city: offer.location_city,
        location_country: offer.location_country,
        remote_type: offer.remote_type,
        apply_url: offer.apply_url,
        source: offer.source,
        source_id: offer.source_id,
      });

      // Mettre à jour le statut local avec le nouvel ID de job_match
      setNotificationOffers((prev) =>
        prev.map((o) =>
          o.source === offer.source && o.source_id === offer.source_id
            ? {
                ...o,
                is_saved: true,
                id: savedOffer.id,
                dataset_id: savedOffer.dataset_id,
              }
            : o,
        ),
      );

      // Déclencher un événement pour rafraîchir MesOffresView
      window.dispatchEvent(
        new CustomEvent("offerSaved", {
          detail: { offerId: savedOffer.id },
        }),
      );

      setActiveToast({
        type: "success",
        title: "✅ Offre sauvegardée",
        message: "L'offre a été ajoutée à vos offres sauvegardées",
        icon: "💾",
        duration: 2500,
      });
    } catch (err: any) {
      console.error("Erreur sauvegarde offre:", err);
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message:
          err.response?.data?.detail || "Impossible de sauvegarder l'offre",
        icon: "⚠️",
        duration: 3000,
      });
    }
  };

  const handleUnsaveOffer = async (offer: JobOffer) => {
    try {
      await matchingAPI.unsaveOffer({ job_match_id: offer.id });

      // Mettre à jour le statut local
      setNotificationOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, is_saved: false } : o)),
      );

      setActiveToast({
        type: "success",
        title: "✅ Offre retirée",
        message: "Elle n'apparaîtra plus dans vos offres sauvegardées",
        icon: "🗑️",
        duration: 2500,
      });
    } catch (err: any) {
      console.error("Erreur unsave offre:", err);
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message: err.response?.data?.detail || "Impossible de retirer l'offre",
        icon: "⚠️",
        duration: 3000,
      });
    }
  };

  const handleApplyOffer = async (offer: JobOffer) => {
    try {
      // Si l'offre n'est pas encore sauvegardée, la sauvegarder d'abord
      if (!offer.is_saved) {
        await handleSaveOffer(offer);
        // Attendre un peu pour que la sauvegarde soit complète
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Recharger les offres pour obtenir le nouvel ID de job_match
        const updatedOffers = await jobNotificationsAPI.getNotificationOffers(
          selectedNotification!.id,
        );
        const updatedOffer = updatedOffers.find(
          (o) => o.source === offer.source && o.source_id === offer.source_id,
        );
        if (updatedOffer && updatedOffer.is_saved) {
          // Utiliser le nouvel ID pour postuler
          await matchingAPI.applyToOffer({ job_match_id: updatedOffer.id });
          setNotificationOffers((prev) =>
            prev.map((o) =>
              o.source === offer.source && o.source_id === offer.source_id
                ? {
                    ...o,
                    is_applied: true,
                    is_saved: true,
                    id: updatedOffer.id,
                  }
                : o,
            ),
          );
        }
      } else {
        // L'offre est déjà sauvegardée, utiliser son ID directement
        await matchingAPI.applyToOffer({ job_match_id: offer.id });
        setNotificationOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, is_applied: true } : o)),
        );
      }

      setActiveToast({
        type: "success",
        title: "✅ Candidature enregistrée",
        message: "Vous pouvez suivre votre candidature dans Offres",
        icon: "📝",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Erreur application offre:", err);
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message:
          err.response?.data?.detail ||
          "Impossible d'enregistrer la candidature",
        icon: "⚠️",
        duration: 3000,
      });
    }
  };

  // Charger les offres de la notification quand on ouvre la popup (selectedNotification)
  useEffect(() => {
    if (!selectedNotification) {
      setNotificationOffers([]);
      return;
    }
    let cancelled = false;
    setLoadingOffers(true);
    jobNotificationsAPI
      .getNotificationOffers(selectedNotification.id)
      .then((offers) => {
        if (!cancelled) setNotificationOffers(offers);
      })
      .catch((err) => {
        console.error("Erreur chargement offres notification:", err);
        if (!cancelled) setNotificationOffers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOffers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedNotification?.id]);

  if (loading) {
    return (
      <div className={`${cardClass} animate-pulse`}>
        <div className="h-6 bg-theme-bg-tertiary rounded w-48 mb-4"></div>
        <div className="h-20 bg-theme-bg-tertiary rounded"></div>
      </div>
    );
  }

  // Si l'utilisateur a trouvé un job, afficher un message de félicitations
  if (hasFoundJob) {
    const jobOffer = savedOffers?.find((o) => o.job_found);
    return (
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-theme-text-primary">
            Alerte d'Offres
          </h3>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/40">
            <span className="text-3xl">🎉</span>
          </div>
          <h4 className="text-lg font-bold text-theme-text-primary mb-2">
            Vous avez trouvé un job, félicitations&nbsp;!
          </h4>
          {jobOffer && (
            <p className="text-sm text-theme-text-secondary mb-4">
              {jobOffer.title} chez{" "}
              {jobOffer.company_name || "cette entreprise"}
            </p>
          )}
          <p className="text-xs text-theme-text-muted">
            Les alertes sont désactivées. Profitez de votre nouveau poste ! 🚀
          </p>
        </div>
      </div>
    );
  }

  // Plus besoin de latestNotification, on affiche toutes les notifications

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-theme-text-primary">
            Alerte d'Offres
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Mots-clés (synchronisés avec Mon Profil > Mon Objectif) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-theme-text-secondary">
            Mots-clés :
          </span>
          {keywords.length === 0 && (
            <span className="text-xs text-theme-text-muted">
              Aucun mot-clé configuré
            </span>
          )}
        </div>
        <p className="text-xs text-theme-text-muted mb-2">
          Ces mots-clés sont aussi affichés en haut de Mon Profil (Mon
          Objectif). Ajoutez-les depuis l&apos;un ou l&apos;autre.
        </p>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {keywords.slice(0, 3).map((keyword) => (
              <div
                key={keyword.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  keyword.is_active
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                <span>{keyword.keyword}</span>
                <button
                  onClick={() => handleDeleteKeyword(keyword.id)}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded p-0.5 transition-colors"
                  title="Supprimer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {keywords.length > 3 && (
              <span className="text-xs text-theme-text-muted px-2 py-1">
                +{keywords.length - 3} autre{keywords.length - 3 > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Ajouter un mot-clé */}
        {!showAddKeyword ? (
          <button
            onClick={() => setShowAddKeyword(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <Plus size={14} />
            Ajouter un mot-clé
          </button>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
              placeholder="Ex: Data Engineer"
              className="flex-1 px-3 py-1.5 text-sm bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleAddKeyword}
              disabled={adding || !newKeyword.trim()}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? "..." : "Ajouter"}
            </button>
            <button
              onClick={() => {
                setShowAddKeyword(false);
                setNewKeyword("");
              }}
              className="p-1.5 hover:bg-theme-bg-secondary rounded-lg transition-colors"
            >
              <X size={16} className="text-theme-text-secondary" />
            </button>
          </div>
        )}
      </div>

      {/* Toutes les notifications d'aujourd'hui */}
      {notifications.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-theme-card-border space-y-3">
          {notifications.map((notification) => {
            const handleViewClick = (e?: React.MouseEvent) => {
              if (e) {
                e.stopPropagation();
                e.preventDefault();
              }
              // Ouvrir la popup avec les offres de cette alerte (pas de redirection vers mes_offres)
              setSelectedNotification(notification);
              setNotificationOffers([]);
              setSelectedOffer(null);
              if (!notification.read_at) {
                jobNotificationsAPI
                  .markAsRead(notification.id)
                  .then(() => {
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === notification.id
                          ? { ...n, read_at: new Date().toISOString() }
                          : n,
                      ),
                    );
                    setUnreadCount((c) => Math.max(0, c - 1));
                  })
                  .catch((err) => {
                    console.error(
                      "Erreur marquage notification comme lue:",
                      err,
                    );
                  });
              }
            };

            return (
              <div
                key={notification.id}
                data-notification-item="true"
                className="flex items-start justify-between gap-3 cursor-pointer hover:bg-theme-bg-secondary/50 p-2 rounded-lg transition-colors"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  e.stopPropagation();
                  handleViewClick(e);
                }}
                style={{ pointerEvents: "auto" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle
                      size={14}
                      className={
                        notification.read_at
                          ? "text-green-500"
                          : "text-indigo-500"
                      }
                    />
                    <span className="text-xs font-medium text-theme-text-secondary">
                      {notification.read_at ? "Lu" : "Nouveau"}
                    </span>
                    <span className="text-xs text-theme-text-muted">
                      {new Date(notification.sent_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-theme-text-primary font-medium mb-1">
                    {notification.notification_count} nouvelle
                    {notification.notification_count > 1 ? "s" : ""} offre
                    {notification.notification_count > 1 ? "s" : ""} pour{" "}
                    {notification.keyword.includes(",")
                      ? "vos mots-clés"
                      : `"${notification.keyword}"`}
                  </p>
                </div>
                <button
                  type="button"
                  ref={buttonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleViewClick(e);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex-shrink-0 transition-colors cursor-pointer"
                >
                  <ExternalLink size={12} />
                  Voir
                </button>
              </div>
            );
          })}
        </div>
      ) : keywords.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-theme-card-border text-center">
          <p className="text-sm text-theme-text-muted">
            Aucune offre aujourd'hui
          </p>
          <p className="text-xs text-theme-text-muted mt-1">
            Les nouvelles offres apparaîtront ici chaque matin
          </p>
        </div>
      ) : null}

      {/* Aucun mot-clé */}
      {keywords.length === 0 && !showAddKeyword && (
        <div className="mt-4 pt-4 border-t border-theme-card-border text-center">
          <p className="text-sm text-theme-text-muted mb-3">
            Configurez des mots-clés pour recevoir des alertes quotidiennes
          </p>
          <button
            onClick={() => setShowAddKeyword(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search size={16} />
            Ajouter un mot-clé
          </button>
        </div>
      )}

      {/* Modal des offres de la notification */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
          onClick={() => {
            setSelectedNotification(null);
            setNotificationOffers([]);
            setSelectedOffer(null);
          }}
        >
          <div
            className="bg-theme-card rounded-3xl p-6 max-w-5xl w-full max-h-[90vh] flex flex-col border border-theme-card-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (ne défile pas) */}
            <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-theme-text-primary mb-2">
                  Offres pour{" "}
                  {selectedNotification.keyword.includes(",")
                    ? "vos mots-clés"
                    : `"${selectedNotification.keyword}"`}
                </h2>
                {selectedNotification.keyword.includes(",") && (
                  <p className="text-sm text-theme-text-secondary mb-2">
                    Mots-clés: {selectedNotification.keyword}
                  </p>
                )}
                <p className="text-sm text-theme-text-secondary">
                  {selectedNotification.notification_count} nouvelle
                  {selectedNotification.notification_count > 1 ? "s" : ""} offre
                  {selectedNotification.notification_count > 1 ? "s" : ""}{" "}
                  trouvée
                  {selectedNotification.notification_count > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {notificationOffers.length > 0 && (
                  <div className="flex items-center gap-1 p-1 bg-theme-bg-secondary rounded-lg border border-theme-border">
                    <button
                      type="button"
                      onClick={() => {
                        setAlertsDisplayMode("list");
                        localStorage.setItem("alerts_display_mode", "list");
                      }}
                      className={`p-2 rounded-md transition-all ${
                        alertsDisplayMode === "list"
                          ? "bg-indigo-500 text-white"
                          : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary"
                      }`}
                      title="Affichage liste"
                      aria-label="Affichage liste"
                    >
                      <List size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlertsDisplayMode("swipe");
                        localStorage.setItem("alerts_display_mode", "swipe");
                      }}
                      className={`p-2 rounded-md transition-all ${
                        alertsDisplayMode === "swipe"
                          ? "bg-indigo-500 text-white"
                          : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary"
                      }`}
                      title="Affichage cartes (mode swipe)"
                      aria-label="Affichage mode swipe"
                    >
                      <Layers size={18} />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedNotification(null);
                    setNotificationOffers([]);
                    setSelectedOffer(null);
                  }}
                  className="p-2 rounded-xl hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Zone scrollable : liste des offres ou mode Swipe (z-10 pour rester au-dessus du bouton du bas) */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10">
              {loadingOffers ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p className="mt-4 text-theme-text-secondary">
                    Chargement des offres...
                  </p>
                </div>
              ) : notificationOffers.length > 0 &&
                alertsDisplayMode === "swipe" ? (
                <OffersSwipeView
                  offers={notificationOffers.filter(
                    (o) => !rejectedOfferIds.has(o.id || o.source_id || ""),
                  )}
                  onSave={handleSaveOffer}
                  onReject={(offer) =>
                    setRejectedOfferIds((prev) =>
                      new Set(prev).add(offer.id || offer.source_id || ""),
                    )
                  }
                  onViewDetails={setSelectedOffer}
                  showMatchScore
                  emptyMessage="Les prochaines offres arriveront demain."
                />
              ) : notificationOffers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notificationOffers.map((offer) => {
                    // Calculer le temps depuis la publication
                    const getTimeAgo = () => {
                      if (!offer.created_at) return null;
                      try {
                        const created = new Date(offer.created_at);
                        const now = new Date();
                        const diffMs = now.getTime() - created.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);

                        if (diffDays > 0) return `${diffDays}j`;
                        if (diffHours > 0) return `${diffHours}h`;
                        const diffMins = Math.floor(diffMs / (1000 * 60));
                        return diffMins > 0 ? `${diffMins}min` : "À l'instant";
                      } catch {
                        return null;
                      }
                    };

                    const timeAgo = getTimeAgo();
                    const locationText =
                      offer.location ||
                      offer.location_city ||
                      offer.location_country;
                    const contractType = offer.contract_type || "Non spécifié";
                    const remoteType =
                      offer.remote_type && offer.remote_type !== "Onsite"
                        ? offer.remote_type === "Remote"
                          ? "Télétravail"
                          : offer.remote_type
                        : null;
                    const isMatch = (offer.match_score ?? 0) >= 60;

                    return (
                      <div
                        key={offer.id}
                        onClick={() => setSelectedOffer(offer)}
                        className="bg-theme-card rounded-xl p-5 border border-theme-card-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer"
                      >
                        {/* Header avec titre et temps */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-theme-text-primary flex-1 pr-2 line-clamp-2">
                            {offer.title}
                          </h3>
                          {timeAgo && (
                            <div className="flex items-center gap-1 text-xs text-theme-text-muted flex-shrink-0">
                              <Clock size={14} />
                              <span>{timeAgo}</span>
                            </div>
                          )}
                        </div>

                        {/* Localisation dans un badge */}
                        {locationText && (
                          <div className="mb-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-theme-text-secondary">
                              <MapPin
                                size={14}
                                className="text-red-500 flex-shrink-0"
                              />
                              <span>{locationText}</span>
                            </div>
                          </div>
                        )}

                        {/* Type de contrat, remote et score de match */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-theme-text-secondary">
                            {contractType}
                          </span>
                          {remoteType && (
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-theme-text-secondary">
                              {remoteType}
                            </span>
                          )}
                          {/* Score de match à côté du type de contrat */}
                          {typeof offer.match_score === "number" && (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isMatch
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                              }`}
                            >
                              <TrendingUp size={12} />
                              {offer.match_score}%
                            </div>
                          )}
                        </div>

                        {/* Logo et nom de l'entreprise */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0">
                            <Logo
                              name={offer.company_name || ""}
                              type="company"
                              size={56}
                              showFallback={true}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-theme-text-primary text-base leading-tight">
                              {offer.company_name || "Entreprise non spécifiée"}
                            </p>
                          </div>
                        </div>

                        {/* Petit texte (description) */}
                        {(offer.description || offer.full_description) && (
                          <div className="mb-4 flex-1">
                            <p className="text-sm text-theme-text-secondary line-clamp-3 whitespace-pre-line">
                              {getOfferPreview(
                                offer.description,
                                offer.full_description,
                                150,
                              )}
                            </p>
                          </div>
                        )}

                        {/* Actions en bas */}
                        <div
                          className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-theme-border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {offer.apply_url ? (
                            <button
                              onClick={() => setPreApplyOffer(offer)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-xs font-medium transition-all flex-1 justify-center"
                            >
                              <ExternalLink size={14} />
                              Postuler
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyOffer(offer)}
                              disabled={offer.is_applied}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
                            >
                              <CheckCircle size={14} />
                              {offer.is_applied ? "Candidaté" : "Candidater"}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              offer.is_saved
                                ? handleUnsaveOffer(offer)
                                : handleSaveOffer(offer)
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                              offer.is_saved
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : "bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border"
                            }`}
                          >
                            <Bookmark
                              size={14}
                              fill={offer.is_saved ? "currentColor" : "none"}
                            />
                            {offer.is_saved ? "Sauvé" : "Sauvegarder"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-theme-text-secondary">
                    Aucune offre trouvée
                  </p>
                </div>
              )}
            </div>

            {/* Bouton en bas du modal (z-0 pour rester sous la zone des offres) */}
            {notificationOffers.length > 0 && (
              <div className="relative z-0 mt-4 pt-4 border-t border-theme-border text-center flex-shrink-0 bg-theme-card">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNotification(null);
                    setNotificationOffers([]);
                    setSelectedOffer(null);
                    localStorage.setItem("mes_offres_open_saved", "true");
                    setView("mes_offres");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                >
                  <Bookmark size={18} />
                  Voir toutes mes offres sauvegardées
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de détails de l'offre (z-[60] pour passer au-dessus du modal "Offres pour...") */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 isolate"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="relative z-10 bg-theme-card rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-theme-card-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
                  {selectedOffer.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-theme-text-secondary mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    <span>
                      {selectedOffer.company_name || "Entreprise non spécifiée"}
                    </span>
                  </div>
                  {(selectedOffer.location ||
                    selectedOffer.location_city ||
                    selectedOffer.location_country) && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>
                        {selectedOffer.location ||
                          selectedOffer.location_city ||
                          selectedOffer.location_country}
                      </span>
                    </div>
                  )}
                  {selectedOffer.contract_type && (
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium">
                      {selectedOffer.contract_type}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-xl hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {(selectedOffer.full_description || selectedOffer.description) && (
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                <div className="text-theme-text-secondary whitespace-pre-wrap leading-relaxed">
                  {formatOfferDescriptionFull(
                    selectedOffer.full_description || selectedOffer.description,
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-theme-border">
              {selectedOffer.apply_url ? (
                <button
                  onClick={() => {
                    setPreApplyOffer(selectedOffer);
                    setSelectedOffer(null);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                >
                  <ExternalLink size={18} />
                  Postuler maintenant
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleApplyOffer(selectedOffer);
                    setSelectedOffer(null);
                  }}
                  disabled={selectedOffer.is_applied}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={18} />
                  {selectedOffer.is_applied
                    ? "Candidature envoyée"
                    : "Marquer comme candidaté"}
                </button>
              )}
              <button
                onClick={() => {
                  selectedOffer.is_saved
                    ? handleUnsaveOffer(selectedOffer)
                    : handleSaveOffer(selectedOffer);
                  setSelectedOffer(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedOffer.is_saved
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                    : "bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border"
                }`}
              >
                <Bookmark
                  size={18}
                  fill={selectedOffer.is_saved ? "currentColor" : "none"}
                />
                {selectedOffer.is_saved ? "Sauvegardé" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vérification avant postulation */}
      {preApplyOffer && (
        <PreApplyModal
          isOpen={!!preApplyOffer}
          onClose={() => setPreApplyOffer(null)}
          onApply={() => {
            if (preApplyOffer.apply_url) {
              window.open(
                preApplyOffer.apply_url,
                "_blank",
                "noopener,noreferrer",
              );
            }
          }}
          offerTitle={preApplyOffer.title}
          offerUrl={preApplyOffer.apply_url || ""}
        />
      )}
    </div>
  );
};
