"use client";

import { ParentCheckoutDashboard } from "@/modules/parent/presentation/components/checkout/ParentCheckoutDashboard";

type ParentCheckoutResultPageProps = {
  sessionId: string;
};

export function ParentCheckoutResultPage({ sessionId }: ParentCheckoutResultPageProps) {
  return <ParentCheckoutDashboard initialSessionId={sessionId} />;
}
