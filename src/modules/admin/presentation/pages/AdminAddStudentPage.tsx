"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  addUserSubscriptionOptions,
  availableParentOptions,
  defaultStudentAccountValues,
} from "@/modules/admin/domain/data/addUserFormData";
import {
  createStudentUser,
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
  searchParentByPhone,
  updateStudentUser,
  uploadUserImage,
  type StudentUserUpdateContext,
  type UserManagementDropdownOption,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { fetchSchoolDropdownRowsForCountryId } from "@/modules/admin/presentation/lib/loadSchoolsForCountry";
import {
  getUserManagementDetailsReturnPath,
  loadStudentEditForm,
} from "@/modules/admin/presentation/lib/userManagementEditForm";
import { useAvatarUploadOnSelect } from "@/modules/admin/presentation/lib/useAvatarUploadOnSelect";
import {
  validateRequiredCountryAndSchool,
  withResolvedStudentSchoolName,
} from "@/modules/admin/presentation/lib/validateUserFormLocation";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import {
  AddUserAnimatedSection,
  AddUserDateField,
  AddUserFormSectionCard,
  AddUserInputField,
  AddUserPhoneField,
  AddUserPageShell,
  AddUserSelectField,
  AddUserSubscriptionCards,
  AddUserToggle,
  AddUserUploadField,
} from "@/modules/admin/presentation/components/add-user";
import Parents from "../assets/icons/Parents";
import Credit from "../assets/icons/Credit";
import CalenderIcon from "../assets/icons/CalenderIcon";
import ExpireCalender from "../assets/icons/ExpireCalender";

type DropdownRow = { id: string; label: string };

export function AdminAddStudentPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const editUserId = searchParams.get("userId")?.trim() ?? "";
  const isEditMode = Boolean(editUserId);
  const { uploadingAvatar, handleAvatarChange } = useAvatarUploadOnSelect(isEditMode);
  const [values, setValues] = useState(defaultStudentAccountValues);
  const [updateContext, setUpdateContext] = useState<StudentUserUpdateContext>({});
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [editLoadFailed, setEditLoadFailed] = useState(false);
  const [apiParentOption, setApiParentOption] = useState<(typeof availableParentOptions)[number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message?: string;
    validationErrors?: unknown;
  } | null>(null);

  const [countryRows, setCountryRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [educationLevelRows, setEducationLevelRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [gradeRows, setGradeRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [schoolRows, setSchoolRows] = useState<UserManagementDropdownOption<string>[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const parentResults = useMemo(
    () => {
      const mockResults = availableParentOptions.filter((parent) =>
        parent.name.includes(values.parentSearch) ||
        parent.secondaryLabel.includes(values.parentSearch),
      );

      if (!apiParentOption) return mockResults;
      return [apiParentOption, ...mockResults.filter((item) => item.id !== apiParentOption.id)];
    },
    [apiParentOption, values.parentSearch],
  );

  const setField = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const loadEducationLevels = useCallback(async (countryId: string) => {
    const id = Number(countryId);
    if (!countryId || Number.isNaN(id)) {
      setEducationLevelRows([]);
      return;
    }
    const result = await getEducationLevelsDropdown(id);
    if (result.data) {
      setEducationLevelRows(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
      setEducationLevelRows([]);
    }
  }, []);

  const loadGrades = useCallback(async (educationLevelId: string) => {
    const id = Number(educationLevelId);
    if (!educationLevelId || Number.isNaN(id)) {
      setGradeRows([]);
      return;
    }
    const result = await getUserManagementGradesDropdown(id);
    if (result.data) {
      setGradeRows(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
      setGradeRows([]);
    }
  }, []);

  const loadSchools = useCallback(
    async (countryId: string, countryNameFallback = "") => {
      if (!countryId.trim()) {
        setSchoolRows([]);
        setSchoolsLoading(false);
        return;
      }

      setSchoolsLoading(true);
      const { rows, errorMessage } = await fetchSchoolDropdownRowsForCountryId(
        countryRows,
        countryId,
        countryNameFallback,
      );

      if (errorMessage) {
        notify.error(errorMessage);
      }
      setSchoolRows(rows);
      setSchoolsLoading(false);
    },
    [countryRows],
  );

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    void (async () => {
      const countriesResult = await getCountriesDropdown();

      if (cancelled) return;

      if (countriesResult.data) {
        setCountryRows(countriesResult.data);
      } else if (countriesResult.errorMessage) {
        notify.error(countriesResult.errorMessage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode || !editUserId) return;

    let cancelled = false;

    void (async () => {
      setIsLoadingEdit(true);
      setEditLoadFailed(false);

      const loaded = await loadStudentEditForm(editUserId);
      if (cancelled) return;

      if (!loaded) {
        setEditLoadFailed(true);
        notify.error(t("userManagement.addUser.shared.messages.editLoadError"));
        setIsLoadingEdit(false);
        return;
      }

      setValues(loaded.formValues);
      setUpdateContext(loaded.updateContext);
      setCountryRows(loaded.countryRows);
      setEducationLevelRows(loaded.educationLevelRows);
      setGradeRows(loaded.gradeRows);
      setSchoolRows(loaded.schoolRows);
      setSchoolsLoading(false);
      setIsLoadingEdit(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [editUserId, isEditMode, t]);

  const handleCountryChange = (value: string) => {
    setValues((current) => ({
      ...current,
      countryId: value,
      educationLevelId: "",
      gradeId: "",
      schoolId: "",
      schoolName: "",
    }));
    setEducationLevelRows([]);
    setGradeRows([]);
    setSchoolRows([]);
    void loadEducationLevels(value);
    void loadSchools(value);
  };

  const handleEducationLevelChange = (value: string) => {
    setValues((current) => ({
      ...current,
      educationLevelId: value,
      gradeId: "",
    }));
    setGradeRows([]);
    void loadGrades(value);
  };

  const handleSchoolChange = (value: string) => {
    const row = schoolRows.find((s) => String(s.id) === value);
    setValues((current) => ({
      ...current,
      schoolId: value,
      schoolName: row?.name ?? "",
    }));
  };

  useEffect(() => {
    if (!values.linkParentEnabled || values.parentSearch.trim().length < 3) {
      setApiParentOption(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const result = await searchParentByPhone(values.parentSearch.trim());

      if (result.data) {
        setApiParentOption({
          id: result.data.parentUserId,
          name: result.data.fullName,
          secondaryLabel: `رقم الهاتف: ${result.data.phoneNumber}`,
          tertiaryLabel: "نتيجة من البحث المباشر",
          avatarInitials: result.data.fullName.trim().slice(0, 2) || "و",
          avatarClassName: "bg-[#E8EEF8] text-[#243B5A]",
        });
      } else {
        setApiParentOption(null);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [values.linkParentEnabled, values.parentSearch]);

  const countryOptions: DropdownRow[] = useMemo(
    () => [
      { id: "", label: t("userManagement.addUser.shared.placeholders.selectCountry") },
      ...countryRows.map((row) => ({ id: String(row.id), label: row.name })),
    ],
    [countryRows, t],
  );

  const educationLevelOptions: DropdownRow[] = useMemo(
    () => [
      { id: "", label: t("userManagement.addUser.shared.placeholders.selectEducationLevel") },
      ...educationLevelRows.map((row) => ({ id: String(row.id), label: row.name })),
    ],
    [educationLevelRows, t],
  );

  const gradeOptions: DropdownRow[] = useMemo(
    () => [
      { id: "", label: t("userManagement.addUser.shared.placeholders.selectGrade") },
      ...gradeRows.map((row) => ({ id: String(row.id), label: row.name })),
    ],
    [gradeRows, t],
  );

  const schoolOptions: DropdownRow[] = useMemo(
    () => [
      { id: "", label: t("userManagement.addUser.shared.placeholders.selectSchool") },
      ...schoolRows.map((row) => ({ id: String(row.id), label: row.name })),
    ],
    [schoolRows, t],
  );

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const locationError = validateRequiredCountryAndSchool(values.countryId, values.schoolId);
    if (locationError) {
      const message = t(`userManagement.addUser.shared.messages.${locationError}`);
      notify.error(message);
      setSubmitError({ message });
      return;
    }

    const submitValues = withResolvedStudentSchoolName(values, schoolRows);

    setSubmitError(null);
    setIsSubmitting(true);
    let avatarFilePath = submitValues.avatarFilePath;

    if (!isEditMode && submitValues.avatarFile) {
      const uploadResult = await uploadUserImage(submitValues.avatarFile);
      if (!uploadResult.data?.filePath) {
        setSubmitError({
          message: uploadResult.errorMessage ?? "Failed to upload image.",
          validationErrors: uploadResult.validationErrors,
        });
        notify.error(uploadResult.errorMessage ?? "Failed to upload image.");
        setIsSubmitting(false);
        return;
      }
      avatarFilePath = uploadResult.data.filePath;
    }

    const result = isEditMode
      ? await updateStudentUser(
          editUserId,
          {
            ...submitValues,
            avatarFilePath,
          },
          updateContext,
        )
      : await createStudentUser({
          ...submitValues,
          avatarFilePath,
        });

    if (result.data) {
      notify.success(
        result.message ??
          (isEditMode ? "Student updated successfully." : "Student created successfully."),
      );
      router.push(
        isEditMode
          ? getUserManagementDetailsReturnPath(editUserId, "student")
          : `${ROUTES.ADMIN.HOME}?tab=userManagement&refresh=${Date.now()}`,
      );
      return;
    }

    setSubmitError({
      message:
        result.errorMessage ??
        (isEditMode ? "Failed to update student." : "Failed to create student."),
      validationErrors: result.validationErrors,
    });
    notify.error(
      result.errorMessage ??
        (isEditMode ? "Failed to update student." : "Failed to create student."),
    );
    setIsSubmitting(false);
  };

  const schoolEmpty = !schoolsLoading && schoolRows.length === 0;
  const pageTitle = isEditMode
    ? t("userManagement.addUser.student.page.editTitle")
    : t("userManagement.addUser.student.page.title");
  const pageDescription = isEditMode
    ? t("userManagement.addUser.student.page.editDescription")
    : t("userManagement.addUser.student.page.description");
  const submitLabel = isEditMode
    ? t("userManagement.addUser.student.page.editSubmit")
    : t("userManagement.addUser.student.page.submit");

  if (isLoadingEdit) {
    return (
      <div className="flex min-h-[16rem] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#243B5A]" />
          <p>{t("userManagement.addUser.shared.messages.editLoading")}</p>
        </div>
      </div>
    );
  }

  if (editLoadFailed) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
        {t("userManagement.addUser.shared.messages.editLoadError")}
      </div>
    );
  }

  return (
    <AddUserPageShell
      title={pageTitle}
      description={pageDescription}
      breadcrumbs={[
        { label: t("tabs.home.title") },
        { label: t("userManagement.page.title") },
        { label: pageTitle },
      ]}
      cancelLabel={t("userManagement.addUser.shared.actions.cancel")}
      submitLabel={submitLabel}
      onSubmit={handleSubmit}
      actionsDisabled={isSubmitting || uploadingAvatar}
    >
      {submitError ? (
        <ApiFailureAlert
          message={submitError.message}
          validationErrors={submitError.validationErrors}
          className="mb-2"
        />
      ) : null}

      <AddUserAnimatedSection delay={0.05}>
        <AddUserFormSectionCard
          title={t("userManagement.addUser.shared.sections.basicInfo")}
          icon={UserRound}
        >
          <div className="grid gap-6 lg:grid-cols-[10rem_minmax(0,1fr)] border-t-2 border-[#F6F7F7] pt-5">
            <AddUserUploadField
              title={t("userManagement.addUser.shared.fields.avatar.label")}
              hint={t("userManagement.addUser.shared.fields.avatar.hint")}
              previewAlt={t("userManagement.addUser.shared.fields.avatar.previewAlt")}
              uploadLabel={t("userManagement.addUser.shared.fields.avatar.upload")}
              uploadingLabel={t("userManagement.addUser.shared.fields.avatar.uploading")}
              invalidTypeMessage={t("userManagement.addUser.shared.fields.avatar.invalidType")}
              tooLargeMessage={t("userManagement.addUser.shared.fields.avatar.tooLarge")}
              readErrorMessage={t("userManagement.addUser.shared.fields.avatar.readError")}
              disabled={uploadingAvatar || isSubmitting}
              value={{
                file: values.avatarFile,
                previewUrl: values.avatarPreviewUrl,
              }}
              onChange={(next) => {
                void handleAvatarChange(next, setValues);
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.fullName")}
                placeholder={t("userManagement.addUser.shared.placeholders.fullName")}
                value={values.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
              />
              <AddUserSelectField
                label={t("userManagement.addUser.shared.fields.country")}
                value={values.countryId}
                options={countryOptions}
                onChange={handleCountryChange}
              />
              <AddUserSelectField
                label={t("userManagement.addUser.student.fields.educationalStage")}
                value={values.educationLevelId}
                options={educationLevelOptions}
                disabled={!values.countryId}
                onChange={handleEducationLevelChange}
              />
              <AddUserSelectField
                label={t("userManagement.addUser.student.fields.schoolYear")}
                value={values.gradeId}
                options={gradeOptions}
                disabled={!values.educationLevelId}
                onChange={(value) => setField("gradeId", value)}
              />
              <AddUserPhoneField
                label={t("userManagement.addUser.shared.fields.phoneNumber")}
                placeholder={t("userManagement.addUser.shared.placeholders.phoneNumber")}
                value={values.phoneNumber}
                countryId={values.countryId}
                disabled={isSubmitting || uploadingAvatar}
                onChange={(value) => setField("phoneNumber", value)}
              />
              <div className="space-y-2">
                <AddUserSelectField
                  label={t("userManagement.addUser.shared.fields.school")}
                  value={values.schoolId}
                  options={schoolOptions}
                  disabled={!values.countryId || schoolsLoading || schoolEmpty}
                  onChange={handleSchoolChange}
                />
                {schoolEmpty && values.countryId ? (
                  <p className="text-sm text-amber-700 text-right">
                    {t("userManagement.addUser.shared.messages.noSchools")}
                  </p>
                ) : null}
              </div>
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.email")}
                placeholder={t("userManagement.addUser.shared.placeholders.email")}
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.student.fields.username")}
                placeholder={t("userManagement.addUser.student.placeholders.username")}
                value={values.username}
                onChange={(event) => setField("username", event.target.value)}
              />
              {!isEditMode ? (
                <AddUserInputField
                  label={t("userManagement.addUser.shared.fields.password")}
                  placeholder={t("userManagement.addUser.shared.placeholders.password")}
                  type="password"
                  value={values.password}
                  onChange={(event) => setField("password", event.target.value)}
                />
              ) : null}
            </div>
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>

      {!isEditMode ? (
      <AddUserAnimatedSection delay={0.1}>
        <AddUserFormSectionCard
          title={t("userManagement.addUser.student.parentSection.title")}
          icon={Parents}
          className="relative"
        >
        <div className="absolute top-[1.75rem] left-[1.75rem] flex items-center justify-between">
          <AddUserToggle
            checked={values.linkParentEnabled}
            onChange={(checked) => setField("linkParentEnabled", checked)}
            ariaLabel={t("userManagement.addUser.student.parentSection.toggle")}
          />
        </div>
        <div className="space-y-5 border-t-2 border-[#F6F7F7] pt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.75rem] bg-[var(--dashboard-surface-soft)] p-6 border-t-2 border-[#F6F7F7] pt-5">
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] flex items-center justify-center bg-white rounded-2xl" 
                  style={{ boxShadow: "0px 1px 2px 0px #0000000D" }}>
                  <Search className="h-5 w-5 text-[var(--dashboard-primary)]" />
                </div>
                <div className="space-y-2 text-right">
                  <h3 className="text-xl font-bold text-[var(--dashboard-primary)]">
                    {t("userManagement.addUser.student.parentSection.searchTitle")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t("userManagement.addUser.student.parentSection.searchDescription")}
                  </p>
                </div>
              </div>
              <div className="relative mt-4">
                <input
                  type="search"
                  value={values.parentSearch}
                  onChange={(event) => setField("parentSearch", event.target.value)}
                  placeholder={t("userManagement.addUser.student.parentSection.searchPlaceholder")}
                  className="h-14 w-full rounded-2xl border border-[var(--dashboard-border-soft)] bg-white pr-4 pl-12 text-right text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-[var(--dashboard-gold)] focus:ring-2 focus:ring-[var(--dashboard-gold)]/20"
                />
              </div>

              {values.linkParentEnabled && parentResults.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {parentResults.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => setField("selectedParentId", parent.id)}
                      className={`w-full rounded-2xl border p-4 text-right transition-colors ${
                        values.selectedParentId === parent.id
                          ? "border-[var(--dashboard-gold)] bg-[#fffdf7]"
                          : "border-[var(--dashboard-border-soft)] bg-white"
                      }`}
                    >
                      <p className="font-semibold text-[var(--dashboard-primary)]">{parent.name}</p>
                      <p className="text-xs text-slate-500">{parent.secondaryLabel}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--dashboard-border-strong)] bg-[var(--dashboard-surface-soft)] p-6 text-center">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[var(--dashboard-primary)]">
                  {t("userManagement.addUser.student.parentSection.createTitle")}
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  {t("userManagement.addUser.student.parentSection.createDescription")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-5 h-12 rounded-2xl border-[var(--dashboard-border-soft)] px-5 text-slate-700"
                onClick={() => router.push(ROUTES.ADMIN.USER_MANAGEMENT.ADD.PARENT)}
              >
                {t("userManagement.addUser.student.parentSection.createAction")}
              </Button>
            </div>

          </div>
        </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>
      ) : null}

      {!isEditMode ? (
      <AddUserAnimatedSection delay={0.15}>
        <AddUserFormSectionCard
          title={t("userManagement.addUser.student.subscriptionSection.title")}
          icon={Credit}
        >
          <div className="space-y-5 border-t-2 border-[#F6F7F7] pt-5">
            <AddUserSubscriptionCards
              selectedId={values.subscriptionPlanId}
              onChange={(id) => setField("subscriptionPlanId", id)}
              options={addUserSubscriptionOptions.map((option) => ({
                id: option.id,
                label: t(option.labelKey),
                description: option.descriptionKey ? t(option.descriptionKey) : undefined,
              }))}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <AddUserDateField
                label={t("userManagement.addUser.student.subscriptionSection.startDate")}
                icon={CalenderIcon}
                value={values.subscriptionStartDate}
                onChange={(value) => setField("subscriptionStartDate", value)}
              />
              <AddUserDateField
                label={t("userManagement.addUser.student.subscriptionSection.endDate")}
                value={values.subscriptionEndDate}
                icon={ExpireCalender}
                onChange={(value) => setField("subscriptionEndDate", value)}
              />
            </div>
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>
      ) : null}
    </AddUserPageShell>
  );
}
