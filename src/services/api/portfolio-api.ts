import { api } from "./client";
import type {
  Experience,
  ExperienceCreate,
  ExperienceUpdate,
  Skill,
  SkillCreate,
  SkillUpdate,
  Education,
  EducationCreate,
  EducationUpdate,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Language,
  LanguageCreate,
  LanguageUpdate,
  Certification,
  CertificationCreate,
  CertificationUpdate,
  Interest,
  InterestCreate,
  InterestUpdate,
} from "./types";

export const experiencesAPI = {
  getAll: async (): Promise<Experience[]> => {
    const response = await api.get("/api/experiences");
    return response.data;
  },
  getOne: async (id: string): Promise<Experience> => {
    const response = await api.get(`/api/experiences/${id}`);
    return response.data;
  },
  create: async (data: ExperienceCreate): Promise<Experience> => {
    const response = await api.post("/api/experiences", data);
    return response.data;
  },
  update: async (id: string, data: ExperienceUpdate): Promise<Experience> => {
    const response = await api.put(`/api/experiences/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/experiences/${id}`);
  },
};

export const skillsAPI = {
  getAll: async (): Promise<Skill[]> => {
    const response = await api.get("/api/skills");
    return response.data;
  },
  getOne: async (id: string): Promise<Skill> => {
    const response = await api.get(`/api/skills/${id}`);
    return response.data;
  },
  create: async (data: SkillCreate): Promise<Skill> => {
    const response = await api.post("/api/skills", data);
    return response.data;
  },
  update: async (id: string, data: SkillUpdate): Promise<Skill> => {
    const response = await api.put(`/api/skills/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/skills/${id}`);
  },
  extractFromProfile: async (): Promise<{
    message: string;
    new_skills: string[];
    total_skills: number;
  }> => {
    const response = await api.post("/api/skills/extract-from-profile");
    return response.data;
  },
};

export const educationsAPI = {
  getAll: async (): Promise<Education[]> => {
    const response = await api.get("/api/educations");
    return response.data;
  },
  getOne: async (id: string): Promise<Education> => {
    const response = await api.get(`/api/educations/${id}`);
    return response.data;
  },
  create: async (data: EducationCreate): Promise<Education> => {
    const response = await api.post("/api/educations", data);
    return response.data;
  },
  update: async (id: string, data: EducationUpdate): Promise<Education> => {
    const response = await api.put(`/api/educations/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/educations/${id}`);
  },
};

export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get("/api/projects");
    return response.data;
  },
  getOne: async (id: string): Promise<Project> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },
  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await api.post("/api/projects", data);
    return response.data;
  },
  update: async (id: string, data: ProjectUpdate): Promise<Project> => {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
  uploadImage: async (
    projectId: string,
    file: File,
  ): Promise<{ url_image: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/api/projects/${projectId}/upload-image`,
      formData,
    );
    return response.data;
  },
};

export const languagesAPI = {
  getAll: async (): Promise<Language[]> => {
    const response = await api.get("/api/languages");
    return response.data;
  },
  getOne: async (id: string): Promise<Language> => {
    const response = await api.get(`/api/languages/${id}`);
    return response.data;
  },
  create: async (data: LanguageCreate): Promise<Language> => {
    const response = await api.post("/api/languages", data);
    return response.data;
  },
  update: async (id: string, data: LanguageUpdate): Promise<Language> => {
    const response = await api.put(`/api/languages/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/languages/${id}`);
  },
};

export const certificationsAPI = {
  getAll: async (): Promise<Certification[]> => {
    const response = await api.get("/api/certifications");
    return response.data;
  },
  getOne: async (id: string): Promise<Certification> => {
    const response = await api.get(`/api/certifications/${id}`);
    return response.data;
  },
  create: async (data: CertificationCreate): Promise<Certification> => {
    const response = await api.post("/api/certifications", data);
    return response.data;
  },
  update: async (
    id: string,
    data: CertificationUpdate,
  ): Promise<Certification> => {
    const response = await api.put(`/api/certifications/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/certifications/${id}`);
  },
};

export const interestsAPI = {
  getAll: async (): Promise<Interest[]> => {
    const response = await api.get("/api/interests");
    return response.data;
  },
  getOne: async (id: string): Promise<Interest> => {
    const response = await api.get(`/api/interests/${id}`);
    return response.data;
  },
  create: async (data: InterestCreate): Promise<Interest> => {
    const response = await api.post("/api/interests", data);
    return response.data;
  },
  update: async (id: string, data: InterestUpdate): Promise<Interest> => {
    const response = await api.put(`/api/interests/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/interests/${id}`);
  },
};
