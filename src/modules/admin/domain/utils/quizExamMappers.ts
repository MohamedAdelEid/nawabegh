import type {
  ExamQuestion,
  ExamQuestionTypeId,
  ExamStation,
  FlashcardDifficultyId,
  LiveBroadcastAttachment,
} from "@/modules/admin/domain/data/journeyEditorData";
import type {
  AddQuizQuestionPayload,
  Quiz,
  QuizAttachmentPayload,
  QuizQuestion,
  UpdateQuizQuestionPayload,
  UpdateQuizSettingsPayload,
} from "@/modules/admin/infrastructure/api/quizzesApi";
import { DifficultyLevel, QuestionType } from "@/shared/domain/enums/cms.enums";

const ARABIC_OPTION_LABELS = ["أ", "ب", "ج", "د", "ه", "و"] as const;

const DIFFICULTY_TO_API: Record<FlashcardDifficultyId, DifficultyLevel> = {
  easy: DifficultyLevel.Easy,
  medium: DifficultyLevel.Medium,
  hard: DifficultyLevel.Hard,
};

const API_TO_DIFFICULTY: Record<number, FlashcardDifficultyId> = {
  [DifficultyLevel.Easy]: "easy",
  [DifficultyLevel.Medium]: "medium",
  [DifficultyLevel.Hard]: "hard",
};

const ATTEMPTS_TO_API: Record<ExamStation["maxAttempts"], number> = {
  one: 1,
  two: 2,
  three: 3,
  unlimited: 0,
};

const API_TO_ATTEMPTS: Record<number, ExamStation["maxAttempts"]> = {
  0: "unlimited",
  1: "one",
  2: "two",
  3: "three",
};

const QUESTION_TYPE_TO_API: Record<ExamQuestionTypeId, QuestionType> = {
  multipleChoice: QuestionType.MultipleChoice,
  trueFalse: QuestionType.TrueOrFalse,
};

function resolveAttachmentType(extension: string): LiveBroadcastAttachment["type"] {
  if (extension === "pdf") return "pdf";
  if (extension === "pptx") return "pptx";
  if (extension === "mp4") return "mp4";
  return "other";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function mapApiQuestionType(type: number): ExamQuestionTypeId {
  return type === QuestionType.TrueOrFalse ? "trueFalse" : "multipleChoice";
}

export function mapQuizQuestionToExamQuestion(question: QuizQuestion, examId: string): ExamQuestion {
  const sortedChoices = [...question.choices].sort((a, b) => a.order - b.order);
  const correctChoice = sortedChoices.find((choice) => choice.isCorrect);

  return {
    id: question.id,
    examId,
    order: question.order,
    type: mapApiQuestionType(question.type),
    text: question.text,
    imageUrl: question.imageUrl || undefined,
    options: sortedChoices.map((choice, index) => ({
      id: choice.id,
      label: ARABIC_OPTION_LABELS[index] ?? String(index + 1),
      text: choice.text,
    })),
    correctOptionId: correctChoice?.id ?? "",
    points: question.points,
    difficulty: API_TO_DIFFICULTY[question.difficulty] ?? "medium",
  };
}

export function mapQuizToExamStation(quiz: Quiz, stationId: string): ExamStation {
  const durationMin = ([5, 10, 15, 30] as const).includes(
    quiz.durationMinutes as 5 | 10 | 15 | 30,
  )
    ? (quiz.durationMinutes as ExamStation["durationMin"])
    : 15;

  const questions = quiz.questions
    .map((question) => mapQuizQuestionToExamQuestion(question, quiz.id))
    .sort((a, b) => a.order - b.order);

  return {
    id: quiz.id,
    stationId: quiz.stationId || stationId,
    name: quiz.title,
    durationMin,
    difficulty: API_TO_DIFFICULTY[quiz.difficulty] ?? "medium",
    passingGradePct: quiz.passScore || 75,
    maxAttempts: API_TO_ATTEMPTS[quiz.maxAttempts] ?? "one",
    randomOrder: quiz.shuffleQuestions,
    aiSourceFileUrl: quiz.aiSourceFileUrl,
    totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
    questions,
    sourceFiles: quiz.quizAttachments.map((attachment, index) => ({
      id: `sf-${index}`,
      name: attachment.fileName,
      type: resolveAttachmentType(attachment.fileExtension),
      sizeLabel: formatFileSize(attachment.fileSizeBytes),
    })),
  };
}

export function mapExamStationToUpdateSettingsPayload(
  exam: ExamStation,
  quizAttachments?: QuizAttachmentPayload[],
): UpdateQuizSettingsPayload {
  return {
    quizId: exam.id,
    title: exam.name.trim(),
    passScore: exam.passingGradePct,
    maxAttempts: ATTEMPTS_TO_API[exam.maxAttempts],
    durationMinutes: exam.durationMin,
    difficulty: DIFFICULTY_TO_API[exam.difficulty],
    shuffleQuestions: exam.randomOrder,
    aiSourceFileUrl:
      quizAttachments?.[0]?.fileUrl?.trim() || exam.aiSourceFileUrl.trim() || "",
    ...(quizAttachments !== undefined ? { quizAttachments } : {}),
  };
}

export function mapExamQuestionToAddPayload(
  quizId: string,
  input: {
    text: string;
    imageUrl?: string;
    type: ExamQuestionTypeId;
    points: number;
    difficulty: FlashcardDifficultyId;
    choices: Array<{ text: string; imageUrl?: string; isCorrect: boolean; order: number }>;
  },
): AddQuizQuestionPayload {
  return {
    quizId,
    text: input.text.trim(),
    imageUrl: input.imageUrl ?? "",
    type: QUESTION_TYPE_TO_API[input.type],
    points: input.points,
    difficulty: DIFFICULTY_TO_API[input.difficulty],
    choices: input.choices.map((choice) => ({
      text: choice.text.trim(),
      imageUrl: choice.imageUrl ?? "",
      isCorrect: choice.isCorrect,
      order: choice.order,
    })),
  };
}

export function mapExamQuestionToUpdatePayload(
  question: ExamQuestion,
  overrides?: Partial<Pick<ExamQuestion, "text" | "type" | "points" | "difficulty">>,
): UpdateQuizQuestionPayload {
  const text = overrides?.text ?? question.text;
  const type = overrides?.type ?? question.type;
  const points = overrides?.points ?? question.points;
  const difficulty = overrides?.difficulty ?? question.difficulty;
  const correctOptionId = question.correctOptionId;

  return {
    questionId: question.id,
    text: text.trim(),
    imageUrl: question.imageUrl ?? "",
    type: QUESTION_TYPE_TO_API[type],
    points,
    difficulty: DIFFICULTY_TO_API[difficulty],
    choices: question.options.map((option, index) => ({
      text: option.text.trim(),
      imageUrl: "",
      isCorrect: option.id === correctOptionId,
      order: index,
    })),
  };
}
