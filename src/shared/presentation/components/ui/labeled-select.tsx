"use client";

import * as React from "react";
import { cn } from "@/shared/application/lib/cn";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

export type LabeledSelectOption = {
  value: string;
  label: string;
};

export interface LabeledSelectProps {
  label: string;
  options: LabeledSelectOption[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function LabeledSelect({
  label,
  options,
  value,
  onChange,
  id: idProp,
  className,
  selectClassName,
  labelClassName,
  disabled = false,
}: LabeledSelectProps) {
  const reactId = React.useId();
  const id = idProp ?? `labeled-select-${reactId}`;

  return (
    <SearchableSelect
      id={id}
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn("gap-2 text-right", className)}
      labelClassName={cn("text-[#64748B]", labelClassName)}
      triggerClassName={cn(
        "h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-right text-base text-slate-700 shadow-none focus-visible:ring-[#C7AF6E]/20",
        selectClassName,
      )}
    />
  );
}
