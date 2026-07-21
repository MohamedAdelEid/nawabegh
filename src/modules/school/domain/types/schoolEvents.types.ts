export type SchoolEventStatusFilter =
  | "all"
  | "ongoing"
  | "published"
  | "draft"
  | "finished";

export type SchoolEventStatus =
  | "Draft"
  | "Published"
  | "Ongoing"
  | "Finished"
  | "Archived";

export type SchoolEventType =
  | "sports"
  | "cultural"
  | "academic"
  | "behavioral"
  | "scientific"
  | string;

export interface SchoolEventKpis {
  ongoingCount: number;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
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
  type: SchoolEventType;
  typeLabel: string;
  status: SchoolEventStatus;
  statusLabel: string;
  coverImageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  dateLabel: string;
  participantCount: number;
  participantPreview: SchoolEventParticipantPreview[];
  canManage: boolean;
  canEdit: boolean;
  canViewReports: boolean;
}

export interface SchoolEventsListParams {
  status: SchoolEventStatusFilter;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}

export interface SchoolEventsListPage {
  items: SchoolEventCard[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

export interface SchoolEventDetail {
  id: number;
  type: SchoolEventType;
  title: string;
  description: string;
  rules: string;
  coverImageUrl: string | null;
  bannerImageUrl: string | null;
  seriesLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  gradeLevelIds: number[];
  status: SchoolEventStatus;
  statusLabel: string;
  typeLabel: string;
}

export interface UpsertSchoolEventPayload {
  type: string;
  title: string;
  description: string;
  rules: string;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  seriesLabel?: string | null;
  startsAt: string;
  endsAt: string;
  gradeLevelIds: number[];
  publishNow?: boolean;
}

export interface SchoolEventLiveScore {
  homeTeamId: number | null;
  homeTeamName: string;
  homeTeamLogoUrl: string | null;
  homePoints: number;
  awayTeamId: number | null;
  awayTeamName: string;
  awayTeamLogoUrl: string | null;
  awayPoints: number;
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
  startsAt: string | null;
  timeLabel: string;
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
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  startsAt: string | null;
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
}

export type SchoolTeamPrivacy = "public" | "school" | "private";

export interface SchoolTeamPrivacyOption {
  value: SchoolTeamPrivacy;
  label: string;
  description: string;
}

export interface SchoolTeamMeta {
  privacyOptions: SchoolTeamPrivacyOption[];
}

export interface SchoolTeamStudentSearchResult {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  gradeLabel: string;
}

export interface UpsertSchoolTeamPayload {
  name: string;
  description: string;
  logoUrl?: string | null;
  privacy: SchoolTeamPrivacy;
  minLevel?: number | null;
  minChallengesCompleted?: number | null;
  schoolEventId?: number | null;
  memberUserIds: string[];
}

export interface SchoolTeamDetail {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  privacy: SchoolTeamPrivacy;
  minLevel: number | null;
  minChallengesCompleted: number | null;
  schoolEventId: number | null;
  memberUserIds: string[];
}

export type SchoolTeamRankingScope = "all" | "own";

export interface SchoolTeamRankingKpis {
  totalTeams: number;
  activeChallenges: number;
  seasonPoints: number;
  seasonPointsLabel: string;
  globalRank: number | null;
  globalRankLabel: string;
}

export interface SchoolTeamRankingMemberPreview {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface SchoolTeamRankingEntry {
  rank: number;
  teamId: number;
  teamName: string;
  logoUrl: string | null;
  schoolName: string;
  points: number;
  winsCount: number;
  memberCount: number;
  rankChange: number | null;
  rankChangeLabel: string;
  memberPreview: SchoolTeamRankingMemberPreview[];
}

export interface SchoolTeamRankingsParams {
  schoolScope: SchoolTeamRankingScope;
  pageNumber: number;
  pageSize: number;
  seasonId?: string | null;
}

export interface SchoolTeamRankingsPage {
  kpis: SchoolTeamRankingKpis;
  items: SchoolTeamRankingEntry[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
