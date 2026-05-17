"use client";

import { cn } from "@/shared/application/lib/cn";

interface StatusSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeLabel: string;
  inactiveLabel: string;
  disabled?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function StatusSwitch({
  checked,
  onChange,
  activeLabel,
  inactiveLabel,
  disabled = false,
  activeClassName = "bg-[#243B5A]",
  inactiveClassName = "bg-slate-200",
}: StatusSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? activeLabel : inactiveLabel}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        checked ? activeClassName : inactiveClassName,
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
