/**
 * NotificationsView - Page complète des notifications.
 *
 * Affiche toutes les notifications avec pagination et filtres.
 */

import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  ArrowLeft,
  Briefcase,
  MessageSquare,
  Award,
  Info,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { api, matchingAPI, JobOffer } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  priority: string;
  icon: string | null;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
  sender_name: string | null;
  sender_avatar: string | null;
  job_offer_ids?: string[]; // IDs des offres associées à la notification
  action_data?: string | null; // Données JSON (peut contenir job_id ou job_offer_id)
}

interface NotificationList {
  items: Notification[];
  total: number;
  unread_count: number;
  page: number;
  per_page: number;
  pages: number;
}

interface TodayInterview {
  id: string;
  type: "hr" | "tech" | "test";
  offerTitle: string;
  companyName: string;
  date: string;
  time: string;
  completed: boolean;
  offerId: string;
}

const TYPE_LABELS: Record<string, string> = {
  new_match: "Match offre",
  application_received: "Candidature",
  application_status: "Statut candidature",
  new_message: "Message",
  message_reply: "Réponse",
  partnership_request: "Partenariat",
  partnership_accepted: "Partenariat accepté",
  badge_earned: "Badge gagné",
  profile_reminder: "Rappel profil",
  cv_ready: "CV prêt",
  system: "Système",
  announcement: "Annonce",
};

const PAGE_KEY = "notifications_page";
const FILTER_KEY = "notifications_show_unread_only";

