"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { parentLearningQueryKeys } from "@/modules/parent/application/constants/parentLearningQueryKeys";
import type { ParentCourseSummary } from "@/modules/parent/domain/types/parentLearning.types";
import {
  fetchParentChildCourses,
  fetchParentChildDashboard,
  fetchParentChildReports,
  fetchParentChildResources,
  fetchParentChildSubscription,
  fetchParentCourseJourney,
  fetchParentCoursesCatalog,
  fetchParentStationDetail,
} from "@/modules/parent/infrastructure/api/parentLearningApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

function useIsParent() {
  const auth = useAuth();
  return auth.user?.role?.toLowerCase() === "parent";
}

export function useParentChildCourses(studentUserId: string | null | undefined) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.courses(studentUserId ?? ""),
    queryFn: () => fetchParentChildCourses(studentUserId!),
    enabled: isParent && Boolean(studentUserId),
  });
}

export function useParentChildReports(
  studentUserId: string | null | undefined,
  courseId?: string | null,
) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.reports(studentUserId ?? "", courseId ?? undefined),
    queryFn: () => fetchParentChildReports(studentUserId!, courseId ?? undefined),
    enabled: isParent && Boolean(studentUserId),
  });
}

export function useParentChildLearningDashboard(
  studentUserId: string | null | undefined,
  weekStart?: string,
) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.dashboard(studentUserId ?? "", weekStart),
    queryFn: () => fetchParentChildDashboard(studentUserId!, weekStart),
    enabled: isParent && Boolean(studentUserId),
  });
}

export function useParentCourseJourney(
  studentUserId: string | null | undefined,
  courseId: string | null | undefined,
) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.journey(studentUserId ?? "", courseId ?? ""),
    queryFn: () => fetchParentCourseJourney(studentUserId!, courseId!),
    enabled: isParent && Boolean(studentUserId) && Boolean(courseId),
  });
}

export function useParentChildResources(
  studentUserId: string | null | undefined,
  filters: {
    keyword?: string;
    mediaKind?: string;
    courseId?: string;
    pageNumber?: number;
    pageSize?: number;
  } = {},
) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.resources(studentUserId ?? "", {
      keyword: filters.keyword,
      mediaKind: filters.mediaKind,
      courseId: filters.courseId,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    queryFn: () => fetchParentChildResources(studentUserId!, filters),
    enabled: isParent && Boolean(studentUserId),
  });
}

export function useParentStationDetail(
  studentUserId: string | null | undefined,
  stationId: string | null | undefined,
) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.station(studentUserId ?? "", stationId ?? ""),
    queryFn: () => fetchParentStationDetail(studentUserId!, stationId!),
    enabled: isParent && Boolean(studentUserId) && Boolean(stationId),
  });
}

export function useParentChildSubscription(
  studentUserId: string | null | undefined,
  enrollmentId: string | null | undefined,
) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.subscription(
      studentUserId ?? "",
      enrollmentId ?? "",
    ),
    queryFn: () => fetchParentChildSubscription(studentUserId!, enrollmentId!),
    enabled: isParent && Boolean(studentUserId) && Boolean(enrollmentId),
  });
}

export function useParentCoursesCatalog(filters: {
  studentUserId?: string;
  keyword?: string;
  subjectId?: string;
  gradeId?: number;
  pageNumber?: number;
  pageSize?: number;
} = {}) {
  const isParent = useIsParent();
  return useQuery({
    queryKey: parentLearningQueryKeys.catalog({
      studentUserId: filters.studentUserId,
      keyword: filters.keyword,
      subjectId: filters.subjectId,
      gradeId: filters.gradeId,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    queryFn: () => fetchParentCoursesCatalog(filters),
    enabled: isParent,
  });
}

/**
 * Merges the catalog card (pricing/description) with the enrolled-course row
 * (progress) for a single course. There is no dedicated "course details" API
 * for the parent app, so the catalog + child-courses lists are the source of truth.
 */
export function useParentCourseSummary(
  studentUserId: string | null | undefined,
  courseId: string | null | undefined,
) {
  const catalogQuery = useParentCoursesCatalog({
    studentUserId: studentUserId ?? undefined,
    pageSize: 50,
  });
  const enrolledCoursesQuery = useParentChildCourses(studentUserId);

  const summary = useMemo<ParentCourseSummary | null>(() => {
    if (!courseId) return null;

    const catalogItem = catalogQuery.data?.items.find((item) => item.courseId === courseId);
    const enrolledItem = enrolledCoursesQuery.data?.courses.find(
      (item) => item.courseId === courseId,
    );

    if (!catalogItem && !enrolledItem) return null;

    return {
      courseId,
      title: enrolledItem?.title || catalogItem?.title || "",
      description: catalogItem?.description ?? null,
      coverImageUrl: enrolledItem?.coverImageUrl ?? catalogItem?.coverImageUrl ?? null,
      subjectName: enrolledItem?.subjectNameAr ?? catalogItem?.subjectNameAr ?? null,
      gradeName: catalogItem?.gradeNameAr ?? null,
      instructorName: enrolledItem?.instructorName ?? catalogItem?.instructorName ?? null,
      instructorImageUrl: enrolledItem?.instructorImageUrl ?? null,
      lessonsCount: enrolledItem?.lessonsCount ?? catalogItem?.lessonsCount ?? 0,
      completedLessonsCount: enrolledItem?.completedLessonsCount ?? 0,
      progressPercent: enrolledItem?.progressPercent ?? 0,
      isEnrolledForChild: Boolean(catalogItem?.isEnrolledForChild ?? enrolledItem),
      enrollmentStatus: catalogItem?.enrollmentStatus ?? enrolledItem?.status ?? null,
      actionLabelAr: enrolledItem?.actionLabelAr ?? catalogItem?.actionLabelAr ?? null,
      originalPrice: catalogItem?.originalPrice ?? enrolledItem?.originalPrice ?? null,
      discountedPrice: catalogItem?.discountedPrice ?? enrolledItem?.discountedPrice ?? null,
      currency: catalogItem?.currency || enrolledItem?.currency || "OMR",
    };
  }, [courseId, catalogQuery.data, enrolledCoursesQuery.data]);

  return {
    data: summary,
    isLoading: catalogQuery.isLoading || (Boolean(studentUserId) && enrolledCoursesQuery.isLoading),
    isError: catalogQuery.isError,
    error: catalogQuery.error,
    refetch: () => {
      void catalogQuery.refetch();
      void enrolledCoursesQuery.refetch();
    },
  };
}
