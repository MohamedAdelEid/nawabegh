"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { Award, CalendarDays, Eye, EyeOff, Pencil, Plus, Star, Trash2, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useSchoolHonoredStudents,
  useSchoolHonorMutations,
} from "@/modules/school/application/hooks/useSchoolHonorBoard";
import type {
  SchoolHonoredStudent,
  SchoolHonorFilter,
} from "@/modules/school/domain/types/schoolHonorBoard.types";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  type DashboardBadgeTone,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardFiltersPanel,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardSegmentedControl,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { SchoolHonorBoardSkeleton } from "./SchoolHonorBoardSkeleton";

const FILTERS: SchoolHonorFilter[] = ["all", "active", "hidden"];
const PAGE_SIZE = 10;

function statusTone(status: SchoolHonoredStudent["status"]): DashboardBadgeTone {
  if (status === "Active") return "success";
  if (status === "Hidden") return "neutral";
  return "warning";
}

export function SchoolHonoredStudentsDashboard() {
  const t = useTranslations("school.dashboard.honorBoard");
  const locale = useLocale();
  const [status, setStatus] = useState<SchoolHonorFilter>("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [pageNumber, setPageNumber] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SchoolHonoredStudent | null>(null);
  const query = useSchoolHonoredStudents({
    status,
    search: deferredSearch,
    pageNumber,
    pageSize: PAGE_SIZE,
  });
  const { remove, toggleVisibility } = useSchoolHonorMutations();
  const data = query.data;

  const pages = useMemo(() => {
    const total = data?.totalPages ?? 1;
    const start = Math.max(1, Math.min(pageNumber - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: Math.max(1, end - start + 1) }, (_, index) => start + index);
  }, [data?.totalPages, pageNumber]);

  const filterOptions = useMemo(
    () =>
      FILTERS.map((item) => ({
        id: item,
        label: t(`honors.filters.${item}`),
      })),
    [t],
  );

  const selectStatus = (value: SchoolHonorFilter) => {
    setStatus(value);
    setPageNumber(1);
  };

  const handleToggle = async (item: SchoolHonoredStudent) => {
    try {
      await toggleVisibility.mutateAsync({ id: item.id, isVisible: !item.isVisible });
      notify.success(t("honors.messages.visibilityUpdated"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.actionError"));
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      notify.success(t("honors.messages.deleted"));
      setPendingDelete(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.actionError"));
    }
  };

  const columns = useMemo<Array<DashboardDataTableColumn<SchoolHonoredStudent>>>(
    () => [
      {
        id: "student",
        header: t("honors.table.student"),
        renderCell: (item) => (
          <div className="flex min-w-[12rem] items-center gap-3">
            <UserAvatarImageOrInitials
              trackKey={item.studentUserId}
              name={item.fullName}
              imageUrl={item.profileImageUrl}
              circleClassName="bg-[#DCE6F5] text-[#2C4260]"
            />
            <div>
              <p className="font-semibold text-slate-800">{item.fullName}</p>
              <p className="mt-0.5 text-xs text-slate-400">{item.gradeLabel}</p>
            </div>
          </div>
        ),
      },
      {
        id: "reason",
        header: t("honors.table.reason"),
        renderCell: (item) => (
          <div className="max-w-64">
            <p className="truncate text-sm font-medium text-slate-700">{item.reason}</p>
            <p className="mt-1 text-xs text-slate-400">#{item.referenceCode}</p>
          </div>
        ),
      },
      {
        id: "date",
        header: t("honors.table.date"),
        cellClassName: "text-slate-500 whitespace-nowrap",
        renderCell: (item) =>
          item.honoredAt ? formatDate(item.honoredAt, locale) : "—",
      },
      {
        id: "duration",
        header: t("honors.table.duration"),
        cellClassName: "text-slate-500",
        renderCell: (item) =>
          item.durationLabel || t("honors.durationDays", { count: item.durationDays }),
      },
      {
        id: "status",
        header: t("honors.table.status"),
        renderCell: (item) => (
          <DashboardBadge tone={statusTone(item.status)} withDot>
            {item.statusLabel || t(`honors.status.${item.status.toLowerCase()}`)}
          </DashboardBadge>
        ),
      },
    ],
    [locale, t],
  );

  if (query.isLoading && !data) return <SchoolHonorBoardSkeleton tableOnly />;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("honors.title")}
        description={t("honors.subtitle")}
        action={
          <Button
            asChild
            className="h-11 rounded-xl bg-[#2C4260] px-5 text-white hover:bg-[#243751]"
          >
            <Link href={ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS_CREATE}>
              <Plus className="h-4 w-4" />
              {t("honors.create")}
            </Link>
          </Button>
        }
      />

      {data ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label={t("honors.kpis.total")}
            value={formatNumber(data.kpis.totalHonored, locale)}
            icon={Users}
            iconTone="primary"
          />
          <DashboardStatCard
            label={t("honors.kpis.active")}
            value={formatNumber(data.kpis.activeHonors, locale)}
            icon={Award}
            iconTone="success"
          />
          <DashboardStatCard
            label={t("honors.kpis.thisMonth")}
            value={formatNumber(data.kpis.honoredThisMonth, locale)}
            icon={CalendarDays}
            iconTone="gold"
          />
          <DashboardStatCard
            label={t("honors.kpis.averageRating")}
            value={formatNumber(data.kpis.averageRating, locale)}
            icon={Star}
            iconTone="warning"
          />
        </section>
      ) : null}

      <DashboardFiltersPanel isLoading={query.isFetching}>
        <DashboardSegmentedControl
          options={filterOptions}
          value={status}
          onChange={selectStatus}
        />
        <DashboardSearchFilter
          label={t("honors.search")}
          placeholder={t("honors.search")}
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
        />
      </DashboardFiltersPanel>

      <DashboardTableCard
        className={query.isFetching ? "opacity-60 transition-opacity" : undefined}
        footer={
          data && data.totalPages > 1 ? (
            <DashboardPagination
              pages={pages}
              currentPage={pageNumber}
              onPageChange={setPageNumber}
              previousLabel={t("common.previous")}
              nextLabel={t("common.next")}
            />
          ) : undefined
        }
      >
        <DashboardDataTable
          rows={data?.items ?? []}
          columns={columns}
          getRowKey={(item) => item.id}
          emptyMessage={query.isError ? t("common.loadError") : t("honors.empty")}
          tableClassName="min-w-[900px]"
          actionsHeader={t("honors.table.actions")}
          renderActions={(item) => (
            <div className="flex items-center gap-1">
              {item.canToggleVisibility ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={toggleVisibility.isPending}
                  onClick={() => void handleToggle(item)}
                  aria-label={item.isVisible ? t("honors.actions.hide") : t("honors.actions.show")}
                  className="h-9 w-9 rounded-lg text-slate-400"
                >
                  {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              ) : null}
              {item.canEdit ? (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-slate-400"
                >
                  <Link
                    href={ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS_EDIT(item.id)}
                    aria-label={t("honors.actions.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {item.canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPendingDelete(item)}
                  aria-label={t("honors.actions.delete")}
                  className="h-9 w-9 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}
        />
      </DashboardTableCard>

      <ModalShell open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <div className="space-y-5 text-start">
          <ModalTitle className="text-xl font-bold text-slate-800">
            {t("honors.delete.title")}
          </ModalTitle>
          <p className="text-sm text-slate-500">
            {t("honors.delete.description", { name: pendingDelete?.fullName ?? "" })}
          </p>
          <div className="flex gap-3">
            <Button
              disabled={remove.isPending}
              onClick={() => void handleDelete()}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {t("honors.delete.confirm")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              className="rounded-xl"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
