import type {
  OnboardingQuizAnswer,
  OnboardingQuizOption,
  OnboardingQuizQuestion,
  OnboardingQuizSelections,
} from "../../domain/types/onboarding-quiz.types";

const OPTION_LETTERS = ["أ", "ب", "ج", "د", "ه", "و"] as const;

const TRUE_FALSE_LABELS = new Set(["صح", "true", "نعم", "yes"]);
const FALSE_LABELS = new Set(["خطأ", "false", "لا", "no"]);

function normalizeOptionText(text: string): string {
  return text.trim().toLowerCase();
}

export function sortQuestions(questions: OnboardingQuizQuestion[]): OnboardingQuizQuestion[] {
  return [...questions].sort((a, b) => a.order - b.order);
}

export function getOptionLetter(index: number): string {
  return OPTION_LETTERS[index] ?? String(index + 1);
}

export function isTrueFalseQuestion(options: OnboardingQuizOption[]): boolean {
  if (options.length < 2) return false;

  const labels = options.map((option) => normalizeOptionText(option.text));
  const hasTrue = labels.some((label) => TRUE_FALSE_LABELS.has(label));
  const hasFalse = labels.some((label) => FALSE_LABELS.has(label));

  if (options.length === 2) {
    return hasTrue && hasFalse;
  }

  if (options.length <= 3) {
    return (
      hasTrue &&
      hasFalse &&
      labels.every((label) => TRUE_FALSE_LABELS.has(label) || FALSE_LABELS.has(label))
    );
  }

  return false;
}

export function getQuizProgressPercent(currentIndex: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round(((currentIndex + 1) / totalQuestions) * 100);
}

export function canSubmitQuiz(
  questions: OnboardingQuizQuestion[],
  selections: OnboardingQuizSelections,
): boolean {
  return (
    questions.length > 0 &&
    questions.every((question) => Boolean(selections[question.id]))
  );
}

export function buildSubmitAnswers(
  questions: OnboardingQuizQuestion[],
  selections: OnboardingQuizSelections,
): OnboardingQuizAnswer[] {
  return questions.map((question) => ({
    questionId: question.id,
    selectedOptionId: selections[question.id]!,
  }));
}

export function findSelectedOption(
  question: OnboardingQuizQuestion,
  selections: OnboardingQuizSelections,
): OnboardingQuizOption | null {
  const selectedId = selections[question.id];
  if (!selectedId) return null;
  return question.options.find((option) => option.id === selectedId) ?? null;
}
