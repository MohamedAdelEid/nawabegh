"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolCommunityQueryKeys } from "@/modules/school/application/constants/schoolCommunityQueryKeys";
import {
  approveSchoolCommunityArticle,
  deleteSchoolCommunityArticle,
  getSchoolCommunityArticles,
  getSchoolCommunityDashboard,
  hideSchoolCommunityArticle,
  rejectSchoolCommunityArticle,
  requestSchoolCommunityArticleEdits,
  submitSchoolCommunityArticle,
  unhideSchoolCommunityArticle,
} from "@/modules/school/infrastructure/api/schoolCommunityApi";
import type {
  SchoolArticleStatusFilter,
  SchoolCommunityContentSource,
  SchoolCommunityRejectPayload,
  SchoolCommunityRequestEditsPayload,
} from "@/modules/school/domain/types/schoolCommunity.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export function useSchoolCommunityDashboard() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<SchoolArticleStatusFilter>("all");
  const [contentSource, setContentSource] = useState<SchoolCommunityContentSource>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPageNumber(1);
  }, [status, contentSource, debouncedSearch]);

  const params = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      status,
      contentSource,
      search: debouncedSearch || undefined,
    }),
    [pageNumber, status, contentSource, debouncedSearch],
  );

  const isFirstPageAll =
    pageNumber === 1 &&
    status === "all" &&
    contentSource === "All" &&
    !debouncedSearch;

  const query = useQuery({
    queryKey: schoolCommunityQueryKeys.dashboard(params),
    queryFn: () =>
      isFirstPageAll
        ? getSchoolCommunityDashboard(params)
        : getSchoolCommunityArticles(params),
    enabled: auth.user?.role === "School",
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.isSuccess) setInitialLoaded(true);
  }, [query.isSuccess]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: schoolCommunityQueryKeys.all });
  };

  const hide = useMutation({
    mutationFn: (id: string) => hideSchoolCommunityArticle(id),
    onSuccess: invalidate,
  });

  const unhide = useMutation({
    mutationFn: unhideSchoolCommunityArticle,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteSchoolCommunityArticle,
    onSuccess: invalidate,
  });

  const approve = useMutation({
    mutationFn: approveSchoolCommunityArticle,
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SchoolCommunityRejectPayload;
    }) => rejectSchoolCommunityArticle(id, payload),
    onSuccess: invalidate,
  });

  const requestEdits = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SchoolCommunityRequestEditsPayload;
    }) => requestSchoolCommunityArticleEdits(id, payload),
    onSuccess: invalidate,
  });

  const submit = useMutation({
    mutationFn: submitSchoolCommunityArticle,
    onSuccess: invalidate,
  });

  const totalPages = query.data?.pagination.totalPages ?? 1;
  useEffect(() => {
    if (query.data && pageNumber > totalPages) setPageNumber(totalPages);
  }, [pageNumber, query.data, totalPages]);

  return {
    data: query.data ?? null,
    pageNumber,
    setPageNumber,
    status,
    setStatus,
    contentSource,
    setContentSource,
    search,
    setSearch,
    isLoading: query.isLoading && !initialLoaded,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hide,
    unhide,
    remove,
    approve,
    reject,
    requestEdits,
    submit,
    invalidate,
  };
}
