import {
  courseManagementData,
  type CourseCreateDraft,
  type CourseManagementData,
  type CourseManagementRow,
  type CourseReviewDetail,
  type CourseReviewReasonId,
  type CourseStatusId,
} from "@/modules/admin/domain/data/courseManagementData";

export type CourseManagementApiResult<T> = {
  status: "Success" | "Error";
  message?: string;
  errorMessage?: string;
  data: T | null;
};

type CourseRejectPayload = {
  reasons: CourseReviewReasonId[];
  notes: string;
};

type CourseCreatePayload = CourseCreateDraft;

const delay = () => new Promise((resolve) => setTimeout(resolve, 120));

function cloneDetail(detail: CourseReviewDetail): CourseReviewDetail {
  return {
    ...detail,
    curriculum: detail.curriculum.map((unit) => ({
      ...unit,
      items: unit.items.map((item) => ({ ...item })),
    })),
  };
}

function cloneData(): CourseManagementData {
  return {
    ...courseManagementData,
    stats: courseManagementData.stats.map((stat) => ({ ...stat })),
    rows: courseManagementData.rows.map((row) => ({ ...row })),
    details: courseManagementData.details.map(cloneDetail),
    createDraft: { ...courseManagementData.createDraft },
    rejectReasons: [...courseManagementData.rejectReasons],
    pagination: { ...courseManagementData.pagination },
  };
}

export async function getCourseManagementDashboard(): Promise<
  CourseManagementApiResult<CourseManagementData>
> {
  await delay();
  return {
    status: "Success",
    data: cloneData(),
  };
}

export async function getCourseReviewDetail(
  courseId: string,
): Promise<CourseManagementApiResult<CourseReviewDetail>> {
  await delay();
  const detail = courseManagementData.details.find((item) => item.id === courseId);
  if (!detail) {
    return {
      status: "Error",
      errorMessage: "Course was not found",
      data: null,
    };
  }
  return {
    status: "Success",
    data: cloneDetail(detail),
  };
}

export async function submitCourseReviewDecision(
  courseId: string,
  status: Extract<CourseStatusId, "approved" | "rejected">,
  payload?: CourseRejectPayload,
): Promise<CourseManagementApiResult<CourseManagementRow>> {
  await delay();
  const row = courseManagementData.rows.find((item) => item.id === courseId);
  if (!row) {
    return {
      status: "Error",
      errorMessage: "Course was not found",
      data: null,
    };
  }
  return {
    status: "Success",
    message: status === "approved" ? "Course approved" : "Course rejected",
    data: {
      ...row,
      statusId: status,
      ...(payload?.reasons.length ? {} : {}),
    },
  };
}

export async function createCourseDraft(
  payload: CourseCreatePayload,
): Promise<CourseManagementApiResult<CourseManagementRow>> {
  await delay();
  return {
    status: "Success",
    message: "Course created",
    data: {
      id: "course-new-draft",
      title: payload.title,
      subject: payload.subject,
      grade: payload.grade,
      teacherName: payload.teacher,
      accessType: payload.pricingType === "free" ? "free" : "paid",
      statusId: "draft",
      coverTone: "blue",
      coverLabel: "NEW",
      revenue: "0 ر.ع.",
      lessonCount: Number(payload.lessonCount) || 0,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    },
  };
}
