import type {
  ChallengeSessionStatus,
  ChallengeStationPhase,
  ChallengeStudentStatus,
  ChallengeType,
  QuestionGenerationStatus,
} from "./challenge-station.enums";

export type ChallengeStationIntroDto = {
  stationId: string;
  challengeId: string;
  learningPathId: string;
  learningPathTitle: string;
  stationName: string;
  courseTitle: string | null;
  pointsReward: number | null;
};

export type ChallengeOverviewDto = {
  challengeId: string;
  stationId: string;
  title: string;
  type: ChallengeType;
  durationMinutes: number;
  questionCount: number;
  challengeDate: string | null;
  startTime: string | null;
  endTime: string | null;
  timeZoneId: string | null;
  questionGenerationStatus: QuestionGenerationStatus;
  stationProgressStatus: number;
  status: ChallengeStudentStatus;
  scheduleRequired: boolean;
  isMatchmakingOpen: boolean;
  canEnter: boolean;
  canReplay: boolean;
  canTrainAgain: boolean;
  blockReason: string | null;
  activeSessionId: string | null;
  pointsReward: number;
  hasReceivedReward: boolean;
};

export type ChallengeQueueResultDto = {
  matched: boolean;
  sessionId: string | null;
  opponentStudentId: string | null;
  opponentDisplayName: string | null;
  isRankedFallback: boolean;
  matchQuality: string | null;
};

export type ChallengeMatchFoundEvent = {
  sessionId: string;
  opponentStudentId: string | null;
  opponentDisplayName: string | null;
  matchQuality: string | null;
};

export type ChallengeSessionParticipantDto = {
  studentId: string;
  displayName: string | null;
  totalScore: number;
  correctAnswers: number;
  isConnected: boolean;
};

export type ChallengeSessionDto = {
  sessionId: string;
  status: ChallengeSessionStatus;
  winnerId: string | null;
  startedAt: string | null;
  durationMinutes: number;
  questionCount: number;
  participants: ChallengeSessionParticipantDto[];
};

export type ChallengeQuestionOptionDto = {
  optionId: string;
  text: string;
  order: number;
};

export type ChallengeQuestionDto = {
  questionId: string;
  text: string;
  category: string | null;
  points: number;
  order: number;
  options: ChallengeQuestionOptionDto[];
};

export type ChallengeQuestionsDto = {
  questions: ChallengeQuestionDto[];
};

export type ChallengeAnswerResultDto = {
  pointsEarned: number;
  totalScore: number;
  allQuestionsAnswered: boolean;
};

export type ChallengeSessionEndedEvent = {
  winnerId: string | null;
  endReason: string | null;
  participants: ChallengeSessionParticipantDto[];
};

export type StudentPointsSummaryDto = {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  recentTransactions: StudentPointsTransactionDto[];
};

export type StudentPointsTransactionDto = {
  amount: number;
  reason: string;
  referenceType: string | null;
  createdAt: string | null;
};

export type AchievementAuditItemDto = {
  key: string;
  title: string;
  description: string | null;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  isCompleted: boolean;
};

export type ChallengeHubStats = {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  rank: number | null;
  pointsReward: number | null;
};

export type ChallengeStationHeaderContext = {
  courseTitle: string | null;
  pathTitle: string | null;
  stationName: string;
};

export type ChallengeDuelUiState = {
  phase: ChallengeStationPhase;
  questionIndex: number;
  myScore: number;
  opponentScore: number;
  streak: number;
  speedMultiplier: number;
  consecutiveBonus: number;
  questionStartedAt: number | null;
  waitStartedAt: number | null;
  countdown: number | null;
};
