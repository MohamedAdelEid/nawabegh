"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Megaphone, Paperclip, SendHorizontal, Save, X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { DateTimePicker } from "@/shared/presentation/components/ui/date-time-picker";
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
  SchoolAnnouncementDetail,
  SchoolAnnouncementType,
} from "@/modules/school/domain/types/schoolAnnouncements.types";

const AUDIENCE_OPTIONS: SchoolAnnouncementAudience[] = [
  "all",
  "students",
  "parents",
  "teachers",
  "studentsTeachersParents",
];
const DURATION_OPTIONS = [
  { value: "24", key: "h24" },
  { value: "48", key: "h48" },
  { value: "72", key: "h72" },
  { value: "168", key: "d7" },
] as const;

type SchoolAnnouncementComposerProps = {
  announcement?: SchoolAnnouncementDetail;
  onSaved?: () => void;
};

function toLocalDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function hasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

export function SchoolAnnouncementComposer({
  announcement,
  onSaved,
}: SchoolAnnouncementComposerProps) {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const { create, update } = useSchoolAnnouncementMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(announcement);

  const [type, setType] = useState<SchoolAnnouncementType>(announcement?.type ?? "Ad");
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.bodyHtml || announcement?.body || "");
  const [audience, setAudience] = useState<SchoolAnnouncementAudience>(
    announcement?.audience ?? "all",
  );
  const [displayDurationHours, setDisplayDurationHours] = useState(
    String(announcement?.displayDurationHours ?? 24),
  );
  const [sendMethod, setSendMethod] = useState<"Instant" | "Scheduled">(
    announcement?.scheduledAt ? "Scheduled" : "Instant",
  );
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTime(announcement?.scheduledAt ?? null));
  const [attachments, setAttachments] = useState<SchoolAnnouncementAttachmentInput[]>(
    announcement?.attachments.map(({ fileName, fileUrl, mimeType, fileSizeBytes }) => ({
      fileName,
      fileUrl,
      mimeType,
      fileSizeBytes,
    })) ?? [],
  );
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
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : t("dashboardPage.compose.messages.uploadError"),
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async (saveAsDraft: boolean) => {
    if (!title.trim()) {
      notify.error(t("dashboardPage.compose.validation.titleRequired"));
      return;
    }
    if (!hasText(body)) {
      notify.error(t("dashboardPage.compose.validation.bodyRequired"));
      return;
    }
    if (!saveAsDraft && sendMethod === "Scheduled" && !scheduledAt) {
      notify.error(t("dashboardPage.compose.validation.scheduledRequired"));
      return;
    }
    const isScheduled = sendMethod === "Scheduled" && Boolean(scheduledAt);
    const scheduledAtUtc = isScheduled ? new Date(scheduledAt).toISOString() : null;
    if (!saveAsDraft && isScheduled && scheduledAtUtc && new Date(scheduledAtUtc) <= new Date()) {
      notify.error(t("dashboardPage.compose.validation.scheduledInFuture"));
      return;
    }

    const payload = {
      type,
      title: title.trim(),
      body,
      audience: audienceToApiCode(audience),
      sendMethod: isScheduled ? ("Scheduled" as const) : ("Instant" as const),
      scheduledAtUtc,
      displayDurationHours: Number(displayDurationHours) || 24,
      sendMobilePush:
        announcement?.channels.find((channel) => channel.code === "MobilePush")?.enabled ?? true,
      sendInApp:
        announcement?.channels.find((channel) => channel.code === "InApp")?.enabled ?? true,
      sendSms:
        announcement?.channels.find((channel) => channel.code === "Sms")?.enabled ?? false,
      isDraft: saveAsDraft,
      attachments,
    };

    try {
      if (announcement) {
        await update.mutateAsync({ id: announcement.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      notify.success(
        announcement
          ? t("dashboardPage.compose.messages.updated")
          : saveAsDraft
          ? t("dashboardPage.compose.messages.draftSaved")
          : isScheduled
            ? t("dashboardPage.compose.messages.scheduled")
            : t("dashboardPage.compose.messages.sent"),
      );
      if (!announcement) resetForm();
      onSaved?.();
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : t("dashboardPage.compose.messages.error"),
      );
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

  const isBusy = create.isPending || update.isPending || isUploading;

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
              <DateTimePicker
                value={scheduledAt}
                onChange={setScheduledAt}
                locale={locale}
                ariaLabel={t("dashboardPage.compose.scheduledAt")}
                placeholder={t("dashboardPage.compose.schedulePicker.placeholder")}
                timeLabel={t("dashboardPage.compose.schedulePicker.time")}
                confirmLabel={t("dashboardPage.compose.schedulePicker.confirm")}
              />
            </div>
          ) : null}
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
          {!isEditing ? (
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
          ) : null}
          <Button
            type="button"
            disabled={isBusy}
            onClick={() => void submit(announcement?.statusTone === "draft")}
            className="h-14 flex-1 rounded-2xl bg-[#2C4260] text-base font-bold text-white hover:bg-[#243751]"
          >
            {create.isPending || update.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
            {t(isEditing ? "dashboardPage.compose.update" : "dashboardPage.compose.submit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
