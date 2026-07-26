import { getSchoolLeaderboardDashboard } from "@/modules/school/infrastructure/api/schoolHonorBoardApi";
import type { SchoolLeaderboardDashboard } from "@/modules/school/domain/types/schoolHonorBoard.types";
import {
  mapLeaderboardWidgetDto,
} from "@/modules/student/domain/home/student-home.utils";
import type { LeaderboardWidgetDto } from "@/modules/student/domain/types/student-home.types";
import { resolveApiData } from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export type StudentSchoolLeaderPodiumEntry = {
  rank: number;
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  points: number;
  gradeLabel: string;
};

export type StudentSchoolLeadersBoard = {
  topThree: StudentSchoolLeaderPodiumEntry[];
  others: StudentSchoolLeaderPodiumEntry[];
  totalCompetitors: number | null;
};

function fromWidget(widget: LeaderboardWidgetDto): StudentSchoolLeadersBoard {
  return {
    topThree: widget.topThree.map((entry) => ({
      rank: entry.rank,
      userId: entry.userId,
      fullName: entry.fullName,
      profileImageUrl: entry.profileImageUrl,
      points: entry.currentPoints,
      gradeLabel: "",
    })),
    others: [],
    totalCompetitors: null,
  };
}

function fromSchoolBoard(board: SchoolLeaderboardDashboard): StudentSchoolLeadersBoard {
  const mapEntry = (entry: SchoolLeaderboardDashboard["topThree"][number]) => ({
    rank: entry.rank,
    userId: entry.userId || entry.studentProfileId,
    fullName: entry.fullName,
    profileImageUrl: entry.profileImageUrl,
    points: entry.score,
    gradeLabel: entry.gradeLabel,
  });

  return {
    topThree: board.topThree.map(mapEntry),
    others: board.others.map(mapEntry),
    totalCompetitors: board.meta.totalCompetitors || board.kpis.totalParticipants || null,
  };
}

async function tryMySchoolLeaderboardEndpoint(): Promise<LeaderboardWidgetDto | null> {
  try {
    const response = await httpClient.get<unknown>({
      url: "leaderboard/my-school",
      params: { pageNumber: 1, pageSize: 20 },
    });
    const mapped = mapLeaderboardWidgetDto(resolveApiData(response));
    if (mapped.topThree.length === 0 && !mapped.currentUser) return null;
    return mapped;
  } catch {
    return null;
  }
}

async function trySchoolHonorBoardDashboard(): Promise<SchoolLeaderboardDashboard | null> {
  try {
    return await getSchoolLeaderboardDashboard({
      period: "all",
      metric: "points",
      pageNumber: 1,
      pageSize: 7,
    });
  } catch {
    return null;
  }
}

/**
 * School-scoped leaders for the signed-in student's school (متصدرين المدرسة).
 * Uses `leaderboard/my-school` when available; otherwise the school honor-roll
 * dashboard when the API allows the student to read their own school board.
 */
export async function getStudentSchoolLeadersBoard(): Promise<StudentSchoolLeadersBoard> {
  const mySchoolWidget = await tryMySchoolLeaderboardEndpoint();
  if (mySchoolWidget && mySchoolWidget.topThree.length > 0) {
    return fromWidget(mySchoolWidget);
  }

  const schoolBoard = await trySchoolHonorBoardDashboard();
  if (schoolBoard && schoolBoard.topThree.length > 0) {
    return fromSchoolBoard(schoolBoard);
  }

  if (mySchoolWidget) return fromWidget(mySchoolWidget);

  return { topThree: [], others: [], totalCompetitors: null };
}
