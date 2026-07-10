"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import { Field, FieldError } from "@/shared/presentation/components/ui/field";
import { OtpInput } from "@/shared/presentation/components/ui/otp-input";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import {
  requestForgotPassword,
  resetPasswordWithOtp,
} from "@/modules/auth/infrastructure/api/password.api";
import { LoginInput } from "@/modules/auth/presentation/components";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function validatePassword(password: string, tv: (key: string) => string) {
  if (password.length < 8) return tv("passwordMin");
  if (!/[A-Z]/.test(password)) return tv("passwordUppercase");
  if (!/[a-z]/.test(password)) return tv("passwordLowercase");
  if (!/\d/.test(password)) return tv("passwordNumber");
  if (!/[^A-Za-z0-9]/.test(password)) return tv("passwordSymbol");
  return undefined;
}

export function ResetPasswordPage() {
  const t = useTranslations("auth.password.reset");
  const tv = useTranslations("auth.password.validation");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [email, setEmail] = useState(searchParams.get("email")?.trim() ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    const fromQuery = searchParams.get("email")?.trim();
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || secondsLeft > 0 || isResending) return;

    setIsResending(true);
    setError(undefined);
    try {
      await requestForgotPassword({ email: trimmedEmail }, tv("genericError"));
      toast.success(t("resendSuccess"));
      setSecondsLeft(RESEND_SECONDS);
      setOtp("");
    } catch (resendError) {
      const message =
        resendError instanceof Error ? resendError.message : tv("genericError");
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }, [email, isResending, secondsLeft, t, tv]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(tv("emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(tv("emailInvalid"));
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setError(tv("otpIncomplete", { length: OTP_LENGTH }));
      return;
    }

    const passwordError = validatePassword(newPassword, tv);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(tv("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithOtp(
        {
          email: trimmedEmail,
          otp,
          newPassword,
          confirmPassword,
        },
        tv("genericError"),
      );
      setSuccess(true);
      toast.success(t("successTitle"));
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
          href={AUTH_ROUTES.LOGIN}
          className="text-sm font-semibold text-[var(--dashboard-primary)] hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col items-center justify-center px-4 pb-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-3xl border border-[var(--auth-border)] bg-[var(--auth-card)] p-8 shadow-[var(--auth-shadow)] sm:p-10"
        >
          {success ? (
            <div className="space-y-6 text-center">
              <h1 className="text-2xl font-bold text-[var(--dashboard-primary)]">
                {t("successTitle")}
              </h1>
              <p className="text-sm text-slate-500">{t("successDescription")}</p>
              <Button
                type="button"
                className="h-12 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-bold text-white"
                onClick={() => router.push(AUTH_ROUTES.LOGIN)}
              >
                {t("backToLogin")}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-2 text-center">
                <h1 className="text-2xl font-bold text-[var(--dashboard-primary)]">{t("title")}</h1>
                <p className="text-sm text-slate-500">{t("description")}</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <LoginInput
                  label={t("emailLabel")}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  labelClassName="font-medium text-slate-700"
                  containerClassName="min-h-12 rounded-2xl bg-[#f8fafc] px-4"
                />

                <Field invalid={Boolean(error)} className="items-center gap-4">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    length={OTP_LENGTH}
                    disabled={isSubmitting}
                    invalid={Boolean(error)}
                    aria-label={t("otpLabel")}
                  />
                </Field>

                <LoginInput
                  label={t("newPasswordLabel")}
                  placeholder={t("newPasswordPlaceholder")}
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  labelClassName="font-medium text-slate-700"
                  containerClassName="min-h-12 rounded-2xl bg-[#f8fafc] px-4"
                  leading={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="text-slate-400 transition-colors hover:text-[var(--dashboard-primary)]"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  trailing={<LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />}
                />

                <LoginInput
                  label={t("confirmPasswordLabel")}
                  placeholder={t("confirmPasswordPlaceholder")}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  labelClassName="font-medium text-slate-700"
                  containerClassName="min-h-12 rounded-2xl bg-[#f8fafc] px-4"
                  leading={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="text-slate-400 transition-colors hover:text-[var(--dashboard-primary)]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  trailing={<LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />}
                />

                {error ? (
                  <FieldError message={error} className="text-center" />
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-bold text-white shadow-[var(--dashboard-shadow-button)]"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>

                <button
                  type="button"
                  disabled={secondsLeft > 0 || isResending || !email.trim()}
                  onClick={() => void handleResend()}
                  className="w-full text-sm font-semibold text-[var(--dashboard-primary)] disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {isResending
                    ? t("resending")
                    : secondsLeft > 0
                      ? t("resendCountdown", { seconds: secondsLeft })
                      : t("resend")}
                </button>
              </form>
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
}
