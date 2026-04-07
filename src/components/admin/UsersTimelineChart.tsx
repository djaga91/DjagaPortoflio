/**
 * UsersTimelineChart - Graphique des nouveaux utilisateurs inscrits par jour
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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";
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
  Filler,
);

interface TimelineData {
  dates: string[];
  counts: number[];
  period_days: number;
}

export const UsersTimelineChart: React.FC = () => {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/admin/stats/users/timeline?days=${period}`,
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch users timeline:", error);
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

  if (!data) {
    return (
      <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
        <p className="text-theme-text-secondary text-center py-8">
          Erreur de chargement
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

  const chartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: "Nouveaux utilisateurs",
        data: data.counts,
        borderColor: "#f0661b",
        backgroundColor: "rgba(240, 102, 27, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#f0661b",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${context.parsed.y} inscription${context.parsed.y > 1 ? "s" : ""}`;
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
  const totalSignups = data.counts.reduce((sum, count) => sum + count, 0);
  const avgPerDay = (totalSignups / data.counts.length).toFixed(1);

  return (
    <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-theme-text-primary">
              Nouveaux utilisateurs
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {totalSignups} inscriptions • {avgPerDay} par jour en moyenne
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
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
