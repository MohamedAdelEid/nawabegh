export const COMMUNITY_PRIVACY_MODE = {
  Public: 0,
  School: 10,
} as const;

export type CommunityPrivacyMode =
  (typeof COMMUNITY_PRIVACY_MODE)[keyof typeof COMMUNITY_PRIVACY_MODE];

export type CommunitySettings = {
  id: string;
  schoolId: string | null;
  privacyMode: CommunityPrivacyMode;
  moderationMode: number;
  enablePublishing: boolean;
  enableComments: boolean;
  enableLikes: boolean;
  enableRatings: boolean;
  enableFollowing: boolean;
  feedSortDefault: number;
  updatedAt: string;
  updatedByAdminId: string;
};

export type CommunitySettingsUpdatePayload = {
  privacyMode: CommunityPrivacyMode;
  moderationMode: number;
  enablePublishing: boolean;
  enableComments: boolean;
  enableLikes: boolean;
  enableRatings: boolean;
  enableFollowing: boolean;
  feedSortDefault: number;
};

export type CommunitySettingsFormState = {
  privacyMode: CommunityPrivacyMode;
  enablePublishing: boolean;
  enableRatings: boolean;
  enableComments: boolean;
  enableLikes: boolean;
  enableFollowing: boolean;
};
