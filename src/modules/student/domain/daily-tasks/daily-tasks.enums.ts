/** Student daily tasks — mirrors Nawabegh.API StudentDailyTasks domain. */

export enum StudentDailyChallengeType {
  QuickChallenge = 0,
  RankedMatch = 1,
  Practice = 2,
}

export enum StudentDailyLiveRuntimeMode {
  Upcoming = 0,
  Live = 1,
  Recorded = 2,
  EndedWithoutRecording = 3,
}

export enum StudentDailyStationProgressStatus {
  Locked = 0,
  Available = 1,
  InProgress = 2,
  Completed = 3,
  Missed = 4,
  Incomplete = 5,
}
