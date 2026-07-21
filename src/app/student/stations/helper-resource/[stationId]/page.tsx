import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HelperResourceSkeleton } from "@/modules/student/presentation/components/helper-resource/HelperResourceSkeleton";
import { StudentHelperResourcePage } from "@/modules/student/presentation/pages/StudentHelperResourcePage";

type HelperResourceRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.helperResource.page");
  return { title: t("title") };
}

export default async function StudentHelperResourceRoute({
  params,
}: HelperResourceRouteParams) {
  const { stationId } = await params;

  return (
    <Suspense fallback={<HelperResourceSkeleton />}>
      <StudentHelperResourcePage stationId={stationId} />
    </Suspense>
  );
}
