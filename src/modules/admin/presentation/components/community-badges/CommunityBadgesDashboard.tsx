"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_COMMUNITY_BADGES_TABLE_QUERY_KEY,
  useCommunityBadgesTable,
} from "@/modules/admin/application/hooks/useCommunityBadgesTable";
import type { CommunityBadgeRow } from "@/modules/admin/domain/types/communityBadges.types";
import {
  deleteCommunityBadge,
  toggleCommunityBadge,
} from "@/modules/admin/infrastructure/api/communityBadgesApi";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardPageHeader,
  DashboardPagination,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CommunityBadgeDeleteConfirmModal } from "./CommunityBadgeDeleteConfirmModal";
import { CommunityBadgeTableRow } from "./CommunityBadgeTableRow";
import { CommunityBadgesDashboardSkeleton } from "./CommunityBadgesDashboardSkeleton";

export function CommunityBadgesDashboard() {
  const t = useTranslations("admin.dashboard.articleEditor.communityBadges");
  const queryClient = useQueryClient();
  const badgesTable = useCommunityBadgesTable();
  const page = badgesTable.page;

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityBadgeRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!hasLoadedOnce && !badgesTable.isLoading && badgesTable.page) {
      setHasLoadedOnce(true);
    }
  }, [badgesTable.isLoading, badgesTable.page, hasLoadedOnce]);

  const invalidateTable = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITY_BADGES_TABLE_QUERY_KEY] });
  }, [queryClient]);

  const handleToggle = useCallback(
    async (badge: CommunityBadgeRow) => {
      setTogglingId(badge.id);
      const result = await toggleCommunityBadge(badge.id);
      setTogglingId(null);

      if (result.status === "Success" || result.data) {
        notify.success(badge.enabled ? t("toast.disabled") : t("toast.enabled"));
        await invalidateTable();
        return;
      }

      notify.error(result.errorMessage ?? t("toast.toggleFailed"));
    },
    [invalidateTable, t],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteCommunityBadge(deleteTarget.id);
    setIsDeleting(false);

    if (result.status === "Success") {
      notify.success(t("toast.deleted"));
      setDeleteTarget(null);
      await invalidateTable();
      return;
    }

    notify.error(result.errorMessage ?? t("toast.deleteFailed"));
  }, [deleteTarget, invalidateTable, t]);

  if (!hasLoadedOnce && badgesTable.isLoading) {
    return <CommunityBadgesDashboardSkeleton />;
  }

  const rows = page?.rows ?? [];

  return (
    <div className="space-y-8 text-right">
      <DashboardPageHeader
        title={t("page.title")}
        description={t("page.description")}
        breadcrumbs={[
          { label: t("page.breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("page.breadcrumbs.articleEditor"), href: ROUTES.ADMIN.ARTICLE_EDITOR.LIST },
          {
            label: t("page.breadcrumbs.communitySettings"),
            href: ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_SETTINGS,
          },
          { label: t("page.breadcrumbs.current") },
        ]}
        action={
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#2D3E50] px-4 text-sm font-bold text-white shadow-[0px_3px_0px_0px_#1a2d45] hover:bg-[#243B5A]"
            asChild
          >
            <Link
              href={ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_BADGE_ADD}
              className="inline-flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" aria-hidden />
              {t("actions.add")}
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden rounded-[1.5rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {t("summary.total", { count: page?.totalItems ?? rows.length })}
            </p>
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={badgesTable.filters.keyword}
                onChange={(event) =>
                  badgesTable.setFilters({ keyword: event.target.value })
                }
                placeholder={t("filters.searchPlaceholder")}
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] pe-3 ps-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D3E50]/20"
              />
            </div>
          </div>

          {badgesTable.errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {badgesTable.errorMessage}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-[#EEF4FD] bg-[#FAFBFC]">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-[#F1F5F9] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t("table.icon")}</th>
                  <th className="px-4 py-3">{t("table.name")}</th>
                  <th className="px-4 py-3">{t("table.condition")}</th>
                  <th className="px-4 py-3">{t("table.recipients")}</th>
                  <th className="px-4 py-3">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF2]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      {t("empty")}
                    </td>
                  </tr>
                ) : (
                  rows.map((badge) => (
                    <CommunityBadgeTableRow
                      key={badge.id}
                      badge={badge}
                      editHref={ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_BADGE_EDIT(badge.id)}
                      onToggle={() => void handleToggle(badge)}
                      onDelete={() => setDeleteTarget(badge)}
                      toggling={togglingId === badge.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {(page?.totalPages ?? 1) > 1 ? (
            <DashboardPagination
              currentPage={badgesTable.pageNumber}
              pages={badgesTable.pages}
              onPageChange={badgesTable.setPageNumber}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          ) : null}
        </CardContent>
      </Card>

      <CommunityBadgeDeleteConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemName={deleteTarget?.name}
        title={t("delete.title")}
        description={t("delete.description")}
        confirmLabel={t("delete.confirm")}
        cancelLabel={t("delete.cancel")}
        onConfirm={() => void handleDelete()}
        isConfirming={isDeleting}
      />
    </div>
  );
}
