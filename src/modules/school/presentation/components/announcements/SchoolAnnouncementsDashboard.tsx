"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, Lightbulb, Megaphone, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { DashboardPagination } from "@/shared/presentation/components/dashboard/DashboardPagination";
import {
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { cn } from "@/shared/application/lib/cn";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useSchoolAnnouncementsKpis } from "@/modules/school/application/hooks/useSchoolAnnouncementsKpis";
import { useSchoolAnnouncementsList } from "@/modules/school/application/hooks/useSchoolAnnouncementsList";
import { useSchoolAnnouncementMutations } from "@/modules/school/application/hooks/useSchoolAnnouncementMutations";
import { SchoolKpiCards } from "@/modules/school/presentation/components/shared/SchoolKpiCards";
import { SchoolStatusBadge } from "@/modules/school/presentation/components/shared/SchoolStatusBadge";
import { audienceText } from "@/modules/school/presentation/lib/schoolAnnouncementLabels";
import { SchoolAnnouncementsListSkeleton } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementsListSkeleton";
import type {
  SchoolAnnouncementListFilter,
  SchoolAnnouncementListItem,
} from "@/modules/school/domain/types/schoolAnnouncements.types";

const FILTER_TABS: SchoolAnnouncementListFilter[] = ["all", "Published", "Scheduled", "Draft"];

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function SchoolAnnouncementsDashboard() {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const router = useRouter();

  const kpisQuery = useSchoolAnnouncementsKpis();
  const list = useSchoolAnnouncementsList();
  const { remove } = useSchoolAnnouncementMutations();
  const [pendingDelete, setPendingDelete] = useState<SchoolAnnouncementListItem | null>(null);

  const page = list.page;
  const pages = useMemo(
    () => buildPages(list.pageNumber, page?.totalPages ?? 1),
    [list.pageNumber, page?.totalPages],
  );

  const summary = useMemo(() => {
    if (!page || page.totalCount === 0) return null;
    const from = (page.currentPage - 1) * page.pageSize + 1;
    const to = Math.min(page.currentPage * page.pageSize, page.totalCount);
    return { from, to, total: page.totalCount };
  }, [page]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      notify.success(t("listPage.delete.success"));
    } catch {
      notify.error(t("listPage.delete.error"));
    } finally {
      setPendingDelete(null);
    }
  };

  if ((kpisQuery.isLoading || list.isLoading) && !page) {
    return <SchoolAnnouncementsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <Button
          asChild
          className="h-12 rounded-2xl bg-[#2C4260] px-5 font-bold text-white hover:bg-[#243751]"
        >
          <Link href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.CREATE}>
            <Plus className="h-5 w-5" />
            {t("listPage.createNew")}
          </Link>
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">{t("listPage.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("listPage.subtitle")}</p>
        </div>
      </header>

      {kpisQuery.data ? <SchoolKpiCards kpis={kpisQuery.data} /> : null}

      <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-2xl border-slate-200"
                aria-label={t("listPage.filters.openFilter")}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={list.search}
                  onChange={(event) => list.setSearch(event.target.value)}
                  placeholder={t("listPage.filters.searchPlaceholder")}
                  className="h-11 w-64 rounded-2xl border-slate-100 bg-slate-50 pe-11 ps-4 text-right"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-1.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => list.setStatusFilter(tab)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    list.statusFilter === tab
                      ? "bg-[#2C4260] text-white"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {t(`listPage.filters.tabs.${tab === "all" ? "all" : tab.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-right">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-400">
                  <th className="px-3 py-3 font-medium">{t("listPage.table.columns.title")}</th>
                  <th className="px-3 py-3 font-medium">{t("listPage.table.columns.audience")}</th>
                  <th className="px-3 py-3 font-medium">{t("listPage.table.columns.status")}</th>
                  <th className="px-3 py-3 font-medium">{t("listPage.table.columns.date")}</th>
                  <th className="px-3 py-3 font-medium">{t("listPage.table.columns.reach")}</th>
                  <th className="px-3 py-3 font-medium">{t("listPage.table.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {list.isError ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-red-600">
                      {t("listPage.table.loadError")}
                    </td>
                  </tr>
                ) : page && page.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">
                      {t("listPage.table.empty")}
                    </td>
                  </tr>
                ) : (
                  page?.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-bold text-slate-800">{item.title}</span>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCE6F5] text-[#2C4260]">
                            <Megaphone className="h-4 w-4" />
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {audienceText(t, item.audience, item.audienceLabel)}
                      </td>
                      <td className="px-3 py-4">
                        <SchoolStatusBadge tone={item.statusTone} label={item.statusLabel} />
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-500">
                        {item.date ? formatDate(item.date, locale) : "—"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#58CC02]"
                              style={{ width: `${Math.min(100, item.reachPercentage)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-[#58CC02]">
                            {formatNumber(item.reachPercentage, locale)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(item.id))
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            aria-label={t("listPage.table.actions.view")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {item.canEdit ? (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.EDIT(item.id))
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                              aria-label={t("listPage.table.actions.edit")}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}
                          {item.canDelete ? (
                            <button
                              type="button"
                              onClick={() => setPendingDelete(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                              aria-label={t("listPage.table.actions.delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {summary ? (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <DashboardPagination
                pages={pages}
                currentPage={list.pageNumber}
                onPageChange={list.setPageNumber}
                previousLabel={t("listPage.pagination.previous")}
                nextLabel={t("listPage.pagination.next")}
              />
              <p className="text-sm text-slate-500">
                {t("listPage.pagination.summary", {
                  from: summary.from,
                  to: summary.to,
                  total: formatNumber(summary.total, locale),
                })}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-3 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EFD5] text-[#8F6C0B]">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800">{t("listPage.tips.title")}</h3>
            <p className="text-sm leading-relaxed text-slate-500">{t("listPage.tips.body")}</p>
            <button type="button" className="text-sm font-semibold text-[#8F6C0B]">
              {t("listPage.tips.action")}
            </button>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-4 p-6 text-right">
            <h3 className="text-lg font-bold">{t("listPage.smartRecommendations.title")}</h3>
            <p className="text-sm leading-relaxed text-white/70">
              {t("listPage.smartRecommendations.body")}
            </p>
            <Button className="rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90">
              {t("listPage.smartRecommendations.action")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <ModalShell open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <div className="space-y-5 text-right">
          <ModalTitle className="text-xl font-bold text-slate-800">
            {t("listPage.delete.title")}
          </ModalTitle>
          <p className="text-sm text-slate-500">
            {t("listPage.delete.description", { title: pendingDelete?.title ?? "" })}
          </p>
          <div className="flex justify-start gap-3">
            <Button
              type="button"
              disabled={remove.isPending}
              onClick={() => void handleConfirmDelete()}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {t("listPage.delete.confirm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setPendingDelete(null)}
            >
              {t("listPage.delete.cancel")}
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
