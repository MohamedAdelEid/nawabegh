import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  type Country,
} from "react-phone-number-input";

export type { Country };

export function getAllPhoneCountries(): Country[] {
  return getCountries();
}

export function buildE164Phone(country: Country, nationalDigits: string): string {
  const digits = nationalDigits.replace(/\D/g, "");
  if (!digits) return "";
  return `+${getCountryCallingCode(country)}${digits}`;
}

export function parseE164Phone(
  value: string | undefined,
  fallbackCountry: Country,
): { country: Country; nationalDigits: string } {
  if (!value?.trim()) {
    return { country: fallbackCountry, nationalDigits: "" };
  }

  const parsed = parsePhoneNumber(value, { defaultCountry: fallbackCountry });
  if (!parsed) {
    return { country: fallbackCountry, nationalDigits: value.replace(/\D/g, "") };
  }

  return {
    country: parsed.country ?? fallbackCountry,
    nationalDigits: parsed.nationalNumber ?? "",
  };
}

export function formatCallingCode(country: Country): string {
  return `+${getCountryCallingCode(country)}`;
}
