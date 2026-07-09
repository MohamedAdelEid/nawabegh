import { getCountryCallingCode, parsePhoneNumber } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";

export type PhoneApiParts = {
  phoneNumber: string;
  phoneCountryCode: number;
  country: Country;
};

export function splitE164ForApi(value: string): PhoneApiParts | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumber(trimmed);
  if (!parsed?.country || !parsed.nationalNumber) return null;

  return {
    phoneNumber: parsed.nationalNumber,
    phoneCountryCode: Number(getCountryCallingCode(parsed.country)),
    country: parsed.country,
  };
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
