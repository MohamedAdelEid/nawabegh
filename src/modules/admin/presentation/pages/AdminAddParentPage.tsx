"use client";

import { Plus, Search, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  defaultParentAccountValues,
} from "@/modules/admin/domain/data/addUserFormData";
import {
  createParentUser,
  getCountriesDropdown,
  getParentStudentsPage,
  searchStudentsForParent,
  uploadUserImage,
  type UserManagementDropdownOption,
  type UserManagementParentStudentOption,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import {
  AddUserAnimatedSection,
  AddUserFormActions,
  AddUserFormSectionCard,
  AddUserInputField,
  AddUserLinkedEntityList,
  AddUserPageShell,
  AddUserSelectField,
  AddUserUploadField,
} from "@/modules/admin/presentation/components/add-user";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { SaveIcon } from "../assets/icons/Save";

type DropdownRow = { id: string; label: string };

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "؟";
  return parts.map((part) => part[0]).join("");
}

const avatarToneClasses = [
  "bg-[#DBEEF6] text-[#255E8A]",
  "bg-[#FEE2E2] text-[#B42318]",
  "bg-[#FDEDD4] text-[#9A5B18]",
  "bg-[#E7F5EE] text-[#1E7A4E]",
] as const;

function getAvatarClassName(seed: string) {
  const sum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarToneClasses[sum % avatarToneClasses.length] ?? avatarToneClasses[0];
}

function mapStudentToLinkedEntity(student: UserManagementParentStudentOption) {
  return {
    id: student.studentUserId,
    name: student.fullName,
    secondaryLabel: student.phoneNumber || "—",
    tertiaryLabel: student.gradeName || undefined,
    avatarInitials: getInitials(student.fullName),
    avatarClassName: getAvatarClassName(student.studentUserId || student.fullName),
  };
}

