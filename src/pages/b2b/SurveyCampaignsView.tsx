import { useState, useEffect } from "react";
import {
  Send,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Mail,
  RefreshCw,
  Play,
  Download,
  Plus,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { API_URL } from "../../services/api";

interface Survey {
  id: string;
  name: string;
  description: string | null;
  survey_type: string;
  status: string;
  target_count: number;
  response_count: number;
  response_rate: number;
  created_at: string;
}

interface CampaignStats {
  survey_id: string;
  survey_name: string;
  status: string;
  total_invitations: number;
  emails_sent: number;
  emails_opened: number;
  links_clicked: number;
  started: number;
  completed: number;
  open_rate: number;
  click_rate: number;
  start_rate: number;
  completion_rate: number;
  overall_response_rate: number;
  pending_count: number;
  in_progress_count: number;
  reminders_sent: number;
  next_reminder_count: number;
}

interface Cohort {
  id: string;
  name: string;
  graduation_year: string | null;
  student_count: number;
}

const SURVEY_TYPE_LABELS: Record<string, string> = {
  m_plus_2: "M+2 (2 mois)",
  m_plus_6: "M+6 (6 mois)",
  m_plus_12: "M+12 (12 mois)",
  m_plus_24: "M+24 (24 mois)",
  m_plus_36: "M+36 (36 mois)",
  custom: "Personnalisée",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500",
  active: "bg-green-500",
  paused: "bg-yellow-500",
  closed: "bg-red-500",
  archived: "bg-slate-400",
};

export default function SurveyCampaignsView() {
  const { setView } = useGameStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de création/lancement
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [sendEmails, setSendEmails] = useState(true);

  // Formulaire de création d'enquête
  const [newSurveyName, setNewSurveyName] = useState("");
  const [newSurveyType, setNewSurveyType] = useState("m_plus_6");
  const [newSurveyDescription, setNewSurveyDescription] = useState("");
  const [newSurveyCohortId, setNewSurveyCohortId] = useState<string | null>(
    null,
  );
  const [creating, setCreating] = useState(false);

  const orgId = localStorage.getItem("current_org_id");

  useEffect(() => {
    if (orgId) {
      fetchData();
    }
  }, [orgId]);

  useEffect(() => {
    if (selectedSurvey) {
      fetchCampaignStats(selectedSurvey.id);
    }
  }, [selectedSurvey]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch surveys
      const surveysRes = await fetch(
        `${API_URL}/api/insertion/organization/${orgId}/surveys`,
        { headers, credentials: "include" },
      );
      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        setSurveys(Array.isArray(surveysData) ? surveysData : []);
      }

      // Fetch cohorts
      const cohortsRes = await fetch(
        `${API_URL}/api/organizations/${orgId}/cohorts`,
        { headers, credentials: "include" },
      );
      if (cohortsRes.ok) {
        const cohortsData = await cohortsRes.json();
        setCohorts(
          Array.isArray(cohortsData) ? cohortsData : cohortsData.items || [],
        );
      }
    } catch (e) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStats = async (surveyId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/surveys/organization/${orgId}/surveys/${surveyId}/campaign-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCampaignStats(data);
      }
    } catch (e) {
      console.error("Erreur stats campagne:", e);
    }
  };

  const handleCreateSurvey = async () => {
    if (!newSurveyName.trim()) {
      setError("Veuillez entrer un nom pour l'enquête");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/insertion/organization/${orgId}/surveys`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newSurveyName,
            survey_type: newSurveyType,
            description: newSurveyDescription || null,
            cohort_id: newSurveyCohortId || null,
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erreur lors de la création");
      }

      const newSurvey = await response.json();

      // Réinitialiser le formulaire
      setNewSurveyName("");
      setNewSurveyType("m_plus_6");
      setNewSurveyDescription("");
      setNewSurveyCohortId(null);
      setShowCreateModal(false);

      // Rafraîchir et sélectionner la nouvelle enquête
      await fetchData();
      setSelectedSurvey(newSurvey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!selectedSurvey) return;
    setLaunching(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/surveys/organization/${orgId}/surveys/${selectedSurvey.id}/launch`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cohort_ids: selectedCohorts.length > 0 ? selectedCohorts : null,
            send_emails: sendEmails,
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erreur lors du lancement");
      }

      const result = await response.json();
      setShowLaunchModal(false);
      fetchData();
      fetchCampaignStats(selectedSurvey.id);

      // Afficher le résultat
      alert(
        `Campagne lancée !\n${result.invitations_created} invitations créées\n${result.emails_sent} emails envoyés`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLaunching(false);
    }
  };

  const handleSendReminders = async () => {
    if (!selectedSurvey) return;
    setSendingReminders(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/surveys/organization/${orgId}/surveys/${selectedSurvey.id}/send-reminders`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target: "not_started",
            message_variant: "gentle",
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(`${result.reminders_sent} relances envoyées`);
        fetchCampaignStats(selectedSurvey.id);
      }
    } catch (e) {
      setError("Erreur lors de l'envoi des relances");
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary mb-1">
              Campagnes d'enquêtes
            </h1>
            <p className="text-theme-text-secondary">
              Gérez vos enquêtes d'insertion et suivez les taux de réponse
            </p>
          </div>
          <button
            onClick={() => setView("insertion_exports")}
            className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border rounded-lg text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <Download size={18} />
            Exports CTI
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des enquêtes */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-text-primary flex items-center gap-2">
                <BarChart3 size={20} className="text-orange-500" />
                Mes enquêtes
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                title="Créer une enquête"
              >
                <Plus size={18} />
              </button>
            </div>

            {surveys.length === 0 ? (
              <div className="bg-theme-card rounded-xl p-6 text-center border border-theme-border">
                <p className="text-theme-text-secondary mb-4">
                  Aucune enquête créée
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus size={18} />
                  Créer une enquête
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {surveys.map((survey) => (
                  <button
                    key={survey.id}
                    onClick={() => setSelectedSurvey(survey)}
                    className={`w-full bg-theme-card rounded-xl p-4 border transition-all text-left ${
                      selectedSurvey?.id === survey.id
                        ? "border-orange-500 ring-2 ring-orange-500/20"
                        : "border-theme-border hover:border-theme-border-hover"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-theme-text-primary">
                        {survey.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${
                          STATUS_COLORS[survey.status] || "bg-slate-500"
                        }`}
                      >
                        {survey.status}
                      </span>
                    </div>
                    <p className="text-sm text-theme-text-secondary mb-3">
                      {SURVEY_TYPE_LABELS[survey.survey_type] ||
                        survey.survey_type}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-theme-text-tertiary">
                        {survey.response_count} / {survey.target_count} réponses
                      </span>
                      <span className="font-semibold text-orange-500">
                        {survey.response_rate}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails de la campagne */}
          <div className="lg:col-span-2">
            {selectedSurvey ? (
              <div className="space-y-6">
                {/* Header de la campagne */}
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-theme-text-primary">
                        {selectedSurvey.name}
                      </h2>
                      <p className="text-theme-text-secondary">
                        {selectedSurvey.description || "Aucune description"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedSurvey.status === "draft" && (
                        <button
                          onClick={() => setShowLaunchModal(true)}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Play size={18} />
                          Lancer
                        </button>
                      )}
                      {selectedSurvey.status === "active" && (
                        <>
                          <button
                            onClick={() => setShowLaunchModal(true)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Send size={18} />
                            Inviter
                          </button>
                          <button
                            onClick={handleSendReminders}
                            disabled={sendingReminders}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            {sendingReminders ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <RefreshCw size={18} />
                            )}
                            Relancer
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats rapides */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-theme-bg-secondary rounded-lg p-4 text-center">
                      <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-theme-text-primary">
                        {campaignStats?.total_invitations ||
                          selectedSurvey.target_count}
                      </p>
                      <p className="text-xs text-theme-text-tertiary">Ciblés</p>
                    </div>
                    <div className="bg-theme-bg-secondary rounded-lg p-4 text-center">
                      <Mail className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-theme-text-primary">
                        {campaignStats?.emails_sent || 0}
                      </p>
                      <p className="text-xs text-theme-text-tertiary">
                        Emails envoyés
                      </p>
                    </div>
                    <div className="bg-theme-bg-secondary rounded-lg p-4 text-center">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-theme-text-primary">
                        {campaignStats?.completed ||
                          selectedSurvey.response_count}
                      </p>
                      <p className="text-xs text-theme-text-tertiary">
                        Complétées
                      </p>
                    </div>
                    <div className="bg-theme-bg-secondary rounded-lg p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-500">
                        {campaignStats?.overall_response_rate ||
                          selectedSurvey.response_rate}
                        %
                      </p>
                      <p className="text-xs text-theme-text-tertiary">
                        Taux réponse
                      </p>
                    </div>
                  </div>
                </div>

                {/* Funnel de conversion */}
                {campaignStats && (
                  <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                    <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
                      Funnel de conversion
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Invitations",
                          value: campaignStats.total_invitations,
                          rate: 100,
                        },
                        {
                          label: "Emails envoyés",
                          value: campaignStats.emails_sent,
                          rate:
                            (campaignStats.emails_sent /
                              campaignStats.total_invitations) *
                            100,
                        },
                        {
                          label: "Emails ouverts",
                          value: campaignStats.emails_opened,
                          rate: campaignStats.open_rate,
                        },
                        {
                          label: "Liens cliqués",
                          value: campaignStats.links_clicked,
                          rate: campaignStats.click_rate,
                        },
                        {
                          label: "Commencées",
                          value: campaignStats.started,
                          rate: campaignStats.start_rate,
                        },
                        {
                          label: "Complétées",
                          value: campaignStats.completed,
                          rate: campaignStats.completion_rate,
                        },
                      ].map((step, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-theme-text-secondary">
                              {step.label}
                            </span>
                            <span className="font-medium text-theme-text-primary">
                              {step.value} ({step.rate.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-theme-bg-secondary rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(step.rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Segments */}
                {campaignStats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-theme-card rounded-xl p-4 border border-theme-border text-center">
                      <p className="text-3xl font-bold text-yellow-500">
                        {campaignStats.pending_count}
                      </p>
                      <p className="text-sm text-theme-text-tertiary">
                        En attente
                      </p>
                    </div>
                    <div className="bg-theme-card rounded-xl p-4 border border-theme-border text-center">
                      <p className="text-3xl font-bold text-blue-500">
                        {campaignStats.in_progress_count}
                      </p>
                      <p className="text-sm text-theme-text-tertiary">
                        En cours
                      </p>
                    </div>
                    <div className="bg-theme-card rounded-xl p-4 border border-theme-border text-center">
                      <p className="text-3xl font-bold text-theme-text-secondary">
                        {campaignStats.next_reminder_count}
                      </p>
                      <p className="text-sm text-theme-text-tertiary">
                        À relancer
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-theme-card rounded-xl p-12 border border-theme-border text-center">
                <BarChart3 className="w-12 h-12 text-theme-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-text-primary mb-2">
                  Sélectionnez une enquête
                </h3>
                <p className="text-theme-text-secondary">
                  Choisissez une enquête dans la liste pour voir ses
                  statistiques
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de lancement */}
        {showLaunchModal && selectedSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-theme-card rounded-2xl w-full max-w-md border border-theme-border shadow-xl">
              <div className="p-6 border-b border-theme-border">
                <h3 className="text-lg font-bold text-theme-text-primary">
                  Lancer la campagne
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  {selectedSurvey.name}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Sélection des cohortes */}
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Cohortes ciblées
                  </label>
                  <p className="text-xs text-theme-text-tertiary mb-2">
                    Laissez vide pour cibler toutes les cohortes
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cohorts.map((cohort) => (
                      <label
                        key={cohort.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-theme-bg-secondary cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCohorts.includes(cohort.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCohorts([
                                ...selectedCohorts,
                                cohort.id,
                              ]);
                            } else {
                              setSelectedCohorts(
                                selectedCohorts.filter(
                                  (id) => id !== cohort.id,
                                ),
                              );
                            }
                          }}
                          className="rounded border-theme-border"
                        />
                        <span className="flex-1 text-theme-text-primary">
                          {cohort.name}
                        </span>
                        <span className="text-sm text-theme-text-tertiary">
                          {cohort.student_count} étudiants
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Option envoi emails */}
                <label className="flex items-center gap-3 p-3 bg-theme-bg-secondary rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmails}
                    onChange={(e) => setSendEmails(e.target.checked)}
                    className="rounded border-theme-border"
                  />
                  <div>
                    <p className="text-theme-text-primary font-medium">
                      Envoyer les emails immédiatement
                    </p>
                    <p className="text-xs text-theme-text-tertiary">
                      Les étudiants recevront un email avec le lien de l'enquête
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-6 border-t border-theme-border flex justify-end gap-3">
                <button
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLaunchCampaign}
                  disabled={launching}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {launching ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Lancer la campagne
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création d'enquête */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-theme-card rounded-2xl w-full max-w-md border border-theme-border shadow-xl">
              <div className="p-6 border-b border-theme-border">
                <h3 className="text-lg font-bold text-theme-text-primary">
                  Nouvelle enquête d'insertion
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  Créez une enquête pour collecter les données d'insertion de
                  vos diplômés
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Nom de l'enquête */}
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Nom de l'enquête *
                  </label>
                  <input
                    type="text"
                    value={newSurveyName}
                    onChange={(e) => setNewSurveyName(e.target.value)}
                    placeholder="Ex: Enquête M+6 Promo 2025"
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Type d'enquête */}
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Type d'enquête
                  </label>
                  <select
                    value={newSurveyType}
                    onChange={(e) => setNewSurveyType(e.target.value)}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="m_plus_2">M+2 (2 mois après diplôme)</option>
                    <option value="m_plus_6">
                      M+6 (6 mois après diplôme) - Standard CTI
                    </option>
                    <option value="m_plus_12">
                      M+12 (12 mois après diplôme)
                    </option>
                    <option value="m_plus_24">
                      M+24 (24 mois après diplôme)
                    </option>
                    <option value="m_plus_36">
                      M+36 (36 mois après diplôme)
                    </option>
                    <option value="custom">Enquête personnalisée</option>
                  </select>
                </div>

                {/* Cohorte ciblée (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Cohorte ciblée (optionnel)
                  </label>
                  <select
                    value={newSurveyCohortId || ""}
                    onChange={(e) =>
                      setNewSurveyCohortId(e.target.value || null)
                    }
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Toutes les cohortes</option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name} ({cohort.student_count} étudiants)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={newSurveyDescription}
                    onChange={(e) => setNewSurveyDescription(e.target.value)}
                    placeholder="Description de l'enquête..."
                    rows={3}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-theme-border flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSurveyName("");
                    setNewSurveyType("m_plus_6");
                    setNewSurveyDescription("");
                    setNewSurveyCohortId(null);
                  }}
                  className="px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateSurvey}
                  disabled={creating || !newSurveyName.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Créer l'enquête
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
