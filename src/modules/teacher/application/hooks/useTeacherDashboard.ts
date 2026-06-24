"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherDashboard() {
  const locale = useLocale();
  const auth = useAuth();

  return useQuery({
    queryKey: ["teacher", "dashboard", locale],
    queryFn: () => teacherApi.getDashboard(locale),
    enabled: auth.user?.role === "Teacher",
  });
}
