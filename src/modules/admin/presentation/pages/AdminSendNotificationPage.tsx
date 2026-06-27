"use client";

import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";

export function AdminSendNotificationPage() {
  const t = useTranslations("admin.dashboard");
  return (
    <div className="space-y-6">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("sendNotification.title") },
        ]} />
        <DashboardPageHeader
        title={t("sendNotification.title")}
        description={t("sendNotification.description")}
      />
      </div>
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card><CardContent className="h-[42rem] p-4"><div className="h-full rounded-3xl bg-slate-100" /></CardContent></Card>
        <Card><CardContent className="space-y-4 p-6 text-right"><h3 className="text-2xl font-bold text-[#1E3A66]">{t("sendNotification.formTitle")}</h3><div className="h-[36rem] rounded-xl bg-slate-50" /><Button className="w-full">{t("sendNotification.sendNow")}</Button></CardContent></Card>
      </div>
    </div>
  );
}
