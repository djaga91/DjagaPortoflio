/**
 * TalentProfileModal - Modal professionnel pour voir le profil complet d'un talent
 *
 * Affiche toutes les sections du profil (Expérience, Formation, Projets, etc.)
 * comme le portfolio ou le CV, avec onglets interactifs.
 * Utilisé côté entreprise dans "Rechercher talents".
 */

import { useEffect, useState } from "react";
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Zap,
  Globe,
  Award,
  Heart,
  Mail,
} from "lucide-react";
import { profileAPI } from "../services/api";
import { getAbsoluteImageUrl } from "../utils/imageUrl";
import type {
  User as UserType,
  Profile as ProfileType,
  Experience,
  Education,
  Project,
  Skill,
  Language,
  Certification,
  Interest,
} from "../types";
import { AboutSection } from "./portfolio/sections/AboutSection";
import { ExperiencesSection } from "./portfolio/sections/ExperiencesSection";
import { EducationSection } from "./portfolio/sections/EducationSection";
import { ProjectsSection } from "./portfolio/sections/ProjectsSection";
import { SkillsSection } from "./portfolio/sections/SkillsSection";
import { LanguagesSection } from "./portfolio/sections/LanguagesSection";
import { CertificationsSection } from "./portfolio/sections/CertificationsSection";
import { ContactSection } from "./portfolio/sections/ContactSection";

export interface StudentSearchProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  skills: string[];
  school_name?: string;
  cohort_name?: string;
  linkedin_url?: string;
  github_url?: string;
}

const TABS = [
  { id: "about", label: "À propos", icon: User },
  { id: "experiences", label: "Expériences", icon: Briefcase },
  { id: "education", label: "Formation", icon: GraduationCap },
  { id: "projects", label: "Projets", icon: FolderGit2 },
  { id: "skills", label: "Compétences", icon: Zap },
  { id: "languages", label: "Langues", icon: Globe },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "interests", label: "Centres d'intérêt", icon: Heart },
  { id: "contact", label: "Contact", icon: Mail },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface TalentProfileModalProps {
  student: StudentSearchProfile;
  onClose: () => void;
}

