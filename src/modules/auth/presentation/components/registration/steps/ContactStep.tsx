"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Loader2,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { cn } from "@/shared/application/lib/cn";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import {
  contactSchema,
  type ContactSchemaInput,
} from "@/modules/auth/domain/schemas/contact.schema";
import { accountSchema } from "@/modules/auth/domain/schemas/account.schema";
import { studySchema } from "@/modules/auth/domain/schemas/study.schema";
import { buildStudentRegistrationRequest } from "@/modules/auth/domain/utils/registrationPayload.utils";
import { submitStudentRegistration } from "@/modules/auth/infrastructure/api/student-registration.api";
import { ContactPhoneField } from "@/modules/auth/presentation/components/registration/contact/ContactPhoneField";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";
import {
  RegistrationCard,
  RegistrationLoginLink,
} from "@/modules/auth/presentation/components/registration/RegistrationLayout";

export function ContactStep() {
  const t = useTranslations("auth.registration");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const SubmitIcon = isArabic ? ArrowLeft : ArrowRight;
  const PrevIcon = isArabic ? ArrowRight : ArrowLeft;
  const [submitError, setSubmitError] = useState<string | undefined>();

  const account = useRegistrationStore((state) => state.account);
  const study = useRegistrationStore((state) => state.study);
  const contact = useRegistrationStore((state) => state.contact);
  const updateContact = useRegistrationStore((state) => state.updateContact);
  const setVerification = useRegistrationStore((state) => state.setVerification);
  const markStepCompleted = useRegistrationStore((state) => state.markStepCompleted);
  const previousStep = useRegistrationStore((state) => state.previousStep);

  const form = useForm<ContactSchemaInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      whatsApp: contact.whatsApp ?? study.phone ?? "",
      alternativePhone: contact.alternativePhone ?? "",
      parentPhone: contact.parentPhone ?? "",
      username: contact.username ?? "",
      address: contact.address ?? study.address ?? "",
    },
    mode: "onSubmit",
  });

  const validationMessage = useMemo(
    () => ({
      required: t("validation.required"),
      invalidPhone: t("validation.invalidPhone"),
      usernameMin: t("validation.usernameMin"),
      usernameMax: t("validation.usernameMax"),
      usernamePattern: t("validation.usernamePattern"),
    }),
    [t],
  );

  const resolveError = (key?: string) => {
    if (!key) return undefined;
    return validationMessage[key as keyof typeof validationMessage] ?? key;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    updateContact(values);

    const accountParsed = accountSchema.safeParse(account);
    const studyParsed = studySchema.safeParse(study);
    if (!accountParsed.success || !studyParsed.success) {
      setSubmitError(t("contact.errors.incompleteSteps"));
      return;
    }

    const fallbackMessage = t("contact.errors.submitFailed");

    try {
      const payload = buildStudentRegistrationRequest(
        accountParsed.data,
        studyParsed.data,
        values,
      );
      await submitStudentRegistration(payload, fallbackMessage);

      const email = studyParsed.data.email.trim();
      setVerification({ target: "email", email });
      markStepCompleted("contact");
      router.push(AUTH_ROUTES.REGISTER_VERIFY);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage;
      setSubmitError(message);
      notify.error(message);
    }
  });

  return (
    <RegistrationCard
      title={t("contact.cardTitle")}
      subtitle={t("contact.cardSubtitle")}
      footer={<RegistrationLoginLink />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        <FieldGroup>
          <Controller
            name="whatsApp"
            control={form.control}
            render={({ field }) => (
              <ContactPhoneField
                label={t("contact.fields.whatsApp.label")}
                required
                icon={<MessageCircle className="size-3.5" aria-hidden />}
                value={field.value}
                onChange={field.onChange}
                accountCountryId={account.countryId}
                locale={locale}
                placeholder={t("contact.fields.whatsApp.placeholder")}
                countrySearchPlaceholder={t("study.fields.phone.countrySearchPlaceholder")}
                countryEmptyMessage={t("study.fields.phone.countryEmpty")}
                error={resolveError(form.formState.errors.whatsApp?.message)}
                disabled={form.formState.isSubmitting}
              />
            )}
          />

          <Controller
            name="alternativePhone"
            control={form.control}
            render={({ field }) => (
              <ContactPhoneField
                label={t("contact.fields.alternativePhone.label")}
                icon={<Phone className="size-3.5" aria-hidden />}
                value={field.value ?? ""}
                onChange={field.onChange}
                accountCountryId={account.countryId}
                locale={locale}
                placeholder={t("contact.fields.alternativePhone.placeholder")}
                countrySearchPlaceholder={t("study.fields.phone.countrySearchPlaceholder")}
                countryEmptyMessage={t("study.fields.phone.countryEmpty")}
                error={resolveError(form.formState.errors.alternativePhone?.message)}
                disabled={form.formState.isSubmitting}
              />
            )}
          />

          <Controller
            name="parentPhone"
            control={form.control}
            render={({ field }) => (
              <ContactPhoneField
                label={t("contact.fields.parentPhone.label")}
                required
                icon={<Users className="size-3.5" aria-hidden />}
                value={field.value}
                onChange={field.onChange}
                accountCountryId={account.countryId}
                locale={locale}
                placeholder={t("contact.fields.parentPhone.placeholder")}
                countrySearchPlaceholder={t("study.fields.phone.countrySearchPlaceholder")}
                countryEmptyMessage={t("study.fields.phone.countryEmpty")}
                error={resolveError(form.formState.errors.parentPhone?.message)}
                disabled={form.formState.isSubmitting}
              />
            )}
          />

          <Field invalid={Boolean(form.formState.errors.username)}>
            <FieldLabel
              htmlFor="contact-username"
              required
              icon={<AtSign className="size-3.5" aria-hidden />}
            >
              {t("contact.fields.username.label")}
            </FieldLabel>
            <Input
              id="contact-username"
              value={form.watch("username")}
              onChange={(event) =>
                form.setValue("username", event.target.value, { shouldValidate: true })
              }
              placeholder={t("contact.fields.username.placeholder")}
              disabled={form.formState.isSubmitting}
              autoComplete="username"
            />
            <FieldError message={resolveError(form.formState.errors.username?.message)} />
          </Field>
        </FieldGroup>

        {/* {submitError ? (
          <p className="text-center text-sm font-medium text-[var(--dashboard-danger)]">
            {submitError}
          </p>
        ) : null} */}

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
                <SubmitIcon className="size-4" aria-hidden />
              )}
              {t("actions.submit")}
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
              disabled={form.formState.isSubmitting}
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
