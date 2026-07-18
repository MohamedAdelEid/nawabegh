"use client";

import { SchoolLeaderboardDashboard } from "@/modules/school/presentation/components/honor-board/SchoolLeaderboardDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolLeaderboardPage() {
  return (
    <SchoolPageTransition>
      <SchoolLeaderboardDashboard />
    </SchoolPageTransition>
  );
}
