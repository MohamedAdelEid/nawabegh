import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherCoursesStatisticsOverview() {
  return useQuery({
    queryKey: ["teacher", "courses-statistics-overview"],
    queryFn: () => teacherApi.getCoursesStatisticsOverview(),
  });
}
