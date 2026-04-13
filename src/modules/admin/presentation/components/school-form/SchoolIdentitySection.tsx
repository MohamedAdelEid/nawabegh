"use client";

import type React from "react";
import { useRef, useState } from "react";
import Image from "next/image";

import { UploadIcon } from "@/modules/admin/presentation/assets/icons/Upload";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { SchoolFormSectionCard } from "./SchoolFormSectionCard";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface SchoolIdentitySectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  uploadTitle: string;
  uploadDescription: string;
  uploadButtonLabel: string;
  changeImageLabel: string;
  uploadingLabel: string;
  previewAlt: string;
  invalidTypeMessage: string;
  tooLargeMessage: string;
  readErrorMessage: string;
  value: {
    schoolName: string;
    schoolDescription: string;
    schoolLogoFile: File | null;
    schoolLogoPreviewUrl: string | null;
  };
  onChange: (value: {
    schoolName: string;
    schoolDescription: string;
    schoolLogoFile: File | null;
    schoolLogoPreviewUrl: string | null;
  }) => void;
}

export function SchoolIdentitySection({
  icon,
  title,
  nameLabel,
  namePlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
  uploadTitle,
  uploadDescription,
  uploadButtonLabel,
  changeImageLabel,
  uploadingLabel,
  previewAlt,
  invalidTypeMessage,
  tooLargeMessage,
  readErrorMessage,
  value,
  onChange,
}: SchoolIdentitySectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePickImage = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError(invalidTypeMessage);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(tooLargeMessage);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    setUploadError(null);
    setIsUploadingPreview(true);
    setUploadProgress(0);

    reader.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable) {
        return;
      }

      const percent = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100,
      );
      setUploadProgress(percent);
    };

    reader.onerror = () => {
      setUploadError(readErrorMessage);
      setUploadProgress(0);
      setIsUploadingPreview(false);
      event.target.value = "";
    };

    reader.onload = () => {
      onChange({
        ...value,
        schoolLogoFile: file,
        schoolLogoPreviewUrl:
          typeof reader.result === "string" ? reader.result : null,
      });
      setUploadProgress(100);
      setIsUploadingPreview(false);
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  return (
    <SchoolFormSectionCard icon={icon} title={title}>
      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="order-2 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center lg:order-1">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
            {value.schoolLogoPreviewUrl ? (
              <Image
                src={value.schoolLogoPreviewUrl}
                alt={previewAlt}
                width={80}
                height={80}
                unoptimized
                className="max-h-[200px] w-full object-cover"
              />
            ) : (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white text-slate-400 shadow-sm">
                  <UploadIcon className="h-8 w-8" aria-hidden />
                </div>
                <div className="mt-5 space-y-1">
                  <p className="text-sm font-semibold text-[#64748B]">{uploadTitle}</p>
                  <p className="text-xs text-slate-400">{uploadDescription}</p>
                </div>
              </>

            )}
          <div className="mt-5 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-slate-200 px-5 text-slate-700"
              onClick={handlePickImage}
              disabled={isUploadingPreview}
            >
              {value.schoolLogoPreviewUrl ? changeImageLabel : uploadButtonLabel}
            </Button>

            {isUploadingPreview ? (
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{uploadProgress}%</span>
                  <span>{uploadingLabel}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#2C4260] transition-[width] duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {uploadError ? (
              <p className="text-xs font-medium text-red-500">{uploadError}</p>
            ) : null}
          </div>
        </div>

        <div className="order-1 space-y-5 lg:order-2">
          <div className="space-y-2 text-right">
            <label className="text-sm font-medium text-[#64748B]">{nameLabel}</label>
            <Input
              value={value.schoolName}
              onChange={(event) =>
                onChange({
                  ...value,
                  schoolName: event.target.value,
                })
              }
              placeholder={namePlaceholder}
              className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 text-right placeholder:text-[#94A3B8] focus-visible:ring-[#C7AF6E]/40"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-medium text-[#64748B]">
              {descriptionLabel}
            </label>
            <textarea
              value={value.schoolDescription}
              onChange={(event) =>
                onChange({
                  ...value,
                  schoolDescription: event.target.value,
                })
              }
              placeholder={descriptionPlaceholder}
              rows={4}
              className="flex w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-right text-sm text-slate-700 outline-none placeholder:text-[#94A3B8] focus-visible:ring-2 focus-visible:ring-[#C7AF6E]/40"
            />
          </div>
        </div>
      </div>
    </SchoolFormSectionCard>
  );
}
