"use client";

import type React from "react";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { SchoolFormSectionCard } from "./SchoolFormSectionCard";

export interface SchoolCountryOption {
  id: string;
  label: string;
}

interface SchoolContactSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  countryFieldLabel: string;
  countryPlaceholder: string;
  countryValue: string;
  countryOptions: SchoolCountryOption[];
  cityLabel: string;
  addressLabel: string;
  phoneLabel: string;
  coordinatorLabel: string;
  cityPlaceholder: string;
  addressPlaceholder: string;
  phonePlaceholder: string;
  coordinatorPlaceholder: string;
  cityValue: string;
  addressValue: string;
  phoneValue: string;
  coordinatorValue: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCoordinatorChange: (value: string) => void;
}

export function SchoolContactSection({
  icon,
  title,
  countryFieldLabel,
  countryPlaceholder,
  countryValue,
  countryOptions,
  cityLabel,
  addressLabel,
  phoneLabel,
  coordinatorLabel,
  cityPlaceholder,
  addressPlaceholder,
  phonePlaceholder,
  coordinatorPlaceholder,
  cityValue,
  addressValue,
  phoneValue,
  coordinatorValue,
  onCountryChange,
  onCityChange,
  onAddressChange,
  onPhoneChange,
  onCoordinatorChange,
}: SchoolContactSectionProps) {
  const countrySelectOptions = [
    { value: "", label: countryPlaceholder },
    ...countryOptions.map((o) => ({ value: o.id, label: o.label })),
  ];

  return (
    <SchoolFormSectionCard icon={icon} title={title}>
      <div className="grid gap-5 md:grid-cols-2">
        <LabeledSelect
          id="school-country-select"
          label={countryFieldLabel}
          options={countrySelectOptions}
          value={countryValue}
          onChange={onCountryChange}
        />
        <LabeledInput
          label={cityLabel}
          value={cityValue}
          placeholder={cityPlaceholder}
          onChange={onCityChange}
        />
        <LabeledInput
          label={addressLabel}
          value={addressValue}
          placeholder={addressPlaceholder}
          onChange={onAddressChange}
        />
        <LabeledInput
          label={phoneLabel}
          value={phoneValue}
          placeholder={phonePlaceholder}
          onChange={onPhoneChange}
        />
        <LabeledInput
          label={coordinatorLabel}
          value={coordinatorValue}
          placeholder={coordinatorPlaceholder}
          onChange={onCoordinatorChange}
        />
      </div>
    </SchoolFormSectionCard>
  );
}
