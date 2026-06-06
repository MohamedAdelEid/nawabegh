"use client";

import { useState } from "react";
import {
  Eye,
  MousePointerClick,
  Pause,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AdAnalytics, AdDetail } from "@/modules/admin/domain/types/adManagement.types";
import { AdCreateLivePreview } from "@/modules/admin/presentation/components/ad-management/AdCreateLivePreview";
import { DEFAULT_AD_CREATE_WIZARD_VALUES } from "@/modules/admin/domain/types/adCreateWizard.types";
import {
  DashboardBadge,
  DashboardSegmentedControl,
  DashboardStatCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type AdDetailViewProps = {
  detail: AdDetail;
  analytics?: AdAnalytics | null;
  onPause: () => void;
  onDelete: () => void;
  isPausing?: boolean;
  isDeleting?: boolean;
};

export function AdDetailView({
  detail,
  analytics,
  onPause,
  onDelete,
  isPausing,
  isDeleting,
}: AdDetailViewProps) {
  const t = useTranslations("admin.dashboard.adManagement.detail");
  const router = useRouter();
  const [viewport, setViewport] = useState<"desktop" | "mobile" | "tablet">("desktop");

  const previewValues = {
    ...DEFAULT_AD_CREATE_WIZARD_VALUES,
    title: detail.title,
    description: detail.description,
    ctaText: detail.ctaText,
    ctaUrl: detail.ctaUrl,
    mediaUrl: detail.mediaUrl,
    type: detail.type,
    audience: detail.audiences[0] ?? "all",
  };

  const metrics = analytics ?? {
    impressions: detail.views,
    clicks: detail.clicks,
    ctrPercentage: detail.ctr,
    uniqueUsers: 0,
    daily: [],
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 text-right">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800">{detail.title}</h1>
            <DashboardBadge tone="success" withDot>
              {t(`statuses.${detail.status}`)}
            </DashboardBadge>
          </div>
          <p className="text-sm text-slate-500">
            {t("meta", {
              date: detail.createdAt,
              author: detail.createdBy,
              id: detail.displayId,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="h-12 rounded-2xl bg-[#2C4260] px-5 text-white"
            onClick={() => router.push(ROUTES.ADMIN.ADS.EDIT(detail.id))}
          >
            <Pencil className="ms-2 h-4 w-4" />
            {t("actions.edit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl"
            onClick={onPause}
            disabled={isPausing}
          >
            <Pause className="ms-2 h-4 w-4" />
            {t("actions.pause")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-12 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="ms-2 h-4 w-4" />
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-4">
        <DashboardStatCard
          label={t("metrics.impressions")}
          value={String(metrics.impressions)}
          icon={Eye}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("metrics.clicks")}
          value={String(metrics.clicks)}
          icon={MousePointerClick}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("metrics.ctr")}
          value={`${metrics.ctrPercentage.toFixed(1)}%`}
          indicator={metrics.ctrPercentage > 0 ? undefined : t("metrics.noData")}
          icon={MousePointerClick}
          iconTone="success"
        />
        <DashboardStatCard
          label={t("metrics.uniqueUsers")}
          value={String(metrics.uniqueUsers)}
          icon={Users}
          iconTone="info"
        />
      </section>

      <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
        <h2 className="mb-4 text-xl font-bold text-slate-800">{t("sections.analytics")}</h2>
        {metrics.daily.length === 0 ? (
          <p className="text-sm text-slate-500">{t("analytics.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-3 py-3 font-medium">{t("analytics.columns.day")}</th>
                  <th className="px-3 py-3 font-medium">{t("analytics.columns.impressions")}</th>
                  <th className="px-3 py-3 font-medium">{t("analytics.columns.clicks")}</th>
                  <th className="px-3 py-3 font-medium">{t("analytics.columns.uniqueUsers")}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.daily.map((row) => (
                  <tr key={row.day} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-3 font-medium text-slate-700">{row.day}</td>
                    <td className="px-3 py-3 text-slate-600">{row.impressions}</td>
                    <td className="px-3 py-3 text-slate-600">{row.clicks}</td>
                    <td className="px-3 py-3 text-slate-600">{row.uniqueUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
            <h2 className="mb-4 text-xl font-bold text-slate-800">{t("sections.content")}</h2>
            <p className="font-semibold text-slate-800">{detail.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{detail.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">{t("fields.cta")}</p>
                <p className="font-medium text-slate-700">{detail.ctaText || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("fields.link")}</p>
                <p className="truncate font-medium text-slate-700">{detail.ctaUrl || "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
            <h2 className="mb-4 text-xl font-bold text-slate-800">{t("sections.targeting")}</h2>
            <TagGroup label={t("fields.schools")} items={detail.schoolLabels} />
            <TagGroup label={t("fields.grades")} items={detail.gradeLevelLabels} />
            <TagGroup label={t("fields.subjects")} items={detail.subjectLabels} />
          </section>

          <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
            <h2 className="mb-4 text-xl font-bold text-slate-800">{t("sections.scheduling")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">{t("fields.start")}</p>
                <p className="font-medium text-slate-700">{detail.startAt || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("fields.end")}</p>
                <p className="font-medium text-slate-700">{detail.endAt || "—"}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">{t("preview.title")}</h2>
          <DashboardSegmentedControl
            value={viewport === "tablet" ? "desktop" : viewport}
            options={[
              { id: "desktop", label: t("preview.desktop") },
              { id: "mobile", label: t("preview.mobile") },
            ]}
            onChange={(v) => setViewport(v as "desktop" | "mobile")}
          />
          <AdCreateLivePreview
            values={previewValues}
            variant="browser"
            viewport={viewport === "mobile" ? "mobile" : "desktop"}
          />
        </aside>
      </div>
    </div>
  );
}

function TagGroup({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <DashboardBadge key={item} tone="primary">
            {item}
          </DashboardBadge>
        ))}
      </div>
    </div>
  );
}
