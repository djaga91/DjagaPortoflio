/**
 * AdminUsersView - Liste de tous les utilisateurs de la plateforme.
 *
 * Accessible uniquement aux superusers. Permet de trier par date d'inscription
 * (croissant/décroissant), rechercher et filtrer par tier.
 * Cliquer sur un utilisateur ouvre un popup avec toutes ses informations.
 */

import { useEffect, useState, useCallback } from "react";
import { useGameStore } from "../store/gameStore";
import {
  Users,
  Search,
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Crown,
  ExternalLink,
  Loader2,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Linkedin,
  Github,
  Calendar,
  FileText,
  Award,
  Languages,
  Star,
} from "lucide-react";
import { adminAPI, AdminUser, api } from "../services/api";
import { FlaskConical } from "lucide-react";

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: {
    label: "Free",
    color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  },
  pro: {
    label: "Pro",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  enterprise: {
    label: "Enterprise",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
};

const LEVEL_TITLES = [
  "Débutant",
  "Junior",
  "Intermédiaire",
  "Principal",
  "Senior",
  "Distingué",
  "Expert",
  "Maître",
  "Élite",
  "Légende",
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Types pour le profil détaillé (retour de /api/profiles/b2b/students/{user_id})
interface UserFullProfile {
  user: {
    id: string;
    full_name: string;
    username: string;
    email: string | null;
  };
  profile: {
    bio: string | null;
    location: string | null;
    phone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    profile_picture_url: string | null;
    skills: string[] | null;
  };
  skills: Array<{
    id: string;
    name: string;
    category: string | null;
    level: string | null;
  }>;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    technologies: string[] | null;
  }>;
  educations: Array<{
    id: string;
    degree: string;
    school: string;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    url_demo: string | null;
    url_github: string | null;
    technologies: string[] | null;
  }>;
  languages: Array<{ id: string; name: string; level: string }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date_obtained: string | null;
    url: string | null;
  }>;
  interests?: Array<{ id: string; name: string }>;
}

