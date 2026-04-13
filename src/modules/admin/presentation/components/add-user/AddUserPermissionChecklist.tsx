"use client";

import { Check } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

export function AddUserPermissionChecklist<T extends string>({
  options,
  selectedIds,
  onToggle,
}: {
  options: Array<{ id: T; label: string; description?: string }>;
  selectedIds: T[];
  onToggle: (id: T) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className="rounded-[1.5rem] bg-[var(--dashboard-surface-soft)] px-5 py-4 text-right transition-colors hover:bg-slate-50"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  selected
                    ? "border-[var(--dashboard-primary)] bg-[var(--dashboard-primary)] text-white"
                    : "border-[var(--dashboard-border-strong)] bg-white text-transparent",
                )}
              >
                <Check className="h-4 w-4" aria-hidden />
              </div>

              <div className="space-y-1">
                <p className="text-lg font-bold text-[var(--dashboard-primary)]">
                  {option.label}
                </p>
                {option.description ? (
                  <p className="text-sm leading-6 text-slate-500">
                    {option.description}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
