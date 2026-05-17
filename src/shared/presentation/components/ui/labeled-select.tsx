"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import { Label } from "@/shared/presentation/components/ui/label";

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
    <div className={cn("space-y-2 text-right", className)}>
      <Label htmlFor={id} className={cn("text-[#64748B]", labelClassName)}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 text-right text-base text-slate-700 outline-none transition focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20 disabled:cursor-not-allowed disabled:opacity-60",
            selectClassName,
          )}
        >
          {options.map((option) => (
            <option key={option.value || "empty"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}
