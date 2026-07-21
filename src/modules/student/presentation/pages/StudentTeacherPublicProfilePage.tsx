"use client";

import type { TeacherPublicProfileInitialData } from "@/modules/student/application/hooks/useTeacherPublicProfile";
import { TeacherPublicProfileDashboard } from "@/modules/student/presentation/components/teacher-public-profile/TeacherPublicProfileDashboard";

type StudentTeacherPublicProfilePageProps = {
  teacherId: string;
  initial?: TeacherPublicProfileInitialData;
};

export function StudentTeacherPublicProfilePage({
  teacherId,
  initial,
}: StudentTeacherPublicProfilePageProps) {
  return <TeacherPublicProfileDashboard teacherId={teacherId} initial={initial} />;
}
