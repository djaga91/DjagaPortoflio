/**
 * Utilitaires pour gérer l'ordre personnalisé des items dans le portfolio
 */

/**
 * Applique l'ordre personnalisé à une liste d'items
 * @param items Liste d'items à réordonner
 * @param customOrder Ordre personnalisé (liste d'IDs)
 * @param getId Fonction pour obtenir l'ID d'un item
 * @returns Liste réordonnée selon customOrder, avec les items non listés à la fin
 */
export function applyItemOrder<T>(
  items: T[],
  customOrder: string[] | undefined | null,
  getId: (item: T) => string,
): T[] {
  if (!customOrder || customOrder.length === 0) {
    return items;
  }

  // Créer un map pour un accès rapide aux items par ID
  const itemMap = new Map<string, T>();
  items.forEach((item) => {
    itemMap.set(getId(item), item);
  });

  // Réordonner selon customOrder
  const orderedItems: T[] = [];
  const usedIds = new Set<string>();

  // Ajouter les items dans l'ordre personnalisé
  customOrder.forEach((id) => {
    const item = itemMap.get(id);
    if (item) {
      orderedItems.push(item);
      usedIds.add(id);
    }
  });

  // Ajouter les items non listés dans customOrder à la fin
  items.forEach((item) => {
    const id = getId(item);
    if (!usedIds.has(id)) {
      orderedItems.push(item);
    }
  });

  return orderedItems;
}

/**
 * Obtient l'ordre actuel d'une liste d'items (liste d'IDs)
 */
export function getItemOrder<T>(
  items: T[],
  getId: (item: T) => string,
): string[] {
  return items.map(getId);
}
