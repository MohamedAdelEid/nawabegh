"use client";

import type { ExploreCoursesInitialData } from "@/modules/student/application/hooks/useExploreCourses";
import { ExploreCoursesDashboard } from "@/modules/student/presentation/components/explore-courses/ExploreCoursesDashboard";

type StudentExploreCoursesPageProps = {
  initial?: ExploreCoursesInitialData;
};

export function StudentExploreCoursesPage({ initial }: StudentExploreCoursesPageProps) {
  return <ExploreCoursesDashboard initial={initial} />;
}
