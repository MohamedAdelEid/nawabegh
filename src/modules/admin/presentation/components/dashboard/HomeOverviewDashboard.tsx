"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader, DashboardStatCard, DashboardTableCard, DashboardBadge, DashboardDataTable, type DashboardDataTableColumn } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Award, BookOpen, FileText, Users } from "lucide-react";

export function HomeOverviewDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const rows = [
    { id: "1", testName: "تقييم التفاضل المتقدم", subject: "الرياضيات", active: true, participants: "428" },
    { id: "2", testName: "الأدب الجاهلي - نهائي", subject: "اللغة العربية", active: false, participants: "0" },
    { id: "3", testName: "تقييم التفاضل المتقدم", subject: "الرياضيات", active: true, participants: "428" },
  ];
  const columns: Array<DashboardDataTableColumn<(typeof rows)[number]>> = [
    {
      id: "testName",
      header: t("homeOverview.latestTests.columns.testName"),
      cellClassName: "font-semibold text-[#1E3A66]",
      renderCell: (row) => row.testName,
    },
    {
      id: "subject",
      header: t("homeOverview.latestTests.columns.subject"),
      renderCell: (row) => row.subject,
    },
    {
      id: "status",
      header: t("homeOverview.latestTests.columns.status"),
      renderCell: (row) => (
        <DashboardBadge tone={row.active ? "success" : "info"} withDot>
          {row.active ? "نشط" : "مؤرشف"}
        </DashboardBadge>
      ),
    },
    {
      id: "participants",
      header: t("homeOverview.latestTests.columns.participants"),
      renderCell: (row) => row.participants,
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("homeOverview.title")}
        description={t("homeOverview.description")}
        breadcrumbs={[{ label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(ROUTES.ADMIN.OVERVIEW_INSIGHTS.LIST)}>
              {t("homeOverview.actions.openOverview")}
            </Button>
            <Button onClick={() => router.push(ROUTES.ADMIN.SEND_NOTIFICATION.LIST)}>
              {t("homeOverview.actions.sendNotification")}
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label={t("homeOverview.stats.totalTests")} value="1,284" indicator="+12%" icon={FileText} iconTone="info" />
        <DashboardStatCard label={t("homeOverview.stats.questionBank")} value="42,500" indicator="نمو" icon={BookOpen} iconTone="warning" />
        <DashboardStatCard label={t("homeOverview.stats.activeStudents")} value="8,932" indicator="+5.2%" icon={Users} iconTone="success" />
        <DashboardStatCard label={t("homeOverview.stats.issuedCertificates")} value="7,421" indicator="+21%" icon={Award} iconTone="primary" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="rounded-[1.5rem]">
          <CardContent className="space-y-4 p-5 text-right">
            <h3 className="text-xl font-bold text-[#1E3A66]">{t("homeOverview.successRate.title")}</h3>
            <p className="text-5xl font-extrabold text-[#1E3A66]">78%</p>
            <p className="text-sm text-slate-500">{t("homeOverview.successRate.subtitle")}</p>
          </CardContent>
        </Card>

        <DashboardTableCard title={t("homeOverview.latestTests.title")}>
          <DashboardDataTable
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage="—"
          />
        </DashboardTableCard>
      </div>
    </div>
  );
}
