"use client";

import { useLocale, useTranslations } from "next-intl";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard";
import { formatCompactNumber } from "@/shared/application/lib/format";
import { localeToIntl } from "@/modules/admin/presentation/components/dashboard/home/homeFormat";
import { getSummaryCardVisual } from "@/modules/admin/presentation/components/dashboard/home/homeDashboardConfig";
import type { AdminHomeSummaryCard } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeSummaryCardsProps = {
  cards: AdminHomeSummaryCard[];
};

function formatChange(value: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
  return `${formatted}%`;
}

export function HomeSummaryCards({ cards }: HomeSummaryCardsProps) {
  const t = useTranslations("admin.dashboard.home");
  const locale = useLocale();
  const intlLocale = localeToIntl(locale);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const { icon, tone } = getSummaryCardVisual(card.key);
        const label = t.has(`summaryCards.${card.key}`)
          ? t(`summaryCards.${card.key}`)
          : card.key;
        const isPositive = card.changePercent >= 0;

        return (
          <DashboardStatCard
            key={card.key}
            label={label}
            value={formatCompactNumber(card.count, intlLocale)}
            indicator={formatChange(card.changePercent, intlLocale)}
            indicatorClassName={isPositive ? "text-emerald-600" : "text-red-500"}
            icon={icon}
            iconTone={tone}
          />
        );
      })}
    </section>
  );
}
