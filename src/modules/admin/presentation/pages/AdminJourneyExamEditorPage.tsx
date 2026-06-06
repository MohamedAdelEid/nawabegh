"use client";

import {
  ClipboardList,
  Eye,
  FileUp,
  Plus,
  Save,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type {
  ExamStation,
  FlashcardDifficultyId,
  LiveBroadcastAttachment,
} from "@/modules/admin/domain/data/journeyEditorData";
import { mockExamStation } from "@/modules/admin/domain/data/journeyEditorData";
import {
  mapExamStationToUpdateSettingsPayload,
  mapQuizToExamStation,
} from "@/modules/admin/domain/utils/quizExamMappers";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  clearStoredQuizId,
  createQuiz,
  getQuiz,
  resolveQuizIdForStation,
  storeQuizId,
  updateQuizSettings,
  type Quiz,
  type QuizAttachmentPayload,
} from "@/modules/admin/infrastructure/api/quizzesApi";
import { getStation } from "@/modules/admin/infrastructure/api/stationsApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { DifficultyLevel } from "@/shared/domain/enums/cms.enums";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { JourneyEditorStationPageSkeleton } from "@/modules/admin/presentation/components/journey-editor";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";

interface Props {
  journeyId: string;
  stationId: string;
}

type PendingSourceFile = LiveBroadcastAttachment & {
  file?: File;
  fileUrl?: string;
  fileSizeBytes?: number;
};

const DURATION_OPTIONS = [5, 10, 15, 30] as const;
const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];
const ATTEMPTS_OPTIONS: ExamStation["maxAttempts"][] = ["one", "two", "three", "unlimited"];
const MAX_SOURCE_FILE_BYTES = 100 * 1024 * 1024;
const QUIZ_SOURCE_UPLOAD_FOLDER = "quizzes/sources";
const ACCEPTED_SOURCE_EXTENSIONS = new Set(["pdf", "pptx", "mp4"]);
const DIFFICULTY_TO_API: Record<FlashcardDifficultyId, DifficultyLevel> = {
  easy: DifficultyLevel.Easy,
  medium: DifficultyLevel.Medium,
  hard: DifficultyLevel.Hard,
};

const ATTEMPTS_TO_API: Record<ExamStation["maxAttempts"], number> = {
  one: 1,
  two: 2,
  three: 3,
  unlimited: 0,
};

