import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export default function TeacherLiveAnalyticsRedirectPage() {
  redirect(`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=analytics`);
}
