/**
 * Types TypeScript - Frontend Game
 *
 * Séparation :
 * - Types backend réels (User, Profile, Experience, Skill)
 * - Types gamification simulée (Badge, Quest, Toast)
 */

// ==================== TYPES BACKEND (RÉELS) ====================

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  is_superuser: boolean;
  is_active: boolean;
  email_verified: boolean;
  tier: "free" | "pro" | "enterprise";
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  bio: string | null;
  title: string | null;
  location: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  google_access_token?: string | null; // Utilisé pour détecter si Google est lié
  portfolio_url: string | null;
  profile_picture_url: string | null;
  completeness: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[] | null;
  technologies: string[] | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  level: string | null;
  years_experience: number | null;
  order: number;
}

export interface Education {
  id: string;
  user_id: string;
  degree: string;
  school: string;
  location: string | null;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  grade: string | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  url_demo: string | null;
  url_github: string | null;
  url_image: string | null;
  project_icon: string | null; // Emoji ou nom d'icône (ex: "🚀", "code", "web")
  order: number;
  technologies: string[];
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: string;
  user_id: string;
  name: string;
  level: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  date_obtained: string;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  offer_url: string;
  content: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error_message: string | null;
  short_version?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CVInfo {
  has_cv: boolean;
  cv_url: string | null;
  generated_at: string | null;
}

// ==================== TYPES GAMIFICATION (SIMULÉS) ====================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  pts: number;
  completed: boolean;
  category: "daily" | "profile" | "cv";
}

export interface GamificationStats {
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  last_activity: string;
  xp_to_next_level: number;
}

// ==================== COMPLÉTUDE & JALONS ====================

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  weight: number;
  achieved: boolean;
  progress: number;
}

export interface ProfileCompleteness {
  score: number;
  level: string;
  next_milestone: Milestone | null;
  milestones: Milestone[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "profile"
    | "career"
    | "skills"
    | "social"
    | "creator"
    | "milestone";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  xp_reward: number;
  criteria: string;
}

export interface UserBadges {
  earned: Badge[];
  available: Badge[];
  total: number;
  earned_count: number;
}

export interface GamificationDashboard {
  xp: number;
  level: number;
  xp_progress: number;
  xp_needed: number;
  xp_percent: number;
  completeness: {
    score: number;
    level: string;
    next_milestone: Milestone | null;
  };
  badges: {
    earned_count: number;
    total: number;
    recent: Badge[];
  };
}

// ==================== TYPES UI ====================

export type ViewType =
  | "landing"
  | "login"
  | "onboarding"
  | "onboarding_flow"
  | "dashboard"
  | "profile"
  | "profile_editor"
  | "portfolio"
  | "public_portfolio"
  | "cv_forge"
  | "cv_template_selection"
  | "cv_generate"
  | "cv_generator"
  | "cv_import"
  | "fox_interview"
  | "prepare_fox"
  | "cover_letters"
  | "documents"
  | "matching"
  | "mes_offres"
  | "applications"
  | "application_stats"
  | "events"
  | "debug"
  | "legal"
  | "verify_email"
  | "forgot_password"
  | "reset_password"
  | "admin"
  | "admin_users"
  | "settings"
  | "notifications"
  | "messages"
  | "school_dashboard"
  | "company_dashboard"
  | "cohorts"
  | "partnerships"
  | "invite_members"
  | "jobs"
  | "student_search"
  | "analytics"
  | "partner_jobs"
  | "student_profiles"
  | "login_school"
  | "login_company"
  | "template_editor"
  | "templates_list"
  | "join_organization"
  | "invite_codes"
  | "schools_landing"
  | "companies_landing"
  | "pricing"
  | "demo_request"
  | "insertion_form"
  | "insertion_exports"
  | "survey_landing"
  | "survey_campaigns"
  | "my_school"
  | "campaigns_admin"
  | "admin_analytics"
  | "book_editor"
  | "public_book";

// ==================== TYPES BOOK PORTFOLIO ====================

export interface BookPage {
  id: string;
  user_id: string;
  url: string;
  thumbnail_url: string | null;
  original_filename: string | null;
  caption: string | null;
  page_order: number;
  created_at: string;
}

export interface BookConfig {
  palette: {
    background: string;
    text: string;
    accent: string;
    page: string;
  };
  font_title: string;
  font_body: string;
  title: string;
  subtitle: string;
  contact_email: string;
  contact_phone: string;
  show_badges: boolean;
  show_cv_button: boolean;
  cv_id: string | null;
  dark_mode: boolean;
}

export interface BookLimits {
  current_count: number;
  max_pages: number;
  has_addon: boolean;
  tier: string;
}

// ==================== TYPES DISCORD ====================

export interface DiscordStatus {
  linked: boolean;
  discord_id: string | null;
  discord_username: string | null;
  message: string;
}

export interface DiscordSyncResult {
  success: boolean;
  roles_added: string[];
  roles_removed: string[];
  current_roles: string[];
  message: string;
}

export interface Toast {
  type:
    | "success"
    | "error"
    | "warning"
    | "xp"
    | "level_up"
    | "badge"
    | "cv_import";
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  points?: number;
  onClick?: () => void;
  persistent?: boolean; // Si true, ne disparaît pas automatiquement
  stats?: {
    created: number;
    updated: number;
    skills: number;
  };
}

export interface OracleMessage {
  role: "user" | "model";
  text: string;
  timestamp?: string;
}

// ==================== NIVEAUX & PROGRESSION ====================

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000,
];

