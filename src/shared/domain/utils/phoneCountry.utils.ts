import type { Country as PhoneCountry } from "react-phone-number-input";
import { getCountryCallingCode, parsePhoneNumber } from "react-phone-number-input";

/** Best-effort map for known platform country IDs → ISO phone regions. */
const COUNTRY_ID_TO_PHONE: Record<number, PhoneCountry> = {
  1: "EG",
  2: "SA",
  3: "AE",
  4: "KW",
  5: "QA",
  6: "BH",
  7: "OM",
  8: "JO",
};

/** Name / Arabic name hints when IDs differ across environments. */
const COUNTRY_NAME_HINTS: Array<{ match: RegExp; country: PhoneCountry }> = [
  { match: /egypt|مصر/i, country: "EG" },
  { match: /saudi|السعود/i, country: "SA" },
  { match: /emirates|الإمارات|امارات/i, country: "AE" },
  { match: /kuwait|الكويت/i, country: "KW" },
  { match: /qatar|قطر/i, country: "QA" },
  { match: /bahrain|البحرين/i, country: "BH" },
  { match: /oman|عمان/i, country: "OM" },
  { match: /jordan|الأردن|الاردن/i, country: "JO" },
];

export function countryIdToPhoneCountry(
  countryId?: number,
  countryName?: string,
): PhoneCountry {
  if (countryId != null && COUNTRY_ID_TO_PHONE[countryId]) {
    return COUNTRY_ID_TO_PHONE[countryId];
  }

  if (countryName?.trim()) {
    for (const hint of COUNTRY_NAME_HINTS) {
      if (hint.match.test(countryName)) return hint.country;
    }
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
  if (parsed?.country && parsed.nationalNumber) {
    return {
      phoneNumber: String(parsed.nationalNumber).replace(/\D/g, ""),
      phoneCountryCode: Number(getCountryCallingCode(parsed.country)),
    };
  }

  const match = trimmed.match(/^\+(\d{1,4})(\d{4,})$/);
  if (!match?.[1] || !match[2]) return null;

  return {
    phoneNumber: match[2],
    phoneCountryCode: Number(match[1]),
  };
}
