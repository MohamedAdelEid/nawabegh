"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";
import { resolveStudentPostAuthPath } from "@/modules/student/application/lib/resolveStudentPostAuthPath";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";
import { useSession } from "next-auth/react";

const COUNTDOWN_SECONDS = 5;

export function RegistrationSuccessPage() {
  const t = useTranslations("auth.registration.success");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  const resetRegistration = useRegistrationStore((state) => state.reset);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  async function navigateAfterRegistration() {
    resetRegistration();
    let destination: string = getRedirectPathForRole(session?.user?.role);
    if (session?.user?.role?.trim().toLowerCase() === "student" && session.user.id) {
      destination = await resolveStudentPostAuthPath(session.user.id);
    }
    router.replace(destination);
    router.refresh();
  }

  useEffect(() => {
    if (status !== "authenticated") return;

    if (secondsLeft <= 0) {
      void navigateAfterRegistration();
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(AUTH_ROUTES.LOGIN);
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <main
      dir={direction}
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--auth-background)] px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-md flex-col items-center gap-8 rounded-3xl border border-[var(--auth-border)] bg-[var(--auth-card)] p-10 text-center shadow-[var(--auth-shadow)]"
      >
        <Image
          src="/images/logos/main-logo.png"
          alt={t("brandAlt")}
          width={140}
          height={44}
          className="h-auto w-[120px] object-contain"
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
          className="flex size-24 items-center justify-center rounded-full bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success)]"
        >
          <CheckCircle2 className="size-14" strokeWidth={1.5} aria-hidden />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-2xl font-bold text-[var(--dashboard-primary)]">{t("title")}</h1>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
          <p className="text-xs font-medium text-slate-400">
            {t("countdown", { seconds: secondsLeft })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="w-full"
        >
          <Button
            type="button"
            onClick={() => void navigateAfterRegistration()}
            className={cn(
              "h-14 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-bold text-white",
              "shadow-[var(--dashboard-shadow-button)]",
            )}
          >
            {t("goToPlatform")}
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
