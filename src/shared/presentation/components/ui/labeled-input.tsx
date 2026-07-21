"use client";

import * as React from "react";
import { cn } from "@/shared/application/lib/cn";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";

export interface LabeledInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  /** Optional stable id for label/input association (defaults to `useId()`). */
  id?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  type?: React.ComponentProps<typeof Input>["type"];
}

export function LabeledInput({
  label,
  value,
  placeholder,
  onChange,
  id: idProp,
  className,
  inputClassName,
  labelClassName,
  disabled,
  readOnly,
  maxLength,
  type,
}: LabeledInputProps) {
  const reactId = React.useId();
  const id = idProp ?? `labeled-input-${reactId}`;

  return (
    <div className={cn("space-y-2 text-right", className)}>
      <Label htmlFor={id} className={cn("text-[#64748B]", labelClassName)}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        className={cn(
          "h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 text-right placeholder:text-[#94A3B8] focus-visible:ring-[#C7AF6E]/40",
          (disabled || readOnly) && "cursor-not-allowed opacity-80",
          inputClassName,
        )}
      />
    </div>
  );
}
