export type ExamDashboardStatus = "Draft" | "Processing" | "Failed" | "Active";

export type QuestionGenerationStatus = 0 | 1 | 2 | 3;

export type ExamsDashboardSummary = {
  totalExams: number;
  totalQuestions: number;
  passedStudents: number;
  issuedCertificates: number;
};

export type ExamsSuccessRate = {
  passedPercentage: number;
  failedPercentage: number;
  notAttemptedPercentage: number;
  passedCount: number;
  failedCount: number;
  notAttemptedCount: number;
};

export type LatestExamRow = {
  quizId: string;
  examName: string;
  quizType: number;
  courseId: string;
  courseTitle: string;
  questionsCount: number;
  participantsCount: number;
  status: ExamDashboardStatus;
  generationStatus: QuestionGenerationStatus;
  createdAt: string;
};

export type ExamsPagination = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type ExamsDashboardData = {
  summary: ExamsDashboardSummary;
  successRate: ExamsSuccessRate;
  latestExams: LatestExamRow[];
  pagination: ExamsPagination;
};

export type FinalExamAttachment = {
  id?: string;
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
  order?: number;
};

export type FinalExamQuestionChoice = {
  id: string;
  text: string;
  imageUrl: string | null;
  isCorrect: boolean;
  order: number;
};

export type FinalExamQuestion = {
  id: string;
  text: string;
  imageUrl: string | null;
  type: number;
  order: number;
  points: number;
  difficulty: number;
  choices: FinalExamQuestionChoice[];
};

export type FinalExamDetail = {
  id: string;
  type: number;
  courseId: string;
  title: string;
  passScore: number;
  maxAttempts: number;
  durationMinutes: number;
  questionCount: number;
  questionGenerationStatus: QuestionGenerationStatus;
  difficulty: number;
  shuffleQuestions: boolean;
  aiSourceFileUrl: string | null;
  quizAttachments: FinalExamAttachment[];
  questions: FinalExamQuestion[];
};

export type FinalExamCreatePayload = {
  name: string;
  numberOfQuestions: number;
  durationMinutes: number;
  passingGrade: number;
  difficulty: number;
  shuffleQuestions: boolean;
  aiSourceFileUrl?: string | null;
  quizAttachments?: FinalExamAttachment[];
};

export type CreatedFinalExam = {
  id: string;
  courseId: string;
  title: string;
};

export type FinalExamFormValues = {
  courseId: string;
  name: string;
  numberOfQuestions: number;
  durationMinutes: number;
  passingGrade: number;
  difficulty: number;
  shuffleQuestions: boolean;
};
