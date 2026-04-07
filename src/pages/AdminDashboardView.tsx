/**
 * AdminDashboardView - Dashboard d'administration.
 *
 * Réservé aux superusers. Affiche :
 * - Métriques globales (utilisateurs, CV générés, usage IA)
 * - Graphiques d'évolution
 * - Configuration des limites IA par tier
 * - Santé du système
 */

import React, { useEffect, useState } from "react";
import {
  Users,
  Zap,
  Mail,
  Github,
  Shield,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Crown,
  Star,
  Database,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  MessageSquare,
  Flame,
  BarChart3,
  Building2,
  Plus,
  UserPlus,
  LayoutGrid,
  Eye,
  EyeOff,
  RotateCcw,
  QrCode,
  Target,
  ArrowRight,
} from "lucide-react";
import { api, dashboardConfigAPI, DashboardCard } from "../services/api";
import { useGameStore } from "../store/gameStore";
import { UsersTimelineChart } from "../components/admin/UsersTimelineChart";
import { RecentUsersList } from "../components/admin/RecentUsersList";
import { AIUsageTimelineChart } from "../components/admin/AIUsageTimelineChart";

// ==================== Types ====================

interface OverviewStats {
  users: {
    total: number;
    real: number;
    test: number;
    verified: number;
    verified_percent: number;
    admins: number;
    active_today: number;
    active_week: number;
    active_month: number;
    new_this_week: number;
    tiers: Record<string, number>;
  };
  oauth: {
    github: number;
    github_percent: number;
    google: number;
    google_percent: number;
    linkedin: number;
    linkedin_percent: number;
  };
  content: {
    profiles: number;
    profiles_with_bio: number;
    profiles_with_bio_percent: number;
    profiles_with_photo: number;
    profiles_with_photo_percent: number;
    experiences: number;
    avg_experiences_per_user: number;
    educations: number;
    projects: number;
    skills: number;
    avg_skills_per_user: number;
    languages: number;
    certifications: number;
  };
  onboarding: {
    total_sessions: number;
    completed: number;
    completion_rate: number;
    interview_sessions: number;
  };
  ai: {
    total_requests: number;
    requests_today: number;
    total_tokens: number;
  };
  gamification: {
    total_xp: number;
    avg_xp: number;
    active_streaks: number;
    max_streak: number;
    levels: Record<string, number>;
  };
  storage: {
    used_gb: number;
    used_percent: number;
    class_a_operations: number;
    class_b_operations: number;
  };
}

interface AIUsageStat {
  feature: string;
  total_requests: number;
  unique_users: number;
  global_limit: number;
  usage_percent: number;
  is_near_limit: boolean;
}

interface AIConfig {
  id: string;
  feature: string;
  display_name: string | null;
  icon: string | null;
  free_monthly_limit: number;
  pro_monthly_limit: number;
  enterprise_monthly_limit: number;
  global_monthly_limit: number;
  min_session_allowance: number;
  is_enabled: boolean;
}

interface AIHealthStatus {
  status: string;
  rate_limit_enabled: boolean;
  api_keys: Record<string, string>;
  monthly_usage: Record<string, number>;
  alerts: Array<{ level: string; feature: string; message: string }>;
}

interface OnboardingFunnel {
  total_sessions: number;
  steps: Array<{ step: number; name: string; count: number; percent: number }>;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "school" | "company";
  is_active: boolean;
  is_verified: boolean;
  member_count?: number;
  created_at: string;
}

// ==================== Components ====================

// Carte de statistique
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: number;
  color?: string;
}> = ({ title, value, icon, subtitle, trend, color = "indigo" }) => {
  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-500 to-purple-500",
    green: "from-emerald-500 to-green-500",
    orange: "from-orange-500 to-amber-500",
    blue: "from-blue-500 to-cyan-500",
    rose: "from-rose-500 to-pink-500",
    slate: "from-slate-500 to-slate-600",
  };

  return (
    <div className="bg-theme-card rounded-2xl p-5 border border-theme-card-border shadow-theme-sm hover:shadow-theme-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-bold ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-theme-text-primary mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-theme-text-secondary">{title}</div>
      {subtitle && (
        <div className="text-xs text-theme-text-tertiary mt-1">{subtitle}</div>
      )}
    </div>
  );
};

