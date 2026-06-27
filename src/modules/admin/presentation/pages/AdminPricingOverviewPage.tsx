"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import {DashboardPageHeader, DashboardBadge,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const REVENUE_BARS = [90, 72, 58, 77, 69, 50, 56, 43];

export function AdminPricingOverviewPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const manageSubscriptionsLabel = t.has("pricingManagement.overview.manageSubscriptions")
    ? t("pricingManagement.overview.manageSubscriptions")
    : t("pricingManagement.overview.managePlans");
  const manageTransactionsLabel = t.has("pricingManagement.overview.manageTransactions")
    ? t("pricingManagement.overview.manageTransactions")
    : t("pricingManagement.overview.transactionsTitle");

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("sidebar.nav.pricingManagement") },
        ]} />
        <DashboardPageHeader
        title={t("pricingManagement.overview.title")}
        description={t("pricingManagement.overview.description")}
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-2xl border-slate-200 px-5 text-base font-semibold text-slate-700"
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.SUBSCRIPTIONS.LIST)}
            >
              {manageSubscriptionsLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-2xl border-slate-200 px-5 text-base font-semibold text-slate-700"
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.TRANSACTIONS)}
            >
              {manageTransactionsLabel}
            </Button>
            <Button
              type="button"
              className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
              style={{ boxShadow: "var(--dashboard-shadow-button)" }}
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.LIST)}
            >
              {t("pricingManagement.overview.managePlans")}
            </Button>
          </div>
        }
      />
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("pricingManagement.overview.cards.totalRevenue")} value="45,280 ريال" badge="+12%" />
        <StatCard title={t("pricingManagement.overview.cards.activeSubscriptions")} value="1,240" badge="+5.4%" />
        <StatCard title={t("pricingManagement.overview.cards.failedPayments")} value="12" badge="-2%" tone="danger" />
        <StatCard title={t("pricingManagement.overview.cards.pendingTasks")} value="28" badge={t("pricingManagement.overview.pending")} tone="warning" />
      </section>

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <CardContent className="space-y-6 p-6 text-right">
          <h3 className="text-3xl font-bold text-[#1E3A66]">{t("pricingManagement.overview.revenueTitle")}</h3>
          <div className="flex h-72 items-end gap-3 rounded-xl bg-slate-50 p-4">
            {REVENUE_BARS.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className={index === 0 ? "flex-1 rounded-t-md bg-[#243B5A]" : "flex-1 rounded-t-md bg-slate-200"}
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-6 text-right">
            <h3 className="text-2xl font-bold text-[#1E3A66]">{t("pricingManagement.overview.transactionsTitle")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">{t("pricingManagement.overview.table.user")}</th>
                  <th className="px-6 py-4 font-medium">{t("pricingManagement.overview.table.student")}</th>
                  <th className="px-6 py-4 font-medium">{t("pricingManagement.overview.table.amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("pricingManagement.overview.table.status")}</th>
                  <th className="px-6 py-4 font-medium">{t("pricingManagement.overview.table.date")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["أحمد علي", "سارة أحمد", "450 ريال", "success", "24 أكتوبر 2024"],
                  ["مي محمد", "ياسر محمد", "450 ريال", "failed", "23 أكتوبر 2024"],
                  ["خالد سعيد", "عمر خالد", "450 ريال", "success", "22 أكتوبر 2024"],
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 text-sm text-slate-700">
                    <td className="px-6 py-5 font-semibold">{row[0]}</td>
                    <td className="px-6 py-5">{row[1]}</td>
                    <td className="px-6 py-5 font-bold text-[#1E3A66]">{row[2]}</td>
                    <td className="px-6 py-5">
                      <DashboardBadge tone={row[3] === "success" ? "success" : "danger"}>
                        {row[3] === "success"
                          ? t("pricingManagement.overview.table.success")
                          : t("pricingManagement.overview.table.failed")}
                      </DashboardBadge>
                    </td>
                    <td className="px-6 py-5 text-slate-500">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  badge,
  tone = "success",
}: {
  title: string;
  value: string;
  badge: string;
  tone?: "success" | "danger" | "warning";
}) {
  const toneClass = tone === "danger" ? "text-red-500 bg-red-50" : tone === "warning" ? "text-amber-700 bg-amber-50" : "text-emerald-600 bg-emerald-50";
  return (
    <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-2 p-5 text-right">
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneClass}`}>{badge}</span>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-4xl font-extrabold text-[#1E3A66]">{value}</p>
      </CardContent>
    </Card>
  );
}
