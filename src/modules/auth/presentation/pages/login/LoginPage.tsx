"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";
import { LoginInput } from "../../components";

type LoginFormState = {
  email: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormState | "root", string>>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.4 0-.6-.1-1.1-.1-1.9H12Z"
      />
      <path
        fill="#34A853"
        d="M3.6 7.6 6.8 10c.9-2.6 3.2-4.3 5.2-4.3 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.4 14.6 2.5 12 2.5 8.3 2.5 5.1 4.6 3.6 7.6Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.5c2.5 0 4.6-.8 6.1-2.2l-2.8-2.3c-.8.6-1.9 1.1-3.3 1.1-3.7 0-5.1-2.5-5.4-3.7l-3.1 2.4c1.5 3.1 4.7 4.7 8.5 4.7Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.1c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.1-.9 1.9-1.7 2.5l2.8 2.3c1.6-1.5 2.6-3.8 2.6-7.1Z"
      />
    </svg>
  );
}

export function LoginPage() {
  const t = useTranslations("auth.login");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<LoginFormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const direction = isArabic ? "rtl" : "ltr";
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const SubmitArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const callbackUrl = searchParams.get("callbackUrl");

  const submitLabel = useMemo(
    () => (isSubmitting ? t("form.submitting") : t("form.submit")),
    [isSubmitting, t],
  );

  function setField<Key extends keyof LoginFormState>(field: Key, value: LoginFormState[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, root: undefined }));
  }

  function validateForm() {
    const nextErrors: LoginFormErrors = {};
    const email = values.email.trim();

    if (!email) nextErrors.email = t("validation.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t("validation.emailInvalid");
    }
    if (!values.password.trim()) nextErrors.password = t("validation.passwordRequired");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email.trim(),
      password: values.password,
      locale,
      callbackUrl: callbackUrl ?? undefined,
    });
    if (result?.error) {
      setErrors({ root: t("validation.genericError") });
      setIsSubmitting(false);
      return;
    }

    const session = await getSession();
    const targetPath = callbackUrl ?? getRedirectPathForRole(session?.user?.role);
    router.replace(targetPath);
    router.refresh();
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
          aria-label={t("actions.backHome")}
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
              <div className="space-y-1 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--dashboard-primary)] sm:text-[2.15rem]">
                  {t("form.title")}
                </h1>
                <p className="text-sm text-slate-500">{t("form.description")}</p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <LoginInput
                  label={t("form.emailLabel")}
                  placeholder={t("form.emailPlaceholder")}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  error={errors.email}
                  onChange={(event) => setField("email", event.target.value)}
                  labelClassName="font-medium text-slate-700"
                  containerClassName="min-h-12 rounded-2xl border-[#edf1f5] bg-[#f8fafc] px-4"
                  trailing={<Mail className="h-4 w-4 shrink-0 text-slate-400" />}
                />

                <div className="space-y-1">
                  <LoginInput
                    label={t("form.passwordLabel")}
                    placeholder={t("form.passwordPlaceholder")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={values.password}
                    error={errors.password}
                    onChange={(event) => setField("password", event.target.value)}
                    labelClassName="font-medium text-slate-700"
                    containerClassName="min-h-12 rounded-2xl border-[#edf1f5] bg-[#f8fafc] px-4"
                    leading={
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-slate-400 transition-colors hover:text-[var(--dashboard-primary)]"
                        aria-label={showPassword ? t("actions.hidePassword") : t("actions.showPassword")}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    trailing={
                      <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                    }
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 underline underline-offset-2 transition-colors hover:text-[var(--dashboard-primary)]"
                    >
                      {t("form.forgotPassword")}
                    </button>
                  </div>
                </div>

                {errors.root ? (
                  <div className="rounded-2xl border border-[var(--dashboard-danger)]/20 bg-[var(--dashboard-danger-soft)] px-4 py-3 text-sm font-medium text-[var(--dashboard-danger)]">
                    {errors.root}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="dashboard-raised-button mt-3 h-12 w-full rounded-2xl bg-[var(--dashboard-primary)] text-base font-semibold text-white shadow-[var(--dashboard-shadow-button)] hover:bg-[var(--dashboard-primary)]"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {!isSubmitting ? <SubmitArrowIcon className="h-4 w-4" /> : null}
                  {submitLabel}
                </Button>

                <div className="pt-2 text-center text-sm text-slate-500">
                  <span>{t("form.signupPrompt")} </span>
                  <Link
                    href={AUTH_ROUTES.REGISTER}
                    className="font-semibold text-[var(--dashboard-primary)] transition-opacity hover:opacity-80"
                  >
                    {t("form.signupAction")}
                  </Link>
                </div>

                <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-[var(--auth-border)]" />
                  <span>{t("form.divider")}</span>
                  <span className="h-px flex-1 bg-[var(--auth-border)]" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 w-full rounded-2xl border-[#e8edf3] bg-white text-sm font-semibold text-slate-700",
                    "hover:bg-slate-50",
                  )}
                >
                  <GoogleIcon />
                  {t("form.google")}
                </Button>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
