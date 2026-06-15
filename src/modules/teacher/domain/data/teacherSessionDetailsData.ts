import type { TeacherSessionDetails } from "@/modules/teacher/domain/types/teacher.types";

const sessionDetailsMap: Record<string, TeacherSessionDetails> = {
  "session-ai-medicine": {
    id: "session-ai-medicine",
    titleKey: "sessionDetails.sessions.aiMedicine.title",
    status: "live",
    instructorKey: "sessionDetails.sessions.aiMedicine.instructor",
    dateLabel: "Sunday, Jun 13",
    timeRangeLabel: "10:00 AM - 11:30 AM",
    attendancePercent: 78,
    overviewKey: "sessionDetails.sessions.aiMedicine.overview",
    goals: [
      "sessionDetails.sessions.aiMedicine.goals.goal1",
      "sessionDetails.sessions.aiMedicine.goals.goal2",
    ],
    tasks: [
      { id: "task-1", labelKey: "sessionDetails.sessions.aiMedicine.tasks.readChapter", completed: true },
      { id: "task-2", labelKey: "sessionDetails.sessions.aiMedicine.tasks.prepareCalculator", completed: false },
    ],
    resources: [
      { id: "res-1", titleKey: "sessionDetails.sessions.aiMedicine.resources.slides", fileType: "pptx", sizeLabel: "4.2 MB" },
      { id: "res-2", titleKey: "sessionDetails.sessions.aiMedicine.resources.handout", fileType: "pdf", sizeLabel: "1.1 MB" },
    ],
    relatedLessons: [
      { id: "related-1", titleKey: "sessionDetails.sessions.aiMedicine.related.intro", status: "watched", imageUrl: "/images/placeholders/lesson-1.jpg" },
      { id: "related-2", titleKey: "sessionDetails.sessions.aiMedicine.related.advanced", status: "comingSoon", imageUrl: "/images/placeholders/lesson-2.jpg" },
    ],
  },
  "session-software-systems": {
    id: "session-software-systems",
    titleKey: "schedule.sessions.softwareSystems",
    status: "upcoming",
    instructorKey: "schedule.sessions.instructorYasser",
    dateLabel: "Monday, Jun 14",
    timeRangeLabel: "09:00 AM - 10:30 AM",
    attendancePercent: 0,
    overviewKey: "sessionDetails.sessions.softwareSystems.overview",
    goals: [
      "sessionDetails.sessions.softwareSystems.goals.goal1",
      "sessionDetails.sessions.softwareSystems.goals.goal2",
    ],
    tasks: [
      { id: "task-1", labelKey: "sessionDetails.sessions.softwareSystems.tasks.reviewNotes", completed: false },
    ],
    resources: [
      { id: "res-1", titleKey: "sessionDetails.sessions.softwareSystems.resources.syllabus", fileType: "pdf", sizeLabel: "800 KB" },
    ],
    relatedLessons: [],
  },
  "session-calculus": {
    id: "session-calculus",
    titleKey: "liveSessions.rows.calculus",
    status: "live",
    instructorKey: "liveSessions.rows.lecturerAhmed",
    dateLabel: "Today",
    timeRangeLabel: "08:00 PM - 09:00 PM",
    attendancePercent: 92,
    overviewKey: "sessionDetails.sessions.calculus.overview",
    goals: ["sessionDetails.sessions.calculus.goals.goal1"],
    tasks: [],
    resources: [],
    relatedLessons: [],
  },
};

export function getTeacherSessionDetailsMock(sessionId: string): TeacherSessionDetails | null {
  return sessionDetailsMap[sessionId] ?? sessionDetailsMap["session-ai-medicine"] ?? null;
}
