"use client";

import { cn } from "@/shared/application/lib/cn";

export type DashboardSegmentOption<T extends string> = {
  id: T;
  label: string;
};

export function DashboardSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: DashboardSegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-2xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              selected
                ? "bg-white text-[var(--dashboard-primary)] shadow-sm ring-1 ring-[var(--dashboard-primary)]/25"
                : "text-slate-600 hover:bg-white/70",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
