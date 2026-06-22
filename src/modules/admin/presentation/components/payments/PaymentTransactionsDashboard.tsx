"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AdminPaymentTransactionListItem } from "@/modules/admin/domain/types/payments.types";
import type { CheckoutPaymentMethodFilter } from "@/modules/admin/domain/types/payments.types";
import { getPaymentTransactionsPage } from "@/modules/admin/infrastructure/api/paymentsApi";
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
import {
  DEFAULT_PAYMENT_TRANSACTIONS_FILTERS,
  PaymentTransactionsFilterBar,
  type PaymentTransactionsFilterState,
} from "./PaymentTransactionsFilterBar";
import { PaymentTransactionDetailSheet } from "./PaymentTransactionDetailSheet";
import { PaymentPersonCell, PaymentsSubNav } from "./PaymentsSubNav";
import {
  changePercentClassName,
  displayParentOrStudentName,
  formatChangePercent,
  formatPaymentAmount,
  formatPaymentDate,
  transactionStatusTone,
} from "./paymentDisplay";

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

export function PaymentTransactionsDashboard() {
  const t = useTranslations("admin.dashboard.paymentManagement");
  const locale = useLocale();
  const currencyLabel = locale.startsWith("ar") ? "ريال" : "SAR";

  const [filters, setFilters] = useState<PaymentTransactionsFilterState>(
    DEFAULT_PAYMENT_TRANSACTIONS_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminPaymentTransactionListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getPaymentTransactionsPage>
  >["data"]>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const result = await getPaymentTransactionsPage({
      pageNumber: page,
      pageSize,
      search: filters.search,
      status: filters.status !== "all" ? filters.status : undefined,
      method:
        filters.method !== "all"
          ? (Number(filters.method) as CheckoutPaymentMethodFilter)
          : undefined,
      fromDate: toUtcStartOfDay(filters.fromDate),
      toDate: toUtcEndOfDay(filters.toDate),
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
        id: "revenue",
        label: t("transactions.stats.totalRevenue"),
        value: summary
          ? formatPaymentAmount(summary.summary.totalRevenue, summary.summary.currency, locale, currencyLabel)
          : "—",
        indicator: summary
          ? t("transactions.stats.revenueChange", {
              value: formatChangePercent(summary.summary.revenueChangePercent, locale),
            })
          : undefined,
        indicatorClassName: summary
          ? changePercentClassName(summary.summary.revenueChangePercent)
          : undefined,
        icon: Wallet,
        iconTone: "primary" as const,
      },
      {
        id: "succeeded",
        label: t("transactions.stats.succeeded"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.summary.succeededCount) : "—",
        indicator: summary
          ? t("transactions.stats.successRate", {
              value: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
                summary.summary.successRatePercent,
              ),
            })
          : undefined,
        icon: CheckCircle2,
        iconTone: "success" as const,
      },
      {
        id: "failed",
        label: t("transactions.stats.failed"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.summary.failedCount) : "—",
        icon: AlertCircle,
        iconTone: "danger" as const,
      },
    ],
    [summary, t, locale, currencyLabel],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<AdminPaymentTransactionListItem>>>(
    () => [
      {
        id: "reference",
        header: t("transactions.table.reference"),
        renderCell: (row) => (
          <span className="font-mono text-sm text-slate-600">#{row.referenceNumber}</span>
        ),
      },
      {
        id: "parent",
        header: t("transactions.table.parent"),
        renderCell: (row) => (
          <PaymentPersonCell
            name={displayParentOrStudentName(row.parentName, row.studentName)}
            email={row.parentEmail}
            avatarUrl={row.parentAvatarUrl ?? row.studentAvatarUrl}
          />
        ),
      },
      {
        id: "student",
        header: t("transactions.table.student"),
        renderCell: (row) => (
          <PaymentPersonCell name={row.studentName} avatarUrl={row.studentAvatarUrl} />
        ),
      },
      {
        id: "method",
        header: t("transactions.table.method"),
        cellClassName: "text-slate-600",
        renderCell: (row) => row.paymentMethodLabelAr,
      },
      {
        id: "amount",
        header: t("transactions.table.amount"),
        renderCell: (row) => (
          <span className="font-bold text-[#1E3A66]">
            {formatPaymentAmount(row.amount, row.currency, locale, currencyLabel)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("transactions.table.status"),
        renderCell: (row) => (
          <DashboardBadge tone={transactionStatusTone(row.status)} withDot>
            {row.statusLabelAr}
          </DashboardBadge>
        ),
      },
      {
        id: "date",
        header: t("transactions.table.date"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatPaymentDate(row.occurredAt ?? row.createdAt, locale),
      },
    ],
    [t, locale, currencyLabel],
  );

  const openDetail = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("transactions.title")}
        description={t("transactions.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.payments"), href: ROUTES.ADMIN.PAYMENTS.OVERVIEW },
          { label: t("subNav.transactions") },
        ]}
      />

      <PaymentsSubNav />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-[1.75rem]" />
            ))
          : statCards.map((card) => (
              <DashboardStatCard
                key={card.id}
                label={card.label}
                value={card.value}
                indicator={card.indicator}
                indicatorClassName={card.indicatorClassName}
                icon={card.icon}
                iconTone={card.iconTone}
              />
            ))}
      </section>

      <PaymentTransactionsFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_PAYMENT_TRANSACTIONS_FILTERS)}
      />

      <DashboardTableCard
        title={t("transactions.title")}
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
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {t("overview.pagination.pageSize", { size })}
                    </option>
                  ))}
                </select>
              </label>
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
            getRowKey={(row) => row.id}
            emptyMessage={t("transactions.table.empty")}
            onRowClick={(row) => openDetail(row.id)}
            renderActions={(row) => (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => openDetail(row.id)}
                aria-label={t("transactions.table.viewDetails")}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          />
        )}
      </DashboardTableCard>

      <PaymentTransactionDetailSheet
        transactionId={selectedTransactionId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
