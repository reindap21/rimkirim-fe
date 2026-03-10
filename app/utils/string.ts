export const firstCapital = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const wordCapital = (
  text: string,
  separator: string | RegExp = " ",
  join?: string | RegExp,
): string => {
  if (!text || typeof text !== "string") return "";

  return text
    .trim()
    .split(separator)
    .filter(Boolean)
    .map((word) => firstCapital(word))
    .join(
      typeof join === "string"
        ? join
        : typeof separator === "string"
          ? separator
          : " ",
    );
};

/**
 * Convert a space-separated string to camelCase.
 * @example toCamelCase("Letter of Acceptance") // "letterOfAcceptance"
 * @example toCamelCase("custom document") // "customDocument"
 */
export const toCamelCase = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  const words = text.trim().split(/\s+/);
  return words
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (index === 0) {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join("");
};

/**
 * Convert a camelCase string to title case with spaces.
 * @example camelToTitleCase("letterOfAcceptance") // "Letter Of Acceptance"
 * @example camelToTitleCase("customDocument") // "Custom Document"
 */
export const camelToTitleCase = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  // Insert space before capital letters and capitalize each word
  return text
    .trim()
    .split(/(?=[A-Z])/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
