import type {
  SchoolHonoredStudentsParams,
  SchoolLeaderboardParams,
} from "@/modules/school/domain/types/schoolHonorBoard.types";

export const schoolHonorBoardQueryKeys = {
  all: ["school-honor-board"] as const,
  leaderboard: (params: SchoolLeaderboardParams) =>
    [...schoolHonorBoardQueryKeys.all, "leaderboard", params] as const,
  honors: (params: SchoolHonoredStudentsParams) =>
    [...schoolHonorBoardQueryKeys.all, "honors", params] as const,
  honorDetail: (id: string) =>
    [...schoolHonorBoardQueryKeys.all, "honor-detail", id] as const,
  studentSearch: (keyword: string) =>
    [...schoolHonorBoardQueryKeys.all, "student-search", keyword] as const,
};
