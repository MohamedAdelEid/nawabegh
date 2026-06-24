import type { TeacherDashboardData } from "@/modules/teacher/domain/types/teacher.types";

export const teacherDashboardMockData: TeacherDashboardData = {
  level: {
    level: 4,
    qualityLabelKey: "home.level.quality",
    currentXp: 85,
    maxXp: 100,
  },
  stats: [
    {
      id: "todaySessions",
      labelKey: "home.stats.todaySessions",
      value: "03",
    },
    {
      id: "totalStudents",
      labelKey: "home.stats.totalStudents",
      value: "1,240",
      trend: "+124",
      trendDirection: "up",
    },
    {
      id: "activeCourses",
      labelKey: "home.stats.activeCourses",
      value: "08",
      trend: "+2",
      trendDirection: "up",
    },
  ],
  performanceChart: {
    currentWeek: [
      { dayLabel: "Sunday", interactionRate: 62, referenceAverage: 55 },
      { dayLabel: "Monday", interactionRate: 71, referenceAverage: 58 },
      { dayLabel: "Tuesday", interactionRate: 68, referenceAverage: 60 },
      { dayLabel: "Wednesday", interactionRate: 82, referenceAverage: 62 },
      { dayLabel: "Thursday", interactionRate: 76, referenceAverage: 64 },
    ],
    previousWeek: [
      { dayLabel: "Sunday", interactionRate: 54 },
      { dayLabel: "Monday", interactionRate: 57 },
      { dayLabel: "Tuesday", interactionRate: 59 },
      { dayLabel: "Wednesday", interactionRate: 61 },
      { dayLabel: "Thursday", interactionRate: 63 },
    ],
  },
  courses: [
    {
      id: "course-organic-chem",
      title: "Physics: Advanced Quantum Mechanics",
      durationWeeks: 12,
      studentCount: 150,
      progressPercent: 72,
      imageUrl: null,
    },
    {
      id: "course-physics-waves",
      title: "Principles of Biochemistry",
      durationWeeks: 8,
      studentCount: 94,
      progressPercent: 48,
      imageUrl: null,
    },
  ],
  liveClasses: [
    {
      id: "session-ai-medicine",
      title: "Physics: Nuclear Energy",
      timeLabel: "02:00 PM",
      status: "active",
    },
    {
      id: "session-software-systems",
      title: "Chemistry: Element Review",
      timeLabel: "04:30 PM",
      status: "upcoming",
    },
  ],
  alerts: [
    {
      id: "alert-intervention",
      tone: "danger",
      title: "Students needing intervention",
      description: "Interaction dropped 30% in Chemistry",
    },
    {
      id: "alert-forum",
      tone: "warning",
      title: "Academic inquiries",
      description: "12 new questions in the forum",
    },
  ],
};
