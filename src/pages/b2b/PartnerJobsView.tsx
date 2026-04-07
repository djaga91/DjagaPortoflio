/**
 * PartnerJobsView - Offres d'emploi des entreprises partenaires
 *
 * Affiche toutes les offres des entreprises partenaires de l'école.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import {
  Briefcase,
  MapPin,
  Building2,
  Search,
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Euro,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { api } from "../../services/api";
import RecommendModal from "../../components/RecommendModal";

interface JobPosting {
  id: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  location: string;
  job_type: "cdi" | "cdd" | "stage" | "alternance" | "freelance";
  remote_policy?: "onsite" | "hybrid" | "remote";
  salary_min?: number;
  salary_max?: number;
  description: string;
  required_skills: string[];
  created_at: string;
  expires_at?: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  alternance: "Alternance",
  freelance: "Freelance",
};

const REMOTE_LABELS: Record<string, string> = {
  onsite: "Sur site",
  hybrid: "Hybride",
  remote: "100% Remote",
};

export default function PartnerJobsView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const orgId = localStorage.getItem("current_org_id");

  useEffect(() => {
    const fetchJobs = async () => {
      if (!orgId) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les offres des partenaires de l'école
        const response = await api.get(
          `/api/organizations/${orgId}/partner-jobs`,
        );
        setJobs(response.data.items || []);
        setFilteredJobs(response.data.items || []);
      } catch (err) {
        console.error("Erreur chargement offres partenaires:", err);
        // Données de démo placeholder - à remplacer par de vraies offres une fois en production
        const demoJobs: JobPosting[] = [
          {
            id: "1",
            title: "Poste Exemple 1",
            company_name: "Entreprise 1",
            location: "Ville, France",
            job_type: "cdi",
            remote_policy: "hybrid",
            salary_min: 30000,
            salary_max: 40000,
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            required_skills: ["Compétence 1", "Compétence 2", "Compétence 3"],
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Poste Exemple 2",
            company_name: "Entreprise 2",
            location: "Ville, France",
            job_type: "stage",
            remote_policy: "onsite",
            description:
              "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
            required_skills: ["Compétence 1", "Compétence 2"],
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Poste Exemple 3",
            company_name: "Entreprise 3",
            location: "Ville, France",
            job_type: "alternance",
            remote_policy: "hybrid",
            salary_min: 1000,
            salary_max: 1500,
            description:
              "Duis aute irure dolor in reprehenderit in voluptate velit.",
            required_skills: ["Compétence 1", "Compétence 2", "Compétence 3"],
            created_at: new Date().toISOString(),
          },
        ];
        setJobs(demoJobs);
        setFilteredJobs(demoJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [orgId]);

  // Filtrer les offres
  useEffect(() => {
    let filtered = jobs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name.toLowerCase().includes(query) ||
          job.required_skills.some((skill) =>
            skill.toLowerCase().includes(query),
          ),
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((job) => job.job_type === selectedType);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, selectedType, jobs]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const goBack = () => {
    setView("school_dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={goBack}
          className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-green-500" />
            Offres des partenaires
          </h1>
          <p className="text-theme-text-secondary">
            {filteredJobs.length} offre{filteredJobs.length > 1 ? "s" : ""}{" "}
            disponible{filteredJobs.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par titre, entreprise ou compétence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">Tous les types</option>
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      {/* Liste des offres */}
      {filteredJobs.length === 0 ? (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-12 text-center">
          <Briefcase className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-theme-text-primary mb-2">
            Aucune offre trouvée
          </h3>
          <p className="text-theme-text-secondary">
            {searchQuery || selectedType !== "all"
              ? "Essayez de modifier vos filtres"
              : "Les entreprises partenaires n'ont pas encore publié d'offres"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobs.has(job.id)}
              onToggleSave={() => toggleSaveJob(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant carte offre
function JobCard({
  job,
  isSaved,
  onToggleSave,
}: {
  job: JobPosting;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  const typeColors: Record<string, string> = {
    cdi: "bg-green-500/20 text-green-400",
    cdd: "bg-blue-500/20 text-blue-400",
    stage: "bg-purple-500/20 text-purple-400",
    alternance: "bg-orange-500/20 text-orange-400",
    freelance: "bg-pink-500/20 text-pink-400",
  };

  return (
    <div className="bg-theme-card border border-theme-card-border rounded-xl p-6 hover:border-orange-500/50 transition group">
      <div className="flex items-start gap-4">
        {/* Logo entreprise */}
        <div className="w-14 h-14 rounded-xl bg-theme-bg-tertiary flex items-center justify-center flex-shrink-0">
          {job.company_logo_url ? (
            <img
              src={job.company_logo_url}
              alt={job.company_name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <Building2 className="w-7 h-7 text-theme-text-muted" />
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-orange-400 transition">
                {job.title}
              </h3>
              <p className="text-theme-text-secondary">{job.company_name}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={`p-2 rounded-lg transition ${
                isSaved
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-theme-bg-tertiary text-theme-text-muted hover:text-orange-400"
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[job.job_type]}`}
            >
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            {job.remote_policy && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-theme-bg-tertiary text-theme-text-secondary">
                {REMOTE_LABELS[job.remote_policy]}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-theme-bg-tertiary text-theme-text-secondary flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            {(job.salary_min || job.salary_max) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-theme-bg-tertiary text-theme-text-secondary flex items-center gap-1">
                <Euro className="w-3 h-3" />
                {job.salary_min && job.salary_max
                  ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}€`
                  : job.salary_min
                    ? `À partir de ${job.salary_min.toLocaleString()}€`
                    : `Jusqu'à ${job.salary_max?.toLocaleString()}€`}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-theme-text-secondary text-sm mt-3 line-clamp-2">
            {job.description}
          </p>

          {/* Compétences */}
          <div className="flex flex-wrap gap-2 mt-3">
            {job.required_skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="px-2 py-0.5 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">
                +{job.required_skills.length - 4}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-theme-card-border">
            <span className="text-xs text-theme-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Publié {new Date(job.created_at).toLocaleDateString("fr-FR")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRecommendModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg text-sm font-medium transition"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Recommander un étudiant
              </button>
              <button className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium transition">
                Voir l'offre
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recommandation */}
      <RecommendModal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        type="job_to_student"
        preselectedJob={{
          id: job.id,
          title: job.title,
          company_name: job.company_name,
          location: job.location,
        }}
        onSuccess={() => setShowRecommendModal(false)}
      />
    </div>
  );
}
