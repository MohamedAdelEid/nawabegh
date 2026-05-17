"use client";

import { cn } from "@/shared/application/lib/cn";

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onCheckedChange,
  ariaLabel,
  disabled,
  className,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-[#C8AC59]" : "bg-slate-200",
        className,
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "-translate-x-0.5" : "-translate-x-5.5",
        )}
      />
    </button>
  );
}
