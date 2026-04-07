import { api } from "./client";
import { retryWithBackoff } from "./client";
import type {
  Organization,
  MySchoolResponse,
  RankingResponse,
  WallOfFameResponse,
  PeerBadgesResponse,
} from "./types";

export const organizationsAPI = {
  getMyOrganizations: async (): Promise<{
    items: Organization[];
    total: number;
  }> => {
    return retryWithBackoff(
      async () => {
        const response = await api.get("/api/organizations/me/all");
        return response.data;
      },
      3,
      500,
    );
  },

  getOrganization: async (orgId: string): Promise<Organization> => {
    const response = await api.get(`/api/organizations/${orgId}`);
    return response.data;
  },

  getOrganizationStats: async (orgId: string): Promise<any> => {
    const response = await api.get(`/api/organizations/${orgId}/stats`);
    return response.data;
  },

  setCurrentOrganization: (org: Organization | null) => {
    if (org) {
      localStorage.setItem("current_org_id", org.id);
      localStorage.setItem("current_org_type", org.type);
      localStorage.setItem("current_org_name", org.name);
      if (org.user_role) {
        localStorage.setItem("current_org_role", org.user_role);
      }
    } else {
      localStorage.removeItem("current_org_id");
      localStorage.removeItem("current_org_type");
      localStorage.removeItem("current_org_name");
      localStorage.removeItem("current_org_role");
    }
  },

  getCurrentOrganization: (): {
    id: string;
    type: "school" | "company";
    name: string;
    role: string | null;
  } | null => {
    const id = localStorage.getItem("current_org_id");
    const type = localStorage.getItem("current_org_type") as
      | "school"
      | "company"
      | null;
    const name = localStorage.getItem("current_org_name");
    const role = localStorage.getItem("current_org_role");

    if (id && type && name) {
      return { id, type, name, role };
    }
    return null;
  },
};

export const schoolStudentAPI = {
  getMySchool: async (): Promise<MySchoolResponse> => {
    const response = await api.get("/api/organizations/me/school");
    return response.data;
  },
  getRanking: async (scope: "cohort" | "school"): Promise<RankingResponse> => {
    const response = await api.get("/api/organizations/me/school/ranking", {
      params: { scope },
    });
    return response.data;
  },
  getWallOfFame: async (
    scope: "cohort" | "school",
  ): Promise<WallOfFameResponse> => {
    const response = await api.get(
      "/api/organizations/me/school/wall-of-fame",
      { params: { scope } },
    );
    return response.data;
  },
  getPeerBadges: async (userId: string): Promise<PeerBadgesResponse> => {
    const response = await api.get("/api/school-student/peer-badges", {
      params: { user_id: userId },
    });
    return response.data;
  },
  setWallOfFameVisibility: async (
    visible: boolean,
  ): Promise<{ wall_of_fame_show_employer: boolean }> => {
    const response = await api.get(
      "/api/organizations/me/school/wall-of-fame-visibility",
      {
        params: { visible },
      },
    );
    return response.data;
  },
};

export const logoAPI = {
  checkDomain: async (domain: string): Promise<{ url: string | null }> => {
    const response = await api.get<{ url: string | null }>("/api/logo/check", {
      params: { domain },
    });
    return response.data;
  },
};
