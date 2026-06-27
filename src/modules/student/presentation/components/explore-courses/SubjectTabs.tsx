"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Subject } from "@/shared/domain/types/subject.types";
import { cn } from "@/shared/application/lib/cn";

type SubjectTabsProps = {
  subjects: Subject[];
  activeSubjectId: number | null;
  allLabel: string;
  locale: string;
  onChange: (subjectId: number | null) => void;
};

export function SubjectTabs({
  subjects,
  activeSubjectId,
  allLabel,
  locale,
  onChange,
}: SubjectTabsProps) {
  const isArabic = locale.startsWith("ar");
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: null as number | null, label: allLabel },
    ...subjects.map((subject) => ({
      id: subject.id,
      label: isArabic ? subject.nameAr : subject.nameEn || subject.nameAr,
    })),
  ];

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={allLabel}
      className="flex flex-1 items-center gap-2 overflow-x-auto rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const isActive = activeSubjectId === tab.id;

        return (
          <button
            key={tab.id ?? "all"}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative shrink-0 rounded-md px-5 py-2.5 text-sm font-bold transition-colors",
              isActive ? "text-white" : "text-[#64748b] hover:text-[#2b415e]",
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="subject-tab-indicator"
                className="absolute inset-0 rounded-md bg-[#2c4260] shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
