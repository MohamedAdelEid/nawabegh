import type {
  TeacherCourseListRow,
  TeacherCoursesListData,
  TeacherCoursesListParams,
} from "@/modules/teacher/domain/types/teacher.types";

const ALL_ROWS: TeacherCourseListRow[] = [
  {
    id: "course-organic-chem",
    title: "أساسيات الكيمياء العضوية",
    subject: "الكيمياء",
    grade: "الثالث الثانوي",
    accessType: "paid",
    status: "approved",
    coverTone: "blue",
    coverLabel: "CHEM",
  },
  {
    id: "course-advanced-math",
    title: "الرياضيات المتقدمة للصف الثاني ثانوي",
    subject: "الرياضيات",
    grade: "الثاني ثانوي",
    accessType: "paid",
    status: "pending",
    coverTone: "gold",
    coverLabel: "MATH",
  },
  {
    id: "course-physics-waves",
    title: "فيزياء الموجات والضوء",
    subject: "الفيزياء",
    grade: "الأول ثانوي",
    accessType: "subscription",
    status: "approved",
    coverTone: "green",
    coverLabel: "PHY",
  },
  {
    id: "course-biology-cells",
    title: "علم الخلية والأنسجة",
    subject: "الأحياء",
    grade: "الثالث الثانوي",
    accessType: "free",
    status: "approved",
    coverTone: "green",
    coverLabel: "BIO",
  },
  {
    id: "course-arabic-grammar",
    title: "قواعد اللغة العربية المتقدمة",
    subject: "اللغة العربية",
    grade: "الثاني متوسط",
    accessType: "unspecified",
    status: "draft",
    coverTone: "slate",
    coverLabel: "ARB",
  },
  {
    id: "course-english-writing",
    title: "مهارات الكتابة الأكاديمية",
    subject: "اللغة الإنجليزية",
    grade: "الثالث ثانوي",
    accessType: "paid",
    status: "rejected",
    coverTone: "blue",
    coverLabel: "ENG",
  },
  {
    id: "course-history-islamic",
    title: "التاريخ الإسلامي",
    subject: "التاريخ",
    grade: "الأول ثانوي",
    accessType: "free",
    status: "approved",
    coverTone: "gold",
    coverLabel: "HIS",
  },
  {
    id: "course-cs-algorithms",
    title: "مقدمة في الخوارزميات",
    subject: "علوم الحاسب",
    grade: "الثالث ثانوي",
    accessType: "subscription",
    status: "pending",
    coverTone: "blue",
    coverLabel: "CS",
  },
  {
    id: "course-geography-climate",
    title: "المناخ والبيئة",
    subject: "الجغرافيا",
    grade: "الثاني ثانوي",
    accessType: "paid",
    status: "approved",
    coverTone: "green",
    coverLabel: "GEO",
  },
  {
    id: "course-art-design",
    title: "أساسيات التصميم الجرافيكي",
    subject: "الفنون",
    grade: "الأول ثانوي",
    accessType: "paid",
    status: "draft",
    coverTone: "slate",
    coverLabel: "ART",
  },
  {
    id: "course-economics-intro",
    title: "مبادئ الاقتصاد",
    subject: "الاقتصاد",
    grade: "الثالث ثانوي",
    accessType: "paid",
    status: "approved",
    coverTone: "gold",
    coverLabel: "ECO",
  },
  {
    id: "course-statistics-prob",
    title: "الإحصاء والاحتمالات",
    subject: "الرياضيات",
    grade: "الثالث ثانوي",
    accessType: "subscription",
    status: "pending",
    coverTone: "blue",
    coverLabel: "STAT",
  },
];

const GRADE_MAP: Record<string, string> = {
  "grade-1": "الأول ثانوي",
  "grade-2": "الثاني ثانوي",
  "grade-3": "الثالث الثانوي",
  "grade-4": "الثاني متوسط",
};

const SUBJECT_MAP: Record<string, string> = {
  "subject-chem": "الكيمياء",
  "subject-math": "الرياضيات",
  "subject-physics": "الفيزياء",
  "subject-bio": "الأحياء",
};

export const teacherCoursesListMockBase: Omit<TeacherCoursesListData, "rows" | "pagination"> = {
  stats: [
    {
      id: "totalTracks",
      labelKey: "courses.list.stats.totalTracks",
      value: "1,284",
      trend: "+12%",
      trendDirection: "up",
    },
    {
      id: "pendingApproval",
      labelKey: "courses.list.stats.pendingApproval",
      value: "24",
      trend: "courses.list.stats.important",
      trendDirection: "neutral",
    },
    {
      id: "activeLearners",
      labelKey: "courses.list.stats.activeLearners",
      value: "45,200",
      trend: "+5%",
      trendDirection: "up",
    },
    {
      id: "totalCourses",
      labelKey: "courses.list.stats.totalCourses",
      value: "205",
    },
  ],
  filterOptions: {
    grades: [
      { id: "all", labelKey: "courses.list.filters.allGrades" },
      { id: "grade-1", labelKey: "courses.list.filters.grade1" },
      { id: "grade-2", labelKey: "courses.list.filters.grade2" },
      { id: "grade-3", labelKey: "courses.list.filters.grade3" },
      { id: "grade-4", labelKey: "courses.list.filters.grade4" },
    ],
    subjects: [
      { id: "all", labelKey: "courses.list.filters.allSubjects" },
      { id: "subject-chem", labelKey: "courses.list.filters.chemistry" },
      { id: "subject-math", labelKey: "courses.list.filters.mathematics" },
      { id: "subject-physics", labelKey: "courses.list.filters.physics" },
      { id: "subject-bio", labelKey: "courses.list.filters.biology" },
    ],
    statuses: [
      { id: "all", labelKey: "courses.list.filters.allStatuses" },
      { id: "pending", labelKey: "courses.list.status.pending" },
      { id: "approved", labelKey: "courses.list.status.approved" },
      { id: "rejected", labelKey: "courses.list.status.rejected" },
      { id: "draft", labelKey: "courses.list.status.draft" },
    ],
  },
};

function filterRows(params: TeacherCoursesListParams): TeacherCourseListRow[] {
  const query = params.query?.trim().toLowerCase() ?? "";
  const gradeLabel = params.gradeId && params.gradeId !== "all" ? GRADE_MAP[params.gradeId] : null;
  const subjectLabel =
    params.subjectId && params.subjectId !== "all" ? SUBJECT_MAP[params.subjectId] : null;

  return ALL_ROWS.filter((row) => {
    if (query && !row.title.toLowerCase().includes(query) && !row.subject.toLowerCase().includes(query)) {
      return false;
    }
    if (gradeLabel && row.grade !== gradeLabel) return false;
    if (subjectLabel && row.subject !== subjectLabel) return false;
    if (params.status && params.status !== "all" && row.status !== params.status) return false;
    return true;
  });
}

export function getTeacherCoursesListMock(params: TeacherCoursesListParams = {}): TeacherCoursesListData {
  const pageSize = params.pageSize ?? 10;
  const page = params.page ?? 1;
  const filtered = filterRows(params);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    ...teacherCoursesListMockBase,
    rows: filtered.slice(start, start + pageSize),
    pagination: {
      currentPage: safePage,
      totalPages,
      totalItems,
      pageSize,
    },
  };
}

export function getTeacherCourseListRowById(courseId: string): TeacherCourseListRow | null {
  return ALL_ROWS.find((row) => row.id === courseId) ?? null;
}
