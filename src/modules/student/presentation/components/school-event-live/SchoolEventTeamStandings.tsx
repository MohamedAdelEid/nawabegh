"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import type { SchoolEventStandingEntry } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventTeamStandingsProps = {
  standings: SchoolEventStandingEntry[];
  onViewFull?: () => void;
  showViewFull?: boolean;
  isLoadingFull?: boolean;
};

export function SchoolEventTeamStandings({
  standings,
  onViewFull,
  showViewFull = true,
  isLoadingFull,
}: SchoolEventTeamStandingsProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="size-5 text-[#c4a574]" aria-hidden />
        <h3 className="text-lg font-bold text-[#1e3a5f]">{t("standings.title")}</h3>
      </div>

      {standings.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t("standings.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {standings.map((row) => {
            const logo = resolveFileUrl(row.logoUrl);
            const change = row.rankChange ?? 0;
            return (
              <li
                key={row.teamId}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50"
              >
                <span className="w-5 text-sm font-bold text-slate-500">{row.rank}</span>
                <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                  {logo ? (
                    <Image src={logo} alt={row.teamName} fill className="object-cover" unoptimized />
                  ) : (
                    row.teamName.slice(0, 1)
                  )}
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate text-sm font-bold text-[#0f172a]">{row.teamName}</p>
                  {row.schoolName ? (
                    <p className="truncate text-xs text-slate-400">{row.schoolName}</p>
                  ) : null}
                </div>
                <div className="text-end">
                  <p className="text-sm font-bold text-[#1e3a5f]">
                    {t("standings.points", { points: row.points })}
                  </p>
                  <p
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium",
                      change > 0 && "text-emerald-600",
                      change < 0 && "text-rose-600",
                      change === 0 && "text-slate-400",
                    )}
                  >
                    {change > 0 ? <ArrowUp className="size-3" /> : null}
                    {change < 0 ? <ArrowDown className="size-3" /> : null}
                    {change === 0 ? "—" : Math.abs(change)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showViewFull && onViewFull ? (
        <button
          type="button"
          onClick={onViewFull}
          disabled={isLoadingFull}
          className="mt-4 w-full text-center text-sm font-bold text-[#1e3a5f] hover:opacity-80 disabled:opacity-50"
        >
          {isLoadingFull ? t("standings.loading") : t("standings.viewFull")}
        </button>
      ) : null}
    </section>
  );
}
