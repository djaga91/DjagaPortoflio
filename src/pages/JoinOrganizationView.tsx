/**
 * Page pour rejoindre une organisation via un code d'invitation.
 *
 * Flux:
 * 1. L'utilisateur entre un code
 * 2. Le code est vérifié (affiche l'organisation)
 * 3. L'utilisateur confirme pour rejoindre
 * 4. Redirection vers le dashboard approprié
 */

import { useState } from "react";
import {
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Users,
  ArrowLeft,
} from "lucide-react";
import { api } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface VerifiedCode {
  valid: boolean;
  organization: {
    id: string;
    name: string;
    type: "school" | "company";
    logo_url: string | null;
  };
  role: string;
  cohort_name: string | null;
  expires_at: string | null;
  remaining_uses: number | null;
}

interface JoinResult {
  success: boolean;
  message: string;
  organization_id: string;
  organization_name: string;
  organization_type: string;
  role: string;
  cohort_id: string | null;
  cohort_name: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  student: "Étudiant",
  teacher: "Professeur",
  coach: "Coach",
  admin: "Administrateur",
  viewer: "Observateur",
  recruiter: "Recruteur",
  company_admin: "Administrateur Entreprise",
};

export default function JoinOrganizationView() {
  const { setView, isAuthenticated } = useGameStore();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState<VerifiedCode | null>(null);
  const [joinResult, setJoinResult] = useState<JoinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError("Veuillez entrer un code d'invitation");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerifiedCode(null);

    try {
      const response = await api.get(
        `/api/invite-codes/verify/${code.trim().toUpperCase()}`,
      );
      setVerifiedCode(response.data);

      if (!response.data.valid) {
        setError("Ce code n'est plus valide");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Code d'invitation invalide");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Stocker le code et rediriger vers login
      localStorage.setItem("pending_invite_code", code);
      setView("login");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await api.post("/api/invite-codes/join", {
        code: code.trim().toUpperCase(),
      });
      setJoinResult(response.data);

      // Stocker les infos de l'organisation dans localStorage
      localStorage.setItem("current_org_id", response.data.organization_id);
      localStorage.setItem("current_org_type", response.data.organization_type);
      localStorage.setItem("current_org_role", response.data.role);
      localStorage.setItem("current_org_name", response.data.organization_name);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail ||
          "Erreur lors de la connexion à l'organisation",
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleGoToDashboard = () => {
    if (joinResult) {
      if (
        joinResult.organization_type === "school" &&
        joinResult.role !== "student"
      ) {
        setView("school_dashboard");
      } else if (joinResult.organization_type === "company") {
        setView("company_dashboard");
      } else {
        setView("dashboard");
      }
    }
  };

  // Si l'utilisateur vient de rejoindre avec succès
  if (joinResult) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
              Bienvenue !
            </h1>

            <p className="text-theme-text-secondary mb-6">
              Vous avez rejoint{" "}
              <span className="font-semibold text-theme-text-primary">
                {joinResult.organization_name}
              </span>
              {joinResult.cohort_name && (
                <span className="block text-sm mt-1">
                  Cohorte : {joinResult.cohort_name}
                </span>
              )}
            </p>

            <div className="bg-theme-bg-secondary rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-theme-text-primary">
                {joinResult.organization_type === "school" ? (
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                ) : (
                  <Briefcase className="w-5 h-5 text-purple-500" />
                )}
                <span className="font-medium">
                  {ROLE_LABELS[joinResult.role] || joinResult.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full bg-[#FF8C42] hover:bg-[#E07230] text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Accéder à mon espace
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setView("landing")}
            className="inline-flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
            Rejoindre une organisation
          </h1>
          <p className="text-theme-text-secondary">
            Entrez le code d'invitation fourni par votre école ou entreprise
          </p>
        </div>

        {/* Card */}
        <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-xl p-6">
          {/* Input Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Code d'invitation
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                  setVerifiedCode(null);
                }}
                placeholder="Ex: ECOLE-M2-2026"
                className="flex-1 bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary placeholder-theme-text-muted focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all font-mono text-lg tracking-wider"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
              />
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || !code.trim()}
                className="px-4 py-3 bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin text-theme-text-muted" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-theme-text-muted" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Verified Code Info */}
          {verifiedCode && verifiedCode.valid && (
            <div className="mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-start gap-4">
                  {/* Logo or Icon */}
                  <div className="w-12 h-12 bg-theme-bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    {verifiedCode.organization.logo_url ? (
                      <img
                        src={verifiedCode.organization.logo_url}
                        alt={verifiedCode.organization.name}
                        className="w-10 h-10 object-contain rounded-lg"
                      />
                    ) : verifiedCode.organization.type === "school" ? (
                      <GraduationCap className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Building2 className="w-6 h-6 text-purple-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-theme-text-primary truncate">
                      {verifiedCode.organization.name}
                    </h3>
                    <p className="text-sm text-theme-text-secondary">
                      {verifiedCode.organization.type === "school"
                        ? "École"
                        : "Entreprise"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-theme-bg-secondary rounded-lg text-xs font-medium text-theme-text-primary">
                        <Users className="w-3 h-3" />
                        {ROLE_LABELS[verifiedCode.role] || verifiedCode.role}
                      </span>
                      {verifiedCode.cohort_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                          <GraduationCap className="w-3 h-3" />
                          {verifiedCode.cohort_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full mt-4 bg-[#FF8C42] hover:bg-[#E07230] text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    Se connecter pour rejoindre
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Rejoindre {verifiedCode.organization.name}
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-theme-text-muted text-center mt-2">
                  Vous devez être connecté pour rejoindre une organisation
                </p>
              )}
            </div>
          )}

          {/* Help */}
          <div className="pt-4 border-t border-theme-border">
            <p className="text-xs text-theme-text-muted text-center">
              Vous n'avez pas de code ? Demandez-le à l'administrateur de votre
              école ou entreprise.
            </p>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-6 text-center">
          <p className="text-sm text-theme-text-muted mb-2">
            Exemples de codes :
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Exemples placeholder */}
            {["ECOLE1-M2-2026", "ENTREPRISE1-RH", "GROUPE1-2025"].map(
              (example) => (
                <button
                  key={example}
                  onClick={() => setCode(example)}
                  className="px-3 py-1.5 bg-theme-bg-secondary hover:bg-theme-bg-tertiary rounded-lg text-xs font-mono text-theme-text-secondary transition-colors"
                >
                  {example}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
