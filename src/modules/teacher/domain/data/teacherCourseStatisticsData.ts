import type { TeacherCourseStatisticsData } from "@/modules/teacher/domain/types/teacher.types";

const STATISTICS: Record<string, TeacherCourseStatisticsData> = {
  "course-organic-chem": {
    courseId: "course-organic-chem",
    titleKey: "courses.details.samples.organicChemistry.title",
    subtitleMeta: {
      students: 1248,
      learningPaths: 12,
      avgPerformance: "84%",
    },
    stats: [
      {
        id: "completionRate",
        labelKey: "courses.statistics.stats.completionRate",
        value: "76.4%",
        trend: "+4.2%",
        trendDirection: "up",
      },
      {
        id: "avgGrades",
        labelKey: "courses.statistics.stats.avgGrades",
        value: "82/100",
        trend: "+2.1%",
        trendDirection: "up",
      },
      {
        id: "sessionAttendance",
        labelKey: "courses.statistics.stats.sessionAttendance",
        value: "91%",
        trend: "-1.5%",
        trendDirection: "down",
      },
      {
        id: "studyTime",
        labelKey: "courses.statistics.stats.studyTime",
        value: "4.5",
        trend: "courses.statistics.stats.hoursSuffix",
        trendDirection: "neutral",
      },
      {
        id: "activeStudents",
        labelKey: "courses.statistics.stats.activeStudents",
        value: "1,102",
        trend: "+6%",
        trendDirection: "up",
      },
    ],
    weeklyPerformance: [
      { weekKey: "courses.statistics.weeks.week1", lessonCompletion: 68, testResults: 72 },
      { weekKey: "courses.statistics.weeks.week2", lessonCompletion: 74, testResults: 78 },
      { weekKey: "courses.statistics.weeks.week3", lessonCompletion: 81, testResults: 85 },
      { weekKey: "courses.statistics.weeks.week4", lessonCompletion: 88, testResults: 90 },
    ],
    highlightCards: [
      {
        id: "stuck",
        tone: "warning",
        titleKey: "courses.statistics.highlights.stuck.title",
        descriptionKey: "courses.statistics.highlights.stuck.description",
        actionKey: "courses.statistics.highlights.stuck.action",
      },
      {
        id: "hardest",
        tone: "danger",
        titleKey: "courses.statistics.highlights.hardest.title",
        descriptionKey: "courses.statistics.highlights.hardest.description",
        actionKey: "courses.statistics.highlights.hardest.action",
      },
    ],
    topStudents: [
      {
        id: "top-1",
        nameKey: "courses.statistics.topStudents.student1",
        avatarInitials: "أم",
        interactionPoints: 2840,
        level: 42,
      },
      {
        id: "top-2",
        nameKey: "courses.statistics.topStudents.student2",
        avatarInitials: "سخ",
        interactionPoints: 2650,
        level: 38,
      },
      {
        id: "top-3",
        nameKey: "courses.statistics.topStudents.student3",
        avatarInitials: "خع",
        interactionPoints: 2410,
        level: 35,
      },
    ],
    upcomingSessions: [
      {
        id: "session-1",
        dateLabel: "24 OCT",
        titleKey: "courses.statistics.upcoming.session1",
        timeLabel: "10:00 AM",
        registeredCount: 186,
      },
      {
        id: "session-2",
        dateLabel: "26 OCT",
        titleKey: "courses.statistics.upcoming.session2",
        timeLabel: "2:00 PM",
        registeredCount: 142,
      },
    ],
    interactionTipKey: "courses.statistics.interactionTip",
    weeklyInteraction: [
      { dayKey: "courses.statistics.days.saturday", interaction: 78, reference: 100 },
      { dayKey: "courses.statistics.days.sunday", interaction: 65, reference: 100 },
      { dayKey: "courses.statistics.days.monday", interaction: 88, reference: 100 },
      { dayKey: "courses.statistics.days.tuesday", interaction: 72, reference: 100 },
      { dayKey: "courses.statistics.days.wednesday", interaction: 91, reference: 100 },
      { dayKey: "courses.statistics.days.thursday", interaction: 84, reference: 100 },
      { dayKey: "courses.statistics.days.friday", interaction: 56, reference: 100 },
    ],
    stationPerformance: [
      { id: "live", labelKey: "courses.statistics.stations.live", percent: 88, tone: "primary" },
      { id: "tests", labelKey: "courses.statistics.stations.tests", percent: 65, tone: "warning" },
      { id: "flashcards", labelKey: "courses.statistics.stations.flashcards", percent: 92, tone: "success" },
      { id: "resources", labelKey: "courses.statistics.stations.resources", percent: 45, tone: "neutral" },
    ],
    insightKey: "courses.statistics.insight",
    journeyStations: [
      { id: "s1", labelKey: "courses.statistics.journey.station1", completedCount: 380, status: "completed" },
      { id: "s2", labelKey: "courses.statistics.journey.station2", completedCount: 345, status: "completed" },
      { id: "s3", labelKey: "courses.statistics.journey.station3", completedCount: 290, status: "current" },
      { id: "s4", labelKey: "courses.statistics.journey.station4", completedCount: 0, status: "locked" },
      { id: "final", labelKey: "courses.statistics.journey.finalExam", completedCount: 0, status: "locked" },
    ],
    studentProgress: [
      {
        id: "student-1",
        nameKey: "courses.statistics.students.ahmed",
        avatarInitials: "أع",
        completionPercent: 95,
        lastActivityKey: "courses.statistics.students.fiveMinutesAgo",
        status: "onTrack",
      },
      {
        id: "student-2",
        nameKey: "courses.statistics.students.sara",
        avatarInitials: "سق",
        completionPercent: 42,
        status: "needsHelp",
      },
      {
        id: "student-3",
        nameKey: "courses.statistics.students.khaled",
        avatarInitials: "كم",
        completionPercent: 15,
        lastActivityKey: "courses.statistics.students.weekAgo",
        status: "atRisk",
      },
    ],
    chatMessagesToday: 1240,
    chatTags: ["#تفاعلات_الإضافة", "#تسمية_الألكانات"],
    aiPredictionKey: "courses.statistics.aiPrediction",
  },
};

