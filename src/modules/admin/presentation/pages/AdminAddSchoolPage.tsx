"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPinned } from "lucide-react";
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
import {
  createSchool,
  getSchoolById,
  updateSchool,
  type CreateSchoolPayload,
  type SchoolDetail,
  type UpdateSchoolPayload,
} from "@/modules/admin/infrastructure/api/schoolApi";
import { getCountriesDropdown } from "@/modules/admin/infrastructure/api/userManagementApi";
import { notify } from "@/shared/application/lib/toast";
import { mapSchoolDetailToFormValues } from "@/modules/admin/presentation/lib/schoolFormMappers";
import { SchoolFormActions } from "@/modules/admin/presentation/components/school-form/SchoolFormActions";
import { SchoolIdentitySection } from "@/modules/admin/presentation/components/school-form/SchoolIdentitySection";
import { SchoolContactSection } from "@/modules/admin/presentation/components/school-form/SchoolContactSection";
import { SchoolSubscriptionSection } from "@/modules/admin/presentation/components/school-form/SchoolSubscriptionSection";
import { SchoolLocationSection } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";
import type { SchoolLocationInput } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

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

function buildPerformanceLevel(values: SchoolFormValues): string {
  return values.educationStageIds.length > 0
    ? values.educationStageIds.join(", ")
    : "standard";
}

function resolveLogoUrl(values: SchoolFormValues): string {
  const rawLogo = values.schoolLogoPreviewUrl ?? "";
  return rawLogo.startsWith("http://") || rawLogo.startsWith("https://") ? rawLogo : "";
}

function buildCreateSchoolPayload(values: SchoolFormValues): CreateSchoolPayload {
  return {
    name: normalizeTextInput(values.schoolName),
    logoUrl: resolveLogoUrl(values),
    phoneNumber: normalizeDigitsToLatin(normalizeTextInput(values.phoneNumber)),
    address: normalizeTextInput(values.address),
    email: normalizeDigitsToLatin(normalizeTextInput(values.email)).toLowerCase(),
    description: normalizeTextInput(values.schoolDescription),
    city: normalizeTextInput(values.city),
    country: normalizeTextInput(values.country),
    points: 0,
    performanceLevel: buildPerformanceLevel(values),
    establishmentDate: new Date().toISOString(),
  };
}

function buildUpdateSchoolPayload(
  values: SchoolFormValues,
  detail: SchoolDetail,
): UpdateSchoolPayload {
  const plan = schoolSubscriptionPlans.find((p) => p.id === values.subscriptionPlanId);

  return {
    id: detail.id,
    name: normalizeTextInput(values.schoolName),
    logoUrl: resolveLogoUrl(values),
    phoneNumber: normalizeDigitsToLatin(normalizeTextInput(values.phoneNumber)),
    address: normalizeTextInput(values.address),
    description: normalizeTextInput(values.schoolDescription),
    email: normalizeDigitsToLatin(normalizeTextInput(values.email)).toLowerCase(),
    city: normalizeTextInput(values.city),
    country: normalizeTextInput(values.country),
    points: detail.points,
    performanceLevel: buildPerformanceLevel(values),
    establishmentDate: detail.establishmentDate || new Date().toISOString(),
    // subscriptionPlanId: plan?.apiId ?? detail.subscriptionPlanId,
    status: detail.statusCode,
  };
}

interface AdminAddSchoolPageProps {
  schoolId?: string;
}

export function AdminAddSchoolPage({ schoolId }: AdminAddSchoolPageProps = {}) {
  const isEditMode = Boolean(schoolId);
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [values, setValues] = useState<SchoolFormValues>(defaultSchoolFormValues);
  const [loadedSchool, setLoadedSchool] = useState<SchoolDetail | null>(null);
  const [isLoadingSchool, setIsLoadingSchool] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!schoolId) return;

    let cancelled = false;
    setIsLoadingSchool(true);
    setLoadError(null);

    void (async () => {
      const result = await getSchoolById(schoolId);
      if (cancelled) return;

      if (!result.data) {
        setLoadError(result.errorMessage ?? t("schoolManagement.editForm.messages.loadError"));
        setIsLoadingSchool(false);
        return;
      }

      setLoadedSchool(result.data);
      setIsLoadingSchool(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [schoolId, t]);

  useEffect(() => {
    if (!loadedSchool) return;
    setValues(mapSchoolDetailToFormValues(loadedSchool, countryOptions));
  }, [loadedSchool, countryOptions]);

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

  const navigateToDashboard = () => {
    router.push(`${ROUTES.ADMIN.HOME}?tab=schoolManagement&refresh=${Date.now()}`);
  };

  const handleCancel = () => {
    router.push(`${ROUTES.ADMIN.HOME}?tab=schoolManagement`);
  };

  const handleSubmit = async () => {
    if (isSubmitting || isLoadingSchool) return;
    setSubmitError(null);
    setIsSubmitting(true);

    if (isEditMode && schoolId && loadedSchool) {
      const payload = buildUpdateSchoolPayload(values, loadedSchool);
      const result = await updateSchool(schoolId, payload);
      const isSuccess = Boolean(result.data?.id) || (result.status === "Success" && !result.errorMessage);

      if (isSuccess) {
        notify.success(result.message ?? t("schoolManagement.editForm.messages.updateSuccess"));
        navigateToDashboard();
        return;
      }

      setSubmitError({
        message: result.errorMessage ?? t("schoolManagement.editForm.messages.updateError"),
        validationErrors: result.validationErrors,
      });
      notify.error(result.errorMessage ?? t("schoolManagement.editForm.messages.updateError"));
      setIsSubmitting(false);
      return;
    }

    const payload = buildCreateSchoolPayload(values);
    const result = await createSchool(payload);
    const created = result.data;
    const isSuccess = Boolean(created?.id) || (result.status === "Success" && !result.errorMessage);

    if (isSuccess) {
      notify.success(result.message ?? t("schoolManagement.addForm.messages.createSuccess"));
      navigateToDashboard();
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

  const pageTitle = isEditMode
    ? t("schoolManagement.editPage.title")
    : t("schoolManagement.addPage.title");
  const pageDescription = isEditMode
    ? t("schoolManagement.editPage.description")
    : t("schoolManagement.addPage.description");
  const submitLabel = isEditMode
    ? t("schoolManagement.editForm.actions.submit")
    : t("schoolManagement.addForm.actions.submit");

  if (isEditMode && isLoadingSchool) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-right">
        <p className="text-lg font-bold text-red-600">{loadError}</p>
        <button
          type="button"
          className="text-sm font-semibold text-[#243B5A] underline"
          onClick={handleCancel}
        >
          {t("schoolManagement.addForm.actions.cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={pageTitle}
        breadcrumbs={[
          { label: t("tabs.home.title") },
          { label: t("schoolManagement.page.title") },
          { label: pageTitle },
        ]}
        description={pageDescription}
        action={
          <SchoolFormActions
            cancelLabel={t("schoolManagement.addForm.actions.cancel")}
            submitLabel={submitLabel}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        }
      />

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
