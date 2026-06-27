import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { courseDetailsQueryKeys } from "@/modules/student/application/constants/courseDetailsQueryKeys";
import { CheckoutPageSkeleton } from "@/modules/student/presentation/components/checkout/CheckoutSkeleton";
import { StudentCheckoutPage } from "@/modules/student/presentation/pages/StudentCheckoutPage";
import { getCourseExploreDetails } from "@/shared/infrastructure/api/course.api";

type CheckoutRouteParams = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: CheckoutRouteParams): Promise<Metadata> {
  const { courseId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("student.dashboard.checkout");

  try {
    const course = await getCourseExploreDetails(courseId, locale);
    return { title: `${t("page.title")} — ${course.title}` };
  } catch {
    return { title: t("page.title") };
  }
}

async function CheckoutContent({ courseId }: { courseId: string }) {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  let course: Awaited<ReturnType<typeof getCourseExploreDetails>> | null = null;

  try {
    course = await getCourseExploreDetails(courseId, locale);
  } catch {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: courseDetailsQueryKeys.detail(locale, courseId),
    queryFn: () => getCourseExploreDetails(courseId, locale),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentCheckoutPage courseId={courseId} initial={{ course }} />
    </HydrationBoundary>
  );
}

export default async function StudentCheckoutRoute({ params }: CheckoutRouteParams) {
  const { courseId } = await params;

  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutContent courseId={courseId} />
    </Suspense>
  );
}
