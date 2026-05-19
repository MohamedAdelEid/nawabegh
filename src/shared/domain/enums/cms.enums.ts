/**
 * CMS / LMS content enums — mirrors Nawabegh.API.
 * @see ADMIN_CMS_CONTENT_CREATION_GUIDE.md §3
 */

export enum CourseStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Archived = 4,
}

export enum CourseAccessType {
  Free = 0,
  Paid = 1,
  Subscription = 2,
}

export enum CourseTerm {
  FirstTerm = 1,
  SecondTerm = 2,
  ThirdTerm = 3,
}

/** Bitmask flags — combine with bitwise OR for reject payloads. */
export enum CourseRejectionReasons {
  None = 0,
  IncompleteContent = 1,
  PoorAudioVideo = 2,
  ContentQuality = 4,
  PolicyViolation = 8,
  CopyrightIssue = 16,
  InsufficientSources = 32,
}

export enum LearningPathStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export enum StationType {
  LiveStream = 0,
  Flashcards = 1,
  ShortQuiz = 2,
  Challenge = 3,
  HelperResource = 4,
  RecordedLecture = 5,
}

export enum CompletionRuleType {
  CompleteAllTasks = 0,
  WatchFullVideo = 1,
  PassQuiz = 2,
  CompleteFlashcards = 3,
  AttendLive = 4,
  FinishChallenge = 5,
}

export enum StationAccessPolicy {
  All = 0,
  Subscribers = 1,
}

export enum DifficultyLevel {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export enum QuestionType {
  MultipleChoice = 0,
  TrueOrFalse = 1,
}

export enum ChallengeType {
  TimeChallenge = 0,
  ShortQuiz = 1,
  SpeedChallenge = 2,
}

export enum LiveSessionStatus {
  Scheduled = 0,
  Live = 1,
  Ended = 2,
  Cancelled = 3,
  RecordingAvailable = 4,
}

export enum QuestionGenerationStatus {
  None = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
}

export enum ResourceFileType {
  ForStation = 0,
  ForCourse = 1,
}

/** Resource file access (separate from `StationAccessPolicy`). */
export enum AccessPolicy {
  All = 0,
  Subscribers = 1,
}
