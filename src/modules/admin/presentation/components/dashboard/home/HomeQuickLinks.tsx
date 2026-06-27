"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/application/lib/cn";
import { iconToneClassNameMap } from "@/shared/domain/types/common.types";
import { QUICK_LINKS } from "@/modules/admin/presentation/components/dashboard/home/homeDashboardConfig";

export function HomeQuickLinks() {
  const t = useTranslations("admin.dashboard.home.quickLinks");
  const router = useRouter();

  return (
    <section className="space-y-4">
      <h2 className="text-right text-xl font-bold text-slate-800">{t("title")}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_LINKS.map(({ id, href, icon: Icon, tone }) => (
          <button
            key={id}
            type="button"
            onClick={() => router.push(href)}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/80 bg-white p-5 text-center shadow-[var(--dashboard-shadow-soft)] transition-colors hover:border-[#2C4260]/20 hover:bg-slate-50"
          >
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                iconToneClassNameMap[tone],
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-medium text-slate-600">{t(id)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
