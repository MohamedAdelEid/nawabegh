"use client";

import type React from "react";
import { Eye, Settings, Pause, Play, Trash2, EarthIcon } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import type {
  ChatGroupRow,
  ChatGroupAttachment,
  ChatGroupChatModeId,
  ChatGroupStatusId,
} from "@/modules/admin/domain/types/chatGroups.types";
import Earth from "../../assets/icons/Earth";
import SearchPerson from "../../assets/icons/SearchPerson";

interface AttachmentBadgeProps {
  attachment: ChatGroupAttachment;
}

function AttachmentBadge({ attachment }: AttachmentBadgeProps) {
  const colorMap: Record<string, string> = {
    pdf: "bg-red-100 text-red-600",
    doc: "bg-blue-100 text-blue-600",
    xls: "bg-emerald-100 text-emerald-600",
    img: "bg-amber-100 text-amber-600",
  };

  const label =
    attachment.count && attachment.count > 1
      ? `+${attachment.count}`
      : attachment.type.toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 rtl:-ml-5 ltr:-mr-5 group-hover:rtl:ml-0 group-hover:ltr:mr-0 hover:rtl:ml-0 hover:ltr:mr-0",
        colorMap[attachment.type] || "bg-slate-100 text-slate-600",
      )}
    >
      {label}
    </span>
  );
}

interface ChatGroupTableRowProps {
  row: ChatGroupRow;
  chatModeLabel: (modeId: ChatGroupChatModeId) => string;
  statusLabel: (statusId: ChatGroupStatusId) => string;
  lastActivityLabel: (key: string) => string;
  viewLabel: string;
  settingsLabel: string;
  pauseLabel: string;
  resumeLabel: string;
  deleteLabel: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatGroupTableRow({
  row,
  chatModeLabel,
  statusLabel,
  lastActivityLabel,
  viewLabel,
  settingsLabel,
  pauseLabel,
  resumeLabel,
  deleteLabel,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: ChatGroupTableRowProps) {
  const isPaused = row.statusId === "paused";

  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-slate-50/70">
      <td className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-1.5 rounded-full"
            style={{ backgroundColor: row.colorIndicator }}
          />
          <div className="space-y-0.5 text-right">
            <p className="font-semibold text-slate-800">{row.groupName}</p>
            <p className="text-xs text-slate-400">{row.courseSubtitle}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-5 text-center">
        <span className="font-semibold text-slate-700 bg-[#F1F5F9] p-2 rounded-full px-5">
          {row.studentCount.toLocaleString("EG")}
        </span>
      </td>
      <td className="px-4 py-5 text-center">
        <span
          className={cn(
            "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium gap-1.5"
          )}
        >
          {chatModeLabel(row.chatModeId)}
          {row.chatModeId === "everyone" ? <Earth/> : <SearchPerson/>}
        </span>
      </td>
      <td className="px-4 py-5">
        <div className="flex flex-wrap justify-center gap-1.5">
          {row.attachments.length > 0 ? (
            row.attachments.map((att, idx) => (
              <AttachmentBadge key={`${att.type}-${idx}`} attachment={att} />
            ))
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
      </td>
      <td className="px-4 py-5 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            isPaused
              ? "bg-slate-100 text-slate-500"
              : "bg-emerald-100 text-emerald-700",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isPaused ? "bg-slate-400" : "animate-pulse bg-emerald-500",
            )}
          />
          {statusLabel(row.statusId)}
        </span>
      </td>
      <td className="px-4 py-5 text-center text-sm text-slate-500">
        {lastActivityLabel(row.lastActivityKey)}
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(row.id)}
            title={settingsLabel}
            className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            title={deleteLabel}
            className="rounded-xl p-2.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
