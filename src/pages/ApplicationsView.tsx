/**
 * ApplicationsView - Suivi des candidatures avec vue Kanban.
 *
 * Permet de suivre toutes les candidatures par statut avec drag & drop.
 */

import { useEffect, useState } from "react";
import {
  Briefcase,
  ArrowLeft,
  LayoutGrid,
  List,
  Plus,
  Search,
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  MoreVertical,
} from "lucide-react";
import { api } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface Application {
  id: string;
  job_title: string;
  company_name: string | null;
  job_location: string | null;
  status: string;
  source: string;
  submitted_at: string | null;
  interview_date: string | null;
  created_at: string;
}

interface KanbanColumn {
  status: string;
  label: string;
  color: string;
  count: number;
  applications: Application[];
}

interface ApplicationStats {
  total_applications: number;
  active_applications: number;
  interviews_scheduled: number;
  offers_received: number;
  by_status: Record<string, number>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Brouillon",
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800",
    icon: <Clock className="w-3 h-3" />,
  },
  submitted: {
    label: "Soumise",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: <TrendingUp className="w-3 h-3" />,
  },
  viewed: {
    label: "Vue",
    color: "text-cyan-500",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    icon: <Eye className="w-3 h-3" />,
  },
  under_review: {
    label: "En évaluation",
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    icon: <Search className="w-3 h-3" />,
  },
  shortlisted: {
    label: "Présélectionné",
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  interview_scheduled: {
    label: "Entretien prévu",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    icon: <Calendar className="w-3 h-3" />,
  },
  interview_completed: {
    label: "Entretien passé",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  offer_sent: {
    label: "Offre reçue",
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    icon: <Briefcase className="w-3 h-3" />,
  },
  offer_accepted: {
    label: "Acceptée",
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: "Refusée",
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: <XCircle className="w-3 h-3" />,
  },
  withdrawn: {
    label: "Retirée",
    color: "text-slate-500",
    bg: "bg-slate-100 dark:bg-slate-800",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function ApplicationsView() {
  const { setView } = useGameStore();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (viewMode === "kanban") {
      fetchKanban();
    } else {
      fetchApplications();
    }
    fetchStats();
  }, [viewMode]);

  const fetchKanban = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/applications/kanban");
      setColumns(res.data.columns);
    } catch (err) {
      console.error("Erreur chargement kanban:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/applications/", {
        params: { per_page: 50 },
      });
      setApplications(res.data.items);
    } catch (err) {
      console.error("Erreur chargement applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/applications/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.job_title.toLowerCase().includes(query) ||
      app.company_name?.toLowerCase().includes(query)
    );
  });

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
            <Briefcase className="w-7 h-7 text-green-500" />
            Mes Candidatures
          </h1>
          {stats && (
            <p className="text-theme-text-secondary">
              {stats.active_applications} active
              {stats.active_applications > 1 ? "s" : ""} sur{" "}
              {stats.total_applications}
            </p>
          )}
        </div>
        <button
          onClick={() => setView("matching" as never)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
            <p className="text-2xl font-bold text-theme-text-primary">
              {stats.total_applications}
            </p>
            <p className="text-sm text-theme-text-muted">Total</p>
          </div>
          <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-500">
              {stats.active_applications}
            </p>
            <p className="text-sm text-theme-text-muted">Actives</p>
          </div>
          <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-500">
              {stats.interviews_scheduled}
            </p>
            <p className="text-sm text-theme-text-muted">Entretiens</p>
          </div>
          <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
            <p className="text-2xl font-bold text-green-500">
              {stats.offers_received}
            </p>
            <p className="text-sm text-theme-text-muted">Offres</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-theme-bg-secondary border border-theme-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 rounded-lg transition ${
              viewMode === "kanban"
                ? "bg-green-500 text-white"
                : "text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition ${
              viewMode === "list"
                ? "bg-green-500 text-white"
                : "text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => (
              <div key={column.status} className="w-72 flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`${getStatusConfig(column.status).color}`}>
                      {getStatusConfig(column.status).icon}
                    </span>
                    <span className="font-medium text-theme-text-primary text-sm">
                      {column.label}
                    </span>
                  </div>
                  <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary px-2 py-0.5 rounded-full">
                    {column.count}
                  </span>
                </div>

                {/* Column content */}
                <div className="bg-theme-bg-secondary rounded-xl p-2 min-h-[200px] space-y-2">
                  {column.applications.length === 0 ? (
                    <div className="text-center py-8 text-theme-text-muted text-sm">
                      Aucune candidature
                    </div>
                  ) : (
                    column.applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-theme-card border border-theme-card-border rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-theme-text-primary text-sm truncate">
                              {app.job_title}
                            </p>
                            {app.company_name && (
                              <p className="text-xs text-theme-text-muted truncate">
                                {app.company_name}
                              </p>
                            )}
                          </div>
                          <button className="p-1 hover:bg-theme-bg-tertiary rounded">
                            <MoreVertical className="w-3 h-3 text-theme-text-muted" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {app.submitted_at && (
                            <span className="text-xs text-theme-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(app.submitted_at)}
                            </span>
                          )}
                          {app.interview_date && (
                            <span className="text-xs text-orange-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(app.interview_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-theme-card border border-theme-card-border rounded-xl overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-theme-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-theme-text-muted">Aucune candidature</p>
              <button
                onClick={() => setView("matching" as never)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Trouver des offres
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-theme-bg-secondary">
                  <tr className="text-left text-sm text-theme-text-secondary">
                    <th className="p-4 font-medium">Poste</th>
                    <th className="p-4 font-medium">Entreprise</th>
                    <th className="p-4 font-medium">Statut</th>
                    <th className="p-4 font-medium">Soumise le</th>
                    <th className="p-4 font-medium">Entretien</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {filteredApplications.map((app) => {
                    const statusConfig = getStatusConfig(app.status);
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-theme-bg-tertiary transition"
                      >
                        <td className="p-4">
                          <p className="font-medium text-theme-text-primary">
                            {app.job_title}
                          </p>
                          {app.job_location && (
                            <p className="text-xs text-theme-text-muted">
                              {app.job_location}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-theme-text-secondary">
                          {app.company_name || "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="p-4 text-theme-text-secondary text-sm">
                          {formatDate(app.submitted_at)}
                        </td>
                        <td className="p-4">
                          {app.interview_date ? (
                            <span className="text-orange-500 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(app.interview_date)}
                            </span>
                          ) : (
                            <span className="text-theme-text-muted text-sm">
                              -
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <button className="p-2 hover:bg-theme-bg-tertiary rounded-lg">
                            <MoreVertical className="w-4 h-4 text-theme-text-muted" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
