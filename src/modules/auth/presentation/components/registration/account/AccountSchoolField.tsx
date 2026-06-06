"use client";

import { useEffect, useMemo, useState } from "react";
import { School } from "lucide-react";
import { useTranslations } from "next-intl";
import type { School as SchoolType } from "@/shared/domain/types/school.types";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";
import {
  useSchoolsByCountry,
  useSchoolsSearch,
} from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";

type AccountSchoolFieldProps = {
  countryId: number | null;
  value: string | null;
  onChange: (schoolId: string) => void;
  schools: SchoolType[];
  error?: string;
  disabled?: boolean;
};

export function AccountSchoolField({
  countryId,
  value,
  onChange,
  schools: initialSchools,
  error,
  disabled = false,
}: AccountSchoolFieldProps) {
  const t = useTranslations("auth.registration");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const hasCountry = countryId != null && countryId > 0;
  const isSearching = debouncedKeyword.trim().length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    setSearchKeyword("");
    setDebouncedKeyword("");
  }, [countryId]);

  const schoolsQuery = useSchoolsByCountry(hasCountry ? countryId : null);
  const searchQuery = useSchoolsSearch(
    hasCountry ? countryId : null,
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

  return (
    <SearchableSelect
      label={t("study.fields.school.label")}
      required
      icon={<School className="size-4 shrink-0" aria-hidden />}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={
        hasCountry
          ? t("study.fields.school.placeholder")
          : t("fields.school.selectCountryFirst")
      }
      searchPlaceholder={t("study.fields.school.searchPlaceholder")}
      emptyMessage={t("study.fields.school.empty")}
      loadErrorMessage={t("study.fields.school.loadError")}
      error={error}
      disabled={disabled || !hasCountry}
      isLoading={isLoading}
      isError={isError}
      searchValue={searchKeyword}
      onSearchValueChange={setSearchKeyword}
    />
  );
}
