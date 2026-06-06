export type CommunityBadgeColor = "bronze" | "silver" | "gold";

export type CommunityBadgeRow = {
  id: string;
  name: string;
  description: string;
  color: CommunityBadgeColor;
  level: number;
  activityType: number;
  minCount: number;
  iconUrl: string | null;
  enabled: boolean;
  earnerCount: number;
};

export type CommunityBadgePayload = {
  name: string;
  description: string;
  color: string;
  level: number;
  activityType: number;
  minCount: number;
  iconUrl: string;
};

export type CommunityBadgeTablePage = {
  rows: CommunityBadgeRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
