"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import type { ChatGroupLinkedCourse } from "@/modules/admin/domain/types/chatGroups.types";

interface ChatGroupLinkedCourseSectionProps {
  /** Short intro shown below the toggle (localized). */
  intro: string;
  draftUrl: string;
  onDraftUrlChange: (url: string) => void;
  linkedCourses: ChatGroupLinkedCourse[];
  /** Called after mock verify succeeds; parent should append and clear draft. */
  onAddVerifiedCourse: (url: string) => void;
  onRemoveCourse: (id: string) => void;
  enableToggle: boolean;
  onEnableToggleChange: (enabled: boolean) => void;
  toggleLabel: string;
  toggleDescription: string;
  urlLabel: string;
  urlPlaceholder: string;
  verifyLabel: string;
  verifyingLabel: string;
  verifiedMessage: string;
  linkedCourseLabel: string;
  linkedListTitle: string;
  removeCourseLabel: string;
  duplicateInListMessage: string;
}

export function ChatGroupLinkedCourseSection({
  intro,
  draftUrl,
  onDraftUrlChange,
  linkedCourses,
  onAddVerifiedCourse,
  onRemoveCourse,
  enableToggle,
  onEnableToggleChange,
  toggleLabel,
  toggleDescription,
  urlLabel,
  urlPlaceholder,
  verifyLabel,
  verifyingLabel,
  verifiedMessage,
  linkedCourseLabel,
  linkedListTitle,
  removeCourseLabel,
  duplicateInListMessage,
}: ChatGroupLinkedCourseSectionProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const trimmedDraft = draftUrl.trim();
  const alreadyLinked = linkedCourses.some(
    (c) => c.url.replace(/^https?:\/\//i, "") === trimmedDraft.replace(/^https?:\/\//i, ""),
  );

  const handleVerify = async () => {
    if (!trimmedDraft || alreadyLinked) return;
    setIsVerifying(true);
    setJustAdded(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onAddVerifiedCourse(trimmedDraft);
    setJustAdded(true);
    setIsVerifying(false);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
        <div className="space-y-0.5 text-right">
          <span className="text-sm font-medium text-slate-700">{toggleLabel}</span>
          <p className="text-xs text-slate-400">{toggleDescription}</p>
        </div>
        <StatusSwitch
          checked={enableToggle}
          onChange={onEnableToggleChange}
          activeLabel={toggleLabel}
          inactiveLabel={toggleLabel}
          activeClassName="bg-[#243B5A]"
          inactiveClassName="bg-slate-300"
        />
      </label>

      <p className="text-sm leading-relaxed text-slate-500">{intro}</p>

      {enableToggle ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">{urlLabel}</label>
            <div className="flex items-stretch gap-3">
              <div className="relative flex-1">
                <Input
                  type="url"
                  value={draftUrl}
                  onChange={(e) => onDraftUrlChange(e.target.value)}
                  placeholder={urlPlaceholder}
                  className="h-12 rounded-xl border-slate-200 bg-white pl-10 pr-4 text-sm"
                  dir="ltr"
                />
                <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={!trimmedDraft || isVerifying || alreadyLinked}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#243B5A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1D314B] disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {verifyingLabel}
                  </>
                ) : (
                  verifyLabel
                )}
              </Button>
            </div>
            {alreadyLinked && trimmedDraft ? (
              <p className="text-xs text-amber-600">{duplicateInListMessage}</p>
            ) : null}
          </div>

          {justAdded ? (
            <div className="flex items-center gap-3 rounded-xl bg-[#67C23A]/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-[#67C23A]" />
              <span className="text-sm font-medium text-[#67C23A]">{verifiedMessage}</span>
            </div>
          ) : null}

          {linkedCourses.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">{linkedListTitle}</h3>
              <ul className="space-y-2">
                {linkedCourses.map((course) => (
                  <li
                    key={course.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <BookOpen className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-xs text-slate-400">{linkedCourseLabel}</p>
                      <p className="truncate text-sm font-medium text-slate-800">{course.name}</p>
                      <p className="truncate text-xs text-slate-500" dir="ltr">
                        {course.url}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCourse(course.id)}
                      title={removeCourseLabel}
                      aria-label={removeCourseLabel}
                      className="shrink-0 rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
