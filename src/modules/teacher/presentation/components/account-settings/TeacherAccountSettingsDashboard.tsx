"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AtSign,
  Briefcase,
  Building2,
  Home,
  Info,
  Lock,
  Mail,
  MapPin,
  Shield,
  Tag,
  UserRound,
} from "lucide-react";
import { AddUserFormSectionCard } from "@/modules/admin/presentation/components/add-user/AddUserFormSectionCard";
import { AddUserInputField } from "@/modules/admin/presentation/components/add-user/AddUserInputField";
import { AddUserPhoneField } from "@/modules/admin/presentation/components/add-user/AddUserPhoneField";
import { AddUserSelectField } from "@/modules/admin/presentation/components/add-user/AddUserSelectField";
import { useTeacherAccountSettings } from "@/modules/teacher/application/hooks/useTeacherAccountSettings";
import type { TeacherAccountFormValues } from "@/modules/teacher/domain/types/teacherAccount.types";
import { getCountriesDropdown } from "@/shared/infrastructure/api/country.api";
import { buildE164FromApiParts, splitPhoneForApi } from "@/shared/domain/utils/phoneCountry.utils";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { TeacherAccountSettingsSkeleton } from "@/modules/teacher/presentation/components/account-settings/TeacherAccountSettingsSkeleton";
import { TeacherAccountProfileSidebar } from "./TeacherAccountProfileSidebar";

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2 text-right">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="min-h-6 text-base font-medium text-[#2b415e]">{value || "—"}</p>
    </div>
  );
}

function formatPhoneDisplay(phoneCountryCode: string, phoneNumber: string): string {
  const code = phoneCountryCode.trim();
  const number = phoneNumber.trim();
  if (!number) return "—";
  return code ? `+${code} ${number}` : number;
}

