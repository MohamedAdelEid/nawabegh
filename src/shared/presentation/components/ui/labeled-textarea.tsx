"use client";

import * as React from "react";
import { cn } from "@/shared/application/lib/cn";
import { Label } from "@/shared/presentation/components/ui/label";

export interface LabeledTextareaProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rows?: number;
  id?: string;
  className?: string;
  textareaClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  maxLength?: number;
  name?: string;
  autoComplete?: string;
}

export function LabeledTextarea({
  label,
  value,
  placeholder,
  onChange,
  rows = 4,
  id: idProp,
  className,
  textareaClassName,
  labelClassName,
  disabled,
  maxLength,
  name,
  autoComplete,
}: LabeledTextareaProps) {
  const reactId = React.useId();
  const id = idProp ?? `labeled-textarea-${reactId}`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn("text-[#64748B]", labelClassName)}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "flex w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-right text-sm text-slate-700 outline-none placeholder:text-[#94A3B8] focus-visible:ring-2 focus-visible:ring-[#C7AF6E]/40",
          textareaClassName,
        )}
      />
    </div>
  );
}
