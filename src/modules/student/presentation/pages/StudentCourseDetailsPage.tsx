"use client";

import type { CourseDetailsInitialData } from "@/modules/student/application/hooks/useCourseDetails";
import { CourseDetailsDashboard } from "@/modules/student/presentation/components/course-details/CourseDetailsDashboard";

type StudentCourseDetailsPageProps = {
  courseId: string;
  initial?: CourseDetailsInitialData;
};

export function StudentCourseDetailsPage({ courseId, initial }: StudentCourseDetailsPageProps) {
  return <CourseDetailsDashboard courseId={courseId} initial={initial} />;
}
