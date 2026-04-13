import { DashboardLayout } from "@/shared/presentation/layouts";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="student">{children}</DashboardLayout>;
}
