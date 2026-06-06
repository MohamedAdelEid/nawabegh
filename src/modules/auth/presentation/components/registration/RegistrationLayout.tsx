"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { RegistrationStepper } from "./RegistrationStepper";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";

type RegistrationLayoutProps = {
  children: ReactNode;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const t = useTranslations("auth.registration");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const currentStep = useRegistrationStore((state) => state.currentStep);
  const previousStep = useRegistrationStore((state) => state.previousStep);

  const handleBack = () => {
    if (currentStep === "account") {
      router.back();
      return;
    }
    previousStep();
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <motion.header
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="flex w-full items-center justify-between px-8 py-9 lg:px-10"
      >
        <Image
          src="/images/logos/main-logo.png"
          alt={t("brandAlt")}
          width={169}
          height={54}
          priority
          className="h-auto w-[120px] object-contain sm:w-[169px]"
        />

        <button
          type="button"
          onClick={handleBack}
          aria-label={t("actions.back")}
          className="inline-flex size-[50px] shrink-0 items-center justify-center rounded-full text-[var(--dashboard-primary)] transition-colors hover:bg-slate-100"
        >
          {isArabic ? <ArrowLeft className="size-7" /> : <ArrowRight className="size-7" />}
        </button>
      </motion.header>

      <div className="mx-auto w-full max-w-3xl px-4 pb-12 sm:px-6">
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-8 space-y-3 text-center"
        >
          <h1 className="text-3xl font-bold text-[var(--dashboard-primary)] sm:text-4xl">
            {t("pageTitle")}
          </h1>
          <p className="text-base text-slate-500 sm:text-lg">{t("pageSubtitle")}</p>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
          <RegistrationStepper />
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        // className="mt-8"
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}

type RegistrationCardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
};

export function RegistrationCard({ children, title = "", subtitle = "", footer }: RegistrationCardProps) {
  return (
    <div className="rounded-[20px] bg-white shadow-[var(--dashboard-shadow-soft)]">
      {title || subtitle ? (
        <div className="space-y-3 px-6 pt-12 text-center sm:px-12">
          <h2 className="text-[1.875rem] font-bold leading-9 text-[var(--dashboard-primary)]">
            {title}
          </h2>
          <p className="text-base text-slate-500">{subtitle}</p>
        </div>
      ) : null}

      <div className="px-6 pb-8 pt-10 sm:px-12">{children}</div>

      {footer ? (
        <div className="border-t border-transparent px-6 pb-8 text-center sm:px-12">{footer}</div>
      ) : null}
    </div>
  );
}

type RegistrationLoginLinkProps = {
  className?: string;
};

export function RegistrationLoginLink({ className }: RegistrationLoginLinkProps) {
  const t = useTranslations("auth.registration");

  return (
    <p className={cn("text-center text-sm text-slate-500", className)}>
      <span>{t("loginPrompt")} </span>
      <Link
        href={AUTH_ROUTES.LOGIN}
        className="font-bold text-[var(--dashboard-primary)] underline-offset-2 hover:underline"
      >
        {t("loginAction")}
      </Link>
    </p>
  );
}
