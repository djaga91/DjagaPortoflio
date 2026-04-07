/**
 * SchoolDashboardView - Dashboard pour les admins d'école
 *
 * Affiche les statistiques de l'école, les cohortes, et les partenariats.
 */

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Eye,
  UserPlus,
  Settings,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Bell,
  Download,
  Send,
  AlertTriangle,
  Info,
  FileSpreadsheet,
  Percent,
  DollarSign,
  Globe,
} from "lucide-react";
import { api } from "../../services/api";
import { useGameStore } from "../../store/gameStore";

interface OrganizationStats {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  plan: string;
  member_count: number;
  student_count: number;
  cohort_count: number;
  partner_count: number;
}

interface Cohort {
  id: string;
  name: string;
  slug: string;
  student_count: number;
  completion_rate: number;
  visible_students: number;
}

interface PartnershipPending {
  id: string;
  company_name: string;
  company_logo_url?: string;
  request_message?: string;
  created_at: string;
}

interface SchoolAlert {
  id: string;
  type: string;
  level: "info" | "warning" | "critical";
  title: string;
  message: string;
  count: number;
  action_label?: string;
  action_url?: string;
  student_ids?: string[];
}

interface SchoolAlerts {
  total_count: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  alerts: SchoolAlert[];
}

interface InsertionIndicators {
  employment_rate: number;
  employment_rate_gross: number;
  cdi_rate: number;
  international_rate: number;
  further_studies_rate: number;
  salary_stats: {
    median: number | null;
    mean: number | null;
    count: number;
  };
  total_responses: number;
}

