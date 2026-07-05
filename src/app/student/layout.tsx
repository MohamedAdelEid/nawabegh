import { StudentAreaLayout } from "@/modules/student/presentation/layouts/StudentAreaLayout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentAreaLayout>{children}</StudentAreaLayout>;
}
