"use client";

import { Award, Star, Trophy } from "lucide-react";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import {
  DetailStatCard,
  StudentEarnedBadgesCard,
  useUserManagementDetail,
  UserDetailsInfoSection,
  UserManagementDetailsRolePanel,
  UserProfileCard,
} from "@/modules/admin/presentation/components/user-management-details";
import {
  UserManagementAnimatedSection,
  UserManagementDetailsSkeleton,
} from "@/modules/admin/presentation/components/user-management";

export function AdminUserManagementDetailsPage({ userId }: { userId: string }) {
  const {
    emptyLabel,
    remoteDetail,
    isLoading,
    profileView,
    infoSections,
    teacherGrades,
    parentChildren,
    pageTitle,
    reloadDetail,
    t,
  } = useUserManagementDetail(userId);

  const rolePanelLabels = {
    teacherSectionTitle: t("userManagement.addUser.teacher.academicSection.title"),
    teacherRoleLabel: t("userManagement.roles.teacher"),
    subjectsTitle: t("userManagement.addUser.teacher.academicSection.subjects"),
    gradesTitle: t("userManagement.addUser.teacher.academicSection.gradeLevels"),
    parentSectionTitle: t("userManagement.addUser.parent.studentsSection.title"),
    parentRoleLabel: t("userManagement.roles.parent"),
    linkedParentTitle: t("userManagement.details.parent.badge"),
    linkedParentType: t("userManagement.details.parent.type"),
    changeParent: t("userManagement.details.parent.change"),
    unlinkParent: t("userManagement.details.parent.unlink"),
    linkedParentNote: t("userManagement.details.parent.note"),
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={pageTitle}
        breadcrumbs={[
          { label: t("tabs.home.title") },
          { label: t("userManagement.page.title") },
          { label: pageTitle },
        ]}
        description={t("userManagement.details.page.description")}
      />

      {isLoading ? <UserManagementDetailsSkeleton /> : null}

      {!isLoading && !profileView ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[0_8px_0px_0px_#0000000D]">
          {t("userManagement.details.loadError")}
        </div>
      ) : null}

      {!isLoading && remoteDetail && profileView ? (
        <>
          <UserManagementAnimatedSection delay={0.02}>
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
              <div className="min-w-0 space-y-6">
                {remoteDetail.kind === "student" ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <DetailStatCard
                      label={t("userManagement.details.stats.points")}
                      value={String(remoteDetail.data.points ?? 0)}
                      accentClassName="before:bg-[#D6B66A]"
                      icon={Star}
                      iconToneClassName="bg-[#FAF1DA] text-[#B08A1C]"
                    />
                    <DetailStatCard
                      label={t("userManagement.details.stats.maxPoints")}
                      value={String(remoteDetail.data.maxPointsEverReached ?? 0)}
                      accentClassName="before:bg-[#67C23A]"
                      icon={Trophy}
                      iconToneClassName="bg-emerald-100 text-emerald-600"
                    />
                    <DetailStatCard
                      label={t("userManagement.details.stats.badges")}
                      value={String(remoteDetail.data.achievementBadgeCount ?? 0)}
                      accentClassName="before:bg-[#243B5A]"
                      icon={Award}
                      iconToneClassName="bg-[#E8EEF8] text-[#243B5A]"
                    />
                  </div>
                ) : null}

                <UserDetailsInfoSection sections={infoSections} />
              </div>
              <div className="xl:sticky xl:top-6">
                <UserProfileCard
                  userId={userId}
                  role={remoteDetail.kind}
                  fullName={profileView.fullName}
                  subtitle={profileView.subtitle}
                  profileImageUrl={profileView.profileImageUrl}
                  schoolLabelTitle={profileView.schoolLabelTitle}
                  statusLabelTitle={t("userManagement.details.profile.status")}
                  subscriptionLabelTitle={t("userManagement.details.profile.subscription")}
                  schoolLabel={profileView.schoolLabel}
                  statusLabel={profileView.statusLabel}
                  subscriptionLabel={profileView.subscriptionLabel}
                  codeLabel={
                    remoteDetail.kind === "student"
                      ? t("userManagement.details.profile.code")
                      : t("userManagement.details.info.email")
                  }
                  codeValue={profileView.codeValue}
                  profileTag={profileView.profileTag}
                  editLabel={t("userManagement.details.profile.edit")}
                  isActive={profileView.isActive}
                />
              </div>
            </section>
          </UserManagementAnimatedSection>

          <UserManagementAnimatedSection delay={0.06}>
            {remoteDetail.kind === "student" ? (
              <section className="grid gap-6 xl:grid-cols-2">
                <StudentEarnedBadgesCard
                  title={t("userManagement.details.badges.title")}
                  emptyLabel={t("userManagement.details.badges.empty")}
                  earnedAtLabel={t("userManagement.details.badges.earnedAt")}
                  requiredPointsLabel={t("userManagement.details.badges.requiredPoints")}
                  badges={remoteDetail.data.earnedAchievementBadges}
                />
                <UserManagementDetailsRolePanel
                  remoteDetail={remoteDetail}
                  profileView={profileView}
                  teacherGrades={teacherGrades}
                  parentChildren={parentChildren}
                  emptyLabel={emptyLabel}
                  onParentChanged={reloadDetail}
                  labels={rolePanelLabels}
                />
              </section>
            ) : (
              <UserManagementDetailsRolePanel
                remoteDetail={remoteDetail}
                profileView={profileView}
                teacherGrades={teacherGrades}
                parentChildren={parentChildren}
                emptyLabel={emptyLabel}
                onParentChanged={reloadDetail}
                labels={rolePanelLabels}
              />
            )}
          </UserManagementAnimatedSection>
        </>
      ) : null}
    </div>
  );
}
