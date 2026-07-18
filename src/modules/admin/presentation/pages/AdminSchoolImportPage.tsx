"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  downloadSchoolImportTemplate,
  getSchoolImportJob,
  startSchoolImport,
  subscribeSchoolImportStream,
  uploadSchoolImport,
  type SchoolImportFilters,
  type SchoolImportJob,
  type SchoolImportPreviewRow,
  type SchoolImportRowStatus,
} from "@/modules/admin/infrastructure/api/schoolApi";
import { SchoolImportDropzone } from "@/modules/admin/presentation/components/school-management";
import {
  DashboardPageHeader,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

const MAX_IMPORT_SIZE_BYTES = 50 * 1024 * 1024;
const PAGE_SIZE = 20;
const ACCEPTED_EXTENSIONS = [".xlsx", ".csv"];

type ImportProgress = {
  processed: number;
  total: number;
  percent: number;
  currentEmail?: string;
  succeeded?: number;
  failed?: number;
  completed: boolean;
};

const INITIAL_PROGRESS: ImportProgress = {
  processed: 0,
  total: 0,
  percent: 0,
  completed: false,
};

function statusClasses(status: SchoolImportRowStatus): string {
  switch (status) {
    case "Valid":
      return "bg-emerald-50 text-emerald-700";
    case "Imported":
      return "bg-blue-50 text-blue-700";
    case "Failed":
    case "Invalid":
      return "bg-rose-50 text-rose-700";
  }
}

function hasAcceptedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function AdminSchoolImportPage() {
  const t = useTranslations("admin.dashboard.schoolManagement.import");
  const router = useRouter();
  const streamAbortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<SchoolImportJob | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [filters, setFilters] = useState<SchoolImportFilters>({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>(INITIAL_PROGRESS);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const loadJob = async (
    jobId: string,
    nextFilters: SchoolImportFilters = filters,
  ) => {
    setIsLoadingJob(true);
    const result = await getSchoolImportJob(jobId, nextFilters);
    setIsLoadingJob(false);
    if (!result.data) {
      notify.error(result.errorMessage ?? t("messages.loadError"));
      return;
    }
    setJob(result.data);
  };

  const handleUpload = async (nextFile: File) => {
    if (!hasAcceptedExtension(nextFile.name)) {
      notify.error(t("messages.invalidFileType"));
      return;
    }
    if (nextFile.size > MAX_IMPORT_SIZE_BYTES) {
      notify.error(t("messages.fileTooLarge"));
      return;
    }

    setFile(nextFile);
    setIsUploading(true);
    setProgress(INITIAL_PROGRESS);
    const nextFilters: SchoolImportFilters = {
      pageNumber: 1,
      pageSize: PAGE_SIZE,
    };
    setFilters(nextFilters);

    const result = await uploadSchoolImport(nextFile);
    if (!result.data) {
      setIsUploading(false);
      notify.error(result.errorMessage ?? t("messages.uploadError"));
      return;
    }

    // Upload may return counts only — always load the first preview page from the job API.
    const preview = await getSchoolImportJob(result.data.jobId, nextFilters);
    setIsUploading(false);

    const jobData = preview.data ?? result.data;
    if (!preview.data && result.data.rows.length === 0) {
      notify.error(preview.errorMessage ?? t("messages.loadError"));
    } else {
      notify.success(result.message ?? t("messages.uploadSuccess"));
    }

    setJob(jobData);
    setSelectedRows([]);
  };

  const connectToProgress = async (jobId: string) => {
    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      await subscribeSchoolImportStream(
        jobId,
        {
          onProgress: (data) => {
            setProgress((current) => ({ ...current, ...data }));
          },
          onRow: (data) => {
            setJob((current) =>
              current
                ? {
                    ...current,
                    rows: current.rows.map((row) =>
                      row.rowIndex === data.rowIndex
                        ? {
                            ...row,
                            status: data.success ? "Imported" : "Failed",
                            errors: data.error ? [data.error] : row.errors,
                          }
                        : row,
                    ),
                  }
                : current,
            );
          },
          onCompleted: (data) => {
            setProgress({
              processed: data.total,
              total: data.total,
              percent: 100,
              succeeded: data.succeeded,
              failed: data.failed,
              completed: true,
            });
            setIsStarting(false);
            void loadJob(jobId);
            notify.success(t("messages.completed"));
          },
          onError: (error) => {
            if (controller.signal.aborted) return;
            setIsStarting(false);
            notify.error(error.message || t("messages.streamError"));
          },
        },
        controller.signal,
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setIsStarting(false);
      notify.error(
        error instanceof Error && error.name !== "AbortError"
          ? error.message
          : t("messages.streamError"),
      );
    }
  };

  const handleStart = async () => {
    if (!job) return;
    setIsStarting(true);
    setProgress(INITIAL_PROGRESS);
    const result = await startSchoolImport(
      job.jobId,
      selectedRows.length > 0 ? selectedRows : undefined,
    );
    if (result.errorMessage) {
      setIsStarting(false);
      notify.error(result.errorMessage);
      return;
    }
    await connectToProgress(job.jobId);
  };

  const updateFilters = (patch: Partial<SchoolImportFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (job) void loadJob(job.jobId, next);
  };

  const toggleRow = (row: SchoolImportPreviewRow) => {
    if (row.status !== "Valid") return;
    setSelectedRows((current) =>
      current.includes(row.rowIndex)
        ? current.filter((value) => value !== row.rowIndex)
        : [...current, row.rowIndex],
    );
  };

  const toggleAllValidRows = () => {
    if (!job) return;
    const validIndexes = job.rows
      .filter((row) => row.status === "Valid")
      .map((row) => row.rowIndex);
    const allSelected =
      validIndexes.length > 0 &&
      validIndexes.every((index) => selectedRows.includes(index));
    setSelectedRows(allSelected ? [] : validIndexes);
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("title")}
        description={job ? t("descriptionReady") : t("description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home") },
          { label: t("breadcrumbs.schools") },
          { label: t("breadcrumbs.import") },
          { label: t("breadcrumbs.preview") },
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDownloading}
              onClick={() => {
                setIsDownloading(true);
                void downloadSchoolImportTemplate()
                  .catch((error) =>
                    notify.error(
                      error instanceof Error ? error.message : t("messages.templateError"),
                    ),
                  )
                  .finally(() => setIsDownloading(false));
              }}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("actions.template")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`${ROUTES.ADMIN.HOME}?tab=schoolManagement`)}
            >
              {t("actions.back")}
            </Button>
            {job ? (
              <Button
                type="button"
                className="h-11 rounded-xl bg-[#2C4260] px-5 text-white hover:bg-[#243751]"
                disabled={isStarting || job.validCount === 0}
                onClick={() => void handleStart()}
              >
                {isStarting ? t("actions.importing") : t("actions.save")}
              </Button>
            ) : null}
          </div>
        }
      />

      <DashboardTableCard title={t("upload.title")}>
        <div className="space-y-3 p-6">
          <SchoolImportDropzone
            fileName={file?.name}
            placeholder={t("upload.placeholder")}
            hint={t("upload.hint")}
            disabled={isUploading || isStarting}
            onFileSelected={(nextFile) => void handleUpload(nextFile)}
          />
          {isUploading ? (
            <p className="text-center text-sm text-slate-500">{t("actions.uploading")}</p>
          ) : null}
        </div>
      </DashboardTableCard>

      {job ? (
        <DashboardTableCard
          title={t("preview.title")}
          actions={
            <Button
              type="button"
              className="h-11 rounded-xl bg-[#2C4260] px-5 text-white hover:bg-[#243751]"
              disabled={isStarting || job.validCount === 0}
              onClick={() => void handleStart()}
            >
              {isStarting ? t("actions.importing") : t("actions.save")}
            </Button>
          }
          footer={
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-400">
                {t("pagination.summary", {
                  from: (job.currentPage - 1) * job.pageSize + 1,
                  to: Math.min(job.currentPage * job.pageSize, job.totalCount),
                  total: job.totalCount,
                })}
              </p>
              <DashboardPagination
                pages={Array.from({ length: job.totalPages }, (_, index) => index + 1)}
                currentPage={job.currentPage}
                previousLabel={t("pagination.previous")}
                nextLabel={t("pagination.next")}
                onPageChange={(pageNumber) => updateFilters({ pageNumber })}
              />
            </div>
          }
        >
          <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-4">
            <Input
              value={filters.keyword ?? ""}
              placeholder={t("filters.keyword")}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  keyword: event.target.value,
                }))
              }
              onBlur={() => updateFilters({ keyword: filters.keyword, pageNumber: 1 })}
            />
            <Input
              value={filters.country ?? ""}
              placeholder={t("filters.country")}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  country: event.target.value,
                }))
              }
              onBlur={() => updateFilters({ country: filters.country, pageNumber: 1 })}
            />
            <Input
              value={filters.performanceLevel ?? ""}
              placeholder={t("filters.performance")}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  performanceLevel: event.target.value,
                }))
              }
              onBlur={() =>
                updateFilters({ performanceLevel: filters.performanceLevel, pageNumber: 1 })
              }
            />
            <SearchableSelect
              value={filters.status ?? ""}
              onChange={(status) =>
                updateFilters({
                  status: (status || undefined) as SchoolImportRowStatus | undefined,
                  pageNumber: 1,
                })
              }
              options={[
                { value: "", label: t("filters.allStatuses") },
                ...(["Valid", "Invalid", "Imported", "Failed"] as const).map((status) => ({
                  value: status,
                  label: t(`statuses.${status}`),
                })),
              ]}
              className="w-full gap-0"
              triggerClassName="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 shadow-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 text-start">
                    <input
                      type="checkbox"
                      aria-label={t("columns.select")}
                      checked={
                        job.rows.some((row) => row.status === "Valid") &&
                        job.rows
                          .filter((row) => row.status === "Valid")
                          .every((row) => selectedRows.includes(row.rowIndex))
                      }
                      onChange={toggleAllValidRows}
                    />
                  </th>
                  <th className="p-4 text-start">{t("columns.row")}</th>
                  <th className="p-4 text-start">{t("columns.name")}</th>
                  <th className="p-4 text-start">{t("columns.email")}</th>
                  <th className="p-4 text-start">{t("columns.country")}</th>
                  <th className="p-4 text-start">{t("columns.city")}</th>
                  <th className="p-4 text-start">{t("columns.status")}</th>
                  <th className="p-4 text-start">{t("columns.errors")}</th>
                </tr>
              </thead>
              <tbody className={cn(isLoadingJob && "opacity-50")}>
                {job.rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-sm text-slate-500">
                      {job.totalCount > 0
                        ? t("messages.emptyPreviewPage")
                        : t("messages.emptyPreview")}
                    </td>
                  </tr>
                ) : (
                  job.rows.map((row) => (
                    <tr key={row.rowIndex} className="border-t border-slate-100">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          disabled={row.status !== "Valid"}
                          checked={selectedRows.includes(row.rowIndex)}
                          onChange={() => toggleRow(row)}
                        />
                      </td>
                      <td className="p-4">{row.rowIndex}</td>
                      <td className="p-4 font-medium text-slate-700">{row.name || "—"}</td>
                      <td className="p-4 text-slate-500">{row.email || "—"}</td>
                      <td className="p-4 text-slate-500">{row.country || "—"}</td>
                      <td className="p-4 text-slate-500">{row.city || "—"}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs",
                            statusClasses(row.status),
                          )}
                        >
                          {t(`statuses.${row.status}`)}
                        </span>
                      </td>
                      <td className="max-w-xs p-4 text-xs text-rose-600">
                        {row.errors.join("، ") || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isStarting || progress.completed ? (
            <div className="space-y-2 border-t border-slate-100 p-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{progress.currentEmail ?? t("progress.processing")}</span>
                <span>
                  {progress.processed}/{progress.total} ({progress.percent}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              {progress.completed ? (
                <p className="text-sm text-slate-500">
                  {t("progress.completed", {
                    succeeded: progress.succeeded ?? 0,
                    failed: progress.failed ?? 0,
                  })}
                </p>
              ) : null}
            </div>
          ) : null}
        </DashboardTableCard>
      ) : null}
    </div>
  );
}
