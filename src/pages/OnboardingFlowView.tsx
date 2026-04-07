/**
 * OnboardingFlowView - IMMERSIVE COCKPIT MODE
 *
 * Interface unifiée et gamifiée pour l'onboarding avec Fox :
 * - Support Light/Dark theme
 * - Spotlight sur Fox
 * - Bulle de dialogue glassmorphism
 * - Carte CV en lévitation à droite
 */

import React, { useState, useEffect } from "react";
import {
  Send,
  Check,
  Briefcase,
  Rocket,
  User,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Mail,
  Lock,
  AtSign,
  ArrowLeft,
} from "lucide-react";
import { AxiosError } from "axios";
import { useGameStore } from "../store/gameStore";
import { useGuestId, clearGuestId } from "../hooks/useGuestId";
import { formatAuthErrorDetail } from "../utils/formatAuthError";
import { onboardingAPI, jobNotificationsAPI } from "../services/api";
import { AIBadgeInline } from "../components/AIBadge";

const SUGGESTED_SKILLS_DEFAULT = [
  "Communication",
  "Travail d'équipe",
  "Organisation",
  "Résolution de problèmes",
  "Python",
  "Excel",
  "Gestion de projet",
];

const TOTAL_STEPS = 7;

export const OnboardingFlowView: React.FC = () => {
  const { setView, register } = useGameStore();
  const { guestId } = useGuestId();

  const [cvData, setCvData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    jobTitle: "",
    skills: [] as string[],
    expTitle: "",
    expCompany: "",
    expDescription: "",
    expBullets: [] as string[],
    languages: [] as { name: string; level: string }[],
  });

  // États de l'interface
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [foxQuestion, setFoxQuestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États inscription (étape finale)
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // --- MOTEUR DE SCÉNARIO ---
  const nextStep = async (question: string, delay = 500) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setFoxQuestion(question);
      setIsAnimating(false);
    }, delay);
  };

  // Sauvegarder étape au backend
  const saveStepToBackend = async (
    stepNum: number,
    data: Record<string, unknown>,
  ) => {
    if (!guestId) return;
    try {
      await onboardingAPI.saveStep(guestId, stepNum, data);
    } catch (error) {
      console.error("Erreur sauvegarde étape:", error);
    }
  };

  /** Sauvegarde consolidée de tout l'onboarding (même logique que l'expérience) juste avant register. */
  const saveConsolidatedOnboarding = async (): Promise<void> => {
    if (!guestId) return;
    const jobTitle =
      cvData.jobTitle?.replace(/^Objectif\s*:\s*/i, "").trim() || "";
    const payload: Record<string, unknown> = {
      name: cvData.name || undefined,
      job_title: jobTitle || undefined,
      skills: cvData.skills?.length ? cvData.skills : undefined,
    };
    if (cvData.expTitle && cvData.expCompany) {
      payload.experience = {
        title: cvData.expTitle,
        company: cvData.expCompany,
        description: cvData.expDescription || "",
        bullets: cvData.expBullets || [],
      };
    }
    await saveStepToBackend(6, payload);
  };

  // Initialisation
  useEffect(() => {
    setFoxQuestion(
      "Salut ! Moi c'est Fox 🦊. On va créer votre profil professionnel en 2 minutes. Prêt ?",
    );

    const loadExistingSession = async () => {
      if (!guestId) return;
      try {
        const session = await onboardingAPI.getSession(guestId);
        if (session.data) {
          const fullName = session.data.name || "";
          const parts = fullName.trim().split(/\s+/);
          const firstName = parts[0] || "";
          const lastName = parts.slice(1).join(" ") || "";
          setCvData((prev) => ({
            ...prev,
            firstName,
            lastName,
            name: fullName,
            jobTitle: session.data.job_title
              ? session.data.job_title.startsWith("Objectif")
                ? session.data.job_title
                : `Objectif : ${session.data.job_title}`
              : "",
            skills: session.data.skills || [],
            expTitle: session.data.experience?.title || "",
            expCompany: session.data.experience?.company || "",
            expDescription: session.data.experience?.description || "",
            expBullets: session.data.experience?.bullets || [],
            languages: session.data.languages || [],
          }));
          setSelectedSkills(session.data.skills || []);
          if (session.current_step > 0) {
            setStep(Math.min(session.current_step, TOTAL_STEPS - 1));
            setFoxQuestion("Vous êtes de retour ! Reprenons où vous en étiez.");
          }
        }
      } catch {
        // Nouvelle session onboarding
      }
    };

    loadExistingSession();
  }, [guestId]);

  // --- HANDLERS ---
  const handleStart = () => {
    nextStep(
      "On commence par les présentations. Comment vous appelez-vous ? (Prénom et nom)",
    );
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const first = inputValue.trim();
    const last = inputValue2.trim();
    if (!first) return;
    const name = [first, last].filter(Boolean).join(" ");
    setCvData((prev) => ({ ...prev, firstName: first, lastName: last, name }));
    setInputValue("");
    setInputValue2("");
    await saveStepToBackend(1, { name, first_name: first, last_name: last });
    nextStep(
      `Enchanté ${first} ! Indiquez le nom du poste ou le type de poste que vous visez.`,
    );
  };

  const handleObjectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const objective = inputValue.trim();
    if (!objective) return;
    setCvData((prev) => ({ ...prev, jobTitle: "Objectif : " + objective }));
    setInputValue("");
    await saveStepToBackend(2, { job_title: objective });
    nextStep(
      "Quelles sont vos compétences clés ? Vous pouvez en saisir librement ou choisir parmi les suggestions.",
    );
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill || selectedSkills.includes(trimmedSkill)) return;
    const newSkills = [...selectedSkills, trimmedSkill];
    setSelectedSkills(newSkills);
    setCvData((prev) => ({ ...prev, skills: newSkills }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(newSkills);
    setCvData((prev) => ({ ...prev, skills: newSkills }));
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const submitSkills = async () => {
    if (selectedSkills.length < 3) return;
    await saveStepToBackend(3, { skills: selectedSkills });
    nextStep(
      "Super ! Décrivez votre expérience la plus récente (poste + entreprise).",
    );
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const parts = inputValue.split(/\s+chez\s+|\s+@\s+|\s+-\s+/i);
    const title = parts[0]?.trim() || inputValue;
    const company = parts[1]?.trim() || "";

    setCvData((prev) => ({ ...prev, expTitle: title, expCompany: company }));
    setInputValue("");
    setFoxQuestion("Parfait ! Je génère une description professionnelle... 🤖");
    setIsLoading(true);

    const companyVal = company || "Entreprise";
    try {
      // Retry avec backoff exponentiel pour gérer les erreurs 429
      let result;
      let lastError;
      const MAX_RETRIES = 5; // Augmenté à 5 tentatives
      const RETRY_DELAY = 3000; // 3 secondes de base

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          result = await onboardingAPI.generateDescription(
            guestId,
            title,
            companyVal,
          );
          break; // Succès
        } catch (error: any) {
          lastError = error;
          const is429Error =
            error instanceof AxiosError && error.response?.status === 429;

          if (is429Error && attempt < MAX_RETRIES - 1) {
            const waitTime = RETRY_DELAY * Math.pow(2, attempt); // 3s, 6s, 12s, 24s
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw error; // Re-lancer l'erreur si ce n'est pas une 429 ou si c'est la dernière tentative
          }
        }
      }

      if (!result) {
        throw lastError || new Error("Échec après plusieurs tentatives");
      }

      const expPayload = {
        title,
        company: companyVal,
        description: result.description,
        bullets: result.bullets,
      };
      setCvData((prev) => ({
        ...prev,
        expTitle: title,
        expCompany: companyVal,
        expDescription: result.description,
        expBullets: result.bullets,
      }));

      await saveStepToBackend(4, { experience: expPayload });
      setFoxQuestion(
        `Super ! Description générée pour « ${title} ». Créez votre compte pour sauvegarder votre profil. Vous pourrez l'enrichir depuis Mon Profil.`,
      );
      setStep(5); // étape Confirmation
    } catch (error) {
      console.error("Erreur génération IA:", error);

      // Gestion spécifique de l'erreur 429 (quota dépassé)
      const is429Error =
        error instanceof AxiosError && error.response?.status === 429;

      if (is429Error) {
        setFoxQuestion(
          "🦊 L'IA est très demandée ! Réessayez dans un instant. En attendant, voici une description de base.",
        );
      }

      // Générer une description de fallback avec des bullets concrets (pas vagues)
      // Si le poste est lié au dev/IT, générer des bullets autour d'Azure
      const isDevRole =
        /dev|développeur|ingénieur|it|cloud|devops|programmeur|software/i.test(
          title,
        );

      const fallbackDesc = `Expérience en tant que ${title}${company ? ` chez ${company}` : ""}.`;
      let fallbackBullets: string[];

      if (isDevRole) {
        // Bullets concrets pour les rôles dev/IT avec Azure
        fallbackBullets = [
          `Développement d'applications et APIs avec déploiement sur Azure App Services`,
          `Mise en place de pipelines CI/CD avec Azure DevOps pour automatiser les déploiements`,
          `Configuration et gestion de bases de données Azure SQL avec optimisation des performances`,
        ];
      } else {
        // Bullets génériques mais concrets pour les autres rôles
        fallbackBullets = [
          `Gestion quotidienne des opérations avec suivi des indicateurs de performance`,
          `Collaboration avec les équipes pour améliorer les processus et l'efficacité`,
          `Mise en place de solutions pour optimiser la productivité et réduire les délais`,
        ];
      }

      const fallbackPayload = {
        title,
        company: companyVal,
        description: fallbackDesc,
        bullets: fallbackBullets,
      };
      setCvData((prev) => ({
        ...prev,
        expCompany: companyVal,
        expDescription: fallbackDesc,
        expBullets: fallbackBullets,
      }));

      await saveStepToBackend(4, { experience: fallbackPayload });

      if (is429Error) {
        setFoxQuestion(
          "🦊 L'IA est très demandée ! Voici une description de base. Créez votre compte pour sauvegarder votre profil.",
        );
      } else {
        setFoxQuestion(
          "Voici une description de base. Créez votre compte pour sauvegarder votre profil. Vous pourrez l'enrichir depuis Mon Profil.",
        );
      }
      setStep(5); // étape Confirmation
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToRegister = () => {
    // Générer un username valide depuis le nom
    let suggestedUsername = (cvData.name || "user")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "") // Garder seulement lettres, chiffres, tirets et underscores
      .slice(0, 50);

    // S'assurer qu'on a au moins 3 caractères (ajouter des chiffres si nécessaire)
    if (suggestedUsername.length < 3) {
      suggestedUsername = suggestedUsername + "-123";
    }

    // Limiter à 50 caractères
    suggestedUsername = suggestedUsername.slice(0, 50);

    setRegisterData((prev) => ({ ...prev, username: suggestedUsername }));
    setFoxQuestion(
      "Dernière étape ! Créez votre compte pour sauvegarder votre profil. Vous pourrez l'enrichir depuis Mon Profil.",
    );
    setStep(6);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (
      !registerData.email ||
      !registerData.password ||
      !registerData.username
    ) {
      setRegisterError("Veuillez remplir tous les champs.");
      return;
    }

    if (registerData.password.length < 8) {
      setRegisterError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    // Validation username : 3-50 caractères, alphanumeriques, underscores ou hyphens uniquement
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (registerData.username.length < 3 || registerData.username.length > 50) {
      setRegisterError(
        "Le nom d'utilisateur doit contenir entre 3 et 50 caractères.",
      );
      return;
    }

    if (!usernameRegex.test(registerData.username)) {
      setRegisterError(
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores.",
      );
      return;
    }

    setIsRegistering(true);

    // NE PAS définir 'onboarding_flow_source' = 'fox_interview' ici car on veut lancer le tutoriel immédiatement
    // après l'inscription depuis OnboardingFlowView (pas après la fin de Fox Interview)
    // Le flag sera défini à 'immediate' dans le store pour lancer le tutoriel directement

    try {
      await saveConsolidatedOnboarding();

      // Parser le nom en first_name et last_name
      const nameParts = (cvData.name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || undefined;

      // S'assurer qu'on a au moins first_name ou full_name
      if (!firstName && !cvData.name) {
        setRegisterError("Le nom est requis pour créer votre compte.");
        setIsRegistering(false);
        return;
      }

      await register({
        email: registerData.email,
        password: registerData.password,
        first_name: firstName || undefined,
        last_name: lastName,
        full_name: cvData.name || firstName, // Fallback si name est vide
        username: registerData.username,
        guest_id: guestId,
        terms_accepted: true,
      });

      // Sauvegarder les données du profil après l'inscription
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        // Enregistrer l'objectif dans Mon Objectif (mots-clés alertes = section Mon Objectif)
        const objective = cvData.jobTitle
          ?.replace(/^Objectif\s*:\s*/i, "")
          .trim();
        if (objective) {
          await jobNotificationsAPI.addKeyword(objective);
        }
      } catch (syncError) {
        console.error(
          "❌ [OnboardingFlowView] Erreur sauvegarde profil / objectif:",
          syncError,
        );
      }

      clearGuestId();
      // addPts / unlockBadge déjà faits dans register() du store

      // S'assurer que le flag d'onboarding est bien défini pour lancer le tutoriel immédiatement
      const user = useGameStore.getState().user;
      if (user?.id) {
        // Forcer le flag à 'immediate' pour lancer le tutoriel directement après l'inscription
        localStorage.setItem(`pending_onboarding_${user.id}`, "immediate");
        localStorage.removeItem(`onboarding_seen_${user.id}`);
      }

      // Nettoyer le flag temporaire
      localStorage.removeItem("onboarding_flow_source");

      // Rediriger vers le dashboard (le tutoriel se lancera automatiquement)
      setTimeout(() => {
        setView("dashboard");
      }, 100);
    } catch (error: unknown) {
      console.error("Erreur inscription:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { detail?: string } };
      };

      // Log détaillé pour diagnostiquer l'erreur 400
      if (axiosError.response?.status === 400) {
        console.error("❌ [REGISTER] Erreur 400 - Détails:", {
          detail: axiosError.response?.data?.detail,
          data: axiosError.response?.data,
          email: registerData.email,
          username: registerData.username,
          firstName: cvData.name?.split(" ")[0],
          lastName: cvData.name?.split(" ").slice(1).join(" "),
        });
      }

      setRegisterError(
        formatAuthErrorDetail(axiosError.response?.data?.detail) ||
          "Erreur lors de l'inscription. Veuillez réessayer.",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const progressPercent = Math.min(100, (step / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      {/* ===== ANIMATIONS CSS ===== */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        @keyframes spotlight-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        .animate-spotlight {
          animation: spotlight-pulse 4s ease-in-out infinite;
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-6px) rotate(0deg); }
        }
        .animate-card-float {
          animation: card-float 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* ===== BARRE DE PROGRESSION FOX (couleurs orange/ambre) ===== */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-sm shadow-orange-500/30 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ===== SPOTLIGHT BACKGROUND ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Spotlight radial principal derrière Fox (gauche) */}
        <div
          className="absolute w-[900px] h-[900px] rounded-full animate-spotlight dark:opacity-100 opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 40%, transparent 70%)",
            top: "5%",
            left: "-10%",
          }}
        />
        {/* Accent violet subtil */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-5 dark:opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 60%)",
            bottom: "10%",
            left: "30%",
          }}
        />
      </div>

      {/* ===== BOUTON RETOUR ===== */}
      <button
        onClick={() => setView("landing")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors text-sm group"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="hidden sm:inline">Retour</span>
      </button>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="w-full h-full flex flex-col md:flex-row pt-6">
        {/* --- PARTIE GAUCHE : ZONE COACH FOX (60%) --- */}
        <div className="w-full md:w-[60%] relative flex flex-col items-center justify-center p-6 md:p-8">
          {/* Header Logo */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 flex items-center gap-2 z-20">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-3 overflow-hidden">
              <img
                src="/logo.svg"
                alt="Portfolia"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg hidden md:block">
              Portfolia
            </span>
          </div>

          {/* Fox Avatar - Plus gros et flottant */}
          <div
            className={`relative mb-6 animate-float-slow transition-all duration-500 ${isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
          >
            <div
              className={`w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 transition-all duration-300 ${isLoading ? "animate-pulse" : ""}`}
            >
              <img
                src="/logo.svg"
                alt="Fox"
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
              />
            </div>

            {/* Indicateur de traitement */}
            {isLoading && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-orange-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Génération IA...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bulle de dialogue - Glassmorphism */}
          <div
            className={`w-full max-w-lg mb-8 transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
          >
            <div className="relative">
              {/* Flèche vers Fox */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-white/80 dark:border-b-white/10 border-r-[12px] border-r-transparent" />

              <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-white/20 rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-none">
                <p className="text-slate-900 dark:text-white text-lg md:text-xl font-medium text-center leading-relaxed">
                  {foxQuestion}
                </p>
              </div>
            </div>
          </div>

          {/* Zone d'Inputs */}
          <div
            className={`w-full max-w-md transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
          >
            {/* Étape 0: Démarrer - BOUTON JUICY */}
            {step === 0 && (
              <button
                onClick={handleStart}
                className="group relative overflow-hidden w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 font-bold text-white shadow-xl shadow-orange-500/30 text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-orange-500/40"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_0.75s_ease-out]" />
                <span className="relative z-10">C'est parti !</span>
                <Rocket size={24} className="relative z-10" />
              </button>
            )}

            {/* Étape 1: Prénom + Nom */}
            {step === 1 && (
              <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Prénom"
                  className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition placeholder-slate-400 dark:placeholder-slate-500 text-center"
                />
                <input
                  type="text"
                  value={inputValue2}
                  onChange={(e) => setInputValue2(e.target.value)}
                  placeholder="Nom"
                  className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition placeholder-slate-400 dark:placeholder-slate-500 text-center"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-bold text-white shadow-lg shadow-orange-500/30 text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  Valider <Send size={20} />
                </button>
              </form>
            )}

            {/* Étape 2: Objectif (texte libre) */}
            {step === 2 && (
              <form
                onSubmit={handleObjectiveSubmit}
                className="flex flex-col gap-4"
              >
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ex: Stage développement, Data Engineer, CDI marketing..."
                  className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition placeholder-slate-400 dark:placeholder-slate-500 text-center"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-bold text-white shadow-lg shadow-orange-500/30 text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  Valider <Send size={20} />
                </button>
              </form>
            )}

            {/* Étape 3: Compétences */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Suggéré pour votre profil — vous pouvez aussi saisir les
                  vôtres.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder="Ajouter une compétence..."
                    className="flex-1 bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    disabled={!skillInput.trim()}
                    className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-orange-500 text-white font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS_DEFAULT.filter(
                    (s: string) => !selectedSkills.includes(s),
                  ).map((skill: string) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition border border-slate-200 dark:border-slate-700"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>

                <button
                  onClick={submitSkills}
                  disabled={selectedSkills.length < 3}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-bold text-white shadow-lg shadow-orange-500/30 text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Valider ({selectedSkills.length}/3 min) <Check size={20} />
                </button>
              </div>
            )}

            {/* Étape 4: Expérience */}
            {step === 4 && (
              <form onSubmit={handleExpSubmit} className="flex flex-col gap-4">
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ex: Vendeur chez H&M"
                  className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition placeholder-slate-400 dark:placeholder-slate-500 text-center"
                />
                <div className="relative">
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-bold text-white shadow-lg shadow-orange-500/30 text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />{" "}
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} /> Générer avec l'IA
                      </>
                    )}
                  </button>
                  <div className="absolute -top-1 -right-1">
                    <AIBadgeInline featureName="la génération de description IA" />
                  </div>
                </div>
              </form>
            )}

            {/* Étape 5: Confirmation */}
            {step === 5 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Une fois votre compte créé, vous pourrez enrichir votre profil
                  (formations, projets, certifications) depuis Mon Profil.
                </p>
                <button
                  onClick={handleGoToRegister}
                  className="group relative overflow-hidden w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 font-bold text-white shadow-xl shadow-orange-500/30 text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_0.75s_ease-out]" />
                  <span className="relative z-10">Créer mon compte</span>
                  <ChevronRight size={24} className="relative z-10" />
                </button>
              </div>
            )}

            {/* Étape 6: Inscription */}
            {step === 6 && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {registerError && (
                  <div className="bg-red-50 dark:bg-red-500/20 backdrop-blur border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                    {registerError}
                  </div>
                )}

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Email"
                    className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div className="relative">
                  <AtSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-_]/g, ""),
                      }))
                    }
                    placeholder="Nom d'utilisateur"
                    className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Mot de passe (8 caractères min)"
                    className="w-full bg-white dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
                  En créant un compte, vous acceptez nos{" "}
                  <a
                    href="/legal?tab=cgu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    CGU
                  </a>{" "}
                  et notre{" "}
                  <a
                    href="/legal?tab=privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    Politique de Confidentialité
                  </a>
                </p>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold text-white shadow-lg shadow-green-500/30 text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Création...
                    </>
                  ) : (
                    <>
                      Sauvegarder mon profil <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* --- PARTIE DROITE : CARTE CV EN LÉVITATION (40%) --- */}
        <div className="hidden md:flex w-[40%] items-center justify-center p-6 lg:p-10 relative">
          {/* Carte CV en lévitation */}
          <div
            className={`animate-card-float bg-white dark:bg-slate-900/80 backdrop-blur-xl w-full max-w-[420px] aspect-[1/1.3] shadow-2xl shadow-slate-200 dark:shadow-black/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 lg:p-8 flex flex-col transition-all duration-700 ${step > 0 ? "opacity-100" : "opacity-40 blur-sm"}`}
          >
            {/* En-tête CV */}
            <div className="flex justify-between items-start border-b-2 border-orange-500/50 pb-5 mb-6">
              <div>
                <h2
                  className={`text-2xl lg:text-3xl font-bold tracking-tight transition-all duration-300 ${cvData.name ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600"}`}
                >
                  {cvData.name || "Votre Nom"}
                </h2>
                <p
                  className={`font-semibold text-base lg:text-lg mt-2 transition-all duration-300 ${cvData.jobTitle ? "text-orange-500" : "text-slate-300 dark:text-slate-700"}`}
                >
                  {cvData.jobTitle || "Votre Objectif"}
                </p>
              </div>
              <div
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full border-4 flex items-center justify-center transition-all ${cvData.name ? "bg-slate-100 dark:bg-slate-800 border-orange-500/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"}`}
              >
                <User
                  size={28}
                  className={
                    cvData.name
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-slate-300 dark:text-slate-700"
                  }
                />
              </div>
            </div>

            {/* Contenu CV — scrollable */}
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1">
              {/* Section Expérience */}
              <div
                className={`transition-all duration-500 flex-shrink-0 ${step === 4 ? "ring-2 ring-orange-500/50 rounded-xl p-3 -m-3 bg-orange-50 dark:bg-orange-500/5" : ""} ${cvData.expTitle ? "opacity-100" : "opacity-30"}`}
              >
                <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
                  <Briefcase size={14} className="text-orange-500" /> Expérience
                </h3>
                <div className="font-semibold text-base text-slate-900 dark:text-white mb-0.5">
                  {cvData.expTitle || "En attente..."}
                </div>
                {cvData.expCompany && (
                  <div className="text-sm text-slate-500 mb-1.5">
                    {cvData.expCompany}
                  </div>
                )}
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {cvData.expBullets.length > 0 ? (
                    cvData.expBullets.slice(0, 3).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span className="line-clamp-2">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-slate-400 dark:text-slate-600">
                      Description du poste...
                    </li>
                  )}
                </ul>
              </div>

              {/* Section Compétences */}
              <div
                className={`transition-all duration-500 flex-shrink-0 ${step === 3 ? "ring-2 ring-orange-500/50 rounded-xl p-3 -m-3 bg-orange-50 dark:bg-orange-500/5" : ""} ${cvData.skills.length > 0 ? "opacity-100" : "opacity-30"}`}
              >
                <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-500" /> Compétences
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cvData.skills.length > 0 ? (
                    cvData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white px-2.5 py-0.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-6 w-14 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer CV */}
            <div className="mt-auto text-center text-[10px] text-slate-400 dark:text-slate-600 pt-4 border-t border-slate-100 dark:border-slate-800">
              Généré via Portfolia • Design System v2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
