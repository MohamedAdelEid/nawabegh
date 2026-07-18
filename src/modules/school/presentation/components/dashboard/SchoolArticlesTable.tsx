"use client";

import { EyeOff, Heart, MessageSquare, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { Button } from "@/shared/presentation/components/ui/button";
import type {
  SchoolHomeArticle,
  SchoolHomeArticleStatus,
} from "@/modules/school/domain/types/schoolHome.types";

interface SchoolArticlesTableProps {
  articles: SchoolHomeArticle[];
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
  isFetching?: boolean;
  onPageChange?: (page: number) => void;
  onHide?: (article: SchoolHomeArticle) => void;
  onDelete?: (article: SchoolHomeArticle) => void;
  pendingArticleId?: string | null;
  action?: React.ReactNode;
}

function statusTone(status: SchoolHomeArticleStatus) {
  if (status === "Published") return "success" as const;
  if (status === "PendingReview" || status === "NeedsEdits") return "warning" as const;
  return "neutral" as const;
}

function visiblePages(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.min(Math.max(1, current - 2), total - 4);
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function SchoolArticlesTable({
  articles,
  totalCount,
  currentPage,
  totalPages,
  isFetching,
  onPageChange,
  onHide,
  onDelete,
  pendingArticleId,
  action,
}: SchoolArticlesTableProps) {
  const t = useTranslations("school.dashboard.homePage");
  const hasPagination = Boolean(currentPage && totalPages && onPageChange);

  const columns: Array<DashboardDataTableColumn<SchoolHomeArticle>> = [
    {
      id: "title",
      header: t("articles.columns.title"),
      renderCell: (article) => (
        <p className="max-w-sm font-semibold leading-6 text-slate-800">{article.title}</p>
      ),
    },
    {
      id: "author",
      header: t("articles.columns.author"),
      renderCell: (article) => (
        <div className="flex items-center gap-2">
          <UserAvatarImageOrInitials
            trackKey={article.articleId}
            name={article.author.fullName}
            imageUrl={article.author.avatarUrl}
            circleClassName="bg-[#DBEEF6] text-[#255E8A]"
          />
          <div className="text-start">
            <p className="font-semibold text-slate-700">{article.author.fullName}</p>
            {article.author.roleLabel ? (
              <p className="text-xs text-[#A38F5A]">{article.author.roleLabel}</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "interaction",
      header: t("articles.columns.interaction"),
      renderCell: (article) => (
        <div className="flex items-center gap-4 text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4" aria-hidden />
            {article.likesCount.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" aria-hidden />
            {article.commentsCount.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      id: "date",
      header: t("articles.columns.date"),
      renderCell: (article) => article.publishedAtLabel || "—",
    },
    {
      id: "status",
      header: t("articles.columns.status"),
      renderCell: (article) => (
        <DashboardBadge tone={statusTone(article.status)} withDot>
          {article.statusLabel || t(`articles.status.${article.status}`)}
        </DashboardBadge>
      ),
    },
  ];

  return (
    <DashboardTableCard
      title={t("articles.title")}
      actions={action}
      className={isFetching ? "opacity-70 transition-opacity" : undefined}
      footer={
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {t("articles.summary", { visible: articles.length, total: totalCount })}
          </p>
          {hasPagination ? (
            <DashboardPagination
              pages={visiblePages(currentPage!, totalPages!)}
              currentPage={currentPage!}
              previousLabel={t("articles.previous")}
              nextLabel={t("articles.next")}
              onPageChange={onPageChange}
            />
          ) : null}
        </div>
      }
    >
      <DashboardDataTable
        rows={articles}
        columns={columns}
        getRowKey={(article) => article.articleId}
        emptyMessage={t("articles.empty")}
        actionsHeader={onHide || onDelete ? t("articles.columns.actions") : undefined}
        actionsCellClassName="text-end"
        renderActions={
          onHide || onDelete
            ? (article) => (
                <div className="flex items-center justify-end gap-2">
                  {article.canHide && onHide ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-slate-500"
                      aria-label={t("articles.actions.hide")}
                      disabled={pendingArticleId === article.articleId}
                      onClick={() => onHide(article)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {article.canDelete && onDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={t("articles.actions.delete")}
                      disabled={pendingArticleId === article.articleId}
                      onClick={() => onDelete(article)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              )
            : undefined
        }
      />
    </DashboardTableCard>
  );
}
