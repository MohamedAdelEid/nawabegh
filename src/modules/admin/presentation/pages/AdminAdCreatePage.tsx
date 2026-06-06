"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAdCreateWizard } from "@/modules/admin/application/hooks/useAdCreateWizard";
import type { AdCreateWizardStepId } from "@/modules/admin/domain/types/adCreateWizard.types";
import { getSchoolFilterOptions } from "@/modules/admin/infrastructure/api/schoolApi";
import { getGrades } from "@/modules/admin/infrastructure/api/gradesApi";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  AdCreateContentStep,
  AdCreatePreviewStep,
  AdCreateSchedulingStep,
  AdCreateSmartDraftBadge,
  AdCreateStepper,
  AdCreateTargetingStep,
  AdCreateTypeStep,
  AdCreateWizardFooter,
} from "@/modules/admin/presentation/components/ad-management";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function AdminAdCreatePage() {
  const t = useTranslations("admin.dashboard.adManagement.create");
  const locale = useLocale();
  const router = useRouter();
  const wizard = useAdCreateWizard();
  const [schoolOptions, setSchoolOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [subjectOptions, setSubjectOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    void (async () => {
      const [schoolsResult, gradesResult, subjectsResult] = await Promise.all([
        getSchoolFilterOptions(),
        getGrades({ pageNumber: 1, pageSize: 240 }),
        getSubjectsPage({ pageNumber: 1, pageSize: 240 }),
      ]);
      if (schoolsResult.data?.length) {
        setSchoolOptions(
          schoolsResult.data.map((row) => ({ value: row.id, label: row.name })),
        );
      }
      if (gradesResult.data?.rows?.length) {
        setGradeOptions(
          gradesResult.data.rows.map((row) => ({
            value: String(row.id),
            label: locale === "ar" ? row.nameAr : row.nameEn,
          })),
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

  const stepContent: Record<AdCreateWizardStepId, ReactNode> = {
    content: <AdCreateContentStep values={wizard.values} onChange={wizard.patchValues} />,
    type: <AdCreateTypeStep values={wizard.values} onChange={wizard.patchValues} />,
    targeting: (
      <AdCreateTargetingStep
        values={wizard.values}
        onChange={wizard.patchValues}
        schoolOptions={schoolOptions}
        gradeOptions={gradeOptions}
        subjectOptions={subjectOptions}
      />
    ),
    scheduling: <AdCreateSchedulingStep values={wizard.values} onChange={wizard.patchValues} />,
    preview: (
      <AdCreatePreviewStep
        values={wizard.values}
        onPublish={() => void wizard.submit("active")}
        onSaveDraft={() => void wizard.submit("draft")}
        isSubmitting={wizard.isSubmitting}
      />
    ),
  };

  const nextLabel = wizard.nextStepId
    ? t("actions.next", { step: t(`steps.${wizard.nextStepId}`) })
    : t("actions.finish");

  const handleNext = () => {
    if (wizard.isLastStep) {
      void wizard.submit("active");
      return;
    }
    wizard.goNext();
  };

  return (
    <div className="space-y-6 pb-24">
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

      <AdCreateStepper activeStep={wizard.activeStep} onStepClick={wizard.goToStep} />

      {stepContent[wizard.activeStep]}

      {!wizard.isLastStep ? (
        <AdCreateWizardFooter
          onCancel={() => router.push(ROUTES.ADMIN.ADS.LIST)}
          onSaveDraft={() => void wizard.submit("draft")}
          onBack={wizard.isFirstStep ? undefined : wizard.goBack}
          showBack={!wizard.isFirstStep}
          onNext={handleNext}
          nextLabel={nextLabel}
          isSubmitting={wizard.isSubmitting || wizard.isUploadingMedia}
        />
      ) : null}
    </div>
  );
}
