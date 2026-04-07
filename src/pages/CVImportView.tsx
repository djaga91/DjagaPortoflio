import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { api } from "../services/api";
import { AIBadge } from "../components/AIBadge";

interface CVImportViewProps {
  onImported?: () => void;
}

export const CVImportView: React.FC<CVImportViewProps> = ({ onImported }) => {
  const {
    setView,
    setActiveToast,
    setBackgroundTask,
    user,
    fetchProfile,
    fetchExperiences,
    fetchEducations,
    fetchProjects,
    fetchSkills,
    fetchLanguages,
    fetchCertifications,
  } = useGameStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Messages d'attente rotatifs
  const waitingMessages = [
    "Analyse de votre CV en cours...",
    "Extraction des informations...",
    "Identification des compétences...",
    "Structuration de vos expériences...",
    "Finalisation de l'import...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % waitingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [uploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Veuillez sélectionner un fichier PDF");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Le fichier est trop volumineux (max 10 MB)");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        setError("Veuillez déposer un fichier PDF");
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("Le fichier est trop volumineux (max 10 MB)");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setBackgroundTask({
      active: true,
      type: "cv_import",
      message: "Import du CV en cours...",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Timeout augmenté pour l'upload de CV (peut prendre du temps avec retries Gemini)
      const response = await api.post("/api/cv/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes pour l'upload de CV (parsing IA + retries)
      });

      // Recharger toutes les données du profil
      await Promise.all([
        fetchProfile(),
        fetchExperiences(),
        fetchEducations(),
        fetchProjects(),
        fetchSkills(),
        fetchLanguages(),
        fetchCertifications(),
      ]);

      // Désactiver la tâche en arrière-plan
      setBackgroundTask({ active: false });

      // Afficher notification de succès avec bilan
      setActiveToast({
        type: "cv_import",
        title: "✅ CV importé avec succès !",
        message: `${response.data.stats.total_created} éléments créés, ${response.data.stats.total_updated} mis à jour`,
        icon: "📄",
        persistent: true,
        duration: 10000,
        stats: {
          created: response.data.stats.total_created,
          updated: response.data.stats.total_updated,
          skills: response.data.data.skills?.length || 0,
        },
        onClick: () => {
          setView("profile");
          setActiveToast(null);
        },
      });

      // Callback si fourni
      if (onImported) {
        onImported();
      }

      // Si c'est un nouveau compte qui vient d'importer son CV, modifier le flag pour lancer l'onboarding
      // IMPORTANT : Modifier le flag AVANT la redirection pour que OnboardingTutorial le détecte
      if (user?.id) {
        const pendingOnboarding = localStorage.getItem(
          `pending_onboarding_${user.id}`,
        );
        if (pendingOnboarding === "after_cv_import") {
          // Modifier le flag pour indiquer qu'on peut maintenant lancer l'onboarding
          localStorage.setItem(`pending_onboarding_${user.id}`, "immediate");
          // S'assurer que onboarding_seen n'est pas défini pour forcer le lancement du tutoriel
          // (ou le supprimer s'il existe déjà)
          localStorage.removeItem(`onboarding_seen_${user.id}`);
        }
      }

      // Rediriger vers le dashboard (l'onboarding se lancera automatiquement via OnboardingTutorial)
      // Utiliser un petit délai pour s'assurer que le flag est bien défini avant la redirection
      setTimeout(() => {
        setView("dashboard");
      }, 100);
    } catch (err: any) {
      console.error("Erreur upload CV:", err);

      // Message d'erreur plus informatif
      let errorMessage = "Erreur lors de l'import du CV";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
        // Si c'est une erreur de format JSON, suggérer de réessayer
        if (
          errorMessage.includes("format valide") ||
          errorMessage.includes("JSON")
        ) {
          errorMessage +=
            "\n\n💡 Astuce : Réessayez dans quelques instants. L'IA peut parfois avoir besoin de plusieurs tentatives.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setBackgroundTask({ active: false });
      setUploading(false);
    }
  };

  const handleContinueToDashboard = () => {
    setView("dashboard");
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary p-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour au tableau de bord</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-theme-text-primary">
              Importer mon CV
            </h1>
            <AIBadge
              position="inline"
              size="md"
              variant="prominent"
              featureName="l'import de CV par IA"
            />
          </div>
          <p className="text-theme-text-secondary">
            Uploadez votre CV en PDF et laissez notre IA remplir automatiquement
            votre profil.
          </p>
        </div>

        {/* État de chargement */}
        {uploading ? (
          <div className="bg-theme-card rounded-3xl p-12 border border-theme-card-border">
            <div className="text-center">
              {/* Animation de chargement */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-theme-border" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                <div className="absolute inset-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
                  <Sparkles
                    size={40}
                    className="text-emerald-600 dark:text-emerald-400 animate-pulse"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-theme-text-primary mb-3">
                {waitingMessages[messageIndex]}
              </h3>
              <p className="text-theme-text-secondary mb-2">
                Notre IA analyse votre CV pour en extraire toutes les
                informations.
              </p>
              <p className="text-sm text-theme-text-muted mb-8">
                Cela peut prendre quelques instants...
              </p>

              {/* Barre de progression indéterminée */}
              <div className="w-full max-w-md mx-auto h-2 bg-theme-bg-tertiary rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full animate-shimmer"
                  style={{
                    width: "50%",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </div>

              {/* Message de reassurance */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Vous pouvez continuer à naviguer.</strong>
                  <br />
                  Nous vous notifierons dès que l'import sera terminé.
                </p>
              </div>

              <button
                onClick={handleContinueToDashboard}
                className="inline-flex items-center gap-2 bg-theme-bg-tertiary text-theme-text-primary font-semibold px-6 py-3 rounded-xl hover:bg-theme-card-hover transition-all"
              >
                Aller au tableau de bord
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`bg-theme-card rounded-3xl p-12 border-2 border-dashed transition-all ${
                file
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-theme-border hover:border-emerald-400 dark:hover:border-emerald-500"
              }`}
            >
              <div className="text-center">
                {file ? (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText
                        size={40}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-theme-text-primary mb-2">
                      {file.name}
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Taille : {(file.size / 1024).toFixed(0)} KB
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {uploading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            Import en cours...
                          </span>
                        ) : (
                          "Importer ce CV"
                        )}
                      </button>
                      <button
                        onClick={() => setFile(null)}
                        disabled={uploading}
                        className="bg-theme-bg-tertiary text-theme-text-secondary font-semibold px-8 py-4 rounded-xl hover:bg-theme-card-hover transition-all disabled:opacity-50"
                      >
                        Changer
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Upload
                        size={40}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-theme-text-primary mb-2">
                      Glissez-déposez votre CV ici
                    </h3>
                    <p className="text-theme-text-secondary mb-6">ou</p>
                    <label className="inline-block cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg transition-all inline-block">
                        Parcourir mes fichiers
                      </span>
                    </label>
                    <p className="text-sm text-theme-text-muted mt-6">
                      PDF uniquement · Taille max : 10 MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Info */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                ✨ Ce qui sera extrait automatiquement
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>
                  • Informations personnelles (nom, email, téléphone,
                  localisation)
                </li>
                <li>• Liens sociaux (LinkedIn, GitHub, Portfolio)</li>
                <li>• Expériences professionnelles avec technologies</li>
                <li>• Formations et diplômes</li>
                <li>• Projets personnels</li>
                <li>• Langues parlées</li>
                <li>• Certifications</li>
                <li>• Compétences techniques et soft skills</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Style pour l'animation shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};
