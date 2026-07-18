"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, GraduationCap, UserCheck, UserX, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { AdminStudentEnrollmentListItem } from "@/modules/admin/domain/types/payments.types";
import type { EnrollmentAccessFilter } from "@/modules/admin/domain/types/payments.types";
import { getStudentEnrollmentsPage } from "@/modules/admin/infrastructure/api/paymentsApi";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { PaymentPersonCell, PaymentsSubNav } from "./PaymentsSubNav";
import {
  DEFAULT_STUDENT_ENROLLMENTS_FILTERS,
  StudentEnrollmentsFilterBar,
  type StudentEnrollmentsFilterState,
} from "./StudentEnrollmentsFilterBar";
import { enrollmentStatusTone, formatPaymentDate } from "./paymentDisplay";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function toUtcStartOfDay(dateStr: string): string | undefined {
  if (!dateStr.trim()) return undefined;
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toUtcEndOfDay(dateStr: string): string | undefined {
  if (!dateStr.trim()) return undefined;
  const date = new Date(`${dateStr}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function StudentEnrollmentsDashboard() {
  const t = useTranslations("admin.dashboard.paymentManagement");
  const locale = useLocale();
  const router = useRouter();

  const [filters, setFilters] = useState<StudentEnrollmentsFilterState>(
    DEFAULT_STUDENT_ENROLLMENTS_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminStudentEnrollmentListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getStudentEnrollmentsPage>
  >["data"]>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const result = await getStudentEnrollmentsPage({
      pageNumber: page,
      pageSize,
      search: filters.search,
      status:
        filters.status !== "all"
          ? (Number(filters.status) as EnrollmentAccessFilter)
          : undefined,
      startsFrom: toUtcStartOfDay(filters.startsFrom),
      startsTo: toUtcEndOfDay(filters.startsTo),
      endsFrom: toUtcStartOfDay(filters.endsFrom),
      endsTo: toUtcEndOfDay(filters.endsTo),
    });

    if (result.data) {
      setRows(result.data.items);
      setTotalItems(result.data.totalItems);
      setTotalPages(result.data.totalPages);
      setSummary(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
    }
    setLoading(false);
  }, [filters, page, pageSize]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const statCards = useMemo(
    () => [
      {
        id: "total",
        label: t("enrollments.stats.total"),
        value: summary
          ? new Intl.NumberFormat(locale).format(summary.summary.totalEnrollments)
          : "—",
        icon: Users,
        iconTone: "primary" as const,
      },
      {
        id: "active",
        label: t("enrollments.stats.active"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.summary.activeCount) : "—",
        icon: UserCheck,
        iconTone: "success" as const,
      },
      {
        id: "expired",
        label: t("enrollments.stats.expired"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.summary.expiredCount) : "—",
        icon: UserX,
        iconTone: "warning" as const,
      },
      {
        id: "inactive",
        label: t("enrollments.stats.inactive"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.summary.inactiveCount) : "—",
        icon: GraduationCap,
        iconTone: "neutral" as const,
      },
    ],
    [summary, t, locale],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<AdminStudentEnrollmentListItem>>>(
    () => [
      {
        id: "parent",
        header: t("enrollments.table.parent"),
        renderCell: (row) => (
          <PaymentPersonCell
            name={row.parentName ?? "—"}
            avatarUrl={row.parentAvatarUrl}
          />
        ),
      },
      {
        id: "student",
        header: t("enrollments.table.student"),
        renderCell: (row) => (
          <PaymentPersonCell name={row.studentName} avatarUrl={row.studentAvatarUrl} />
        ),
      },
      {
        id: "product",
        header: t("enrollments.table.product"),
        renderCell: (row) => <span className="font-semibold text-slate-700">{row.productName}</span>,
      },
      {
        id: "startsAt",
        header: t("enrollments.table.startsAt"),
        cellClassName: "text-slate-600",
        renderCell: (row) => formatPaymentDate(row.startsAt, locale),
      },
      {
        id: "endsAt",
        header: t("enrollments.table.endsAt"),
        cellClassName: "text-slate-600",
        renderCell: (row) => row.endsAtDisplay ?? formatPaymentDate(row.endsAt, locale),
      },
      {
        id: "status",
        header: t("enrollments.table.status"),
        renderCell: (row) => (
          <DashboardBadge tone={enrollmentStatusTone(row.status)} withDot>
            {row.statusLabelAr}
          </DashboardBadge>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("enrollments.title")}
        description={t("enrollments.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.payments"), href: ROUTES.ADMIN.PAYMENTS.OVERVIEW },
          { label: t("subNav.enrollments") },
        ]}
      />

      <PaymentsSubNav />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-[1.75rem]" />
            ))
          : statCards.map((card) => (
              <DashboardStatCard
                key={card.id}
                label={card.label}
                value={card.value}
                icon={card.icon}
                iconTone={card.iconTone}
              />
            ))}
      </section>

      <StudentEnrollmentsFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_STUDENT_ENROLLMENTS_FILTERS)}
      />

      <DashboardTableCard
        title={t("enrollments.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("overview.pagination.summary", {
                from: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
                to: Math.min(page * pageSize, totalItems),
                total: totalItems,
              })}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <SearchableSelect
                value={pageSize}
                onChange={setPageSize}
                options={PAGE_SIZE_OPTIONS.map((size) => ({
                  value: size,
                  label: t("overview.pagination.pageSize", { size }),
                }))}
                className="w-32 gap-0"
                triggerClassName="h-10 rounded-xl border-slate-200 bg-white px-3 text-sm shadow-none"
              />
              <DashboardPagination
                pages={Array.from({ length: totalPages }, (_, index) => index + 1)}
                currentPage={page}
                previousLabel={t("overview.pagination.previous")}
                nextLabel={t("overview.pagination.next")}
                onPageChange={setPage}
              />
            </div>
          </div>
        }
      >
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DashboardDataTable
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.enrollmentId}
            emptyMessage={t("enrollments.table.empty")}
            onRowClick={(row) =>
              router.push(ROUTES.ADMIN.PAYMENTS.ENROLLMENT_DETAIL(row.enrollmentId))
            }
            renderActions={(row) => (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(ROUTES.ADMIN.PAYMENTS.ENROLLMENT_DETAIL(row.enrollmentId))
                }
                aria-label={t("enrollments.table.view")}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          />
        )}
      </DashboardTableCard>
    </div>
  );
}
