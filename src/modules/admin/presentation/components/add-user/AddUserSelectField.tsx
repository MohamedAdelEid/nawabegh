"use client";

import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { AddUserField } from "./AddUserField";

export function AddUserSelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  disabled = false,
  isLoading = false,
  searchValue,
  onSearchValueChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
  isLoading?: boolean;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
}) {
  return (
    <AddUserField label={label} hint={hint}>
      <SearchableSelect
        value={value}
        disabled={disabled}
        isLoading={isLoading}
        searchValue={searchValue}
        onSearchValueChange={onSearchValueChange}
        onChange={onChange}
        options={options.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
        className="gap-0"
        triggerClassName="h-14 rounded-2xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)] px-4 text-right text-base text-slate-700 shadow-none focus-visible:ring-[var(--dashboard-gold)]/20"
      />
    </AddUserField>
  );
}
