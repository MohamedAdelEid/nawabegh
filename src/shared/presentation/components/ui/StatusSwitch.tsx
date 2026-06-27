"use client";

import { cn } from "@/shared/application/lib/cn";
import { useDirection } from "@/shared/application/hooks/useDirection";

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
  const { isRtl } = useDirection();

  // The thumb anchors at the inline-start edge (right in RTL, left in LTR).
  // `translate-x` is physical, so mirror its sign for LTR to keep the same
  // visual behavior the Arabic layout already has.
  const thumbTranslate = checked
    ? isRtl
      ? "translate-x-[-0.2rem]"
      : "translate-x-[0.2rem]"
    : isRtl
      ? "-translate-x-7"
      : "translate-x-7";

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
          thumbTranslate,
        )}
      />
    </button>
  );
}
