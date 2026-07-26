"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { cn } from "@/shared/application/lib/cn";
import { Input } from "@/shared/presentation/components/ui/input";
import { PhoneCountrySelect } from "@/shared/presentation/components/ui/phone-input/phone-country-select";
import {
  buildE164Phone,
  parseE164Phone,
  stripLeadingCallingCode,
  type Country,
} from "@/shared/presentation/components/ui/phone-input/phone-input.utils";

export type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: Country;
  locale?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  placeholder?: string;
  countrySearchPlaceholder?: string;
  countryEmptyMessage?: string;
  className?: string;
};

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "EG",
  locale = "ar",
  disabled = false,
  invalid,
  id: idProp,
  placeholder,
  countrySearchPlaceholder,
  countryEmptyMessage,
  className,
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [nationalDigits, setNationalDigits] = useState("");

  useEffect(() => {
    if (!defaultCountry) return;
    if (!value?.trim()) {
      setCountry(defaultCountry);
      return;
    }
    const parsed = parseE164Phone(value, country);
    setCountry(parsed.country);
    setNationalDigits(parsed.nationalDigits);
  }, [defaultCountry]);

  useEffect(() => {
    if (!value?.trim()) {
      setNationalDigits("");
      return;
    }
    const parsed = parseE164Phone(value, country);
    if (parsed.country !== country) {
      setCountry(parsed.country);
    }
    setNationalDigits(parsed.nationalDigits);
  }, [value]);

  const emitChange = useCallback(
    (nextCountry: Country, nextNational: string) => {
      onChange(buildE164Phone(nextCountry, nextNational));
    },
    [onChange],
  );

  const handleCountryChange = (nextCountry: Country) => {
    const digits = stripLeadingCallingCode(nextCountry, nationalDigits);
    setCountry(nextCountry);
    setNationalDigits(digits);
    emitChange(nextCountry, digits);
  };

  const handleNationalChange = (nextNational: string) => {
    // Digits only — no maxLength. Strip country calling code if pasted into the national field.
    const digits = stripLeadingCallingCode(country, nextNational);
    setNationalDigits(digits);
    emitChange(country, digits);
  };

  return (
    <div
      className={cn(
        "flex w-full items-stretch gap-2.5",
        locale === "ar" ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      <PhoneCountrySelect
        value={country}
        onChange={handleCountryChange}
        locale={locale}
        disabled={disabled}
        invalid={invalid}
        searchPlaceholder={countrySearchPlaceholder}
        emptyMessage={countryEmptyMessage}
        className="min-w-[6.75rem] shrink-0"
      />

      <Input
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        invalid={invalid}
        value={nationalDigits}
        onChange={(event) => handleNationalChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-[9rem] flex-[2]"
        showClear={false}
      />
    </div>
  );
}
