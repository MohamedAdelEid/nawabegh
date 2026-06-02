"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import {
  accountSchema,
  type AccountSchemaInput,
} from "@/modules/auth/domain/schemas/account.schema";
import type { RegistrationInitialData } from "@/modules/auth/domain/types/registration.types";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";
import {
  useEducationLevels,
  useGrades,
  useSchoolsByCountry,
} from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";
import { AccountCountryField } from "@/modules/auth/presentation/components/registration/account/AccountCountryField";
import { AccountEducationLevelField } from "@/modules/auth/presentation/components/registration/account/AccountEducationLevelField";
import { AccountGradeField } from "@/modules/auth/presentation/components/registration/account/AccountGradeField";
import { AccountSchoolField } from "@/modules/auth/presentation/components/registration/account/AccountSchoolField";
import {
  RegistrationCard,
  RegistrationLoginLink,
} from "@/modules/auth/presentation/components/registration/RegistrationLayout";

type AccountStepProps = {
  initial: RegistrationInitialData;
};

export function AccountStep({ initial }: AccountStepProps) {
  const t = useTranslations("auth.registration");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;

  const account = useRegistrationStore((state) => state.account);
  const updateAccount = useRegistrationStore((state) => state.updateAccount);
  const markStepCompleted = useRegistrationStore((state) => state.markStepCompleted);
  const nextStep = useRegistrationStore((state) => state.nextStep);

  const form = useForm<AccountSchemaInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      countryId: account.countryId ?? initial.defaults.countryId,
      educationLevelId: account.educationLevelId ?? initial.defaults.educationLevelId,
      gradeId: account.gradeId ?? initial.defaults.gradeId,
      schoolId: account.schoolId ?? initial.defaults.schoolId ?? "",
    },
    mode: "onSubmit",
  });

  const countryId = form.watch("countryId");
  const educationLevelId = form.watch("educationLevelId");
  const gradeId = form.watch("gradeId");

  const schoolsQuery = useSchoolsByCountry(countryId > 0 ? countryId : null);
  const educationLevelsQuery = useEducationLevels(countryId > 0 ? countryId : null);
  const gradesQuery = useGrades(educationLevelId > 0 ? educationLevelId : null);

  const schools =
    schoolsQuery.data ??
    (countryId === initial.defaults.countryId ? initial.schools : []);

  const educationLevels =
    educationLevelsQuery.data ??
    (countryId === initial.defaults.countryId ? initial.educationLevels : []);

  const grades =
    gradesQuery.data ??
    (educationLevelId === initial.defaults.educationLevelId ? initial.grades : []);

  const validationMessage = useMemo(
    () => ({ required: t("validation.required") }),
    [t],
  );

  const resolveError = (key?: string) => {
    if (key === "required") return validationMessage.required;
    return key;
  };

  const onCountryChange = (nextCountryId: number) => {
    if (form.getValues("countryId") === nextCountryId) return;
    form.setValue("countryId", nextCountryId, { shouldValidate: true });
    form.setValue("schoolId", "", { shouldValidate: false });
    form.setValue("educationLevelId", 0, { shouldValidate: false });
    form.setValue("gradeId", 0, { shouldValidate: false });
  };

  const onEducationLevelChange = (nextLevelId: number) => {
    if (form.getValues("educationLevelId") === nextLevelId) return;
    form.setValue("educationLevelId", nextLevelId, { shouldValidate: true });
    form.setValue("gradeId", 0, { shouldValidate: false });
  };

  const onSubmit = form.handleSubmit((values) => {
    updateAccount(values);
    markStepCompleted("account");
    nextStep();
  });

  const isRefetchingSchools = schoolsQuery.isFetching && schools.length === 0;
  const isRefetchingLevels =
    educationLevelsQuery.isFetching && educationLevels.length === 0;
  const isRefetchingGrades = gradesQuery.isFetching && grades.length === 0;

  return (
    <RegistrationCard
      title={t("account.cardTitle")}
      subtitle={t("account.cardSubtitle")}
      footer={<RegistrationLoginLink className="pt-2" />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        <AccountCountryField
          value={countryId > 0 ? countryId : null}
          onChange={onCountryChange}
          countries={initial.countries}
          error={resolveError(form.formState.errors.countryId?.message)}
        />

        <Controller
          name="schoolId"
          control={form.control}
          render={({ field }) => (
            <AccountSchoolField
              countryId={countryId > 0 ? countryId : null}
              value={field.value || null}
              onChange={field.onChange}
              schools={schools}
              error={resolveError(form.formState.errors.schoolId?.message)}
              disabled={isRefetchingSchools}
            />
          )}
        />

        <AccountEducationLevelField
          levels={educationLevels}
          value={educationLevelId > 0 ? educationLevelId : null}
          onChange={onEducationLevelChange}
          error={resolveError(form.formState.errors.educationLevelId?.message)}
          disabled={isRefetchingLevels || countryId <= 0}
        />

        <AccountGradeField
          grades={grades}
          value={gradeId > 0 ? gradeId : null}
          onChange={(nextGradeId) =>
            form.setValue("gradeId", nextGradeId, { shouldValidate: true })
          }
          error={resolveError(form.formState.errors.gradeId?.message)}
          disabled={isRefetchingGrades || educationLevelId <= 0}
        />

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
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
      </form>
    </RegistrationCard>
  );
}
