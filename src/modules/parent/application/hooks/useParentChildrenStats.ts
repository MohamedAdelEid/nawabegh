"use client";

import { useQuery } from "@tanstack/react-query";
import { parentHomeQueryKeys } from "@/modules/parent/application/constants/parentHomeQueryKeys";
import { fetchParentChildrenStats } from "@/modules/parent/infrastructure/api/parentHomeApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentChildrenStats() {
  const auth = useAuth();
  const enabled = auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentHomeQueryKeys.childrenStats(),
    queryFn: fetchParentChildrenStats,
    enabled,
  });
}
