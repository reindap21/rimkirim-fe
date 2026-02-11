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