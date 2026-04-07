import type { StoreApi } from "zustand";
import type {
  User,
  Profile,
  Experience,
  Education,
  Project,
  Language,
  Certification,
  Interest,
  Skill,
  LoginRequest,
  RegisterRequest,
  ProfileUpdate,
  ExperienceCreate,
  ExperienceUpdate,
  EducationCreate,
  EducationUpdate,
  ProjectCreate,
  ProjectUpdate,
  LanguageCreate,
  LanguageUpdate,
  CertificationCreate,
  InterestCreate,
  InterestUpdate,
  SkillCreate,
  SkillUpdate,
} from "../../services/api";
import type {
  ViewType,
  Toast,
  GamificationStats,
  TemplateOverrides,
} from "../../types";

export type {
  User,
  Profile,
  Experience,
  Education,
  Project,
  Language,
  Certification,
  Interest,
  Skill,
  LoginRequest,
  RegisterRequest,
  ProfileUpdate,
  ExperienceCreate,
  ExperienceUpdate,
  EducationCreate,
  EducationUpdate,
  ProjectCreate,
  ProjectUpdate,
  LanguageCreate,
  LanguageUpdate,
  CertificationCreate,
  InterestCreate,
  InterestUpdate,
  SkillCreate,
  SkillUpdate,
  ViewType,
  Toast,
  GamificationStats,
  TemplateOverrides,
};

// ==================== TYPES PORTFOLIO CUSTOMIZATION ====================
export interface PortfolioSectionCustomization {
  id: string;
  label: string;
  visible: boolean;
}

export interface TemplateCustomization {
  colorTheme: "light" | "dark" | "blue" | "purple";
  fontFamily: "sans" | "serif" | "mono";
  templateFonts?: {
    titles?: string;
    subtitles?: string;
    item?: string;
    itemSmall?: string;
    body?: string;
  };
  customFonts?: Array<{ id: string; name: string; url: string }>;
  sections: PortfolioSectionCustomization[];
  projectsLayout: "grid" | "list";
  showLogos?: boolean;
  template5ColumnOrder?: {
    educationCertifications: "education_left" | "certifications_left";
    languagesInterests: "languages_left" | "interests_left";
  };
  template6_colors?: Record<string, string>;
  template6Colors?: Record<string, string>;
  selectedItems?: {
    experiences?: string[];
    educations?: string[];
    projects?: string[];
    skills?: string[];
    languages?: string[];
    certifications?: string[];
    interests?: string[];
  };
  itemOrder?: Record<string, string[]>;
  cvId?: string | null;
  cvUrl?: string | null;
}

export const DEFAULT_TEMPLATE_CUSTOMIZATION: TemplateCustomization = {
  colorTheme: "light",
  fontFamily: "sans",
  sections: [
    { id: "about", label: "À propos", visible: true },
    { id: "experiences", label: "Expériences", visible: true },
    { id: "education", label: "Formation", visible: true },
    { id: "projects", label: "Projets", visible: true },
    { id: "skills", label: "Compétences", visible: true },
    { id: "languages", label: "Langues", visible: true },
    { id: "certifications", label: "Certifications", visible: true },
    { id: "interests", label: "Centres d'intérêt", visible: true },
    { id: "contact", label: "Contact", visible: true },
  ],
  projectsLayout: "grid",
  showLogos: true,
};

export interface BosseurStreak {
  consecutive_days: number;
  target_badge_id: string;
  target_badge_name: string;
  target_days: number;
  has_streak: boolean;
  today_completed?: boolean;
}

export interface BackgroundTask {
  active: boolean;
  type: "cv_import" | "ai_processing" | "cover_letter" | null;
  message: string;
}

// Slice helper types — each slice receives set/get for the full GameState
export type SetState = StoreApi<GameState>["setState"];
export type GetState = () => GameState;

// ==================== FULL GAME STATE ====================
export interface GameState {
  // Auth
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  showLoginModal: boolean;
  pendingRedirect: ViewType | null;

  // Portfolio data
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  languages: Language[];
  certifications: Certification[];
  interests: Interest[];
  skills: Skill[];

  // Gamification
  gamification: GamificationStats;
  bosseurStreak: BosseurStreak | null;

  // UI
  view: ViewType;
  profileScrollToSection: string | null;
  studentProfilesPreselectedCohortName: string | null;
  activeToast: Toast | null;
  showConfetti: boolean;
  backgroundTask: BackgroundTask;

