import { DashboardLayout } from "@/shared/presentation/layouts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="admin">{children}</DashboardLayout>;
}
