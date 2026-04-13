"use client";

import { cn } from "@/shared/application/lib/cn";

export function AddUserOptionGrid<T extends string>({
  options,
  selectedIds,
  onToggle,
  columnsClassName = "grid-cols-2 sm:grid-cols-3",
}: {
  options: Array<{ id: T; label: string; description?: string }>;
  selectedIds: T[];
  onToggle: (id: T) => void;
  columnsClassName?: string;
}) {
  return (
    <div className={cn("grid gap-3", columnsClassName)}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={cn(
              "rounded-lg border-2 px-4 py-3 text-right transition-colors text-center",
              selected
                ? "border-[var(--dashboard-primary)] bg-[var(--dashboard-info-soft)] text-[var(--dashboard-primary)]"
                : "border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)] text-slate-600",
            )}
          >
            <div className="font-semibold">{option.label}</div>
            {option.description ? (
              <div className="mt-1 text-xs text-slate-400">{option.description}</div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
