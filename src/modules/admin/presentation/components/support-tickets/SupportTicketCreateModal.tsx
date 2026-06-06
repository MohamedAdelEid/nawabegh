"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Headphones, Paperclip, Plus, Save, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  SUPPORT_TICKET_PRIORITY,
  type SupportTicketPriority,
} from "@/modules/admin/domain/types/supportTickets.types";
import {
  SUPPORT_TICKET_ATTACHMENT_FOLDER,
  uploadAdminFile,
} from "@/modules/admin/infrastructure/api/fileUploadApi";
import { createSupportTicket } from "@/modules/admin/infrastructure/api/supportTicketsApi";
import { notify } from "@/shared/application/lib/toast";
import { DashboardFilterSelect } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { cn } from "@/shared/application/lib/cn";

const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

type FormValues = {
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  pendingFiles: File[];
};

const EMPTY_VALUES: FormValues = {
  subject: "",
  description: "",
  priority: SUPPORT_TICKET_PRIORITY.normal,
  pendingFiles: [],
};

export type SupportTicketCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function SupportTicketCreateModal({
  open,
  onOpenChange,
  onCreated,
}: SupportTicketCreateModalProps) {
  const t = useTranslations("admin.dashboard.supportTickets.createModal");
  const tTable = useTranslations("admin.dashboard.supportTickets.table");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY_VALUES);
    setUploadError(null);
  }, [open]);

  const canSubmit =
    values.subject.trim().length > 0 && values.description.trim().length > 0 && !isSubmitting;

  const handleFilesChange = (files: FileList | null) => {
    if (!files?.length) return;

    const nextFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setUploadError(t("attachments.invalidType"));
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(t("attachments.maxSize"));
        continue;
      }
      nextFiles.push(file);
    }

    if (nextFiles.length === 0) return;

    setUploadError(null);
    setValues((prev) => ({
      ...prev,
      pendingFiles: [...prev.pendingFiles, ...nextFiles].slice(0, MAX_ATTACHMENTS),
    }));
  };

  const removeFile = (index: number) => {
    setValues((prev) => ({
      ...prev,
      pendingFiles: prev.pendingFiles.filter((_, fileIndex) => fileIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const attachments: Array<{
        url: string;
        fileName: string;
        mimeType: string;
        sizeInBytes: number;
      }> = [];

      for (const file of values.pendingFiles) {
        const upload = await uploadAdminFile(file, SUPPORT_TICKET_ATTACHMENT_FOLDER);
        if (!upload.ok) {
          setUploadError(upload.errorMessage);
          setIsSubmitting(false);
          return;
        }

        attachments.push({
          url: upload.filePath,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeInBytes: file.size,
        });
      }

      const result = await createSupportTicket({
        subject: values.subject.trim(),
        description: values.description.trim(),
        priority: values.priority,
        attachments,
      });

      if (!result.data) {
        notify.error(result.errorMessage ?? t("errors.createFailed"));
        setIsSubmitting(false);
        return;
      }

      notify.success(result.message ?? t("success"));
      onOpenChange(false);
      onCreated?.();
    } catch {
      notify.error(t("errors.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none transition-colors focus:border-[#C8AC59] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(98vw,42rem)] max-h-[92vh] overflow-y-auto rounded-[2rem] p-0"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 sm:px-8">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={t("cancel")}
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </button>
        <ModalTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Headphones className="h-5 w-5 text-[#C7AF6E]" aria-hidden />
          {t("title")}
        </ModalTitle>
        <span className="w-9" aria-hidden />
      </div>

      <form className="space-y-6 p-6 sm:p-8" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("subject.label")}</span>
          <input
            value={values.subject}
            onChange={(event) => setValues((prev) => ({ ...prev, subject: event.target.value }))}
            placeholder={t("subject.placeholder")}
            disabled={isSubmitting}
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("description.label")}</span>
          <textarea
            value={values.description}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder={t("description.placeholder")}
            rows={5}
            disabled={isSubmitting}
            className={cn(inputClassName, "min-h-[8rem] resize-none py-3")}
          />
        </label>

        <DashboardFilterSelect
          label={t("priority.label")}
          value={String(values.priority)}
          options={[
            { id: "1", label: tTable("priorities.1") },
            { id: "2", label: tTable("priorities.2") },
            { id: "3", label: tTable("priorities.3") },
            { id: "4", label: tTable("priorities.4") },
          ]}
          onChange={(value) =>
            setValues((prev) => ({
              ...prev,
              priority: Number(value) as SupportTicketPriority,
            }))
          }
          disabled={isSubmitting}
        />

        <section className="space-y-3 text-right">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={isSubmitting || values.pendingFiles.length >= MAX_ATTACHMENTS}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="ms-1 h-4 w-4" aria-hidden />
              {t("attachments.add")}
            </Button>
            <span className="text-sm font-semibold text-slate-600">{t("attachments.label")}</span>
          </div>
          <p className="text-xs text-slate-400">{t("attachments.hint")}</p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES.join(",")}
            className="hidden"
            onChange={(event) => {
              handleFilesChange(event.target.files);
              event.target.value = "";
            }}
          />

          {values.pendingFiles.length > 0 ? (
            <ul className="space-y-2">
              {values.pendingFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-500"
                    aria-label={t("attachments.remove")}
                    disabled={isSubmitting}
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-sm text-slate-700">
                    <span className="truncate">{file.name}</span>
                    <Paperclip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
              {t("attachments.empty")}
            </div>
          )}

          {uploadError ? <p className="text-xs text-rose-500">{uploadError}</p> : null}
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl px-6"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 rounded-2xl bg-[#2C4260] px-6 font-semibold text-white hover:bg-[#243751]"
          >
            <Save className="ms-2 h-4 w-4" aria-hidden />
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
