import { StationType } from "@/shared/domain/enums/learning-path.enums";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type GetStudentStationHrefParams = {
  stationId: string;
  stationType: StationType;
  courseId?: string | null;
  pathId?: string | null;
};

export function getStudentStationHref({
  stationId,
  stationType,
  courseId,
  pathId,
}: GetStudentStationHrefParams): string | null {
  const params = new URLSearchParams();
  if (courseId) params.set("courseId", courseId);
  if (pathId) params.set("pathId", pathId);
  const qs = params.toString();
  const withQuery = (path: string) => (qs ? `${path}?${qs}` : path);

  switch (stationType) {
    case StationType.Flashcards:
      return withQuery(ROUTES.USER.STUDENT.STATION_FLASHCARDS(stationId));
    case StationType.LiveStream:
      return withQuery(ROUTES.USER.STUDENT.LIVE_STATION(stationId));
    case StationType.ShortQuiz:
      return withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ(stationId));
    case StationType.Challenge:
      return withQuery(ROUTES.USER.STUDENT.CHALLENGE_STATION(stationId));
    case StationType.HelperResource:
      return withQuery(ROUTES.USER.STUDENT.HELPER_RESOURCE(stationId));
    default:
      return null;
  }
}
