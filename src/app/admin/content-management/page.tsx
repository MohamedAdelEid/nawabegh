import { redirect } from "next/navigation";

export default function ContentManagementTabRoute() {
  redirect("/admin/dashboard?tab=contentManagement");
}
