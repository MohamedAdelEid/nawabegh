import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentProgressPathPage } from "@/modules/student/presentation/pages/StudentProgressPathPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.progressPath.page");
  return { title: t("title") };
}

export default function StudentJourneyRoute() {
  return <StudentProgressPathPage />;
}
