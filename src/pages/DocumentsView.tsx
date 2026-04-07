import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  ExternalLink,
  Calendar,
  Loader2,
  Sparkles,
  FileDown,
  File,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Mic,
  User,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import {
  coverLettersAPI,
  cvAPI,
  gamificationAPI,
  type CoverLetter,
  type CVInfo,
  type CVDocument,
} from "../services/api";
import { AIBadge } from "../components/AIBadge";

// Seuil minimum de complétion du profil pour générer un CV (40%)
const MIN_COMPLETENESS_FOR_CV = 40;

export const DocumentsView: React.FC = () => {
  const { setActiveToast, setBackgroundTask, setView, setCoverLetterOfferUrl } =
    useGameStore();

  // États pour les lettres de motivation
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(true);
  const [pollingIntervals, setPollingIntervals] = useState<
    Map<string, ReturnType<typeof setInterval>>
  >(new Map());

  // États pour le CV
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
  const [cvDocuments, setCvDocuments] = useState<CVDocument[]>([]);
  const [loadingCV, setLoadingCV] = useState(true);
  const [renamingCVId, setRenamingCVId] = useState<string | null>(null);
  const [newCVName, setNewCVName] = useState<string>("");

  // États pour le warning de complétion profil
  const [completenessScore, setCompletenessScore] = useState<number>(0);
  const [showCompletenessWarning, setShowCompletenessWarning] = useState(false);

  // Charger les lettres, le CV et le score de complétion au montage
  useEffect(() => {
    loadLetters();
    loadCV();
    loadCompleteness();
  }, []);

  // Charger le score de complétion du profil
  const loadCompleteness = async () => {
    try {
      const data = await gamificationAPI.getCompleteness();
      setCompletenessScore(data.score);
    } catch (err) {
      console.error("Erreur chargement complétion:", err);
    }
  };

  // Gérer le clic sur "Générer mon CV" avec vérification de complétion
  const handleGenerateCVClick = () => {
    if (completenessScore < MIN_COMPLETENESS_FOR_CV) {
      setShowCompletenessWarning(true);
    } else {
      setView("cv_template_selection");
    }
  };

  // Badge "Version courte (1 page)" : même logique que PreApplyModal et CoverLettersView
  const SHORT_CONTENT_MAX_LENGTH = 3200;
  const isShortVersion = (letter: CoverLetter): boolean => {
    if (letter.short_version === true) return true;
    const content = letter.content;
    if (
      typeof content === "string" &&
      content.length > 0 &&
      content.length <= SHORT_CONTENT_MAX_LENGTH
    )
      return true;
    return false;
  };

  const loadLetters = async () => {
    try {
      setLoadingLetters(true);
      const response = await coverLettersAPI.list();
      setLetters(response.letters);

      // Démarrer le polling pour les lettres en cours de génération
      response.letters.forEach((letter) => {
        if (letter.status === "pending" || letter.status === "processing") {
          startPolling(letter.id);
        }
      });
    } catch (err: any) {
      console.error("Erreur chargement lettres:", err);
    } finally {
      setLoadingLetters(false);
    }
  };

  const loadCV = async () => {
    try {
      setLoadingCV(true);
      // Charger tous les CV
      const listResponse = await cvAPI.list();
      setCvDocuments(listResponse.cvs);

      // Charger aussi le dernier pour compatibilité
      const latestData = await cvAPI.getLatest();
      setCvInfo(latestData);
    } catch (err: any) {
      console.error("Erreur chargement CV:", err);
      // Ne pas afficher d'erreur si le CV n'existe pas
      setCvInfo({ has_cv: false, cv_url: null, generated_at: null });
      setCvDocuments([]);
    } finally {
      setLoadingCV(false);
    }
  };

  const handleRenameCV = async (cvId: string, currentName: string) => {
    setRenamingCVId(cvId);
    setNewCVName(currentName);
  };

  const saveRenameCV = async (cvId: string) => {
    if (!newCVName.trim()) {
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Le nom ne peut pas être vide",
        icon: "❌",
        duration: 3000,
      });
      return;
    }

    try {
      await cvAPI.rename(cvId, newCVName.trim());
      setActiveToast({
        type: "success",
        title: "CV renommé",
        message: "Le nom du CV a été mis à jour.",
        icon: "✅",
        duration: 3000,
      });
      setRenamingCVId(null);
      setNewCVName("");
      // Recharger la liste
      await loadCV();
    } catch (err: any) {
      console.error("Erreur renommage CV:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: err.response?.data?.detail || "Impossible de renommer le CV.",
        icon: "❌",
        duration: 5000,
      });
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce CV ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      await cvAPI.delete(cvId);
      setActiveToast({
        type: "success",
        title: "CV supprimé",
        message: "Le CV a été supprimé avec succès.",
        icon: "✅",
        duration: 3000,
      });
      // Recharger la liste
      await loadCV();
    } catch (err: any) {
      console.error("Erreur suppression CV:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: err.response?.data?.detail || "Impossible de supprimer le CV.",
        icon: "❌",
        duration: 5000,
      });
    }
  };

  const startPolling = (letterId: string) => {
    const existingInterval = pollingIntervals.get(letterId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const letter = await coverLettersAPI.get(letterId);
        setLetters((prev) => prev.map((l) => (l.id === letterId ? letter : l)));

        if (letter.status === "completed" || letter.status === "failed") {
          clearInterval(interval);
          setPollingIntervals((prev) => {
            const next = new Map(prev);
            next.delete(letterId);
            return next;
          });
          setBackgroundTask({ active: false });

          if (letter.status === "completed") {
            setActiveToast({
              type: "success",
              title: "✅ Lettre générée avec succès !",
              message: "Cliquez pour voir votre lettre de motivation",
              icon: "✉️",
              persistent: true,
            });
          }
        }
      } catch (err) {
        console.error("Erreur polling:", err);
        clearInterval(interval);
        setPollingIntervals((prev) => {
          const next = new Map(prev);
          next.delete(letterId);
          return next;
        });
      }
    }, 3000);

    setPollingIntervals((prev) => new Map(prev).set(letterId, interval));
  };

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    const text = content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*/g, "")
      .trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loadingLetters || loadingCV) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-primary flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white shadow-theme-lg">
              <File size={24} />
            </div>
            Mes Documents
          </h1>
          <p className="text-theme-text-secondary mt-2">
            Gérez vos CVs et lettres de motivation en un seul endroit
          </p>
        </div>
      </div>

      {/* Section CV */}
      <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 flex-shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-theme-text-primary">
                Mes CV
              </h2>
              <p className="text-sm text-theme-text-secondary truncate">
                {cvDocuments.length > 0
                  ? `${cvDocuments.length} CV${cvDocuments.length > 1 ? "s" : ""} généré${cvDocuments.length > 1 ? "s" : ""}`
                  : "Aucun CV généré"}
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateCVClick}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-xl transition-all hover:scale-[1.02] flex-shrink-0 text-sm sm:text-base"
          >
            <Sparkles size={20} />
            {cvInfo?.has_cv ? "Générer un nouveau CV" : "Générer mon CV"}
          </button>
        </div>

        {cvDocuments.length > 0 ? (
          <div className="mt-4 space-y-3">
            {cvDocuments.map((cv) => (
              <div
                key={cv.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (renamingCVId === cv.id) return;
                  localStorage.setItem("editing_cv_id", cv.id);
                  localStorage.setItem("editing_cv_name", cv.name);
                  localStorage.setItem(
                    "editing_cv_template",
                    cv.template || "modern",
                  );
                  setView("cv_generate");
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  if (renamingCVId === cv.id) return;
                  e.preventDefault();
                  localStorage.setItem("editing_cv_id", cv.id);
                  localStorage.setItem("editing_cv_name", cv.name);
                  localStorage.setItem(
                    "editing_cv_template",
                    cv.template || "modern",
                  );
                  setView("cv_generate");
                }}
                className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border hover:shadow-theme-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={(e) =>
                      renamingCVId === cv.id && e.stopPropagation()
                    }
                  >
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {renamingCVId === cv.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newCVName}
                            onChange={(e) => setNewCVName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveRenameCV(cv.id);
                              } else if (e.key === "Escape") {
                                setRenamingCVId(null);
                                setNewCVName("");
                              }
                            }}
                            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveRenameCV(cv.id)}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setRenamingCVId(null);
                              setNewCVName("");
                            }}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-theme-text-primary">
                            {cv.name}
                          </p>
                          <p className="text-sm text-theme-text-secondary truncate">
                            {cv.template} • {(cv.format || "pdf").toUpperCase()}{" "}
                            • Généré le{" "}
                            {formatDate(cv.created_at || cv.generated_at)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renamingCVId !== cv.id && (
                      <>
                        <button
                          onClick={() => handleRenameCV(cv.id, cv.name)}
                          className="p-2 bg-theme-bg hover:bg-theme-bg-secondary rounded-lg transition-colors"
                          title="Renommer"
                        >
                          <Edit2
                            size={16}
                            className="text-theme-text-secondary"
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!cv.cv_url) return;

                            // Construire l'URL complète si elle est relative
                            const apiUrl = (
                              import.meta.env.VITE_API_URL ||
                              "http://localhost:8000"
                            ).replace(/\/+$/, "");
                            const cvUrl = cv.cv_url.startsWith("http")
                              ? cv.cv_url
                              : `${apiUrl}${cv.cv_url}`;

                            // Ouvrir dans un nouvel onglet pour télécharger
                            const a = document.createElement("a");
                            a.href = cvUrl;
                            a.download = `${cv.name.replace(/[^a-z0-9]/gi, "_")}.${cv.format || "pdf"}`;
                            a.target = "_blank";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);

                            setActiveToast({
                              type: "success",
                              title: "Téléchargement lancé",
                              message:
                                "Votre CV est en cours de téléchargement.",
                              icon: "✅",
                              duration: 3000,
                            });
                          }}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                          title="Télécharger"
                        >
                          <FileDown size={16} />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCV(cv.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {cvDocuments.length === 0 && (
          <div className="mt-4 p-6 border-2 border-dashed border-theme-border rounded-xl text-center">
            <FileText
              size={48}
              className="mx-auto text-theme-text-muted mb-3"
            />
            <p className="text-theme-text-secondary mb-4">
              Vous n'avez pas encore généré de CV. Créez votre premier CV
              professionnel maintenant !
            </p>
            <button
              onClick={handleGenerateCVClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles size={20} />
              Générer mon premier CV
            </button>
          </div>
        )}
      </div>

      {/* Section Lettres de Motivation */}
      <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 flex-shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-theme-text-primary flex flex-wrap items-center gap-2">
                Mes Lettres de Motivation
                <AIBadge
                  position="inline"
                  size="sm"
                  variant="prominent"
                  featureName="la génération de lettres de motivation"
                />
              </h2>
              <p className="text-sm text-theme-text-secondary">
                {letters.length === 0
                  ? "Aucune lettre générée"
                  : `${letters.length} lettre${letters.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCoverLetterOfferUrl("__OPEN_FORM__");
              setView("cover_letters");
            }}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 hover:shadow-xl transition-all hover:scale-[1.02] flex-shrink-0 text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Nouvelle lettre</span>
          </button>
        </div>

        {letters.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-theme-border rounded-xl text-center">
            <FileText
              size={48}
              className="mx-auto text-theme-text-muted mb-3"
            />
            <p className="text-theme-text-secondary mb-4">
              Vous n'avez pas encore généré de lettre de motivation. Créez-en
              une maintenant !
            </p>
            <button
              onClick={() => {
                setCoverLetterOfferUrl("__OPEN_FORM__");
                setView("cover_letters");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 hover:shadow-xl hover:shadow-orange-200/50 dark:hover:shadow-orange-900/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles size={20} />
              Générer ma première lettre
            </button>
          </div>
        ) : (
          <div className="grid gap-4 mt-4">
            {letters.slice(0, 3).map((letter) => (
              <div
                key={letter.id}
                className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border hover:shadow-theme-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setView("cover_letters")}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <ExternalLink
                        size={16}
                        className="text-indigo-500 dark:text-indigo-400 flex-shrink-0"
                      />
                      <span className="text-sm font-medium text-theme-text-primary truncate max-w-[180px] sm:max-w-none">
                        {extractDomain(letter.offer_url)}
                      </span>
                      {isShortVersion(letter) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 flex-shrink-0">
                          Version courte (1 page)
                        </span>
                      )}
                      {(letter.status === "pending" ||
                        letter.status === "processing") && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1 flex-shrink-0">
                          <Loader2 size={12} className="animate-spin" />
                          En cours...
                        </span>
                      )}
                      {letter.status === "completed" && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full flex-shrink-0">
                          ✓ Complétée
                        </span>
                      )}
                      {letter.status === "failed" && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full flex-shrink-0">
                          ✗ Échec
                        </span>
                      )}
                    </div>
                    {letter.content && letter.status === "completed" && (
                      <p className="text-sm text-theme-text-secondary line-clamp-2">
                        {getPreview(letter.content, 100)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-theme-text-muted">
                      <Calendar size={12} />
                      <span>{formatDate(letter.created_at)}</span>
                    </div>
                  </div>
                  {letter.status === "completed" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const blob = await coverLettersAPI.downloadPDF(
                            letter.id,
                          );
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `lettre-motivation-${letter.id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          setActiveToast({
                            type: "success",
                            title: "Téléchargement réussi",
                            message: "Votre lettre PDF a été téléchargée",
                            icon: "✅",
                            duration: 3000,
                          });
                        } catch (err: any) {
                          console.error("Erreur téléchargement PDF:", err);
                          setActiveToast({
                            type: "error",
                            title: "Erreur",
                            message:
                              err.response?.data?.detail ||
                              "Impossible de télécharger le PDF",
                            icon: "❌",
                            duration: 5000,
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex-shrink-0 text-sm"
                    >
                      <FileDown size={16} />
                      <span className="hidden xs:inline">Télécharger</span>
                      <span className="xs:hidden">PDF</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {letters.length > 3 && (
              <button
                onClick={() => setView("cover_letters")}
                className="w-full p-3 text-center text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-xl hover:bg-theme-bg-secondary transition-colors"
              >
                Voir toutes les lettres ({letters.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Warning Complétion Profil */}
      {showCompletenessWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-card border border-theme-border rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-theme-border">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-orange-500" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary">
                  Profil incomplet
                </h2>
                <p className="text-sm text-theme-text-secondary">
                  Votre profil est complété à{" "}
                  <span className="font-bold text-orange-500">
                    {completenessScore}%
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowCompletenessWarning(false)}
                className="ml-auto p-2 hover:bg-theme-bg-secondary rounded-lg transition-colors"
              >
                <X size={20} className="text-theme-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-theme-text-secondary mb-6">
                Pour générer un CV de qualité, nous avons besoin d'au moins{" "}
                <span className="font-semibold">
                  {MIN_COMPLETENESS_FOR_CV}%
                </span>{" "}
                de complétion. Un profil plus complet = un CV plus percutant !
              </p>

              <div className="space-y-3">
                {/* Option 1 : Compléter manuellement */}
                <button
                  onClick={() => {
                    setShowCompletenessWarning(false);
                    setView("profile");
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <User className="text-indigo-500" size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-theme-text-primary">
                      Compléter mon profil
                    </p>
                    <p className="text-sm text-theme-text-secondary">
                      Remplissez vos expériences, formations et compétences
                    </p>
                  </div>
                </button>

                {/* Option 2 : Parler à Fox */}
                <button
                  onClick={() => {
                    setShowCompletenessWarning(false);
                    setView("fox_interview");
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 border border-orange-200 dark:border-orange-800 rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
                    <Mic className="text-white" size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-theme-text-primary">
                      Parler à Fox 🦊
                    </p>
                    <p className="text-sm text-theme-text-secondary">
                      Racontez votre parcours à l'oral, Fox remplit votre profil
                      !
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    Recommandé
                  </span>
                </button>
              </div>

              {/* Bouton continuer quand même */}
              <button
                onClick={() => {
                  setShowCompletenessWarning(false);
                  setView("cv_template_selection");
                }}
                className="w-full mt-4 py-2 text-sm text-theme-text-muted hover:text-theme-text-secondary transition-colors"
              >
                Continuer quand même avec un profil incomplet →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
