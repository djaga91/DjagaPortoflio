/**
 * OffersSwipeView - Affichage type Tinder des offres.
 *
 * Une offre à la fois : bouton vert = sauvegarder, bouton rouge = refuser (passer à la suivante).
 * Reste dans la charte graphique du projet (theme-*).
 */

import React, { useState } from "react";
import { Bookmark, X, MapPin, TrendingUp, Target, Clock } from "lucide-react";
import type { JobOffer } from "../services/api";
import { getOfferPreview } from "../utils/offerDescription";
import { Logo } from "./Logo";

export interface OffersSwipeViewProps {
  offers: JobOffer[];
  onSave: (offer: JobOffer) => Promise<void>;
  onReject?: (offer: JobOffer) => void;
  onViewDetails?: (offer: JobOffer) => void;
  /** Texte quand il n'y a plus d'offres */
  emptyMessage?: string;
  /** Afficher le score de match si présent */
  showMatchScore?: boolean;
}

export const OffersSwipeView: React.FC<OffersSwipeViewProps> = ({
  offers,
  onSave,
  onReject,
  onViewDetails,
  emptyMessage = "Plus d'offres à afficher",
  showMatchScore = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Liste stable : uniquement les offres non sauvegardées au montage, pour garder le décompte 1/N, 2/N... (pas de perte à chaque swipe)
  const [offersToShow] = useState(() => offers.filter((o) => !o.is_saved));
  const totalCount = offersToShow.length;
  const currentOffer = offersToShow[currentIndex];
  const hasMore = currentIndex < totalCount;
  const progress =
    totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : "0 / 0";

  const handleSave = async () => {
    if (!currentOffer || saving) return;
    setSaving(true);
    try {
      await onSave(currentOffer);
      setCurrentIndex((i) => Math.min(i + 1, totalCount));
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    if (!currentOffer) return;
    onReject?.(currentOffer);
    setCurrentIndex((i) => Math.min(i + 1, totalCount));
  };

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-theme-card border border-theme-card-border">
        <p className="text-theme-text-secondary text-center">{emptyMessage}</p>
      </div>
    );
  }

  if (totalCount === 0 || !hasMore) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-theme-card border border-theme-card-border">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
          <Bookmark
            size={32}
            className="text-indigo-500 dark:text-indigo-400"
          />
        </div>
        <p className="text-theme-text-primary font-semibold mb-1">
          Vous avez tout vu
        </p>
        <p className="text-theme-text-secondary text-center text-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const isMatch = (currentOffer?.match_score ?? 0) >= 60;

  // Calculer le temps depuis la publication
  const getTimeAgo = () => {
    if (!currentOffer?.created_at) return null;
    try {
      const created = new Date(currentOffer.created_at);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}j`;
      if (diffHours > 0) return `${diffHours}h`;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins > 0 ? `${diffMins}min` : "À l'instant";
    } catch {
      return null;
    }
  };

  const timeAgo = getTimeAgo();
  const locationText =
    currentOffer.location ||
    currentOffer.location_city ||
    currentOffer.location_country;
  const contractType = currentOffer.contract_type || "Non spécifié";
  const remoteType =
    currentOffer.remote_type && currentOffer.remote_type !== "Onsite"
      ? currentOffer.remote_type === "Remote"
        ? "Télétravail"
        : currentOffer.remote_type
      : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-theme-text-muted">{progress}</span>
      </div>

      <div className="bg-theme-card rounded-xl border border-theme-card-border overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-5">
          {/* Header avec titre et temps */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-theme-text-primary flex-1 pr-2 line-clamp-2">
              {currentOffer.title}
            </h3>
            {timeAgo && (
              <div className="flex items-center gap-1 text-xs text-theme-text-muted flex-shrink-0">
                <Clock size={14} />
                <span>{timeAgo}</span>
              </div>
            )}
          </div>

          {/* Localisation dans un badge */}
          {locationText && (
            <div className="mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-theme-text-secondary">
                <MapPin size={14} className="text-red-500 flex-shrink-0" />
                <span>{locationText}</span>
              </div>
            </div>
          )}

          {/* Type de contrat, remote et score de match */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-theme-text-secondary">
              {contractType}
            </span>
            {remoteType && (
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-theme-text-secondary">
                {remoteType}
              </span>
            )}
            {/* Score de match à côté du type de contrat */}
            {showMatchScore && typeof currentOffer.match_score === "number" && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isMatch
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                }`}
              >
                <TrendingUp size={12} />
                {currentOffer.match_score}%
              </div>
            )}
          </div>

          {/* Logo et nom de l'entreprise (agrandis) */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <Logo
                name={currentOffer.company_name || ""}
                type="company"
                size={72}
                showFallback={true}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-theme-text-primary text-lg leading-tight">
                {currentOffer.company_name || "Entreprise non spécifiée"}
              </p>
            </div>
          </div>

          {/* Petit texte (description) */}
          {(currentOffer.description || currentOffer.full_description) && (
            <div className="mb-4 flex-1">
              <p className="text-sm text-theme-text-secondary line-clamp-3 whitespace-pre-line">
                {getOfferPreview(
                  currentOffer.description,
                  currentOffer.full_description,
                  150,
                )}
              </p>
            </div>
          )}

          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(currentOffer)}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
            >
              <Target size={14} />
              Voir détails
            </button>
          )}
        </div>

        {/* Actions type Tinder : Refuser (rouge) | Sauvegarder (vert) */}
        <div className="flex items-center justify-center gap-6 p-6 pt-2 border-t border-theme-border bg-theme-bg-secondary/50">
          <button
            type="button"
            onClick={handleReject}
            disabled={saving}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Passer"
            aria-label="Refuser / Passer"
          >
            <X size={28} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || currentOffer.is_saved}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentOffer.is_saved
                ? "bg-emerald-200 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 cursor-default"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
            title={
              currentOffer.is_saved ? "Déjà sauvegardé" : "Sauvegarder l'offre"
            }
            aria-label="Sauvegarder"
          >
            <Bookmark
              size={28}
              fill={currentOffer.is_saved ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
