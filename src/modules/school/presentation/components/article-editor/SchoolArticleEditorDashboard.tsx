"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  FilePenLine,
  FileText,
  Heart,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useSchoolCommunityDashboard } from "@/modules/school/application/hooks/useSchoolCommunityDashboard";
import type {
  SchoolArticleStatus,
  SchoolArticleStatusFilter,
  SchoolCommunityArticleListItem,
  SchoolCommunityContentSource,
} from "@/modules/school/domain/types/schoolCommunity.types";
import { SchoolArticleEditorDashboardSkeleton } from "@/modules/school/presentation/components/article-editor/SchoolArticleEditorDashboardSkeleton";
import { SchoolArticleRejectModal } from "@/modules/school/presentation/components/article-editor/SchoolArticleRejectModal";
import { SchoolArticleRequestEditsModal } from "@/modules/school/presentation/components/article-editor/SchoolArticleRequestEditsModal";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardBreadcrumb,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardFilterSelect,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

function statusTone(status: SchoolArticleStatus) {
  if (status === "Published") return "success" as const;
  if (status === "PendingReview" || status === "NeedsEdits") return "warning" as const;
  if (status === "Removed") return "danger" as const;
  return "neutral" as const;
}

function estimateReadMinutes(excerpt: string, content?: string) {
  const text = `${excerpt} ${content ?? ""}`.replace(/<[^>]+>/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function SchoolArticleEditorDashboard() {
  const t = useTranslations("school.dashboard.articleEditor");
  const common = useTranslations("school.dashboard.common");
  const formatter = useFormatter();
  const router = useRouter();
  const dashboard = useSchoolCommunityDashboard();
  const [deleteTarget, setDeleteTarget] = useState<SchoolCommunityArticleListItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SchoolCommunityArticleListItem | null>(null);
  const [requestEditsTarget, setRequestEditsTarget] =
    useState<SchoolCommunityArticleListItem | null>(null);

  const stats = dashboard.data?.stats;
  const articles = dashboard.data?.articles ?? [];
  const pagination = dashboard.data?.pagination;
  const totalCount = pagination?.totalCount ?? 0;
  const pageSize = pagination?.pageSize ?? 10;
  const from = totalCount === 0 ? 0 : (dashboard.pageNumber - 1) * pageSize + 1;
  const to = Math.min(dashboard.pageNumber * pageSize, totalCount);

  const pendingId =
    (dashboard.hide.isPending ? dashboard.hide.variables : null) ??
    (dashboard.unhide.isPending ? dashboard.unhide.variables : null) ??
    (dashboard.remove.isPending ? dashboard.remove.variables : null) ??
    (dashboard.approve.isPending ? dashboard.approve.variables : null) ??
    (dashboard.submit.isPending ? dashboard.submit.variables : null) ??
    (dashboard.reject.isPending ? dashboard.reject.variables?.id : null) ??
    (dashboard.requestEdits.isPending ? dashboard.requestEdits.variables?.id : null);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return formatter.dateTime(date, { dateStyle: "medium" });
  };

  const handleHide = async (item: SchoolCommunityArticleListItem) => {
    try {
      if (item.actions.canHide) {
        await dashboard.hide.mutateAsync(item.article.articleId);
        notify.success(t("messages.hidden"));
      } else if (item.actions.canUnhide) {
        await dashboard.unhide.mutateAsync(item.article.articleId);
        notify.success(t("messages.unhidden"));
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleApprove = async (item: SchoolCommunityArticleListItem) => {
    try {
      await dashboard.approve.mutateAsync(item.article.articleId);
      notify.success(t("messages.approved"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleSubmit = async (item: SchoolCommunityArticleListItem) => {
    try {
      await dashboard.submit.mutateAsync(item.article.articleId);
      notify.success(t("messages.submitted"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleReject = async (payload: { reasons: string[]; notes: string }) => {
    if (!rejectTarget) return;
    try {
      await dashboard.reject.mutateAsync({
        id: rejectTarget.article.articleId,
        payload: {
          reasons:
            payload.reasons.length > 0
              ? payload.reasons
              : [t("modals.reject.reasons.unspecified")],
          additionalNotes: payload.notes,
        },
      });
      notify.success(t("messages.rejected"));
      setRejectTarget(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleRequestEdits = async (payload: { notes: string; hideFromFeed: boolean }) => {
    if (!requestEditsTarget) return;
    try {
      await dashboard.requestEdits.mutateAsync({
        id: requestEditsTarget.article.articleId,
        payload,
      });
      notify.success(t("messages.editsRequested"));
      setRequestEditsTarget(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dashboard.remove.mutateAsync(deleteTarget.article.articleId);
      notify.success(t("messages.deleted"));
      setDeleteTarget(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const columns = useMemo<Array<DashboardDataTableColumn<SchoolCommunityArticleListItem>>>(
    () => [
      {
        id: "title",
        header: t("table.columns.title"),
        renderCell: (row) => (
          <button
            type="button"
            className="space-y-1 text-right transition-opacity hover:opacity-80"
            onClick={() => router.push(ROUTES.USER.SCHOOL.ARTICLES.VIEW(row.article.articleId))}
          >
            <p className="font-semibold text-slate-800">{row.article.title}</p>
            <p className="text-xs text-slate-400">
              {row.article.primaryCategory?.name ?? "—"}
              {" • "}
              {t("table.readTime", {
                minutes: estimateReadMinutes(row.article.excerpt, row.article.content),
              })}
            </p>
          </button>
        ),
      },
      {
        id: "author",
        header: t("table.columns.author"),
        renderCell: (row) => (
          <div className="flex gap-2">
            <UserAvatarImageOrInitials
              trackKey={row.article.articleId}
              name={row.article.author.fullName}
              imageUrl={row.article.author.avatarUrl}
              circleClassName="bg-[#DBEEF6] text-[#255E8A]"
            />
            <div className="space-y-1 text-right">
              <p className="font-semibold text-slate-700">{row.article.author.fullName}</p>
              <p className="w-fit rounded-full bg-[#F4ECD8] px-2 text-xs text-[#A38F5A]">
                {row.isAuthoredBySchool
                  ? t("table.schoolAuthored")
                  : row.article.author.specialty || row.article.author.primaryBadge || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "interaction",
        header: t("table.columns.interaction"),
        renderCell: (row) => (
          <div className="inline-flex flex-wrap items-center gap-3 text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {row.article.likesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {row.article.commentsCount}
            </span>
          </div>
        ),
      },
      {
        id: "date",
        header: t("table.columns.date"),
        cellClassName: "text-slate-700",
        renderCell: (row) => formatDate(row.article.publishedAt ?? row.article.createdAt),
      },
      {
        id: "status",
        header: t("table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={statusTone(row.article.status)} withDot>
            {row.statusLabel || t(`status.${row.article.status}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "actions",
        header: t("table.columns.actions"),
        renderCell: (row) => {
          const busy = pendingId === row.article.articleId;
          return (
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-500"
                aria-label={t("table.actions.view")}
                onClick={() =>
                  router.push(ROUTES.USER.SCHOOL.ARTICLES.VIEW(row.article.articleId))
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
              {row.actions.canApprove ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-emerald-600"
                  disabled={busy}
                  aria-label={t("table.actions.approve")}
                  onClick={() => void handleApprove(row)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              ) : null}
              {row.actions.canReject ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-rose-500"
                  disabled={busy}
                  aria-label={t("table.actions.reject")}
                  onClick={() => setRejectTarget(row)}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
              {row.actions.canRequestEdits ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-amber-600"
                  disabled={busy}
                  aria-label={t("table.actions.requestEdits")}
                  onClick={() => setRequestEditsTarget(row)}
                >
                  <FilePenLine className="h-4 w-4" />
                </Button>
              ) : null}
              {row.actions.canSubmit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-sky-600"
                  disabled={busy}
                  aria-label={t("table.actions.submit")}
                  onClick={() => void handleSubmit(row)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : null}
              {row.actions.canEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500"
                  aria-label={t("table.actions.edit")}
                  onClick={() =>
                    router.push(ROUTES.USER.SCHOOL.ARTICLES.EDIT(row.article.articleId))
                  }
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
              {row.actions.canHide || row.actions.canUnhide ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500"
                  disabled={busy}
                  aria-label={
                    row.actions.canHide ? t("table.actions.hide") : t("table.actions.unhide")
                  }
                  onClick={() => void handleHide(row)}
                >
                  {row.actions.canHide ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              ) : null}
              {row.actions.canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-rose-500"
                  disabled={busy}
                  aria-label={t("table.actions.delete")}
                  onClick={() => setDeleteTarget(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    // Handlers close over latest dashboard mutations; refresh columns when pending row changes.
    [formatter, pendingId, router, t],
  );

  if (dashboard.isLoading) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
        />
        <SchoolArticleEditorDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbs.home"), href: ROUTES.USER.SCHOOL.HOME },
            { label: t("page.breadcrumbs.current") },
          ]}
        />
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl border-[#DCE6F3] text-[#2B415E]"
                onClick={() => router.push(ROUTES.USER.SCHOOL.ARTICLES.SETTINGS)}
              >
                <Settings2 className="h-4 w-4" />
                {t("page.settings")}
              </Button>
              <Button
                type="button"
                className="h-12 rounded-xl bg-[#2B415E] text-white hover:bg-[#24384f]"
                onClick={() => router.push(ROUTES.USER.SCHOOL.ARTICLES.CREATE)}
              >
                <Plus className="h-4 w-4" />
                {t("page.addArticle")}
              </Button>
            </div>
          }
        />
      </div>

      {dashboard.isError ? (
        <div className="space-y-3">
          <ApiFailureAlert
            message={
              dashboard.error instanceof Error
                ? dashboard.error.message
                : t("table.loadError")
            }
            fallbackMessage={t("table.loadError")}
          />
          <Button type="button" variant="outline" onClick={() => void dashboard.refetch()}>
            {common("retry")}
          </Button>
        </div>
      ) : null}

      <motion.section
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {[
          {
            id: "total",
            label: t("stats.totalArticles"),
            value: stats?.totalArticles ?? 0,
            icon: FileText,
            tone: "info" as const,
            accent: "before:bg-[#2C4260]",
          },
          {
            id: "pending",
            label: t("stats.pendingReview"),
            value: stats?.pendingReviewCount ?? 0,
            icon: ClipboardList,
            tone: "warning" as const,
            accent: "before:bg-[#C7AF6E]",
          },
          {
            id: "today",
            label: t("stats.publishedToday"),
            value: stats?.publishedTodayCount ?? 0,
            icon: CheckCircle2,
            tone: "success" as const,
            accent: "before:bg-[#67C23A]",
          },
          {
            id: "reports",
            label: t("stats.reports"),
            value: stats?.reportedCount ?? 0,
            icon: AlertCircle,
            tone: "danger" as const,
            accent: "before:bg-[#F25555]",
          },
        ].map((stat, index) => (
          <motion.div key={stat.id} custom={index} variants={fadeInUp}>
            <DashboardStatCard
              label={stat.label}
              value={stat.value.toLocaleString()}
              icon={stat.icon}
              iconTone={stat.tone}
              className={stat.accent}
            />
          </motion.div>
        ))}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardFilterSelect
            label={t("filters.status")}
            value={dashboard.status}
            onChange={(value) => dashboard.setStatus(value as SchoolArticleStatusFilter)}
            options={[
              { id: "all", label: t("filters.statusAll") },
              { id: "Draft", label: t("status.Draft") },
              { id: "PendingReview", label: t("status.PendingReview") },
              { id: "NeedsEdits", label: t("status.NeedsEdits") },
              { id: "Published", label: t("status.Published") },
              { id: "Hidden", label: t("status.Hidden") },
              { id: "Removed", label: t("status.Removed") },
            ]}
          />
          <DashboardFilterSelect
            label={t("filters.contentSource")}
            value={dashboard.contentSource}
            onChange={(value) =>
              dashboard.setContentSource(value as SchoolCommunityContentSource)
            }
            options={[
              { id: "All", label: t("filters.contentSourceAll") },
              { id: "School", label: t("filters.contentSourceSchool") },
              { id: "Students", label: t("filters.contentSourceStudents") },
            ]}
          />
          <DashboardSearchFilter
            label={t("filters.search")}
            value={dashboard.search}
            onChange={dashboard.setSearch}
            placeholder={t("filters.searchPlaceholder")}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        className={dashboard.isFetching ? "opacity-70 transition-opacity" : undefined}
      >
        <DashboardTableCard title={t("table.title")}>
          <DashboardDataTable
            columns={columns}
            rows={articles}
            getRowKey={(row) => row.article.articleId}
            emptyMessage={t("table.empty")}
          />
          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {t("table.summary", { from, to, total: totalCount })}
            </p>
            <DashboardPagination
              currentPage={dashboard.pageNumber}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={dashboard.setPageNumber}
              previousLabel={t("table.previous")}
              nextLabel={t("table.next")}
            />
          </div>
        </DashboardTableCard>
      </motion.div>

      <ModalShell open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalTitle>{t("modals.delete.title")}</ModalTitle>
        <ModalDescription>
          {t("modals.delete.description", { title: deleteTarget?.article.title ?? "" })}
        </ModalDescription>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
            {t("modals.delete.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-rose-500 text-white hover:bg-rose-600"
            disabled={dashboard.remove.isPending}
            onClick={() => void handleDelete()}
          >
            {dashboard.remove.isPending ? common("saving") : t("modals.delete.confirm")}
          </Button>
        </div>
      </ModalShell>

      <SchoolArticleRejectModal
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t("modals.reject.title")}
        infoBannerText={t("modals.reject.info")}
        reasonsTitle={t("modals.reject.reasonsTitle")}
        notesLabel={t("modals.reject.notesLabel")}
        notesPlaceholder={t("modals.reject.notesPlaceholder")}
        confirmLabel={t("modals.reject.confirm")}
        cancelLabel={t("modals.reject.cancel")}
        reasonOptions={[
          { id: "unclearTitle", label: t("modals.reject.reasons.unclearTitle") },
          { id: "needsSources", label: t("modals.reject.reasons.needsSources") },
          { id: "inappropriate", label: t("modals.reject.reasons.inappropriate") },
          { id: "offTopic", label: t("modals.reject.reasons.offTopic") },
        ]}
        onConfirm={handleReject}
      />

      <SchoolArticleRequestEditsModal
        open={Boolean(requestEditsTarget)}
        onOpenChange={(open) => !open && setRequestEditsTarget(null)}
        title={t("modals.requestEdits.title")}
        notesLabel={t("modals.requestEdits.notesLabel")}
        notesPlaceholder={t("modals.requestEdits.notesPlaceholder")}
        notesRequired={t("modals.requestEdits.notesRequired")}
        hideFromFeedLabel={t("modals.requestEdits.hideFromFeed")}
        confirmLabel={t("modals.requestEdits.confirm")}
        cancelLabel={t("modals.requestEdits.cancel")}
        onConfirm={handleRequestEdits}
      />
    </div>
  );
}
