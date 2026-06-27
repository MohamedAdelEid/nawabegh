"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/presentation/components/ui/popover";
import { cn } from "@/shared/application/lib/cn";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";

export type SearchableSelectOption<TValue extends string | number = number> = {
  value: TValue;
  label: string;
};

type SearchableSelectProps<TValue extends string | number> = {
  label?: string;
  required?: boolean;
  icon?: ReactNode;
  value: TValue | null;
  options: SearchableSelectOption<TValue>[];
  onChange: (value: TValue) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadErrorMessage?: string;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  searchable?: boolean;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  renderTriggerLeading?: (option: SearchableSelectOption<TValue>) => ReactNode;
  renderOptionLeading?: (option: SearchableSelectOption<TValue>) => ReactNode;
};

export function SearchableSelect<TValue extends string | number>({
  label,
  required = false,
  icon,
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadErrorMessage,
  error,
  disabled = false,
  isLoading = false,
  isError = false,
  searchable = true,
  searchValue: controlledSearch,
  onSearchValueChange,
  renderTriggerLeading,
  renderOptionLeading,
}: SearchableSelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const searchValue = controlledSearch ?? internalSearch;
  const setSearchValue = onSearchValueChange ?? setInternalSearch;

  useEffect(() => {
    if (!open) setSearchValue("");
  }, [open, setSearchValue]);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <Field invalid={Boolean(error)} disabled={disabled} className="gap-3">
      {label ? <FieldLabel required={required} icon={icon} className="flex items-center gap-2">{label}</FieldLabel> : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-expanded={open}
            className={cn(
              "flex w-full items-center justify-between gap-3 border-[var(--border-input)]",
              "h-[var(--field-input-height)] rounded-[var(--field-input-radius)]",
              "border-[length:var(--field-input-border-width)] bg-[var(--field-input-bg)] px-4",
              "text-base font-medium transition-[border-color,box-shadow,transform] duration-300 ease-[var(--field-input-ease)]",
              "outline-none focus-visible:border-[var(--field-input-border-focus)] focus-visible:shadow-[var(--field-input-ring-focus)]",
              error
                ? "border-[var(--field-input-border-error)]"
                : "border-[var(--border-input)]",
              open && !error && "border-[var(--field-input-border-focus)] shadow-[var(--field-input-ring-focus)]",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-base font-medium text-slate-900">
              {selected ? (
                <>
                  {renderTriggerLeading?.(selected)}
                  <span className="truncate">{selected.label}</span>
                </>
              ) : (
                <span className="text-slate-500">{placeholder}</span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "size-3 shrink-0 text-slate-500 transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-[var(--auth-border)] p-0 shadow-lg"
        >
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-[var(--auth-border)] px-3 py-2">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-transparent text-sm text-slate-700 outline-none"
                aria-label={searchPlaceholder}
              />
              {isLoading ? <Loader2 className="size-4 animate-spin text-slate-400" /> : null}
            </div>
          ) : null}

          <ul role="listbox" className="max-h-56 overflow-y-auto py-1" aria-label={label}>
            {options.length === 0 && !isLoading ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">{emptyMessage}</li>
            ) : null}

            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={String(option.value)} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearchValue("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50",
                      isSelected && "bg-[#eef2f8] font-semibold text-[var(--dashboard-primary)]",
                    )}
                  >
                    {renderOptionLeading?.(option)}
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {isError && loadErrorMessage ? (
            <p className="border-t border-[var(--auth-border)] px-4 py-2 text-xs text-[var(--dashboard-danger)]">
              {loadErrorMessage}
            </p>
          ) : null}
        </PopoverContent>
      </Popover>

      <FieldError message={error} />
    </Field>
  );
}
