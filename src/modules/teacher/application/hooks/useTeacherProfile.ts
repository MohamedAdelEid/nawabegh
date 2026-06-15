"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { TEACHER_MOCK_PROFILE } from "@/modules/teacher/domain/data/teacherMockProfile";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherProfile() {
  const auth = useAuth();
  const profileQuery = useQuery({
    queryKey: ["teacher", "profile"],
    queryFn: () => teacherApi.getProfile(),
    enabled: auth.user?.role === "Teacher",
  });

  const apiProfile = profileQuery.data;
  const isTeacher = auth.user?.role === "Teacher";

  const user = auth.user
    ? {
        ...auth.user,
        name: auth.user.name || apiProfile?.name || TEACHER_MOCK_PROFILE.name,
        email: auth.user.email || apiProfile?.email || TEACHER_MOCK_PROFILE.email,
      }
    : null;

  return {
    ...auth,
    user,
    isTeacher,
    mockPassword: apiProfile?.password ?? TEACHER_MOCK_PROFILE.password,
    isProfileLoading: profileQuery.isLoading,
  };
}
