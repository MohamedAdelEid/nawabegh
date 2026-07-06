"use client";

import { useState } from "react";
import { Archive, Eye, Globe, MoreVertical, Pencil, UploadCloud } from "lucide-react";
import type { CourseManagementRow } from "@/modules/admin/domain/data/courseManagementData";
import {
  canApproveCourse,
  canArchiveCourse,
  canPublishCourse,
  canRejectCourse,
  canUnpublishCourse,
} from "@/modules/admin/domain/utils/courseModeration";
import { Button } from "@/shared/presentation/components/ui/button";

type CourseManagementRowActionLabels = {
  approve: string;
  reject: string;
  view: string;
  edit: string;
  archive: string;
  publish: string;
  unpublish: string;
  more: string;
};

type CourseManagementRowActionsProps = {
  row: CourseManagementRow;
  labels: CourseManagementRowActionLabels;
  onApprove: (courseId: string) => void | Promise<void>;
  onReject: (courseId: string) => void;
  onView: (courseId: string) => void;
  onEdit?: (courseId: string) => void;
  onArchive?: (courseId: string) => void;
  onPublish?: (courseId: string) => void;
  onUnpublish?: (courseId: string) => void;
};

export function CourseManagementRowActions({
  row,
  labels,
  onApprove,
  onReject,
  onView,
  onEdit,
  onArchive,
  onPublish,
  onUnpublish,
}: CourseManagementRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionCourseId = row.courseId ?? row.id;

  const showApprove = canApproveCourse(row.statusId);
  const showReject = canRejectCourse(row.statusId);
  const showArchive = canArchiveCourse(row.statusId);
  const showPublish = canPublishCourse(row.statusId, row.isPublished);
  const showUnpublish = canUnpublishCourse(row.statusId, row.isPublished);
  const showEdit = row.statusId === "approved" || row.statusId === "draft";

  const runAction = (action: () => void | Promise<void>) => {
    setMenuOpen(false);
    void action();
  };

  const approveButton = showApprove ? (
    <Button
      type="button"
      size="sm"
      className="h-8 rounded-lg bg-[#67C23A] px-3 text-xs font-semibold text-white shadow-[0px_2px_0px_0px_#46A302] hover:bg-[#46A302]"
      onClick={(event) => {
        event.stopPropagation();
        void onApprove(actionCourseId);
      }}
    >
      {labels.approve}
    </Button>
  ) : null;

  const rejectButton = showReject ? (
    <Button
      type="button"
      size="sm"
      className="h-8 rounded-lg bg-[#FF4B4B] px-3 text-xs font-semibold text-white shadow-[0px_2px_0px_0px_#D33131] hover:bg-[#D33131]"
      onClick={(event) => {
        event.stopPropagation();
        onReject(actionCourseId);
      }}
    >
      {labels.reject}
    </Button>
  ) : null;

  const viewButton = (
    <button
      type="button"
      className="dashboard-icon-btn"
      aria-label={labels.view}
      onClick={(event) => {
        event.stopPropagation();
        onView(actionCourseId);
      }}
    >
      <Eye className="h-4 w-4" aria-hidden />
    </button>
  );

  const editButton = showEdit ? (
    <button
      type="button"
      className="dashboard-icon-btn"
      aria-label={labels.edit}
      onClick={(event) => {
        event.stopPropagation();
        onEdit?.(actionCourseId);
      }}
    >
      <Pencil className="h-4 w-4" aria-hidden />
    </button>
  ) : null;

  const archiveButton = showArchive ? (
    <button
      type="button"
      className="dashboard-icon-btn"
      aria-label={labels.archive}
      onClick={(event) => {
        event.stopPropagation();
        onArchive?.(actionCourseId);
      }}
    >
      <Archive className="h-4 w-4" aria-hidden />
    </button>
  ) : null;

  const publishButton = showPublish ? (
    <button
      type="button"
      className="dashboard-icon-btn text-emerald-600"
      aria-label={labels.publish}
      onClick={(event) => {
        event.stopPropagation();
        onPublish?.(actionCourseId);
      }}
    >
      <Globe className="h-4 w-4" aria-hidden />
    </button>
  ) : null;

  const unpublishButton = showUnpublish ? (
    <button
      type="button"
      className="dashboard-icon-btn"
      aria-label={labels.unpublish}
      onClick={(event) => {
        event.stopPropagation();
        onUnpublish?.(actionCourseId);
      }}
    >
      <UploadCloud className="h-4 w-4" aria-hidden />
    </button>
  ) : null;

  const desktopActions = (
    <>
      {approveButton}
      {rejectButton}
      {publishButton}
      {unpublishButton}
      {archiveButton}
      {editButton}
      {viewButton}
    </>
  );

  const menuItems = [
    ...(showApprove
      ? [
          {
            label: labels.approve,
            className: "text-emerald-700 hover:bg-emerald-50",
            onClick: () => onApprove(actionCourseId),
          },
        ]
      : []),
    ...(showReject
      ? [
          {
            label: labels.reject,
            className: "text-rose-600 hover:bg-rose-50",
            onClick: () => onReject(actionCourseId),
          },
        ]
      : []),
    ...(showPublish
      ? [
          {
            label: labels.publish,
            className: "text-emerald-700 hover:bg-emerald-50",
            onClick: () => onPublish?.(actionCourseId),
          },
        ]
      : []),
    ...(showUnpublish
      ? [
          {
            label: labels.unpublish,
            className: "text-amber-700 hover:bg-amber-50",
            onClick: () => onUnpublish?.(actionCourseId),
          },
        ]
      : []),
    ...(showArchive
      ? [
          {
            label: labels.archive,
            className: "text-rose-600 hover:bg-rose-50",
            onClick: () => onArchive?.(actionCourseId),
          },
        ]
      : []),
    ...(showEdit
      ? [
          {
            label: labels.edit,
            className: "text-slate-700 hover:bg-slate-50",
            onClick: () => onEdit?.(actionCourseId),
          },
        ]
      : []),
    {
      label: labels.view,
      className: "text-slate-700 hover:bg-slate-50",
      onClick: () => onView(actionCourseId),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 lg:flex">{desktopActions}</div>
      <div className="relative lg:hidden">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label={labels.more}
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((current) => !current);
          }}
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-20 mt-1 min-w-[12rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`w-full rounded-xl px-3 py-2 text-right text-sm font-medium transition-colors ${item.className}`}
                onClick={() => runAction(item.onClick)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
