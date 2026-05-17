import { DashboardLayout } from "@/shared/presentation/layouts";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="parent">{children}</DashboardLayout>;
}
