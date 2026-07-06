export type StudentAchievementBadge = {
  badgeId: string;
  name: string;
  iconUrl: string;
  requiredPoints: number;
};

export type StudentMyProfile = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  points: number;
  maxPointsEverReached: number;
  achievementBadgeCount: number;
  earnedAchievementBadges: StudentAchievementBadge[];
  gradeName: string;
  schoolName: string;
};

export type LiveSessionStation = {
  liveSessionId: string;
  stationId: string;
  courseId: string;
  title: string;
  coverImageUrl: string | null;
  instructorName: string;
  subjectNameAr: string;
  viewerCount: number;
  remainingSeconds: number;
  remainingMinutes: number;
  scheduledEndUtc: string;
  canJoin: boolean;
  progressStatus: string;
};

export type ChallengeStation = {
  challengeId: string;
  stationId: string;
  courseId: string;
  title: string;
  coverImageUrl: string | null;
  instructorName: string;
  subjectNameAr: string;
  type: string;
  remainingSeconds: number;
  remainingMinutes: number;
  windowEndUtc: string;
  canEnter: boolean;
  progressStatus: string;
};

export type CurrentStationsDto = {
  liveSessions: LiveSessionStation[];
  challenges: ChallengeStation[];
};

export type LeaderboardEntry = {
  userId: string;
  rank: number;
  fullName: string;
  currentPoints: number;
  profileImageUrl: string | null;
  isCurrentUser: boolean;
};

export type LeaderboardWidgetDto = {
  topThree: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
};

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAtUtc: string;
};
