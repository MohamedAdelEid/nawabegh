"use client";

import { useCallback, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

type SchoolImportDropzoneProps = {
  fileName?: string | null;
  placeholder: string;
  hint: string;
  disabled?: boolean;
  accept?: string;
  onFileSelected: (file: File) => void;
};

export function SchoolImportDropzone({
  fileName,
  placeholder,
  hint,
  disabled = false,
  accept = ".xlsx,.csv",
  onFileSelected,
}: SchoolImportDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const next = files?.[0];
      if (!next || disabled) return;
      onFileSelected(next);
    },
    [disabled, onFileSelected],
  );

  return (
    <label
      className={cn(
        "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-slate-50 p-6 text-center transition-colors",
        isDragging
          ? "border-[#2C4260] bg-[#2C4260]/5"
          : "border-slate-300 hover:border-slate-400",
        disabled && "pointer-events-none opacity-60",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8EEF5] text-[#2C4260]">
        <FileSpreadsheet className="h-7 w-7" aria-hidden />
      </span>
      <span className="font-semibold text-slate-700">
        {fileName ?? placeholder}
      </span>
      <span className="max-w-xl text-xs leading-5 text-slate-400">{hint}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
