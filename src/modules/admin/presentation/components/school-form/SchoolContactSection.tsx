"use client";

import type React from "react";
import { Input } from "@/shared/presentation/components/ui/input";
import { SchoolFormSectionCard } from "./SchoolFormSectionCard";

interface SchoolContactSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  cityLabel: string;
  addressLabel: string;
  phoneLabel: string;
  emailLabel: string;
  cityPlaceholder: string;
  addressPlaceholder: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
  cityValue: string;
  addressValue: string;
  phoneValue: string;
  emailValue: string;
  onCityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 text-right">
      <label className="text-sm font-medium text-[#64748B]">{label}</label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 text-right placeholder:text-[#94A3B8] focus-visible:ring-[#C7AF6E]/40"
      />
    </div>
  );
}

export function SchoolContactSection({
  icon,
  title,
  cityLabel,
  addressLabel,
  phoneLabel,
  emailLabel,
  cityPlaceholder,
  addressPlaceholder,
  phonePlaceholder,
  emailPlaceholder,
  cityValue,
  addressValue,
  phoneValue,
  emailValue,
  onCityChange,
  onAddressChange,
  onPhoneChange,
  onEmailChange,
}: SchoolContactSectionProps) {
  return (
    <SchoolFormSectionCard icon={icon} title={title}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={cityLabel}
          value={cityValue}
          placeholder={cityPlaceholder}
          onChange={onCityChange}
        />
        <Field
          label={addressLabel}
          value={addressValue}
          placeholder={addressPlaceholder}
          onChange={onAddressChange}
        />
        <Field
          label={phoneLabel}
          value={phoneValue}
          placeholder={phonePlaceholder}
          onChange={onPhoneChange}
        />
        <Field
          label={emailLabel}
          value={emailValue}
          placeholder={emailPlaceholder}
          onChange={onEmailChange}
        />
      </div>
    </SchoolFormSectionCard>
  );
}
