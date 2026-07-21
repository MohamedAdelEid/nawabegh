import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentLiveStationPage } from "@/modules/student/presentation/pages/StudentLiveStationPage";

type LiveStationRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.liveStation.page");
  return { title: t("title") };
}

export default async function StudentLiveStationRoute({
  params,
}: LiveStationRouteParams) {
  const { stationId } = await params;
  return <StudentLiveStationPage stationId={stationId} />;
}
