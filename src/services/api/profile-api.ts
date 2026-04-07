import { api } from "./client";
import type { Profile, ProfileUpdate } from "./types";

export const profileAPI = {
  getMe: async (): Promise<Profile> => {
    const response = await api.get("/api/profiles/me");
    return response.data;
  },

  updateMe: async (data: ProfileUpdate): Promise<Profile> => {
    const response = await api.put("/api/profiles/me", data);
    return response.data;
  },

  uploadPicture: async (
    file: File,
  ): Promise<{ profile_picture_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      "/api/profiles/me/upload-picture",
      formData,
    );
    return response.data;
  },

  getStorageUsage: async (): Promise<{
    used_bytes: number;
    limit_bytes: number;
    usage_percent: number;
  }> => {
    const response = await api.get("/api/profiles/me/storage-usage");
    return response.data;
  },

  getPublicProfile: async (username: string) => {
    const response = await api.get(`/api/profiles/u/${username}`, {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  getStudentFullProfileForCompany: async (userId: string) => {
    const response = await api.get(`/api/profiles/b2b/students/${userId}`);
    return response.data;
  },
};
