export type FriendChallengeDifficulty = "Easy" | "Medium" | "Hard";

export type FriendChallengeStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Cancelled"
  | "Expired"
  | "InProgress"
  | "Completed"
  | "Missed";

export type FriendChallengeRole = "inviter" | "invitee";

export type FriendChallengeOutcome = "win" | "loss" | "tie";

export type FriendChallengeSessionPhase =
  | "WaitingForOpponent"
  | "InProgress"
  | "WaitingForOpponentToFinish"
  | "Ended";

export type FriendChallengeSessionStatus = "Waiting" | "InProgress" | "Completed" | "Abandoned";

export type FriendChallengeEndReason =
  | "BothFinished"
  | "TimeExpired"
  | "Forfeit"
  | "BothDisconnected";

export type FriendChallengeErrorCode =
  | "INSUFFICIENT_POINTS"
  | "CHALLENGE_EXPIRED"
  | "INVALID_STATE_TRANSITION"
  | "NOT_ALLOWED"
  | "INVALID_OPPONENT"
  | "INVALID_SUBJECT"
  | "QUESTION_BANK_INSUFFICIENT"
  | "INVITE_NOT_FOUND";

export type FriendChallengeOpponent = {
  studentId: string;
  fullName: string;
  profileImageUrl: string | null;
  level: number | null;
  schoolRank: number | null;
};

export type FriendChallengeListItem = {
  friendChallengeId: string;
  title: string;
  subjectName: string;
  difficulty: FriendChallengeDifficulty;
  questionCount: number;
  wagerPoints: number;
  opponent: FriendChallengeOpponent;
  status: FriendChallengeStatus;
  role: FriendChallengeRole;
  challengeDate: string;
  startTime: string;
  endTime: string;
  endDate: string;
  timeZoneId: string;
  scheduledStartLocal: string;
  scheduledEndLocal: string;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  remainingSecondsUntilStart: number;
  remainingSecondsUntilEnd: number;
  canEnter: boolean;
  canAccept: boolean;
  canDecline: boolean;
  canCancel: boolean;
  outcome: FriendChallengeOutcome | null;
  sessionId: string | null;
};

export type FriendChallengeHubResponse = {
  schoolRank: { rank: number | null; schoolName: string | null };
  stats: {
    wins: number;
    losses: number;
    pendingCount: number;
    upcomingCount: number;
  };
  pending: FriendChallengeListItem[];
  upcoming: FriendChallengeListItem[];
  wins: FriendChallengeListItem[];
  losses: FriendChallengeListItem[];
  cancelled: FriendChallengeListItem[];
};

export type FriendChallengeSearchOpponent = {
  studentUserId: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  gradeName: string;
  schoolName: string;
  profileImageUrl: string | null;
  level: number | null;
};

export type CreateFriendChallengePayload = {
  inviteeStudentId: string;
  title: string;
  subjectId: number;
  difficulty: 0 | 1 | 2;
  questionCount: number;
  challengeDate: string;
  startTime: string;
  timeZoneId: string;
};

export type CreateFriendChallengeResponse = {
  friendChallengeId: string;
  status: FriendChallengeStatus;
  questionSelectionStatus: string;
};

export type EnterFriendChallengeResponse = {
  sessionId: string;
  status: FriendChallengeSessionStatus;
  phase: FriendChallengeSessionPhase;
  canLoadQuestions: boolean;
  readyToStart: boolean;
  opponent: FriendChallengeOpponent;
};

export type ActiveFriendChallengeSession = {
  sessionId: string;
  friendChallengeId: string;
  status: FriendChallengeSessionStatus;
  phase: FriendChallengeSessionPhase;
  canLoadQuestions: boolean;
};

export type FriendChallengeSessionParticipant = {
  studentId: string;
  totalScore: number;
  correctAnswers: number;
  isConnected?: boolean;
  isWinner?: boolean;
};

export type FriendChallengeSessionState = {
  sessionId: string;
  status: FriendChallengeSessionStatus;
  phase: FriendChallengeSessionPhase;
  winnerId: string | null;
  myFinished: boolean;
  opponentFinished: boolean;
  participants: FriendChallengeSessionParticipant[];
};

export type FriendChallengeQuestionOption = {
  optionId: string;
  text: string;
  order: number;
};

export type FriendChallengeQuestion = {
  questionId: string;
  text: string;
  category: string;
  points: number;
  order: number;
  options: FriendChallengeQuestionOption[];
};

export type FriendChallengeQuestionsResponse = {
  questions: FriendChallengeQuestion[];
};

export type SubmitFriendChallengeAnswerResponse = {
  pointsEarned: number;
  totalScore: number;
  allQuestionsAnswered: boolean;
};

export type FriendChallengeSessionResult = {
  sessionId: string;
  friendChallengeId: string;
  winnerId: string | null;
  loserId: string | null;
  isTie: boolean;
  endReason: FriendChallengeEndReason;
  wagerPoints: number;
  participants: FriendChallengeSessionParticipant[];
};

export type FriendChallengeApiError = {
  message: string;
  errorCode: FriendChallengeErrorCode | string | null;
};

export type FriendChallengeHistoryTab =
  | "pending"
  | "upcoming"
  | "wins"
  | "losses"
  | "cancelled";
