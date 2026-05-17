"use client";

import type { ComponentType } from "react";
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  LineChart,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function AdminLiveBroadcastWatchPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("liveBroadcast.watch.page.title")}
        description={t("liveBroadcast.watch.page.subtitle")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          {
            label: t("liveBroadcast.list.page.breadcrumb"),
            href: `${ROUTES.ADMIN.HOME}?tab=liveBroadcast`,
          },
          { label: t("liveBroadcast.watch.page.breadcrumb") },
        ]}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => router.push(ROUTES.ADMIN.LIVE_BROADCAST.CREATE)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("liveBroadcast.list.page.scheduleNew")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg"
                aria-label={t("liveBroadcast.watch.player.play")}
              >
                <Play className="ms-1 h-8 w-8 fill-current" aria-hidden />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-800">
              <div
                className="h-full rounded-e-sm bg-[var(--dashboard-gold)]"
                style={{ width: "38%" }}
              />
            </div>
          </div>

          <Card className="border-[var(--dashboard-border-soft)] shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DashboardBadge tone="success">{t("liveBroadcast.watch.lesson.category")}</DashboardBadge>
              </div>
              <h2 className="text-2xl font-bold text-[var(--dashboard-primary)]">
                {t("liveBroadcast.watch.lesson.title")}
              </h2>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                  MS
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{t("liveBroadcast.watch.lesson.instructorName")}</p>
                  <p className="text-sm text-slate-500">{t("liveBroadcast.watch.lesson.instructorRole")}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
                  {t("liveBroadcast.watch.lesson.metaDate")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" aria-hidden />
                  {t("liveBroadcast.watch.lesson.metaDuration")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-400" aria-hidden />
                  {t("liveBroadcast.watch.lesson.metaViews")}
                </span>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 text-lg font-bold text-slate-800">{t("liveBroadcast.watch.resources.title")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <ResourceRow
                icon={FileText}
                nameKey="liveBroadcast.watch.resources.file1"
                sizeKey="liveBroadcast.watch.resources.size1"
              />
              <ResourceRow
                icon={FileText}
                nameKey="liveBroadcast.watch.resources.file2"
                sizeKey="liveBroadcast.watch.resources.size2"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="border-[var(--dashboard-border-soft)] shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-5 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[var(--dashboard-primary)]" aria-hidden />
                  <h3 className="font-bold text-slate-800">{t("liveBroadcast.watch.notes.title")}</h3>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {t("liveBroadcast.watch.notes.badge")}
                </span>
              </div>
              <p className="text-xs text-slate-500">{t("liveBroadcast.watch.notes.subtitle")}</p>
              <div className="space-y-3 pt-2">
                {(
                  [
                    { timeKey: "liveBroadcast.watch.notes.time1", bodyKey: "liveBroadcast.watch.notes.body1" },
                    { timeKey: "liveBroadcast.watch.notes.time2", bodyKey: "liveBroadcast.watch.notes.body2" },
                    { timeKey: "liveBroadcast.watch.notes.time3", bodyKey: "liveBroadcast.watch.notes.body3" },
                  ] as const
                ).map((note) => (
                  <div
                    key={note.timeKey}
                    className="relative rounded-xl border border-slate-100 bg-[var(--dashboard-surface-muted)] p-3 text-right"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <button type="button" className="text-slate-400 hover:text-rose-500" aria-label={t("liveBroadcast.watch.notes.delete")}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                      <DashboardBadge tone="primary" className="text-xs">
                        {t(note.timeKey)}
                      </DashboardBadge>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{t(note.bodyKey)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <textarea
                  rows={3}
                  placeholder={t("liveBroadcast.watch.notes.placeholder")}
                  className="w-full resize-none rounded-xl border border-[var(--dashboard-border-soft)] bg-white px-3 py-2 text-right text-sm"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">{t("liveBroadcast.watch.notes.currentTime")}</p>
                  <Button type="button" className="rounded-xl bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary-pressed)]">
                    {t("liveBroadcast.watch.notes.save")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ResourceRow({
  icon: Icon,
  nameKey,
  sizeKey,
}: {
  icon: ComponentType<{ className?: string }>;
  nameKey: string;
  sizeKey: string;
}) {
  const t = useTranslations("admin.dashboard");
  return (
    <div className="dashboard-modal-field flex items-center justify-between gap-3 px-4 py-3">
      <button type="button" className="text-[var(--dashboard-primary)]" aria-label={t("liveBroadcast.watch.resources.download")}>
        <Download className="h-5 w-5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-sm font-medium text-slate-800">{t(nameKey)}</p>
        <p className="text-xs text-slate-400">{t(sizeKey)}</p>
      </div>
      <Icon className="h-8 w-8 shrink-0 text-rose-500" aria-hidden />
    </div>
  );
}
