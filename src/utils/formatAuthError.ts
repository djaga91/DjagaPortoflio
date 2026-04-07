/**
 * Transforme le détail d'erreur API (validation Pydantic) en message utilisateur lisible.
 * Utilisé pour l'inscription et la connexion.
 */

type ValidationErrorItem = {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
  ctx?: { pattern?: string };
};

function isValidationErrors(detail: unknown): detail is ValidationErrorItem[] {
  return (
    Array.isArray(detail) && detail.length > 0 && typeof detail[0] === "object"
  );
}

const USERNAME_PATTERN_MESSAGE =
  "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets (-) et underscores (_). Pas d'espaces.";

const FRIENDLY_MESSAGES: Record<string, string> = {
  string_pattern_mismatch: USERNAME_PATTERN_MESSAGE,
  value_error: USERNAME_PATTERN_MESSAGE,
};

function getMessageForField(
  loc: (string | number)[],
  type?: string,
): string | null {
  const field = loc[loc.length - 1];
  if (
    field === "username" &&
    (type === "string_pattern_mismatch" || type === "value_error")
  ) {
    return USERNAME_PATTERN_MESSAGE;
  }
  if (field === "email") {
    return "Adresse email invalide.";
  }
  if (field === "password") {
    return "Le mot de passe ne respecte pas les critères demandés.";
  }
  return FRIENDLY_MESSAGES[type ?? ""] ?? null;
}

/**
 * Parse detail si c'est une chaîne JSON (réponse parfois stringifiée).
 */
function normalizeDetail(detail: unknown): unknown {
  if (typeof detail !== "string") return detail;
  const trimmed = detail.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(detail) as unknown;
    } catch {
      return detail;
    }
  }
  return detail;
}

/**
 * Retourne un message d'erreur lisible à partir de la réponse API (detail).
 */
export function formatAuthErrorDetail(detail: unknown): string {
  if (detail == null) {
    return "Impossible de créer le compte.";
  }
  const normalized = normalizeDetail(detail);
  if (typeof normalized === "string") {
    return normalized;
  }
  if (!isValidationErrors(normalized)) {
    return "Impossible de créer le compte.";
  }
  const first = normalized[0];
  const friendly = getMessageForField(first.loc ?? [], first.type);
  if (friendly) return friendly;
  return first.msg ?? USERNAME_PATTERN_MESSAGE;
}
