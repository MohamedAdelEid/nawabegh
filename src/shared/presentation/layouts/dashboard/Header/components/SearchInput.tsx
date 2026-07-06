"use client";

import type React from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

interface SearchInputProps {
  placeholder: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 shrink-0 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "h-11 w-full rounded-2xl border border-slate-200 bg-white",
          "ps-11 pe-4 text-sm text-slate-700 shadow-sm outline-none",
          "placeholder:text-slate-400",
          "transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
        )}
      />
    </div>
  );
};
