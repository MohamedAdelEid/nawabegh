"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import flags from "react-phone-number-input/flags";
import enLabels from "react-phone-number-input/locale/en.json";
import arLabels from "react-phone-number-input/locale/ar.json";
import { cn } from "@/shared/application/lib/cn";
import { useFieldContext } from "@/shared/presentation/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/presentation/components/ui/popover";
import {
  formatCallingCode,
  getAllPhoneCountries,
  type Country,
} from "@/shared/presentation/components/ui/phone-input/phone-input.utils";

type PhoneCountrySelectProps = {
  value: Country;
  onChange: (country: Country) => void;
  locale?: string;
  disabled?: boolean;
  invalid?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
};

function CountryFlag({ country, className }: { country: Country; className?: string }) {
  const FlagComponent = flags[country];
  if (!FlagComponent) return null;

  return (
    <span
      className={cn(
        "inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm [&_svg]:size-full",
        className,
      )}
    >
      <FlagComponent title="" />
    </span>
  );
}

export function PhoneCountrySelect({
  value,
  onChange,
  locale = "ar",
  disabled = false,
  invalid: invalidProp,
  searchPlaceholder = "Search country...",
  emptyMessage = "No countries found",
  className,
}: PhoneCountrySelectProps) {
  const field = useFieldContext();
  const isInvalid = invalidProp ?? field.invalid;
  const isDisabled = disabled ?? field.disabled;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const labels = locale === "ar" ? arLabels : enLabels;
  const countries = useMemo(() => getAllPhoneCountries(), []);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countries;

    return countries.filter((country) => {
      const name = (labels[country as keyof typeof labels] as string | undefined) ?? country;
      const code = formatCallingCode(country);
      return (
        name.toLowerCase().includes(query) ||
        country.toLowerCase().includes(query) ||
        code.includes(query)
      );
    });
  }, [countries, labels, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isDisabled}
          aria-label={searchPlaceholder}
          aria-expanded={open}
          aria-invalid={isInvalid || undefined}
          className={cn(
            "flex shrink-0 items-center justify-center gap-2",
            "h-[var(--field-input-height)] min-w-[6.5rem] rounded-[var(--field-input-radius)] px-3",
            "border-[length:var(--field-input-border-width)] bg-[var(--field-input-bg)]",
            "text-base font-semibold text-[var(--field-input-text)]",
            "transition-[border-color,box-shadow,transform] duration-300 ease-[var(--field-input-ease)]",
            "outline-none focus-visible:border-[var(--field-input-border-focus)] focus-visible:shadow-[var(--field-input-ring-focus)]",
            isInvalid
              ? "border-[var(--field-input-border-error)]"
              : "border-[var(--auth-border)]",
            open &&
              !isInvalid &&
              "border-[var(--field-input-border-focus)] shadow-[var(--field-input-ring-focus)]",
            isDisabled && "cursor-not-allowed opacity-60",
            className,
          )}
        >
          <CountryFlag country={value} />
          <span dir="ltr" className="tabular-nums">
            {formatCallingCode(value)}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-slate-500 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[min(100vw-2rem,20rem)] rounded-xl border border-[var(--auth-border)] p-0 shadow-lg"
      >
        <div className="flex items-center gap-2 border-b border-[var(--auth-border)] px-3 py-2.5">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            aria-label={searchPlaceholder}
          />
        </div>

        <ul
          role="listbox"
          className="max-h-60 overflow-y-auto py-1"
          aria-label={searchPlaceholder}
        >
          {filteredCountries.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-500">{emptyMessage}</li>
          ) : (
            filteredCountries.map((country) => {
              const isSelected = country === value;
              const name =
                (labels[country as keyof typeof labels] as string | undefined) ?? country;

              return (
                <li key={country} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(country);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50",
                      isSelected &&
                        "bg-[#eef2f8] font-semibold text-[var(--dashboard-primary)]",
                    )}
                  >
                    <CountryFlag country={country} />
                    <span className="min-w-0 flex-1 truncate text-end">{name}</span>
                    <span dir="ltr" className="shrink-0 tabular-nums text-slate-500">
                      {formatCallingCode(country)}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
