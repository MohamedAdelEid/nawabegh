import {
  BadgeActivityType,
  BadgeLevel,
} from "@/modules/admin/domain/entities/community.enums";
import type {
  CommunityBadgeColor,
  CommunityBadgePayload,
} from "@/modules/admin/domain/types/communityBadges.types";

export type CommunityBadgeActivityKey = "posts" | "comments" | "likes" | "lessons";

const COLOR_TO_LEVEL: Record<CommunityBadgeColor, BadgeLevel> = {
  bronze: BadgeLevel.Bronze,
  silver: BadgeLevel.Silver,
  gold: BadgeLevel.Gold,
};

/** Hex codes sent to the CommunityBadges create/update API. */
const COLOR_TO_HEX: Record<CommunityBadgeColor, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#C7AF6E",
};

const HEX_TO_COLOR = Object.fromEntries(
  Object.entries(COLOR_TO_HEX).map(([key, hex]) => [hex.toLowerCase(), key as CommunityBadgeColor]),
) as Record<string, CommunityBadgeColor>;

const LEVEL_TO_COLOR: Record<number, CommunityBadgeColor> = {
  [BadgeLevel.Bronze]: "bronze",
  [BadgeLevel.Silver]: "silver",
  [BadgeLevel.Gold]: "gold",
};

const ACTIVITY_KEY_TO_TYPE: Record<CommunityBadgeActivityKey, BadgeActivityType> = {
  posts: BadgeActivityType.Posts,
  comments: BadgeActivityType.Comments,
  likes: BadgeActivityType.Likes,
  lessons: BadgeActivityType.CoursesCompleted,
};

const ACTIVITY_TYPE_TO_KEY: Record<number, CommunityBadgeActivityKey> = {
  [BadgeActivityType.Posts]: "posts",
  [BadgeActivityType.Comments]: "comments",
  [BadgeActivityType.Likes]: "likes",
  [BadgeActivityType.CoursesCompleted]: "lessons",
};

export function normalizeBadgeColor(value: string | null | undefined): CommunityBadgeColor {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "bronze" || normalized === "silver" || normalized === "gold") {
    return normalized;
  }
  const hexKey = normalized.startsWith("#") ? normalized : `#${normalized}`;
  if (HEX_TO_COLOR[hexKey]) {
    return HEX_TO_COLOR[hexKey];
  }
  return "gold";
}

export function colorToHex(color: CommunityBadgeColor): string {
  return COLOR_TO_HEX[color];
}

export function colorToLevel(color: CommunityBadgeColor): number {
  return COLOR_TO_LEVEL[color];
}

export function levelToColor(level: number): CommunityBadgeColor {
  return LEVEL_TO_COLOR[level] ?? "gold";
}

export function activityKeyToType(key: CommunityBadgeActivityKey): number {
  return ACTIVITY_KEY_TO_TYPE[key];
}

export function activityTypeToKey(type: number): CommunityBadgeActivityKey {
  return ACTIVITY_TYPE_TO_KEY[type] ?? "posts";
}

export function buildCommunityBadgePayload(input: {
  name: string;
  description: string;
  color: CommunityBadgeColor;
  activity: CommunityBadgeActivityKey;
  minCount: number;
  iconUrl: string;
}): CommunityBadgePayload {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    color: colorToHex(input.color),
    level: colorToLevel(input.color),
    activityType: activityKeyToType(input.activity),
    minCount: input.minCount,
    iconUrl: input.iconUrl,
  };
}
