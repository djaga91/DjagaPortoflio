import { api } from "./client";
import type {
  AdminUsersResponse,
  DashboardCard,
  MarketingCampaign,
  CampaignCreateRequest,
  CampaignUpdateRequest,
  CampaignStats,
  QRCodeData,
} from "./types";

export const adminAPI = {
  getUsers: async (
    params: {
      page?: number;
      per_page?: number;
      sort_order?: "asc" | "desc";
      search?: string;
      tier?: string;
      exclude_test?: boolean;
    } = {},
  ): Promise<AdminUsersResponse> => {
    const response = await api.get("/api/admin/users", { params });
    return response.data;
  },

  toggleTestAccount: async (
    userId: string,
  ): Promise<{
    user_id: string;
    is_test_account: boolean;
    message: string;
  }> => {
    const response = await api.patch(`/api/admin/users/${userId}/test-tag`);
    return response.data;
  },

  getUserAddons: async (userId: string) => {
    const response = await api.get(`/api/admin/users/${userId}/addons`);
    return response.data;
  },

  grantAddon: async (userId: string, addonType: string) => {
    const response = await api.post(`/api/admin/users/${userId}/addons`, {
      addon_type: addonType,
    });
    return response.data;
  },

  revokeAddon: async (userId: string, addonType: string) => {
    const response = await api.delete(
      `/api/admin/users/${userId}/addons/${addonType}`,
    );
    return response.data;
  },
};

export const adminAnalyticsAPI = {
  getEngagement: async (periodDays = 30) => {
    const response = await api.get("/api/admin/analytics/engagement", {
      params: { period_days: periodDays },
    });
    return response.data;
  },
  getRetention: async (weeks = 8) => {
    const response = await api.get("/api/admin/analytics/retention", {
      params: { weeks },
    });
    return response.data;
  },
  getFunnel: async () => {
    const response = await api.get("/api/admin/analytics/funnel");
    return response.data;
  },
  getActivityFeed: async (limit = 50) => {
    const response = await api.get("/api/admin/analytics/activity-feed", {
      params: { limit },
    });
    return response.data;
  },
  getLoginMethods: async (periodDays = 30) => {
    const response = await api.get("/api/admin/analytics/login-methods", {
      params: { period_days: periodDays },
    });
    return response.data;
  },
  getContentTimeline: async (periodDays = 30) => {
    const response = await api.get("/api/admin/analytics/content-timeline", {
      params: { period_days: periodDays },
    });
    return response.data;
  },
  getTopActive: async (limit = 20, periodDays = 30) => {
    const response = await api.get("/api/admin/analytics/top-active", {
      params: { limit, period_days: periodDays },
    });
    return response.data;
  },
  getGrowth: async (periodDays = 90) => {
    const response = await api.get("/api/admin/analytics/growth", {
      params: { period_days: periodDays },
    });
    return response.data;
  },
  getPerformance: async (minutes = 60) => {
    const response = await api.get("/api/admin/analytics/performance", {
      params: { minutes },
    });
    return response.data;
  },
};

export const dashboardConfigAPI = {
  getCards: async (): Promise<DashboardCard[]> => {
    const response = await api.get("/api/dashboard-config/cards");
    return response.data;
  },
  getAllCards: async (): Promise<DashboardCard[]> => {
    const response = await api.get("/api/dashboard-config/cards/all");
    return response.data;
  },
  updateCard: async (
    cardId: string,
    data: Partial<
      Pick<
        DashboardCard,
        "is_enabled" | "display_order" | "column_span" | "config"
      >
    >,
  ): Promise<DashboardCard> => {
    const response = await api.patch(
      `/api/dashboard-config/cards/${cardId}`,
      data,
    );
    return response.data;
  },
  toggleCard: async (cardId: string): Promise<DashboardCard> => {
    const response = await api.post(
      `/api/dashboard-config/cards/${cardId}/toggle`,
    );
    return response.data;
  },
  reorderCards: async (
    cardIds: string[],
  ): Promise<{ message: string; count: number }> => {
    const response = await api.post("/api/dashboard-config/cards/reorder", {
      card_ids: cardIds,
    });
    return response.data;
  },
  resetCards: async (): Promise<{ message: string; count: number }> => {
    const response = await api.post("/api/dashboard-config/cards/reset");
    return response.data;
  },
};

export const campaignsAPI = {
  create: async (data: CampaignCreateRequest): Promise<MarketingCampaign> => {
    const response = await api.post("/api/campaigns/create", data);
    return response.data;
  },
  list: async (
    skip = 0,
    limit = 50,
  ): Promise<{ campaigns: MarketingCampaign[]; total: number }> => {
    const response = await api.get("/api/campaigns/list", {
      params: { skip, limit },
    });
    return response.data;
  },
  get: async (campaignId: string): Promise<MarketingCampaign> => {
    const response = await api.get(`/api/campaigns/${campaignId}`);
    return response.data;
  },
  getStats: async (campaignId: string, days = 7): Promise<CampaignStats> => {
    const response = await api.get(`/api/campaigns/${campaignId}/stats`, {
      params: { days },
    });
    return response.data;
  },
  update: async (
    campaignId: string,
    data: CampaignUpdateRequest,
  ): Promise<MarketingCampaign> => {
    const response = await api.put(`/api/campaigns/${campaignId}`, data);
    return response.data;
  },
  delete: async (campaignId: string): Promise<void> => {
    await api.delete(`/api/campaigns/${campaignId}`);
  },
  getQRData: async (campaignId: string): Promise<QRCodeData> => {
    const response = await api.get(`/api/campaigns/${campaignId}/qr`);
    return response.data;
  },
};
