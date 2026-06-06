"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAdEdit } from "@/modules/admin/application/hooks/useAdEdit";
import { schoolEducationStages } from "@/modules/admin/domain/data/schoolFormOptions";
import { getSchoolFilterOptions } from "@/modules/admin/infrastructure/api/schoolApi";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import { AdEditForm } from "@/modules/admin/presentation/components/ad-management";
import { AdManagementDashboardSkeleton } from "@/modules/admin/presentation/components/ad-management/AdManagementDashboardSkeleton";
import { AdCreateSmartDraftBadge } from "@/modules/admin/presentation/components/ad-management";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type AdminAdEditPageProps = {
  adId: string;
};

export function AdminAdEditPage({ adId }: AdminAdEditPageProps) {
  const t = useTranslations("admin.dashboard.adManagement.edit");
  const locale = useLocale();
  const router = useRouter();
  const { values, patchValues, loadState, isSubmitting, submit } = useAdEdit(adId);
  const [schoolOptions, setSchoolOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [subjectOptions, setSubjectOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    void (async () => {
      const [schoolsResult, subjectsResult] = await Promise.all([
        getSchoolFilterOptions(),
        getSubjectsPage({ pageNumber: 1, pageSize: 240 }),
      ]);
      if (schoolsResult.data?.length) {
        setSchoolOptions(
          schoolsResult.data.map((row) => ({ value: row.id, label: row.name })),
        );
      }
      if (subjectsResult.data?.rows?.length) {
        setSubjectOptions(
          subjectsResult.data.rows.map((row) => ({
            value: String(row.id),
            label: locale === "ar" ? row.nameAr : row.nameEn,
          })),
        );
      }
    })();
  }, [locale]);

  const gradeOptions = useMemo(
    () =>
      schoolEducationStages.map((stage) => ({
        value: stage.id,
        label: stage.id,
      })),
    [],
  );

  if (loadState === "loading") {
    return <AdManagementDashboardSkeleton />;
  }

  if (loadState === "error") {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center text-rose-700">
        {t("states.error")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DashboardPageHeader
          title={t("title")}
          description={t("description")}
          breadcrumbs={[
            { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
            { label: t("breadcrumbs.list"), href: ROUTES.ADMIN.ADS.LIST },
            { label: t("title") },
          ]}
        />
        <AdCreateSmartDraftBadge />
      </div>

      <AdEditForm
        values={values}
        onChange={patchValues}
        schoolOptions={schoolOptions}
        gradeOptions={gradeOptions}
        subjectOptions={subjectOptions}
        isSubmitting={isSubmitting}
        onSubmit={() => void submit()}
        onCancel={() => router.push(ROUTES.ADMIN.ADS.VIEW(adId))}
      />
    </div>
  );
}
