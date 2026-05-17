"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Pencil, Users } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

interface ChatGroupIdentityUploadProps {
  previewUrl: string;
  onFileChange: (file: File | null, previewUrl: string) => void;
  uploadLabel: string;
  changeLabel: string;
  /** Short guidance on formats and size (localized). */
  hint: string;
  placeholderIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function ChatGroupIdentityUpload({
  previewUrl,
  onFileChange,
  uploadLabel,
  changeLabel,
  hint,
  placeholderIcon: PlaceholderIcon = Users,
}: ChatGroupIdentityUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onFileChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "group relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed transition-colors",
          isDragging
            ? "border-[#243B5A] bg-[#243B5A]/5"
            : previewUrl
              ? "border-transparent"
              : "border-slate-300 bg-slate-100 hover:border-[#243B5A] hover:bg-slate-50",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Group"
            fill
            className="object-cover shadow-md rounded-xl" 
          />
        ) : (
          <PlaceholderIcon className="h-12 w-12 text-slate-400" />
        )}
        <div className="absolute bottom-[-10px] right-[-10px] w-10 h-10 rounded-full flex items-center justify-center bg-[#C7AF6D] shadow-md">
          <Pencil className="h-5 w-5 text-white" aria-hidden />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
      </div>
      <p className="max-w-xs text-center text-sm text-slate-500">{hint}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
      >
        {previewUrl ? changeLabel : uploadLabel}
      </button>
    </div>
  );
}
