/**
 * Hook pour gérer l'identifiant guest (visiteur non connecté).
 *
 * Génère et stocke un UUID unique dans localStorage pour identifier
 * les visiteurs avant qu'ils ne créent un compte.
 *
 * Utilisé principalement dans l'onboarding pour sauvegarder les données
 * temporairement côté serveur avant inscription.
 */

import { useCallback, useEffect, useState } from "react";

const GUEST_ID_KEY = "portfolia_guest_id";

/**
 * Génère un UUID v4 pour identifier un guest.
 * Utilise l'API native crypto.randomUUID() disponible dans les navigateurs modernes.
 */
export const generateGuestId = (): string => {
  // crypto.randomUUID() est supporté par tous les navigateurs modernes
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les environnements sans crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Récupère ou génère un guest_id depuis localStorage.
 */
export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
};

/**
 * Supprime le guest_id du localStorage (après inscription réussie).
 */
export const clearGuestId = (): void => {
  localStorage.removeItem(GUEST_ID_KEY);
};

/**
 * Hook React pour gérer le guest_id.
 *
 * @returns {Object} - guest_id et fonction de nettoyage
 */
export const useGuestId = () => {
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    const id = getOrCreateGuestId();
    setGuestId(id);
  }, []);

  const clearId = useCallback(() => {
    clearGuestId();
    setGuestId("");
  }, []);

  return {
    guestId,
    clearGuestId: clearId,
  };
};

export default useGuestId;
