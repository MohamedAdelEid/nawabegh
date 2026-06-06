import type { Country as PhoneCountry } from "react-phone-number-input";

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
