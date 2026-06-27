/** Question bank, quizzes & challenges — mirrors Nawabegh.API assessment domain. */

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

export enum QuestionGenerationStatus {
  None = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
}
