/**
 * StudentProfilesView - Liste des profils étudiants de l'école
 *
 * Affiche tous les étudiants sous forme de cartes avec possibilité de voir le profil complet.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import {
  Users,
  Search,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Briefcase,
  Mail,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  Linkedin,
  Github,
  Globe,
  FileText,
  Send,
} from "lucide-react";
import { api } from "../../services/api";
import { useState as useStateLocal } from "react";
import RecommendModal from "../../components/RecommendModal";

interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  cohort_name?: string;
  graduation_year?: string;
  skills: string[];
  completion_percentage: number;
  is_visible: boolean;
  experience_count: number;
  project_count: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export default function StudentProfilesView() {
  const {
    setView,
    studentProfilesPreselectedCohortName,
    setStudentProfilesPreselectedCohort,
  } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCohort, setSelectedCohort] = useState<string>(
    studentProfilesPreselectedCohortName || "all",
  );
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);
  const [cohorts, setCohorts] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(
    null,
  );

  const orgId = localStorage.getItem("current_org_id");

  // Appliquer la présélection de cohorte et la réinitialiser
  useEffect(() => {
    if (studentProfilesPreselectedCohortName) {
      setSelectedCohort(studentProfilesPreselectedCohortName);
      setStudentProfilesPreselectedCohort(null);
    }
  }, [
    studentProfilesPreselectedCohortName,
    setStudentProfilesPreselectedCohort,
  ]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!orgId) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les étudiants de l'organisation
        const response = await api.get(`/api/organizations/${orgId}/students`);
        const studentData = response.data.items || [];
        setStudents(studentData);
        setFilteredStudents(studentData);

        // Extraire les cohortes uniques (+ inclure la cohorte présélectionnée si absente)
        const uniqueCohorts = [
          ...new Set(
            studentData
              .map((s: StudentProfile) => s.cohort_name)
              .filter(Boolean),
          ),
        ] as string[];
        const preselected =
          useGameStore.getState().studentProfilesPreselectedCohortName;
        if (preselected && !uniqueCohorts.includes(preselected)) {
          uniqueCohorts.unshift(preselected);
        }
        setCohorts(uniqueCohorts);
      } catch (err) {
        console.error("Erreur chargement étudiants:", err);
        // Données de démo en cas d'erreur
        const demoStudents: StudentProfile[] = [
          {
            id: "1",
            user_id: "u1",
            first_name: "Sophie",
            last_name: "Martin",
            email: "sophie.martin@efrei.fr",
            bio: "Étudiante passionnée par le développement web et l'IA. À la recherche d'un stage de fin d'études.",
            location: "Paris, France",
            cohort_name: "M2 BDML 2026",
            graduation_year: "2026",
            skills: [
              "Python",
              "Machine Learning",
              "TensorFlow",
              "React",
              "SQL",
            ],
            completion_percentage: 85,
            is_visible: true,
            experience_count: 2,
            project_count: 4,
            linkedin_url: "https://linkedin.com/in/sophie-martin",
            github_url: "https://github.com/sophiemartin",
          },
          {
            id: "2",
            user_id: "u2",
            first_name: "Lucas",
            last_name: "Bernard",
            email: "lucas.bernard@efrei.fr",
            bio: "Développeur Full Stack avec une passion pour les architectures cloud.",
            location: "Lyon, France",
            cohort_name: "M2 BDML 2026",
            graduation_year: "2026",
            skills: ["JavaScript", "Node.js", "AWS", "Docker", "MongoDB"],
            completion_percentage: 72,
            is_visible: true,
            experience_count: 1,
            project_count: 3,
            github_url: "https://github.com/lucasbernard",
          },
          {
            id: "3",
            user_id: "u3",
            first_name: "Emma",
            last_name: "Dubois",
            email: "emma.dubois@efrei.fr",
            bio: "Data Scientist junior avec expérience en NLP.",
            location: "Bordeaux, France",
            cohort_name: "M1 BDML 2027",
            graduation_year: "2027",
            skills: ["Python", "NLP", "PyTorch", "Pandas", "Scikit-learn"],
            completion_percentage: 60,
            is_visible: false,
            experience_count: 0,
            project_count: 2,
          },
          {
            id: "4",
            user_id: "u4",
            first_name: "Thomas",
            last_name: "Petit",
            email: "thomas.petit@efrei.fr",
            location: "Paris, France",
            cohort_name: "M1 BDML 2027",
            graduation_year: "2027",
            skills: ["Java", "Spring Boot", "PostgreSQL"],
            completion_percentage: 35,
            is_visible: true,
            experience_count: 1,
            project_count: 1,
          },
        ];
        setStudents(demoStudents);
        setFilteredStudents(demoStudents);
        setCohorts(["M2 BDML 2026", "M1 BDML 2027"]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [orgId]);

  // Filtrer les étudiants
  useEffect(() => {
    let filtered = students;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.first_name.toLowerCase().includes(query) ||
          student.last_name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.skills.some((skill) => skill.toLowerCase().includes(query)),
      );
    }

    if (selectedCohort !== "all") {
      filtered = filtered.filter(
        (student) => student.cohort_name === selectedCohort,
      );
    }

    if (showOnlyVisible) {
      filtered = filtered.filter((student) => student.is_visible);
    }

    setFilteredStudents(filtered);
  }, [searchQuery, selectedCohort, showOnlyVisible, students]);

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
            <Users className="w-7 h-7 text-blue-500" />
            Profils étudiants
          </h1>
          <p className="text-theme-text-secondary">
            {filteredStudents.length} étudiant
            {filteredStudents.length > 1 ? "s" : ""} •
            {filteredStudents.filter((s) => s.is_visible).length} visible
            {filteredStudents.filter((s) => s.is_visible).length > 1
              ? "s"
              : ""}{" "}
            aux partenaires
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou compétence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">Toutes les cohortes</option>
            {cohorts.map((cohort) => (
              <option key={cohort} value={cohort}>
                {cohort}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowOnlyVisible(!showOnlyVisible)}
            className={`px-4 py-3 rounded-xl border transition flex items-center gap-2 ${
              showOnlyVisible
                ? "bg-green-500/20 border-green-500/50 text-green-400"
                : "bg-theme-card border-theme-card-border text-theme-text-secondary hover:border-theme-card-border-hover"
            }`}
          >
            {showOnlyVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Visibles</span>
          </button>
        </div>
      </div>

      {/* Grille des étudiants */}
      {filteredStudents.length === 0 ? (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-theme-text-primary mb-2">
            Aucun étudiant trouvé
          </h3>
          <p className="text-theme-text-secondary">
            {searchQuery || selectedCohort !== "all" || showOnlyVisible
              ? "Essayez de modifier vos filtres"
              : "Invitez des étudiants à rejoindre votre école"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudent(student)}
            />
          ))}
        </div>
      )}

      {/* Modal profil détaillé */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

// Composant carte étudiant
function StudentCard({
  student,
  onClick,
}: {
  student: StudentProfile;
  onClick: () => void;
}) {
  const completionColor =
    student.completion_percentage >= 75
      ? "text-green-400"
      : student.completion_percentage >= 50
        ? "text-orange-400"
        : "text-red-400";

  return (
    <button
      onClick={onClick}
      className="bg-theme-card border border-theme-card-border rounded-xl p-5 text-left hover:border-orange-500/50 transition group w-full"
    >
      {/* Header avec avatar */}
      <div className="flex items-start gap-4">
        <div className="relative">
          {student.profile_picture_url ? (
            <img
              src={student.profile_picture_url}
              alt={`${student.first_name} ${student.last_name}`}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
              {student.first_name[0]}
              {student.last_name[0]}
            </div>
          )}
          {/* Indicateur visibilité */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-theme-card flex items-center justify-center ${
              student.is_visible ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            {student.is_visible ? (
              <Eye className="w-3 h-3 text-white" />
            ) : (
              <EyeOff className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-theme-text-primary group-hover:text-orange-400 transition truncate">
            {student.first_name} {student.last_name}
          </h3>
          {student.cohort_name && (
            <p className="text-sm text-theme-text-secondary flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {student.cohort_name}
            </p>
          )}
          {student.location && (
            <p className="text-xs text-theme-text-muted flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {student.location}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {student.bio && (
        <p className="text-sm text-theme-text-secondary mt-3 line-clamp-2">
          {student.bio}
        </p>
      )}

      {/* Compétences */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {student.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs font-medium"
          >
            {skill}
          </span>
        ))}
        {student.skills.length > 3 && (
          <span className="px-2 py-0.5 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">
            +{student.skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-theme-card-border">
        <div className="flex items-center gap-3 text-xs text-theme-text-muted">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {student.experience_count} exp.
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {student.project_count} projets
          </span>
        </div>
        <span className={`text-sm font-medium ${completionColor}`}>
          {student.completion_percentage}%
        </span>
      </div>
    </button>
  );
}

// Modal détail étudiant
function StudentDetailModal({
  student,
  onClose,
}: {
  student: StudentProfile;
  onClose: () => void;
}) {
  const [showRecommendModal, setShowRecommendModal] = useStateLocal(false);

  const completionColor =
    student.completion_percentage >= 75
      ? "bg-green-500"
      : student.completion_percentage >= 50
        ? "bg-orange-500"
        : "bg-red-500";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-theme-card border border-theme-card-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-theme-card border-b border-theme-card-border p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {student.profile_picture_url ? (
              <img
                src={student.profile_picture_url}
                alt={`${student.first_name} ${student.last_name}`}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl">
                {student.first_name[0]}
                {student.last_name[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-theme-text-primary">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-theme-text-secondary">{student.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {student.is_visible ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Visible aux partenaires
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Non visible
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
          >
            <X className="w-5 h-5 text-theme-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Barre de complétion */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-theme-text-secondary">
                Complétion du profil
              </span>
              <span className="text-sm font-medium text-theme-text-primary">
                {student.completion_percentage}%
              </span>
            </div>
            <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full ${completionColor} rounded-full transition-all`}
                style={{ width: `${student.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Infos */}
          <div className="grid grid-cols-2 gap-4">
            {student.cohort_name && (
              <div className="bg-theme-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-theme-text-muted mb-1">Cohorte</p>
                <p className="font-medium text-theme-text-primary flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  {student.cohort_name}
                </p>
              </div>
            )}
            {student.location && (
              <div className="bg-theme-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-theme-text-muted mb-1">
                  Localisation
                </p>
                <p className="font-medium text-theme-text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  {student.location}
                </p>
              </div>
            )}
            <div className="bg-theme-bg-tertiary rounded-xl p-4">
              <p className="text-xs text-theme-text-muted mb-1">Expériences</p>
              <p className="font-medium text-theme-text-primary flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-400" />
                {student.experience_count} expérience
                {student.experience_count > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-theme-bg-tertiary rounded-xl p-4">
              <p className="text-xs text-theme-text-muted mb-1">Projets</p>
              <p className="font-medium text-theme-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                {student.project_count} projet
                {student.project_count > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div>
              <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                À propos
              </h3>
              <p className="text-theme-text-primary">{student.bio}</p>
            </div>
          )}

          {/* Compétences */}
          <div>
            <h3 className="text-sm font-medium text-theme-text-secondary mb-3">
              Compétences
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Liens */}
          {(student.linkedin_url ||
            student.github_url ||
            student.portfolio_url) && (
            <div>
              <h3 className="text-sm font-medium text-theme-text-secondary mb-3">
                Liens
              </h3>
              <div className="flex flex-wrap gap-3">
                {student.linkedin_url && (
                  <a
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 transition"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {student.github_url && (
                  <a
                    href={student.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-theme-bg-tertiary text-theme-text-primary rounded-lg hover:bg-theme-card-hover transition"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {student.portfolio_url && (
                  <a
                    href={student.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20 transition"
                  >
                    <Globe className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-theme-card-border">
            {/* Bouton Recommander - Principale action */}
            <button
              onClick={() => setShowRecommendModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition font-medium shadow-lg"
            >
              <Send className="w-4 h-4" />
              Recommander pour un poste
            </button>

            <div className="flex gap-3">
              <a
                href={`mailto:${student.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-theme-bg-tertiary text-theme-text-primary rounded-xl hover:bg-theme-card-hover transition font-medium"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium">
                <ExternalLink className="w-4 h-4" />
                Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recommandation */}
      <RecommendModal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        type="student_to_job"
        preselectedStudent={{
          user_id: student.user_id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          profile_picture_url: student.profile_picture_url,
          headline: student.bio,
        }}
        onSuccess={() => setShowRecommendModal(false)}
      />
    </div>
  );
}
