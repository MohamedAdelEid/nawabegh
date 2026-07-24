import { QuestionType } from "@/shared/domain/enums/question.enums";

export type AdminOnboardingQuizOption = {
  id?: string;
  order: number;
  text: string;
  isCorrect: boolean;
};

export type AdminOnboardingQuizQuestion = {
  id?: string;
  order: number;
  text: string;
  type: QuestionType;
  points: number;
  options: AdminOnboardingQuizOption[];
};

export type AdminOnboardingQuiz = {
  educationLevelId: number;
  educationLevelNameAr: string;
  educationLevelNameEn: string;
  gradeId: number;
  gradeNameAr: string;
  gradeNameEn: string;
  term: number;
  questionCount: number;
  questions: AdminOnboardingQuizQuestion[];
};

export type AdminOnboardingQuizScope = {
  educationLevelId: number;
  gradeId: number;
  term: number;
};

export type UpdateAdminOnboardingQuizOptionPayload = {
  order: number;
  text: string;
  isCorrect: boolean;
};

export type UpdateAdminOnboardingQuizQuestionPayload = {
  id?: string;
  order: number;
  text: string;
  type: number;
  points?: number;
  options: UpdateAdminOnboardingQuizOptionPayload[];
};

export type UpdateAdminOnboardingQuizPayload = {
  educationLevelId: number;
  gradeId: number;
  term: number;
  questions: UpdateAdminOnboardingQuizQuestionPayload[];
};
