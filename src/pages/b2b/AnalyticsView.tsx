/**
 * AnalyticsView - Statistiques et analytics avancés pour les organisations B2B
 *
 * Utilise les endpoints :
 * - GET /api/analytics/school/{org_id} pour les écoles
 * - GET /api/analytics/company/{org_id} pour les entreprises
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Target,
  Award,
  FileText,
  Briefcase,
  Eye,
  Send,
  Building2,
  GraduationCap,
} from "lucide-react";
import { api } from "../../services/api";

// Types pour les analytics école
interface CohortStats {
  id: string;
  name: string;
  student_count: number;
  average_completion: number;
  profiles_complete: number;
  profiles_in_progress: number;
  cvs_generated: number;
  insertion_rate: number;
}

interface ProfileDistribution {
  complete: number;
  in_progress: number;
  not_started: number;
}

interface SkillCount {
  name: string;
  count: number;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface SchoolAnalytics {
  total_members: number;
  total_students: number;
  total_staff: number;
  cohort_count: number;
  partner_count: number;
  active_this_week: number;
  active_this_month: number;
  average_completion: number;
  profile_distribution: ProfileDistribution;
  cvs_generated: number;
  cvs_downloaded: number;
  top_skills: SkillCount[];
  cohorts_stats: CohortStats[];
  completion_trend: TimeSeriesPoint[];
  activity_trend: TimeSeriesPoint[];
  global_insertion_rate: number;
  average_time_to_first_offer_days: number | null;
}

// Types pour les analytics entreprise
interface JobTypeStats {
  job_type: string;
  count: number;
  views: number;
  applications: number;
}

interface CompanyAnalytics {
  total_members: number;
  partner_school_count: number;
  jobs_active: number;
  jobs_draft: number;
  jobs_filled: number;
  jobs_total: number;
  total_views: number;
  total_applications: number;
  views_this_week: number;
  applications_this_week: number;
  view_to_application_rate: number;
  application_to_interview_rate: number;
  interview_to_hire_rate: number;
  top_skills_searched: SkillCount[];
  stats_by_job_type: JobTypeStats[];
  views_trend: TimeSeriesPoint[];
  applications_trend: TimeSeriesPoint[];
  average_time_to_fill_days: number | null;
  average_response_time_hours: number | null;
}

export default function AnalyticsView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolAnalytics | null>(null);
  const [companyData, setCompanyData] = useState<CompanyAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("month");

  const orgId = localStorage.getItem("current_org_id");
  const orgType = localStorage.getItem("current_org_type");
  const orgName = localStorage.getItem("current_org_name") || "Organisation";
  const isSchool = orgType === "school";

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!orgId) {
        setError("Aucune organisation sélectionnée");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const endpoint = isSchool
          ? `/api/analytics/school/${orgId}`
          : `/api/analytics/company/${orgId}`;

        const response = await api.get(endpoint);

        if (isSchool) {
          setSchoolData(response.data);
        } else {
          setCompanyData(response.data);
        }
      } catch (err: unknown) {
        console.error("Erreur chargement analytics:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur de chargement des analytics";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [orgId, isSchool]);

  const goBack = () => {
    setView(isSchool ? "school_dashboard" : "company_dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={goBack}
            className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
          </button>
          <h1 className="text-2xl font-bold text-theme-text-primary">
            Analytics
          </h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={goBack}
          className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-500" />
            Analytics
          </h1>
          <p className="text-theme-text-secondary">{orgName}</p>
        </div>
      </div>

      {/* Période */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setSelectedPeriod("month")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            selectedPeriod === "month"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-card-hover"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Ce mois
        </button>
        <button
          onClick={() => setSelectedPeriod("week")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            selectedPeriod === "week"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-card-hover"
          }`}
        >
          Cette semaine
        </button>
        <button
          onClick={() => setSelectedPeriod("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            selectedPeriod === "all"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-card-hover"
          }`}
        >
          Tout
        </button>
      </div>

      {/* Contenu selon type d'organisation */}
      {isSchool && schoolData ? (
        <SchoolAnalyticsContent data={schoolData} />
      ) : companyData ? (
        <CompanyAnalyticsContent data={companyData} />
      ) : null}

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={goBack}
          className="px-6 py-3 bg-theme-bg-tertiary text-theme-text-secondary rounded-xl hover:bg-theme-card-hover transition font-medium"
        >
          Retour au dashboard
        </button>
        <button className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Exporter le rapport
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SCHOOL ANALYTICS CONTENT
// ============================================================================

