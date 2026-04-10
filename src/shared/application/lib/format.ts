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
