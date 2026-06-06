"use client";

import Image from "next/image";
import { Award } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AchievementBadgeRow } from "@/modules/admin/domain/types/achievementBadges.types";
import { BadgePreviewCard } from "./BadgePreviewCard";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

interface BadgeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: AchievementBadgeRow | null;
}

export function BadgeDetailModal({ open, onOpenChange, badge }: BadgeDetailModalProps) {
  const t = useTranslations("admin.dashboard.badgeManagement.detailModal");
  const tTable = useTranslations("admin.dashboard.badgeManagement.table");
  const locale = useLocale();

  if (!badge) return null;

  const iconUrl = badge.iconUrl ? resolveFileUrl(badge.iconUrl) : null;
  const createdAt = badge.createdAt
    ? new Date(badge.createdAt).toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(95vw,32rem)] rounded-[2rem] p-6 sm:p-8"
    >
      <ModalTitle className="mb-6 text-right text-xl font-bold text-slate-800">
        {t("title")}
      </ModalTitle>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
            {iconUrl ? (
              <Image src={iconUrl} alt="" fill unoptimized className="object-contain p-2" />
            ) : (
              <Award className="h-8 w-8 text-slate-300" aria-hidden />
            )}
          </div>
          <div className="space-y-1 text-right">
            <p className="text-lg font-bold text-slate-800">{badge.name}</p>
            <DashboardBadge tone={badge.isActive ? "success" : "neutral"} withDot>
              {tTable(`statuses.${badge.isActive ? "active" : "inactive"}`)}
            </DashboardBadge>
          </div>
        </div>

        <BadgePreviewCard
          name={badge.name}
          description={badge.description}
          iconUrl={iconUrl}
          requiredPoints={badge.requiredPoints}
        />

        <dl className="grid grid-cols-2 gap-4 text-right text-sm">
          <div>
            <dt className="text-slate-400">{t("requiredPoints")}</dt>
            <dd className="font-semibold text-slate-800">{badge.requiredPoints}</dd>
          </div>
          <div>
            <dt className="text-slate-400">{t("earnedCount")}</dt>
            <dd className="font-semibold text-slate-800">{badge.earnedCount}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-400">{t("createdAt")}</dt>
            <dd className="font-semibold text-slate-800">{createdAt}</dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl"
          onClick={() => onOpenChange(false)}
        >
          {t("close")}
        </Button>
      </div>
    </ModalShell>
  );
}
