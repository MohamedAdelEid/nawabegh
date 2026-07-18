"use client";

import { BookOpenCheck, EyeIcon, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  addUserPermissionOptions,
  addUserSubjectOptions,
  defaultTeacherAccountValues,
} from "@/modules/admin/domain/data/addUserFormData";
import {
  createTeacherUser,
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
  updateTeacherUser,
  uploadUserImage,
  type TeacherUserUpdateContext,
  type UserManagementDropdownOption,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { fetchSchoolDropdownRowsForCountryId } from "@/modules/admin/presentation/lib/loadSchoolsForCountry";
import {
  getUserManagementDetailsReturnPath,
  loadTeacherEditForm,
} from "@/modules/admin/presentation/lib/userManagementEditForm";
import { useAvatarUploadOnSelect } from "@/modules/admin/presentation/lib/useAvatarUploadOnSelect";
import {
  validateRequiredCountryAndSchool,
  withResolvedTeacherSchoolName,
} from "@/modules/admin/presentation/lib/validateUserFormLocation";
import {
  AddUserAnimatedSection,
  AddUserFormSectionCard,
  AddUserInputField,
  AddUserPhoneField,
  AddUserOptionGrid,
  AddUserPageShell,
  AddUserPermissionChecklist,
  AddUserSelectField,
  AddUserTagSelector,
  AddUserUploadField,
} from "@/modules/admin/presentation/components/add-user";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

type DropdownRow = { id: string; label: string };

export function AdminAddTeacherPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const editUserId = searchParams.get("userId")?.trim() ?? "";
  const isEditMode = Boolean(editUserId);
  const { uploadingAvatar, handleAvatarChange } = useAvatarUploadOnSelect(isEditMode);
  const [values, setValues] = useState(defaultTeacherAccountValues);
  const [updateContext, setUpdateContext] = useState<TeacherUserUpdateContext>({});
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [editLoadFailed, setEditLoadFailed] = useState(false);
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
  const [schoolSearch, setSchoolSearch] = useState("");
  const schoolRequestIdRef = useRef(0);

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
    async (countryId: string, countryNameFallback = "", keyword = "") => {
      const requestId = ++schoolRequestIdRef.current;
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
        keyword,
      );

      if (requestId !== schoolRequestIdRef.current) return;
      if (errorMessage) {
        notify.error(errorMessage);
      }
      setSchoolRows(rows);
      setSchoolsLoading(false);
    },
    [countryRows],
  );

  useEffect(() => {
    if (!values.countryId) return;

    const timeoutId = window.setTimeout(() => {
      void loadSchools(values.countryId, "", schoolSearch);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [loadSchools, schoolSearch, values.countryId]);

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

      const loaded = await loadTeacherEditForm(editUserId);
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
    schoolRequestIdRef.current += 1;
    setValues((current) => ({
      ...current,
      countryId: value,
      educationLevelId: "",
      gradeLevelIds: [],
      schoolId: "",
      schoolName: "",
    }));
    setEducationLevelRows([]);
    setGradeRows([]);
    setSchoolRows([]);
    setSchoolSearch("");
    setSchoolsLoading(Boolean(value));
    void loadEducationLevels(value);
  };

  const handleEducationLevelChange = (value: string) => {
    setValues((current) => ({
      ...current,
      educationLevelId: value,
      gradeLevelIds: [],
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

  const schoolOptions: DropdownRow[] = useMemo(
    () => [
      { id: "", label: t("userManagement.addUser.shared.placeholders.selectSchool") },
      ...schoolRows.map((row) => ({ id: String(row.id), label: row.name })),
    ],
    [schoolRows, t],
  );

  const gradeToggleOptions = useMemo(
    () =>
      gradeRows.map((row) => ({
        id: String(row.id),
        label: row.name,
      })),
    [gradeRows],
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

    const submitValues = withResolvedTeacherSchoolName(values, schoolRows);

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
      ? await updateTeacherUser(
          editUserId,
          {
            ...submitValues,
            avatarFilePath,
          },
          updateContext,
        )
      : await createTeacherUser({
          ...submitValues,
          avatarFilePath,
        });

    if (result.data) {
      notify.success(
        result.message ??
          (isEditMode ? "Teacher updated successfully." : "Teacher created successfully."),
      );
      router.push(
        isEditMode
          ? getUserManagementDetailsReturnPath(editUserId, "teacher")
          : `${ROUTES.ADMIN.HOME}?tab=userManagement&refresh=${Date.now()}`,
      );
      return;
    }

    setSubmitError({
      message:
        result.errorMessage ??
        (isEditMode ? "Failed to update teacher." : "Failed to create teacher."),
      validationErrors: result.validationErrors,
    });
    notify.error(
      result.errorMessage ??
        (isEditMode ? "Failed to update teacher." : "Failed to create teacher."),
    );
    setIsSubmitting(false);
  };

  const schoolEmpty = !schoolsLoading && schoolRows.length === 0;
  const pageTitle = isEditMode
    ? t("userManagement.addUser.teacher.page.editTitle")
    : t("userManagement.addUser.teacher.page.title");
  const pageDescription = isEditMode
    ? t("userManagement.addUser.teacher.page.editDescription")
    : t("userManagement.addUser.teacher.page.description");
  const submitLabel = isEditMode
    ? t("userManagement.addUser.teacher.page.editSubmit")
    : t("userManagement.addUser.teacher.page.submit");

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
              <AddUserPhoneField
                label={t("userManagement.addUser.shared.fields.phoneNumber")}
                placeholder={t("userManagement.addUser.shared.placeholders.phoneNumber")}
                value={values.phoneNumber}
                countryId={values.countryId}
                disabled={isSubmitting || uploadingAvatar}
                onChange={(value) => setField("phoneNumber", value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.email")}
                placeholder={t("userManagement.addUser.shared.placeholders.email")}
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
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
              <div className="space-y-2">
                <AddUserSelectField
                  label={t("userManagement.addUser.shared.fields.school")}
                  value={values.schoolId}
                  options={schoolOptions}
                  disabled={!values.countryId}
                  isLoading={schoolsLoading}
                  searchValue={schoolSearch}
                  onSearchValueChange={setSchoolSearch}
                  onChange={handleSchoolChange}
                />
                {schoolEmpty && values.countryId ? (
                  <p className="text-sm text-amber-700 text-right">
                    {t("userManagement.addUser.shared.messages.noSchools")}
                  </p>
                ) : null}
              </div>
              <AddUserInputField
                label={t("userManagement.addUser.teacher.fields.jobTitle")}
                placeholder={t("userManagement.addUser.teacher.placeholders.jobTitle")}
                value={values.jobTitle}
                onChange={(event) => setField("jobTitle", event.target.value)}
              />
              {!isEditMode ? (
                <AddUserInputField
                  label={t("userManagement.addUser.shared.fields.password")}
                  placeholder={t("userManagement.addUser.shared.placeholders.password")}
                  type="password"
                  icon={EyeIcon}
                  value={values.password}
                  onChange={(event) => setField("password", event.target.value)}
                />
              ) : null}
              <div className="md:col-span-2">
                <AddUserInputField
                  label={t("userManagement.addUser.teacher.fields.address")}
                  placeholder={t("userManagement.addUser.teacher.placeholders.address")}
                  value={values.address}
                  onChange={(event) => setField("address", event.target.value)}
                />
              </div>
            </div>
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>

      <AddUserAnimatedSection delay={0.1}>
        <AddUserFormSectionCard
          title={t("userManagement.addUser.teacher.academicSection.title")}
          icon={BookOpenCheck}
        >
          <div className="grid gap-6 lg:grid-cols-2 border-t-2 border-[#F6F7F7] pt-5">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[var(--dashboard-primary)]">
                {t("userManagement.addUser.teacher.academicSection.subjects")}
              </h3>
              <AddUserTagSelector
                options={addUserSubjectOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
                selectedIds={values.subjectIds}
                onToggle={(id) =>
                  setField(
                    "subjectIds",
                    values.subjectIds.includes(id)
                      ? values.subjectIds.filter((item) => item !== id)
                      : [...values.subjectIds, id],
                  )
                }
                addLabel={t("userManagement.addUser.teacher.academicSection.addSubject")}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[var(--dashboard-primary)]">
                {t("userManagement.addUser.teacher.academicSection.gradeLevels")}
              </h3>
              {values.educationLevelId && gradeToggleOptions.length > 0 ? (
                <AddUserOptionGrid
                  options={gradeToggleOptions}
                  selectedIds={values.gradeLevelIds}
                  onToggle={(id) =>
                    setField(
                      "gradeLevelIds",
                      values.gradeLevelIds.includes(id)
                        ? values.gradeLevelIds.filter((item) => item !== id)
                        : [...values.gradeLevelIds, id],
                    )
                  }
                />
              ) : (
                <p className="text-sm text-slate-500 text-right">
                  {t("userManagement.addUser.shared.placeholders.selectEducationLevel")}
                </p>
              )}
            </div>
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>

      <AddUserAnimatedSection delay={0.15}>
        <AddUserFormSectionCard
          title={t("userManagement.addUser.teacher.permissionsSection.title")}
          icon={LockKeyhole}
        >
          <div className="border-t-2 border-[#F6F7F7] pt-5">
            <AddUserPermissionChecklist
              options={addUserPermissionOptions.map((option) => ({
                id: option.id,
                label: t(option.labelKey),
                description: option.descriptionKey ? t(option.descriptionKey) : undefined,
              }))}
              selectedIds={values.permissionIds}
              onToggle={(id) =>
                setField(
                  "permissionIds",
                  values.permissionIds.includes(id)
                  ? values.permissionIds.filter((item) => item !== id)
                  : [...values.permissionIds, id],
                )
              }
            />
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>
    </AddUserPageShell>
  );
}
