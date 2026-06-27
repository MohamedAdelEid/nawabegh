/** Course lifecycle & access — mirrors Nawabegh.API course domain. */

export enum CourseAccessType {
  Free = 0,
  Paid = 1,
  Subscription = 2,
}

export enum CourseStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Archived = 4,
}

export enum CourseTerm {
  FirstTerm = 1,
  SecondTerm = 2,
  ThirdTerm = 3,
}

/** Bitmask flags — combine with bitwise OR for reject payloads. */
export enum CourseRejectionReasons {
  None = 0,
  IncompleteContent = 1,
  PoorAudioVideo = 2,
  ContentQuality = 4,
  PolicyViolation = 8,
  CopyrightIssue = 16,
  InsufficientSources = 32,
}
