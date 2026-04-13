"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Pencil } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import AddPhoto from "../../assets/icons/AddPhoto";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function AddUserUploadField({
  title,
  hint,
  previewAlt,
  uploadLabel,
  invalidTypeMessage,
  tooLargeMessage,
  readErrorMessage,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  previewAlt: string;
  uploadLabel: string;
  invalidTypeMessage: string;
  tooLargeMessage: string;
  readErrorMessage: string;
  value: { file: File | null; previewUrl: string | null };
  onChange: (value: { file: File | null; previewUrl: string | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(invalidTypeMessage);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(tooLargeMessage);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    setError(null);

    reader.onerror = () => {
      setError(readErrorMessage);
      event.target.value = "";
    };

    reader.onload = () => {
      onChange({
        file,
        previewUrl: typeof reader.result === "string" ? reader.result : null,
      });
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 text-right">
      <span className="block text-sm font-medium text-[var(--dashboard-primary)]">
        {title}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center rounded-[1.75rem] p-4 text-center">
        <div className="relative m-[20px]">
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#F1F3F5] text-slate-300 border-2 border-dashed border-[var(--dashboard-border-strong)]">
            {value.previewUrl ? (
              <Image
                src={value.previewUrl}
                alt={previewAlt}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <AddPhoto className="h-10 w-10" aria-hidden />
                <p className="text-xs text-slate-500">{uploadLabel}</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            size="icon"
            className="absolute bottom-[-20px] right-[-20px] rounded-xl bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary-pressed)]"
            onClick={() => inputRef.current?.click()}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <p className="text-xs text-slate-400">{hint}</p>
        {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
      </div>
    </div>
  );
}
