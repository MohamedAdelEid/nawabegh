"use client";

import { ChevronDown } from "lucide-react";
import { AddUserField } from "./AddUserField";

export function AddUserSelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <AddUserField label={label} hint={hint}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-14 w-full appearance-none rounded-2xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)] px-4 text-right text-base text-slate-700 outline-none transition focus:border-[var(--dashboard-gold)] focus:ring-2 focus:ring-[var(--dashboard-gold)]/20"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </AddUserField>
  );
}
