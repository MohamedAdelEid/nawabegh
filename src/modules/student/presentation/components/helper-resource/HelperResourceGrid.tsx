"use client";

import { useTranslations } from "next-intl";
import { HelperResourceCard } from "./HelperResourceCard";
import { HelperResourceContributeCard } from "./HelperResourceContributeCard";
import { HelperResourceFilters } from "./HelperResourceFilters";
import { HelperResourceHeader } from "./HelperResourceHeader";
import type { HelperResourceMediaFilter } from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type { StudentHelperResourceFileDto } from "@/modules/student/domain/types/helperResource.types";
import { Button } from "@/shared/presentation/components/ui/button";

type HelperResourceGridProps = {
  title: string;
  description?: string;
  files: StudentHelperResourceFileDto[];
  mediaFilter: HelperResourceMediaFilter;
  onFilterChange: (value: HelperResourceMediaFilter) => void;
  onPreview: (file: StudentHelperResourceFileDto) => void;
  onDownload: (file: StudentHelperResourceFileDto) => void;
  header: {
    avatarUrl?: string | null;
    displayName?: string;
    learningPathTitle?: string;
  };
  courseId?: string | null;
  pathId?: string | null;
  isCompleted: boolean;
  isCompleting: boolean;
  onMarkCompleted: () => void;
};

export function HelperResourceGrid({
  title,
  description,
  files,
  mediaFilter,
  onFilterChange,
  onPreview,
  onDownload,
  header,
  courseId,
  pathId,
  isCompleted,
  isCompleting,
  onMarkCompleted,
}: HelperResourceGridProps) {
  const t = useTranslations("student.dashboard.helperResource");

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f7]">
      <HelperResourceHeader
        title={title || t("page.title")}
        subtitle={header.learningPathTitle}
        avatarUrl={header.avatarUrl}
        displayName={header.displayName}
        courseId={courseId}
        pathId={pathId}
      />

      <div className="mx-auto w-full max-w-[1280px] flex-1 space-y-4 p-4 md:p-8">
        <div className="space-y-3 text-end">
          <h1 className="text-3xl font-bold text-[#0f172a]">
            {title || t("page.title")}
          </h1>
          <p className="ms-auto max-w-2xl text-base leading-6 text-[#64748b]">
            {description || t("page.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#166534]">
                {t("completed")}
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isCompleting}
                onClick={onMarkCompleted}
              >
                {isCompleting ? t("markingCompleted") : t("markCompleted")}
              </Button>
            )}
          </div>
          <HelperResourceFilters value={mediaFilter} onChange={onFilterChange} />
        </div>

        {files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-white py-20 text-center text-[#64748b]">
            {t("noFiles")}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => (
              <HelperResourceCard
                key={file.id}
                file={file}
                onPreview={() => onPreview(file)}
                onDownload={() => onDownload(file)}
              />
            ))}
            <HelperResourceContributeCard />
          </div>
        )}
      </div>
    </div>
  );
}
