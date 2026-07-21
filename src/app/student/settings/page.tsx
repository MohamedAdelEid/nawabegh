import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export default function StudentSettingsRoute() {
  redirect(ROUTES.USER.STUDENT.PROFILE);
}
