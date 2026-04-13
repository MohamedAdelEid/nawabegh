"use client";

import { BookOpenCheck, EyeIcon, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  addUserCountryOptions,
  addUserGradeLevelOptions,
  addUserPermissionOptions,
  addUserSubjectOptions,
  defaultTeacherAccountValues,
} from "@/modules/admin/domain/data/addUserFormData";
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

export function AdminAddTeacherPage() {
  const t = useTranslations("admin.dashboard");
  const [values, setValues] = useState(defaultTeacherAccountValues);

  const setField = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

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
      onSubmit={() => {
        console.info("Create teacher payload", values);
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
                options={addUserCountryOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
                onChange={(value) => setField("countryId", value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.teacher.fields.jobTitle")}
                placeholder={t("userManagement.addUser.teacher.placeholders.jobTitle")}
                value={values.jobTitle}
                onChange={(event) => setField("jobTitle", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.teacher.fields.schoolName")}
                placeholder={t("userManagement.addUser.teacher.placeholders.schoolName")}
                value={values.schoolName}
                onChange={(event) => setField("schoolName", event.target.value)}
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
              <AddUserOptionGrid
                options={addUserGradeLevelOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
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