export const LEVEL_TITLES = [
  "Débutant",
  "Junior",
  "Intermédiaire",
  "Principal",
  "Senior",
  "Distingué",
  "Expert",
  "Maître",
  "Élite",
  "Légende",
];

export const BADGE_DEFINITIONS: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  first_steps: {
    name: "Initiation",
    description: "Premiers pas sur PortfoliA",
    icon: "🎯",
  },
  writer: {
    name: "Storytelling",
    description: "Bio professionnelle rédigée",
    icon: "✍️",
  },
  experienced: {
    name: "Expérimenté",
    description: "Première expérience ajoutée",
    icon: "💼",
  },
  on_fire: {
    name: "Régulier",
    description: "Série de 7 jours",
    icon: "🔥",
  },
  connected: {
    name: "Connecté",
    description: "LinkedIn connecté",
    icon: "🔗",
  },
  polyglot: {
    name: "Polyglotte",
    description: "3+ langues maîtrisées",
    icon: "🌍",
  },
  job_seeker: {
    name: "Chercheur d'emploi",
    description: "Première postulation enregistrée",
    icon: "🎯",
  },
  offer_saver: {
    name: "Collectionneur",
    description: "Première offre sauvegardée",
    icon: "💾",
  },
  active_candidate: {
    name: "Candidat actif",
    description: "5 postulations enregistrées",
    icon: "🚀",
  },
  serious_candidate: {
    name: "Candidat sérieux",
    description: "10 postulations enregistrées",
    icon: "⭐",
  },
  alumni_contributor: {
    name: "Contributeur Alumni",
    description: "A participé à l'enquête d'insertion de son école",
    icon: "🏆",
  },
  architect: {
    name: "Architecte",
    description: "Première page ajoutée au Book Portfolio",
    icon: "🏛️",
  },
  book_master: {
    name: "Maître du Book",
    description: "10 pages dans le Book Portfolio",
    icon: "📖",
  },
};

// ==================== TYPES PORTFOLIO ====================

export type PortfolioSectionType =
  | "hero"
  | "about"
  | "experiences"
  | "education"
  | "projects"
  | "skills"
  | "languages"
  | "certifications"
  | "interests"
  | "contact";

export interface PortfolioSection {
  id: string;
  type: PortfolioSectionType;
  visible: boolean;
  order: number;
  config?: Record<string, any>;
}

