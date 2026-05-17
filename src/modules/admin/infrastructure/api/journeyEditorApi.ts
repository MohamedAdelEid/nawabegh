import type {
  AddStationDraft,
  ChallengeStation,
  ExamQuestion,
  ExamStation,
  FlashCard,
  FlashCardGroup,
  JourneyEditorData,
  JourneyPath,
  JourneyStation,
  LiveBroadcastStation,
} from "@/modules/admin/domain/data/journeyEditorData";
import {
  defaultAddStationDraft,
  journeyEditorData,
  mockChallengeStation,
  mockExamStation,
  mockFlashCardGroup,
  mockLiveBroadcastStation,
} from "@/modules/admin/domain/data/journeyEditorData";

export interface JourneyEditorApiResult<T> {
  status: "ok" | "error";
  message?: string;
  errorMessage?: string;
  data: T | null;
}

function ok<T>(data: T): JourneyEditorApiResult<T> {
  return { status: "ok", data };
}

function err<T>(message: string): JourneyEditorApiResult<T> {
  return { status: "error", errorMessage: message, data: null };
}

function delay(ms = 400) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ─── Journey ──────────────────────────────────────────────────────────────────

export async function getJourneyEditor(
  journeyId: string,
): Promise<JourneyEditorApiResult<JourneyEditorData>> {
  await delay();
  if (journeyId !== journeyEditorData.id) return err("Journey not found");
  return ok(structuredClone(journeyEditorData));
}

export async function saveJourneyChanges(
  journeyId: string,
): Promise<JourneyEditorApiResult<{ journeyId: string }>> {
  await delay();
  if (journeyId !== journeyEditorData.id) return err("Journey not found");
  return ok({ journeyId });
}

// ─── Paths ────────────────────────────────────────────────────────────────────

export async function addJourneyPath(
  journeyId: string,
  title: string,
): Promise<JourneyEditorApiResult<JourneyPath>> {
  await delay();
  if (!title.trim()) return err("Path title is required");
  const newPath: JourneyPath = {
    id: `path-${Date.now()}`,
    title,
    durationMinutes: 0,
    stations: [],
    isCollapsed: false,
    order: journeyEditorData.paths.length + 1,
  };
  journeyEditorData.paths.push(newPath);
  return ok(structuredClone(newPath));
}

// ─── Stations ─────────────────────────────────────────────────────────────────

export async function addJourneyStation(
  journeyId: string,
  draft: AddStationDraft,
): Promise<JourneyEditorApiResult<JourneyStation>> {
  await delay();
  if (!draft.name.trim()) return err("Station name is required");
  const path = journeyEditorData.paths.find((p) => p.id === draft.pathId);
  if (!path) return err("Path not found");

  const newStation: JourneyStation = {
    id: `st-${Date.now()}`,
    pathId: draft.pathId,
    name: draft.name,
    type: draft.type,
    completionRule: draft.completionRule,
    icon: draft.icon,
    access: "locked",
    isSubscribersOnly: draft.isSubscribersOnly,
    order: path.stations.length + 1,
  };
  path.stations.push(newStation);
  return ok(structuredClone(newStation));
}

export async function deleteJourneyStation(
  stationId: string,
): Promise<JourneyEditorApiResult<{ stationId: string }>> {
  await delay();
  for (const path of journeyEditorData.paths) {
    const idx = path.stations.findIndex((s) => s.id === stationId);
    if (idx !== -1) {
      path.stations.splice(idx, 1);
      return ok({ stationId });
    }
  }
  return err("Station not found");
}

// ─── Flashcard Group ──────────────────────────────────────────────────────────

export async function getFlashCardGroup(
  stationId: string,
): Promise<JourneyEditorApiResult<FlashCardGroup>> {
  await delay();
  if (mockFlashCardGroup.stationId !== stationId) {
    return ok({ ...mockFlashCardGroup, stationId });
  }
  return ok(structuredClone(mockFlashCardGroup));
}

export async function addFlashCard(
  groupId: string,
  card: Omit<FlashCard, "id" | "groupId">,
): Promise<JourneyEditorApiResult<FlashCard>> {
  await delay();
  const newCard: FlashCard = {
    id: `fc-${Date.now()}`,
    groupId,
    ...card,
  };
  mockFlashCardGroup.cards.push(newCard);
  mockFlashCardGroup.totalCards = mockFlashCardGroup.cards.length;
  return ok(structuredClone(newCard));
}

