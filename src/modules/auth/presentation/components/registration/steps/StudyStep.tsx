"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { cn } from "@/shared/application/lib/cn";
import {
  studySchema,
  type StudySchemaInput,
} from "@/modules/auth/domain/schemas/study.schema";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";
import { StudyPhoneField } from "@/modules/auth/presentation/components/registration/study/StudyPhoneField";
import {
  RegistrationCard,
  RegistrationLoginLink,
} from "@/modules/auth/presentation/components/registration/RegistrationLayout";

export function StudyStep() {
  const t = useTranslations("auth.registration");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;
  const PrevIcon = isArabic ? ArrowRight : ArrowLeft;

  const account = useRegistrationStore((state) => state.account);
  const study = useRegistrationStore((state) => state.study);
  const updateStudy = useRegistrationStore((state) => state.updateStudy);
  const markStepCompleted = useRegistrationStore((state) => state.markStepCompleted);
  const nextStep = useRegistrationStore((state) => state.nextStep);
  const previousStep = useRegistrationStore((state) => state.previousStep);

  const form = useForm<StudySchemaInput>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      fullName: study.fullName ?? "",
      email: study.email ?? "",
      phone: study.phone ?? "",
      address: study.address ?? "",
      password: study.password ?? "",
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

  const onSubmit = form.handleSubmit((values) => {
    updateStudy(values);
    markStepCompleted("study");
    nextStep();
  });

  const fullNameError = resolveError(form.formState.errors.fullName?.message);
  const emailError = resolveError(form.formState.errors.email?.message);
  const addressError = resolveError(form.formState.errors.address?.message);
  const passwordError = resolveError(form.formState.errors.password?.message);

  return (
    <RegistrationCard
      // title={t("study.cardTitle")}
      // subtitle={t("study.cardSubtitle")}
      footer={<RegistrationLoginLink />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        <FieldGroup>
          <Field invalid={Boolean(fullNameError)}>
            <FieldLabel
              htmlFor="study-fullName"
              required
              icon={<User className="size-3.5" aria-hidden />}
            >
              {t("study.fields.fullName.label")}
            </FieldLabel>
            <Input
              id="study-fullName"
              value={form.watch("fullName")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue("fullName", event.target.value, { shouldValidate: true })
              }
              placeholder={t("study.fields.fullName.placeholder")}
            />
            <FieldError message={fullNameError} />
          </Field>

          <Field invalid={Boolean(emailError)}>
            <FieldLabel
              htmlFor="study-email"
              required
              icon={<Mail className="size-3.5" aria-hidden />}
            >
              {t("study.fields.email.label")}
            </FieldLabel>
            <Input
              id="study-email"
              type="email"
              value={form.watch("email")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue("email", event.target.value, { shouldValidate: true })
              }
              placeholder={t("study.fields.email.placeholder")}
            />
            <FieldError message={emailError} />
          </Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StudyPhoneField
              value={form.watch("phone")}
              onChange={(value) =>
                form.setValue("phone", value, { shouldValidate: true })
              }
              accountCountryId={account.countryId}
              error={resolveError(form.formState.errors.phone?.message)}
            />

            <Field invalid={Boolean(addressError)}>
              <FieldLabel
                htmlFor="study-address"
                icon={<MapPin className="size-3.5" aria-hidden />}
              >
                {t("study.fields.address.label")}
              </FieldLabel>
              <Input
                id="study-address"
                value={form.watch("address") ?? ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setValue("address", event.target.value)}
                placeholder={t("study.fields.address.placeholder")}
              />
              <FieldError message={addressError} />
            </Field>
          </div>

          <Field invalid={Boolean(passwordError)}>
            <FieldLabel
              htmlFor="study-password"
              required
              icon={<Lock className="size-3.5" aria-hidden />}
            >
              {t("study.fields.password.label")}
            </FieldLabel>
            <Input
              id="study-password"
              isPasswordField
              value={form.watch("password")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue("password", event.target.value, { shouldValidate: true })
              }
              placeholder={t("study.fields.password.placeholder")}
            />
            <FieldDescription className="px-2 text-end text-[10px] font-medium text-[#94a3b8]">
              {t("study.fields.password.hint")}
            </FieldDescription>
            <FieldError message={passwordError} />
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-center sm:gap-4">
          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="w-full sm:max-w-[389px] sm:flex-1"
          >
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={cn(
                "h-16 w-full rounded-2xl bg-[var(--dashboard-primary)] text-lg font-bold text-white",
                "shadow-[var(--dashboard-shadow-button)] hover:bg-[var(--dashboard-primary)]",
              )}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <NextIcon className="size-4" aria-hidden />
              )}
              {t("actions.nextStep")}
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="w-full sm:max-w-[199px] sm:flex-1"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => previousStep()}
              className="h-16 w-full rounded-2xl border-2 border-[#e2e8f0] text-base font-bold text-[#64748b]"
            >
              <PrevIcon className="size-4" aria-hidden />
              {t("actions.previousStep")}
            </Button>
          </motion.div>
        </div>
      </form>
    </RegistrationCard>
  );
}
