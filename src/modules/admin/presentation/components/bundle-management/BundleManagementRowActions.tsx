"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { BundleAdminListItem } from "@/modules/admin/infrastructure/api/bundlesApi";

type BundleManagementRowActionsProps = {
  row: BundleAdminListItem;
  labels: {
    edit: string;
    publish: string;
    unpublish: string;
    activate: string;
    deactivate: string;
    delete: string;
    more: string;
  };
  onEdit: (bundleId: string) => void;
  onPublish: (bundleId: string) => void;
  onUnpublish: (bundleId: string) => void;
  onActivate: (bundleId: string) => void;
  onDeactivate: (bundleId: string) => void;
  onDelete: (row: BundleAdminListItem) => void;
};

export function BundleManagementRowActions({
  row,
  labels,
  onEdit,
  onPublish,
  onUnpublish,
  onActivate,
  onDeactivate,
  onDelete,
}: BundleManagementRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const openMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: (rect.bottom + window.scrollY) - 160,
        left: 160 - rect.left + window.scrollX, // 160 = ~menu width offset
      });
    }
    setMenuOpen((cur) => !cur);
  };

  // Close on scroll so menu doesn't float away from its trigger
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [menuOpen]);

  const runAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  const menuItems = [
    {
      label: labels.edit,
      icon: <Pencil className="h-4 w-4" aria-hidden />,
      className: "text-slate-700 hover:bg-slate-50",
      onClick: () => onEdit(row.id),
    },
    row.isPublished
      ? {
          label: labels.unpublish,
          icon: null,
          className: "text-slate-700 hover:bg-slate-50",
          onClick: () => onUnpublish(row.id),
        }
      : {
          label: labels.publish,
          icon: null,
          className: "text-emerald-700 hover:bg-emerald-50",
          onClick: () => onPublish(row.id),
        },
    row.status === 0
      ? {
          label: labels.deactivate,
          icon: null,
          className: "text-amber-700 hover:bg-amber-50",
          onClick: () => onDeactivate(row.id),
        }
      : {
          label: labels.activate,
          icon: null,
          className: "text-emerald-700 hover:bg-emerald-50",
          onClick: () => onActivate(row.id),
        },
    {
      label: labels.delete,
      icon: <Trash2 className="h-4 w-4" aria-hidden />,
      className: "text-rose-600 hover:bg-rose-50",
      onClick: () => onDelete(row),
    },
  ];

  return (
    <div className="flex justify-center">
      <button
        ref={buttonRef}
        type="button"
        className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label={labels.more}
        aria-expanded={menuOpen}
        onClick={openMenu}
      >
        <MoreVertical className="h-5 w-5" aria-hidden />
      </button>

      {menuOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998] cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            {/* Menu */}
            <div
              role="menu"
              style={{ top: menuPos.top, left: menuPos.left }}
              className="absolute z-[9999] min-w-[12rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm font-medium transition-colors ${item.className}`}
                  onClick={() => runAction(item.onClick)}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}