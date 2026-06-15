import {
  COMMUNITY_PRIVACY_MODE,
  type CommunitySettings,
  type CommunitySettingsFormState,
  type CommunitySettingsUpdatePayload,
} from "@/modules/admin/domain/types/communitySettings.types";

export function mapCommunitySettingsToForm(settings: CommunitySettings): CommunitySettingsFormState {
  return {
    privacyMode: settings.privacyMode,
    enablePublishing: settings.enablePublishing,
    enableRatings: settings.enableRatings,
    enableComments: settings.enableComments,
    enableLikes: settings.enableLikes,
    enableFollowing: settings.enableFollowing,
  };
}

export function mapCommunitySettingsFormToUpdatePayload(
  form: CommunitySettingsFormState,
  settings: CommunitySettings,
): CommunitySettingsUpdatePayload {
  return {
    privacyMode: form.privacyMode,
    moderationMode: settings.moderationMode,
    enablePublishing: form.enablePublishing,
    enableComments: form.enableComments,
    enableLikes: form.enableLikes,
    enableRatings: form.enableRatings,
    enableFollowing: form.enableFollowing,
    feedSortDefault: settings.feedSortDefault,
  };
}

export function isSchoolPrivacyMode(privacyMode: number): boolean {
  return privacyMode === COMMUNITY_PRIVACY_MODE.School;
}
