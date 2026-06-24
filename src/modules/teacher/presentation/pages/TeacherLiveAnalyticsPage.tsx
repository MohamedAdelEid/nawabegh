import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function TeacherLiveAnalyticsPage() {
  redirect(`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=analytics`);
}
