"use client";

import type React from "react";
import { Input } from "@/shared/presentation/components/ui/input";
import { cn } from "@/shared/application/lib/cn";

type LoginInputProps = React.ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
};

export function LoginInput({
  label,
  error,
  leading,
  trailing,
  helperText,
  className,
  containerClassName,
  labelClassName,
  ...props
}: LoginInputProps) {
  const hasError = Boolean(error);

  return (
    <label className="flex flex-col gap-2">
      <span className={cn("text-sm font-semibold text-[var(--dashboard-primary)]", labelClassName)}>
        {label}
      </span>
      <div
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-[1.25rem] border bg-white px-4 transition-colors",
          hasError
            ? "border-[var(--dashboard-danger)]"
            : "border-[var(--auth-border)] focus-within:border-[var(--dashboard-primary)]",
          containerClassName,
        )}
      >
        {leading}
        <Input
          className={cn(
            "h-auto border-0 bg-transparent px-0 py-0 text-sm text-slate-700 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm",
            className,
            "border-none focus-visible:ring-0 focus-visible:ring-offset-0",
          )}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <span className="text-xs font-medium text-[var(--dashboard-danger)]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500">{helperText}</span>
      ) : null}
    </label>
  );
}
