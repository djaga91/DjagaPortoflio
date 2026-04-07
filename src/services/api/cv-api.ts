import { api } from "./client";
import { API_URL } from "./client";
import type {
  CVSelectionRequest,
  CVItemsResponse,
  CVPreviewResponse,
  CVGenerateResponse,
  CVLayoutItem,
  CVInfo,
  CVListResponse,
  OnboardingStepData,
  OnboardingStepResponse,
  GenerateDescriptionResponse,
  OnboardingSession,
  RewriteDescriptionResponse,
} from "./types";

export const cvAPI = {
  listItems: async (): Promise<CVItemsResponse> => {
    const response = await api.get("/api/cv/items");
    return response.data;
  },
  preview: async (
    selection: CVSelectionRequest,
    template: string = "modern",
    primary_color: string = "#2563eb",
    secondary_color?: string,
    show_photo?: boolean,
    show_skills_on_items?: boolean,
  ): Promise<CVPreviewResponse> => {
    const params: any = { template, primary_color };
    if (secondary_color) params.secondary_color = secondary_color;
    if (show_photo !== undefined)
      params.show_photo = show_photo ? "true" : "false";
    if (show_skills_on_items !== undefined)
      params.show_skills_on_items = show_skills_on_items ? "true" : "false";
    const response = await api.post("/api/cv/preview", selection, {
      params,
      responseType: "text",
    });
    return { html: response.data as string };
  },
  generate: async (
    selection: CVSelectionRequest,
    template: string = "modern",
    format: "pdf" | "png" = "pdf",
    primary_color: string = "#2563eb",
    secondary_color?: string,
    smart_scale: boolean = false,
    target_zoom?: number,
    show_photo?: boolean,
    show_skills_on_items?: boolean,
  ): Promise<CVGenerateResponse> => {
    const params: any = { template, format, primary_color };
    if (secondary_color) params.secondary_color = secondary_color;
    if (smart_scale) params.smart_scale = "true";
    if (show_photo !== undefined)
      params.show_photo = show_photo ? "true" : "false";
    if (show_skills_on_items !== undefined)
      params.show_skills_on_items = show_skills_on_items ? "true" : "false";
    if (target_zoom !== undefined && target_zoom < 1.0)
      params.target_zoom = target_zoom.toString();
    const response = await api.post("/api/cv/generate", selection, { params });
    return response.data;
  },
  listTemplates: async (): Promise<{
    templates: string[];
    default: string;
  }> => {
    const response = await api.get("/api/cv/templates");
    return response.data;
  },
  getPreferences: async (): Promise<{
    template: string;
    primary_color: string;
    secondary_color?: string;
    layout?: CVLayoutItem[];
  } | null> => {
    const response = await api.get("/api/cv/preferences");
    return response.data;
  },
  savePreferences: async (data: {
    template?: string;
    primary_color?: string;
    secondary_color?: string;
    layout?: CVLayoutItem[];
  }): Promise<void> => {
    await api.post("/api/cv/preferences", data);
  },
  getLatest: async (): Promise<CVInfo> => {
    const response = await api.get<CVInfo>("/api/cv/latest");
    return response.data;
  },
  list: async (): Promise<CVListResponse> => {
    const response = await api.get<CVListResponse>("/api/cv/list");
    return response.data;
  },
  rename: async (
    cvId: string,
    newName: string,
  ): Promise<{
    success: boolean;
    message: string;
    cv: { id: string; name: string };
  }> => {
    const response = await api.put(`/api/cv/${cvId}/rename`, {
      new_name: newName,
    });
    return response.data;
  },
  delete: async (
    cvId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/cv/${cvId}`);
    return response.data;
  },
  view: async (): Promise<string> => {
    return `${API_URL}/api/cv/view`;
  },
  download: async (): Promise<Blob> => {
    const response = await api.get("/api/cv/download", {
      responseType: "blob",
    });
    return response.data;
  },
};

export const onboardingAPI = {
  saveStep: async (
    guestId: string,
    step: number,
    data: OnboardingStepData,
  ): Promise<OnboardingStepResponse> => {
    const response = await api.post("/api/onboarding/step", {
      guest_id: guestId,
      step,
      data,
    });
    return response.data;
  },
  generateDescription: async (
    guestId: string,
    jobTitle: string,
    company: string,
  ): Promise<GenerateDescriptionResponse> => {
    const response = await api.post("/api/onboarding/generate-description", {
      guest_id: guestId,
      job_title: jobTitle,
      company,
    });
    return response.data;
  },
  getSession: async (guestId: string): Promise<OnboardingSession> => {
    const response = await api.get(`/api/onboarding/${guestId}`);
    return response.data;
  },
  deleteSession: async (guestId: string): Promise<void> => {
    await api.delete(`/api/onboarding/${guestId}`);
  },
};

export const aiAPI = {
  rewriteDescription: async (params: {
    source_text: string;
    entity_type: "experience" | "education" | "project";
    title?: string | null;
    organization?: string | null;
  }): Promise<RewriteDescriptionResponse> => {
    const response = await api.post<RewriteDescriptionResponse>(
      "/api/ai/rewrite-description",
      {
        source_text: params.source_text,
        entity_type: params.entity_type,
        title: params.title ?? undefined,
        organization: params.organization ?? undefined,
      },
    );
    return response.data;
  },
  rewriteAsBullets: async (
    source_text: string,
  ): Promise<{ bullets: string[] }> => {
    const response = await api.post<{ bullets: string[] }>(
      "/api/ai/rewrite-as-bullets",
      { source_text },
    );
    return response.data;
  },
};
