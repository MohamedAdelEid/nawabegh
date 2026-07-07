import type { JourneyStation } from "@/modules/admin/domain/data/journeyEditorData";
import { getStationEditorHref } from "@/modules/admin/domain/utils/journeyEditorRoutes";
import { getChallengeIdForStation } from "@/modules/admin/infrastructure/api/challengesApi";
import { getFlashcardDeckIdForStation } from "@/modules/admin/infrastructure/api/flashcardDecksApi";
import { getLiveStationInfo } from "@/modules/admin/infrastructure/api/liveSessionsApi";
import { getStationResourceFileId } from "@/modules/admin/infrastructure/api/stationsApi";
import { resolveQuizIdForStation } from "@/modules/admin/infrastructure/api/quizzesApi";
import type {
  HelperFileManagementRoutes,
  JourneyEditorRoutes,
} from "@/shared/infrastructure/config/scopedDashboardRoutes";

type StationContentLinks = {
  flashcardDeckId: string | null;
  liveSessionId: string | null;
  challengeId: string | null;
  quizId: string | null;
  resourceFileId: string | null;
};

const EMPTY_CONTENT_LINKS: StationContentLinks = {
  flashcardDeckId: null,
  liveSessionId: null,
  challengeId: null,
  quizId: null,
  resourceFileId: null,
};

/** Route for first-time station content setup. */
export function getStationCreateHref(
  journeyEditorRoutes: JourneyEditorRoutes,
  journeyId: string,
  station: JourneyStation,
): string | null {
  switch (station.type) {
    case "flashcard":
      return journeyEditorRoutes.FLASHCARD_GROUP(journeyId, station.id);
    case "liveBroadcast":
      return journeyEditorRoutes.LIVE_BROADCAST_ADD(journeyId, station.id);
    case "challenge":
    case "shortQuiz":
    case "exam":
    case "helperFile":
      return getStationEditorHref(journeyEditorRoutes, journeyId, station);
    default:
      return null;
  }
}

export function getStationOpenHref(
  journeyEditorRoutes: JourneyEditorRoutes,
  helperFileRoutes: HelperFileManagementRoutes,
  journeyId: string,
  station: JourneyStation,
  links: StationContentLinks,
): string | null {
  switch (station.type) {
    case "flashcard":
      return journeyEditorRoutes.FLASHCARD_GROUP(
        journeyId,
        station.id,
        links.flashcardDeckId ?? undefined,
      );
    case "liveBroadcast":
      return journeyEditorRoutes.LIVE_BROADCAST_VIEW(journeyId, station.id);
    case "challenge":
      return journeyEditorRoutes.CHALLENGE_PREVIEW(journeyId, station.id);
    case "shortQuiz":
    case "exam":
      return journeyEditorRoutes.EXAM_EDITOR(journeyId, station.id);
    case "helperFile":
      return journeyEditorRoutes.HELPER_RESOURCE_EDITOR(journeyId, station.id);
    default:
      return null;
  }
}

function stationHasContent(station: JourneyStation, links: StationContentLinks): boolean {
  switch (station.type) {
    case "flashcard":
      return Boolean(links.flashcardDeckId);
    case "liveBroadcast":
      return Boolean(links.liveSessionId);
    case "challenge":
      return Boolean(links.challengeId);
    case "shortQuiz":
    case "exam":
      return Boolean(links.quizId);
    case "helperFile":
      return Boolean(links.resourceFileId);
    default:
      return false;
  }
}

async function resolveStationContentLinks(
  station: JourneyStation,
): Promise<StationContentLinks> {
  switch (station.type) {
    case "flashcard": {
      const result = await getFlashcardDeckIdForStation(station.id);
      return { ...EMPTY_CONTENT_LINKS, flashcardDeckId: result.data };
    }
    case "liveBroadcast": {
      const result = await getLiveStationInfo(station.id);
      return { ...EMPTY_CONTENT_LINKS, liveSessionId: result.data?.liveSessionId ?? null };
    }
    case "challenge": {
      const result = await getChallengeIdForStation(station.id);
      return { ...EMPTY_CONTENT_LINKS, challengeId: result.data };
    }
    case "shortQuiz":
    case "exam": {
      const quizId = await resolveQuizIdForStation(station.id);
      return { ...EMPTY_CONTENT_LINKS, quizId };
    }
    case "helperFile": {
      const result = await getStationResourceFileId(station.id);
      return { ...EMPTY_CONTENT_LINKS, resourceFileId: result.data };
    }
    default:
      return EMPTY_CONTENT_LINKS;
  }
}

/** Resolves the correct destination when a journey station is opened from the editor. */
export async function resolveStationNavigationHref(
  journeyEditorRoutes: JourneyEditorRoutes,
  helperFileRoutes: HelperFileManagementRoutes,
  journeyId: string,
  station: JourneyStation,
): Promise<string | null> {
  const links = await resolveStationContentLinks(station);

  if (stationHasContent(station, links)) {
    return getStationOpenHref(journeyEditorRoutes, helperFileRoutes, journeyId, station, links);
  }

  return getStationCreateHref(journeyEditorRoutes, journeyId, station);
}
