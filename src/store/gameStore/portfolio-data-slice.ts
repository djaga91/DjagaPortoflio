import {
  experiencesAPI,
  educationsAPI,
  projectsAPI,
  languagesAPI,
  certificationsAPI,
  interestsAPI,
  skillsAPI,
} from "../../services/api";
import type { GameState, SetState, GetState } from "./types";

type PortfolioDataSlice = Pick<
  GameState,
  | "experiences"
  | "educations"
  | "projects"
  | "languages"
  | "certifications"
  | "interests"
  | "skills"
  | "fetchExperiences"
  | "createExperience"
  | "updateExperience"
  | "deleteExperience"
  | "fetchEducations"
  | "createEducation"
  | "updateEducation"
  | "deleteEducation"
  | "fetchProjects"
  | "createProject"
  | "updateProject"
  | "deleteProject"
  | "fetchLanguages"
  | "createLanguage"
  | "updateLanguage"
  | "deleteLanguage"
  | "fetchCertifications"
  | "createCertification"
  | "deleteCertification"
  | "fetchInterests"
  | "createInterest"
  | "updateInterest"
  | "deleteInterest"
  | "fetchSkills"
  | "createSkill"
  | "updateSkill"
  | "deleteSkill"
>;

export const createPortfolioDataSlice = (
  set: SetState,
  get: GetState,
): PortfolioDataSlice => ({
  experiences: [],
  educations: [],
  projects: [],
  languages: [],
  certifications: [],
  interests: [],
  skills: [],

  // Experiences
  fetchExperiences: async () => {
    try {
      const experiences = await experiencesAPI.getAll();
      set({ experiences });
    } catch (error) {
      console.error("Erreur fetch experiences:", error);
    }
  },

  createExperience: async (data) => {
    try {
      const experience = await experiencesAPI.create(data);
      set((state) => ({ experiences: [experience, ...state.experiences] }));

      if (get().experiences.length === 1) {
        await get().addPts(50, "Première expérience ajoutée !");
        await get().unlockBadge("experienced");
      } else {
        await get().addPts(20, "Expérience ajoutée !");
      }

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ EXPÉRIENCE AJOUTÉE",
          message: `+${get().experiences.length === 1 ? 50 : 20} pts`,
        },
      });
    } catch (error) {
      console.error("Erreur create experience:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter l'expérience.",
        },
      });
    }
  },

  updateExperience: async (id, data) => {
    try {
      const updatedExperience = await experiencesAPI.update(id, data);
      set((state) => ({
        experiences: state.experiences.map((exp) =>
          exp.id === id ? updatedExperience : exp,
        ),
      }));

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ EXPÉRIENCE MODIFIÉE",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur update experience:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible de modifier l'expérience.",
        },
      });
    }
  },

  deleteExperience: async (id) => {
    try {
      await experiencesAPI.delete(id);
      set((state) => ({
        experiences: state.experiences.filter((exp) => exp.id !== id),
      }));
      set({
        activeToast: {
          type: "success",
          title: "✓ EXPÉRIENCE SUPPRIMÉE",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur delete experience:", error);
    }
  },

  // Educations
  fetchEducations: async () => {
    try {
      const educations = await educationsAPI.getAll();
      set({ educations });
    } catch (error) {
      console.error("Erreur fetch educations:", error);
    }
  },

  createEducation: async (data) => {
    try {
      const education = await educationsAPI.create(data);
      set((state) => ({ educations: [education, ...state.educations] }));

      if (get().educations.length === 1) {
        await get().addPts(40, "Première formation ajoutée !");
      } else {
        await get().addPts(15, "Formation ajoutée !");
      }

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ FORMATION AJOUTÉE",
          message: `+${get().educations.length === 1 ? 40 : 15} pts`,
        },
      });
    } catch (error) {
      console.error("Erreur create education:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter la formation.",
        },
      });
    }
  },

  updateEducation: async (id, data) => {
    try {
      const updatedEducation = await educationsAPI.update(id, data);
      set((state) => ({
        educations: state.educations.map((edu) =>
          edu.id === id ? updatedEducation : edu,
        ),
      }));

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ FORMATION MODIFIÉE",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur update education:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible de modifier la formation.",
        },
      });
    }
  },

  deleteEducation: async (id) => {
    try {
      await educationsAPI.delete(id);
      set((state) => ({
        educations: state.educations.filter((edu) => edu.id !== id),
      }));
      set({
        activeToast: {
          type: "success",
          title: "✓ FORMATION SUPPRIMÉE",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur delete education:", error);
    }
  },

  // Projects
  fetchProjects: async () => {
    try {
      const projects = await projectsAPI.getAll();
      set({ projects });
    } catch (error) {
      console.error("Erreur fetch projects:", error);
    }
  },

  createProject: async (data) => {
    try {
      const project = await projectsAPI.create(data);
      set((state) => ({ projects: [project, ...state.projects] }));

      if (get().projects.length === 1) {
        await get().addPts(35, "Premier projet ajouté !");
      } else {
        await get().addPts(15, "Projet ajouté !");
      }

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ PROJET AJOUTÉ",
          message: `+${get().projects.length === 1 ? 35 : 15} pts`,
        },
      });

      return project;
    } catch (error) {
      console.error("Erreur create project:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter le projet.",
        },
      });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    try {
      const updatedProject = await projectsAPI.update(id, data);
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj.id === id ? updatedProject : proj,
        ),
      }));

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ PROJET MODIFIÉ",
          message: "",
        },
      });
      return updatedProject;
    } catch (error) {
      console.error("Erreur update project:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible de modifier le projet.",
        },
      });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await projectsAPI.delete(id);
      set((state) => ({
        projects: state.projects.filter((proj) => proj.id !== id),
      }));
      set({
        activeToast: {
          type: "success",
          title: "✓ PROJET SUPPRIMÉ",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur delete project:", error);
    }
  },

  // Languages
  fetchLanguages: async () => {
    try {
      const languages = await languagesAPI.getAll();
      set({ languages });
    } catch (error) {
      console.error("Erreur fetch languages:", error);
    }
  },

  createLanguage: async (data) => {
    try {
      const language = await languagesAPI.create(data);
      set((state) => ({ languages: [...state.languages, language] }));

      if (get().languages.length === 1) {
        await get().addPts(10, "Première langue ajoutée !");
      } else {
        await get().addPts(5, "Langue ajoutée !");
      }

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ LANGUE AJOUTÉE",
          message: `+${get().languages.length === 1 ? 10 : 5} pts`,
        },
      });
    } catch (error) {
      console.error("Erreur create language:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter la langue.",
        },
      });
    }
  },

  updateLanguage: async (id, data) => {
    try {
      const updated = await languagesAPI.update(id, data);
      set((state) => ({
        languages: state.languages.map((lang) =>
          lang.id === id ? updated : lang,
        ),
      }));
    } catch (error) {
      console.error("Erreur update language:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible de mettre à jour le niveau.",
        },
      });
    }
  },

  deleteLanguage: async (id) => {
    try {
      await languagesAPI.delete(id);
      set((state) => ({
        languages: state.languages.filter((lang) => lang.id !== id),
      }));
      set({
        activeToast: {
          type: "success",
          title: "✓ LANGUE SUPPRIMÉE",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur delete language:", error);
    }
  },

  // Certifications
  fetchCertifications: async () => {
    try {
      const certifications = await certificationsAPI.getAll();
      set({ certifications });
    } catch (error) {
      console.error("Erreur fetch certifications:", error);
    }
  },

  createCertification: async (data) => {
    try {
      const certification = await certificationsAPI.create(data);
      set((state) => ({
        certifications: [certification, ...state.certifications],
      }));

      if (get().certifications.length === 1) {
        await get().addPts(30, "Première certification ajoutée !");
      } else {
        await get().addPts(10, "Certification ajoutée !");
      }

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ CERTIFICATION AJOUTÉE",
          message: `+${get().certifications.length === 1 ? 30 : 10} pts`,
        },
      });
    } catch (error) {
      console.error("Erreur create certification:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter la certification.",
        },
      });
    }
  },

  deleteCertification: async (id) => {
    try {
      await certificationsAPI.delete(id);
      set((state) => ({
        certifications: state.certifications.filter((cert) => cert.id !== id),
      }));
      set({
        activeToast: {
          type: "success",
          title: "✓ CERTIFICATION SUPPRIMÉE",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur delete certification:", error);
    }
  },

  // Interests
  fetchInterests: async () => {
    try {
      const interests = await interestsAPI.getAll();
      set({ interests });
    } catch (error) {
      console.error("Erreur fetch interests:", error);
    }
  },

  createInterest: async (data) => {
    try {
      const interest = await interestsAPI.create(data);
      set((state) => ({ interests: [interest, ...state.interests] }));

      if (get().interests.length === 1) {
        await get().addPts(15, "Premier centre d'intérêt ajouté !");
      } else {
        await get().addPts(5, "Centre d'intérêt ajouté !");
      }

      set({
        activeToast: {
          type: "success",
          title: "✓ CENTRE D'INTÉRÊT AJOUTÉ",
          message: `+${get().interests.length === 1 ? 15 : 5} pts`,
        },
      });
    } catch (error) {
      console.error("Erreur create interest:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter le centre d'intérêt.",
        },
      });
    }
  },

  updateInterest: async (id, data) => {
    try {
      const interest = await interestsAPI.update(id, data);
      set((state) => ({
        interests: state.interests.map((int) =>
          int.id === id ? interest : int,
        ),
      }));

      set({
        activeToast: {
          type: "success",
          title: "✓ CENTRE D'INTÉRÊT MODIFIÉ",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur update interest:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible de modifier le centre d'intérêt.",
        },
      });
    }
  },

  deleteInterest: async (id) => {
    try {
      await interestsAPI.delete(id);
      set((state) => ({
        interests: state.interests.filter((int) => int.id !== id),
      }));
      set({
        activeToast: {
          type: "success",
          title: "✓ CENTRE D'INTÉRÊT SUPPRIMÉ",
          message: "",
        },
      });
    } catch (error) {
      console.error("Erreur delete interest:", error);
    }
  },

  // Skills
  fetchSkills: async () => {
    try {
      const skills = await skillsAPI.getAll();
      set({ skills });
    } catch (error) {
      console.error("Erreur fetch skills:", error);
    }
  },

  createSkill: async (data) => {
    try {
      const skill = await skillsAPI.create(data);
      set((state) => ({ skills: [...state.skills, skill] }));

      await get().addPts(10, `Compétence ajoutée : ${data.name}`);

      window.dispatchEvent(new CustomEvent("profileUpdated"));

      set({
        activeToast: {
          type: "success",
          title: "✓ COMPÉTENCE AJOUTÉE",
          message: "+10 pts",
        },
      });
    } catch (error) {
      console.error("Erreur create skill:", error);
      set({
        activeToast: {
          type: "error",
          title: "✗ ERREUR",
          message: "Impossible d'ajouter la compétence.",
        },
      });
    }
  },

  updateSkill: async (id, data) => {
    try {
      const updated = await skillsAPI.update(id, data);
      set((state) => ({
        skills: state.skills.map((s) =>
          s.id === id ? { ...s, ...updated } : s,
        ),
      }));
    } catch (error) {
      console.error("Erreur update skill:", error);
    }
  },

  deleteSkill: async (id) => {
    try {
      await skillsAPI.delete(id);
      set((state) => ({
        skills: state.skills.filter((skill) => skill.id !== id),
      }));
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Erreur delete skill:", error);
    }
  },
});
