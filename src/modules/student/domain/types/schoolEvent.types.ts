export type SchoolEventStatus = "Live" | "Published" | "Draft" | "Ended";

export type SchoolEventStatusFilter = "all" | "live" | "published" | "draft" | "ended";

export type SchoolEventCategory =
  | "Sports"
  | "Cultural"
  | "Scientific"
  | "Academic"
  | "Other";

export type SchoolEventActionType =
  | "ViewLive"
  | "ViewEvent"
  | "ViewResults"
  | "ComingSoon";

export type SchoolEventParticipantPreview = {
  profileImageUrl?: string | null;
  fullName?: string | null;
};

export type SchoolEventCard = {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  status: SchoolEventStatus;
  statusLabel: string;
  category: SchoolEventCategory;
  categoryLabel: string;
  startsAt?: string | null;
  endsAt?: string | null;
  dateRangeLabel: string;
  participantCount: number;
  participantPreview: SchoolEventParticipantPreview[];
  actionType: SchoolEventActionType;
  actionLabel: string;
  isLive: boolean;
};

export type SchoolEventsPage = {
  items: SchoolEventCard[];
  loadedCount: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type SchoolEventLiveTab = "live" | "schedule" | "honorBoard";

export type SchoolEventTeamSide = "home" | "away";

export type SchoolEventMatchTeam = {
  side?: SchoolEventTeamSide;
  teamId: string;
  name: string;
  shortName?: string;
  logoUrl?: string | null;
  points?: number;
  pointsLabel?: string;
  accentColor?: string;
  schoolName?: string;
};

export type SchoolEventReactions = {
  likes: number;
  likesLabel: string;
  fire: number;
  fireLabel: string;
  stars: number;
  starsLabel: string;
};

export type SchoolEventCurrentMatch = {
  matchId: string;
  currentRound: number;
  totalRounds: number;
  roundLabel: string;
  remainingSeconds: number;
  timerLabel: string;
  setsWon: { home: number; away: number };
  teams: SchoolEventMatchTeam[];
  reactions: SchoolEventReactions;
  activeViewerCount: number;
  viewerPreview: SchoolEventParticipantPreview[];
};

export type SchoolEventFeedIconType = "success" | "round" | "trophy";

export type SchoolEventActivityItem = {
  id: string;
  occurredAt: string;
  relativeLabel: string;
  message: string;
  iconType: SchoolEventFeedIconType;
  teamId?: string | null;
};

export type SchoolEventPollOption = {
  optionId: string;
  label: string;
  votePercentage: number;
  voteCount: number;
  isLeading: boolean;
};

export type SchoolEventActivePoll = {
  pollId: string;
  question: string;
  totalVotes: number;
  totalVotesLabel: string;
  hasUserVoted: boolean;
  options: SchoolEventPollOption[];
};

export type SchoolEventTeamStanding = {
  rank: number;
  teamId: string;
  name: string;
  schoolName: string;
  logoUrl?: string | null;
  points: number;
  rankChange: number;
  rankChangeLabel: string;
  isHighlighted: boolean;
};

export type SchoolEventNextMatch = {
  matchId: string;
  scheduledAt: string;
  scheduledLabel: string;
  teams: SchoolEventMatchTeam[];
};

export type SchoolEventScheduleMatch = {
  matchId: string;
  roundLabel: string;
  statusLabel: string;
  scheduledLabel: string;
  teams: SchoolEventMatchTeam[];
  scoreLabel?: string | null;
};

export type SchoolEventHonorEntry = {
  id: string;
  title: string;
  subtitle: string;
  pointsLabel: string;
};

export type SchoolEventLiveDashboard = {
  eventId: string;
  title: string;
  description: string;
  seriesLabel: string;
  bannerImageUrl?: string | null;
  isLive: boolean;
  liveStatusLabel: string;
  generatedAtUtc: string;
  currentMatch: SchoolEventCurrentMatch;
  activityFeed: SchoolEventActivityItem[];
  activePoll: SchoolEventActivePoll | null;
  teamStandings: SchoolEventTeamStanding[];
  nextMatch: SchoolEventNextMatch | null;
  scheduleMatches: SchoolEventScheduleMatch[];
  honorBoard: SchoolEventHonorEntry[];
};
