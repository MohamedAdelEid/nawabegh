import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ParentCourseDetailPage } from "@/modules/parent/presentation/pages/ParentCourseDetailPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type ParentCourseDetailRouteParams = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parent.dashboard.learning");
  return { title: t("catalogTitle") };
}

export default async function ParentCourseDetailRoute({ params }: ParentCourseDetailRouteParams) {
  const { courseId } = await params;

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <ParentCourseDetailPage courseId={courseId} />
    </Suspense>
  );
}