function SchoolAnalyticsContent({ data }: { data: SchoolAnalytics }) {
  return (
    <>
      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          label="Étudiants"
          value={data.total_students}
          subtitle={`${data.active_this_week} actifs cette semaine`}
          color="blue"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Complétion moyenne"
          value={`${data.average_completion}%`}
          subtitle={`${data.profile_distribution.complete} profils complets`}
          color="green"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="CVs générés"
          value={data.cvs_generated}
          subtitle={`${data.cvs_downloaded} téléchargés`}
          color="orange"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Taux d'insertion"
          value={`${data.global_insertion_rate}%`}
          subtitle={`${data.partner_count} entreprises partenaires`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Répartition des profils */}
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            État des profils
          </h2>
          <div className="space-y-4">
            <ProgressBar
              label="Profils complets (≥80%)"
              value={data.profile_distribution.complete}
              total={data.total_students || 1}
              color="green"
            />
            <ProgressBar
              label="En cours (20-80%)"
              value={data.profile_distribution.in_progress}
              total={data.total_students || 1}
              color="orange"
            />
            <ProgressBar
              label="Non commencés (<20%)"
              value={data.profile_distribution.not_started}
              total={data.total_students || 1}
              color="red"
            />
          </div>
        </div>

        {/* Top compétences */}
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Compétences les plus fréquentes
          </h2>
          <div className="space-y-3">
            {data.top_skills.length > 0 ? (
              data.top_skills.map((skill, i) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-theme-bg-tertiary rounded-full text-xs font-bold text-theme-text-secondary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-theme-text-primary font-medium">
                        {skill.name}
                      </span>
                      <span className="text-theme-text-muted text-sm">
                        {skill.count}
                      </span>
                    </div>
                    <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{
                          width: `${(skill.count / (data.top_skills[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-theme-text-muted text-center py-4">
                Aucune compétence enregistrée
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats par cohorte */}
      {data.cohorts_stats.length > 0 && (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Statistiques par cohorte
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-theme-text-secondary text-sm">
                  <th className="pb-4 font-medium">Cohorte</th>
                  <th className="pb-4 font-medium text-center">Étudiants</th>
                  <th className="pb-4 font-medium text-center">Complétion</th>
                  <th className="pb-4 font-medium text-center">
                    Profils complets
                  </th>
                  <th className="pb-4 font-medium text-center">CVs générés</th>
                  <th className="pb-4 font-medium text-center">
                    Taux d'insertion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {data.cohorts_stats.map((cohort) => (
                  <tr key={cohort.id} className="text-theme-text-primary">
                    <td className="py-4 font-medium">{cohort.name}</td>
                    <td className="py-4 text-center">{cohort.student_count}</td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cohort.average_completion >= 70
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : cohort.average_completion >= 40
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {cohort.average_completion.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {cohort.profiles_complete}
                    </td>
                    <td className="py-4 text-center">{cohort.cvs_generated}</td>
                    <td className="py-4 text-center">
                      {cohort.insertion_rate > 0
                        ? `${cohort.insertion_rate.toFixed(0)}%`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Évolution mensuelle */}
      {data.completion_trend.length > 0 && (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Évolution de l'activité (6 derniers mois)
          </h2>
          <div className="flex items-end gap-2 h-40">
            {data.activity_trend.map((point) => (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(
                      (point.value /
                        Math.max(
                          ...data.activity_trend.map((p) => p.value),
                          1,
                        )) *
                        100,
                      5,
                    )}%`,
                  }}
                />
                <span className="text-xs text-theme-text-muted">
                  {point.date.split("-")[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// COMPANY ANALYTICS CONTENT
// ============================================================================

function CompanyAnalyticsContent({ data }: { data: CompanyAnalytics }) {
  return (
    <>
      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Briefcase className="w-6 h-6" />}
          label="Offres actives"
          value={data.jobs_active}
          subtitle={`${data.jobs_total} offres au total`}
          color="blue"
        />
        <StatCard
          icon={<Eye className="w-6 h-6" />}
          label="Vues totales"
          value={data.total_views}
          subtitle={`${data.views_this_week} cette semaine`}
          color="green"
        />
        <StatCard
          icon={<Send className="w-6 h-6" />}
          label="Candidatures"
          value={data.total_applications}
          subtitle={`${data.applications_this_week} cette semaine`}
          color="orange"
        />
        <StatCard
          icon={<Building2 className="w-6 h-6" />}
          label="Écoles partenaires"
          value={data.partner_school_count}
          subtitle={`${data.jobs_filled} postes pourvus`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Taux de conversion */}
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Tunnel de conversion
          </h2>
          <div className="space-y-6">
            <ConversionStep
              label="Vue → Candidature"
              rate={data.view_to_application_rate}
              color="blue"
            />
            <ConversionStep
              label="Candidature → Entretien"
              rate={data.application_to_interview_rate}
              color="orange"
            />
            <ConversionStep
              label="Entretien → Embauche"
              rate={data.interview_to_hire_rate}
              color="green"
            />
          </div>

          {/* Métriques de temps */}
          <div className="mt-6 pt-6 border-t border-theme-border grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-theme-text-primary">
                {data.average_time_to_fill_days
                  ? `${data.average_time_to_fill_days}j`
                  : "-"}
              </p>
              <p className="text-sm text-theme-text-muted">
                Délai moyen pour pourvoir
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-theme-text-primary">
                {data.average_response_time_hours
                  ? `${data.average_response_time_hours}h`
                  : "-"}
              </p>
              <p className="text-sm text-theme-text-muted">
                Temps de réponse moyen
              </p>
            </div>
          </div>
        </div>

        {/* Compétences recherchées */}
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Compétences les plus recherchées
          </h2>
          <div className="space-y-3">
            {data.top_skills_searched.length > 0 ? (
              data.top_skills_searched.map((skill, i) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-theme-bg-tertiary rounded-full text-xs font-bold text-theme-text-secondary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-theme-text-primary font-medium">
                        {skill.name}
                      </span>
                      <span className="text-theme-text-muted text-sm">
                        {skill.count} offres
                      </span>
                    </div>
                    <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{
                          width: `${(skill.count / (data.top_skills_searched[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-theme-text-muted text-center py-4">
                Aucune compétence définie dans vos offres
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats par type d'offre */}
      {data.stats_by_job_type.length > 0 && (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            Performance par type d'offre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.stats_by_job_type.map((stat) => (
              <div
                key={stat.job_type}
                className="bg-theme-bg-secondary rounded-lg p-4"
              >
                <h3 className="font-medium text-theme-text-primary capitalize mb-3">
                  {stat.job_type.replace("_", " ")}
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-theme-text-primary">
                      {stat.count}
                    </p>
                    <p className="text-xs text-theme-text-muted">Offres</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-500">
                      {stat.views}
                    </p>
                    <p className="text-xs text-theme-text-muted">Vues</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-500">
                      {stat.applications}
                    </p>
                    <p className="text-xs text-theme-text-muted">
                      Candidatures
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Évolution mensuelle */}
      {data.views_trend.length > 0 && (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Évolution des vues et candidatures
          </h2>
          <div className="flex items-end gap-4 h-40">
            {data.views_trend.map((point, i) => (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex gap-1">
                  <div
                    className="flex-1 bg-blue-500 rounded-t-lg"
                    style={{
                      height: `${Math.max(
                        (point.value /
                          Math.max(
                            ...data.views_trend.map((p) => p.value),
                            1,
                          )) *
                          120,
                        10,
                      )}px`,
                    }}
                  />
                  <div
                    className="flex-1 bg-green-500 rounded-t-lg"
                    style={{
                      height: `${Math.max(
                        ((data.applications_trend[i]?.value || 0) /
                          Math.max(
                            ...data.views_trend.map((p) => p.value),
                            1,
                          )) *
                          120,
                        5,
                      )}px`,
                    }}
                  />
                </div>
                <span className="text-xs text-theme-text-muted">
                  {point.date.split("-")[1]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-theme-text-secondary">Vues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-theme-text-secondary">
                Candidatures
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// COMPOSANTS UTILITAIRES
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle: string;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colors = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-red-600",
    purple: "from-purple-500 to-pink-600",
  };

  return (
    <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4 opacity-80`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-theme-text-primary mb-1">{value}</p>
      <p className="text-theme-text-primary font-medium">{label}</p>
      <p className="text-sm text-theme-text-muted">{subtitle}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "green" | "orange" | "red";
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colors = {
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-theme-text-secondary">{label}</span>
        <span className="text-theme-text-primary font-medium">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-3 bg-theme-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ConversionStep({
  label,
  rate,
  color,
}: {
  label: string;
  rate: number;
  color: "blue" | "orange" | "green";
}) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    orange: "from-orange-500 to-red-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-theme-text-secondary">{label}</span>
        <span className="text-theme-text-primary font-bold">
          {rate.toFixed(1)}%
        </span>
      </div>
      <div className="h-4 bg-theme-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}
