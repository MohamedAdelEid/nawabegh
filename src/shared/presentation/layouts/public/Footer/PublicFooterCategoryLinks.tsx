"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const PLACEHOLDER_CATEGORIES: { id: string; name: string }[] = [
  { id: "1", name: "علوم الشرعية" },
  { id: "2", name: "اللغة العربية" },
  { id: "3", name: "السيرة والتاريخ" },
  { id: "4", name: "التزكية والسلوك" },
];

export function PublicFooterCategoryLinks() {
  return (
    <ul className="space-y-1.5 text-sm text-white/80">
      {PLACEHOLDER_CATEGORIES.map((cat) => (
        <li key={cat.id}>
          <Link
            href={ROUTES.PUBLIC.LIBRARY_BY_CATEGORY(cat.id)}
            className="group inline-flex w-full items-center gap-2 text-white/80 transition-colors duration-200 hover:text-white"
          >
            <ChevronLeft className="h-3 w-3 shrink-0" />
            <span className="relative text-sm">
              {cat.name}
              <span className="absolute bottom-0 right-0 h-px w-0 bg-white/70 transition-all duration-300 ease-out group-hover:w-full" />
            </span>
            <span className="flex h-4 w-4 items-center justify-center text-white/70 transition-transform duration-300 ease-out group-hover:-translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
