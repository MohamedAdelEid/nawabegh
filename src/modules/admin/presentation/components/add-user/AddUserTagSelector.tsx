"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

export function AddUserTagSelector<T extends string>({
  options,
  selectedIds,
  onToggle,
  addLabel,
}: {
  options: Array<{ id: T; label: string }>;
  selectedIds: T[];
  onToggle: (id: T) => void;
  addLabel: string;
}) {
  const [isChooserOpen, setIsChooserOpen] = useState(false);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedIds.includes(option.id)),
    [options, selectedIds],
  );

  const availableOptions = useMemo(
    () => options.filter((option) => !selectedIds.includes(option.id)),
    [options, selectedIds],
  );

  return (
    <div className="space-y-3">
      <div className="rounded-[1.75rem] bg-[var(--dashboard-surface-soft)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          {selectedOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className="inline-flex h-10 items-center gap-3 rounded-[0.5rem] bg-[var(--dashboard-primary)] px-3 text-md font-semibold text-white transition-colors hover:bg-[var(--dashboard-primary-pressed)]"
            >
              <X className="h-5 w-5" aria-hidden />
              {option.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsChooserOpen((current) => !current)}
            className="inline-flex h-10 items-center gap-2 rounded-[0.5rem] border-2 border-dashed border-[#D8DDE8] bg-white px-3 text-md font-semibold text-[var(--dashboard-primary)] transition-colors hover:border-[var(--dashboard-gold)]"
          >
            <Plus className="h-5 w-5" aria-hidden />
            {addLabel}
          </button>
        </div>
      </div>

      {isChooserOpen && availableOptions.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-2 rounded-[1.25rem] border border-[var(--dashboard-border-soft)] bg-white p-3">
          {availableOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onToggle(option.id);
                setIsChooserOpen(false);
              }}
              className={cn(
                "rounded-xl border border-[var(--dashboard-border-soft)] px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[var(--dashboard-info-soft)] hover:text-[var(--dashboard-primary)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
