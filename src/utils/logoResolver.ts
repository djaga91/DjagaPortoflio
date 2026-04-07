/**
 * Utilitaire pour résoudre les noms d'entreprises/écoles en domaines pour l'API Hunter Logos.
 *
 * Priorité : .fr puis .com
 * Gère les noms avec domaines déjà présents, les accents, et les tirets.
 */

/**
 * Normalise les caractères accentués (é -> e, è -> e, etc.)
 * et supprime les apostrophes (l'Oréal -> loreal)
 */
function normalizeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques (é -> e, è -> e)
    .replace(/'/g, "") // Supprime les apostrophes (l'Oréal -> loreal)
    .replace(/"/g, "") // Supprime les guillemets doubles
    .toLowerCase();
}

/**
 * Nettoie le nom d'une entreprise/école pour générer des domaines.
 *
 * - Supprime les mots communs (lycée, école, etc.)
 * - Gère les virgules (prend la première partie)
 * - Normalise les accents
 */
export function cleanCompanyName(name: string): string {
  if (!name) return "";

  let cleaned = name.trim();

  // Si le nom contient déjà un domaine (.com, .fr, .org), le retourner tel quel (normalisé)
  if (
    cleaned.includes(".com") ||
    cleaned.includes(".fr") ||
    cleaned.includes(".org")
  ) {
    return normalizeAccents(cleaned);
  }

  // Gérer les virgules (prendre la première partie)
  if (cleaned.includes(",")) {
    cleaned = cleaned.split(",")[0].trim();
  }

  // Normaliser les accents AVANT de nettoyer (gère aussi les apostrophes : l'Oréal → loreal)
  cleaned = normalizeAccents(cleaned);

  // Supprimer les mots communs
  cleaned = cleaned
    .replace(/\b(lycée|lycee|lycé|lyce)\b/gi, "")
    .replace(/\b(collège|college|collégial)\b/gi, "")
    .replace(/\b(prépa|prepa|préparation|preparation)\b/gi, "")
    .replace(/\b(école|ecole|school|university|université|universite)\b/gi, "")
    .replace(/\b(pôle|pole)\b/gi, "")
    .replace(/\b(leonard de vinci|leonard-de-vinci)\b/gi, "")
    .replace(
      /\b(paris|lyon|marseille|toulouse|bordeaux|nantes|strasbourg|lille|nice|rennes)\b/gi,
      "",
    )
    .trim();

  // Normaliser les espaces multiples
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned;
}

/**
 * Génère des variantes de domaines à partir d'un nom d'entreprise/école.
 *
 * Priorité : .fr puis .com
 *
 * Exemples :
 * - "Allianz Technology" → ["allianz.fr", "allianz.com", "allianztechnology.fr", ...]
 * - "ShowroomPrivé.com" → ["showroomprive.com"] (déjà un domaine, pas de variantes)
 * - "louis-le-grand" → ["louis-le-grand.fr", "louislegrand.fr", "louis-le-grand.com", "louislegrand.com"]
 */
export function generateDomainVariants(name: string): string[] {
  const cleaned = cleanCompanyName(name);
  const variants: string[] = [];

  // Si le nom contient déjà un domaine, tester à la fois la version avec accents et sans
  const raw = (name || "").trim().toLowerCase();
  if (raw.includes(".com") || raw.includes(".fr") || raw.includes(".org")) {
    const ascii = normalizeAccents(raw);
    const set = new Set<string>();
    set.add(ascii);
    set.add(raw);
    return Array.from(set).filter(Boolean);
  }

  const words = cleaned.split(/\s+/);
  const firstWord = words[0];

  // Bases : forme courte (premier mot) et forme complète (sans espaces)
  const shortBase = firstWord || "";
  const fullBase = cleaned.replace(/\s+/g, "");

  // 1) short-group.com / .fr (ex: renault-group.com puis renault-group.fr)
  if (shortBase.length > 1) {
    variants.push(`${shortBase}-group.com`);
    variants.push(`${shortBase}-group.fr`);
  }

  // 2) full-group.com / .fr (ex: bnpparibas-group.com puis bnpparibas-group.fr)
  if (fullBase && fullBase !== shortBase) {
    variants.push(`${fullBase}-group.com`);
    variants.push(`${fullBase}-group.fr`);
  }

  // 3) full.fr / .com (ex: bnpparibas.fr)
  if (fullBase.length > 1) {
    variants.push(`${fullBase}.fr`);
    variants.push(`${fullBase}.com`);
  }

  // 4) short.fr / .com (ex: bnp.fr)
  if (shortBase.length > 1) {
    variants.push(`${shortBase}.fr`);
    variants.push(`${shortBase}.com`);
  }

  // Pour les noms avec tirets, essayer d'abord sans tirets (priorité pour "louis-le-grand" → "louislegrand")
  if (cleaned.includes("-")) {
    const noHyphens = cleaned.replace(/-/g, "");
    variants.push(`${noHyphens}.fr`);
    variants.push(`${noHyphens}.com`);
  }

  // Variante avec tirets (remplacer espaces par tirets) - après sans tirets
  const withHyphens = cleaned.replace(/\s+/g, "-");
  variants.push(`${withHyphens}.fr`);
  variants.push(`${withHyphens}.com`);

  // Si plusieurs mots, variante avec tirets entre tous les mots
  if (words.length > 1) {
    const allHyphenated = words.join("-");
    variants.push(`${allHyphenated}.fr`);
    variants.push(`${allHyphenated}.com`);

    // Variante sans tirets ni espaces
    const allNoSpaces = words.join("");
    variants.push(`${allNoSpaces}.fr`);
    variants.push(`${allNoSpaces}.com`);
  }

  // Retourner les variantes uniques en conservant l'ordre d'insertion
  // (ex: renault-group.com, renault-group.fr, renault.fr, renault.com, …)
  const uniqueVariants = Array.from(new Set(variants));
  return uniqueVariants;
}
