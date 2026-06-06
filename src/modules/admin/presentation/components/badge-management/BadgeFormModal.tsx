"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Award, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AchievementBadgeRow } from "@/modules/admin/domain/types/achievementBadges.types";
import {
  BADGE_ICON_UPLOAD_FOLDER,
  uploadAdminFile,
} from "@/modules/admin/infrastructure/api/fileUploadApi";
import { BadgePreviewCard } from "./BadgePreviewCard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export type BadgeFormValues = {
  name: string;
  description: string;
  iconUrl: string;
  iconFile: File | null;
  iconPreviewUrl: string | null;
  requiredPoints: string;
  isActive: boolean;
};

interface BadgeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: AchievementBadgeRow | null;
  onSubmit: (values: BadgeFormValues) => Promise<boolean>;
  loading?: boolean;
}

const EMPTY_VALUES: BadgeFormValues = {
  name: "",
  description: "",
  iconUrl: "",
  iconFile: null,
  iconPreviewUrl: null,
  requiredPoints: "500",
  isActive: true,
};

export function BadgeFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading = false,
}: BadgeFormModalProps) {
  const t = useTranslations("admin.dashboard.badgeManagement.form");
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<BadgeFormValues>(EMPTY_VALUES);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      const resolvedIcon = resolveFileUrl(initial.iconUrl);
      setValues({
        name: initial.name,
        description: initial.description,
        iconUrl: initial.iconUrl ?? "",
        iconFile: null,
        iconPreviewUrl: resolvedIcon,
        requiredPoints: String(initial.requiredPoints),
        isActive: initial.isActive,
      });
    } else {
      setValues(EMPTY_VALUES);
    }
    setUploadError(null);
  }, [initial, open]);

  const pointsNumber = Number(values.requiredPoints.replace(/\D/g, ""));
  const canSubmit =
    values.name.trim().length > 0 &&
    values.description.trim().length > 0 &&
    (values.iconUrl.trim().length > 0 || values.iconFile !== null || values.iconPreviewUrl !== null) &&
    Number.isFinite(pointsNumber) &&
    pointsNumber >= 0;

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError(t("uploadHint"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(t("uploadHint"));
      return;
    }

    setUploadError(null);
    const previewUrl = URL.createObjectURL(file);
    setValues((prev) => ({ ...prev, iconFile: file, iconPreviewUrl: previewUrl }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading || isUploading) return;

    let iconUrl = values.iconUrl;
    if (values.iconFile) {
      setIsUploading(true);
      const upload = await uploadAdminFile(values.iconFile, BADGE_ICON_UPLOAD_FOLDER);
      setIsUploading(false);
      if (!upload.ok) {
        setUploadError(upload.errorMessage);
        return;
      }
      iconUrl = upload.filePath;
    }

    const saved = await onSubmit({ ...values, iconUrl });
    if (saved) onOpenChange(false);
  };

  const inputClassName =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none transition-colors focus:border-[#C8AC59] disabled:cursor-not-allowed disabled:opacity-70";

  const previewIconUrl = values.iconPreviewUrl ?? (values.iconUrl ? resolveFileUrl(values.iconUrl) : null);

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(98vw,56rem)] max-h-[92vh] overflow-y-auto rounded-[2rem] p-0"
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
          <Award className="h-5 w-5 text-[#C7AF6E]" aria-hidden />
          {t("modalTitle")}
        </ModalTitle>
        <span className="w-9" aria-hidden />
      </div>

      <form className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem]" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <section className="space-y-5">
            <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-800">
              {t("basicInfo")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <label className="block space-y-2 text-right">
                <span className="text-sm font-semibold text-slate-600">{t("nameLabel")}</span>
                <input
                  value={values.name}
                  onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder={t("namePlaceholder")}
                  disabled={loading || isUploading}
                  className={inputClassName}
                />
              </label>
              <div className="space-y-2 text-right">
                <span className="text-sm font-semibold text-slate-600">{t("uploadIcon")}</span>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={loading || isUploading}
                  className={cn(
                    "flex h-[7.5rem] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-[#C8AC59]",
                    uploadError && "border-rose-300",
                  )}
                >
                  {previewIconUrl ? (
                    <Image src={previewIconUrl} alt="" width={40} height={40} unoptimized className="object-contain" />
                  ) : (
                    <Award className="h-8 w-8 text-slate-300" aria-hidden />
                  )}
                  <span className="text-[10px] font-semibold text-slate-500">{t("uploadIcon")}</span>
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
                />
                {uploadError ? <p className="text-xs text-rose-500">{uploadError}</p> : null}
              </div>
            </div>
            <label className="block space-y-2 text-right">
              <span className="text-sm font-semibold text-slate-600">{t("descriptionLabel")}</span>
              <textarea
                value={values.description}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder={t("descriptionPlaceholder")}
                rows={4}
                disabled={loading || isUploading}
                className={cn(inputClassName, "min-h-[7rem] resize-none py-3")}
              />
            </label>
          </section>

          <section className="space-y-5">
            <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-800">
              {t("eligibilitySettings")}
            </h3>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div className="space-y-1 text-right">
                <p className="text-sm font-semibold text-slate-700">{t("activeToggle")}</p>
                <p className="text-xs text-slate-500">{t("activeToggleHint")}</p>
              </div>
              <StatusSwitch
                checked={values.isActive}
                onChange={(isActive) => setValues((prev) => ({ ...prev, isActive }))}
                activeLabel={t("activeToggle")}
                inactiveLabel={t("activeToggle")}
                disabled={loading || isUploading}
                activeClassName="bg-emerald-500"
              />
            </div>
            <label className="block space-y-2 text-right">
              <span className="text-sm font-semibold text-slate-600">{t("requiredPointsLabel")}</span>
              <input
                value={values.requiredPoints}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, requiredPoints: event.target.value }))
                }
                inputMode="numeric"
                disabled={loading || isUploading}
                className={inputClassName}
              />
              <p className="text-xs text-slate-500">{t("requiredPointsHint")}</p>
            </label>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl px-6"
              disabled={loading || isUploading}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || loading || isUploading}
              className="h-12 rounded-2xl bg-[#2C4260] px-6 font-semibold text-white hover:bg-[#243751]"
            >
              <Save className="ms-2 h-4 w-4" aria-hidden />
              {loading || isUploading ? "…" : t("save")}
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <BadgePreviewCard
            name={values.name}
            description={values.description}
            iconUrl={previewIconUrl}
            requiredPoints={pointsNumber}
          />
        </aside>
      </form>
    </ModalShell>
  );
}
