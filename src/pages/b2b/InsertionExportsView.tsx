import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Users,
  TrendingUp,
  Percent,
  DollarSign,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Eye,
  Lock,
} from "lucide-react";
import B2BLayout from "../../components/B2BLayout";
import { API_URL } from "../../services/api";

interface Cohort {
  id: string;
  name: string;
  graduation_year: number;
}

interface CTIIndicators {
  employment_rate: number;
  employment_rate_gross: number;
  cdi_rate: number;
  international_rate: number;
  further_studies_rate: number;
  avg_months_to_employment: number | null;
  salary_stats: {
    median: number | null;
    mean: number | null;
    q1: number | null;
    q3: number | null;
    count: number;
  };
  total_responses: number;
  response_rate: number;
}

interface Survey {
  id: string;
  name: string;
  status: string;
  target_count: number;
  response_count: number;
  response_rate: number;
}

export default function InsertionExportsView() {
  const [, setLoading] = useState(true); // loading state managed but not displayed
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [anonymize, setAnonymize] = useState(false);

  // Data
  const [indicators, setIndicators] = useState<CTIIndicators | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const orgId = localStorage.getItem("current_org_id");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (orgId) {
      fetchData();
    }
  }, [orgId, selectedCohort, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch cohorts
      const cohortsRes = await fetch(
        `${API_URL}/api/organizations/${orgId}/cohorts`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );
      if (cohortsRes.ok) {
        const cohortsData = await cohortsRes.json();
        // API returns { items: [...] } or array directly
        setCohorts(
          Array.isArray(cohortsData) ? cohortsData : cohortsData.items || [],
        );
      }

      // Fetch indicators
      let indicatorsUrl = `${API_URL}/api/insertion/organization/${orgId}/indicators`;
      const params = new URLSearchParams();
      if (selectedCohort) params.append("cohort_id", selectedCohort);
      if (selectedYear)
        params.append("graduation_year", selectedYear.toString());
      if (params.toString()) indicatorsUrl += `?${params.toString()}`;

      try {
        const indicatorsRes = await fetch(indicatorsUrl, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (indicatorsRes.ok) {
          setIndicators(await indicatorsRes.json());
        }
      } catch {
        // Endpoint not available yet - ignore
        console.warn("Indicateurs insertion non disponibles");
      }

      // Fetch surveys
      try {
        const surveysRes = await fetch(
          `${API_URL}/api/insertion/organization/${orgId}/surveys`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          },
        );
        if (surveysRes.ok) {
          const surveysData = await surveysRes.json();
          setSurveys(
            Array.isArray(surveysData) ? surveysData : surveysData.items || [],
          );
        }
      } catch {
        // Endpoint not available yet - ignore
        console.warn("Surveys non disponibles");
      }
    } catch (e) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "cti" | "excel" | "csv") => {
    // Récupérer le token frais
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) {
      setError("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    setExporting(format);
    setError(null);
    setSuccess(null);

    try {
      // Construire l'URL avec le token dans les paramètres pour téléchargement direct
      const params = new URLSearchParams();
      params.append("token", currentToken);
      if (selectedCohort) params.append("cohort_id", selectedCohort);
      if (selectedYear)
        params.append("graduation_year", selectedYear.toString());
      if (format !== "cti" && anonymize) params.append("anonymize", "true");

      const downloadUrl = `${API_URL}/api/insertion/organization/${orgId}/export/${format}?${params.toString()}`;

      // Ouvrir directement l'URL dans le navigateur pour téléchargement
      // Le navigateur va automatiquement télécharger le fichier avec le bon nom
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Le téléchargement est lancé, afficher un message de succès après un délai
      setTimeout(() => {
        setSuccess(
          `Export ${format.toUpperCase()} lancé - vérifiez vos téléchargements`,
        );
        setExporting(null);
      }, 1000);
    } catch (e: unknown) {
      console.error("Export error:", e);
      const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
      setError(
        errorMessage || `Erreur lors de l'export ${format.toUpperCase()}`,
      );
      setExporting(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <B2BLayout>
      <div className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-white">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cohort */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Cohorte
              </label>
              <div className="relative">
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes les cohortes</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Année de diplôme
              </label>
              <div className="relative">
                <select
                  value={selectedYear || ""}
                  onChange={(e) =>
                    setSelectedYear(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes les années</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Anonymize */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymize}
                  onChange={(e) => setAnonymize(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Anonymiser les données
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Indicators */}
        {indicators && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-white">
                Aperçu des indicateurs
              </h2>
              <span className="text-sm text-gray-500 ml-auto">
                {indicators.total_responses} réponses
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {indicators.employment_rate}%
                </div>
                <div className="text-xs text-gray-400">Taux net d'emploi</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {indicators.salary_stats.median
                    ? `${(indicators.salary_stats.median / 1000).toFixed(0)}k€`
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-400">Salaire médian</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Percent className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {indicators.cdi_rate}%
                </div>
                <div className="text-xs text-gray-400">Taux de CDI</div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {indicators.international_rate}%
                </div>
                <div className="text-xs text-gray-400">International</div>
              </div>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Download className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-white">
              Exporter les données
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PDF CTI */}
            <button
              onClick={() => handleExport("cti")}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-6 bg-gray-700/50 hover:bg-gray-700 rounded-xl border border-gray-600 hover:border-orange-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                {exporting === "cti" ? (
                  <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
                ) : (
                  <FileText className="w-7 h-7 text-red-500" />
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">
                  Rapport CTI (PDF)
                </div>
                <div className="text-sm text-gray-400">
                  Format officiel accréditation
                </div>
              </div>
            </button>

            {/* Excel */}
            <button
              onClick={() => handleExport("excel")}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-6 bg-gray-700/50 hover:bg-gray-700 rounded-xl border border-gray-600 hover:border-green-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                {exporting === "excel" ? (
                  <Loader2 className="w-7 h-7 text-green-500 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-7 h-7 text-green-500" />
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Excel (.xlsx)</div>
                <div className="text-sm text-gray-400">
                  Données complètes multi-feuilles
                </div>
              </div>
            </button>

            {/* CSV */}
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-6 bg-gray-700/50 hover:bg-gray-700 rounded-xl border border-gray-600 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                {exporting === "csv" ? (
                  <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                ) : (
                  <FileText className="w-7 h-7 text-blue-500" />
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">CSV</div>
                <div className="text-sm text-gray-400">Données brutes</div>
              </div>
            </button>
          </div>
        </div>

        {/* Active Surveys */}
        {surveys.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-white">
                Enquêtes en cours
              </h2>
            </div>

            <div className="space-y-3">
              {surveys.slice(0, 5).map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-white">{survey.name}</div>
                    <div className="text-sm text-gray-400">
                      {survey.response_count} / {survey.target_count} réponses
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-500">
                        {survey.response_rate}%
                      </div>
                      <div className="text-xs text-gray-400">
                        taux de réponse
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        survey.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : survey.status === "closed"
                            ? "bg-gray-500/20 text-gray-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {survey.status === "active"
                        ? "Active"
                        : survey.status === "closed"
                          ? "Clôturée"
                          : "Brouillon"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold text-white mb-3">📋 Formats d'export</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              <strong className="text-white">Rapport CTI (PDF) :</strong>{" "}
              Document formaté conforme aux exigences de la CTI pour les
              accréditations. Inclut page de garde, synthèse, indicateurs
              détaillés et répartitions.
            </p>
            <p>
              <strong className="text-white">Excel :</strong> Fichier
              multi-feuilles avec synthèse, données brutes, répartitions par
              secteur et distribution des salaires. Idéal pour analyses
              complémentaires.
            </p>
            <p>
              <strong className="text-white">CSV :</strong> Données brutes en
              format tabulaire, compatible avec tous les outils de traitement de
              données.
            </p>
          </div>
        </div>
      </div>
    </B2BLayout>
  );
}
