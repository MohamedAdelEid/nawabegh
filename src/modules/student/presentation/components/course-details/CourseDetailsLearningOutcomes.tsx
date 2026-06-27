"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import {
  getLearningOutcomeColorClass,
  getLearningOutcomeIcon,
} from "@/shared/domain/utils/learning-outcome-icon.mapper";
import { DashboardSectionHeader } from "@/shared/presentation/components/dashboard";

type CourseDetailsLearningOutcomesProps = {
  course: CourseDetailsModel;
};

export function CourseDetailsLearningOutcomes({ course }: CourseDetailsLearningOutcomesProps) {
  const t = useTranslations("student.dashboard.courseDetails");

  if (course.learningOutcomes.length === 0) return null;

  const title = course.isEnrolled
    ? t("sections.learningOutcomesEnrolled")
    : t("sections.learningOutcomes");

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <DashboardSectionHeader title={title} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {course.learningOutcomes.map((outcome, index) => {
          const Icon = getLearningOutcomeIcon(outcome.iconKey);
          const colorClass = getLearningOutcomeColorClass(index);

          return (
            <motion.article
              key={outcome.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              whileHover={{ y: -4 }}
              className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]"
            >
              <div
                className={`mb-4 inline-flex size-11 items-center justify-center rounded-full ${colorClass}`}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mb-2 text-base font-bold text-[#2b415e]">{outcome.title}</h3>
              {outcome.description ? (
                <p className="text-sm leading-6 text-[#64748b]">{outcome.description}</p>
              ) : null}
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
