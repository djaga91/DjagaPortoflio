/**
 * Composant FormattedText - Affiche du texte avec formatage Markdown basique
 *
 * Supporte :
 * - **texte** → gras
 * - *texte* → italique
 * - `code` → code inline
 * - Retours à la ligne (\n)
 */

import React from "react";

interface FormattedTextProps {
  /** Le texte à formater (peut contenir **gras**, *italique*, `code`) */
  children: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Élément HTML à utiliser comme wrapper (par défaut: span) */
  as?: "span" | "p" | "div";
}

/**
 * Parse le texte et retourne des éléments React avec le formatage approprié
 */
function parseFormattedText(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  // Regex pour matcher **gras**, *italique*, et `code`
  // L'ordre est important : on check d'abord ** avant *
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;

  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Ajouter le texte avant le match
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      result.push(...parseNewlines(beforeText, keyIndex));
      keyIndex += beforeText.split("\n").length;
    }

    // Traiter le match selon le type
    if (match[1]) {
      // **gras**
      result.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italique*
      result.push(
        <em key={`italic-${keyIndex++}`} className="italic">
          {match[4]}
        </em>,
      );
    } else if (match[5]) {
      // `code`
      result.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-theme-text-primary rounded text-sm font-mono"
        >
          {match[6]}
        </code>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Ajouter le reste du texte après le dernier match
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    result.push(...parseNewlines(remainingText, keyIndex));
  }

  return result;
}

/**
 * Parse les retours à la ligne et les convertit en <br />
 */
function parseNewlines(text: string, startKey: number): React.ReactNode[] {
  const parts = text.split("\n");
  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (index > 0) {
      result.push(<br key={`br-${startKey}-${index}`} />);
    }
    if (part) {
      result.push(part);
    }
  });

  return result;
}

/**
 * Composant qui affiche du texte avec formatage Markdown basique
 *
 * @example
 * <FormattedText>Voici du **texte en gras** et du *texte en italique*</FormattedText>
 *
 * @example
 * <FormattedText as="p" className="text-lg">
 *   Ce texte contient du `code inline` et des **mots importants**.
 * </FormattedText>
 */
const FormattedText: React.FC<FormattedTextProps> = ({
  children,
  className = "",
  as: Component = "span",
}) => {
  if (!children || typeof children !== "string") {
    return null;
  }

  const formattedContent = parseFormattedText(children);

  return <Component className={className}>{formattedContent}</Component>;
};

export default FormattedText;
