"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import type { AddUserLinkedEntity } from "@/modules/admin/domain/types/addUser.types";
import { Button } from "@/shared/presentation/components/ui/button";

export function AddUserLinkedEntityList({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: AddUserLinkedEntity[];
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-2xl border border-[var(--dashboard-border-soft)] bg-[#F8FAFC] p-4"
        >
          <div className="flex items-center gap-3 text-right">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
                item.avatarClassName,
              )}
            >
              {item.avatarInitials}
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--dashboard-primary)]">{item.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">{item.secondaryLabel}</p>
                <span className="block w-1 h-1 rounded-full bg-slate-400"/>
                {item.tertiaryLabel ? (
                  <p className="text-xs text-slate-400">{item.tertiaryLabel}</p>
                ) : null}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => onRemove?.(item.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  );
}
