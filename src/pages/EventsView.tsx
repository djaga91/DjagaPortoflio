/**
 * EventsView - Liste et calendrier des événements B2B.
 *
 * Affiche les événements disponibles avec vue liste et calendrier.
 */

import { useEffect, useState } from "react";
import {
  Calendar,
  ArrowLeft,
  LayoutGrid,
  List,
  MapPin,
  Video,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  is_online: boolean;
  online_link: string | null;
  max_participants: number | null;
  participants_count: number;
  is_full: boolean;
  is_public: boolean;
  organization_name?: string;
  cover_image_url: string | null;
  is_registered?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  event_type: string;
  is_online: boolean;
  is_registered: boolean;
}

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  career_fair: { label: "Salon Emploi", color: "bg-blue-500", icon: "🎯" },
  webinar: { label: "Webinaire", color: "bg-purple-500", icon: "🎥" },
  workshop: { label: "Atelier", color: "bg-orange-500", icon: "🛠️" },
  info_session: { label: "Info Session", color: "bg-green-500", icon: "📢" },
  networking: { label: "Networking", color: "bg-pink-500", icon: "🤝" },
  interview_day: {
    label: "Journée Entretiens",
    color: "bg-indigo-500",
    icon: "💼",
  },
  company_visit: {
    label: "Visite Entreprise",
    color: "bg-teal-500",
    icon: "🏢",
  },
  conference: { label: "Conférence", color: "bg-amber-500", icon: "🎤" },
  other: { label: "Autre", color: "bg-gray-500", icon: "📅" },
};

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function EventsView() {
  const { setView } = useGameStore();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === "list") {
      fetchEvents();
    } else {
      fetchCalendarEvents();
    }
  }, [viewMode, currentMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/events/", {
        params: { upcoming_only: true, per_page: 50 },
      });
      setEvents(res.data.items);
    } catch (err) {
      console.error("Erreur chargement événements:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );
      const endDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      );

      const res = await api.get("/api/events/calendar", {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });
      setCalendarEvents(res.data.events);
    } catch (err) {
      console.error("Erreur chargement calendrier:", err);
    } finally {
      setLoading(false);
    }
  };

  const registerToEvent = async (eventId: string) => {
    setRegistering(eventId);
    try {
      await api.post(`/api/events/${eventId}/register`, {});
      // Rafraîchir
      if (viewMode === "list") {
        fetchEvents();
      } else {
        fetchCalendarEvents();
      }
    } catch (err) {
      console.error("Erreur inscription:", err);
    } finally {
      setRegistering(null);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeConfig = (type: string) => {
    return EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.other;
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      events: CalendarEvent[];
    }[] = [];

    // Jours du mois précédent
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    // Jours du mois courant
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayEvents = calendarEvents.filter((e) => {
        const eventDate = new Date(e.start);
        return eventDate.getDate() === day && eventDate.getMonth() === month;
      });
      days.push({ date, isCurrentMonth: true, events: dayEvents });
    }

    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    return days;
  };

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <Calendar className="w-7 h-7 text-purple-500" />
            Événements
          </h1>
          <p className="text-theme-text-secondary">
            Salons, webinaires, ateliers et plus
          </p>
        </div>

        <div className="flex items-center gap-2 bg-theme-bg-secondary border border-theme-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition ${
              viewMode === "list"
                ? "bg-purple-500 text-white"
                : "text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-lg transition ${
              viewMode === "calendar"
                ? "bg-purple-500 text-white"
                : "text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-theme-card border border-theme-card-border rounded-xl">
              <Calendar className="w-12 h-12 text-theme-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-theme-text-muted">Aucun événement à venir</p>
            </div>
          ) : (
            events.map((event) => {
              const typeConfig = getEventTypeConfig(event.event_type);
              return (
                <div
                  key={event.id}
                  className="bg-theme-card border border-theme-card-border rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  <div className="flex">
                    {/* Date sidebar */}
                    <div className="w-24 bg-purple-500/10 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-3xl font-bold text-purple-500">
                        {new Date(event.start_datetime).getDate()}
                      </span>
                      <span className="text-sm text-purple-400 uppercase">
                        {new Date(event.start_datetime).toLocaleDateString(
                          "fr-FR",
                          { month: "short" },
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs text-white ${typeConfig.color}`}
                            >
                              {typeConfig.icon} {typeConfig.label}
                            </span>
                            {event.is_registered && (
                              <span className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                Inscrit
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-theme-text-primary mb-1">
                            {event.title}
                          </h3>

                          {event.organization_name && (
                            <p className="text-sm text-theme-text-muted mb-2">
                              Par {event.organization_name}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-theme-text-secondary">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(event.start_datetime)}
                              {event.end_datetime &&
                                ` - ${formatTime(event.end_datetime)}`}
                            </span>

                            {event.is_online ? (
                              <span className="flex items-center gap-1 text-blue-500">
                                <Video className="w-4 h-4" />
                                En ligne
                              </span>
                            ) : event.location ? (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            ) : null}

                            {event.max_participants && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.participants_count}/
                                {event.max_participants}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="flex flex-col items-end gap-2">
                          {event.is_registered ? (
                            <button className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Inscrit
                            </button>
                          ) : event.is_full ? (
                            <button className="px-4 py-2 bg-gray-500/10 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                              Complet
                            </button>
                          ) : (
                            <button
                              onClick={() => registerToEvent(event.id)}
                              disabled={registering === event.id}
                              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition disabled:opacity-50"
                            >
                              {registering === event.id
                                ? "Inscription..."
                                : "S'inscrire"}
                            </button>
                          )}

                          {event.is_online &&
                            event.online_link &&
                            event.is_registered && (
                              <a
                                href={event.online_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Rejoindre
                              </a>
                            )}
                        </div>
                      </div>

                      {event.description && (
                        <p className="mt-3 text-sm text-theme-text-secondary line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-theme-card border border-theme-card-border rounded-xl overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between p-4 border-b border-theme-border">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-theme-text-secondary" />
            </button>
            <h2 className="text-lg font-semibold text-theme-text-primary">
              {MONTHS_FR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5 text-theme-text-secondary" />
            </button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-theme-border">
            {DAYS_FR.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-theme-text-secondary"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {generateCalendarDays().map(
              ({ date, isCurrentMonth, events }, index) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border-b border-r border-theme-border ${
                      !isCurrentMonth ? "bg-theme-bg-secondary/50" : ""
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-purple-500 text-white"
                          : isCurrentMonth
                            ? "text-theme-text-primary"
                            : "text-theme-text-muted"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((event) => {
                        const typeConfig = getEventTypeConfig(event.event_type);
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${typeConfig.color} text-white`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <div className="text-xs text-theme-text-muted">
                          +{events.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
}
