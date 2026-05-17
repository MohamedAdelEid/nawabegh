"use client";

import { BookOpenCheck, EyeIcon, LockKeyhole, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  getUserManagementSchoolsDropdown,
  uploadUserImage,
  type UserManagementDropdownOption,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import {
  AddUserAnimatedSection,
  AddUserFormSectionCard,
  AddUserInputField,
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
  const [values, setValues] = useState(defaultTeacherAccountValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message?: string;
    validationErrors?: unknown;
  } | null>(null);

  const [countryRows, setCountryRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [educationLevelRows, setEducationLevelRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [gradeRows, setGradeRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [schoolRows, setSchoolRows] = useState<UserManagementDropdownOption<string>[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

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

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [countriesResult, schoolsResult] = await Promise.all([
        getCountriesDropdown(),
        getUserManagementSchoolsDropdown(" "),
      ]);

      if (cancelled) return;

      if (countriesResult.data) {
        setCountryRows(countriesResult.data);
      } else if (countriesResult.errorMessage) {
        notify.error(countriesResult.errorMessage);
      }

      if (schoolsResult.data) {
        setSchoolRows(schoolsResult.data);
      } else if (schoolsResult.errorMessage) {
        notify.error(schoolsResult.errorMessage);
      }
      setSchoolsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCountryChange = (value: string) => {
    setValues((current) => ({
      ...current,
      countryId: value,
      educationLevelId: "",
      gradeLevelIds: [],
    }));
    setEducationLevelRows([]);
    setGradeRows([]);
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

    setSubmitError(null);
    setIsSubmitting(true);
    let avatarFilePath = values.avatarFilePath;

    if (values.avatarFile) {
      const uploadResult = await uploadUserImage(values.avatarFile);
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

    const result = await createTeacherUser({
      ...values,
      avatarFilePath,
    });

    if (result.data) {
      notify.success(result.message ?? "Teacher created successfully.");
      router.push(`${ROUTES.ADMIN.HOME}?tab=userManagement&refresh=${Date.now()}`);
      return;
    }

    setSubmitError({
      message: result.errorMessage ?? "Failed to create teacher.",
      validationErrors: result.validationErrors,
    });
    notify.error(result.errorMessage ?? "Failed to create teacher.");
    setIsSubmitting(false);
  };

  const schoolEmpty = !schoolsLoading && schoolRows.length === 0;

  return (
    <AddUserPageShell
      title={t("userManagement.addUser.teacher.page.title")}
      description={t("userManagement.addUser.teacher.page.description")}
      breadcrumbs={[
        { label: t("tabs.home.title") },
        { label: t("userManagement.page.title") },
        { label: t("userManagement.addUser.teacher.page.title") },
      ]}
      cancelLabel={t("userManagement.addUser.shared.actions.cancel")}
      submitLabel={t("userManagement.addUser.teacher.page.submit")}
      onSubmit={handleSubmit}
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
              invalidTypeMessage={t("userManagement.addUser.shared.fields.avatar.invalidType")}
              tooLargeMessage={t("userManagement.addUser.shared.fields.avatar.tooLarge")}
              readErrorMessage={t("userManagement.addUser.shared.fields.avatar.readError")}
              value={{
                file: values.avatarFile,
                previewUrl: values.avatarPreviewUrl,
              }}
              onChange={(next) => {
                setField("avatarFile", next.file);
                setField("avatarPreviewUrl", next.previewUrl);
                setField("avatarFilePath", null);
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.fullName")}
                placeholder={t("userManagement.addUser.shared.placeholders.fullName")}
                value={values.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.phoneNumber")}
                placeholder={t("userManagement.addUser.shared.placeholders.phoneNumber")}
                value={values.phoneNumber}
                onChange={(event) => setField("phoneNumber", event.target.value)}
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
                  disabled={schoolsLoading || schoolEmpty}
                  onChange={handleSchoolChange}
                />
                {schoolEmpty ? (
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
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.password")}
                placeholder={t("userManagement.addUser.shared.placeholders.password")}
                type="password"
                icon={EyeIcon}
                value={values.password}
                onChange={(event) => setField("password", event.target.value)}
              />
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
