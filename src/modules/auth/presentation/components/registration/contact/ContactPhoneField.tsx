"use client";

import { useId, type ReactNode } from "react";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";
import { countryIdToPhoneCountry } from "@/shared/domain/utils/phoneCountry.utils";

type ContactPhoneFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  accountCountryId?: number;
  locale: string;
  icon?: ReactNode;
  placeholder?: string;
  countrySearchPlaceholder?: string;
  countryEmptyMessage?: string;
};

export function ContactPhoneField({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  accountCountryId,
  locale,
  icon,
  placeholder,
  countrySearchPlaceholder,
  countryEmptyMessage,
}: ContactPhoneFieldProps) {
  const id = useId();
  const defaultCountry = countryIdToPhoneCountry(accountCountryId);

  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel htmlFor={id} required={required} icon={icon}>
        {label}
      </FieldLabel>
      <PhoneInput
        id={id}
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry}
        locale={locale}
        disabled={disabled}
        invalid={Boolean(error)}
        placeholder={placeholder}
        countrySearchPlaceholder={countrySearchPlaceholder}
        countryEmptyMessage={countryEmptyMessage}
      />
      <FieldError message={error} />
    </Field>
  );
}
