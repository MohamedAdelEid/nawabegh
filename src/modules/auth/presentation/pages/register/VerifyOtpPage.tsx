"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone } from "lucide-react";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { Field, FieldError } from "@/shared/presentation/components/ui/field";
import { OtpInput } from "@/shared/presentation/components/ui/otp-input";
import { cn } from "@/shared/application/lib/cn";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import {
  confirmEmailOtp,
  resendEmailOtp,
} from "@/modules/auth/infrastructure/api/student-registration.api";
import { mapConfirmOtpResponseToSession } from "@/modules/auth/infrastructure/authSession";
import {
  getOtpLengthForVerificationTarget,
  type VerificationTarget,
} from "@/modules/auth/domain/types/student-registration.types";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";

const RESEND_SECONDS = 60;

type OtpVerificationConfig = {
  target: VerificationTarget;
  email: string;
};

export function VerifyOtpPage() {
  const t = useTranslations("auth.registration.otp");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const verification = useRegistrationStore((state) => state.verification);

  const config: OtpVerificationConfig | null = useMemo(() => {
    if (!verification?.email) return null;
    return { target: verification.target, email: verification.email };
  }, [verification]);

  const otpLength = config
    ? getOtpLengthForVerificationTarget(config.target)
    : getOtpLengthForVerificationTarget("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!config) {
      router.replace(AUTH_ROUTES.REGISTER);
    }
  }, [config, router]);

  useEffect(() => {
    setOtp((current) => current.slice(0, otpLength));
  }, [otpLength]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const isEmailVerification = config?.target === "email";

  const hint = isEmailVerification
    ? t("emailHint", { email: config!.email })
    : t("phoneHint");

  const pageTitle = isEmailVerification ? t("title") : t("phoneTitle");

  const handleConfirm = useCallback(async () => {
    if (!config) return;
    if (otp.length !== otpLength) {
      setError(t("validation.incomplete", { length: otpLength }));
      return;
    }

    setIsConfirming(true);
    setError(undefined);

    try {
      const response = await confirmEmailOtp(
        { email: config.email, otp },
        t("errors.confirmFailed"),
      );

      if (!response.data) {
        throw new Error(t("errors.confirmFailed"));
      }

      const sessionPayload = mapConfirmOtpResponseToSession(response.data);
      if (!sessionPayload) {
        throw new Error(t("errors.sessionFailed"));
      }

      setSuccess(true);

      const signInResult = await signIn("registration-otp", {
        redirect: false,
        accessToken: sessionPayload.accessToken,
        refreshToken: sessionPayload.refreshToken ?? "",
        accessTokenExpiresAt: sessionPayload.accessTokenExpiresAt,
        userId: sessionPayload.user.id,
        userName: sessionPayload.user.name,
        email: sessionPayload.user.email,
        role: sessionPayload.user.role,
        avatar: sessionPayload.user.avatar ?? "",
        domainUid: sessionPayload.user.domainUid ?? "",
      });

      if (signInResult?.error) {
        throw new Error(t("errors.sessionFailed"));
      }

      router.replace(AUTH_ROUTES.REGISTER_SUCCESS);
    } catch (confirmError) {
      setSuccess(false);
      const message =
        confirmError instanceof Error ? confirmError.message : t("errors.confirmFailed");
      setError(message);
      notify.error(message);
    } finally {
      setIsConfirming(false);
    }
  }, [config, otp, otpLength, router, t]);

  const handleResend = async () => {
    if (!config || secondsLeft > 0 || isResending) return;

    setIsResending(true);
    setError(undefined);

    try {
      await resendEmailOtp({ email: config.email }, t("errors.resendFailed"));
      notify.success(isEmailVerification ? t("resendSuccess") : t("resendSuccessPhone"));
      setSecondsLeft(RESEND_SECONDS);
      setOtp("");
    } catch (resendError) {
      const message =
        resendError instanceof Error ? resendError.message : t("errors.resendFailed");
      notify.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (!config) {
    return null;
  }

  return (
    <main dir={direction} className="min-h-screen bg-[var(--auth-background)]">
      <header className="flex w-full items-center justify-between px-8 py-9 lg:px-10">
        <Image
          src="/images/logos/main-logo.png"
          alt={t("brandAlt")}
          width={169}
          height={54}
          priority
          className="h-auto w-[120px] object-contain sm:w-[169px]"
        />
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-sm font-semibold text-[var(--dashboard-primary)] hover:underline"
        >
          {t("loginLink")}
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col items-center justify-center px-4 pb-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-3xl border border-[var(--auth-border)] bg-[var(--auth-card)] p-8 shadow-[var(--auth-shadow)] sm:p-10"
        >
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eef2f8] text-[var(--dashboard-primary)]">
              {isEmailVerification ? (
                <Mail className="size-7" aria-hidden />
              ) : (
                <Phone className="size-7" aria-hidden />
              )}
            </span>
            <h1 className="text-2xl font-bold text-[var(--dashboard-primary)]">{pageTitle}</h1>
            <p className="text-sm text-slate-500">{hint}</p>
          </div>

          <Field invalid={Boolean(error)} className="items-center gap-4">
            <OtpInput
              key={otpLength}
              value={otp}
              onChange={setOtp}
              length={otpLength}
              disabled={isConfirming || success}
              invalid={Boolean(error)}
              success={success}
              aria-label={t("otpLabel")}
              className={otpLength > 4 ? "gap-2 sm:gap-3" : undefined}
            />
            <FieldError message={error} className="text-center" />
          </Field>

          <div className="mt-8 flex flex-col gap-4">
            <Button
              type="button"
              disabled={isConfirming || otp.length !== otpLength}
              onClick={() => void handleConfirm()}
              className={cn(
                "h-14 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-bold text-white",
                "shadow-[var(--dashboard-shadow-button)]",
              )}
            >
              {isConfirming ? <Loader2 className="size-5 animate-spin" /> : null}
              {t("confirm")}
            </Button>

            <button
              type="button"
              disabled={secondsLeft > 0 || isResending}
              onClick={() => void handleResend()}
              className={cn(
                "text-sm font-semibold transition-colors",
                secondsLeft > 0 || isResending
                  ? "cursor-not-allowed text-slate-400"
                  : "text-[var(--dashboard-primary)] hover:underline",
              )}
            >
              {isResending
                ? t("resending")
                : secondsLeft > 0
                  ? t("resendCountdown", { seconds: secondsLeft })
                  : t("resend")}
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
