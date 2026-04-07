import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowLeft,
  Target,
  Bookmark,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  X,
  Search,
  MapPin,
  Briefcase,
  Bell,
  List,
  Layers,
  Clock,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { matchingAPI, jobNotificationsAPI, JobOffer } from "../services/api";
import { PreApplyModal } from "../components/PreApplyModal";
import { JobNotificationsCard } from "../components/JobNotificationsCard";
import { OffersSwipeView } from "../components/OffersSwipeView";
import {
  formatOfferDescriptionFull,
  getOfferPreview,
} from "../utils/offerDescription";
import { Logo } from "../components/Logo";

const STORAGE_KEY_REJECTED_MATCHING = (userId: string) =>
  `matching_rejected_offer_ids_${userId || "guest"}`;

export const MatchingView: React.FC = () => {
  const {
    user,
    setView,
    setActiveToast,
    setBackgroundTask,
    matchingOffers,
    setMatchingOffers,
    searchQuery,
    setSearchQuery,
    contractTypeFilter,
    setContractTypeFilter,
    locationFilter,
    setLocationFilter,
    hasSearched,
    setHasSearched,
    persistMatchingResults,
  } = useGameStore();

  const [analyzing, setAnalyzing] = useState(false);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [preApplyOffer, setPreApplyOffer] = useState<JobOffer | null>(null);
  const [objectiveKeywords, setObjectiveKeywords] = useState<string[]>([]); // Objectifs (mots-clés) pour suggestions
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [displayMode, setDisplayMode] = useState<"list" | "swipe">(() => {
    const stored = localStorage.getItem("matching_display_mode");
    return stored === "swipe" || stored === "list" ? stored : "list";
  });
  const [rejectedOfferIds, setRejectedOfferIds] = useState<Set<string>>(
    () => new Set(),
  );
  const hasAutoLaunchedRef = useRef(false);

  // Charger les offres refusées persistées (au montage et quand user change, ex. après connexion)
  useEffect(() => {
    const uid = user?.id || "guest";
    const key = STORAGE_KEY_REJECTED_MATCHING(uid);
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

  // Persister les offres refusées (Tinder) pour survivre à déconnexion / autre onglet
  useEffect(() => {
    const key = STORAGE_KEY_REJECTED_MATCHING(user?.id || "guest");
    if (rejectedOfferIds.size > 0) {
      localStorage.setItem(key, JSON.stringify([...rejectedOfferIds]));
    } else {
      localStorage.removeItem(key);
    }
  }, [rejectedOfferIds, user?.id]);

  // Charger les objectifs (mots-clés) pour les suggestions de recherche
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

  // Fonction supprimée : on affiche maintenant les scores réels du backend
  // Les scores sont calculés par le backend selon :
  // - Recherche textuelle : 30-90% selon la position dans les résultats
  // - Matching IA : score hybride combinant similarité cosine et règles métier

  // Fonction pour synchroniser le statut is_saved des offres
  const syncSavedStatus = async (
    offersToSync: JobOffer[],
  ): Promise<JobOffer[]> => {
    try {
      // Charger les offres sauvegardées depuis l'API
      const savedOffers = await matchingAPI.getSavedOffers();

      // Créer un Set des IDs des offres sauvegardées pour une recherche rapide
      const savedOfferIds = new Set(
        savedOffers.map((offer) => {
          // Utiliser source_id comme identifiant principal, ou id si disponible
          return offer.source_id || offer.id;
        }),
      );

      // Marquer les offres comme sauvegardées si elles sont dans la liste
      return offersToSync.map((offer) => {
        const offerId = offer.source_id || offer.id;
        return {
          ...offer,
          is_saved: savedOfferIds.has(offerId),
        };
      });
    } catch (err) {
      console.error(
        "Erreur lors de la synchronisation du statut sauvegardé:",
        err,
      );
      // En cas d'erreur, retourner les offres telles quelles
      return offersToSync;
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    setBackgroundTask({
      active: true,
      message: "Analyse de matching en cours...",
    });

    try {
      // Recherche textuelle SQL (LIKE) - search_query est maintenant obligatoire
      if (!searchQuery || !searchQuery.trim()) {
        setError("Veuillez entrer un terme de recherche");
        setBackgroundTask({ active: false });
        return;
      }

      const response = await matchingAPI.analyze({
        top_k: 15,
        search_query: searchQuery.trim(),
        contract_type: contractTypeFilter || undefined,
        location: locationFilter || undefined,
      });

      // Synchroniser le statut is_saved avec les offres sauvegardées
      const syncedOffers = await syncSavedStatus(response.offers);

      setOffers(syncedOffers);
      setMatchingOffers(syncedOffers);
      setRejectedOfferIds(new Set()); // Nouvelle recherche = on réinitialise les refus
      setHasSearched(true);
      persistMatchingResults(); // Persister pour rechargement / déconnexion
      setBackgroundTask({ active: false });

      setActiveToast({
        type: "success",
        title: "✅ Analyse terminée !",
        message: `${response.total_found} offres correspondantes trouvées.`,
      });
    } catch (err: any) {
      console.error("Erreur lors de l'analyse:", err);
      setBackgroundTask({ active: false });

      const isNetworkError =
        err.code === "ERR_NETWORK" ||
        err.message === "Network Error" ||
        (err.message && String(err.message).toLowerCase().includes("réseau"));

      if (err.response?.status === 429) {
        setActiveToast({
          type: "error",
          title: "⏱️ Limite atteinte",
          message:
            "Vous avez atteint la limite de requêtes. Réessayez plus tard.",
        });
        setError("Limite de requêtes atteinte.");
      } else if (
        err.code === "ECONNABORTED" ||
        err.message?.includes("timeout")
      ) {
        setError(
          "La requête a pris trop de temps. Veuillez réessayer avec des filtres plus spécifiques.",
        );
        setActiveToast({
          type: "error",
          title: "⏱️ Timeout",
          message:
            "La recherche a pris trop de temps. Essayez d'affiner vos critères.",
        });
      } else if (isNetworkError) {
        const networkMessage =
          "Connexion perdue. Vérifiez votre connexion internet et que le serveur est bien démarré, puis réessayez.";
        setError(networkMessage);
        setActiveToast({
          type: "error",
          title: "🔌 Connexion perdue",
          message: networkMessage,
        });
      } else {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Une erreur est survenue lors de l'analyse.";
        setError(errorMessage);
        setActiveToast({
          type: "error",
          title: "❌ Erreur",
          message: errorMessage,
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Synchroniser les offres avec le store à chaque montage et quand le store change
  // (pour afficher immédiatement les résultats au retour sur la page)
  useEffect(() => {
    if (hasSearched && matchingOffers && matchingOffers.length > 0) {
      setOffers([...matchingOffers]);
      setLoadingExisting(false);
    } else if (hasSearched) {
      setOffers([]);
      setLoadingExisting(false);
    } else {
      setLoadingExisting(false);
    }
  }, [hasSearched, matchingOffers]);

  // Lancer la recherche une seule fois à l'arrivée sur la page si un terme était déjà saisi (ex. depuis MesOffresView).
  // Ne pas dépendre de searchQuery pour éviter de déclencher la recherche à chaque lettre tapée par l'utilisateur.
  useEffect(() => {
    if (loadingExisting || analyzing || hasAutoLaunchedRef.current) return;
    if (!searchQuery?.trim() || hasSearched) return;
    hasAutoLaunchedRef.current = true;
    handleAnalyze();
    // Uniquement quand loadingExisting passe à false (montage), pas quand l'utilisateur modifie searchQuery
  }, [loadingExisting]);

  const handleSaveOffer = async (offer: JobOffer) => {
    try {
      await matchingAPI.saveOffer({
        dataset_id: offer.dataset_id || 0,
        title: offer.title,
        description: offer.description || "",
        full_description: offer.full_description || "",
        category: offer.category || "",
        contract_type: offer.contract_type || "",
        match_score: offer.match_score,
        notes: "",
        // Copier toutes les données pour persistance complète
        company_name: offer.company_name,
        location: offer.location,
        location_city: offer.location_city,
        location_country: offer.location_country,
        remote_type: offer.remote_type,
        apply_url: offer.apply_url,
        source: offer.source,
        source_id: offer.source_id,
      });

      const updatedOffers = offers.map((o) =>
        o.id === offer.id || o.source_id === offer.source_id
          ? { ...o, is_saved: true }
          : o,
      );
      setOffers(updatedOffers);
      setMatchingOffers(updatedOffers);

      // Déclencher un événement pour notifier les autres composants (ex: DailyObjectivesCard)
      window.dispatchEvent(
        new CustomEvent("offerSaved", {
          detail: { offerId: offer.id },
        }),
      );
      window.dispatchEvent(new CustomEvent("offerUpdated"));

      setActiveToast({
        type: "success",
        title: "✅ Offre sauvegardée",
        message: "L'offre a été ajoutée à vos favoris.",
      });
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message:
          err.response?.data?.detail || "Impossible de sauvegarder l'offre.",
      });
    }
  };

  const handleUnsaveOffer = async (offer: JobOffer) => {
    try {
      await matchingAPI.unsaveOffer({ job_match_id: offer.id });
      const updatedOffers = offers.map((o) =>
        o.id === offer.id || o.source_id === offer.source_id
          ? { ...o, is_saved: false }
          : o,
      );
      setOffers(updatedOffers);
      setMatchingOffers(updatedOffers);

      setActiveToast({
        type: "success",
        title: "✅ Offre retirée",
        message: "L'offre a été retirée de vos favoris.",
      });
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message: err.response?.data?.detail || "Impossible de retirer l'offre.",
      });
    }
  };

  const handleApplyOffer = async (offer: JobOffer) => {
    try {
      await matchingAPI.applyToOffer({ job_match_id: offer.id });
      setOffers(
        offers.map((o) =>
          o.id === offer.id
            ? { ...o, is_applied: true, applied_at: new Date().toISOString() }
            : o,
        ),
      );

      // Rafraîchir les stats de gamification pour récupérer les nouveaux points
      try {
        const { gamificationAPI } = await import("../services/api");
        const stats = await gamificationAPI.getStats();
        const { setGamification } = useGameStore.getState();
        setGamification(stats);
      } catch (err) {
        console.error("Erreur rafraîchissement stats:", err);
      }

      setActiveToast({
        type: "success",
        title: "✅ Candidature enregistrée",
        message: "Vous avez gagné 100 pts !",
      });
    } catch (err: any) {
      console.error("Erreur lors de la candidature:", err);
      setActiveToast({
        type: "error",
        title: "❌ Erreur",
        message:
          err.response?.data?.detail ||
          "Impossible d'enregistrer la candidature.",
      });
    }
  };

  const waitingMessages = [
    "Analyse de votre profil en cours...",
    "Comparaison avec les offres disponibles...",
    "Calcul des scores de correspondance...",
    "Tri des meilleures opportunités...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % waitingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const contractTypes = [
    "CDI",
    "CDD",
    "Stage",
    "Alternance",
    "Freelance",
    "Intérim",
    "Saisonnier",
    "Bénévolat",
  ];

  return (
    <div className="min-h-screen bg-theme-bg-primary p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header : même structure que MesOffresView pour éviter tout changement de mise en page */}
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

        {/* Barre de recherche : toujours affichée, mêmes marges (mb-8) pour mise en page stable */}
        <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative" data-onboarding="search-input">
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
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                />
              </div>
              <select
                value={contractTypeFilter}
                onChange={(e) => setContractTypeFilter(e.target.value)}
                className="md:w-40 px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Tous les types</option>
                {contractTypes.map((type) => (
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
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
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
              onClick={handleAnalyze}
              disabled={analyzing || !searchQuery.trim()}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={20} />
              {analyzing ? "Recherche en cours..." : "Lancer la recherche"}
            </button>
          </div>
        </div>

        {/* Deux boutons : mêmes tailles que MesOffresView (py-4, min-w-[220px], icônes 22). Espace réservé à droite pour le toggle pour éviter tout décalage. */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 mt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                localStorage.setItem("mes_offres_open_saved", "true");
                setView("mes_offres");
              }}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-theme-card hover:bg-theme-card-hover border border-theme-card-border rounded-xl font-semibold text-theme-text-primary transition-all shadow-sm hover:shadow-md min-w-[220px]"
            >
              <Bookmark size={22} />
              Offres sauvegardées
            </button>
            <button
              onClick={() => setShowAlertsModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl min-w-[220px]"
            >
              <Bell size={22} />
              Alertes d'Offres
            </button>
          </div>
          {/* Réserver la place du toggle Liste/Swipe pour que la mise en page ne bouge jamais */}
          <div className="flex items-center justify-end min-w-[104px] h-12">
            {offers.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-theme-bg-secondary rounded-xl border border-theme-border">
                <button
                  type="button"
                  onClick={() => {
                    setDisplayMode("list");
                    localStorage.setItem("matching_display_mode", "list");
                  }}
                  className={`p-2.5 rounded-lg transition-all ${
                    displayMode === "list"
                      ? "bg-indigo-500 text-white shadow-md"
                      : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary"
                  }`}
                  title="Affichage liste"
                  aria-label="Affichage liste"
                >
                  <List size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayMode("swipe");
                    localStorage.setItem("matching_display_mode", "swipe");
                  }}
                  className={`p-2.5 rounded-lg transition-all ${
                    displayMode === "swipe"
                      ? "bg-indigo-500 text-white shadow-md"
                      : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary"
                  }`}
                  title="Affichage cartes (mode swipe)"
                  aria-label="Affichage mode swipe"
                >
                  <Layers size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* État de chargement */}
        {analyzing ? (
          <div className="bg-theme-card rounded-3xl p-12 border border-theme-card-border">
            <div className="text-center">
              {/* Animation de chargement */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-theme-border" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
                <div className="absolute inset-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                  <Sparkles
                    size={40}
                    className="text-indigo-600 dark:text-indigo-400 animate-pulse"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-theme-text-primary mb-3">
                {waitingMessages[messageIndex]}
              </h3>
              <p className="text-theme-text-secondary mb-2">
                Analyse de votre profil et comparaison avec des milliers
                d'offres d'emploi.
              </p>
              <p className="text-sm text-theme-text-muted mb-8">
                Cela peut prendre quelques instants...
              </p>
            </div>
          </div>
        ) : loadingExisting ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-theme-text-secondary">
              Chargement de vos offres...
            </p>
          </div>
        ) : (
          <>
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Liste des offres ou mode Swipe (Tinder) : exclure les offres déjà refusées (croix) pour ne pas les reproposer au retour sur la vue. Liste stable en session = décompte 1/N, 2/N... */}
            {offers.length > 0 && displayMode === "swipe" && (
              <OffersSwipeView
                key={`${searchQuery}-${offers.length}`}
                offers={offers.filter(
                  (o) =>
                    !rejectedOfferIds.has(String(o.id ?? o.source_id ?? "")),
                )}
                onSave={handleSaveOffer}
                onReject={(offer) =>
                  setRejectedOfferIds((prev) =>
                    new Set(prev).add(offer.id || offer.source_id || ""),
                  )
                }
                onViewDetails={setSelectedOffer}
                showMatchScore
                emptyMessage="Relancez une recherche pour découvrir d'autres offres."
              />
            )}
            {offers.length > 0 && displayMode === "list" && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-theme-text-primary mb-6">
                  {offers.length} offres trouvées
                </h2>

                {/* Grille avec 3 colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offers.map((offer) => {
                    const isMatch = offer.match_score >= 60;

                    // Calculer le temps depuis la publication (si created_at disponible)
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
              </div>
            )}

            {/* Message si aucune offre */}
            {!analyzing && offers.length === 0 && hasSearched && (
              <div className="bg-theme-card rounded-3xl p-12 border border-theme-card-border text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                  <Search
                    size={32}
                    className="text-indigo-500 dark:text-indigo-400"
                  />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                  Aucune offre trouvée
                </h3>
                <p className="text-theme-text-secondary mb-6">
                  Essayez de modifier vos critères de recherche ou complétez
                  votre profil pour améliorer les résultats.
                </p>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery("");
                    setContractTypeFilter("");
                    setLocationFilter("");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                >
                  <Search size={20} />
                  Nouvelle recherche
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal de détails de l'offre */}
        {selectedOffer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setSelectedOffer(null)}
              aria-hidden="true"
            />
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
                        {selectedOffer.company_name ||
                          "Entreprise non spécifiée"}
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
                  <div className="flex items-center gap-2 mb-6">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                        selectedOffer.match_score >= 60
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      <TrendingUp size={16} />
                      {selectedOffer.match_score}% de correspondance
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="p-2 rounded-xl hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {(selectedOffer.full_description ||
                selectedOffer.description) && (
                <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                  <div className="text-theme-text-secondary whitespace-pre-wrap leading-relaxed">
                    {formatOfferDescriptionFull(
                      selectedOffer.full_description ||
                        selectedOffer.description,
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

        {/* Modal Alertes d'Offres (fond opaque) */}
        {showAlertsModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAlertsModal(false)}
          >
            <div
              className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-theme-card-border bg-theme-card shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAlertsModal(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text-primary transition-colors z-10"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
              <JobNotificationsCard noFrame />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
