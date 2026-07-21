import type {
  QuizQuestionType,
  StudentQuizAttemptStatus,
} from "./short-quiz.enums";

export type ShortQuizOptionDto = {
  id: string;
  text: string;
  imageUrl: string | null;
  order: number;
};

export type ShortQuizQuestionDto = {
  id: string;
  text: string;
  imageUrl: string | null;
  type: QuizQuestionType;
  order: number;
  points: number;
  explanation: string | null;
  options: ShortQuizOptionDto[];
  selectedOptionId: string | null;
  isCorrectSelected: boolean | null;
  correctOptionId: string | null;
};

export type ShortQuizStationIntroDto = {
  stationId: string;
  learningPathId: string;
  learningPathTitle: string;
  name: string;
  quizId: string;
  quizTitle: string;
  passScore: number;
  maxAttempts: number;
  durationMinutes: number;
  questionCount: number;
  totalPoints: number;
  subjectName: string | null;
};

export type ShortQuizAttemptDto = {
  attemptId: string;
  stationId: string;
  quizId: string;
  quizTitle: string;
  passScore: number;
  maxAttempts: number;
  durationMinutes: number;
  status: StudentQuizAttemptStatus;
  attemptNumber: number;
  startedAt: string | null;
  deadlineAt: string | null;
  remainingSeconds: number;
  totalQuestions: number;
  answeredQuestionsCount: number;
  resumeFromQuestionOrder: number;
  scorePercent: number | null;
  passed: boolean | null;
  questions: ShortQuizQuestionDto[];
};

export type ShortQuizCompletionDto = {
  pathCompleted: boolean;
  pathId: string | null;
  pathPointsEarned: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
};

export type ShortQuizStationResultDto = {
  attempt: ShortQuizAttemptDto;
  pointsReward: number;
  stationRank: number | null;
  stationRankTotal: number | null;
  completion: ShortQuizCompletionDto | null;
};

export type SaveShortQuizAnswerPayload = {
  questionId: string;
  selectedOptionId: string;
};
