/**
 * Page de gestion des codes d'invitation pour les admins.
 *
 * Permet de :
 * - Voir la liste des codes existants
 * - Créer de nouveaux codes
 * - Activer/Désactiver des codes
 * - Voir les statistiques d'utilisation
 */

import { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  CheckCircle2,
  XCircle,
  Trash2,
  Users,
  Calendar,
  Hash,
  Loader2,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "../../services/api";

interface InviteCode {
  id: string;
  organization_id: string;
  code: string;
  role: string;
  cohort_id: string | null;
  cohort_name: string | null;
  description: string | null;
  max_uses: number | null;
  current_uses: number;
  remaining_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
  is_valid: boolean;
  created_at: string;
  created_by_name: string | null;
}

interface Cohort {
  id: string;
  name: string;
}

const ROLE_OPTIONS_SCHOOL = [
  { value: "student", label: "Étudiant" },
  { value: "teacher", label: "Professeur" },
  { value: "coach", label: "Coach" },
  { value: "viewer", label: "Observateur" },
];

const ROLE_OPTIONS_COMPANY = [{ value: "recruiter", label: "Recruteur" }];

const ROLE_LABELS: Record<string, string> = {
  student: "Étudiant",
  teacher: "Professeur",
  coach: "Coach",
  admin: "Admin",
  viewer: "Observateur",
  recruiter: "Recruteur",
  company_admin: "Admin",
};

export default function InviteCodesView() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    prefix: "",
    role: "student",
    cohort_id: "",
    description: "",
    max_uses: "",
    expires_at: "",
  });

  const orgId = localStorage.getItem("current_org_id");
  const orgType = localStorage.getItem("current_org_type");
  const isSchool = orgType === "school";

  useEffect(() => {
    if (orgId) {
      loadCodes();
      if (isSchool) {
        loadCohorts();
      }
    }
  }, [orgId, showInactive]);

  const loadCodes = async () => {
    if (!orgId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/api/invite-codes/organization/${orgId}`,
        {
          params: { include_inactive: showInactive },
        },
      );
      setCodes(response.data.codes);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail || "Erreur lors du chargement des codes",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCohorts = async () => {
    if (!orgId) return;

    try {
      const response = await api.get(`/api/organizations/${orgId}/cohorts`);
      setCohorts(response.data.cohorts || []);
    } catch {
      // Ignorer les erreurs de chargement des cohortes
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    setIsCreating(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        role: formData.role,
        description: formData.description || null,
      };

      if (formData.code) {
        payload.code = formData.code.toUpperCase();
      } else if (formData.prefix) {
        payload.prefix = formData.prefix.toUpperCase() + "-";
      }

      if (formData.cohort_id) {
        payload.cohort_id = formData.cohort_id;
      }

      if (formData.max_uses) {
        payload.max_uses = parseInt(formData.max_uses);
      }

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString();
      }

      await api.post(`/api/invite-codes/organization/${orgId}`, payload);

      // Reset form
      setFormData({
        code: "",
        prefix: "",
        role: "student",
        cohort_id: "",
        description: "",
        max_uses: "",
        expires_at: "",
      });
      setShowCreateForm(false);

      // Reload codes
      loadCodes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail || "Erreur lors de la création du code",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (codeId: string, currentActive: boolean) => {
    try {
      await api.put(`/api/invite-codes/${codeId}`, {
        is_active: !currentActive,
      });
      loadCodes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail || "Erreur lors de la modification",
      );
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver ce code ?")) return;

    try {
      await api.delete(`/api/invite-codes/${codeId}`);
      loadCodes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback pour les navigateurs sans API clipboard
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const roleOptions = isSchool ? ROLE_OPTIONS_SCHOOL : ROLE_OPTIONS_COMPANY;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-3">
            <Hash className="w-7 h-7 text-indigo-500" />
            Codes d'invitation
          </h1>
          <p className="text-theme-text-secondary mt-1">
            Créez et gérez les codes pour inviter des membres
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showInactive
                ? "bg-theme-bg-secondary border-theme-border text-theme-text-primary"
                : "border-theme-border text-theme-text-muted hover:text-theme-text-primary"
            }`}
          >
            {showInactive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span className="text-sm">Inactifs</span>
          </button>

          <button
            onClick={loadCodes}
            className="p-2 rounded-lg border border-theme-border hover:bg-theme-bg-secondary transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-theme-text-muted" />
          </button>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#E07230] text-white font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau code
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-xl w-full max-w-lg">
            <div className="p-6 border-b border-theme-border">
              <h2 className="text-xl font-bold text-theme-text-primary">
                Créer un code d'invitation
              </h2>
            </div>

            <form onSubmit={handleCreateCode} className="p-6 space-y-4">
              {/* Code ou Préfixe */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                    Code personnalisé
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value,
                        prefix: "",
                      })
                    }
                    placeholder="Ex: ECOLE-M2-2026"
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary placeholder-theme-text-muted focus:border-[#6366F1] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                    Ou préfixe (auto-généré)
                  </label>
                  <input
                    type="text"
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prefix: e.target.value,
                        code: "",
                      })
                    }
                    placeholder="Ex: Mon École"
                    disabled={!!formData.code}
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary placeholder-theme-text-muted focus:border-[#6366F1] outline-none font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                  Rôle attribué *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary focus:border-[#6366F1] outline-none"
                  required
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cohorte (écoles uniquement) */}
              {isSchool && cohorts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                    Cohorte (optionnel)
                  </label>
                  <select
                    value={formData.cohort_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cohort_id: e.target.value })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary focus:border-[#6366F1] outline-none"
                  >
                    <option value="">Aucune cohorte</option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Code pour le M2 BDML 2026"
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary placeholder-theme-text-muted focus:border-[#6366F1] outline-none"
                />
              </div>

              {/* Max uses et Expiration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                    Utilisations max
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) =>
                      setFormData({ ...formData, max_uses: e.target.value })
                    }
                    placeholder="Illimité"
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary placeholder-theme-text-muted focus:border-[#6366F1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-2.5 text-theme-text-primary focus:border-[#6366F1] outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-theme-border rounded-xl text-theme-text-secondary hover:bg-theme-bg-secondary transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#E07230] text-white font-bold px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Créer le code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Codes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-theme-text-muted" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 bg-theme-card rounded-2xl border border-theme-card-border">
          <Hash className="w-12 h-12 text-theme-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
            Aucun code d'invitation
          </h3>
          <p className="text-theme-text-secondary mb-6">
            Créez votre premier code pour inviter des membres
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-[#FF8C42] hover:bg-[#E07230] text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer un code
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {codes.map((code) => (
            <div
              key={code.id}
              className={`bg-theme-card rounded-xl border p-4 transition-all ${
                code.is_active && code.is_valid
                  ? "border-theme-card-border"
                  : "border-red-200 dark:border-red-800/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Code info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="font-mono text-lg font-bold text-theme-text-primary hover:text-[#FF8C42] transition-colors flex items-center gap-2"
                    >
                      {code.code}
                      {copiedCode === code.code ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 opacity-50" />
                      )}
                    </button>

                    {/* Status badges */}
                    <div className="flex gap-2">
                      {code.is_active && code.is_valid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          {!code.is_active ? "Désactivé" : "Expiré"}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-theme-bg-secondary rounded-full text-xs font-medium text-theme-text-secondary">
                        {isSchool ? (
                          <GraduationCap className="w-3 h-3" />
                        ) : (
                          <Building2 className="w-3 h-3" />
                        )}
                        {ROLE_LABELS[code.role] || code.role}
                      </span>

                      {code.cohort_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          {code.cohort_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {code.description && (
                    <p className="text-sm text-theme-text-secondary mb-2">
                      {code.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-theme-text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {code.current_uses} utilisé
                      {code.current_uses > 1 ? "s" : ""}
                      {code.max_uses && ` / ${code.max_uses}`}
                    </span>

                    {code.expires_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Expire le{" "}
                        {new Date(code.expires_at).toLocaleDateString("fr-FR")}
                      </span>
                    )}

                    {code.created_by_name && (
                      <span>Créé par {code.created_by_name}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(code.id, code.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      code.is_active
                        ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                    title={code.is_active ? "Désactiver" : "Activer"}
                  >
                    {code.is_active ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(code.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Comment ça marche ?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Partagez le code avec les personnes à inviter</li>
          <li>
            • Elles peuvent l'utiliser sur{" "}
            <span className="font-mono">portfolia.fr/join</span>
          </li>
          <li>• Elles seront automatiquement ajoutées avec le rôle défini</li>
          <li>
            • Vous pouvez limiter le nombre d'utilisations ou définir une date
            d'expiration
          </li>
        </ul>
      </div>
    </div>
  );
}
