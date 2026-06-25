"use client";

import {
  CalendarDays,
  Clock,
  FileUp,
  Globe,
  Lock,
  Plus,
  Save,
  Sparkles,
  Swords,
  Timer,
  Zap,
  ClipboardList,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type {
  ChallengeStation,
  ChallengeTypeId,
  FlashcardDifficultyId,
  LiveBroadcastAttachment,
} from "@/modules/admin/domain/data/journeyEditorData";
import { mockChallengeStation } from "@/modules/admin/domain/data/journeyEditorData";
import {
  createChallenge,
  generateChallengeQuestions,
  getChallenge,
  getChallengeIdForStation,
  getSupportedTimezones,
  updateChallenge,
  type Challenge,
  type ChallengeAttachmentPayload,
  type CreateChallengePayload,
  type UpdateChallengePayload,
} from "@/modules/admin/infrastructure/api/challengesApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { getStation } from "@/modules/admin/infrastructure/api/stationsApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ChallengeType, DifficultyLevel } from "@/shared/domain/enums/cms.enums";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import {
  ChallengeScheduleDateField,
  JourneyEditorStationPageSkeleton,
} from "@/modules/admin/presentation/components/journey-editor";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

type PendingSourceFile = LiveBroadcastAttachment & {
  file?: File;
  fileUrl?: string;
  fileSizeBytes?: number;
};

const QUESTIONS_COUNT_OPTIONS = [5, 10, 15, 20] as const;
const DURATION_OPTIONS = [5, 8, 10, 15, 20] as const;
const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];
const MAX_SOURCE_FILE_BYTES = 100 * 1024 * 1024;
const CHALLENGE_SOURCE_UPLOAD_FOLDER = "challenges/sources";
const ACCEPTED_SOURCE_EXTENSIONS = new Set(["pdf", "pptx", "mp4"]);

const CHALLENGE_TYPES: {
  id: ChallengeTypeId;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: "timeChallenge", icon: <Timer className="h-7 w-7" />, color: "text-blue-500" },
  { id: "shortQuiz", icon: <ClipboardList className="h-7 w-7" />, color: "text-slate-600" },
  { id: "speedChallenge", icon: <Zap className="h-7 w-7" />, color: "text-amber-500" },
];

const CHALLENGE_TYPE_TO_API: Record<ChallengeTypeId, ChallengeType> = {
  timeChallenge: ChallengeType.TimeChallenge,
  shortQuiz: ChallengeType.ShortQuiz,
  speedChallenge: ChallengeType.SpeedChallenge,
};

const DIFFICULTY_TO_API: Record<FlashcardDifficultyId, DifficultyLevel> = {
  easy: DifficultyLevel.Easy,
  medium: DifficultyLevel.Medium,
  hard: DifficultyLevel.Hard,
};

const API_TO_CHALLENGE_TYPE: Record<number, ChallengeTypeId> = {
  [ChallengeType.TimeChallenge]: "timeChallenge",
  [ChallengeType.ShortQuiz]: "shortQuiz",
  [ChallengeType.SpeedChallenge]: "speedChallenge",
};

const API_TO_DIFFICULTY: Record<number, FlashcardDifficultyId> = {
  [DifficultyLevel.Easy]: "easy",
  [DifficultyLevel.Medium]: "medium",
  [DifficultyLevel.Hard]: "hard",
};

const STATION_CHALLENGE_STORAGE_KEY_PREFIX = "admin.challenge.station.";

