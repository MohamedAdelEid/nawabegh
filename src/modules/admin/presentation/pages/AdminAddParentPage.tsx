"use client";

import { Search, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  addUserCountryOptions,
  availableStudentOptions,
  defaultParentAccountValues,
} from "@/modules/admin/domain/data/addUserFormData";
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
import { Button } from "@/shared/presentation/components/ui/button";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { SaveIcon } from "../assets/icons/Save";

export function AdminAddParentPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [values, setValues] = useState(defaultParentAccountValues);

  const selectedStudents = availableStudentOptions.filter((student) =>
    values.selectedStudentIds.includes(student.id),
  );

  const searchResults = useMemo(
    () =>
      availableStudentOptions.filter((student) => {
        if (values.selectedStudentIds.includes(student.id)) return false;
        return (
          student.name.includes(values.studentSearch) ||
          student.secondaryLabel.includes(values.studentSearch)
        );
      }),
    [values.selectedStudentIds, values.studentSearch],
  );

  const setField = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
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
      onSubmit={() => {
        console.info("Create parent payload", values);
      }}
    >
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
                options={addUserCountryOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
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

      <AddUserAnimatedSection delay={0.15}>
        <div className="flex justify-start md:justify-end">
          <AddUserFormActions
            cancelLabel={t("userManagement.addUser.shared.actions.cancelChanges")}
            submitLabel={t("userManagement.addUser.parent.page.bottomSubmit")}
            submitIcon={SaveIcon}
            onCancel={() => router.push(`${ROUTES.ADMIN.HOME}?tab=userManagement`)}
            onSubmit={() => {
              console.info("Save parent payload", values);
            }}
          />
        </div>
      </AddUserAnimatedSection>
    </AddUserPageShell>
  );
}
