// ─── Station Types ────────────────────────────────────────────────────────────

export type JourneyStationTypeId =
  | "flashcard"
  | "liveBroadcast"
  | "shortQuiz"
  | "challenge"
  | "exam"
  | "helperFile";

export type JourneyStationCompletionRuleId =
  | "viewAll"
  | "passScore"
  | "unlockOnSuccess"
  | "allTasks";

export type JourneyStationAccessId = "open" | "locked" | "subscribersOnly";

export type JourneyStationIconId =
  | "plus"
  | "music"
  | "language"
  | "table"
  | "edit"
  | "flask"
  | "book";

// ─── Station ──────────────────────────────────────────────────────────────────

export interface JourneyStation {
  id: string;
  pathId: string;
  name: string;
  type: JourneyStationTypeId;
  completionRule: JourneyStationCompletionRuleId;
  completionValue?: number | null;
  icon: JourneyStationIconId;
  access: JourneyStationAccessId;
  isSubscribersOnly: boolean;
  order: number;
  autoUnlockOnPreviousComplete?: boolean;
  completionThreshold?: number | null;
  pointReward?: number;
}

// ─── Path ─────────────────────────────────────────────────────────────────────

export interface JourneyPath {
  id: string;
  title: string;
  durationMinutes: number;
  stations: JourneyStation[];
  isCollapsed: boolean;
  order: number;
}

// ─── Journey Stats ────────────────────────────────────────────────────────────

export interface JourneyStats {
  totalPoints: number;
  learningHours: number;
  pathReadinessPct: number;
}

// ─── Journey ──────────────────────────────────────────────────────────────────

export interface JourneyEditorData {
  id: string;
  title: string;
  description: string;
  paths: JourneyPath[];
  stats: JourneyStats;
}

// ─── Add‑Station Form ─────────────────────────────────────────────────────────

export interface AddStationDraft {
  name: string;
  type: JourneyStationTypeId;
  completionRule: JourneyStationCompletionRuleId;
  pathId: string;
  icon: JourneyStationIconId;
  isSubscribersOnly: boolean;
  autoUnlockOnPreviousComplete: boolean;
  completionThreshold: number;
  pointReward: number;
}

// ─── Flashcard ────────────────────────────────────────────────────────────────

export type FlashcardDifficultyId = "easy" | "medium" | "hard";

export interface FlashCard {
  id: string;
  groupId: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficultyId;
  reviewTimeSec: number;
  sourcePdfUrl?: string;
  imageUrl?: string;
}

export interface FlashCardGroup {
  id: string;
  stationId: string;
  title: string;
  subject: string;
  totalCards: number;
  avgDifficulty: FlashcardDifficultyId;
  reviewTimeMin: number;
  completionPct: number;
  cards: FlashCard[];
}

// ─── Live Broadcast Station ───────────────────────────────────────────────────

export interface LiveBroadcastObjective {
  id: string;
  text: string;
}

export interface LiveBroadcastPreTask {
  id: string;
  label: string;
  subtitle: string;
  completed: boolean;
}

export interface LiveBroadcastAttachment {
  id: string;
  name: string;
  type: "pdf" | "pptx" | "mp4" | "other";
  sizeLabel: string;
}

export interface LiveBroadcastStation {
  id: string;
  stationId: string;
  title: string;
  thumbnailUrl?: string;
  description: string;
  presenter: string;
  presenterAvatarUrl?: string;
  presenterTitle?: string;
  durationMin: number;
  date: string;
  time: string;
  broadcastLink: string;
  registeredCount: number;
  isLive: boolean;
  countdown: { hours: number; minutes: number; seconds: number };
  objectives: LiveBroadcastObjective[];
  attachments: LiveBroadcastAttachment[];
  preTasks: LiveBroadcastPreTask[];
  relatedSessionIds: string[];
}

// ─── Challenge Station ────────────────────────────────────────────────────────

export type ChallengeTypeId = "timeChallenge" | "shortQuiz" | "speedChallenge";

export interface ChallengeStation {
  id: string;
  stationId: string;
  challengeType: ChallengeTypeId;
  questionsCount: 5 | 10 | 15 | 20;
  durationMin: number;
  difficulty: FlashcardDifficultyId;
  sourceFiles: LiveBroadcastAttachment[];
}

