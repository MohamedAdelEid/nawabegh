"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AdminPaymentTransactionDetail } from "@/modules/admin/domain/types/payments.types";
import { getPaymentTransactionById } from "@/modules/admin/infrastructure/api/paymentsApi";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/presentation/components/ui/sheet";
import { PaymentPersonCell } from "./PaymentsSubNav";
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  transactionStatusTone,
} from "./paymentDisplay";

export type PaymentTransactionDetailSheetProps = {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentTransactionDetailSheet({
  transactionId,
  open,
  onOpenChange,
}: PaymentTransactionDetailSheetProps) {
  const t = useTranslations("admin.dashboard.paymentManagement.transactionDetail");
  const locale = useLocale();
  const currencyLabel = locale.startsWith("ar") ? "ر.ع." : "OMR";
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AdminPaymentTransactionDetail | null>(null);

  useEffect(() => {
    if (!open || !transactionId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await getPaymentTransactionById(transactionId);
      if (cancelled) return;
      if (result.data) {
        setDetail(result.data);
      } else {
        notify.error(result.errorMessage ?? t("errors.load"));
        setDetail(null);
      }
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, transactionId, t]);

  const handlePrint = () => {
    if (!detail?.invoice) return;
    const invoice = detail.invoice;
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl"><head><title>${invoice.referenceNumber}</title></head>
      <body style="font-family:sans-serif;padding:24px">
        <h1>فاتورة #${invoice.referenceNumber}</h1>
        <p><strong>الطالب:</strong> ${invoice.studentName}</p>
        <p><strong>المنتج:</strong> ${invoice.productName}</p>
        <p><strong>السعر الأصلي:</strong> ${invoice.originalPrice} ${invoice.currency}</p>
        <p><strong>الخصم:</strong> ${invoice.discountAmount} ${invoice.currency}</p>
        <p><strong>ضريبة القيمة المضافة:</strong> ${invoice.vatAmount} ${invoice.currency}</p>
        <p><strong>الإجمالي:</strong> ${invoice.finalPrice} ${invoice.currency}</p>
        <p><strong>طريقة الدفع:</strong> ${invoice.paymentMethod}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="text-right">
          <SheetTitle className="text-2xl font-bold text-[#1E3A66]">
            {detail ? t("reference", { reference: detail.referenceNumber }) : t("title")}
          </SheetTitle>
          <SheetDescription className="sr-only">{t("title")}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : detail ? (
          <div className="space-y-6 py-6 text-right">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-4xl font-extrabold text-[#1E3A66]">
                {formatPaymentAmount(detail.amount, detail.currency, locale, currencyLabel)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <DashboardBadge tone={transactionStatusTone(detail.status)} withDot>
                  {detail.statusLabelAr}
                </DashboardBadge>
                <span className="text-sm text-slate-500">
                  {formatPaymentDateTime(detail.occurredAt, locale)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {t("operationType")}: {detail.operationTypeLabelAr}
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-800">{t("parties.title")}</h3>
              {detail.parties.parent ? (
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-500">{t("parties.parent")}</p>
                  <PaymentPersonCell
                    name={detail.parties.parent.fullName}
                    email={detail.parties.parent.email}
                    avatarUrl={detail.parties.parent.avatarUrl}
                  />
                </div>
              ) : null}
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-500">{t("parties.student")}</p>
                <PaymentPersonCell
                  name={detail.parties.student.fullName}
                  avatarUrl={detail.parties.student.avatarUrl}
                />
                {detail.parties.student.gradeNameAr ? (
                  <p className="mt-2 text-sm text-slate-500">
                    {t("parties.grade")}: {detail.parties.student.gradeNameAr}
                    {detail.parties.student.educationLevelNameAr
                      ? ` · ${detail.parties.student.educationLevelNameAr}`
                      : ""}
                  </p>
                ) : null}
                {detail.parties.student.schoolName ? (
                  <p className="text-sm text-slate-500">
                    {t("parties.school")}: {detail.parties.student.schoolName}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-800">{t("payment.title")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem label={t("payment.method")} value={detail.paymentMethodLabelAr} />
                <InfoItem label={t("payment.provider")} value={detail.providerKey} />
              </div>
            </section>

            {detail.accessGranted ? (
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">{t("access.title")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label={t("access.startsAt")}
                    value={formatPaymentDateTime(detail.accessGranted.startsAt, locale)}
                  />
                  <InfoItem
                    label={t("access.endsAt")}
                    value={
                      detail.accessGranted.endsAtDisplay ??
                      formatPaymentDateTime(detail.accessGranted.endsAt, locale)
                    }
                  />
                </div>
              </section>
            ) : null}

            {detail.invoice ? (
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">{t("invoice.title")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label={t("invoice.originalPrice")}
                    value={formatPaymentAmount(
                      detail.invoice.originalPrice,
                      detail.invoice.currency,
                      locale,
                      currencyLabel,
                    )}
                  />
                  <InfoItem
                    label={t("invoice.discount")}
                    value={formatPaymentAmount(
                      detail.invoice.discountAmount,
                      detail.invoice.currency,
                      locale,
                      currencyLabel,
                    )}
                  />
                  <InfoItem
                    label={t("invoice.vat", { rate: Math.round(detail.invoice.vatRate * 100) })}
                    value={formatPaymentAmount(
                      detail.invoice.vatAmount,
                      detail.invoice.currency,
                      locale,
                      currencyLabel,
                    )}
                  />
                  <InfoItem
                    label={t("invoice.finalPrice")}
                    value={formatPaymentAmount(
                      detail.invoice.finalPrice,
                      detail.invoice.currency,
                      locale,
                      currencyLabel,
                    )}
                  />
                </div>
              </section>
            ) : null}

            {detail.timeline.length > 0 ? (
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">{t("timeline.title")}</h3>
                <ol className="space-y-4 border-s border-slate-200 pe-4">
                  {detail.timeline.map((event) => (
                    <li key={event.key} className="relative pe-6 text-sm">
                      <span
                        className={`absolute -start-1.5 top-1.5 h-3 w-3 rounded-full ${
                          event.isCompleted ? "bg-emerald-500" : "border-2 border-slate-300 bg-white"
                        }`}
                      />
                      <p className="font-semibold text-slate-800">{event.labelAr}</p>
                      <p className="text-slate-500">{formatPaymentDateTime(event.occurredAt, locale)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {detail.invoice ? (
                <Button type="button" variant="outline" onClick={handlePrint}>
                  <Printer className="ms-2 h-4 w-4" />
                  {t("actions.print")}
                </Button>
              ) : null}
              {detail.parties.parent?.email ? (
                <Button type="button" asChild>
                  <a href={`mailto:${detail.parties.parent.email}`}>{t("actions.contactParent")}</a>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}

export function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string | null;
}) {
  return (
    <div className="space-y-1 text-right">
      <Label className="text-[#64748B]">{label}</Label>
      <Input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? ""}
        className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 text-right placeholder:text-[#94A3B8] focus-visible:ring-[#C7AF6E]/40"
      />
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
