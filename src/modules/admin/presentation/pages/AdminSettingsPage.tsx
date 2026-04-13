"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/components/ui/card";

export function AdminSettingsPage() {
  const t = useTranslations("admin.dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settingsPage.title")}</CardTitle>
        <CardDescription>{t("settingsPage.description")}</CardDescription>
      </CardHeader>
    </Card>
  );
}
