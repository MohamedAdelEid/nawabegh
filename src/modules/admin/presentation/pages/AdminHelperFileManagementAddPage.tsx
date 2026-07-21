"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, FileIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  createResourceFile,
  getResourceFileCoursesDropdown,
  inferResourceMediaKind,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { getStation } from "@/modules/admin/infrastructure/api/stationsApi";
import { fetchTeacherMyCoursesOptions } from "@/modules/teacher/infrastructure/api/teacherCoursesApi";
import {
  deleteAdminUploadedFile,
  uploadAdminFiles,
} from "@/modules/admin/infrastructure/api/fileUploadApi";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { notify } from "@/shared/application/lib/toast";
import { AccessPolicy, ResourceFileType } from "@/shared/domain/enums/cms.enums";
import { formatCourseContextLabel } from "@/shared/domain/utils/grade.utils";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";

const RESOURCE_FILE_UPLOAD_FOLDER = "courses";

interface AdminHelperFileManagementAddPageProps {
  stationContext?: {
    journeyId: string;
    stationId: string;
    returnHref: string;
  };
}

type UploadedFileEntry = {
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileUrl: string;
  fileSizeBytes?: number | null;
  isDeleting?: boolean;
};

function inferFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.trim().toUpperCase();
  return ext || "FILE";
}

