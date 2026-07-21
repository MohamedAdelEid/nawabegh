"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DashboardBreadcrumb } from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  useTeacherPublicProfile,
  type TeacherPublicProfileInitialData,
} from "@/modules/student/application/hooks/useTeacherPublicProfile";
import { TeacherPublicProfileAbout } from "./TeacherPublicProfileAbout";
import { TeacherPublicProfileCourses } from "./TeacherPublicProfileCourses";
import { TeacherPublicProfileHeader } from "./TeacherPublicProfileHeader";
import { TeacherPublicProfilePageSkeleton } from "./TeacherPublicProfileSkeleton";
import { TeacherPublicProfileSkills } from "./TeacherPublicProfileSkills";

type TeacherPublicProfileDashboardProps = {
  teacherId: string;
  initial?: TeacherPublicProfileInitialData;
};

export function TeacherPublicProfileDashboard({
  teacherId,
  initial,
}: TeacherPublicProfileDashboardProps) {
  const t = useTranslations("student.dashboard.teacherPublicProfile");

  const {
    profileQuery,
    coursesQuery,
    profile,
    heroCourse,
    regularCourses,
    certificateGroups,
    coursesCount,
    totalPages,
    currentPage,
    setPageNumber,
  } = useTeacherPublicProfile({ teacherId, initial });

  const profileError =
    profileQuery.error instanceof Error ? profileQuery.error.message : null;
  const coursesError =
    coursesQuery.error instanceof Error ? coursesQuery.error.message : null;

  if (profileQuery.isLoading && !profile) {
    return <TeacherPublicProfilePageSkeleton />;
  }

  if (profileError || !profile) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert
          message={profileError}
          fallbackMessage={t("errors.notFound")}
        />
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={ROUTES.USER.STUDENT.TEACHERS}>{t("errors.backToTeachers")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <DashboardBreadcrumb
        items={[
          { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
          { label: t("page.breadcrumbTeachers"), href: ROUTES.USER.STUDENT.TEACHERS },
          { label: profile.fullName },
        ]}
      />

      <TeacherPublicProfileHeader profile={profile} coursesCount={coursesCount} />

      <div className="grid gap-8 lg:grid-cols-2">
        <TeacherPublicProfileAbout
          about={profile.about}
          certificateGroups={certificateGroups}
        />
        <TeacherPublicProfileSkills subjectsTaught={profile.subjectsTaught} />
      </div>

      {coursesError ? (
        <ApiFailureAlert message={coursesError} fallbackMessage={t("errors.courses")} />
      ) : null}

      <TeacherPublicProfileCourses
        heroCourse={heroCourse}
        regularCourses={regularCourses}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setPageNumber}
        isLoading={coursesQuery.isLoading && regularCourses.length === 0 && !heroCourse}
      />
    </div>
  );
}
