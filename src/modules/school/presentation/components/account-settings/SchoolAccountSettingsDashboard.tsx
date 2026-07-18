"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  Building2,
  Lock,
  Mail,
  MapPin,
  Phone,
  UserCog,
} from "lucide-react";
import { AddUserFormSectionCard } from "@/modules/admin/presentation/components/add-user/AddUserFormSectionCard";
import { AddUserInputField } from "@/modules/admin/presentation/components/add-user/AddUserInputField";
import { AddUserSelectField } from "@/modules/admin/presentation/components/add-user/AddUserSelectField";
import { useSchoolAccountSettings } from "@/modules/school/application/hooks/useSchoolAccountSettings";
import type {
  SchoolAccountFormValues,
  SchoolAccountNotifications,
} from "@/modules/school/domain/types/schoolAccount.types";
import { SchoolAccountMediaHeader } from "@/modules/school/presentation/components/account-settings/SchoolAccountMediaHeader";
import { SchoolAccountSecurityCard } from "@/modules/school/presentation/components/account-settings/SchoolAccountSecurityCard";
import { SchoolAccountSettingsSkeleton } from "@/modules/school/presentation/components/account-settings/SchoolAccountSettingsSkeleton";
import { getCountriesDropdown } from "@/shared/infrastructure/api/country.api";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

type NotificationKey = keyof SchoolAccountNotifications;

const NOTIFICATION_ITEMS: Array<{ key: NotificationKey; labelKey: string }> = [
  { key: "enableAlerts", labelKey: "notifications.enableAlerts" },
  { key: "enableEmailNotifications", labelKey: "notifications.enableEmail" },
  { key: "enableSmsNotifications", labelKey: "notifications.enableSms" },
  {
    key: "enableSubscriptionRenewalAlerts",
    labelKey: "notifications.enableSubscriptionRenewal",
  },
];

