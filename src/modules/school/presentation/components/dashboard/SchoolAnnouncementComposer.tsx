"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Megaphone, Paperclip, SendHorizontal, Save, X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { CommunityRichTextEditor } from "@/shared/presentation/components/community/CommunityRichTextEditor";
import { cn } from "@/shared/application/lib/cn";
import { formatBytes } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { useSchoolAnnouncementMutations } from "@/modules/school/application/hooks/useSchoolAnnouncementMutations";
import {
  audienceToApiCode,
  uploadSchoolAnnouncementAttachment,
} from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";
import type {
  SchoolAnnouncementAttachmentInput,
  SchoolAnnouncementAudience,
  SchoolAnnouncementType,
} from "@/modules/school/domain/types/schoolAnnouncements.types";

const AUDIENCE_OPTIONS: SchoolAnnouncementAudience[] = [
  "all",
  "students",
  "parents",
  "teachers",
];
const DURATION_OPTIONS = [
  { value: "24", key: "h24" },
  { value: "48", key: "h48" },
  { value: "72", key: "h72" },
  { value: "168", key: "d7" },
] as const;

export function SchoolAnnouncementComposer({ onCreated }: { onCreated?: () => void }) {
  const t = useTranslations("school.dashboard");
  const { create } = useSchoolAnnouncementMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<SchoolAnnouncementType>("Ad");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<SchoolAnnouncementAudience>("all");
  const [displayDurationHours, setDisplayDurationHours] = useState("24");
  const [sendMethod, setSendMethod] = useState<"Instant" | "Scheduled">("Instant");
  const [scheduledAt, setScheduledAt] = useState("");
  const [attachments, setAttachments] = useState<SchoolAnnouncementAttachmentInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setAudience("all");
    setDisplayDurationHours("24");
    setSendMethod("Instant");
    setScheduledAt("");
    setAttachments([]);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files)
          .slice(0, 10 - attachments.length)
          .map((file) => uploadSchoolAnnouncementAttachment(file)),
      );
      setAttachments((prev) => [...prev, ...uploaded].slice(0, 10));
    } catch {
      notify.error(t("dashboardPage.compose.messages.uploadError"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async (isDraft: boolean) => {
    if (!title.trim()) {
      notify.error(t("dashboardPage.compose.validation.titleRequired"));
      return;
    }
    if (!isDraft && !body.trim()) {
      notify.error(t("dashboardPage.compose.validation.bodyRequired"));
      return;
    }
    const isScheduled = sendMethod === "Scheduled" && Boolean(scheduledAt);
    const scheduledAtUtc = isScheduled ? new Date(scheduledAt).toISOString() : null;
    if (!isDraft && isScheduled && scheduledAtUtc && new Date(scheduledAtUtc) <= new Date()) {
      notify.error(t("dashboardPage.compose.validation.scheduledInFuture"));
      return;
    }

    try {
      await create.mutateAsync({
        type,
        title: title.trim(),
        body,
        audience: audienceToApiCode(audience) as SchoolAnnouncementAudience,
        sendMethod: isScheduled ? "Scheduled" : "Instant",
        scheduledAtUtc,
        displayDurationHours: Number(displayDurationHours) || 24,
        sendMobilePush: true,
        sendInApp: true,
        sendSms: false,
        isDraft,
        attachments,
      });
      notify.success(
        isDraft
          ? t("dashboardPage.compose.messages.draftSaved")
          : isScheduled
            ? t("dashboardPage.compose.messages.scheduled")
            : t("dashboardPage.compose.messages.sent"),
      );
      resetForm();
      onCreated?.();
    } catch {
      notify.error(t("dashboardPage.compose.messages.error"));
    }
  };

  const audienceOptions = AUDIENCE_OPTIONS.map((id) => ({
    value: id,
    label: t(`dashboardPage.compose.audienceOptions.${id}`),
  }));
  const durationOptions = DURATION_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`dashboardPage.compose.durationOptions.${option.key}`),
  }));
  const sendMethodOptions = [
    { value: "Instant", label: t("dashboardPage.compose.sendMethodOptions.instant") },
    { value: "Scheduled", label: t("dashboardPage.compose.sendMethodOptions.scheduled") },
  ];

  const isBusy = create.isPending || isUploading;

  return (
    <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex rounded-2xl bg-slate-50 p-1">
            {(["urgentAlert", "ad"] as const).map((tab) => {
              const tabType: SchoolAnnouncementType = tab === "ad" ? "Ad" : "UrgentAlert";
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setType(tabType)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    type === tabType
                      ? tabType === "UrgentAlert"
                        ? "bg-[#FFE4E4] text-[#D33131]"
                        : "bg-[#2C4260] text-white"
                      : "text-slate-500",
                  )}
                >
                  {t(`dashboardPage.compose.tabs.${tab}`)}
                </button>
              );
            })}
          </div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            {t("dashboardPage.compose.title")}
            <Megaphone className="h-5 w-5 text-[#2C4260]" />
          </h2>
        </div>

        <div className="space-y-2 text-right">
          <label className="text-sm text-slate-500">
            {t("dashboardPage.compose.fields.messageTitle")}
          </label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("dashboardPage.compose.fields.messageTitlePlaceholder")}
            className="h-12 rounded-2xl border-slate-100 bg-slate-50 px-4 text-right"
          />
        </div>

        <div className="space-y-2 text-right">
          <label className="text-sm text-slate-500">
            {t("dashboardPage.compose.fields.messageBody")}
          </label>
          <CommunityRichTextEditor
            value={body}
            onChange={setBody}
            placeholder={t("dashboardPage.compose.fields.messageBodyPlaceholder")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledSelect
            label={t("dashboardPage.compose.fields.audience")}
            value={audience}
            onChange={(value) => setAudience(value as SchoolAnnouncementAudience)}
            options={audienceOptions}
          />
          <LabeledSelect
            label={t("dashboardPage.compose.fields.displayDuration")}
            value={displayDurationHours}
            onChange={setDisplayDurationHours}
            options={durationOptions}
          />
          <LabeledSelect
            label={t("dashboardPage.compose.fields.sendMethod")}
            value={sendMethod}
            onChange={(value) => setSendMethod(value as "Instant" | "Scheduled")}
            options={sendMethodOptions}
          />
          {sendMethod === "Scheduled" ? (
            <div className="space-y-2 text-right">
              <label className="text-sm text-slate-500">
                {t("dashboardPage.compose.scheduledAt")}
              </label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 text-left"
              />
            </div>
          ) : (
            <div className="space-y-2 text-right">
              <label className="text-sm text-slate-500">
                {t("dashboardPage.compose.fields.attachments")}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || attachments.length >= 10}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-sm text-slate-500 hover:border-slate-300 disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
                {t("dashboardPage.compose.fields.attachmentsHint")}
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(event) => void handleUpload(event.target.files)}
        />

        {attachments.length > 0 ? (
          <ul className="space-y-2">
            {attachments.map((file, index) => (
              <li
                key={`${file.fileUrl}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                  className="text-slate-400 hover:text-red-500"
                  aria-label={file.fileName}
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="text-xs text-slate-400">
                    {formatBytes(file.fileSizeBytes)}
                  </span>
                  <span className="truncate">{file.fileName}</span>
                  <Paperclip className="h-4 w-4 text-slate-400" />
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isBusy}
            onClick={() => void submit(true)}
            className="h-14 w-14 shrink-0 rounded-2xl border-[#C9A227] text-[#8F6C0B]"
            aria-label={t("dashboardPage.compose.saveDraft")}
          >
            <Save className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            disabled={isBusy}
            onClick={() => void submit(false)}
            className="h-14 flex-1 rounded-2xl bg-[#2C4260] text-base font-bold text-white hover:bg-[#243751]"
          >
            {create.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
            {t("dashboardPage.compose.submit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
