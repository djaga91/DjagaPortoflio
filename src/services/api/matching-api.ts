import { api } from "./client";
import type {
  MatchingAnalysisRequest,
  MatchingAnalysisResponse,
  JobOffer,
  SaveOfferRequest,
  ApplyToOfferRequest,
  UnsaveOfferRequest,
  UnapplyOfferRequest,
  UpdateOfferStatusRequest,
  ApplicationStatsResponse,
  JobNotificationKeyword,
  JobNotificationListResponse,
  CoverLetterGenerateRequest,
  CoverLetter,
  CoverLetterListResponse,
  InterviewAnalyzeResponse,
  PrepareFoxStartResponse,
  PrepareFoxAnswerResponse,
  PrepareFoxSessionResponse,
  PrepareFoxDifficulty,
  DiscordStatus,
  DiscordSyncResult,
} from "./types";

export const matchingAPI = {
  analyze: async (
    data: MatchingAnalysisRequest = { top_k: 15 },
  ): Promise<MatchingAnalysisResponse> => {
    const response = await api.post<MatchingAnalysisResponse>(
      "/api/matching/analyze",
      data,
    );
    return response.data;
  },
  getSavedOffers: async (): Promise<JobOffer[]> => {
    const response = await api.get<JobOffer[]>("/api/matching/saved-offers");
    return response.data;
  },
  getAllOffers: async (): Promise<JobOffer[]> => {
    const response = await api.get<JobOffer[]>("/api/matching/all-offers");
    return response.data;
  },
  saveOffer: async (data: SaveOfferRequest): Promise<JobOffer> => {
    const response = await api.post<JobOffer>("/api/matching/save-offer", data);
    return response.data;
  },
  createManualOffer: async (data: {
    title: string;
    company_name: string;
    apply_url: string;
    location?: string;
    description?: string;
    contract_type?: string;
    category?: string;
  }): Promise<JobOffer> => {
    const response = await api.post<JobOffer>(
      "/api/matching/manual-offer",
      data,
    );
    return response.data;
  },
  applyToOffer: async (data: ApplyToOfferRequest): Promise<JobOffer> => {
    const response = await api.post<JobOffer>("/api/matching/apply", data);
    return response.data;
  },
  unsaveOffer: async (data: UnsaveOfferRequest): Promise<JobOffer> => {
    const response = await api.post<JobOffer>(
      "/api/matching/unsave-offer",
      data,
    );
    return response.data;
  },
  unapplyOffer: async (data: UnapplyOfferRequest): Promise<JobOffer> => {
    const response = await api.post<JobOffer>("/api/matching/unapply", data);
    return response.data;
  },
  updateOfferStatus: async (
    data: UpdateOfferStatusRequest,
  ): Promise<JobOffer> => {
    const response = await api.put<JobOffer>(
      "/api/matching/update-status",
      data,
    );
    return response.data;
  },
  getStats: async (): Promise<ApplicationStatsResponse> => {
    const response = await api.get<ApplicationStatsResponse>(
      "/api/matching/stats",
    );
    return response.data;
  },
};

export const jobNotificationsAPI = {
  getKeywords: async (): Promise<JobNotificationKeyword[]> => {
    const response = await api.get("/api/job-notifications/keywords");
    return response.data;
  },
  addKeyword: async (keyword: string): Promise<JobNotificationKeyword> => {
    const response = await api.post("/api/job-notifications/keywords", {
      keyword,
    });
    return response.data;
  },
  updateKeyword: async (
    keywordId: string,
    isActive: boolean,
  ): Promise<JobNotificationKeyword> => {
    const response = await api.patch(
      `/api/job-notifications/keywords/${keywordId}`,
      { is_active: isActive },
    );
    return response.data;
  },
  deleteKeyword: async (keywordId: string): Promise<void> => {
    await api.delete(`/api/job-notifications/keywords/${keywordId}`);
  },
  getNotifications: async (
    limit = 20,
    offset = 0,
  ): Promise<JobNotificationListResponse> => {
    const response = await api.get("/api/job-notifications/notifications", {
      params: { limit, offset },
    });
    return response.data;
  },
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.post(
      `/api/job-notifications/notifications/${notificationId}/read`,
    );
  },
  getNotificationOffers: async (
    notificationId: string,
  ): Promise<JobOffer[]> => {
    const response = await api.get(
      `/api/job-notifications/notifications/${notificationId}/offers`,
    );
    return response.data;
  },
};

export const coverLettersAPI = {
  generate: async (data: CoverLetterGenerateRequest): Promise<CoverLetter> => {
    const response = await api.post<CoverLetter>(
      "/api/cover-letters/generate",
      data,
    );
    return response.data;
  },
  list: async (): Promise<CoverLetterListResponse> => {
    const response =
      await api.get<CoverLetterListResponse>("/api/cover-letters");
    return response.data;
  },
  get: async (id: string): Promise<CoverLetter> => {
    const response = await api.get<CoverLetter>(`/api/cover-letters/${id}`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/cover-letters/${id}`);
  },
  update: async (id: string, content: string): Promise<CoverLetter> => {
    const response = await api.put<CoverLetter>(`/api/cover-letters/${id}`, {
      content,
    });
    return response.data;
  },
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/api/cover-letters/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },
  downloadWord: async (id: string): Promise<Blob> => {
    const response = await api.get(`/api/cover-letters/${id}/word`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export const interviewAPI = {
  analyze: async (transcript: string): Promise<InterviewAnalyzeResponse> => {
    const response = await api.post<InterviewAnalyzeResponse>(
      "/api/interview/analyze",
      { transcript },
    );
    return response.data;
  },
};

export const prepareFoxAPI = {
  start: async (
    offerUrl: string,
    numQuestions: number,
    offerTitle?: string | null,
    difficulty: PrepareFoxDifficulty = "medium",
  ): Promise<PrepareFoxStartResponse> => {
    const response = await api.post<PrepareFoxStartResponse>(
      "/api/prepare-fox/start",
      {
        offer_url: offerUrl,
        num_questions: numQuestions,
        offer_title: offerTitle || undefined,
        difficulty,
      },
    );
    return response.data;
  },
  answer: async (
    sessionId: string,
    text: string,
  ): Promise<PrepareFoxAnswerResponse> => {
    const response = await api.post<PrepareFoxAnswerResponse>(
      `/api/prepare-fox/${sessionId}/answer`,
      { text },
    );
    return response.data;
  },
  transcribe: async (audioBlob: Blob): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    const response = await api.post<{ text: string }>(
      "/api/prepare-fox/transcribe",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  getSession: async (sessionId: string): Promise<PrepareFoxSessionResponse> => {
    const response = await api.get<PrepareFoxSessionResponse>(
      `/api/prepare-fox/${sessionId}`,
    );
    return response.data;
  },
};

export const discordAPI = {
  getStatus: async (): Promise<DiscordStatus> => {
    const response = await api.get("/api/discord/status");
    return response.data;
  },
  getAuthUrl: async (): Promise<{ url: string }> => {
    const response = await api.get("/api/discord/auth-url");
    return response.data;
  },
  syncRoles: async (): Promise<DiscordSyncResult> => {
    const response = await api.post("/api/discord/sync");
    return response.data;
  },
  unlink: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete("/api/discord/unlink");
    return response.data;
  },
};
