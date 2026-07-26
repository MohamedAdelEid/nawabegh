"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";
import { cn } from "@/shared/application/lib/cn";
import type { Country } from "@/shared/domain/types/country.types";
import { countryIdToPhoneCountry } from "@/shared/domain/utils/phoneCountry.utils";
import { splitE164ForApi } from "@/modules/auth/domain/utils/phoneNumber.utils";
import { submitCompleteProfile } from "@/modules/auth/infrastructure/api/complete-profile.api";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";
import { AuthFormHeader } from "@/modules/auth/presentation/components/shared/AuthFormHeader";
import { CountrySelectField } from "@/modules/auth/presentation/components/shared/CountrySelectField";
import {
  useEducationLevels,
  useGrades,
} from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";

type CompleteProfilePageProps = {
  countries: Country[];
  defaultCountryId: number | null;
};

export function CompleteProfilePage({
  countries,
  defaultCountryId,
}: CompleteProfilePageProps) {
  const t = useTranslations("auth.completeProfile");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, update } = useSession();
  const isArabic = locale === "ar";
  const role = (session?.user?.role ?? "Student").trim();
  const normalizedRole = role.toLowerCase();

  const [countryId, setCountryId] = useState<number>(defaultCountryId ?? 0);
  const [phone, setPhone] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [educationLevelId, setEducationLevelId] = useState<number>(0);
  const [gradeId, setGradeId] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const educationLevelsQuery = useEducationLevels(countryId > 0 ? countryId : null);
  const gradesQuery = useGrades(educationLevelId > 0 ? educationLevelId : null);

  const selectedCountry = countries.find((country) => country.id === countryId);
  const phoneDefaultCountry = countryIdToPhoneCountry(
    countryId || undefined,
    selectedCountry?.name,
  );

  const educationLevels = educationLevelsQuery.data ?? [];
  const grades = gradesQuery.data ?? [];

  const showStudentFields = normalizedRole === "student";
  const showTeacherFields = normalizedRole === "teacher";

  const direction = isArabic ? "rtl" : "ltr";

  const validation = useMemo(
    () => ({
      required: t("validation.required"),
      invalidPhone: t("validation.invalidPhone"),
      usernameMin: t("validation.usernameMin"),
    }),
    [t],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldError(undefined);
    setSubmitError(undefined);

    if (!countryId) {
      setFieldError(validation.required);
      return;
    }

    const phoneParts = splitE164ForApi(phone);
    if (!phoneParts?.phoneNumber || !phoneParts.phoneCountryCode) {
      setFieldError(validation.invalidPhone);
      return;
    }

    setIsSubmitting(true);
    const fallback = t("messages.submitError");

    try {
      if (showStudentFields) {
        const whatsAppParts = splitE164ForApi(whatsApp || phone);
        if (!whatsAppParts?.phoneNumber || !whatsAppParts.phoneCountryCode) {
          setFieldError(validation.invalidPhone);
          setIsSubmitting(false);
          return;
        }
        if (!educationLevelId || !gradeId) {
          setFieldError(validation.required);
          setIsSubmitting(false);
          return;
        }
        if (username.trim().length < 3) {
          setFieldError(validation.usernameMin);
          setIsSubmitting(false);
          return;
        }

        await submitCompleteProfile(
          {
            countryId,
            educationLevelId,
            gradeId,
            phoneNumber: phoneParts.phoneNumber,
            phoneCountryCode: phoneParts.phoneCountryCode,
            whatsAppNumber: whatsAppParts.phoneNumber,
            whatsAppCountryCode: whatsAppParts.phoneCountryCode,
            username: username.trim(),
            academicTerm: 1,
            schoolId: null,
            address: address.trim() || null,
          },
          fallback,
        );
      } else if (showTeacherFields) {
        if (jobTitle.trim().length < 2) {
          setFieldError(validation.required);
          setIsSubmitting(false);
          return;
        }
        if (schoolName.trim().length < 2) {
          setFieldError(validation.required);
          setIsSubmitting(false);
          return;
        }

        await submitCompleteProfile(
          {
            countryId,
            jobTitle: jobTitle.trim(),
            schoolId: null,
            schoolName: schoolName.trim(),
            phoneNumber: phoneParts.phoneNumber,
            phoneCountryCode: phoneParts.phoneCountryCode,
            address: address.trim() || null,
          },
          fallback,
        );
      } else {
        await submitCompleteProfile(
          {
            countryId,
            phoneNumber: phoneParts.phoneNumber,
            phoneCountryCode: phoneParts.phoneCountryCode,
            address: address.trim() || null,
          },
          fallback,
        );
      }

      await update({ requiresProfileCompletion: false });
      toast.success(t("messages.submitSuccess"));
      router.replace(getRedirectPathForRole(role));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : fallback;
      if (/مكتمل|already completed|completed previously/i.test(message)) {
        await update({ requiresProfileCompletion: false });
        toast.success(t("messages.alreadyComplete"));
        router.replace(getRedirectPathForRole(role));
        router.refresh();
        return;
      }
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main dir={direction} className="min-h-screen bg-[#fafafa]">
      <AuthFormHeader brandAlt={t("brandAlt")} backLabel={t("title")} />

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-center px-4 pb-12 sm:px-6">
        <div className="flex w-full max-w-[540px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#dbe3f3] text-[var(--dashboard-primary)]">
              <UserRound className="size-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <h1 className="text-[28px] font-bold leading-9 text-[var(--dashboard-primary)]">
                {t("title")}
              </h1>
              <p className="text-base text-slate-500">{t("subtitle")}</p>
            </div>
          </div>

          <div className="w-full rounded-[20px] border-2 border-[#f1f5f9] bg-white px-6 py-8 shadow-[0_8px_0_0_rgba(0,0,0,0.05)] sm:px-[34px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              <FieldGroup>
                <CountrySelectField
                  label={t("fields.country.label")}
                  placeholder={t("fields.country.placeholder")}
                  searchPlaceholder={t("fields.country.searchPlaceholder")}
                  emptyMessage={t("fields.country.empty")}
                  loadErrorMessage={t("fields.country.loadError")}
                  value={countryId > 0 ? countryId : null}
                  onChange={(next) => {
                    setCountryId(next ?? 0);
                    setEducationLevelId(0);
                    setGradeId(0);
                  }}
                  countries={countries}
                  required
                />

                <Field>
                  <FieldLabel required>{t("fields.phone.label")}</FieldLabel>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    defaultCountry={phoneDefaultCountry}
                    locale={locale}
                    placeholder={t("fields.phone.placeholder")}
                    countrySearchPlaceholder={t("fields.phone.countrySearchPlaceholder")}
                    countryEmptyMessage={t("fields.phone.countryEmpty")}
                  />
                </Field>

                {showStudentFields ? (
                  <>
                    <Field>
                      <FieldLabel required>{t("fields.whatsApp.label")}</FieldLabel>
                      <PhoneInput
                        value={whatsApp}
                        onChange={setWhatsApp}
                        defaultCountry={phoneDefaultCountry}
                        locale={locale}
                        placeholder={t("fields.whatsApp.placeholder")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel required>{t("fields.username.label")}</FieldLabel>
                      <Input
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder={t("fields.username.placeholder")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel required>{t("fields.educationLevel.label")}</FieldLabel>
                      <select
                        value={educationLevelId || ""}
                        onChange={(event) => {
                          setEducationLevelId(Number(event.target.value) || 0);
                          setGradeId(0);
                        }}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[var(--dashboard-primary)]"
                      >
                        <option value="">{t("fields.educationLevel.placeholder")}</option>
                        {educationLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {isArabic ? level.nameAr : level.nameEn}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field>
                      <FieldLabel required>{t("fields.grade.label")}</FieldLabel>
                      <select
                        value={gradeId || ""}
                        onChange={(event) => setGradeId(Number(event.target.value) || 0)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[var(--dashboard-primary)]"
                      >
                        <option value="">{t("fields.grade.placeholder")}</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {isArabic ? grade.nameAr : grade.nameEn}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : null}

                {showTeacherFields ? (
                  <>
                    <Field>
                      <FieldLabel required>{t("fields.jobTitle.label")}</FieldLabel>
                      <Input
                        value={jobTitle}
                        onChange={(event) => setJobTitle(event.target.value)}
                        placeholder={t("fields.jobTitle.placeholder")}
                      />
                    </Field>
                    <Field>
                      <FieldLabel required>{t("fields.schoolName.label")}</FieldLabel>
                      <Input
                        value={schoolName}
                        onChange={(event) => setSchoolName(event.target.value)}
                        placeholder={t("fields.schoolName.placeholder")}
                      />
                    </Field>
                  </>
                ) : null}

                <Field>
                  <FieldLabel>{t("fields.address.label")}</FieldLabel>
                  <Input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={t("fields.address.placeholder")}
                  />
                </Field>
              </FieldGroup>

              {fieldError || submitError ? (
                <FieldError message={fieldError ?? submitError} />
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "h-14 w-full rounded-2xl bg-[var(--dashboard-primary)] text-lg font-bold text-white",
                  "shadow-[0_4px_0_0_#1e2e42] hover:bg-[var(--dashboard-primary)]",
                )}
              >
                {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
                {isSubmitting ? t("actions.submitting") : t("actions.submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
