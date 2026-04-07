import { useState, useEffect } from "react";
import {
  Briefcase,
  GraduationCap,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Star,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  Rocket,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { API_URL } from "../services/api";

// Types
interface OutcomeData {
  employment_status: string;
  graduation_date?: string;
  employment_date?: string;
  contract_type?: string;
  job_title?: string;
  job_function?: string;
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  location_city?: string;
  location_country?: string;
  is_international?: boolean;
  salary_gross_annual?: number;
  is_job_related_to_training?: boolean;
  satisfaction_level?: number;
  further_study_type?: string;
  further_study_institution?: string;
  seeking_since?: string;
}

// Options
const EMPLOYMENT_STATUS = [
  { value: "employed", label: "En emploi", icon: Briefcase },
  { value: "entrepreneurship", label: "Création d'entreprise", icon: Rocket },
  { value: "seeking", label: "En recherche d'emploi", icon: Search },
  {
    value: "further_studies",
    label: "Poursuite d'études",
    icon: GraduationCap,
  },
  { value: "other", label: "Autre situation", icon: AlertCircle },
];

const CONTRACT_TYPES = [
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "freelance", label: "Freelance / Indépendant" },
  { value: "interim", label: "Intérim" },
  { value: "thesis", label: "Thèse CIFRE" },
  { value: "vie", label: "VIE" },
  { value: "public_service", label: "Fonction publique" },
  { value: "other", label: "Autre" },
];

const COMPANY_SIZES = [
  { value: "micro", label: "TPE (< 10 salariés)" },
  { value: "startup", label: "Startup" },
  { value: "pme", label: "PME (10-249 salariés)" },
  { value: "eti", label: "ETI (250-4999 salariés)" },
  { value: "grande_entreprise", label: "Grande entreprise (5000+)" },
];

const SECTORS = [
  { value: "J", label: "Information et communication" },
  { value: "K", label: "Finance et assurance" },
  { value: "M", label: "Conseil, études techniques" },
  { value: "C", label: "Industrie manufacturière" },
  { value: "G", label: "Commerce" },
  { value: "H", label: "Transport et logistique" },
  { value: "D", label: "Énergie" },
  { value: "Q", label: "Santé" },
  { value: "P", label: "Enseignement" },
  { value: "O", label: "Administration publique" },
];

