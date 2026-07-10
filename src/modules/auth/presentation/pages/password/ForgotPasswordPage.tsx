"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { requestForgotPassword } from "@/modules/auth/infrastructure/api/password.api";
import { LoginInput } from "@/modules/auth/presentation/components";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function ForgotPasswordPage() {
  const t = useTranslations("auth.password.forgot");
  const tv = useTranslations("auth.password.validation");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const trimmedEmail = email.trim();

  const resetHref = useMemo(
    () =>
      trimmedEmail
        ? `${AUTH_ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(trimmedEmail)}`
        : AUTH_ROUTES.RESET_PASSWORD,
    [trimmedEmail],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    if (!trimmedEmail) {
      setError(tv("emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(tv("emailInvalid"));
      return;
    }

    setIsSubmitting(true);
    try {
      await requestForgotPassword({ email: trimmedEmail }, tv("genericError"));
      setSent(true);
      toast.success(t("successDescription"));
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : tv("genericError");
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main dir={direction} className="min-h-screen bg-[var(--auth-background)]">
      <header className="flex w-full items-center justify-between px-8 py-9 lg:px-10">
        <Image
          src="/images/logos/main-logo.png"
          alt={t("brandAlt")}
          width={176}
          height={56}
          priority
          className="h-auto w-[132px] object-contain sm:w-[176px]"
        />
        <Link
          href={ROUTES.HOME}
          aria-label={t("backToLogin")}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-[var(--dashboard-primary)] transition-colors hover:bg-slate-100"
        >
          <BackIcon className="h-7 w-7" />
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl flex-col px-4 pb-12 sm:px-6">
        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-[26rem]"
          >
            <div className="w-full rounded-[2rem] border border-[#eef2f7] bg-[var(--auth-card)] px-6 py-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-9 sm:py-8">
              {sent ? (
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eef2f8] text-[var(--dashboard-primary)]">
                    <Mail className="size-7" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-[var(--dashboard-primary)]">
                      {t("successTitle")}
                    </h1>
                    <p className="text-sm text-slate-500">{t("successDescription")}</p>
                  </div>
                  <Button
                    type="button"
                    className="dashboard-raised-button h-12 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-semibold text-white"
                    onClick={() => router.push(resetHref)}
                  >
                    {t("continueToReset")}
                  </Button>
                  <Link
                    href={AUTH_ROUTES.LOGIN}
                    className="block text-sm font-semibold text-[var(--dashboard-primary)] hover:underline"
                  >
                    {t("backToLogin")}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-1 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--dashboard-primary)] sm:text-[2.15rem]">
                      {t("title")}
                    </h1>
                    <p className="text-sm text-slate-500">{t("description")}</p>
                  </div>

                  <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <LoginInput
                      label={t("emailLabel")}
                      placeholder={t("emailPlaceholder")}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      error={error}
                      onChange={(event) => setEmail(event.target.value)}
                      labelClassName="font-medium text-slate-700"
                      containerClassName="min-h-12 rounded-2xl bg-[#f8fafc] px-4"
                      trailing={<Mail className="h-4 w-4 shrink-0 text-slate-400" />}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="dashboard-raised-button mt-3 h-12 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-semibold text-white shadow-[var(--dashboard-shadow-button)] hover:bg-[var(--dashboard-primary)]"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? t("submitting") : t("submit")}
                    </Button>

                    <div className="pt-2 text-center text-sm text-slate-500">
                      <Link
                        href={AUTH_ROUTES.LOGIN}
                        className="font-semibold text-[var(--dashboard-primary)] transition-opacity hover:opacity-80"
                      >
                        {t("backToLogin")}
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
