import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckoutPageSkeleton } from "@/modules/student/presentation/components/checkout/CheckoutSkeleton";
import { StudentCheckoutResultPage } from "@/modules/student/presentation/pages/StudentCheckoutResultPage";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type CheckoutResultSearchParams = {
  searchParams: Promise<{ sessionId?: string; status?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.checkout");
  return { title: t("result.title") };
}

async function CheckoutResultContent({
  sessionId,
}: {
  sessionId: string;
}) {
  return <StudentCheckoutResultPage sessionId={sessionId} />;
}

export default async function StudentCheckoutResultRoute({
  searchParams,
}: CheckoutResultSearchParams) {
  const { sessionId } = await searchParams;

  if (!sessionId?.trim()) {
    redirect(ROUTES.USER.STUDENT.COURSES);
  }

  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutResultContent sessionId={sessionId.trim()} />
    </Suspense>
  );
}