function createDefaultExam(stationId: string): ExamStation {
  return {
    ...structuredClone(mockExamStation),
    id: "",
    stationId,
    name: "",
    aiSourceFileUrl: "",
    questions: [],
    sourceFiles: [],
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.at(-1)!.toLowerCase() : "";
}

function resolveAttachmentType(extension: string): LiveBroadcastAttachment["type"] {
  if (extension === "pdf") return "pdf";
  if (extension === "pptx") return "pptx";
  if (extension === "mp4") return "mp4";
  return "other";
}

export function AdminJourneyExamEditorPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examEditor");
  const tPreview = useTranslations("admin.dashboard.journeyEditor.examPreview.settings");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [exam, setExam] = useState<ExamStation | null>(null);
  const [sourceFiles, setSourceFiles] = useState<PendingSourceFile[]>([]);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyQuizToForm = (quiz: Quiz) => {
    const mapped = mapQuizToExamStation(quiz, stationId);
    setExam(mapped);
    setSourceFiles(
      quiz.quizAttachments.map((attachment, index) => ({
        id: `sf-loaded-${index}`,
        name: attachment.fileName,
        type: resolveAttachmentType(attachment.fileExtension),
        sizeLabel: formatFileSize(attachment.fileSizeBytes),
        fileUrl: attachment.fileUrl,
        fileSizeBytes: attachment.fileSizeBytes,
      })),
    );
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setHasQuiz(false);

      const stationResult = await getStation(stationId);
      if (stationResult.errorMessage && stationResult.status !== "NotFound") {
        notify.error(stationResult.errorMessage);
      }

      const resolvedQuizId = await resolveQuizIdForStation(stationId);

      if (resolvedQuizId) {
        const quizResult = await getQuiz(resolvedQuizId);
        if (quizResult.data) {
          storeQuizId(stationId, quizResult.data.id);
          setHasQuiz(true);
          applyQuizToForm(quizResult.data);
          if (!quizResult.data.title.trim() && stationResult.data?.name.trim()) {
            setExam((prev) =>
              prev ? { ...prev, name: stationResult.data!.name.trim() } : prev,
            );
          }
          setLoading(false);
          return;
        }

        if (quizResult.status === "NotFound") {
          clearStoredQuizId(stationId);
        } else if (quizResult.errorMessage) {
          notify.error(quizResult.errorMessage);
        }
      }

      const defaultExam = createDefaultExam(stationId);
      if (stationResult.data?.name.trim()) {
        defaultExam.name = stationResult.data.name.trim();
      }
      setExam(defaultExam);
      setSourceFiles([]);
      setHasQuiz(false);
      setLoading(false);
    })();
  }, [stationId]);

  const update = <K extends keyof ExamStation>(key: K, value: ExamStation[K]) => {
    setExam((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;

    const nextFiles: PendingSourceFile[] = [];
    for (const file of selected) {
      const extension = getFileExtension(file.name);
      if (!ACCEPTED_SOURCE_EXTENSIONS.has(extension)) {
        notify.error(t("upload.invalidFormat"));
        continue;
      }
      if (file.size > MAX_SOURCE_FILE_BYTES) {
        notify.error(t("upload.maxSizeExceeded"));
        continue;
      }

      nextFiles.push({
        id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: resolveAttachmentType(extension),
        sizeLabel: formatFileSize(file.size),
        fileSizeBytes: file.size,
        file,
      });
    }

    if (nextFiles.length) {
      setSourceFiles((prev) => [...prev, ...nextFiles]);
    }
  };

  const uploadSourceFiles = async (): Promise<QuizAttachmentPayload[] | null> => {
    const uploaded: QuizAttachmentPayload[] = [];

    for (const source of sourceFiles) {
      if (source.fileUrl) {
        uploaded.push({
          fileUrl: source.fileUrl,
          fileName: source.name,
          fileExtension: getFileExtension(source.name),
          fileSizeBytes: source.fileSizeBytes ?? source.file?.size ?? 0,
        });
        continue;
      }

      if (!source.file) continue;

      const uploadResult = await uploadAdminFile(source.file, QUIZ_SOURCE_UPLOAD_FOLDER);
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

  const handleCreateQuiz = async () => {
    if (!exam || hasQuiz) return;

    const title = exam.name.trim();
    if (!title) {
      notify.error(t("messages.titleRequired"));
      return;
    }

    setSaving(true);
    const quizAttachments = await uploadSourceFiles();
    if (quizAttachments === null) {
      setSaving(false);
      return;
    }

    const aiSourceFileUrl = quizAttachments[0]?.fileUrl ?? "";
    const result = await createQuiz({
      stationId,
      title,
      passScore: exam.passingGradePct,
      maxAttempts: ATTEMPTS_TO_API[exam.maxAttempts],
      durationMinutes: exam.durationMin,
      difficulty: DIFFICULTY_TO_API[exam.difficulty],
      shuffleQuestions: exam.randomOrder,
      aiSourceFileUrl,
      quizAttachments,
    });
    setSaving(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.saveError"));
      return;
    }

    storeQuizId(stationId, result.data.id);
    setHasQuiz(true);
    setExam((prev) => (prev ? { ...prev, id: result.data!.id, name: result.data!.title } : prev));
    setSourceFiles((prev) =>
      prev.map((file, index) => ({
        ...file,
        file: undefined,
        fileUrl: quizAttachments[index]?.fileUrl ?? file.fileUrl,
        fileSizeBytes: quizAttachments[index]?.fileSizeBytes ?? file.fileSizeBytes,
      })),
    );
    notify.success(t("messages.saveSuccess"));
  };

  const handleSaveSettings = async () => {
    if (!exam || !hasQuiz) return;

    const title = exam.name.trim();
    if (!title) {
      notify.error(t("messages.titleRequired"));
      return;
    }

    setSaving(true);
    const quizAttachments = await uploadSourceFiles();
    if (quizAttachments === null) {
      setSaving(false);
      return;
    }

    const result = await updateQuizSettings(
      exam.id,
      mapExamStationToUpdateSettingsPayload(exam, quizAttachments),
    );
    setSaving(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.settingsSaveError"));
      return;
    }

    setSourceFiles((prev) =>
      prev.map((file, index) => ({
        ...file,
        file: undefined,
        fileUrl: quizAttachments[index]?.fileUrl ?? file.fileUrl,
        fileSizeBytes: quizAttachments[index]?.fileSizeBytes ?? file.fileSizeBytes,
      })),
    );
    notify.success(t("messages.settingsSaveSuccess"));
  };

  if (loading || !exam) {
    return <JourneyEditorStationPageSkeleton />;
  }

  const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: ROUTES.ADMIN.HOME },
          {
            label: tBc("journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          { label: tBc("examEditor") },
        ]}
        action={
          hasQuiz ? (
            <Button
              className="h-12 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243652] shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_PREVIEW(journeyId, stationId))}
            >
              <Eye className="h-4 w-4" />
              {t("actions.preview")}
            </Button>
          ) : (
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void handleCreateQuiz()}
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
              {t("actions.createExam")}
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 font-bold text-slate-800">
                <Star className="h-4 w-4 text-[#C8AC59]" />
                {t("sections.settings")}
              </h2>

              <div className="space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">
                  {t("settings.examName")}
                </label>
                <input
                  value={exam.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("settings.examNamePlaceholder")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.duration")}
                  </p>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update("durationMin", d)}
                        className={cn(
                          "min-w-[5rem] rounded-xl py-2.5 text-xs font-bold transition-colors",
                          exam.durationMin === d
                            ? "bg-[#2C4260] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.difficulty")}
                  </p>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update("difficulty", d)}
                        className={cn(
                          "min-w-[5rem] rounded-xl py-2.5 text-xs font-semibold transition-colors",
                          exam.difficulty === d
                            ? "bg-[#2C4260] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {t(`difficulty.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#C8AC59]">
                      {exam.passingGradePct}%
                    </span>
                    <label className="text-sm font-semibold text-slate-600">
                      {t("settings.passingGrade")}
                    </label>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={5}
                    value={exam.passingGradePct}
                    onChange={(e) => update("passingGradePct", Number(e.target.value))}
                    className="w-full accent-[#C8AC59]"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-semibold text-slate-600">
                    {t("settings.attempts")}
                  </label>
                  <select
                    value={exam.maxAttempts}
                    onChange={(e) => update("maxAttempts", e.target.value as ExamStation["maxAttempts"])}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                  >
                    {ATTEMPTS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {t(`settings.attemptsOptions.${opt}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <ToggleSwitch
                  checked={exam.randomOrder}
                  onCheckedChange={(checked) => update("randomOrder", checked)}
                  ariaLabel={tPreview("randomOrder")}
                />
                <div className="space-y-0.5 text-right">
                  <p className="text-sm font-semibold text-slate-600">{tPreview("randomOrder")}</p>
                  <p className="text-xs text-slate-400">{tPreview("randomOrderDesc")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="text-right text-sm font-bold text-slate-700">
                <span className="ml-2 text-slate-400">02.</span>
                {t("sections.sources")}
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.mp4"
                className="hidden"
                onChange={handleFileChange}
              />

              {sourceFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSourceFiles((prev) => prev.filter((f) => f.id !== file.id))
                      }
                      className="rounded-full bg-slate-200 p-0.5 text-slate-500 hover:bg-rose-100 hover:text-rose-500"
                    >
                      ×
                    </button>
                    {file.fileUrl ? (
                      <span className="text-xs text-emerald-500">{t("upload.uploaded")}</span>
                    ) : null}
                    <span className="text-xs text-slate-400">{file.sizeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                      <FileUp className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-7 text-sm text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]"
              >
                <FileUp className="h-8 w-8" />
                <p className="font-semibold">{t("upload.drag")}</p>
                <p className="text-xs">
                  {t("upload.formats")} · {t("upload.maxSize")}
                </p>
              </button>
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-bold">{t("sidebar.title")}</h2>

              <div className="space-y-2 text-sm">
                {[
                  {
                    label: t("sidebar.questionsCount"),
                    value: `${exam.questions.length} ${t("sidebar.questions")}`,
                  },
                  {
                    label: t("sidebar.time"),
                    value: `${exam.durationMin} ${t("sidebar.minutes")}`,
                  },
                  {
                    label: t("sidebar.difficulty"),
                    value: t(`difficulty.${exam.difficulty}`),
                  },
                  {
                    label: t("sidebar.passing"),
                    value: `${exam.passingGradePct}%`,
                    className: "text-[#C8AC59]",
                  },
                  {
                    label: t("sidebar.totalPoints"),
                    value: `${totalPoints} ${t("sidebar.points")}`,
                    className: "text-[#C8AC59]",
                  },
                ].map(({ label, value, className }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2"
                  >
                    <span className="text-xs text-white/60">{label}</span>
                    <span className={cn("font-bold", className)}>{value}</span>
                  </div>
                ))}
              </div>

              {hasQuiz ? (
                <Button
                  className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                  onClick={() => void handleSaveSettings()}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {t("actions.saveSettings")}
                </Button>
              ) : (
                <Button
                  className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                  onClick={() => void handleCreateQuiz()}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {t("sidebar.saveAndPublish")}
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
