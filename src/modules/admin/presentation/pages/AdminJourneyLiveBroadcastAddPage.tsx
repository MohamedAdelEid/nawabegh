"use client";

import {
  CalendarDays,
  Clock,
  FileUp,
  ImagePlus,
  Link2,
  Lightbulb,
  MapPin,
  Plus,
  Save,
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
  const [broadcastLink, setBroadcastLink] = useState("");
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

  const addObjective = () => {
    setObjectives((prev) => [
      ...prev,
      { id: `obj-${Date.now()}`, text: "" },
    ]);
  };

  const updateObjective = (id: string, text: string) => {
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const addPreTask = () => {
    setPreTasks((prev) => [
      ...prev,
      { id: `pt-${Date.now()}`, label: "", subtitle: "", completed: false },
    ]);
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

  const updatePreTask = (id: string, field: "label" | "subtitle", value: string) => {
    setPreTasks((prev) => prev.map((task) => (task.id === id ? { ...task, [field]: value } : task)));
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
      const uploadResult = await uploadAdminFile(attachment.file, LIVE_SESSION_ATTACHMENT_UPLOAD_FOLDER);
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
      .map((objective, index) => ({
        text: objective.text.trim(),
        order: index,
      }))
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
      roomUrl: broadcastLink.trim(),
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

  const stepIndex = STEPS.indexOf(activeStep);

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
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId))}
            >
              {t("actions.cancel")}
            </Button>
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

      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* Step sidebar */}
        <aside className="space-y-3">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-2 p-4">
              {STEPS.map((step, idx) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(step)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right text-sm font-semibold transition-colors",
                    activeStep === step
                      ? "bg-[#2C4260] text-white"
                      : "text-slate-500 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      activeStep === step ? "bg-white text-[#2C4260]" : "bg-slate-100",
                    )}
                  >
                    {idx + 1}
                  </span>
                  {t(`steps.${step}`)}
                </button>
              ))}

              <div className="mt-4 border-t border-slate-100 pt-4">
                <Button
                  className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {t("actions.saveAndPublish")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {/* Basic Info */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FB] text-[#2C4260]">
                  <Video className="h-4 w-4" />
                </div>
                <h2 className="font-bold text-slate-800">{t("sections.basicInfo")}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-400">
                  {stepIndex + 1}/{STEPS.length}
                </span>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">{t("fields.title")}</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("fields.titlePlaceholder")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">{t("fields.thumbnail")}</label>
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
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]"
                >
                  {coverImagePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImagePreviewUrl}
                      alt={title || t("fields.thumbnail")}
                      className="mb-2 h-28 w-full max-w-xs rounded-xl object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-8 w-8" />
                  )}
                  <p className="font-semibold">{t("upload.drag")}</p>
                  <p className="text-xs">{t("upload.formats")}</p>
                </button>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">{t("fields.description")}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("fields.descriptionPlaceholder")}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          {/* Broadcast Details */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 font-bold text-slate-800">
                <span className="text-sm text-slate-400">04</span>
                {t("sections.broadcastDetails")}
                <Link2 className="h-4 w-4 text-slate-400" />
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-right sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-600">{t("fields.presenter")}</label>
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-500">
                    {responsibleTeacherId
                      ? t("fields.presenterFromCourse")
                      : t("fields.presenterMissing")}
                  </p>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-semibold text-slate-600">{t("fields.duration")}</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                    >
                      {[30, 45, 60, 90, 120].map((d) => (
                        <option key={d} value={d}>
                          {d} {t("fields.durationMinutes")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-semibold text-slate-600">{t("fields.date")}</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-semibold text-slate-600">{t("fields.time")}</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">{t("fields.broadcastLink")}</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    value={broadcastLink}
                    onChange={(e) => setBroadcastLink(e.target.value)}
                    placeholder={t("fields.broadcastLinkPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <FileUp className="h-4 w-4" />
                </div>
                {t("sections.educationalContent")}
              </h2>

              {/* Objectives */}
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="h-9 gap-1 rounded-xl text-xs"
                    onClick={addObjective}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("actions.addLearningGoal")}
                  </Button>
                  <label className="text-sm font-semibold text-slate-600">
                    {t("fields.objectives")}
                  </label>
                </div>
                {objectives.map((obj, i) => (
                  <input
                    key={obj.id}
                    value={obj.text}
                    onChange={(e) => updateObjective(obj.id, e.target.value)}
                    placeholder={t("fields.objectivePlaceholder")}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                  />
                ))}
              </div>

              {/* Attachments */}
              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-600">
                  {t("fields.attachments")}
                </label>
                <input ref={attachRef} type="file" className="hidden" onChange={handleAttachChange} />
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                      }
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                    <span className="text-sm text-slate-700">{att.name}</span>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold uppercase text-slate-400 border border-slate-200">
                      {att.type}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  {["pdf", "pptx"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => attachRef.current?.click()}
                      className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-xs font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]"
                    >
                      <FileUp className="h-5 w-5" />
                      {type.toUpperCase()}, PPTX, XLSX
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pre-tasks */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="h-9 gap-1 rounded-xl text-xs"
                  onClick={addPreTask}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("fields.addPreTask")}
                </Button>
                <h2 className="font-bold text-slate-800">
                  {preTasks.length}/{preTasks.length} {t("sections.preTasks")}
                </h2>
              </div>

              {preTasks.map((task, i) => (
                <div key={task.id} className="space-y-2 rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{i + 1}</span>
                  </div>
                  <input
                    value={task.label}
                    onChange={(e) => updatePreTask(task.id, "label", e.target.value)}
                    placeholder={t("fields.preTaskLabel")}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                  />
                  <input
                    value={task.subtitle}
                    onChange={(e) => updatePreTask(task.id, "subtitle", e.target.value)}
                    placeholder={t("fields.preTaskSubtitle")}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                  />
                </div>
              ))}

              {/* Tip */}
              <div className="flex gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
                <MapPin className="h-4 w-4 shrink-0" />
                {t("tip")}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
