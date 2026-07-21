export enum ChallengeType {
  QuickChallenge = 0,
  RankedMatch = 1,
  Practice = 2,
}

export enum ChallengeStudentStatus {
  NotStarted = 0,
  Waiting = 1,
  InProgress = 2,
  Completed = 3,
  Missed = 4,
  Forfeited = 5,
  FailedDualDisconnect = 6,
  PracticeCompleted = 7,
}

export enum ChallengeSessionStatus {
  Waiting = 0,
  InProgress = 1,
  Completed = 2,
  Abandoned = 3,
}

export enum QuestionGenerationStatus {
  Pending = 0,
  Generating = 1,
  Completed = 2,
  Failed = 3,
}

export type ChallengeStationPhase =
  | "modes"
  | "matchmaking"
  | "lobby"
  | "duel"
  | "results";