export function TeacherAccountSettingsDashboard() {
  const t = useTranslations("teacher.dashboard.settingsPage");
  const tCommon = useTranslations("teacher.dashboard");
  const {
    data,
    initialFormValues,
    isLoading,
    isError,
    saveSettings,
    isSaving,
    refetch,
  } = useTeacherAccountSettings();

  const [isEditMode, setIsEditMode] = useState(false);
  const [values, setValues] = useState<TeacherAccountFormValues | null>(null);
  const [countryOptions, setCountryOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (initialFormValues && values === null) {
      setValues(initialFormValues);
    }
  }, [initialFormValues, values]);

  useEffect(() => {
    void getCountriesDropdown().then((countries) => {
      setCountryOptions(
        countries.map((country) => ({
          id: String(country.id),
          label: country.name,
        })),
      );
    });
  }, []);

  const setField = useCallback(
    <K extends keyof TeacherAccountFormValues>(key: K, value: TeacherAccountFormValues[K]) => {
      setValues((current) => (current ? { ...current, [key]: value } : current));
    },
    [],
  );

  const handleCancel = () => {
    if (initialFormValues) {
      setValues(initialFormValues);
    }
    setIsEditMode(false);
    setShowPasswordFields(false);
  };

  const handleSave = async () => {
    if (!values) return;

    try {
      const result = await saveSettings(values);
      setValues(result.formValues);
      setIsEditMode(false);
      setShowPasswordFields(false);
      notify.success(t("messages.saveSuccess"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.saveError"));
    }
  };

  const handleAvatarChange = (file: File, previewUrl: string) => {
    setField("avatarFile", file);
    setField("avatarPreviewUrl", previewUrl);
  };

  const handleStartPasswordChange = () => {
    setIsEditMode(true);
    setShowPasswordFields(true);
  };

  if (isLoading || !values) {
    return <TeacherAccountSettingsSkeleton label={tCommon("common.loading")} />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center">
        <p className="text-sm text-red-600">{tCommon("common.error")}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
          {t("actions.retry")}
        </Button>
      </div>
    );
  }

  const securityHint =
    data.security.passwordRequirementsAr || t("security.defaultHint");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                disabled={isSaving}
                onClick={handleCancel}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-[#243B5A] hover:bg-[#1c3049]"
                disabled={isSaving}
                onClick={() => void handleSave()}
              >
                {isSaving ? t("actions.saving") : t("actions.save")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="rounded-2xl bg-[#243B5A] hover:bg-[#1c3049]"
              onClick={() => setIsEditMode(true)}
            >
              {t("actions.edit")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <TeacherAccountProfileSidebar
          data={data}
          values={values}
          isEditMode={isEditMode}
          onAvatarChange={handleAvatarChange}
        />

        <div className="space-y-6">
          <AddUserFormSectionCard title={t("sections.personal")} icon={UserRound}>
            {isEditMode ? (
              <div className="grid gap-4 md:grid-cols-2">
                <AddUserInputField
                  label={t("fields.fullName")}
                  placeholder={t("placeholders.fullName")}
                  value={values.fullName}
                  icon={Tag}
                  onChange={(event) => setField("fullName", event.target.value)}
                />
                <AddUserInputField
                  label={t("fields.schoolName")}
                  placeholder={t("placeholders.schoolName")}
                  value={values.schoolName}
                  icon={Building2}
                  onChange={(event) => setField("schoolName", event.target.value)}
                />
                <div className="md:col-span-2">
                  <AddUserInputField
                    label={t("fields.jobTitle")}
                    placeholder={t("placeholders.jobTitle")}
                    value={values.jobTitle}
                    icon={Briefcase}
                    onChange={(event) => setField("jobTitle", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <LabeledTextarea
                    label={t("fields.about")}
                    placeholder={t("placeholders.about")}
                    value={values.about}
                    onChange={(value) => setField("about", value)}
                    rows={4}
                    className="text-right"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <ViewField label={t("fields.fullName")} value={values.fullName} />
                <ViewField label={t("fields.schoolName")} value={values.schoolName} />
                <ViewField label={t("fields.jobTitle")} value={values.jobTitle} />
                <div className="md:col-span-2">
                  <ViewField label={t("fields.about")} value={values.about} />
                </div>
              </div>
            )}
          </AddUserFormSectionCard>

          <AddUserFormSectionCard title={t("sections.contact")} icon={AtSign}>
            {isEditMode ? (
              <div className="grid gap-4 md:grid-cols-2">
                <AddUserPhoneField
                  label={t("fields.phoneNumber")}
                  placeholder={t("placeholders.phoneNumber")}
                  value={buildE164FromApiParts(values.phoneNumber, Number(values.phoneCountryCode))}
                  countryId={values.countryId}
                  onChange={(e164) => {
                    const phone = splitPhoneForApi(e164);
                    if (phone) {
                      setField("phoneNumber", phone.phoneNumber);
                      setField("phoneCountryCode", String(phone.phoneCountryCode));
                      return;
                    }
                    setField("phoneNumber", "");
                  }}
                />
                <AddUserInputField
                  label={t("fields.email")}
                  value={data.contactInfo.email}
                  icon={Mail}
                  readOnly
                  disabled
                />
                <AddUserSelectField
                  label={t("fields.country")}
                  value={values.countryId}
                  options={
                    countryOptions.length > 0
                      ? countryOptions
                      : [{ id: values.countryId, label: data.contactInfo.countryNameAr || "—" }]
                  }
                  onChange={(value) => setField("countryId", value)}
                />
                <AddUserInputField
                  label={t("fields.city")}
                  placeholder={t("placeholders.city")}
                  value={values.city}
                  icon={MapPin}
                  onChange={(event) => setField("city", event.target.value)}
                />
                <AddUserInputField
                  label={t("fields.address")}
                  placeholder={t("placeholders.address")}
                  value={values.address}
                  icon={Home}
                  onChange={(event) => setField("address", event.target.value)}
                />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <ViewField
                  label={t("fields.phoneNumber")}
                  value={formatPhoneDisplay(values.phoneCountryCode, values.phoneNumber)}
                />
                <ViewField label={t("fields.email")} value={data.contactInfo.email} />
                <ViewField
                  label={t("fields.countryCity")}
                  value={data.contactInfo.countryCityLabelAr || values.city}
                />
                <ViewField label={t("fields.address")} value={values.address} />
              </div>
            )}
          </AddUserFormSectionCard>

          <AddUserFormSectionCard title={t("sections.security")} icon={Shield}>
            {isEditMode && (showPasswordFields || values.newPassword || values.confirmPassword) ? (
              <div className="grid gap-4 md:grid-cols-2">
                <AddUserInputField
                  label={t("fields.currentPassword")}
                  placeholder={t("placeholders.currentPassword")}
                  type="password"
                  isPasswordField
                  value={values.currentPassword}
                  icon={Lock}
                  onChange={(event) => setField("currentPassword", event.target.value)}
                />
                <div className="hidden md:block" />
                <AddUserInputField
                  label={t("fields.newPassword")}
                  placeholder={t("placeholders.newPassword")}
                  type="password"
                  isPasswordField
                  value={values.newPassword}
                  icon={Lock}
                  onChange={(event) => setField("newPassword", event.target.value)}
                />
                <AddUserInputField
                  label={t("fields.confirmPassword")}
                  placeholder={t("placeholders.confirmPassword")}
                  type="password"
                  isPasswordField
                  value={values.confirmPassword}
                  icon={Lock}
                  onChange={(event) => setField("confirmPassword", event.target.value)}
                />
              </div>
            ) : !isEditMode ? (
              <div className="space-y-4">
                <div className="space-y-2 text-right">
                  <p className="text-sm text-slate-500">{t("fields.password")}</p>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <button
                      type="button"
                      onClick={handleStartPasswordChange}
                      className="text-sm font-semibold text-[#C7AF6E] transition hover:text-[#b89d5c]"
                    >
                      {t("actions.changePassword")}
                    </button>
                    <span className="font-mono tracking-widest text-slate-600">••••••••</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setShowPasswordFields(true)}
                >
                  {t("actions.changePassword")}
                </Button>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 text-right text-sm text-slate-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <p>{securityHint}</p>
            </div>
          </AddUserFormSectionCard>
        </div>
      </div>
    </div>
  );
}
