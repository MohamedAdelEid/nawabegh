"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolHonorBoardQueryKeys } from "@/modules/school/application/constants/schoolHonorBoardQueryKeys";
import type {
  SchoolHonoredStudentsParams,
  SchoolLeaderboardParams,
  UpsertSchoolHonoredStudentPayload,
} from "@/modules/school/domain/types/schoolHonorBoard.types";
import {
  createSchoolHonoredStudent,
  deleteSchoolHonoredStudent,
  getSchoolHonoredStudent,
  getSchoolHonoredStudentsDashboard,
  getSchoolLeaderboardDashboard,
  searchSchoolStudents,
  toggleSchoolHonoredStudentVisibility,
  updateSchoolHonoredStudent,
  uploadSchoolHonorImage,
} from "@/modules/school/infrastructure/api/schoolHonorBoardApi";

export function useSchoolLeaderboard(params: SchoolLeaderboardParams) {
  const auth = useAuth();
  return useQuery({
    queryKey: schoolHonorBoardQueryKeys.leaderboard(params),
    queryFn: () => getSchoolLeaderboardDashboard(params),
    enabled: auth.user?.role === "School",
    placeholderData: keepPreviousData,
  });
}

export function useSchoolHonoredStudents(params: SchoolHonoredStudentsParams) {
  const auth = useAuth();
  return useQuery({
    queryKey: schoolHonorBoardQueryKeys.honors(params),
    queryFn: () => getSchoolHonoredStudentsDashboard(params),
    enabled: auth.user?.role === "School",
    placeholderData: keepPreviousData,
  });
}

export function useSchoolHonoredStudent(id?: string) {
  const auth = useAuth();
  return useQuery({
    queryKey: schoolHonorBoardQueryKeys.honorDetail(id ?? ""),
    queryFn: () => getSchoolHonoredStudent(id as string),
    enabled: auth.user?.role === "School" && Boolean(id),
  });
}

export function useSchoolStudentSearch(keyword: string) {
  const auth = useAuth();
  const normalized = keyword.trim();
  return useQuery({
    queryKey: schoolHonorBoardQueryKeys.studentSearch(normalized),
    queryFn: () => searchSchoolStudents(normalized),
    enabled: auth.user?.role === "School" && normalized.length >= 2,
  });
}

export function useSchoolHonorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: schoolHonorBoardQueryKeys.all });

  const create = useMutation({
    mutationFn: createSchoolHonoredStudent,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertSchoolHonoredStudentPayload }) =>
      updateSchoolHonoredStudent(id, payload),
    onSuccess: invalidate,
  });
  const toggleVisibility = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      toggleSchoolHonoredStudentVisibility(id, isVisible),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteSchoolHonoredStudent,
    onSuccess: invalidate,
  });
  const uploadImage = useMutation({ mutationFn: uploadSchoolHonorImage });

  return { create, update, toggleVisibility, remove, uploadImage };
}
