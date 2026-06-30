"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { SchoolAnnouncementComposer } from "@/modules/school/presentation/components/dashboard/SchoolAnnouncementComposer";

export function SchoolAnnouncementCreatePage() {
  const t = useTranslations("school.dashboard");
  const router = useRouter();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <Link
          href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST}
          className="flex items-center gap-2 text-sm font-semibold text-[#2C4260]"
        >
          <ArrowRight className="h-4 w-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">{t("listPage.createNew")}</h1>
      </header>
      <SchoolAnnouncementComposer
        onCreated={() => router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST)}
      />
    </div>
  );
}
