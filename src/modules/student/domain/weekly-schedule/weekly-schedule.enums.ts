/** Student weekly schedule — mirrors Nawabegh.API StudentSchedule domain. */

export enum StudentScheduleDisplayStatus {
  LiveNow = 0,
  Upcoming = 1,
  Exam = 2,
  NotStartedYet = 3,
  Ended = 4,
  Details = 5,
}

export enum StudentScheduleActionType {
  EnterLive = 0,
  StartExam = 1,
  ViewDetails = 2,
  Disabled = 3,
}

export enum StudentScheduleItemType {
  LiveSession = 0,
  Challenge = 1,
  Quiz = 2,
}
