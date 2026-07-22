"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  FileText,
  Filter,
  ReceiptText,
  Search,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ParentPaymentTransactionListItem } from "@/modules/parent/domain/types/parentPayments.types";
import { useParentPaymentTransactions } from "@/modules/parent/application/hooks/useParentPaymentTransactions";
import {
  formatPaymentAmount,
  formatPaymentDate,
  getInitials,
  resolveLocalizedLabel,
  transactionStatusTone,
} from "@/modules/parent/application/lib/parentPayments.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { cn } from "@/shared/application/lib/cn";

const STATUS_OPTIONS = [
  "all",
  "succeeded",
  "pending",
  "failed",
  "expired",
  "cancelled",
] as const;

function downloadTransactionsCsv(
  rows: ParentPaymentTransactionListItem[],
  locale: string,
) {
  const header = ["child", "product", "date", "amount", "currency", "status", "reference"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        `"${(row.studentName ?? "").replaceAll('"', '""')}"`,
        `"${(row.productNameAr ?? row.productName ?? "").replaceAll('"', '""')}"`,
        formatPaymentDate(row.occurredAt ?? row.createdAt, locale),
        row.amount,
        row.currency,
        row.status,
        row.referenceNumber,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `parent-transactions-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ParentPaymentsTransactionsTable({
  initialRows,
  onOpenDetail,
}: {
  initialRows: ParentPaymentTransactionListItem[];
  onOpenDetail: (transactionId: string) => void;
}) {
  const t = useTranslations("parent.dashboard.payments.table");
  const locale = useLocale();
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const query = useMemo(
    () => ({
      pageNumber,
      pageSize: 10,
      ...(status !== "all" ? { status } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [pageNumber, status, search],
  );

  const transactionsQuery = useParentPaymentTransactions(query, expanded);
  const rows = expanded
    ? (transactionsQuery.data?.items ?? [])
    : initialRows;
  const hasNextPage = expanded
    ? Boolean(transactionsQuery.data?.hasNextPage)
    : initialRows.length >= 10;

  const statusLabel = (row: ParentPaymentTransactionListItem) => {
    const fromApi = resolveLocalizedLabel(
      locale,
      row.statusLabelAr,
      row.statusLabelEn,
      "",
    );
    if (fromApi) return fromApi;
    const known = [
      "succeeded",
      "failed",
      "pending",
      "expired",
      "cancelled",
    ] as const;
    if ((known as readonly string[]).includes(row.status)) {
      return t(`statuses.${row.status as (typeof known)[number]}`);
    }
    return row.status;
  };

  return (
    <section className="overflow-hidden rounded-[24px] border-2 border-[#f1f3f5] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 border-b-2 border-[#f1f3f5] bg-[#f8f9fa] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ReceiptText className="size-5 text-[#2b415e]" aria-hidden />
          <h2 className="text-lg font-bold text-[#2b415e] sm:text-[19px]">{t("title")}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 rounded-[10px] border-2 border-[#e2e8f0] bg-white px-5 text-sm font-bold text-[#64748b]"
            onClick={() => setShowFilters((value) => !value)}
          >
            <Filter className="size-3.5" aria-hidden />
            {t("filter")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 rounded-[10px] border-2 border-[#e2e8f0] bg-white px-5 text-sm font-bold text-[#64748b]"
            onClick={() => {
              if (rows.length === 0) {
                notify.error(t("empty"));
                return;
              }
              downloadTransactionsCsv(rows, locale);
            }}
          >
            <Download className="size-3.5" aria-hidden />
            {t("downloadAll")}
          </Button>
        </div>
      </div>

      {showFilters ? (
        <div className="flex flex-col gap-3 border-b border-[#f1f3f5] bg-white px-6 py-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setExpanded(true);
                setPageNumber(1);
                setSearch(event.target.value);
              }}
              placeholder={t("filters.search")}
              className="h-11 rounded-xl border-[#e2e8f0] ps-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setPageNumber(1);
                  setStatus(option);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition",
                  status === option
                    ? "bg-[#2b415e] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {option === "all" ? t("filters.all") : t(`statuses.${option}`)}
              </button>
            ))}
            {(status !== "all" || search.trim()) && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                onClick={() => {
                  setStatus("all");
                  setSearch("");
                  setPageNumber(1);
                }}
              >
                <X className="size-3" aria-hidden />
                {t("filters.all")}
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[rgba(248,249,250,0.5)]">
            <tr className="text-[#94a3b8]">
              <th className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wide">
                {t("columns.child")}
              </th>
              <th className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wide">
                {t("columns.product")}
              </th>
              <th className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wide">
                {t("columns.date")}
              </th>
              <th className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wide">
                {t("columns.amount")}
              </th>
              <th className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wide">
                {t("columns.status")}
              </th>
              <th className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wide">
                {t("columns.action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#64748b]">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#f1f3f5]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {row.studentAvatarUrl ? (
                        <ParentAvatar
                          url={row.studentAvatarUrl}
                          name={row.studentName}
                          className="size-10"
                          roundedClassName="rounded-full"
                        />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#e8eef5] text-xs font-bold text-[#2b415e]">
                          {getInitials(row.studentName)}
                        </span>
                      )}
                      <span className="font-bold text-[#0f172a]">
                        {row.studentName?.trim() || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#475569]">
                    {resolveLocalizedLabel(
                      locale,
                      row.productNameAr,
                      row.productName,
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#475569]">
                    {formatPaymentDate(row.occurredAt ?? row.createdAt, locale)}
                  </td>
                  <td className="px-5 py-4 font-bold text-[#2b415e]">
                    {formatPaymentAmount(row.amount, row.currency, locale)}
                  </td>
                  <td className="px-5 py-4">
                    <DashboardBadge tone={transactionStatusTone(row.status)} withDot>
                      {statusLabel(row)}
                    </DashboardBadge>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-[#64748b] transition hover:bg-slate-100 hover:text-[#2b415e]"
                      aria-label={t("viewDetails")}
                      onClick={() => onOpenDetail(row.id)}
                    >
                      <FileText className="size-5" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasNextPage || expanded ? (
        <div className="flex flex-col items-center gap-3 border-t border-[#f1f3f5] px-6 py-5">
          {!expanded ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2b415e]"
              onClick={() => setExpanded(true)}
            >
              {t("showMore")}
              <ChevronDown className="size-4" aria-hidden />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={pageNumber <= 1 || transactionsQuery.isFetching}
                onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              >
                ‹
              </Button>
              <span className="text-sm text-slate-500">
                {pageNumber}
                {transactionsQuery.data
                  ? ` / ${transactionsQuery.data.totalPages}`
                  : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!hasNextPage || transactionsQuery.isFetching}
                onClick={() => setPageNumber((value) => value + 1)}
              >
                ›
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
