"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getSubscriptionsData, type SubscriptionRow } from "@/modules/admin/domain/data/pricingBillingData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardBadge, DashboardPageHeader, DashboardPagination, DashboardTableCard,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function AdminPricingSubscriptionsPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [rows, setRows] = useState<SubscriptionRow[]>([]);

  useEffect(() => {
    void getSubscriptionsData().then(setRows);
  }, []);

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("sidebar.nav.pricingManagement"), href: ROUTES.ADMIN.PRICING_MANAGEMENT.LIST },
          { label: t("pricingManagement.subscriptions.page.title") },
        ]} />
        <DashboardPageHeader
        title={t("pricingManagement.subscriptions.page.title")}
        description={t("pricingManagement.subscriptions.page.description")}
      />
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <MiniStat title={t("pricingManagement.subscriptions.stats.total")} value="1,284" tone="blue" />
        <MiniStat title={t("pricingManagement.subscriptions.stats.active")} value="1,102" tone="green" />
        <MiniStat title={t("pricingManagement.subscriptions.stats.review")} value="182" tone="red" />
      </section>

      <DashboardTableCard
        title={t("pricingManagement.subscriptions.table.title")}
        footer={
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{t("pricingManagement.subscriptions.table.summary")}</p>
            <DashboardPagination pages={[1, 2, 3]} currentPage={1} previousLabel="‹" nextLabel="›" onPageChange={() => {}} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-400">
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.parent")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.student")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.plan")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.startDate")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.endDate")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.status")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptions.table.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-700">
                  <td className="px-6 py-5 font-semibold">{row.parentName}</td>
                  <td className="px-6 py-5">{row.studentName}</td>
                  <td className="px-6 py-5">
                    <DashboardBadge tone={row.planTypeId === "gold" ? "warning" : "info"}>
                      {row.planTypeId === "gold"
                        ? t("pricingManagement.subscriptions.table.plan.gold")
                        : t("pricingManagement.subscriptions.table.plan.basic")}
                    </DashboardBadge>
                  </td>
                  <td className="px-6 py-5">{row.startDate}</td>
                  <td className="px-6 py-5">{row.endDate}</td>
                  <td className="px-6 py-5">
                    <DashboardBadge tone={row.active ? "success" : "danger"} withDot>
                      {row.active
                        ? t("pricingManagement.subscriptions.table.status.active")
                        : t("pricingManagement.subscriptions.table.status.inactive")}
                    </DashboardBadge>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
                      onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.SUBSCRIPTIONS.VIEW(row.id))}
                    >
                      <Eye className="h-4 w-4" />
                      {t("pricingManagement.subscriptions.table.actions.view")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardTableCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[2rem] border-0 bg-[#C7AF6E] text-white">
          <CardContent className="space-y-3 p-6 text-right">
            <h3 className="text-3xl font-bold">{t("pricingManagement.subscriptions.cards.supportTitle")}</h3>
            <p className="text-sm text-white/85">{t("pricingManagement.subscriptions.cards.supportBody")}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 bg-[#243B5A] text-white">
          <CardContent className="space-y-3 p-6 text-right">
            <h3 className="text-3xl font-bold">{t("pricingManagement.subscriptions.cards.journeyTitle")}</h3>
            <p className="text-sm text-white/85">{t("pricingManagement.subscriptions.cards.journeyBody")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "blue" | "green" | "red";
}) {
  const barClass = tone === "red" ? "bg-red-400" : tone === "green" ? "bg-[#6BCB1E]" : "bg-[#243B5A]";
  return (
    <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-3 p-5 text-right">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-4xl font-extrabold text-[#1E3A66]">{value}</p>
        <div className={`h-1 w-full rounded-full ${barClass}`} />
      </CardContent>
    </Card>
  );
}
