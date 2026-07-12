"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function TeachersDiscoveryEmptyState() {
  const t = useTranslations("student.dashboard.teachersDiscovery.empty");

  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e2e8f0] bg-white px-6 py-16 text-center">
      <h3 className="text-xl font-bold text-[#2b415e]">{t("title")}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#64748b]">{t("description")}</p>
      <Link
        href={ROUTES.USER.STUDENT.COURSES}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2c4260] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#243751]"
      >
        {t("exploreCourses")}
      </Link>
    </div>
  );
}
