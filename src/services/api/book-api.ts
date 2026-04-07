import { api } from "./client";

export const bookAPI = {
  uploadPage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/book/pages/upload", formData);
    return response.data;
  },
  listPages: async () => {
    const response = await api.get("/api/book/pages");
    return response.data;
  },
  updatePage: async (
    pageId: string,
    data: { caption?: string; page_order?: number },
  ) => {
    const response = await api.put(`/api/book/pages/${pageId}`, data);
    return response.data;
  },
  deletePage: async (pageId: string) => {
    await api.delete(`/api/book/pages/${pageId}`);
  },
  bulkDeletePages: async (pageIds: string[]): Promise<{ deleted: number }> => {
    const response = await api.post("/api/book/pages/bulk-delete", {
      page_ids: pageIds,
    });
    return response.data;
  },
  deleteAllPages: async (): Promise<{ deleted: number }> => {
    const response = await api.delete("/api/book/pages/all");
    return response.data;
  },
  reorderPages: async (pageIds: string[]) => {
    const response = await api.post("/api/book/pages/reorder", {
      page_ids: pageIds,
    });
    return response.data;
  },
  getLimits: async () => {
    const response = await api.get("/api/book/limits");
    return response.data;
  },
  getConfig: async () => {
    const response = await api.get("/api/book/config");
    return response.data;
  },
  updateConfig: async (data: Record<string, unknown>) => {
    const response = await api.put("/api/book/config", data);
    return response.data;
  },
  getPublicBook: async (username: string) => {
    const response = await api.get(`/api/book/public/${username}`);
    return response.data;
  },
  createCheckout: async () => {
    const response = await api.post("/api/payments/book-addon/checkout");
    return response.data;
  },
  getAddonStatus: async () => {
    const response = await api.get("/api/payments/book-addon/status");
    return response.data;
  },
};
