export enum StudentQuizAttemptStatus {
  Draft = 0,
  Submitted = 1,
  TimedOut = 2,
}

export enum QuizQuestionType {
  MultipleChoice = 0,
  TrueOrFalse = 1,
}

export enum ShortQuizStep {
  Intro = "intro",
  Instructions = "instructions",
  Attempt = "attempt",
  Results = "results",
  Review = "review",
  ReviewDetail = "review-detail",
}
