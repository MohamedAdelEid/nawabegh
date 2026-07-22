"use client";

import { useQuery } from "@tanstack/react-query";
import { parentPaymentsQueryKeys } from "@/modules/parent/application/constants/parentPaymentsQueryKeys";
import { fetchParentPaymentTransactionDetail } from "@/modules/parent/infrastructure/api/parentPaymentsApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentPaymentTransactionDetail(
  transactionId: string | null,
  open: boolean,
) {
  const auth = useAuth();
  const isParent = auth.user?.role?.toLowerCase() === "parent";

  return useQuery({
    queryKey: parentPaymentsQueryKeys.transactionDetail(transactionId ?? ""),
    queryFn: () => fetchParentPaymentTransactionDetail(transactionId!),
    enabled: isParent && open && Boolean(transactionId),
  });
}
