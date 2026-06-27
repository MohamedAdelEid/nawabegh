"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  useCourseDetails,
  type CourseDetailsInitialData,
} from "@/modules/student/application/hooks/useCourseDetails";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CourseDetailsCurriculum } from "./CourseDetailsCurriculum";
import { CourseDetailsFaq } from "./CourseDetailsFaq";
import { CourseDetailsHero } from "./CourseDetailsHero";
import { CourseDetailsLearningOutcomes } from "./CourseDetailsLearningOutcomes";
import { CourseDetailsPageSkeleton } from "./CourseDetailsSkeleton";
import { CourseDetailsSidebar } from "./CourseDetailsSidebar";
import { CourseDetailsTeacherSection } from "./CourseDetailsTeacherSection";

type CourseDetailsDashboardProps = {
  courseId: string;
  initial?: CourseDetailsInitialData;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function CourseDetailsDashboard({ courseId, initial }: CourseDetailsDashboardProps) {
  const t = useTranslations("student.dashboard.courseDetails");
  const courseQuery = useCourseDetails({ courseId, initial });

  if (courseQuery.isLoading && !courseQuery.data) {
    return <CourseDetailsPageSkeleton />;
  }

  const course = courseQuery.data;
  const errorMessage =
    courseQuery.error instanceof Error ? courseQuery.error.message : null;

  if (!course && errorMessage) {
    return (
      <div className="space-y-6">
        <ApiFailureAlert
          message={errorMessage}
          fallbackMessage={t("errors.load")}
        />
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={() => void courseQuery.refetch()}>
            {t("errors.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <p className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center text-[#64748b]">
        {t("errors.notFound")}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            { label: t("page.breadcrumbCourses"), href: ROUTES.USER.STUDENT.COURSES },
            { label: course.title },
          ]}
        />
        <DashboardPageHeader title={course.title} description={t("page.description")} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <motion.main
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          <CourseDetailsHero course={course} />
          <CourseDetailsLearningOutcomes course={course} />
          <CourseDetailsTeacherSection course={course} />
          <CourseDetailsCurriculum course={course} />
          <CourseDetailsFaq course={course} />
        </motion.main>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <CourseDetailsSidebar course={course} />
        </div>
      </div>
    </div>
  );
}
