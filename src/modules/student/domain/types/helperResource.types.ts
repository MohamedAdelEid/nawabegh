export type ResourceFileMediaKind =
  | "Pdf"
  | "Presentation"
  | "Word"
  | "Image"
  | "Video"
  | "Other";

export type StudentAccessPolicy = "All" | "Subscribers";

export interface HelperResourceReadingProgressDto {
  resourceFileId: string;
  readPercentage: number;
  lastPageOrSlide: number;
  lastSyncedAt: string;
}

export interface StudentHelperResourceFileDto {
  id: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileType: string;
  mediaKind: ResourceFileMediaKind;
  category: string | null;
  fileSizeBytes: number | null;
  accessPolicy: StudentAccessPolicy;
  createdAt: string | null;
  readingProgress: HelperResourceReadingProgressDto | null;
}

export interface StudentHelperResourceStationDto {
  stationId: string;
  stationName: string;
  learningPathTitle: string;
  files: StudentHelperResourceFileDto[];
}
