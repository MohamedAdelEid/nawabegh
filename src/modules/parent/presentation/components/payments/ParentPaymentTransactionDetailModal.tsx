"use client";

import {
  CheckCircle2,
  CreditCard,
  Download,
  Printer,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParentPaymentTransactionDetail } from "@/modules/parent/application/hooks/useParentPaymentTransactionDetail";
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  maskCardLast4,
  resolveLocalizedLabel,
} from "@/modules/parent/application/lib/parentPayments.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalClose,
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

export function ParentPaymentTransactionDetailModal({
  transactionId,
  open,
  onOpenChange,
}: {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("parent.dashboard.payments.detail");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const detailQuery = useParentPaymentTransactionDetail(transactionId, open);
  const detail = detailQuery.data;

  const handlePrint = () => {
    if (!detail) return;
    const invoice = detail.invoice;
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!printWindow) return;

    const amount = formatPaymentAmount(detail.amount, detail.currency, locale);
    const product = invoice?.productName ?? "—";
    const student = detail.parties.student.fullName;
    const parent = detail.parties.parent?.fullName ?? "—";

    printWindow.document.write(`
      <html dir="${locale === "en" ? "ltr" : "rtl"}">
        <head><title>${detail.referenceNumber}</title></head>
        <body style="font-family:sans-serif;padding:24px;color:#0f172a">
          <h1>${t("title")}</h1>
          <p><strong>#${detail.referenceNumber}</strong></p>
          <p style="font-size:28px;font-weight:700">${amount}</p>
          <p><strong>${t("parties.parent")}:</strong> ${parent}</p>
          <p><strong>${t("parties.student")}:</strong> ${student}</p>
          <p><strong>${product}</strong></p>
          ${
            invoice
              ? `<hr/>
                 <p>${invoice.originalPrice} / ${invoice.discountAmount} / ${invoice.vatAmount} / ${invoice.finalPrice} ${invoice.currency}</p>`
              : ""
          }
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadPdf = () => {
    if (!detail) return;
    const payload = {
      referenceNumber: detail.referenceNumber,
      amount: detail.amount,
      currency: detail.currency,
      status: detail.status,
      occurredAt: detail.occurredAt,
      parties: detail.parties,
      invoice: detail.invoice,
      timeline: detail.timeline,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `invoice-${detail.referenceNumber}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify.success(t("downloadPdf"));
  };

  const statusMessage =
    detail?.status === "succeeded"
      ? t("successMessage")
      : detail?.status === "pending"
        ? t("pendingMessage")
        : t("failedMessage");

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="max-h-[90vh] w-[min(95vw,40rem)] overflow-y-auto rounded-[1.75rem] p-0"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e4e7ec] bg-white px-5 py-4 sm:px-6">
        <ModalClose asChild>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </ModalClose>

        <div className="min-w-0 flex-1 text-center">
          <ModalTitle className="text-lg font-bold text-[#0f172a]">{t("title")}</ModalTitle>
          <ModalDescription className="text-xs text-slate-500">
            {detail ? `#${detail.referenceNumber}` : "—"}
          </ModalDescription>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="hidden h-10 gap-2 rounded-xl sm:inline-flex"
            onClick={handlePrint}
            disabled={!detail}
          >
            <Printer className="size-4" aria-hidden />
            {t("print")}
          </Button>
          <Button
            type="button"
            className="h-10 gap-2 rounded-xl bg-[#2b415e] hover:bg-[#24384f]"
            onClick={handleDownloadPdf}
            disabled={!detail}
          >
            <Download className="size-4" aria-hidden />
            {t("downloadPdf")}
          </Button>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        {detailQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : detailQuery.isError || !detail ? (
          <p className="text-sm text-red-600">{tCommon("error")}</p>
        ) : (
          <>
            <section className="rounded-2xl border border-[#e4e7ec] p-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full",
                    detail.status === "succeeded"
                      ? "bg-[#e8f8ef] text-[#27ae60]"
                      : detail.status === "pending"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600",
                  )}
                >
                  <CheckCircle2 className="size-7" aria-hidden />
                </span>
                <p className="text-3xl font-extrabold text-[#0f172a]">
                  {formatPaymentAmount(detail.amount, detail.currency, locale)}
                </p>
                <p
                  className={cn(
                    "text-sm font-bold",
                    detail.status === "succeeded"
                      ? "text-[#27ae60]"
                      : detail.status === "pending"
                        ? "text-amber-600"
                        : "text-rose-600",
                  )}
                >
                  {statusMessage}
                </p>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[#e4e7ec] pt-4 sm:grid-cols-2">
                <div className="text-start">
                  <p className="text-xs text-slate-400">{t("transactionDate")}</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                    {formatPaymentDateTime(detail.occurredAt, locale)}
                  </p>
                </div>
                <div className="text-start">
                  <p className="text-xs text-slate-400">{t("operationType")}</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                    {(() => {
                      const fromApi = resolveLocalizedLabel(
                        locale,
                        detail.operationTypeLabelAr,
                        detail.operationTypeLabelEn,
                        "",
                      );
                      if (fromApi) return fromApi;
                      const known = [
                        "purchase",
                        "renewal",
                        "activation",
                        "free",
                      ] as const;
                      if ((known as readonly string[]).includes(detail.operationType)) {
                        return t(
                          `operationTypes.${detail.operationType as (typeof known)[number]}`,
                        );
                      }
                      return detail.operationType;
                    })()}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                <span className="size-2 rounded-full bg-[#2b415e]" />
                {t("parties.title")}
              </h3>
              <div className="space-y-2">
                {detail.parties.parent ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e7ec] px-4 py-3">
                    <div className="min-w-0 text-start">
                      <p className="text-xs text-slate-400">{t("parties.parent")}</p>
                      <p className="truncate text-sm font-bold text-[#0f172a]">
                        {detail.parties.parent.fullName}
                      </p>
                    </div>
                    <ParentAvatar
                      url={detail.parties.parent.avatarUrl}
                      name={detail.parties.parent.fullName}
                      className="size-10"
                      roundedClassName="rounded-full"
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e7ec] px-4 py-3">
                  <div className="min-w-0 text-start">
                    <p className="text-xs text-slate-400">{t("parties.student")}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-[#0f172a]">
                        {detail.parties.student.fullName}
                      </p>
                      {detail.parties.student.educationLevelNameAr ||
                      detail.parties.student.gradeNameAr ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          {resolveLocalizedLabel(
                            locale,
                            detail.parties.student.gradeNameAr ??
                              detail.parties.student.educationLevelNameAr,
                            detail.parties.student.gradeNameEn ??
                              detail.parties.student.educationLevelNameEn,
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ParentAvatar
                    url={detail.parties.student.avatarUrl}
                    name={detail.parties.student.fullName}
                    className="size-10"
                    roundedClassName="rounded-full"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                <span className="size-2 rounded-full bg-[#2b415e]" />
                {t("payment.title")}
              </h3>
              <div className="rounded-2xl bg-[#1d2939] p-5 text-white shadow-lg">
                <div className="mb-8 flex items-center justify-between">
                  <CreditCard className="size-7 text-white/90" aria-hidden />
                  <span className="text-xs font-semibold text-white/70">
                    {resolveLocalizedLabel(
                      locale,
                      detail.paymentMethodLabelAr,
                      detail.paymentMethodLabelEn,
                      t("payment.methodFallback"),
                    )}
                  </span>
                </div>
                <p className="font-mono text-xl tracking-[0.2em]">
                  {maskCardLast4(detail.cardLast4)}
                </p>
                <div className="mt-6 flex items-end justify-between gap-3 text-xs">
                  <div className="text-start">
                    <p className="text-white/60">{t("payment.cardHolder")}</p>
                    <p className="mt-1 font-semibold">
                      {detail.cardHolderName ||
                        detail.parties.parent?.fullName ||
                        "—"}
                    </p>
                  </div>
                  <div className="text-start">
                    <p className="text-white/60">{t("payment.gateway")}</p>
                    <p className="mt-1 font-semibold">
                      {detail.providerKey || detail.cardBrand || "Tap"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {detail.timeline.length > 0 ? (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                  <span className="size-2 rounded-full bg-[#2b415e]" />
                  {t("timeline.title")}
                </h3>
                <ol className="space-y-4 border-s border-[#e4e7ec] ps-4">
                  {detail.timeline.map((event, index) => {
                    const tone =
                      index === 0
                        ? "bg-[#27ae60]"
                        : event.isCompleted
                          ? "bg-[#2b415e]"
                          : "bg-slate-300";
                    return (
                      <li key={event.key} className="relative text-start">
                        <span
                          className={cn(
                            "absolute -start-[1.35rem] top-1.5 size-2.5 rounded-full",
                            tone,
                          )}
                        />
                        <p className="text-sm font-bold text-[#0f172a]">
                          {resolveLocalizedLabel(
                            locale,
                            event.labelAr,
                            event.labelEn,
                          )}
                        </p>
                        {(event.descriptionAr || event.descriptionEn) && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {resolveLocalizedLabel(
                              locale,
                              event.descriptionAr,
                              event.descriptionEn,
                            )}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatPaymentDateTime(event.occurredAt, locale)}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ) : null}
          </>
        )}
      </div>
    </ModalShell>
  );
}
