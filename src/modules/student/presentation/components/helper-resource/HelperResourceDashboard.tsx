"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { HelperResourceGrid } from "./HelperResourceGrid";
import { HelperResourceImageViewer } from "./HelperResourceImageViewer";
import { HelperResourcePdfViewer } from "./HelperResourcePdfViewer";
import { HelperResourcePptViewer } from "./HelperResourcePptViewer";
import { HelperResourceSkeleton } from "./HelperResourceSkeleton";
import { HelperResourceWordViewer } from "./HelperResourceWordViewer";
import { useHelperResourceStation } from "@/modules/student/application/hooks/useHelperResourceStation";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";

type HelperResourceDashboardProps = {
  stationId: string;
  initialFileId?: string | null;
};

export function HelperResourceDashboard({
  stationId,
  initialFileId,
}: HelperResourceDashboardProps) {
  const t = useTranslations("student.dashboard.helperResource");
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const pathId = searchParams.get("pathId");

  const station = useHelperResourceStation({
    stationId,
    courseId,
    pathId,
    initialFileId,
  });

  useEffect(() => {
    if (
      station.viewMode !== "viewer" ||
      !station.activeFile ||
      station.viewerKind !== "other"
    ) {
      return;
    }
    station.downloadFile(station.activeFile);
    station.closeViewer();
  }, [
    station.viewMode,
    station.activeFile,
    station.viewerKind,
    station.downloadFile,
    station.closeViewer,
  ]);

  if (station.isLoading) {
    return <HelperResourceSkeleton />;
  }

  if (station.loadError && !station.stationQuery.data) {
    return (
      <div className="space-y-4 p-6">
        <ApiFailureAlert
          message={station.loadError}
          fallbackMessage={t("errorLoading")}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void station.stationQuery.refetch()}
        >
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (station.viewMode === "viewer" && station.activeFile) {
    const file = station.activeFile;

    if (station.viewerKind === "pdf") {
      return (
        <>
          <HelperResourceGrid
            title={station.header.stationTitle}
            files={station.files}
            mediaFilter={station.mediaFilter}
            onFilterChange={station.setMediaFilter}
            onPreview={station.openFile}
            onDownload={station.downloadFile}
            header={station.header}
            courseId={courseId}
            pathId={pathId || station.pathId}
            isCompleted={station.isCompleted}
            isCompleting={station.isCompleting}
            onMarkCompleted={() => void station.markCompleted()}
          />
          <HelperResourcePdfViewer
            file={file}
            onClose={station.closeViewer}
            onDownload={() => station.downloadFile(file)}
            onProgress={station.syncProgress}
          />
        </>
      );
    }

    if (station.viewerKind === "presentation") {
      return (
        <HelperResourcePptViewer
          file={file}
          stationTitle={station.header.stationTitle}
          learningPathTitle={station.header.learningPathTitle}
          avatarUrl={station.header.avatarUrl}
          courseId={courseId}
          pathId={pathId || station.pathId}
          onBack={station.closeViewer}
          onDownload={() => station.downloadFile(file)}
          onProgress={station.syncProgress}
        />
      );
    }

    if (station.viewerKind === "word") {
      return (
        <HelperResourceWordViewer
          file={file}
          avatarUrl={station.header.avatarUrl}
          courseId={courseId}
          pathId={pathId || station.pathId}
          onBack={station.closeViewer}
          onDownload={() => station.downloadFile(file)}
          onProgress={station.syncProgress}
        />
      );
    }

    if (station.viewerKind === "image") {
      return (
        <HelperResourceImageViewer
          file={file}
          gallery={station.imageFiles}
          avatarUrl={station.header.avatarUrl}
          courseId={courseId}
          pathId={pathId || station.pathId}
          onBack={station.closeViewer}
          onDownload={station.downloadFile}
          onSelect={station.openFile}
          onProgress={station.syncProgress}
        />
      );
    }
  }

  return (
    <div>
      {station.actionError ? (
        <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 md:px-8">
          <ApiFailureAlert
            message={station.actionError}
            fallbackMessage={t("errors.action")}
          />
        </div>
      ) : null}
      <HelperResourceGrid
        title={station.header.stationTitle}
        files={station.files}
        mediaFilter={station.mediaFilter}
        onFilterChange={station.setMediaFilter}
        onPreview={station.openFile}
        onDownload={station.downloadFile}
        header={station.header}
        courseId={courseId}
        pathId={pathId || station.pathId}
        isCompleted={station.isCompleted}
        isCompleting={station.isCompleting}
        onMarkCompleted={() => void station.markCompleted()}
      />
    </div>
  );
}
