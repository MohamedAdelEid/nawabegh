"use client";

import { useQuery } from "@tanstack/react-query";
import { parentChildrenQueryKeys } from "@/modules/parent/application/constants/parentChildrenQueryKeys";
import { fetchParentChildDetails } from "@/modules/parent/infrastructure/api/parentChildrenApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentChildDetails(studentUserId: string | null | undefined) {
  const auth = useAuth();
  const enabled =
    auth.user?.role?.toLowerCase() === "parent" && Boolean(studentUserId);

  return useQuery({
    queryKey: parentChildrenQueryKeys.details(studentUserId ?? ""),
    queryFn: () => fetchParentChildDetails(studentUserId!),
    enabled,
  });
}
