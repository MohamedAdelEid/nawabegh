/** Learning path, stations & live sessions — mirrors Nawabegh.API journey domain. */

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

export enum LiveSessionStatus {
  Scheduled = 0,
  Live = 1,
  Ended = 2,
  Cancelled = 3,
  RecordingAvailable = 4,
}

/** Computed UI mode — prefer over persisted `LiveSessionStatus` for display. */
export enum LiveSessionRuntimeMode {
  Upcoming = 0,
  Live = 1,
  Recorded = 2,
  EndedWithoutRecording = 3,
}

export enum StationProgressStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
}
