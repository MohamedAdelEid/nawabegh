import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentProfilePage } from "@/modules/student/presentation/pages/StudentProfilePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.profile.page");
  return { title: t("title"), description: t("description") };
}

export default function StudentProfileRoute() {
  return <StudentProfilePage />;
}
