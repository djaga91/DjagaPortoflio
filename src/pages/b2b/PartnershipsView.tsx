/**
 * PartnershipsView - Gestion des partenariats école-entreprise
 *
 * Vue pour les écoles : gérer les demandes et partenariats actifs
 * Vue pour les entreprises : demander des partenariats et voir les actifs
 */

import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import {
  Building2,
  Link2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Eye,
  MessageSquare,
  Users,
  X,
  Check,
} from "lucide-react";
// Layout est appliqué par App.tsx - ne pas l'utiliser ici
import { api } from "../../services/api";

type PartnershipStatus =
  | "pending"
  | "active"
  | "rejected"
  | "expired"
  | "revoked";

interface Partnership {
  id: string;
  school_id: string;
  company_id: string;
  status: PartnershipStatus;
  request_message?: string;
  rejection_reason?: string;
  can_view_profiles: boolean;
  can_contact_students: boolean;
  can_post_jobs: boolean;
  max_contacts_per_month: number;
  contacts_this_month: number;
  remaining_contacts: number;
  created_at: string;
  approved_at?: string;
  expires_at?: string;
  // Enriched data
  school_name: string;
  school_slug: string;
  school_logo_url?: string;
  company_name: string;
  company_slug: string;
  company_logo_url?: string;
  company_industry?: string;
}

type OrgType = "school" | "company";

