/** Mirrors Nawabegh.API checkout & payment domain. */

export enum CheckoutSessionStatus {
  AwaitingMethod = 0,
  PendingPayment = 1,
  Succeeded = 2,
  Failed = 3,
  Expired = 4,
}

export enum CheckoutPaymentMethod {
  None = 0,
  Visa = 1,
  ActivationCode = 2,
}

export enum PaymentTransactionStatus {
  Initiated = 0,
  PendingProviderAction = 1,
  Succeeded = 2,
  Failed = 3,
  Cancelled = 4,
}

export type CheckoutWizardStep = "payment" | "processing" | "success" | "failed";