  // Template customization
  selectedTemplateId: string | null;
  isEditingExistingTemplate: boolean;
  portfolioTemplateOverrides: TemplateOverrides | null;
  templateCustomization: TemplateCustomization;

  // Matching
  matchingOffers: any[];
  searchQuery: string;
  contractTypeFilter: string;
  locationFilter: string;
  hasSearched: boolean;
  coverLetterOfferUrl: string | null;
  prepareFoxOffer: { offerUrl: string; offerTitle?: string } | null;

  // Auth actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setShowLoginModal: (show: boolean, redirectTo?: ViewType) => void;
  requireAuth: (action: () => void | Promise<void>) => void;

  // Profile actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  uploadPicture: (file: File) => Promise<void>;

  // Portfolio CRUD actions
  fetchExperiences: () => Promise<void>;
  createExperience: (data: ExperienceCreate) => Promise<void>;
  updateExperience: (id: string, data: ExperienceUpdate) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  fetchEducations: () => Promise<void>;
  createEducation: (data: EducationCreate) => Promise<void>;
  updateEducation: (id: string, data: EducationUpdate) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  fetchLanguages: () => Promise<void>;
  createLanguage: (data: LanguageCreate) => Promise<void>;
  updateLanguage: (id: string, data: LanguageUpdate) => Promise<void>;
  deleteLanguage: (id: string) => Promise<void>;
  fetchCertifications: () => Promise<void>;
  createCertification: (data: CertificationCreate) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  fetchInterests: () => Promise<void>;
  createInterest: (data: InterestCreate) => Promise<void>;
  updateInterest: (id: string, data: InterestUpdate) => Promise<void>;
  deleteInterest: (id: string) => Promise<void>;
  fetchSkills: () => Promise<void>;
  createSkill: (data: SkillCreate) => Promise<void>;
  updateSkill: (id: string, data: SkillUpdate) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;

  // Gamification actions
  addPts: (amount: number, reason: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  loadGamification: () => Promise<void>;
  saveGuestGamification: () => void;
  loadGuestGamification: () => boolean;
  clearGuestGamification: () => void;
  transferGuestGamification: () => Promise<void>;
  syncOnboardingProfile: (data: {
    educationDegree?: string;
    educationSchool?: string;
    projectName?: string;
    projectDescription?: string;
    interests?: string[];
    languages?: { name: string; level: string }[];
  }) => Promise<void>;

  // UI actions
  setView: (view: ViewType) => void;
  setProfileScrollToSection: (section: string | null) => void;
  setStudentProfilesPreselectedCohort: (name: string | null) => void;
  setActiveToast: (toast: Toast | null) => void;
  setGamification: (stats: GamificationStats) => void;
  setBosseurStreak: (data: BosseurStreak | null) => void;
  setShowConfetti: (show: boolean) => void;
  setBackgroundTask: (task: {
    active: boolean;
    type?: BackgroundTask["type"];
    message?: string;
  }) => void;

  // Template actions
  setSelectedTemplateId: (id: string | null) => void;
  setIsEditingExistingTemplate: (isEditing: boolean) => void;
  setPortfolioTemplateOverrides: (
    o:
      | TemplateOverrides
      | null
      | ((prev: TemplateOverrides | null) => TemplateOverrides | null),
  ) => void;
  selectTemplate: (id: string) => void;
  updateTemplateCustomization: (
    updates: Partial<TemplateCustomization>,
  ) => void;
  toggleSection: (sectionId: string) => void;
  reorderSections: (dragIndex: number, hoverIndex: number) => void;
  reorderBigSectionsTemplate4: (
    orderedBlockIds: ["experiences" | "projects" | "stack" | "contact"],
  ) => void;
  reorderSectionsTemplate5: (
    orderedBlockIds: [
      | "about"
      | "experiences"
      | "education_certifications"
      | "projects"
      | "skills"
      | "languages_interests"
      | "contact",
    ],
  ) => void;
  resetTemplateCustomization: () => void;

  // Matching actions
  setMatchingOffers: (offers: any[]) => void;
  setSearchQuery: (query: string) => void;
  setContractTypeFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
  setHasSearched: (searched: boolean) => void;
  persistMatchingResults: () => void;
  loadPersistedMatchingResults: () => void;
  setCoverLetterOfferUrl: (url: string | null) => void;
  setPrepareFoxOffer: (
    offer: { offerUrl: string; offerTitle?: string } | null,
  ) => void;

  // Init
  initialize: () => Promise<void>;
}
