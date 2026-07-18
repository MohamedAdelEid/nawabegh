"use client";

import { cn } from "@/shared/application/lib/cn";
import { Search } from "lucide-react";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

export type DashboardFilterOption<T extends string> = {
  id: T;
  label: string;
};

export function DashboardFilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: T;
  options: Array<DashboardFilterOption<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <SearchableSelect
      label={label}
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={options.map((option) => ({
        value: option.id,
        label: option.label,
      }))}
      className="min-w-0 w-full gap-2 text-start sm:min-w-[10rem] sm:w-auto"
      labelClassName="text-xs font-medium text-slate-400"
      triggerClassName="h-14 rounded-2xl border border-slate-100 bg-white px-4 text-start text-base text-slate-700 shadow-sm focus-visible:ring-[#C7AF6E]/20"
    />
  );
}


export function DashboardSearchFilter({
  label,
  placeholder,
  value,
  onChange,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("min-w-0 w-full flex-1 space-y-2 text-start sm:min-w-[14rem] lg:min-w-[18rem]", className)}>
      <span className="block text-xs font-medium text-slate-400">{label}</span>
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-slate-100 bg-white ps-4 pe-12 text-start text-base text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20"
        />
        <Search className="pointer-events-none absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}
