"use client";

import { TeacherSessionDetailsView } from "@/modules/teacher/presentation/components/session-details/TeacherSessionDetailsView";

export function TeacherSessionDetailsPage({ sessionId }: { sessionId: string }) {
  return <TeacherSessionDetailsView sessionId={sessionId} />;
}
