/**
 * StudentSearchView - Recherche de profils étudiants pour les recruteurs
 *
 * Permet aux entreprises partenaires de rechercher et visualiser
 * les profils des étudiants qui ont activé leur visibilité.
 */

import { useEffect, useState } from "react";
import { Search, MapPin, GraduationCap, User, X, Tag, Eye } from "lucide-react";
// Layout est appliqué par App.tsx - ne pas l'utiliser ici
import { api } from "../../services/api";
import { useGameStore } from "../../store/gameStore";
import { TalentProfileModal } from "../../components/TalentProfileModal";

interface StudentProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  skills: string[];
  school_name?: string;
  cohort_name?: string;
  linkedin_url?: string;
  github_url?: string;
}

interface SearchResult {
  items: StudentProfile[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export default function StudentSearchView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(
    null,
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = { page, per_page: 20 };
      if (searchQuery) params.search = searchQuery;
      if (skillsFilter) params.skills = skillsFilter;
      if (cityFilter) params.city = cityFilter;

      const response = await api.get("/api/profiles/search/students", {
        params,
      });
      setResults(response.data);
    } catch (err: any) {
      console.error("Erreur recherche:", err);
      if (err.response?.status === 403) {
        setError(
          "Vous devez être membre d'une entreprise pour rechercher des profils",
        );
      } else {
        setError(err.response?.data?.detail || "Erreur lors de la recherche");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSkillsFilter("");
    setCityFilter("");
    setPage(1);
    fetchStudents();
  };

  if (loading && !results) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-orange-500" />
            Recherche de Talents
          </h1>
          <p className="text-gray-400 mt-1">
            Recherchez des profils étudiants parmi vos écoles partenaires
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setView("company_dashboard")}
              className="mt-4 text-orange-400 hover:text-orange-300"
            >
              Retour au dashboard
            </button>
          </div>
        )}

        {/* Search Form */}
        {!error && (
          <>
            <form
              onSubmit={handleSearch}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Compétences (ex: Python, React)"
                    value={skillsFilter}
                    onChange={(e) => setSkillsFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Ville..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Rechercher
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition"
                    title="Effacer les filtres"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Results */}
            {results && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400">
                    {results.total} étudiant{results.total > 1 ? "s" : ""}{" "}
                    trouvé{results.total > 1 ? "s" : ""}
                  </p>
                </div>

                {results.items.length === 0 ? (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                    <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Aucun résultat
                    </h3>
                    <p className="text-gray-400">
                      Essayez avec d'autres critères de recherche ou vérifiez
                      vos partenariats
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.items.map((student) => (
                      <StudentCard
                        key={student.user_id}
                        student={student}
                        onViewProfile={() => setSelectedStudent(student)}
                      />
                    ))}
                  </div>
                )}

                {/* Modal profil talent */}
                {selectedStudent && (
                  <TalentProfileModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                  />
                )}

                {/* Pagination */}
                {results.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: results.pages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-lg transition ${
                            p === page
                              ? "bg-orange-500 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StudentCard({
  student,
  onViewProfile,
}: {
  student: StudentProfile;
  onViewProfile: () => void;
}) {
  const displayName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : student.full_name || student.first_name || "Profil anonyme";

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition group">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
          {student.profile_picture_url ? (
            <img
              src={student.profile_picture_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <User className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">
            {displayName}
          </h3>
          {student.bio && (
            <p className="text-sm text-gray-400 truncate">{student.bio}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {student.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {student.location}
              </span>
            )}
            {student.school_name && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {student.school_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {student.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4">
          {student.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {student.skills.length > 5 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{student.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Social Links */}
      {(student.linkedin_url || student.github_url) && (
        <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
          {student.linkedin_url && (
            <a
              href={student.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition"
            >
              LinkedIn
            </a>
          )}
          {student.github_url && (
            <a
              href={student.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition"
            >
              GitHub
            </a>
          )}
        </div>
      )}

      {/* Voir le talent → ouvre le modal profil complet */}
      <button
        type="button"
        onClick={onViewProfile}
        className="flex items-center justify-center gap-2 mt-4 w-full py-2.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition font-medium"
        title="Voir le profil complet"
      >
        <Eye className="w-4 h-4" />
        <span>Voir le talent</span>
      </button>
    </div>
  );
}
