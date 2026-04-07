/**
 * Normalise un bullet point : supprime les marqueurs (-, •, *),
 * et transforme les participes passés en noms d'action pour un ton professionnel.
 */
export const normalizeBullet = (b: string): string => {
  let t = b
    .replace(/^[-•\s]+/, "")
    .replace(/\*/g, "")
    .trim();
  if (!t) return t;

  const rules: Array<[RegExp, string]> = [
    [/^Développé et implémenté\b/i, "Développement et implémentation"],
    [/^Développé\b/i, "Développement"],
    [/^Optimisé\b/i, "Optimisation"],
    [/^Implémenté\b/i, "Implémentation"],
    [/^Analysé\b/i, "Analyse"],
    [/^Conçu\b/i, "Conception"],
    [/^Géré\b/i, "Gestion"],
    [/^Piloté\b/i, "Pilotage"],
  ];

  for (const [re, noun] of rules) {
    if (re.test(t)) {
      t = t.replace(re, noun);
      break;
    }
  }

  return t;
};
