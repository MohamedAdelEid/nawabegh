"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { cn } from "@/shared/application/lib/cn";
import { DashboardSectionHeader } from "@/shared/presentation/components/dashboard";

type CourseDetailsFaqProps = {
  course: CourseDetailsModel;
};

export function CourseDetailsFaq({ course }: CourseDetailsFaqProps) {
  const t = useTranslations("student.dashboard.courseDetails");
  const [openId, setOpenId] = useState<string | null>(course.faqItems[0]?.id ?? null);

  if (course.faqItems.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <DashboardSectionHeader title={t("sections.faq")} />
      <div className="space-y-3">
        {course.faqItems.map((item) => {
          const isOpen = openId === item.id;
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-right transition-colors hover:bg-[#f8fafc]"
              >
                <span className="text-sm font-bold text-[#2b415e]">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-[#64748b] transition-transform",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-[#f1f5f9]"
                  >
                    <p className="p-5 text-sm leading-6 text-[#64748b]">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </motion.section>
  );
}
