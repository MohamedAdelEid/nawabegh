"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type { CourseCardModel } from "@/shared/domain/types/course.types";
import type { TeacherPublicProfile } from "@/shared/domain/types/teacher.types";
import { mapExploreCourseToCard } from "@/shared/domain/utils/course.utils";
import {
  pickTeacherProfileHeroCourse,
  splitTeacherCertificates,
} from "@/shared/domain/utils/teacher.utils";
import { getExploreCoursesPage } from "@/shared/infrastructure/api/course.api";
import { getTeacherPublicProfile } from "@/shared/infrastructure/api/teacher.api";
import {
  TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
  teacherPublicProfileQueryKeys,
} from "@/modules/student/application/constants/teacherPublicProfileQueryKeys";

export type TeacherPublicProfileInitialData = {
  profile: TeacherPublicProfile;
  coursesPage: Awaited<ReturnType<typeof getExploreCoursesPage>>;
};

type UseTeacherPublicProfileOptions = {
  teacherId: string;
  initial?: TeacherPublicProfileInitialData;
};

export function useTeacherPublicProfile({
  teacherId,
  initial,
}: UseTeacherPublicProfileOptions) {
  const locale = useLocale();
  const [pageNumber, setPageNumber] = useState(1);

  const profileQuery = useQuery({
    queryKey: teacherPublicProfileQueryKeys.profile(locale, teacherId),
    queryFn: () => getTeacherPublicProfile(teacherId),
    initialData: initial?.profile,
    staleTime: 60_000,
  });

  const coursesQuery = useQuery({
    queryKey: teacherPublicProfileQueryKeys.courses(locale, teacherId, pageNumber),
    queryFn: () =>
      getExploreCoursesPage({
        teacherId,
        pageNumber,
        pageSize: TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
      }),
    initialData:
      pageNumber === 1 && initial?.coursesPage ? initial.coursesPage : undefined,
    staleTime: 30_000,
  });

  const courses = useMemo<CourseCardModel[]>(() => {
    return (coursesQuery.data?.rows ?? []).map((row) => mapExploreCourseToCard(row, locale));
  }, [coursesQuery.data?.rows, locale]);

  const { hero, regular } = useMemo(
    () => pickTeacherProfileHeroCourse(courses),
    [courses],
  );

  const certificateGroups = useMemo(
    () => splitTeacherCertificates(profileQuery.data?.certificates ?? []),
    [profileQuery.data?.certificates],
  );

  const coursesCount =
    coursesQuery.data?.totalCount ??
    profileQuery.data?.publishedCourses.length ??
    0;

  const handlePageChange = (nextPage: number) => {
    setPageNumber(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    profileQuery,
    coursesQuery,
    profile: profileQuery.data,
    courses,
    heroCourse: hero,
    regularCourses: regular,
    certificateGroups,
    coursesCount,
    pageNumber,
    totalPages: coursesQuery.data?.totalPages ?? 1,
    currentPage: coursesQuery.data?.currentPage ?? pageNumber,
    setPageNumber: handlePageChange,
  };
}
