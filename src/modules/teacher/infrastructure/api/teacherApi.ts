import { fetchTeacherDashboard } from "@/modules/teacher/infrastructure/api/teacherDashboardApi";
import {
  createTeacherCourse,
  deleteTeacherCourse,
  fetchTeacherCourseForEdit,
  fetchTeacherCourseWorkspace,
  fetchTeacherMyCourses,
  sendTeacherCourseForReview,
  updateTeacherCourse,
} from "@/modules/teacher/infrastructure/api/teacherCoursesApi";
import {
  fetchTeacherCourseStatisticsDetail,
  fetchTeacherCoursesStatisticsOverview,
  type TeacherCourseStatisticsParams,
  type TeacherCoursesStatisticsOverviewParams,
} from "@/modules/teacher/infrastructure/api/teacherCoursesStatisticsApi";
import { fetchTeacherLiveAnalytics } from "@/modules/teacher/infrastructure/api/teacherLiveAnalyticsApi";
import {
  endTeacherLiveSession,
  fetchTeacherLiveSessionWorkspace,
  fetchTeacherLiveSessionsPage,
} from "@/modules/teacher/infrastructure/api/teacherLiveSessionsApi";
import { fetchTeacherSchedule } from "@/modules/teacher/infrastructure/api/teacherScheduleApi";
import {
  addChatMessageReaction,
  banChatUser,
  deleteChatMessage,
  fetchTeacherChatConversation,
  fetchTeacherChatMembers,
  lockChat,
  logChatViolation,
  pinChatMessage,
  removeChatMessageReaction,
  sendChatMessage,
  type SendChatMessagePayload,
  unlockChat,
  unpinChatMessage,
  updateChatMemberPreferences,
  updateInChatSettings,
  type UpdateInChatSettingsPayload,
  updateTeacherChatGroupSidebarSettings,
} from "@/modules/teacher/infrastructure/api/teacherChatApi";
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
  TeacherLiveAnalyticsParams,
  TeacherLiveSessionsData,
  TeacherLiveSessionsListParams,
  TeacherProfileData,
  TeacherScheduleData,
  TeacherScheduleParams,
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

  async getDashboard(locale = "ar"): Promise<TeacherDashboardData> {
    return fetchTeacherDashboard(locale);
  },

  async getLiveAnalytics(
    params: TeacherLiveAnalyticsParams = {},
    locale = "ar",
  ): Promise<TeacherLiveAnalyticsData> {
    return fetchTeacherLiveAnalytics(params, locale);
  },

  async getSchedule(params: TeacherScheduleParams = {}, locale = "ar"): Promise<TeacherScheduleData> {
    return fetchTeacherSchedule(params, locale);
  },

  async getLiveSessions(
    params: TeacherLiveSessionsListParams = {},
    locale = "ar",
  ): Promise<TeacherLiveSessionsData> {
    return fetchTeacherLiveSessionsPage(params, locale);
  },

  async getSessionDetails(sessionId: string, locale = "ar"): Promise<TeacherSessionDetails | null> {
    return fetchTeacherLiveSessionWorkspace(sessionId, locale);
  },

  async endLiveSession(sessionId: string): Promise<void> {
    return endTeacherLiveSession(sessionId);
  },

  async getCourses(params: TeacherCoursesListParams = {}, locale = "ar"): Promise<TeacherCoursesListData> {
    return fetchTeacherMyCourses(params, locale);
  },

  async getCourseDetails(courseId: string, locale = "ar"): Promise<TeacherCourseDetail> {
    return fetchTeacherCourseWorkspace(courseId, locale);
  },

  async getCourseForEdit(courseId: string): Promise<TeacherCourseCreatePayload | null> {
    return fetchTeacherCourseForEdit(courseId);
  },

  async getCourseStatistics(
    courseId: string,
    params: TeacherCourseStatisticsParams = {},
  ): Promise<TeacherCourseStatisticsData> {
    return fetchTeacherCourseStatisticsDetail(courseId, params);
  },

  async createCourse(
    payload: TeacherCourseCreatePayload,
    submitForReview = false,
  ): Promise<TeacherCourseCreateResult> {
    return createTeacherCourse(payload, submitForReview);
  },

  async updateCourse(
    courseId: string,
    payload: TeacherCourseCreatePayload,
  ): Promise<TeacherCourseCreateResult> {
    return updateTeacherCourse(courseId, payload);
  },

  async deleteCourse(courseId: string): Promise<void> {
    return deleteTeacherCourse(courseId);
  },

  async sendCourseForReview(courseId: string): Promise<void> {
    return sendTeacherCourseForReview(courseId);
  },

  async getCoursesStatisticsOverview(
    params: TeacherCoursesStatisticsOverviewParams = {},
  ): Promise<TeacherCoursesStatisticsOverviewData> {
    return fetchTeacherCoursesStatisticsOverview(params);
  },

  async getChatConversation(courseId: string, locale = "ar"): Promise<TeacherChatConversationData> {
    return fetchTeacherChatConversation(courseId, locale);
  },

  async getChatMembers(courseId: string, locale = "ar"): Promise<TeacherChatMembersData> {
    return fetchTeacherChatMembers(courseId, locale);
  },

  async updateChatGroupSettings(
    courseId: string,
    settings: Partial<TeacherChatGroupSettings>,
    current: TeacherChatGroupSettings,
  ): Promise<TeacherChatGroupSettings> {
    return updateTeacherChatGroupSidebarSettings(courseId, settings, current);
  },

  async sendChatMessage(
    courseId: string,
    payload: SendChatMessagePayload,
  ): Promise<{ id: string }> {
    const id = await sendChatMessage(courseId, payload);
    return { id };
  },

  async pinChatMessage(messageId: string): Promise<void> {
    return pinChatMessage(messageId);
  },

  async unpinChatMessage(messageId: string): Promise<void> {
    return unpinChatMessage(messageId);
  },

  async deleteChatMessage(messageId: string): Promise<void> {
    return deleteChatMessage(messageId);
  },

  async toggleChatReaction(messageId: string, emoji: string, added: boolean): Promise<void> {
    if (added) {
      await removeChatMessageReaction(messageId, emoji);
      return;
    }
    await addChatMessageReaction(messageId, emoji);
  },

  async banChatParticipant(courseId: string, userId: string, reason: string): Promise<void> {
    return banChatUser(courseId, userId, reason);
  },

  async logChatParticipantViolation(
    courseId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    return logChatViolation(courseId, userId, reason);
  },

  async updateInChatSettings(courseId: string, payload: UpdateInChatSettingsPayload): Promise<void> {
    return updateInChatSettings(courseId, payload);
  },

  async toggleChatLock(courseId: string, locked: boolean): Promise<void> {
    if (locked) {
      await lockChat(courseId);
      return;
    }
    await unlockChat(courseId);
  },

  async updateChatMutePreference(
    courseId: string,
    isMuted: boolean,
    isPinnedInList: boolean,
  ): Promise<void> {
    return updateChatMemberPreferences(courseId, { isMuted, isPinnedInList });
  },
};
