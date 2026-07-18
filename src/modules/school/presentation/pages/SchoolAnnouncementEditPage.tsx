"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useSchoolAnnouncementDetail } from "@/modules/school/application/hooks/useSchoolAnnouncementDetail";
import { SchoolAnnouncementDetailSkeleton } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementDetailSkeleton";
import { SchoolAnnouncementComposer } from "@/modules/school/presentation/components/dashboard/SchoolAnnouncementComposer";

export function SchoolAnnouncementEditPage({ announcementId }: { announcementId: string }) {
  const t = useTranslations("school.dashboard");
  const router = useRouter();
  const { data, isLoading, isError } = useSchoolAnnouncementDetail(announcementId);

  if (isLoading) return <SchoolAnnouncementDetailSkeleton />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("detailPage.notFound")}</p>;
  }
  if (!data.actions.canEdit) {
    return <p className="text-sm text-red-600">{t("editPage.notAllowed")}</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <Link
          href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(data.id)}
          className="flex items-center gap-2 text-sm font-semibold text-[#2C4260]"
        >
          <ArrowRight className="h-4 w-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">{t("editPage.title")}</h1>
      </header>
      <SchoolAnnouncementComposer
        announcement={data}
        onSaved={() => router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(data.id))}
      />
    </div>
  );
}
