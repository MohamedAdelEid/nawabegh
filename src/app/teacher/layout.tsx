import { DashboardLayout } from "@/shared/presentation/layouts";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="teacher">{children}</DashboardLayout>;
}
