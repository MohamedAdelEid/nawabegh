"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function AdminCertificateTemplatesPage() {
  const t = useTranslations("admin.dashboard.examsManagement.certificateTemplates");
  const tPage = useTranslations("admin.dashboard.examsManagement");
  const router = useRouter();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tPage("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: tPage("page.title"), href: ROUTES.ADMIN.EXAMS.LIST },
          { label: t("title") },
        ]}
      />

      <Card className="rounded-[1.75rem]">
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <p className="text-lg text-slate-600">{t("placeholder")}</p>
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.ADMIN.EXAMS.LIST)}>
            {t("back")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