export function AdminHelperFileManagementAddPage({
  stationContext,
}: AdminHelperFileManagementAddPageProps) {
  const t = useTranslations("admin.dashboard.contentManagement");
  const locale = useLocale();
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const isTeacherScope = routes.scope === "teacher";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const routeConfig = routes.helperFileManagement;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [accessPolicy, setAccessPolicy] = useState<AccessPolicy>(AccessPolicy.All);
  const [stationName, setStationName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileEntry[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (stationContext?.journeyId) {
      setCourseId(stationContext.journeyId);
    }
  }, [stationContext?.journeyId]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        if (isTeacherScope) {
          const courses = await fetchTeacherMyCoursesOptions({ pageSize: 100 });
          if (!alive) return;
          setCourseOptions(
            courses.map((course) => ({
              value: course.courseId,
              label: formatCourseContextLabel(locale, course.title, course.subject, course),
            })),
          );
        } else {
          const coursesResult = await getResourceFileCoursesDropdown();
          if (!alive) return;
          if (coursesResult.errorMessage) {
            notify.error(coursesResult.errorMessage);
          } else if (coursesResult.data) {
            setCourseOptions(
              coursesResult.data.map((course) => ({
                value: course.id,
                label: course.courseName,
              })),
            );
          }
        }
      } catch (error) {
        notify.error(error instanceof Error ? error.message : t("page.loadError"));
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [isTeacherScope, t, locale]);

  useEffect(() => {
    let alive = true;
    if (!stationContext?.stationId) {
      setStationName("");
      return () => {
        alive = false;
      };
    }

    void (async () => {
      const stationResult = await getStation(stationContext.stationId);
      if (!alive) return;
      setStationName(stationResult.data?.name?.trim() || "");
    })();

    return () => {
      alive = false;
    };
  }, [stationContext?.stationId]);

  const courseSelectOptions = useMemo<SearchableSelectOption<string>[]>(
    () => courseOptions,
    [courseOptions],
  );

  const filteredCourseSelectOptions = useMemo(() => {
    const query = courseSearchQuery.trim().toLowerCase();
    if (!query) return courseSelectOptions;
    return courseSelectOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [courseSearchQuery, courseSelectOptions]);

  const handleFilePick = async (files: FileList | File[] | null) => {
    if (!files || (files instanceof FileList && files.length === 0) || (Array.isArray(files) && files.length === 0)) return;
    setUploadProgress(0);
    setUploading(true);
    const progressTimer = window.setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 8));
    }, 120);
    const selectedFiles = Array.from(files);
    const upload = await uploadAdminFiles(selectedFiles, RESOURCE_FILE_UPLOAD_FOLDER);
    window.clearInterval(progressTimer);
    setUploadProgress(100);
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    setUploading(false);
    setUploadProgress(0);
    if (!upload.ok) {
      notify.error(upload.errorMessage);
      return;
    }

    const nextUploadedFiles = upload.files.map((item) => ({
      fileName: item.originalFileName.replace(/\.[^/.]+$/, "") || item.originalFileName,
      originalFileName: item.originalFileName,
      fileType: item.contentType.trim() || inferFileType(item.originalFileName),
      fileUrl: item.filePath,
      fileSizeBytes: item.fileSize,
    }));

    setUploadedFiles((prev) => {
      const merged = [...prev, ...nextUploadedFiles];
      const seen = new Set<string>();
      return merged.filter((file) => {
        if (seen.has(file.fileUrl)) return false;
        seen.add(file.fileUrl);
        return true;
      });
    });

    const firstUploadedFile = nextUploadedFiles[0];
    if (firstUploadedFile && uploadedFiles.length === 0) {
      setFileUrl(firstUploadedFile.fileUrl);
      setFileName(firstUploadedFile.fileName);
      setFileType(firstUploadedFile.fileType);
    }

    if (upload.message) {
      if (selectedFiles.length > upload.files.length) {
        notify.error(upload.message);
      } else {
        notify.success(upload.message);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteUploadedFile = async (targetFileUrl: string) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.fileUrl === targetFileUrl ? { ...file, isDeleting: true } : file,
      ),
    );

    const result = await deleteAdminUploadedFile(targetFileUrl);

    if (!result.ok) {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.fileUrl === targetFileUrl ? { ...file, isDeleting: false } : file,
        ),
      );
      notify.error(result.errorMessage);
      return;
    }

    setUploadedFiles((prev) => {
      const next = prev.filter((file) => file.fileUrl !== targetFileUrl);
      const firstFile = next[0];
      if (firstFile) {
        setFileUrl(firstFile.fileUrl);
        setFileName(firstFile.fileName);
        setFileType(firstFile.fileType);
      } else {
        setFileUrl("");
        setFileName("");
        setFileType("");
      }
      return next;
    });
    notify.success(t("form.upload.deleteSuccess"));
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      if (uploading) return;
      const droppedFiles = Array.from(event.dataTransfer.files);
      if (droppedFiles.length > 0) {
        void handleFilePick(droppedFiles);
      }
    },
    [uploading],
  );

  const submit = async () => {
    if (submitting) return;
    if (!stationContext && !courseId.trim()) {
      notify.error(t("form.validation.courseRequired"));
      return;
    }
    if (stationContext && !stationContext.stationId.trim()) {
      notify.error(t("form.validation.stationRequired"));
      return;
    }
    if (uploadedFiles.length === 0 && !fileName.trim()) {
      notify.error(t("form.validation.fileNameRequired"));
      return;
    }
    if (uploadedFiles.length === 0 && !fileUrl.trim()) {
      notify.error(t("form.validation.fileRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const isStationResource = Boolean(stationContext?.stationId);
      const targetCourseId = isStationResource
        ? null
        : (stationContext?.journeyId ?? courseId).trim() || null;
      const filesToCreate: UploadedFileEntry[] =
        uploadedFiles.length > 0
          ? uploadedFiles.map((file) => ({
              ...file,
              fileName:
                uploadedFiles.length === 1 && fileName.trim()
                  ? fileName.trim()
                  : file.originalFileName || file.fileName,
              fileType:
                uploadedFiles.length === 1 && fileType.trim()
                  ? fileType.trim()
                  : file.fileType,
              fileUrl: uploadedFiles.length === 1 && fileUrl.trim() ? fileUrl.trim() : file.fileUrl,
            }))
          : [
              {
                fileName: fileName.trim(),
                originalFileName: fileName.trim(),
                fileType: fileType.trim() || inferFileType(fileName),
                fileUrl: fileUrl.trim(),
                fileSizeBytes: null,
              },
            ];

      if (filesToCreate.length > 50) {
        notify.error(
          locale.startsWith("ar")
            ? "الحد الأقصى 50 ملفًا في الطلب الواحد."
            : "Maximum 50 files per create request.",
        );
        return;
      }

      const result = await createResourceFile({
        stationId: isStationResource ? stationContext?.stationId : null,
        courseId: targetCourseId,
        accessPolicy,
        resourceFileType: isStationResource
          ? ResourceFileType.ForStation
          : ResourceFileType.ForCourse,
        files: filesToCreate.map((file) => ({
          fileName: file.originalFileName || file.fileName,
          fileUrl: file.fileUrl,
          fileType: file.fileType,
          fileSizeBytes: file.fileSizeBytes ?? null,
          thumbnailUrl: null,
          mediaKind: inferResourceMediaKind(
            file.originalFileName || file.fileName,
            file.fileType,
          ),
        })),
      });

      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? t("form.messages.createError"));
        return;
      }

      notify.success(result.message?.trim() || t("form.messages.createSuccess"));
      router.push(stationContext?.returnHref ?? routeConfig.LIST);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("form.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={
          stationContext ? t("form.stationContext.addTitle") : t("form.addTitle")
        }
        description={
          stationContext ? t("form.stationContext.pageDescription") : t("form.pageDescription")
        }
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: routes.home },
          ...(stationContext
            ? [
                {
                  label: t("form.breadcrumbs.journeyEditor"),
                  href: routes.journeyEditor.EDITOR(stationContext.journeyId),
                },
              ]
            : [{ label: t("breadcrumbs.content"), href: routeConfig.LIST }]),
          { label: t("breadcrumbs.add") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.linkCourse")}</h3>
              {stationContext ? (
                <div className="rounded-xl bg-[#EEF4FD] p-4 text-sm text-slate-600">
                  <p className="font-semibold text-[#1E3A66]">{t("form.stationContext.title")}</p>
                  <p className="mt-2 leading-5">{t("form.stationContext.note")}</p>
                  <p className="mt-3 text-xs text-slate-700">
                    {stationName || stationContext.stationId}
                  </p>
                </div>
              ) : (
                <SearchableSelect
                  label={t("form.fields.course")}
                  value={courseId || null}
                  options={filteredCourseSelectOptions}
                  onChange={setCourseId}
                  placeholder={t("form.fields.coursePlaceholder")}
                  searchPlaceholder={t("form.fields.courseSearchPlaceholder")}
                  emptyMessage={t("form.fields.coursesEmpty")}
                  searchValue={courseSearchQuery}
                  onSearchValueChange={setCourseSearchQuery}
                />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.upload")}</h3>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  void handleFilePick(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                className={[
                  "w-full rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
                  isDragOver
                    ? "border-[#243B5A] bg-[#EEF4FD]"
                    : "border-slate-200 bg-slate-50 hover:border-[#243B5A]/30",
                ].join(" ")}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadCloud className={[
                  "mx-auto h-9 w-9 transition-colors",
                  isDragOver ? "text-[#243B5A]" : "text-slate-400",
                ].join(" ")} />
                <p className="mt-2 font-semibold text-slate-700">
                  {uploading ? t("form.upload.uploading") : t("form.upload.title")}
                </p>
                <p className="text-sm text-slate-400">{t("form.upload.subtitle")}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {locale.startsWith("ar")
                    ? "حد أقصى 50 ملفًا في المرة الواحدة"
                    : "Up to 50 files at once"}
                </p>
                {uploadedFiles.length > 0 ? (
                  <p className="mt-3 text-xs text-emerald-700">
                    {t("form.upload.uploadedCount", { count: uploadedFiles.length })}
                  </p>
                ) : null}
              </button>
              {uploading ? (
                <div className="rounded-xl border border-[#D6E3F5] bg-[#F4F8FF] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#1E3A66]">
                    <p className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("form.upload.loadingHint")}
                    </p>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-[#2B415E] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">
                    {t("form.upload.listTitle")} ({uploadedFiles.length})
                  </p>
                  <div className="max-h-[24rem] space-y-2 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.fileUrl}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FileIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="truncate text-sm font-semibold text-slate-700" title={file.originalFileName}>
                            {file.originalFileName || file.fileName}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {file.fileType}
                            {file.fileSizeBytes ? ` · ${(file.fileSizeBytes / 1024).toFixed(0)} KB` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 shrink-0 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => void handleDeleteUploadedFile(file.fileUrl)}
                          disabled={Boolean(file.isDeleting) || uploading || submitting}
                        >
                          {file.isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              <span className="text-xs">{t("form.upload.delete")}</span>
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.identity")}</h3>
              {uploadedFiles.length <= 1 ? (
                <>
                  <LabeledInput
                    label={t("form.fields.fileName")}
                    value={fileName}
                    placeholder={t("form.fields.fileNamePlaceholder")}
                    onChange={setFileName}
                  />
                  <LabeledInput
                    label={t("form.fields.fileType")}
                    value={fileType}
                    placeholder={t("form.fields.fileTypePlaceholder")}
                    onChange={setFileType}
                  />
                </>
              ) : (
                <div className="max-h-[28rem] space-y-3 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={file.fileUrl} className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-500">
                        {locale.startsWith("ar") ? `ملف ${index + 1}` : `File ${index + 1}`}
                      </p>
                      <LabeledInput
                        label={t("form.fields.fileName")}
                        value={file.originalFileName || file.fileName}
                        placeholder={t("form.fields.fileNamePlaceholder")}
                        onChange={(value) => {
                          setUploadedFiles((prev) =>
                            prev.map((f) =>
                              f.fileUrl === file.fileUrl
                                ? { ...f, originalFileName: value, fileName: value }
                                : f,
                            ),
                          );
                        }}
                      />
                      <LabeledInput
                        label={t("form.fields.fileType")}
                        value={file.fileType}
                        placeholder={t("form.fields.fileTypePlaceholder")}
                        onChange={() => undefined}
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.accessPolicy")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccessPolicy(AccessPolicy.All)}
                  className={[
                    "rounded-xl border-2 p-4 text-right transition-colors",
                    accessPolicy === AccessPolicy.All
                      ? "border-[#243B5A] bg-[#EEF4FD]"
                      : "border-slate-200 bg-white text-slate-500",
                  ].join(" ")}
                >
                  <p className="font-bold">{t("form.access.public.title")}</p>
                  <p className="text-xs">{t("form.access.public.description")}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessPolicy(AccessPolicy.Subscribers)}
                  className={[
                    "rounded-xl border-2 p-4 text-right transition-colors",
                    accessPolicy === AccessPolicy.Subscribers
                      ? "border-[#243B5A] bg-[#EEF4FD]"
                      : "border-slate-200 bg-white text-slate-500",
                  ].join(" ")}
                >
                  <p className="font-bold">{t("form.access.subscribers.title")}</p>
                  <p className="text-xs">{t("form.access.subscribers.description")}</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-right text-sm text-[#B42318]">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{t("form.warning")}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.summary.title")}</h3>
              <div className="space-y-2 text-sm text-slate-500">
                <p>{t(stationContext ? "form.stationContext.step1" : "form.summary.step1")}</p>
                <p>{t(stationContext ? "form.stationContext.step2" : "form.summary.step2")}</p>
                <p>{t(stationContext ? "form.stationContext.step3" : "form.summary.step3")}</p>
              </div>
              {stationContext ? (
                <div className="rounded-xl bg-[#EEF4FD] p-3 text-xs text-slate-600">
                  <p className="font-semibold text-[#1E3A66]">{t("form.stationContext.title")}</p>
                  <p className="mt-1">{stationName || stationContext.stationId}</p>
                </div>
              ) : null}
              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-[#2B415E] text-white hover:bg-[#243B5A]"
                onClick={() => void submit()}
                disabled={submitting || uploading}
              >
                {submitting ? t("form.actions.saving") : t("form.actions.publish")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-slate-500"
                onClick={() =>
                  router.push(stationContext?.returnHref ?? routeConfig.LIST)
                }
              >
                {t("form.actions.cancel")}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