export default function SchoolDashboardView() {
  const { setView, setActiveToast } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [pendingPartnerships, setPendingPartnerships] = useState<
    PartnershipPending[]
  >([]);
  const [alerts, setAlerts] = useState<SchoolAlerts | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [insertionIndicators, setInsertionIndicators] =
    useState<InsertionIndicators | null>(null);

  // TODO: Récupérer l'ID de l'organisation depuis le store/context
  const orgId = localStorage.getItem("current_org_id");

  useEffect(() => {
    if (!orgId) {
      setError("Aucune organisation sélectionnée");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les stats de l'organisation
        const statsRes = await api.get(`/api/organizations/${orgId}/stats`);
        setStats(statsRes.data);

        // Récupérer les cohortes
        const cohortsRes = await api.get(`/api/organizations/${orgId}/cohorts`);
        setCohorts(cohortsRes.data.items || []);

        // Récupérer les demandes de partenariat en attente
        const partnershipsRes = await api.get("/api/partnerships/pending");
        setPendingPartnerships(partnershipsRes.data.items || []);

        // Récupérer les alertes
        try {
          const alertsRes = await api.get(
            `/api/analytics/school/${orgId}/alerts`,
          );
          setAlerts(alertsRes.data);
        } catch (alertErr) {
          console.warn("Alertes non disponibles:", alertErr);
        }

        // Récupérer les indicateurs d'insertion
        try {
          const insertionRes = await api.get(
            `/api/insertion/organization/${orgId}/indicators`,
          );
          setInsertionIndicators(insertionRes.data);
        } catch (insertionErr) {
          console.warn("Indicateurs insertion non disponibles:", insertionErr);
        }
      } catch (err: any) {
        console.error("Erreur chargement dashboard école:", err);
        setError(err.response?.data?.detail || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  // Envoyer une relance groupée
  const handleSendReminder = async (
    alertType: string,
    studentIds: string[],
  ) => {
    if (!orgId || studentIds.length === 0) return;

    setSendingReminder(alertType);
    try {
      const reminderType =
        alertType === "inactive_students"
          ? "inactive"
          : alertType === "incomplete_profiles"
            ? "incomplete_profile"
            : "no_cv";

      const res = await api.post(
        `/api/notifications/school/${orgId}/send-reminder`,
        {
          student_ids: studentIds,
          reminder_type: reminderType,
        },
      );

      setActiveToast({
        type: "success",
        title: "Relance envoyée",
        message: res.data.message,
        icon: "📧",
        duration: 3000,
      });

      // Recharger les alertes
      const alertsRes = await api.get(`/api/analytics/school/${orgId}/alerts`);
      setAlerts(alertsRes.data);
    } catch (err: any) {
      console.error("Erreur envoi relance:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message:
          err.response?.data?.detail || "Impossible d'envoyer la relance",
        icon: "❌",
        duration: 3000,
      });
    } finally {
      setSendingReminder(null);
    }
  };

  // Exporter le rapport PDF CTI
  const handleExportPdf = async () => {
    if (!orgId) return;

    setExportingPdf(true);
    try {
      // Utilise l'endpoint CTI export
      const response = await api.get(
        `/api/insertion/organization/${orgId}/export/cti`,
        {
          responseType: "blob",
        },
      );

      // Créer un lien de téléchargement
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport_cti_${stats?.slug || "ecole"}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setActiveToast({
        type: "success",
        title: "Rapport CTI exporté",
        message: "Le PDF a été téléchargé avec succès",
        icon: "📄",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Erreur export PDF:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de générer le rapport PDF",
        icon: "❌",
        duration: 3000,
      });
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-theme-text-primary mb-2">
            Erreur
          </h2>
          <p className="text-theme-text-secondary">
            {error || "Organisation non trouvée"}
          </p>
          <button
            onClick={() => setView("school_dashboard")}
            className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {stats.logo_url ? (
            <img
              src={stats.logo_url}
              alt={stats.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{stats.name}</h1>
            <p className="text-gray-400">Plan {stats.plan}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exporter PDF
          </button>
          <button
            onClick={() => setView("settings")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Étudiants"
          value={stats.student_count}
          color="orange"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          label="Cohortes"
          value={stats.cohort_count}
          color="blue"
        />
        <StatCard
          icon={<Briefcase className="w-6 h-6" />}
          label="Partenaires"
          value={stats.partner_count}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Membres staff"
          value={stats.member_count - stats.student_count}
          color="purple"
        />
      </div>

      {/* Section Alertes */}
      {alerts && alerts.total_count > 0 && (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-theme-text-primary flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Alertes
              {alerts.critical_count > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {alerts.critical_count} critique
                  {alerts.critical_count > 1 ? "s" : ""}
                </span>
              )}
            </h2>
          </div>

          <div className="space-y-3">
            {alerts.alerts.map((alert) => {
              const levelColors = {
                critical: "bg-red-500/10 border-red-500/30 text-red-400",
                warning:
                  "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
              };

              const levelIcons = {
                critical: <AlertTriangle className="w-5 h-5 text-red-500" />,
                warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
                info: <Info className="w-5 h-5 text-blue-500" />,
              };

              return (
                <div
                  key={alert.id}
                  className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${levelColors[alert.level]}`}
                >
                  <div className="flex items-start gap-3">
                    {levelIcons[alert.level]}
                    <div>
                      <p className="font-medium text-theme-text-primary">
                        {alert.title}
                      </p>
                      <p className="text-sm text-theme-text-secondary mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  {alert.action_label &&
                    alert.student_ids &&
                    alert.student_ids.length > 0 && (
                      <button
                        onClick={() =>
                          handleSendReminder(alert.type, alert.student_ids!)
                        }
                        disabled={sendingReminder === alert.type}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition text-sm whitespace-nowrap disabled:opacity-50"
                      >
                        {sendingReminder === alert.type ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {alert.action_label}
                      </button>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Demandes de partenariat en attente */}
      {pendingPartnerships.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-bold text-white">
              {pendingPartnerships.length} demande
              {pendingPartnerships.length > 1 ? "s" : ""} de partenariat en
              attente
            </h2>
          </div>
          <div className="space-y-3">
            {pendingPartnerships.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  {p.company_logo_url ? (
                    <img
                      src={p.company_logo_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{p.company_name}</p>
                    {p.request_message && (
                      <p className="text-sm text-gray-400 truncate max-w-xs">
                        {p.request_message}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setView("partnerships")}
                  className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition"
                >
                  Examiner
                </button>
              </div>
            ))}
          </div>
          {pendingPartnerships.length > 3 && (
            <button
              onClick={() => setView("partnerships")}
              className="inline-flex items-center gap-2 mt-4 text-yellow-500 hover:text-yellow-400 transition"
            >
              Voir toutes les demandes
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Section Insertion Professionnelle */}
      {insertionIndicators && insertionIndicators.total_responses > 0 && (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-theme-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Insertion Professionnelle
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({insertionIndicators.total_responses} réponses)
              </span>
            </h2>
            <button
              onClick={() => setView("insertion_exports")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exporter CTI
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {insertionIndicators.employment_rate}%
              </div>
              <div className="text-xs text-gray-400">Taux net d'emploi</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {insertionIndicators.salary_stats.median
                  ? `${(insertionIndicators.salary_stats.median / 1000).toFixed(0)}k€`
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-400">Salaire médian</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Percent className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {insertionIndicators.cdi_rate}%
              </div>
              <div className="text-xs text-gray-400">Taux de CDI</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {insertionIndicators.international_rate}%
              </div>
              <div className="text-xs text-gray-400">International</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Poursuite d'études : {insertionIndicators.further_studies_rate}%
            </span>
            <button
              onClick={() => setView("insertion_exports")}
              className="text-green-400 hover:text-green-300 flex items-center gap-1"
            >
              Voir tous les indicateurs
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cohortes */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Cohortes
            </h2>
            <button
              onClick={() => setView("cohorts")}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Nouvelle
            </button>
          </div>

          {cohorts.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Aucune cohorte créée</p>
              <button
                onClick={() => setView("cohorts")}
                className="inline-block mt-3 text-blue-400 hover:text-blue-300"
              >
                Créer votre première cohorte →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cohorts.slice(0, 5).map((cohort) => (
                <div
                  key={cohort.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition group cursor-pointer"
                  onClick={() => setView("cohorts")}
                >
                  <div>
                    <p className="font-medium text-white group-hover:text-blue-400 transition">
                      {cohort.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {cohort.student_count} étudiant
                      {cohort.student_count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Visibles</p>
                      <p className="font-medium text-green-400 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {cohort.visible_students}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {cohorts.length > 5 && (
            <button
              onClick={() => setView("cohorts")}
              className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition"
            >
              Voir toutes les cohortes
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Actions rapides</h2>
          <div className="space-y-3">
            <ActionCard
              onClick={() => setView("invite_members")}
              icon={<UserPlus className="w-5 h-5" />}
              title="Inviter des étudiants"
              description="Ajouter des étudiants par email ou import CSV"
              color="orange"
            />
            <ActionCard
              onClick={() => setView("cohorts")}
              icon={<GraduationCap className="w-5 h-5" />}
              title="Créer une cohorte"
              description="Nouvelle promotion ou groupe d'étudiants"
              color="blue"
            />
            <ActionCard
              onClick={() => setView("partnerships")}
              icon={<Briefcase className="w-5 h-5" />}
              title="Gérer les partenariats"
              description="Voir et gérer les entreprises partenaires"
              color="green"
            />
            <ActionCard
              onClick={() => setView("analytics")}
              icon={<BarChart3 className="w-5 h-5" />}
              title="Voir les analytics"
              description="Statistiques de complétion des profils"
              color="purple"
            />
            <ActionCard
              onClick={() => setView("insertion_exports")}
              icon={<FileSpreadsheet className="w-5 h-5" />}
              title="Exports CTI"
              description="Rapports d'insertion pour accréditations"
              color="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "orange" | "blue" | "green" | "purple";
}) {
  const colors = {
    orange: "from-orange-500 to-red-600 text-orange-500",
    blue: "from-blue-500 to-cyan-600 text-blue-500",
    green: "from-green-500 to-emerald-600 text-green-500",
    purple: "from-purple-500 to-pink-600 text-purple-500",
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color].split(" ")[0]} ${colors[color].split(" ")[1]} flex items-center justify-center mb-4 opacity-20`}
      >
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}

function ActionCard({
  onClick,
  icon,
  title,
  description,
  color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "orange" | "blue" | "green" | "purple";
}) {
  const colors = {
    orange: "bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30",
    blue: "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30",
    green: "bg-green-500/20 text-green-400 group-hover:bg-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30",
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition group text-left"
    >
      <div
        className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center transition`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-white group-hover:text-orange-400 transition">
          {title}
        </p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
    </button>
  );
}
