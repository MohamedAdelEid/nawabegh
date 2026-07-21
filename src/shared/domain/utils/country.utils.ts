import type { Country } from "@/shared/domain/types/country.types";

function isOmanCountryName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized.includes("oman") ||
    normalized.includes("عُمان") ||
    normalized.includes("عمان")
  );
}

/** Returns Oman when present in the countries list. */
export function findOmanCountry<T extends Country>(countries: T[]): T | null {
  if (countries.length === 0) return null;
  return countries.find((country) => isOmanCountryName(country.name)) ?? null;
}

export function pickOmanCountryId(countries: Country[]): number | null {
  return findOmanCountry(countries)?.id ?? null;
}

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
