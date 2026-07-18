"use client";

import { SchoolHonoredStudentsDashboard } from "@/modules/school/presentation/components/honor-board/SchoolHonoredStudentsDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolHonoredStudentsPage() {
  return (
    <SchoolPageTransition>
      <SchoolHonoredStudentsDashboard />
    </SchoolPageTransition>
  );
}
