export const parentCheckoutQueryKeys = {
  session: (sessionId: string) => ["parent-checkout-session", sessionId] as const,
  result: (sessionId: string) => ["parent-checkout-result", sessionId] as const,
  invoice: (sessionId: string) => ["parent-checkout-invoice", sessionId] as const,
};
