"use client";

import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  addUserCountryOptions,
  addUserSchoolYearOptions,
  addUserStageOptions,
  addUserSubscriptionOptions,
  availableParentOptions,
  defaultStudentAccountValues,
} from "@/modules/admin/domain/data/addUserFormData";
import type { AddUserStageId } from "@/modules/admin/domain/types/addUser.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  AddUserAnimatedSection,
  AddUserFormSectionCard,
  AddUserInputField,
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

export function AdminAddStudentPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [values, setValues] = useState(defaultStudentAccountValues);

  const parentResults = useMemo(
    () =>
      availableParentOptions.filter((parent) =>
        parent.name.includes(values.parentSearch) ||
        parent.secondaryLabel.includes(values.parentSearch),
      ),
    [values.parentSearch],
  );

  const setField = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <AddUserPageShell
      title={t("userManagement.addUser.student.page.title")}
      description={t("userManagement.addUser.student.page.description")}
      breadcrumbs={[
        { label: t("tabs.home.title") },
        { label: t("userManagement.page.title") },
        { label: t("userManagement.addUser.student.page.title") },
      ]}
      cancelLabel={t("userManagement.addUser.shared.actions.cancel")}
      submitLabel={t("userManagement.addUser.student.page.submit")}
      onSubmit={() => {
        console.info("Create student payload", values);
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
              <AddUserSelectField
                label={t("userManagement.addUser.shared.fields.country")}
                value={values.countryId}
                options={addUserCountryOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
                onChange={(value) => setField("countryId", value)}
              />
              <AddUserSelectField
                label={t("userManagement.addUser.student.fields.educationalStage")}
                value={values.educationalStageId}
                options={addUserStageOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
                onChange={(value) => setField("educationalStageId", value as AddUserStageId)}
              />
              <AddUserSelectField
                label={t("userManagement.addUser.student.fields.schoolYear")}
                value={values.schoolYearId}
                options={addUserSchoolYearOptions.map((option) => ({
                  id: option.id,
                  label: t(option.labelKey),
                }))}
                onChange={(value) => setField("schoolYearId", value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.shared.fields.phoneNumber")}
                placeholder={t("userManagement.addUser.shared.placeholders.phoneNumber")}
                value={values.phoneNumber}
                onChange={(event) => setField("phoneNumber", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.student.fields.schoolName")}
                placeholder={t("userManagement.addUser.student.placeholders.schoolName")}
                value={values.schoolName}
                onChange={(event) => setField("schoolName", event.target.value)}
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
          {/* <span className="text-sm text-slate-500">
            {t("userManagement.addUser.student.parentSection.toggle")}
          </span> */}
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
              <AddUserInputField
                label={t("userManagement.addUser.student.subscriptionSection.startDate")}
                icon={CalenderIcon}
                value={values.subscriptionStartDate}
                onChange={(event) => setField("subscriptionStartDate", event.target.value)}
              />
              <AddUserInputField
                label={t("userManagement.addUser.student.subscriptionSection.endDate")}
                value={values.subscriptionEndDate}
                icon={ExpireCalender}
                onChange={(event) => setField("subscriptionEndDate", event.target.value)}
              />
            </div>
          </div>
        </AddUserFormSectionCard>
      </AddUserAnimatedSection>
    </AddUserPageShell>
  );
}