export async function deleteFlashCard(
  cardId: string,
): Promise<JourneyEditorApiResult<{ cardId: string }>> {
  await delay();
  const idx = mockFlashCardGroup.cards.findIndex((c) => c.id === cardId);
  if (idx !== -1) {
    mockFlashCardGroup.cards.splice(idx, 1);
    mockFlashCardGroup.totalCards = mockFlashCardGroup.cards.length;
  }
  return ok({ cardId });
}

export async function generateFlashCardsWithAi(payload: {
  groupId: string;
  difficulty: string;
  count: number;
  reviewTimeSec: number;
}): Promise<JourneyEditorApiResult<FlashCard[]>> {
  await delay(1200);
  const generated: FlashCard[] = Array.from({ length: payload.count }, (_, i) => ({
    id: `fc-ai-${Date.now()}-${i}`,
    groupId: payload.groupId,
    front: `سؤال مولّد بالذكاء الاصطناعي ${i + 1}`,
    back: `الإجابة النموذجية للسؤال ${i + 1}`,
    difficulty: payload.difficulty as FlashCard["difficulty"],
    reviewTimeSec: payload.reviewTimeSec,
  }));
  return ok(generated);
}

// ─── Live Broadcast ───────────────────────────────────────────────────────────

export async function getLiveBroadcastStation(
  stationId: string,
): Promise<JourneyEditorApiResult<LiveBroadcastStation>> {
  await delay();
  return ok({ ...structuredClone(mockLiveBroadcastStation), stationId });
}

export async function saveLiveBroadcastStation(
  stationId: string,
  payload: Partial<LiveBroadcastStation>,
): Promise<JourneyEditorApiResult<LiveBroadcastStation>> {
  await delay();
  return ok({ ...mockLiveBroadcastStation, ...payload, stationId, id: `lb-${Date.now()}` });
}

// ─── Challenge ────────────────────────────────────────────────────────────────

export async function getChallengeStation(
  stationId: string,
): Promise<JourneyEditorApiResult<ChallengeStation>> {
  await delay();
  return ok({ ...structuredClone(mockChallengeStation), stationId });
}

export async function saveChallengeStation(
  stationId: string,
  payload: Partial<ChallengeStation>,
): Promise<JourneyEditorApiResult<ChallengeStation>> {
  await delay();
  return ok({ ...mockChallengeStation, ...payload, stationId });
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export async function getExamStation(
  stationId: string,
): Promise<JourneyEditorApiResult<ExamStation>> {
  await delay();
  return ok({ ...structuredClone(mockExamStation), stationId });
}

export async function saveExamStation(
  stationId: string,
  payload: Partial<ExamStation>,
): Promise<JourneyEditorApiResult<ExamStation>> {
  await delay();
  return ok({ ...mockExamStation, ...payload, stationId });
}

export async function addExamQuestion(
  examId: string,
  question: Omit<ExamQuestion, "id" | "examId" | "order">,
): Promise<JourneyEditorApiResult<ExamQuestion>> {
  await delay();
  const newQ: ExamQuestion = {
    id: `q-${Date.now()}`,
    examId,
    order: mockExamStation.questions.length + 1,
    ...question,
  };
  mockExamStation.questions.push(newQ);
  return ok(structuredClone(newQ));
}

export async function deleteExamQuestion(
  questionId: string,
): Promise<JourneyEditorApiResult<{ questionId: string }>> {
  await delay();
  const idx = mockExamStation.questions.findIndex((q) => q.id === questionId);
  if (idx !== -1) mockExamStation.questions.splice(idx, 1);
  return ok({ questionId });
}

export async function generateExamQuestionsWithAi(payload: {
  examId: string;
  difficulty: string;
  count: number;
}): Promise<JourneyEditorApiResult<ExamQuestion[]>> {
  await delay(1200);
  const generated: ExamQuestion[] = Array.from({ length: payload.count }, (_, i) => ({
    id: `q-ai-${Date.now()}-${i}`,
    examId: payload.examId,
    order: mockExamStation.questions.length + i + 1,
    type: "multipleChoice" as const,
    text: `سؤال مولّد بالذكاء الاصطناعي ${i + 1}`,
    options: [
      { id: "o-a", label: "أ", text: "الخيار الأول" },
      { id: "o-b", label: "ب", text: "الخيار الثاني" },
      { id: "o-c", label: "ج", text: "الخيار الثالث" },
      { id: "o-d", label: "د", text: "الخيار الرابع" },
    ],
    correctOptionId: "o-a",
    points: 10,
    difficulty: payload.difficulty as ExamQuestion["difficulty"],
  }));
  return ok(generated);
}

export { defaultAddStationDraft };