export default function NotificationsView() {
  const { setView } = useGameStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    const s = localStorage.getItem(PAGE_KEY);
    const n = parseInt(s ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(() => {
    return localStorage.getItem(FILTER_KEY) === "true";
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [todayInterviews, setTodayInterviews] = useState<TodayInterview[]>([]);
  const fetchingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(PAGE_KEY, String(page));
  }, [page]);

  useEffect(() => {
    localStorage.setItem(FILTER_KEY, String(showUnreadOnly));
  }, [showUnreadOnly]);

  useEffect(() => {
    fetchNotifications();
    fetchTodayInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, showUnreadOnly]);

  const fetchNotifications = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        per_page: 20,
      };
      if (showUnreadOnly) params.unread_only = true;

      const res = await api.get<NotificationList>("/api/notifications/", {
        params,
      });
      setNotifications(res.data.items);
      setTotalPages(Math.max(1, res.data.pages));
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const fetchTodayInterviews = async () => {
    try {
      const offers = await matchingAPI.getSavedOffers();
      const today = new Date();

      const interviews: TodayInterview[] = [];

      // Fonction helper pour comparer les dates (ignore le fuseau horaire)
      const isToday = (dateStr: string) => {
        const interviewDate = new Date(dateStr);
        return (
          interviewDate.getFullYear() === today.getFullYear() &&
          interviewDate.getMonth() === today.getMonth() &&
          interviewDate.getDate() === today.getDate()
        );
      };

      offers.forEach((offer: JobOffer) => {
        // Entretien RH aujourd'hui (inclus complétés pour mode "Toutes")
        if (offer.hr_interview_date && isToday(offer.hr_interview_date)) {
          interviews.push({
            id: `hr_${offer.id}`,
            type: "hr",
            offerTitle: offer.title,
            companyName: offer.company_name || "Entreprise",
            date: offer.hr_interview_date,
            time: new Date(offer.hr_interview_date).toLocaleTimeString(
              "fr-FR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
            completed: offer.hr_interview_completed || false,
            offerId: offer.id,
          });
        }

        // Entretien technique aujourd'hui (inclus complétés pour mode "Toutes")
        if (
          offer.technical_interview_date &&
          isToday(offer.technical_interview_date)
        ) {
          interviews.push({
            id: `tech_${offer.id}`,
            type: "tech",
            offerTitle: offer.title,
            companyName: offer.company_name || "Entreprise",
            date: offer.technical_interview_date,
            time: new Date(offer.technical_interview_date).toLocaleTimeString(
              "fr-FR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
            completed: offer.technical_interview_completed || false,
            offerId: offer.id,
          });
        }

        // Test aujourd'hui (inclus complétés pour mode "Toutes")
        if (offer.test_scheduled_date && isToday(offer.test_scheduled_date)) {
          interviews.push({
            id: `test_${offer.id}`,
            type: "test",
            offerTitle: offer.title,
            companyName: offer.company_name || "Entreprise",
            date: offer.test_scheduled_date,
            time: new Date(offer.test_scheduled_date).toLocaleTimeString(
              "fr-FR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
            completed: offer.test_completed || false,
            offerId: offer.id,
          });
        }
      });

      setTodayInterviews(interviews);
    } catch (err) {
      console.error("Erreur chargement entretiens du jour:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      if (showUnreadOnly) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      }
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur marquage notification:", err);
    }
  };

  const markSelectedAsRead = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const unreadSelected = notifications.filter(
      (n) => selectedIds.has(n.id) && !n.is_read,
    ).length;
    try {
      await api.put("/api/notifications/read-all", { notification_ids: ids });
      if (showUnreadOnly) {
        const idSet = new Set(ids);
        setNotifications((prev) => prev.filter((n) => !idSet.has(n.id)));
      } else {
        setNotifications((prev) =>
          prev.map((n) =>
            selectedIds.has(n.id) ? { ...n, is_read: true } : n,
          ),
        );
      }
      setUnreadCount((prev) => Math.max(0, prev - unreadSelected));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Erreur marquage sélection:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      if (showUnreadOnly) {
        setNotifications([]);
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur marquage tout lu:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    const n = notifications.find((x) => x.id === id);
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((x) => x.id !== id));
      if (n && !n.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erreur suppression notification:", err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      setView(notification.action_url as never);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_match":
      case "application_received":
      case "application_status":
        return <Briefcase className="w-5 h-5" />;
      case "new_message":
      case "message_reply":
        return <MessageSquare className="w-5 h-5" />;
      case "badge_earned":
        return <Award className="w-5 h-5" />;
      case "partnership_request":
      case "partnership_accepted":
      case "new_cohort_member":
        return <Users className="w-5 h-5" />;
      case "interview_scheduled":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string, priority: string) => {
    if (priority === "urgent") return "bg-red-500";
    if (priority === "high") return "bg-orange-500";
    switch (type) {
      case "new_match":
        return "bg-green-500";
      case "application_received":
        return "bg-blue-500";
      case "badge_earned":
        return "bg-purple-500";
      case "partnership_request":
      case "partnership_accepted":
        return "bg-cyan-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getInterviewIcon = (type: "hr" | "tech" | "test") => {
    switch (type) {
      case "hr":
        return <UserCheck className="w-5 h-5" />;
      case "tech":
        return <Briefcase className="w-5 h-5" />;
      case "test":
        return <FileCheck className="w-5 h-5" />;
    }
  };

  const getInterviewTitle = (type: "hr" | "tech" | "test") => {
    switch (type) {
      case "hr":
        return "Entretien RH";
      case "tech":
        return "Entretien Technique";
      case "test":
        return "Test à faire";
    }
  };

  const handleInterviewClick = (interview: TodayInterview) => {
    // Marquer qu'on vient d'une notification pour afficher directement la section "saved"
    localStorage.setItem("mes_offres_from_notification", "true");
    // Stocker l'ID de l'offre associée à l'entretien
    localStorage.setItem(
      "mes_offres_notification_offer_ids",
      JSON.stringify([interview.offerId]),
    );
    // Utiliser requestAnimationFrame pour garantir que localStorage est écrit avant la redirection
    requestAnimationFrame(() => {
      setView("mes_offres");
    });
  };

  // En "Non lues" : uniquement entretiens/tests non complétés. En "Toutes" : tous (y compris effectués).
  const displayedTodayInterviews = showUnreadOnly
    ? todayInterviews.filter((i) => !i.completed)
    : todayInterviews;

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <Bell className="w-7 h-7 text-orange-500" />
            Notifications
          </h1>
          <p className="text-theme-text-secondary">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-theme-text-muted" />
          <span className="text-sm text-theme-text-secondary">Filtrer :</span>
        </div>

        <button
          onClick={() => {
            setShowUnreadOnly(false);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !showUnreadOnly
              ? "bg-orange-500/20 text-orange-500 dark:text-orange-400"
              : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-card-hover"
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => {
            setShowUnreadOnly(true);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            showUnreadOnly
              ? "bg-orange-500/20 text-orange-500 dark:text-orange-400"
              : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-card-hover"
          }`}
        >
          Non lues
        </button>

        {selectedIds.size > 0 && (
          <button
            onClick={markSelectedAsRead}
            className="ml-auto px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Marquer {selectedIds.size} comme lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="bg-theme-card border border-theme-card-border rounded-xl overflow-hidden">
        {/* Header de sélection */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-3 p-4 border-b border-theme-border bg-theme-bg-secondary">
            <input
              type="checkbox"
              checked={
                selectedIds.size === notifications.length &&
                notifications.length > 0
              }
              onChange={selectAll}
              className="w-4 h-4 rounded border-theme-border text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-theme-text-muted">
              {selectedIds.size > 0
                ? `${selectedIds.size} sélectionnée(s)`
                : "Tout sélectionner"}
            </span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mx-auto" />
          </div>
        ) : notifications.length === 0 &&
          displayedTodayInterviews.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-theme-text-muted mx-auto mb-4 opacity-30" />
            <p className="text-theme-text-muted">
              {showUnreadOnly
                ? "Aucune notification non lue"
                : "Aucune notification"}
            </p>
            {showUnreadOnly && (
              <button
                onClick={() => {
                  setShowUnreadOnly(false);
                  setPage(1);
                }}
                className="mt-4 text-orange-500 hover:text-orange-400 text-sm font-medium"
              >
                Voir toutes les notifications
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Section Entretiens du jour */}
            {displayedTodayInterviews.length > 0 && (
              <div className="border-b-2 border-orange-500/30">
                <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    Aujourd'hui ({displayedTodayInterviews.length})
                  </h3>
                </div>
                <div className="divide-y divide-theme-border">
                  {displayedTodayInterviews.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => handleInterviewClick(interview)}
                      className={`w-full flex items-start gap-4 p-4 text-left transition ${
                        interview.completed
                          ? "bg-theme-bg-tertiary hover:bg-theme-card-hover opacity-75"
                          : "hover:bg-orange-50 dark:hover:bg-orange-900/10 bg-orange-50/50 dark:bg-orange-900/5"
                      }`}
                    >
                      {/* Icône */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                          interview.completed
                            ? "bg-gray-400 dark:bg-gray-500"
                            : "bg-gradient-to-br from-orange-500 to-red-500"
                        }`}
                      >
                        {getInterviewIcon(interview.type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={
                            interview.completed
                              ? "text-theme-text-muted font-medium"
                              : "text-theme-text-primary font-medium"
                          }
                        >
                          {getInterviewTitle(interview.type)}
                        </p>
                        <p
                          className={
                            interview.completed
                              ? "text-sm text-theme-text-muted mt-1"
                              : "text-sm text-theme-text-secondary mt-1"
                          }
                        >
                          {interview.offerTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-theme-text-muted">
                            {interview.companyName}
                          </span>
                          <span
                            className={
                              interview.completed
                                ? "text-xs text-theme-text-muted"
                                : "text-xs text-orange-600 dark:text-orange-400 font-medium"
                            }
                          >
                            Aujourd'hui à {interview.time}
                          </span>
                          {interview.completed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Effectué
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Indicateur non complété uniquement */}
                      {!interview.completed && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications classiques */}
            <div className="divide-y divide-theme-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 hover:bg-theme-bg-tertiary transition ${
                    !notification.is_read ? "bg-theme-bg-secondary" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                    className="mt-1 w-4 h-4 rounded border-theme-border text-orange-500 focus:ring-orange-500"
                  />

                  {/* Icône */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${getTypeColor(
                      notification.type,
                      notification.priority,
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Contenu */}
                  <button
                    onClick={() => void handleNotificationClick(notification)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`${
                            notification.is_read
                              ? "text-theme-text-secondary"
                              : "text-theme-text-primary font-medium"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-sm text-theme-text-muted mt-1">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-theme-text-muted">
                            {formatDate(notification.created_at)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-theme-bg-tertiary text-theme-text-muted">
                            {TYPE_LABELS[notification.type] ||
                              notification.type}
                          </span>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4 text-theme-text-muted" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-theme-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-theme-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5 text-theme-text-secondary" />
            </button>
            <span className="text-sm text-theme-text-secondary">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-theme-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5 text-theme-text-secondary" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
