/**
 * Saisie vocale ou texte pour les formulaires guidés Fox (expérience, formation, projet).
 * Même principe que Prépare-moi Fox : micro pour parler, ou champ texte pour écrire.
 */

import React, { useState, useCallback, useEffect } from "react";
import { Mic, Square, Keyboard, Loader2 } from "lucide-react";
import { useAudioRecorder, formatDuration } from "../hooks/useAudioRecorder";
import { prepareFoxAPI, aiAPI } from "../services/api";

export interface VoiceOrTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Nombre de lignes pour un textarea (sinon input simple) */
  rows?: number;
  /** Désactiver le bouton Valider (ex. quand vide) */
  submitDisabled?: boolean;
  /** Label du bouton de soumission */
  submitLabel?: React.ReactNode;
  isAuthenticated: boolean;
  requireAuth: (action: () => void | Promise<void>) => void;
  /** Classe pour le conteneur */
  className?: string;
  /** Pour les champs date : pas d’option micro */
  inputType?: "text" | "date";
  /** Afficher le bouton Valider (defaut true). false si le parent fournit son propre bouton. */
  showSubmitButton?: boolean;
  /** Pour les champs description : réécriture en bullets nominaux après transcription */
  entityType?: "experience" | "education" | "project";
  /** Contexte pour la réécriture (titre, organisation) */
  descriptionContext?: { title?: string; organization?: string };
  /** Formater la transcription (ex. liste à virgules → bullet points) pour champs non-description */
  formatTranscript?: (text: string) => string;
  /** Réécrire la transcription en bullets propres via l’IA (comme pour les descriptions) */
  useRewriteAsBullets?: boolean;
}

