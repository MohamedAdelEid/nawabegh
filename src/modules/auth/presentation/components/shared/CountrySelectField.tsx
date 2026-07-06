"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Globe } from "lucide-react";
import type { Country } from "@/shared/domain/types/country.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";
import { useCountriesSearch } from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";

type CountrySelectFieldProps = {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  loadErrorMessage: string;
  value: number | null;
  onChange: (countryId: number) => void;
  countries: Country[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

export function CountrySelectField({
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadErrorMessage,
  value,
  onChange,
  countries: initialCountries,
  required = false,
  error,
  disabled = false,
}: CountrySelectFieldProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  const { data: searchedCountries, isFetching, isError } = useCountriesSearch(
    debouncedKeyword.trim() || " ",
    debouncedKeyword.trim().length > 0,
  );

  const countries = debouncedKeyword.trim()
    ? (searchedCountries ?? [])
    : initialCountries;

  const options: SearchableSelectOption<number>[] = useMemo(
    () => countries.map((country) => ({ value: country.id, label: country.name })),
    [countries],
  );

  const renderFlag = (option: SearchableSelectOption<number>) => {
    const country = countries.find((item) => item.id === option.value);
    const flagUrl = country?.flagIcon ? resolveFileUrl(country.flagIcon) : null;
    if (!flagUrl) return null;

    return (
      <Image
        src={flagUrl}
        alt=""
        width={20}
        height={14}
        className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
        unoptimized
      />
    );
  };

  return (
    <SearchableSelect
      label={label}
      required={required}
      icon={<Globe className="size-4 shrink-0" aria-hidden />}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      loadErrorMessage={loadErrorMessage}
      error={error}
      disabled={disabled}
      isLoading={isFetching}
      isError={isError}
      searchValue={searchKeyword}
      onSearchValueChange={setSearchKeyword}
      renderTriggerLeading={renderFlag}
      renderOptionLeading={renderFlag}
    />
  );
}
