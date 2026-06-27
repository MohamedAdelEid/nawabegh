"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, EllipsisVertical, Eye, EyeOff, Heart, MessageSquare, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import {
  articleEditorStats,
  type ArticleRow,
  type ArticleStatusId,
} from "@/modules/admin/domain/data/articleEditorDashboardData";
import {
  approveCommunityArticle,
  deleteCommunityArticle,
  getCommunityArticles,
  hideCommunityArticle,
  rejectCommunityArticle,
  unhideCommunityArticle,
  type CommunityArticleStatusCode,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import {
  getCountriesDropdown,
  getUserManagementUsers,
  type UserManagementDropdownOption,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { fetchSchoolDropdownRowsForCountryId } from "@/modules/admin/presentation/lib/loadSchoolsForCountry";
import type { UserManagementSchoolId } from "@/modules/admin/domain/data/userManagementDashboardData";
import { ArticleDeleteModal, ArticleRejectModal, type RejectReason } from "@/modules/admin/presentation/components/article-editor";
import { ArticleEditorDashboardSkeleton } from "@/modules/admin/presentation/components/dashboard/ArticleEditorDashboardSkeleton";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardFilterSelect,
  type DashboardFilterOption,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

type StatusFilter = "all" | ArticleStatusId;

const PAGE_SIZE = 10;
const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

function statusTone(status: ArticleStatusId) {
  if (status === "published") return "success" as const;
  if (status === "pendingReview") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  if (status === "needsEdits") return "warning" as const;
  if (status === "hidden") return "neutral" as const;
  return "neutral" as const;
}

function uiStatusFilterToApi(filter: StatusFilter): CommunityArticleStatusCode | undefined {
  if (filter === "all") return undefined;
  const map: Record<ArticleStatusId, CommunityArticleStatusCode> = {
    draft: 0,
    pendingReview: 1,
    needsEdits: 2,
    published: 3,
    hidden: 4,
    rejected: 5,
  };
  return map[filter];
}

function canReviewArticle(statusId: ArticleStatusId) {
  return statusId === "pendingReview" || statusId === "needsEdits";
}

function canHideArticle(statusId: ArticleStatusId) {
  return statusId !== "hidden" && statusId !== "rejected";
}

function canUnhideArticle(statusId: ArticleStatusId) {
  return statusId === "hidden";
}

export function ArticleEditorDashboard() {
  const t = useTranslations("admin.dashboard");
  const formatter = useFormatter();
  const router = useRouter();
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [statsFromApi, setStatsFromApi] = useState<{
    totalArticles: number;
    pendingReviewCount: number;
    publishedTodayCount: number;
    reportedCount: number;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [countryFilter, setCountryFilter] = useState<"all" | string>("all");
  const [schoolFilter, setSchoolFilter] = useState<"all" | string>("all");
  const [authorFilter, setAuthorFilter] = useState<"all" | string>("all");
  const [countryRows, setCountryRows] = useState<UserManagementDropdownOption<number>[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [authorOptions, setAuthorOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [countriesLoaded, setCountriesLoaded] = useState(false);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [authorsListLoading, setAuthorsListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [pendingMutationId, setPendingMutationId] = useState<string | null>(null);
  const [actionsMenuArticleId, setActionsMenuArticleId] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const deleteTarget = rows.find((row) => row.id === deleteTargetId) ?? null;
  const rejectTarget = rows.find((row) => row.id === rejectTargetId) ?? null;

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const countriesRes = await getCountriesDropdown();
      if (cancelled) return;
      if (countriesRes.data) {
        setCountryRows(countriesRes.data);
      } else if (countriesRes.errorMessage) {
        notify.error(countriesRes.errorMessage ?? t("articleEditor.filters.countriesLoadError"));
      }
      setCountriesLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    if (countryFilter === "all") {
      setSchoolOptions([]);
      setSchoolsLoaded(true);
      return;
    }

    (async () => {
      setSchoolsLoaded(false);
      const { rows, errorMessage } = await fetchSchoolDropdownRowsForCountryId(
        countryRows,
        countryFilter,
      );
      if (cancelled) return;
      if (errorMessage) {
        notify.error(errorMessage ?? t("articleEditor.filters.schoolsLoadError"));
        setSchoolOptions([]);
      } else {
        setSchoolOptions(rows.map((s) => ({ id: String(s.id), label: s.name })));
      }
      setSchoolsLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [countryFilter, countryRows, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAuthorsListLoading(true);
      const schoolIdForUsers: UserManagementSchoolId | undefined =
        schoolFilter === "all" ? undefined : (schoolFilter as UserManagementSchoolId);
      const usersRes = await getUserManagementUsers({
        pageNumber: 1,
        pageSize: 200,
        roleId: "all",
        ...(schoolIdForUsers ? { schoolId: schoolIdForUsers } : {}),
      });
      if (cancelled) return;
      if (usersRes.data) {
        const seen = new Set<string>();
        const opts = usersRes.data.rows
          .filter((r) => {
            if (!r.id || seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
          })
          .map((r) => ({ id: r.id, label: r.fullName || "—" }));
        setAuthorOptions(opts);
      } else if (usersRes.errorMessage) {
        setAuthorOptions([]);
        notify.error(usersRes.errorMessage ?? t("articleEditor.filters.authorsLoadError"));
      }
      setAuthorsListLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [schoolFilter, t]);

  const countrySelectOptions = useMemo((): Array<DashboardFilterOption<string>> => {
    return [
      { id: "all", label: t("articleEditor.filters.country.all") },
      ...countryRows.map((o) => ({ id: String(o.id), label: o.name })),
    ];
  }, [countryRows, t]);

  const schoolSelectOptions = useMemo((): Array<DashboardFilterOption<string>> => {
    return [
      { id: "all", label: t("articleEditor.filters.school.all") },
      ...schoolOptions.map((o) => ({ id: o.id, label: o.label })),
    ];
  }, [schoolOptions, t]);

  const authorSelectOptions = useMemo((): Array<DashboardFilterOption<string>> => {
    return [
      { id: "all", label: t("articleEditor.filters.author.all") },
      ...authorOptions.map((o) => ({ id: o.id, label: o.label })),
    ];
  }, [authorOptions, t]);

  const loadArticles = useCallback(async () => {
    const seq = ++requestSeq.current;
    setIsLoading(true);
    const result = await getCommunityArticles({
      status: uiStatusFilterToApi(statusFilter),
      search: debouncedSearch || undefined,
      ...(schoolFilter !== "all" ? { schoolId: schoolFilter } : {}),
      ...(authorFilter !== "all" ? { authorId: authorFilter } : {}),
      page: currentPage,
      pageSize: PAGE_SIZE,
      sortBy: "CreatedAt",
      sortDesc: true,
    });

    if (seq !== requestSeq.current) return;

    if (result.data) {
      setActionsMenuArticleId(null);
      setRows(result.data.articles);
      setTotalItems(result.data.totalItems);
      setStatsFromApi(result.data.stats);
    } else {
      setRows([]);
      setTotalItems(0);
      notify.error(result.errorMessage ?? t("articleEditor.table.loadError"));
    }
    setIsLoading(false);
    setInitialLoadComplete(true);
  }, [authorFilter, currentPage, debouncedSearch, schoolFilter, statusFilter, t]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    if (!actionsMenuArticleId) return;
    const handlePointerDown = (event: PointerEvent) => {
      const el = event.target;
      if (!(el instanceof Element)) return;
      if (el.closest(`[data-article-actions-menu="${actionsMenuArticleId}"]`)) return;
      setActionsMenuArticleId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [actionsMenuArticleId]);

  const pages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const computedStats = useMemo(() => {
    if (!statsFromApi) {
      return articleEditorStats.map((stat) => ({ ...stat, value: "—" }));
    }
    return articleEditorStats.map((stat) => {
      if (stat.id === "totalArticles") {
        return { ...stat, value: statsFromApi.totalArticles.toLocaleString() };
      }
      if (stat.id === "pendingReview") {
        return { ...stat, value: statsFromApi.pendingReviewCount.toLocaleString() };
      }
      if (stat.id === "publishedToday") {
        return { ...stat, value: statsFromApi.publishedTodayCount.toLocaleString() };
      }
      if (stat.id === "reports") {
        return { ...stat, value: statsFromApi.reportedCount.toLocaleString() };
      }
      return stat;
    });
  }, [statsFromApi]);

  const approveArticle = async (id: string) => {
    if (pendingMutationId) return;
    setPendingMutationId(id);
    const result = await approveCommunityArticle(id);
    if (!result.errorMessage) {
      notify.success(result.message ?? t("articleEditor.table.actions.approve"));
      await loadArticles();
    } else {
      notify.error(result.errorMessage ?? t("articleEditor.table.loadError"));
    }
    setPendingMutationId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId || pendingMutationId) return;
    setPendingMutationId(deleteTargetId);
    const result = await deleteCommunityArticle(deleteTargetId);
    if (!result.errorMessage) {
      notify.success(result.message ?? t("articleEditor.modals.delete.confirm"));
      setDeleteTargetId(null);
      await loadArticles();
    } else {
      notify.error(result.errorMessage ?? t("articleEditor.table.loadError"));
    }
    setPendingMutationId(null);
  };

  const hideArticle = async (id: string) => {
    if (pendingMutationId) return;
    setPendingMutationId(id);
    const result = await hideCommunityArticle(id);
    if (!result.errorMessage) {
      notify.success(result.message ?? t("articleEditor.table.actions.hideSuccess"));
      await loadArticles();
    } else {
      notify.error(result.errorMessage ?? t("articleEditor.table.loadError"));
    }
    setPendingMutationId(null);
  };

  const unhideArticle = async (id: string) => {
    if (pendingMutationId) return;
    setPendingMutationId(id);
    const result = await unhideCommunityArticle(id);
    if (!result.errorMessage) {
      notify.success(result.message ?? t("articleEditor.table.actions.showSuccess"));
      await loadArticles();
    } else {
      notify.error(result.errorMessage ?? t("articleEditor.table.loadError"));
    }
    setPendingMutationId(null);
  };

  const confirmReject = async (payload: { reasons: RejectReason[]; notes: string }) => {
    if (!rejectTargetId || pendingMutationId) return;
    setPendingMutationId(rejectTargetId);

    const reasonLabels = payload.reasons.map((reason) =>
      t(`articleEditor.modals.reject.reasons.${reason}`),
    );
    const result = await rejectCommunityArticle(rejectTargetId, {
      reasons:
        reasonLabels.length > 0 ? reasonLabels : [t("articleEditor.modals.reject.reasons.unspecified")],
      additionalNotes: payload.notes.trim(),
    });

    if (!result.errorMessage) {
      notify.success(result.message ?? t("articleEditor.modals.reject.confirm"));
      setRejectTargetId(null);
      await loadArticles();
    } else {
      notify.error(result.errorMessage ?? t("articleEditor.table.loadError"));
    }
    setPendingMutationId(null);
  };

  const formatPublishedCell = (iso: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return formatter.dateTime(date, { dateStyle: "medium" });
  };

  const tableColumns = useMemo<Array<DashboardDataTableColumn<ArticleRow>>>(
    () => [
      {
        id: "title",
        header: t("articleEditor.table.columns.title"),
        renderCell: (row) => (
          <div className="space-y-1 text-right">
            <p className="font-semibold text-slate-800">{row.title}</p>
            <p className="text-xs text-slate-400">
              {row.category} • {t("articleEditor.table.row.readTime", { minutes: row.readTimeMinutes })}
            </p>
          </div>
        ),
      },
      {
        id: "author",
        header: t("articleEditor.table.columns.author"),
        renderCell: (row) => (
          <div className="flex gap-2">
            <UserAvatarImageOrInitials
              trackKey={row.id}
              name={row.authorName}
              imageUrl={row.authorAvatarImageUrl}
              circleClassName="bg-[#DBEEF6] text-[#255E8A]"
            />
            <div className="space-y-1 text-right">
              <p className="font-semibold text-slate-700">{row.authorName}</p>
              <p className="text-xs text-[#A38F5A] bg-[#F4ECD8] w-fit rounded-full px-2">{row.authorRole}</p>
            </div>
          </div>
        ),
      },
      {
        id: "school",
        header: t("articleEditor.table.columns.school"),
        cellClassName: "text-slate-700",
        renderCell: (row) => row.schoolName,
      },
      {
        id: "interaction",
        header: t("articleEditor.table.columns.interaction"),
        renderCell: (row) => (
          <div className="inline-flex flex-wrap items-center gap-3 text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {row.likesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {row.commentsCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {row.viewsCount}
            </span>
          </div>
        ),
      },
      {
        id: "publishDate",
        header: t("articleEditor.table.columns.publishDate"),
        cellClassName: "text-slate-700",
        renderCell: (row) => formatPublishedCell(row.publishedAt),
      },
      {
        id: "status",
        header: t("articleEditor.table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={statusTone(row.statusId)} withDot>
            {t(`articleEditor.table.status.${row.statusId}`)}
          </DashboardBadge>
        ),
      },
    ],
    [formatter, t],
  );

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("tabs.articleEditor.title") },
        ]} />
        <DashboardPageHeader
        title={t("articleEditor.page.title")}
        description={t("articleEditor.page.description")}
        action={<Button
          type="button"
          variant="outline"
          className="h-12 min-w-[12rem] cursor-pointer rounded-xl border-[#DCE6F3] bg-[#2B415E] text-md font-semibold text-white transition-none hover:bg-[#2B415E]/95 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => router.push(ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_SETTINGS)}
        >
          {t("articleEditor.communitySettings.entry.button")}
        </Button>}
      />
      </div>

      {!initialLoadComplete && isLoading ? (
        <ArticleEditorDashboardSkeleton />
      ) : (
        <>
          <motion.section
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {computedStats.map((stat, idx) => (
              <motion.div key={stat.id} custom={idx} variants={fadeInUp}>
                <DashboardStatCard
                  label={t(stat.labelKey)}
                  value={stat.value}
                  indicator={stat.indicatorKey ? t(stat.indicatorKey) : undefined}
                  indicatorClassName={stat.indicatorToneClassName}
                  icon={stat.icon}
                  iconTone={stat.iconTone}
                  className={stat.accentClassName}
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
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-4">
              <DashboardFilterSelect
                value={statusFilter}
                label={t("articleEditor.filters.status.label")}
                onChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setCurrentPage(1);
                }}
                options={[
                  { id: "all", label: t("articleEditor.filters.status.all") },
                  { id: "published", label: t("articleEditor.table.status.published") },
                  { id: "pendingReview", label: t("articleEditor.table.status.pendingReview") },
                  { id: "draft", label: t("articleEditor.table.status.draft") },
                  { id: "needsEdits", label: t("articleEditor.filters.status.needsEdits") },
                  { id: "hidden", label: t("articleEditor.filters.status.hidden") },
                  { id: "rejected", label: t("articleEditor.filters.status.removed") },
                ]}
              />
              <DashboardFilterSelect
                value={countryFilter}
                label={t("articleEditor.filters.country.label")}
                disabled={!countriesLoaded}
                onChange={(value) => {
                  setCountryFilter(value);
                  setSchoolFilter("all");
                  setAuthorFilter("all");
                  setCurrentPage(1);
                }}
                options={countrySelectOptions}
              />
              <DashboardFilterSelect
                value={schoolFilter}
                label={t("articleEditor.filters.school.label")}
                disabled={countryFilter === "all" || !schoolsLoaded}
                onChange={(value) => {
                  setSchoolFilter(value);
                  setAuthorFilter("all");
                  setCurrentPage(1);
                }}
                options={schoolSelectOptions}
              />
              <DashboardFilterSelect
                value={authorFilter}
                label={t("articleEditor.filters.author.label")}
                disabled={authorsListLoading}
                onChange={(value) => {
                  setAuthorFilter(value);
                  setCurrentPage(1);
                }}
                options={authorSelectOptions}
              />
              <DashboardSearchFilter
                label={t("articleEditor.filters.search.label")}
                placeholder={t("articleEditor.filters.search.placeholder")}
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <DashboardTableCard
              title={t("articleEditor.table.title")}
              footer={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-right text-sm text-slate-500">
                    {t("articleEditor.table.pagination.summary", { visible: rows.length, total: totalItems })}
                  </p>
                  <DashboardPagination
                    pages={Array.from({ length: pages }, (_, index) => index + 1)}
                    currentPage={currentPage}
                    previousLabel={t("articleEditor.table.pagination.previous")}
                    nextLabel={t("articleEditor.table.pagination.next")}
                    onPageChange={setCurrentPage}
                  />
                </div>
              }
            >
              <div className="overflow-x-auto">
                {isLoading ? (
                  <p className="px-6 py-12 text-center text-sm text-slate-500">{t("articleEditor.reviewPage.loading")}</p>
                ) : rows.length === 0 ? (
                  <p className="px-6 py-12 text-center text-sm text-slate-500">{t("articleEditor.table.empty")}</p>
                ) : (
                  <DashboardDataTable
                    rows={rows}
                    columns={tableColumns}
                    getRowKey={(row) => row.id}
                    emptyMessage={t("articleEditor.table.empty")}
                    onRowClick={(row) => {
                      if (canReviewArticle(row.statusId)) {
                        router.push(ROUTES.ADMIN.ARTICLE_EDITOR.VIEW(row.id));
                      }
                    }}
                    rowClassName={(row) => cn(
                      "hover:bg-slate-50/80",
                      canReviewArticle(row.statusId) ? "cursor-pointer" : "cursor-default",
                    )}
                    actionsHeader={t("articleEditor.table.columns.actions")}
                    renderActions={(row) => (
                      <div className="flex items-center justify-end gap-2">
                  <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
                    {canReviewArticle(row.statusId) ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={pendingMutationId === row.id}
                          className="h-8 rounded-lg bg-[#67C23A] px-3 text-xs font-semibold text-white hover:bg-[#46A302] shadow-[0px_2px_0px_0px_#46A302]"
                          onClick={(event) => {
                            event.stopPropagation();
                            void approveArticle(row.id);
                          }}
                        >
                          {t("articleEditor.table.actions.approve")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={pendingMutationId === row.id}
                          className="h-8 rounded-lg bg-[#FF4B4B] px-3 text-xs font-semibold text-white hover:bg-[#D33131] shadow-[0px_2px_0px_0px_#D33131]"
                          onClick={(event) => {
                            event.stopPropagation();
                            setRejectTargetId(row.id);
                          }}
                        >
                          {t("articleEditor.table.actions.reject")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="dashboard-icon-btn"
                          aria-label={t("articleEditor.table.actions.view")}
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(ROUTES.ADMIN.ARTICLE_EDITOR.VIEW(row.id));
                          }}
                        >
                          <ClipboardList className="h-4 w-4" />
                        </button>
                        {canUnhideArticle(row.statusId) ? (
                          <button
                            type="button"
                            className="dashboard-icon-btn"
                            aria-label={t("articleEditor.table.actions.show")}
                            disabled={pendingMutationId === row.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void unhideArticle(row.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        ) : canHideArticle(row.statusId) ? (
                          <button
                            type="button"
                            className="dashboard-icon-btn"
                            aria-label={t("articleEditor.table.actions.hide")}
                            disabled={pendingMutationId === row.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void hideArticle(row.id);
                            }}
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="dashboard-icon-btn dashboard-icon-btn--danger"
                          aria-label={t("articleEditor.table.actions.delete")}
                          disabled={pendingMutationId === row.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteTargetId(row.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div
                    className="relative lg:hidden"
                    data-article-actions-menu={row.id}
                  >
                    <button
                      type="button"
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={t("articleEditor.table.actions.more")}
                      aria-expanded={actionsMenuArticleId === row.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActionsMenuArticleId((current) => (current === row.id ? null : row.id));
                      }}
                    >
                      <EllipsisVertical className="h-5 w-5" aria-hidden />
                    </button>
                    {actionsMenuArticleId === row.id ? (
                      <div
                        role="menu"
                        className="absolute left-0 top-full z-20 mt-1 min-w-[12rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {canReviewArticle(row.statusId) ? (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              disabled={pendingMutationId === row.id}
                              className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                              onClick={() => {
                                setActionsMenuArticleId(null);
                                void approveArticle(row.id);
                              }}
                            >
                              {t("articleEditor.table.actions.approve")}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              disabled={pendingMutationId === row.id}
                              className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                              onClick={() => {
                                setActionsMenuArticleId(null);
                                setRejectTargetId(row.id);
                              }}
                            >
                              {t("articleEditor.table.actions.reject")}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                              onClick={() => {
                                setActionsMenuArticleId(null);
                                router.push(ROUTES.ADMIN.ARTICLE_EDITOR.VIEW(row.id));
                              }}
                            >
                              {t("articleEditor.table.actions.view")}
                            </button>
                            {canUnhideArticle(row.statusId) ? (
                              <button
                                type="button"
                                role="menuitem"
                                disabled={pendingMutationId === row.id}
                                className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                onClick={() => {
                                  setActionsMenuArticleId(null);
                                  void unhideArticle(row.id);
                                }}
                              >
                                {t("articleEditor.table.actions.show")}
                              </button>
                            ) : canHideArticle(row.statusId) ? (
                              <button
                                type="button"
                                role="menuitem"
                                disabled={pendingMutationId === row.id}
                                className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                onClick={() => {
                                  setActionsMenuArticleId(null);
                                  void hideArticle(row.id);
                                }}
                              >
                                {t("articleEditor.table.actions.hide")}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              role="menuitem"
                              disabled={pendingMutationId === row.id}
                              className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                              onClick={() => {
                                setActionsMenuArticleId(null);
                                setDeleteTargetId(row.id);
                              }}
                            >
                              {t("articleEditor.table.actions.delete")}
                            </button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                      </div>
                    )}
                  />
                )}
              </div>
            </DashboardTableCard>
          </motion.div>
        </>
      )}

      <ArticleDeleteModal
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        articleTitle={deleteTarget?.title}
        title={t("articleEditor.modals.delete.title")}
        description={t("articleEditor.modals.delete.description")}
        selectedLabel={t("articleEditor.modals.delete.selectedLabel")}
        confirmLabel={t("articleEditor.modals.delete.confirm")}
        cancelLabel={t("articleEditor.modals.delete.cancel")}
        onConfirm={() => {
          void confirmDelete();
        }}
      />

      <ArticleRejectModal
        open={Boolean(rejectTargetId)}
        onOpenChange={(open) => {
          if (!open) setRejectTargetId(null);
        }}
        title={t("articleEditor.modals.reject.title")}
        infoBannerText={t("articleEditor.modals.reject.infoBanner")}
        reasonsTitle={t("articleEditor.modals.reject.reasonsTitle")}
        notesLabel={t("articleEditor.modals.reject.notesLabel")}
        notesPlaceholder={t("articleEditor.modals.reject.notesPlaceholder")}
        confirmLabel={t("articleEditor.modals.reject.confirm")}
        cancelLabel={t("articleEditor.modals.reject.cancel")}
        closeLabel={t("articleEditor.modals.reject.close")}
        reasonOptions={[
          { id: "inaccurateInfo", label: t("articleEditor.modals.reject.reasons.inaccurateInfo") },
          { id: "inappropriate", label: t("articleEditor.modals.reject.reasons.inappropriate") },
          { id: "policyViolation", label: t("articleEditor.modals.reject.reasons.policyViolation") },
          { id: "formatWeak", label: t("articleEditor.modals.reject.reasons.formatWeak") },
        ]}
        onConfirm={(payload) => {
          void confirmReject(payload);
        }}
      />
    </div>
  );
}
