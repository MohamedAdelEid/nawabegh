export type SchoolEventStatusFilter =
  | "all"
  | "ongoing"
  | "published"
  | "finished";

export type SchoolEventStatus =
  | "Published"
  | "Ongoing"
  | "Finished";

export type SchoolEventActionType = "View" | "Register";

export type SchoolEventActivityIconType = "success" | "round" | "trophy";

export type SchoolEventMatchStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled"
  | string;

export type SchoolEventLiveTab = "live" | "matches" | "honorBoard";

export interface SchoolEventKpis {
  ongoingCount: number;
  totalCount: number;
  publishedCount: number;
  finishedCount: number;
}

export interface SchoolEventMetaOption {
  value: string;
  label: string;
}

export interface SchoolEventMeta {
  statuses: SchoolEventMetaOption[];
  types: SchoolEventMetaOption[];
}

export interface SchoolEventParticipantPreview {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface SchoolEventCard {
  id: number;
  title: string;
  type: string;
  typeLabel: string;
  status: SchoolEventStatus;
  statusLabel: string;
  coverImageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  dateLabel: string;
  participantCount: number;
  participantPreview: SchoolEventParticipantPreview[];
  actionType: SchoolEventActionType;
  actionLabel: string;
  canManage: boolean;
}

export interface SchoolEventsListParams {
  status: SchoolEventStatusFilter;
  pageNumber: number;
  pageSize: number;
}

export interface SchoolEventsListPage {
  items: SchoolEventCard[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

export interface SchoolEventLiveScore {
  matchId: number | null;
  homeTeamId: number | null;
  homeTeamName: string;
  homeTeamLogoUrl: string | null;
  homePoints: number;
  awayTeamId: number | null;
  awayTeamName: string;
  awayTeamLogoUrl: string | null;
  awayPoints: number;
  setsWonHome: number;
  setsWonAway: number;
  scoreLabel: string;
  roundLabel: string;
  timerSeconds: number;
  timerLabel: string;
  likesCount: number;
  fireCount: number;
  medalsCount: number;
}

export interface SchoolEventFeedItem {
  id: number | string;
  message: string;
  createdAt: string | null;
  relativeTimeLabel: string;
  icon: string | null;
  teamId: number | null;
}

export interface SchoolEventPollOption {
  id: number | string;
  label: string;
  votesCount: number;
  percent: number;
}

export interface SchoolEventPoll {
  id: number | string;
  question: string;
  totalVotes: number;
  options: SchoolEventPollOption[];
}

export interface SchoolEventStandingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  schoolName: string;
  logoUrl: string | null;
  points: number;
  rankChange: number | null;
}

export interface SchoolEventNextMatch {
  matchId: number | null;
  startsAt: string | null;
  timeLabel: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName: string;
  awayTeamName: string;
}

export interface SchoolEventLiveHero {
  title: string;
  description: string;
  seriesLabel: string | null;
  statusLabel: string;
  isLive: boolean;
  bannerImageUrl: string | null;
}

export interface SchoolEventLiveDashboard {
  hero: SchoolEventLiveHero;
  score: SchoolEventLiveScore | null;
  feed: SchoolEventFeedItem[];
  poll: SchoolEventPoll | null;
  standings: SchoolEventStandingEntry[];
  nextMatch: SchoolEventNextMatch | null;
}

export interface SchoolEventMatch {
  id: number;
  round: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  startsAt: string | null;
  status: SchoolEventMatchStatus;
  statusLabel: string;
  roundLabel: string;
}

export interface SchoolEventHonorEntry {
  rank: number;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  pointsLabel: string;
  gradeLabel: string;
  teamName: string;
  isCaptain: boolean;
  roleLabel: string;
}
