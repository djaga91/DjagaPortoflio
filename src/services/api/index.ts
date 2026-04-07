export { api, API_URL, retryWithBackoff } from "./client";

export type * from "./types";

export { authAPI } from "./auth-api";
export { profileAPI } from "./profile-api";
export {
  experiencesAPI,
  skillsAPI,
  educationsAPI,
  projectsAPI,
  languagesAPI,
  certificationsAPI,
  interestsAPI,
} from "./portfolio-api";
export { gamificationAPI } from "./gamification-api";
export { cvAPI, onboardingAPI, aiAPI } from "./cv-api";
export {
  matchingAPI,
  jobNotificationsAPI,
  coverLettersAPI,
  interviewAPI,
  prepareFoxAPI,
  discordAPI,
} from "./matching-api";
export { portfolioAPI } from "./portfolio-config-api";
export {
  organizationsAPI,
  schoolStudentAPI,
  logoAPI,
} from "./organizations-api";
export {
  adminAPI,
  adminAnalyticsAPI,
  dashboardConfigAPI,
  campaignsAPI,
} from "./admin-api";
export { bookAPI } from "./book-api";
