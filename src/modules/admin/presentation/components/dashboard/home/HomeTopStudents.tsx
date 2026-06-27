"use client";

import { Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { formatNumber } from "@/shared/application/lib/format";
import { localeToIntl } from "@/modules/admin/presentation/components/dashboard/home/homeFormat";
import type { AdminHomeTopStudent } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeTopStudentsProps = {
  students: AdminHomeTopStudent[];
};

function StudentAvatar({ student }: { student: AdminHomeTopStudent }) {
  if (student.profileImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.profileImageUrl}
        alt={student.fullName}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  const initials = student.fullName.trim().charAt(0) || "?";
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2C4260] text-sm font-bold text-white">
      {initials}
    </div>
  );
}

export function HomeTopStudents({ students }: HomeTopStudentsProps) {
  const t = useTranslations("admin.dashboard.home.topStudents");
  const locale = useLocale();
  const intlLocale = localeToIntl(locale);
  const router = useRouter();

  return (
    <Card className="h-full rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-4 p-6 text-right">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className="text-sm font-medium text-[#2C4260] hover:underline"
            onClick={() => router.push(ROUTES.ADMIN.USER_MANAGEMENT.LIST)}
          >
            {t("viewAll")}
          </button>
          <h2 className="text-xl font-bold text-slate-800">{t("title")}</h2>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty")}</p>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <li
                key={student.studentUserId}
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <StudentAvatar student={student} />
                  <p className="font-semibold text-slate-700">{student.fullName}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8F6C0B]">
                  {formatNumber(student.points, intlLocale)}
                  <Trophy className="h-4 w-4" aria-hidden />
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
