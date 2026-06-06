"use client";

import { FinalExamPreview } from "@/modules/admin/presentation/components/exams-management";

export type AdminFinalExamPreviewPageProps = {
  courseId: string;
};

export function AdminFinalExamPreviewPage({ courseId }: AdminFinalExamPreviewPageProps) {
  return <FinalExamPreview courseId={courseId} />;
}
