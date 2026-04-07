import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  CheckCircle2,
  Users,
  Trophy,
  XCircle,
  ClipboardCheck,
  Grid3x3,
  CalendarDays,
} from "lucide-react";
import { JobOffer } from "../services/api";

interface CalendarEvent {
  date: Date;
  type:
    | "saved"
    | "applied"
    | "contacted"
    | "hr_interview"
    | "technical_interview"
    | "test_requested"
    | "test_scheduled"
    | "test_completed"
    | "rejected"
    | "job_found";
  offer: JobOffer;
  title: string;
  description: string;
  originalDateString?: string; // Date originale avec heure pour affichage
  hour?: number; // Heure de l'événement (0-23) pour la vue hebdomadaire
  minute?: number; // Minute de l'événement (0-59) pour la vue hebdomadaire
}

interface OffersCalendarProps {
  offers: JobOffer[];
  onDateClick?: (date: Date, events: CalendarEvent[]) => void;
}

type CalendarView = "month" | "week";

export const OffersCalendar: React.FC<OffersCalendarProps> = ({
  offers,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>("month");

  // Fonction helper pour normaliser une date en heure locale (pas UTC)
  // Le backend enregistre en UTC, mais on veut afficher la date en heure locale de l'utilisateur
  const normalizeDateToLocal = (dateString: string): Date => {
    if (!dateString) return new Date();

    try {
      // Le backend envoie des dates en UTC (ex: "2026-01-16T14:30:00" ou "2026-01-16T14:30:00Z")
      // On parse la date complète (avec heure) et on la convertit en heure locale
      // Puis on extrait uniquement la partie date pour l'affichage dans le calendrier

      // Parser la date en supposant qu'elle est en UTC
      let date: Date;
      if (dateString.endsWith("Z")) {
        // Date avec Z explicite (UTC)
        date = new Date(dateString);
      } else if (dateString.includes("T")) {
        // Date ISO sans Z - on suppose UTC et on ajoute le Z pour forcer l'interprétation UTC
        date = new Date(dateString + "Z");
      } else {
        // Date simple (YYYY-MM-DD) - on crée une date locale
        const [year, month, day] = dateString.split("-").map(Number);
        date = new Date(year, month - 1, day);
      }

      // Extraire la date locale (année, mois, jour) de cette date
      // Cela garantit que si l'utilisateur fait une action "aujourd'hui" en heure locale,
      // elle apparaît sur "aujourd'hui" dans le calendrier, même si c'est déjà le lendemain en UTC
      const localYear = date.getFullYear();
      const localMonth = date.getMonth();
      const localDay = date.getDate();

      // Créer une nouvelle date locale à minuit pour cette date
      // Cela évite les problèmes de timezone lors de l'affichage
      return new Date(localYear, localMonth, localDay, 0, 0, 0, 0);
    } catch (error) {
      console.error(
        `Erreur lors de la normalisation de la date ${dateString}:`,
        error,
      );
      return new Date();
    }
  };

  // Extraire tous les événements des offres (uniquement si le statut correspondant est actif)
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    offers.forEach((offer) => {
      // Date d'enregistrement (toujours affichée si l'offre existe)
      if (offer.created_at) {
        allEvents.push({
          date: normalizeDateToLocal(offer.created_at),
          type: "saved",
          offer,
          title: "Offre enregistrée",
          description: offer.title,
        });
      }

      // Date de postulation (uniquement si is_applied est true)
      if (offer.applied_at && offer.is_applied) {
        allEvents.push({
          date: normalizeDateToLocal(offer.applied_at),
          type: "applied",
          offer,
          title: "Postulation",
          description: offer.title,
        });
      }

      // Date de contact (uniquement si contacté par email ou téléphone)
      if (
        offer.contacted_at &&
        (offer.contacted_by_email || offer.contacted_by_phone)
      ) {
        allEvents.push({
          date: normalizeDateToLocal(offer.contacted_at),
          type: "contacted",
          offer,
          title: "Contacté",
          description: offer.title,
        });
      }

      // Entretien RH (uniquement si hr_interview_scheduled est true)
      if (offer.hr_interview_date && offer.hr_interview_scheduled) {
        const interviewDate = normalizeDateToLocal(offer.hr_interview_date);
        // Extraire l'heure de la date originale (en UTC pour préserver l'heure saisie)
        let hour = 0,
          minute = 0;
        if (offer.hr_interview_date) {
          try {
            const dateObj = new Date(offer.hr_interview_date);
            hour = dateObj.getUTCHours();
            minute = dateObj.getUTCMinutes();
          } catch (e) {
            // Si erreur, utiliser minuit
          }
        }
        allEvents.push({
          date: interviewDate,
          type: "hr_interview",
          offer,
          title: "Entretien RH",
          description: offer.title,
          originalDateString: offer.hr_interview_date,
          hour,
          minute,
        });
      }

      // Entretien technique (uniquement si technical_interview_scheduled est true)
      if (
        offer.technical_interview_date &&
        offer.technical_interview_scheduled
      ) {
        const interviewDate = normalizeDateToLocal(
          offer.technical_interview_date,
        );
        // Extraire l'heure de la date originale (en UTC pour préserver l'heure saisie)
        let hour = 0,
          minute = 0;
        if (offer.technical_interview_date) {
          try {
            const dateObj = new Date(offer.technical_interview_date);
            hour = dateObj.getUTCHours();
            minute = dateObj.getUTCMinutes();
          } catch (e) {
            // Si erreur, utiliser minuit
          }
        }
        allEvents.push({
          date: interviewDate,
          type: "technical_interview",
          offer,
          title: "Entretien technique",
          description: offer.title,
          originalDateString: offer.technical_interview_date,
          hour,
          minute,
        });
      }

      // Test demandé (uniquement si test_requested est true)
      if (offer.test_requested_at && offer.test_requested) {
        allEvents.push({
          date: normalizeDateToLocal(offer.test_requested_at),
          type: "test_requested",
          offer,
          title: "Test demandé",
          description: offer.title,
        });
      }

      // Test prévu (date prévue pour le test)
      if (offer.test_scheduled_date && offer.test_requested) {
        const testDate = normalizeDateToLocal(offer.test_scheduled_date);
        // Extraire l'heure de la date originale (en UTC pour préserver l'heure saisie)
        let hour = 0,
          minute = 0;
        if (offer.test_scheduled_date) {
          try {
            const dateObj = new Date(offer.test_scheduled_date);
            hour = dateObj.getUTCHours();
            minute = dateObj.getUTCMinutes();
          } catch (e) {
            // Si erreur, utiliser minuit
          }
        }
        allEvents.push({
          date: testDate,
          type: "test_scheduled",
          offer,
          title: "Test à faire avant",
          description: offer.title,
          originalDateString: offer.test_scheduled_date,
          hour,
          minute,
        });
      }

      // Test complété (uniquement si test_completed est true)
      if (offer.test_completed_at && offer.test_completed) {
        allEvents.push({
          date: normalizeDateToLocal(offer.test_completed_at),
          type: "test_completed",
          offer,
          title: "Test complété",
          description: offer.title,
        });
      }

      // Refus (uniquement si rejected est true)
      if (offer.rejected_at && offer.rejected) {
        allEvents.push({
          date: normalizeDateToLocal(offer.rejected_at),
          type: "rejected",
          offer,
          title: "Refus",
          description: offer.title,
        });
      }

      // Job trouvé (uniquement si job_found est true)
      if (offer.job_found_at && offer.job_found) {
        allEvents.push({
          date: normalizeDateToLocal(offer.job_found_at),
          type: "job_found",
          offer,
          title: "Job trouvé ! 🎉",
          description: offer.title,
        });
      }
    });

    return allEvents;
  }, [offers]);

  // Grouper les événements par date (en utilisant la date locale, pas UTC)
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach((event) => {
      // Utiliser la date locale (année, mois, jour) pour le groupement
      const year = event.date.getFullYear();
      const month = String(event.date.getMonth() + 1).padStart(2, "0");
      const day = String(event.date.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Obtenir les événements d'une date spécifique
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    // Utiliser la date locale (année, mois, jour) pour la comparaison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    return eventsByDate[dateKey] || [];
  };

  // Obtenir la couleur pour un type d'événement
  const getEventColor = (type: CalendarEvent["type"]): string => {
    switch (type) {
      case "saved":
        return "bg-indigo-500";
      case "applied":
        return "bg-blue-500";
      case "contacted":
        return "bg-yellow-500";
      case "hr_interview":
      case "technical_interview":
        return "bg-purple-500";
      case "test_requested":
        return "bg-orange-500";
      case "test_scheduled":
        return "bg-orange-400";
      case "test_completed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "job_found":
        return "bg-gradient-to-r from-yellow-400 to-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Obtenir l'icône pour un type d'événement
  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "saved":
        return <Bookmark size={12} />;
      case "applied":
        return <CheckCircle size={12} />;
      case "contacted":
        return <Users size={12} />;
      case "hr_interview":
      case "technical_interview":
        return <Calendar size={12} />;
      case "test_requested":
        return <ClipboardCheck size={12} />;
      case "test_scheduled":
        return <Calendar size={12} />;
      case "test_completed":
        return <CheckCircle2 size={12} />;
      case "rejected":
        return <XCircle size={12} />;
      case "job_found":
        return <Trophy size={12} />;
      default:
        return null;
    }
  };

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Générer les jours du mois
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Ajouter les jours vides du début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Générer les jours de la semaine (vue hebdomadaire)
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    // Trouver le lundi de la semaine courante
    const currentDay = currentDate.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Si dimanche, reculer de 6 jours
    const monday = new Date(currentDate);
    monday.setDate(monday.getDate() + mondayOffset);

    // Générer les 7 jours de la semaine
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Obtenir les événements d'un jour et d'une heure spécifiques (pour la vue hebdomadaire)
  const getEventsForDayAndHour = (
    date: Date,
    hour: number,
  ): CalendarEvent[] => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter((event) => {
      // Si l'événement a une heure définie, vérifier qu'il correspond à l'heure
      if (event.hour !== undefined) {
        return event.hour === hour;
      }
      // Sinon, ne pas afficher dans la vue horaire (événements sans heure précise)
      return false;
    });
  };

  // Générer les heures de la journée (8h à 20h)
  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = 8; i <= 20; i++) {
      h.push(i);
    }
    return h;
  }, []);

  // Gérer le clic sur une date
  const handleDateClick = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date, dateEvents);
    }
  };

  const monthNames = [
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

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Obtenir le texte de la semaine pour la vue hebdomadaire
  const getWeekRangeText = (): string => {
    if (weekDays.length === 0) return "";
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${start.getFullYear()}`;
    }
  };

  return (
    <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="text-indigo-500" size={24} />
          <h2 className="text-2xl font-bold text-theme-text-primary">
            {view === "month"
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : getWeekRangeText()}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle vue mois/semaine */}
          <div className="flex items-center gap-1 bg-theme-bg-secondary rounded-lg p-1">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                view === "month"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              <Grid3x3 size={16} />
              Mois
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                view === "week"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              <CalendarDays size={16} />
              Semaine
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={view === "month" ? goToPreviousMonth : goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={view === "month" ? goToNextMonth : goToNextWeek}
              className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-theme-border">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-theme-text-secondary">Enregistré</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-theme-text-secondary">Postulé</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-theme-text-secondary">Contacté</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-theme-text-secondary">Entretien</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-theme-text-secondary">Test</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-theme-text-secondary">Refus</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>
          <span className="text-theme-text-secondary">Job trouvé</span>
        </div>
      </div>

      {/* Vue mensuelle */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-2">
          {/* En-têtes des jours */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-theme-text-secondary py-2"
            >
              {day}
            </div>
          ))}

          {/* Jours du mois */}
          {monthDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square border-2 border-transparent"
                ></div>
              );
            }

            const dateEvents = getEventsForDate(date);
            // Comparer les dates en heure locale (pas UTC)
            const today = new Date();
            const todayLocal = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            );
            const dateLocal = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            );
            const isToday = dateLocal.getTime() === todayLocal.getTime();
            const isSelected =
              selectedDate &&
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
              ).getTime() === dateLocal.getTime();

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  aspect-square p-1 rounded-lg border-2 transition-all relative
                  ${isToday ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-theme-border bg-theme-bg-primary"}
                  ${isSelected ? "ring-2 ring-indigo-500 ring-offset-2" : ""}
                  ${dateEvents.length > 0 ? "hover:bg-theme-bg-secondary" : "hover:bg-theme-bg-secondary/50"}
                `}
              >
                <div className="text-sm font-medium text-theme-text-primary mb-1">
                  {date.getDate()}
                </div>

                {/* Indicateurs d'événements */}
                {dateEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                    {dateEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                        title={`${event.title}: ${event.description}`}
                      />
                    ))}
                    {dateEvents.length > 3 && (
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400"
                        title={`+${dateEvents.length - 3} autres événements`}
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Vue hebdomadaire */}
      {view === "week" && (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-1 min-w-[800px]">
            {/* Colonne des heures */}
            <div className="sticky left-0 z-10 bg-theme-card border-r border-theme-border">
              <div className="h-12 border-b border-theme-border"></div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-theme-border flex items-start justify-end pr-2 pt-1"
                >
                  <span className="text-xs text-theme-text-secondary font-medium">
                    {hour}h
                  </span>
                </div>
              ))}
            </div>

            {/* Colonnes des jours */}
            {weekDays.map((day, dayIndex) => {
              const today = new Date();
              const todayLocal = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
              );
              const dayLocal = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
              );
              const isToday = dayLocal.getTime() === todayLocal.getTime();

              return (
                <div
                  key={dayIndex}
                  className="min-w-[120px] border-r border-theme-border last:border-r-0"
                >
                  {/* En-tête du jour */}
                  <div
                    className={`h-12 border-b border-theme-border flex flex-col items-center justify-center ${
                      isToday
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500"
                        : "bg-theme-bg-primary"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-theme-text-secondary"}`}
                    >
                      {dayNames[day.getDay()]}
                    </div>
                    <div
                      className={`text-sm font-bold ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-theme-text-primary"}`}
                    >
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Cellules des heures */}
                  {hours.map((hour) => {
                    const hourEvents = getEventsForDayAndHour(day, hour);
                    return (
                      <div
                        key={hour}
                        className="h-16 border border-theme-border relative hover:bg-theme-bg-secondary/30 transition-colors"
                      >
                        {hourEvents.map((event, eventIndex) => {
                          // Calculer la position verticale basée sur les minutes
                          const topOffset = event.minute
                            ? (event.minute / 60) * 64
                            : 0; // 64px = hauteur de la cellule
                          const height = Math.max(24, 64 - topOffset); // Hauteur minimale de 24px

                          return (
                            <div
                              key={eventIndex}
                              className={`absolute left-0.5 right-0.5 ${getEventColor(event.type)} text-white rounded px-2 py-1 text-xs font-medium shadow-sm z-10 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                              style={{
                                top: `${topOffset}px`,
                                height: `${height}px`,
                                minHeight: "24px",
                                maxHeight: `${64 - topOffset}px`,
                              }}
                              title={`${event.title} - ${event.description} - ${event.offer.company_name || "Entreprise non spécifiée"}`}
                              onClick={() => handleDateClick(day)}
                            >
                              <div className="flex items-center gap-1 h-full">
                                <div className="flex-shrink-0">
                                  {getEventIcon(event.type)}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <span className="truncate text-xs leading-tight">
                                    {event.title}
                                  </span>
                                  {event.minute !== undefined && (
                                    <span className="text-[10px] opacity-90 leading-tight">
                                      {String(event.hour).padStart(2, "0")}:
                                      {String(event.minute).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Détails de la date sélectionnée */}
      {selectedDate && getEventsForDate(selectedDate).length > 0 && (
        <div className="mt-6 pt-6 border-t border-theme-border">
          <h3 className="text-lg font-bold text-theme-text-primary mb-4">
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map((event, index) => {
              // Afficher l'heure pour les tests et entretiens
              const showTime = [
                "test_scheduled",
                "hr_interview",
                "technical_interview",
              ].includes(event.type);
              let timeDisplay = "";

              if (showTime && event.originalDateString) {
                try {
                  const dateObj = new Date(event.originalDateString);
                  timeDisplay = dateObj.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                } catch (e) {
                  // Si erreur de parsing, ne pas afficher l'heure
                }
              }

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${getEventColor(event.type)} text-white`}
                >
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {event.title}
                      {timeDisplay && (
                        <span className="text-xs opacity-90 font-normal">
                          à {timeDisplay}
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-90 truncate">
                      {event.description}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {event.offer.company_name || "Entreprise non spécifiée"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
