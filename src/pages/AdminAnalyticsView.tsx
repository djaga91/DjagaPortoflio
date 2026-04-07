/**
 * AdminAnalyticsView - Dashboard de monitoring et analytics.
 *
 * 4 onglets : Vue d'ensemble, Utilisateurs, Contenu & Engagement, Performance
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Clock,
  FileText,
  Award,
  Mail,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminAnalyticsAPI } from "../services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface EngagementData {
  dau: number;
  dau_yesterday: number;
  dau_trend: number;
  wau: number;
  mau: number;
  stickiness: number;
  total_users: number;
  active_rate: number;
  dau_timeline: { date: string; count: number }[];
}

interface RetentionCohort {
  week_label: string;
  week_start: string;
  size: number;
  retention: number[];
}

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

interface LoginMethod {
  method: string;
  count: number;
  percentage: number;
}

interface ContentTimeline {
  dates: string[];
  cv_generated: number[];
  cover_letter_generated: number[];
  badge_earned: number[];
}

interface ActivityItem {
  id: string;
  user: string;
  event_type: string;
  label: string;
  data: Record<string, unknown>;
  created_at: string | null;
}

interface TopUser {
  user_id: string;
  email: string;
  username: string | null;
  event_count: number;
}

interface GrowthData {
  dates: string[];
  new_users: number[];
  cumulative: number[];
  period_days: number;
}

interface PerfData {
  avg_ms: number;
  p95_ms: number;
  p99_ms: number;
  error_rate: number;
  total_requests: number;
  top_slow: { path: string; avg_ms: number; count: number }[];
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
const KPICard: React.FC<{
  label: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ label, value, trend, icon, subtitle }) => {
  const trendColor =
    trend === undefined
      ? ""
      : trend > 0
        ? "text-emerald-500"
        : trend < 0
          ? "text-red-500"
          : "text-theme-text-muted";
  const TrendIcon =
    trend === undefined
      ? null
      : trend > 0
        ? ArrowUp
        : trend < 0
          ? ArrowDown
          : Minus;

  return (
    <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-theme-text-secondary text-sm font-medium">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-theme-text-primary">
          {value}
        </span>
        {trend !== undefined && TrendIcon && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${trendColor} mb-1`}
          >
            <TrendIcon size={12} />
            {Math.abs(trend)}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-theme-text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Retention Heatmap
// ---------------------------------------------------------------------------
const RetentionHeatmap: React.FC<{ cohorts: RetentionCohort[] }> = ({
  cohorts,
}) => {
  if (!cohorts.length) {
    return (
      <p className="text-theme-text-muted text-sm text-center py-8">
        Pas encore assez de données de rétention.
      </p>
    );
  }

  const maxWeeks = Math.max(...cohorts.map((c) => c.retention.length));

  const getColor = (pct: number): string => {
    if (pct >= 80) return "bg-emerald-500 text-white";
    if (pct >= 60) return "bg-emerald-400 text-white";
    if (pct >= 40)
      return "bg-emerald-300 dark:bg-emerald-600 text-emerald-900 dark:text-white";
    if (pct >= 20)
      return "bg-emerald-200 dark:bg-emerald-700 text-emerald-800 dark:text-emerald-200";
    if (pct > 0)
      return "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300";
    return "bg-theme-bg-secondary text-theme-text-muted";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-theme-text-muted font-medium px-2 py-1">
              Cohorte
            </th>
            <th className="text-center text-theme-text-muted font-medium px-1 py-1">
              Taille
            </th>
            {Array.from({ length: Math.min(maxWeeks, 12) }, (_, i) => (
              <th
                key={i}
                className="text-center text-theme-text-muted font-medium px-1 py-1"
              >
                S{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.week_start}>
              <td className="px-2 py-1 text-theme-text-secondary font-medium whitespace-nowrap">
                {c.week_label}
              </td>
              <td className="text-center px-1 py-1 text-theme-text-muted">
                {c.size}
              </td>
              {c.retention.slice(0, 12).map((pct, i) => (
                <td key={i} className="px-1 py-1">
                  <div
                    className={`rounded-md px-1 py-0.5 text-center font-medium ${getColor(pct)}`}
                  >
                    {pct.toFixed(0)}%
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------
const EVENT_ICONS: Record<string, React.ReactNode> = {
  login: <Users size={14} />,
  signup: <Zap size={14} />,
  profile_update: <Target size={14} />,
  cv_generated: <FileText size={14} />,
  badge_earned: <Award size={14} />,
  cover_letter_generated: <Mail size={14} />,
};

const EVENT_COLORS: Record<string, string> = {
  login: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  signup:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  profile_update:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  cv_generated:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  badge_earned:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  cover_letter_generated:
    "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
};

const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => {
  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH}h`;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-theme-bg-secondary transition-colors"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${EVENT_COLORS[item.event_type] || "bg-theme-bg-secondary text-theme-text-muted"}`}
          >
            {EVENT_ICONS[item.event_type] || <Activity size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-theme-text-primary truncate">
              <span className="font-semibold">{item.user}</span>{" "}
              <span className="text-theme-text-secondary">{item.label}</span>
            </p>
          </div>
          <span className="text-xs text-theme-text-muted whitespace-nowrap flex-shrink-0">
            {formatTime(item.created_at)}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-theme-text-muted text-sm text-center py-8">
          Aucune activité récente.
        </p>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------
type TabId = "overview" | "users" | "content" | "performance";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: <BarChart3 size={16} /> },
  { id: "users", label: "Utilisateurs", icon: <Users size={16} /> },
  { id: "content", label: "Contenu", icon: <FileText size={16} /> },
  { id: "performance", label: "Performance", icon: <Activity size={16} /> },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const AdminAnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [periodDays, setPeriodDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Data state
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [retention, setRetention] = useState<RetentionCohort[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [loginMethods, setLoginMethods] = useState<LoginMethod[]>([]);
  const [contentTimeline, setContentTimeline] =
    useState<ContentTimeline | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [topActive, setTopActive] = useState<TopUser[]>([]);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [perf, setPerf] = useState<PerfData | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      adminAnalyticsAPI.getEngagement(periodDays),
      adminAnalyticsAPI.getRetention(8),
      adminAnalyticsAPI.getFunnel(),
      adminAnalyticsAPI.getActivityFeed(50),
      adminAnalyticsAPI.getGrowth(90),
    ]);
    if (results[0].status === "fulfilled") setEngagement(results[0].value);
    if (results[1].status === "fulfilled")
      setRetention(results[1].value.cohorts || []);
    if (results[2].status === "fulfilled") setFunnel(results[2].value);
    if (results[3].status === "fulfilled") setActivityFeed(results[3].value);
    if (results[4].status === "fulfilled") setGrowth(results[4].value);
    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.warn(`Analytics[${i}] failed:`, r.reason);
    });
    setLoading(false);
  }, [periodDays]);

  const loadTabData = useCallback(
    async (tab: TabId) => {
      if (tab === "users") {
        const results = await Promise.allSettled([
          adminAnalyticsAPI.getLoginMethods(periodDays),
          adminAnalyticsAPI.getTopActive(20, periodDays),
        ]);
        if (results[0].status === "fulfilled")
          setLoginMethods(results[0].value);
        if (results[1].status === "fulfilled") setTopActive(results[1].value);
      } else if (tab === "content") {
        adminAnalyticsAPI
          .getContentTimeline(periodDays)
          .then(setContentTimeline)
          .catch(console.warn);
      } else if (tab === "performance") {
        adminAnalyticsAPI.getPerformance(60).then(setPerf).catch(console.warn);
      }
    },
    [periodDays],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  // Recharts formatters
  const formatDate = (d: unknown) => {
    const s = String(d ?? "");
    const parts = s.split("-");
    return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : s;
  };

  // Growth chart data
  const growthChartData = growth
    ? growth.dates.map((d, i) => ({
        date: d,
        new: growth.new_users[i],
        cumulative: growth.cumulative[i],
      }))
    : [];

  // DAU timeline chart data
  const dauChartData =
    engagement?.dau_timeline?.map((p) => ({ date: p.date, dau: p.count })) ||
    [];

  // Content chart data
  const contentChartData = contentTimeline
    ? contentTimeline.dates.map((d, i) => ({
        date: d,
        cv: contentTimeline.cv_generated[i],
        letters: contentTimeline.cover_letter_generated[i],
        badges: contentTimeline.badge_earned[i],
      }))
    : [];

  // METHOD_LABELS
  const METHOD_LABELS: Record<string, string> = {
    password: "Email/Mot de passe",
    google: "Google",
    github: "GitHub",
    linkedin: "LinkedIn",
    discord: "Discord",
  };

  if (loading && !engagement) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">
            Analytics & Monitoring
          </h1>
          <p className="text-theme-text-secondary text-sm mt-1">
            Suivi d'activité et métriques de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="bg-theme-bg-secondary border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text-primary focus:border-indigo-500 outline-none"
          >
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
          </select>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-theme-bg-secondary border border-theme-border hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw
              size={16}
              className={`text-theme-text-secondary ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-theme-bg-secondary rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-theme-card text-indigo-600 dark:text-indigo-400 shadow-theme-sm"
                : "text-theme-text-secondary hover:text-theme-text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB: Vue d'ensemble */}
      {/* ================================================================ */}
      {activeTab === "overview" && engagement && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Utilisateurs totaux"
              value={engagement.total_users.toLocaleString("fr-FR")}
              icon={<Users size={18} />}
            />
            <KPICard
              label="Actifs aujourd'hui (DAU)"
              value={engagement.dau}
              trend={engagement.dau_trend}
              icon={<Zap size={18} />}
              subtitle={`hier: ${engagement.dau_yesterday}`}
            />
            <KPICard
              label="Actifs cette semaine (WAU)"
              value={engagement.wau}
              icon={<TrendingUp size={18} />}
            />
            <KPICard
              label="Actifs ce mois (MAU)"
              value={engagement.mau}
              icon={<Activity size={18} />}
              subtitle={`Stickiness: ${engagement.stickiness}% | Taux actif: ${engagement.active_rate}%`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Croissance */}
            <div className="lg:col-span-2 bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
              <h3 className="font-semibold text-theme-text-primary mb-4">
                Croissance utilisateurs
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={growthChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-theme-border"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-theme-text-muted"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-theme-text-muted"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Total"
                    fill="#6366F1"
                    fillOpacity={0.15}
                    stroke="#6366F1"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="new"
                    name="Nouveaux/jour"
                    fill="#F59E0B"
                    fillOpacity={0.15}
                    stroke="#F59E0B"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Feed */}
            <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
              <h3 className="font-semibold text-theme-text-primary mb-4">
                Activité récente
              </h3>
              <ActivityFeed items={activityFeed} />
            </div>
          </div>

          {/* Funnel + DAU Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
              <h3 className="font-semibold text-theme-text-primary mb-4">
                Funnel d'activation
              </h3>
              <div className="space-y-3">
                {funnel.map((step, i) => (
                  <div key={step.step}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-theme-text-secondary">
                        {step.step}
                      </span>
                      <span className="text-sm font-semibold text-theme-text-primary">
                        {step.count} ({step.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-theme-bg-secondary rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{
                          width: `${step.percentage}%`,
                          background: `linear-gradient(90deg, ${["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD"][i] || "#6366F1"}, ${["#818CF8", "#A78BFA", "#C4B5FD", "#DDD6FE"][i] || "#818CF8"})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DAU Timeline */}
            <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
              <h3 className="font-semibold text-theme-text-primary mb-4">
                Utilisateurs actifs / jour
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dauChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-theme-border"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-theme-text-muted"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-theme-text-muted"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                    labelFormatter={formatDate}
                  />
                  <Line
                    type="monotone"
                    dataKey="dau"
                    name="DAU"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Utilisateurs */}
      {/* ================================================================ */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Retention */}
          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
            <h3 className="font-semibold text-theme-text-primary mb-4">
              Rétention par cohorte (hebdomadaire)
            </h3>
            <RetentionHeatmap cohorts={retention} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login Methods */}
            <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
              <h3 className="font-semibold text-theme-text-primary mb-4">
                Méthodes de connexion
              </h3>
              {loginMethods.length > 0 ? (
                <div className="space-y-3">
                  {loginMethods.map((m) => (
                    <div key={m.method}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-theme-text-secondary">
                          {METHOD_LABELS[m.method] || m.method}
                        </span>
                        <span className="text-sm font-semibold text-theme-text-primary">
                          {m.count} ({m.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-theme-bg-secondary rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-indigo-500"
                          style={{ width: `${m.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-theme-text-muted text-sm text-center py-8">
                  Données de connexion en cours de collecte...
                </p>
              )}
            </div>

            {/* Top Active Users */}
            <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
              <h3 className="font-semibold text-theme-text-primary mb-4">
                Top utilisateurs actifs
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {topActive.map((u, i) => (
                  <div
                    key={u.user_id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-theme-bg-secondary transition-colors"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < 3
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          : "bg-theme-bg-secondary text-theme-text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-text-primary truncate">
                        {u.username || u.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-theme-text-muted truncate">
                        {u.email}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-500">
                      {u.event_count} actions
                    </span>
                  </div>
                ))}
                {topActive.length === 0 && (
                  <p className="text-theme-text-muted text-sm text-center py-8">
                    Données en cours de collecte...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Contenu & Engagement */}
      {/* ================================================================ */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Content Timeline Chart */}
          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
            <h3 className="font-semibold text-theme-text-primary mb-4">
              Contenu créé par jour
            </h3>
            {contentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-theme-border"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-theme-text-muted"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-theme-text-muted"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Bar
                    dataKey="cv"
                    name="CV générés"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="letters"
                    name="Lettres"
                    fill="#EC4899"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="badges"
                    name="Badges"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-theme-text-muted text-sm text-center py-12">
                Données de contenu en cours de collecte...
              </p>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Performance */}
      {/* ================================================================ */}
      {activeTab === "performance" && perf && (
        <div className="space-y-6">
          {/* Perf KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              label="Latence moyenne"
              value={`${perf.avg_ms}ms`}
              icon={<Clock size={18} />}
            />
            <KPICard
              label="P95"
              value={`${perf.p95_ms}ms`}
              icon={<TrendingUp size={18} />}
            />
            <KPICard
              label="P99"
              value={`${perf.p99_ms}ms`}
              icon={<Activity size={18} />}
            />
            <KPICard
              label="Taux d'erreur"
              value={`${perf.error_rate}%`}
              icon={<Target size={18} />}
            />
            <KPICard
              label="Requêtes (1h)"
              value={perf.total_requests.toLocaleString("fr-FR")}
              icon={<BarChart3 size={18} />}
            />
          </div>

          {/* Top Slow Endpoints */}
          <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-5">
            <h3 className="font-semibold text-theme-text-primary mb-4">
              Endpoints les plus lents
            </h3>
            {perf.top_slow.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-theme-border">
                      <th className="text-left py-2 px-3 text-theme-text-muted font-medium">
                        Endpoint
                      </th>
                      <th className="text-right py-2 px-3 text-theme-text-muted font-medium">
                        Latence moy.
                      </th>
                      <th className="text-right py-2 px-3 text-theme-text-muted font-medium">
                        Requêtes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {perf.top_slow.map((ep) => (
                      <tr
                        key={ep.path}
                        className="border-b border-theme-card-border hover:bg-theme-bg-secondary transition-colors"
                      >
                        <td className="py-2 px-3 text-theme-text-primary font-mono text-xs">
                          {ep.path}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-semibold ${ep.avg_ms > 500 ? "text-red-500" : ep.avg_ms > 200 ? "text-amber-500" : "text-emerald-500"}`}
                        >
                          {ep.avg_ms}ms
                        </td>
                        <td className="py-2 px-3 text-right text-theme-text-secondary">
                          {ep.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-theme-text-muted text-sm text-center py-8">
                Pas encore de données de performance (le buffer se remplit en
                temps réel).
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "performance" && !perf && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsView;
