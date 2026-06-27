"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPinned } from "lucide-react";
import { SchoolIcon } from "@/modules/admin/presentation/assets/icons/school";
import { SubscriptionIcon } from "@/modules/admin/presentation/assets/icons/subscraption";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
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
import {
  createSchool,
  type CreateSchoolPayload,
} from "@/modules/admin/infrastructure/api/schoolApi";
import { getCountriesDropdown } from "@/modules/admin/infrastructure/api/userManagementApi";
import { notify } from "@/shared/application/lib/toast";
import { SchoolFormActions } from "@/modules/admin/presentation/components/school-form/SchoolFormActions";
import { SchoolIdentitySection } from "@/modules/admin/presentation/components/school-form/SchoolIdentitySection";
import { SchoolContactSection } from "@/modules/admin/presentation/components/school-form/SchoolContactSection";
import { SchoolSubscriptionSection } from "@/modules/admin/presentation/components/school-form/SchoolSubscriptionSection";
import { SchoolLocationSection } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";
import type { SchoolLocationInput } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

const ARABIC_INDIC_ZERO_CODE = "٠".charCodeAt(0);
const EXTENDED_ARABIC_INDIC_ZERO_CODE = "۰".charCodeAt(0);

function normalizeTextInput(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

function normalizeDigitsToLatin(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= ARABIC_INDIC_ZERO_CODE && code <= ARABIC_INDIC_ZERO_CODE + 9) {
      return String(code - ARABIC_INDIC_ZERO_CODE);
    }
    if (
      code >= EXTENDED_ARABIC_INDIC_ZERO_CODE &&
      code <= EXTENDED_ARABIC_INDIC_ZERO_CODE + 9
    ) {
      return String(code - EXTENDED_ARABIC_INDIC_ZERO_CODE);
    }
    return char;
  });
}

function buildCreateSchoolPayload(values: SchoolFormValues): CreateSchoolPayload {
  const plan = schoolSubscriptionPlans.find((p) => p.id === values.subscriptionPlanId);
  const rawLogo = values.schoolLogoPreviewUrl ?? "";
  const logoUrl =
    rawLogo.startsWith("http://") || rawLogo.startsWith("https://") ? rawLogo : "";

  return {
    name: normalizeTextInput(values.schoolName),
    logoUrl,
    phoneNumber: normalizeDigitsToLatin(normalizeTextInput(values.phoneNumber)),
    address: normalizeTextInput(values.address),
    email: normalizeDigitsToLatin(normalizeTextInput(values.email)).toLowerCase(),
    description: normalizeTextInput(values.schoolDescription),
    city: normalizeTextInput(values.city),
    country: normalizeTextInput(values.country),
    points: 0,
    performanceLevel:
      values.educationStageIds.length > 0
        ? values.educationStageIds.join(", ")
        : "standard",
    establishmentDate: new Date().toISOString(),
    subscriptionPlanId: plan?.apiId ?? "",
  };
}

export function AdminAddSchoolPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [values, setValues] = useState<SchoolFormValues>(defaultSchoolFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message?: string;
    validationErrors?: Record<string, string[]> | null;
  } | null>(null);
  const [countryOptions, setCountryOptions] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getCountriesDropdown();
      if (cancelled) return;
      if (result.data && result.data.length > 0) {
        setCountryOptions(
          result.data.map((row) => ({
            id: String(row.id),
            label: row.name,
          })),
        );
      } else if (result.errorMessage) {
        notify.error(result.errorMessage);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof SchoolFormValues>(
    key: K,
    value: SchoolFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleCountryChange = (value: string) => {
    const row = countryOptions.find((c) => c.id === value);
    setValues((current) => ({
      ...current,
      countryId: value,
      country: row?.label ?? "",
    }));
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

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = buildCreateSchoolPayload(values);
    const result = await createSchool(payload);
    console.log(payload);

    if (result.data?.id) {
      notify.success(result.message ?? t("schoolManagement.addForm.messages.createSuccess"));
      router.push(`${ROUTES.ADMIN.HOME}?tab=schoolManagement&refresh=${Date.now()}`);
      return;
    }

    setSubmitError({
      message: result.errorMessage ?? t("schoolManagement.addForm.messages.createError"),
      validationErrors: result.validationErrors,
    });
    notify.error(result.errorMessage ?? t("schoolManagement.addForm.messages.createError"));
    setIsSubmitting(false);
  };

  const locationInput = useMemo<SchoolLocationInput>(
    () => ({
      city:
        values.city.trim() || t("schoolManagement.addForm.location.fallbackCity"),
      region:
        values.address.trim() || t("schoolManagement.addForm.location.fallbackRegion"),
      country: values.country.trim(),
    }),
    [values.city, values.address, values.country, t],
  );

  const plansForUi = useMemo(
    () =>
      schoolSubscriptionPlans.map((plan) => ({
        id: plan.id,
        labelKey: plan.labelKey,
        descriptionKey: plan.descriptionKey,
        label: t(plan.labelKey),
        description: plan.descriptionKey ? t(plan.descriptionKey) : undefined,
      })),
    [t],
  );

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title") },
          { label: t("schoolManagement.page.title") },
          { label: t("schoolManagement.addPage.title") },
        ]} />
        <DashboardPageHeader
        title={t("schoolManagement.addPage.title")}
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
      </div>

      <div className="space-y-6">
        {submitError ? (
          <ApiFailureAlert
            message={submitError.message}
            validationErrors={submitError.validationErrors}
          />
        ) : null}

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
          countryFieldLabel={t("schoolManagement.addForm.fields.country.label")}
          countryPlaceholder={t("schoolManagement.addForm.fields.country.placeholder")}
          countryValue={values.countryId}
          countryOptions={countryOptions}
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
          onCountryChange={handleCountryChange}
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
          plans={plansForUi}
          stages={schoolEducationStages.map((stage) => ({
            ...stage,
            label: t(stage.labelKey),
          }))}
          onPlanChange={(planId) => setField("subscriptionPlanId", planId)}
          onStageToggle={toggleStage}
        />

        <SchoolLocationSection
          icon={MapPinned}
          title={t("schoolManagement.addForm.sections.location")}
          locationInput={locationInput}
          providerLabel={t(schoolLocationPreviewData.providerLabelKey)}
          loadingLabel={t(schoolLocationPreviewData.loadingLabelKey)}
          emptyLabel={t(schoolLocationPreviewData.emptyLabelKey)}
          errorLabel={t(schoolLocationPreviewData.errorLabelKey)}
        />
      </div>
    </div>
  );
}
