/** Mirrors Nawabegh.API progress domain — see PROGRESS_PATH_SCREEN.md */

export enum StudentStationProgressStatus {
  Locked = 0,
  Available = 1,
  InProgress = 2,
  Completed = 3,
  Missed = 4,
  Incomplete = 5,
}

export enum StudentPathProgressStatus {
  Locked = 0,
  Available = 1,
  InProgress = 2,
  Completed = 3,
}

export enum LiveSessionRuntimeMode {
  Upcoming = 0,
  Live = 1,
  Recorded = 2,
  EndedWithoutRecording = 3,
}
