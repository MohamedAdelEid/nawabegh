"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolHomeQueryKeys } from "@/modules/school/application/constants/schoolHomeQueryKeys";
import {
  deleteSchoolHomeArticle,
  getSchoolHomeArticles,
  hideSchoolHomeArticle,
} from "@/modules/school/infrastructure/api/schoolHomeApi";
import type { SchoolHomeArticleStatusFilter } from "@/modules/school/domain/types/schoolHome.types";

const PAGE_SIZE = 10;

export function useSchoolHomeArticles() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<SchoolHomeArticleStatusFilter>("all");

  const params = useMemo(
    () => ({ pageNumber, pageSize: PAGE_SIZE, status }),
    [pageNumber, status],
  );

  const query = useQuery({
    queryKey: schoolHomeQueryKeys.articles(params),
    queryFn: () => getSchoolHomeArticles(params),
    enabled: auth.user?.role === "School",
    placeholderData: keepPreviousData,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: schoolHomeQueryKeys.all });
  };

  const hide = useMutation({
    mutationFn: hideSchoolHomeArticle,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteSchoolHomeArticle,
    onSuccess: invalidate,
  });

  const totalPages = query.data?.totalPages ?? 1;
  useEffect(() => {
    if (query.data && pageNumber > totalPages) setPageNumber(totalPages);
  }, [pageNumber, query.data, totalPages]);

  return {
    page: query.data ?? null,
    pageNumber,
    setPageNumber,
    status,
    setStatus: (next: SchoolHomeArticleStatusFilter) => {
      setStatus(next);
      setPageNumber(1);
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    hide,
    remove,
  };
}
