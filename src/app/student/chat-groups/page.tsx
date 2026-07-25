import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export default function StudentChatGroupsRoute() {
  redirect(`${ROUTES.USER.STUDENT.JOURNEY}?tab=chat`);
}
