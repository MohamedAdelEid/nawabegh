"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type { Subject } from "@/shared/domain/types/subject.types";
import type { Teacher } from "@/shared/domain/types/teacher.types";
import { mapExploreCourseToCard } from "@/shared/domain/utils/course.utils";
import { getExploreCoursesPage } from "@/shared/infrastructure/api/course.api";
import { getSubjects } from "@/shared/infrastructure/api/subject.api";
import { getTeachers } from "@/shared/infrastructure/api/teacher.api";
import {
  EXPLORE_COURSES_PAGE_SIZE,
  exploreCoursesQueryKeys,
} from "@/modules/student/application/constants/exploreCoursesQueryKeys";

const SEARCH_DEBOUNCE_MS = 350;
const ALL_SUBJECTS_ID = null;

export type ExploreCoursesFilters = {
  keyword: string;
  subjectId: number | null;
  teacherId: string | null;
  accessType: CourseAccessType | null;
};

export type ExploreCoursesInitialData = {
  subjects: Subject[];
  teachers: Teacher[];
  coursesPage: Awaited<ReturnType<typeof getExploreCoursesPage>>;
};

type UseExploreCoursesOptions = {
  initial?: ExploreCoursesInitialData;
};

function parseSubjectId(value: string | null): number | null {
  if (!value || value === "all") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useExploreCourses({ initial }: UseExploreCoursesOptions = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [subjectId, setSubjectId] = useState<number | null>(
    parseSubjectId(searchParams.get("subject")),
  );
  const [teacherId, setTeacherId] = useState<string | null>(
    searchParams.get("teacher") || null,
  );
  const [accessType, setAccessType] = useState<CourseAccessType | null>(null);
  const [teacherSearch, setTeacherSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedKeyword) params.set("q", debouncedKeyword);
    else params.delete("q");
    if (subjectId != null) params.set("subject", String(subjectId));
    else params.delete("subject");
    if (teacherId) params.set("teacher", teacherId);
    else params.delete("teacher");

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [debouncedKeyword, subjectId, teacherId, pathname, router, searchParams]);

  const subjectsQuery = useQuery({
    queryKey: exploreCoursesQueryKeys.subjects(locale),
    queryFn: () =>
      getSubjects({ keyword: " ", pageNumber: 1, pageSize: 200 }),
    initialData: initial?.subjects,
    staleTime: 60_000,
  });

  const teachersQuery = useQuery({
    queryKey: exploreCoursesQueryKeys.teachers(locale, subjectId, teacherSearch),
    queryFn: () =>
      getTeachers({
        keyword: teacherSearch.trim() || " ",
        pageNumber: 1,
        pageSize: 200,
        ...(subjectId != null ? { subjectId } : {}),
      }),
    initialData:
      subjectId === ALL_SUBJECTS_ID && !teacherSearch.trim()
        ? initial?.teachers
        : undefined,
    staleTime: 60_000,
  });

  const filterSnapshot = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      subjectId: subjectId ?? undefined,
      teacherId: teacherId ?? undefined,
      accessType: accessType ?? undefined,
    }),
    [debouncedKeyword, subjectId, teacherId, accessType],
  );

  const coursesQuery = useInfiniteQuery({
    queryKey: exploreCoursesQueryKeys.courses(locale, filterSnapshot),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getExploreCoursesPage({
        ...filterSnapshot,
        pageNumber: pageParam as number,
        pageSize: EXPLORE_COURSES_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    staleTime: 30_000,
  });

  const courses = useMemo(() => {
    const seen = new Set<string>();
    const rows = [];
    for (const page of coursesQuery.data?.pages ?? []) {
      for (const row of page.rows) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        rows.push(mapExploreCourseToCard(row, locale));
      }
    }
    return rows;
  }, [coursesQuery.data?.pages, locale]);

  const updateSubjectId = (next: number | null) => {
    setSubjectId(next);
    setTeacherId(null);
  };

  return {
    keyword,
    setKeyword,
    subjectId,
    setSubjectId: updateSubjectId,
    teacherId,
    setTeacherId,
    accessType,
    setAccessType,
    teacherSearch,
    setTeacherSearch,
    subjectsQuery,
    teachersQuery,
    coursesQuery,
    courses,
    filters: {
      keyword,
      subjectId,
      teacherId,
      accessType,
    } satisfies ExploreCoursesFilters,
  };
}
