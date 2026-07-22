import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ParentCheckoutPageSkeleton } from "@/modules/parent/presentation/components/checkout/ParentCheckoutSkeleton";
import { ParentCourseCheckoutPage } from "@/modules/parent/presentation/pages/ParentCourseCheckoutPage";

type ParentCheckoutRouteParams = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ studentUserId?: string; sessionId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parent.dashboard.checkout");
  return { title: t("page.title") };
}

export default async function ParentCourseCheckoutRoute({
  params,
  searchParams,
}: ParentCheckoutRouteParams) {
  const { courseId } = await params;
  const { studentUserId, sessionId } = await searchParams;

  return (
    <Suspense fallback={<ParentCheckoutPageSkeleton />}>
      <ParentCourseCheckoutPage
        courseId={courseId}
        studentUserId={studentUserId}
        initialSessionId={sessionId}
      />
    </Suspense>
  );
}
