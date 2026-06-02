import type { Country } from "@/shared/domain/types/country.types";

/** Prefer Egypt when present; otherwise first country. */
export function pickDefaultCountryId(countries: Country[]): number | null {
  if (countries.length === 0) return null;

  const egypt = countries.find((country) => {
    const normalized = country.name.trim().toLowerCase();
    return (
      country.id === 1 ||
      normalized.includes("egypt") ||
      normalized.includes("مصر")
    );
  });

  return egypt?.id ?? countries[0]?.id ?? null;
}
