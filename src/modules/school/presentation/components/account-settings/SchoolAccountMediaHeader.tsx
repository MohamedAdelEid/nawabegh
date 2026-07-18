"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Building2, ImagePlus, Pencil } from "lucide-react";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";
import { notify } from "@/shared/application/lib/toast";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type SchoolAccountMediaHeaderProps = {
  schoolName: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  logoPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  onLogoChange: (file: File, previewUrl: string) => void;
  onCoverChange: (file: File, previewUrl: string) => void;
};

function readPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Invalid image preview"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export function SchoolAccountMediaHeader({
  schoolName,
  logoUrl,
  coverImageUrl,
  logoPreviewUrl,
  coverPreviewUrl,
  onLogoChange,
  onCoverChange,
}: SchoolAccountMediaHeaderProps) {
  const t = useTranslations("school.dashboard.settingsPage");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const resolvedCover = coverPreviewUrl || resolveFileUrl(coverImageUrl);
  const resolvedLogo = logoPreviewUrl || resolveFileUrl(logoUrl);

  const validateAndPreview = async (
    file: File | undefined,
    kind: "logo" | "cover",
  ) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE_BYTES) {
      notify.error(t("messages.invalidImage"));
      return;
    }
    try {
      const previewUrl = await readPreview(file);
      if (kind === "logo") onLogoChange(file, previewUrl);
      else onCoverChange(file, previewUrl);
    } catch {
      notify.error(t("messages.invalidImage"));
    }
  };

  return (
    <div className="relative">
      <div className="relative h-48 overflow-hidden rounded-t-[2rem] bg-gradient-to-l from-[#1f3554] via-[#2c4260] to-[#3d5a80] sm:h-80">
        {resolvedCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedCover}
            alt={t("media.coverAlt", { name: schoolName || t("fields.schoolName") })}
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-xl bg-black/45 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          {t("actions.changeCover")}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            void validateAndPreview(event.target.files?.[0], "cover");
            event.target.value = "";
          }}
        />
      </div>

      <div className="absolute -bottom-12 start-6 sm:start-8">
        <div className="relative">
          <div
            className={cn(
              "flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg",
              !resolvedLogo && "bg-[#EEF3F9]",
            )}
          >
            {resolvedLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedLogo}
                alt={t("media.logoAlt", { name: schoolName || t("fields.schoolName") })}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-10 w-10 text-[#2C4260]" aria-hidden />
            )}
          </div>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="absolute -bottom-1 -start-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#C7AF6E] text-white shadow-md transition hover:bg-[#b89d5c]"
            aria-label={t("actions.changeLogo")}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(event) => {
              void validateAndPreview(event.target.files?.[0], "logo");
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
