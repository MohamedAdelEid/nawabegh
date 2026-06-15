import { getTeacherCourseDetailsMock } from "@/modules/teacher/domain/data/teacherCourseDetailsData";
import { getTeacherCourseStatisticsMock } from "@/modules/teacher/domain/data/teacherCourseStatisticsData";
import { getTeacherCoursesListMock } from "@/modules/teacher/domain/data/teacherCoursesData";
import { teacherDashboardMockData } from "@/modules/teacher/domain/data/teacherDashboardData";
import { teacherLiveAnalyticsMockData } from "@/modules/teacher/domain/data/teacherLiveAnalyticsData";
import { teacherLiveSessionsMockData } from "@/modules/teacher/domain/data/teacherLiveSessionsData";
import { teacherScheduleMockData } from "@/modules/teacher/domain/data/teacherScheduleData";
import { getTeacherSessionDetailsMock } from "@/modules/teacher/domain/data/teacherSessionDetailsData";
import { getTeacherChatConversationMock } from "@/modules/teacher/domain/data/teacherChatConversationData";
import { getTeacherChatMembersMock } from "@/modules/teacher/domain/data/teacherChatMembersData";
import { teacherCoursesStatisticsOverviewMock } from "@/modules/teacher/domain/data/teacherCoursesStatisticsOverviewData";
import { TEACHER_MOCK_PROFILE } from "@/modules/teacher/domain/data/teacherMockProfile";
import type {
  TeacherCourseCreatePayload,
  TeacherCourseCreateResult,
  TeacherCourseDetail,
  TeacherCoursesListData,
  TeacherCoursesListParams,
  TeacherCourseStatisticsData,
  TeacherChatConversationData,
  TeacherChatMembersData,
  TeacherChatGroupSettings,
  TeacherCoursesStatisticsOverviewData,
  TeacherDashboardData,
  TeacherLiveAnalyticsData,
  TeacherLiveSessionsData,
  TeacherProfileData,
  TeacherScheduleData,
  TeacherSessionDetails,
} from "@/modules/teacher/domain/types/teacher.types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

export const teacherApi = {
  async getProfile(): Promise<TeacherProfileData> {
    return delay({
      name: TEACHER_MOCK_PROFILE.name,
      email: TEACHER_MOCK_PROFILE.email,
      password: TEACHER_MOCK_PROFILE.password,
      role: "Teacher",
    });
  },

  async getDashboard(): Promise<TeacherDashboardData> {
    return delay(teacherDashboardMockData);
  },

  async getLiveAnalytics(): Promise<TeacherLiveAnalyticsData> {
    return delay(teacherLiveAnalyticsMockData);
  },

  async getSchedule(): Promise<TeacherScheduleData> {
    return delay(teacherScheduleMockData);
  },

  async getLiveSessions(): Promise<TeacherLiveSessionsData> {
    return delay(teacherLiveSessionsMockData);
  },

  async getSessionDetails(sessionId: string): Promise<TeacherSessionDetails | null> {
    return delay(getTeacherSessionDetailsMock(sessionId));
  },

  async getCourses(params: TeacherCoursesListParams = {}): Promise<TeacherCoursesListData> {
    return delay(getTeacherCoursesListMock(params));
  },

  async getCourseDetails(courseId: string): Promise<TeacherCourseDetail> {
    return delay(getTeacherCourseDetailsMock(courseId));
  },

  async getCourseStatistics(courseId: string): Promise<TeacherCourseStatisticsData> {
    return delay(getTeacherCourseStatisticsMock(courseId));
  },

  async createCourse(payload: TeacherCourseCreatePayload): Promise<TeacherCourseCreateResult> {
    void payload;
    return delay({ courseId: `course-${Date.now()}` });
  },

  async updateCourse(
    courseId: string,
    payload: TeacherCourseCreatePayload,
  ): Promise<TeacherCourseCreateResult> {
    void payload;
    return delay({ courseId });
  },

  async getCoursesStatisticsOverview(): Promise<TeacherCoursesStatisticsOverviewData> {
    return delay(teacherCoursesStatisticsOverviewMock);
  },

  async getChatConversation(courseId: string): Promise<TeacherChatConversationData> {
    return delay(getTeacherChatConversationMock(courseId));
  },

  async getChatMembers(courseId: string): Promise<TeacherChatMembersData> {
    return delay(getTeacherChatMembersMock(courseId));
  },

  async updateChatGroupSettings(
    courseId: string,
    settings: Partial<TeacherChatGroupSettings>,
  ): Promise<TeacherChatGroupSettings> {
    const current = getTeacherChatMembersMock(courseId).settings;
    return delay({ ...current, ...settings });
  },

  async sendChatMessage(courseId: string, content: string): Promise<{ id: string }> {
    void courseId;
    void content;
    return delay({ id: `msg-${Date.now()}` });
  },
};
