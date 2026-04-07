/**
 * Utilitaire pour gérer les URLs d'images.
 *
 * Convertit les URLs relatives (commençant par /) en URLs absolues
 * en utilisant l'URL de base du backend.
 */

import { API_URL } from "../services/api";

/**
 * Convertit une URL relative en URL absolue en ajoutant l'URL de base du backend.
 *
 * @param url - URL relative (ex: /uploads/profile_pictures/...) ou absolue
 * @returns URL absolue ou null si l'URL est vide/null
 *
 * @example
 * getAbsoluteImageUrl('/uploads/profile_pictures/image.jpg')
 * // => '{API_URL}/uploads/profile_pictures/image.jpg'
 *
 * getAbsoluteImageUrl('https://example.com/image.jpg')
 * // => 'https://example.com/image.jpg' (déjà absolue, non modifiée)
 */
export const getAbsoluteImageUrl = (
  url: string | null | undefined,
): string | null => {
  if (!url) return null;

  // Si l'URL commence déjà par http:// ou https://, c'est déjà absolue
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Si l'URL commence par /uploads, elle doit être servie depuis le backend
  // Construire l'URL absolue avec la base du backend
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

  // Si API_URL est vide (proxy Vite), utiliser l'origine actuelle
  // Le proxy Vite redirige /api vers le backend, mais /uploads doit aussi être accessible
  if (!API_URL || API_URL === "") {
    // En dev avec proxy Vite, les URLs /uploads sont servies depuis la même origine
    // Le proxy devrait rediriger /uploads vers le backend aussi
    return url.startsWith("/") ? url : `/${url}`;
  }

  // Construire l'URL absolue avec API_URL
  return `${API_URL}/${cleanUrl}`;
};
