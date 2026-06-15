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
  performanceChart: [
    { dayKey: "home.chart.days.sunday", interactionRate: 62, referenceAverage: 55 },
    { dayKey: "home.chart.days.monday", interactionRate: 71, referenceAverage: 58 },
    { dayKey: "home.chart.days.tuesday", interactionRate: 68, referenceAverage: 60 },
    { dayKey: "home.chart.days.wednesday", interactionRate: 82, referenceAverage: 62 },
    { dayKey: "home.chart.days.thursday", interactionRate: 76, referenceAverage: 64 },
  ],
  courses: [
    {
      id: "course-organic-chem",
      titleKey: "home.courses.physics",
      durationWeeks: 12,
      studentCount: 150,
      progressPercent: 72,
      imageUrl: "/images/placeholders/course-physics.jpg",
    },
    {
      id: "course-physics-waves",
      titleKey: "home.courses.biochem",
      durationWeeks: 8,
      studentCount: 94,
      progressPercent: 48,
      imageUrl: "/images/placeholders/course-biochem.jpg",
    },
  ],
  liveClasses: [
    {
      id: "session-ai-medicine",
      titleKey: "home.liveClasses.physicsNuclear",
      timeLabel: "02:00 PM",
      status: "active",
    },
    {
      id: "session-software-systems",
      titleKey: "home.liveClasses.chemistryReview",
      timeLabel: "04:30 PM",
      status: "upcoming",
    },
  ],
  alerts: [
    {
      id: "alert-intervention",
      tone: "danger",
      titleKey: "home.alerts.intervention.title",
      descriptionKey: "home.alerts.intervention.description",
    },
    {
      id: "alert-forum",
      tone: "warning",
      titleKey: "home.alerts.forum.title",
      descriptionKey: "home.alerts.forum.description",
    },
  ],
};
