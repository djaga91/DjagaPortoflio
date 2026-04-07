import React, { useState, useEffect, useMemo } from "react";
import {
  Bookmark,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  XCircle,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  X,
  Edit2,
  Save,
  ExternalLink,
  Trophy,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Bell,
  Sparkles,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import {
  matchingAPI,
  jobNotificationsAPI,
  JobOffer,
  UpdateOfferStatusRequest,
  gamificationAPI,
} from "../services/api";
import { Confetti } from "../components/Confetti";
import { PreApplyModal } from "../components/PreApplyModal";
import { OffersCalendar } from "../components/OffersCalendar";
import { OffersTrackingTable } from "../components/OffersTrackingTable";
import { JobNotificationsCard } from "../components/JobNotificationsCard";
import { storageSync } from "../services/storage";
import { formatOfferDescriptionFull } from "../utils/offerDescription";
import { Logo } from "../components/Logo";

const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Intérim",
  "Saisonnier",
  "Bénévolat",
];

type StatusFilter =
  | "all"
  | "saved"
  | "applied"
  | "interview"
  | "rejected"
  | "test"
  | "not_applied";

// ==================== TIMEZONE HELPERS ====================
// Convertir UTC (backend) → Local (datetime-local input)
const utcToLocal = (utcDateString: string | undefined): string => {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  // Ajuster au timezone local
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);
  return date.toISOString().slice(0, 16);
};

// Convertir Local (datetime-local input) → UTC (backend)
const localToUtc = (localDateString: string): string => {
  if (!localDateString) return "";
  const date = new Date(localDateString);
  return date.toISOString();
};

