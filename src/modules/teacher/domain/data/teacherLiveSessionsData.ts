import type { TeacherLiveSessionsData } from "@/modules/teacher/domain/types/teacher.types";

export const teacherLiveSessionsMockData: TeacherLiveSessionsData = {
  stats: [
    { id: "totalStreaming", labelKey: "liveSessions.stats.totalStreaming", value: "124" },
    { id: "liveAttendance", labelKey: "liveSessions.stats.liveAttendance", value: "12.5k" },
    { id: "sessionsRating", labelKey: "liveSessions.stats.sessionsRating", value: "4.9/5" },
  ],
  sessions: [
    {
      id: "session-calculus",
      titleKey: "liveSessions.rows.calculus",
      subjectKey: "liveSessions.rows.advancedMath",
      lecturerKey: "liveSessions.rows.lecturerAhmed",
      dateTimeLabelKey: "liveSessions.rows.today8pm",
      durationKey: "liveSessions.rows.sixtyMinutes",
      status: "live",
    },
    {
      id: "session-physics",
      titleKey: "liveSessions.rows.physics",
      subjectKey: "liveSessions.rows.physicsSubject",
      lecturerKey: "liveSessions.rows.lecturerSara",
      dateTimeLabelKey: "liveSessions.rows.tomorrow10am",
      durationKey: "liveSessions.rows.ninetyMinutes",
      status: "upcoming",
    },
    {
      id: "session-chemistry",
      titleKey: "liveSessions.rows.chemistry",
      subjectKey: "liveSessions.rows.chemistrySubject",
      lecturerKey: "liveSessions.rows.lecturerYousef",
      dateTimeLabelKey: "liveSessions.rows.yesterday4pm",
      durationKey: "liveSessions.rows.fortyFiveMinutes",
      status: "ended",
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 45,
    pageSize: 10,
  },
};
