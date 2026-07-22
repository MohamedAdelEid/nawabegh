"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ParentHomeChild } from "@/modules/parent/domain/types/parentHome.types";
import {
  getPerformanceLevelKey,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

function ChildCard({ child, index }: { child: ParentHomeChild; index: number }) {
  const t = useTranslations("parent.dashboard.home.children");
  const tLevels = useTranslations("parent.dashboard.home.levels");
  const locale = useLocale();
  const { isRtl } = useDirection();
  const levelKey = getPerformanceLevelKey(child.progressPercent);
  const grade = resolveLocalizedText(
    locale,
    [child.gradeNameAr, child.educationLevelNameAr].filter(Boolean).join(" "),
    [child.gradeNameEn, child.educationLevelNameEn].filter(Boolean).join(" "),
  );
  const estimatedLevel = Math.max(1, Math.round(child.progressPercent / 8));
  const barColor = index % 2 === 0 ? "bg-[#58cc02]" : "bg-[#2b415e]";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <article className="flex flex-col gap-6 rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ParentAvatar
              url={child.profileImageUrl}
              name={child.fullName}
              className="h-16 w-[60px] shadow-md"
            />
            <span className="absolute -bottom-2 -start-2 rounded-full bg-[#c7af6d] px-2 py-1 text-[10px] font-bold text-white">
              {t("levelBadge", { level: estimatedLevel })}
            </span>
          </div>
          <div className="min-w-0 text-start">
            <h3 className="text-lg font-bold text-[#0f172a]">{child.fullName}</h3>
            <p className="text-sm text-[#64748b]">{grade || child.schoolName}</p>
          </div>
        </div>
        <span className="rounded-lg bg-[#dee2e6] px-3 py-1 text-xs font-bold text-[#64748b]">
          {tLevels(levelKey)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-[#0f172a]">{t("overallProgress")}</span>
          <span className="font-bold text-[#2b415e]">
            {Math.round(child.progressPercent)}%
          </span>
        </div>
        <ParentProgressBar value={child.progressPercent} barClassName={barColor} />
      </div>

      <div className="grid grid-cols-2 gap-4 border-y border-[#e2e8f0] py-4">
        <div className="text-center">
          <p className="text-xs text-[#64748b]">{t("activeDays")}</p>
          <p className="text-lg font-bold text-[#2b415e]">
            {t("activeDaysValue", { count: child.activeDaysLast30 })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#64748b]">{t("schoolRank")}</p>
          <p className="text-lg font-bold text-[#2b415e]">
            {child.schoolRank != null ? `#${child.schoolRank}` : "—"}
          </p>
        </div>
      </div>

      <Button
        asChild
        className="h-11 w-full gap-2 rounded-xl bg-[#f4ecd8] text-sm font-bold text-[#2b415e] hover:bg-[#ebe0c4]"
      >
        <Link href={ROUTES.USER.PARENT.CHILD_DETAILS(child.studentUserId)}>
          {t("viewProfile")}
          <Chevron className="size-4" aria-hidden />
        </Link>
      </Button>
    </article>
  );
}

export function ParentChildrenOverview({
  childrenList,
}: {
  childrenList: ParentHomeChild[];
}) {
  const t = useTranslations("parent.dashboard.home.children");
  const tCommon = useTranslations("parent.dashboard.common");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
        <Link
          href={ROUTES.USER.PARENT.CHILDREN}
          className={cn("text-xs font-bold text-[#64748b] hover:text-[#2b415e]")}
        >
          {tCommon("viewAll")}
        </Link>
      </div>

      {childrenList.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          {tCommon("emptyChildren")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {childrenList.map((child, index) => (
            <ChildCard key={child.studentUserId} child={child} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
