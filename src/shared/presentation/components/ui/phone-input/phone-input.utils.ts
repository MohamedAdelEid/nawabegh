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

/** Strip a leading calling code if the user pasted it into the national field. */
export function stripLeadingCallingCode(country: Country, nationalDigits: string): string {
  const digits = nationalDigits.replace(/\D/g, "");
  if (!digits) return "";

  const callingCode = String(getCountryCallingCode(country));
  if (digits.startsWith(callingCode) && digits.length > callingCode.length) {
    return digits.slice(callingCode.length);
  }

  // Common paste: "00{code}..."
  const intlPrefix = `00${callingCode}`;
  if (digits.startsWith(intlPrefix) && digits.length > intlPrefix.length) {
    return digits.slice(intlPrefix.length);
  }

  return digits;
}

export function buildE164Phone(country: Country, nationalDigits: string): string {
  const digits = stripLeadingCallingCode(country, nationalDigits);
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
    return {
      country: fallbackCountry,
      nationalDigits: stripLeadingCallingCode(fallbackCountry, value),
    };
  }

  return {
    country: parsed.country ?? fallbackCountry,
    nationalDigits: parsed.nationalNumber ?? "",
  };
}

export function formatCallingCode(country: Country): string {
  return `+${getCountryCallingCode(country)}`;
}
