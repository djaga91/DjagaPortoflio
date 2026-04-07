/**
 * InviteMembersView - Inviter des membres dans l'organisation
 *
 * Permet d'inviter des étudiants, staff ou recruteurs par email ou import CSV.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import {
  UserPlus,
  Mail,
  Upload,
  Users,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  Send,
  FileSpreadsheet,
} from "lucide-react";
// Layout est appliqué par App.tsx - ne pas l'utiliser ici
import { api } from "../../services/api";

type InviteRole =
  | "student"
  | "coach"
  | "teacher"
  | "admin"
  | "recruiter"
  | "company_admin";

interface InviteForm {
  emails: string;
  role: InviteRole;
  cohort_id?: string;
  message: string;
}

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
}

interface CohortOption {
  id: string;
  name: string;
}

export default function InviteMembersView() {
  const { setView } = useGameStore();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);

  const [form, setForm] = useState<InviteForm>({
    emails: "",
    role: "student",
    cohort_id: undefined,
    message: "",
  });

  const orgType = localStorage.getItem("current_org_type") || "school";
  const orgId = localStorage.getItem("current_org_id");

  useEffect(() => {
    const fetchCohorts = async () => {
      if (!orgId || orgType !== "school") return;
      try {
        const res = await api.get(`/api/organizations/${orgId}/cohorts`, {
          params: { is_archived: false },
        });
        setCohorts(
          res.data.items?.map((c: { id: string; name: string }) => ({
            id: c.id,
            name: c.name,
          })) || [],
        );
      } catch {
        setCohorts([]);
      }
    };
    fetchCohorts();
  }, [orgId, orgType]);

  const roles: {
    value: InviteRole;
    label: string;
    icon: React.ReactNode;
    forOrg: "school" | "company" | "both";
  }[] = [
    {
      value: "student",
      label: "Étudiant",
      icon: <GraduationCap className="w-5 h-5" />,
      forOrg: "school",
    },
    {
      value: "coach",
      label: "Coach carrière",
      icon: <Users className="w-5 h-5" />,
      forOrg: "school",
    },
    {
      value: "teacher",
      label: "Professeur",
      icon: <Users className="w-5 h-5" />,
      forOrg: "school",
    },
    {
      value: "admin",
      label: "Admin école",
      icon: <Users className="w-5 h-5" />,
      forOrg: "school",
    },
    {
      value: "recruiter",
      label: "Recruteur",
      icon: <Briefcase className="w-5 h-5" />,
      forOrg: "company",
    },
    {
      value: "company_admin",
      label: "Admin entreprise",
      icon: <Briefcase className="w-5 h-5" />,
      forOrg: "company",
    },
  ];

  const availableRoles = roles.filter(
    (r) => r.forOrg === orgType || r.forOrg === "both",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    const emailList = form.emails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));

    if (emailList.length === 0) {
      setError("Veuillez entrer au moins un email valide");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults([]);

      const inviteResults: InviteResult[] = [];

      // En mode bulk pour une école : toujours créer des étudiants (pas des admins)
      const roleToUse =
        mode === "bulk" && orgType === "school" ? "student" : form.role;

      for (const email of emailList) {
        try {
          await api.post(`/api/organizations/${orgId}/members/invite`, {
            email,
            role: roleToUse,
            cohort_id: form.cohort_id || null,
            message: form.message || null,
          });
          inviteResults.push({ email, success: true });
        } catch (err: any) {
          inviteResults.push({
            email,
            success: false,
            error: err.response?.data?.detail || "Erreur",
          });
        }
      }

      setResults(inviteResults);

      const successCount = inviteResults.filter((r) => r.success).length;
      if (successCount > 0) {
        setForm({ ...form, emails: "" });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read CSV file
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());

    // Extract emails (assuming first column is email)
    const emails = lines
      .slice(1) // Skip header
      .map((line) => line.split(",")[0]?.trim())
      .filter((e) => e && e.includes("@"));

    setForm({ ...form, emails: emails.join("\n") });
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() =>
            setView(
              orgType === "school" ? "school_dashboard" : "company_dashboard",
            )
          }
          className="inline-flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-orange-500" />
            Inviter des membres
          </h1>
          <p className="text-theme-text-secondary mt-1">
            Envoyez des invitations par email pour rejoindre votre organisation
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("single")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              mode === "single"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            <Mail className="w-4 h-4" />
            Par email
          </button>
          <button
            onClick={() => {
              setMode("bulk");
              if (orgType === "school")
                setForm((f) => ({ ...f, role: "student" }));
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              mode === "bulk"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mb-6 p-4 bg-theme-bg-secondary border border-theme-border rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              {successCount > 0 && (
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  {successCount} invitation{successCount > 1 ? "s" : ""} envoyée
                  {successCount > 1 ? "s" : ""}
                </span>
              )}
              {failCount > 0 && (
                <span className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {failCount} échec{failCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {failCount > 0 && (
              <div className="space-y-2">
                {results
                  .filter((r) => !r.success)
                  .map((r, i) => (
                    <div key={i} className="text-sm text-red-400">
                      {r.email}: {r.error}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-theme-card border border-theme-card-border rounded-xl p-6"
        >
          {/* CSV Upload (bulk mode) */}
          {mode === "bulk" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Fichier CSV
              </label>
              <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-theme-border rounded-xl cursor-pointer hover:border-theme-text-muted transition">
                <FileSpreadsheet className="w-8 h-8 text-theme-text-muted" />
                <div>
                  <p className="text-theme-text-primary font-medium">
                    Cliquez pour choisir un fichier
                  </p>
                  <p className="text-theme-text-muted text-sm">
                    Format: CSV avec emails en première colonne
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Emails */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              {mode === "single"
                ? "Adresses email"
                : "Emails (préchargés depuis le CSV)"}
            </label>
            <textarea
              placeholder="exemple@email.com&#10;autre@email.com"
              value={form.emails}
              onChange={(e) => setForm({ ...form, emails: e.target.value })}
              rows={mode === "bulk" ? 6 : 4}
              className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-muted focus:border-orange-500 focus:outline-none resize-none"
            />
            <p className="text-theme-text-muted text-sm mt-1">
              Séparez les emails par des virgules ou des retours à la ligne
            </p>
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Rôle
              {mode === "bulk" && orgType === "school" && (
                <span className="ml-2 text-orange-400 text-xs font-normal">
                  (Les invitations en lot créent toujours des comptes étudiants)
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableRoles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: role.value })}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                    form.role === role.value
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-theme-bg-secondary border-theme-border text-theme-text-secondary hover:border-theme-text-muted"
                  }`}
                >
                  {role.icon}
                  <span className="font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cohorte (si rôle étudiant et école) */}
          {form.role === "student" &&
            orgType === "school" &&
            cohorts.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Cohorte
                </label>
                <select
                  value={form.cohort_id || ""}
                  onChange={(e) =>
                    setForm({ ...form, cohort_id: e.target.value || undefined })
                  }
                  className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Aucune cohorte</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-theme-text-muted text-sm mt-1">
                  Optionnel : associer les étudiants invités à une cohorte
                </p>
              </div>
            )}

          {/* Message (optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Message personnalisé (optionnel)
            </label>
            <textarea
              placeholder="Ajoutez un message personnel à l'invitation..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-muted focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.emails.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {loading ? "Envoi en cours..." : "Envoyer les invitations"}
          </button>
        </form>
      </div>
    </>
  );
}