// Jauge d'usage IA
const AIUsageBar: React.FC<{ stat: AIUsageStat }> = ({ stat }) => {
  const getColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-orange-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="py-3 border-b border-theme-border last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-theme-text-primary">
          {stat.feature}
        </span>
        <span className="text-xs text-theme-text-secondary">
          {stat.total_requests} / {stat.global_limit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getColor(stat.usage_percent)} transition-all duration-500`}
            style={{ width: `${Math.min(100, stat.usage_percent)}%` }}
          />
        </div>
        <span
          className={`text-xs font-bold ${stat.is_near_limit ? "text-red-500" : "text-theme-text-secondary"}`}
        >
          {Math.round(stat.usage_percent)}%
        </span>
      </div>
      <div className="text-xs text-theme-text-tertiary mt-1">
        {stat.unique_users} utilisateurs
      </div>
    </div>
  );
};

// Barre de progression simple
const ProgressBar: React.FC<{
  value: number;
  max: number;
  color: string;
  label: string;
}> = ({ value, max, color, label }) => {
  const percent = (value / Math.max(max, 1)) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-theme-text-secondary">{label}</span>
        <span className="font-medium text-theme-text-primary">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// Formulaire de configuration d'une feature
const AIConfigEditor: React.FC<{
  config: AIConfig;
  onSave: (feature: string, data: Partial<AIConfig>) => Promise<void>;
  saving: boolean;
}> = ({ config, onSave, saving }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    free_monthly_limit: config.free_monthly_limit,
    pro_monthly_limit: config.pro_monthly_limit,
    enterprise_monthly_limit: config.enterprise_monthly_limit,
    global_monthly_limit: config.global_monthly_limit,
    min_session_allowance: config.min_session_allowance,
    is_enabled: config.is_enabled,
  });

  const handleSave = async () => {
    await onSave(config.feature, formData);
  };

  const hasChanges =
    formData.free_monthly_limit !== config.free_monthly_limit ||
    formData.pro_monthly_limit !== config.pro_monthly_limit ||
    formData.enterprise_monthly_limit !== config.enterprise_monthly_limit ||
    formData.global_monthly_limit !== config.global_monthly_limit ||
    formData.min_session_allowance !== config.min_session_allowance ||
    formData.is_enabled !== config.is_enabled;

  return (
    <div className="bg-theme-bg-secondary rounded-xl border border-theme-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-theme-bg-tertiary transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{config.icon || "🤖"}</span>
          <div className="text-left">
            <div className="font-medium text-theme-text-primary">
              {config.display_name || config.feature}
            </div>
            <div className="text-xs text-theme-text-tertiary">
              Free: {config.free_monthly_limit}/mois | Pro:{" "}
              {config.pro_monthly_limit}/mois | Enterprise:{" "}
              {config.enterprise_monthly_limit}/mois
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full ${config.is_enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
          >
            {config.is_enabled ? "Actif" : "Désactivé"}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-theme-border space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">
                Free/mois
              </label>
              <input
                type="number"
                value={formData.free_monthly_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    free_monthly_limit: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">
                Pro/mois
              </label>
              <input
                type="number"
                value={formData.pro_monthly_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pro_monthly_limit: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">
                Enterprise/mois
              </label>
              <input
                type="number"
                value={formData.enterprise_monthly_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enterprise_monthly_limit: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">
                Limite globale/mois
              </label>
              <input
                type="number"
                value={formData.global_monthly_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    global_monthly_limit: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">
                Min par session
              </label>
              <input
                type="number"
                value={formData.min_session_allowance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_session_allowance: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, is_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded border-theme-border"
              />
              <span className="text-sm text-theme-text-primary">
                Feature activée
              </span>
            </label>

            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Sauvegarder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Main Component ====================

export const AdminDashboardView: React.FC = () => {
  const { user, setView } = useGameStore();

  // États
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsageStat[]>([]);
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [aiHealth, setAiHealth] = useState<AIHealthStatus | null>(null);
  const [onboardingFunnel, setOnboardingFunnel] =
    useState<OnboardingFunnel | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "ai" | "config" | "b2b"
  >("overview");
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usageRes, configsRes, healthRes, funnelRes] =
        await Promise.all([
          api.get("/api/admin/stats/overview"),
          api.get("/api/admin/ai/usage/monthly"),
          api.get("/api/admin/ai/config"),
          api.get("/api/admin/ai/health"),
          api.get("/api/admin/stats/onboarding/funnel"),
        ]);

      setOverview(overviewRes.data);
      setAiUsage(usageRes.data);
      setAiConfigs(configsRes.data);
      setAiHealth(healthRes.data);
      setOnboardingFunnel(funnelRes.data);

      // Charger les organisations
      try {
        const orgsRes = await api.get("/api/admin/organizations");
        setOrganizations(orgsRes.data.items || []);
      } catch (orgErr) {
        console.warn("Could not fetch organizations:", orgErr);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sauvegarder une config
  const handleSaveConfig = async (feature: string, data: Partial<AIConfig>) => {
    setSaving(true);
    try {
      await api.patch(`/api/admin/ai/config/${feature}`, data);
      // Refresh configs
      const res = await api.get("/api/admin/ai/config");
      setAiConfigs(res.data);
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setSaving(false);
    }
  };

  // Vérifier que l'utilisateur est admin
  if (!user?.is_superuser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          Accès refusé
        </h1>
        <p className="text-theme-text-secondary">
          Cette page est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-theme-text-primary flex items-center gap-3">
            <Shield size={28} className="text-indigo-500" />
            Dashboard Admin
          </h1>
          <p className="text-theme-text-secondary mt-1">
            Gestion et métriques de la plateforme
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary rounded-xl text-sm font-medium transition-colors self-start md:self-auto"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-theme-border pb-2 overflow-x-auto">
        {[
          {
            id: "overview",
            label: "Vue d'ensemble",
            icon: <BarChart3 size={16} />,
          },
          { id: "ai", label: "Usage IA", icon: <Zap size={16} /> },
          {
            id: "b2b",
            label: "Organisations B2B",
            icon: <Building2 size={16} />,
          },
          {
            id: "config",
            label: "Configuration",
            icon: <Settings size={16} />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-indigo-500 text-white"
                : "text-theme-text-secondary hover:bg-theme-bg-tertiary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === "overview" && overview && (
        <div className="space-y-6">
          {/* Alertes système */}
          {aiHealth && aiHealth.alerts.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
              <h3 className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-3">
                <AlertTriangle size={18} />
                Alertes ({aiHealth.alerts.length})
              </h3>
              <div className="space-y-2">
                {aiHealth.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      alert.level === "critical"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    <strong>{alert.feature}:</strong> {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques utilisateurs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-theme-text-primary flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                Utilisateurs
              </h3>
              <button
                onClick={() => setView("admin_users")}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition"
              >
                Voir tous les profils
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total utilisateurs"
                value={overview.users.total}
                icon={<Users size={18} className="text-white" />}
                subtitle={
                  overview.users.test > 0
                    ? `${overview.users.real} réels · ${overview.users.test} test`
                    : `+${overview.users.new_this_week} cette semaine`
                }
                color="indigo"
              />
              <StatCard
                title="Emails vérifiés"
                value={`${overview.users.verified_percent}%`}
                icon={<Mail size={18} className="text-white" />}
                subtitle={`${overview.users.verified} / ${overview.users.total}`}
                color="green"
              />
              <StatCard
                title="Actifs aujourd'hui"
                value={overview.users.active_today}
                icon={<TrendingUp size={18} className="text-white" />}
                subtitle={`${overview.users.active_week} cette semaine`}
                color="orange"
              />
              <StatCard
                title="Admins"
                value={overview.users.admins}
                icon={<Shield size={18} className="text-white" />}
                color="rose"
              />
            </div>
          </div>

          {/* Comptes OAuth */}
          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
            <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
              <Github size={18} className="text-theme-text-secondary" />
              Comptes liés
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-theme-bg-secondary rounded-xl">
                <Github className="w-8 h-8 mx-auto mb-2 text-theme-text-primary" />
                <div className="text-2xl font-bold text-theme-text-primary">
                  {overview.oauth.github}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  {overview.oauth.github_percent}% GitHub
                </div>
              </div>
              <div className="text-center p-4 bg-theme-bg-secondary rounded-xl">
                <div className="w-8 h-8 mx-auto mb-2 bg-[#4285F4] rounded-full flex items-center justify-center text-white font-bold">
                  G
                </div>
                <div className="text-2xl font-bold text-theme-text-primary">
                  {overview.oauth.google}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  {overview.oauth.google_percent}% Google
                </div>
              </div>
              <div className="text-center p-4 bg-theme-bg-secondary rounded-xl">
                <div className="w-8 h-8 mx-auto mb-2 bg-[#0077B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  in
                </div>
                <div className="text-2xl font-bold text-theme-text-primary">
                  {overview.oauth.linkedin}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  {overview.oauth.linkedin_percent}% LinkedIn
                </div>
              </div>
            </div>
          </div>

          {/* Nouveaux graphs temporels */}
          <UsersTimelineChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentUsersList />
            <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
              <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-500" />
                Métriques rapides
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-xl">
                  <span className="text-sm text-theme-text-secondary">
                    Taux de conversion onboarding
                  </span>
                  <span className="font-bold text-emerald-500">
                    {overview.onboarding.completion_rate}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-xl">
                  <span className="text-sm text-theme-text-secondary">
                    Complétude profil moyenne
                  </span>
                  <span className="font-bold text-indigo-500">
                    {overview.content.profiles_with_bio_percent}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-xl">
                  <span className="text-sm text-theme-text-secondary">
                    Users avec streak actif
                  </span>
                  <span className="font-bold text-orange-500">
                    {overview.gamification.active_streaks}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-xl">
                  <span className="text-sm text-theme-text-secondary">
                    XP moyen par user
                  </span>
                  <span className="font-bold text-purple-500">
                    {Math.round(overview.gamification.avg_xp)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
            <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
              <FileText size={18} className="text-theme-text-secondary" />
              Contenu
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-theme-bg-secondary rounded-xl">
                <Briefcase className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <div className="text-xl font-bold text-theme-text-primary">
                  {overview.content.experiences}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  Expériences
                </div>
                <div className="text-xs text-theme-text-tertiary">
                  ~{overview.content.avg_experiences_per_user}/user
                </div>
              </div>
              <div className="text-center p-3 bg-theme-bg-secondary rounded-xl">
                <GraduationCap className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <div className="text-xl font-bold text-theme-text-primary">
                  {overview.content.educations}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  Formations
                </div>
              </div>
              <div className="text-center p-3 bg-theme-bg-secondary rounded-xl">
                <Zap className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <div className="text-xl font-bold text-theme-text-primary">
                  {overview.content.skills}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  Compétences
                </div>
                <div className="text-xs text-theme-text-tertiary">
                  ~{overview.content.avg_skills_per_user}/user
                </div>
              </div>
              <div className="text-center p-3 bg-theme-bg-secondary rounded-xl">
                <Award className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                <div className="text-xl font-bold text-theme-text-primary">
                  {overview.content.certifications}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  Certifications
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-theme-border">
              <ProgressBar
                value={overview.content.profiles_with_bio}
                max={overview.content.profiles}
                color="bg-emerald-500"
                label={`Profils avec bio (${overview.content.profiles_with_bio_percent}%)`}
              />
              <ProgressBar
                value={overview.content.profiles_with_photo}
                max={overview.content.profiles}
                color="bg-blue-500"
                label={`Profils avec photo (${overview.content.profiles_with_photo_percent}%)`}
              />
            </div>
          </div>

          {/* Onboarding & Gamification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Onboarding */}
            <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
              <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-orange-500" />
                Onboarding
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Sessions démarrées
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.onboarding.total_sessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Sessions complétées
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.onboarding.completed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Taux de complétion
                  </span>
                  <span className="font-bold text-emerald-500">
                    {overview.onboarding.completion_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Fox Interviews
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.onboarding.interview_sessions}
                  </span>
                </div>
              </div>

              {/* Funnel */}
              {onboardingFunnel && onboardingFunnel.steps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-theme-border">
                  <div className="text-xs text-theme-text-tertiary mb-2">
                    Funnel par étape
                  </div>
                  {onboardingFunnel.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <div className="w-16 text-xs text-theme-text-secondary">
                        {step.name}
                      </div>
                      <div className="flex-1 h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                          style={{ width: `${step.percent}%` }}
                        />
                      </div>
                      <div className="w-10 text-xs text-right text-theme-text-secondary">
                        {step.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gamification */}
            <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
              <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                Gamification
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    XP total distribué
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.gamification.total_xp.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    XP moyen/utilisateur
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.gamification.avg_xp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Streaks actifs
                  </span>
                  <span className="font-bold text-orange-500">
                    {overview.gamification.active_streaks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Record streak
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.gamification.max_streak} jours
                  </span>
                </div>
              </div>

              {/* Niveaux */}
              {Object.keys(overview.gamification.levels).length > 0 && (
                <div className="mt-4 pt-4 border-t border-theme-border">
                  <div className="text-xs text-theme-text-tertiary mb-2">
                    Répartition par niveau
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(overview.gamification.levels).map(
                      ([level, count]) => (
                        <div
                          key={level}
                          className="flex-1 text-center p-2 bg-theme-bg-secondary rounded-lg"
                        >
                          <div className="text-lg font-bold text-theme-text-primary">
                            {count}
                          </div>
                          <div className="text-xs text-theme-text-tertiary">
                            Niv. {level.replace("level_", "")}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stockage & IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stockage R2 */}
            <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
              <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                <Database size={18} className="text-blue-500" />
                Stockage R2
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-theme-text-secondary">Utilisation</span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.storage.used_gb} GB / 10 GB
                  </span>
                </div>
                <div className="h-4 bg-theme-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${overview.storage.used_percent >= 80 ? "bg-red-500" : overview.storage.used_percent >= 50 ? "bg-orange-500" : "bg-emerald-500"}`}
                    style={{ width: `${overview.storage.used_percent}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-theme-bg-secondary rounded-xl">
                  <div className="text-lg font-bold text-theme-text-primary">
                    {overview.storage.class_a_operations.toLocaleString()}
                  </div>
                  <div className="text-xs text-theme-text-tertiary">
                    Class A (write)
                  </div>
                </div>
                <div className="p-3 bg-theme-bg-secondary rounded-xl">
                  <div className="text-lg font-bold text-theme-text-primary">
                    {overview.storage.class_b_operations.toLocaleString()}
                  </div>
                  <div className="text-xs text-theme-text-tertiary">
                    Class B (read)
                  </div>
                </div>
              </div>
            </div>

            {/* Usage IA résumé */}
            <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
              <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                <Zap size={18} className="text-purple-500" />
                Usage IA
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Requêtes totales
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.ai.total_requests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Requêtes aujourd'hui
                  </span>
                  <span className="font-bold text-purple-500">
                    {overview.ai.requests_today}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-text-secondary">
                    Tokens consommés
                  </span>
                  <span className="font-bold text-theme-text-primary">
                    {overview.ai.total_tokens.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* État du système */}
              {aiHealth && (
                <div className="mt-4 pt-4 border-t border-theme-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${aiHealth.status === "healthy" ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`}
                    />
                    <span className="text-sm font-medium text-theme-text-primary">
                      {aiHealth.status === "healthy"
                        ? "Système opérationnel"
                        : "Dégradé"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(aiHealth.api_keys).map(([key, status]) => (
                      <div
                        key={key}
                        className="flex items-center gap-1 text-theme-text-secondary"
                      >
                        {status.includes("✅") ? (
                          <CheckCircle size={12} className="text-emerald-500" />
                        ) : status.includes("❌") ? (
                          <AlertTriangle size={12} className="text-red-500" />
                        ) : (
                          <AlertTriangle
                            size={12}
                            className="text-orange-500"
                          />
                        )}
                        <span className="truncate">
                          {key.replace("GEMINI_API_KEY", "Gemini")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: AI Usage */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          {/* Graph d'utilisation IA dans le temps */}
          <AIUsageTimelineChart />

          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
            <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" />
              Usage IA aujourd'hui
            </h3>
            {aiUsage.length > 0 ? (
              <div className="space-y-1">
                {aiUsage.map((stat) => (
                  <AIUsageBar key={stat.feature} stat={stat} />
                ))}
              </div>
            ) : (
              <p className="text-theme-text-secondary text-center py-8">
                Aucune utilisation IA aujourd'hui
              </p>
            )}
          </div>

          {/* Légende des tiers */}
          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
            <h3 className="font-bold text-theme-text-primary mb-4">
              Limites par tier
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Zap size={24} className="mx-auto mb-2 text-slate-500" />
                <div className="font-bold text-theme-text-primary">Free</div>
                <div className="text-xs text-theme-text-secondary">Limité</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <Star size={24} className="mx-auto mb-2 text-indigo-500" />
                <div className="font-bold text-theme-text-primary">Pro</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                  10x plus
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200 dark:border-amber-700">
                <Crown size={24} className="mx-auto mb-2 text-amber-500" />
                <div className="font-bold text-theme-text-primary">
                  Enterprise
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  100x plus
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl border border-rose-200 dark:border-rose-700">
                <Shield size={24} className="mx-auto mb-2 text-rose-500" />
                <div className="font-bold text-theme-text-primary">Admin</div>
                <div className="text-xs text-rose-600 dark:text-rose-400">
                  Illimité ∞
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: B2B Organizations */}
      {activeTab === "b2b" && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateOrgModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus size={18} />
              Créer une organisation
            </button>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary rounded-xl font-medium transition-colors"
            >
              <UserPlus size={18} />
              Ajouter un admin
            </button>
          </div>

          {/* Organisations Liste */}
          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
            <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-indigo-500" />
              Organisations ({organizations.length})
            </h3>

            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
                <p className="text-theme-text-secondary">
                  Aucune organisation créée
                </p>
                <button
                  onClick={() => setShowCreateOrgModal(true)}
                  className="mt-4 text-indigo-500 hover:text-indigo-400"
                >
                  Créer la première organisation →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-xl hover:bg-theme-bg-tertiary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          org.type === "school"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-purple-500/20 text-purple-500"
                        }`}
                      >
                        {org.type === "school" ? (
                          <GraduationCap size={24} />
                        ) : (
                          <Briefcase size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-theme-text-primary">
                            {org.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              org.type === "school"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {org.type === "school" ? "École" : "Entreprise"}
                          </span>
                          {org.is_verified && (
                            <CheckCircle
                              size={14}
                              className="text-emerald-500"
                            />
                          )}
                        </div>
                        <div className="text-sm text-theme-text-secondary">
                          {org.slug} • {org.member_count || 0} membres
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          org.is_active
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {org.is_active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats B2B */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Écoles"
              value={organizations.filter((o) => o.type === "school").length}
              icon={<GraduationCap size={18} className="text-white" />}
              color="blue"
            />
            <StatCard
              title="Entreprises"
              value={organizations.filter((o) => o.type === "company").length}
              icon={<Briefcase size={18} className="text-white" />}
              color="purple"
            />
            <StatCard
              title="Partenariats"
              value={0}
              icon={<Users size={18} className="text-white" />}
              subtitle="À implémenter"
              color="green"
            />
          </div>
        </div>
      )}

      {/* TAB: Configuration */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* Campagnes Marketing - QR Codes */}
          <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-theme-text-primary flex items-center gap-2">
                    Campagnes Marketing
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">
                      Nouveau
                    </span>
                  </h3>
                  <p className="text-sm text-theme-text-secondary mt-1">
                    Créez des QR codes et liens raccourcis pour tracker vos
                    campagnes d'acquisition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setView("campaigns_admin")}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
              >
                <Target className="w-4 h-4" />
                Gérer les campagnes
              </button>
            </div>
          </div>

          {/* Configuration des cartes du Dashboard */}
          <DashboardCardsConfig />

          {/* Configuration des limites IA */}
          <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
            <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
              <Settings size={18} className="text-indigo-500" />
              Configuration des limites IA
            </h3>
            <p className="text-sm text-theme-text-secondary mb-4">
              Modifiez les limites quotidiennes par tier pour chaque feature.
              Les admins n'ont pas de limite.
            </p>
            {aiConfigs.length > 0 ? (
              <div className="space-y-3">
                {aiConfigs.map((config) => (
                  <AIConfigEditor
                    key={config.feature}
                    config={config}
                    onSave={handleSaveConfig}
                    saving={saving}
                  />
                ))}
              </div>
            ) : (
              <p className="text-theme-text-secondary text-center py-8">
                Aucune configuration trouvée. Les valeurs par défaut du code
                sont utilisées.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal: Créer une organisation */}
      {showCreateOrgModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateOrgModal(false)}
          onCreated={() => {
            setShowCreateOrgModal(false);
            fetchData();
          }}
        />
      )}

      {/* Modal: Ajouter un admin */}
      {showAddAdminModal && (
        <AddAdminModal
          organizations={organizations}
          onClose={() => setShowAddAdminModal(false)}
          onAdded={() => {
            setShowAddAdminModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// ==================== Dashboard Cards Config ====================

const DashboardCardsConfig: React.FC = () => {
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await dashboardConfigAPI.getAllCards();
      setCards(data);
    } catch (error) {
      console.error("Erreur chargement config dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (cardId: string) => {
    try {
      setSaving(cardId);
      const updated = await dashboardConfigAPI.toggleCard(cardId);
      setCards((prev) => prev.map((c) => (c.card_id === cardId ? updated : c)));
    } catch (error) {
      console.error("Erreur toggle carte:", error);
    } finally {
      setSaving(null);
    }
  };

  const handleColumnSpan = async (cardId: string, span: 1 | 2) => {
    try {
      setSaving(cardId);
      const updated = await dashboardConfigAPI.updateCard(cardId, {
        column_span: span,
      });
      setCards((prev) => prev.map((c) => (c.card_id === cardId ? updated : c)));
    } catch (error) {
      console.error("Erreur màj colonne:", error);
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Voulez-vous vraiment réinitialiser toutes les cartes aux valeurs par défaut ?",
      )
    )
      return;

    try {
      setResetting(true);
      await dashboardConfigAPI.resetCards();
      await loadCards();
    } catch (error) {
      console.error("Erreur reset:", error);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-theme-text-primary flex items-center gap-2">
          <LayoutGrid size={18} className="text-indigo-500" />
          Configuration du Dashboard Utilisateur
        </h3>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-theme-text-secondary hover:text-theme-text-primary bg-theme-bg-secondary hover:bg-theme-bg-tertiary rounded-lg transition-colors disabled:opacity-50"
        >
          {resetting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RotateCcw size={14} />
          )}
          Réinitialiser
        </button>
      </div>
      <p className="text-sm text-theme-text-secondary mb-6">
        Activez ou désactivez les cartes affichées dans le tableau de bord des
        utilisateurs.
      </p>

      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.card_id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              card.is_enabled
                ? "bg-theme-bg-secondary border-theme-border"
                : "bg-theme-bg-tertiary/50 border-theme-border/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{card.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${card.is_enabled ? "text-theme-text-primary" : "text-theme-text-secondary"}`}
                  >
                    {card.display_name}
                  </span>
                  <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary px-2 py-0.5 rounded">
                    {card.card_id}
                  </span>
                </div>
                {card.description && (
                  <p className="text-xs text-theme-text-muted mt-0.5">
                    {card.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Largeur */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-theme-text-muted mr-1">Largeur:</span>
                <button
                  onClick={() => handleColumnSpan(card.card_id, 1)}
                  disabled={saving === card.card_id}
                  className={`px-2 py-1 rounded transition-colors ${
                    card.column_span === 1
                      ? "bg-indigo-500 text-white"
                      : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-secondary"
                  }`}
                >
                  1 col
                </button>
                <button
                  onClick={() => handleColumnSpan(card.card_id, 2)}
                  disabled={saving === card.card_id}
                  className={`px-2 py-1 rounded transition-colors ${
                    card.column_span === 2
                      ? "bg-indigo-500 text-white"
                      : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-secondary"
                  }`}
                >
                  2 cols
                </button>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(card.card_id)}
                disabled={saving === card.card_id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  card.is_enabled
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                } disabled:opacity-50`}
              >
                {saving === card.card_id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : card.is_enabled ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
                {card.is_enabled ? "Visible" : "Masquée"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="text-theme-text-secondary text-center py-8">
          Aucune carte configurée.
        </p>
      )}
    </div>
  );
};

// Modal pour créer une organisation
const CreateOrganizationModal: React.FC<{
  onClose: () => void;
  onCreated: () => void;
}> = ({ onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "school" as "school" | "company",
    email_domain: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;

    try {
      setLoading(true);
      await api.post("/api/admin/organizations", {
        name: form.name,
        slug: form.slug,
        type: form.type,
        email_domain: form.email_domain || null,
      });
      onCreated();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card border border-theme-card-border rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-theme-text-primary mb-6">
          Nouvelle organisation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "school" })}
                className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                  form.type === "school"
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-theme-bg-secondary border-theme-border text-theme-text-secondary"
                }`}
              >
                <GraduationCap size={20} />
                École
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "company" })}
                className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                  form.type === "company"
                    ? "bg-purple-500/20 border-purple-500 text-purple-400"
                    : "bg-theme-bg-secondary border-theme-border text-theme-text-secondary"
                }`}
              >
                <Briefcase size={20} />
                Entreprise
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Mon École"
              className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="ex: efrei-paris"
              className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-indigo-500 outline-none"
            />
          </div>

          {form.type === "school" && (
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Domaine email
              </label>
              <input
                type="text"
                value={form.email_domain}
                onChange={(e) =>
                  setForm({ ...form, email_domain: e.target.value })
                }
                placeholder="ex: @efrei.net"
                className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-indigo-500 outline-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-theme-bg-secondary text-theme-text-secondary rounded-xl hover:bg-theme-bg-tertiary transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !form.name || !form.slug}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal pour ajouter un admin à une organisation
const AddAdminModal: React.FC<{
  organizations: Organization[];
  onClose: () => void;
  onAdded: () => void;
}> = ({ organizations, onClose, onAdded }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    organization_id: "",
    role: "admin" as string,
  });

  const selectedOrg = organizations.find((o) => o.id === form.organization_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.organization_id) return;

    try {
      setLoading(true);
      await api.post(
        `/api/organizations/${form.organization_id}/members/invite`,
        {
          email: form.email,
          role: form.role,
        },
      );
      onAdded();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card border border-theme-card-border rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-theme-text-primary mb-6">
          Ajouter un admin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Organisation *
            </label>
            <select
              value={form.organization_id}
              onChange={(e) =>
                setForm({ ...form, organization_id: e.target.value })
              }
              className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-indigo-500 outline-none"
            >
              <option value="">Sélectionner...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.type === "school" ? "École" : "Entreprise"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@organisation.fr"
              className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Rôle *
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-indigo-500 outline-none"
            >
              {selectedOrg?.type === "school" ? (
                <>
                  <option value="admin">Admin école</option>
                  <option value="coach">Coach carrière</option>
                  <option value="teacher">Professeur</option>
                </>
              ) : selectedOrg?.type === "company" ? (
                <>
                  <option value="company_admin">Admin entreprise</option>
                  <option value="recruiter">Recruteur</option>
                </>
              ) : (
                <option value="">Sélectionnez d'abord une organisation</option>
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-theme-bg-secondary text-theme-text-secondary rounded-xl hover:bg-theme-bg-tertiary transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !form.email || !form.organization_id}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Inviter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboardView;
