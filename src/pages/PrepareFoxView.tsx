/**
 * PrepareFoxView - Prépare-moi Fox
 *
 * Préparation à l'entretien technique : questions générées à partir de l'offre,
 * réponses par texte ou micro, puis note /20 et feedback (même DA que Coache-moi Fox).
 */

import React, { useState, useCallback, useEffect } from "react";
import Lottie from "lottie-react";
import {
  ArrowLeft,
  Mic,
  Square,
  Loader2,
  Send,
  Keyboard,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useAudioRecorder, formatDuration } from "../hooks/useAudioRecorder";
import { prepareFoxAPI, type PrepareFoxDifficulty } from "../services/api";
import { AIBadge } from "../components/AIBadge";

const NUM_QUESTIONS_OPTIONS = [3, 5, 7, 10];
const DIFFICULTY_OPTIONS: {
  value: PrepareFoxDifficulty;
  label: string;
  desc: string;
}[] = [
  { value: "easy", label: "Facile", desc: "Définitions et rappel" },
  { value: "medium", label: "Moyen", desc: "Mise en pratique, cas concrets" },
  {
    value: "hard",
    label: "Difficile",
    desc: "Architecture, compromis, cas complexes",
  },
];

type Phase = "choose" | "loading" | "questions" | "result";

export const PrepareFoxView: React.FC = () => {
  const { setView, setPrepareFoxOffer, isAuthenticated, requireAuth } =
    useGameStore();
  const offer = useGameStore((s) => s.prepareFoxOffer);

  const [phase, setPhase] = useState<Phase>("choose");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<PrepareFoxDifficulty>("medium");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"mic" | "text">("mic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackPositives, setFeedbackPositives] = useState<string[]>([]);
  const [questionsFeedback, setQuestionsFeedback] = useState<
    Array<{ question: string; suggested_answer: string; comment: string }>
  >([]);
  const [happyFoxLottie, setHappyFoxLottie] = useState<object | null>(null);

  useEffect(() => {
    fetch("/HappyFox.json")
      .then((r) => r.json())
      .then(setHappyFoxLottie)
      .catch(() => setHappyFoxLottie(null));
  }, []);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
    hasSupport: hasAudioSupport,
    error: audioError,
  } = useAudioRecorder({ maxDuration: 120 });

  React.useEffect(() => {
    if (audioError) {
      if (
        audioError.includes("Permission") ||
        audioError.includes("refusée") ||
        audioError.includes("NotAllowed")
      ) {
        setMicError("Micro bloqué. Passez en mode texte.");
        setInputMode("text");
      } else {
        setMicError(audioError);
      }
    }
  }, [audioError]);

  const startSession = useCallback(async () => {
    if (!offer?.offerUrl || !isAuthenticated) {
      requireAuth(() => {});
      return;
    }
    setPhase("loading");
    setError(null);
    try {
      const res = await prepareFoxAPI.start(
        offer.offerUrl,
        numQuestions,
        offer.offerTitle ?? undefined,
        difficulty,
      );
      setSessionId(res.session_id);
      setCurrentQuestion(res.question);
      setCurrentIndex(res.current_question_index);
      setTotalQuestions(res.total_questions);
      setPhase("questions");
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (
              err as {
                response?: {
                  data?: { detail?: string | string[] };
                  status?: number;
                };
              }
            ).response
          : null;
      const detail = res?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail) && detail.length > 0
            ? detail.join(". ")
            : res?.status === 500
              ? "Erreur serveur. Vérifiez les logs backend ou réessayez."
              : "Impossible de démarrer la préparation. Réessayez.";
      setError(msg);
      setPhase("choose");
    }
  }, [offer, numQuestions, difficulty, isAuthenticated, requireAuth]);

  const submitAnswer = useCallback(
    async (text: string) => {
      if (!sessionId || !text.trim()) return;
      setIsProcessing(true);
      setError(null);
      setTextInput("");
      try {
        const res = await prepareFoxAPI.answer(sessionId, text.trim());
        if (res.done && res.score != null) {
          setScore(res.score);
          setFeedback(res.feedback ?? "");
          setFeedbackPositives(res.feedback_positives ?? []);
          setQuestionsFeedback(res.questions_feedback ?? []);
          setPhase("result");
        } else {
          setCurrentQuestion(res.question ?? "");
          setCurrentIndex(res.current_question_index ?? 0);
          setTotalQuestions(res.total_questions ?? totalQuestions);
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { detail?: string } } }).response
                ?.data?.detail
            : null;
        setError(
          typeof msg === "string" ? msg : "Erreur lors de l'envoi. Réessayez.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, totalQuestions],
  );

  const sendText = useCallback(() => {
    if (!textInput.trim()) return;
    submitAnswer(textInput.trim());
  }, [textInput, submitAnswer]);

  const handleMicClick = useCallback(async () => {
    if (!isAuthenticated) {
      requireAuth(() => {});
      return;
    }
    if (isRecording) {
      const blob = await stopRecording();
      if (!blob) {
        setError("Aucun enregistrement. Réessayez ou utilisez le mode texte.");
        return;
      }
      setIsProcessing(true);
      setError(null);
      try {
        const { text } = await prepareFoxAPI.transcribe(blob);
        if (text && text !== "(Audio non transcrit)") {
          await submitAnswer(text);
        } else {
          setError(
            "Transcription impossible. Réessayez ou utilisez le mode texte.",
          );
        }
      } catch {
        setError("Erreur transcription. Utilisez le mode texte.");
      } finally {
        setIsProcessing(false);
        resetRecording();
      }
    } else {
      resetRecording();
      await startRecording();
    }
  }, [
    isRecording,
    stopRecording,
    resetRecording,
    startRecording,
    submitAnswer,
    isAuthenticated,
    requireAuth,
  ]);

  const progressPercent = totalQuestions
    ? ((currentIndex + 1) / totalQuestions) * 100
    : 0;

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <p className="text-slate-400 mb-4">
          Aucune offre sélectionnée pour la préparation.
        </p>
        <button
          onClick={() => {
            setPrepareFoxOffer(null);
            localStorage.setItem("mes_offres_open_saved", "true");
            setView("mes_offres");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium"
        >
          <ArrowLeft size={18} />
          Retour aux offres sauvegardées
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden relative">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
      `}</style>

      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 transition-all duration-700"
          style={{
            width: `${phase === "questions" ? progressPercent : phase === "result" ? 100 : 0}%`,
          }}
        />
      </div>

      <header className="flex-shrink-0 px-4 md:px-6 py-4 z-30 flex items-center justify-between">
        <button
          onClick={() => {
            setPrepareFoxOffer(null);
            localStorage.setItem("mes_offres_open_saved", "true");
            setView("mes_offres");
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-medium text-sm group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
            aria-hidden="true"
          />
          Quitter
        </button>
        <AIBadge
          position="inline"
          size="sm"
          variant="minimal"
          featureName="Prépare-moi Fox"
        />
        {phase === "questions" && (
          <span className="text-slate-400 text-sm">
            Question {currentIndex + 1} / {totalQuestions}
          </span>
        )}
      </header>

      <main
        className={`flex-1 flex flex-col items-center p-6 md:p-8 relative z-10 min-h-0 ${
          phase === "result"
            ? "justify-start overflow-y-auto overflow-x-hidden"
            : "justify-center overflow-visible"
        }`}
      >
        {/* Avatar Fox — masqué pendant le chargement (seule l'animation Happy Fox + texte s'affichent) */}
        {phase !== "loading" && (
          <div className="relative mb-6 animate-float-slow">
            <div
              className={`w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 ${
                isRecording ? "scale-110 ring-4 ring-orange-400/50" : ""
              } ${isProcessing ? "opacity-70" : ""}`}
            >
              <img
                src="/logo.svg"
                alt="Fox"
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
              />
            </div>
            {isProcessing && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-2 shrink-0">
                <Loader2
                  size={14}
                  className="animate-spin text-orange-400 flex-shrink-0"
                />
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                  Analyse en cours...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Phase: choix du nombre de questions */}
        {phase === "choose" && (
          <div className="w-full max-w-md space-y-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Sparkles size={28} className="text-orange-400" />
              Prépare-moi Fox
            </h1>
            <p className="text-slate-400">
              Choisissez le nombre de questions et la difficulté pour vous
              entraîner.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {NUM_QUESTIONS_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    numQuestions === n
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {n} questions
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <span className="text-slate-500 text-sm block text-center">
                Difficulté :
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all text-center ${
                      difficulty === opt.value
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                    title={opt.desc}
                  >
                    <span className="block">{opt.label}</span>
                    <span
                      className={`block text-xs mt-0.5 ${difficulty === opt.value ? "text-rose-200" : "text-slate-500"}`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startSession}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Lancer la préparation
            </button>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Phase: chargement (animation Happy Fox) */}
        {phase === "loading" && (
          <div className="text-center text-white flex flex-col items-center">
            {happyFoxLottie ? (
              <div className="w-48 h-48 md:w-56 md:h-56 mb-4">
                <Lottie animationData={happyFoxLottie} loop />
              </div>
            ) : (
              <Loader2
                size={48}
                className="animate-spin text-orange-400 mx-auto mb-4"
              />
            )}
            <p className="text-slate-400">
              Chargement de l'offre et génération des questions...
            </p>
          </div>
        )}

        {/* Phase: questions */}
        {phase === "questions" && (
          <div className="w-full max-w-2xl space-y-6 px-2">
            <div className="relative">
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-full"
                aria-hidden
              />
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-xl text-left">
                <p className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-2">
                  Question {currentIndex + 1} sur {totalQuestions}
                </p>
                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed">
                  {currentQuestion}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {micError && (
                <div className="w-full bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Lock size={18} className="text-amber-400 flex-shrink-0" />
                  <p className="text-amber-200 text-sm flex-1">{micError}</p>
                  <button
                    onClick={() => setInputMode("text")}
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium underline"
                  >
                    Mode texte
                  </button>
                </div>
              )}

              {inputMode === "mic" && !micError && (
                <>
                  <button
                    onClick={handleMicClick}
                    disabled={isProcessing}
                    aria-label={
                      isRecording
                        ? "Arrêter l'enregistrement"
                        : "Démarrer l'enregistrement vocal"
                    }
                    className={`relative ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 -m-4 bg-red-500/30 rounded-full animate-ping" />
                        <div className="absolute inset-0 -m-8 bg-red-500/15 rounded-full animate-pulse" />
                      </>
                    )}
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center transition-all border-2 ${
                        isRecording
                          ? "bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-red-500/50 scale-105"
                          : "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/40 hover:scale-[1.02]"
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
                    onClick={() => setInputMode("text")}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm"
                  >
                    <Keyboard size={16} /> Préférez écrire ?
                  </button>
                </>
              )}

              {inputMode === "text" && (
                <div className="w-full space-y-3">
                  <div className="relative">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Votre réponse..."
                      rows={3}
                      className="w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      autoFocus
                    />
                    <button
                      onClick={sendText}
                      disabled={!textInput.trim() || isProcessing}
                      aria-label="Envoyer la réponse"
                      className="absolute bottom-3 right-3 p-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} aria-hidden="true" />
                    </button>
                  </div>
                  {hasAudioSupport && !micError && (
                    <button
                      onClick={() => setInputMode("mic")}
                      className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm w-full"
                    >
                      <Mic size={16} /> Utiliser le micro
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="w-full bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 text-red-300 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase: résultat — main fait le scroll (overflow-y-auto sur main quand phase === result) */}
        {phase === "result" && (
          <div className="w-full max-w-xl mx-auto space-y-6 text-center animate-in fade-in duration-500 pb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/40 mx-auto">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Entraînement terminé
            </h2>
            {score != null && (
              <p className="text-4xl font-bold text-orange-400">
                {score}{" "}
                <span className="text-2xl text-slate-400 font-normal">
                  / 20
                </span>
              </p>
            )}
            {feedback && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-left">
                <p className="text-white leading-relaxed">{feedback}</p>
              </div>
            )}
            {feedbackPositives.length > 0 && (
              <div className="text-left">
                <p className="text-slate-400 text-sm font-medium mb-2">
                  Ce que vous avez bien fait :
                </p>
                <ul className="space-y-1">
                  {feedbackPositives.map((item, i) => (
                    <li
                      key={`feedback-${i}`}
                      className="text-green-300/90 text-sm flex items-center gap-2"
                    >
                      <CheckCircle2
                        size={14}
                        className="flex-shrink-0 text-green-400"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {questionsFeedback.length > 0 && (
              <div className="text-left w-full max-w-xl">
                <p className="text-slate-400 text-sm font-medium mb-2">
                  Réponses proposées par l’IA (par question)
                </p>
                <div className="space-y-2">
                  {questionsFeedback.map((qf, qIdx) => (
                    <details
                      key={`qf-${qIdx}`}
                      className="group rounded-xl border border-white/20 bg-white/5 overflow-hidden"
                    >
                      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none text-sm font-medium text-white hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                        <ChevronDown
                          size={16}
                          className="text-slate-400 shrink-0 transition-transform group-open:rotate-180"
                        />
                        <span className="line-clamp-2">
                          {qf.question || `Question ${qIdx + 1}`}
                        </span>
                      </summary>
                      <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/10">
                        {qf.suggested_answer && (
                          <div>
                            <span className="text-xs font-medium text-orange-400">
                              Réponse proposée :
                            </span>
                            <p className="text-slate-200 text-sm whitespace-pre-wrap mt-0.5">
                              {qf.suggested_answer}
                            </p>
                          </div>
                        )}
                        {qf.comment && (
                          <div>
                            <span className="text-xs font-medium text-slate-400">
                              Commentaire :
                            </span>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap mt-0.5">
                              {qf.comment}
                            </p>
                          </div>
                        )}
                        {!qf.suggested_answer && !qf.comment && (
                          <p className="text-slate-500 text-sm italic">
                            Aucun détail pour cette question.
                          </p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setPrepareFoxOffer(null);
                localStorage.setItem("mes_offres_open_saved", "true");
                setView("mes_offres");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft size={18} />
              Retour aux offres sauvegardées
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
