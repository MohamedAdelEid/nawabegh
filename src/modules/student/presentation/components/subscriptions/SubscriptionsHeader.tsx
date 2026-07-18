"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type SubscriptionsHeaderProps = {
  studentName: string;
};

export function SubscriptionsHeader({ studentName }: SubscriptionsHeaderProps) {
  const t = useTranslations("student.dashboard.subscriptions");

  return (
    <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-end">
        <h1 className="text-3xl font-bold text-[#2c4260]">
          {t("welcome", { name: studentName })}
        </h1>
      </div>

      <Link
        href={ROUTES.USER.STUDENT.COURSES}
        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-[#c7a55b] px-6 py-3 text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(199,165,91,0.3)] transition hover:brightness-105"
      >
        {t("actions.explore")}
        <Plus className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
