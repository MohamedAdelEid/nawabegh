"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { ACCOUNT_TYPE_OPTIONS } from "@/modules/auth/application/constants/accountTypeOptions";
import { AccountTypeCard } from "@/modules/auth/presentation/components/account-type/AccountTypeCard";
import type { AccountTypeId } from "@/modules/auth/domain/types/account-type.types";
import { cn } from "@/shared/application/lib/cn";

export function AccountTypeSelectionPage() {
  const t = useTranslations("auth.accountType");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const ContinueIcon = isArabic ? ArrowLeft : ArrowRight;

  const [selectedType, setSelectedType] = useState<AccountTypeId | null>(null);

  const selectedOption = ACCOUNT_TYPE_OPTIONS.find((option) => option.id === selectedType);
  const canContinue = selectedOption?.supportsRegistration ?? false;

  const continueLabel =
    selectedType === "school" ? t("actions.continueActivation") : t("actions.continueRegistration");

  const REGISTRATION_ROUTES: Record<AccountTypeId, string> = {
    student: AUTH_ROUTES.REGISTER_STUDENT,
    school: AUTH_ROUTES.REGISTER_SCHOOL,
    parent: AUTH_ROUTES.REGISTER_PARENT,
    teacher: AUTH_ROUTES.REGISTER_TEACHER,
  };

  function handleContinue() {
    if (!selectedType) return;

    const target = REGISTRATION_ROUTES[selectedType];
    if (target) {
      router.push(target);
      return;
    }

    toast.info(t("messages.comingSoon"));
  }

  return (
    <main dir={direction} className="min-h-screen bg-[#fafafa]">
      <header className="flex w-full items-center justify-center px-8 py-9 lg:px-10">
        <Image
          src="/images/logos/main-logo.png"
          alt={t("brandAlt")}
          width={177}
          height={54}
          priority
          className="h-auto w-[132px] object-contain sm:w-[177px]"
        />
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1440px] flex-col items-center px-4 pb-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex w-full max-w-[1312px] flex-col items-center"
        >
          <div className="mb-12 space-y-4 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--dashboard-primary)] sm:text-5xl">
              {t("pageTitle")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-500 sm:text-xl">
              {t("pageSubtitle")}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-start justify-center gap-8">
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <AccountTypeCard
                key={option.id}
                typeId={option.id}
                iconSrc={option.iconSrc}
                iconBgClass={option.iconBgClass}
                selected={selectedType === option.id}
                onSelect={setSelectedType}
              />
            ))}
          </div>

          <div className="mt-16 flex w-full max-w-md flex-col items-center gap-6">
            <Button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              className={cn(
                "dashboard-raised-button h-16 w-full rounded-2xl text-lg font-bold text-white shadow-[0_4px_0_0_#1e2e42]",
                canContinue
                  ? "bg-[var(--dashboard-primary)] hover:bg-[var(--dashboard-primary)]"
                  : "bg-[var(--dashboard-primary)] opacity-60 hover:bg-[var(--dashboard-primary)]",
              )}
            >
              {canContinue ? <ContinueIcon className="size-4" aria-hidden /> : null}
              {continueLabel}
            </Button>

            <p className="text-center text-sm text-slate-500">
              <span>{t("loginPrompt")} </span>
              <Link
                href={AUTH_ROUTES.LOGIN}
                className="font-bold text-[var(--dashboard-primary)] underline-offset-2 hover:underline"
              >
                {t("loginAction")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
