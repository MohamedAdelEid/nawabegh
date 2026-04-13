"use client";

import { cn } from "@/shared/application/lib/cn";
import CheckIcon from "@/modules/admin/presentation/assets/icons/checked.svg";
export function AddUserSubscriptionCards<T extends string>({
  options,
  selectedId,
  onChange,
}: {
  options: Array<{ id: T; label: string; description?: string }>;
  selectedId: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map((option) => {
        const selected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-[1rem] border px-5 py-4 text-right transition-colors relative",
              selected
                ? "border-[var(--dashboard-gold)] bg-[#fffdf7]"
                : "border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)]",
            )}
          >
            <div className="font-semibold text-[var(--dashboard-primary)]">{option.label}</div>
            {option.description ? (
              <div className="mt-1 text-xs text-slate-500">{option.description}</div>
            ) : null}

            {selected ? (
              <img src={CheckIcon.src} alt="Checked" width={12} height={12} aria-hidden className="absolute top-[15%] left-[3%]"/>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
