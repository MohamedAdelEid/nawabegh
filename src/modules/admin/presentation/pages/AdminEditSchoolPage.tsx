"use client";

import { AdminAddSchoolPage } from "@/modules/admin/presentation/pages/AdminAddSchoolPage";

interface AdminEditSchoolPageProps {
  schoolId: string;
}

export function AdminEditSchoolPage({ schoolId }: AdminEditSchoolPageProps) {
  return <AdminAddSchoolPage schoolId={schoolId} />;
}
