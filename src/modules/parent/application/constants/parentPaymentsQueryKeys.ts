export const parentPaymentsQueryKeys = {
  all: ["parent", "payments"] as const,
  dashboard: () => [...parentPaymentsQueryKeys.all, "dashboard"] as const,
  transactions: (params: Record<string, unknown>) =>
    [...parentPaymentsQueryKeys.all, "transactions", params] as const,
  transactionDetail: (id: string) =>
    [...parentPaymentsQueryKeys.all, "transaction", id] as const,
};
