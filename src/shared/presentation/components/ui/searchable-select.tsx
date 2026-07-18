"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
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
  id?: string;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .toLocaleLowerCase()
    .trim();
}

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
  id: idProp,
  className,
  labelClassName,
  triggerClassName,
  contentClassName,
}: SearchableSelectProps<TValue>) {
  const t = useTranslations("common.select");
  const generatedId = useId();
  const id = idProp ?? `searchable-select-${generatedId}`;
  const listboxId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isSearchControlled = controlledSearch !== undefined;
  const searchValue = controlledSearch ?? internalSearch;
  const setSearchValue = onSearchValueChange ?? setInternalSearch;

  useEffect(() => {
    if (!open) setSearchValue("");
  }, [open, setSearchValue]);

  const visibleOptions = useMemo(() => {
    if (isSearchControlled) return options;

    const query = normalizeSearchValue(searchValue);
    if (!query) return options;

    return options.filter((option) =>
      normalizeSearchValue(option.label).includes(query),
    );
  }, [isSearchControlled, options, searchValue]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchValue, visibleOptions.length]);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const selectOption = (option: SearchableSelectOption<TValue>) => {
    onChange(option.value);
    setOpen(false);
    setSearchValue("");
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (visibleOptions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % visibleOptions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + visibleOptions.length) % visibleOptions.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = visibleOptions[activeIndex];
      if (option) selectOption(option);
    }
  };

  return (
    <Field invalid={Boolean(error)} disabled={disabled} className={cn("gap-3", className)}>
      {label ? (
        <FieldLabel
          htmlFor={id}
          required={required}
          icon={icon}
          className={cn("flex items-center gap-2", labelClassName)}
        >
          {label}
        </FieldLabel>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            role="combobox"
            aria-invalid={Boolean(error)}
            aria-expanded={open}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            className={cn(
              "flex w-full items-center justify-between gap-3 border-[var(--border-input)]",
              "h-12 rounded-[var(--field-input-radius)]",
              "border-2 border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-4",
              "text-base font-medium transition-[border-color,box-shadow,transform] duration-300 ease-[var(--field-input-ease)]",
              "outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)]",
              error
                ? "border-[var(--field-input-border-error)]"
                : "border-[var(--border-input)]",
              open && !error && "border-[var(--field-input-border-focus)] shadow-[var(--field-input-ring-focus)]",
              disabled && "cursor-not-allowed opacity-60",
              triggerClassName,
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-base font-medium text-slate-900">
              {selected ? (
                <>
                  {renderTriggerLeading?.(selected)}
                  <span className="truncate">{selected.label}</span>
                </>
              ) : (
                <span className="text-slate-500">{placeholder ?? t("placeholder")}</span>
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
          className={cn(
            "w-[var(--radix-popover-trigger-width)] rounded-xl border border-[var(--auth-border)] p-0 shadow-lg",
            contentClassName,
          )}
        >
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-[var(--auth-border)] px-3 py-2">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder ?? t("searchPlaceholder")}
                className="h-9 w-full bg-transparent text-sm text-slate-700 outline-none"
                aria-label={searchPlaceholder ?? t("searchPlaceholder")}
                aria-controls={listboxId}
                aria-activedescendant={
                  visibleOptions[activeIndex]
                    ? `${listboxId}-option-${activeIndex}`
                    : undefined
                }
                onKeyDown={handleSearchKeyDown}
                autoFocus
              />
              {isLoading ? <Loader2 className="size-4 animate-spin text-slate-400" /> : null}
            </div>
          ) : null}

          <ul
            id={listboxId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
            aria-label={label ?? placeholder ?? t("placeholder")}
          >
            {visibleOptions.length === 0 && !isLoading ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                {emptyMessage ?? t("empty")}
              </li>
            ) : null}

            {visibleOptions.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <li
                  id={`${listboxId}-option-${index}`}
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-slate-50",
                      isSelected && "bg-[#eef2f8] font-semibold text-[var(--dashboard-primary)]",
                      index === activeIndex && !isSelected && "bg-slate-50",
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
