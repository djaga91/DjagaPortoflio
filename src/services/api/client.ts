import axios, { AxiosError } from "axios";

const _raw = import.meta.env.VITE_API_URL;
export const API_URL =
  _raw === ""
    ? ""
    : _raw === undefined
      ? "http://localhost:8000"
      : String(_raw).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthProbe =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/me");

      if (!isAuthProbe) {
        console.error("Token invalide - Déconnexion");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Retry une requete avec backoff exponentiel.
 * Utile quand le backend a une limite de concurrence et retourne 503.
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;
      const axiosError = error as AxiosError;
      if (
        axiosError.response?.status !== 503 &&
        axiosError.code !== "ERR_NETWORK"
      ) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};
