"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { helperResourceStationQueryKeys } from "@/modules/student/application/constants/helperResourceStationQueryKeys";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import type { HelperResourceMediaFilter } from "@/modules/student/domain/helper-resource/helper-resource.utils";
import {
  getViewerKind,
  triggerBrowserDownload,
} from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type {
  ResourceFileMediaKind,
  StudentHelperResourceFileDto,
} from "@/modules/student/domain/types/helperResource.types";
import {
  completeHelperResourceStation,
  getHelperResourceFile,
  getHelperResourceStation,
  saveHelperResourceProgress,
} from "@/modules/student/infrastructure/api/helperResourceStation.api";
import { getCourseProgress } from "@/modules/student/infrastructure/api/progress.api";
import { resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";

const PROGRESS_DEBOUNCE_MS = 2500;

export type HelperResourceViewMode = "grid" | "viewer";

type UseHelperResourceStationOptions = {
  stationId: string;
  courseId?: string | null;
  pathId?: string | null;
  initialFileId?: string | null;
};

export function useHelperResourceStation({
  stationId,
  courseId,
  pathId,
  initialFileId,
}: UseHelperResourceStationOptions) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [mediaFilter, setMediaFilter] =
    useState<HelperResourceMediaFilter>("all");
  const [viewMode, setViewMode] = useState<HelperResourceViewMode>(
    initialFileId ? "viewer" : "grid",
  );
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialFileId ?? null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedRef = useRef<string>("");

  const mediaKindParam =
    mediaFilter === "all" ? undefined : (mediaFilter as ResourceFileMediaKind);

  const stationQuery = useQuery({
    queryKey: helperResourceStationQueryKeys.station(stationId, mediaFilter),
    queryFn: () =>
      getHelperResourceStation(stationId, { mediaKind: mediaKindParam }),
    enabled: Boolean(stationId),
    staleTime: 30_000,
  });

  const courseProgressQuery = useQuery({
    queryKey: progressQueryKeys.courseProgress(courseId ?? ""),
    queryFn: () => getCourseProgress(courseId!),
    enabled: Boolean(courseId),
    staleTime: 60_000,
  });

  const fileQuery = useQuery({
    queryKey: helperResourceStationQueryKeys.file(activeFileId ?? ""),
    queryFn: () => getHelperResourceFile(activeFileId!),
    enabled: Boolean(activeFileId) && viewMode === "viewer",
    staleTime: 60_000,
  });

  const imagesQuery = useQuery({
    queryKey: helperResourceStationQueryKeys.station(stationId, "Image"),
    queryFn: () => getHelperResourceStation(stationId, { mediaKind: "Image" }),
    enabled:
      Boolean(stationId) &&
      viewMode === "viewer" &&
      (fileQuery.data?.mediaKind === "Image" ||
        stationQuery.data?.files.some((f) => f.id === activeFileId && f.mediaKind === "Image")),
    staleTime: 60_000,
  });

  const files = stationQuery.data?.files ?? [];
  const activeFile: StudentHelperResourceFileDto | null =
    fileQuery.data ??
    files.find((file) => file.id === activeFileId) ??
    null;

  const imageFiles = useMemo(() => {
    if (imagesQuery.data?.files?.length) return imagesQuery.data.files;
    return files.filter((file) => file.mediaKind === "Image");
  }, [files, imagesQuery.data?.files]);

  const header = useMemo(() => {
    const pathProgress =
      courseProgressQuery.data?.paths.find((path) => path.pathId === pathId) ??
      null;

    return {
      stationTitle: stationQuery.data?.stationName ?? "",
      learningPathTitle: stationQuery.data?.learningPathTitle ?? "",
      pathProgressPercent:
        pathProgress?.stationProgressPercent ??
        courseProgressQuery.data?.courseProgressPercent ??
        0,
      currentLevel: 1,
      avatarUrl: session?.user?.image ?? null,
      displayName: session?.user?.name ?? "",
    };
  }, [
    courseProgressQuery.data,
    pathId,
    session?.user?.image,
    session?.user?.name,
    stationQuery.data?.learningPathTitle,
    stationQuery.data?.stationName,
  ]);


  const openFile = useCallback((file: StudentHelperResourceFileDto) => {
    setActionError(null);
    setActiveFileId(file.id);
    setViewMode("viewer");
  }, []);

  const closeViewer = useCallback(() => {
    setViewMode("grid");
    setActiveFileId(null);
  }, []);

  const downloadFile = useCallback((file: StudentHelperResourceFileDto) => {
    const url = resolveProtectedFileUrl(file.fileUrl) ?? file.fileUrl;
    if (!url) return;
    triggerBrowserDownload(url, file.fileName);
  }, []);

  const syncProgress = useCallback(
    (readPercentage: number, lastPageOrSlide: number) => {
      if (!activeFileId) return;
      const key = `${activeFileId}:${readPercentage}:${lastPageOrSlide}`;
      if (key === lastSyncedRef.current) return;

      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      progressTimerRef.current = setTimeout(() => {
        lastSyncedRef.current = key;
        void saveHelperResourceProgress(activeFileId, {
          readPercentage: Math.min(100, Math.max(0, Math.round(readPercentage))),
          lastPageOrSlide: Math.max(0, Math.round(lastPageOrSlide)),
        }).catch(() => {
          // Keep viewing uninterrupted; next sync can retry.
        });
      }, PROGRESS_DEBOUNCE_MS);
    },
    [activeFileId],
  );

  const markOpened = useCallback(
    (file: StudentHelperResourceFileDto) => {
      if (file.mediaKind === "Image") {
        syncProgress(100, 1);
      }
    },
    [syncProgress],
  );

  useEffect(() => {
    if (activeFile && viewMode === "viewer") {
      markOpened(activeFile);
    }
  }, [activeFile, markOpened, viewMode]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, []);

  const completeMutation = useMutation({
    mutationFn: () => completeHelperResourceStation(stationId, 100),
    onSuccess: async () => {
      setIsCompleted(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: progressQueryKeys.dashboard() }),
        courseId
          ? queryClient.invalidateQueries({
              queryKey: progressQueryKeys.courseProgress(courseId),
            })
          : Promise.resolve(),
        pathId
          ? queryClient.invalidateQueries({
              queryKey: progressQueryKeys.pathStations(pathId),
            })
          : Promise.resolve(),
      ]);
    },
  });

  const markCompleted = useCallback(async () => {
    setActionError(null);
    setIsCompleting(true);
    try {
      await completeMutation.mutateAsync();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to complete station",
      );
    } finally {
      setIsCompleting(false);
    }
  }, [completeMutation]);

  const viewerKind = activeFile ? getViewerKind(activeFile) : null;

  const loadError =
    stationQuery.error instanceof Error
      ? stationQuery.error.message
      : stationQuery.isError
        ? "Failed to load helper resources"
        : null;

  return {
    header,
    stationQuery,
    fileQuery,
    files,
    imageFiles,
    mediaFilter,
    setMediaFilter,
    viewMode,
    activeFile,
    activeFileId,
    viewerKind,
    openFile,
    closeViewer,
    downloadFile,
    syncProgress,
    markCompleted,
    isCompleting,
    isCompleted,
    actionError,
    loadError,
    isLoading: stationQuery.isLoading,
    pathId,
  };
}
