"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherCourseCreatePayload } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      submitForReview = false,
    }: {
      payload: TeacherCourseCreatePayload;
      submitForReview?: boolean;
    }) => teacherApi.createCourse(payload, submitForReview),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher", "dashboard"] });
    },
  });
}

export function useTeacherUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TeacherCourseCreatePayload) =>
      teacherApi.updateCourse(courseId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher", "course", courseId] });
    },
  });
}

export function useTeacherDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => teacherApi.deleteCourse(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher", "dashboard"] });
    },
  });
}

export function useTeacherSendCourseForReview(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teacherApi.sendCourseForReview(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher", "course", courseId] });
    },
  });
}
