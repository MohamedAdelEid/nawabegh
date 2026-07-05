"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import type { School } from "@/shared/domain/types/school.types";
import { submitSchoolActivationRequest } from "@/modules/auth/infrastructure/api/school-activation.api";
import {
  useSchoolsByCountry,
  useSchoolsSearch,
} from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";

type SchoolActivationPageProps = {
  schools: School[];
  defaultCountryId: number | null;
};

export function SchoolActivationPage({ schools: initialSchools, defaultCountryId }: SchoolActivationPageProps) {
  const t = useTranslations("auth.schoolActivation");
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const hasCountry = defaultCountryId != null && defaultCountryId > 0;
  const isSearching = debouncedKeyword.trim().length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  const schoolsQuery = useSchoolsByCountry(hasCountry ? defaultCountryId : null);
  const searchQuery = useSchoolsSearch(
    hasCountry ? defaultCountryId : null,
    debouncedKeyword,
    isSearching,
  );

  const schools = isSearching
    ? (searchQuery.data ?? [])
    : (schoolsQuery.data ?? initialSchools);

  const options: SearchableSelectOption<string>[] = useMemo(
    () => schools.map((school) => ({ value: school.id, label: school.name })),
    [schools],
  );

  const isLoading = isSearching ? searchQuery.isFetching : schoolsQuery.isFetching;
  const isError = isSearching ? searchQuery.isError : schoolsQuery.isError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!schoolId) {
      setError(t("validation.schoolRequired"));
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      await submitSchoolActivationRequest(
        { schoolId },
        t("messages.submitError"),
      );
      toast.success(t("messages.submitSuccess"));
      router.push(AUTH_ROUTES.REGISTER);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t("messages.submitError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main dir={direction} className="min-h-screen bg-[#fafafa]">
      <header className="flex w-full items-center justify-between px-8 py-9 lg:px-10">
        <Image
          src="/images/logos/main-logo.png"
          alt={t("brandAlt")}
          width={169}
          height={54}
          priority
          className="h-auto w-[120px] object-contain sm:w-[169px]"
        />

        <button
          type="button"
          onClick={() => router.push(AUTH_ROUTES.REGISTER)}
          aria-label={t("actions.back")}
          className="inline-flex size-[50px] shrink-0 items-center justify-center rounded-full text-[var(--dashboard-primary)] transition-colors hover:bg-slate-100"
        >
          <BackIcon className="size-7" />
        </button>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center px-4 pb-12 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          <div className="rounded-[20px] border-2 border-[#f1f5f9] bg-white p-[34px] shadow-[0_8px_0_0_rgba(0,0,0,0.05)]">
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#dbe3f3] py-3.5">
                <Image
                  src="/images/auth/school-activation/shield-icon.svg"
                  alt=""
                  width={20}
                  height={25}
                  className="h-[25px] w-5 object-contain"
                  aria-hidden
                />
              </div>

              <h1 className="text-[30px] font-bold leading-9 text-slate-900">
                {t("title")}
              </h1>

              <p className="max-w-md text-base leading-[1.625] text-slate-500">
                {t("description")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              <div className="space-y-2">
                <SearchableSelect
                  label={t("fields.school.label")}
                  required
                  value={schoolId}
                  options={options}
                  onChange={(value) => {
                    setSchoolId(value);
                    setError(undefined);
                  }}
                  placeholder={t("fields.school.placeholder")}
                  searchPlaceholder={t("fields.school.searchPlaceholder")}
                  emptyMessage={t("fields.school.empty")}
                  loadErrorMessage={t("fields.school.loadError")}
                  error={error}
                  disabled={!hasCountry}
                  isLoading={isLoading}
                  isError={isError}
                  searchValue={searchKeyword}
                  onSearchValueChange={setSearchKeyword}
                  renderTriggerLeading={() => (
                    <Image
                      src="/images/auth/school-activation/search-icon.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="size-[18px] shrink-0"
                      aria-hidden
                    />
                  )}
                />

                <div className="flex items-center justify-end gap-2 pe-1">
                  <p className="text-xs text-slate-500">{t("fields.school.hint")}</p>
                  <Image
                    src="/images/auth/school-activation/location-icon.svg"
                    alt=""
                    width={9}
                    height={12}
                    className="h-3 w-[9px] shrink-0"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border-r-4 border-[var(--dashboard-primary)] bg-[rgba(219,227,243,0.3)] px-5 py-5">
                <Image
                  src="/images/auth/school-activation/info-icon.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden
                />
                <p className="text-sm leading-[1.625] text-[#1e2e42]">{t("infoAlert")}</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="dashboard-raised-button h-16 w-full rounded-xl bg-[var(--dashboard-primary)] text-lg font-bold text-white shadow-[0_4px_0_0_#1e2e42] hover:bg-[var(--dashboard-primary)]"
              >
                {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
                {isSubmitting ? t("actions.submitting") : t("actions.submit")}
              </Button>

              <div className="border-t border-[#f1f5f9] pt-6 text-center">
                <p className="mb-3 text-sm font-medium text-slate-500">{t("support.label")}</p>
                <Link
                  href={t("support.whatsappUrl")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-lg font-bold text-[#58cc02] transition-opacity hover:opacity-80"
                >
                  <Image
                    src="/images/auth/school-activation/whatsapp-icon.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="size-5"
                    aria-hidden
                  />
                  <span>{t("support.phone")}</span>
                </Link>
              </div>
            </form>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
