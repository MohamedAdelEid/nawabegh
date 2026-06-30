/**
 * Student knowledge community types.
 *
 * The data shapes are identical to the teacher community feature, so they are
 * re-exported here to keep student imports inside the student domain while
 * avoiding duplicate definitions. Only the draft storage key differs (so a
 * student's in-progress post never collides with a teacher draft).
 */
export type {
  CommunityFeedPost,
  CommunityAuthorSummary,
  CommunityAuthorProfile,
  CommunityPostDraft,
  CommunityFeedState,
  CommunityArticleViewModel,
  CommunityFeedSort,
} from "@/modules/teacher/domain/types/knowledgeCommunity.types";

export const STUDENT_COMMUNITY_POST_DRAFT_STORAGE_KEY = "student-community-post-draft";
