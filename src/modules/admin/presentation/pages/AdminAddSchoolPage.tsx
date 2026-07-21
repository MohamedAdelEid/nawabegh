"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileSpreadsheet, KeyRound, MapPinned } from "lucide-react";
import { SchoolIcon } from "@/modules/admin/presentation/assets/icons/school";
import { SubscriptionIcon } from "@/modules/admin/presentation/assets/icons/subscraption";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  defaultSchoolFormValues,
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
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { notify } from "@/shared/application/lib/toast";
import { mapSchoolDetailToFormValues } from "@/modules/admin/presentation/lib/schoolFormMappers";
import { findOmanCountry } from "@/shared/domain/utils/country.utils";
import { SchoolFormActions } from "@/modules/admin/presentation/components/school-form/SchoolFormActions";
import { SchoolIdentitySection } from "@/modules/admin/presentation/components/school-form/SchoolIdentitySection";
import { SchoolContactSection } from "@/modules/admin/presentation/components/school-form/SchoolContactSection";
import { SchoolFormSectionCard } from "@/modules/admin/presentation/components/school-form/SchoolFormSectionCard";
import { SchoolSubscriptionSection } from "@/modules/admin/presentation/components/school-form/SchoolSubscriptionSection";
import { SchoolLocationSection } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";
import type { SchoolLocationInput } from "@/modules/admin/presentation/components/school-form/SchoolLocationSection";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
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

function buildCreateSchoolPayload(
  values: SchoolFormValues,
  logoUrl: string,
): CreateSchoolPayload {
  return {
    name: normalizeTextInput(values.schoolName),
    logoUrl,
    phoneNumber: normalizeDigitsToLatin(normalizeTextInput(values.phoneNumber)),
    address: normalizeTextInput(values.address),
    email: normalizeDigitsToLatin(normalizeTextInput(values.email)).toLowerCase(),
    coordinatorName: normalizeTextInput(values.coordinatorName) || undefined,
    description: normalizeTextInput(values.schoolDescription),
    city: normalizeTextInput(values.city),
    countryId: Number(values.countryId),
    loginPassword: values.loginPassword,
    educationLevelIds: values.educationStageIds,
  };
}

