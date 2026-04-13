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
    <div
      className={cn(
        "flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm",
        "transition-colors duration-200 focus-within:border-primary/40 focus:outline-none",
        className,
      )}
    >
      <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none text-right"
        dir="rtl"
        autoComplete="off"
      />
    </div>
  );
};
