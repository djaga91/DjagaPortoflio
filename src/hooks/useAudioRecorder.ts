/**
 * Hook useAudioRecorder - Enregistrement Audio Natif
 *
 * Utilise l'API MediaRecorder pour capturer l'audio du microphone.
 * Encode en WebM/Opus (32kbps) pour un fichier léger envoyé au backend.
 *
 * Usage:
 * const { isRecording, audioBlob, startRecording, stopRecording, hasSupport } = useAudioRecorder();
 */

import { useState, useCallback, useRef } from "react";

interface UseAudioRecorderReturn {
  /** Indique si l'enregistrement est en cours */
  isRecording: boolean;
  /** Durée de l'enregistrement en secondes */
  recordingDuration: number;
  /** Le Blob audio enregistré (WebM/Opus) */
  audioBlob: Blob | null;
  /** URL temporaire pour prévisualiser l'audio */
  audioUrl: string | null;
  /** Démarre l'enregistrement */
  startRecording: () => Promise<void>;
  /** Arrête l'enregistrement et retourne le Blob */
  stopRecording: () => Promise<Blob | null>;
  /** Réinitialise l'enregistrement */
  resetRecording: () => void;
  /** Indique si le navigateur supporte MediaRecorder */
  hasSupport: boolean;
  /** Message d'erreur en cas de problème */
  error: string | null;
}

interface UseAudioRecorderOptions {
  /** MIME type pour l'enregistrement (par défaut: audio/webm;codecs=opus) */
  mimeType?: string;
  /** Bitrate audio en bps (par défaut: 32000 = 32kbps) */
  audioBitsPerSecond?: number;
  /** Durée max en secondes (par défaut: 120 = 2 min) */
  maxDuration?: number;
  /** Callback quand l'enregistrement est prêt */
  onRecordingComplete?: (blob: Blob) => void;
}

export const useAudioRecorder = (
  options: UseAudioRecorderOptions = {},
): UseAudioRecorderReturn => {
  const {
    mimeType = "audio/webm;codecs=opus",
    audioBitsPerSecond = 32000,
    maxDuration = 120,
    onRecordingComplete,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Références
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  // Vérifier le support MediaRecorder
  const hasSupport =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!window.MediaRecorder;

  // Déterminer le meilleur MIME type supporté
  const getSupportedMimeType = useCallback((): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "audio/webm"; // Fallback
  }, []);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async (): Promise<void> => {
    if (!hasSupport) {
      setError(
        "L'enregistrement audio n'est pas supporté par votre navigateur",
      );
      return;
    }

    // Nettoyer l'enregistrement précédent
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
    chunksRef.current = [];
    setRecordingDuration(0);

    try {
      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // 16kHz suffisant pour la voix
        },
      });
      streamRef.current = stream;

      // Déterminer le MIME type
      const actualMimeType = MediaRecorder.isTypeSupported(mimeType)
        ? mimeType
        : getSupportedMimeType();

      // Créer le MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: actualMimeType,
        audioBitsPerSecond,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Collecter les chunks audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Quand l'enregistrement s'arrête
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Callback optionnel
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }

        // Résoudre la promesse de stopRecording
        if (resolveStopRef.current) {
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }

        // Arrêter le stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = () => {
        setError("Erreur lors de l'enregistrement");
        setIsRecording(false);
      };

      // Démarrer l'enregistrement
      mediaRecorder.start(1000); // Chunk toutes les secondes
      setIsRecording(true);

      // Timer pour la durée
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          // Arrêt automatique si durée max atteinte
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Erreur démarrage enregistrement:", err);

      if (err.name === "NotAllowedError") {
        setError(
          "Permission microphone refusée. Autorisez l'accès dans les paramètres.",
        );
      } else if (err.name === "NotFoundError") {
        setError("Aucun microphone détecté.");
      } else {
        setError(
          `Erreur: ${err.message || "Impossible de démarrer l'enregistrement"}`,
        );
      }
    }
  }, [
    hasSupport,
    mimeType,
    audioBitsPerSecond,
    maxDuration,
    audioUrl,
    getSupportedMimeType,
    onRecordingComplete,
  ]);

  // Arrêter l'enregistrement
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      // Arrêter le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        resolveStopRef.current = resolve;
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve(null);
      }
    });
  }, []);

  // Réinitialiser
  const resetRecording = useCallback(() => {
    // Arrêter si en cours
    if (isRecording) {
      stopRecording();
    }

    // Nettoyer l'URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setError(null);
    chunksRef.current = [];
  }, [isRecording, audioUrl, stopRecording]);

  return {
    isRecording,
    recordingDuration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    hasSupport,
    error,
  };
};

/**
 * Formate la durée en MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default useAudioRecorder;
