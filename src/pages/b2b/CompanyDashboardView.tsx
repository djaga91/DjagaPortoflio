/**
 * CompanyDashboardView - Dashboard pour les entreprises partenaires
 *
 * Affiche les écoles partenaires, les profils visibles, et les offres publiées.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  PlusCircle,
  Eye,
  MessageSquare,
  Settings,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
// Layout est appliqué par App.tsx - ne pas l'utiliser ici
import { api } from "../../services/api";

interface CompanyStats {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  industry?: string;
  partner_count: number;
  active_jobs: number;
  total_views: number;
  contacts_remaining: number;
}

interface PartnerSchool {
  id: string;
  school_name: string;
  school_logo_url?: string;
  student_count: number;
  visible_students: number;
}

interface JobPosting {
  id: string;
  title: string;
  job_type: string;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
}

export default function CompanyDashboardView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [partners, setPartners] = useState<PartnerSchool[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

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

        // Récupérer les stats
        const statsRes = await api.get(`/api/organizations/${orgId}/stats`);
        setStats({
          ...statsRes.data,
          active_jobs: 0, // TODO: Implémenter
          total_views: 0,
          contacts_remaining: 50,
        });

        // Récupérer les partenariats actifs
        const partnershipsRes = await api.get(
          "/api/partnerships/?status=active",
        );
        setPartners(
          (partnershipsRes.data.items || []).map((p: any) => ({
            id: p.id,
            school_name: p.school_name,
            school_logo_url: p.school_logo_url,
            student_count: 0, // TODO: Récupérer depuis l'API
            visible_students: 0,
          })),
        );

        // TODO: Récupérer les offres d'emploi
        setJobs([]);
      } catch (err: any) {
        console.error("Erreur chargement dashboard entreprise:", err);
        setError(err.response?.data?.detail || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-theme-text-primary mb-2">
              Erreur
            </h2>
            <p className="text-theme-text-secondary">
              {error || "Organisation non trouvée"}
            </p>
            <button
              onClick={() => setView("dashboard")}
              className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const hasNoPartners = partners.length === 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-theme-text-primary">
                {stats.name}
              </h1>
              {stats.industry && (
                <p className="text-theme-text-secondary">{stats.industry}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setView("settings")}
            className="flex items-center gap-2 px-4 py-2 bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:bg-theme-bg-tertiary transition"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<GraduationCap className="w-6 h-6" />}
            label="Écoles partenaires"
            value={stats.partner_count}
            color="blue"
          />
          <StatCard
            icon={<Briefcase className="w-6 h-6" />}
            label="Offres actives"
            value={stats.active_jobs}
            color="orange"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="Vues profils"
            value={stats.total_views}
            color="green"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            label="Contacts restants"
            value={stats.contacts_remaining}
            color="purple"
          />
        </div>

        {/* Message si pas de partenaires */}
        {hasNoPartners && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8 mb-8 text-center">
            <GraduationCap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-theme-text-primary mb-2">
              Commencez par trouver des écoles partenaires
            </h2>
            <p className="text-theme-text-secondary mb-6 max-w-lg mx-auto">
              Pour accéder aux profils d'étudiants, vous devez d'abord établir
              un partenariat avec des écoles. Parcourez notre liste d'écoles et
              envoyez une demande de partenariat.
            </p>
            <button
              onClick={() => setView("partnerships")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
            >
              <Search className="w-5 h-5" />
              Trouver des écoles partenaires
            </button>
          </div>
        )}

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Écoles partenaires */}
          <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-theme-text-primary flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                Écoles partenaires
              </h2>
              <button
                onClick={() => setView("partnerships")}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </div>

            {partners.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
                <p className="text-theme-text-secondary">
                  Aucune école partenaire
                </p>
                <button
                  onClick={() => setView("partnerships")}
                  className="inline-block mt-3 text-blue-400 hover:text-blue-300"
                >
                  Demander un partenariat →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {partners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setView("student_search")}
                    className="w-full flex items-center justify-between p-4 bg-theme-bg-secondary rounded-lg hover:bg-theme-bg-tertiary transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      {partner.school_logo_url ? (
                        <img
                          src={partner.school_logo_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-theme-bg-tertiary flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-theme-text-muted" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-theme-text-primary group-hover:text-blue-400 transition">
                          {partner.school_name}
                        </p>
                        <p className="text-sm text-theme-text-secondary">
                          {partner.visible_students} profils visibles
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-theme-text-muted group-hover:text-theme-text-secondary" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Offres d'emploi */}
          <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-theme-text-primary flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                Offres
              </h2>
              <button
                onClick={() => setView("jobs")}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Nouvelle offre
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
                <p className="text-theme-text-secondary">
                  Aucune offre publiée
                </p>
                <button
                  onClick={() => setView("jobs")}
                  className="inline-block mt-3 text-orange-400 hover:text-orange-300"
                >
                  Publier une offre →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setView("jobs")}
                    className="w-full flex items-center justify-between p-4 bg-theme-bg-secondary rounded-lg hover:bg-theme-bg-tertiary transition group text-left"
                  >
                    <div>
                      <p className="font-medium text-theme-text-primary group-hover:text-orange-400 transition">
                        {job.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-theme-bg-tertiary text-theme-text-secondary">
                          {job.job_type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            job.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-theme-bg-tertiary text-theme-text-muted"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-theme-text-secondary">
                        {job.views_count} vues · {job.applications_count}{" "}
                        candidatures
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-theme-card border border-theme-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-theme-text-primary mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              onClick={() => setView("student_search")}
              icon={<Search className="w-5 h-5" />}
              title="Rechercher des profils"
              color="blue"
            />
            <ActionCard
              onClick={() => setView("jobs")}
              icon={<PlusCircle className="w-5 h-5" />}
              title="Publier une offre"
              color="orange"
            />
            <ActionCard
              onClick={() => setView("partnerships")}
              icon={<GraduationCap className="w-5 h-5" />}
              title="Trouver des écoles"
              color="green"
            />
            <ActionCard
              onClick={() => setView("dashboard")}
              icon={<MessageSquare className="w-5 h-5" />}
              title="Messages"
              color="purple"
            />
          </div>
        </div>
      </div>
    </>
  );
}

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
    orange: "from-orange-500 to-red-600",
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
  };

  return (
    <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4 opacity-20`}
      >
        {icon}
      </div>
      <p className="text-3xl font-bold text-theme-text-primary mb-1">{value}</p>
      <p className="text-theme-text-secondary">{label}</p>
    </div>
  );
}

function ActionCard({
  onClick,
  icon,
  title,
  color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  color: "orange" | "blue" | "green" | "purple";
}) {
  const colors = {
    orange: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
    blue: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
    green: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-lg ${colors[color]} transition`}
    >
      {icon}
      <span className="font-medium">{title}</span>
    </button>
  );
}
