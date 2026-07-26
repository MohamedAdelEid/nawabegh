import { getCountryCallingCode, parsePhoneNumber } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";

export type PhoneApiParts = {
  phoneNumber: string;
  phoneCountryCode: number;
  country: Country;
};

/**
 * Split an E.164 (or +code+digits) value into API parts.
 * Country code stays separate from the national number — never merge them for the API.
 * Lenient: does not require libphonenumber "valid" length checks.
 */
export function splitE164ForApi(value: string): PhoneApiParts | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumber(trimmed);
  if (parsed?.country && parsed.nationalNumber) {
    return {
      phoneNumber: String(parsed.nationalNumber).replace(/\D/g, ""),
      phoneCountryCode: Number(getCountryCallingCode(parsed.country)),
      country: parsed.country,
    };
  }

  const match = trimmed.match(/^\+(\d{1,4})(\d{4,})$/);
  if (!match?.[1] || !match[2]) return null;

  return {
    phoneNumber: match[2],
    phoneCountryCode: Number(match[1]),
    country: "EG",
  };
}

/** Soft front-end check: has a national number (no char max / no strict country length). */
export function isPhoneReadyForSubmit(value: string): boolean {
  const parts = splitE164ForApi(value);
  return Boolean(parts && parts.phoneNumber.length >= 4 && parts.phoneCountryCode > 0);
}

export function emptyPhoneApiParts(): PhoneApiParts {
  return { phoneNumber: "", phoneCountryCode: 0, country: "EG" };
}

export function buildE164FromApiParts(
  phoneNumber: string,
  phoneCountryCode: number | null | undefined,
): string {
  const digits = phoneNumber.replace(/\D/g, "");
  if (!digits) return "";
  const code = phoneCountryCode ?? 20;
  return `+${code}${digits}`;
}