export function SchoolAccountSettingsDashboard() {
  const t = useTranslations("school.dashboard.settingsPage");
  const tCommon = useTranslations("school.dashboard");
  const {
    data,
    initialFormValues,
    isLoading,
    isError,
    saveSettings,
    saveNotifications,
    removeSession,
    revokeAllSessions,
    isSaving,
    isUpdatingNotifications,
    isRemovingSession,
    isRevokingAll,
    removingSessionId,
    refetch,
  } = useSchoolAccountSettings();

  const [values, setValues] = useState<SchoolAccountFormValues | null>(null);
  const [countryOptions, setCountryOptions] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    if (initialFormValues) {
      setValues(initialFormValues);
    }
  }, [initialFormValues]);

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
    <K extends keyof SchoolAccountFormValues>(key: K, value: SchoolAccountFormValues[K]) => {
      setValues((current) => (current ? { ...current, [key]: value } : current));
    },
    [],
  );

  const handleSave = async () => {
    if (!values) return;

    if (
      values.currentPassword.trim() ||
      values.newPassword.trim() ||
      values.confirmPassword.trim()
    ) {
      if (!values.currentPassword.trim() || !values.newPassword.trim()) {
        notify.error(t("validation.passwordRequired"));
        return;
      }
      if (values.newPassword.length < (data?.account.minimumPasswordLength ?? 8)) {
        notify.error(
          t("validation.passwordMinLength", {
            min: data?.account.minimumPasswordLength ?? 8,
          }),
        );
        return;
      }
      if (values.newPassword !== values.confirmPassword) {
        notify.error(t("validation.passwordMismatch"));
        return;
      }
    }

    try {
      const result = await saveSettings(values);
      setValues(result.formValues);
      notify.success(t("messages.saveSuccess"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.saveError"));
    }
  };

  const handleNotificationToggle = async (key: NotificationKey, checked: boolean) => {
    if (!data) return;
    const payload = { ...data.notifications, [key]: checked };
    try {
      await saveNotifications(payload);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : t("messages.notificationsError"),
      );
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    try {
      await removeSession(sessionId);
      notify.success(t("messages.sessionRemoved"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.sessionRemoveError"));
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions();
      notify.success(t("messages.sessionsRevoked"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.sessionsRevokeError"));
    }
  };

  if (isLoading || !values) {
    return <SchoolAccountSettingsSkeleton label={tCommon("common.loading")} />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-[var(--dashboard-shadow-soft)]">
        <p className="text-sm text-red-600">{tCommon("common.error")}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
          {t("actions.retry")}
        </Button>
      </div>
    );
  }

  const passwordHint =
    data.account.passwordRequirements ||
    t("security.defaultHint", { min: data.account.minimumPasswordLength });

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h1>
          <p className="text-sm text-slate-500">{t("description")}</p>
          <p className="text-xs font-medium text-[#C7AF6E]">
            {t("profile.completion", {
              value: Math.round(data.summary.profileCompletionPercent),
            })}
          </p>
        </div>
        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="h-12 rounded-2xl bg-[#243B5A] px-6 text-white hover:bg-[#1c3049]"
        >
          {isSaving ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>

      <Card
        className="overflow-visible rounded-[2rem] border-white/80 bg-white"
        style={{ boxShadow: "var(--dashboard-shadow-soft)" }}
      >
        <SchoolAccountMediaHeader
          schoolName={values.name}
          logoUrl={values.logoUrl}
          coverImageUrl={values.coverImageUrl}
          logoPreviewUrl={values.logoPreviewUrl}
          coverPreviewUrl={values.coverPreviewUrl}
          onLogoChange={(file, previewUrl) => {
            setField("logoFile", file);
            setField("logoPreviewUrl", previewUrl);
          }}
          onCoverChange={(file, previewUrl) => {
            setField("coverFile", file);
            setField("coverPreviewUrl", previewUrl);
          }}
        />
        <CardContent className="space-y-6 p-6 pt-16 sm:p-8 sm:pt-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dashboard-warning-soft)] text-[var(--dashboard-gold-foreground)]">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-[var(--dashboard-primary)]">
              {t("sections.schoolData")}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AddUserInputField
              label={t("fields.schoolName")}
              placeholder={t("placeholders.schoolName")}
              value={values.name}
              icon={Building2}
              onChange={(event) => setField("name", event.target.value)}
            />
            <AddUserInputField
              label={t("fields.city")}
              placeholder={t("placeholders.city")}
              value={values.city}
              icon={MapPin}
              onChange={(event) => setField("city", event.target.value)}
            />
          </div>

          <LabeledTextarea
            label={t("fields.description")}
            placeholder={t("placeholders.description")}
            value={values.description}
            onChange={(value) => setField("description", value)}
            rows={4}
            className="text-right"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <AddUserSelectField
              label={t("fields.country")}
              value={values.countryId}
              options={
                countryOptions.length > 0
                  ? [{ id: "", label: t("placeholders.country") }, ...countryOptions]
                  : [
                      {
                        id: values.countryId,
                        label: data.schoolData.countryName || t("placeholders.country"),
                      },
                    ]
              }
              onChange={(value) => setField("countryId", value)}
            />
            <AddUserInputField
              label={t("fields.phoneNumber")}
              placeholder={t("placeholders.phoneNumber")}
              value={values.phoneNumber}
              icon={Phone}
              onChange={(event) => setField("phoneNumber", event.target.value)}
            />
          </div>

          <AddUserInputField
            label={t("fields.address")}
            placeholder={t("placeholders.address")}
            value={values.address}
            icon={MapPin}
            onChange={(event) => setField("address", event.target.value)}
          />

          {data.schoolData.educationLevelsLabel ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
              <span className="font-semibold text-slate-700">{t("fields.educationLevels")}: </span>
              {data.schoolData.educationLevelsLabel}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <AddUserFormSectionCard title={t("sections.account")} icon={UserCog}>
          <AddUserInputField
            label={t("fields.organizationEmail")}
            value={data.account.organizationEmail}
            icon={Mail}
            readOnly
            disabled
          />

          {data.account.canChangePassword ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#2b415e]">{t("sections.changePassword")}</h3>
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
                <AddUserInputField
                  label={t("fields.newPassword")}
                  placeholder={t("placeholders.newPassword")}
                  type="password"
                  isPasswordField
                  value={values.newPassword}
                  icon={Lock}
                  onChange={(event) => setField("newPassword", event.target.value)}
                />
                <div className="md:col-span-2">
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
              </div>
              <p className="text-xs leading-6 text-slate-500">{passwordHint}</p>
            </div>
          ) : null}
        </AddUserFormSectionCard>

        <AddUserFormSectionCard title={t("sections.notifications")} icon={Bell}>
          <div className="space-y-4">
            {NOTIFICATION_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-3 py-3 transition hover:bg-slate-50"
              >
                <StatusSwitch
                  checked={data.notifications[item.key]}
                  onChange={(checked) => void handleNotificationToggle(item.key, checked)}
                  activeLabel={t("notifications.on")}
                  inactiveLabel={t("notifications.off")}
                  disabled={isUpdatingNotifications}
                  activeClassName="bg-emerald-500"
                  inactiveClassName="bg-slate-300"
                />
                <span className="text-sm font-medium text-[#2b415e]">{t(item.labelKey)}</span>
              </div>
            ))}
          </div>
        </AddUserFormSectionCard>
      </div>

      <SchoolAccountSecurityCard
        sessions={data.sessions}
        canRevokeAllSessions={data.security.canRevokeAllSessions}
        canRemoveSessions={data.security.canRemoveSessions}
        isRevokingAll={isRevokingAll}
        removingSessionId={isRemovingSession ? removingSessionId : undefined}
        onRevokeAll={() => void handleRevokeAll()}
        onRemoveSession={(sessionId) => void handleRemoveSession(sessionId)}
      />
    </div>
  );
}
