import type {
  CourseCurriculumItem,
  CourseCurriculumUnit,
} from "@/modules/admin/domain/data/courseManagementData";
import type { CourseLearningPath } from "@/modules/admin/infrastructure/api/learningPathsApi";
import { StationType } from "@/shared/domain/enums/cms.enums";
import { learningPathStatusToCourseStatusId } from "@/shared/domain/enums/cms.mappers";

export type CourseCurriculumStationTypeKey =
  | "liveBroadcast"
  | "flashcard"
  | "shortQuiz"
  | "challenge"
  | "helperFile"
  | "recordedLecture";

export function stationTypeToCurriculumKey(type: number): CourseCurriculumStationTypeKey {
  switch (type) {
    case StationType.Flashcards:
      return "flashcard";
    case StationType.ShortQuiz:
      return "shortQuiz";
    case StationType.Challenge:
      return "challenge";
    case StationType.HelperResource:
      return "helperFile";
    case StationType.RecordedLecture:
      return "recordedLecture";
    case StationType.LiveStream:
    default:
      return "liveBroadcast";
  }
}

function stationTypeToItemType(type: number): CourseCurriculumItem["type"] {
  switch (type) {
    case StationType.ShortQuiz:
    case StationType.Challenge:
      return "quiz";
    case StationType.HelperResource:
      return "pdf";
    default:
      return "video";
  }
}

export function mapLearningPathsToCurriculum(
  learningPaths: CourseLearningPath[],
  getStationLabel: (type: number) => string,
): CourseCurriculumUnit[] {
  return [...learningPaths]
    .sort((a, b) => a.order - b.order)
    .map((path) => ({
      id: path.id,
      title: path.title || "—",
      statusId: learningPathStatusToCourseStatusId(path.status),
      expanded: true,
      items: [...path.stations]
        .sort((a, b) => a.order - b.order)
        .map((station, stationIndex) => ({
          id: station.id,
          title: station.name || "—",
          type: stationTypeToItemType(station.type),
          stationType: station.type,
          durationLabel: `#${station.order || stationIndex + 1}`,
          metaLabel: getStationLabel(station.type),
        })),
    }));
}

export function countStationsInLearningPaths(learningPaths: CourseLearningPath[]): number {
  return learningPaths.reduce((sum, path) => sum + path.stations.length, 0);
}
