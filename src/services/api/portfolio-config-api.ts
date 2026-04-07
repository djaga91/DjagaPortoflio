import { api } from "./client";
import { API_URL } from "./client";
import { PortfolioConfig } from "../../types";

export const portfolioAPI = {
  getConfig: async (): Promise<PortfolioConfig> => {
    const response = await api.get<PortfolioConfig>("/api/portfolio/config");
    return response.data;
  },

  saveConfig: async (config: PortfolioConfig): Promise<PortfolioConfig> => {
    const response = await api.put<PortfolioConfig>(
      "/api/portfolio/config",
      config,
    );
    return response.data;
  },

  getPreview: async (config?: PortfolioConfig): Promise<string> => {
    const response = await api.post<string>(
      "/api/portfolio/preview",
      config || {},
      {
        responseType: "text",
      },
    );
    return response.data;
  },

  uploadHeroImage: async (file: File): Promise<{ hero_image_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ hero_image_url: string }>(
      "/api/portfolio/upload-hero-image",
      formData,
    );
    return response.data;
  },

  uploadAboutImage: async (
    file: File | FormData,
  ): Promise<{ about_image_url: string }> => {
    const formData =
      file instanceof FormData
        ? file
        : (() => {
            const fd = new FormData();
            fd.append("file", file);
            return fd;
          })();
    const response = await api.post<{ about_image_url: string }>(
      "/api/portfolio/upload-about-image",
      formData,
    );
    return response.data;
  },

  uploadFont: async (
    file: File,
  ): Promise<{ url: string; suggestedName: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ url: string; suggestedName: string }>(
      "/api/portfolio/upload-font",
      formData,
    );
    return response.data;
  },

  uploadCustomCv: async (file: File): Promise<{ cv_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ cv_url: string }>(
      "/api/portfolio/upload-custom-cv",
      formData,
    );
    return response.data;
  },

  downloadExport: async (
    templateId?: string,
    templateOverrides?: Record<string, unknown> | null,
  ): Promise<void> => {
    const hasOverrides =
      templateOverrides != null && Object.keys(templateOverrides).length > 0;
    const response = hasOverrides
      ? await api.post<Blob>(
          "/api/portfolio/export-zip",
          {
            template: templateId ?? undefined,
            template_overrides: templateOverrides,
          },
          { responseType: "blob" },
        )
      : await api.get<Blob>("/api/portfolio/export", {
          responseType: "blob",
          params: templateId ? { template: templateId } : undefined,
        });
    const blob = response.data as Blob;
    const header = await blob.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(header);
    const isZip = bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
    if (!isZip && blob.size > 0) {
      const preview = await blob.slice(0, 200).text();
      if (
        preview.trimStart().startsWith("<!") ||
        preview.includes("</html>") ||
        preview.includes("vite") ||
        preview.includes("react-refresh")
      ) {
        throw new Error(
          `Le serveur a renvoyé une page web au lieu du fichier ZIP. Vérifiez que l'API est bien joignable (${API_URL || "URL non configurée"}).`,
        );
      }
    }
    const disposition = response.headers["content-disposition"];
    let filename = "portfolio-export.zip";
    if (typeof disposition === "string" && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^";\n]+)"?/);
      if (match) filename = match[1].trim();
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