export default function PartnershipsView() {
  const { setView } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Partnership[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Déterminer si l'utilisateur est côté école ou entreprise
  const orgType: OrgType =
    (localStorage.getItem("current_org_type") as OrgType) || "school";
  const orgId = localStorage.getItem("current_org_id");

  useEffect(() => {
    fetchPartnerships();
  }, [orgId]);

  const fetchPartnerships = async () => {
    if (!orgId) return;

    try {
      setLoading(true);

      // Récupérer tous les partenariats
      const res = await api.get("/api/partnerships/");
      const allPartnerships = res.data.items || [];

      // Séparer les demandes en attente
      const pending = allPartnerships.filter(
        (p: Partnership) => p.status === "pending",
      );
      const others = allPartnerships.filter(
        (p: Partnership) => p.status !== "pending",
      );

      setPendingRequests(pending);
      setPartnerships(others);
    } catch (err: any) {
      console.error("Erreur chargement partenariats:", err);
      setError(err.response?.data?.detail || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnershipId: string) => {
    try {
      setProcessingId(partnershipId);
      await api.put(`/api/partnerships/${partnershipId}/approve`, {
        can_view_profiles: true,
        can_contact_students: true,
        can_post_jobs: true,
        max_contacts_per_month: 50,
      });
      setSuccess("Partenariat approuvé !");
      fetchPartnerships();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de l'approbation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (partnershipId: string) => {
    const reason = prompt("Raison du refus (optionnel) :");
    if (reason === null) return; // User cancelled

    try {
      setProcessingId(partnershipId);
      await api.put(`/api/partnerships/${partnershipId}/reject`, {
        rejection_reason: reason || null,
      });
      setSuccess("Demande refusée");
      fetchPartnerships();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors du refus");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (partnershipId: string) => {
    if (!confirm("Voulez-vous vraiment révoquer ce partenariat ?")) return;

    try {
      setProcessingId(partnershipId);
      await api.delete(`/api/partnerships/${partnershipId}`);
      setSuccess("Partenariat révoqué");
      fetchPartnerships();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la révocation");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPartnerships = partnerships.filter((p) => {
    if (filter === "active") return p.status === "active";
    if (filter === "pending") return p.status === "pending";
    return true;
  });

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
            <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-3">
              <Link2 className="w-8 h-8 text-green-500" />
              Partenariats
            </h1>
            <p className="text-theme-text-secondary mt-1">
              {orgType === "school"
                ? "Gérez les entreprises partenaires de votre école"
                : "Gérez vos partenariats avec les écoles"}
            </p>
          </div>
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

        {/* Pending Requests (for schools) */}
        {orgType === "school" && pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Demandes en attente ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((partnership) => (
                <PendingRequestCard
                  key={partnership.id}
                  partnership={partnership}
                  onApprove={() => handleApprove(partnership.id)}
                  onReject={() => handleReject(partnership.id)}
                  processing={processingId === partnership.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-theme-bg-tertiary text-theme-text-primary"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "active"
                ? "bg-green-500/20 text-green-400"
                : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            Actifs
          </button>
        </div>

        {/* Partnerships List */}
        {filteredPartnerships.length === 0 ? (
          <div className="text-center py-16 bg-theme-card border border-theme-card-border rounded-xl">
            <Link2 className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-text-primary mb-2">
              Aucun partenariat
            </h3>
            <p className="text-theme-text-secondary mb-6">
              {orgType === "school"
                ? "Les entreprises peuvent demander un partenariat avec votre école"
                : "Recherchez des écoles pour demander un partenariat"}
            </p>
            {orgType === "company" && (
              <button
                onClick={() => setView("partnerships")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
              >
                <Search className="w-5 h-5" />
                Trouver des écoles
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPartnerships.map((partnership) => (
              <PartnershipCard
                key={partnership.id}
                partnership={partnership}
                orgType={orgType}
                onRevoke={() => handleRevoke(partnership.id)}
                processing={processingId === partnership.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function PendingRequestCard({
  partnership,
  onApprove,
  onReject,
  processing,
}: {
  partnership: Partnership;
  onApprove: () => void;
  onReject: () => void;
  processing: boolean;
}) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        {partnership.company_logo_url ? (
          <img
            src={partnership.company_logo_url}
            alt={partnership.company_name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-theme-bg-secondary flex items-center justify-center">
            <Building2 className="w-8 h-8 text-theme-text-muted" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-theme-text-primary">
              {partnership.company_name}
            </h3>
            {partnership.company_industry && (
              <span className="px-2 py-0.5 text-xs bg-theme-bg-tertiary text-theme-text-secondary rounded">
                {partnership.company_industry}
              </span>
            )}
          </div>

          {partnership.request_message && (
            <p className="text-theme-text-secondary mb-3 bg-theme-bg-secondary p-3 rounded-lg italic">
              "{partnership.request_message}"
            </p>
          )}

          <p className="text-theme-text-muted text-sm">
            Demande reçue le{" "}
            {new Date(partnership.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReject}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-theme-bg-secondary text-theme-text-secondary rounded-lg hover:bg-theme-bg-tertiary transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Refuser
          </button>
          <button
            onClick={onApprove}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {processing ? "En cours..." : "Accepter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnershipCard({
  partnership,
  orgType,
  onRevoke,
  processing,
}: {
  partnership: Partnership;
  orgType: OrgType;
  onRevoke: () => void;
  processing: boolean;
}) {
  const partnerName =
    orgType === "school" ? partnership.company_name : partnership.school_name;
  const partnerLogo =
    orgType === "school"
      ? partnership.company_logo_url
      : partnership.school_logo_url;

  const statusConfig: Record<
    PartnershipStatus,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "En attente",
      color: "bg-yellow-500/20 text-yellow-400",
      icon: <Clock className="w-4 h-4" />,
    },
    active: {
      label: "Actif",
      color: "bg-green-500/20 text-green-400",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    rejected: {
      label: "Refusé",
      color: "bg-red-500/20 text-red-400",
      icon: <XCircle className="w-4 h-4" />,
    },
    expired: {
      label: "Expiré",
      color: "bg-theme-bg-tertiary text-theme-text-muted",
      icon: <Clock className="w-4 h-4" />,
    },
    revoked: {
      label: "Révoqué",
      color: "bg-red-500/20 text-red-400",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const status = statusConfig[partnership.status];

  return (
    <div className="bg-theme-card border border-theme-card-border rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {partnerLogo ? (
            <img
              src={partnerLogo}
              alt={partnerName}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-theme-bg-secondary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-theme-text-muted" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-theme-text-primary">
                {partnerName}
              </h3>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded ${status.color}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>

            {partnership.status === "active" && (
              <div className="flex items-center gap-4 text-sm text-theme-text-secondary">
                {partnership.can_view_profiles && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Voir profils
                  </span>
                )}
                {partnership.can_contact_students && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {partnership.remaining_contacts}/
                    {partnership.max_contacts_per_month} contacts
                  </span>
                )}
              </div>
            )}

            {partnership.status === "rejected" &&
              partnership.rejection_reason && (
                <p className="text-red-400 text-sm mt-1">
                  Raison : {partnership.rejection_reason}
                </p>
              )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {partnership.status === "active" && orgType === "school" && (
            <button
              onClick={() => {
                /* TODO: navigate to students view */
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
            >
              <Users className="w-4 h-4" />
              Voir les profils
            </button>
          )}

          {partnership.status === "active" && (
            <button
              onClick={onRevoke}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Révoquer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
