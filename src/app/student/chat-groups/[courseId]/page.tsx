import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentChatConversationPage } from "@/modules/student/presentation/pages/StudentChatConversationPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.chatGroups");
  return { title: t("title") };
}

export default async function StudentChatConversationRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <StudentChatConversationPage courseId={courseId} />;
}
