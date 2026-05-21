"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileUp,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { LiveBroadcastObjective, LiveBroadcastPreTask } from "@/modules/admin/domain/data/journeyEditorData";
import { getCourseForEdit } from "@/modules/admin/infrastructure/api/courseApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { createLiveSession } from "@/modules/admin/infrastructure/api/liveSessionsApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";

interface Props {
  journeyId: string;
  stationId: string;
}

type PendingAttachment = {
  id: string;
  name: string;
  type: string;
  sizeLabel: string;
  file: File;
};

const STEPS = ["basicInfo", "additionalDetails", "educationalContent"] as const;
type StepId = (typeof STEPS)[number];

const LIVE_SESSION_COVER_UPLOAD_FOLDER = "live-sessions/covers";
const LIVE_SESSION_ATTACHMENT_UPLOAD_FOLDER = "live-sessions/attachments";
const STATION_SESSION_STORAGE_KEY_PREFIX = "admin.liveSession.station.";

function storeSessionId(stationId: string, sessionId: string) {
  window.localStorage.setItem(`${STATION_SESSION_STORAGE_KEY_PREFIX}${stationId}`, sessionId);
}

const STEP_ICONS: Record<StepId, React.ReactNode> = {
  basicInfo: <Video className="h-4 w-4" />,
  additionalDetails: <Clock className="h-4 w-4" />,
  educationalContent: <FileUp className="h-4 w-4" />,
};

/** Returns true if the step has enough data to be considered "touched/complete" */
function isStepComplete(
  step: StepId,
  {
    title,
    date,
    time,
    objectives,
  }: { title: string; date: string; time: string; objectives: { text: string }[] },
) {
  if (step === "basicInfo") return title.trim().length > 0;
  if (step === "additionalDetails") return date.trim().length > 0 && time.trim().length > 0;
  if (step === "educationalContent") return objectives.some((o) => o.text.trim().length > 0);
  return false;
}

export function AdminJourneyLiveBroadcastAddPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.liveBroadcastAdd");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [activeStep, setActiveStep] = useState<StepId>("basicInfo");
  const [saving, setSaving] = useState(false);
  const [responsibleTeacherId, setResponsibleTeacherId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [objectives, setObjectives] = useState<LiveBroadcastObjective[]>([
    { id: "obj-1", text: "" },
  ]);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [preTasks, setPreTasks] = useState<LiveBroadcastPreTask[]>([
    { id: "pt-1", label: "", subtitle: "", completed: false },
  ]);

  const thumbRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const courseResult = await getCourseForEdit(journeyId);
      if (courseResult.data?.teacherId) {
        setResponsibleTeacherId(courseResult.data.teacherId);
      }
    })();
  }, [journeyId]);

  useEffect(() => {
    if (!coverImageFile) {
      setCoverImagePreviewUrl(null);
      return;
    }
    const previewUrl = URL.createObjectURL(coverImageFile);
    setCoverImagePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [coverImageFile]);

  const stepIndex = STEPS.indexOf(activeStep);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const goNext = () => {
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) setActiveStep(nextStep);
  };
  const goPrev = () => {
    const prevStep = STEPS[stepIndex - 1];
    if (prevStep) setActiveStep(prevStep);
  };

  const addObjective = () => {
    setObjectives((prev) => [...prev, { id: `obj-${Date.now()}`, text: "" }]);
  };

  const updateObjective = (id: string, text: string) => {
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const removeObjective = (id: string) => {
    setObjectives((prev) => (prev.length <= 1 ? prev : prev.filter((o) => o.id !== id)));
  };

  const addPreTask = () => {
    setPreTasks((prev) => [
      ...prev,
      { id: `pt-${Date.now()}`, label: "", subtitle: "", completed: false },
    ]);
  };

  const updatePreTask = (id: string, field: "label" | "subtitle", value: string) => {
    setPreTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task)),
    );
  };

  const removePreTask = (id: string) => {
    setPreTasks((prev) => (prev.length <= 1 ? prev : prev.filter((task) => task.id !== id)));
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
  };

  const handleAttachChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "other";
    const type = ["pdf", "pptx", "mp4", "xlsx"].includes(ext) ? ext : "other";
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        name: file.name,
        type,
        sizeLabel: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        file,
      },
    ]);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!title.trim()) {
      notify.error(t("messages.titleRequired"));
      return;
    }
    if (!responsibleTeacherId.trim()) {
      notify.error(t("messages.teacherRequired"));
      return;
    }
    if (!date.trim() || !time.trim()) {
      notify.error(t("messages.scheduleRequired"));
      return;
    }

    setSaving(true);

    let coverImageUrl = "";
    if (coverImageFile) {
      const coverUpload = await uploadAdminFile(coverImageFile, LIVE_SESSION_COVER_UPLOAD_FOLDER);
      if (!coverUpload.ok) {
        setSaving(false);
        notify.error(coverUpload.errorMessage);
        return;
      }
      coverImageUrl = coverUpload.filePath;
    }

    const uploadedAttachments: {
      fileName: string;
      fileUrl: string;
      fileType: string;
      order: number;
    }[] = [];

    for (const [index, attachment] of attachments.entries()) {
      const uploadResult = await uploadAdminFile(
        attachment.file,
        LIVE_SESSION_ATTACHMENT_UPLOAD_FOLDER,
      );
      if (!uploadResult.ok) {
        setSaving(false);
        notify.error(uploadResult.errorMessage);
        return;
      }
      uploadedAttachments.push({
        fileName: attachment.name,
        fileUrl: uploadResult.filePath,
        fileType: attachment.type,
        order: index,
      });
    }

    const goals = objectives
      .map((objective, index) => ({ text: objective.text.trim(), order: index }))
      .filter((goal) => goal.text.length > 0);

    const preSessionTasks = preTasks
      .map((task, index) => ({
        title: task.label.trim(),
        description: task.subtitle.trim(),
        order: index,
      }))
      .filter((task) => task.title.length > 0);

    const result = await createLiveSession({
      stationId,
      title: title.trim(),
      coverImageUrl,
      description: description.trim(),
      responsibleTeacherId: responsibleTeacherId.trim(),
      scheduledDate: date,
      scheduledTime: time,
      durationMinutes: duration,
      roomUrl: "",
      goals,
      preSessionTasks,
      attachments: uploadedAttachments,
    });

    setSaving(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.saveError"));
      return;
    }

    storeSessionId(stationId, result.data.id);
    notify.success(t("messages.saveSuccess"));
    router.push(ROUTES.ADMIN.JOURNEY_EDITOR.LIVE_BROADCAST_VIEW(journeyId, stationId));
  };

  const durationOptions = [30, 45, 60, 90, 120].map((minutes) => ({
    value: String(minutes),
    label: `${minutes} ${t("fields.durationMinutes")}`,
  }));

  const completionState = { title, date, time, objectives };

  /* ─── Step content ──────────────────────────────────────────── */

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
          { label: tBc("liveBroadcastAdd") },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {t("actions.saveAndPublish")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── Main content ── */}
        <main className="space-y-4">
          {/* ── Step progress bar (mobile-friendly) ── */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
            {STEPS.map((step, idx) => {
              const isActive = step === activeStep;
              const isDone = isStepComplete(step, completionState);
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(step)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-[#2C4260] text-white shadow-sm"
                      : isDone
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                      isActive
                        ? "bg-white text-[#2C4260]"
                        : isDone
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {isDone && !isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{t(`steps.${step}`)}</span>
                </button>
              );
            })}
          </div>

          {/* ── Step 1: Basic Info ── */}
          {activeStep === "basicInfo" && (
            <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
              <CardContent className="space-y-5 p-5">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {stepIndex + 1} / {STEPS.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FB] text-[#2C4260]">
                      <Video className="h-4 w-4" />
                    </div>
                    <h2 className="font-bold text-slate-800">{t("sections.basicInfo")}</h2>
                  </div>
                </div>

                <LabeledInput
                  label={t("fields.title")}
                  value={title}
                  onChange={setTitle}
                  placeholder={t("fields.titlePlaceholder")}
                />

                {/* Thumbnail upload */}
                <div className="space-y-2 text-right">
                  <Label className="text-[#64748B]">{t("fields.thumbnail")}</Label>
                  <input
                    ref={thumbRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbChange}
                  />
                  <button
                    type="button"
                    onClick={() => thumbRef.current?.click()}
                    className={cn(
                      "relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                      coverImagePreviewUrl
                        ? "border-[#C8AC59]/50 bg-slate-50 p-0"
                        : "border-slate-200 py-10 hover:border-[#C8AC59]/70 hover:bg-amber-50/30",
                    )}
                  >
                    {coverImagePreviewUrl ? (
                      <div className="group relative w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImagePreviewUrl}
                          alt={title || t("fields.thumbnail")}
                          className="h-40 w-full rounded-2xl object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            <ImagePlus className="h-3.5 w-3.5" />
                            {t("upload.drag")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold">{t("upload.drag")}</p>
                        <p className="text-xs text-slate-400">{t("upload.formats")}</p>
                      </div>
                    )}
                  </button>
                </div>

                <LabeledTextarea
                  label={t("fields.description")}
                  value={description}
                  onChange={setDescription}
                  placeholder={t("fields.descriptionPlaceholder")}
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Additional Details ── */}
          {activeStep === "additionalDetails" && (
            <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {stepIndex + 1} / {STEPS.length}
                  </span>
                  <h2 className="flex items-center gap-2 font-bold text-slate-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FB] text-[#2C4260]">
                      <Clock className="h-4 w-4" />
                    </div>
                    {t("sections.broadcastDetails")}
                  </h2>
                </div>

                {/* Presenter */}
                <div className="space-y-2 text-right">
                  <Label className="text-[#64748B]">{t("fields.presenter")}</Label>
                  <div
                    className={cn(
                      "flex items-center justify-end gap-2 rounded-2xl border px-4 py-3 text-sm",
                      responsibleTeacherId
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-amber-100 bg-amber-50 text-amber-600",
                    )}
                  >
                    {responsibleTeacherId ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    {responsibleTeacherId
                      ? t("fields.presenterFromCourse")
                      : t("fields.presenterMissing")}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <LabeledSelect
                    label={t("fields.duration")}
                    value={String(duration)}
                    onChange={(value) => setDuration(Number(value))}
                    options={durationOptions}
                  />

                  <div className="space-y-2 text-right">
                    <Label htmlFor="live-session-date" className="text-[#64748B]">
                      {t("fields.date")}
                    </Label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="live-session-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 pl-10 text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-right sm:col-span-2">
                    <Label htmlFor="live-session-time" className="text-[#64748B]">
                      {t("fields.time")}
                    </Label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="live-session-time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 pl-10 text-right"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 3: Educational Content ── */}
          {activeStep === "educationalContent" && (
            <>
              {/* Objectives + Attachments */}
              <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      {stepIndex + 1} / {STEPS.length}
                    </span>
                    <h2 className="flex items-center gap-2 font-bold text-slate-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                        <FileUp className="h-4 w-4" />
                      </div>
                      {t("sections.educationalContent")}
                    </h2>
                  </div>

                  {/* Learning objectives */}
                  <div className="space-y-3 text-right">
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 gap-1 rounded-xl text-xs"
                        onClick={addObjective}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t("actions.addLearningGoal")}
                      </Button>
                      <Label className="text-[#64748B]">{t("fields.objectives")}</Label>
                    </div>
                    <div className="space-y-2">
                      {objectives.map((obj) => (
                        <div key={obj.id} className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-slate-300 hover:text-rose-500"
                            onClick={() => removeObjective(obj.id)}
                            aria-label={t("actions.removeItem")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Input
                            value={obj.text}
                            onChange={(e) => updateObjective(obj.id, e.target.value)}
                            placeholder={t("fields.objectivePlaceholder")}
                            className="h-12 flex-1 rounded-2xl border-slate-100 bg-slate-50 text-right"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="space-y-3 text-right">
                    <Label className="text-[#64748B]">{t("fields.attachments")}</Label>
                    <input
                      ref={attachRef}
                      type="file"
                      className="hidden"
                      onChange={handleAttachChange}
                    />
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-300 hover:text-rose-500"
                              onClick={() =>
                                setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                              }
                              aria-label={t("actions.removeItem")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="flex min-w-0 flex-1 flex-col items-end">
                              <span className="truncate text-sm font-medium text-slate-700">
                                {att.name}
                              </span>
                              <span className="text-xs text-slate-400">{att.sizeLabel}</span>
                            </div>
                            <span className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              {att.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => attachRef.current?.click()}
                      className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 py-5 text-xs font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:bg-amber-50/20 hover:text-[#C8AC59]"
                    >
                      <FileUp className="h-5 w-5" />
                      <span>{t("upload.attachmentDrag")}</span>
                      <span className="font-normal text-slate-400">
                        {t("upload.attachmentFormats")}
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Pre-tasks */}
              <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 gap-1 rounded-xl text-xs"
                      onClick={addPreTask}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("fields.addPreTask")}
                    </Button>
                    <h2 className="font-bold text-slate-800">{t("sections.preTasks")}</h2>
                  </div>

                  {preTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-rose-500"
                          onClick={() => removePreTask(task.id)}
                          aria-label={t("actions.removeItem")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500">
                            {index + 1}
                          </span>
                          {t("fields.preTaskNumber", { number: index + 1 })}
                        </span>
                      </div>
                      <LabeledInput
                        label={t("fields.preTaskLabel")}
                        value={task.label}
                        onChange={(value) => updatePreTask(task.id, "label", value)}
                        placeholder={t("fields.preTaskLabel")}
                      />
                      <LabeledInput
                        label={t("fields.preTaskSubtitle")}
                        value={task.subtitle}
                        onChange={(value) => updatePreTask(task.id, "subtitle", value)}
                        placeholder={t("fields.preTaskSubtitle")}
                      />
                    </div>
                  ))}

                  {/* Tip banner */}
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <p className="leading-relaxed">{t("tip")}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Step navigation (Prev / Next) ── */}
          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-xl px-5 disabled:opacity-40"
              onClick={goPrev}
              disabled={isFirst}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("actions.previous")}
            </Button>

            {isLast ? (
              <Button
                className="h-11 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_3px_0px_0px_#8F6C0B]"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {t("actions.saveAndPublish")}
              </Button>
            ) : (
              <Button
                className="h-11 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243650] shadow-[0px_3px_0px_0px_#1a2d46]"
                onClick={goNext}
              >
                {t("actions.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <aside className="space-y-3">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-1.5 p-4">
              {STEPS.map((step, idx) => {
                const isActive = step === activeStep;
                const isDone = isStepComplete(step, completionState);
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveStep(step)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-[#2C4260] text-white"
                        : isDone
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    {/* Step number / check */}
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        isActive
                          ? "bg-white text-[#2C4260]"
                          : isDone
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {isDone && !isActive ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Label */}
                    <span className="flex-1 text-right">{t(`steps.${step}`)}</span>

                    {/* Step icon */}
                    <span
                      className={cn(
                        "opacity-60",
                        isActive ? "opacity-100 text-white" : isDone ? "text-emerald-500" : "",
                      )}
                    >
                      {STEP_ICONS[step]}
                    </span>
                  </button>
                );
              })}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <Button
                  className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_3px_0px_0px_#8F6C0B]"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {t("actions.saveAndPublish")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick-summary card */}
          <Card className="rounded-[1.75rem] border-white/80 bg-slate-50 shadow-none">
            <CardContent className="space-y-3 p-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("summary.title")}
              </p>
              <div className="space-y-1.5 text-sm">
                <SummaryRow
                  label={t("fields.title")}
                  value={title || "—"}
                  muted={!title}
                />
                <SummaryRow
                  label={t("fields.date")}
                  value={date || "—"}
                  muted={!date}
                />
                <SummaryRow
                  label={t("fields.time")}
                  value={time || "—"}
                  muted={!time}
                />
                <SummaryRow
                  label={t("fields.duration")}
                  value={`${duration} ${t("fields.durationMinutes")}`}
                  muted={false}
                />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ── Small helper ── */
function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className={cn("truncate font-medium", muted ? "text-slate-300" : "text-slate-700")}>
        {value}
      </span>
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
    </div>
  );
}