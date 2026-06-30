import { DashboardLayout } from "@/shared/presentation/layouts";

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="school">{children}</DashboardLayout>;
}
