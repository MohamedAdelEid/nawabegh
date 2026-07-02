/**
 * Mirrors backend C# enums for community / article editor features.
 * Use for API mapping and UI logic when those flows are wired.
 */

export enum ArticleStatus {
  Draft = 0,
  PendingReview = 1,
  NeedsEdits = 2,
  Published = 3,
  Hidden = 4,
  Removed = 5,
}

export enum CommunityCommentStatus {
  Visible = 0,
  Hidden = 1,
  Deleted = 2,
}

export enum BadgeLevel {
  Bronze = 1,
  Silver = 2,
  Gold = 3,
}

export enum BadgeActivityType {
  Posts = 1,
  Comments = 2,
  Likes = 3,
  CoursesCompleted = 4,
}

export enum CommunityLikeTargetType {
  Article = 0,
  Comment = 1,
}

export enum CommunityModerationMode {
  PreModeration = 0,
  PostModeration = 1,
}
