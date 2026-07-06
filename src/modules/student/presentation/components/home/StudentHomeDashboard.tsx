"use client";

import { useStudentHomeDashboard } from "@/modules/student/application/hooks/useStudentHomeDashboard";
import { CommunityActivitySection } from "./CommunityActivitySection";
import { ExpertTeachersSection } from "./ExpertTeachersSection";
import { HomeCoursesSection } from "./HomeCoursesSection";
import { HomeLeaderboardWidget } from "./HomeLeaderboardWidget";
import { LiveSessionsSection } from "./LiveSessionsSection";

export function StudentHomeDashboard() {
  const {
    stationsQuery,
    courses,
    coursesQuery,
    leaderboardQuery,
    teachersQuery,
    feedQuery,
    isInitialLoading,
  } = useStudentHomeDashboard();

  return (
    <div className="mx-auto flex w-full flex-col gap-10">
      <LiveSessionsSection data={stationsQuery.data} isLoading={stationsQuery.isLoading && isInitialLoading} />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HomeCoursesSection
            courses={courses}
            isLoading={coursesQuery.isLoading && isInitialLoading}
          />
        </div>
        <div className="lg:col-span-4">
          <HomeLeaderboardWidget
            data={leaderboardQuery.data}
            isLoading={leaderboardQuery.isLoading && isInitialLoading}
          />
        </div>
      </div>

      <ExpertTeachersSection
        teachers={teachersQuery.data ?? []}
        isLoading={teachersQuery.isLoading && isInitialLoading}
      />

      <CommunityActivitySection
        posts={feedQuery.data ?? []}
        isLoading={feedQuery.isLoading && isInitialLoading}
      />
    </div>
  );
}
