/**
 * FoxInterviewView - IMMERSIVE COCKPIT MODE
 *
 * Interface unifiée et gamifiée pour l'entretien avec Fox :
 * - Fond sombre unifié avec spotlight sur Fox
 * - Bulle de dialogue glassmorphism
 * - Carte CV en lévitation à droite
 * - Animations fluides et feedback visuel
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Mic,
  Square,
  Sparkles,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Target,
  Keyboard,
  Send,
  Volume2,
  Edit3,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useAudioRecorder, formatDuration } from "../hooks/useAudioRecorder";
import { api } from "../services/api";
import { AIBadge } from "../components/AIBadge";

// ==================== TYPES ====================

interface DetectedCard {
  id: string;
  type: "experience" | "education" | "project";
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  timestamp: Date;
}

interface StepData {
  id: string;
  icon: React.ReactNode;
  title: string;
  question: string;
}

interface ProfileData {
  full_name?: string;
  bio?: string;
  location?: string;
  experiences?: Experience[];
  educations?: Education[];
  skills?: string[];
  projects?: Project[];
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

interface Education {
  degree: string;
  school: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface Project {
  name: string;
  description?: string;
  technologies?: string[];
}

type ViewMode = "interview" | "review";

// ==================== ÉTAPES SIMPLIFIÉES (Focus Value) ====================

const STORY_STEPS: StepData[] = [
  {
    id: "experiences",
    icon: <Briefcase size={24} />,
    title: "Expériences",
    question:
      "Parlons de vos expériences professionnelles. Quelle a été votre dernière mission ou emploi ?",
  },
  {
    id: "educations",
    icon: <GraduationCap size={24} />,
    title: "Formations",
    question:
      "Passons à vos études. Quel est votre dernier diplôme ou formation ?",
  },
  {
    id: "projects",
    icon: <Target size={24} />,
    title: "Projets",
    question:
      "Avez-vous des projets personnels ou réalisations dont vous êtes fier(e) ?",
  },
];

// ==================== COMPOSANT PRINCIPAL ====================

export const FoxInterviewView: React.FC = () => {
  const {
    setView,
    isAuthenticated,
    requireAuth,
    fetchProfile,
    fetchExperiences,
    fetchEducations,
    fetchProjects,
    fetchSkills,
    fetchLanguages,
    fetchCertifications,
    setActiveToast,
    addPts,
    user,
  } = useGameStore();

  // État de l'interview
  const [currentStep, setCurrentStep] = useState(0);
  const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // UX Persistent Feedback : 2 zones
  const [previousFeedback, setPreviousFeedback] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");

  // Mode micro / texte
  const [inputMode, setInputMode] = useState<"mic" | "text">("mic");
  const [micError, setMicError] = useState<string | null>(null);

  // Mode Review
  const [viewMode, setViewMode] = useState<ViewMode>("interview");
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Ref pour éviter les initialisations multiples
  const initializedRef = useRef(false);

  // Hook audio avec gestion d'erreur
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
    hasSupport: hasAudioSupport,
    error: audioError,
  } = useAudioRecorder({
    maxDuration: 120,
  });

  // Étape actuelle
  const currentStepData = STORY_STEPS[currentStep];

  // Initialisation : Message de bienvenue
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setPreviousFeedback(
        "Salut ! 🦊 Je suis Fox, votre coach carrière. Répondez à 3 questions et je crée votre profil pro !",
      );
      setCurrentQuestion(STORY_STEPS[0].question);

      // Vérifier le support micro
      if (!hasAudioSupport) {
        setMicError("Enregistrement audio non supporté par votre navigateur.");
        setInputMode("text");
      }
    }
  }, [hasAudioSupport]);

  // Gérer les erreurs audio (NotAllowedError, etc.)
  useEffect(() => {
    if (audioError) {
      if (
        audioError.includes("Permission") ||
        audioError.includes("refusée") ||
        audioError.includes("NotAllowed")
      ) {
        setMicError(
          "🔒 Micro bloqué. Vérifiez la barre d'adresse ou passez en mode texte.",
        );
        setInputMode("text");
      } else {
        setMicError(audioError);
      }
    }
  }, [audioError]);

  // Envoyer l'audio au backend
  const sendAudioToBackend = useCallback(
    async (blob: Blob) => {
      if (!isAuthenticated) {
        requireAuth(() => {});
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("step_id", currentStepData.id);
        formData.append("step_index", String(currentStep));

        const response = await api.post(
          "/api/interview/analyze-audio",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        processResponse(response.data);
      } catch (err: any) {
        console.error("❌ Erreur envoi audio:", err);
        if (err.response?.status === 404) {
          setError("Service audio indisponible. Utilisez le mode texte.");
          setInputMode("text");
        } else {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Erreur lors du traitement.",
          );
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [isAuthenticated, requireAuth, currentStep, currentStepData],
  );

  // Envoyer le texte au backend
  const sendTextToBackend = useCallback(async () => {
    if (!textInput.trim()) return;

    if (!isAuthenticated) {
      requireAuth(() => {});
      return;
    }

    setIsProcessing(true);
    setError(null);
    const text = textInput;
    setTextInput("");

    try {
      const response = await api.post("/api/interview/analyze-text", {
        text,
        step_id: currentStepData.id,
        step_index: currentStep,
      });

      processResponse(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Erreur lors du traitement.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [textInput, isAuthenticated, requireAuth, currentStep, currentStepData]);

  // Traiter la réponse du backend
  const processResponse = (data: any) => {
    // Ajouter les cartes
    if (data.detected_items) {
      const newCards = data.detected_items.map((item: any) => ({
        id: `${item.type}-${Date.now()}-${Math.random()}`,
        type: item.type,
        icon: getIconForType(item.type),
        color: getColorForType(item.type),
        label: item.label,
        value: item.value,
        timestamp: new Date(),
      }));
      setDetectedCards((prev) => [...prev, ...newCards]);
    }

    // UX Persistent Feedback : mettre à jour les 2 zones
    const foxReaction = data.fox_reply || "C'est noté !";
    setPreviousFeedback(foxReaction);

    // Passer à l'étape suivante ou terminer
    setTimeout(() => {
      if (currentStep < STORY_STEPS.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setCurrentQuestion(STORY_STEPS[nextStep].question);
      } else {
        // Fin des questions → Mode Review
        enterReviewMode();
      }
    }, 1500);
  };

  // Entrer en mode Review
  const enterReviewMode = async () => {
    setIsProcessing(true);
    setPreviousFeedback(
      "🎉 Bravo ! J'ai tout noté. Vérifiez et corrigez si besoin.",
    );
    setCurrentQuestion("Validez votre profil quand vous êtes prêt(e) !");

    try {
      const response = await api.get("/api/interview/review");
      setProfileData(response.data.data || {});
    } catch (err) {
      console.error("Erreur récupération review:", err);
      setProfileData({});
    } finally {
      setIsProcessing(false);
      setViewMode("review");
    }
  };

  // Finaliser avec les données corrigées
  const handleFinalizeWithCorrections = async () => {
    setIsFinalizing(true);
    setError(null);

    try {
      const response = await api.post("/api/interview/update-finalize", {
        data: profileData,
      });

      // Compter les données AVANT finalisation
      const expCountBefore = profileData.experiences?.length || 0;
      const eduCountBefore = profileData.educations?.length || 0;
      const projCountBefore = profileData.projects?.length || 0;

      // Recharger les données
      await Promise.all([
        fetchProfile(),
        fetchExperiences(),
        fetchEducations(),
        fetchProjects(),
        fetchSkills(),
        fetchLanguages(),
        fetchCertifications(),
      ]);

      // VALIDATION : Vérifier que toutes les données sont bien dans le profil
      // Attendre un peu pour que le store soit mis à jour
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Récupérer les données actuelles du store
      const currentState = useGameStore.getState();
      const expCountAfter = currentState.experiences?.length || 0;
      const eduCountAfter = currentState.educations?.length || 0;
      const projCountAfter = currentState.projects?.length || 0;

      // Avertir si des données sont perdues (mais ne pas bloquer l'utilisateur)
      if (expCountAfter < expCountBefore) {
        console.warn(
          `⚠️ [FOX INTERVIEW] ${expCountBefore - expCountAfter} expérience(s) perdue(s) ` +
            `(${expCountBefore} → ${expCountAfter})`,
        );
      }
      if (eduCountAfter < eduCountBefore) {
        console.warn(
          `⚠️ [FOX INTERVIEW] ${eduCountBefore - eduCountAfter} formation(s) perdue(s) ` +
            `(${eduCountBefore} → ${eduCountAfter})`,
        );
      }
      if (projCountAfter < projCountBefore) {
        console.warn(
          `⚠️ [FOX INTERVIEW] ${projCountBefore - projCountAfter} projet(s) perdu(s) ` +
            `(${projCountBefore} → ${projCountAfter})`,
        );
      }

      // Récompense
      await addPts(100, "Profil complété avec Fox !");

      setIsComplete(true);
      setPreviousFeedback("🎉 Parfait ! Votre profil pro est prêt !");
      setCurrentQuestion(
        "Vous êtes maintenant équipé(e) pour conquérir le marché !",
      );

      // Message de succès avec détails
      const successParts = [];
      if (response.data.stats?.experiences?.created) {
        successParts.push(
          `${response.data.stats.experiences.created} expérience(s)`,
        );
      }
      if (response.data.stats?.educations?.created) {
        successParts.push(
          `${response.data.stats.educations.created} formation(s)`,
        );
      }
      if (response.data.stats?.projects?.created) {
        successParts.push(`${response.data.stats.projects.created} projet(s)`);
      }
      const successMessage =
        successParts.length > 0 ? successParts.join(", ") : "Données ajoutées";

      setActiveToast({
        type: "success",
        title: "🦊 Profil finalisé !",
        message: successMessage,
      });

      // Si c'est un nouveau compte qui vient de finir Fox Interview, modifier le flag pour lancer l'onboarding
      if (user?.id) {
        const pendingOnboarding = localStorage.getItem(
          `pending_onboarding_${user.id}`,
        );
        if (pendingOnboarding === "after_fox_interview") {
          // Modifier le flag pour indiquer qu'on peut maintenant lancer l'onboarding
          localStorage.setItem(`pending_onboarding_${user.id}`, "immediate");
          // S'assurer que onboarding_seen n'est pas défini pour forcer le lancement du tutoriel
          // (ou le supprimer s'il existe déjà)
          localStorage.removeItem(`onboarding_seen_${user.id}`);
          // Note: La redirection vers le dashboard se fera quand l'utilisateur clique sur "Aller au Bureau"
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la finalisation.");
    } finally {
      setIsFinalizing(false);
    }
  };

  // Gérer le clic sur le bouton micro
  const handleMicClick = async () => {
    try {
      if (isRecording) {
        const blob = await stopRecording();
        if (blob) {
          sendAudioToBackend(blob);
        }
      } else {
        resetRecording();
        await startRecording();
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setMicError(
          "🔒 Micro bloqué. Vérifiez la barre d'adresse ou passez en mode texte.",
        );
        setInputMode("text");
      } else {
        setMicError(err.message || "Erreur micro");
      }
    }
  };

  // Basculer vers mode texte
  const switchToTextMode = () => {
    setInputMode("text");
    setMicError(null);
  };

  // Recommencer
  const handleRestart = () => {
    setCurrentStep(0);
    setDetectedCards([]);
    setIsComplete(false);
    setViewMode("interview");
    setProfileData({});
    setError(null);
    setMicError(null);
    setPreviousFeedback("Salut ! 🦊 Je suis Fox. Recommençons !");
    setCurrentQuestion(STORY_STEPS[0].question);
    resetRecording();
  };

  // Calcul progression
  const progressPercent =
    viewMode === "review"
      ? 100
      : ((currentStep + 1) / STORY_STEPS.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden relative">
      {/* ===== ANIMATIONS CSS ===== */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
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
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05); }
          50% { box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.08); }
        }
        .animate-card-glow {
          animation: card-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* ===== BARRE DE PROGRESSION PREMIUM (Tout en haut) ===== */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ===== HEADER MINIMAL ===== */}
      <header className="flex-shrink-0 px-4 md:px-6 py-4 z-30 flex items-center justify-between">
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors text-sm group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="hidden sm:inline">Quitter</span>
        </button>

        <AIBadge
          position="inline"
          size="sm"
          variant="minimal"
          featureName="l'entretien conversationnel IA"
        />

        {/* Steps indicators */}
        <div className="flex items-center gap-2">
          {STORY_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                idx < currentStep || viewMode === "review"
                  ? "bg-green-500/20 text-green-400"
                  : idx === currentStep && viewMode === "interview"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              {idx < currentStep || viewMode === "review" ? (
                <CheckCircle2 size={16} />
              ) : (
                <span className="text-xs font-bold">{idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* ===== CONTENU PRINCIPAL - LAYOUT IMMERSIF ===== */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* SPOTLIGHT Background derrière Fox */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Spotlight radial principal */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full animate-spotlight"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.05) 40%, transparent 70%)",
              top: "10%",
              left: "5%",
              transform: "translate(-30%, -20%)",
            }}
          />
          {/* Accent violet subtil */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 60%)",
              bottom: "20%",
              left: "20%",
            }}
          />
        </div>

        {/* ===== ZONE GAUCHE (60%) - COACH FOX ===== */}
        <div className="lg:w-[60%] flex-shrink-0 flex flex-col items-center justify-center p-6 md:p-8 relative z-10">
          {/* Fox Avatar - Plus gros et flottant */}
          <div className="relative mb-6 animate-float-slow">
            <div
              className={`w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 transition-all duration-500 ${
                isRecording ? "scale-110 ring-4 ring-orange-400/50" : ""
              } ${isProcessing || isFinalizing ? "opacity-70" : ""}`}
            >
              <img
                src="/logo.svg"
                alt="Fox"
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
              />
            </div>

            {/* Indicateur de traitement */}
            {(isProcessing || isFinalizing) && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-orange-400" />
                  <span className="text-xs text-slate-300 font-medium">
                    Analyse en cours...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Zone Dialogue - Glassmorphism avec flèche */}
          <div className="w-full max-w-xl space-y-4 mb-8">
            {/* Feedback précédent (plus discret) */}
            {previousFeedback && (
              <div className="text-center">
                <p className="text-slate-400 text-sm md:text-base">
                  {previousFeedback}
                </p>
              </div>
            )}

            {/* Bulle principale - Glassmorphism */}
            <div className="relative">
              {/* Flèche vers Fox */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-white/10 border-r-[12px] border-r-transparent" />

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
                <p className="text-white text-lg md:text-2xl font-medium text-center leading-relaxed">
                  {currentQuestion}
                </p>
              </div>
            </div>
          </div>

          {/* Zone d'interaction */}
          {viewMode === "interview" && !isComplete && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              {/* Alerte Micro Bloqué */}
              {micError && (
                <div className="w-full bg-amber-500/20 backdrop-blur border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Lock size={18} className="text-amber-400 flex-shrink-0" />
                  <p className="text-amber-200 text-sm flex-1">{micError}</p>
                  <button
                    onClick={switchToTextMode}
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium underline"
                  >
                    Mode texte
                  </button>
                </div>
              )}

              {/* Mode Micro */}
              {inputMode === "mic" && !micError && (
                <>
                  <button
                    onClick={handleMicClick}
                    disabled={isProcessing}
                    className={`relative group ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 -m-4 bg-red-500/30 rounded-full animate-ping" />
                        <div className="absolute inset-0 -m-8 bg-red-500/15 rounded-full animate-pulse" />
                      </>
                    )}

                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl border-2 ${
                        isRecording
                          ? "bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-red-500/50 scale-105"
                          : "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/40 hover:scale-[1.02] hover:shadow-orange-500/50"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square
                            size={32}
                            className="text-white mb-1"
                            fill="white"
                          />
                          <span className="text-white font-bold text-sm">
                            {formatDuration(recordingDuration)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Mic size={36} className="text-white mb-1" />
                          <span className="text-white/80 text-xs font-medium">
                            Appuyez
                          </span>
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={switchToTextMode}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
                  >
                    <Keyboard size={16} />
                    Préférez écrire ?
                  </button>
                </>
              )}

              {/* Mode Texte */}
              {inputMode === "text" && (
                <div className="w-full space-y-3">
                  <div className="relative">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Décrivez votre expérience, formation ou projet..."
                      rows={3}
                      className="w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      autoFocus
                    />
                    <button
                      onClick={sendTextToBackend}
                      disabled={!textInput.trim() || isProcessing}
                      className="absolute bottom-3 right-3 p-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>

                  {hasAudioSupport && !micError && (
                    <button
                      onClick={() => setInputMode("mic")}
                      className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm transition-colors w-full"
                    >
                      <Mic size={16} />
                      Utiliser le micro
                    </button>
                  )}
                </div>
              )}

              {/* Erreur générale */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur border border-red-500/30 rounded-xl px-4 py-2 text-red-300 text-sm text-center">
                  <AlertTriangle size={16} className="inline mr-2" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Mode Review - Bouton Valider JUICY */}
          {viewMode === "review" && !isComplete && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleFinalizeWithCorrections}
                disabled={isFinalizing}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-500/30 transition-all disabled:opacity-50 flex items-center gap-3 hover:scale-[1.02] active:scale-95"
              >
                {/* Shimmer effect */}
                <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
                {isFinalizing ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Save size={22} />
                )}
                <span className="relative z-10">Valider mon profil</span>
                <ArrowRight
                  size={20}
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          )}

          {/* Écran de fin */}
          {isComplete && (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/40">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Profil finalisé !
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    // Si c'est un nouveau compte, rediriger vers le dashboard pour lancer le tutoriel
                    if (user?.id) {
                      const pendingOnboarding = localStorage.getItem(
                        `pending_onboarding_${user.id}`,
                      );
                      if (pendingOnboarding === "immediate") {
                        setView("dashboard");
                        return;
                      }
                    }
                    setView("profile");
                  }}
                  className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative z-10">Voir mon profil</span>
                </button>
                <button
                  onClick={() => {
                    // Si c'est un nouveau compte, rediriger vers le dashboard pour lancer le tutoriel
                    if (user?.id) {
                      const pendingOnboarding = localStorage.getItem(
                        `pending_onboarding_${user.id}`,
                      );
                      if (pendingOnboarding === "immediate") {
                        setView("dashboard");
                        return;
                      }
                    }
                    setView("dashboard");
                  }}
                  className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative z-10">Aller au Bureau</span>
                </button>
                <button
                  onClick={handleRestart}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===== ZONE DROITE (40%) - CARTE CV EN LÉVITATION ===== */}
        <div className="lg:w-[40%] flex-1 lg:flex-none flex items-center justify-center p-4 md:p-6 relative z-10">
          {/* Carte en lévitation */}
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden animate-card-glow transform lg:rotate-1 lg:hover:rotate-0 transition-transform duration-500">
            {/* Header carte */}
            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {viewMode === "review" ? (
                  <>
                    <Edit3 size={18} className="text-purple-400" />
                    <h3 className="text-white font-semibold">
                      Vérifier & Corriger
                    </h3>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-orange-400" />
                    <h3 className="text-white font-semibold">Votre CV</h3>
                  </>
                )}
              </div>
              <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {viewMode === "review"
                  ? `${(profileData.experiences?.length || 0) + (profileData.educations?.length || 0) + (profileData.projects?.length || 0)} éléments`
                  : `${detectedCards.length} éléments`}
              </span>
            </div>

            {/* Contenu scrollable */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {/* Mode Interview - Cartes détectées */}
              {viewMode === "interview" && (
                <>
                  {detectedCards.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <Volume2 size={28} className="text-slate-500" />
                      </div>
                      <p className="text-slate-500 text-sm">
                        Parlez ou écrivez pour voir
                        <br />
                        les données apparaître ici
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detectedCards.map((card, idx) => (
                        <div
                          key={card.id}
                          className={`animate-in slide-in-from-right duration-300 ${
                            idx === detectedCards.length - 1
                              ? "ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20"
                              : ""
                          }`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <DataCard
                            card={card}
                            isLatest={idx === detectedCards.length - 1}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Mode Review - Formulaire éditable */}
              {viewMode === "review" && (
                <ReviewForm data={profileData} onChange={setProfileData} />
              )}

              {/* Confirmation finale */}
              {isComplete && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400" size={24} />
                    <div>
                      <p className="text-green-300 font-semibold">
                        Profil enregistré !
                      </p>
                      <p className="text-green-400/70 text-sm">
                        Toutes vos informations sont sauvegardées.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ==================== COMPOSANTS ====================

const DataCard: React.FC<{ card: DetectedCard; isLatest?: boolean }> = ({
  card,
  isLatest,
}) => (
  <div
    className={`bg-slate-800/50 backdrop-blur border rounded-xl p-4 transition-all ${
      isLatest
        ? "border-orange-500/50 bg-slate-800/80"
        : "border-slate-700/50 hover:border-slate-600"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}
      >
        {card.icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {card.label}
        </span>
        <p className="text-white text-sm font-medium mt-1">{card.value}</p>
      </div>
    </div>
  </div>
);

// Formulaire d'édition simplifié
const ReviewForm: React.FC<{
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}> = ({ data, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["experiences", "educations", "projects"]),
  );

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any,
  ) => {
    const newExps = [...(data.experiences || [])];
    newExps[index] = { ...newExps[index], [field]: value };
    onChange({ ...data, experiences: newExps });
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: any,
  ) => {
    const newEdus = [...(data.educations || [])];
    newEdus[index] = { ...newEdus[index], [field]: value };
    onChange({ ...data, educations: newEdus });
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const newProjs = [...(data.projects || [])];
    newProjs[index] = { ...newProjs[index], [field]: value };
    onChange({ ...data, projects: newProjs });
  };

  const removeItem = (
    type: "experiences" | "educations" | "projects",
    index: number,
  ) => {
    const newItems = [...(data[type] || [])];
    newItems.splice(index, 1);
    onChange({ ...data, [type]: newItems });
  };

  const updateBio = (value: string) => {
    onChange({ ...data, bio: value });
  };

  return (
    <div className="space-y-4">
      {/* Bio Générée */}
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4">
        <label className="flex items-center gap-2 text-white font-semibold mb-3">
          <Sparkles size={16} className="text-orange-400" />
          Bio Générée par Fox
        </label>
        <textarea
          value={data.bio || ""}
          onChange={(e) => updateBio(e.target.value)}
          placeholder="Votre bio professionnelle..."
          rows={3}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none placeholder-slate-500"
        />
      </div>

      {/* Expériences */}
      <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50">
        <button
          onClick={() => toggleSection("experiences")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Briefcase size={16} className="text-orange-400" />
            Expériences ({data.experiences?.length || 0})
          </h4>
          {expandedSections.has("experiences") ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </button>

        {expandedSections.has("experiences") && (
          <div className="px-4 pb-4 space-y-3">
            {(data.experiences || []).map((exp, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={exp.title || ""}
                    onChange={(e) =>
                      updateExperience(idx, "title", e.target.value)
                    }
                    placeholder="Titre du poste"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => removeItem("experiences", idx)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={exp.company || ""}
                  onChange={(e) =>
                    updateExperience(idx, "company", e.target.value)
                  }
                  placeholder="Entreprise"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <textarea
                  value={exp.description || ""}
                  onChange={(e) =>
                    updateExperience(idx, "description", e.target.value)
                  }
                  placeholder="Description"
                  rows={2}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            ))}
            {(!data.experiences || data.experiences.length === 0) && (
              <p className="text-slate-500 text-sm text-center py-4">
                Aucune expérience détectée
              </p>
            )}
          </div>
        )}
      </div>

      {/* Formations */}
      <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50">
        <button
          onClick={() => toggleSection("educations")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <h4 className="text-white font-semibold flex items-center gap-2">
            <GraduationCap size={16} className="text-purple-400" />
            Formations ({data.educations?.length || 0})
          </h4>
          {expandedSections.has("educations") ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </button>

        {expandedSections.has("educations") && (
          <div className="px-4 pb-4 space-y-3">
            {(data.educations || []).map((edu, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={edu.degree || ""}
                    onChange={(e) =>
                      updateEducation(idx, "degree", e.target.value)
                    }
                    placeholder="Diplôme"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => removeItem("educations", idx)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={edu.school || ""}
                  onChange={(e) =>
                    updateEducation(idx, "school", e.target.value)
                  }
                  placeholder="École"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            ))}
            {(!data.educations || data.educations.length === 0) && (
              <p className="text-slate-500 text-sm text-center py-4">
                Aucune formation détectée
              </p>
            )}
          </div>
        )}
      </div>

      {/* Projets */}
      <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50">
        <button
          onClick={() => toggleSection("projects")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Target size={16} className="text-cyan-400" />
            Projets ({data.projects?.length || 0})
          </h4>
          {expandedSections.has("projects") ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </button>

        {expandedSections.has("projects") && (
          <div className="px-4 pb-4 space-y-3">
            {(data.projects || []).map((proj, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={proj.name || ""}
                    onChange={(e) => updateProject(idx, "name", e.target.value)}
                    placeholder="Nom du projet"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => removeItem("projects", idx)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  value={proj.description || ""}
                  onChange={(e) =>
                    updateProject(idx, "description", e.target.value)
                  }
                  placeholder="Description"
                  rows={2}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            ))}
            {(!data.projects || data.projects.length === 0) && (
              <p className="text-slate-500 text-sm text-center py-4">
                Aucun projet détecté
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helpers
function getIconForType(type: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    experience: <Briefcase size={20} className="text-white" />,
    education: <GraduationCap size={20} className="text-white" />,
    project: <Target size={20} className="text-white" />,
  };
  return icons[type] || <Sparkles size={20} className="text-white" />;
}

function getColorForType(type: string): string {
  const colors: Record<string, string> = {
    experience: "bg-gradient-to-br from-orange-500 to-orange-700",
    education: "bg-gradient-to-br from-purple-500 to-purple-700",
    project: "bg-gradient-to-br from-cyan-500 to-cyan-700",
  };
  return colors[type] || "bg-gradient-to-br from-slate-500 to-slate-700";
}

export default FoxInterviewView;
