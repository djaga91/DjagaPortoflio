/**
 * Utilitaires de validation avec regex
 *
 * Validations pour les champs de formulaire :
 * - Email
 * - Téléphone (format international/français)
 * - URLs (LinkedIn, GitHub, site web générique)
 */

// ==================== REGEX PATTERNS ====================

/**
 * Email : format standard RFC 5322 simplifié
 * Accepte : user@domain.tld, user.name+tag@domain.co.uk
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Téléphone : format français ou international
 * Accepte :
 * - 06 12 34 56 78 (français, 10 chiffres)
 * - 0612345678 (français compact)
 * - +33 6 12 34 56 78 (français international)
 * - +33612345678 (français international compact)
 * - +1 555 123 4567 (international, 10+ chiffres)
 *
 * Refuse :
 * - Numéros trop courts (< 10 chiffres pour FR, < 8 pour international)
 * - Formats invalides (lettres, symboles autres que +.-() et espaces)
 */
export const PHONE_REGEX_FR = /^0[1-9](\s?[0-9]{2}){4}$/;
export const PHONE_REGEX_INTL =
  /^\+[1-9]\d{0,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{0,4}$/;

/**
 * URL LinkedIn : profil personnel ou entreprise
 * Accepte :
 * - https://linkedin.com/in/username
 * - https://www.linkedin.com/in/user-name
 * - linkedin.com/in/user123
 * - https://linkedin.com/company/company-name
 */
export const LINKEDIN_REGEX =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/i;

/**
 * URL GitHub : profil utilisateur ou organisation
 * Accepte :
 * - https://github.com/username
 * - github.com/user-name
 * - https://www.github.com/org123
 */
export const GITHUB_REGEX =
  /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;

/**
 * URL générique : site web valide
 * Accepte :
 * - https://example.com
 * - http://www.my-site.fr/path
 * - example.com (sans protocole)
 */
export const URL_REGEX =
  /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

// ==================== VALIDATION FUNCTIONS ====================

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Valide un email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return { valid: true }; // Champ vide = valide (optionnel)
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      valid: false,
      message: "Format d'email invalide. Exemple : nom@domaine.fr",
    };
  }

  return { valid: true };
}

/**
 * Valide un numéro de téléphone
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return { valid: true }; // Champ vide = valide (optionnel)
  }

  const trimmedPhone = phone.trim();

  // Vérifier les caractères autorisés (chiffres, +, espaces, tirets, points, parenthèses)
  if (!/^[0-9+\s\-.()\u00A0]+$/.test(trimmedPhone)) {
    return {
      valid: false,
      message: "Le numéro contient des caractères invalides",
    };
  }

  // Extraire uniquement les chiffres pour compter
  const digitsOnly = trimmedPhone.replace(/\D/g, "");

  // Format français (commence par 0, 10 chiffres)
  if (trimmedPhone.startsWith("0") && !trimmedPhone.startsWith("+")) {
    if (digitsOnly.length !== 10) {
      return {
        valid: false,
        message:
          "Un numéro français doit contenir 10 chiffres (ex: 06 12 34 56 78)",
      };
    }
    // Vérifier que ça commence par 01-09
    if (!/^0[1-9]/.test(digitsOnly)) {
      return {
        valid: false,
        message: "Numéro français invalide (doit commencer par 01 à 09)",
      };
    }
    return { valid: true };
  }

  // Format international (commence par +)
  if (trimmedPhone.startsWith("+")) {
    // Au moins 10 chiffres pour un numéro international (incluant indicatif)
    if (digitsOnly.length < 10) {
      return {
        valid: false,
        message:
          "Numéro international trop court (min 10 chiffres avec indicatif)",
      };
    }
    if (digitsOnly.length > 15) {
      return {
        valid: false,
        message: "Numéro international trop long (max 15 chiffres)",
      };
    }
    return { valid: true };
  }

  // Si ça ne commence ni par 0 ni par +, c'est probablement invalide
  return {
    valid: false,
    message: "Le numéro doit commencer par 0 (France) ou + (international)",
  };
}

/**
 * Valide une URL LinkedIn
 */
export function validateLinkedIn(url: string): ValidationResult {
  if (!url || url.trim() === "") {
    return { valid: true }; // Champ vide = valide (optionnel)
  }

  if (!LINKEDIN_REGEX.test(url.trim())) {
    return {
      valid: false,
      message:
        "Format LinkedIn invalide. Exemple : https://linkedin.com/in/votre-profil",
    };
  }

  return { valid: true };
}

/**
 * Valide une URL GitHub
 */
export function validateGitHub(url: string): ValidationResult {
  if (!url || url.trim() === "") {
    return { valid: true }; // Champ vide = valide (optionnel)
  }

  if (!GITHUB_REGEX.test(url.trim())) {
    return {
      valid: false,
      message:
        "Format GitHub invalide. Exemple : https://github.com/votre-username",
    };
  }

  return { valid: true };
}

/**
 * Valide une URL générique (site web)
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim() === "") {
    return { valid: true }; // Champ vide = valide (optionnel)
  }

  if (!URL_REGEX.test(url.trim())) {
    return {
      valid: false,
      message: "Format d'URL invalide. Exemple : https://votre-site.com",
    };
  }

  return { valid: true };
}

/**
 * Obtient le nom complet depuis first_name et last_name
 */
export function getFullName(
  user:
    | {
        first_name?: string | null;
        last_name?: string | null;
        full_name?: string | null;
      }
    | null
    | undefined,
): string {
  if (!user) return "";
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    return user.first_name;
  }
  if (user.last_name) {
    return user.last_name;
  }
  return user.full_name || "";
}

/**
 * Valide un nom complet
 */
export function validateFullName(name: string): ValidationResult {
  if (!name || name.trim() === "") {
    return {
      valid: false,
      message: "Le nom complet est requis",
    };
  }

  if (name.trim().length < 2) {
    return {
      valid: false,
      message: "Le nom doit contenir au moins 2 caractères",
    };
  }

  if (name.trim().length > 100) {
    return {
      valid: false,
      message: "Le nom ne peut pas dépasser 100 caractères",
    };
  }

  return { valid: true };
}

// ==================== FORMATTERS ====================

/**
 * Formate un numéro de téléphone français
 * Input: 0612345678 -> Output: 06 12 34 56 78
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  // Format français (10 chiffres)
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return cleaned.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      "$1 $2 $3 $4 $5",
    );
  }

  // Format international français (+33)
  if (cleaned.length === 11 && cleaned.startsWith("33")) {
    return (
      "+33 " +
      cleaned
        .slice(2)
        .replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")
    );
  }

  // Retourner tel quel si format non reconnu
  return phone;
}

/**
 * Normalise une URL (ajoute https:// si manquant)
 */
export function normalizeURL(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }

  return trimmed;
}
