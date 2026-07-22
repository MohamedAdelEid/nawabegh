"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Lock, ShieldCheck, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentChildDetails } from "@/modules/parent/application/hooks/useParentChildDetails";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 text-start">
      <label className="text-xs font-bold text-[#64748b]">{label}</label>
      <input
        type="text"
        value={value}
        disabled
        readOnly
        className="h-12 w-full rounded-xl border-2 border-[#e2e8f0] bg-[#f8f9fa] px-4 text-sm font-medium text-[#64748b] disabled:cursor-not-allowed"
      />
    </div>
  );
}

type NotificationKey = "emailAlerts" | "smsAlerts" | "appAlerts";

export function ParentChildSettingsDashboard({ studentUserId }: { studentUserId: string }) {
  const t = useTranslations("parent.dashboard.childrenManagement.settings");
  const tCommon = useTranslations("parent.dashboard.common");
  const router = useRouter();
  const { data: details, isLoading, isError, refetch, isFetching } =
    useParentChildDetails(studentUserId);

  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    emailAlerts: true,
    smsAlerts: false,
    appAlerts: true,
  });

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-8">
        <Skeleton className="h-16 w-96" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-[20px] lg:col-span-8" />
          <Skeleton className="h-96 rounded-[20px] lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (isError || !details) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const notificationRows: Array<{ key: NotificationKey; label: string }> = [
    { key: "emailAlerts", label: t("emailAlerts") },
    { key: "smsAlerts", label: t("smsAlerts") },
    { key: "appAlerts", label: t("appAlerts") },
  ];

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="space-y-1 text-start">
        <p className="text-xs text-[#64748b]">{t("breadcrumb")}</p>
        <h1 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h1>
        <p className="text-sm text-[#64748b]">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-6 flex items-center gap-2">
              <User className="size-4 text-[#2b415e]" aria-hidden />
              <h2 className="text-sm font-bold text-[#2b415e]">{t("personalInfo")}</h2>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <ParentAvatar
                url={details.profileImageUrl}
                name={details.fullName}
                className="size-16"
                roundedClassName="rounded-full"
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-xl border-[#e2e8f0] text-xs font-bold text-[#2b415e]"
                onClick={() => notify.info(t("comingSoon"))}
              >
                <Camera className="size-3.5" aria-hidden />
                {t("changePhoto")}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label={t("fullName")} value={details.fullName} />
              <ReadOnlyField label={t("email")} value={details.email || "—"} />
              <ReadOnlyField label={t("phone")} value={details.phoneNumber || "—"} />
              <ReadOnlyField label={t("address")} value={details.address || "—"} />
            </div>
          </article>

          <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-6 flex items-center gap-2">
              <Lock className="size-4 text-[#2b415e]" aria-hidden />
              <h2 className="text-sm font-bold text-[#2b415e]">{t("security")}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label={t("currentPassword")} value="••••••••" />
              <ReadOnlyField label={t("newPassword")} value="" />
            </div>
          </article>
        </div>

        <div className="lg:col-span-4">
          <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#2b415e]" aria-hidden />
              <h2 className="text-sm font-bold text-[#2b415e]">{t("notifications")}</h2>
            </div>
            <p className="mb-5 text-xs text-[#94a3b8]">{t("notificationsHint")}</p>
            <ul className="space-y-4">
              {notificationRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#0f172a]">{row.label}</span>
                  <ToggleSwitch
                    checked={notifications[row.key]}
                    ariaLabel={row.label}
                    onCheckedChange={(checked) =>
                      setNotifications((previous) => ({ ...previous, [row.key]: checked }))
                    }
                  />
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          className="h-12 rounded-xl bg-[#2b415e] px-6 text-sm font-bold text-white hover:bg-[#24384f]"
          onClick={() => notify.info(t("comingSoon"))}
        >
          {t("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl border-[#e2e8f0] px-6 text-sm font-bold text-[#2b415e]"
          onClick={() => router.push(ROUTES.USER.PARENT.CHILD_DETAILS(studentUserId))}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
