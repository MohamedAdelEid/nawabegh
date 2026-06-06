export const QUIZ_TYPE = {
  stationQuiz: 0,
  finalExam: 1,
} as const;

export type QuizType = (typeof QUIZ_TYPE)[keyof typeof QUIZ_TYPE];

export const SCORE_MODE = {
  bestAttempt: 0,
  latestAttempt: 1,
  firstAttempt: 2,
} as const;

export type ScoreMode = (typeof SCORE_MODE)[keyof typeof SCORE_MODE];

export const QUESTION_SORT = {
  hardestFirst: 0,
  byClassification: 1,
} as const;

export type QuestionSort = (typeof QUESTION_SORT)[keyof typeof QUESTION_SORT];

export const RESULT_STATUS = {
  passedWithExcellence: "PassedWithExcellence",
  passed: "Passed",
  failed: "Failed",
  inProgress: "InProgress",
  notAttempted: "NotAttempted",
} as const;

export type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS];

export const QUESTION_DIFFICULTY = {
  easy: 0,
  medium: 1,
  hard: 2,
} as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTY)[keyof typeof QUESTION_DIFFICULTY];

export type ResultsOverviewTrends = {
  studentsTestedChangePercent: number | null;
  averageScoreChangePercent: number | null;
  passRateChangePercent: number | null;
  averageCompletionMinutesChangePercent: number | null;
};

export type ResultsOverviewSummary = {
  totalStudentsTested: number;
  averageScorePercent: number;
  overallPassRatePercent: number;
  averageCompletionMinutes: number;
  trends: ResultsOverviewTrends | null;
};

export type ResultsOverviewStudentRow = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  schoolName: string;
  gradeName: string;
  representativeScorePercent: number | null;
  attemptCount: number;
  lastActivityAt: string | null;
  resultStatus: ResultStatus;
  quizId: string | null;
  quizTitle: string | null;
  quizType: QuizType | null;
};

export type ResultsOverviewData = {
  summary: ResultsOverviewSummary;
  students: ResultsOverviewStudentRow[];
  isSingleExamView: boolean;
  selectedQuizId: string | null;
  selectedQuizTitle: string | null;
};

export type ResultsOverviewPage = ResultsOverviewData & {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type StudentResultsProfile = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  isActive: boolean;
  gradeName: string;
  schoolName: string;
  username: string;
  points: number | null;
  levelLabel: string;
};

export type StudentInactivityAlert = {
  showAlert: boolean;
  daysSinceLastActivity: number | null;
  message: string;
};

export type StudentResultsKpis = {
  averageScorePercent: number;
  totalAttempts: number;
  attemptsThisMonth: number;
  successfulExams: number;
  failedExams: number;
  lastFailureAt: string | null;
  lastActivityAt: string | null;
  lastActivityLabel: string;
};

export type StudentWeeklyProgressRow = {
  weekLabel: string;
  weekStartUtc: string;
  averageScorePercent: number;
  attemptCount: number;
};

export type StudentParentInfo = {
  parentUserId: string;
  fullName: string;
  phoneNumber: string;
  linkedChildrenCount: number;
};

export type StudentSubscriptionInfo = {
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  latestPackageLabel: string;
  latestEnrollmentAt: string | null;
};

export type StudentRecentAssessment = {
  quizId: string;
  quizTitle: string;
  quizType: QuizType;
  courseTitle: string;
  scorePercent: number | null;
  resultStatus: ResultStatus;
  completedAt: string | null;
};

export type StudentResultsDashboardData = {
  profile: StudentResultsProfile;
  inactivityAlert: StudentInactivityAlert;
  kpis: StudentResultsKpis;
  weeklyProgress: StudentWeeklyProgressRow[];
  parent: StudentParentInfo | null;
  subscription: StudentSubscriptionInfo | null;
  recentAssessments: StudentRecentAssessment[];
};

export type StudentExamRow = {
  quizId: string;
  quizTitle: string;
  quizType: QuizType;
  courseTitle: string;
  bestScorePercent: number | null;
  attemptCount: number;
  lastAttemptAt: string | null;
  resultStatus: ResultStatus;
  canAnalyze: boolean;
};

export type StudentExamsPage = {
  exams: StudentExamRow[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type StudentCertificateRow = {
  certificateId: string;
  courseId: string;
  courseTitle: string;
  certificateTitle: string;
  issueDateUtc: string;
  finalScorePercent: number;
  gradeLabel: string;
  serialNumber: string;
  attemptId: string;
  status: string;
  certificateUrl: string | null;
};

export type StudentCertificatesData = {
  totalCount: number;
  certificates: StudentCertificateRow[];
};

export type QuizAnalysisHeader = {
  quizId: string;
  quizTitle: string;
  quizType: QuizType;
  courseTitle: string;
  examDateUtc: string | null;
  totalStudents: number;
  statusLabel: string;
};

export type QuizAnalysisSummary = {
  averageScorePercent: number;
  passRatePercent: number;
  averageCompletionMinutes: number;
  participationRatePercent: number;
};

export type QuizQuestionPerformanceRow = {
  order: number;
  questionId: string;
  questionTextPreview: string;
  correctAnswerPercent: number;
};

export type QuizGradeDistributionRow = {
  rangeLabel: string;
  minScoreInclusive: number;
  maxScoreInclusive: number;
  studentCount: number;
};

export type QuizQuestionDetailRow = {
  order: number;
  questionId: string;
  questionText: string;
  classification: string;
  difficulty: QuestionDifficulty;
  correctAnswerPercent: number;
};

export type QuizTopStudentRow = {
  rank: number;
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  levelLabel: string;
  scorePercent: number;
  completionMinutes: number;
};

export type QuizAnalysisData = {
  header: QuizAnalysisHeader;
  summary: QuizAnalysisSummary;
  questionPerformance: QuizQuestionPerformanceRow[];
  gradeDistribution: QuizGradeDistributionRow[];
  questionDetails: QuizQuestionDetailRow[];
  topStudents: QuizTopStudentRow[];
  questionPagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
};