export const VoiceOrTextInput: React.FC<VoiceOrTextInputProps> = ({
  value,
  onChange,
  placeholder,
  rows,
  submitDisabled,
  submitLabel = "Valider",
  isAuthenticated,
  requireAuth,
  className = "",
  inputType = "text",
  showSubmitButton = true,
  entityType,
  descriptionContext,
  formatTranscript,
  useRewriteAsBullets = false,
}) => {
  const [inputMode, setInputMode] = useState<"mic" | "text">("text");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
    hasSupport: hasAudioSupport,
    error: audioError,
  } = useAudioRecorder({ maxDuration: 120 });

  useEffect(() => {
    if (audioError) {
      if (
        audioError.includes("Permission") ||
        audioError.includes("refusée") ||
        audioError.includes("NotAllowed")
      ) {
        setMicError("Micro bloqué. Passez en mode écrit.");
        setInputMode("text");
      } else {
        setMicError(audioError);
      }
    }
  }, [audioError]);

  const handleMicClick = useCallback(async () => {
    if (!isAuthenticated) {
      requireAuth(() => {});
      return;
    }
    setTranscribeError(null);
    if (isRecording) {
      const blob = await stopRecording();
      if (!blob || blob.size < 500) {
        setTranscribeError(
          "Enregistrement trop court ou vide. Parlez plus longtemps puis réessayez.",
        );
        resetRecording();
        return;
      }
      setIsTranscribing(true);
      try {
        const { text } = await prepareFoxAPI.transcribe(blob);
        if (!text || text === "(Audio non transcrit)") {
          setTranscribeError(
            "Transcription impossible. Réessayez ou utilisez le mode écrit.",
          );
          return;
        }
        const isDescriptionField =
          typeof rows === "number" && rows > 1 && entityType;
        if (isDescriptionField && entityType) {
          try {
            const { bullets, description } = await aiAPI.rewriteDescription({
              source_text: text,
              entity_type: entityType,
              title: descriptionContext?.title ?? undefined,
              organization: descriptionContext?.organization ?? undefined,
            });
            const newValue = bullets?.length
              ? bullets
                  .map((b) => (b.startsWith("•") ? b : `• ${b}`))
                  .join("\n")
              : description?.trim() || text;
            onChange(newValue);
          } catch (err) {
            console.warn("[VoiceOrTextInput] rewrite failed:", err);
            const append = value;
            onChange(append ? `${value}\n${text}`.trim() : text);
          }
          setInputMode("text");
        } else {
          if (useRewriteAsBullets) {
            try {
              const { bullets } = await aiAPI.rewriteAsBullets(text);
              const newValue = bullets?.length
                ? bullets
                    .map((b) => (b.startsWith("•") ? b : `• ${b}`))
                    .join("\n")
                : text;
              onChange(newValue);
            } catch (err) {
              console.warn(
                "[VoiceOrTextInput] rewrite as bullets failed:",
                err,
              );
              const raw = formatTranscript ? formatTranscript(text) : text;
              onChange(raw);
            }
          } else {
            const append = typeof rows === "number" && rows > 1 && value;
            const raw = append ? `${value}\n${text}`.trim() : text;
            const newValue = formatTranscript ? formatTranscript(raw) : raw;
            onChange(newValue);
          }
          setInputMode("text");
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && err !== null && "response" in err
            ? (
                err as {
                  response?: { data?: { detail?: string }; status?: number };
                }
              ).response?.data?.detail
            : null;
        setTranscribeError(
          typeof message === "string"
            ? message
            : "Erreur lors de la transcription ou réécriture. Utilisez le mode écrit.",
        );
      } finally {
        setIsTranscribing(false);
        resetRecording();
      }
    } else {
      resetRecording();
      setMicError(null);
      await startRecording();
    }
  }, [
    isRecording,
    stopRecording,
    resetRecording,
    startRecording,
    onChange,
    value,
    rows,
    isAuthenticated,
    requireAuth,
    entityType,
    descriptionContext,
    formatTranscript,
    useRewriteAsBullets,
  ]);

  const showVoice = inputType === "text" && hasAudioSupport;
  const multiline = typeof rows === "number" && rows > 1;

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {transcribeError && (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2 text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2">
          {transcribeError}
          <button
            type="button"
            onClick={() => setTranscribeError(null)}
            className="underline ml-1"
            aria-label="Fermer le message d'erreur"
          >
            Fermer
          </button>
        </div>
      )}

      {showVoice && inputMode === "mic" && !micError && (
        <>
          {isTranscribing ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 size={40} className="animate-spin text-[#FF8C42]" />
              <span className="text-sm font-medium text-theme-text-primary">
                {entityType || useRewriteAsBullets
                  ? "Transcription et réécriture en cours..."
                  : "Transcription en cours..."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleMicClick}
                aria-label={
                  isRecording
                    ? "Arrêter l'enregistrement"
                    : "Démarrer l'enregistrement vocal"
                }
                className="relative flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/50 focus:ring-offset-2 focus:ring-offset-theme-bg-primary rounded-full"
              >
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse scale-150" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex flex-col items-center justify-center shadow-lg">
                      <Square size={28} className="text-white" fill="white" />
                      <span className="text-xs font-bold text-white mt-0.5">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <span className="text-xs text-theme-text-muted mt-2 block">
                      Cliquez pour arrêter
                    </span>
                  </>
                )}
                {!isRecording && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B2B] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-transform">
                      <Mic size={36} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-theme-text-primary mt-2">
                      Parler
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
          {!isTranscribing && (
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className="flex items-center justify-center gap-2 w-full text-sm text-theme-text-muted hover:text-theme-text-primary"
            >
              <Keyboard size={16} aria-hidden="true" /> Préférez écrire ?
            </button>
          )}
        </>
      )}

      {(!showVoice || inputMode === "text" || micError) && (
        <>
          {micError && showVoice && (
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2 text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2">
              {micError}
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className="underline ml-1"
                aria-label="Passer en mode écrit"
              >
                Mode écrit
              </button>
            </div>
          )}
          {multiline ? (
            <textarea
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full bg-theme-bg-secondary border-2 border-theme-border rounded-2xl px-6 py-4 text-theme-text-primary text-lg focus:outline-none focus:border-[#FF8C42] transition placeholder-theme-text-muted resize-none"
            />
          ) : (
            <input
              autoFocus
              type={inputType}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-theme-bg-secondary border-2 border-theme-border rounded-2xl px-6 py-4 text-theme-text-primary text-lg focus:outline-none focus:border-[#FF8C42] transition placeholder-theme-text-muted text-center"
            />
          )}
          {showVoice && !micError && (
            <button
              type="button"
              onClick={() => setInputMode("mic")}
              className="flex items-center justify-center gap-2 w-full text-sm text-theme-text-muted hover:text-theme-text-primary"
            >
              <Mic size={16} aria-hidden="true" /> Utiliser le micro
            </button>
          )}
        </>
      )}

      {showSubmitButton && (
        <button
          type="submit"
          disabled={submitDisabled}
          className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#FF8C42] font-bold text-white shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30 text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
};
