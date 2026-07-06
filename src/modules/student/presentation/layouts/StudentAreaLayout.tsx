"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { onboardingQuizQueryKeys } from "@/modules/student/application/constants/onboardingQuizQueryKeys";
import { fetchStudentProfileSummary } from "@/modules/student/infrastructure/api/onboardingQuizApi";
import { DashboardLayout } from "@/shared/presentation/layouts";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const ONBOARDING_PREFIX = ROUTES.USER.STUDENT.ONBOARDING_QUIZ;
const FRIEND_CHALLENGE_DUEL_PREFIX = `${ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB}/sessions`;

function normalizeRole(role?: string | null): string {
  return role?.trim().toLowerCase() ?? "student";
}

type StudentAreaLayoutProps = {
  children: React.ReactNode;
};

export function StudentAreaLayout({ children }: StudentAreaLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PREFIX);
  const isFriendChallengeDuelRoute = pathname.startsWith(FRIEND_CHALLENGE_DUEL_PREFIX);
  const userId = session?.user?.id;
  const isStudent = normalizeRole(session?.user?.role) === "student";

  const profileQuery = useQuery({
    queryKey: onboardingQuizQueryKeys.profile(userId ?? "anonymous"),
    queryFn: () => fetchStudentProfileSummary(userId!),
    enabled: status === "authenticated" && isStudent && Boolean(userId),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (status !== "authenticated" || !isStudent || profileQuery.isLoading) return;

    const completed = profileQuery.data?.onboardingQuizCompleted ?? false;

    if (!completed && !isOnboardingRoute) {
      router.replace(ONBOARDING_PREFIX);
    }
  }, [
    isOnboardingRoute,
    isStudent,
    pathname,
    profileQuery.data?.onboardingQuizCompleted,
    profileQuery.isLoading,
    router,
    status,
  ]);

  if (isOnboardingRoute || isFriendChallengeDuelRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout variant="student">{children}</DashboardLayout>;
}
