/**
 * ApplicationStatsView - Dashboard des statistiques de candidatures
 *
 * Affiche les statistiques complètes des candidatures de l'utilisateur :
 * - Graphique temporel d'évolution
 * - Funnel de candidature
 * - Taux de réponse
 * - Temps moyen entre les étapes
 * - Répartition par statut
 * - Top entreprises
 */

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Target,
  Building2,
  Loader2,
  BarChart3,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { matchingAPI, ApplicationStatsResponse } from "../services/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const ApplicationStatsView: React.FC = () => {
  const { setView, setActiveToast } = useGameStore();
  const [stats, setStats] = useState<ApplicationStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await matchingAPI.getStats();
      setStats(data);
    } catch (err: any) {
      console.error("Erreur chargement statistiques:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de charger les statistiques",
        icon: "❌",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-theme-text-secondary">
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-theme-bg-primary p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-theme-text-secondary text-center py-8">
            Aucune statistique disponible
          </p>
        </div>
      </div>
    );
  }

  // Formater les dates pour le graphique temporel
  const formattedLabels = stats.timeline.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  });

  // Graphique temporel
  const timelineChartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: "Sauvegardées",
        data: stats.timeline.map((d) => d.saved),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Postulées",
        data: stats.timeline.map((d) => d.applied),
        borderColor: "#f0661b",
        backgroundColor: "rgba(240, 102, 27, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Contactées",
        data: stats.timeline.map((d) => d.contacted),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Entretiens",
        data: stats.timeline.map((d) => d.interviewed),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Acceptées",
        data: stats.timeline.map((d) => d.found),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const timelineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#94a3b8",
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94a3b8",
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94a3b8",
          precision: 0,
        },
      },
    },
  };

  // Funnel chart
  const funnelChartData = {
    labels: [
      "Sauvegardées",
      "Postulées",
      "Contactées",
      "Entretiens",
      "Acceptées",
    ],
    datasets: [
      {
        label: "Nombre",
        data: [
          stats.funnel.saved,
          stats.funnel.applied,
          stats.funnel.contacted,
          stats.funnel.interviewed,
          stats.funnel.found,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(240, 102, 27, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderColor: ["#3b82f6", "#f0661b", "#10b981", "#8b5cf6", "#f59e0b"],
        borderWidth: 2,
      },
    ],
  };

  const funnelChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.parsed.y} offre${context.parsed.y > 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#94a3b8",
          precision: 0,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Status distribution
  const statusChartData = {
    labels: ["En cours", "Refusées", "Acceptées"],
    datasets: [
      {
        data: [
          stats.status_distribution.active,
          stats.status_distribution.rejected,
          stats.status_distribution.found,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
        borderColor: ["#3b82f6", "#ef4444", "#10b981"],
        borderWidth: 2,
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#94a3b8",
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("mes_offres")}
              className="p-2 hover:bg-theme-bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-theme-text-primary flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                Statistiques de Candidatures
              </h1>
              <p className="text-theme-text-secondary mt-1">
                Analysez votre progression et optimisez votre stratégie
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-text-secondary mb-1">
                  Taux de réponse
                </p>
                <p className="text-3xl font-bold text-theme-text-primary">
                  {stats.response_rate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-theme-text-secondary mt-2">
              {stats.total_contacted} contact
              {stats.total_contacted > 1 ? "s" : ""} sur {stats.total_applied}{" "}
              candidature{stats.total_applied > 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-text-secondary mb-1">
                  Taux d'entretien
                </p>
                <p className="text-3xl font-bold text-theme-text-primary">
                  {stats.interview_rate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-theme-text-secondary mt-2">
              {stats.total_interviewed} entretien
              {stats.total_interviewed > 1 ? "s" : ""} programmé
              {stats.total_interviewed > 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-text-secondary mb-1">
                  Taux de succès
                </p>
                <p className="text-3xl font-bold text-theme-text-primary">
                  {stats.success_rate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-theme-text-secondary mt-2">
              {stats.total_found} offre{stats.total_found > 1 ? "s" : ""}{" "}
              acceptée{stats.total_found > 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-text-secondary mb-1">
                  Total postulées
                </p>
                <p className="text-3xl font-bold text-theme-text-primary">
                  {stats.total_applied}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-theme-text-secondary mt-2">
              {stats.total_saved} sauvegardée{stats.total_saved > 1 ? "s" : ""}{" "}
              au total
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline Chart */}
          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <h3 className="text-lg font-bold text-theme-text-primary mb-4">
              Évolution (30 derniers jours)
            </h3>
            <div className="h-64">
              <Line data={timelineChartData} options={timelineChartOptions} />
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <h3 className="text-lg font-bold text-theme-text-primary mb-4">
              Répartition par statut
            </h3>
            <div className="h-64">
              <Doughnut data={statusChartData} options={statusChartOptions} />
            </div>
          </div>

          {/* Funnel Chart */}
          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border lg:col-span-2">
            <h3 className="text-lg font-bold text-theme-text-primary mb-4">
              Funnel de candidature
            </h3>
            <div className="h-64">
              <Bar data={funnelChartData} options={funnelChartOptions} />
            </div>
          </div>
        </div>

        {/* Temps moyens et Top entreprises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temps moyens */}
          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-theme-text-primary">
                Temps moyen entre les étapes
              </h3>
            </div>
            <div className="space-y-4">
              {stats.avg_days_to_contact !== null &&
                stats.avg_days_to_contact !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-theme-bg-secondary rounded-lg">
                    <span className="text-theme-text-secondary">
                      Postulé → Contacté
                    </span>
                    <span className="font-bold text-theme-text-primary">
                      {stats.avg_days_to_contact.toFixed(1)} jours
                    </span>
                  </div>
                )}
              {stats.avg_days_to_interview !== null &&
                stats.avg_days_to_interview !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-theme-bg-secondary rounded-lg">
                    <span className="text-theme-text-secondary">
                      Contacté → Entretien
                    </span>
                    <span className="font-bold text-theme-text-primary">
                      {stats.avg_days_to_interview.toFixed(1)} jours
                    </span>
                  </div>
                )}
              {stats.avg_days_to_decision !== null &&
                stats.avg_days_to_decision !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-theme-bg-secondary rounded-lg">
                    <span className="text-theme-text-secondary">
                      Entretien → Décision
                    </span>
                    <span className="font-bold text-theme-text-primary">
                      {stats.avg_days_to_decision.toFixed(1)} jours
                    </span>
                  </div>
                )}
              {!stats.avg_days_to_contact &&
                !stats.avg_days_to_interview &&
                !stats.avg_days_to_decision && (
                  <p className="text-theme-text-secondary text-center py-4">
                    Pas assez de données pour calculer les temps moyens
                  </p>
                )}
            </div>
          </div>

          {/* Top entreprises (postulées) */}
          <div className="bg-theme-card rounded-xl p-6 border border-theme-card-border">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-theme-text-primary">
                Top entreprises
              </h3>
            </div>
            {stats.top_companies.length > 0 ? (
              <>
                <p className="text-2xl font-bold text-theme-text-primary mb-1">
                  {stats.distinct_companies_applied ??
                    stats.top_companies.length ??
                    0}{" "}
                  entreprise
                  {(stats.distinct_companies_applied ??
                    stats.top_companies.length ??
                    0) > 1
                    ? "s"
                    : ""}
                </p>
                <p className="text-sm text-theme-text-muted mb-4">
                  ({stats.funnel?.applied ?? 0} candidature
                  {(stats.funnel?.applied ?? 0) > 1 ? "s" : ""} au total)
                </p>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {[...(stats.top_companies || [])]
                    .sort((a, b) =>
                      (a.name || "").localeCompare(b.name || "", "fr", {
                        sensitivity: "base",
                      }),
                    )
                    .map((company, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-theme-bg-secondary rounded-lg"
                      >
                        <span className="text-theme-text-primary font-medium">
                          {company.name}
                        </span>
                        <span className="text-theme-text-secondary">
                          {company.count} candidature
                          {company.count > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <p className="text-theme-text-secondary text-center py-4">
                Aucune entreprise répertoriée (postulez pour voir les
                statistiques par entreprise)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