export function AdminAddParentPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [values, setValues] = useState(defaultParentAccountValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message?: string;
    validationErrors?: unknown;
  } | null>(null);
  const [countryRows, setCountryRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [studentsCatalog, setStudentsCatalog] = useState<UserManagementParentStudentOption[]>([]);
  const [studentSearchRows, setStudentSearchRows] = useState<UserManagementParentStudentOption[]>([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  const selectedStudents = useMemo(
    () =>
      studentsCatalog
        .filter((student) => values.selectedStudentIds.includes(student.studentUserId))
        .map(mapStudentToLinkedEntity),
    [studentsCatalog, values.selectedStudentIds],
  );

  const searchResults = useMemo(
    () =>
      studentSearchRows
        .filter((student) => !values.selectedStudentIds.includes(student.studentUserId))
        .map(mapStudentToLinkedEntity),
    [studentSearchRows, values.selectedStudentIds],
  );

  const setField = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [countriesResult, studentsResult] = await Promise.all([
        getCountriesDropdown(),
        getParentStudentsPage(1, 5),
      ]);
      if (cancelled) return;

      if (countriesResult.data) {
        setCountryRows(countriesResult.data);
      } else if (countriesResult.errorMessage) {
        notify.error(countriesResult.errorMessage);
      }

      if (studentsResult.data) {
        setStudentsCatalog(studentsResult.data);
        setStudentSearchRows(studentsResult.data);
      } else if (studentsResult.errorMessage) {
        notify.error(studentsResult.errorMessage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!values.studentSearch.trim()) {
      setStudentSearchRows(studentsCatalog);
    }
  }, [studentsCatalog, values.studentSearch]);

  useEffect(() => {
    const keyword = values.studentSearch.trim();
    if (!keyword) {
      return;
    }

    setIsSearchingStudents(true);
    const timeoutId = window.setTimeout(async () => {
      const result = await searchStudentsForParent(keyword);

      if (result.data) {
        setStudentSearchRows(result.data);
        setStudentsCatalog((current) => {
          const map = new Map(current.map((student) => [student.studentUserId, student]));
          for (const item of result.data ?? []) {
            map.set(item.studentUserId, item);
          }
          return Array.from(map.values());
        });
      } else if (result.errorMessage) {
        notify.error(result.errorMessage);
      }
      setIsSearchingStudents(false);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      setIsSearchingStudents(false);
    };
  }, [values.studentSearch]);

  const countryOptions: DropdownRow[] = useMemo(
    () => [
      { id: "", label: t("userManagement.addUser.shared.placeholders.selectCountry") },
      ...countryRows.map((row) => ({ id: String(row.id), label: row.name })),
    ],
    [countryRows, t],
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

    const result = await createParentUser({
      ...values,
      avatarFilePath,
    });

    console.log(result);
    if (result.data) {
      notify.success(result.message ?? "Parent created successfully.");
      router.push(`${ROUTES.ADMIN.HOME}?tab=userManagement&refresh=${Date.now()}`);
      return;
    }

    setSubmitError({
      message: result.errorMessage ?? "Failed to create parent.",
      validationErrors: result.validationErrors,
    });
    notify.error(result.errorMessage ?? "Failed to create parent.");
    setIsSubmitting(false);
  };

  return (
    <AddUserPageShell
      title={t("userManagement.addUser.parent.page.title")}
      description={t("userManagement.addUser.parent.page.description")}
      breadcrumbs={[
        { label: t("tabs.home.title") },
        { label: t("userManagement.page.title") },
        { label: t("userManagement.addUser.parent.page.title") },
      ]}
      cancelLabel={t("userManagement.addUser.shared.actions.cancel")}
      submitLabel={t("userManagement.addUser.parent.page.submit")}
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
                label={t("userManagement.addUser.parent.fields.fullName")}
                placeholder={t("userManagement.addUser.parent.placeholders.fullName")}
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
                onChange={(value) => setField("countryId", value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.parent.fields.address")}
                placeholder={t("userManagement.addUser.parent.placeholders.address")}
                value={values.address}
                onChange={(event) => setField("address", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.email")}
                placeholder={t("userManagement.addUser.shared.placeholders.email")}
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.password")}
                placeholder={t("userManagement.addUser.shared.placeholders.password")}
                type="password"
                value={values.password}
                onChange={(event) => setField("password", event.target.value)}
              />
            </div>
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>

      <AddUserAnimatedSection delay={0.1}>
        <AddUserFormSectionCard
          className="relative"
          title={t("userManagement.addUser.parent.studentsSection.title")}
          icon={Users}
        >
          <DashboardBadge tone="warning" className="absolute top-6 left-6">
            {t("userManagement.addUser.parent.studentsSection.optional")}
          </DashboardBadge>
          <div className="space-y-5 border-t-2 border-[#F6F7F7] pt-5">
            <div className="rounded-[1.75rem]">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative">
                  <input
                    type="search"
                    value={values.studentSearch}
                    onChange={(event) => setField("studentSearch", event.target.value)}
                    placeholder={t("userManagement.addUser.parent.studentsSection.searchPlaceholder")}
                    className="h-14 w-full rounded-2xl border border-[var(--dashboard-border-soft)] bg-white pr-4 pl-12 text-right text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-[var(--dashboard-gold)] focus:ring-2 focus:ring-[var(--dashboard-gold)]/20"
                  />
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
                <Button
                  type="button"
                  className="dashboard-raised-button h-12 rounded-2xl bg-[var(--dashboard-gold)] px-6 text-white hover:bg-[var(--dashboard-gold)]/90"
                  style={{
                    boxShadow: "0px 4px 0px 0px #A38F5A",
                  }}
                  onClick={() => {
                    router.push(ROUTES.ADMIN.USER_MANAGEMENT.ADD.STUDENT);
                  }}
                >
                  {t("userManagement.addUser.parent.studentsSection.addAction")}
                </Button>

              </div>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-2xl border border-[var(--dashboard-border-soft)] bg-[#F8FAFC] p-4"
                  >
                    <div className="flex items-center gap-3 text-right">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${student.avatarClassName}`}
                      >
                        {student.avatarInitials}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-[var(--dashboard-primary)]">{student.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">{student.secondaryLabel}</p>
                          <span className="block h-1 w-1 rounded-full bg-slate-400" />
                          {student.tertiaryLabel ? (
                            <p className="text-xs text-slate-400">{student.tertiaryLabel}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => {
                        setField("selectedStudentIds", [
                          ...values.selectedStudentIds,
                          student.id,
                        ]);
                      }}
                      aria-label={t("userManagement.addUser.parent.studentsSection.addAction")}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            ) : values.studentSearch.trim() && !isSearchingStudents ? (
              <p className="text-sm text-slate-500">
                {t("userManagement.table.empty")}
              </p>
            ) : null}

            <AddUserLinkedEntityList
              title={t("userManagement.addUser.parent.studentsSection.selectedLabel")}
              items={selectedStudents}
              onRemove={(id) =>
                setField(
                  "selectedStudentIds",
                  values.selectedStudentIds.filter((studentId) => studentId !== id),
                )
              }
            />
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>

      {/* <AddUserAnimatedSection delay={0.15}>
        <div className="flex justify-start md:justify-end">
          <AddUserFormActions
            cancelLabel={t("userManagement.addUser.shared.actions.cancelChanges")}
            submitLabel={t("userManagement.addUser.parent.page.bottomSubmit")}
            submitIcon={SaveIcon}
            onCancel={() => router.push(`${ROUTES.ADMIN.HOME}?tab=userManagement`)}
            onSubmit={handleSubmit}
          />
        </div>
      </AddUserAnimatedSection> */}
    </AddUserPageShell>
  );
}
