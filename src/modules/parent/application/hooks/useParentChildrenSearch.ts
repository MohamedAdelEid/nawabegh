"use client";

import { useQuery } from "@tanstack/react-query";
import { parentChildrenQueryKeys } from "@/modules/parent/application/constants/parentChildrenQueryKeys";
import {
  fetchParentCreateChildDefaults,
  searchParentChildren,
} from "@/modules/parent/infrastructure/api/parentChildrenApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentChildrenSearch(params: {
  keyword: string;
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const auth = useAuth();
  const keyword = params.keyword.trim();
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 20;
  const enabled =
    (params.enabled ?? true) &&
    auth.user?.role?.toLowerCase() === "parent" &&
    keyword.length >= 2;

  return useQuery({
    queryKey: parentChildrenQueryKeys.search(keyword, pageNumber, pageSize),
    queryFn: () => searchParentChildren({ keyword, pageNumber, pageSize }),
    enabled,
  });
}

export function useParentCreateChildDefaults(enabled = true) {
  const auth = useAuth();
  const canRun =
    enabled && auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentChildrenQueryKeys.createDefaults(),
    queryFn: fetchParentCreateChildDefaults,
    enabled: canRun,
  });
}
