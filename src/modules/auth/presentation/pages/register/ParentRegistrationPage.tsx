"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, MapPin, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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
  parentRegistrationSchema,
  type ParentRegistrationSchemaInput,
} from "@/modules/auth/domain/schemas/parent-registration.schema";
import { submitParentRegistration } from "@/modules/auth/infrastructure/api/parent-registration.api";
import { AuthFormHeader } from "@/modules/auth/presentation/components/shared/AuthFormHeader";
import { CountrySelectField } from "@/modules/auth/presentation/components/shared/CountrySelectField";

type ParentRegistrationPageProps = {
  countries: Country[];
  defaultCountryId: number | null;
};

export function ParentRegistrationPage({
  countries,
  defaultCountryId,
}: ParentRegistrationPageProps) {
  const t = useTranslations("auth.parentRegistration");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const SubmitIcon = isArabic ? ArrowLeft : ArrowRight;

  const [submitError, setSubmitError] = useState<string | undefined>();

  const form = useForm<ParentRegistrationSchemaInput>({
    resolver: zodResolver(parentRegistrationSchema),
    defaultValues: {
      countryId: defaultCountryId ?? 0,
      phone: "",
      email: "",
      address: "",
      password: "",
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
      await submitParentRegistration(
        {
          countryId: values.countryId,
          email: values.email.trim(),
          password: values.password,
          phoneNumber: phone.phoneNumber,
          phoneCountryCode: phone.phoneCountryCode,
          address: (values.address ?? "").trim(),
        },
        fallbackMessage,
      );
      toast.success(t("messages.submitSuccess"));
      router.push(AUTH_ROUTES.LOGIN);
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      setSubmitError(message);
      toast.error(message);
    }
  });

  return (
    <main dir={direction} className="min-h-screen bg-[#fafafa]">
      <AuthFormHeader brandAlt={t("brandAlt")} backLabel={t("actions.back")} />

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-center px-4 pb-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex w-full max-w-[540px] flex-col items-center gap-10"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#dbe3f3] text-[var(--dashboard-primary)] shadow-[0_4px_0_0_#d1dae8]">
              <UserPlus className="size-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <h1 className="text-[30px] font-bold leading-9 text-[var(--dashboard-primary)]">
                {t("title")}
              </h1>
              <p className="text-base text-slate-500">{t("subtitle")}</p>
            </div>
          </div>

          <div className="w-full rounded-[20px] border-2 border-[#f1f5f9] bg-white px-6 py-8 shadow-[0_8px_0_0_rgba(0,0,0,0.05)] sm:px-[34px]">
            <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field invalid={Boolean(form.formState.errors.phone)}>
                    <FieldLabel htmlFor="parent-phone" required>
                      {t("fields.phone.label")}
                    </FieldLabel>
                    <PhoneInput
                      id="parent-phone"
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

                <Field invalid={Boolean(form.formState.errors.email)}>
                  <FieldLabel
                    htmlFor="parent-email"
                    required
                    icon={<Mail className="size-3.5" aria-hidden />}
                  >
                    {t("fields.email.label")}
                  </FieldLabel>
                  <Input
                    id="parent-email"
                    type="email"
                    value={form.watch("email")}
                    onChange={(event) =>
                      form.setValue("email", event.target.value, { shouldValidate: true })
                    }
                    placeholder={t("fields.email.placeholder")}
                  />
                  <FieldError message={resolveError(form.formState.errors.email?.message)} />
                </Field>

                <Field invalid={Boolean(form.formState.errors.address)}>
                  <FieldLabel
                    htmlFor="parent-address"
                    icon={<MapPin className="size-3.5" aria-hidden />}
                  >
                    {t("fields.address.label")}
                  </FieldLabel>
                  <Input
                    id="parent-address"
                    value={form.watch("address") ?? ""}
                    onChange={(event) => form.setValue("address", event.target.value)}
                    placeholder={t("fields.address.placeholder")}
                  />
                  <FieldError message={resolveError(form.formState.errors.address?.message)} />
                </Field>

                <Field invalid={Boolean(form.formState.errors.password)}>
                  <FieldLabel
                    htmlFor="parent-password"
                    required
                    icon={<Lock className="size-3.5" aria-hidden />}
                  >
                    {t("fields.password.label")}
                  </FieldLabel>
                  <Input
                    id="parent-password"
                    isPasswordField
                    value={form.watch("password")}
                    onChange={(event) =>
                      form.setValue("password", event.target.value, { shouldValidate: true })
                    }
                    placeholder={t("fields.password.placeholder")}
                  />
                  <FieldDescription className="px-2 text-end text-[10px] font-medium text-[#94a3b8]">
                    {t("fields.password.hint")}
                  </FieldDescription>
                  <FieldError message={resolveError(form.formState.errors.password?.message)} />
                </Field>
              </FieldGroup>

              {submitError ? (
                <p className="text-center text-sm font-medium text-[var(--dashboard-danger)]">
                  {submitError}
                </p>
              ) : null}

              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className={cn(
                    "h-14 w-full rounded-2xl bg-[var(--dashboard-primary)] text-lg font-bold text-white",
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
            </form>
          </div>

          <div className="flex flex-col items-center gap-4">
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
            <nav className="flex items-center gap-6 text-xs text-slate-500">
              <span>{t("footerLinks.help")}</span>
              <span>{t("footerLinks.privacy")}</span>
              <span>{t("footerLinks.terms")}</span>
            </nav>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
