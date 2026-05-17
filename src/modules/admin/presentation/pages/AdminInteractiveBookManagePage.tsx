"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  FileText,
  Lightbulb,
  MonitorPlay,
  MousePointer2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Video,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { InteractiveBookTableRow } from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import {
  interactiveBookManagePageData,
  interactiveBookManageSubjectOptions,
} from "@/modules/admin/domain/data/interactiveBookManagePageData";
import { getInteractiveBooks } from "@/modules/admin/infrastructure/api/interactiveBooksApi";
import { AddInteractiveBookModal } from "@/modules/admin/presentation/components/interactive-books";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/presentation/components/ui/card";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

export type AdminInteractiveBookManagePageProps = {
  /** When set, loads book from the list API and pre-fills the manage UI. */
  editBookId?: string;
};

export function AdminInteractiveBookManagePage({ editBookId }: AdminInteractiveBookManagePageProps) {
  const t = useTranslations("admin.dashboard");
  const base = interactiveBookManagePageData;
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [points, setPoints] = useState(base.points);
  const [book, setBook] = useState<InteractiveBookTableRow | null>(null);
  const [bookLoadState, setBookLoadState] = useState<"idle" | "loading" | "success" | "error" | "notFound">(
    "idle",
  );

  const isEditMode = Boolean(editBookId?.trim());

  useEffect(() => {
    if (!isEditMode) {
      setBook(null);
      setBookLoadState("idle");
      return;
    }
    let alive = true;
    (async () => {
      setBookLoadState("loading");
      const res = await getInteractiveBooks();
      if (!alive) return;
      if (res.errorMessage || res.data == null) {
        setBook(null);
        setBookLoadState("error");
        return;
      }
      const found = res.data.find((b) => b.id === editBookId);
      if (!found) {
        setBook(null);
        setBookLoadState("notFound");
        return;
      }
      setBook(found);
      setBookLoadState("success");
    })();
    return () => {
      alive = false;
    };
  }, [editBookId, isEditMode]);

  const data = useMemo(() => {
    if (!book || bookLoadState !== "success") return base;
    const totalPages = Math.max(1, book.pageCount || 1);
    const currentPage = Math.min(Math.max(1, base.currentPage), totalPages);
    const pdfFileName =
      book.pdfFileName?.trim() || `${book.title.replace(/\s+/g, "_").slice(0, 48) || "book"}.pdf`;
    return {
      ...base,
      pdfFileName,
      totalPages,
      currentPage,
    };
  }, [base, book, bookLoadState]);

  if (isEditMode && bookLoadState === "loading") {
    return (
      <div className="flex min-h-[16rem] items-center justify-center rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-600">
        {t("interactiveBooks.table.loading")}
      </div>
    );
  }

  if (isEditMode && bookLoadState === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/80 p-8 text-center text-sm text-red-800">
        {t("interactiveBooks.managePage.edit.loadError")}
      </div>
    );
  }

  if (isEditMode && bookLoadState === "notFound") {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-8 text-center text-sm text-amber-950">
        {t("interactiveBooks.managePage.edit.notFound")}
      </div>
    );
  }

  const pageTitle = isEditMode ? t("interactiveBooks.managePage.editTitle") : t("interactiveBooks.managePage.title");
  const breadcrumbs = isEditMode
    ? [
        { label: t("interactiveBooks.managePage.breadcrumbs.dashboard"), href: ROUTES.ADMIN.HOME },
        { label: t("tabs.interactiveBooks.title"), href: `${ROUTES.ADMIN.HOME}?tab=interactiveBooks` },
        {
          label: t("interactiveBooks.managePage.breadcrumbs.content"),
          href: ROUTES.ADMIN.INTERACTIVE_BOOKS.MANAGE,
        },
        { label: t("interactiveBooks.managePage.breadcrumbs.editBook") },
      ]
    : [
        { label: t("interactiveBooks.managePage.breadcrumbs.dashboard"), href: ROUTES.ADMIN.HOME },
        { label: t("tabs.interactiveBooks.title"), href: `${ROUTES.ADMIN.HOME}?tab=interactiveBooks` },
        { label: t("interactiveBooks.managePage.breadcrumbs.content") },
      ];

  const viewerChapterTitle =
    book && bookLoadState === "success" && book.title.trim()
      ? book.title
      : t("interactiveBooks.managePage.viewer.chapterTitle");

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={pageTitle}
        description={t("interactiveBooks.managePage.description")}
        breadcrumbs={breadcrumbs}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)] cursor-pointer"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => setAddBookOpen(true)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("interactiveBooks.managePage.actions.addBook")}
          </Button>
        }
      />

      <section className="dashboard-modal-panel p-5 sm:p-6">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <label className="block space-y-2 text-right">
            <span className="text-xs font-medium text-slate-500">
              {t("interactiveBooks.managePage.config.subjectLabel")}
            </span>
            <div className="relative">
              <select
                defaultValue={data.subjectSelectValue}
                className="h-14 w-full appearance-none rounded-2xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-4 text-right text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[var(--dashboard-gold)]/25"
              >
                {interactiveBookManageSubjectOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            </div>
            {book && bookLoadState === "success" ? (
              <p className="text-xs text-slate-500">
                {t("interactiveBooks.managePage.edit.courseContext", {
                  course: book.courseTitle,
                  grade: book.gradeName,
                })}
              </p>
            ) : null}
          </label>

          <div className="space-y-2 text-right">
            <span className="text-xs font-medium text-slate-500">
              {t("interactiveBooks.managePage.config.pdfLabel")}
            </span>
            <div className="dashboard-modal-field flex h-14 items-center justify-between gap-3 px-4">
              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                <FileText className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                <span className="truncate text-sm font-medium text-slate-700">{data.pdfFileName}</span>
              </div>
              <button
                type="button"
                className="shrink-0 text-sm font-semibold text-[var(--dashboard-primary)] underline-offset-2 hover:underline"
              >
                {t("interactiveBooks.managePage.config.changeFile")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Card className="order-2 overflow-hidden border-[var(--dashboard-border-soft)] bg-white shadow-[var(--dashboard-shadow-soft)] lg:order-1">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600">
              <span>
                {t("interactiveBooks.managePage.viewer.pageOf", {
                  current: data.currentPage,
                  total: data.totalPages,
                })}
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-white"
                  aria-label={t("interactiveBooks.managePage.viewer.zoomOut")}
                >
                  <ZoomOut className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-white"
                  aria-label={t("interactiveBooks.managePage.viewer.zoomIn")}
                >
                  <ZoomIn className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <Button
              type="button"
              className="h-11 rounded-xl bg-[var(--dashboard-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--dashboard-primary-pressed)]"
            >
              <Plus className="ms-2 h-4 w-4" aria-hidden />
              {t("interactiveBooks.managePage.viewer.addInteractionPoint")}
            </Button>
          </div>
          <CardContent className="p-6">
            <div className="relative min-h-[22rem] rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/80 p-6">
              <p className="mb-6 text-center text-lg font-bold text-slate-700">{viewerChapterTitle}</p>
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success)]">
                  <Play className="h-8 w-8 fill-current" aria-hidden />
                </div>
                <p className="text-center text-sm font-semibold text-slate-700">
                  {t("interactiveBooks.managePage.viewer.overlayCaption")}
                </p>
                <MousePointer2 className="h-5 w-5 self-end text-slate-400" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>

        <aside className="order-1 space-y-6 lg:order-2">
          <Card className="border-[var(--dashboard-border-soft)] bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardHeader className="relative space-y-2 border-b border-slate-100 pb-4 text-right">
              <div className="absolute left-4 top-4">
                <DashboardBadge tone="warning">
                  {t("interactiveBooks.managePage.points.badge", { count: points.length })}
                </DashboardBadge>
              </div>
              <div className="flex items-start justify-end gap-3 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-end gap-2 text-[var(--dashboard-primary)]">
                    <MonitorPlay className="h-5 w-5 shrink-0" aria-hidden />
                    <h2 className="text-lg font-bold">{t("interactiveBooks.managePage.points.title")}</h2>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {t("interactiveBooks.managePage.points.subtitle")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {points.map((point) => (
                <div
                  key={point.id}
                  className="rounded-2xl border border-slate-100 bg-[var(--dashboard-surface-muted)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success)]">
                      <Video className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 text-right">
                      <p className="font-semibold text-slate-800">{t(point.titleKey)}</p>
                      <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-500">
                        <span>{t(point.pageLabelKey)}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                          <Video className="h-3 w-3" aria-hidden />
                          {t(point.typeKey)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          className="dashboard-icon-btn"
                          aria-label={t("interactiveBooks.managePage.points.deletePoint")}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="dashboard-icon-btn"
                          aria-label={t("interactiveBooks.managePage.points.editPoint")}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
                        <span className="text-xs text-slate-500">
                          {t("interactiveBooks.managePage.points.visibilityLabel")}
                        </span>
                        <StatusSwitch
                          checked={point.visible}
                          onChange={(checked) => {
                            setPoints((prev) =>
                              prev.map((p) => (p.id === point.id ? { ...p, visible: checked } : p)),
                            );
                          }}
                          activeLabel={t("interactiveBooks.managePage.points.visible")}
                          inactiveLabel={t("interactiveBooks.managePage.points.hidden")}
                          activeClassName="bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-[var(--dashboard-primary)]/40 hover:text-[var(--dashboard-primary)]"
              >
                <Plus className="h-5 w-5" aria-hidden />
                {t("interactiveBooks.managePage.points.addNew")}
              </button>
            </CardContent>
          </Card>

          <div className="dashboard-tip-card flex gap-3 p-4 text-right">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-amber-950/90">
              {t("interactiveBooks.managePage.tip.body")}
            </p>
          </div>
        </aside>
      </div>

      <AddInteractiveBookModal open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
}