export default function InsertionFormView() {
  const { setView, refreshUser } = useGameStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingData, setExistingData] = useState<OutcomeData | null>(null);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  // Token d'invitation (si venu via lien d'enquête)
  const surveyToken = localStorage.getItem("survey_token");

  const [data, setData] = useState<OutcomeData>({
    employment_status: "",
  });

  // Charger les données existantes (seulement si connecté)
  useEffect(() => {
    const fetchExisting = async () => {
      const accessToken = localStorage.getItem("access_token");
      // Ne pas charger si on vient d'un lien d'enquête (pas de token d'auth)
      if (!accessToken || surveyToken) return;

      try {
        const response = await fetch(`${API_URL}/api/insertion/my-outcome`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        if (response.ok) {
          const existing = await response.json();
          setExistingData(existing);
          setData(existing);
        }
      } catch {
        // Pas de données existantes
      }
    };
    fetchExisting();
  }, [surveyToken]);

  const totalSteps =
    data.employment_status === "employed" ||
    data.employment_status === "entrepreneurship"
      ? 4
      : 2;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let response: Response;

      // Si on a un token d'invitation (venu via lien d'enquête)
      if (surveyToken) {
        response = await fetch(
          `${API_URL}/api/surveys/invite/${surveyToken}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Erreur lors de la soumission");
        }

        const result = await response.json();

        // Stocker le token JWT pour authentifier l'utilisateur
        if (result.access_token) {
          localStorage.setItem("access_token", result.access_token);
          // Charger les données utilisateur
          await refreshUser();
        }

        // Enregistrer les récompenses
        setBadgeUnlocked(result.badge_unlocked || false);
        setXpAwarded(result.xp_awarded || 0);

        // Nettoyer le token d'invitation
        localStorage.removeItem("survey_token");
      } else {
        // Mode classique : utilisateur connecté
        const accessToken = localStorage.getItem("access_token");
        const method = existingData ? "PUT" : "POST";

        response = await fetch(`${API_URL}/api/insertion/my-outcome`, {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Erreur lors de la sauvegarde");
        }
      }

      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const updateData = (updates: Partial<OutcomeData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center border border-gray-700">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Merci pour votre contribution ! 🎉
          </h2>
          <p className="text-gray-400 mb-6">
            Vos données d'insertion ont été enregistrées. Elles contribuent aux
            statistiques de votre école et aux accréditations CTI.
          </p>

          {/* Récompenses (si venu via enquête) */}
          {(badgeUnlocked || xpAwarded > 0) && (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-xl p-4 mb-6 border border-amber-500/20">
              {badgeUnlocked && (
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">🏆</span>
                  <div className="text-left">
                    <p className="text-amber-400 font-bold">Badge débloqué !</p>
                    <p className="text-gray-400 text-sm">Contributeur Alumni</p>
                  </div>
                </div>
              )}
              {xpAwarded > 0 && (
                <p className="text-orange-400 font-semibold">
                  +{xpAwarded} points gagnés !
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setView("dashboard")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            {badgeUnlocked
              ? "Voir mon tableau de bord"
              : "Retour au tableau de bord"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mon insertion professionnelle
          </h1>
          <p className="text-gray-400">
            Renseignez votre situation professionnelle pour les enquêtes
            d'insertion
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full transition-colors ${
                i + 1 <= step ? "bg-orange-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Step 1: Status */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Quelle est votre situation actuelle ?
              </h2>
              <div className="grid gap-3">
                {EMPLOYMENT_STATUS.map((status) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.value}
                      onClick={() =>
                        updateData({ employment_status: status.value })
                      }
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        data.employment_status === status.value
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          data.employment_status === status.value
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-white font-medium">
                        {status.label}
                      </span>
                      {data.employment_status === status.value && (
                        <Check className="w-5 h-5 text-orange-500 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Employment Details */}
          {step === 2 &&
            (data.employment_status === "employed" ||
              data.employment_status === "entrepreneurship") && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  <Briefcase className="inline w-5 h-5 mr-2 text-orange-500" />
                  Détails de votre emploi
                </h2>

                {/* Contract Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de contrat
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTRACT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          updateData({ contract_type: type.value })
                        }
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          data.contract_type === type.value
                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                            : "border-gray-700 text-gray-300 hover:border-gray-600"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Intitulé du poste
                  </label>
                  <input
                    type="text"
                    value={data.job_title || ""}
                    onChange={(e) => updateData({ job_title: e.target.value })}
                    placeholder="Ex: Ingénieur Data Science"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Employment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={data.employment_date || ""}
                    onChange={(e) =>
                      updateData({ employment_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

          {/* Step 2: Further Studies */}
          {step === 2 && data.employment_status === "further_studies" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                <GraduationCap className="inline w-5 h-5 mr-2 text-orange-500" />
                Votre poursuite d'études
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de formation
                </label>
                <select
                  value={data.further_study_type || ""}
                  onChange={(e) =>
                    updateData({ further_study_type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="master">Master / MS</option>
                  <option value="doctorat">Doctorat</option>
                  <option value="mba">MBA</option>
                  <option value="autre_diplome">Autre diplôme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Établissement
                </label>
                <input
                  type="text"
                  value={data.further_study_institution || ""}
                  onChange={(e) =>
                    updateData({ further_study_institution: e.target.value })
                  }
                  placeholder="Nom de l'établissement"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Job Seeking */}
          {step === 2 && data.employment_status === "seeking" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                <Search className="inline w-5 h-5 mr-2 text-orange-500" />
                Votre recherche d'emploi
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Depuis quand cherchez-vous ?
                </label>
                <input
                  type="date"
                  value={data.seeking_since || ""}
                  onChange={(e) =>
                    updateData({ seeking_since: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Company Details */}
          {step === 3 &&
            (data.employment_status === "employed" ||
              data.employment_status === "entrepreneurship") && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  <Building2 className="inline w-5 h-5 mr-2 text-orange-500" />
                  L'entreprise
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={data.company_name || ""}
                    onChange={(e) =>
                      updateData({ company_name: e.target.value })
                    }
                    placeholder="Ex: TechCorp"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taille de l'entreprise
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => updateData({ company_size: size.value })}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          data.company_size === size.value
                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                            : "border-gray-700 text-gray-300 hover:border-gray-600"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secteur d'activité
                  </label>
                  <select
                    value={data.company_sector || ""}
                    onChange={(e) =>
                      updateData({ company_sector: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Sélectionnez un secteur...</option>
                    {SECTORS.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Ville
                    </label>
                    <input
                      type="text"
                      value={data.location_city || ""}
                      onChange={(e) =>
                        updateData({ location_city: e.target.value })
                      }
                      placeholder="Paris"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={data.location_country || "France"}
                      onChange={(e) =>
                        updateData({
                          location_country: e.target.value,
                          is_international:
                            e.target.value.toLowerCase() !== "france",
                        })
                      }
                      placeholder="France"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Step 4: Salary & Satisfaction */}
          {step === 4 &&
            (data.employment_status === "employed" ||
              data.employment_status === "entrepreneurship") && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  <DollarSign className="inline w-5 h-5 mr-2 text-orange-500" />
                  Rémunération & Satisfaction
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salaire brut annuel (€)
                    <span className="text-gray-500 text-xs ml-2">
                      (optionnel mais recommandé)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={data.salary_gross_annual || ""}
                    onChange={(e) =>
                      updateData({
                        salary_gross_annual: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Ex: 42000"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ces données sont anonymisées dans les statistiques
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Votre emploi est-il en lien avec votre formation ?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        updateData({ is_job_related_to_training: true })
                      }
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        data.is_job_related_to_training === true
                          ? "border-green-500 bg-green-500/10 text-green-500"
                          : "border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() =>
                        updateData({ is_job_related_to_training: false })
                      }
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        data.is_job_related_to_training === false
                          ? "border-red-500 bg-red-500/10 text-red-500"
                          : "border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Star className="inline w-4 h-4 mr-1" />
                    Satisfaction globale
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          updateData({ satisfaction_level: level })
                        }
                        className={`w-12 h-12 rounded-lg border text-lg transition-all ${
                          data.satisfaction_level === level
                            ? "border-orange-500 bg-orange-500/20 text-orange-500"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    1 = Pas satisfait · 5 = Très satisfait
                  </p>
                </div>
              </div>
            )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Retour
              </button>
            ) : (
              <button
                onClick={() => setView("profile_editor")}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Annuler
              </button>
            )}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !data.employment_status}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Continuer
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || (step === 1 && !data.employment_status)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Enregistrer
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
