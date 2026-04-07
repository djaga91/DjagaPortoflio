import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  ExternalLink,
  Calendar,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Eye,
  X,
  FileDown,
  Edit,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { coverLettersAPI, type CoverLetter } from "../services/api";
import { AIBadge } from "../components/AIBadge";

export const CoverLettersView: React.FC = () => {
  const {
    setActiveToast,
    setBackgroundTask,
    coverLetterOfferUrl,
    setCoverLetterOfferUrl,
  } = useGameStore();
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(
    null,
  );
  const [offerUrl, setOfferUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [pollingIntervals, setPollingIntervals] = useState<
    Map<string, ReturnType<typeof setInterval>>
  >(new Map());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Charger les lettres au montage
  useEffect(() => {
    loadLetters();
  }, []);

  // Pré-remplir l'URL de l'offre si elle vient de MesOffresView ou ouvrir directement le formulaire
  useEffect(() => {
    if (coverLetterOfferUrl) {
      if (coverLetterOfferUrl === "__OPEN_FORM__") {
        // Signal pour ouvrir directement le formulaire vide
        setShowGenerateForm(true);
        setOfferUrl("");
      } else {
        // URL pré-remplie depuis MesOffresView
        setOfferUrl(coverLetterOfferUrl);
        setShowGenerateForm(true);
      }
      // Réinitialiser après utilisation
      setCoverLetterOfferUrl(null);
    }
  }, [coverLetterOfferUrl, setCoverLetterOfferUrl]);

  // Badge "Version courte (1 page)" : même logique que PreApplyModal (API + fallback longueur contenu)
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
      setLoading(true);
      const response = await coverLettersAPI.list();
      setLetters(response.letters);
      setError(null);

      // Démarrer le polling pour les lettres en cours de génération
      response.letters.forEach((letter) => {
        if (letter.status === "pending" || letter.status === "processing") {
          startPolling(letter.id);
        }
      });
    } catch (err: any) {
      console.error("Erreur chargement lettres:", err);

      // Extraire le message d'erreur (s'assurer que c'est toujours une string)
      let errorMessage = "Erreur lors du chargement des lettres";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMessage = data;
        } else if (typeof data === "object") {
          // Extraire le message en s'assurant que c'est une string
          const msg = data.message || data.detail || data.error;
          if (typeof msg === "string") {
            errorMessage = msg;
          } else if (msg && typeof msg === "object") {
            errorMessage = JSON.stringify(msg);
          }
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (letterId: string) => {
    // Arrêter le polling existant si présent
    const existingInterval = pollingIntervals.get(letterId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const letter = await coverLettersAPI.get(letterId);

        // Mettre à jour la lettre dans la liste
        setLetters((prev) => prev.map((l) => (l.id === letterId ? letter : l)));

        // Si la génération est terminée (succès ou échec), arrêter le polling
        if (letter.status === "completed" || letter.status === "failed") {
          clearInterval(interval);
          setPollingIntervals((prev) => {
            const next = new Map(prev);
            next.delete(letterId);
            return next;
          });

          // Désactiver l'animation de tâche en arrière-plan
          setBackgroundTask({ active: false });

          // Notification de succès cliquable (comme CV import)
          if (letter.status === "completed") {
            setActiveToast({
              type: "success",
              title: "✅ Lettre générée avec succès !",
              message: "Cliquez pour voir votre lettre de motivation",
              icon: "✉️",
              persistent: true,
              duration: 10000,
              onClick: () => {
                setSelectedLetter(letter);
                setActiveToast(null);
              },
            });
          } else if (letter.status === "failed") {
            setBackgroundTask({ active: false });
            setActiveToast({
              type: "error",
              title: "Erreur de génération",
              message: letter.error_message || "La génération a échoué",
              icon: "❌",
            });
          }
        }
      } catch (err) {
        console.error("Erreur polling:", err);
      }
    }, 2000); // Vérifier toutes les 2 secondes

    setPollingIntervals((prev) => {
      const next = new Map(prev);
      next.set(letterId, interval);
      return next;
    });
  };

  // Nettoyer les intervals au démontage
  useEffect(() => {
    return () => {
      pollingIntervals.forEach((interval) => clearInterval(interval));
      pollingIntervals.clear();
    };
  }, [pollingIntervals]);

  const handleGenerate = async (
    e: React.FormEvent,
    shortVersion: boolean = false,
  ) => {
    e.preventDefault();
    if (!offerUrl.trim()) {
      setError("Veuillez entrer une URL d'offre d'emploi");
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Activer l'animation de tâche en arrière-plan
      setBackgroundTask({
        active: true,
        type: "cover_letter",
        message: shortVersion
          ? "Génération de la version courte..."
          : "Génération de la lettre en cours...",
      });

      const newLetter = await coverLettersAPI.generate({
        offer_url: offerUrl.trim(),
        short_version: shortVersion,
      });
      setLetters([newLetter, ...letters]);
      setShowGenerateForm(false);
      setOfferUrl("");

      // Démarrer le polling pour cette nouvelle lettre (local + global)
      if (newLetter.status === "pending" || newLetter.status === "processing") {
        startPolling(newLetter.id);
        // Déclencher le polling global pour notification sur toutes les pages
        window.dispatchEvent(
          new CustomEvent("startCoverLetterPolling", {
            detail: { letterId: newLetter.id },
          }),
        );
      }

      // Notification de démarrage de génération
      setActiveToast({
        type: "success",
        title: "Génération démarrée ✨",
        message:
          "Vous pouvez continuer à naviguer. Nous vous notifierons quand votre lettre sera prête.",
        icon: "✉️",
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Erreur génération:", err);
      setBackgroundTask({ active: false });

      // Extraire le message d'erreur (s'assurer que c'est toujours une string)
      let errorMessage = "Erreur lors de la génération de la lettre";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMessage = data;
        } else if (typeof data === "object") {
          // Extraire le message en s'assurant que c'est une string
          const msg = data.message || data.detail || data.error;
          if (typeof msg === "string") {
            errorMessage = msg;
          } else if (msg && typeof msg === "object") {
            errorMessage = JSON.stringify(msg);
          }
        }
      }

      setError(errorMessage);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: errorMessage,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setLetterToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!letterToDelete) return;

    try {
      setDeleting(true);
      await coverLettersAPI.delete(letterToDelete);
      setLetters(letters.filter((l) => l.id !== letterToDelete));
      if (selectedLetter?.id === letterToDelete) {
        setSelectedLetter(null);
      }
      setDeleteConfirmOpen(false);
      setLetterToDelete(null);
      setActiveToast({
        type: "success",
        title: "Lettre supprimée",
        message: "La lettre a été supprimée avec succès.",
      });
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de supprimer la lettre",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setLetterToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    // Enlever les markdown headers et formater
    const text = content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*/g, "")
      .trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-text-primary flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <FileText size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span>Mes Lettres de Motivation</span>
            <AIBadge
              position="inline"
              size="sm"
              variant="prominent"
              featureName="la génération de lettres de motivation"
            />
          </h1>
          <p className="text-theme-text-secondary mt-2 text-sm sm:text-base">
            Générez des lettres personnalisées pour chaque offre d'emploi
          </p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex-shrink-0 text-sm sm:text-base"
        >
          <Plus size={18} />
          <span className="whitespace-nowrap">Générer une lettre</span>
        </button>
      </div>

      {/* Formulaire de génération */}
      {showGenerateForm && (
        <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-theme-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-theme-text-primary flex items-center gap-2">
              <Sparkles size={20} className="text-orange-500" />
              Générer une nouvelle lettre
            </h2>
            <button
              onClick={() => {
                setShowGenerateForm(false);
                setOfferUrl("");
                setError(null);
              }}
              className="p-2 hover:bg-theme-bg-secondary rounded-lg transition-colors"
            >
              <X size={20} className="text-theme-text-muted" />
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                URL de l'offre d'emploi
              </label>
              <input
                type="url"
                value={offerUrl}
                onChange={(e) => setOfferUrl(e.target.value)}
                placeholder="https://www.welcometothejungle.com/fr/companies/..."
                className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={generating}
                required
              />
              <p className="text-xs text-theme-text-muted mt-2">
                Collez l'URL complète de l'offre d'emploi que vous souhaitez
                cibler
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle
                  size={18}
                  className="text-red-600 dark:text-red-400"
                />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={generating || !offerUrl.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Générer la lettre
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGenerateForm(false);
                  setOfferUrl("");
                  setError(null);
                }}
                className="px-6 py-3 bg-theme-bg-secondary text-theme-text-secondary rounded-xl font-semibold hover:bg-theme-bg-tertiary transition-colors"
                disabled={generating}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des lettres */}
      {letters.length === 0 ? (
        <div className="bg-theme-card border border-theme-border rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-theme-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={40} className="text-theme-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-theme-text-primary mb-2">
            Aucune lettre générée
          </h3>
          <p className="text-theme-text-secondary mb-6">
            Commencez par générer votre première lettre de motivation
            personnalisée
          </p>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            Générer ma première lettre
          </button>
        </div>
      ) : (
        <div className="bg-theme-card border border-theme-border rounded-2xl shadow-theme-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-theme-bg-secondary border-b border-theme-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
                    Offre d'emploi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
                    Aperçu
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {letters.map((letter) => {
                  const isGenerating =
                    letter.status === "pending" ||
                    letter.status === "processing";
                  const isFailed = letter.status === "failed";

                  return (
                    <tr
                      key={letter.id}
                      className={`hover:bg-theme-bg-secondary transition-colors ${
                        isGenerating
                          ? "opacity-60 cursor-wait"
                          : "cursor-pointer"
                      } ${isFailed ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                      onClick={() => !isGenerating && setSelectedLetter(letter)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ExternalLink
                            size={16}
                            className="text-theme-text-muted flex-shrink-0"
                          />
                          <a
                            href={letter.offer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`text-sm font-semibold hover:text-orange-500 transition-colors truncate max-w-xs ${
                              isGenerating
                                ? "text-theme-text-muted"
                                : "text-theme-text-primary"
                            }`}
                          >
                            {extractDomain(letter.offer_url)}
                          </a>
                          {isShortVersion(letter) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 flex-shrink-0">
                              Version courte (1 page)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span>{formatDate(letter.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isGenerating ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-theme-text-muted">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Génération en cours...</span>
                            </div>
                            <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${letter.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-theme-text-muted">
                              {letter.progress}%
                            </span>
                          </div>
                        ) : isFailed ? (
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle size={14} />
                            <span>
                              Erreur:{" "}
                              {letter.error_message || "Génération échouée"}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-theme-text-secondary line-clamp-2 max-w-md">
                            {getPreview(letter.content || "", 100)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!isGenerating && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLetter(letter);
                              }}
                              className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors text-orange-500"
                              title="Voir la lettre"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(letter.id);
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'affichage de la lettre complète */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-card border border-theme-border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme-border flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h2 className="text-2xl font-bold text-theme-text-primary">
                    Lettre de Motivation
                  </h2>
                  {isShortVersion(selectedLetter) && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                      Version courte (1 page)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-theme-text-secondary flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <ExternalLink size={16} className="flex-shrink-0" />
                    <a
                      href={selectedLetter.offer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-orange-500 transition-colors truncate"
                    >
                      {selectedLetter.offer_url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Calendar size={16} />
                    <span>{formatDate(selectedLetter.created_at)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="p-2 hover:bg-theme-bg-secondary rounded-lg transition-colors flex-shrink-0 ml-4"
              >
                <X size={24} className="text-theme-text-muted" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full min-h-[400px] p-4 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-primary font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Modifiez votre lettre de motivation..."
                />
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-theme-text-primary">
                  {selectedLetter.content}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 p-6 border-t border-theme-border bg-theme-bg-secondary flex-shrink-0 flex-wrap">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await coverLettersAPI.update(
                            selectedLetter.id,
                            editedContent,
                          );
                          setSelectedLetter({
                            ...selectedLetter,
                            content: editedContent,
                          });
                          setIsEditing(false);
                          setActiveToast({
                            type: "success",
                            title: "Sauvegardé !",
                            message: "Votre lettre a été mise à jour",
                          });
                          loadLetters(); // Recharger la liste
                        } catch (err: any) {
                          setActiveToast({
                            type: "error",
                            title: "Erreur",
                            message:
                              err.response?.data?.detail ||
                              "Impossible de sauvegarder",
                          });
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(selectedLetter.content);
                      }}
                      className="px-4 py-2 bg-theme-card border border-theme-border rounded-xl text-theme-text-primary font-semibold hover:bg-theme-bg-tertiary transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditedContent(selectedLetter.content);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border rounded-xl text-theme-text-primary font-semibold hover:bg-theme-bg-tertiary transition-colors"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const blob = await coverLettersAPI.downloadPDF(
                            selectedLetter.id,
                          );
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `lettre_motivation_${selectedLetter.id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          setActiveToast({
                            type: "success",
                            title: "Téléchargement réussi",
                            message: "Votre lettre PDF a été téléchargée",
                          });
                        } catch (err: any) {
                          setActiveToast({
                            type: "error",
                            title: "Erreur",
                            message:
                              err.response?.data?.detail ||
                              "Impossible de télécharger le PDF",
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border rounded-xl text-theme-text-primary font-semibold hover:bg-theme-bg-tertiary transition-colors"
                    >
                      <FileDown size={16} />
                      PDF
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const blob = await coverLettersAPI.downloadWord(
                            selectedLetter.id,
                          );
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `lettre_motivation_${selectedLetter.id}.docx`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          setActiveToast({
                            type: "success",
                            title: "Téléchargement réussi",
                            message: "Votre lettre Word a été téléchargée",
                          });
                        } catch (err: any) {
                          setActiveToast({
                            type: "error",
                            title: "Erreur",
                            message:
                              err.response?.data?.detail ||
                              "Impossible de télécharger le Word",
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border rounded-xl text-theme-text-primary font-semibold hover:bg-theme-bg-tertiary transition-colors"
                    >
                      <FileText size={16} />
                      Word
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedLetter.content);
                        setActiveToast({
                          type: "success",
                          title: "Copié !",
                          message:
                            "La lettre a été copiée dans le presse-papiers",
                        });
                      }}
                      className="px-4 py-2 bg-theme-card border border-theme-border rounded-xl text-theme-text-primary font-semibold hover:bg-theme-bg-tertiary transition-colors"
                    >
                      Copier
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          setGenerating(true);
                          setBackgroundTask({
                            active: true,
                            type: "cover_letter",
                            message: "Génération de la version courte...",
                          });
                          const newLetter = await coverLettersAPI.generate({
                            offer_url: selectedLetter.offer_url,
                            short_version: true,
                          });
                          setLetters([newLetter, ...letters]);
                          setSelectedLetter(null);
                          if (
                            newLetter.status === "pending" ||
                            newLetter.status === "processing"
                          ) {
                            startPolling(newLetter.id);
                          }
                          setActiveToast({
                            type: "success",
                            title: "Génération démarrée ✨",
                            message:
                              "La version courte (1 page) est en cours de génération.",
                            icon: "✉️",
                            duration: 5000,
                          });
                        } catch (err: any) {
                          setBackgroundTask({ active: false });
                          let errorMessage = "Erreur lors de la génération";
                          if (err.response?.data) {
                            const data = err.response.data;
                            errorMessage =
                              typeof data === "object"
                                ? data.message ||
                                  data.detail ||
                                  data.error ||
                                  errorMessage
                                : data;
                          }
                          setActiveToast({
                            type: "error",
                            title: "Erreur",
                            message: errorMessage,
                          });
                        } finally {
                          setGenerating(false);
                        }
                      }}
                      disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {generating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      Générer en 1 page
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  handleDeleteClick(selectedLetter.id);
                }}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-theme-card rounded-2xl shadow-theme-xl max-w-md w-full p-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary">
                  Supprimer cette lettre ?
                </h2>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Cette action est irréversible.</strong> La lettre de
                motivation sera définitivement supprimée et vous ne pourrez plus
                la récupérer.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 py-3 bg-theme-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-text-primary font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
