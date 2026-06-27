/**
 * @deprecated Import from the grouped enum file, e.g. `course.enums.ts`.
 * This barrel is kept for backward compatibility.
 * @see ADMIN_CMS_CONTENT_CREATION_GUIDE.md §3
 */

export {
  CourseAccessType,
  CourseRejectionReasons,
  CourseStatus,
  CourseTerm,
} from "./course.enums";

export {
  CompletionRuleType,
  LearningPathStatus,
  LiveSessionRuntimeMode,
  LiveSessionStatus,
  StationAccessPolicy,
  StationType,
} from "./learning-path.enums";

export {
  ChallengeType,
  DifficultyLevel,
  QuestionGenerationStatus,
  QuestionType,
} from "./question.enums";

export { AccessPolicy, ResourceFileType } from "./resource.enums";