export function AdminUsersView() {
  const { setView } = useGameStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [excludeTest, setExcludeTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getUsers({
        page,
        per_page: perPage,
        sort_order: sortOrder,
        search: searchQuery || undefined,
        tier: tierFilter || undefined,
        exclude_test: excludeTest || undefined,
      });
      setUsers(response.items);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortOrder, searchQuery, tierFilter, excludeTest]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  const handleTierChange = (value: string) => {
    setTierFilter(value);
    setPage(1);
  };

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView("admin")}
          className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <Users className="w-7 h-7 text-orange-500" />
            Tous les utilisateurs
          </h1>
          <p className="text-theme-text-secondary">
            {total} utilisateur{total > 1 ? "s" : ""} inscrits sur la plateforme
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => handleTierChange(e.target.value)}
          className="px-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <option value="">Tous les tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <button
          onClick={() => {
            setExcludeTest(!excludeTest);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition ${
            excludeTest
              ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
              : "bg-theme-card border-theme-card-border text-theme-text-secondary hover:border-orange-500/50"
          }`}
          title="Exclure les comptes de test des résultats"
        >
          <FlaskConical className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">
            {excludeTest ? "Tests exclus" : "Inclure tests"}
          </span>
        </button>
        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-2 px-4 py-3 bg-theme-card border border-theme-card-border rounded-xl text-theme-text-primary hover:border-orange-500/50 transition"
        >
          {sortOrder === "desc" ? (
            <ArrowDown className="w-4 h-4 text-orange-500" />
          ) : (
            <ArrowUp className="w-4 h-4 text-orange-500" />
          )}
          <span className="text-sm font-medium">
            {sortOrder === "desc" ? "Plus récents" : "Plus anciens"}
          </span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-theme-text-primary mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-theme-text-secondary">
            {searchQuery || tierFilter
              ? "Essayez de modifier vos filtres"
              : "Aucun utilisateur inscrit pour le moment"}
          </p>
        </div>
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden lg:block bg-theme-card border border-theme-card-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-card-border bg-theme-bg-secondary">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Gamification
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Jours co.
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      <button
                        onClick={toggleSortOrder}
                        className="flex items-center gap-1 hover:text-orange-500 transition"
                      >
                        Inscription
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider">
                      Dernière connexion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-card-border">
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onClick={() => setSelectedUser(user)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartes mobile */}
          <div className="lg:hidden space-y-3">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-theme-text-muted">
                Page {page} sur {totalPages} — {total} résultat
                {total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-theme-card border border-theme-card-border rounded-lg hover:border-orange-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-theme-text-secondary" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          pageNum === page
                            ? "bg-orange-500 text-white"
                            : "bg-theme-card border border-theme-card-border text-theme-text-secondary hover:border-orange-500/50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-2 bg-theme-card border border-theme-card-border rounded-lg hover:border-orange-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-theme-text-secondary" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal profil détaillé */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// ==================== USER ROW (desktop) ====================

function UserRow({ user, onClick }: { user: AdminUser; onClick: () => void }) {
  const levelTitle =
    LEVEL_TITLES[Math.min(user.level - 1, LEVEL_TITLES.length - 1)] ||
    "Débutant";
  const tierInfo = TIER_LABELS[user.tier] || TIER_LABELS.free;

  return (
    <tr
      className="hover:bg-theme-bg-secondary/50 transition cursor-pointer"
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user.first_name?.[0] || user.username?.[0] || "?").toUpperCase()}
            {(user.last_name?.[0] || "").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-theme-text-primary truncate flex items-center gap-1.5">
              {user.full_name || user.username}
              {user.is_superuser && (
                <span title="Admin">
                  <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
                </span>
              )}
              {user.is_test_account && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-[10px] font-semibold shrink-0">
                  <FlaskConical className="w-3 h-3" />
                  TEST
                </span>
              )}
            </p>
            <p className="text-xs text-theme-text-muted truncate">
              @{user.username}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-theme-text-secondary truncate block max-w-[200px]">
          {user.email}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        {user.email_verified ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Vérifié
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Non vérifié
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tierInfo.color}`}
        >
          {user.tier === "pro" && <Crown className="w-3 h-3" />}
          {tierInfo.label}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-3 text-xs">
          <span
            className="flex items-center gap-1 text-theme-text-secondary"
            title="Points"
          >
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            {user.xp}
          </span>
          <span
            className="text-theme-text-muted"
            title={`Niveau: ${levelTitle}`}
          >
            Nv.{user.level}
          </span>
          {user.streak > 0 && (
            <span
              className="flex items-center gap-0.5 text-orange-500"
              title="Série en cours"
            >
              <Flame className="w-3.5 h-3.5" />
              {user.streak}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-sm font-medium text-theme-text-secondary">
          {user.login_days_count || 0}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-theme-text-secondary whitespace-nowrap">
          {formatDate(user.created_at)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-theme-text-muted whitespace-nowrap">
          {formatDateTime(user.last_login)}
        </span>
      </td>
    </tr>
  );
}

// ==================== USER CARD (mobile) ====================

function UserCard({ user, onClick }: { user: AdminUser; onClick: () => void }) {
  const levelTitle =
    LEVEL_TITLES[Math.min(user.level - 1, LEVEL_TITLES.length - 1)] ||
    "Débutant";
  const tierInfo = TIER_LABELS[user.tier] || TIER_LABELS.free;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-theme-card border border-theme-card-border rounded-xl p-4 hover:border-orange-500/50 transition"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {(user.first_name?.[0] || user.username?.[0] || "?").toUpperCase()}
          {(user.last_name?.[0] || "").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-theme-text-primary truncate">
              {user.full_name || user.username}
            </p>
            {user.is_superuser && (
              <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            )}
            {user.is_test_account && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-[10px] font-semibold shrink-0">
                <FlaskConical className="w-3 h-3" />
                TEST
              </span>
            )}
          </div>
          <p className="text-xs text-theme-text-muted truncate">{user.email}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tierInfo.color}`}
        >
          {tierInfo.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-theme-card-border text-xs">
        <span className="text-theme-text-muted">
          Inscrit le {formatDate(user.created_at)}
        </span>
        <span className="flex items-center gap-1 text-theme-text-secondary">
          <Zap className="w-3 h-3 text-orange-500" />
          {user.xp} pts — {levelTitle}
        </span>
        {user.streak > 0 && (
          <span className="flex items-center gap-0.5 text-orange-500">
            <Flame className="w-3 h-3" />
            {user.streak}j
          </span>
        )}
        {user.login_days_count > 0 && (
          <span className="text-theme-text-muted">
            {user.login_days_count}j connecté
          </span>
        )}
        {user.email_verified ? (
          <span title="Email vérifié">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          </span>
        ) : (
          <span title="Email non vérifié">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          </span>
        )}
      </div>
    </button>
  );
}

// ==================== USER DETAIL MODAL ====================

function UserDetailModal({
  user: initialUser,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [user, setUser] = useState<AdminUser>(initialUser);
  const [profile, setProfile] = useState<UserFullProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [togglingTest, setTogglingTest] = useState(false);
  const [addons, setAddons] = useState<
    Array<{
      id: string;
      addon_type: string;
      display_name: string;
      granted_by: string;
      is_active: boolean;
      purchased_at: string | null;
      expires_at: string | null;
    }>
  >([]);
  const [togglingAddon, setTogglingAddon] = useState<string | null>(null);

  const levelTitle =
    LEVEL_TITLES[Math.min(user.level - 1, LEVEL_TITLES.length - 1)] ||
    "Débutant";
  const tierInfo = TIER_LABELS[user.tier] || TIER_LABELS.free;

  const handleToggleTest = async () => {
    setTogglingTest(true);
    try {
      const result = await adminAPI.toggleTestAccount(user.id);
      setUser((prev) => ({ ...prev, is_test_account: result.is_test_account }));
    } catch (err) {
      console.error("Erreur toggle test account:", err);
    } finally {
      setTogglingTest(false);
    }
  };

  const handleToggleAddon = async (
    addonType: string,
    currentlyActive: boolean,
  ) => {
    setTogglingAddon(addonType);
    try {
      if (currentlyActive) {
        await adminAPI.revokeAddon(user.id, addonType);
      } else {
        await adminAPI.grantAddon(user.id, addonType);
      }
      const data = await adminAPI.getUserAddons(user.id);
      setAddons(data.addons || []);
    } catch (err) {
      console.error("Erreur toggle addon:", err);
    } finally {
      setTogglingAddon(null);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const response = await api.get(`/api/profiles/b2b/students/${user.id}`);
        setProfile(response.data);
      } catch (err) {
        console.error("Erreur chargement profil détaillé:", err);
        setProfileError("Profil non disponible pour cet utilisateur.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();

    adminAPI
      .getUserAddons(user.id)
      .then((data) => {
        setAddons(data.addons || []);
      })
      .catch(() => {});
  }, [user.id]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-theme-card border border-theme-card-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-theme-card border-b border-theme-card-border p-6 flex items-start justify-between z-10">
          <div className="flex items-center gap-4">
            {profile?.profile?.profile_picture_url ? (
              <img
                src={profile.profile.profile_picture_url}
                alt={user.full_name || user.username}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl">
                {(
                  user.first_name?.[0] ||
                  user.username?.[0] ||
                  "?"
                ).toUpperCase()}
                {(user.last_name?.[0] || "").toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-theme-text-primary flex items-center gap-2">
                {user.full_name || user.username}
                {user.is_superuser && (
                  <ShieldCheck className="w-5 h-5 text-orange-500" />
                )}
              </h2>
              <p className="text-theme-text-secondary text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tierInfo.color}`}
                >
                  {user.tier === "pro" && <Crown className="w-3 h-3" />}
                  {tierInfo.label}
                </span>
                {user.email_verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                    <XCircle className="w-3 h-3" />
                    Non vérifié
                  </span>
                )}
                {user.is_test_account && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                    <FlaskConical className="w-3 h-3" />
                    Compte test
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
          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-lg font-bold">{user.xp}</span>
              </div>
              <p className="text-xs text-theme-text-muted">Points</p>
            </div>
            <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-indigo-500 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-lg font-bold">Nv.{user.level}</span>
              </div>
              <p className="text-xs text-theme-text-muted">{levelTitle}</p>
            </div>
            <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-lg font-bold">{user.streak}</span>
              </div>
              <p className="text-xs text-theme-text-muted">Série (jours)</p>
            </div>
            <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-theme-text-secondary mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {formatDate(user.created_at)}
                </span>
              </div>
              <p className="text-xs text-theme-text-muted">Inscription</p>
            </div>
          </div>

          {/* Infos comptes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-theme-bg-secondary rounded-xl p-4">
              <p className="text-xs text-theme-text-muted mb-1">Username</p>
              <p className="font-medium text-theme-text-primary">
                @{user.username}
              </p>
            </div>
            <div className="bg-theme-bg-secondary rounded-xl p-4">
              <p className="text-xs text-theme-text-muted mb-1">
                Dernière connexion
              </p>
              <p className="font-medium text-theme-text-primary text-sm">
                {formatDateTime(user.last_login)}
              </p>
            </div>
          </div>

          {/* Chargement profil détaillé */}
          {loadingProfile ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <span className="ml-2 text-theme-text-muted text-sm">
                Chargement du profil...
              </span>
            </div>
          ) : profileError ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-sm text-orange-700 dark:text-orange-300">
              {profileError}
            </div>
          ) : (
            profile && (
              <>
                {/* Bio */}
                {profile.profile?.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-secondary mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />À propos
                    </h3>
                    <p className="text-theme-text-primary text-sm leading-relaxed">
                      {profile.profile.bio}
                    </p>
                  </div>
                )}

                {/* Localisation + liens */}
                {(profile.profile?.location ||
                  profile.profile?.linkedin_url ||
                  profile.profile?.github_url ||
                  profile.profile?.portfolio_url) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {profile.profile.location && (
                      <span className="flex items-center gap-1.5 text-sm text-theme-text-secondary">
                        <MapPin className="w-4 h-4 text-red-400" />
                        {profile.profile.location}
                      </span>
                    )}
                    {profile.profile.linkedin_url && (
                      <a
                        href={profile.profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5]/10 text-[#0077b5] rounded-lg text-sm hover:bg-[#0077b5]/20 transition"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </a>
                    )}
                    {profile.profile.github_url && (
                      <a
                        href={profile.profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-bg-secondary text-theme-text-primary rounded-lg text-sm hover:bg-theme-bg-tertiary transition"
                      >
                        <Github className="w-3.5 h-3.5" />
                        GitHub
                      </a>
                    )}
                    {profile.profile.portfolio_url && (
                      <a
                        href={profile.profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-lg text-sm hover:bg-orange-500/20 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Portfolio
                      </a>
                    )}
                  </div>
                )}

                {/* Compétences */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Compétences ({profile.skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1.5 bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-lg text-sm font-medium"
                        >
                          {skill.name}
                          {skill.level && (
                            <span className="ml-1 text-xs opacity-60">
                              · {skill.level}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expériences */}
                {profile.experiences && profile.experiences.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Expériences ({profile.experiences.length})
                    </h3>
                    <div className="space-y-3">
                      {profile.experiences.map((exp) => (
                        <div
                          key={exp.id}
                          className="bg-theme-bg-secondary rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-theme-text-primary">
                                {exp.title}
                              </p>
                              <p className="text-sm text-theme-text-secondary">
                                {exp.company}
                              </p>
                            </div>
                            <span className="text-xs text-theme-text-muted whitespace-nowrap ml-2">
                              {formatDate(exp.start_date)} —{" "}
                              {exp.is_current
                                ? "Présent"
                                : formatDate(exp.end_date)}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-theme-text-secondary mt-2 line-clamp-3">
                              {exp.description}
                            </p>
                          )}
                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {exp.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formations */}
                {profile.educations && profile.educations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Formations ({profile.educations.length})
                    </h3>
                    <div className="space-y-3">
                      {profile.educations.map((edu) => (
                        <div
                          key={edu.id}
                          className="bg-theme-bg-secondary rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-theme-text-primary">
                                {edu.degree}
                              </p>
                              <p className="text-sm text-theme-text-secondary">
                                {edu.school}
                              </p>
                              {edu.field_of_study && (
                                <p className="text-xs text-theme-text-muted">
                                  {edu.field_of_study}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-theme-text-muted whitespace-nowrap ml-2">
                              {formatDate(edu.start_date)} —{" "}
                              {edu.is_current
                                ? "Présent"
                                : formatDate(edu.end_date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projets */}
                {profile.projects && profile.projects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Projets ({profile.projects.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-theme-bg-secondary rounded-xl p-4"
                        >
                          <p className="font-medium text-theme-text-primary">
                            {proj.name}
                          </p>
                          {proj.description && (
                            <p className="text-sm text-theme-text-secondary mt-1 line-clamp-2">
                              {proj.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {proj.url_demo && (
                              <a
                                href={proj.url_demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Démo
                              </a>
                            )}
                            {proj.url_github && (
                              <a
                                href={proj.url_github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-theme-text-secondary hover:underline flex items-center gap-1"
                              >
                                <Github className="w-3 h-3" /> Code
                              </a>
                            )}
                          </div>
                          {proj.technologies &&
                            proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {proj.technologies.map((tech) => (
                                  <span
                                    key={tech}
                                    className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded text-[10px]"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {profile.languages && profile.languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Langues ({profile.languages.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang) => (
                        <span
                          key={lang.id}
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-lg text-sm"
                        >
                          {lang.name}{" "}
                          <span className="opacity-60">· {lang.level}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profile.certifications &&
                  profile.certifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Certifications ({profile.certifications.length})
                      </h3>
                      <div className="space-y-2">
                        {profile.certifications.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between bg-theme-bg-secondary rounded-xl p-3"
                          >
                            <div>
                              <p className="font-medium text-theme-text-primary text-sm">
                                {cert.name}
                              </p>
                              <p className="text-xs text-theme-text-muted">
                                {cert.issuer}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {cert.date_obtained && (
                                <span className="text-xs text-theme-text-muted">
                                  {formatDate(cert.date_obtained)}
                                </span>
                              )}
                              {cert.url && (
                                <a
                                  href={cert.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-theme-bg-tertiary rounded transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )
          )}

          {/* Tag compte test */}
          <div className="pt-4 border-t border-theme-card-border">
            <div className="flex items-center justify-between bg-theme-bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FlaskConical
                  className={`w-5 h-5 ${user.is_test_account ? "text-purple-500" : "text-theme-text-muted"}`}
                />
                <div>
                  <p className="text-sm font-medium text-theme-text-primary">
                    Compte de test
                  </p>
                  <p className="text-xs text-theme-text-muted">
                    {user.is_test_account
                      ? "Ce compte est exclu des statistiques réelles"
                      : "Marquer ce compte pour l'exclure des stats"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleTest}
                disabled={togglingTest}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user.is_test_account
                    ? "bg-purple-500"
                    : "bg-gray-300 dark:bg-gray-600"
                } ${togglingTest ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.is_test_account ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Add-ons */}
          <div className="pt-4 border-t border-theme-card-border">
            <h3 className="text-sm font-semibold text-theme-text-secondary mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Add-ons Premium
            </h3>
            {(() => {
              const bookAddon = addons.find(
                (a) => a.addon_type === "book_extra_pages",
              );
              const isActive = bookAddon?.is_active ?? false;
              const isToggling = togglingAddon === "book_extra_pages";
              return (
                <div className="flex items-center justify-between bg-theme-bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                      <p className="text-sm font-medium text-theme-text-primary">
                        Book Portfolio (100 pages)
                      </p>
                      <p className="text-xs text-theme-text-muted">
                        {isActive
                          ? `Actif — ${bookAddon?.granted_by === "admin" ? "Accordé par admin" : "Abonnement Stripe"}${bookAddon?.expires_at ? ` · Expire le ${formatDate(bookAddon.expires_at)}` : ""}`
                          : "Limité à 20 pages (gratuit)"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleAddon("book_extra_pages", isActive)
                    }
                    disabled={isToggling}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
                    } ${isToggling ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${user.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-theme-bg-secondary text-theme-text-primary rounded-xl hover:bg-theme-bg-tertiary transition font-medium"
            >
              <Mail className="w-4 h-4" />
              Envoyer un email
            </a>
            {user.username && (
              <a
                href={`/u/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Voir le portfolio
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsersView;
