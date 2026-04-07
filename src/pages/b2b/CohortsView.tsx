/**
 * CohortsView - Gestion des cohortes (promotions d'étudiants)
 *
 * Permet aux admins d'école de créer, modifier et gérer les cohortes.
 */

import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Users,
  Eye,
  Plus,
  Search,
  Calendar,
  MoreVertical,
  Edit,
  Archive,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";
// Layout est appliqué par App.tsx - ne pas l'utiliser ici
import { useGameStore } from "../../store/gameStore";
import { api } from "../../services/api";

interface Cohort {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  graduation_year?: string;
  study_level?: string;
  program_name?: string;
  student_count: number;
  completion_rate: number;
  visible_students: number;
  is_active: boolean;
  is_archived: boolean;
}

interface NewCohortForm {
  name: string;
  description: string;
  study_level: string;
  program_name: string;
  graduation_year: string;
  start_date: string;
  end_date: string;
}

export default function CohortsView() {
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Cohort | null>(null);
  const [showImportModal, setShowImportModal] = useState<Cohort | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    added: number;
    skipped: number;
    errors: { email: string; error: string }[];
  } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { setView, setStudentProfilesPreselectedCohort } = useGameStore();

  const [newCohort, setNewCohort] = useState<NewCohortForm>({
    name: "",
    description: "",
    study_level: "",
    program_name: "",
    graduation_year: new Date().getFullYear().toString(),
    start_date: "",
    end_date: "",
  });

  const [editForm, setEditForm] = useState<NewCohortForm>({
    name: "",
    description: "",
    study_level: "",
    program_name: "",
    graduation_year: "",
    start_date: "",
    end_date: "",
  });

  const orgId = localStorage.getItem("current_org_id");

  useEffect(() => {
    if (showEditModal) {
      setEditForm({
        name: showEditModal.name,
        description: showEditModal.description || "",
        study_level: showEditModal.study_level || "",
        program_name: showEditModal.program_name || "",
        graduation_year: showEditModal.graduation_year || "",
        start_date: showEditModal.start_date
          ? showEditModal.start_date.slice(0, 10)
          : "",
        end_date: showEditModal.end_date
          ? showEditModal.end_date.slice(0, 10)
          : "",
      });
    }
  }, [showEditModal]);

  useEffect(() => {
    fetchCohorts();
  }, [orgId, showArchived]);

  const fetchCohorts = async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/organizations/${orgId}/cohorts`, {
        params: { is_archived: showArchived },
      });
      setCohorts(res.data.items || []);
    } catch (err: any) {
      console.error("Erreur chargement cohortes:", err);
      setError(err.response?.data?.detail || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newCohort.name.trim()) return;

    try {
      setCreating(true);
      setError(null);

      await api.post(`/api/organizations/${orgId}/cohorts`, {
        name: newCohort.name,
        description: newCohort.description || null,
        study_level: newCohort.study_level || null,
        program_name: newCohort.program_name || null,
        graduation_year: newCohort.graduation_year || null,
        start_date: newCohort.start_date || null,
        end_date: newCohort.end_date || null,
      });

      setSuccess("Cohorte créée avec succès !");
      setShowCreateModal(false);
      setNewCohort({
        name: "",
        description: "",
        study_level: "",
        program_name: "",
        graduation_year: new Date().getFullYear().toString(),
        start_date: "",
        end_date: "",
      });
      fetchCohorts();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Erreur création cohorte:", err);
      setError(err.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleArchiveCohort = async (cohortId: string) => {
    if (!confirm("Voulez-vous vraiment archiver cette cohorte ?")) return;

    try {
      await api.delete(`/api/organizations/${orgId}/cohorts/${cohortId}`);
      setSuccess("Cohorte archivée");
      fetchCohorts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'archivage");
    }
  };

  const handleViewStudents = (cohort: Cohort) => {
    setStudentProfilesPreselectedCohort(cohort.name);
    setView("student_profiles");
  };

  const handleEditCohort = (cohort: Cohort) => {
    setShowEditModal(cohort);
  };

  const handleAddStudents = (cohort: Cohort) => {
    setShowImportModal(cohort);
    setImportResult(null);
    setSelectedFileName(null);
  };

  const handleUpdateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !showEditModal) return;

    try {
      setCreating(true);
      setError(null);
      await api.put(`/api/organizations/${orgId}/cohorts/${showEditModal.id}`, {
        name: editForm.name,
        description: editForm.description || null,
        study_level: editForm.study_level || null,
        program_name: editForm.program_name || null,
        graduation_year: editForm.graduation_year || null,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
      });
      setSuccess("Cohorte mise à jour");
      setShowEditModal(null);
      fetchCohorts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la mise à jour");
    } finally {
      setCreating(false);
    }
  };

  const handleImportStudents = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector<HTMLInputElement>(
      'input[type="file"]',
    );
    const file = input?.files?.[0];
    if (!file || !orgId || !showImportModal) return;

    try {
      setImporting(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(
        `/api/organizations/${orgId}/cohorts/${showImportModal.id}/import-students`,
        formData,
      );
      setImportResult(res.data);
      setSuccess(`${res.data.created + res.data.added} étudiant(s) ajouté(s)`);
      fetchCohorts();
      if (res.data.errors?.length === 0) {
        setSelectedFileName(null);
        setShowImportModal(null);
      }
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const filteredCohorts = cohorts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.program_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              Cohortes
            </h1>
            <p className="text-gray-400 mt-1">
              Gérez vos promotions et groupes d'étudiants
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="w-5 h-5" />
            Nouvelle cohorte
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une cohorte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-750">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-300 text-sm">Afficher les archives</span>
          </label>
        </div>

        {/* Cohorts Grid */}
        {filteredCohorts.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-xl">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? "Aucun résultat" : "Aucune cohorte"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Aucune cohorte ne correspond à votre recherche"
                : "Créez votre première cohorte pour commencer"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
              >
                <Plus className="w-5 h-5" />
                Créer une cohorte
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onViewStudents={() => handleViewStudents(cohort)}
                onEdit={() => handleEditCohort(cohort)}
                onAddStudents={() => handleAddStudents(cohort)}
                onArchive={() => handleArchiveCohort(cohort.id)}
              />
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Nouvelle cohorte
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateCohort} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de la cohorte *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M2 BDML 2026"
                    value={newCohort.name}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Description de la cohorte..."
                    value={newCohort.description}
                    onChange={(e) =>
                      setNewCohort({
                        ...newCohort,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Niveau d'études
                    </label>
                    <select
                      value={newCohort.study_level}
                      onChange={(e) =>
                        setNewCohort({
                          ...newCohort,
                          study_level: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                      <option value="M1">M1</option>
                      <option value="M2">M2</option>
                      <option value="Bootcamp">Bootcamp</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Année de diplôme
                    </label>
                    <input
                      type="text"
                      placeholder="2026"
                      value={newCohort.graduation_year}
                      onChange={(e) =>
                        setNewCohort({
                          ...newCohort,
                          graduation_year: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Programme / Spécialisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Big Data & Machine Learning"
                    value={newCohort.program_name}
                    onChange={(e) =>
                      setNewCohort({
                        ...newCohort,
                        program_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={newCohort.start_date}
                      onChange={(e) =>
                        setNewCohort({
                          ...newCohort,
                          start_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={newCohort.end_date}
                      onChange={(e) =>
                        setNewCohort({ ...newCohort, end_date: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newCohort.name.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Création..." : "Créer la cohorte"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Modifier la cohorte
                  </h2>
                  <button
                    onClick={() => setShowEditModal(null)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateCohort} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de la cohorte *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Niveau d'études
                    </label>
                    <select
                      value={editForm.study_level}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          study_level: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                      <option value="M1">M1</option>
                      <option value="M2">M2</option>
                      <option value="Bootcamp">Bootcamp</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Année de diplôme
                    </label>
                    <input
                      type="text"
                      placeholder="2026"
                      value={editForm.graduation_year}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          graduation_year: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Programme / Spécialisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Big Data & Machine Learning"
                    value={editForm.program_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, program_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !editForm.name.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Students Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-blue-400" />
                    Ajouter des étudiants à {showImportModal.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowImportModal(null);
                      setImportResult(null);
                      setSelectedFileName(null);
                    }}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-400 text-sm mb-4">
                  Importez un fichier CSV avec les colonnes :{" "}
                  <strong className="text-gray-300">nom</strong>,{" "}
                  <strong className="text-gray-300">prénom</strong>,{" "}
                  <strong className="text-gray-300">email</strong> (séparateur ;
                  ou ,).
                </p>
                <p className="text-gray-500 text-xs mb-6">
                  Les comptes seront créés automatiquement et chaque étudiant
                  recevra un email pour définir son mot de passe et se
                  connecter.
                </p>

                <form onSubmit={handleImportStudents} className="space-y-4">
                  <label
                    className={`flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
                      selectedFileName
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-gray-700 hover:border-blue-500/50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const f = e.dataTransfer.files?.[0];
                      if (
                        f &&
                        (f.name.endsWith(".csv") || f.name.endsWith(".txt"))
                      ) {
                        const dt = new DataTransfer();
                        dt.items.add(f);
                        importFileInputRef.current!.files = dt.files;
                        setSelectedFileName(f.name);
                      }
                    }}
                  >
                    <FileSpreadsheet
                      className={`w-8 h-8 ${selectedFileName ? "text-green-500" : "text-gray-500"}`}
                    />
                    <div className="text-center">
                      {selectedFileName ? (
                        <p className="text-green-400 font-medium">
                          {selectedFileName}
                        </p>
                      ) : (
                        <>
                          <p className="text-gray-300 font-medium">
                            Cliquez ou glissez un fichier CSV
                          </p>
                          <p className="text-gray-500 text-sm">
                            nom;prénom;email
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={importFileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      required
                      className="hidden"
                      onChange={(e) =>
                        setSelectedFileName(e.target.files?.[0]?.name ?? null)
                      }
                    />
                  </label>

                  {importResult && (
                    <div className="p-4 bg-gray-800/50 rounded-xl space-y-2">
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">
                          {importResult.created} créé(s)
                        </span>
                        <span className="text-blue-400">
                          {importResult.added} ajouté(s)
                        </span>
                        <span className="text-gray-400">
                          {importResult.skipped} ignoré(s)
                        </span>
                      </div>
                      {importResult.errors?.length > 0 && (
                        <div className="text-red-400 text-sm">
                          {importResult.errors.map(
                            (
                              e: { email: string; error: string },
                              i: number,
                            ) => (
                              <div key={i}>
                                {e.email}: {e.error}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(null);
                        setImportResult(null);
                        setSelectedFileName(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition"
                    >
                      Fermer
                    </button>
                    <button
                      type="submit"
                      disabled={importing}
                      className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importing ? "Import en cours..." : "Importer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CohortCard({
  cohort,
  onViewStudents,
  onEdit,
  onAddStudents,
  onArchive,
}: {
  cohort: Cohort;
  onViewStudents: () => void;
  onEdit: () => void;
  onAddStudents: () => void;
  onArchive: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`bg-gray-900/50 border rounded-xl p-6 ${cohort.is_archived ? "border-gray-700 opacity-60" : "border-gray-800"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-white">{cohort.name}</span>
            {cohort.is_archived && (
              <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded">
                Archivé
              </span>
            )}
            {cohort.study_level && (
              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                {cohort.study_level}
              </span>
            )}
          </div>

          {cohort.program_name && (
            <p className="text-gray-400 text-sm mb-3">{cohort.program_name}</p>
          )}

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-300">
                <span className="font-medium">{cohort.student_count}</span>{" "}
                étudiant{cohort.student_count > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-gray-300">
                <span className="font-medium text-green-400">
                  {cohort.visible_students}
                </span>{" "}
                visibles
              </span>
            </div>

            {cohort.graduation_year && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">
                  Promo {cohort.graduation_year}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${cohort.completion_rate}%` }}
                />
              </div>
              <span className="text-gray-400 text-sm">
                {Math.round(cohort.completion_rate)}%
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onViewStudents();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition w-full text-left"
                >
                  <ChevronRight className="w-4 h-4" />
                  Voir les étudiants
                </button>
                {!cohort.is_archived && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onAddStudents();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition w-full text-left"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter des étudiants
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 transition w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                {!cohort.is_archived && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onArchive();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition w-full text-left"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
