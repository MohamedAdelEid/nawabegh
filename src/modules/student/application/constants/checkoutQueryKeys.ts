export const checkoutQueryKeys = {
  session: (sessionId: string) => ["student-checkout-session", sessionId] as const,
  result: (sessionId: string) => ["student-checkout-result", sessionId] as const,
  invoice: (sessionId: string) => ["student-checkout-invoice", sessionId] as const,
};
