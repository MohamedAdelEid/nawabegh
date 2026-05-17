"use client";

import type React from "react";
import { Users, Radio } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import type { ChatGroupChatModeId } from "@/modules/admin/domain/types/chatGroups.types";

type PermissionOption = {
  id: ChatGroupChatModeId;
  label: string;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

interface ChatGroupSendPermissionSelectorProps {
  value: ChatGroupChatModeId;
  onChange: (value: ChatGroupChatModeId) => void;
  everyoneLabel: string;
  everyoneDescription?: string;
  teacherOnlyLabel: string;
  teacherOnlyDescription?: string;
}

export function ChatGroupSendPermissionSelector({
  value,
  onChange,
  everyoneLabel,
  everyoneDescription,
  teacherOnlyLabel,
  teacherOnlyDescription,
}: ChatGroupSendPermissionSelectorProps) {
  const options: PermissionOption[] = [
    {
      id: "everyone",
      label: everyoneLabel,
      description: everyoneDescription,
      icon: Users,
    },
    {
      id: "teacherOnly",
      label: teacherOnlyLabel,
      description: teacherOnlyDescription,
      icon: Radio,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = value === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border-2 p-2 text-center transition-all duration-200",
              isSelected
                ? "border-[#243B5A] bg-[#F8FAFC] shadow-[0_4px_12px_rgba(36,59,90,0.08)]"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                isSelected
                  ? "bg-[#243B5A] text-white"
                  : "bg-slate-200 text-slate-500 group-hover:bg-slate-300",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p
                className={cn(
                  "text-sm font-semibold transition-colors",
                  isSelected ? "text-[#243B5A]" : "text-slate-600",
                )}
              >
                {option.label}
              </p>
              {option.description ? (
                <p className="text-xs text-slate-400">{option.description}</p>
              ) : null}
            </div>
            {isSelected ? (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#243B5A] text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