// ─── Exam Station ─────────────────────────────────────────────────────────────

export type ExamQuestionTypeId = "multipleChoice" | "trueFalse";

export interface ExamQuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  order: number;
  type: ExamQuestionTypeId;
  text: string;
  imageUrl?: string;
  options: ExamQuestionOption[];
  correctOptionId: string;
  points: number;
  difficulty: FlashcardDifficultyId;
}

export interface ExamStation {
  id: string;
  stationId: string;
  name: string;
  durationMin: 5 | 10 | 15 | 30;
  difficulty: FlashcardDifficultyId;
  passingGradePct: number;
  maxAttempts: "one" | "two" | "three" | "unlimited";
  randomOrder: boolean;
  aiSourceFileUrl: string;
  totalPoints: number;
  questions: ExamQuestion[];
  sourceFiles: LiveBroadcastAttachment[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockStations1: JourneyStation[] = [
  {
    id: "st-1",
    pathId: "path-1",
    name: "مقدمة في علم الإدارة",
    type: "liveBroadcast",
    completionRule: "viewAll",
    icon: "edit",
    access: "open",
    isSubscribersOnly: false,
    order: 1,
  },
  {
    id: "st-2",
    pathId: "path-1",
    name: "مصطلحات إدارية هامة",
    type: "flashcard",
    completionRule: "passScore",
    completionValue: 80,
    icon: "book",
    access: "locked",
    isSubscribersOnly: false,
    order: 2,
  },
  {
    id: "st-3",
    pathId: "path-1",
    name: "اختبار تقييم المستوى 1",
    type: "exam",
    completionRule: "unlockOnSuccess",
    icon: "flask",
    access: "locked",
    isSubscribersOnly: false,
    order: 3,
  },
  {
    id: "st-4",
    pathId: "path-1",
    name: "تحدي الإدارة الاستراتيجية",
    type: "challenge",
    completionRule: "viewAll",
    icon: "edit",
    access: "locked",
    isSubscribersOnly: false,
    order: 4,
  },
];

const mockStations2: JourneyStation[] = [
  {
    id: "st-5",
    pathId: "path-2",
    name: "مبادئ التخطيط الاستراتيجي",
    type: "liveBroadcast",
    completionRule: "viewAll",
    icon: "edit",
    access: "locked",
    isSubscribersOnly: false,
    order: 1,
  },
  {
    id: "st-6",
    pathId: "path-2",
    name: "بطاقات التخطيط",
    type: "flashcard",
    completionRule: "passScore",
    completionValue: 70,
    icon: "book",
    access: "locked",
    isSubscribersOnly: false,
    order: 2,
  },
  {
    id: "st-7",
    pathId: "path-2",
    name: "اختبار التخطيط",
    type: "exam",
    completionRule: "unlockOnSuccess",
    icon: "flask",
    access: "locked",
    isSubscribersOnly: false,
    order: 3,
  },
];

export const journeyEditorData: JourneyEditorData = {
  id: "journey-1",
  title: "رحلة التفوق",
  description: "قم بتنظيم الدروس والمحطات التعليمية لبناء تجربة تعلم فريدة.",
  paths: [
    {
      id: "path-1",
      title: "للمسار الأول: أساسيات الإدارة",
      durationMinutes: 120,
      stations: mockStations1,
      isCollapsed: false,
      order: 1,
    },
    {
      id: "path-2",
      title: "القسم الثاني: التخطيط الاستراتيجي",
      durationMinutes: 90,
      stations: mockStations2,
      isCollapsed: true,
      order: 2,
    },
  ],
  stats: {
    totalPoints: 450,
    learningHours: 4.5,
    pathReadinessPct: 75,
  },
};

export const defaultAddStationDraft: AddStationDraft = {
  name: "",
  type: "liveBroadcast",
  completionRule: "viewAll",
  pathId: "path-1",
  icon: "edit",
  isSubscribersOnly: false,
  autoUnlockOnPreviousComplete: true,
  completionThreshold: 100,
  pointReward: 0,
};

// ─── Mock Flashcard Group ─────────────────────────────────────────────────────

export const mockFlashCardGroup: FlashCardGroup = {
  id: "fcg-1",
  stationId: "st-2",
  title: "التاريخ - العصور الحديثة",
  subject: "مادة التاريخ",
  totalCards: 12,
  avgDifficulty: "medium",
  reviewTimeMin: 15,
  completionPct: 70,
  cards: [
    {
      id: "fc-1",
      groupId: "fcg-1",
      front: "من هو مكتشف طريق رأس الرجاء الصالح؟",
      back: "اسم المكتشف وتاريخ الرحلة الاستكشافية...",
      difficulty: "easy",
      reviewTimeSec: 20,
    },
    {
      id: "fc-2",
      groupId: "fcg-1",
      front: "متى بدأت الثورة الصناعية في إنجلترا؟",
      back: "تحديد الفترة الزمنية والتحولات التقنية الرئيسية.",
      difficulty: "hard",
      reviewTimeSec: 90,
    },
    {
      id: "fc-3",
      groupId: "fcg-1",
      front: "ما هي أسباب الثورة الفرنسية؟",
      back: "تحليل العوامل الاقتصادية والاجتماعية التي أدت لاندلاع الثورة.",
      difficulty: "medium",
      reviewTimeSec: 45,
    },
    {
      id: "fc-4",
      groupId: "fcg-1",
      front: "ما هي معاهدة وستفاليا؟",
      back: "أهمية المعاهدة في تأسيس نظام الدول الحديثة...",
      difficulty: "medium",
      reviewTimeSec: 60,
    },
    {
      id: "fc-5",
      groupId: "fcg-1",
      front: "ما هي معاهدة وستفاليا؟",
      back: "أهمية المعاهدة في تأسيس نظام الدول الحديثة...",
      difficulty: "medium",
      reviewTimeSec: 60,
    },
    {
      id: "fc-6",
      groupId: "fcg-1",
      front: "ما هي معاهدة وستفاليا؟",
      back: "أهمية المعاهدة في تأسيس نظام الدول الحديثة...",
      difficulty: "medium",
      reviewTimeSec: 60,
    },
  ],
};

// ─── Mock Live Broadcast ──────────────────────────────────────────────────────

export const mockLiveBroadcastStation: LiveBroadcastStation = {
  id: "lb-1",
  stationId: "st-1",
  title: "أساسيات الكيمياء العضوية: مقدمة في بنية الكربون",
  thumbnailUrl: undefined,
  description:
    "في هذه الحصة التأسيسية سنغوص في عالم الكيمياء العضوية. سنبدأ بفهم الخصائص الفريدة لذرة الكربون...",
  presenter: "أ. سمير محمود",
  presenterTitle: "متخصص في الكيمياء العضوية",
  durationMin: 60,
  date: "16 أكتوبر 2024",
  time: "08:00",
  broadcastLink: "https://zoom.us/j/...",
  registeredCount: 1240,
  isLive: true,
  countdown: { hours: 10, minutes: 45, seconds: 2 },
  objectives: [
    { id: "obj-1", text: "إتقان قواعد تسمية IUPAC للهيدروكربونات." },
    { id: "obj-2", text: "التمييز بين الروابط الهيدروكربونية الأحادية والثنائية وتأثيرها." },
    { id: "obj-3", text: "توزيع إلكترونات ذرة الكربون في كيفية تكوين روابط ساهمة." },
  ],
  attachments: [
    { id: "att-1", name: "ملخص الكربون", type: "pdf", sizeLabel: "1.2 MB" },
    { id: "att-2", name: "اختبار تجريبي", type: "pptx", sizeLabel: "800 KB" },
  ],
  preTasks: [
    { id: "pt-1", label: "مراجعة جدول التكافؤات الأساسي", subtitle: "مراجعة جدول التكافؤات الأساسي", completed: false },
    { id: "pt-2", label: "تحميل ملخص الأساسيات (PDF)", subtitle: "قبل موعد الحصة بساعة على الأقل", completed: false },
    { id: "pt-3", label: "تجهيز الأدوات الهندسية", subtitle: "أوراق ورسم وأدوات هندسية", completed: false },
  ],
  relatedSessionIds: [],
};

// ─── Mock Challenge Station ───────────────────────────────────────────────────

export const mockChallengeStation: ChallengeStation = {
  id: "ch-1",
  stationId: "st-4",
  challengeType: "shortQuiz",
  questionsCount: 10,
  durationMin: 8,
  difficulty: "medium",
  sourceFiles: [
    { id: "sf-1", name: "ملخص القوانين النهائية - الوحدة الأولى.pdf", type: "pdf", sizeLabel: "2.4 MB" },
    { id: "sf-2", name: "العرض التقديمي للتفاعلات الكيميائية.pptx", type: "pptx", sizeLabel: "15.8 MB" },
  ],
};

// ─── Mock Exam Station ────────────────────────────────────────────────────────

export const mockExamStation: ExamStation = {
  id: "ex-1",
  stationId: "st-3",
  name: "مقدمة في تاريخ العمارة",
  durationMin: 15,
  difficulty: "easy",
  passingGradePct: 75,
  maxAttempts: "one",
  randomOrder: true,
  aiSourceFileUrl: "",
  totalPoints: 120,
  sourceFiles: [
    { id: "sf-1", name: "ملخص القوانين النهائية - الوحدة الأولى.pdf", type: "pdf", sizeLabel: "2.4 MB" },
    { id: "sf-2", name: "العرض التقديمي للتفاعلات الكيميائية.pptx", type: "pptx", sizeLabel: "15.8 MB" },
  ],
  questions: [
    {
      id: "q-1",
      examId: "ex-1",
      order: 1,
      type: "multipleChoice",
      text: "ما هي عاصمة المملكة العربية السعودية؟",
      options: [
        { id: "o-a", label: "أ", text: "الرياض" },
        { id: "o-b", label: "ب", text: "جدة" },
        { id: "o-c", label: "ج", text: "مكة" },
        { id: "o-d", label: "د", text: "الدمام" },
      ],
      correctOptionId: "o-a",
      points: 10,
      difficulty: "easy",
    },
    {
      id: "q-2",
      examId: "ex-1",
      order: 2,
      type: "trueFalse",
      text: "هل تعتبر لغة البرمجة بايثون لغة عالية المستوى؟",
      options: [
        { id: "o-t", label: "أ", text: "نعم" },
        { id: "o-f", label: "ب", text: "لا" },
      ],
      correctOptionId: "o-t",
      points: 10,
      difficulty: "easy",
    },
    {
      id: "q-3",
      examId: "ex-1",
      order: 3,
      type: "multipleChoice",
      text: "ما هو الطراز المعماري الذي اشتهر به العصر القوطي؟",
      options: [
        { id: "o-a", label: "أ", text: "العمارة الكلاسيكية" },
        { id: "o-b", label: "ب", text: "العقود المدببة والدعامات الطائرة" },
        { id: "o-c", label: "ج", text: "الأعمدة الكورنثية" },
        { id: "o-d", label: "د", text: "القباب الضخمة" },
      ],
      correctOptionId: "o-b",
      points: 10,
      difficulty: "medium",
    },
    {
      id: "q-4",
      examId: "ex-1",
      order: 4,
      type: "trueFalse",
      text: "تعتبر الأهرامات نموذجاً للعمارة الجنائزية في مصر القديمة.",
      options: [
        { id: "o-t", label: "أ", text: "صح" },
        { id: "o-f", label: "ب", text: "خطأ" },
      ],
      correctOptionId: "o-t",
      points: 10,
      difficulty: "easy",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const COMPLETION_RULE_OPTIONS: {
  id: JourneyStationCompletionRuleId;
  labelKey: string;
}[] = [
  { id: "viewAll", labelKey: "viewAll" },
  { id: "passScore", labelKey: "passScore" },
  { id: "unlockOnSuccess", labelKey: "unlockOnSuccess" },
  { id: "allTasks", labelKey: "allTasks" },
];

export const STATION_ICON_OPTIONS: JourneyStationIconId[] = [
  "plus",
  "music",
  "language",
  "table",
  "edit",
  "flask",
  "book",
];
