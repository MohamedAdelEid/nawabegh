"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CommunityBadgeRow } from "@/modules/admin/domain/types/communityBadges.types";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import {
  badgeColorToAccent,
  badgeColorToIconBg,
  formatBadgeCondition,
} from "./communityBadgeDisplay";

type CommunityBadgeTableRowProps = {
  badge: CommunityBadgeRow;
  editHref?: string;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  toggling?: boolean;
  compact?: boolean;
};

export function CommunityBadgeTableRow({
  badge,
  editHref,
  onEdit,
  onToggle,
  onDelete,
  toggling = false,
  compact = false,
}: CommunityBadgeTableRowProps) {
  const t = useTranslations("admin.dashboard.articleEditor.communityBadges");
  const accent = badgeColorToAccent(badge.color);
  const accentClass =
    accent === "emerald"
      ? "border-s-emerald-500"
      : accent === "amber"
        ? "border-s-amber-400"
        : "border-s-blue-500";

  const activityLabels = {
    posts: t("activity.posts"),
    comments: t("activity.comments"),
    likes: t("activity.likes"),
    lessons: t("activity.lessons"),
  };

  const condition = badge.description.trim() || formatBadgeCondition(badge, activityLabels);
  const recipientsLabel =
    badge.earnerCount <= 0
      ? t("recipients.none")
      : t("recipients.users", { count: badge.earnerCount });

  const iconUrl = badge.iconUrl ? resolveFileUrl(badge.iconUrl) : null;

  return (
    <tr
      className={cn(
        "border-s-4 bg-white hover:bg-[#FAFCFF]",
        accentClass,
        !badge.enabled && "opacity-70",
      )}
    >
      <td className="px-4 py-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-[#E8ECF2]",
            badgeColorToIconBg(badge.color),
          )}
        >
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <Award className="h-5 w-5 text-[#2D3E50]" aria-hidden />
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-0.5">
          <p className="font-bold text-[#2D3E50]">
            {badge.name}
            {!badge.enabled ? (
              <span className="ms-2 text-xs font-semibold text-slate-400">
                ({t("status.disabled")})
              </span>
            ) : null}
          </p>
        </div>
      </td>
      <td className="max-w-xs px-4 py-4 text-slate-600">{condition}</td>
      <td className="px-4 py-4 text-slate-600">{recipientsLabel}</td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          {editHref ? (
            <Link
              href={editHref}
              className="rounded-lg border border-[#E2E8F0] p-2 text-slate-600 hover:bg-slate-50"
              aria-label={t("actions.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          ) : onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-[#E2E8F0] p-2 text-slate-600 hover:bg-slate-50"
              aria-label={t("actions.edit")}
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          {onToggle ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={toggling}
              onClick={onToggle}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-bold",
                badge.enabled
                  ? "border-[#F44336]/40 text-[#F44336] hover:bg-red-50"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
              )}
            >
              {badge.enabled ? t("actions.disable") : t("actions.enable")}
            </Button>
          ) : null}
          {!compact && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-[#E2E8F0] p-2 text-rose-600 hover:bg-rose-50"
              aria-label={t("actions.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
