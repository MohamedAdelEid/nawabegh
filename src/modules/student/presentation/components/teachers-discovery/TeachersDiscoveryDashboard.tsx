"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
  DashboardPagination,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  useTeachersDiscovery,
  type TeachersDiscoveryInitialData,
} from "@/modules/student/application/hooks/useTeachersDiscovery";
import { JoinAsTeacherCard } from "./JoinAsTeacherCard";
import { TeacherDiscoveryCard } from "./TeacherDiscoveryCard";
import { TeachersDiscoveryEmptyState } from "./TeachersDiscoveryEmptyState";
import { TeachersDiscoveryFilters } from "./TeachersDiscoveryFilters";

type TeachersDiscoveryDashboardProps = {
  initial?: TeachersDiscoveryInitialData;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function TeachersDiscoveryDashboard({ initial }: TeachersDiscoveryDashboardProps) {
  const t = useTranslations("student.dashboard.teachersDiscovery");

  const {
    subjectId,
    setSubjectId,
    sort,
    setSort,
    subjects,
    subjectsQuery,
    teachers,
    teachersQuery,
    totalPages,
    currentPage,
    setPageNumber,
  } = useTeachersDiscovery({ initial });

  const isInitialLoading = teachersQuery.isLoading && teachers.length === 0;
  const teachersError =
    teachersQuery.error instanceof Error ? teachersQuery.error.message : null;
  const paginationPages = Array.from({ length: Math.max(totalPages, 1) }, (_, index) => index + 1);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            { label: t("page.breadcrumbCurrent") },
          ]}
        />
        <DashboardPageHeader title={t("page.title")} description={t("page.description")} />
      </div>

      <TeachersDiscoveryFilters
        subjects={subjects}
        subjectId={subjectId}
        onSubjectChange={setSubjectId}
        sort={sort}
        onSortChange={setSort}
        subjectsLoading={subjectsQuery.isLoading && subjects.length === 0}
      />

      {teachersError && teachers.length === 0 ? (
        <>
          <ApiFailureAlert message={teachersError} fallbackMessage={t("errors.teachers")} />
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={() => void teachersQuery.refetch()}>
              {t("errors.retry")}
            </Button>
          </div>
        </>
      ) : null}

      {isInitialLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[360px] animate-pulse rounded-[20px] bg-white/80" />
          ))}
        </div>
      ) : null}

      {!isInitialLoading && !teachersError && teachers.length === 0 ? (
        <TeachersDiscoveryEmptyState />
      ) : null}

      {!isInitialLoading && teachers.length > 0 ? (
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
        >
          {teachers.map((teacher) => (
            <TeacherDiscoveryCard key={teacher.teacherId} teacher={teacher} />
          ))}
          <JoinAsTeacherCard />
        </motion.div>
      ) : null}

      {!isInitialLoading && teachers.length > 0 && totalPages > 1 ? (
        <div className="flex justify-center">
          <DashboardPagination
            pages={paginationPages}
            currentPage={currentPage}
            onPageChange={setPageNumber}
            previousLabel={t("pagination.previous")}
            nextLabel={t("pagination.next")}
          />
        </div>
      ) : null}
    </div>
  );
}
