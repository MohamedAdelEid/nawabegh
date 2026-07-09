import type { Country as PhoneCountry } from "react-phone-number-input";
import { getCountryCallingCode, parsePhoneNumber } from "react-phone-number-input";

const COUNTRY_ID_TO_PHONE: Record<number, PhoneCountry> = {
  1: "EG",
  2: "SA",
};

export function countryIdToPhoneCountry(countryId?: number): PhoneCountry {
  if (countryId != null && COUNTRY_ID_TO_PHONE[countryId]) {
    return COUNTRY_ID_TO_PHONE[countryId];
  }
  return "EG";
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

export function splitPhoneForApi(value: string): {
  phoneNumber: string;
  phoneCountryCode: number;
} | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumber(trimmed);
  if (!parsed?.country || !parsed.nationalNumber) return null;

  return {
    phoneNumber: parsed.nationalNumber,
    phoneCountryCode: Number(getCountryCallingCode(parsed.country)),
  };
}
