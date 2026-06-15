import type { TeacherCourseDetail } from "@/modules/teacher/domain/types/teacher.types";

const DETAILS: Record<string, TeacherCourseDetail> = {
  "course-organic-chem": {
    id: "course-organic-chem",
    titleKey: "courses.details.samples.organicChemistry.title",
    subjectKey: "courses.details.samples.organicChemistry.subject",
    termKey: "courses.details.samples.organicChemistry.term",
    gradeKey: "courses.details.samples.organicChemistry.grade",
    status: "approved",
    instructorNameKey: "courses.details.samples.organicChemistry.instructor",
    subjectLabelKey: "courses.details.labels.subject",
    gradeLabelKey: "courses.details.labels.grade",
    lessonCount: 24,
    priceLabel: "150 SAR",
    registeredStudents: 150,
    totalRevenueLabel: "29.8K",
    completionRate: 84,
    curriculum: [
      {
        id: "unit-1",
        titleKey: "courses.details.curriculum.unit1.title",
        items: [
          {
            id: "lesson-1",
            titleKey: "courses.details.curriculum.unit1.lesson1.title",
            type: "video",
            metaKey: "courses.details.curriculum.unit1.lesson1.meta",
            subMetaKey: "courses.details.curriculum.unit1.lesson1.subMeta",
          },
          {
            id: "quiz-1",
            titleKey: "courses.details.curriculum.unit1.quiz1.title",
            type: "quiz",
            metaKey: "courses.details.curriculum.unit1.quiz1.meta",
            subMetaKey: "courses.details.curriculum.unit1.quiz1.subMeta",
          },
        ],
      },
      {
        id: "unit-2",
        titleKey: "courses.details.curriculum.unit2.title",
        items: [
          {
            id: "pdf-1",
            titleKey: "courses.details.curriculum.unit2.pdf1.title",
            type: "pdf",
            metaKey: "courses.details.curriculum.unit2.pdf1.meta",
            subMetaKey: "courses.details.curriculum.unit2.pdf1.subMeta",
          },
          {
            id: "lesson-locked",
            titleKey: "courses.details.curriculum.unit2.locked.title",
            type: "locked",
            metaKey: "courses.details.curriculum.unit2.locked.meta",
            locked: true,
          },
        ],
      },
    ],
  },
};

function buildFallbackDetail(courseId: string): TeacherCourseDetail {
  return {
    id: courseId,
    titleKey: "courses.details.samples.generic.title",
    subjectKey: "courses.details.samples.generic.subject",
    termKey: "courses.details.samples.generic.term",
    gradeKey: "courses.details.samples.generic.grade",
    status: "pending",
    instructorNameKey: "courses.details.samples.generic.instructor",
    subjectLabelKey: "courses.details.labels.subject",
    gradeLabelKey: "courses.details.labels.grade",
    lessonCount: 12,
    priceLabel: "99 SAR",
    registeredStudents: 45,
    totalRevenueLabel: "4.5K",
    completionRate: 62,
    curriculum: [
      {
        id: "unit-generic",
        titleKey: "courses.details.curriculum.generic.unit.title",
        items: [
          {
            id: "lesson-generic",
            titleKey: "courses.details.curriculum.generic.lesson.title",
            type: "video",
            metaKey: "courses.details.curriculum.generic.lesson.meta",
          },
        ],
      },
    ],
  };
}

export function getTeacherCourseDetailsMock(courseId: string): TeacherCourseDetail {
  return DETAILS[courseId] ?? buildFallbackDetail(courseId);
}
