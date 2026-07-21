import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentChatGroupsPage } from "@/modules/student/presentation/pages/StudentChatGroupsPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.chatGroups");
  return { title: t("title") };
}

export default function StudentChatGroupsRoute() {
  return <StudentChatGroupsPage />;
}
