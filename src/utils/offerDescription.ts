/**
 * Utilitaires pour l'affichage des descriptions d'offres.
 * - Préserver / créer des paragraphes pour la lecture
 * - Aperçu court pour les cartes
 */

const PREVIEW_MAX_LENGTH = 220;

/**
 * Formate la description complète pour l'affichage détaillé :
 * préserve les retours à la ligne et ajoute des sauts de paragraphe
 * avant les nouvelles phrases (point + espace + majuscule) si le texte n'en a pas.
 */
export function formatOfferDescriptionFull(
  text: string | null | undefined,
): string {
  if (!text || !String(text).trim()) return "";
  const s = String(text).trim();
  // Si pas de retours à la ligne, en ajouter avant les nouvelles phrases pour aérer
  if (!s.includes("\n")) {
    return s.replace(/\.\s+([A-Z])/g, ".\n\n$1");
  }
  // Normaliser les retours à la ligne multiples en double
  return s.replace(/\n{3,}/g, "\n\n");
}

/**
 * Retourne un aperçu court pour les cartes (liste, swipe).
 * Préfère le début du texte (description ou full_description) limité à maxLen caractères.
 */
export function getOfferPreview(
  description?: string | null,
  fullDescription?: string | null,
  maxLen: number = PREVIEW_MAX_LENGTH,
): string {
  const src = (description || fullDescription || "").trim();
  if (!src) return "";
  if (src.length <= maxLen) return src;
  return src.slice(0, maxLen).trim() + "…";
}
