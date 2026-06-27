"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { AdminPaymentTransactionListItem } from "@/modules/admin/domain/types/payments.types";
import { getPaymentsOverview } from "@/modules/admin/infrastructure/api/paymentsApi";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { PaymentPersonCell, PaymentsSubNav } from "./PaymentsSubNav";
import {
  changePercentClassName,
  displayParentOrStudentName,
  formatChangePercent,
  formatPaymentAmount,
  formatPaymentDate,
  transactionStatusTone,
} from "./paymentDisplay";
import { PaymentTransactionDetailSheet } from "./PaymentTransactionDetailSheet";

export function PaymentsOverviewDashboard() {
  const t = useTranslations("admin.dashboard.paymentManagement");
  const locale = useLocale();
  const router = useRouter();
  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getPaymentsOverview>>["data"]>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    const result = await getPaymentsOverview({ year, recentTransactionsCount: 10 });
    if (result.data) {
      setOverview(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
    }
    setLoading(false);
  }, [year]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const summary = overview?.summary;
  const currencyLabel = locale.startsWith("ar") ? "ر.ع." : "OMR";

  const statCards = useMemo(
    () => [
      {
        id: "revenue",
        label: t("overview.stats.totalRevenue"),
        value: summary
          ? formatPaymentAmount(summary.totalRevenue, summary.currency, locale, currencyLabel)
          : "—",
        indicator: summary ? formatChangePercent(summary.revenueChangePercent, locale) : undefined,
        indicatorClassName: summary ? changePercentClassName(summary.revenueChangePercent) : undefined,
        icon: Wallet,
        iconTone: "primary" as const,
      },
      {
        id: "enrollments",
        label: t("overview.stats.activeEnrollments"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.activeEnrollments) : "—",
        indicator: summary
          ? formatChangePercent(summary.activeEnrollmentsChangePercent, locale)
          : undefined,
        indicatorClassName: summary
          ? changePercentClassName(summary.activeEnrollmentsChangePercent)
          : undefined,
        icon: Users,
        iconTone: "info" as const,
      },
      {
        id: "failed",
        label: t("overview.stats.failedPayments"),
        value: summary ? new Intl.NumberFormat(locale).format(summary.failedPaymentCount) : "—",
        indicator: summary
          ? formatChangePercent(summary.failedPaymentsChangePercent, locale)
          : undefined,
        indicatorClassName: summary
          ? changePercentClassName(summary.failedPaymentsChangePercent)
          : undefined,
        icon: AlertCircle,
        iconTone: "danger" as const,
      },
    ],
    [summary, t, locale, currencyLabel],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<AdminPaymentTransactionListItem>>>(
    () => [
      {
        id: "parent",
        header: t("table.parentUser"),
        renderCell: (row) => (
          <PaymentPersonCell
            name={displayParentOrStudentName(row.parentName, row.studentName)}
            email={row.parentEmail ?? undefined}
            avatarUrl={row.parentAvatarUrl ?? row.studentAvatarUrl}
          />
        ),
      },
      {
        id: "student",
        header: t("table.student"),
        renderCell: (row) => (
          <PaymentPersonCell
            name={row.studentName}
            avatarUrl={row.studentAvatarUrl}
          />
        ),
      },
      {
        id: "amount",
        header: t("table.amount"),
        renderCell: (row) => (
          <span className="font-bold text-[#1E3A66]">
            {formatPaymentAmount(row.amount, row.currency, locale, currencyLabel)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("table.status"),
        renderCell: (row) => (
          <DashboardBadge tone={transactionStatusTone(row.status)} withDot>
            {row.statusLabelAr}
          </DashboardBadge>
        ),
      },
      {
        id: "date",
        header: t("table.date"),
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
        title={t("overview.title")}
        description={t("overview.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.payments") },
        ]}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => router.push(ROUTES.ADMIN.BUNDLES.LIST)}
          >
            {t("overview.managePlans")}
          </Button>
        }
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

      {loading ? (
        <Skeleton className="h-96 rounded-[2rem]" />
      ) : (
        <MonthlyRevenueChart
          year={year}
          rows={overview?.monthlyRevenue ?? []}
          onYearChange={setYear}
        />
      )}

      <DashboardTableCard
        title={t("overview.recentTransactions.title")}
        actions={
          <Link
            href={ROUTES.ADMIN.PAYMENTS.TRANSACTIONS}
            className="text-sm font-semibold text-[#243B5A] hover:underline"
          >
            {t("overview.recentTransactions.viewAll")} ←
          </Link>
        }
      >
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DashboardDataTable
            rows={overview?.recentTransactions ?? []}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage={t("transactions.table.empty")}
            onRowClick={(row) => openDetail(row.id)}
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