export function TalentProfileModal({
  student,
  onClose,
}: TalentProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);

  const hasFullProfile = !!user && !!profile;

  useEffect(() => {
    let cancelled = false;

    const mapPayloadToState = (publicData: {
      user: {
        id: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        full_name?: string;
        username?: string;
      };
      profile: {
        bio?: string;
        location?: string;
        phone?: string;
        linkedin_url?: string;
        github_url?: string;
        portfolio_url?: string;
        profile_picture_url?: string;
        interests?: unknown[];
      };
      experiences?: unknown[];
      educations?: unknown[];
      projects?: unknown[];
      languages?: unknown[];
      certifications?: unknown[];
      skills?: unknown[];
      interests?: unknown[];
    }) => {
      setUser({
        id: publicData.user.id,
        email: publicData.user.email || "",
        first_name: publicData.user.first_name,
        last_name: publicData.user.last_name,
        full_name: publicData.user.full_name,
        username: publicData.user.username ?? "",
        is_superuser: false,
        is_active: true,
        email_verified: false,
        tier: "free",
        created_at: "",
        updated_at: "",
      });

      setProfile({
        id: "",
        user_id: publicData.user.id,
        bio: publicData.profile.bio ?? null,
        title: null,
        location: publicData.profile.location ?? null,
        phone: publicData.profile.phone ?? null,
        linkedin_url: publicData.profile.linkedin_url ?? null,
        github_url: publicData.profile.github_url ?? null,
        portfolio_url: publicData.profile.portfolio_url ?? null,
        profile_picture_url: publicData.profile.profile_picture_url ?? null,
        completeness: 0,
        created_at: "",
        updated_at: "",
      });

      setExperiences((publicData.experiences || []) as Experience[]);
      setEducations((publicData.educations || []) as Education[]);
      setProjects((publicData.projects || []) as Project[]);
      setLanguages((publicData.languages || []) as Language[]);
      setCertifications((publicData.certifications || []) as Certification[]);

      const rawInterests =
        publicData.profile?.interests ?? publicData.interests;
      const normalized: Interest[] = Array.isArray(rawInterests)
        ? rawInterests
            .filter(
              (i): i is Record<string, unknown> =>
                i != null && typeof i === "object",
            )
            .map((i, idx) => ({
              id: String((i as { id?: unknown }).id ?? `int-${idx}`),
              user_id: String(
                (i as { user_id?: unknown }).user_id ?? publicData.user.id,
              ),
              name: String((i as { name?: unknown }).name ?? ""),
              created_at: "",
              updated_at: "",
            }))
        : [];
      setInterests(normalized);

      const rawSkills = publicData.skills;
      if (rawSkills && Array.isArray(rawSkills)) {
        const isFromTable =
          rawSkills.length > 0 &&
          typeof rawSkills[0] === "object" &&
          rawSkills[0] != null &&
          "name" in (rawSkills[0] as object);
        const normalizedSkills: Skill[] = isFromTable
          ? (
              rawSkills as {
                id: string;
                user_id?: string;
                name: string;
                category?: string;
                level?: string;
                order?: number;
              }[]
            ).map((s) => ({
              id: String(s.id),
              user_id: String(s.user_id ?? publicData.user.id),
              name: s.name ?? "",
              category: s.category ?? null,
              level: s.level ?? null,
              years_experience: null,
              order: s.order ?? 0,
            }))
          : (rawSkills as (string | Record<string, unknown>)[]).map((s, i) => ({
              id:
                typeof s === "string"
                  ? `skill-pub-${i}`
                  : String((s as { id?: unknown }).id ?? `skill-pub-${i}`),
              user_id: publicData.user.id,
              name:
                typeof s === "string"
                  ? s
                  : String((s as { name?: unknown }).name ?? ""),
              category: null,
              level: null,
              years_experience: null,
              order: i,
            }));
        setSkills(normalizedSkills);
      }
    };

    const load = async () => {
      setLoading(true);
      setError(null);

      let publicData: Awaited<
        ReturnType<typeof profileAPI.getPublicProfile>
      > | null = null;

      if (student.username) {
        try {
          publicData = await profileAPI.getPublicProfile(student.username);
        } catch {
          // Continuer avec l'endpoint B2B
        }
      }

      if (!publicData && student.user_id) {
        try {
          publicData = await profileAPI.getStudentFullProfileForCompany(
            student.user_id,
          );
        } catch (err: unknown) {
          if (!cancelled) {
            setError(
              (err as { response?: { data?: { detail?: string } } })?.response
                ?.data?.detail || "Impossible de charger le profil",
            );
          }
        }
      }

      if (cancelled) return;
      if (publicData) {
        mapPayloadToState(
          publicData as Parameters<typeof mapPayloadToState>[0],
        );
      }

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [student.user_id, student.username]);

  const displayName =
    student.first_name && student.last_name
      ? `${student.first_name} ${student.last_name}`
      : student.full_name || student.first_name || "Profil";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="talent-modal-title"
    >
      <div
        className="bg-theme-card border border-theme-card-border rounded-2xl shadow-theme-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-theme-card-border bg-theme-bg-secondary/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-theme-bg-tertiary flex-shrink-0">
              {(
                hasFullProfile
                  ? profile?.profile_picture_url
                  : student.profile_picture_url
              ) ? (
                <img
                  src={
                    getAbsoluteImageUrl(
                      (hasFullProfile
                        ? profile?.profile_picture_url
                        : student.profile_picture_url) ?? undefined,
                    ) || undefined
                  }
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-theme-text-muted">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <h2
                id="talent-modal-title"
                className="text-xl font-bold text-theme-text-primary"
              >
                {displayName}
              </h2>
              {student.school_name && (
                <p className="text-sm text-theme-text-secondary flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                  {student.school_name}
                </p>
              )}
              {student.location && (
                <p className="text-xs text-theme-text-muted mt-1">
                  {student.location}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-theme-bg-tertiary transition text-theme-text-secondary hover:text-theme-text-primary"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <p className="text-theme-text-secondary mb-4">{error}</p>
              <p className="text-sm text-theme-text-muted">
                Vous pouvez consulter le résumé ci-dessous ou demander à
                l&apos;étudiant de compléter son identifiant portfolio.
              </p>
              {/* Résumé quand erreur mais on a les données de la carte */}
              <div className="mt-6 w-full max-w-md text-left space-y-3">
                {student.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-theme-text-secondary mb-1">
                      À propos
                    </h3>
                    <p className="text-theme-text-primary text-sm">
                      {student.bio}
                    </p>
                  </div>
                )}
                {student.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                      Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(student.linkedin_url || student.github_url) && (
                  <div className="flex gap-2 pt-2">
                    {student.linkedin_url && (
                      <a
                        href={student.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg text-sm hover:bg-[#0077b5]/20"
                      >
                        LinkedIn
                      </a>
                    )}
                    {student.github_url && (
                      <a
                        href={student.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-theme-bg-tertiary text-theme-text-primary rounded-lg text-sm"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : !hasFullProfile ? (
            /* Pas de profil complet chargé : afficher le résumé recherche uniquement */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {student.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                      À propos
                    </h3>
                    <p className="text-theme-text-primary whitespace-pre-wrap">
                      {student.bio}
                    </p>
                  </div>
                )}
                {student.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                      Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(student.linkedin_url || student.github_url) && (
                  <div>
                    <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                      Contact
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {student.linkedin_url && (
                        <a
                          href={student.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20"
                        >
                          LinkedIn
                        </a>
                      )}
                      {student.github_url && (
                        <a
                          href={student.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-theme-bg-tertiary text-theme-text-primary rounded-lg"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-sm text-theme-text-muted pt-4">
                  Profil complet non disponible. Vérifiez que l&apos;étudiant
                  est bien visible pour votre entreprise.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Onglets */}
              <nav className="w-48 flex-shrink-0 border-r border-theme-card-border bg-theme-bg-secondary/30 overflow-y-auto py-3">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition border-l-2 ${
                      activeTab === id
                        ? "bg-orange-500/20 text-orange-400 font-medium border-orange-500"
                        : "border-transparent text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>

              {/* Contenu de l'onglet actif - sections en version compacte (override py-16) */}
              <div className="flex-1 overflow-y-auto p-6 [&_section]:py-6 [&_section]:px-0">
                <div className="max-w-2xl">
                  {activeTab === "about" && <AboutSection profile={profile} />}
                  {activeTab === "experiences" && (
                    <ExperiencesSection experiences={experiences} />
                  )}
                  {activeTab === "education" && (
                    <EducationSection educations={educations} />
                  )}
                  {activeTab === "projects" && (
                    <ProjectsSection projects={projects} />
                  )}
                  {activeTab === "skills" && <SkillsSection skills={skills} />}
                  {activeTab === "languages" && (
                    <LanguagesSection languages={languages} />
                  )}
                  {activeTab === "certifications" && (
                    <CertificationsSection certifications={certifications} />
                  )}
                  {activeTab === "interests" && (
                    <>
                      {interests.length > 0 ? (
                        <section className="py-6">
                          <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                            Centres d&apos;intérêt
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {interests.map((i) => (
                              <span
                                key={i.id}
                                className="px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-secondary"
                              >
                                {i.name}
                              </span>
                            ))}
                          </div>
                        </section>
                      ) : (
                        <section className="py-6">
                          <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                            Centres d&apos;intérêt
                          </h2>
                          <p className="text-theme-text-muted italic">
                            L&apos;utilisateur n&apos;a pas renseigné de centres
                            d&apos;intérêt.
                          </p>
                        </section>
                      )}
                    </>
                  )}
                  {activeTab === "contact" && (
                    <ContactSection profile={profile} user={user} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