const ORGANIC_CHEM_STATS = STATISTICS["course-organic-chem"]!;

function buildFallbackStatistics(courseId: string): TeacherCourseStatisticsData {
  return {
    courseId,
    titleKey: "courses.details.samples.generic.title",
    subtitleMeta: ORGANIC_CHEM_STATS.subtitleMeta,
    stats: ORGANIC_CHEM_STATS.stats,
    weeklyInteraction: ORGANIC_CHEM_STATS.weeklyInteraction,
    weeklyPerformance: ORGANIC_CHEM_STATS.weeklyPerformance,
    stationPerformance: ORGANIC_CHEM_STATS.stationPerformance,
    highlightCards: ORGANIC_CHEM_STATS.highlightCards,
    topStudents: ORGANIC_CHEM_STATS.topStudents,
    upcomingSessions: ORGANIC_CHEM_STATS.upcomingSessions,
    interactionTipKey: ORGANIC_CHEM_STATS.interactionTipKey,
    insightKey: "courses.statistics.insight",
    journeyStations: ORGANIC_CHEM_STATS.journeyStations,
    studentProgress: ORGANIC_CHEM_STATS.studentProgress,
    chatMessagesToday: 320,
    chatTags: ["#عام"],
    aiPredictionKey: "courses.statistics.aiPrediction",
  };
}

export function getTeacherCourseStatisticsMock(courseId: string): TeacherCourseStatisticsData {
  return STATISTICS[courseId] ?? buildFallbackStatistics(courseId);
}
