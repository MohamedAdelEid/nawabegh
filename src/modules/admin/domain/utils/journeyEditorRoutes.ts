import type { JourneyStation } from "@/modules/admin/domain/data/journeyEditorData";
import type { JourneyEditorRoutes } from "@/shared/infrastructure/config/scopedDashboardRoutes";

/** Route for the station editor screen, or null when no dedicated UI exists yet. */
export function getStationEditorHref(
  journeyEditorRoutes: JourneyEditorRoutes,
  journeyId: string,
  station: JourneyStation,
): string | null {
  switch (station.type) {
    case "flashcard":
      return journeyEditorRoutes.FLASHCARD_GROUP(journeyId, station.id);
    case "liveBroadcast":
      return journeyEditorRoutes.LIVE_BROADCAST_VIEW(journeyId, station.id);
    case "challenge":
      return journeyEditorRoutes.CHALLENGE_EDITOR(journeyId, station.id);
    case "shortQuiz":
    case "exam":
      return journeyEditorRoutes.EXAM_EDITOR(journeyId, station.id);
    case "helperFile":
      return journeyEditorRoutes.HELPER_RESOURCE_EDITOR(journeyId, station.id);
    default:
      return null;
  }
}
