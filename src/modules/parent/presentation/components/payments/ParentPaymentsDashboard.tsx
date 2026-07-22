"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParentPaymentsDashboard } from "@/modules/parent/application/hooks/useParentPaymentsDashboard";
import { ParentActiveSubscriptionCard } from "@/modules/parent/presentation/components/payments/ParentActiveSubscriptionCard";
import { ParentOfferCard } from "@/modules/parent/presentation/components/payments/ParentOfferCard";
import { ParentPaymentsTransactionsTable } from "@/modules/parent/presentation/components/payments/ParentPaymentsTransactionsTable";
import { ParentPaymentTransactionDetailModal } from "@/modules/parent/presentation/components/payments/ParentPaymentTransactionDetailModal";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentPaymentsDashboard() {
  const t = useTranslations("parent.dashboard.payments");
  const tCommon = useTranslations("parent.dashboard.common");
  const { data, isLoading, isError, refetch, isFetching } = useParentPaymentsDashboard();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-16 w-80" />
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[420px] rounded-[20px] lg:col-span-2" />
          <Skeleton className="h-[420px] rounded-[24px]" />
        </div>
        <Skeleton className="h-96 rounded-[24px]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const activeSubscription = data.activeSubscriptions[0] ?? null;
  const featuredOffer = data.availableOffers[0] ?? null;

  return (
    <div className="mx-auto flex w-full flex-col gap-10 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-start">
          <h1 className="text-[30px] font-bold leading-9 text-[#2b415e]">{t("title")}</h1>
          <p className="text-base text-[#64748b]">{t("subtitle")}</p>
        </div>
        <Button
          type="button"
          className="h-12 rounded-xl bg-[#2b415e] px-6 text-sm font-bold text-white hover:bg-[#24384f]"
          onClick={() => notify.success(t("comingSoon"))}
        >
          {t("managePlans")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ParentOfferCard
          offer={featuredOffer}
          className="lg:col-span-2"
          onSubscribe={() => notify.success(t("comingSoon"))}
        />
        <ParentActiveSubscriptionCard
          subscription={activeSubscription}
          onRenew={() => notify.success(t("comingSoon"))}
        />
      </div>

      <ParentPaymentsTransactionsTable
        initialRows={data.recentTransactions}
        onOpenDetail={(transactionId) => {
          setSelectedTransactionId(transactionId);
          setDetailOpen(true);
        }}
      />

      <ParentPaymentTransactionDetailModal
        transactionId={selectedTransactionId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTransactionId(null);
        }}
      />
    </div>
  );
}
