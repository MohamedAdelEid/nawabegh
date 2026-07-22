"use client";

import { useQuery } from "@tanstack/react-query";
import { parentChildrenQueryKeys } from "@/modules/parent/application/constants/parentChildrenQueryKeys";
import { fetchParentChildren } from "@/modules/parent/infrastructure/api/parentChildrenApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentChildren() {
  const auth = useAuth();
  const enabled = auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentChildrenQueryKeys.list(),
    queryFn: fetchParentChildren,
    enabled,
  });
}
