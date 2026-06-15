"use client";

import { useTranslations } from "next-intl";
import { useTeacherProfile } from "@/modules/teacher/application/hooks/useTeacherProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function TeacherSettingsPage() {
  const t = useTranslations("teacher.dashboard");
  const { user, mockPassword, isProfileLoading } = useTeacherProfile();

  if (isProfileLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <Card className="rounded-[2rem]">
      <CardHeader className="text-right">
        <CardTitle>{t("settingsPage.title")}</CardTitle>
        <CardDescription>{t("settingsPage.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("settingsPage.mockNotice")}
        </p>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-slate-500">{t("settingsPage.fields.name")}</dt>
            <dd className="mt-1 font-semibold text-slate-800">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t("settingsPage.fields.email")}</dt>
            <dd className="mt-1 font-semibold text-slate-800">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">{t("settingsPage.fields.password")}</dt>
            <dd className="mt-1 font-mono font-semibold text-slate-800">{mockPassword}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
