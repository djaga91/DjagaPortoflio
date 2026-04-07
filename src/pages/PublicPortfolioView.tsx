import React, { useEffect, useState, ErrorInfo } from "react";
import { profileAPI } from "../services/api";
import { PortfolioPreview } from "../components/portfolio/PortfolioPreview";
import {
  User,
  Profile,
  Experience,
  Education,
  Project,
  Skill,
  Language,
  Certification,
  Interest,
  PortfolioConfig,
} from "../types";

interface PublicPortfolioViewProps {
  username: string;
}

// Error Boundary Component (doit être en dehors du composant fonctionnel)
class PortfolioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "❌ [PublicPortfolioView] Erreur capturée:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="text-center">
            <p className="text-2xl mb-4 text-red-500">❌ Erreur de rendu</p>
            <p className="text-slate-400 mb-4">
              {this.state.error?.message ||
                "Une erreur est survenue lors du chargement du portfolio"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Vue publique du portfolio - Accessible sans authentification
 * Route: /portfolio/:username
 */
export const PublicPortfolioView: React.FC<PublicPortfolioViewProps> = ({
  username,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicPortfolio = async () => {
      if (!username) {
        setError("Username manquant");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const publicData = await profileAPI.getPublicProfile(username);

        // Mapper les données du backend vers les types frontend
        setUser({
          id: publicData.user.id,
          email: publicData.user.email || "",
          first_name: publicData.user.first_name,
          last_name: publicData.user.last_name,
          full_name: publicData.user.full_name, // Garder pour compatibilité
          username: publicData.user.username,
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
          bio: publicData.profile.bio,
          title: null,
          location: publicData.profile.location,
          phone: publicData.profile.phone,
          linkedin_url: publicData.profile.linkedin_url,
          github_url: publicData.profile.github_url,
          portfolio_url: publicData.profile.portfolio_url,
          profile_picture_url: publicData.profile.profile_picture_url,
          completeness: 0,
          created_at: "",
          updated_at: "",
        });

        setExperiences(publicData.experiences || []);
        setEducations(publicData.educations || []);
        const projectsData = publicData.projects || [];
        setProjects(projectsData);
        setLanguages(publicData.languages || []);
        setCertifications(publicData.certifications || []);
        // Centres d'intérêt : profile puis racine (compatibilité backend ancien/nouveau)
        const rawInterests =
          (publicData as { profile?: { interests?: unknown[] } }).profile
            ?.interests ?? (publicData as { interests?: unknown[] }).interests;
        const normalizedInterests: Interest[] = Array.isArray(rawInterests)
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
        setInterests(normalizedInterests);

        // Compétences : priorité aux skills de la table (API), sinon profile.skills (legacy)
        const rawSkills =
          (publicData as any).skills ?? publicData.profile?.skills;
        if (rawSkills && Array.isArray(rawSkills)) {
          const isFromTable =
            rawSkills.length > 0 &&
            typeof rawSkills[0] === "object" &&
            "name" in rawSkills[0];
          const normalized: Skill[] = isFromTable
            ? (rawSkills as any[]).map((s) => ({
                id: String(s.id),
                user_id: String(s.user_id ?? publicData.user.id),
                name: s.name ?? "",
                category: s.category ?? null,
                level: s.level ?? null,
                years_experience: s.years_experience ?? null,
                order: s.order ?? 0,
              }))
            : (rawSkills as (string | Record<string, unknown>)[]).map(
                (s, i) => ({
                  id:
                    typeof s === "string"
                      ? `skill-pub-${i}`
                      : String((s as any).id ?? `skill-pub-${i}`),
                  user_id: publicData.user.id,
                  name:
                    typeof s === "string" ? s : String((s as any).name ?? ""),
                  category:
                    typeof s === "string"
                      ? null
                      : ((s as any).category ?? null),
                  level:
                    typeof s === "string" ? null : ((s as any).level ?? null),
                  years_experience: null,
                  order: i,
                }),
              );
          setSkills(normalized);
        } else {
          setSkills([]);
        }

        // Récupérer la configuration du portfolio (depuis le profil public)
        // Config par défaut
        const defaultConfig: PortfolioConfig = {
          layout: [
            { id: "hero", type: "hero", visible: true, order: 0 },
            { id: "about", type: "about", visible: true, order: 1 },
            { id: "experiences", type: "experiences", visible: true, order: 2 },
            { id: "education", type: "education", visible: true, order: 3 },
            { id: "projects", type: "projects", visible: true, order: 4 },
            { id: "skills", type: "skills", visible: true, order: 5 },
            { id: "languages", type: "languages", visible: true, order: 6 },
            {
              id: "certifications",
              type: "certifications",
              visible: true,
              order: 7,
            },
            { id: "interests", type: "interests", visible: true, order: 8 },
            { id: "contact", type: "contact", visible: true, order: 9 },
          ],
          theme: { primaryColor: "#FF8C42", fontFamily: "Inter" },
          metadata: { version: 1 },
          template: "template1",
          colorMode: "dark",
        };

        if (publicData.profile.portfolio_config) {
          try {
            // Fusionner avec les valeurs par défaut pour s'assurer que template et colorMode existent
            const loadedConfig = publicData.profile.portfolio_config as any;

            // Fusionner le layout : ajouter les sections du défaut manquantes dans la config sauvegardée (ex. "interests")
            const defaultLayout = defaultConfig.layout || [];
            const loadedLayout = Array.isArray(loadedConfig.layout)
              ? loadedConfig.layout
              : [];
            const loadedIds = new Set(
              loadedLayout.map((s: { id: string }) => s.id),
            );
            const missingFromLoaded = defaultLayout.filter(
              (s) => !loadedIds.has(s.id),
            );
            const orderNum = (s: { order?: unknown }) => {
              const o = s?.order;
              if (typeof o === "number" && !Number.isNaN(o)) return o;
              if (typeof o === "string" && /^\d+$/.test(o))
                return parseInt(o, 10);
              return 99;
            };
            const mergedLayout = [...loadedLayout, ...missingFromLoaded].sort(
              (a, b) => orderNum(a) - orderNum(b),
            );

            // Accepter templateOverrides ou template_overrides (camelCase / snake_case) pour compatibilité API
            const templateOverrides =
              loadedConfig.templateOverrides ??
              (
                loadedConfig as {
                  template_overrides?: typeof loadedConfig.templateOverrides;
                }
              ).template_overrides ??
              undefined;

            const mergedConfig: PortfolioConfig = {
              ...defaultConfig,
              ...loadedConfig,
              layout:
                mergedLayout.length > 0 ? mergedLayout : defaultConfig.layout,
              theme: loadedConfig.theme || defaultConfig.theme,
              template: loadedConfig.template || defaultConfig.template,
              colorMode: loadedConfig.colorMode || defaultConfig.colorMode,
              templateOverrides:
                templateOverrides ??
                defaultConfig.templateOverrides ??
                undefined,
              // IMPORTANT: selectedItems doit être explicitement inclus (pas écrasé par defaultConfig)
              selectedItems:
                loadedConfig.selectedItems !== undefined &&
                loadedConfig.selectedItems !== null
                  ? loadedConfig.selectedItems
                  : undefined,
              // IMPORTANT: itemOrder pour garder l'ordre des projets (et autres sections) comme dans l'éditeur
              itemOrder:
                loadedConfig.itemOrder !== undefined &&
                loadedConfig.itemOrder !== null
                  ? loadedConfig.itemOrder
                  : undefined,
              // IMPORTANT: cvId et cvUrl doivent être explicitement inclus
              cvId:
                loadedConfig.cvId !== undefined && loadedConfig.cvId !== null
                  ? loadedConfig.cvId
                  : undefined,
              cvUrl:
                loadedConfig.cvUrl !== undefined && loadedConfig.cvUrl !== null
                  ? loadedConfig.cvUrl
                  : undefined,
            };

            setConfig(mergedConfig);
          } catch (err) {
            console.warn(
              "Erreur parsing config portfolio, utilisation de la config par défaut:",
              err,
            );
            setConfig(defaultConfig);
          }
        } else {
          setConfig(defaultConfig);
        }
      } catch (err: any) {
        console.error("Erreur chargement portfolio public:", err);
        setError(err.response?.data?.detail || "Portfolio non trouvé");
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicPortfolio();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl">Chargement du portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-2xl mb-4 text-red-500">
            ❌ {error || "Portfolio non trouvé"}
          </p>
          <p className="text-slate-400">
            L'utilisateur <strong>{username}</strong> n'existe pas ou n'a pas de
            portfolio public.
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <PortfolioErrorBoundary>
      <div className="w-full">
        <PortfolioPreview
          key={`public-${config.template || "default"}`}
          config={config}
          user={user}
          profile={profile}
          experiences={experiences}
          educations={educations}
          projects={projects}
          skills={skills}
          languages={languages}
          certifications={certifications}
          interests={interests}
          isPreview={false}
          onConfigChange={(newConfig) => setConfig(newConfig)}
        />
      </div>
    </PortfolioErrorBoundary>
  );
};
