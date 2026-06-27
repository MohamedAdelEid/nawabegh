"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { formatNumber } from "@/shared/application/lib/format";
import { localeToIntl } from "@/modules/admin/presentation/components/dashboard/home/homeFormat";
import type { AdminHomeRevenue } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeRevenuePanelProps = {
  revenue: AdminHomeRevenue;
};

export function HomeRevenuePanel({ revenue }: HomeRevenuePanelProps) {
  const t = useTranslations("admin.dashboard.home.revenue");
  const locale = useLocale();
  const intlLocale = localeToIntl(locale);
  const goalPercent = Math.max(0, Math.min(100, revenue.monthlyGoalPercent));

  return (
    <Card className="h-full rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-6 text-right">
        <h2 className="text-xl font-bold text-slate-800">{t("title")}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{t("totalSubscriptions")}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {formatNumber(revenue.activeSubscriptions, intlLocale)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              {t("totalRevenue", { currency: revenue.currency })}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {formatNumber(revenue.totalRevenue, intlLocale)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-emerald-600">{goalPercent}%</span>
            <span className="text-slate-500">{t("monthlyGoal")}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{t("monthlyGoalNote", { percent: goalPercent })}</p>
        </div>
      </CardContent>
    </Card>
  );
}
