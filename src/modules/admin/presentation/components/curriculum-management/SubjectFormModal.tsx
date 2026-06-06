"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  SUBJECT_ICON_UPLOAD_FOLDER,
  uploadAdminFile,
} from "@/modules/admin/infrastructure/api/fileUploadApi";
import type { SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import AddPhoto from "@/modules/admin/presentation/assets/icons/AddPhoto";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export type SubjectFormValues = {
  nameAr: string;
  nameEn: string;
  iconUrl: string;
  iconFile: File | null;
  iconPreviewUrl: string | null;
};

interface SubjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: SubjectListItem | null;
  onSubmit: (values: SubjectFormValues) => Promise<boolean>;
  loading?: boolean;
}

const EMPTY_VALUES: SubjectFormValues = {
  nameAr: "",
  nameEn: "",
  iconUrl: "",
  iconFile: null,
  iconPreviewUrl: null,
};

export function SubjectFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading = false,
}: SubjectFormModalProps) {
  const t = useTranslations("admin.dashboard.curriculumManagement.subjects.form");
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<SubjectFormValues>(EMPTY_VALUES);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      const resolvedIcon = resolveFileUrl(initial.iconUrl);
      setValues({
        nameAr: initial.nameAr,
        nameEn: initial.nameEn,
        iconUrl: initial.iconUrl ?? "",
        iconFile: null,
        iconPreviewUrl: resolvedIcon,
      });
    } else {
      setValues(EMPTY_VALUES);
    }
    setUploadError(null);
  }, [initial, open]);

  const canSubmit =
    values.nameAr.trim().length > 0 &&
    values.nameEn.trim().length > 0 &&
    (values.iconUrl.trim().length > 0 || values.iconFile !== null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError(t("iconInvalidType"));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(t("iconTooLarge"));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    setUploadError(null);

    reader.onerror = () => {
      setUploadError(t("iconReadError"));
      event.target.value = "";
    };

    reader.onload = () => {
      setValues((prev) => ({
        ...prev,
        iconFile: file,
        iconPreviewUrl: typeof reader.result === "string" ? reader.result : null,
      }));
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading || isUploading) return;

    let iconUrl = values.iconUrl.trim();

    if (values.iconFile) {
      setIsUploading(true);
      const upload = await uploadAdminFile(values.iconFile, SUBJECT_ICON_UPLOAD_FOLDER);
      setIsUploading(false);

      if (!upload.ok) {
        setUploadError(upload.errorMessage);
        return;
      }

      iconUrl = upload.filePath;
    }

    const saved = await onSubmit({
      ...values,
      iconUrl,
    });

    if (saved) onOpenChange(false);
  };

  const inputClassName =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none transition-colors focus:border-[#C8AC59] disabled:cursor-not-allowed disabled:opacity-70";
  const isBusy = loading || isUploading;

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(95vw,31rem)] p-7"
    >
      <ModalTitle className="text-right text-xl font-bold text-slate-800">
        {mode === "create" ? t("createTitle") : t("editTitle")}
      </ModalTitle>
      <ModalDescription className="mt-2 text-right text-sm text-slate-500">
        {mode === "create" ? t("createDescription") : t("editDescription")}
      </ModalDescription>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2 text-right">
          <span className="block text-sm font-semibold text-slate-600">{t("icon")}</span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center rounded-[1.75rem] p-2 text-center">
            <div className="relative m-[12px]">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.25rem] border-2 border-dashed border-[var(--dashboard-border-strong)] bg-[#F1F3F5] text-slate-300">
                {values.iconPreviewUrl ? (
                  <Image
                    src={values.iconPreviewUrl}
                    alt={t("iconPreviewAlt")}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <AddPhoto className="h-8 w-8" aria-hidden />
                    <p className="mt-1 text-xs text-slate-500">{t("iconUploadLabel")}</p>
                  </div>
                )}
              </div>
              <Button
                type="button"
                size="icon"
                disabled={isBusy}
                className="absolute bottom-[-14px] right-[-14px] rounded-xl bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary-pressed)]"
                onClick={() => inputRef.current?.click()}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <p className="text-xs text-slate-400">{t("iconHint")}</p>
            {uploadError ? <p className="text-xs font-medium text-rose-500">{uploadError}</p> : null}
          </div>
        </div>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("nameAr")}</span>
          <input
            value={values.nameAr}
            onChange={(event) => setValues((prev) => ({ ...prev, nameAr: event.target.value }))}
            placeholder={t("nameArPlaceholder")}
            disabled={isBusy}
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("nameEn")}</span>
          <input
            value={values.nameEn}
            onChange={(event) => setValues((prev) => ({ ...prev, nameEn: event.target.value }))}
            placeholder={t("nameEnPlaceholder")}
            disabled={isBusy}
            className={inputClassName}
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("cancel")}
          </button>
          <Button
            type="submit"
            disabled={!canSubmit || isBusy}
            className="h-12 flex-1 rounded-2xl bg-[#2C4260] text-white shadow-[0px_4px_0px_0px_#1E305080] hover:bg-[#1E3050]"
          >
            {isBusy ? t("saving") : mode === "create" ? t("create") : t("save")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
