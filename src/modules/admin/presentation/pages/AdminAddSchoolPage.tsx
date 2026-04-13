"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPinned, BookOpenCheck } from "lucide-react";
import { SchoolIcon } from "@/modules/admin/presentation/assets/icons/school";
import { SubscriptionIcon } from "@/modules/admin/presentation/assets/icons/subscraption";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  defaultSchoolFormValues,
  schoolEducationStages,
  schoolLocationPreviewData,
  schoolSubscriptionPlans,
} from "@/modules/admin/domain/data/schoolFormOptions";
import type {
  SchoolEducationStageId,
  SchoolFormValues,
} from "@/modules/admin/domain/types/schoolForm.types";
import { SchoolFormActions } from "@/modules/admin/presentation/components/school-form/SchoolFormActions";
import { SchoolIdentitySection } from "@/modules/admin/presentation/components/school-form/SchoolIdentitySection";
import { SchoolContactSection } from "@/modules/admin/presentation/components/school-form/SchoolContactSection";
import { SchoolSubscriptionSection } from "@/modules/admin/presentation/components/school-form/SchoolSubscriptionSection";
import { SchoolLocationSection } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";

export function AdminAddSchoolPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [values, setValues] = useState<SchoolFormValues>(defaultSchoolFormValues);

  const setField = <K extends keyof SchoolFormValues>(
    key: K,
    value: SchoolFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const toggleStage = (stageId: SchoolEducationStageId) => {
    setValues((current) => {
      const hasStage = current.educationStageIds.includes(stageId);
      return {
        ...current,
        educationStageIds: hasStage
          ? current.educationStageIds.filter((id) => id !== stageId)
          : [...current.educationStageIds, stageId],
      };
    });
  };

  const handleCancel = () => {
    router.push(`${ROUTES.ADMIN.HOME}?tab=schoolManagement`);
  };

  const handleSubmit = () => {
    // Placeholder until create-school endpoint is available.
    console.info("Create school payload", values);
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("schoolManagement.addPage.title")}
        breadcrumbs={[
          { label: t("tabs.home.title") },
          { label: t("schoolManagement.page.title") },
          { label: t("schoolManagement.addPage.title") },
        ]}
        description={t("schoolManagement.addPage.description")}
        action={
          <SchoolFormActions
            cancelLabel={t("schoolManagement.addForm.actions.cancel")}
            submitLabel={t("schoolManagement.addForm.actions.submit")}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        }
      />

      <div className="space-y-6">
        <SchoolIdentitySection
          icon={SchoolIcon}
          title={t("schoolManagement.addForm.sections.identity")}
          nameLabel={t("schoolManagement.addForm.fields.schoolName.label")}
          namePlaceholder={t("schoolManagement.addForm.fields.schoolName.placeholder")}
          descriptionLabel={t("schoolManagement.addForm.fields.schoolDescription.label")}
          descriptionPlaceholder={t("schoolManagement.addForm.fields.schoolDescription.placeholder")}
          uploadTitle={t("schoolManagement.addForm.fields.logo.title")}
          uploadDescription={t("schoolManagement.addForm.fields.logo.description")}
          uploadButtonLabel={t("schoolManagement.addForm.fields.logo.uploadButton")}
          changeImageLabel={t("schoolManagement.addForm.fields.logo.changeButton")}
          uploadingLabel={t("schoolManagement.addForm.fields.logo.uploading")}
          previewAlt={t("schoolManagement.addForm.fields.logo.previewAlt")}
          invalidTypeMessage={t("schoolManagement.addForm.fields.logo.invalidType")}
          tooLargeMessage={t("schoolManagement.addForm.fields.logo.tooLarge")}
          readErrorMessage={t("schoolManagement.addForm.fields.logo.readError")}
          value={{
            schoolName: values.schoolName,
            schoolDescription: values.schoolDescription,
            schoolLogoFile: values.schoolLogoFile,
            schoolLogoPreviewUrl: values.schoolLogoPreviewUrl,
          }}
          onChange={(next) =>
            setValues((current) => ({
              ...current,
              schoolName: next.schoolName,
              schoolDescription: next.schoolDescription,
              schoolLogoFile: next.schoolLogoFile,
              schoolLogoPreviewUrl: next.schoolLogoPreviewUrl,
            }))
          }
        />

        <SchoolContactSection
          icon={MapPinned}
          title={t("schoolManagement.addForm.sections.contact")}
          cityLabel={t("schoolManagement.addForm.fields.city.label")}
          addressLabel={t("schoolManagement.addForm.fields.address.label")}
          phoneLabel={t("schoolManagement.addForm.fields.phoneNumber.label")}
          emailLabel={t("schoolManagement.addForm.fields.email.label")}
          cityPlaceholder={t("schoolManagement.addForm.fields.city.placeholder")}
          addressPlaceholder={t("schoolManagement.addForm.fields.address.placeholder")}
          phonePlaceholder={t("schoolManagement.addForm.fields.phoneNumber.placeholder")}
          emailPlaceholder={t("schoolManagement.addForm.fields.email.placeholder")}
          cityValue={values.city}
          addressValue={values.address}
          phoneValue={values.phoneNumber}
          emailValue={values.email}
          onCityChange={(value) => setField("city", value)}
          onAddressChange={(value) => setField("address", value)}
          onPhoneChange={(value) => setField("phoneNumber", value)}
          onEmailChange={(value) => setField("email", value)}
        />

        <SchoolSubscriptionSection
          icon={SubscriptionIcon}
          title={t("schoolManagement.addForm.sections.subscription")}
          planLabel={t("schoolManagement.addForm.fields.subscriptionPlan.label")}
          stagesLabel={t("schoolManagement.addForm.fields.educationStages.label")}
          selectedPlanId={values.subscriptionPlanId}
          selectedStageIds={values.educationStageIds}
          plans={schoolSubscriptionPlans.map((plan) => ({
            ...plan,
            label: t(plan.labelKey),
            description: plan.descriptionKey ? t(plan.descriptionKey) : undefined,
          }))}
          stages={schoolEducationStages.map((stage) => ({
            ...stage,
            label: t(stage.labelKey),
          }))}
          onPlanChange={(planId) => setField("subscriptionPlanId", planId)}
          onStageToggle={toggleStage}
        />

        <SchoolLocationSection
          title={t("schoolManagement.addForm.sections.location")}
          locationData={{
            cityLabel: t(schoolLocationPreviewData.cityKey),
            regionLabel: t(schoolLocationPreviewData.regionKey),
            providerLabel: t(schoolLocationPreviewData.providerLabelKey),
            loadingLabel: t(schoolLocationPreviewData.loadingLabelKey),
            emptyLabel: t(schoolLocationPreviewData.emptyLabelKey),
            errorLabel: t(schoolLocationPreviewData.errorLabelKey),
          }}
        />
      </div>
    </div>
  );
}
