/**
 * RecommendModal - Modal de recommandation pour écoles
 *
 * Permet aux staff écoles de :
 * - Recommander une offre à un étudiant
 * - Recommander un étudiant pour un poste
 */

import { useState, useEffect } from "react";
import {
  X,
  Send,
  Briefcase,
  GraduationCap,
  Search,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react";
import { api } from "../services/api";

interface Student {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture_url?: string;
  headline?: string;
}

interface JobPosting {
  id: string;
  title: string;
  company_name: string;
  location?: string;
}

type RecommendationType = "job_to_student" | "student_to_job";

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: RecommendationType;
  // Pour recommander une offre à un étudiant - pré-sélectionner l'étudiant
  preselectedStudent?: Student;
  // Pour recommander un étudiant pour un poste - pré-sélectionner l'offre
  preselectedJob?: JobPosting;
  onSuccess?: () => void;
}

export default function RecommendModal({
  isOpen,
  onClose,
  type,
  preselectedStudent,
  preselectedJob,
  onSuccess,
}: RecommendModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État pour la recherche
  const [students, setStudents] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Sélections
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    preselectedStudent || null,
  );
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(
    preselectedJob || null,
  );
  const [message, setMessage] = useState("");

  // Charger les données initiales
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);

      if (type === "job_to_student" && !preselectedStudent) {
        fetchStudents();
      }
      if (type === "student_to_job" && !preselectedJob) {
        fetchJobs();
      }

      // Réinitialiser les sélections avec les valeurs pré-sélectionnées
      setSelectedStudent(preselectedStudent || null);
      setSelectedJob(preselectedJob || null);
    }
  }, [isOpen, type, preselectedStudent, preselectedJob]);

  const fetchStudents = async () => {
    try {
      setLoadingSearch(true);
      const orgId = localStorage.getItem("current_org_id");
      const response = await api.get(`/api/organizations/${orgId}/students`, {
        params: { search: searchQuery, per_page: 50 },
      });
      setStudents(response.data.items || response.data || []);
    } catch (err) {
      console.error("Erreur chargement étudiants:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoadingSearch(true);
      // Charger les offres des entreprises partenaires
      const response = await api.get("/api/job-postings/", {
        params: { status: "published", per_page: 50 },
      });
      setJobs(response.data.items || response.data || []);
    } catch (err) {
      console.error("Erreur chargement offres:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedJob) {
      setError("Veuillez sélectionner un étudiant et une offre");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        type === "job_to_student"
          ? "/api/notifications/recommend-job"
          : "/api/notifications/recommend-student";

      await api.post(endpoint, {
        student_id: selectedStudent.user_id,
        job_posting_id: selectedJob.id,
        message: message || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      console.error("Erreur recommandation:", err);
      setError(
        err.response?.data?.detail ||
          "Erreur lors de l'envoi de la recommandation",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title =
    type === "job_to_student"
      ? "Recommander une offre à un étudiant"
      : "Recommander un étudiant pour un poste";

  const icon =
    type === "job_to_student" ? (
      <Briefcase className="w-6 h-6 text-blue-500" />
    ) : (
      <GraduationCap className="w-6 h-6 text-purple-500" />
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-theme-card border border-theme-card-border rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-lg font-semibold text-theme-text-primary">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-theme-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-theme-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-medium text-theme-text-primary">
                Recommandation envoyée !
              </p>
              <p className="text-sm text-theme-text-secondary text-center">
                {type === "job_to_student"
                  ? "L'étudiant a été notifié de votre recommandation."
                  : "L'entreprise a été notifiée de votre recommandation."}
              </p>
            </div>
          ) : (
            <>
              {/* Sélection étudiant */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-theme-text-secondary">
                  Étudiant
                </label>
                {preselectedStudent || selectedStudent ? (
                  <div className="flex items-center justify-between p-3 bg-theme-bg-tertiary rounded-xl">
                    <div className="flex items-center gap-3">
                      {selectedStudent?.profile_picture_url ||
                      preselectedStudent?.profile_picture_url ? (
                        <img
                          src={
                            selectedStudent?.profile_picture_url ||
                            preselectedStudent?.profile_picture_url
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-theme-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-theme-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-theme-text-primary">
                          {selectedStudent?.first_name ||
                            preselectedStudent?.first_name}{" "}
                          {selectedStudent?.last_name ||
                            preselectedStudent?.last_name}
                        </p>
                        <p className="text-sm text-theme-text-secondary">
                          {selectedStudent?.headline ||
                            preselectedStudent?.headline ||
                            selectedStudent?.email ||
                            preselectedStudent?.email}
                        </p>
                      </div>
                    </div>
                    {!preselectedStudent && (
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-1 hover:bg-theme-bg-secondary rounded"
                      >
                        <X className="w-4 h-4 text-theme-text-tertiary" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-tertiary" />
                      <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
                        className="w-full pl-10 pr-4 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text-primary placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {loadingSearch ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-theme-primary" />
                        </div>
                      ) : students.length === 0 ? (
                        <p className="text-sm text-theme-text-tertiary text-center py-4">
                          Aucun étudiant trouvé
                        </p>
                      ) : (
                        students.map((student) => (
                          <button
                            key={student.user_id}
                            onClick={() => setSelectedStudent(student)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-theme-bg-secondary transition-colors text-left"
                          >
                            {student.profile_picture_url ? (
                              <img
                                src={student.profile_picture_url}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-theme-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-theme-text-primary truncate">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-xs text-theme-text-tertiary truncate">
                                {student.headline || student.email}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sélection offre */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-theme-text-secondary">
                  Offre d'emploi
                </label>
                {preselectedJob || selectedJob ? (
                  <div className="flex items-center justify-between p-3 bg-theme-bg-tertiary rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-theme-text-primary">
                          {selectedJob?.title || preselectedJob?.title}
                        </p>
                        <p className="text-sm text-theme-text-secondary">
                          {selectedJob?.company_name ||
                            preselectedJob?.company_name}
                          {(selectedJob?.location ||
                            preselectedJob?.location) &&
                            ` • ${selectedJob?.location || preselectedJob?.location}`}
                        </p>
                      </div>
                    </div>
                    {!preselectedJob && (
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="p-1 hover:bg-theme-bg-secondary rounded"
                      >
                        <X className="w-4 h-4 text-theme-text-tertiary" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {loadingSearch ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-theme-primary" />
                      </div>
                    ) : jobs.length === 0 ? (
                      <p className="text-sm text-theme-text-tertiary text-center py-4">
                        Aucune offre disponible
                      </p>
                    ) : (
                      jobs.map((job) => (
                        <button
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-theme-bg-secondary transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-theme-text-primary truncate">
                              {job.title}
                            </p>
                            <p className="text-xs text-theme-text-tertiary truncate">
                              {job.company_name}
                              {job.location && ` • ${job.location}`}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Message personnalisé */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text-secondary">
                  Message (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "job_to_student"
                      ? "Ex: Cette offre correspond parfaitement à votre profil..."
                      : "Ex: Cet étudiant possède les compétences recherchées..."
                  }
                  rows={3}
                  className="w-full p-3 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text-primary placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-theme-primary/50 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-theme-text-secondary hover:bg-theme-bg-tertiary rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedStudent || !selectedJob}
              className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Envoyer la recommandation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
