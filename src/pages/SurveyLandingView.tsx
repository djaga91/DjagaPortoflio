import { useState, useEffect } from "react";
import {
  Clock,
  Award,
  Users,
  ChevronRight,
  Shield,
  Gift,
  Loader2,
  AlertCircle,
  Calendar,
  Building2,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { API_URL } from "../services/api";

interface SurveyLandingData {
  survey_id: string;
  survey_name: string;
  survey_type: string;
  survey_description: string | null;
  school_id: string;
  school_name: string;
  school_logo_url: string | null;
  user_first_name: string;
  user_email: string;
  cohort_name: string | null;
  graduation_year: number | null;
  response_rate: number;
  total_responses: number;
  target_count: number;
  invitation_status: string;
  already_completed: boolean;
  existing_data: Record<string, unknown> | null;
  xp_reward: number;
  badge_name: string;
  badge_rarity: string;
}

// Mapping des types d'enquête
const SURVEY_TYPE_LABELS: Record<string, string> = {
  m_plus_2: "2 mois après diplôme",
  m_plus_6: "6 mois après diplôme",
  m_plus_12: "12 mois après diplôme",
  m_plus_24: "24 mois après diplôme",
  m_plus_36: "36 mois après diplôme",
  custom: "Enquête personnalisée",
};

export default function SurveyLandingView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SurveyLandingData | null>(null);
  const [starting, setStarting] = useState(false);
  const [snoozing, setSnoozing] = useState(false);

  // Récupérer le token et l'action depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const action = urlParams.get("action");

  useEffect(() => {
    if (!token) {
      setError(
        "Lien d'enquête invalide. Veuillez utiliser le lien reçu par email.",
      );
      setLoading(false);
      return;
    }

    // Si action=decline, refuser automatiquement l'enquête
    if (action === "decline") {
      const declineSurvey = async () => {
        try {
          await fetch(`${API_URL}/api/surveys/invite/${token}/decline`, {
            method: "POST",
          });
          setError("Vous ne recevrez plus de rappels pour cette enquête.");
          setLoading(false);
        } catch {
          setError("Erreur lors de la désinscription. Veuillez réessayer.");
          setLoading(false);
        }
      };
      declineSurvey();
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/surveys/invite/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cette invitation n'existe pas ou a expiré.");
          } else if (response.status === 410) {
            throw new Error(
              "Cette invitation a expiré. Contactez votre école pour en obtenir une nouvelle.",
            );
          }
          throw new Error("Erreur lors du chargement de l'enquête.");
        }

        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, action]);

  const handleStart = async () => {
    if (!token) return;
    setStarting(true);

    try {
      // Marquer comme commencé
      await fetch(`${API_URL}/api/surveys/invite/${token}/start`, {
        method: "POST",
      });

      // Stocker le token pour le formulaire
      localStorage.setItem("survey_token", token);

      // Rediriger vers le formulaire
      setView("insertion_form");
    } catch {
      setError("Erreur lors du démarrage de l'enquête");
    } finally {
      setStarting(false);
    }
  };

  const handleSnooze = async (days: number) => {
    if (!token) return;
    setSnoozing(true);

    try {
      await fetch(
        `${API_URL}/api/surveys/invite/${token}/snooze?days=${days}`,
        {
          method: "POST",
        },
      );

      // Afficher un message de confirmation
      setError(`Nous vous rappellerons dans ${days} jours. À bientôt !`);
      setData(null);
    } catch {
      setError("Erreur lors du report");
    } finally {
      setSnoozing(false);
    }
  };

  // États de chargement et erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement de votre enquête...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">
            {error || "Enquête non trouvée"}
          </h2>
          <button
            onClick={() => setView("landing")}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Si déjà complété
  if (data.already_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Vous avez déjà participé ! 🎉
          </h2>
          <p className="text-slate-400 mb-6">
            Merci {data.user_first_name} pour votre contribution à l'enquête de{" "}
            {data.school_name}. Vos données aident l'école à maintenir ses
            accréditations.
          </p>
          <button
            onClick={() => setView("dashboard")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header avec logo école */}
        <div className="text-center mb-8">
          {data.school_logo_url ? (
            <img
              src={data.school_logo_url}
              alt={data.school_name}
              className="h-16 mx-auto mb-4 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <p className="text-slate-400 text-sm">{data.school_name}</p>
        </div>

        {/* Carte principale */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
          {/* Bandeau de bienvenue */}
          <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-6 py-8 text-center border-b border-slate-700/50">
            <h1 className="text-3xl font-bold text-white mb-2">
              Bonjour {data.user_first_name} ! 👋
            </h1>
            <p className="text-slate-300 text-lg">
              Votre école a besoin de vous
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6 md:p-8">
            {/* Infos enquête */}
            <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-700/50">
              <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                {data.survey_name}
              </h2>
              <p className="text-slate-400 text-sm">
                {SURVEY_TYPE_LABELS[data.survey_type] || data.survey_type}
                {data.cohort_name && ` • ${data.cohort_name}`}
                {data.graduation_year && ` (${data.graduation_year})`}
              </p>
              {data.survey_description && (
                <p className="text-slate-400 text-sm mt-2">
                  {data.survey_description}
                </p>
              )}
            </div>

            {/* Points clés */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-900/30 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-bold">2-3 min</p>
                <p className="text-slate-500 text-xs">Temps estimé</p>
              </div>
              <div className="bg-slate-900/30 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold">4 questions</p>
                <p className="text-slate-500 text-xs">Maximum</p>
              </div>
              <div className="bg-slate-900/30 rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-bold">Anonyme</p>
                <p className="text-slate-500 text-xs">Salaire protégé</p>
              </div>
            </div>

            {/* Preuve sociale */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 mb-6 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300 text-sm">
                  Votre promotion a déjà répondu
                </span>
                <span className="text-emerald-400 font-bold text-lg">
                  {data.response_rate}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data.response_rate, 100)}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-2 text-center">
                {data.total_responses} sur {data.target_count} personnes
              </p>
            </div>

            {/* Récompense - Badge légendaire */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-5 mb-8 border border-amber-500/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-3xl">🏆</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-bold">
                      {data.badge_name}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase">
                      {data.badge_rarity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Débloquez ce badge rare +{" "}
                    <span className="text-orange-400 font-semibold">
                      +{data.xp_reward} points
                    </span>
                  </p>
                </div>
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* CTA Principal */}
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Commencer l'enquête
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Options secondaires */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleSnooze(3)}
                disabled={snoozing}
                className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                {snoozing ? "Enregistrement..." : "Me rappeler dans 3 jours"}
              </button>
            </div>

            {/* Footer informatif */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                Vos données contribuent aux statistiques anonymisées de l'école
                et aident à maintenir les accréditations CTI. Les informations
                de salaire sont toujours anonymisées.
              </p>
            </div>
          </div>
        </div>

        {/* Lien vers politique de confidentialité */}
        <p className="text-center text-slate-600 text-xs mt-6">
          En participant, vous acceptez notre{" "}
          <button
            onClick={() => setView("legal")}
            className="text-slate-500 hover:text-slate-400 underline"
          >
            politique de confidentialité
          </button>
        </p>
      </div>
    </div>
  );
}
