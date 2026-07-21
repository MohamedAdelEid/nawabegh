import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentChatMembersPage } from "@/modules/student/presentation/pages/StudentChatMembersPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.chatGroups.members");
  return { title: t("headerTitle") };
}

export default async function StudentChatMembersRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <StudentChatMembersPage courseId={courseId} />;
}
