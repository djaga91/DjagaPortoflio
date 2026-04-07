export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username: string;
  guest_id?: string;
  terms_accepted: boolean;
  acquisition_source?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
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
  portfolio_url: string | null;
  profile_picture_url: string | null;
  google_access_token?: string | null;
  completeness: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  bio?: string | null;
  title?: string | null;
  location?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  profile_picture_url?: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface ExperienceCreate {
  title: string;
  company: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  achievements?: string[] | null;
  technologies?: string[] | null;
}

export interface ExperienceUpdate {
  title?: string;
  company?: string;
  location?: string | null;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  achievements?: string[] | null;
  technologies?: string[] | null;
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

export interface SkillCreate {
  name: string;
  category?: string | null;
  level?: string | null;
  years_experience?: number | null;
  order?: number;
}

export interface SkillUpdate {
  name?: string;
  category?: string | null;
  level?: string | null;
  years_experience?: number | null;
  order?: number;
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
  created_at: string;
  updated_at: string;
}

export interface EducationCreate {
  degree: string;
  school: string;
  location?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  grade?: string | null;
}

export interface EducationUpdate {
  degree?: string;
  school?: string;
  location?: string | null;
  field_of_study?: string | null;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  grade?: string | null;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  url_demo: string | null;
  url_github: string | null;
  url_image: string | null;
  project_icon: string | null;
  order: number;
  technologies: string[];
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
  url_demo?: string | null;
  url_github?: string | null;
  url_image?: string | null;
  project_icon?: string | null;
  order?: number;
  technologies?: string[];
  features?: string[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  url_demo?: string | null;
  url_github?: string | null;
  url_image?: string | null;
  project_icon?: string | null;
  order?: number;
  technologies?: string[];
  features?: string[];
}

export interface Language {
  id: string;
  user_id: string;
  name: string;
  level: string;
  created_at: string;
  updated_at: string;
}

export interface LanguageCreate {
  name: string;
  level: string;
}

export interface LanguageUpdate {
  name?: string;
  level?: string;
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

export interface CertificationCreate {
  name: string;
  issuer: string;
  date_obtained: string;
  url?: string | null;
}

export interface CertificationUpdate {
  name?: string;
  issuer?: string;
  date_obtained?: string;
  url?: string | null;
}

export interface Interest {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface InterestCreate {
  name: string;
}

export interface InterestUpdate {
  name?: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  message: string;
  verified: boolean;
  user: User | null;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  sent: boolean;
}

export interface VerificationStatusResponse {
  email: string;
  email_verified: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface GamificationStats {
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  last_activity: string;
  xp_to_next_level: number;
}

export interface AddXPResponse {
  xp: number;
  level: number;
  level_up: boolean;
  new_level: number | null;
}

export interface UnlockBadgeResponse {
  badge_id: string;
  badges: string[];
  already_unlocked: boolean;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  offer_url: string;
  content: string;
  short_version?: boolean;
  status: "pending" | "processing" | "completed" | "error" | "failed";
  progress: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoverLetterGenerateRequest {
  offer_url: string;
  short_version?: boolean;
}

export interface CoverLetterListResponse {
  letters: CoverLetter[];
  total: number;
}

export interface InterviewAnalyzeRequest {
  transcript: string;
}

export interface InterviewAnalyzeResponse {
  success: boolean;
  message: string;
  stats: {
    user_profile?: { updated_user: boolean; updated_profile: boolean };
    skills?: { created: number; skipped: number };
    experiences?: { created: number; updated: number; skipped: number };
    educations?: { created: number; updated: number; skipped: number };
    projects?: { created: number; updated: number; skipped: number };
    languages?: { created: number; updated: number; skipped: number };
    certifications?: { created: number; updated: number; skipped: number };
    total_created?: number;
    total_updated?: number;
    total_skipped?: number;
  };
}

export interface PrepareFoxStartResponse {
  session_id: string;
  current_question_index: number;
  total_questions: number;
  question: string;
  offer_title?: string | null;
}

export interface PrepareFoxAnswerQuestionFeedback {
  question: string;
  suggested_answer: string;
  comment: string;
}

export interface PrepareFoxAnswerResponse {
  done: boolean;
  current_question_index?: number;
  total_questions?: number;
  question?: string | null;
  score?: number;
  feedback?: string | null;
  feedback_positives?: string[] | null;
  questions_feedback?: PrepareFoxAnswerQuestionFeedback[] | null;
}

export interface PrepareFoxSessionResponse {
  session_id: string;
  status: string;
  offer_url: string;
  offer_title?: string | null;
  num_questions: number;
  current_question_index: number;
  total_questions: number;
  question?: string | null;
  score?: number | null;
  feedback?: string | null;
  feedback_positives?: string[] | null;
}

export type PrepareFoxDifficulty = "easy" | "medium" | "hard";

export interface PrepareFoxQuestionFeedback {
  question: string;
  suggested_answer: string;
  comment: string;
}

export interface PrepareFoxSessionEntry {
  score: number;
  feedback: string;
  completed_at: string;
  questions_feedback?: PrepareFoxQuestionFeedback[];
}

export interface JobOffer {
  id: string;
  dataset_id?: number;
  title: string;
  description?: string;
  full_description?: string;
  category?: string;
  contract_type?: string;
  match_score: number;
  is_saved: boolean;
  is_applied: boolean;
  applied_at?: string;
  notes?: string;
  created_at: string;
  company_name?: string;
  location?: string;
  location_city?: string;
  location_country?: string;
  remote_type?: string;
  apply_url?: string;
  source?: string;
  source_id?: string;
  source_platform?: string;
  salary_info?: string;
  seniority_level?: string;
  required_experience?: string;
  skills?: string[];
  contacted_by_email?: boolean;
  contacted_by_phone?: boolean;
  contacted_at?: string;
  follow_up_received?: boolean;
  follow_up_at?: string;
  followup_date?: string;
  hr_interview_scheduled?: boolean;
  hr_interview_date?: string;
  hr_interview_completed?: boolean;
  technical_interview_scheduled?: boolean;
  technical_interview_date?: string;
  technical_interview_completed?: boolean;
  prepare_fox_score?: number | null;
  prepare_fox_completed_at?: string | null;
  prepare_fox_feedback?: string | null;
  prepare_fox_sessions?: PrepareFoxSessionEntry[] | null;
  rejected?: boolean;
  rejected_at?: string;
  rejection_reason?: string;
  cover_letter_sent?: boolean;
  cover_letter_sent_at?: string;
  test_requested?: boolean;
  test_requested_at?: string;
  test_scheduled_date?: string;
  test_completed?: boolean;
  test_completed_at?: string;
  job_found?: boolean;
  job_found_at?: string;
  wall_of_fame_show_employer?: boolean;
}

export interface MatchingAnalysisRequest {
  top_k?: number;
  search_query?: string;
  contract_type?: string;
  location?: string;
}

export interface MatchingAnalysisResponse {
  success: boolean;
  message: string;
  offers: JobOffer[];
  total_found: number;
}

export interface SaveOfferRequest {
  dataset_id: number;
  title: string;
  description?: string;
  full_description?: string;
  category?: string;
  contract_type?: string;
  match_score: number;
  notes?: string;
  company_name?: string;
  location?: string;
  location_city?: string;
  location_country?: string;
  remote_type?: string;
  apply_url?: string;
  source?: string;
  source_id?: string;
}

export interface ApplyToOfferRequest {
  job_match_id: string;
}

export interface UnsaveOfferRequest {
  job_match_id: string;
}

export interface UnapplyOfferRequest {
  job_match_id: string;
}

export interface UpdateOfferStatusRequest {
  job_match_id: string;
  is_applied?: boolean;
  applied_at?: string;
  contacted_by_email?: boolean;
  contacted_by_phone?: boolean;
  contacted_at?: string;
  follow_up_received?: boolean;
  follow_up_at?: string;
  followup_date?: string;
  hr_interview_scheduled?: boolean;
  hr_interview_date?: string;
  hr_interview_completed?: boolean;
  technical_interview_scheduled?: boolean;
  technical_interview_date?: string;
  technical_interview_completed?: boolean;
  prepare_fox_score?: number | null;
  prepare_fox_completed_at?: string | null;
  prepare_fox_feedback?: string | null;
  rejected?: boolean;
  rejected_at?: string;
  rejection_reason?: string;
  cover_letter_sent?: boolean;
  cover_letter_sent_at?: string;
  test_requested?: boolean;
  test_requested_at?: string;
  test_scheduled_date?: string;
  test_completed?: boolean;
  test_completed_at?: string;
  job_found?: boolean;
  job_found_at?: string;
  wall_of_fame_show_employer?: boolean;
  notes?: string;
}

export interface ApplicationStatsResponse {
  total_saved: number;
  total_applied: number;
  total_contacted: number;
  total_interviewed: number;
  total_rejected: number;
  total_found: number;
  response_rate: number;
  interview_rate: number;
  success_rate: number;
  funnel: {
    saved: number;
    applied: number;
    contacted: number;
    interviewed: number;
    found: number;
  };
  avg_days_to_contact?: number | null;
  avg_days_to_interview?: number | null;
  avg_days_to_decision?: number | null;
  timeline: Array<{
    date: string;
    saved: number;
    applied: number;
    contacted: number;
    interviewed: number;
    found: number;
  }>;
  status_distribution: {
    active: number;
    rejected: number;
    found: number;
  };
  distinct_companies_applied: number;
  top_companies: Array<{
    name: string;
    count: number;
  }>;
}

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

export interface DiscordLinkResponse {
  authorization_url: string;
  message: string;
}

export interface CVLayoutItem {
  type:
    | "experience"
    | "education"
    | "project"
    | "language"
    | "certification"
    | "skill"
    | "bio"
    | "interest";
  id: string;
}

export interface CVSelectionRequest {
  layout?: CVLayoutItem[];
  job_title?: string;
}

export interface CVItem {
  id: string;
  [key: string]: any;
}

export interface CVItemsResponse {
  experiences: { items: CVItem[]; selected: string[] };
  education: { items: CVItem[]; selected: string[] };
  projects: { items: CVItem[]; selected: string[] };
  languages: { items: CVItem[]; selected: string[] };
  certifications: { items: CVItem[]; selected: string[] };
  interests: { items: CVItem[]; selected: string[] };
  skills: { items: CVItem[]; selected: string[] };
  bio: string | null;
}

export interface CVPreviewResponse {
  html: string;
}

export interface CVGenerateResponse {
  success: boolean;
  cv_url: string;
  template?: string;
  format?: string;
  size_bytes: number;
  applied_zoom?: number;
}

export interface CVInfo {
  has_cv: boolean;
  cv_url: string | null;
  generated_at: string | null;
}

export interface CVDocument {
  id: string;
  name: string;
  cv_url: string;
  template: string;
  format?: string;
  generated_at: string;
  created_at?: string;
}

export interface CVListResponse {
  cvs: CVDocument[];
}

export interface OnboardingStepData {
  name?: string;
  job_title?: string;
  profile_type?: string;
  skills?: string[];
  experience?: {
    title: string;
    company: string;
    description?: string;
    bullets?: string[];
  };
  education?: {
    degree: string;
    school: string;
  };
  project?: {
    name: string;
    description?: string;
  };
  interests?: string[];
  languages?: { name: string; level: string }[];
}

export interface OnboardingStepResponse {
  success: boolean;
  current_step: number;
  data: OnboardingStepData;
}

export interface GenerateDescriptionResponse {
  title: string;
  description: string;
  bullets: string[];
}

export interface OnboardingSession {
  guest_id: string;
  current_step: number;
  data: OnboardingStepData;
  created_at: string;
  updated_at: string;
}

export interface RewriteDescriptionResponse {
  description: string;
  bullets: string[];
}

export interface JobNotificationKeyword {
  id: string;
  user_id: string;
  keyword: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobNotification {
  id: string;
  user_id: string;
  keyword_id: string | null;
  keyword: string;
  job_offer_ids: string[];
  notification_count: number;
  read_at: string | null;
  email_sent: boolean;
  sent_at: string;
}

export interface JobNotificationListResponse {
  notifications: JobNotification[];
  total: number;
  unread_count: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "school" | "company";
  logo_url?: string;
  description?: string;
  plan?: string;
  user_role?: string;
  cohort_name?: string | null;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  role: string;
  organization: Organization;
}

export interface MySchoolResponse {
  school_id: string;
  school_name: string;
  cohort_id: string | null;
  cohort_name: string | null;
}

export interface RankingEntry {
  rank: number;
  user_id: string;
  username: string;
  profile_picture_url: string | null;
  xp: number;
  level: number;
}

export interface RankingResponse {
  scope: "cohort" | "school";
  entries: RankingEntry[];
}

export interface WallOfFameEntry {
  user_id: string;
  username: string;
  profile_picture_url: string | null;
  job_found_at: string | null;
  job_title?: string | null;
  company_name?: string | null;
}

export interface WallOfFameResponse {
  scope: "cohort" | "school";
  entries: WallOfFameEntry[];
}

export interface PeerBadgeDetail {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xp_reward: number;
  criteria: string;
}

export interface PeerBadgesResponse {
  username: string;
  xp: number;
  level: number;
  badges: PeerBadgeDetail[];
}

export interface DashboardCard {
  card_id: string;
  display_name: string;
  description: string | null;
  icon: string;
  is_enabled: boolean;
  display_order: number;
  column_span: number;
  config: Record<string, unknown> | null;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  slug: string;
  target_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  total_scans: number;
  redirect_url: string;
}

export interface CampaignCreateRequest {
  name: string;
  target_url: string;
  slug?: string;
  description?: string;
}

export interface CampaignUpdateRequest {
  name?: string;
  target_url?: string;
  description?: string;
}

export interface DeviceStats {
  mobile: number;
  desktop: number;
  tablet: number;
  unknown: number;
}

export interface DailyScanStats {
  date: string;
  count: number;
}

export interface ConversionStats {
  new_registrations: number;
  existing_users_clicked: number;
  not_converted: number;
  conversion_rate: number;
}

export interface CampaignStats {
  campaign_id: string;
  campaign_name: string;
  total_clicks: number;
  unique_visitors: number;
  conversions: ConversionStats;
  device_breakdown: DeviceStats;
  daily_scans: DailyScanStats[];
  top_referers: Record<string, number>[];
  total_scans: number;
  total_conversions: number;
  conversion_rate: number;
}

export interface QRCodeData {
  campaign_id: string;
  slug: string;
  redirect_url: string;
  qr_data: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  tier: "free" | "pro" | "enterprise";
  is_test_account: boolean;
  login_days_count: number;
  created_at: string | null;
  last_login: string | null;
  xp: number;
  level: number;
  streak: number;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
