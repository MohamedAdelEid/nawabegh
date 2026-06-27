"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, KeyRound, Lock, Shield, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CheckoutSessionDto } from "@/modules/student/domain/enrollment/enrollment.types";
import { CheckoutSessionStatus } from "@/modules/student/domain/enrollment/enrollment.enums";
import { cn } from "@/shared/application/lib/cn";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";

export type CheckoutPaymentMethodTab = "visa" | "activation";

type CheckoutPaymentPanelProps = {
  session: CheckoutSessionDto;
  activeTab: CheckoutPaymentMethodTab;
  onTabChange: (tab: CheckoutPaymentMethodTab) => void;
  onApplyCoupon: (code: string) => Promise<void>;
  onInitiateVisa: () => Promise<void>;
  onRedeemCode: (code: string) => Promise<void>;
  isApplyingCoupon?: boolean;
  isInitiatingVisa?: boolean;
  isRedeemingCode?: boolean;
  errorMessage?: string | null;
};

export function CheckoutPaymentPanel({
  session,
  activeTab,
  onTabChange,
  onApplyCoupon,
  onInitiateVisa,
  onRedeemCode,
  isApplyingCoupon = false,
  isInitiatingVisa = false,
  isRedeemingCode = false,
  errorMessage,
}: CheckoutPaymentPanelProps) {
  const t = useTranslations("student.dashboard.checkout.payment");
  const [couponCode, setCouponCode] = useState("");
  const [activationCode, setActivationCode] = useState("");

  const canApplyCoupon = session.status === CheckoutSessionStatus.AwaitingMethod;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)] md:p-8"
    >
      <div className="mb-6 flex items-center gap-2">
        {activeTab === "visa" ? (
          <CreditCard className="size-5 text-[#c7af6d]" aria-hidden />
        ) : (
          <KeyRound className="size-5 text-[#c7af6d]" aria-hidden />
        )}
        <h2 className="text-lg font-bold text-[#2b415e]">
          {activeTab === "visa" ? t("visaTitle") : t("activationTitle")}
        </h2>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onTabChange("visa")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors",
            activeTab === "visa"
              ? "border-[#c7af6d] bg-[#c7af6d] text-white"
              : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]",
          )}
        >
          <CreditCard className="size-4" aria-hidden />
          {t("tabVisa")}
        </button>
        <button
          type="button"
          onClick={() => onTabChange("activation")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors",
            activeTab === "activation"
              ? "border-[#c7af6d] bg-white text-[#2b415e]"
              : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]",
          )}
        >
          <KeyRound className="size-4" aria-hidden />
          {t("tabActivation")}
        </button>
      </div>

      {errorMessage ? (
        <ApiFailureAlert message={errorMessage} className="mb-4" />
      ) : null}

      {activeTab === "visa" ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-[#64748b]">{t("visaDescription")}</p>

          <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5">
            <div className="mb-3 flex items-center gap-2 text-[#2b415e]">
              <Shield className="size-5 text-[#c7af6d]" aria-hidden />
              <span className="text-sm font-bold">{t("securePaymentTitle")}</span>
            </div>
            <p className="text-xs leading-5 text-[#64748b]">{t("securePaymentDescription")}</p>
          </div>

          {canApplyCoupon ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2b415e]">{t("couponLabel")}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t("couponPlaceholder")}
                  className="h-12 flex-1 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#c7af6d]"
                />
                <Button
                  type="button"
                  disabled={!couponCode.trim() || isApplyingCoupon}
                  onClick={() => void onApplyCoupon(couponCode.trim())}
                  className="h-12 rounded-xl bg-[#c7af6d] px-5 font-bold text-white hover:bg-[#b9a264]"
                >
                  {t("couponApply")}
                </Button>
              </div>
            </div>
          ) : null}

          <Button
            type="button"
            disabled={isInitiatingVisa}
            onClick={() => void onInitiateVisa()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c7af6d] text-base font-bold text-white hover:bg-[#b9a264]"
          >
            <Lock className="size-4" aria-hidden />
            {isInitiatingVisa ? t("redirecting") : t("payNow")}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-[#64748b]">{t("activationDescription")}</p>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2b415e]">{t("activationCodeLabel")}</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder={t("activationCodePlaceholder")}
                className="h-12 w-full rounded-xl border border-[#e2e8f0] bg-white px-4 pe-11 text-sm uppercase tracking-widest outline-none focus:border-[#c7af6d]"
              />
            </div>
            <p className="text-xs text-[#94a3b8]">{t("activationCodeHint")}</p>
          </div>

          <Button
            type="button"
            disabled={!activationCode.trim() || isRedeemingCode}
            onClick={() => void onRedeemCode(activationCode.trim())}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c7af6d] text-base font-bold text-white hover:bg-[#b9a264]"
          >
            <Sparkles className="size-4" aria-hidden />
            {isRedeemingCode ? t("verifying") : t("verifyAndActivate")}
          </Button>

          <p className="text-center text-xs text-[#64748b]">{t("noCodeSupport")}</p>
        </div>
      )}
    </motion.section>
  );
}
