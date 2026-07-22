"use client";

import { useQuery } from "@tanstack/react-query";
import { parentPaymentsQueryKeys } from "@/modules/parent/application/constants/parentPaymentsQueryKeys";
import { fetchParentPaymentsDashboard } from "@/modules/parent/infrastructure/api/parentPaymentsApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentPaymentsDashboard() {
  const auth = useAuth();
  const enabled = auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentPaymentsQueryKeys.dashboard(),
    queryFn: fetchParentPaymentsDashboard,
    enabled,
  });
}
