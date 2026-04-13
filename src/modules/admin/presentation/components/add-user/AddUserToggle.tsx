"use client";

import { cn } from "@/shared/application/lib/cn";

export function AddUserToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
        checked ? "bg-[var(--dashboard-primary)]" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[-0.2rem]" : "-translate-x-7",
        )}
      />
    </button>
  );
}
