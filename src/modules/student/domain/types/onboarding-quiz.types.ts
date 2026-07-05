export type OnboardingQuizOption = {
  id: string;
  order: number;
  text: string;
};

export type OnboardingQuizQuestion = {
  id: string;
  order: number;
  text: string;
  options: OnboardingQuizOption[];
};

export type OnboardingQuizResponse = {
  isCompleted: boolean;
  educationLevelId: number;
  gradeId: number;
  term: number;
  correctCount: number | null;
  pointsEarned: number | null;
  scorePercent: number | null;
  questions: OnboardingQuizQuestion[];
};

export type OnboardingQuizAnswer = {
  questionId: string;
  selectedOptionId: string;
};

export type SubmitOnboardingQuizResponse = {
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  pointsEarned: number;
  totalPoints: number;
  starterCourseId: string | null;
  enrollmentSuccess: boolean;
};

export type StudentProfileSummary = {
  onboardingQuizCompleted: boolean;
};

export type OnboardingQuizSelections = Record<string, string>;
