"use client";

import { useLocale } from "next-intl";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";
import { countryIdToPhoneCountry } from "@/shared/domain/utils/phoneCountry.utils";
import { AddUserField } from "./AddUserField";

type AddUserPhoneFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  countryId?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function AddUserPhoneField({
  label,
  value,
  onChange,
  countryId,
  disabled,
  placeholder,
}: AddUserPhoneFieldProps) {
  const locale = useLocale();

  return (
    <AddUserField label={label}>
      <PhoneInput
        value={value}
        onChange={onChange}
        defaultCountry={countryIdToPhoneCountry(countryId ? Number(countryId) : undefined)}
        locale={locale}
        disabled={disabled}
        placeholder={placeholder}
        className="[&_input]:h-14 [&_input]:rounded-2xl [&_input]:border-[var(--dashboard-border-soft)] [&_input]:bg-[var(--dashboard-surface-soft)] [&_button]:h-14 [&_button]:rounded-2xl [&_button]:border-[var(--dashboard-border-soft)] [&_button]:bg-[var(--dashboard-surface-soft)]"
      />
    </AddUserField>
  );
}
