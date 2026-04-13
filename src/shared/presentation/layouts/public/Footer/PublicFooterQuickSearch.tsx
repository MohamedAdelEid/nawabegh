"use client";

import React, { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function PublicFooterQuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      const href = trimmed
        ? `${ROUTES.PUBLIC.LIBRARY}?search=${encodeURIComponent(trimmed)}`
        : ROUTES.PUBLIC.LIBRARY;
      router.push(href);
    },
    [query, router]
  );

  return (
    <form onSubmit={onSubmit} className="relative" role="search" aria-label="بحث سريع في المكتبة">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث هنا..."
        className="w-full rounded-[7px] border border-white/10 bg-white/5 px-5 py-4 pr-4 text-sm text-white placeholder:text-white/60 outline-none ring-0 transition-colors duration-200 focus:border-white/30"
        dir="rtl"
        autoComplete="off"
      />
      <button
        type="submit"
        className="absolute inset-y-0 left-3 my-auto flex h-[26.5px] w-[26.5px] items-center justify-center rounded-[7px] bg-primary text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
        aria-label="بحث في المكتبة"
      >
        <Search className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
