"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function SchoolHonorBoardNav({ active }: { active: "leaderboard" | "honors" }) {
  const t = useTranslations("school.dashboard.honorBoard.nav");
  const items = [
    { id: "leaderboard", href: ROUTES.USER.SCHOOL.HONOR_BOARD.LEADERBOARD },
    { id: "honors", href: ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS },
  ] as const;

  return (
    <nav className="inline-flex rounded-2xl bg-slate-200/60 p-1" aria-label={t("label")}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={active === item.id ? "page" : undefined}
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
            active === item.id
              ? "bg-white text-[#2C4260] shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          {t(item.id)}
        </Link>
      ))}
    </nav>
  );
}
