"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolHomeQueryKeys } from "@/modules/school/application/constants/schoolHomeQueryKeys";
import { getSchoolHome } from "@/modules/school/infrastructure/api/schoolHomeApi";

export function useSchoolHome() {
  const auth = useAuth();
  return useQuery({
    queryKey: schoolHomeQueryKeys.dashboard(),
    queryFn: getSchoolHome,
    enabled: auth.user?.role === "School",
  });
}
