import type { CommunityBadgeColor, CommunityBadgeRow } from "@/modules/admin/domain/types/communityBadges.types";
import { activityTypeToKey } from "@/modules/admin/domain/utils/communityBadgeMappers";

export type CommunityBadgeAccent = "emerald" | "amber" | "blue";

export function badgeColorToAccent(color: CommunityBadgeColor): CommunityBadgeAccent {
  switch (color) {
    case "bronze":
      return "amber";
    case "silver":
      return "blue";
    case "gold":
    default:
      return "emerald";
  }
}

export function badgeColorToIconBg(color: CommunityBadgeColor): string {
  switch (color) {
    case "bronze":
      return "bg-amber-50";
    case "silver":
      return "bg-blue-50";
    case "gold":
    default:
      return "bg-emerald-50";
  }
}

export function formatBadgeCondition(
  row: Pick<CommunityBadgeRow, "activityType" | "minCount">,
  labels: Record<"posts" | "comments" | "likes" | "lessons", string>,
): string {
  const activityKey = activityTypeToKey(row.activityType);
  const activityLabel = labels[activityKey];
  return `${row.minCount} ${activityLabel}`;
}
