"use client";

import { useQuery } from "@tanstack/react-query";
import { parentPaymentsQueryKeys } from "@/modules/parent/application/constants/parentPaymentsQueryKeys";
import type { ParentPaymentTransactionsQuery } from "@/modules/parent/domain/types/parentPayments.types";
import { fetchParentPaymentTransactions } from "@/modules/parent/infrastructure/api/parentPaymentsApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentPaymentTransactions(
  query: ParentPaymentTransactionsQuery,
  enabled = true,
) {
  const auth = useAuth();
  const isParent = auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentPaymentsQueryKeys.transactions(query),
    queryFn: () => fetchParentPaymentTransactions(query),
    enabled: isParent && enabled,
  });
}
