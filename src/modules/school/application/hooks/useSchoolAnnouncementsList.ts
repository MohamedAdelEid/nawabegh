"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolAnnouncementsQueryKeys } from "@/modules/school/application/constants/schoolAnnouncementsQueryKeys";
import { getSchoolAnnouncements } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";
import type { SchoolAnnouncementListFilter } from "@/modules/school/domain/types/schoolAnnouncements.types";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export function useSchoolAnnouncementsList() {
  const auth = useAuth();
  const [statusFilter, setStatusFilter] = useState<SchoolAnnouncementListFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, statusFilter]);

  const params = useMemo(
    () => ({
      status: statusFilter,
      search: debouncedSearch || undefined,
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [statusFilter, debouncedSearch, pageNumber],
  );

  const query = useQuery({
    queryKey: schoolAnnouncementsQueryKeys.list(params),
    queryFn: () => getSchoolAnnouncements(params),
    enabled: auth.user?.role === "School",
    placeholderData: keepPreviousData,
  });

  const totalPages = query.data?.totalPages ?? 1;

  useEffect(() => {
    if (query.data && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [query.data, pageNumber, totalPages]);

  return {
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    pageNumber,
    setPageNumber,
    page: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
