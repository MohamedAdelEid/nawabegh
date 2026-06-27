/** Resource files & access policies — mirrors Nawabegh.API content domain. */

export enum ResourceFileType {
  ForStation = 0,
  ForCourse = 1,
}

/** Resource file access (separate from `StationAccessPolicy`). */
export enum AccessPolicy {
  All = 0,
  Subscribers = 1,
}
