/**
 * AIUsageTimelineChart - Graphique de l'utilisation des APIs IA par jour et feature
 */

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Zap } from "lucide-react";
import { api } from "../../services/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface AITimelineData {
  dates: string[];
  features: Record<string, number[]>;
  period_days: number;
}

// Couleurs par feature
const FEATURE_COLORS: Record<string, { border: string; background: string }> = {
  cv_parser: { border: "#f0661b", background: "rgba(240, 102, 27, 0.1)" },
  fox_interview: { border: "#8b5cf6", background: "rgba(139, 92, 246, 0.1)" },
  text_reformulator: {
    border: "#6366f1",
    background: "rgba(99, 102, 241, 0.1)",
  },
  description_generator: {
    border: "#10b981",
    background: "rgba(16, 185, 129, 0.1)",
  },
  cover_letter: { border: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" },
};

export const AIUsageTimelineChart: React.FC = () => {
  const [data, setData] = useState<AITimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/admin/ai/usage/timeline?days=${period}`,
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch AI usage timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
        <p className="text-theme-text-secondary text-center py-8">
          Chargement...
        </p>
      </div>
    );
  }

  if (!data || data.dates.length === 0) {
    return (
      <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-theme-text-primary">
            Utilisation IA dans le temps
          </h3>
        </div>
        <p className="text-theme-text-secondary text-center py-8">
          Aucune donnée d'utilisation IA sur cette période
        </p>
      </div>
    );
  }

  // Formater les dates pour l'affichage
  const formattedLabels = data.dates.map((d) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  });

  // Créer les datasets pour chaque feature
  const datasets = Object.entries(data.features).map(([feature, counts]) => {
    const colors = FEATURE_COLORS[feature] || {
      border: "#94a3b8",
      background: "rgba(148, 163, 184, 0.1)",
    };

    return {
      label: feature
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      data: counts,
      borderColor: colors.border,
      backgroundColor: colors.background,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: colors.border,
      pointBorderColor: "#fff",
      pointBorderWidth: 1,
    };
  });

  const chartData = {
    labels: formattedLabels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#94a3b8",
          padding: 12,
          font: {
            size: 11,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 43, 0.95)",
        titleColor: "#fae2be",
        bodyColor: "#fff",
        borderColor: "#f0661b",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y} requête${
              context.parsed.y > 1 ? "s" : ""
            }`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          display: true,
        },
        ticks: {
          color: "#94a3b8",
          maxRotation: 45,
          minRotation: 0,
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

  // Calcul des stats
  const totalRequests = Object.values(data.features)
    .flat()
    .reduce((sum, count) => sum + count, 0);
  const avgPerDay = (totalRequests / data.dates.length).toFixed(1);

  return (
    <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-theme-text-primary">
              Utilisation IA dans le temps
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {totalRequests} requêtes • {avgPerDay} par jour en moyenne
            </p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as 7 | 30 | 90)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                period === days
                  ? "bg-[#f0661b] text-white"
                  : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary"
              }`}
            >
              {days}j
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