function buildUpdateSchoolPayload(
  schoolId: string,
  values: SchoolFormValues,
  detail: SchoolDetail,
  logoUrl: string,
): UpdateSchoolPayload {
  return {
    id: schoolId,
    name: normalizeTextInput(values.schoolName),
    logoUrl,
    phoneNumber: normalizeDigitsToLatin(normalizeTextInput(values.phoneNumber)),
    address: normalizeTextInput(values.address),
    description: normalizeTextInput(values.schoolDescription),
    email: normalizeDigitsToLatin(normalizeTextInput(values.email)).toLowerCase(),
    coordinatorName: normalizeTextInput(values.coordinatorName) || undefined,
    city: normalizeTextInput(values.city),
    countryId: Number(values.countryId),
    educationLevelIds: values.educationStageIds,
    ...(values.loginPassword ? { loginPassword: values.loginPassword } : {}),
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
  const [educationLevelOptions, setEducationLevelOptions] = useState<
    Array<{ id: number; label: string }>
  >([]);
  const [educationLevelsLoading, setEducationLevelsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getCountriesDropdown();
      if (cancelled) return;
      if (result.data && result.data.length > 0) {
        const options = result.data.map((row) => ({
          id: String(row.id),
          label: row.name,
        }));
        setCountryOptions(options);

        if (!isEditMode) {
          const oman = findOmanCountry(result.data);
          if (oman) {
            setValues((current) =>
              current.countryId
                ? current
                : {
                    ...current,
                    countryId: String(oman.id),
                    country: oman.name,
                  },
            );
          }
        }
      } else if (result.errorMessage) {
        notify.error(result.errorMessage);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode]);

  useEffect(() => {
    const countryId = Number(values.countryId);
    if (!countryId) {
      setEducationLevelOptions([]);
      setEducationLevelsLoading(false);
      return;
    }
    let cancelled = false;
    setEducationLevelsLoading(true);
    void (async () => {
      const result = await getEducationLevelsDropdown(countryId);
      if (cancelled) return;
      setEducationLevelsLoading(false);
      if (result.data) {
        setEducationLevelOptions(
          result.data.map((level) => ({ id: level.id, label: level.name })),
        );
      } else {
        setEducationLevelOptions([]);
        if (result.errorMessage) notify.error(result.errorMessage);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [values.countryId]);

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
      educationStageIds: current.countryId === value ? current.educationStageIds : [],
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

    let logoUrl = values.schoolLogoPreviewUrl ?? "";
    if (values.schoolLogoFile) {
      const upload = await uploadAdminFile(values.schoolLogoFile, "schools/logos");
      if (!upload.ok) {
        setSubmitError({ message: upload.errorMessage });
        notify.error(upload.errorMessage);
        setIsSubmitting(false);
        return;
      }
      logoUrl = resolveFileUrl(upload.filePath) ?? upload.filePath;
    }

    if (isEditMode && schoolId && loadedSchool) {
      const payload = buildUpdateSchoolPayload(schoolId, values, loadedSchool, logoUrl);
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

    const payload = buildCreateSchoolPayload(values, logoUrl);
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
    () => {
      const city = values.city.trim();
      const region = values.address.trim();
      const country = values.country.trim();

      return {
        city: city || t("schoolManagement.addForm.location.fallbackCity"),
        region: region || t("schoolManagement.addForm.location.fallbackRegion"),
        country,
        searchCity: city,
        searchRegion: region,
        searchCountry: country,
      };
    },
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
          <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
            {!isEditMode ? (
              <Button
                type="button"
                className="h-12 rounded-xl border-0 px-6 text-white hover:bg-[#1a5c37]"
                style={{
                  backgroundColor: "#217346",
                  boxShadow: "0px 4px 0px 0px #185c37",
                }}
                onClick={() => router.push(ROUTES.ADMIN.SCHOOL_MANAGEMENT.IMPORT)}
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden />
                {t("schoolManagement.addPage.importFromExcel")}
              </Button>
            ) : null}
            <SchoolFormActions
              cancelLabel={t("schoolManagement.addForm.actions.cancel")}
              submitLabel={submitLabel}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
          </div>
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
          coordinatorLabel={t("schoolManagement.addForm.fields.coordinatorName.label")}
          cityPlaceholder={t("schoolManagement.addForm.fields.city.placeholder")}
          addressPlaceholder={t("schoolManagement.addForm.fields.address.placeholder")}
          phonePlaceholder={t("schoolManagement.addForm.fields.phoneNumber.placeholder")}
          coordinatorPlaceholder={t("schoolManagement.addForm.fields.coordinatorName.placeholder")}
          cityValue={values.city}
          addressValue={values.address}
          phoneValue={values.phoneNumber}
          coordinatorValue={values.coordinatorName}
          onCountryChange={handleCountryChange}
          onCityChange={(value) => setField("city", value)}
          onAddressChange={(value) => setField("address", value)}
          onPhoneChange={(value) => setField("phoneNumber", value)}
          onCoordinatorChange={(value) => setField("coordinatorName", value)}
        />

        <SchoolFormSectionCard
          icon={KeyRound}
          title={t("schoolManagement.addForm.sections.login")}
        >
          <div className="space-y-4">
            <div className="grid w-full gap-5 md:grid-cols-2">
              <LabeledInput
                label={t("schoolManagement.addForm.fields.loginPassword.label")}
                type="password"
                value={values.loginPassword}
                placeholder={t("schoolManagement.addForm.fields.loginPassword.placeholder")}
                onChange={(value) => setField("loginPassword", value)}
              />
              <LabeledInput
                label={t("schoolManagement.addForm.fields.email.label")}
                type="email"
                value={values.email}
                placeholder={t("schoolManagement.addForm.fields.email.placeholder")}
                onChange={(value) => setField("email", value)}
              />
            </div>
            {isEditMode ? (
              <p className="text-xs text-slate-400">
                {t("schoolManagement.editForm.passwordHint")}
              </p>
            ) : null}
          </div>
        </SchoolFormSectionCard>

        <SchoolSubscriptionSection
          icon={SubscriptionIcon}
          title={t("schoolManagement.addForm.sections.subscription")}
          planLabel={t("schoolManagement.addForm.fields.subscriptionPlan.label")}
          stagesLabel={t("schoolManagement.addForm.fields.educationStages.label")}
          selectedPlanId={values.subscriptionPlanId}
          selectedStageIds={values.educationStageIds}
          plans={plansForUi}
          stagesLoading={educationLevelsLoading}
          stagesEmptyHint={
            !values.countryId
              ? t("schoolManagement.addForm.fields.educationStages.selectCountryFirst")
              : educationLevelsLoading
                ? t("schoolManagement.addForm.fields.educationStages.loading")
                : t("schoolManagement.addForm.fields.educationStages.empty")
          }
          stages={educationLevelOptions.map((stage) => ({
            id: stage.id,
            label: stage.label,
            labelKey: "",
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
