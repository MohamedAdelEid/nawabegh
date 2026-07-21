"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStudentProfile } from "@/modules/student/application/hooks/useStudentProfile";
import { ProfileBadgesCarousel } from "@/modules/student/presentation/components/profile/ProfileBadgesCarousel";
import { ProfileBasicInfo } from "@/modules/student/presentation/components/profile/ProfileBasicInfo";
import { ProfileCoursesSection } from "@/modules/student/presentation/components/profile/ProfileCoursesSection";
import { ProfileEditDialog } from "@/modules/student/presentation/components/profile/ProfileEditDialog";
import { ProfileHero } from "@/modules/student/presentation/components/profile/ProfileHero";
import { ProfileKpiRow } from "@/modules/student/presentation/components/profile/ProfileKpiRow";
import { ProfileNotificationPrefs } from "@/modules/student/presentation/components/profile/ProfileNotificationPrefs";
import { ProfileRankingCard } from "@/modules/student/presentation/components/profile/ProfileRankingCard";
import { StudentProfileSkeleton } from "@/modules/student/presentation/components/profile/StudentProfileSkeleton";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";

export function StudentProfileDashboard() {
  const t = useTranslations("student.dashboard.profile");
  const [editOpen, setEditOpen] = useState(false);
  const {
    profileQuery,
    schoolRankQuery,
    leaderboardQuery,
    sortedCourses,
    kpis,
    totalPoints,
    badgeCount,
    earnedBadges,
    notificationPrefs,
    continuingCourseId,
    continueError,
    updateError,
    isUpdating,
    isLoading,
    errorMessage,
    refreshAll,
    handleContinueLearning,
    handleUpdateProfile,
    handleNotificationPrefChange,
  } = useStudentProfile();

  if (isLoading && !profileQuery.data) {
    return <StudentProfileSkeleton />;
  }

  if (errorMessage && !profileQuery.data) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={errorMessage} fallbackMessage={t("errors.load")} />
        <Button type="button" variant="outline" onClick={() => void refreshAll()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const profile = profileQuery.data;
  if (!profile) return null;

  return (
    <div className="space-y-12 pb-10">
      <ProfileHero
        profile={profile}
        totalPoints={totalPoints}
        badgeCount={badgeCount}
      />

      <ProfileKpiRow kpis={kpis} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileRankingCard
            schoolRank={schoolRankQuery.data}
            platformRank={leaderboardQuery.data?.currentUser?.rank ?? null}
            schoolNameFallback={profile.schoolName}
          />
        </div>
        <div className="lg:col-span-2">
          <ProfileBadgesCarousel badges={earnedBadges} />
        </div>
      </div>

      {continueError ? (
        <ApiFailureAlert message={continueError} fallbackMessage={t("errors.continue")} />
      ) : null}

      <ProfileCoursesSection
        courses={sortedCourses}
        continuingCourseId={continuingCourseId}
        onContinue={handleContinueLearning}
      />

      <section className="space-y-8">
        <div className="flex items-center justify-end gap-3">
          <h2 className="text-2xl font-bold text-[#2b415e]">{t("prefsSectionTitle")}</h2>
          <span className="relative inline-block h-[21px] w-6 overflow-hidden">
            <Image
              src={STUDENT_PROFILE_ASSETS.prefs}
              alt=""
              fill
              unoptimized
              className="object-contain"
            />
          </span>
        </div>

        <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] sm:p-10">
          <div className="grid gap-12 lg:grid-cols-2">
            <ProfileBasicInfo profile={profile} onEdit={() => setEditOpen(true)} />
            <ProfileNotificationPrefs
              prefs={notificationPrefs}
              onChange={handleNotificationPrefChange}
            />
          </div>
        </div>
      </section>

      <ProfileEditDialog
        open={editOpen}
        profile={profile}
        isSaving={isUpdating}
        errorMessage={updateError}
        onClose={() => setEditOpen(false)}
        onSave={async (payload) => {
          await handleUpdateProfile(payload);
          setEditOpen(false);
        }}
      />
    </div>
  );
}
