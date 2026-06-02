"use client";

import { useQuery } from "@tanstack/react-query";
import { getCountriesDropdown } from "@/shared/infrastructure/api/country.api";
import { getEducationLevels } from "@/shared/infrastructure/api/education-level.api";
import { getGrades } from "@/shared/infrastructure/api/grade.api";
import { getSchoolsDropdown } from "@/shared/infrastructure/api/school.api";

export function useCountriesSearch(keyword: string, enabled = true) {
  return useQuery({
    queryKey: ["countries", "dropdown", keyword],
    queryFn: () =>
      getCountriesDropdown({
        keyword: keyword.trim() || " ",
        pageNumber: 1,
        pageSize: 200,
      }),
    enabled,
    staleTime: 60_000,
  });
}

export function useSchoolsByCountry(countryId: number | null) {
  return useQuery({
    queryKey: ["schools", "dropdown", countryId],
    queryFn: () => {
      if (countryId == null || countryId <= 0) return [];
      return getSchoolsDropdown({
        countryId,
        keyword: " ",
        pageNumber: 1,
        pageSize: 200,
      });
    },
    enabled: countryId != null && countryId > 0,
    staleTime: 60_000,
  });
}

export function useSchoolsSearch(
  countryId: number | null,
  keyword: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["schools", "dropdown", countryId, keyword],
    queryFn: () => {
      if (countryId == null || countryId <= 0) return [];
      return getSchoolsDropdown({
        countryId,
        keyword: keyword.trim() || " ",
        pageNumber: 1,
        pageSize: 200,
      });
    },
    enabled: enabled && countryId != null && countryId > 0,
    staleTime: 60_000,
  });
}

export function useEducationLevels(countryId: number | null) {
  return useQuery({
    queryKey: ["education-levels", countryId],
    queryFn: () => {
      if (countryId == null) return [];
      return getEducationLevels({
        countryId,
        keyword: " ",
        pageNumber: 1,
        pageSize: 200,
      });
    },
    enabled: countryId != null && countryId > 0,
    staleTime: 60_000,
  });
}

export function useGrades(educationLevelId: number | null) {
  return useQuery({
    queryKey: ["grades", educationLevelId],
    queryFn: () => {
      if (educationLevelId == null) return [];
      return getGrades({
        educationLevelId,
        keyword: " ",
        pageNumber: 1,
        pageSize: 200,
      });
    },
    enabled: educationLevelId != null && educationLevelId > 0,
    staleTime: 60_000,
  });
}
