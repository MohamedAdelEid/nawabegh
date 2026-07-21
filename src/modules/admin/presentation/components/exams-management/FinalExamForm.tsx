"use client";

import { FileUp, Lightbulb, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FinalExamDetail,
  FinalExamFormValues,
} from "@/modules/admin/domain/types/examsManagement.types";
import {
  createFinalExam,
  FINAL_EXAM_UPLOAD_FOLDER,
  generateFinalExamQuestions,
  getFinalExam,
  updateFinalExamSettings,
} from "@/modules/admin/infrastructure/api/finalExamsApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { getCoursesPage } from "@/modules/admin/infrastructure/api/courseApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

const DEFAULT_VALUES: FinalExamFormValues = {
  courseId: "",
  name: "",
  numberOfQuestions: 20,
  durationMinutes: 45,
  passingGrade: 80,
  difficulty: 1,
  shuffleQuestions: true,
};

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "docx"]);
const POLL_INTERVAL_MS = 3000;

type PendingSourceFile = {
  id: string;
  name: string;
  sizeLabel: string;
  file?: File;
  fileUrl?: string;
  fileExtension?: string;
  fileSizeBytes?: number;
  uploaded?: boolean;
};

export type FinalExamFormProps = {
  courseId?: string;
  mode: "create" | "edit";
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? `.${parts.at(-1)!.toLowerCase()}` : "";
}

function mapExamToForm(exam: FinalExamDetail): FinalExamFormValues {
  return {
    courseId: exam.courseId,
    name: exam.title,
    numberOfQuestions: exam.questionCount,
    durationMinutes: exam.durationMinutes,
    passingGrade: exam.passScore,
    difficulty: exam.difficulty,
    shuffleQuestions: exam.shuffleQuestions,
  };
}

