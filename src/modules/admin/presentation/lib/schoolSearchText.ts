const ARABIC_INDIC_ZERO_CODE = "٠".charCodeAt(0);
const EXTENDED_ARABIC_INDIC_ZERO_CODE = "۰".charCodeAt(0);

/** Normalize school list search inputs for consistent API matching across devices. */
export function normalizeSchoolSearchText(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[٠-٩۰-۹]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= ARABIC_INDIC_ZERO_CODE && code <= ARABIC_INDIC_ZERO_CODE + 9) {
        return String(code - ARABIC_INDIC_ZERO_CODE);
      }
      if (
        code >= EXTENDED_ARABIC_INDIC_ZERO_CODE &&
        code <= EXTENDED_ARABIC_INDIC_ZERO_CODE + 9
      ) {
        return String(code - EXTENDED_ARABIC_INDIC_ZERO_CODE);
      }
      return char;
    });
}
