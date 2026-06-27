export function formatDate(date: string | Date, locale = "ar-EG"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(date));
}

export function formatNumber(n: number, locale = "ar-EG"): string {
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Groups smaller values with thousands separators and switches to compact
 * notation (e.g. 12.5K) once the value reaches `compactFrom`.
 */
export function formatCompactNumber(
  n: number,
  locale = "ar-EG",
  compactFrom = 10000,
): string {
  if (Math.abs(n) >= compactFrom) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return formatNumber(n, locale);
}

export function formatCurrency(amount: number, currency = "OMR", locale = "ar-EG"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

export function formatBytes(bytes: number | null | undefined, locale = "ar-EG"): string {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes === 0) return locale.startsWith("ar") ? "0 بايت" : "0 Bytes";
  const k = 1024;
  const sizes = locale.startsWith("ar")
    ? ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"]
    : ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${formatted} ${sizes[i]}`;
}
