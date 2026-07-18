import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentWeeklySchedulePage } from "@/modules/student/presentation/pages/StudentWeeklySchedulePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.weeklySchedule.page");
  return { title: t("title"), description: t("description") };
}

export default function StudentWeeklyScheduleRoute() {
  return <StudentWeeklySchedulePage />;
}
