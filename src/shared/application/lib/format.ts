export function formatDate(date: string | Date, locale = "ar-EG"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(date));
}

export function formatNumber(n: number, locale = "ar-EG"): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatCurrency(amount: number, currency = "EGP", locale = "ar-EG"): string {
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
