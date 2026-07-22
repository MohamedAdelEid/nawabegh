"use client";

import { Award, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { ParentActiveSubscription } from "@/modules/parent/domain/types/parentPayments.types";
import {
  formatPaymentDate,
  resolveLocalizedLabel,
} from "@/modules/parent/application/lib/parentPayments.utils";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";

export function ParentActiveSubscriptionCard({
  subscription,
  onRenew,
}: {
  subscription: ParentActiveSubscription | null;
  onRenew?: (subscription: ParentActiveSubscription) => void;
}) {
  const t = useTranslations("parent.dashboard.payments");
  const locale = useLocale();

  if (!subscription) {
    return (
      <article className="flex h-full min-h-[280px] flex-col justify-center rounded-[24px] border-b-[9px] border-[#c7af6d] bg-white p-7 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#64748b]">{t("subscription.empty")}</p>
      </article>
    );
  }

  const productName = resolveLocalizedLabel(
    locale,
    subscription.productNameAr ?? subscription.productName,
    subscription.productName,
  );
  const renewDate = subscription.endsAtDisplay
    ? subscription.endsAtDisplay
    : formatPaymentDate(subscription.endsAt, locale);
  const features =
    subscription.features && subscription.features.length > 0
      ? subscription.features
      : [
          t("subscription.defaultFeatures.fullAccess"),
          t("subscription.defaultFeatures.weeklyReports"),
        ];

  return (
    <article className="flex h-full min-h-[280px] flex-col justify-between rounded-[24px] border-b-[9px] border-[#c7af6d] bg-white p-7 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[#dcf4cb] px-3.5 py-1 text-sm font-bold text-[#46a302]">
            {resolveLocalizedLabel(
              locale,
              subscription.statusLabelAr,
              subscription.statusLabelEn,
              t("subscription.active"),
            )}
          </span>
          <Award className="size-7 text-[#c7af6d]" aria-hidden />
        </div>

        <div className="space-y-2 text-start">
          <h2 className="text-[28px] font-bold leading-9 text-[#2b415e]">{productName}</h2>
          <p className="text-base text-[#64748b]">
            {subscription.endsAt
              ? t("subscription.renewBefore", { date: renewDate })
              : t("subscription.noEndDate")}
          </p>
        </div>

        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-[#2b415e]">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[#2b415e]">
                <CheckCircle2 className="size-4" aria-hidden />
              </span>
              <span className="text-start">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          className="h-12 w-full rounded-xl bg-[#c7af6d] text-base font-bold text-white shadow-[0px_4px_0px_#a38f5a] hover:bg-[#b89f5d]"
          onClick={() => {
            if (onRenew) {
              onRenew(subscription);
              return;
            }
            notify.success(t("comingSoon"));
          }}
        >
          {t("subscription.renew")}
        </Button>
        <Link
          href={ROUTES.USER.PARENT.SETTINGS}
          className="block text-center text-xs text-[#64748b] underline-offset-2 hover:underline"
        >
          {t("subscription.manageInvoices")}
        </Link>
      </div>
    </article>
  );
}
