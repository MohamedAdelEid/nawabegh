"use client";

import { cn } from "@/shared/application/lib/cn";
import {
  ACCESS_DURATION_MAX_DAYS,
  ACCESS_DURATION_MIN_DAYS,
  ACCESS_DURATION_PRESETS,
} from "@/shared/domain/types/accessDuration.types";
import type { AccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import { LabeledInput } from "./labeled-input";

export type AccessDurationFieldLabels = {
  title: string;
  lifetime: string;
  limited: string;
  daysLabel: string;
  daysPlaceholder: string;
  helpText: string;
  presetDays: (days: number) => string;
};

type AccessDurationFieldProps = {
  value: AccessDurationDays;
  onChange: (value: AccessDurationDays) => void;
  labels: AccessDurationFieldLabels;
  disabled?: boolean;
};

type AccessDurationMode = "lifetime" | "limited";

function modeFromValue(value: AccessDurationDays): AccessDurationMode {
  return value === null ? "lifetime" : "limited";
}

export function AccessDurationField({
  value,
  onChange,
  labels,
  disabled = false,
}: AccessDurationFieldProps) {
  const mode = modeFromValue(value);
  const limitedDays = mode === "limited" ? String(value) : "";

  const setMode = (nextMode: AccessDurationMode) => {
    if (disabled) return;
    if (nextMode === "lifetime") {
      onChange(null);
      return;
    }
    onChange(value ?? 365);
  };

  const setDaysFromInput = (raw: string) => {
    if (disabled) return;
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange(ACCESS_DURATION_MIN_DAYS);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return;
    onChange(Math.trunc(parsed));
  };

  return (
    <div className="space-y-4 text-right">
      <p className="text-sm font-semibold text-slate-600">{labels.title}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["lifetime", "limited"] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => setMode(option)}
            className={cn(
              "rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-colors",
              mode === option
                ? "border-[#C8AC59] bg-[#F8EFD5] text-[#8F6C0B]"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {option === "lifetime" ? labels.lifetime : labels.limited}
          </button>
        ))}
      </div>

      {mode === "limited" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-end gap-2">
            {ACCESS_DURATION_PRESETS.map((days) => (
              <button
                key={days}
                type="button"
                disabled={disabled}
                onClick={() => onChange(days)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  value === days
                    ? "border-[#C8AC59] bg-[#F8EFD5] text-[#8F6C0B]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                {labels.presetDays(days)}
              </button>
            ))}
          </div>

          <LabeledInput
            label={labels.daysLabel}
            value={limitedDays}
            placeholder={labels.daysPlaceholder}
            onChange={setDaysFromInput}
            readOnly={disabled}
          />
          <p className="text-xs text-slate-400">
            {ACCESS_DURATION_MIN_DAYS}–{ACCESS_DURATION_MAX_DAYS}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-slate-400">{labels.helpText}</p>
    </div>
  );
}
