"use client";

import { CheckoutDashboard } from "@/modules/student/presentation/components/checkout/CheckoutDashboard";

type StudentCheckoutResultPageProps = {
  sessionId: string;
};

export function StudentCheckoutResultPage({ sessionId }: StudentCheckoutResultPageProps) {
  return <CheckoutDashboard initialSessionId={sessionId} />;
}
