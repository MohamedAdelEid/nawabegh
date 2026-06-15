import type { TeacherScheduleData } from "@/modules/teacher/domain/types/teacher.types";

export const teacherScheduleMockData: TeacherScheduleData = {
  completedSessions: 12,
  plannedSessions: 15,
  performanceMessageKey: "schedule.performance.message",
  topics: [
    {
      id: "topic-clinical",
      titleKey: "schedule.topics.clinical",
      badgeKey: "schedule.topics.badges.tomorrow",
    },
    {
      id: "topic-ds",
      titleKey: "schedule.topics.dataStructures",
      badgeKey: "schedule.topics.badges.wednesday",
    },
  ],
  featuredSession: {
    id: "session-ai-medicine",
    titleKey: "schedule.featured.title",
    levelKey: "schedule.featured.level",
    status: "live",
    registeredCount: 124,
    durationMinutes: 90,
    resourceCount: 5,
    statusLabelKey: "schedule.featured.statusReady",
  },
  calendarDays: [
    {
      dateKey: "schedule.calendar.days.saturday",
      dayNumber: 12,
      sessions: [{ id: "cal-chem", titleKey: "schedule.calendar.sessions.chemistry", timeLabel: "10:00 AM" }],
    },
    {
      dateKey: "schedule.calendar.days.sunday",
      dayNumber: 13,
      isToday: true,
      sessions: [
        { id: "session-ai-medicine", titleKey: "schedule.calendar.sessions.ai", timeLabel: "09:00 AM" },
        { id: "cal-review", titleKey: "schedule.calendar.sessions.review", timeLabel: "02:30 PM" },
      ],
    },
    {
      dateKey: "schedule.calendar.days.monday",
      dayNumber: 14,
      sessions: [{ id: "cal-histo", titleKey: "schedule.calendar.sessions.histology", timeLabel: "11:00 AM" }],
    },
    {
      dateKey: "schedule.calendar.days.tuesday",
      dayNumber: 15,
      sessions: [],
    },
    {
      dateKey: "schedule.calendar.days.wednesday",
      dayNumber: 16,
      sessions: [{ id: "cal-bio", titleKey: "schedule.calendar.sessions.biology", timeLabel: "01:00 PM" }],
    },
    {
      dateKey: "schedule.calendar.days.thursday",
      dayNumber: 17,
      sessions: [{ id: "cal-math", titleKey: "schedule.calendar.sessions.math", timeLabel: "03:00 PM" }],
    },
    {
      dateKey: "schedule.calendar.days.friday",
      dayNumber: 18,
      sessions: [],
    },
  ],
  sessions: [
    {
      id: "session-software-systems",
      dateBadgeKey: "schedule.sessions.badges.mon14",
      titleKey: "schedule.sessions.softwareSystems",
      levelKey: "schedule.sessions.level3",
      instructorKey: "schedule.sessions.instructorYasser",
      timeRangeLabel: "09:00 AM - 10:30 AM",
      studentCount: 42,
      avatarCount: 3,
    },
    {
      id: "session-ai-medicine",
      dateBadgeKey: "schedule.sessions.badges.sun13",
      titleKey: "schedule.featured.title",
      levelKey: "schedule.featured.level",
      instructorKey: "schedule.sessions.instructorAhmed",
      timeRangeLabel: "09:00 AM - 10:30 AM",
      studentCount: 124,
      avatarCount: 4,
    },
  ],
};
