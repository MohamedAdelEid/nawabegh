"use client";

import { Building2, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { formatNumber } from "@/shared/application/lib/format";
import { localeToIntl } from "@/modules/admin/presentation/components/dashboard/home/homeFormat";
import type { AdminHomeSchoolRanking } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeSchoolRankingsProps = {
  schools: AdminHomeSchoolRanking[];
};

function SchoolLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
      <Building2 className="h-5 w-5" aria-hidden />
    </div>
  );
}

export function HomeSchoolRankings({ schools }: HomeSchoolRankingsProps) {
  const t = useTranslations("admin.dashboard.home.schoolRankings");
  const locale = useLocale();
  const intlLocale = localeToIntl(locale);

  const [topSchool, ...restSchools] = schools;

  return (
    <Card className="h-full rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-5 p-6 text-right">
        <h2 className="text-xl font-bold text-slate-800">{t("title")}</h2>

        {schools.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty")}</p>
        ) : (
          <>
            {topSchool ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E7D9A8] bg-gradient-to-l from-[#FBF4DD] to-[#F8EFD5] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8F6C0B] text-white">
                    <Trophy className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{topSchool.name}</p>
                    <p className="text-xs text-slate-500">
                      {t("students", { count: formatNumber(topSchool.studentCount, intlLocale) })}
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-[#8F6C0B]">
                  {formatNumber(topSchool.totalPoints, intlLocale)}
                </span>
              </div>
            ) : null}

            <ul className="space-y-3">
              {restSchools.map((school) => (
                <li key={school.schoolId} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-400">{school.rank}</span>
                  <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-700">{school.name}</p>
                      <p className="text-xs text-slate-400">
                        {t("points", { count: formatNumber(school.totalPoints, intlLocale) })}
                      </p>
                    </div>
                    <SchoolLogo name={school.name} logoUrl={school.logoUrl} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
