/**
 * JobsView - Gestion des offres d'emploi pour les entreprises
 *
 * Permet de créer, modifier, publier et gérer les offres d'emploi.
 */

import { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  Edit,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
// Layout est appliqué par App.tsx - ne pas l'utiliser ici
import { api } from "../../services/api";
import { useGameStore } from "../../store/gameStore";

type JobStatus =
  | "draft"
  | "active"
  | "paused"
  | "expired"
  | "filled"
  | "cancelled";
type JobType =
  | "internship"
  | "apprenticeship"
  | "full_time"
  | "part_time"
  | "freelance";

interface JobPosting {
  id: string;
  title: string;
  slug: string;
  description: string;
  job_type: JobType;
  status: JobStatus;
  city?: string;
  remote_policy: string;
  salary_min?: number;
  salary_max?: number;
  views_count: number;
  applications_count: number;
  published_at?: string;
  expires_at?: string;
  created_at: string;
}

interface JobStats {
  total: number;
  active: number;
  draft: number;
  expired: number;
  filled: number;
  total_views: number;
  total_applications: number;
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  internship: "Stage",
  apprenticeship: "Alternance",
  full_time: "CDI",
  part_time: "Temps partiel",
  freelance: "Freelance",
};

const STATUS_LABELS: Record<
  JobStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Brouillon",
    color: "text-gray-400 bg-gray-500/20",
    icon: <Edit className="w-4 h-4" />,
  },
  active: {
    label: "Active",
    color: "text-green-400 bg-green-500/20",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  paused: {
    label: "En pause",
    color: "text-yellow-400 bg-yellow-500/20",
    icon: <Pause className="w-4 h-4" />,
  },
  expired: {
    label: "Expirée",
    color: "text-orange-400 bg-orange-500/20",
    icon: <Clock className="w-4 h-4" />,
  },
  filled: {
    label: "Pourvue",
    color: "text-blue-400 bg-blue-500/20",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Annulée",
    color: "text-red-400 bg-red-500/20",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function JobsView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/api/job-postings/company", { params });
      setJobs(response.data.items || []);
    } catch (err: any) {
      console.error("Erreur chargement offres:", err);
      setError(err.response?.data?.detail || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/job-postings/company/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  };

  const publishJob = async (jobId: string) => {
    try {
      await api.post(`/api/job-postings/${jobId}/publish`);
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la publication");
    }
  };

  const unpublishJob = async (jobId: string) => {
    try {
      await api.post(`/api/job-postings/${jobId}/unpublish`);
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la mise en pause");
    }
  };

  const markAsFilled = async (jobId: string) => {
    try {
      await api.post(`/api/job-postings/${jobId}/mark-filled`);
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur");
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;
    try {
      await api.delete(`/api/job-postings/${jobId}`);
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && jobs.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-orange-500" />
              Offres d'emploi
            </h1>
            <p className="text-gray-400 mt-1">
              Gérez vos offres de stages, alternances et CDI
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus className="w-5 h-5" />
            Nouvelle offre
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<Briefcase />}
              color="gray"
            />
            <StatCard
              label="Actives"
              value={stats.active}
              icon={<CheckCircle />}
              color="green"
            />
            <StatCard
              label="Vues"
              value={stats.total_views}
              icon={<Eye />}
              color="blue"
            />
            <StatCard
              label="Candidatures"
              value={stats.total_applications}
              icon={<Users />}
              color="orange"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as JobStatus | "all")}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="active">Actives</option>
              <option value="paused">En pause</option>
              <option value="expired">Expirées</option>
              <option value="filled">Pourvues</option>
            </select>
          </div>
        </div>

        {/* Job List */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setView("company_dashboard")}
              className="mt-4 text-orange-400 hover:text-orange-300"
            >
              Retour au dashboard
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune offre</h3>
            <p className="text-gray-400 mb-6">
              {filter !== "all"
                ? "Aucune offre avec ce statut"
                : "Vous n'avez pas encore créé d'offre d'emploi"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <Plus className="w-5 h-5" />
              Créer ma première offre
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPublish={() => publishJob(job.id)}
                onUnpublish={() => unpublishJob(job.id)}
                onMarkFilled={() => markAsFilled(job.id)}
                onDelete={() => deleteJob(job.id)}
              />
            ))}
          </div>
        )}

        {/* Create Modal (simplified - TODO: full form) */}
        {showCreateModal && (
          <CreateJobModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              fetchJobs();
              fetchStats();
            }}
          />
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    gray: "text-gray-400",
    green: "text-green-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className={`${colors[color]} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function JobCard({
  job,
  onPublish,
  onUnpublish,
  onMarkFilled,
  onDelete,
}: {
  job: JobPosting;
  onPublish: () => void;
  onUnpublish: () => void;
  onMarkFilled: () => void;
  onDelete: () => void;
}) {
  const statusInfo = STATUS_LABELS[job.status];

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white">{job.title}</h3>
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.color}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
            <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.city}
              </span>
            )}
            {job.salary_min && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary_min.toLocaleString()}€ -{" "}
                {job.salary_max?.toLocaleString()}€
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(job.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-1 text-gray-400">
              <Eye className="w-4 h-4" />
              {job.views_count} vues
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Users className="w-4 h-4" />
              {job.applications_count} candidatures
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === "draft" && (
            <button
              onClick={onPublish}
              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition"
              title="Publier"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          {job.status === "active" && (
            <>
              <button
                onClick={onUnpublish}
                className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition"
                title="Mettre en pause"
              >
                <Pause className="w-5 h-5" />
              </button>
              <button
                onClick={onMarkFilled}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                title="Marquer comme pourvue"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </>
          )}
          {job.status === "paused" && (
            <button
              onClick={onPublish}
              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition"
              title="Republier"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
            title="Supprimer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateJobModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    job_type: "internship" as JobType,
    city: "",
    remote_policy: "hybrid",
    publish: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/job-postings/", formData);
      onCreated();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          Nouvelle offre d'emploi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
              placeholder="Ex: Stage Data Science - 6 mois"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Type de contrat *
            </label>
            <select
              value={formData.job_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  job_type: e.target.value as JobType,
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            >
              <option value="internship">Stage</option>
              <option value="apprenticeship">Alternance</option>
              <option value="full_time">CDI</option>
              <option value="part_time">Temps partiel</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Ville</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
              placeholder="Ex: Paris"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Télétravail
            </label>
            <select
              value={formData.remote_policy}
              onChange={(e) =>
                setFormData({ ...formData, remote_policy: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            >
              <option value="on_site">100% présentiel</option>
              <option value="hybrid">Hybride</option>
              <option value="full_remote">100% télétravail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description * (min 50 caractères)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none resize-none"
              placeholder="Décrivez le poste, les missions, les compétences recherchées..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/50 caractères minimum
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publish"
              checked={formData.publish}
              onChange={(e) =>
                setFormData({ ...formData, publish: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="publish" className="text-sm text-gray-400">
              Publier immédiatement
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer l'offre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