export function FinalExamForm({ courseId: initialCourseId, mode }: FinalExamFormProps) {
  const t = useTranslations("admin.dashboard.examsManagement.create");
  const tPage = useTranslations("admin.dashboard.examsManagement");
  const router = useRouter();

  const [values, setValues] = useState<FinalExamFormValues>({
    ...DEFAULT_VALUES,
    courseId: initialCourseId ?? "",
  });
  const [quizId, setQuizId] = useState<string | null>(null);
  const [sourceFiles, setSourceFiles] = useState<PendingSourceFile[]>([]);
  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patchValues = useCallback((patch: Partial<FinalExamFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    void (async () => {
      const result = await getCoursesPage({ pageNumber: 1, pageSize: 200, isPublished: true });
      if (result.data?.rows?.length) {
        setCourseOptions(result.data.rows.map((row) => ({ value: row.id, label: row.title })));
      }
    })();
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !initialCourseId) {
      setLoading(false);
      return;
    }

    void (async () => {
      setLoading(true);
      const result = await getFinalExam(initialCourseId);
      setLoading(false);

      if (result.status === "NotFound") {
        notify.error(result.errorMessage ?? t("messages.createError"));
        router.push(ROUTES.ADMIN.EXAMS.CREATE);
        return;
      }

      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? t("messages.createError"));
        return;
      }

      setValues(mapExamToForm(result.data));
      setQuizId(result.data.id);
      setGenerationStatus(result.data.questionGenerationStatus);
      setSourceFiles(
        result.data.quizAttachments.map((attachment, index) => ({
          id: attachment.id ?? `loaded-${index}`,
          name: attachment.fileName,
          sizeLabel: formatFileSize(attachment.fileSizeBytes),
          fileUrl: attachment.fileUrl,
          fileExtension: attachment.fileExtension,
          fileSizeBytes: attachment.fileSizeBytes,
          uploaded: true,
        })),
      );
    })();
  }, [initialCourseId, mode, router, t]);

  const [isDragOverSources, setIsDragOverSources] = useState(false);

  const addFilesToSources = useCallback((selected: File[]) => {
    if (!selected.length || readOnly) return;
    const nextFiles: PendingSourceFile[] = [];
    for (const file of selected) {
      const ext = getFileExtension(file.name).replace(".", "");
      if (!ACCEPTED_EXTENSIONS.has(ext)) {
        notify.error(t("upload.invalidFormat"));
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        notify.error(t("upload.maxSizeExceeded"));
        continue;
      }
      nextFiles.push({
        id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        file,
        fileSizeBytes: file.size,
        fileExtension: getFileExtension(file.name),
      });
    }
    if (nextFiles.length) {
      setSourceFiles((prev) => [...prev, ...nextFiles]);
    }
  }, [readOnly, t]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    addFilesToSources(selected);
  };

  const handleSourcesDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOverSources(true);
  }, []);

  const handleSourcesDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOverSources(false);
  }, []);

  const handleSourcesDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOverSources(false);
    addFilesToSources(Array.from(event.dataTransfer.files));
  }, [addFilesToSources]);

  const uploadSourceFiles = async () => {
    const uploaded: Array<{
      fileUrl: string;
      fileName: string;
      fileExtension: string;
      fileSizeBytes: number;
    }> = [];

    for (const source of sourceFiles) {
      if (source.fileUrl) {
        uploaded.push({
          fileUrl: source.fileUrl,
          fileName: source.name,
          fileExtension: source.fileExtension ?? getFileExtension(source.name),
          fileSizeBytes: source.fileSizeBytes ?? 0,
        });
        continue;
      }

      if (!source.file) continue;

      const uploadResult = await uploadAdminFile(source.file, FINAL_EXAM_UPLOAD_FOLDER);
      if (!uploadResult.ok) {
        notify.error(uploadResult.errorMessage);
        return null;
      }

      uploaded.push({
        fileUrl: uploadResult.filePath,
        fileName: source.name,
        fileExtension: getFileExtension(source.name),
        fileSizeBytes: source.file.size,
      });
    }

    return uploaded;
  };

  const buildPayload = async () => {
    const quizAttachments = await uploadSourceFiles();
    if (quizAttachments === null) return null;

    return {
      name: values.name.trim(),
      numberOfQuestions: values.numberOfQuestions,
      durationMinutes: values.durationMinutes,
      passingGrade: values.passingGrade,
      difficulty: values.difficulty,
      shuffleQuestions: values.shuffleQuestions,
      aiSourceFileUrl: quizAttachments[0]?.fileUrl ?? null,
      quizAttachments,
    };
  };

  const validateForm = () => {
    if (!values.courseId.trim()) {
      notify.error(t("messages.courseRequired"));
      return false;
    }
    if (!values.name.trim()) {
      notify.error(t("messages.nameRequired"));
      return false;
    }
    if (!sourceFiles.length) {
      notify.error(t("messages.fileRequired"));
      return false;
    }
    return true;
  };

  const pollGenerationStatus = async (courseId: string, targetQuizId: string) => {
    setGenerating(true);
    notify.loading(t("messages.generatingAlert"));

    const poll = async (): Promise<boolean> => {
      const result = await getFinalExam(courseId);
      if (!result.data) return false;

      setGenerationStatus(result.data.questionGenerationStatus);

      if (result.data.questionGenerationStatus === 1) {
        await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
        return poll();
      }

      if (result.data.questionGenerationStatus === 2) {
        notify.dismiss();
        notify.success(t("messages.generateComplete"));
        router.push(ROUTES.ADMIN.EXAMS.PREVIEW(courseId));
        return true;
      }

      if (result.data.questionGenerationStatus === 3) {
        notify.dismiss();
        notify.error(t("messages.generateError"));
        return false;
      }

      return false;
    };

    await poll();
    setGenerating(false);
  };

  const handleSave = async () => {
    if (readOnly || !validateForm()) return;

    setSubmitting(true);
    const payload = await buildPayload();
    if (!payload) {
      setSubmitting(false);
      return;
    }

    if (mode === "create" && !quizId) {
      const result = await createFinalExam(values.courseId, payload);
      setSubmitting(false);

      if (result.status === "Conflict") {
        notify.success(t("messages.examExists"));
        router.push(ROUTES.ADMIN.EXAMS.EDIT(values.courseId));
        return;
      }

      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? t("messages.createError"));
        return;
      }

      setQuizId(result.data.id);
      notify.success(result.message ?? t("messages.createSuccess"));
      router.replace(ROUTES.ADMIN.EXAMS.EDIT(values.courseId));
      return;
    }

    const result = await updateFinalExamSettings(values.courseId, payload);
    setSubmitting(false);

    if (result.status === "Conflict") {
      setReadOnly(true);
      notify.error(t("messages.readOnly"));
      return;
    }

    if (result.errorMessage) {
      notify.error(result.errorMessage ?? t("messages.updateError"));
      return;
    }

    notify.success(result.message ?? t("messages.updateSuccess"));
  };

  const handleGenerateAi = async () => {
    if (readOnly) {
      notify.error(t("messages.readOnly"));
      return;
    }

    let activeQuizId = quizId;

    if (!activeQuizId) {
      if (!validateForm()) return;
      setSubmitting(true);
      const payload = await buildPayload();
      if (!payload) {
        setSubmitting(false);
        return;
      }

      const createResult = await createFinalExam(values.courseId, payload);
      setSubmitting(false);

      if (createResult.status === "Conflict") {
        notify.success(t("messages.examExists"));
        router.push(ROUTES.ADMIN.EXAMS.EDIT(values.courseId));
        return;
      }

      if (createResult.errorMessage || !createResult.data) {
        notify.error(createResult.errorMessage ?? t("messages.createError"));
        return;
      }

      activeQuizId = createResult.data.id;
      setQuizId(activeQuizId);
    }

    setGenerating(true);
    setSubmitting(true);
    notify.loading(t("messages.generatingAlert"));

    const generateResult = await generateFinalExamQuestions(activeQuizId);
    setSubmitting(false);

    if (generateResult.status === "Conflict" && generationStatus === 1) {
      void pollGenerationStatus(values.courseId, activeQuizId);
      return;
    }

    if (generateResult.errorMessage) {
      notify.dismiss();
      setGenerating(false);
      notify.error(generateResult.errorMessage ?? t("messages.generateError"));
      return;
    }

    notify.success(generateResult.message ?? t("messages.generateSuccess"));
    void pollGenerationStatus(values.courseId, activeQuizId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-[1.75rem]" />
          <Skeleton className="h-[32rem] rounded-[1.75rem]" />
        </div>
      </div>
    );
  }

  const breadcrumbs =
    mode === "create"
      ? [
          { label: tPage("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: tPage("page.title"), href: ROUTES.ADMIN.EXAMS.LIST },
          { label: t("title") },
        ]
      : [
          { label: tPage("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: tPage("page.title"), href: ROUTES.ADMIN.EXAMS.LIST },
          { label: values.name || t("title") },
        ];

  return (
    <div className="space-y-7">
      <DashboardPageHeader title={t("title")} description={t("description")} breadcrumbs={breadcrumbs} />

      {generating ? (
        <Card className="rounded-[1.75rem] border-sky-200 bg-sky-50/90 shadow-[0px_8px_0px_0px_#0000000D]">
          <CardContent className="flex items-start gap-3 p-5 text-right">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-sky-600" aria-hidden />
            <div className="space-y-1">
              <p className="font-bold text-[#1E3A66]">{t("messages.generatingAlertTitle")}</p>
              <p className="text-sm leading-relaxed text-slate-600">{t("messages.generatingAlertBody")}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className=" space-y-6">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-6 text-right">
              <h3 className="text-lg font-bold text-[#1E3A66]">{t("sections.basic")}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="exam-name">{t("fields.name.label")}</Label>
                  <Input
                    id="exam-name"
                    value={values.name}
                    placeholder={t("fields.name.placeholder")}
                    disabled={readOnly}
                    onChange={(event) => patchValues({ name: event.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>{t("fields.course.label")}</Label>
                  <SearchableSelect
                    value={values.courseId}
                    disabled={mode === "edit" || readOnly}
                    onChange={(courseId) => patchValues({ courseId })}
                    placeholder={t("fields.course.placeholder")}
                    options={courseOptions}
                    className="gap-0"
                    triggerClassName="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-right text-sm shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-questions">{t("fields.numberOfQuestions.label")}</Label>
                  <Input
                    id="exam-questions"
                    type="number"
                    min={1}
                    max={100}
                    value={values.numberOfQuestions}
                    disabled={readOnly}
                    onChange={(event) =>
                      patchValues({ numberOfQuestions: Number(event.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-duration">{t("fields.durationMinutes.label")}</Label>
                  <Input
                    id="exam-duration"
                    type="number"
                    min={1}
                    max={600}
                    value={values.durationMinutes}
                    disabled={readOnly}
                    onChange={(event) =>
                      patchValues({ durationMinutes: Number(event.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-passing">{t("fields.passingGrade.label")}</Label>
                  <Input
                    id="exam-passing"
                    type="number"
                    min={1}
                    max={100}
                    value={values.passingGrade}
                    disabled={readOnly}
                    onChange={(event) => patchValues({ passingGrade: Number(event.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("fields.difficulty.label")}</Label>
                  <SearchableSelect
                    value={String(values.difficulty)}
                    disabled={readOnly}
                    onChange={(difficulty) => patchValues({ difficulty: Number(difficulty) })}
                    options={(["0", "1", "2"] as const).map((level) => ({
                      value: level,
                      label: t(`difficulty.${level}`),
                    }))}
                    className="gap-0"
                    triggerClassName="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-right text-sm shadow-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 md:col-span-2">
                  <ToggleSwitch
                    checked={values.shuffleQuestions}
                    disabled={readOnly}
                    ariaLabel={t("fields.shuffleQuestions.label")}
                    onCheckedChange={(checked) => patchValues({ shuffleQuestions: checked })}
                  />
                  <Label>{t("fields.shuffleQuestions.label")}</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={readOnly || generating}
                  onClick={() => void handleGenerateAi()}
                >
                  <Wand2 className="ms-1 h-4 w-4" />
                  {t("upload.aiButton")}
                </Button>
                <h3 className="text-lg font-bold text-[#1E3A66]">{t("sections.upload")}</h3>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handleFileChange}
              />

              {sourceFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {!readOnly ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSourceFiles((prev) => prev.filter((item) => item.id !== file.id))
                        }
                        className="rounded-full bg-slate-200 p-0.5 text-slate-500 hover:bg-rose-100 hover:text-rose-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    {file.uploaded || file.fileUrl ? (
                      <span className="text-xs text-emerald-500">{t("upload.uploaded")}</span>
                    ) : null}
                    <span className="text-xs text-slate-400">{file.sizeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                      <FileUp className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}

              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleSourcesDragOver}
                  onDragEnter={handleSourcesDragOver}
                  onDragLeave={handleSourcesDragLeave}
                  onDrop={handleSourcesDrop}
                  className={cn(
                    "flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed py-8 text-sm transition-colors",
                    isDragOverSources
                      ? "border-[#C8AC59] bg-[#FFFBF0] text-[#C8AC59]"
                      : "border-slate-200 text-slate-400 hover:border-[#C8AC59]/70 hover:text-[#C8AC59]",
                  )}
                >
                  <FileUp className="h-8 w-8" />
                  <p className="font-semibold">{t("upload.drag")}</p>
                  <p className="text-xs">
                    {t("upload.formats")} · {t("upload.maxSize")}
                  </p>
                </button>
              ) : null}
            </CardContent>
          </Card>
        </main>

        <aside className=" space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 text-right">
              <p className="text-sm text-white/70">{t("sidebar.passingTitle")}</p>
              <p className="text-4xl font-extrabold text-[#C8AC59]">{values.passingGrade}%</p>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#C8AC59]"
                  style={{ width: `${values.passingGrade}%` }}
                />
              </div>
              <p className="text-xs text-white/60">{t("sidebar.passingNote")}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 text-right">
              <div className="flex items-center justify-between">
                <DashboardBadge tone="success">{t("sidebar.draft")}</DashboardBadge>
                <h2 className="font-bold text-[#1E3A66]">{t("sidebar.summaryTitle")}</h2>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  {
                    label: t("sidebar.questions"),
                    value: `${values.numberOfQuestions} ${t("sidebar.questionsUnit")}`,
                  },
                  {
                    label: t("sidebar.time"),
                    value: `${values.durationMinutes} ${t("sidebar.minutes")}`,
                  },
                  {
                    label: t("sidebar.type"),
                    value: t("sidebar.typeValue"),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="font-semibold text-[#1E3A66]">{value}</span>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                disabled={submitting || generating || readOnly}
                onClick={() => void handleGenerateAi()}
              >
                <Wand2 className="h-4 w-4" />
                {generating ? t("messages.generating") : t("sidebar.generateAi")}
              </Button>

              {/* <Button
                type="button"
                className="h-11 w-full gap-2 rounded-2xl bg-[#2C4260] text-white hover:bg-[#243751]"
                onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.LIST)}
              >
                <Sparkles className="h-4 w-4" />
                {t("sidebar.generateBank")}
              </Button> */}

              {quizId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-2xl"
                  disabled={submitting || readOnly}
                  onClick={() => void handleSave()}
                >
                  {t("sidebar.saveSettings")}
                </Button>
              ) : null}

              <button
                type="button"
                className="w-full text-sm text-rose-500 hover:underline"
                onClick={() => router.push(ROUTES.ADMIN.EXAMS.LIST)}
              >
                {t("sidebar.cancel")}
              </button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-amber-100 bg-amber-50/70">
            <CardContent className="flex items-start gap-3 p-5 text-right">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="font-bold text-[#1E3A66]">{t("tip.title")}</p>
                <p className="text-xs leading-relaxed text-slate-600">{t("tip.body")}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
