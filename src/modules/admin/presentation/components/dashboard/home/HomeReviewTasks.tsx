"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import { formatNumber } from "@/shared/application/lib/format";
import { iconToneTextClassNameMap, type IconTone } from "@/shared/domain/types/common.types";
import { localeToIntl } from "@/modules/admin/presentation/components/dashboard/home/homeFormat";
import {
  getReviewTaskRoute,
  getReviewTaskTone,
} from "@/modules/admin/presentation/components/dashboard/home/homeDashboardConfig";
import type { AdminHomeReviewTasks } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeReviewTasksProps = {
  reviewTasks: AdminHomeReviewTasks;
};

const TONE_BORDER: Record<IconTone, string> = {
  neutral: "border-r-slate-300",
  primary: "border-r-[#2C4260]",
  success: "border-r-emerald-500",
  warning: "border-r-amber-500",
  info: "border-r-sky-500",
  gold: "border-r-[#8F6C0B]",
  danger: "border-r-red-500",
};

export function HomeReviewTasks({ reviewTasks }: HomeReviewTasksProps) {
  const t = useTranslations("admin.dashboard.home.reviewTasks");
  const locale = useLocale();
  const intlLocale = localeToIntl(locale);
  const router = useRouter();

  return (
    <section className="space-y-4">
      <h2 className="text-right text-xl font-bold text-slate-800">{t("title")}</h2>

      {reviewTasks.items.length === 0 ? (
        <p className="text-right text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviewTasks.items.map((item, index) => {
            const tone = getReviewTaskTone(index);
            return (
              <Card
                key={item.key}
                className={cn(
                  "rounded-[1.5rem] border-white/80 border-r-4 bg-white shadow-[var(--dashboard-shadow-soft)]",
                  TONE_BORDER[tone],
                )}
              >
                <CardContent className="space-y-4 p-5 text-right">
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn("text-3xl font-bold", iconToneTextClassNameMap[tone])}>
                      {formatNumber(item.count, intlLocale)}
                    </span>
                    <p className="flex-1 font-semibold text-slate-700">{item.label}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 text-slate-700"
                    onClick={() => router.push(getReviewTaskRoute(item.key))}
                  >
                    {t("reviewDetails")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
