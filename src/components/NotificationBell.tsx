/**
 * NotificationBell - Cloche de notifications avec badge compteur.
 *
 * Affiche le nombre de notifications non lues + les entretiens/tests du jour
 */

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  X,
  Briefcase,
  MessageSquare,
  Award,
  Info,
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
  job_offer_ids?: string[]; // IDs des offres associées à la notification
  action_data?: string | null; // Données JSON (peut contenir job_id ou job_offer_id)
}

interface NotificationStats {
  unread: number;
  by_type: Record<string, number>;
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

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    unread: 0,
    by_type: {},
  });
  const [loading, setLoading] = useState(false);
  const [todayInterviews, setTodayInterviews] = useState<TodayInterview[]>([]);
  const [dismissedInterviews, setDismissedInterviews] = useState<Set<string>>(
    new Set(),
  );
  const { setView, view } = useGameStore();

  // Charger les stats et entretiens du jour au montage
  useEffect(() => {
    fetchStats();
    fetchTodayInterviews();
    // Refresh toutes les 30 secondes
    const interval = setInterval(() => {
      fetchStats();
      fetchTodayInterviews();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Charger les notifications quand le panneau s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchStats();
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/notifications/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur chargement stats notifications:", err);
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
        // Entretien RH aujourd'hui
        if (
          offer.hr_interview_date &&
          isToday(offer.hr_interview_date) &&
          !offer.hr_interview_completed
        ) {
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

        // Entretien technique aujourd'hui
        if (
          offer.technical_interview_date &&
          isToday(offer.technical_interview_date) &&
          !offer.technical_interview_completed
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

        // Test à faire aujourd'hui
        if (
          offer.test_scheduled_date &&
          isToday(offer.test_scheduled_date) &&
          !offer.test_completed
        ) {
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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { per_page: 10 };
      const res = await api.get("/api/notifications/", { params });
      setNotifications(res.data.items);
      setStats((prev) => ({ ...prev, unread: res.data.unread_count }));
    } catch (err) {
      console.error("[NotificationBell] Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error("[NotificationBell] Erreur marquage notification:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications([]);
      setStats((prev) => ({ ...prev, unread: 0 }));
    } catch (err) {
      console.error("[NotificationBell] Erreur marquage tout lu:", err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      // Si la notification redirige vers mes_offres, définir le flag pour afficher la section "saved"
      if (notification.action_url === "mes_offres") {
        localStorage.setItem("mes_offres_from_notification", "true");

        // Essayer de récupérer les IDs des offres depuis différentes sources
        let offerIds: string[] | null = null;

        // 1. Depuis job_offer_ids (pour les notifications d'offres)
        if (
          notification.job_offer_ids &&
          notification.job_offer_ids.length > 0
        ) {
          offerIds = notification.job_offer_ids;
        }
        // 2. Depuis action_data (peut contenir job_id ou job_offer_id)
        else if (notification.action_data) {
          try {
            const actionData = JSON.parse(notification.action_data);
            if (actionData.job_offer_id) {
              offerIds = [actionData.job_offer_id];
            } else if (actionData.job_id) {
              offerIds = [actionData.job_id];
            }
          } catch (err) {
            console.warn(
              "[NotificationBell] ⚠️ Erreur parsing action_data:",
              err,
            );
          }
        }

        // Stocker les IDs si trouvés
        if (offerIds && offerIds.length > 0) {
          localStorage.setItem(
            "mes_offres_notification_offer_ids",
            JSON.stringify(offerIds),
          );
        }

        // Utiliser requestAnimationFrame pour garantir que localStorage est écrit avant la redirection
        requestAnimationFrame(() => {
          setView(notification.action_url as never);
          setIsOpen(false);
        });
        return; // Sortir pour éviter d'exécuter le code ci-dessous
      }
      setView(notification.action_url as never);
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  const getIcon = (type: string, icon: string | null) => {
    if (icon) {
      // Map des icônes Lucide
      const iconMap: Record<string, React.ReactNode> = {
        Briefcase: <Briefcase className="w-4 h-4" />,
        MessageSquare: <MessageSquare className="w-4 h-4" />,
        Award: <Award className="w-4 h-4" />,
      };
      return iconMap[icon] || <Info className="w-4 h-4" />;
    }

    // Icône par défaut selon le type
    switch (type) {
      case "new_match":
      case "application_received":
        return <Briefcase className="w-4 h-4" />;
      case "new_message":
      case "message_reply":
        return <MessageSquare className="w-4 h-4" />;
      case "badge_earned":
        return <Award className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string, priority: string) => {
    if (priority === "urgent" || priority === "high") {
      return "bg-red-500";
    }
    switch (type) {
      case "new_match":
        return "bg-green-500";
      case "application_received":
        return "bg-blue-500";
      case "badge_earned":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const markInterviewAsDismissed = (interviewId: string) => {
    setDismissedInterviews((prev) => new Set([...prev, interviewId]));
  };

  const handleInterviewClick = (interview: TodayInterview) => {
    // Marquer comme vu
    markInterviewAsDismissed(interview.id);
    // Définir le flag pour afficher la section "saved"
    localStorage.setItem("mes_offres_from_notification", "true");
    // Stocker l'ID de l'offre associée à l'entretien
    localStorage.setItem(
      "mes_offres_notification_offer_ids",
      JSON.stringify([interview.offerId]),
    );
    // Utiliser requestAnimationFrame pour garantir que localStorage est écrit avant la redirection
    requestAnimationFrame(() => {
      setView("mes_offres");
      setIsOpen(false);
    });
  };

  const getInterviewIcon = (type: "hr" | "tech" | "test") => {
    switch (type) {
      case "hr":
        return <UserCheck className="w-4 h-4" />;
      case "tech":
        return <Briefcase className="w-4 h-4" />;
      case "test":
        return <FileCheck className="w-4 h-4" />;
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

  // Calculer le nombre total de notifications (backend + entretiens non dismissés)
  const activeInterviews = todayInterviews.filter(
    (interview) => !dismissedInterviews.has(interview.id),
  );
  const totalUnread = stats.unread + activeInterviews.length;

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-theme-bg-tertiary transition-colors"
        aria-label="Notifications"
        data-onboarding="notifications"
      >
        <Bell className="w-5 h-5 text-theme-text-secondary" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Panneau de notifications - Position relative à la cloche */}
      {isOpen && (
        <>
          {/* Overlay : masqué sur la page Notifications pour ne pas bloquer les clics */}
          {view !== "notifications" && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Panneau - Position absolue sous la cloche (à gauche) */}
          <div className="absolute left-0 top-12 w-80 max-h-[80vh] bg-theme-card border border-theme-card-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-theme-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-theme-text-primary">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {stats.unread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-theme-text-muted hover:text-theme-text-primary transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Tout marquer lu
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-theme-bg-tertiary rounded"
                  >
                    <X className="w-4 h-4 text-theme-text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* Liste */}
            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-4 text-center text-theme-text-muted">
                  Chargement...
                </div>
              ) : activeInterviews.length === 0 &&
                notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-theme-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-theme-text-muted text-sm">
                    Aucune notification
                  </p>
                </div>
              ) : (
                <>
                  {/* Entretiens/Tests du jour - TOUJOURS EN PREMIER */}
                  {activeInterviews.length > 0 && (
                    <div className="border-b-2 border-orange-500/30">
                      <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Aujourd'hui ({activeInterviews.length})
                        </p>
                      </div>
                      {activeInterviews.map((interview) => (
                        <button
                          key={interview.id}
                          onClick={() => handleInterviewClick(interview)}
                          className="w-full p-4 text-left border-b border-theme-border hover:bg-orange-50 dark:hover:bg-orange-900/10 transition bg-orange-50/50 dark:bg-orange-900/5"
                        >
                          <div className="flex gap-3">
                            {/* Icône */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-orange-500 to-red-500">
                              {getInterviewIcon(interview.type)}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-theme-text-primary font-medium">
                                {getInterviewTitle(interview.type)}
                              </p>
                              <p className="text-sm text-theme-text-secondary">
                                {interview.offerTitle}
                              </p>
                              <p className="text-xs text-theme-text-muted">
                                {interview.companyName} • Aujourd'hui à{" "}
                                {interview.time}
                              </p>
                            </div>

                            {/* Indicateur */}
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Notifications classiques */}
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void handleNotificationClick(notification);
                      }}
                      className={`w-full p-4 text-left border-b border-theme-border hover:bg-theme-bg-tertiary transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 ${
                        !notification.is_read ? "bg-theme-bg-secondary" : ""
                      }`}
                      type="button"
                    >
                      <div className="flex gap-3">
                        {/* Icône */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getTypeColor(
                            notification.type,
                            notification.priority,
                          )}`}
                        >
                          {getIcon(notification.type, notification.icon)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              notification.is_read
                                ? "text-theme-text-secondary"
                                : "text-theme-text-primary font-medium"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-theme-text-muted truncate">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-theme-text-muted mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Rond orange = non lue */}
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer - TOUJOURS visible */}
            <div className="p-3 border-t border-theme-border bg-theme-bg-secondary">
              <button
                onClick={() => {
                  setView("notifications" as never);
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-orange-500 hover:text-orange-400 font-medium transition"
              >
                Voir toutes les notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
