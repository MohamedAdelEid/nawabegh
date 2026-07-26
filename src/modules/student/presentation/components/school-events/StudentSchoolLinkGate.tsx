"use client";

import { useEffect, useMemo, useState } from "react";
import { School } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { studentHomeQueryKeys } from "@/modules/student/application/constants/studentHomeQueryKeys";
import { schoolEventsQueryKeys } from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { studentProfileQueryKeys } from "@/modules/student/application/constants/studentProfileQueryKeys";
import type { StudentMyProfile } from "@/modules/student/domain/types/student-home.types";
import type { UpdateStudentProfilePayload } from "@/modules/student/domain/profile/profile.types";
import { updateStudentMyProfile } from "@/modules/student/infrastructure/api/studentProfile.api";
import { CountrySelectField } from "@/modules/auth/presentation/components/shared/CountrySelectField";
import { useCountriesSearch } from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";
import { pickDefaultCountryId } from "@/shared/domain/utils/country.utils";
import { getSchoolsDropdown } from "@/shared/infrastructure/api/school.api";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";

const SCHOOL_DROPDOWN_PAGE_SIZE = 50;

type StudentSchoolLinkGateProps = {
  profile: StudentMyProfile;
};

function buildUpdatePayload(
  profile: StudentMyProfile,
  schoolId: string,
): UpdateStudentProfilePayload {
  return {
    fullName: profile.fullName,
    profileImageUrl: profile.profileImageUrl,
    phoneNumber: profile.phoneNumber || null,
    phoneCountryCode: profile.phoneCountryCode,
    whatsAppNumber: profile.whatsAppNumber || null,
    whatsAppCountryCode: profile.whatsAppCountryCode,
    address: profile.address || null,
    educationLevelId: profile.educationLevelId || null,
    gradeId: profile.gradeId || null,
    schoolId,
    academicTerm: profile.academicTerm,
  };
}

function useStudentSchoolsByCountry(
  countryId: number | null,
  keyword: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["student", "schools", "dropdown", countryId, keyword],
    queryFn: () => {
      if (countryId == null || countryId <= 0) return [];
      return getSchoolsDropdown({
        countryId,
        keyword: keyword.trim() || " ",
        pageNumber: 1,
        pageSize: SCHOOL_DROPDOWN_PAGE_SIZE,
      });
    },
    enabled: enabled && countryId != null && countryId > 0,
    staleTime: 60_000,
  });
}

export function StudentSchoolLinkGate({ profile }: StudentSchoolLinkGateProps) {
  const t = useTranslations("student.dashboard.schoolEvents.linkSchool");
  const queryClient = useQueryClient();

  const countriesQuery = useCountriesSearch(" ", true);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (countryId != null) return;
    const countries = countriesQuery.data ?? [];
    if (countries.length === 0) return;
    setCountryId(pickDefaultCountryId(countries));
  }, [countriesQuery.data, countryId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    setSchoolId(null);
    setSearchKeyword("");
    setDebouncedKeyword("");
    setLocalError(null);
  }, [countryId]);

  const hasCountry = countryId != null && countryId > 0;
  const isSearching = debouncedKeyword.trim().length > 0;

  const schoolsQuery = useStudentSchoolsByCountry(
    hasCountry ? countryId : null,
    " ",
    hasCountry && !isSearching,
  );
  const searchQuery = useStudentSchoolsByCountry(
    hasCountry ? countryId : null,
    debouncedKeyword,
    hasCountry && isSearching,
  );

  const schools = isSearching
    ? (searchQuery.data ?? [])
    : (schoolsQuery.data ?? []);

  const schoolOptions: SearchableSelectOption<string>[] = useMemo(
    () => schools.map((school) => ({ value: school.id, label: school.name })),
    [schools],
  );

  const saveMutation = useMutation({
    mutationFn: (nextSchoolId: string) =>
      updateStudentMyProfile(buildUpdatePayload(profile, nextSchoolId)),
    onSuccess: async (updated) => {
      queryClient.setQueryData(studentHomeQueryKeys.profile(), updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentHomeQueryKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: schoolEventsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: studentProfileQueryKeys.schoolRank() }),
        queryClient.invalidateQueries({ queryKey: studentProfileQueryKeys.schoolLeaders() }),
      ]);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!schoolId) {
      setLocalError(t("errors.schoolRequired"));
      return;
    }
    setLocalError(null);
    try {
      await saveMutation.mutateAsync(schoolId);
    } catch {
      // surfaced via saveMutation.error
    }
  };

  const errorMessage =
    localError ||
    (saveMutation.error instanceof Error ? saveMutation.error.message : null);

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="space-y-2 text-start">
        <h2 className="text-xl font-bold text-[#1e3a5f]">{t("title")}</h2>
        <p className="text-sm leading-6 text-slate-500">{t("description")}</p>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        {errorMessage ? (
          <ApiFailureAlert message={errorMessage} fallbackMessage={t("errors.save")} />
        ) : null}

        <CountrySelectField
          label={t("country.label")}
          placeholder={t("country.placeholder")}
          searchPlaceholder={t("country.searchPlaceholder")}
          emptyMessage={t("country.empty")}
          loadErrorMessage={t("country.loadError")}
          value={countryId}
          onChange={setCountryId}
          countries={countriesQuery.data ?? []}
          required
          disabled={saveMutation.isPending}
        />

        <SearchableSelect
          label={t("school.label")}
          required
          icon={<School className="size-4 shrink-0" aria-hidden />}
          value={schoolId}
          options={schoolOptions}
          onChange={setSchoolId}
          placeholder={
            hasCountry ? t("school.placeholder") : t("school.selectCountryFirst")
          }
          searchPlaceholder={t("school.searchPlaceholder")}
          emptyMessage={t("school.empty")}
          loadErrorMessage={t("school.loadError")}
          disabled={saveMutation.isPending || !hasCountry}
          isLoading={isSearching ? searchQuery.isFetching : schoolsQuery.isFetching}
          isError={isSearching ? searchQuery.isError : schoolsQuery.isError}
          searchValue={searchKeyword}
          onSearchValueChange={setSearchKeyword}
        />

        <Button
          type="submit"
          disabled={saveMutation.isPending || !schoolId}
          className="min-h-12 w-full rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]"
        >
          {saveMutation.isPending ? t("saving") : t("submit")}
        </Button>
      </form>
    </div>
  );
}

export function hasLinkedSchool(profile: StudentMyProfile | null | undefined): boolean {
  return Boolean(profile?.schoolId?.trim());
}
