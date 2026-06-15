import type { TeacherLiveAnalyticsData } from "@/modules/teacher/domain/types/teacher.types";

export const teacherLiveAnalyticsMockData: TeacherLiveAnalyticsData = {
  stats: [
    {
      id: "totalAttendance",
      labelKey: "liveAnalytics.stats.totalAttendance",
      value: "1,284",
      trend: "+12%",
      trendDirection: "up",
    },
    {
      id: "avgWatchTime",
      labelKey: "liveAnalytics.stats.avgWatchTime",
      value: "42",
      trend: "+5%",
      trendDirection: "up",
    },
    {
      id: "peakViews",
      labelKey: "liveAnalytics.stats.peakViews",
      value: "856",
      trend: "-2%",
      trendDirection: "down",
    },
    {
      id: "interactionRate",
      labelKey: "liveAnalytics.stats.interactionRate",
      value: "92%",
      trend: "+18%",
      trendDirection: "up",
    },
  ],
  upcomingSessions: [
    {
      id: "session-quantum-3",
      titleKey: "liveAnalytics.upcoming.quantum",
      dateLabelKey: "liveAnalytics.upcoming.today",
      timeLabel: "02:00 PM",
      studentCount: 45,
    },
    {
      id: "session-organic-chem",
      titleKey: "liveAnalytics.upcoming.organicChem",
      dateLabelKey: "liveAnalytics.upcoming.tomorrow",
      timeLabel: "10:00 AM",
      studentCount: 120,
    },
  ],
  instructorMetrics: [
    { id: "attendance", labelKey: "liveAnalytics.metrics.attendance", percent: 94, tone: "success" },
    { id: "absence", labelKey: "liveAnalytics.metrics.absence", percent: 88, tone: "warning" },
    { id: "newStudents", labelKey: "liveAnalytics.metrics.newStudents", percent: 98, tone: "primary" },
  ],
  tipKey: "liveAnalytics.tip.body",
  attendanceChart: [
    { dayKey: "liveAnalytics.chart.days.saturday", attendance: 420 },
    { dayKey: "liveAnalytics.chart.days.sunday", attendance: 510 },
    { dayKey: "liveAnalytics.chart.days.monday", attendance: 480 },
    { dayKey: "liveAnalytics.chart.days.tuesday", attendance: 620, isHighlighted: true },
    { dayKey: "liveAnalytics.chart.days.wednesday", attendance: 540 },
    { dayKey: "liveAnalytics.chart.days.thursday", attendance: 590 },
  ],
  absentSessionTitleKey: "liveAnalytics.absent.sessionTitle",
  absentSessionTimeKey: "liveAnalytics.absent.sessionTime",
  totalAbsentCount: 12,
  absentStudents: [
    {
      id: "student-ahmed",
      nameKey: "liveAnalytics.absent.students.ahmed",
      lastSeenKey: "liveAnalytics.absent.lastSeen.yesterday",
      avatarInitials: "AA",
    },
    {
      id: "student-sara",
      nameKey: "liveAnalytics.absent.students.sara",
      lastSeenKey: "liveAnalytics.absent.lastSeen.twoDays",
      avatarInitials: "SK",
    },
    {
      id: "student-yousef",
      nameKey: "liveAnalytics.absent.students.yousef",
      lastSeenKey: "liveAnalytics.absent.lastSeen.threeDays",
      avatarInitials: "YM",
    },
  ],
};