function createDefaultStation(stationId: string): ChallengeStation {
  return {
    ...structuredClone(mockChallengeStation),
    id: "",
    stationId,
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

function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function toTimeInputValue(hours: number, minutes = 0) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toApiTime(value: string) {
  if (!value.trim()) return "00:00:00";
  return value.length === 5 ? `${value}:00` : value;
}

function fromApiTime(value: string) {
  if (!value.trim()) return "09:00";
  return value.slice(0, 5);
}

function getStoredChallengeId(stationId: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${STATION_CHALLENGE_STORAGE_KEY_PREFIX}${stationId}`);
}

function storeChallengeId(stationId: string, challengeId: string) {
  window.localStorage.setItem(`${STATION_CHALLENGE_STORAGE_KEY_PREFIX}${stationId}`, challengeId);
}

function clearStoredChallengeId(stationId: string) {
  window.localStorage.removeItem(`${STATION_CHALLENGE_STORAGE_KEY_PREFIX}${stationId}`);
}

function parseScheduleDateTime(date: string, time: string) {
  return new Date(`${date}T${toApiTime(time)}`);
}

function readZonedDateTimeParts(date: Date, timeZoneId: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timeZoneId,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
}

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  const value = parts.find((part) => part.type === type)?.value ?? "0";
  return Number(value);
}

function isScheduleStartInPast(date: string, time: string, timeZoneId: string) {
  if (!date || !time || !timeZoneId) return false;

  const dateParts = date.split("-").map(Number);
  const timeParts = time.split(":").map(Number);
  if (dateParts.length < 3 || timeParts.length < 2) return false;

  const year = dateParts[0] ?? Number.NaN;
  const month = dateParts[1] ?? Number.NaN;
  const day = dateParts[2] ?? Number.NaN;
  const hours = timeParts[0] ?? Number.NaN;
  const minutes = timeParts[1] ?? Number.NaN;

  if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
    return false;
  }

  const nowParts = readZonedDateTimeParts(new Date(), timeZoneId);
  const nowYear = partValue(nowParts, "year");
  const nowMonth = partValue(nowParts, "month");
  const nowDay = partValue(nowParts, "day");
  const nowHour = partValue(nowParts, "hour");
  const nowMinute = partValue(nowParts, "minute");

  if (year !== nowYear) return year < nowYear;
  if (month !== nowMonth) return month < nowMonth;
  if (day !== nowDay) return day < nowDay;
  if (hours !== nowHour) return hours < nowHour;
  return minutes < nowMinute;
}

function pickDefaultTimeZone(timezones: string[]) {
  if (!timezones.length) return "";
  try {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTz && timezones.includes(browserTz)) return browserTz;
  } catch {
    // ignore
  }
  if (timezones.includes("Asia/Riyadh")) return "Asia/Riyadh";
  return timezones[0] ?? "";
}

export function AdminJourneyChallengeEditorPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.challengeEditor");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const routes = useScopedDashboardRoutes();

  const [station, setStation] = useState<ChallengeStation | null>(null);
  const [stationName, setStationName] = useState("");
  const [sourceFiles, setSourceFiles] = useState<PendingSourceFile[]>([]);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(() => toDateInputValue());
  const [endDate, setEndDate] = useState(() => toDateInputValue());
  const [startTime, setStartTime] = useState(() => toTimeInputValue(9));
  const [endTime, setEndTime] = useState(() => toTimeInputValue(17));
  const [timeZoneId, setTimeZoneId] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [hasChallenge, setHasChallenge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyChallengeToForm = (challenge: Challenge, availableTimezones: string[]) => {
    const challengeType = API_TO_CHALLENGE_TYPE[challenge.type] ?? "shortQuiz";
    const difficulty = API_TO_DIFFICULTY[challenge.difficulty] ?? "medium";
    const durationMin = DURATION_OPTIONS.includes(
      challenge.durationMinutes as (typeof DURATION_OPTIONS)[number],
    )
      ? challenge.durationMinutes
      : DURATION_OPTIONS[0];
    const questionsCount: ChallengeStation["questionsCount"] = QUESTIONS_COUNT_OPTIONS.includes(
      challenge.questionCount as (typeof QUESTIONS_COUNT_OPTIONS)[number],
    )
      ? (challenge.questionCount as ChallengeStation["questionsCount"])
      : QUESTIONS_COUNT_OPTIONS[0];

    setStation({
      id: challenge.id,
      stationId: challenge.stationId || stationId,
      challengeType,
      questionsCount,
      durationMin: durationMin as ChallengeStation["durationMin"],
      difficulty,
      sourceFiles: [],
    });
    setStartDate(challenge.challengeDate || toDateInputValue());
    setEndDate(challenge.endDate || challenge.challengeDate || toDateInputValue());
    setStartTime(fromApiTime(challenge.startTime));
    setEndTime(fromApiTime(challenge.endTime));
    if (challenge.timeZoneId) {
      setTimeZoneId(challenge.timeZoneId);
    } else if (availableTimezones.length) {
      setTimeZoneId(pickDefaultTimeZone(availableTimezones));
    }
    if (challenge.title.trim()) {
      setStationName(challenge.title.trim());
    }
    setSourceFiles(
      challenge.attachments.map((attachment, index) => ({
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
      setHasChallenge(false);
      setChallengeId(null);

      const [stationResult, timezonesResult] = await Promise.all([
        getStation(stationId),
        getSupportedTimezones(),
      ]);

      const availableTimezones = timezonesResult.data ?? [];
      if (availableTimezones.length) {
        setTimezones(availableTimezones);
        setTimeZoneId(pickDefaultTimeZone(availableTimezones));
      } else if (timezonesResult.errorMessage) {
        notify.error(timezonesResult.errorMessage);
      }

      if (stationResult.data?.name.trim()) {
        setStationName(stationResult.data.name.trim());
      } else if (stationResult.errorMessage && stationResult.status !== "NotFound") {
        notify.error(stationResult.errorMessage);
      }

      let resolvedChallengeId = getStoredChallengeId(stationId);
      if (!resolvedChallengeId) {
        const stationChallengeResult = await getChallengeIdForStation(stationId);
        resolvedChallengeId = stationChallengeResult.data;
      }

      if (resolvedChallengeId) {
        const challengeResult = await getChallenge(resolvedChallengeId);
        if (challengeResult.data) {
          storeChallengeId(stationId, challengeResult.data.id);
          setChallengeId(challengeResult.data.id);
          setHasChallenge(true);
          applyChallengeToForm(challengeResult.data, availableTimezones);
          setLoading(false);
          return;
        }

        if (challengeResult.status === "NotFound") {
          clearStoredChallengeId(stationId);
        } else if (challengeResult.errorMessage) {
          notify.error(challengeResult.errorMessage);
        }
      }

      setStation(createDefaultStation(stationId));
      setHasChallenge(false);
      setLoading(false);
    })();
  }, [stationId]);

  useEffect(() => {
    if (endDate < startDate) setEndDate(startDate);
  }, [startDate, endDate]);

  const update = <K extends keyof ChallengeStation>(key: K, value: ChallengeStation[K]) => {
    setStation((prev) => (prev ? { ...prev, [key]: value } : prev));
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

  const uploadSourceFiles = async (): Promise<ChallengeAttachmentPayload[] | null> => {
    const uploaded: ChallengeAttachmentPayload[] = [];

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

      const uploadResult = await uploadAdminFile(source.file, CHALLENGE_SOURCE_UPLOAD_FOLDER);
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

  const handleSave = async () => {
    if (!station) return;

    setSaving(true);
    const payload = await buildChallengePayload({ allowPastSchedule: false });
    if (!payload) {
      setSaving(false);
      return;
    }

    const result = await createChallenge(payload);
    setSaving(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.saveError"));
      return;
    }

    storeChallengeId(stationId, result.data.id);
    setChallengeId(result.data.id);
    setHasChallenge(true);
    setStation((prev) => (prev ? { ...prev, id: result.data!.id } : prev));
    syncUploadedSourceFiles(payload.attachments);
    notify.success(t("messages.saveSuccess"));
  };

  const handleUpdate = async () => {
    if (!station || !challengeId) return;

    setSaving(true);
    const payload = await buildChallengePayload({ allowPastSchedule: true });
    if (!payload) {
      setSaving(false);
      return;
    }

    const updatePayload: UpdateChallengePayload = {
      id: challengeId,
      stationId: payload.stationId,
      title: payload.title,
      type: payload.type,
      durationMinutes: payload.durationMinutes,
      questionCount: payload.questionCount,
      difficulty: payload.difficulty,
      challengeDate: payload.challengeDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      timeZoneId: payload.timeZoneId,
      aiSourceFileUrl: payload.aiSourceFileUrl,
      attachments: payload.attachments,
    };

    const result = await updateChallenge(challengeId, updatePayload);
    setSaving(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.updateError"));
      return;
    }

    setStation((prev) => (prev ? { ...prev, id: result.data!.id } : prev));
    syncUploadedSourceFiles(payload.attachments);
    notify.success(t("messages.updateSuccess"));
  };

  async function buildChallengePayload(options: {
    allowPastSchedule: boolean;
  }): Promise<CreateChallengePayload | null> {
    if (!station) return null;

    const title = stationName.trim();
    if (!title) {
      notify.error(t("messages.stationNameRequired"));
      return null;
    }
    if (!startDate || !endDate) {
      notify.error(t("messages.scheduleRequired"));
      return null;
    }
    if (!startTime || !endTime) {
      notify.error(t("messages.scheduleTimeRequired"));
      return null;
    }
    if (!timeZoneId) {
      notify.error(t("messages.timezoneRequired"));
      return null;
    }

    const scheduleStart = parseScheduleDateTime(startDate, startTime);
    const scheduleEnd = parseScheduleDateTime(endDate, endTime);
    if (Number.isNaN(scheduleStart.getTime()) || Number.isNaN(scheduleEnd.getTime())) {
      notify.error(t("messages.scheduleInvalid"));
      return null;
    }
    if (scheduleEnd <= scheduleStart) {
      notify.error(t("messages.scheduleEndBeforeStart"));
      return null;
    }
    if (
      !options.allowPastSchedule &&
      isScheduleStartInPast(startDate, startTime, timeZoneId)
    ) {
      notify.error(t("messages.scheduleInPast"));
      return null;
    }

    const attachments = await uploadSourceFiles();
    if (attachments === null) {
      return null;
    }

    return {
      stationId,
      title,
      type: CHALLENGE_TYPE_TO_API[station.challengeType],
      durationMinutes: station.durationMin,
      questionCount: station.questionsCount,
      difficulty: DIFFICULTY_TO_API[station.difficulty],
      challengeDate: startDate,
      startTime: toApiTime(startTime),
      endTime: toApiTime(endTime),
      timeZoneId,
      aiSourceFileUrl: attachments[0]?.fileUrl ?? "",
      attachments,
    };
  }

  function syncUploadedSourceFiles(attachments: ChallengeAttachmentPayload[]) {
    setSourceFiles((prev) =>
      prev.map((file, index) => ({
        ...file,
        file: undefined,
        fileUrl: attachments[index]?.fileUrl ?? file.fileUrl,
        fileSizeBytes: attachments[index]?.fileSizeBytes ?? file.fileSizeBytes,
      })),
    );
  }

  const handleGenerateQuestions = async () => {
    if (!challengeId) {
      notify.error(t("messages.challengeRequiredForQuestions"));
      return;
    }

    setGeneratingQuestions(true);
    const result = await generateChallengeQuestions(challengeId);
    setGeneratingQuestions(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.generateQuestionsError"));
      return;
    }

    notify.success(t("messages.generateQuestionsSuccess"));
  };

  if (loading || !station) {
    return <JourneyEditorStationPageSkeleton showSidebar />;
  }

  const scheduleSummary = t("sidebar.scheduleValue", {
    startDate,
    endDate,
    startTime,
    endTime,
    timezone: timeZoneId || "—",
  });

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: routes.home },
          {
            label: tBc("journeyEditor"),
            href: routes.journeyEditor.EDITOR(journeyId),
          },
          { label: tBc("challengeEditor") },
        ]}
        action={
          hasChallenge ? (
            <div className="flex flex-wrap gap-3">
              <Button
                className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
                onClick={() => void handleUpdate()}
                disabled={saving || generatingQuestions}
              >
                <Save className="h-4 w-4" />
                {t("actions.updateChallenge")}
              </Button>
              <Button
                className="h-12 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243652] shadow-[0px_4px_0px_0px_#0000000D]"
                onClick={() => void handleGenerateQuestions()}
                disabled={generatingQuestions || saving}
              >
                <Sparkles className="h-4 w-4" />
                {t("actions.generateQuestions")}
              </Button>
            </div>
          ) : (
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
              {t("actions.createChallenge")}
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          {/* {!hasChallenge ? (
            <Card className="rounded-[1.75rem] border-dashed border-[#C8AC59]/40 bg-[#FFFBF0] shadow-none">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C8AC59]/15 text-[#C8AC59]">
                  <Swords className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-800">{t("emptyState.title")}</h2>
                  <p className="text-sm text-slate-500">{t("emptyState.description")}</p>
                </div>
                <Button
                  className="h-11 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46]"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.createChallenge")}
                </Button>
              </CardContent>
            </Card>
          ) : null} */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="text-right font-bold text-slate-800">{t("sections.type")}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {CHALLENGE_TYPES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update("challengeType", opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-[1.5rem] border-2 p-6 text-center transition-colors",
                      station.challengeType === opt.id
                        ? "border-[#2C4260] bg-[#EEF2FB]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300",
                    )}
                  >
                    <span className={opt.color}>{opt.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800">{t(`types.${opt.id}`)}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {t(`types.${opt.id}Description`)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 text-right font-bold text-slate-800">
                <Swords className="h-4 w-4 text-slate-400" />
                {t("sections.settings")}
              </h2>

              {stationName ? (
                <p className="text-right text-sm text-slate-500">
                  {t("settings.stationTitle")}:{" "}
                  <span className="font-semibold text-slate-700">{stationName}</span>
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.questionsCount")}
                  </p>
                  <div className="flex gap-3">
                    {QUESTIONS_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => update("questionsCount", count)}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-colors",
                          station.questionsCount === count
                            ? "bg-[#2C4260] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-right">
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
                          "min-w-[5rem] rounded-xl py-2.5 text-xs font-semibold transition-colors text-center",
                          station.difficulty === d
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
              <div className="space-y-2 text-right">
                <p className="text-sm font-semibold text-slate-600">{t("settings.duration")}</p>
                <div className="relative">
                  <Timer className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={station.durationMin}
                    onChange={(e) =>
                      update(
                        "durationMin",
                        Number(e.target.value) as ChallengeStation["durationMin"],
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 text-right font-bold text-slate-800">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                {t("sections.schedule")}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChallengeScheduleDateField
                  id="challenge-start-date"
                  label={t("schedule.startDate")}
                  value={startDate}
                  onChange={setStartDate}
                  placeholder={t("schedule.datePlaceholder")}
                />
                <ChallengeScheduleDateField
                  id="challenge-end-date"
                  label={t("schedule.endDate")}
                  value={endDate}
                  minDate={startDate}
                  onChange={setEndDate}
                  placeholder={t("schedule.datePlaceholder")}
                />
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-600" htmlFor="challenge-start-time">
                    {t("schedule.startTime")}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="challenge-start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59]"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-600" htmlFor="challenge-end-time">
                    {t("schedule.endTime")}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="challenge-end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-600" htmlFor="challenge-timezone">
                  {t("schedule.timezone")}
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    id="challenge-timezone"
                    value={timeZoneId}
                    onChange={(e) => setTimeZoneId(e.target.value)}
                    disabled={!timezones.length}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {!timeZoneId ? (
                      <option value="">{t("schedule.timezonePlaceholder")}</option>
                    ) : null}
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="text-right text-sm font-bold text-slate-700">
                <span className="ml-2 text-slate-400">03.</span>
                {t("sections.sources")}
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.mp4"
                multiple
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
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]"
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

              <div className="space-y-2">
                {[
                  ...(stationName
                    ? [{ label: t("sidebar.stationTitle"), value: stationName }]
                    : []),
                  {
                    label: t("sidebar.type"),
                    value: t(`types.${station.challengeType}`),
                  },
                  {
                    label: t("sidebar.schedule"),
                    value: scheduleSummary,
                  },
                  {
                    label: t("sidebar.questionsCount"),
                    value: `${station.questionsCount} ${t("sidebar.questions")}`,
                  },
                  {
                    label: t("sidebar.time"),
                    value: `${station.durationMin} ${t("sidebar.minutes")}`,
                  },
                  {
                    label: t("sidebar.level"),
                    value: t(`difficulty.${station.difficulty}`),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2"
                  >
                    <span className="text-xs text-white/60">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              {hasChallenge ? (
                <>
                  <Button
                    className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                    onClick={() => void handleUpdate()}
                    disabled={saving || generatingQuestions}
                  >
                    <Save className="h-4 w-4" />
                    {t("actions.updateChallenge")}
                  </Button>
                  <Button
                    className="h-11 w-full gap-2 rounded-2xl bg-[#2C4260] text-white hover:bg-[#243652]"
                    onClick={() => void handleGenerateQuestions()}
                    disabled={generatingQuestions || saving}
                  >
                    <Sparkles className="h-4 w-4" />
                    {t("actions.generateQuestions")}
                  </Button>
                </>
              ) : (
                <Button
                  className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.createChallenge")}
                </Button>
              )}

              <div className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200">
                <Lock className="h-3.5 w-3.5" />
                {t("sidebar.locked")}
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-[#C8AC59]/20 p-3 text-xs text-[#C8AC59]">
                <Sparkles className="h-4 w-4 shrink-0" />
                {t("sidebar.aiNote")}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
