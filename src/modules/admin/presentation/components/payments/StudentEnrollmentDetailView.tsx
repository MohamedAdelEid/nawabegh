"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { AdminStudentEnrollmentDetail } from "@/modules/admin/domain/types/payments.types";
import { getStudentEnrollmentById } from "@/modules/admin/infrastructure/api/paymentsApi";
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
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { PaymentPersonCell, PaymentsSubNav } from "./PaymentsSubNav";
import { PaymentTransactionDetailSheet } from "./PaymentTransactionDetailSheet";
import {
  formatPaymentAmount,
  formatPaymentDate,
  formatPaymentDateTime,
  transactionStatusTone,
} from "./paymentDisplay";

export type StudentEnrollmentDetailViewProps = {
  enrollmentId: string;
};

export function StudentEnrollmentDetailView({ enrollmentId }: StudentEnrollmentDetailViewProps) {
  const t = useTranslations("admin.dashboard.paymentManagement");
  const locale = useLocale();
  const router = useRouter();
  const currencyLabel = locale.startsWith("ar") ? "ريال" : "SAR";

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AdminStudentEnrollmentDetail | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    const result = await getStudentEnrollmentById(enrollmentId);
    if (result.data) {
      setDetail(result.data);
    } else {
      notify.error(result.errorMessage ?? t("enrollmentDetail.errors.load"));
      setDetail(null);
    }
    setLoading(false);
  }, [enrollmentId, t]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const openTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setDetailOpen(true);
  };

  const historyColumns = [
    {
      id: "reference",
      header: t("enrollmentDetail.paymentHistory.reference"),
      renderCell: (row: AdminStudentEnrollmentDetail["paymentHistory"][number]) =>
        `#${row.referenceNumber}`,
    },
    {
      id: "date",
      header: t("enrollmentDetail.paymentHistory.date"),
      renderCell: (row: AdminStudentEnrollmentDetail["paymentHistory"][number]) =>
        formatPaymentDate(row.paidAt, locale),
    },
    {
      id: "description",
      header: t("enrollmentDetail.paymentHistory.description"),
      renderCell: (row: AdminStudentEnrollmentDetail["paymentHistory"][number]) => row.description,
    },
    {
      id: "amount",
      header: t("enrollmentDetail.paymentHistory.amount"),
      renderCell: (row: AdminStudentEnrollmentDetail["paymentHistory"][number]) =>
        formatPaymentAmount(row.amount, row.currency, locale, currencyLabel),
    },
    {
      id: "status",
      header: t("enrollmentDetail.paymentHistory.status"),
      renderCell: (row: AdminStudentEnrollmentDetail["paymentHistory"][number]) => (
        <DashboardBadge tone={transactionStatusTone(row.status)} withDot>
          {row.statusLabelAr}
        </DashboardBadge>
      ),
    },
  ] satisfies Array<
    DashboardDataTableColumn<AdminStudentEnrollmentDetail["paymentHistory"][number]>
  >;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("enrollmentDetail.title")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.payments"), href: ROUTES.ADMIN.PAYMENTS.OVERVIEW },
          { label: t("subNav.enrollments"), href: ROUTES.ADMIN.PAYMENTS.ENROLLMENTS },
          { label: t("enrollmentDetail.title") },
        ]}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                `${ROUTES.ADMIN.PAYMENTS.TRANSACTIONS}?search=${encodeURIComponent(detail?.parties.student.fullName ?? "")}`,
              )
            }
          >
            {t("enrollmentDetail.viewAllTransactions")}
          </Button>
        }
      />

      <PaymentsSubNav />

      {loading ? (
        <Skeleton className="h-96 w-full rounded-[2rem]" />
      ) : detail ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DashboardStatCard
              label={t("enrollmentDetail.totalPaid")}
              value={formatPaymentAmount(
                detail.paymentSummary.totalPaid,
                detail.paymentSummary.currency,
                locale,
                currencyLabel,
              )}
              indicator={
                detail.paymentSummary.summaryLabelAr ||
                t("enrollmentDetail.paymentCount", {
                  count: detail.paymentSummary.paymentCount,
                })
              }
              icon={Wallet}
              iconTone="primary"
            />
            <Card className="rounded-[1.75rem] border-white/80 bg-white !shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-3 p-6 text-right">
                <p className="text-sm text-slate-500">{t("enrollmentDetail.payer")}</p>
                {detail.parties.parent ? (
                  <PaymentPersonCell
                    name={detail.parties.parent.fullName}
                    email={detail.parties.parent.email}
                    avatarUrl={detail.parties.parent.avatarUrl}
                  />
                ) : (
                  <p className="text-slate-500">—</p>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-white/80 bg-white !shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-3 p-6 text-right">
                <p className="text-sm text-slate-500">{t("enrollmentDetail.student")}</p>
                <PaymentPersonCell
                  name={detail.parties.student.fullName}
                  avatarUrl={detail.parties.student.avatarUrl}
                />
              </CardContent>
            </Card>
          </section>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="text-xl font-bold text-[#1E3A66]">{t("enrollmentDetail.product.title")}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label={t("enrollmentDetail.product.name")} value={detail.product.productName} />
                <Info
                  label={t("enrollmentDetail.product.startsAt")}
                  value={formatPaymentDate(detail.product.startsAt, locale)}
                />
                <Info
                  label={t("enrollmentDetail.product.endsAt")}
                  value={detail.product.endsAtDisplay ?? "—"}
                />
                <Info
                  label={t("enrollmentDetail.product.duration")}
                  value={
                    detail.product.accessDurationDays == null
                      ? t("enrollmentDetail.product.lifetime")
                      : t("enrollmentDetail.product.days", {
                          days: detail.product.accessDurationDays,
                        })
                  }
                />
                {detail.product.paymentMethodLabelAr ? (
                  <Info
                    label={t("enrollmentDetail.product.paymentMethod")}
                    value={detail.product.paymentMethodLabelAr}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="text-xl font-bold text-[#1E3A66]">{t("enrollmentDetail.timeline.title")}</h3>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#243B5A] transition-all"
                  style={{ width: `${detail.timeline.progressPercent}%` }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label={t("enrollmentDetail.timeline.accountCreated")}
                  value={formatPaymentDateTime(detail.timeline.accountCreatedAt, locale)}
                />
                <Info
                  label={t("enrollmentDetail.timeline.firstPayment")}
                  value={formatPaymentDateTime(detail.timeline.firstPaymentAt, locale)}
                />
                <Info
                  label={t("enrollmentDetail.timeline.activeNow")}
                  value={detail.timeline.isActiveNow ? "✓" : "—"}
                />
                <Info
                  label={t("enrollmentDetail.timeline.endsAt")}
                  value={detail.timeline.endsAtDisplay ?? "—"}
                />
              </div>
            </CardContent>
          </Card>

          <DashboardTableCard title={t("enrollmentDetail.paymentHistory.title")}>
            <DashboardDataTable
              rows={detail.paymentHistory}
              columns={historyColumns}
              getRowKey={(row) => row.id}
              emptyMessage={t("enrollmentDetail.paymentHistory.empty")}
              onRowClick={(row) => openTransaction(row.id)}
              renderActions={(row) => (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => openTransaction(row.id)}
                  aria-label={t("enrollmentDetail.paymentHistory.viewTransaction")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            />
          </DashboardTableCard>
        </>
      ) : null}

      <PaymentTransactionDetailSheet
        transactionId={selectedTransactionId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}
