import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  FileCheck,
  ExternalLink,
  Download,
  ArrowRight,
} from "lucide-react";
import {
  cvAPI,
  coverLettersAPI,
  type CVInfo,
  type CoverLetter,
} from "../services/api";
import { useGameStore } from "../store/gameStore";

interface PreApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onMarkAsApplied?: () => void; // Nouvelle prop pour marquer comme postulé sans ouvrir le lien
  offerTitle: string;
  offerUrl: string;
}

export const PreApplyModal: React.FC<PreApplyModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onMarkAsApplied,
  offerTitle,
  offerUrl,
}) => {
  const { setView, setCoverLetterOfferUrl } = useGameStore();

  const [latestCV, setLatestCV] = useState<CVInfo | null>(null);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [cvData, lettersData] = await Promise.all([
        cvAPI
          .getLatest()
          .catch(() => ({ has_cv: false, cv_url: null, generated_at: null })),
        coverLettersAPI.list().catch(() => ({ letters: [], total: 0 })),
      ]);

      setLatestCV(cvData);
      setCoverLetters(lettersData.letters || []);
    } catch (err) {
      console.error("Erreur chargement documents:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasCV = latestCV?.has_cv && latestCV?.cv_url;

  // Normaliser les URL pour comparer (sans query, sans hash, sans trailing slash)
  const normalizeOfferUrl = (url: string): string => {
    try {
      const u = url?.trim() || "";
      if (!u) return u;
      const withoutHash = u.split("#")[0];
      const withoutQuery = withoutHash.split("?")[0];
      return withoutQuery.replace(/\/+$/, "");
    } catch {
      return url || "";
    }
  };
  const currentOfferUrlNorm = normalizeOfferUrl(offerUrl);
  // Toutes les lettres déjà générées pour cette offre (plus récentes en premier)
  const lettersForThisOffer = coverLetters
    .filter((l) => normalizeOfferUrl(l.offer_url || "") === currentOfferUrlNorm)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const hasLetterForThisOffer = lettersForThisOffer.length > 0;

  // Afficher le badge "Version courte" si l'API dit short_version=true, ou si le contenu est court (fallback si l'API n'envoie pas le champ)
  const SHORT_CONTENT_MAX_LENGTH = 3200; // même seuil que la migration backend
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-theme-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-theme-card-border shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-theme-text-primary mb-2">
              Les documents à avoir avant de postuler&nbsp;!
            </h2>
            <p className="text-theme-text-secondary">
              Poste : <span className="font-semibold">{offerTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-xl hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-theme-text-secondary">
              Chargement de vos documents...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section CV */}
            <div className="bg-theme-bg-secondary rounded-2xl p-6 border border-theme-border">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-xl ${hasCV ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}
                >
                  <FileText
                    size={24}
                    className={
                      hasCV
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-orange-600 dark:text-orange-400"
                    }
                  />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary">
                  CV
                </h3>
              </div>

              {hasCV ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-theme-card rounded-xl border border-theme-border">
                    <div className="flex items-center gap-3">
                      <FileCheck
                        size={20}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                      <div>
                        <p className="font-semibold text-theme-text-primary">
                          CV généré
                        </p>
                        {latestCV.generated_at && (
                          <p className="text-sm text-theme-text-secondary">
                            Généré le{" "}
                            {new Date(latestCV.generated_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Rediriger vers la page Mes documents
                          setView("documents");
                          onClose();
                        }}
                        className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Voir
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (!latestCV.has_cv) return;

                            // Utiliser l'endpoint backend qui gère le téléchargement depuis R2
                            const blob = await cvAPI.download();

                            // Créer un lien de téléchargement
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `cv_${new Date().getTime()}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch (err: unknown) {
                            console.error("Erreur téléchargement CV:", err);
                            // Fallback : ouvrir dans un nouvel onglet si le téléchargement échoue
                            if (latestCV.cv_url) {
                              window.open(
                                latestCV.cv_url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            }
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download size={16} />
                        PDF
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setView("cv_template_selection");
                      onClose();
                    }}
                    className="w-full text-left p-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Générer un nouveau CV →
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <p className="text-orange-800 dark:text-orange-200 mb-3">
                    Vous n'avez pas encore de CV généré.
                  </p>
                  <button
                    onClick={() => {
                      setView("cv_generator");
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <FileText size={18} />
                    Générer votre premier CV
                  </button>
                </div>
              )}
            </div>

            {/* Section Lettre de motivation : soit la lettre pour cette offre (téléchargement), soit le bouton pour en générer une */}
            <div className="bg-theme-bg-secondary rounded-2xl p-6 border border-theme-border">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-xl ${hasLetterForThisOffer ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}
                >
                  <FileText
                    size={24}
                    className={
                      hasLetterForThisOffer
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-orange-600 dark:text-orange-400"
                    }
                  />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary">
                  Lettre de motivation
                </h3>
              </div>

              {hasLetterForThisOffer ? (
                <div className="space-y-3">
                  {lettersForThisOffer.map((letter) => (
                    <div
                      key={letter.id}
                      className="flex items-center justify-between p-4 bg-theme-card rounded-xl border border-theme-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileCheck
                          size={20}
                          className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-theme-text-primary flex items-center gap-2 flex-wrap">
                            <span>Lettre pour cette offre</span>
                            {isShortVersion(letter) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                                Version courte (1 page)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-theme-text-secondary truncate">
                            {offerTitle}
                          </p>
                          <p className="text-xs text-theme-text-muted">
                            Générée le{" "}
                            {new Date(letter.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={async () => {
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
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error("Erreur téléchargement PDF:", err);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={16} />
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <p className="text-orange-800 dark:text-orange-200 mb-3">
                    Aucune lettre générée pour cette offre.
                  </p>
                  <button
                    onClick={() => {
                      setCoverLetterOfferUrl(offerUrl);
                      setView("cover_letters");
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <FileText size={18} />
                    Générer une lettre pour cette offre
                  </button>
                </div>
              )}
            </div>

            {/* Boutons Postuler */}
            <div className="pt-4 border-t border-theme-border space-y-3">
              <button
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95"
              >
                <ExternalLink size={20} />
                Postuler maintenant
                <ArrowRight size={20} />
              </button>
              {onMarkAsApplied && (
                <button
                  onClick={() => {
                    onMarkAsApplied();
                    onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-xl font-semibold transition-all"
                >
                  <FileCheck size={18} />
                  J'ai déjà postulé
                </button>
              )}
              <p className="text-sm text-theme-text-secondary text-center mt-3">
                {onMarkAsApplied
                  ? "Ou marquez simplement que vous avez déjà postulé"
                  : "Vous serez redirigé vers la page de candidature"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
