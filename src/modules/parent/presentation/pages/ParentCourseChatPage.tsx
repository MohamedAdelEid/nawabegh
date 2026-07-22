"use client";

import { useParams } from "next/navigation";
import { ParentCourseChatDashboard } from "@/modules/parent/presentation/components/learning/ParentCourseChatDashboard";

export function ParentCourseChatPage() {
  const params = useParams<{ studentUserId: string; courseId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const courseId = decodeURIComponent(params.courseId ?? "");

  return <ParentCourseChatDashboard studentUserId={studentUserId} courseId={courseId} />;
}
