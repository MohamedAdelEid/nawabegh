import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentDailyTasksPage } from "@/modules/student/presentation/pages/StudentDailyTasksPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.dailyTasks.page");
  return { title: t("title") };
}

export default function StudentDailyTasksRoute() {
  return <StudentDailyTasksPage />;
}
