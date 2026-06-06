"use client";

import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import {
  ActivitiesCard,
  DetailStatCard,
  useUserManagementDetail,
  UserManagementDetailsFloatingActions,
  UserManagementDetailsRolePanel,
  UserManagementSubscriptionsSection,
  UserProfileCard,
  WeeklyPerformanceChart,
} from "@/modules/admin/presentation/components/user-management-details";
import {
  UserManagementAnimatedSection,
  UserManagementDetailsSkeleton,
} from "@/modules/admin/presentation/components/user-management";
import { normalizeUserManagementRole } from "../../infrastructure/api/userManagementApi";
import { useSearchParams } from "next/navigation";

export function AdminUserManagementDetailsPage({ userId }: { userId: string }) {
  const {
    layout,
    emptyLabel,
    remoteDetail,
    isLoading,
    profileView,
    teacherGrades,
    parentChildren,
    pageTitle,
    reloadDetail,
    t,
  } = useUserManagementDetail(userId);

  const searchParams = useSearchParams();
  const preferredRole = searchParams.get("role");
  const role = normalizeUserManagementRole(preferredRole || "");

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
            <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
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
                codeLabel={t("userManagement.details.profile.code")}
                codeValue={profileView.codeValue}
                profileTag={profileView.profileTag}
                editLabel={t("userManagement.details.profile.edit")}
                isActive={profileView.isActive}
              />
              {role === "student" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3 md:gap-10">
                    {layout.stats.map((stat) => (
                      <DetailStatCard
                        key={stat.id}
                        label={t(stat.labelKey)}
                        value={stat.value}
                        accentClassName={stat.accentClassName}
                        icon={stat.icon}
                        iconToneClassName={stat.iconToneClassName}
                      />
                    ))}
                  </div>
                  <WeeklyPerformanceChart
                    title={t("userManagement.details.chart.title")}
                    lessonsLabel={t("userManagement.details.chart.lessons")}
                    testsLabel={t("userManagement.details.chart.tests")}
                    rows={layout.weeklyPerformance.map((row) => ({
                      ...row,
                      label: t(row.labelKey),
                    }))}
                  />
                </div>
              ) : (
                <UserManagementDetailsRolePanel
                  remoteDetail={remoteDetail}
                  profileView={profileView}
                  teacherGrades={teacherGrades}
                  parentChildren={parentChildren}
                  emptyLabel={emptyLabel}
                  onParentChanged={reloadDetail}
                  labels={{
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
                  }}
                />
              )}
            </section>
          </UserManagementAnimatedSection>

          {role === "student" && (
            <UserManagementAnimatedSection delay={0.06}>
              <section className="grid gap-6 xl:grid-cols-2">
                <ActivitiesCard
                  title={t("userManagement.details.activities.title")}
                  rows={layout.activities.map((activity) => ({
                    id: activity.id,
                    title: t(activity.titleKey),
                    description: t(activity.descriptionKey),
                    time: t(activity.timestampKey),
                    icon: activity.icon,
                    toneClassName: activity.toneClassName,
                  }))}
                />

                <UserManagementDetailsRolePanel
                  remoteDetail={remoteDetail}
                  profileView={profileView}
                  teacherGrades={teacherGrades}
                  parentChildren={parentChildren}
                  emptyLabel={emptyLabel}
                  onParentChanged={reloadDetail}
                  labels={{
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
                  }}
                />
              </section>
            </UserManagementAnimatedSection>
          )}

          <UserManagementAnimatedSection delay={0.09}>
            <UserManagementSubscriptionsSection
              title={t("userManagement.details.subscriptions.title")}
              downloadLabel={t("userManagement.details.subscriptions.download")}
              columnLabels={{
                plan: t("userManagement.details.subscriptions.columns.plan"),
                startDate: t("userManagement.details.subscriptions.columns.startDate"),
                endDate: t("userManagement.details.subscriptions.columns.endDate"),
                status: t("userManagement.details.subscriptions.columns.status"),
                actions: t("userManagement.details.subscriptions.columns.actions"),
              }}
              subscriptions={layout.subscriptions}
              translate={t}
            />
          </UserManagementAnimatedSection>

          <UserManagementAnimatedSection delay={0.12}>
            <UserManagementDetailsFloatingActions
              contactLabel={t(profileView.contactKey)}
              floatingActions={layout.floatingActions}
              translate={t}
            />
          </UserManagementAnimatedSection>
        </>
      ) : null}
    </div>
  );
}
