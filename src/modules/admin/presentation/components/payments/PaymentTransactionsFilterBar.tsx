"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  CHECKOUT_PAYMENT_METHOD_FILTER,
  TRANSACTION_STATUS,
} from "@/modules/admin/domain/types/payments.types";
import { AddUserDateField } from "@/modules/admin/presentation/components/add-user/AddUserDateField";
import CalendarIcon from "@/modules/admin/presentation/assets/icons/CalenderIcon";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export type PaymentTransactionsFilterState = {
  search: string;
  status: string;
  method: string;
  fromDate: string;
  toDate: string;
};

export const DEFAULT_PAYMENT_TRANSACTIONS_FILTERS: PaymentTransactionsFilterState = {
  search: "",
  status: "all",
  method: "all",
  fromDate: "",
  toDate: "",
};

export type PaymentTransactionsFilterBarProps = {
  filters: PaymentTransactionsFilterState;
  onChange: (filters: PaymentTransactionsFilterState) => void;
  onReset: () => void;
};

export function PaymentTransactionsFilterBar({
  filters,
  onChange,
  onReset,
}: PaymentTransactionsFilterBarProps) {
  const t = useTranslations("admin.dashboard.paymentManagement.transactions.filters");

  const statusOptions = useMemo(
    () => [
      { id: "all", label: t("status.all") },
      { id: TRANSACTION_STATUS.succeeded, label: t("status.succeeded") },
      { id: TRANSACTION_STATUS.failed, label: t("status.failed") },
      { id: TRANSACTION_STATUS.pending, label: t("status.pending") },
      { id: TRANSACTION_STATUS.expired, label: t("status.expired") },
      { id: TRANSACTION_STATUS.cancelled, label: t("status.cancelled") },
    ],
    [t],
  );

  const methodOptions = useMemo(
    () => [
      { id: "all", label: t("method.all") },
      { id: String(CHECKOUT_PAYMENT_METHOD_FILTER.visa), label: t("method.visa") },
      {
        id: String(CHECKOUT_PAYMENT_METHOD_FILTER.activationCode),
        label: t("method.activationCode"),
      },
      { id: String(CHECKOUT_PAYMENT_METHOD_FILTER.free), label: t("method.free") },
    ],
    [t],
  );

  return (
    <DashboardFiltersPanel>
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        className="min-w-[14rem] flex-1 xl:min-w-[18rem]"
      />
      <DashboardFilterSelect
        label={t("status.label")}
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <DashboardFilterSelect
        label={t("method.label")}
        value={filters.method}
        options={methodOptions}
        onChange={(method) => onChange({ ...filters, method })}
      />
      <div className="flex min-w-[12rem] flex-col gap-2 text-right">
        <span className="text-sm font-medium text-[#64748B]">{t("fromDate")}</span>
        <AddUserDateField
          label={t("fromDate")}
          value={filters.fromDate}
          onChange={(fromDate) => onChange({ ...filters, fromDate })}
          placeholder="..."
          icon={CalendarIcon}
        />
      </div>
      <div className="flex min-w-[12rem] flex-col gap-2 text-right">
        <span className="text-sm font-medium text-[#64748B]">{t("toDate")}</span>
        <AddUserDateField
          label={t("toDate")}
          value={filters.toDate}
          onChange={(toDate) => onChange({ ...filters, toDate })}
          placeholder="..."
          icon={CalendarIcon}
        />
      </div>
      <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={onReset}>
        {t("reset")}
      </Button>
    </DashboardFiltersPanel>
  );
}
