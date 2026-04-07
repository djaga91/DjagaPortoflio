import { api } from "./client";
import type {
  GamificationStats,
  AddXPResponse,
  UnlockBadgeResponse,
} from "./types";

export const gamificationAPI = {
  getStats: async (): Promise<GamificationStats> => {
    const response = await api.get("/api/gamification/stats");
    return response.data;
  },
  recalculate: async (): Promise<{
    old_xp: number;
    new_xp: number;
    xp_gained: number;
    level: number;
    badges: string[];
  }> => {
    const response = await api.post("/api/gamification/recalculate");
    return response.data;
  },
  addXP: async (amount: number, reason: string): Promise<AddXPResponse> => {
    const response = await api.post("/api/gamification/xp", { amount, reason });
    return response.data;
  },
  unlockBadge: async (badgeId: string): Promise<UnlockBadgeResponse> => {
    const response = await api.post("/api/gamification/badge", {
      badge_id: badgeId,
    });
    return response.data;
  },
  updateStreak: async (): Promise<{
    streak: number;
    last_activity: string;
  }> => {
    const response = await api.post("/api/gamification/streak");
    return response.data;
  },
  getCompleteness: async (): Promise<{
    score: number;
    level: string;
    next_milestone: {
      id: string;
      name: string;
      description: string;
      icon: string;
      weight: number;
      progress: number;
    } | null;
    milestones: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      weight: number;
      achieved: boolean;
      progress: number;
    }>;
  }> => {
    const response = await api.get("/api/gamification/completeness");
    return response.data;
  },
  getBadges: async (): Promise<{
    earned: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      rarity: string;
      xp_reward: number;
      criteria: string;
    }>;
    available: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      rarity: string;
      xp_reward: number;
      criteria: string;
    }>;
    total: number;
    earned_count: number;
    bosseur_streak?: {
      consecutive_days: number;
      target_badge_id: string;
      target_badge_name: string;
      target_days: number;
      has_streak: boolean;
      today_completed?: boolean;
    };
  }> => {
    const response = await api.get("/api/gamification/badges");
    return response.data;
  },
  getBosseurStreak: async (): Promise<{
    consecutive_days: number;
    target_badge_id: string;
    target_badge_name: string;
    target_days: number;
    has_streak: boolean;
    today_completed?: boolean;
  }> => {
    const response = await api.get("/api/gamification/bosseur-streak");
    return response.data;
  },
  checkBadges: async (): Promise<{
    new_badges: Array<{
      id: string;
      name: string;
      icon: string;
      xp_reward: number;
    }>;
    total_xp_earned: number;
  }> => {
    const response = await api.post("/api/gamification/badges/check");
    return response.data;
  },
  getDashboard: async (): Promise<{
    xp: number;
    level: number;
    xp_progress: number;
    xp_needed: number;
    xp_percent: number;
    completeness: {
      score: number;
      level: string;
      next_milestone: {
        id: string;
        name: string;
        description: string;
        icon: string;
      } | null;
    };
    badges: {
      earned_count: number;
      total: number;
      recent: Array<{ id: string; name: string; icon: string }>;
    };
  }> => {
    const response = await api.get("/api/gamification/dashboard");
    return response.data;
  },
  completeDailyObjectives: async (): Promise<{
    success: boolean;
    date: string;
    consecutive_days: number;
    new_badges: Array<{
      id: string;
      name: string;
      icon: string;
      xp_reward: number;
    }>;
    message?: string;
    bosseur_streak?: {
      consecutive_days: number;
      target_badge_id: string;
      target_badge_name: string;
      target_days: number;
      has_streak: boolean;
      today_completed?: boolean;
    };
  }> => {
    const response = await api.post(
      "/api/gamification/daily-objectives/complete",
    );
    return response.data;
  },
};
