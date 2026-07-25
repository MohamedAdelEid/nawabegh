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
import { resolveStudentPostAuthPath } from "@/modules/student/application/lib/resolveStudentPostAuthPath";
import type { GoogleAuthRole } from "@/modules/auth/domain/types/login.types";
import { GoogleIcon, GoogleLoginRoleModal, LoginInput } from "../../components";

type LoginFormState = {
  email: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormState | "root", string>>;

export function LoginPage() {
  const t = useTranslations("auth.login");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
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

  async function redirectAfterAuth() {
    const session = await getSession();
    let targetPath = callbackUrl ?? getRedirectPathForRole(session?.user?.role);

    if (
      !callbackUrl &&
      session?.user?.role?.trim().toLowerCase() === "student" &&
      session.user.id
    ) {
      targetPath = await resolveStudentPostAuthPath(session.user.id);
    }

    router.replace(targetPath);
    router.refresh();
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

    await redirectAfterAuth();
  }

  async function handleGoogleCredential(idToken: string, role: GoogleAuthRole) {
    setIsGoogleSubmitting(true);
    setGoogleError(null);

    const result = await signIn("google", {
      redirect: false,
      idToken,
      role,
      locale,
    });

    if (result?.error) {
      setGoogleError(t("validation.googleError"));
      setIsGoogleSubmitting(false);
      return;
    }

    setGoogleModalOpen(false);
    setGoogleError(null);
    await redirectAfterAuth();
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
                  containerClassName="min-h-12 rounded-2xl bg-[#f8fafc] px-4"
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
                    containerClassName="min-h-12 rounded-2xl bg-[#f8fafc] px-4"
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
                    <Link
                      href={AUTH_ROUTES.FORGOT_PASSWORD}
                      className="text-xs font-medium text-slate-500 underline underline-offset-2 transition-colors hover:text-[var(--dashboard-primary)]"
                    >
                      {t("form.forgotPassword")}
                    </Link>
                  </div>
                </div>

                {errors.root ? (
                  <div className="rounded-2xl border border-[var(--dashboard-danger)]/20 bg-[var(--dashboard-danger-soft)] px-4 py-3 text-sm font-medium text-[var(--dashboard-danger)]">
                    {errors.root}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
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
                  disabled={isSubmitting || isGoogleSubmitting}
                  onClick={() => {
                    setGoogleError(null);
                    setGoogleModalOpen(true);
                  }}
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

      <GoogleLoginRoleModal
        open={googleModalOpen}
        onOpenChange={(open) => {
          setGoogleModalOpen(open);
          if (!open) setGoogleError(null);
        }}
        isSubmitting={isGoogleSubmitting}
        errorMessage={googleError}
        onCredential={handleGoogleCredential}
        onError={(message) => {
          setGoogleError(message);
          setIsGoogleSubmitting(false);
        }}
      />
    </main>
  );
}
