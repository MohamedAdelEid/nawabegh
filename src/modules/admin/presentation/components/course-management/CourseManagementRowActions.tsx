"use client";

import { useState } from "react";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { CourseManagementRow } from "@/modules/admin/domain/data/courseManagementData";
import { Button } from "@/shared/presentation/components/ui/button";

type CourseManagementRowActionLabels = {
  approve: string;
  reject: string;
  view: string;
  edit: string;
  delete: string;
  more: string;
  rejectionDetails: string;
};

type CourseManagementRowActionsProps = {
  row: CourseManagementRow;
  labels: CourseManagementRowActionLabels;
  onApprove: (courseId: string) => void | Promise<void>;
  onReject: (courseId: string) => void;
  onView: (courseId: string) => void;
  onRejectionDetails: (courseId: string) => void;
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
};

export function CourseManagementRowActions({
  row,
  labels,
  onApprove,
  onReject,
  onView,
  onRejectionDetails,
  onEdit,
  onDelete,
}: CourseManagementRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const runAction = (action: () => void | Promise<void>) => {
    setMenuOpen(false);
    void action();
  };

  const pendingActions = (
    <>
      <Button
        type="button"
        size="sm"
        className="h-8 rounded-lg bg-[#67C23A] px-3 text-xs font-semibold text-white shadow-[0px_2px_0px_0px_#46A302] hover:bg-[#46A302]"
        onClick={(event) => {
          event.stopPropagation();
          void onApprove(row.id);
        }}
      >
        {labels.approve}
      </Button>
      <Button
        type="button"
        size="sm"
        className="h-8 rounded-lg bg-[#FF4B4B] px-3 text-xs font-semibold text-white shadow-[0px_2px_0px_0px_#D33131] hover:bg-[#D33131]"
        onClick={(event) => {
          event.stopPropagation();
          onReject(row.id);
        }}
      >
        {labels.reject}
      </Button>
      <button
        type="button"
        className="dashboard-icon-btn"
        aria-label={labels.view}
        onClick={(event) => {
          event.stopPropagation();
          onView(row.id);
        }}
      >
        <Eye className="h-4 w-4" aria-hidden />
      </button>
    </>
  );

  const rejectedActions = (
    <Button
      type="button"
      className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-600 shadow-[0px_2px_0px_0px_#0000000D] hover:bg-slate-200"
      onClick={(event) => {
        event.stopPropagation();
        onRejectionDetails(row.id);
      }}
    >
      {labels.rejectionDetails}
    </Button>
  );

  const defaultActions = (
    <>
      <button
        type="button"
        className="dashboard-icon-btn"
        aria-label={labels.delete}
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.(row.id);
        }}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className="dashboard-icon-btn"
        aria-label={labels.edit}
        onClick={(event) => {
          event.stopPropagation();
          onEdit?.(row.id);
        }}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className="dashboard-icon-btn"
        aria-label={labels.view}
        onClick={(event) => {
          event.stopPropagation();
          onView(row.id);
        }}
      >
        <Eye className="h-4 w-4" aria-hidden />
      </button>
    </>
  );

  const desktopActions =
    row.statusId === "pending"
      ? pendingActions
      : row.statusId === "rejected"
        ? rejectedActions
        : defaultActions;

  const menuItems =
    row.statusId === "pending"
      ? [
          {
            label: labels.approve,
            className: "text-emerald-700 hover:bg-emerald-50",
            onClick: () => onApprove(row.id),
          },
          {
            label: labels.reject,
            className: "text-rose-600 hover:bg-rose-50",
            onClick: () => onReject(row.id),
          },
          {
            label: labels.view,
            className: "text-slate-700 hover:bg-slate-50",
            onClick: () => onView(row.id),
          },
        ]
      : row.statusId === "rejected"
        ? [
            {
              label: labels.rejectionDetails,
              className: "text-slate-700 hover:bg-slate-50",
              onClick: () => onRejectionDetails(row.id),
            },
          ]
        : [
            {
              label: labels.view,
              className: "text-slate-700 hover:bg-slate-50",
              onClick: () => onView(row.id),
            },
            {
              label: labels.edit,
              className: "text-slate-700 hover:bg-slate-50",
              onClick: () => onEdit?.(row.id),
            },
            {
              label: labels.delete,
              className: "text-rose-600 hover:bg-rose-50",
              onClick: () => onDelete?.(row.id),
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
