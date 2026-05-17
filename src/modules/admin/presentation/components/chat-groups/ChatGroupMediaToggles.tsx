"use client";

import type React from "react";
import { FileText, Image, FileSpreadsheet, Link2, Ban, Check } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import type { ChatGroupMediaPermissions } from "@/modules/admin/domain/types/chatGroups.types";

interface ToggleItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  danger?: boolean;
}

function ToggleItem({ label, checked, onChange, disabled, danger }: ToggleItemProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-md border px-3 py-2 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : checked
            ? danger
              ? "border-red-200 bg-red-50"
              : "border-[#67C23A]/30 bg-[#67C23A]/5"
            : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm transition-colors",
          disabled && "cursor-not-allowed",
          checked ? (danger ? "bg-red-500" : "bg-[#67C23A]") : "bg-white border border-slate-200",
        )}
      >
        <Check className="h-3 w-3 text-white font-semibold" aria-hidden />
      </button>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-sm font-medium",
            checked ? (danger ? "text-red-700" : "text-slate-700") : "text-slate-600",
          )}
        >
          {label}
        </span>
      </div>
    </label>
  );
}

interface ChatGroupMediaTogglesProps {
  value: ChatGroupMediaPermissions;
  onChange: (value: ChatGroupMediaPermissions) => void;
  blockAttachments: boolean;
  onBlockAttachmentsChange: (blocked: boolean) => void;
  filesLabel: string;
  imagesLabel: string;
  pdfLabel: string;
  webLinksLabel?: string;
  blockAllLabel: string;
  blockAllDescription?: string;
}

export function ChatGroupMediaToggles({
  value,
  onChange,
  blockAttachments,
  onBlockAttachmentsChange,
  filesLabel,
  imagesLabel,
  pdfLabel,
  webLinksLabel,
  blockAllLabel,
  blockAllDescription,
}: ChatGroupMediaTogglesProps) {
  const handleToggle = (key: keyof ChatGroupMediaPermissions, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  const toggleItems = [
    { key: "allowFiles" as const, label: filesLabel, icon: FileText },
    { key: "allowImages" as const, label: imagesLabel, icon: Image },
    { key: "allowPdf" as const, label: pdfLabel, icon: FileSpreadsheet },
    ...(webLinksLabel
      ? [{ key: "allowWebLinks" as const, label: webLinksLabel, icon: Link2 }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {toggleItems.map((item) => (
          <ToggleItem
            key={item.key}
            label={item.label}
            checked={value[item.key]}
            onChange={(checked) => handleToggle(item.key, checked)}
            disabled={blockAttachments}
          />
        ))}
      </div>
    </div>
  );
}
