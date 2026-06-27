"use client";

import { cn } from "@/shared/application/lib/cn";
import { ChevronDown, Search } from "lucide-react";

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
    <label className="min-w-[10rem] space-y-2 text-right">
      <span className="block text-xs font-medium text-slate-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-white px-4 text-right text-base text-slate-700 shadow-sm outline-none transition focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
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
    <label className={cn("min-w-[18rem] flex-1 space-y-2 text-right", className)}>
      <span className="block text-xs font-medium text-slate-400">{label}</span>
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-slate-100 bg-white pr-4 pl-12 text-right text-base text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20"
        />
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}
