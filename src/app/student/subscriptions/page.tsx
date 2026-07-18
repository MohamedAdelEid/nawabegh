import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StudentSubscriptionsPage } from "@/modules/student/presentation/pages/StudentSubscriptionsPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.subscriptions.page");
  return { title: t("title"), description: t("description") };
}

export default function StudentSubscriptionsRoute() {
  return <StudentSubscriptionsPage />;
}
