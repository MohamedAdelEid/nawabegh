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

export type FriendChallengePlayer = {
  studentId: string;
  fullName: string;
  schoolName: string;
  profileImageUrl: string | null;
};

export type FriendChallengeListItem = {
  friendChallengeId: string;
  title: string;
  subjectName: string;
  difficulty: FriendChallengeDifficulty;
  challengeDate: string;
  inviter: FriendChallengePlayer;
  invitee: FriendChallengePlayer;
  winnerStudentId: string | null;
  winnerPointsEarned: number | null;
  status: FriendChallengeStatus;
};

export type FriendChallengesKpis = {
  totalChallenges: number;
  successRatePercent: number;
  totalPointsEarned: number;
  averageDifficulty: FriendChallengeDifficulty;
};

export type DifficultyDistributionRow = {
  difficulty: FriendChallengeDifficulty;
  count: number;
  percent: number;
};

export type DailyChallengeRateRow = {
  date: string;
  dayNameAr: string;
  count: number;
};

export type FriendChallengesDashboardData = {
  kpis: FriendChallengesKpis;
  difficultyDistribution: DifficultyDistributionRow[];
  dailyChallengeRate: DailyChallengeRateRow[];
  challenges: {
    items: FriendChallengeListItem[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
};

export type FriendChallengeOverviewPlayer = {
  studentId: string;
  fullName: string;
  profileImageUrl: string | null;
  schoolName: string;
  totalScore: number;
  correctAnswers: number;
  pointsChange: number;
  isWinner: boolean;
};

export type FriendChallengeAnswerEntry = {
  order: number;
  questionId: string;
  questionText: string;
  correctAnswerText: string;
  inviterAnswer: {
    selectedAnswerText: string;
    isCorrect: boolean;
    pointsEarned: number;
    responseTimeMs: number;
  };
  inviteeAnswer: {
    selectedAnswerText: string;
    isCorrect: boolean;
    pointsEarned: number;
    responseTimeMs: number;
  };
};

export type FriendChallengeOverviewData = {
  friendChallengeId: string;
  title: string;
  topic: string;
  subjectName: string;
  difficulty: FriendChallengeDifficulty;
  questionCount: number;
  wagerPoints: number;
  durationMinutes: number;
  status: FriendChallengeStatus;
  challengeDate: string;
  startTime: string;
  playedAt: string;
  actualDurationSeconds: number;
  sessionId: string;
  inviter: FriendChallengeOverviewPlayer;
  invitee: FriendChallengeOverviewPlayer;
  answerLog: FriendChallengeAnswerEntry[];
};
