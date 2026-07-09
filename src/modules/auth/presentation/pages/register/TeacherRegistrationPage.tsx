"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";
import { cn } from "@/shared/application/lib/cn";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import type { Country } from "@/shared/domain/types/country.types";
import { countryIdToPhoneCountry } from "@/shared/domain/utils/phoneCountry.utils";
import { splitE164ForApi } from "@/modules/auth/domain/utils/phoneNumber.utils";
import {
  teacherRegistrationSchema,
  type TeacherRegistrationSchemaInput,
} from "@/modules/auth/domain/schemas/teacher-registration.schema";
import { submitTeacherRegistration } from "@/modules/auth/infrastructure/api/teacher-registration.api";
import { AuthFormHeader } from "@/modules/auth/presentation/components/shared/AuthFormHeader";
import { CountrySelectField } from "@/modules/auth/presentation/components/shared/CountrySelectField";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";

type TeacherRegistrationPageProps = {
  countries: Country[];
  defaultCountryId: number | null;
};

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-end border-r-4 border-[var(--dashboard-gold)] pe-5">
      <h2 className="text-xl font-bold text-[#021c37]">{children}</h2>
    </div>
  );
}

export function TeacherRegistrationPage({
  countries,
  defaultCountryId,
}: TeacherRegistrationPageProps) {
  const t = useTranslations("auth.teacherRegistration");
  const locale = useLocale();
  const router = useRouter();
  const setVerification = useRegistrationStore((state) => state.setVerification);
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const SubmitIcon = isArabic ? ArrowLeft : ArrowRight;

  const [submitError, setSubmitError] = useState<string | undefined>();

  const form = useForm<TeacherRegistrationSchemaInput>({
    resolver: zodResolver(teacherRegistrationSchema),
    defaultValues: {
      jobTitle: "",
      schoolName: "",
      email: "",
      phone: "",
      countryId: defaultCountryId ?? 0,
      address: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onSubmit",
  });

  const validationMessage = useMemo(
    () => ({
      required: t("validation.required"),
      invalidEmail: t("validation.invalidEmail"),
      invalidPhone: t("validation.invalidPhone"),
      passwordMin: t("validation.passwordMin"),
      passwordNumber: t("validation.passwordNumber"),
      passwordSymbol: t("validation.passwordSymbol"),
      passwordMismatch: t("validation.passwordMismatch"),
      acceptTerms: t("validation.acceptTerms"),
    }),
    [t],
  );

  const resolveError = (key?: string) => {
    if (!key) return undefined;
    return validationMessage[key as keyof typeof validationMessage] ?? key;
  };

  const countryId = form.watch("countryId");

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    const phone = splitE164ForApi(values.phone);
    if (!phone) {
      form.setError("phone", { message: "invalidPhone" });
      return;
    }

    const fallbackMessage = t("messages.submitError");
    try {
      await submitTeacherRegistration(
        {
          jobTitle: values.jobTitle.trim(),
          schoolName: values.schoolName.trim(),
          countryId: values.countryId,
          email: values.email.trim(),
          password: values.password,
          phoneNumber: phone.phoneNumber,
          phoneCountryCode: phone.phoneCountryCode,
          address: (values.address ?? "").trim(),
        },
        fallbackMessage,
      );
      setVerification({ target: "email", email: values.email.trim() });
      toast.success(t("messages.submitSuccess"));
      router.push(AUTH_ROUTES.REGISTER_VERIFY);
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      setSubmitError(message);
      toast.error(message);
    }
  });

  const acceptTermsError = resolveError(form.formState.errors.acceptTerms?.message);

  return (
    <main dir={direction} className="min-h-screen bg-[#fafafa]">
      <AuthFormHeader brandAlt={t("brandAlt")} backLabel={t("actions.back")} />

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl flex-col items-center px-4 pb-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex w-full max-w-[864px] flex-col items-center gap-10"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-[#dbe3f3] text-[var(--dashboard-primary)]">
              <GraduationCap className="size-9" aria-hidden />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-[#021c37]">{t("title")}</h1>
              <p className="mx-auto max-w-xl text-lg text-slate-500">{t("subtitle")}</p>
            </div>
          </div>

          <div className="w-full rounded-[20px] bg-white px-6 py-10 shadow-[0_8px_0_0_rgba(0,0,0,0.05)] sm:px-12 sm:py-12">
            <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
              <section className="flex flex-col gap-6">
                <SectionHeader>{t("sections.personal")}</SectionHeader>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field invalid={Boolean(form.formState.errors.schoolName)}>
                    <FieldLabel
                      htmlFor="teacher-school"
                      required
                      icon={<School className="size-3.5" aria-hidden />}
                    >
                      {t("fields.schoolName.label")}
                    </FieldLabel>
                    <Input
                      id="teacher-school"
                      value={form.watch("schoolName")}
                      onChange={(event) =>
                        form.setValue("schoolName", event.target.value, { shouldValidate: true })
                      }
                      placeholder={t("fields.schoolName.placeholder")}
                    />
                    <FieldError message={resolveError(form.formState.errors.schoolName?.message)} />
                  </Field>

                  <Field invalid={Boolean(form.formState.errors.jobTitle)}>
                    <FieldLabel
                      htmlFor="teacher-jobTitle"
                      required
                      icon={<Briefcase className="size-3.5" aria-hidden />}
                    >
                      {t("fields.jobTitle.label")}
                    </FieldLabel>
                    <Input
                      id="teacher-jobTitle"
                      value={form.watch("jobTitle")}
                      onChange={(event) =>
                        form.setValue("jobTitle", event.target.value, { shouldValidate: true })
                      }
                      placeholder={t("fields.jobTitle.placeholder")}
                    />
                    <FieldError message={resolveError(form.formState.errors.jobTitle?.message)} />
                  </Field>

                  <Field invalid={Boolean(form.formState.errors.phone)}>
                    <FieldLabel htmlFor="teacher-phone" required>
                      {t("fields.phone.label")}
                    </FieldLabel>
                    <PhoneInput
                      id="teacher-phone"
                      value={form.watch("phone")}
                      onChange={(value) =>
                        form.setValue("phone", value, { shouldValidate: true })
                      }
                      defaultCountry={countryIdToPhoneCountry(countryId || undefined)}
                      locale={locale}
                      invalid={Boolean(form.formState.errors.phone)}
                      placeholder={t("fields.phone.placeholder")}
                      countrySearchPlaceholder={t("fields.phone.countrySearchPlaceholder")}
                      countryEmptyMessage={t("fields.phone.countryEmpty")}
                    />
                    <FieldError message={resolveError(form.formState.errors.phone?.message)} />
                  </Field>

                  <Field invalid={Boolean(form.formState.errors.email)}>
                    <FieldLabel
                      htmlFor="teacher-email"
                      required
                      icon={<Mail className="size-3.5" aria-hidden />}
                    >
                      {t("fields.email.label")}
                    </FieldLabel>
                    <Input
                      id="teacher-email"
                      type="email"
                      value={form.watch("email")}
                      onChange={(event) =>
                        form.setValue("email", event.target.value, { shouldValidate: true })
                      }
                      placeholder={t("fields.email.placeholder")}
                    />
                    <FieldError message={resolveError(form.formState.errors.email?.message)} />
                  </Field>
                </div>
              </section>

              <section className="flex flex-col gap-6">
                <SectionHeader>{t("sections.location")}</SectionHeader>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field invalid={Boolean(form.formState.errors.address)}>
                    <FieldLabel
                      htmlFor="teacher-address"
                      icon={<MapPin className="size-3.5" aria-hidden />}
                    >
                      {t("fields.address.label")}
                    </FieldLabel>
                    <Input
                      id="teacher-address"
                      value={form.watch("address") ?? ""}
                      onChange={(event) => form.setValue("address", event.target.value)}
                      placeholder={t("fields.address.placeholder")}
                    />
                    <FieldError message={resolveError(form.formState.errors.address?.message)} />
                  </Field>

                  <Controller
                    name="countryId"
                    control={form.control}
                    render={({ field }) => (
                      <CountrySelectField
                        label={t("fields.country.label")}
                        placeholder={t("fields.country.placeholder")}
                        searchPlaceholder={t("fields.country.searchPlaceholder")}
                        emptyMessage={t("fields.country.empty")}
                        loadErrorMessage={t("fields.country.loadError")}
                        value={field.value > 0 ? field.value : null}
                        onChange={(next) => field.onChange(next)}
                        countries={countries}
                        required
                        error={resolveError(form.formState.errors.countryId?.message)}
                      />
                    )}
                  />
                </div>
              </section>

              <section className="flex flex-col gap-6">
                <SectionHeader>{t("sections.security")}</SectionHeader>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field invalid={Boolean(form.formState.errors.confirmPassword)}>
                    <FieldLabel
                      htmlFor="teacher-confirmPassword"
                      required
                      icon={<Lock className="size-3.5" aria-hidden />}
                    >
                      {t("fields.confirmPassword.label")}
                    </FieldLabel>
                    <Input
                      id="teacher-confirmPassword"
                      isPasswordField
                      value={form.watch("confirmPassword")}
                      onChange={(event) =>
                        form.setValue("confirmPassword", event.target.value, {
                          shouldValidate: true,
                        })
                      }
                      placeholder={t("fields.confirmPassword.placeholder")}
                    />
                    <FieldError
                      message={resolveError(form.formState.errors.confirmPassword?.message)}
                    />
                  </Field>

                  <Field invalid={Boolean(form.formState.errors.password)}>
                    <FieldLabel
                      htmlFor="teacher-password"
                      required
                      icon={<Lock className="size-3.5" aria-hidden />}
                    >
                      {t("fields.password.label")}
                    </FieldLabel>
                    <Input
                      id="teacher-password"
                      isPasswordField
                      value={form.watch("password")}
                      onChange={(event) =>
                        form.setValue("password", event.target.value, { shouldValidate: true })
                      }
                      placeholder={t("fields.password.placeholder")}
                    />
                    <FieldError message={resolveError(form.formState.errors.password?.message)} />
                  </Field>
                </div>
              </section>

              <Controller
                name="acceptTerms"
                control={form.control}
                render={({ field }) => (
                  <label
                    className={cn(
                      "flex cursor-pointer items-center justify-end gap-3 rounded-xl bg-[rgba(244,236,216,0.3)] px-5 py-4 text-sm",
                      acceptTermsError && "ring-1 ring-[var(--dashboard-danger)]",
                    )}
                  >
                    <span className="text-slate-500">
                      {t("terms.prefix")}{" "}
                      <span className="font-bold text-[var(--dashboard-primary)] underline">
                        {t("terms.terms")}
                      </span>{" "}
                      {t("terms.and")}{" "}
                      <span className="font-bold text-[var(--dashboard-primary)] underline">
                        {t("terms.privacy")}
                      </span>{" "}
                      {t("terms.suffix")}
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="size-5 shrink-0 rounded border-2 border-[var(--dashboard-gold)] accent-[var(--dashboard-primary)]"
                    />
                  </label>
                )}
              />

              {submitError ? (
                <p className="text-center text-sm font-medium text-[var(--dashboard-danger)]">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-col items-center gap-6 pt-2">
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full"
                >
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className={cn(
                      "h-14 w-full rounded-xl bg-[var(--dashboard-primary)] text-xl font-bold text-white",
                      "shadow-[0_4px_0_0_#1e2e42] hover:bg-[var(--dashboard-primary)]",
                    )}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <SubmitIcon className="size-4" aria-hidden />
                    )}
                    {t("actions.submit")}
                  </Button>
                </motion.div>

                <p className="text-center text-base text-slate-500">
                  <span>{t("loginPrompt")} </span>
                  <button
                    type="button"
                    onClick={() => router.push(AUTH_ROUTES.LOGIN)}
                    className="font-bold text-[var(--dashboard-primary)] hover:underline"
                  >
                    {t("loginAction")}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
