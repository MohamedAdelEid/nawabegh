"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { notify } from "@/shared/application/lib/toast";
import { useSchoolHomeArticles } from "@/modules/school/application/hooks/useSchoolHomeArticles";
import type {
  SchoolHomeArticle,
  SchoolHomeArticleStatusFilter,
} from "@/modules/school/domain/types/schoolHome.types";
import {
  DashboardFilterSelect,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { SchoolArticlesTable } from "./SchoolArticlesTable";
import { SchoolHomeSkeleton } from "./SchoolHomeSkeleton";

export function SchoolArticlesDashboard() {
  const t = useTranslations("school.dashboard.homePage");
  const common = useTranslations("school.dashboard.common");
  const articles = useSchoolHomeArticles();
  const [deleteTarget, setDeleteTarget] = useState<SchoolHomeArticle | null>(null);

  if (articles.isLoading) return <SchoolHomeSkeleton label={common("loading")} />;

  const pendingId =
    (articles.hide.isPending ? articles.hide.variables : null) ??
    (articles.remove.isPending ? articles.remove.variables : null);

  const handleHide = async (article: SchoolHomeArticle) => {
    try {
      await articles.hide.mutateAsync(article.articleId);
      notify.success(t("articles.messages.hidden"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("articles.messages.actionError"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await articles.remove.mutateAsync(deleteTarget.articleId);
      notify.success(t("articles.messages.deleted"));
      setDeleteTarget(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("articles.messages.actionError"));
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("articles.managementTitle")}
        description={t("articles.managementSubtitle")}
      />

      <div className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
        <div className="max-w-sm">
          <DashboardFilterSelect
            label={t("articles.filters.status")}
            value={articles.status}
            onChange={(value) =>
              articles.setStatus(value as SchoolHomeArticleStatusFilter)
            }
            options={[
              { id: "all", label: t("articles.filters.all") },
              { id: "Draft", label: t("articles.status.Draft") },
              { id: "PendingReview", label: t("articles.status.PendingReview") },
              { id: "NeedsEdits", label: t("articles.status.NeedsEdits") },
              { id: "Published", label: t("articles.status.Published") },
              { id: "Hidden", label: t("articles.status.Hidden") },
            ]}
          />
        </div>
      </div>

      {articles.isError ? (
        <div className="space-y-3">
          <ApiFailureAlert fallbackMessage={common("error")} />
          <Button type="button" onClick={() => void articles.refetch()}>
            {common("retry")}
          </Button>
        </div>
      ) : (
        <SchoolArticlesTable
          articles={articles.page?.items ?? []}
          totalCount={articles.page?.totalCount ?? 0}
          currentPage={articles.pageNumber}
          totalPages={articles.page?.totalPages ?? 1}
          isFetching={articles.isFetching}
          onPageChange={articles.setPageNumber}
          onHide={(article) => void handleHide(article)}
          onDelete={setDeleteTarget}
          pendingArticleId={pendingId}
        />
      )}

      <ModalShell
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !articles.remove.isPending) setDeleteTarget(null);
        }}
      >
        <ModalTitle className="text-xl font-bold text-slate-800">
          {t("articles.delete.title")}
        </ModalTitle>
        <ModalDescription className="mt-3 text-sm leading-7 text-slate-500">
          {t("articles.delete.description", { title: deleteTarget?.title ?? "" })}
        </ModalDescription>
        <div className="mt-7 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={articles.remove.isPending}
            onClick={() => setDeleteTarget(null)}
          >
            {t("articles.delete.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-rose-600 text-white hover:bg-rose-700"
            disabled={articles.remove.isPending}
            onClick={() => void handleDelete()}
          >
            {articles.remove.isPending
              ? common("saving")
              : t("articles.delete.confirm")}
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
