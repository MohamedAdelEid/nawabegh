"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";
import { formatNumber } from "@/shared/application/lib/format";
import { iconToneClassNameMap } from "@/shared/domain/types/common.types";
import { localeToIntl } from "@/modules/admin/presentation/components/dashboard/home/homeFormat";
import { ACTIVITY_METRICS } from "@/modules/admin/presentation/components/dashboard/home/homeDashboardConfig";
import type { AdminHomeActivityMetrics } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeActivityMetricsProps = {
  metrics: AdminHomeActivityMetrics;
};

export function HomeActivityMetrics({ metrics }: HomeActivityMetricsProps) {
  const t = useTranslations("admin.dashboard.home.activityMetrics");
  const locale = useLocale();
  const intlLocale = localeToIntl(locale);

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {ACTIVITY_METRICS.map(({ key, unitKey, icon: Icon, tone }) => (
        <Card
          key={key}
          className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]"
        >
          <CardContent className="flex items-center justify-between gap-3 p-5 text-right">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{t(key)}</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatNumber(metrics[key], intlLocale)}{" "}
                <span className="text-sm font-normal text-slate-400">{t(`units.${unitKey}`)}</span>
              </p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                iconToneClassNameMap[tone],
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
