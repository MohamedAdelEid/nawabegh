"use client";

import { useQuery } from "@tanstack/react-query";
import { parentHomeQueryKeys } from "@/modules/parent/application/constants/parentHomeQueryKeys";
import { fetchParentHomeDashboard } from "@/modules/parent/infrastructure/api/parentHomeApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentHomeDashboard() {
  const auth = useAuth();
  const enabled = auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentHomeQueryKeys.dashboard(),
    queryFn: fetchParentHomeDashboard,
    enabled,
  });
}