export type PortfolioTemplate =
  | "template1"
  | "template2"
  | "template3"
  | "template4"
  | "template5"
  | "template6"
  | "book"
  | "default";

export interface PortfolioConfig {
  layout: PortfolioSection[];
  template?: PortfolioTemplate; // Template sélectionné
  colorMode?: "light" | "dark"; // Mode clair/sombre
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
  };
  metadata?: {
    lastModified?: string;
    version?: number;
  };
  /** Afficher les logos des entreprises et écoles (défaut: true) */
  showLogos?: boolean;
  /** Sélection des items à afficher dans le portfolio */
  selectedItems?: {
    /** IDs des expériences sélectionnées (si undefined/null, toutes sont affichées) */
    experiences?: string[];
    /** IDs des formations sélectionnées */
    educations?: string[];
    /** IDs des projets sélectionnés */
    projects?: string[];
    /** Noms des compétences sélectionnées */
    skills?: string[];
    /** IDs des langues sélectionnées */
    languages?: string[];
    /** IDs des certifications sélectionnées */
    certifications?: string[];
    /** IDs des centres d'intérêt sélectionnés */
    interests?: string[];
  };
  /** Ordre personnalisé des items (projets, compétences, certifications, centres d'intérêt, langues) */
  itemOrder?: {
    /** IDs des projets dans l'ordre souhaité */
    projects?: string[];
    /** IDs ou noms des compétences dans l'ordre souhaité */
    skills?: string[];
    /** IDs des certifications dans l'ordre souhaité */
    certifications?: string[];
    /** IDs des centres d'intérêt dans l'ordre souhaité */
    interests?: string[];
    /** IDs des langues dans l'ordre souhaité */
    languages?: string[];
  };
  /** ID du CV associé au portfolio (pour le bouton CV) */
  cvId?: string | null;
  /** URL du CV associé (pour affichage public sans authentification) */
  cvUrl?: string | null;
  /** Overrides par template (ex: template6_highlights pour "Mes atouts") */
  templateOverrides?: TemplateOverrides | Record<string, unknown> | null;
}

export interface PortfolioSectionInfo {
  type: PortfolioSectionType;
  label: string;
  icon: string;
  description: string;
  defaultVisible: boolean;
  defaultOrder: number;
}

export interface TemplateOverrides {
  hero_image_url?: string | null;
  /** Fond du hero : 'default' (dégradés) | 'photo' | 'video' */
  hero_background_type?: "default" | "photo" | null;
  /** URL de l'image de fond (si hero_background_type === 'photo') */
  hero_background_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_bio?: string | null;
  hero_badge_text?: string | null;
  hero_badge_visible?: boolean;
  /** Section "À propos" personnalisée */
  about_use_custom?: boolean;
  about_text?: string | null;
  about_image_url?: string | null;
  about_layout?: "image_top" | "image_left" | "image_right" | "image_bottom";
  about_text_align?: "left" | "center" | "right";
  /** Template6 - Highlights personnalisés */
  template6_highlights?: Array<{
    icon: string; // Nom de l'icône Lucide
    title: string;
    description: string;
  }> | null;
  /** Template6 - Titre et description de la section Highlights */
  template6_highlights_title?: string | null;
  template6_highlights_description?: string | null;
  /** Template6 - Couleurs personnalisées (marron/beige par défaut) */
  template6_colors?: Record<string, string> | null;
  /** Alias camelCase pour template6_colors */
  template6Colors?: Record<string, string> | null;
  hero_title_line2?: string | null;
  /** Template 4 — texte CTA section contact (en bas du portfolio) */
  contact_cta_text?: string | null;
  itemOrder?: Record<string, string[]>;
  /** Polices personnalisées par rôle */
  font_titles?: string | null;
  font_subtitles?: string | null;
  font_item?: string | null;
  font_item_small?: string | null;
  font_body?: string | null;
  /** Polices importées par l'utilisateur */
  custom_fonts?: Array<{ id: string; name: string; url: string }> | null;
  [key: string]: unknown;
}
