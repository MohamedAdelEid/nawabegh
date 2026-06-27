/** Maps an app locale ("ar" | "en") to a BCP-47 tag for Intl formatting. */
export function localeToIntl(locale: string): string {
  return locale.startsWith("ar") ? "ar-EG" : "en-US";
}
