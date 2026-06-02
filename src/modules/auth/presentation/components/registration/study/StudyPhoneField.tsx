"use client";

import { useId } from "react";
import { Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { countryIdToPhoneCountry } from "@/shared/domain/utils/phoneCountry.utils";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";

type StudyPhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  accountCountryId?: number;
  error?: string;
  disabled?: boolean;
};

export function StudyPhoneField({
  value,
  onChange,
  accountCountryId,
  error,
  disabled = false,
}: StudyPhoneFieldProps) {
  const t = useTranslations("auth.registration");
  const locale = useLocale();
  const id = useId();
  const defaultCountry = countryIdToPhoneCountry(accountCountryId);

  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel
        htmlFor={id}
        required
        icon={<Phone className="size-3.5" aria-hidden />}
      >
        {t("study.fields.phone.label")}
      </FieldLabel>

      <PhoneInput
        id={id}
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry}
        locale={locale}
        disabled={disabled}
        invalid={Boolean(error)}
        placeholder={t("study.fields.phone.placeholder")}
        countrySearchPlaceholder={t("study.fields.phone.countrySearchPlaceholder")}
        countryEmptyMessage={t("study.fields.phone.countryEmpty")}
      />

      <FieldError message={error} />
    </Field>
  );
}
