import type { JourneyStation } from "@/modules/admin/domain/data/journeyEditorData";
import { ROUTES } from "@/shared/infrastructure/config/routes";

/** Route for the station editor screen, or null when no dedicated UI exists yet. */
export function getStationEditorHref(
  journeyId: string,
  station: JourneyStation,
): string | null {
  switch (station.type) {
    case "flashcard":
      return ROUTES.ADMIN.JOURNEY_EDITOR.FLASHCARD_GROUP(journeyId, station.id);
    case "liveBroadcast":
      return ROUTES.ADMIN.JOURNEY_EDITOR.LIVE_BROADCAST_VIEW(journeyId, station.id);
    case "challenge":
      return ROUTES.ADMIN.JOURNEY_EDITOR.CHALLENGE_EDITOR(journeyId, station.id);
    case "exam":
      return ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_EDITOR(journeyId, station.id);
    case "helperFile":
      return null;
    default:
      return null;
  }
}
