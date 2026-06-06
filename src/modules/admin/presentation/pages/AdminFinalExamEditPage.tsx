"use client";

import { FinalExamForm } from "@/modules/admin/presentation/components/exams-management";

export type AdminFinalExamEditPageProps = {
  courseId: string;
};

export function AdminFinalExamEditPage({ courseId }: AdminFinalExamEditPageProps) {
  return <FinalExamForm mode="edit" courseId={courseId} />;
}
