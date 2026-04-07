import { api } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  VerifyCodeRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerificationStatusResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "./types";

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignorer les erreurs réseau lors du logout
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("current_org_id");
    localStorage.removeItem("current_org_type");
    localStorage.removeItem("current_org_name");
    localStorage.removeItem("current_org_role");
    localStorage.removeItem("b2b_user_mode");
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete("/api/users/me");
  },

  deleteUserById: async (userId: string): Promise<void> => {
    await api.delete(`/api/users/${userId}`);
  },

  verifyEmailByToken: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await api.get(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    );
    return response.data;
  },

  verifyEmailByCode: async (
    data: VerifyCodeRequest,
  ): Promise<VerifyEmailResponse> => {
    const response = await api.post("/api/auth/verify-code", data);
    return response.data;
  },

  resendVerification: async (
    data: ResendVerificationRequest,
  ): Promise<ResendVerificationResponse> => {
    const response = await api.post("/api/auth/resend-verification", data);
    return response.data;
  },

  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    const response = await api.get("/api/auth/verification-status");
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/api/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> => {
    const response = await api.post("/api/auth/reset-password", data);
    return response.data;
  },

  getFeaturebaseToken: async (): Promise<{ token: string }> => {
    const response = await api.get("/api/auth/featurebase-token");
    return response.data;
  },

  updateFullName: async (data: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  }): Promise<{ message: string; user: User }> => {
    const response = await api.put("/api/auth/full-name", data);
    return response.data;
  },
};
