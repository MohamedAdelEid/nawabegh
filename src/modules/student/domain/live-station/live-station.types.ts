import type { LiveSessionRuntimeMode } from "@/modules/student/domain/progress/progress.enums";
import type { StudentStationProgressStatus } from "@/modules/student/domain/progress/progress.enums";

export type LiveStationPhase =
  | "loading"
  | "overview"
  | "classroom"
  | "recorded"
  | "ended"
  | "locked"
  | "error";

export type LiveClassroomPanel = "chat" | "participants" | "info" | null;

export type LiveStationResponsibleTeacher = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  jobTitle: string;
};

export type LiveStationPreSessionTask = {
  title: string;
  description: string;
  order: number;
};

export type LiveStationAttachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  order: number;
};

export type LiveStationFeatures = {
  interactiveChatEnabled: boolean;
  highQualityStream: boolean;
  recordingAfterSession: boolean;
};

export type LiveStationInfoDto = {
  liveSessionId: string | null;
  stationType: number;
  title: string;
  description: string;
  coverImageUrl: string;
  scheduledAt: string;
  scheduledEndAt: string;
  durationMinutes: number;
  status: number;
  runtimeMode: LiveSessionRuntimeMode;
  recordingUrl: string | null;
  studentProgressStatus: StudentStationProgressStatus;
  studentHasAttended: boolean;
  studentMinutesAttended: number;
  liveParticipantCount: number;
  learningGoals: string[];
  preSessionTasks: LiveStationPreSessionTask[];
  attachments: LiveStationAttachment[];
  responsibleTeacherId: string;
  hostIdentity: string;
  courseTitle: string;
  learningPathTitle: string;
  responsibleTeacher: LiveStationResponsibleTeacher | null;
  remainingMinutes: number;
  features: LiveStationFeatures | null;
};

export type LiveStationJoinResultDto = {
  liveSessionId: string;
  roomName: string;
  token: string;
  wsUrl: string;
  studentDisplayName: string;
  studentEmail: string;
};

export type LiveChatMessageDto = {
  id: string;
  liveSessionId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  sentAt: string;
  isSystemEvent: boolean;
};

export type LiveChatMessagesPageDto = {
  items: LiveChatMessageDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type LiveParticipantDto = {
  userId: string;
  displayName: string;
  profileImageUrl: string | null;
  role: string;
  isHandRaised: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
};

export type LiveHandRaisedEvent = {
  userId: string;
  displayName: string;
  raised: boolean;
};

export type LiveRecordingProgressDto = {
  lastPositionSeconds: number;
  durationSeconds: number | null;
};

export type LiveStationCompletionResultDto = {
  pathCompleted: boolean;
  pathId: string | null;
  pathPointsEarned: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
};