export const MesOffresView: React.FC = () => {
  const {
    user,
    setView,
    setActiveToast,
    setCoverLetterOfferUrl,
    setPrepareFoxOffer,
    showConfetti,
    setShowConfetti,
    setGamification,
    gamification,
    searchQuery,
    setSearchQuery,
    contractTypeFilter,
    setContractTypeFilter,
    locationFilter,
    setLocationFilter,
    hasSearched,
    matchingOffers,
  } = useGameStore();
  // Vérifier le flag AVANT le premier rendu pour définir la section initiale
  // Ne PAS supprimer le flag ici car React StrictMode peut monter le composant deux fois
  const [section, setSection] = useState<"home" | "saved">(() => {
    const fromNotification = localStorage.getItem(
      "mes_offres_from_notification",
    );
    const openSaved = localStorage.getItem("mes_offres_open_saved");
    return fromNotification === "true" || openSaved === "true"
      ? "saved"
      : "home";
  });
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [objectiveKeywords, setObjectiveKeywords] = useState<string[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpdateOfferStatusRequest>>(
    {},
  );
  const [showRejectedOffers, setShowRejectedOffers] = useState(false);
  const [showOtherOffers, setShowOtherOffers] = useState(false);
  const [preApplyOffer, setPreApplyOffer] = useState<JobOffer | null>(null);
  const [prepareFoxFeedbackOffer, setPrepareFoxFeedbackOffer] =
    useState<JobOffer | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "table">(
    "list",
  );
  const [showManualOfferModal, setShowManualOfferModal] = useState(false);
  const [manualOfferForm, setManualOfferForm] = useState({
    title: "",
    company_name: "",
    apply_url: "",
    location: "",
    description: "",
    contract_type: "CDI",
    category: "",
  });

  // Charger les objectifs (mots-clés) pour les suggestions de recherche sur l'accueil Offres
  useEffect(() => {
    const loadKeywords = async () => {
      try {
        const keywords = await jobNotificationsAPI.getKeywords();
        setObjectiveKeywords(
          keywords.filter((k) => k.is_active).map((k) => k.keyword),
        );
      } catch (_) {
        // Ignorer si non connecté ou erreur API
      }
    };
    loadKeywords();
  }, []);

  // Vérifier si l'utilisateur a le badge légendaire
  const hasLegendaryBadge =
    gamification?.badges?.includes("legendary") || false;

  // Vérifier le flag à chaque fois que le composant se monte OU que la section change
  // Mais seulement si section === 'home' pour éviter les boucles infinies
  useEffect(() => {
    const fromNotification = localStorage.getItem(
      "mes_offres_from_notification",
    );
    if (fromNotification === "true" && section === "home") {
      setSection("saved");
      // Ne PAS supprimer le flag ici, on le supprimera quand section === 'saved'
    }
  }, [section]); // S'exécute quand la section change OU au montage

  // Supprimer les flags quand la section devient 'saved' (confirmation que le changement a eu lieu)
  useEffect(() => {
    if (section === "saved") {
      const fromNotification = localStorage.getItem(
        "mes_offres_from_notification",
      );
      if (fromNotification === "true") {
        localStorage.removeItem("mes_offres_from_notification");
      }
      if (localStorage.getItem("mes_offres_open_saved") === "true") {
        localStorage.removeItem("mes_offres_open_saved");
      }
    }
  }, [section]);

  // Si on arrive sur la section "home" (recherche) et qu'on a déjà des résultats de recherche, aller directement sur MatchingView
  useEffect(() => {
    if (
      section === "home" &&
      hasSearched &&
      matchingOffers &&
      matchingOffers.length > 0
    ) {
      setView("matching");
    }
  }, [section, hasSearched, matchingOffers, setView]);

  useEffect(() => {
    loadOffers();

    // Marquer la visite de la page "Mes Offres" pour valider l'objectif "Consulter vos offres"
    if (user?.id) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const visitedKey = `mes_offres_visited_${today}`;
      localStorage.setItem(visitedKey, "true");
    }

    // Écouter les événements de sauvegarde d'offres depuis les notifications
    const handleOfferSaved = () => {
      loadOffers();
    };

    window.addEventListener("offerSaved", handleOfferSaved);

    return () => {
      window.removeEventListener("offerSaved", handleOfferSaved);
    };
  }, [user?.id]);

  // Ouvrir automatiquement une offre si spécifiée depuis les objectifs du jour ou une notification
  useEffect(() => {
    if (offers.length === 0) return;

    // 1) Depuis les objectifs : selectedOfferId (fallback si storageSync utilisé ailleurs)
    const selectedOfferId = storageSync.getItem("selectedOfferId");
    if (selectedOfferId) {
      storageSync.removeItem("selectedOfferId");
      const offer = offers.find(
        (o) => String(o.id) === String(selectedOfferId),
      );
      if (offer) {
        setEditingOffer(offer);
        setEditForm({
          contacted_by_email: offer.contacted_by_email,
          contacted_by_phone: offer.contacted_by_phone,
          follow_up_received: offer.follow_up_received,
          hr_interview_scheduled: offer.hr_interview_scheduled,
          hr_interview_date: offer.hr_interview_date,
          hr_interview_completed: offer.hr_interview_completed,
          technical_interview_scheduled: offer.technical_interview_scheduled,
          technical_interview_date: offer.technical_interview_date,
          technical_interview_completed: offer.technical_interview_completed,
          test_requested: offer.test_requested,
          test_scheduled_date: offer.test_scheduled_date,
          test_completed: offer.test_completed,
          rejected: offer.rejected,
          rejected_at: offer.rejected_at,
          rejection_reason: offer.rejection_reason,
          job_found: offer.job_found,
          job_found_at: offer.job_found_at,
          cover_letter_sent: offer.cover_letter_sent,
        });
      }
      return;
    }

    // 2) Depuis une notification : mes_offres_notification_offer_ids
    const rawIds = localStorage.getItem("mes_offres_notification_offer_ids");
    if (rawIds) {
      try {
        const ids = JSON.parse(rawIds) as string[];
        localStorage.removeItem("mes_offres_notification_offer_ids");
        const offerId = ids?.[0];
        if (offerId) {
          const offer = offers.find((o) => String(o.id) === String(offerId));
          if (offer) {
            setEditingOffer(offer);
            setEditForm({
              contacted_by_email: offer.contacted_by_email,
              contacted_by_phone: offer.contacted_by_phone,
              follow_up_received: offer.follow_up_received,
              hr_interview_scheduled: offer.hr_interview_scheduled,
              hr_interview_date: offer.hr_interview_date,
              hr_interview_completed: offer.hr_interview_completed,
              technical_interview_scheduled:
                offer.technical_interview_scheduled,
              technical_interview_date: offer.technical_interview_date,
              technical_interview_completed:
                offer.technical_interview_completed,
              test_requested: offer.test_requested,
              test_scheduled_date: offer.test_scheduled_date,
              test_completed: offer.test_completed,
              rejected: offer.rejected,
              rejected_at: offer.rejected_at,
              rejection_reason: offer.rejection_reason,
              job_found: offer.job_found,
              job_found_at: offer.job_found_at,
              cover_letter_sent: offer.cover_letter_sent,
            });
          }
        }
      } catch (_) {
        localStorage.removeItem("mes_offres_notification_offer_ids");
      }
    }
  }, [offers]);

  const inflateScore = (offer: JobOffer): JobOffer => {
    const factor = 1.7;
    const boosted = Math.min(
      100,
      Math.round((offer.match_score || 0) * factor),
    );
    return { ...offer, match_score: boosted };
  };

  /** Affiche une date ISO (UTC) en heure locale (ex. 19h04 au lieu de 18h04 UTC). */
  const formatPrepareFoxDate = (iso: string | undefined): string => {
    if (!iso || !iso.trim()) return "";
    const s =
      iso.trim().endsWith("Z") || iso.includes("+")
        ? iso.trim()
        : iso.trim() + "Z";
    try {
      return new Date(s).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch {
      return iso;
    }
  };

  const openFeedbackModal = async (offer: JobOffer) => {
    try {
      const fresh = await matchingAPI.getSavedOffers();
      const updated = fresh.find((o) => String(o.id) === String(offer.id));
      setPrepareFoxFeedbackOffer(updated ? inflateScore(updated) : offer);
      if (updated) {
        setOffers((prev) =>
          prev.map((o) =>
            String(o.id) === String(offer.id) ? inflateScore(updated) : o,
          ),
        );
      }
    } catch {
      setPrepareFoxFeedbackOffer(offer);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const savedOffers = await matchingAPI.getSavedOffers();
      setOffers(savedOffers.map(inflateScore));
    } catch (err: any) {
      console.error("Erreur chargement offres:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de charger vos offres sauvegardées",
        icon: "❌",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualOffer = async () => {
    if (
      !manualOfferForm.title ||
      !manualOfferForm.company_name ||
      !manualOfferForm.apply_url
    ) {
      setActiveToast({
        type: "error",
        title: "Champs manquants",
        message: "Veuillez remplir au moins le titre, l'entreprise et le lien",
        icon: "❌",
        duration: 3000,
      });
      return;
    }

    try {
      const newOffer = await matchingAPI.createManualOffer(manualOfferForm);
      setOffers((prev) => [inflateScore(newOffer), ...prev]);
      setShowManualOfferModal(false);
      setManualOfferForm({
        title: "",
        company_name: "",
        apply_url: "",
        location: "",
        description: "",
        contract_type: "CDI",
        category: "",
      });
      setActiveToast({
        type: "success",
        title: "Offre ajoutée",
        message: "L'offre a été ajoutée à votre tableau de bord",
        icon: "✅",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Erreur création offre manuelle:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: err.response?.data?.detail || "Impossible de créer l'offre",
        icon: "❌",
        duration: 3000,
      });
    }
  };

  const handleUpdateStatus = async (
    offerId: string,
    updates: Partial<UpdateOfferStatusRequest>,
  ) => {
    try {
      const wasJobFound = offers.find((o) => o.id === offerId)?.job_found;
      const updated = await matchingAPI.updateOfferStatus({
        job_match_id: offerId,
        ...updates,
      });

      // Rafraîchir les stats de gamification pour récupérer les nouveaux points
      try {
        const stats = await gamificationAPI.getStats();
        setGamification(stats);
      } catch (err) {
        console.error("Erreur rafraîchissement stats:", err);
      }

      // Si c'est un job trouvé (nouveau), déclencher les confettis et le message de félicitations
      if (updates.job_found === true && !wasJobFound) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);

        // Vérifier si l'utilisateur avait déjà le badge AVANT cette action
        const hadLegendaryBadgeBefore =
          gamification?.badges?.includes("legendary") || false;

        // Attendre un peu pour que le backend ait le temps de débloquer le badge
        setTimeout(async () => {
          try {
            const stats = await gamificationAPI.getStats();
            setGamification(stats);

            const hasLegendaryBadgeNow =
              stats.badges?.includes("legendary") || false;

            // Le badge vient d'être débloqué (n'était pas là avant, mais l'est maintenant)
            const badgeJustUnlocked =
              !hadLegendaryBadgeBefore && hasLegendaryBadgeNow;

            if (badgeJustUnlocked) {
              // Effacer l'ancien flag "déjà vu" pour permettre la réanimation
              localStorage.removeItem(`legendary_animation_shown_${user?.id}`);

              // Marquer pour afficher l'animation sur le dashboard
              localStorage.setItem(
                `show_legendary_animation_${user?.id}`,
                "true",
              );

              setActiveToast({
                type: "success",
                title: "🏆 BADGE LÉGENDAIRE DÉBLOQUÉ !",
                message: "Vous avez gagné 500 pts et le badge Légendaire ! 🐐",
                icon: "🐐",
                duration: 10000,
              });
            } else if (hasLegendaryBadgeNow) {
              setActiveToast({
                type: "success",
                title: "🎉 FÉLICITATIONS !",
                message:
                  "Tu l'as fait ! Toute l'équipe de PortfoliA est contente pour toi ! 🎊",
                icon: "🏆",
                duration: 8000,
              });
            } else {
              setActiveToast({
                type: "success",
                title: "🎉 FÉLICITATIONS !",
                message:
                  "Tu l'as fait ! Toute l'équipe de PortfoliA est contente pour toi ! 🎊",
                icon: "🏆",
                duration: 8000,
              });
            }
          } catch (err) {
            console.error("Erreur vérification badge:", err);
            setActiveToast({
              type: "success",
              title: "🎉 FÉLICITATIONS !",
              message:
                "Tu l'as fait ! Toute l'équipe de PortfoliA est contente pour toi ! 🎊",
              icon: "🏆",
              duration: 8000,
            });
          }
        }, 500);
      } else {
        setActiveToast({
          type: "success",
          title: "✅ Statut mis à jour",
          message: "Les modifications ont été enregistrées.",
          icon: "💾",
          duration: 3000,
        });
      }

      // Mettre à jour les offres avec la réponse complète du backend
      const updatedOffer = inflateScore(updated);
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? updatedOffer : o)),
      );

      // Déclencher un événement pour notifier les autres composants (ex: DailyObjectivesCard)
      window.dispatchEvent(new CustomEvent("offerUpdated"));

      // Fermer le modal après la sauvegarde
      if (editingOffer?.id === offerId) {
        setEditingOffer(null);
        setEditForm({});
      }
    } catch (err: any) {
      console.error("Erreur mise à jour statut:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message:
          err.response?.data?.detail || "Impossible de mettre à jour le statut",
        icon: "❌",
        duration: 3000,
      });
    }
  };

  const handleApply = async (offer: JobOffer) => {
    try {
      const updated = await matchingAPI.applyToOffer({
        job_match_id: offer.id,
      });

      // Rafraîchir les stats de gamification pour récupérer les nouveaux points
      try {
        const stats = await gamificationAPI.getStats();
        setGamification(stats);
      } catch (err) {
        console.error("Erreur rafraîchissement stats:", err);
      }

      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? inflateScore(updated) : o)),
      );

      // Déclencher un événement pour notifier les autres composants (ex: DailyObjectivesCard)
      window.dispatchEvent(new CustomEvent("offerUpdated"));

      // Fermer le modal d'édition si c'était cette offre
      if (editingOffer?.id === offer.id) {
        setEditingOffer(null);
        setEditForm({});
      }
      setActiveToast({
        type: "success",
        title: "🎉 Postulation enregistrée !",
        message:
          'Vous avez gagné 100 pts et débloqué le badge "Chercheur d\'emploi" !',
        icon: "🎯",
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Erreur postulation:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message:
          err.response?.data?.detail ||
          "Impossible d'enregistrer la postulation",
        icon: "❌",
        duration: 3000,
      });
    }
  };

  const handleUnsave = async (offer: JobOffer) => {
    try {
      await matchingAPI.unsaveOffer({ job_match_id: offer.id });
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      setActiveToast({
        type: "success",
        title: "Offre retirée",
        message: "Elle n'apparaîtra plus dans vos offres sauvegardées.",
        icon: "🗑️",
        duration: 2500,
      });
    } catch (err: any) {
      console.error("Erreur unsave offre:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: err.response?.data?.detail || "Impossible de retirer l'offre",
        icon: "❌",
        duration: 3000,
      });
    }
  };

  const getOfferStatus = (offer: JobOffer): string => {
    if (offer.rejected) return "rejected";
    if (
      offer.test_completed ||
      offer.technical_interview_scheduled ||
      offer.hr_interview_scheduled
    )
      return "interview";
    if (
      offer.contacted_by_email ||
      offer.contacted_by_phone ||
      offer.follow_up_received
    )
      return "contacted";
    if (offer.is_applied) return "applied";
    return "saved";
  };
  // Use getOfferStatus to avoid TS unused error
  void getOfferStatus;

  // Séparer les offres en catégories : prises, refusées, et autres
  const { jobFoundOffers, rejectedOffers, activeOffers } = useMemo(() => {
    const jobFound = offers.filter((o) => o.job_found);
    const rejected = offers.filter((o) => o.rejected && !o.job_found);
    const active = offers.filter((o) => !o.rejected && !o.job_found);
    return {
      jobFoundOffers: jobFound,
      rejectedOffers: rejected,
      activeOffers: active,
    };
  }, [offers]);

  // Filtrer et trier les offres selon les critères (sans les refusées sauf si filtre "rejected" ou accordéon ouvert)
  // Les offres non postulées sont affichées en premier
  const filteredOffers = useMemo(() => {
    // Si le filtre est "rejected", on affiche seulement les refusées
    if (statusFilter === "rejected") {
      return rejectedOffers.filter((offer) => {
        const matchesSearch =
          offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.company_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          offer.category?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }

    // Sinon, on affiche les offres actives (prises + autres, sans les refusées)
    const allActiveOffers = [...jobFoundOffers, ...activeOffers];

    const filtered = allActiveOffers.filter((offer) => {
      const matchesSearch =
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "not_applied" &&
          !offer.is_applied &&
          !offer.rejected &&
          !offer.job_found) ||
        (statusFilter === "applied" &&
          offer.is_applied &&
          !offer.contacted_by_email &&
          !offer.contacted_by_phone) ||
        (statusFilter === "interview" &&
          (offer.hr_interview_scheduled ||
            offer.technical_interview_scheduled ||
            offer.test_requested)) ||
        (statusFilter === "test" && offer.test_requested);

      return matchesSearch && matchesStatus;
    });

    // Trier : les offres non postulées en premier (si filtre "all" ou "not_applied")
    if (statusFilter === "all" || statusFilter === "not_applied") {
      return filtered.sort((a, b) => {
        const aNotApplied = !a.is_applied && !a.rejected && !a.job_found;
        const bNotApplied = !b.is_applied && !b.rejected && !b.job_found;
        if (aNotApplied && !bNotApplied) return -1;
        if (!aNotApplied && bNotApplied) return 1;
        return 0; // Garder l'ordre original si même statut
      });
    }

    return filtered;
  }, [jobFoundOffers, activeOffers, rejectedOffers, searchTerm, statusFilter]);

  const stats = {
    total: offers.length,
    saved: offers.filter((o) => !o.is_applied).length,
    applied: offers.filter(
      (o) => o.is_applied && !o.contacted_by_email && !o.contacted_by_phone,
    ).length,
    contacted: offers.filter(
      (o) =>
        o.contacted_by_email || o.contacted_by_phone || o.follow_up_received,
    ).length,
    interview: offers.filter(
      (o) =>
        o.hr_interview_scheduled ||
        o.technical_interview_scheduled ||
        o.test_requested,
    ).length,
    rejected: offers.filter((o) => o.rejected).length,
    // Taux d'activité : pourcentage d'offres avec au moins une action (postulé, contacté, ou entretien)
    // On compte chaque offre une seule fois, même si elle a plusieurs actions
    active: offers.filter(
      (o) =>
        o.is_applied ||
        o.contacted_by_email ||
        o.contacted_by_phone ||
        o.follow_up_received ||
        o.hr_interview_scheduled ||
        o.technical_interview_scheduled ||
        o.test_requested,
    ).length,
  };

  // Accueil Offres : recherche + deux boutons (Mes offres sauvegardées, Alertes d'Offres)
  if (section === "home") {
    const handleLaunchSearch = () => {
      if (!searchQuery?.trim()) return;
      // La recherche sera lancée automatiquement dans MatchingView si searchQuery est défini
      setView("matching");
    };
    return (
      <div className="min-h-screen bg-theme-bg-primary p-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto pt-8">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour au tableau de bord</span>
          </button>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
              <Search size={48} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-2">
              Offres
            </h1>
            <p className="text-lg text-theme-text-secondary max-w-2xl mx-auto">
              Recherchez des offres et gérez vos candidatures.
            </p>
          </div>

          {/* Barre de recherche : 1 ligne (recherche + type + lieu), bouton en dessous */}
          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: Data Engineer, Développeur Full Stack..."
                    className="w-full pl-10 pr-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleLaunchSearch()
                    }
                  />
                </div>
                <select
                  value={contractTypeFilter}
                  onChange={(e) => setContractTypeFilter(e.target.value)}
                  className="md:w-40 px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Tous les types</option>
                  {CONTRACT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Localisation..."
                  className="md:w-44 px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === "Enter" && handleLaunchSearch()}
                />
              </div>
              {objectiveKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-theme-text-muted flex items-center gap-1">
                    <Target size={12} />
                    Vos objectifs :
                  </span>
                  {objectiveKeywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setSearchQuery(kw)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={handleLaunchSearch}
                disabled={!searchQuery?.trim()}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={20} />
                Lancer la recherche
              </button>
            </div>
          </div>

          {/* Deux boutons centrés */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setSection("saved")}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-theme-card hover:bg-theme-card-hover border border-theme-card-border rounded-xl font-semibold text-theme-text-primary transition-all shadow-sm hover:shadow-md min-w-[220px]"
            >
              <Bookmark size={22} />
              Mes offres sauvegardées
            </button>
            <button
              onClick={() => setShowAlertsModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl min-w-[220px]"
            >
              <Bell size={22} />
              Alertes d'Offres
            </button>
          </div>
        </div>

        {/* Modal Alertes d'Offres */}
        {showAlertsModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              // Ne fermer que si on clique directement sur le backdrop (pas sur le contenu)
              if (e.target === e.currentTarget) {
                setShowAlertsModal(false);
              }
            }}
          >
            <div
              className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAlertsModal(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-theme-bg-secondary/80 hover:bg-theme-card text-theme-text-secondary hover:text-theme-text-primary transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
              <JobNotificationsCard
                onBeforeRedirect={() => setShowAlertsModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vue "Mes offres sauvegardées" (contenu actuel de la page)
  return (
    <div className="min-h-screen bg-theme-bg-primary p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSection("home")}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour aux Offres</span>
          </button>
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour au tableau de bord</span>
          </button>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Bookmark
                size={24}
                className="sm:w-8 sm:h-8 text-indigo-500 dark:text-indigo-400 flex-shrink-0"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-theme-text-primary">
                Dashboard de Candidatures
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setView("application_stats")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-theme-card border border-theme-card-border hover:bg-theme-bg-secondary text-theme-text-primary rounded-xl font-semibold transition-all text-sm"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </button>
              <button
                onClick={() => setShowManualOfferModal(true)}
                className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 overflow-hidden text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <FileText size={18} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">
                  + Ajouter une offre
                </span>
                <span className="relative z-10 sm:hidden">+ Offre</span>
              </button>
              <button
                onClick={() => setView("matching")}
                className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 overflow-hidden text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <TrendingUp size={18} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">
                  Relancer la recherche
                </span>
                <span className="relative z-10 sm:hidden">Rechercher</span>
              </button>
            </div>
          </div>
          <p className="text-theme-text-secondary">
            Suivez l'avancement de toutes vos candidatures en temps réel.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border">
            <div className="text-2xl font-bold text-theme-text-primary">
              {stats.total}
            </div>
            <div className="text-sm text-theme-text-secondary">Total</div>
          </div>
          <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border">
            <div className="text-2xl font-bold text-indigo-500">
              {stats.saved}
            </div>
            <div className="text-sm text-theme-text-secondary">
              Non postulées
            </div>
          </div>
          <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border">
            <div className="text-2xl font-bold text-blue-500">
              {stats.applied}
            </div>
            <div className="text-sm text-theme-text-secondary">En attente</div>
          </div>
          <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.contacted}
            </div>
            <div className="text-sm text-theme-text-secondary">Contactées</div>
          </div>
          <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border">
            <div className="text-2xl font-bold text-purple-500">
              {stats.interview}
            </div>
            <div className="text-sm text-theme-text-secondary">Entretiens</div>
          </div>
          <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border">
            <div className="text-2xl font-bold text-red-500">
              {stats.rejected}
            </div>
            <div className="text-sm text-theme-text-secondary">Refusées</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">
              {Math.round((stats.active / Math.max(stats.total, 1)) * 100)}%
            </div>
            <div className="text-sm opacity-90">Taux d'activité</div>
          </div>
        </div>

        {/* Boutons Calendrier et Tableau de suivi (séparés) */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() =>
              setViewMode(viewMode === "calendar" ? "list" : "calendar")
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
              viewMode === "calendar"
                ? "bg-purple-500 text-white border-purple-500 shadow-md"
                : "bg-theme-card text-theme-text-secondary border-theme-card-border hover:bg-theme-bg-secondary"
            }`}
          >
            <Calendar size={18} />
            {viewMode === "calendar"
              ? "Masquer le calendrier"
              : "Afficher le calendrier"}
            {viewMode === "calendar" ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "list" : "table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
              viewMode === "table"
                ? "bg-purple-500 text-white border-purple-500 shadow-md"
                : "bg-theme-card text-theme-text-secondary border-theme-card-border hover:bg-theme-bg-secondary"
            }`}
          >
            <FileText size={18} />
            {viewMode === "table"
              ? "Masquer le tableau"
              : "Afficher le tableau de suivi"}
            {viewMode === "table" ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>

        {/* Calendrier */}
        {viewMode === "calendar" && (
          <div className="mb-6">
            <OffersCalendar
              offers={offers}
              onDateClick={() => {
                // Optionnel : afficher un modal ou filtrer les offres par date
              }}
            />
          </div>
        )}

        {/* Tableau de suivi — uniquement les offres postulées */}
        {viewMode === "table" && (
          <div className="mb-6">
            {offers.filter((o) => o.is_applied === true).length === 0 && (
              <p className="text-theme-text-secondary text-sm mb-4">
                Aucune offre postulée. Marquez des offres comme « Postulé » dans
                la liste des offres sauvegardées pour les voir ici.
              </p>
            )}
            <OffersTrackingTable
              offers={offers.filter((o) => o.is_applied === true)}
              onUpdateOffer={async (offerId, updates) => {
                try {
                  const requestData = {
                    job_match_id: offerId,
                    ...updates,
                  };

                  const updated =
                    await matchingAPI.updateOfferStatus(requestData);

                  // VÉRIFICATION CRITIQUE : Si la réponse ne contient pas les bonnes valeurs, forcer le rechargement
                  if (
                    updates.is_applied === true &&
                    updated.is_applied !== true
                  ) {
                    console.error(
                      "🔴 [FRONTEND LOG 5] ❌❌❌ PROBLÈME DÉTECTÉ:",
                    );
                    console.error(
                      "🔴 [FRONTEND LOG 5] updates.is_applied =",
                      updates.is_applied,
                    );
                    console.error(
                      "🔴 [FRONTEND LOG 5] updated.is_applied =",
                      updated.is_applied,
                    );
                    console.error(
                      "🔴 [FRONTEND LOG 5] La réponse ne contient pas is_applied=true alors que la requête le demandait!",
                    );
                    console.error(
                      "🔴 [FRONTEND LOG 5] Forcer le rechargement depuis le backend...",
                    );
                    await loadOffers();
                    return; // Sortir de la fonction car loadOffers() mettra à jour l'état
                  }

                  // Mettre à jour l'état local immédiatement (comme handleUpdateStatus)
                  const updatedOffer = inflateScore(updated);
                  setOffers((prev) => {
                    const offerIdStr = String(offerId);
                    return prev.map((o) => {
                      if (String(o.id) === offerIdStr) {
                        return updatedOffer;
                      }
                      return o;
                    });
                  });

                  // Rafraîchir les stats de gamification
                  try {
                    const stats = await gamificationAPI.getStats();
                    setGamification(stats);
                  } catch (err) {
                    console.error("Erreur rafraîchissement stats:", err);
                  }

                  // Déclencher un événement pour notifier les autres composants
                  window.dispatchEvent(new CustomEvent("offerUpdated"));

                  setActiveToast({
                    type: "success",
                    title: "✅ Mis à jour",
                    message: "Les informations de suivi ont été enregistrées.",
                    icon: "✅",
                    duration: 3000,
                  });
                } catch (err: any) {
                  console.error("Erreur mise à jour:", err);
                  setActiveToast({
                    type: "error",
                    title: "Erreur",
                    message:
                      err.response?.data?.detail ||
                      "Impossible de mettre à jour l'offre",
                    icon: "❌",
                    duration: 3000,
                  });
                }
              }}
              onOffersUpdated={async () => {
                // Recharger les offres depuis le backend pour s'assurer de la synchronisation
                await loadOffers();
                // Déclencher un événement pour notifier les autres composants (ex: DailyObjectivesCard)
                window.dispatchEvent(new CustomEvent("offerUpdated"));
              }}
            />
          </div>
        )}

        {/* Filtres - Masqués en mode tableau */}
        {viewMode !== "table" && (
          <div className="bg-theme-card rounded-2xl p-4 border border-theme-card-border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={20} className="text-theme-text-secondary" />
                {(
                  [
                    "all",
                    "not_applied",
                    "applied",
                    "interview",
                    "rejected",
                    "test",
                  ] as StatusFilter[]
                ).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      statusFilter === filter
                        ? "bg-indigo-500 text-white"
                        : "bg-theme-bg-primary border border-theme-border text-theme-text-secondary hover:bg-theme-card"
                    }`}
                  >
                    {filter === "all"
                      ? "Toutes"
                      : filter === "not_applied"
                        ? "Non Postulées"
                        : filter === "applied"
                          ? "En attente"
                          : filter === "interview"
                            ? "Entretiens"
                            : filter === "rejected"
                              ? "Refusées"
                              : "Tests"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liste des offres - Masquée en mode tableau */}
        {viewMode !== "table" &&
          (loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-theme-text-secondary">
                Chargement de vos offres...
              </p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="bg-theme-card rounded-3xl p-12 border border-theme-card-border text-center">
              <Bookmark
                size={64}
                className="mx-auto mb-4 text-theme-text-muted"
              />
              <h2 className="text-2xl font-bold text-theme-text-primary mb-2">
                {offers.length === 0
                  ? "Aucune offre sauvegardée"
                  : "Aucune offre ne correspond à votre recherche"}
              </h2>
              <p className="text-theme-text-secondary mb-6">
                {offers.length === 0
                  ? "Sauvegardez des offres depuis la page de matching pour les retrouver ici."
                  : "Essayez de modifier vos critères de recherche."}
              </p>
              {offers.length === 0 && (
                <button
                  onClick={() => setView("matching")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                >
                  Lancer une analyse de matching
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Si badge légendaire : afficher uniquement l'offre "Je suis pris" en premier plan */}
              {hasLegendaryBadge && jobFoundOffers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {jobFoundOffers
                    .filter((offer) => {
                      const matchesSearch =
                        offer.title
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        offer.description
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        offer.company_name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        offer.category
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase());
                      return matchesSearch;
                    })
                    .map((offer) => (
                      <div
                        key={offer.id}
                        id={`offer-${offer.id}`}
                        className={`rounded-2xl p-6 border transition-all ${
                          offer.job_found
                            ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700 shadow-lg shadow-yellow-500/20"
                            : "bg-theme-card border-theme-card-border hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                      >
                        {/* Header de la carte */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-theme-text-primary line-clamp-1">
                                {offer.title}
                              </h3>
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                <TrendingUp size={12} />
                                {offer.match_score}%
                              </div>
                            </div>
                            <p className="text-sm text-theme-text-secondary mb-1">
                              {offer.company_name || "Entreprise non spécifiée"}
                            </p>
                            <p className="text-xs text-theme-text-muted">
                              {offer.location ||
                                offer.location_city ||
                                "Localisation non précisée"}{" "}
                              · {offer.contract_type || "Type non précisé"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {offer.job_found && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold animate-pulse">
                                <Trophy size={14} />
                                Je suis pris !
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setEditingOffer(offer);
                                setEditForm({
                                  contacted_by_email: offer.contacted_by_email,
                                  contacted_by_phone: offer.contacted_by_phone,
                                  follow_up_received: offer.follow_up_received,
                                  hr_interview_scheduled:
                                    offer.hr_interview_scheduled,
                                  hr_interview_date: offer.hr_interview_date,
                                  hr_interview_completed:
                                    offer.hr_interview_completed,
                                  technical_interview_scheduled:
                                    offer.technical_interview_scheduled,
                                  technical_interview_date:
                                    offer.technical_interview_date,
                                  technical_interview_completed:
                                    offer.technical_interview_completed,
                                  rejected: offer.rejected,
                                  rejection_reason: offer.rejection_reason,
                                  cover_letter_sent: offer.cover_letter_sent,
                                  test_requested: offer.test_requested,
                                  test_completed: offer.test_completed,
                                  test_scheduled_date:
                                    offer.test_scheduled_date,
                                  job_found: offer.job_found,
                                  notes: offer.notes,
                                });
                              }}
                              className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                              title="Modifier le statut"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleUnsave(offer)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              title="Retirer l'offre"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Indicateurs de statut — badges compacts */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {/* Postulé */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 ${
                              offer.is_applied
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                          >
                            <CheckCircle size={14} />
                            <span>Postulé</span>
                            {offer.applied_at && (
                              <span>
                                {new Date(offer.applied_at).toLocaleDateString(
                                  "fr-FR",
                                  { day: "2-digit", month: "2-digit" },
                                )}
                              </span>
                            )}
                          </div>
                          {/* Contacté */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 ${
                              offer.contacted_by_email ||
                              offer.contacted_by_phone
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                          >
                            {offer.contacted_by_email ? (
                              <Mail size={14} />
                            ) : offer.contacted_by_phone ? (
                              <Phone size={14} />
                            ) : (
                              <Mail size={14} />
                            )}
                            <span>Contacté</span>
                          </div>
                          {offer.follow_up_received && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <CheckCircle2 size={14} />
                              <span>Suite donnée</span>
                            </div>
                          )}
                          {offer.hr_interview_scheduled && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                              <Calendar size={14} />
                              <span>Entretien RH</span>
                              {offer.hr_interview_date && (
                                <span>
                                  {new Date(
                                    offer.hr_interview_date,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                          {offer.technical_interview_scheduled && (
                            <>
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                <Calendar size={14} />
                                <span>Entretien Tech</span>
                                {offer.technical_interview_date && (
                                  <span>
                                    {new Date(
                                      offer.technical_interview_date,
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              {offer.technical_interview_date &&
                                offer.apply_url && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPrepareFoxOffer({
                                        offerUrl: offer.apply_url!,
                                        offerTitle: offer.title,
                                      });
                                      setView("prepare_fox");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors shrink-0"
                                  >
                                    <Sparkles size={14} />
                                    Prépare-moi, Fox !
                                  </button>
                                )}
                              {offer.prepare_fox_score != null && (
                                <button
                                  type="button"
                                  onClick={() => openFeedbackModal(offer)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:ring-2 hover:ring-orange-400 shrink-0 cursor-pointer"
                                  title="Voir le feedback"
                                >
                                  <BarChart3 size={14} />
                                  <span>
                                    Note Fox :{" "}
                                    {Number(offer.prepare_fox_score).toFixed(1)}
                                    /20
                                  </span>
                                </button>
                              )}
                            </>
                          )}
                          {offer.test_requested && (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 ${
                                offer.test_completed
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                              }`}
                            >
                              <ClipboardCheck size={14} />
                              <span>
                                Test{" "}
                                {offer.test_completed ? "complété" : "demandé"}
                              </span>
                            </div>
                          )}
                          {offer.cover_letter_sent && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                              <FileText size={14} />
                              <span>Lettre envoyée</span>
                            </div>
                          )}
                          {offer.rejected && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              <XCircle size={14} />
                              <span>Refusé</span>
                              {offer.rejected_at && (
                                <span>
                                  {new Date(
                                    offer.rejected_at,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                          {offer.job_found && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                              <Trophy size={14} />
                              <span>🎉 Pris</span>
                              {offer.job_found_at && (
                                <span>
                                  {new Date(
                                    offer.job_found_at,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-4 border-t border-theme-card-border">
                          {!offer.is_applied && (
                            <>
                              <button
                                onClick={() => handleApply(offer)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle size={16} />
                                J'ai postulé
                              </button>
                              <button
                                onClick={() => setPreApplyOffer(offer)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink size={16} />
                                Postuler
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedOffer(offer)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg text-sm font-medium transition-colors"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Si badge légendaire : accordéon pour les autres offres */}
              {hasLegendaryBadge &&
                (activeOffers.length > 0 || rejectedOffers.length > 0) && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowOtherOffers(!showOtherOffers)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Bookmark
                          size={20}
                          className="text-slate-500 dark:text-slate-400"
                        />
                        <div className="text-left">
                          <h3 className="font-bold text-slate-700 dark:text-slate-300">
                            Autres offres
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {activeOffers.length + rejectedOffers.length} offre
                            {activeOffers.length + rejectedOffers.length > 1
                              ? "s"
                              : ""}{" "}
                            supplémentaire
                            {activeOffers.length + rejectedOffers.length > 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>
                      {showOtherOffers ? (
                        <ChevronUp
                          size={20}
                          className="text-slate-500 dark:text-slate-400"
                        />
                      ) : (
                        <ChevronDown
                          size={20}
                          className="text-slate-500 dark:text-slate-400"
                        />
                      )}
                    </button>

                    {showOtherOffers && (
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Offres actives */}
                        {activeOffers
                          .filter((offer) => {
                            const matchesSearch =
                              offer.title
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.description
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.company_name
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.category
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase());
                            return matchesSearch;
                          })
                          .map((offer) => (
                            <div
                              key={offer.id}
                              id={`offer-${offer.id}`}
                              className="rounded-2xl p-6 border border-theme-card-border bg-theme-card opacity-75"
                            >
                              {/* Même structure que les offres normales mais avec opacity réduite */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-theme-text-primary line-clamp-1">
                                      {offer.title}
                                    </h3>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                      <TrendingUp size={12} />
                                      {offer.match_score}%
                                    </div>
                                  </div>
                                  <p className="text-sm text-theme-text-secondary mb-1">
                                    {offer.company_name ||
                                      "Entreprise non spécifiée"}
                                  </p>
                                  <p className="text-xs text-theme-text-muted">
                                    {offer.location ||
                                      offer.location_city ||
                                      "Localisation non précisée"}{" "}
                                    ·{" "}
                                    {offer.contract_type || "Type non précisé"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingOffer(offer);
                                      setEditForm({
                                        contacted_by_email:
                                          offer.contacted_by_email,
                                        contacted_by_phone:
                                          offer.contacted_by_phone,
                                        follow_up_received:
                                          offer.follow_up_received,
                                        hr_interview_scheduled:
                                          offer.hr_interview_scheduled,
                                        hr_interview_date:
                                          offer.hr_interview_date,
                                        hr_interview_completed:
                                          offer.hr_interview_completed,
                                        technical_interview_scheduled:
                                          offer.technical_interview_scheduled,
                                        technical_interview_date:
                                          offer.technical_interview_date,
                                        technical_interview_completed:
                                          offer.technical_interview_completed,
                                        rejected: offer.rejected,
                                        rejection_reason:
                                          offer.rejection_reason,
                                        cover_letter_sent:
                                          offer.cover_letter_sent,
                                        test_requested: offer.test_requested,
                                        test_completed: offer.test_completed,
                                        test_scheduled_date:
                                          offer.test_scheduled_date,
                                        job_found: offer.job_found,
                                        notes: offer.notes,
                                      });
                                    }}
                                    className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                                    title="Modifier le statut"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleUnsave(offer)}
                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                    title="Retirer l'offre"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* Offres refusées dans l'accordéon */}
                        {rejectedOffers
                          .filter((offer) => {
                            const matchesSearch =
                              offer.title
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.description
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.company_name
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.category
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase());
                            return matchesSearch;
                          })
                          .map((offer) => (
                            <div
                              key={offer.id}
                              id={`offer-${offer.id}`}
                              className="rounded-2xl p-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 opacity-75"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-theme-text-primary line-clamp-1">
                                      {offer.title}
                                    </h3>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                      <TrendingUp size={12} />
                                      {offer.match_score}%
                                    </div>
                                  </div>
                                  <p className="text-sm text-theme-text-secondary mb-1">
                                    {offer.company_name ||
                                      "Entreprise non spécifiée"}
                                  </p>
                                  <p className="text-xs text-theme-text-muted">
                                    {offer.location ||
                                      offer.location_city ||
                                      "Localisation non précisée"}{" "}
                                    ·{" "}
                                    {offer.contract_type || "Type non précisé"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingOffer(offer);
                                      setEditForm({
                                        contacted_by_email:
                                          offer.contacted_by_email,
                                        contacted_by_phone:
                                          offer.contacted_by_phone,
                                        follow_up_received:
                                          offer.follow_up_received,
                                        hr_interview_scheduled:
                                          offer.hr_interview_scheduled,
                                        hr_interview_date:
                                          offer.hr_interview_date,
                                        hr_interview_completed:
                                          offer.hr_interview_completed,
                                        technical_interview_scheduled:
                                          offer.technical_interview_scheduled,
                                        technical_interview_date:
                                          offer.technical_interview_date,
                                        technical_interview_completed:
                                          offer.technical_interview_completed,
                                        rejected: offer.rejected,
                                        rejection_reason:
                                          offer.rejection_reason,
                                        cover_letter_sent:
                                          offer.cover_letter_sent,
                                        test_requested: offer.test_requested,
                                        test_completed: offer.test_completed,
                                        test_scheduled_date:
                                          offer.test_scheduled_date,
                                        job_found: offer.job_found,
                                        notes: offer.notes,
                                      });
                                    }}
                                    className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                                    title="Modifier le statut"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleUnsave(offer)}
                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                    title="Retirer l'offre"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                                <XCircle size={16} />
                                <span className="font-medium">Refusé</span>
                                {offer.rejected_at && (
                                  <span className="text-xs ml-auto">
                                    {new Date(
                                      offer.rejected_at,
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              {offer.rejection_reason && (
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4 italic">
                                  "{offer.rejection_reason}"
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Liste normale des offres (si pas de badge légendaire) */}
              {!hasLegendaryBadge && filteredOffers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {filteredOffers
                    .sort((a, b) => {
                      // Trier : d'abord celles avec job_found=true, puis les autres
                      if (a.job_found && !b.job_found) return -1;
                      if (!a.job_found && b.job_found) return 1;
                      return 0;
                    })
                    .map((offer) => (
                      <div
                        key={offer.id}
                        id={`offer-${offer.id}`}
                        className={`rounded-2xl p-6 border transition-all ${
                          offer.job_found
                            ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700 shadow-lg shadow-yellow-500/20"
                            : "bg-theme-card border-theme-card-border hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                      >
                        {/* Header de la carte */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-theme-text-primary line-clamp-1">
                                {offer.title}
                              </h3>
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                <TrendingUp size={12} />
                                {offer.match_score}%
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <Logo
                                name={offer.company_name || ""}
                                type="company"
                                size={24}
                                showFallback={false}
                              />
                              <p className="text-sm text-theme-text-secondary">
                                {offer.company_name ||
                                  "Entreprise non spécifiée"}
                              </p>
                            </div>
                            <p className="text-xs text-theme-text-muted">
                              {offer.location ||
                                offer.location_city ||
                                "Localisation non précisée"}{" "}
                              · {offer.contract_type || "Type non précisé"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {offer.job_found && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold animate-pulse">
                                <Trophy size={14} />
                                Je suis pris !
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setEditingOffer(offer);
                                setEditForm({
                                  contacted_by_email: offer.contacted_by_email,
                                  contacted_by_phone: offer.contacted_by_phone,
                                  follow_up_received: offer.follow_up_received,
                                  hr_interview_scheduled:
                                    offer.hr_interview_scheduled,
                                  hr_interview_date: offer.hr_interview_date,
                                  hr_interview_completed:
                                    offer.hr_interview_completed,
                                  technical_interview_scheduled:
                                    offer.technical_interview_scheduled,
                                  technical_interview_date:
                                    offer.technical_interview_date,
                                  technical_interview_completed:
                                    offer.technical_interview_completed,
                                  rejected: offer.rejected,
                                  rejection_reason: offer.rejection_reason,
                                  cover_letter_sent: offer.cover_letter_sent,
                                  test_requested: offer.test_requested,
                                  test_completed: offer.test_completed,
                                  test_scheduled_date:
                                    offer.test_scheduled_date,
                                  job_found: offer.job_found,
                                  notes: offer.notes,
                                });
                              }}
                              className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                              title="Modifier le statut"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleUnsave(offer)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              title="Retirer l'offre"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Indicateurs de statut — badges compacts */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 ${
                              offer.is_applied
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                          >
                            <CheckCircle size={14} />
                            <span>Postulé</span>
                            {offer.applied_at && (
                              <span>
                                {new Date(offer.applied_at).toLocaleDateString(
                                  "fr-FR",
                                  { day: "2-digit", month: "2-digit" },
                                )}
                              </span>
                            )}
                          </div>
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 ${
                              offer.contacted_by_email ||
                              offer.contacted_by_phone
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                          >
                            {offer.contacted_by_email ? (
                              <Mail size={14} />
                            ) : offer.contacted_by_phone ? (
                              <Phone size={14} />
                            ) : (
                              <Mail size={14} />
                            )}
                            <span>Contacté</span>
                          </div>
                          {offer.follow_up_received && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <CheckCircle2 size={14} />
                              <span>Suite donnée</span>
                            </div>
                          )}
                          {offer.hr_interview_scheduled && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                              <Calendar size={14} />
                              <span>Entretien RH</span>
                              {offer.hr_interview_date && (
                                <span>
                                  {new Date(
                                    offer.hr_interview_date,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                          {offer.technical_interview_scheduled && (
                            <>
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                <Calendar size={14} />
                                <span>Entretien Tech</span>
                                {offer.technical_interview_date && (
                                  <span>
                                    {new Date(
                                      offer.technical_interview_date,
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              {offer.technical_interview_date &&
                                offer.apply_url && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPrepareFoxOffer({
                                        offerUrl: offer.apply_url!,
                                        offerTitle: offer.title,
                                      });
                                      setView("prepare_fox");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors shrink-0"
                                  >
                                    <Sparkles size={14} />
                                    Prépare-moi, Fox !
                                  </button>
                                )}
                              {offer.prepare_fox_score != null && (
                                <button
                                  type="button"
                                  onClick={() => openFeedbackModal(offer)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:ring-2 hover:ring-orange-400 shrink-0 cursor-pointer"
                                  title="Voir le feedback"
                                >
                                  <BarChart3 size={14} />
                                  <span>
                                    Note Fox :{" "}
                                    {Number(offer.prepare_fox_score).toFixed(1)}
                                    /20
                                  </span>
                                </button>
                              )}
                            </>
                          )}
                          {offer.test_requested && (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 ${
                                offer.test_completed
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                              }`}
                            >
                              <ClipboardCheck size={14} />
                              <span>
                                Test{" "}
                                {offer.test_completed ? "complété" : "demandé"}
                              </span>
                            </div>
                          )}
                          {offer.cover_letter_sent && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                              <FileText size={14} />
                              <span>Lettre envoyée</span>
                            </div>
                          )}
                          {offer.rejected && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              <XCircle size={14} />
                              <span>Refusé</span>
                              {offer.rejected_at && (
                                <span>
                                  {new Date(
                                    offer.rejected_at,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                          {offer.job_found && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                              <Trophy size={14} />
                              <span>🎉 Pris</span>
                              {offer.job_found_at && (
                                <span>
                                  {new Date(
                                    offer.job_found_at,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-4 border-t border-theme-card-border">
                          {!offer.is_applied && (
                            <>
                              <button
                                onClick={() => handleApply(offer)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle size={16} />
                                J'ai postulé
                              </button>
                              <button
                                onClick={() => setPreApplyOffer(offer)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink size={16} />
                                Postuler
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedOffer(offer)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg text-sm font-medium transition-colors"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Section des offres refusées (accordéon) - Masquée si filtre "rejected" actif ou badge légendaire */}
              {!hasLegendaryBadge &&
                rejectedOffers.length > 0 &&
                statusFilter !== "rejected" && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowRejectedOffers(!showRejectedOffers)}
                      className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle
                          size={20}
                          className="text-red-500 dark:text-red-400"
                        />
                        <div className="text-left">
                          <h3 className="font-bold text-red-700 dark:text-red-300">
                            Offres refusées
                          </h3>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {rejectedOffers.length} offre
                            {rejectedOffers.length > 1 ? "s" : ""} refusée
                            {rejectedOffers.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {showRejectedOffers ? (
                        <ChevronUp
                          size={20}
                          className="text-red-500 dark:text-red-400"
                        />
                      ) : (
                        <ChevronDown
                          size={20}
                          className="text-red-500 dark:text-red-400"
                        />
                      )}
                    </button>

                    {showRejectedOffers && (
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {rejectedOffers
                          .filter((offer) => {
                            const matchesSearch =
                              offer.title
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.description
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.company_name
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              offer.category
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase());

                            const filterValue = statusFilter as string;
                            const matchesStatus =
                              filterValue === "all" ||
                              filterValue === "rejected" ||
                              (filterValue === "applied" &&
                                offer.is_applied &&
                                !offer.contacted_by_email &&
                                !offer.contacted_by_phone) ||
                              (filterValue === "interview" &&
                                (offer.hr_interview_scheduled ||
                                  offer.technical_interview_scheduled ||
                                  offer.test_requested)) ||
                              (filterValue === "test" && offer.test_requested);

                            return matchesSearch && matchesStatus;
                          })
                          .map((offer) => (
                            <div
                              key={offer.id}
                              id={`offer-${offer.id}`}
                              className="rounded-2xl p-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 opacity-75"
                            >
                              {/* Header de la carte */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-theme-text-primary line-clamp-1">
                                      {offer.title}
                                    </h3>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                      <TrendingUp size={12} />
                                      {offer.match_score}%
                                    </div>
                                  </div>
                                  <p className="text-sm text-theme-text-secondary mb-1">
                                    {offer.company_name ||
                                      "Entreprise non spécifiée"}
                                  </p>
                                  <p className="text-xs text-theme-text-muted">
                                    {offer.location ||
                                      offer.location_city ||
                                      "Localisation non précisée"}{" "}
                                    ·{" "}
                                    {offer.contract_type || "Type non précisé"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingOffer(offer);
                                      setEditForm({
                                        contacted_by_email:
                                          offer.contacted_by_email,
                                        contacted_by_phone:
                                          offer.contacted_by_phone,
                                        follow_up_received:
                                          offer.follow_up_received,
                                        hr_interview_scheduled:
                                          offer.hr_interview_scheduled,
                                        hr_interview_date:
                                          offer.hr_interview_date,
                                        hr_interview_completed:
                                          offer.hr_interview_completed,
                                        technical_interview_scheduled:
                                          offer.technical_interview_scheduled,
                                        technical_interview_date:
                                          offer.technical_interview_date,
                                        technical_interview_completed:
                                          offer.technical_interview_completed,
                                        rejected: offer.rejected,
                                        rejection_reason:
                                          offer.rejection_reason,
                                        cover_letter_sent:
                                          offer.cover_letter_sent,
                                        test_requested: offer.test_requested,
                                        test_completed: offer.test_completed,
                                        test_scheduled_date:
                                          offer.test_scheduled_date,
                                        job_found: offer.job_found,
                                        notes: offer.notes,
                                      });
                                    }}
                                    className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                                    title="Modifier le statut"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleUnsave(offer)}
                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                    title="Retirer l'offre"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Badge Refusé */}
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                                <XCircle size={16} />
                                <span className="font-medium">Refusé</span>
                                {offer.rejected_at && (
                                  <span className="text-xs ml-auto">
                                    {new Date(
                                      offer.rejected_at,
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>

                              {/* Raison du refus si disponible */}
                              {offer.rejection_reason && (
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4 italic">
                                  "{offer.rejection_reason}"
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
            </>
          ))}
      </div>

      {/* Modal édition statut */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-theme-card-border">
              <div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-1">
                  {editingOffer.title}
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  {editingOffer.company_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingOffer(null);
                  setEditForm({});
                }}
                className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-5">
                {/* Bouton "J'ai postulé" et "Postuler" si pas encore postulé */}
                {!editingOffer.is_applied && (
                  <div className="pb-4 border-b border-theme-card-border space-y-2">
                    <button
                      onClick={() => handleApply(editingOffer)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                    >
                      <CheckCircle size={18} />
                      J'ai postulé
                    </button>
                    <button
                      onClick={() => {
                        setEditingOffer(null);
                        setEditForm({});
                        setPreApplyOffer(editingOffer);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={18} />
                      Postuler
                    </button>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2">
                    Contact
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                      <input
                        type="checkbox"
                        checked={editForm.contacted_by_email || false}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contacted_by_email: e.target.checked,
                          })
                        }
                        className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                      />
                      <Mail
                        size={18}
                        className="text-theme-text-secondary flex-shrink-0 w-5"
                      />
                      <span className="text-theme-text-primary text-sm">
                        Contacté par email
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                      <input
                        type="checkbox"
                        checked={editForm.contacted_by_phone || false}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contacted_by_phone: e.target.checked,
                          })
                        }
                        className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                      />
                      <Phone
                        size={18}
                        className="text-theme-text-secondary flex-shrink-0 w-5"
                      />
                      <span className="text-theme-text-primary text-sm">
                        Contacté par téléphone
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                      <input
                        type="checkbox"
                        checked={editForm.follow_up_received || false}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            follow_up_received: e.target.checked,
                          })
                        }
                        className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                      />
                      <CheckCircle2
                        size={18}
                        className="text-theme-text-secondary flex-shrink-0 w-5"
                      />
                      <span className="text-theme-text-primary text-sm">
                        Suite donnée
                      </span>
                    </label>
                  </div>
                </div>

                {/* Entretiens */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2">
                    Entretiens
                  </h4>
                  <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                    <input
                      type="checkbox"
                      checked={editForm.hr_interview_scheduled || false}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          hr_interview_scheduled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                    />
                    <Calendar
                      size={18}
                      className="text-theme-text-secondary flex-shrink-0 w-5"
                    />
                    <span className="text-theme-text-primary text-sm">
                      Entretien RH prévu
                    </span>
                  </label>
                  {editForm.hr_interview_scheduled && (
                    <div className="ml-8">
                      <input
                        type="datetime-local"
                        value={utcToLocal(editForm.hr_interview_date)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            hr_interview_date: value
                              ? localToUtc(value)
                              : undefined,
                          });
                        }}
                        className="w-full max-w-xs px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                      />
                    </div>
                  )}
                  {editForm.hr_interview_scheduled && (
                    <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                      <input
                        type="checkbox"
                        checked={editForm.hr_interview_completed || false}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            hr_interview_completed: e.target.checked,
                          })
                        }
                        className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-green-500 focus:ring-green-500"
                      />
                      <CheckCircle2
                        size={18}
                        className="text-theme-text-secondary flex-shrink-0 w-5"
                      />
                      <span className="text-theme-text-primary text-sm">
                        Entretien RH passé
                      </span>
                    </label>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                    <input
                      type="checkbox"
                      checked={editForm.technical_interview_scheduled || false}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          technical_interview_scheduled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                    />
                    <Calendar
                      size={18}
                      className="text-theme-text-secondary flex-shrink-0 w-5"
                    />
                    <span className="text-theme-text-primary text-sm">
                      Entretien technique prévu
                    </span>
                  </label>
                  {editForm.technical_interview_scheduled && (
                    <div className="ml-8">
                      <input
                        type="datetime-local"
                        value={utcToLocal(editForm.technical_interview_date)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            technical_interview_date: value
                              ? localToUtc(value)
                              : undefined,
                          });
                        }}
                        className="w-full max-w-xs px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                      />
                    </div>
                  )}
                  {editForm.technical_interview_scheduled && (
                    <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                      <input
                        type="checkbox"
                        checked={
                          editForm.technical_interview_completed || false
                        }
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            technical_interview_completed: e.target.checked,
                          })
                        }
                        className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-green-500 focus:ring-green-500"
                      />
                      <CheckCircle2
                        size={18}
                        className="text-theme-text-secondary flex-shrink-0 w-5"
                      />
                      <span className="text-theme-text-primary text-sm">
                        Entretien technique passé
                      </span>
                    </label>
                  )}
                </div>

                {/* Test */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2">
                    Test
                  </h4>
                  <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                    <input
                      type="checkbox"
                      checked={editForm.test_requested || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setEditForm({
                          ...editForm,
                          test_requested: isChecked,
                          test_scheduled_date: isChecked
                            ? editForm.test_scheduled_date
                            : undefined,
                        });
                      }}
                      className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                    />
                    <ClipboardCheck
                      size={18}
                      className="text-theme-text-secondary flex-shrink-0 w-5"
                    />
                    <span className="text-theme-text-primary text-sm">
                      Test demandé
                    </span>
                  </label>
                  {(editForm.test_requested ||
                    editForm.test_scheduled_date) && (
                    <div className="ml-8 space-y-1">
                      <span className="text-xs text-theme-text-secondary">
                        Date prévue pour le test
                      </span>
                      <input
                        type="datetime-local"
                        value={utcToLocal(editForm.test_scheduled_date)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            test_scheduled_date: value
                              ? localToUtc(value)
                              : undefined,
                          });
                        }}
                        className="w-full max-w-xs block px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                      />
                    </div>
                  )}
                  {editForm.test_requested && (
                    <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                      <input
                        type="checkbox"
                        checked={editForm.test_completed || false}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            test_completed: e.target.checked,
                          })
                        }
                        className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                      />
                      <CheckCircle2
                        size={18}
                        className="text-theme-text-secondary flex-shrink-0 w-5"
                      />
                      <span className="text-theme-text-primary text-sm">
                        Test complété
                      </span>
                    </label>
                  )}
                </div>

                {/* Lettre de motivation */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2">
                    Lettre de motivation
                  </h4>
                  <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                    <input
                      type="checkbox"
                      checked={editForm.cover_letter_sent || false}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          cover_letter_sent: e.target.checked,
                        })
                      }
                      className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                    />
                    <FileText
                      size={18}
                      className="text-theme-text-secondary flex-shrink-0 w-5"
                    />
                    <span className="text-theme-text-primary text-sm">
                      Lettre de motivation envoyée
                    </span>
                  </label>
                  {editingOffer.apply_url && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverLetterOfferUrl(editingOffer.apply_url || null);
                        setView("cover_letters");
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl"
                    >
                      <FileText size={16} />
                      Générer une lettre
                    </button>
                  )}
                </div>

                {/* Job trouvé */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2 flex items-center gap-2">
                    <Trophy
                      size={18}
                      className="text-yellow-500 flex-shrink-0 w-5"
                    />
                    Job trouvé
                  </h4>
                  <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                    <input
                      type="checkbox"
                      checked={editForm.job_found || false}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          job_found: e.target.checked,
                        })
                      }
                      className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-yellow-500 focus:ring-yellow-500"
                    />
                    <Trophy
                      size={18}
                      className="text-yellow-500 flex-shrink-0 w-5"
                    />
                    <span className="text-theme-text-primary text-sm font-medium">
                      Je suis pris ! 🎉
                    </span>
                  </label>
                </div>

                {/* Refus */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2">
                    Refus
                  </h4>
                  <label className="flex items-center gap-3 cursor-pointer min-h-[2.25rem]">
                    <input
                      type="checkbox"
                      checked={editForm.rejected || false}
                      onChange={(e) =>
                        setEditForm({ ...editForm, rejected: e.target.checked })
                      }
                      className="w-5 h-5 flex-shrink-0 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
                    />
                    <XCircle
                      size={18}
                      className="text-theme-text-secondary flex-shrink-0 w-5"
                    />
                    <span className="text-theme-text-primary text-sm">
                      Refus reçu
                    </span>
                  </label>
                  {editForm.rejected && (
                    <div className="ml-8">
                      <textarea
                        placeholder="Raison du refus (optionnel)"
                        value={editForm.rejection_reason || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            rejection_reason: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-theme-text-primary text-sm mb-2">
                    Notes personnelles
                  </h4>
                  <textarea
                    placeholder="Ajoutez vos notes..."
                    value={editForm.notes || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-theme-card-border">
              <button
                onClick={() => {
                  setEditingOffer(null);
                  setEditForm({});
                }}
                className="flex-1 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // S'assurer que job_found est toujours inclus dans editForm (même si false)
                  const formData: Partial<UpdateOfferStatusRequest> = {
                    ...editForm,
                    job_found: editForm.job_found ?? false, // S'assurer que job_found est toujours défini
                  };

                  // S'assurer explicitement que test_scheduled_date est inclus si elle existe dans editForm
                  if ("test_scheduled_date" in editForm) {
                    formData.test_scheduled_date =
                      editForm.test_scheduled_date || undefined;
                  }

                  handleUpdateStatus(editingOffer.id, formData);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
              >
                <Save size={18} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail offre */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-theme-card-border">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-theme-text-primary">
                    {selectedOffer.title}
                  </h3>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-bold">
                    <TrendingUp size={14} />
                    {selectedOffer.match_score}% de correspondance
                  </span>
                </div>
                <p className="text-theme-text-secondary">
                  {selectedOffer.company_name} ·{" "}
                  {selectedOffer.location ||
                    selectedOffer.location_city ||
                    "Localisation non précisée"}{" "}
                  · {selectedOffer.contract_type || "Type non précisé"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-xl hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="text-sm font-semibold text-theme-text-secondary uppercase tracking-wider mb-3">
                Description
              </h4>
              <p className="text-theme-text-primary whitespace-pre-wrap leading-relaxed mb-6">
                {formatOfferDescriptionFull(
                  selectedOffer.full_description || selectedOffer.description,
                ) || "Description non disponible."}
              </p>
              {selectedOffer.apply_url && (
                <button
                  onClick={() => {
                    setPreApplyOffer(selectedOffer);
                    setSelectedOffer(null);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                >
                  <ExternalLink size={18} />
                  Postuler sur le site
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de vérification avant postulation (documents, lien de l'offre) */}
      {preApplyOffer && (
        <PreApplyModal
          isOpen={!!preApplyOffer}
          onClose={() => setPreApplyOffer(null)}
          onApply={async () => {
            if (preApplyOffer.apply_url) {
              window.open(
                preApplyOffer.apply_url,
                "_blank",
                "noopener,noreferrer",
              );
            }
            await handleApply(preApplyOffer);
            setPreApplyOffer(null);
          }}
          onMarkAsApplied={async () => {
            await handleApply(preApplyOffer);
            setPreApplyOffer(null);
          }}
          offerTitle={preApplyOffer.title}
          offerUrl={preApplyOffer.apply_url || ""}
        />
      )}

      {/* Modal feedback Prépare-moi Fox — historique de toutes les sessions (notes + appréciations) */}
      {prepareFoxFeedbackOffer &&
        (() => {
          const sessions =
            prepareFoxFeedbackOffer.prepare_fox_sessions &&
            prepareFoxFeedbackOffer.prepare_fox_sessions.length > 0
              ? prepareFoxFeedbackOffer.prepare_fox_sessions
              : prepareFoxFeedbackOffer.prepare_fox_score != null
                ? [
                    {
                      score: prepareFoxFeedbackOffer.prepare_fox_score,
                      feedback:
                        prepareFoxFeedbackOffer.prepare_fox_feedback || "",
                      completed_at:
                        typeof prepareFoxFeedbackOffer.prepare_fox_completed_at ===
                        "string"
                          ? prepareFoxFeedbackOffer.prepare_fox_completed_at
                          : prepareFoxFeedbackOffer.prepare_fox_completed_at
                            ? new Date(
                                prepareFoxFeedbackOffer.prepare_fox_completed_at,
                              ).toISOString()
                            : "",
                      questions_feedback: [],
                    },
                  ]
                : [];
          const bestScore = prepareFoxFeedbackOffer.prepare_fox_score;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setPrepareFoxFeedbackOffer(null)}
            >
              <div
                className="bg-theme-card rounded-2xl shadow-2xl border border-theme-card-border max-w-lg w-full h-[85vh] max-h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-theme-card-border shrink-0">
                  <h2 className="text-lg font-bold text-theme-text-primary flex items-center gap-2 min-w-0">
                    <BarChart3 size={22} className="text-orange-500 shrink-0" />
                    <span className="truncate">
                      Feedback Prépare-moi Fox — {prepareFoxFeedbackOffer.title}
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setPrepareFoxFeedbackOffer(null)}
                    className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors shrink-0"
                    aria-label="Fermer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-5">
                  {bestScore != null && (
                    <p className="text-theme-text-secondary text-sm">
                      Meilleure note :{" "}
                      <span className="font-semibold text-orange-500">
                        {Number(bestScore).toFixed(1)}/20
                      </span>
                    </p>
                  )}
                  {sessions.length === 0 ? (
                    <p className="text-theme-text-secondary text-sm">
                      Aucune session enregistrée pour cette offre.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-theme-text-secondary text-xs">
                        Tous les anciens feedbacks et questions pour réviser.
                      </p>
                      <h3 className="text-sm font-semibold text-theme-text-primary">
                        Historique des sessions
                      </h3>
                      {sessions.map((entry, idx) => (
                        <div
                          key={entry.completed_at || `session-${idx}`}
                          className="rounded-xl border border-theme-card-border bg-theme-bg-secondary/50 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-orange-500">
                              {Number(entry.score).toFixed(1)}/20
                            </span>
                            {entry.completed_at && (
                              <span className="text-xs text-theme-text-secondary">
                                {formatPrepareFoxDate(entry.completed_at)}
                              </span>
                            )}
                          </div>
                          {entry.feedback ? (
                            <div className="text-theme-text-primary whitespace-pre-wrap text-sm leading-relaxed">
                              {entry.feedback}
                            </div>
                          ) : (
                            <p className="text-theme-text-secondary text-sm italic">
                              Aucun feedback pour cette session.
                            </p>
                          )}
                          {entry.questions_feedback &&
                            entry.questions_feedback.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-theme-card-border">
                                <h4 className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                                  Par question — réponse proposée par l’IA
                                </h4>
                                <div className="space-y-2">
                                  {entry.questions_feedback.map((qf, qIdx) => (
                                    <details
                                      key={qIdx}
                                      className="group rounded-lg border border-theme-card-border bg-theme-bg-primary/50 overflow-hidden"
                                    >
                                      <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer list-none text-sm font-medium text-theme-text-primary hover:bg-theme-bg-secondary/50 [&::-webkit-details-marker]:hidden">
                                        <ChevronDown
                                          size={16}
                                          className="text-theme-text-secondary shrink-0 transition-transform group-open:rotate-180"
                                        />
                                        <span className="line-clamp-2">
                                          {qf.question ||
                                            `Question ${qIdx + 1}`}
                                        </span>
                                      </summary>
                                      <div className="px-3 pb-3 pt-1 space-y-2">
                                        {qf.suggested_answer && (
                                          <div>
                                            <span className="text-xs font-medium text-orange-500/90">
                                              Réponse proposée :
                                            </span>
                                            <p className="text-theme-text-primary text-sm whitespace-pre-wrap mt-0.5">
                                              {qf.suggested_answer}
                                            </p>
                                          </div>
                                        )}
                                        {qf.comment && (
                                          <div>
                                            <span className="text-xs font-medium text-theme-text-secondary">
                                              Commentaire :
                                            </span>
                                            <p className="text-theme-text-secondary text-sm whitespace-pre-wrap mt-0.5">
                                              {qf.comment}
                                            </p>
                                          </div>
                                        )}
                                        {!qf.suggested_answer &&
                                          !qf.comment && (
                                            <p className="text-theme-text-secondary text-sm italic">
                                              Aucun détail pour cette question.
                                            </p>
                                          )}
                                      </div>
                                    </details>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Modal ajout manuel d'offre */}
      {showManualOfferModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowManualOfferModal(false)}
        >
          <div
            className="bg-theme-card rounded-2xl shadow-2xl border border-theme-card-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-theme-card border-b border-theme-card-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-theme-text-primary">
                ➕ Ajouter une offre manuellement
              </h2>
              <button
                onClick={() => setShowManualOfferModal(false)}
                className="p-2 rounded-lg hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Titre du poste <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualOfferForm.title}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ex: Data Scientist"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualOfferForm.company_name}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      company_name: e.target.value,
                    })
                  }
                  placeholder="Ex: Google"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Lien de l'offre <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={manualOfferForm.apply_url}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      apply_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  value={manualOfferForm.location}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Ex: Paris, France"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Type de contrat
                </label>
                <select
                  value={manualOfferForm.contract_type}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      contract_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Alternance">Alternance</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={manualOfferForm.category}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="Ex: Data Science"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={manualOfferForm.description}
                  onChange={(e) =>
                    setManualOfferForm({
                      ...manualOfferForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Décrivez brièvement l'offre..."
                  rows={4}
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowManualOfferModal(false)}
                  className="flex-1 px-4 py-2 bg-theme-bg-secondary border border-theme-border text-theme-text-primary rounded-lg font-medium hover:bg-theme-bg-primary transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateManualOffer}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Save size={18} />
                  Ajouter l'offre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confettis */}
      {showConfetti && <Confetti />}
    </div>
  );
};
