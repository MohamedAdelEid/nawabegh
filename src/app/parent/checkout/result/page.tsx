import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ParentCheckoutPageSkeleton } from "@/modules/parent/presentation/components/checkout/ParentCheckoutSkeleton";
import { ParentCheckoutResultPage } from "@/modules/parent/presentation/pages/ParentCheckoutResultPage";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type ParentCheckoutResultRouteParams = {
  searchParams: Promise<{ sessionId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parent.dashboard.checkout");
  return { title: t("result.title") };
}

export default async function ParentCheckoutResultRoute({
  searchParams,
}: ParentCheckoutResultRouteParams) {
  const { sessionId } = await searchParams;

  if (!sessionId?.trim()) {
    redirect(ROUTES.USER.PARENT.COURSES_CATALOG);
  }

  return (
    <Suspense fallback={<ParentCheckoutPageSkeleton />}>
      <ParentCheckoutResultPage sessionId={sessionId.trim()} />
    </Suspense>
  );
}
