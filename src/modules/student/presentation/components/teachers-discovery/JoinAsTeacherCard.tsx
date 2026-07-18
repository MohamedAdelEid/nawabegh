"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { cn } from "@/shared/application/lib/cn";

type JoinAsTeacherCardProps = {
  className?: string;
};

export function JoinAsTeacherCard({ className }: JoinAsTeacherCardProps) {
  const t = useTranslations("student.dashboard.teachersDiscovery.joinCard");

  return (
    <Link
      href={AUTH_ROUTES.REGISTER_TEACHER}
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-[20px] border-4 border-dashed border-[#e2e8f0] px-7 py-16 text-center transition-colors hover:border-[#cbd5e1] hover:bg-white/60",
        className,
      )}
    >
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#f1f5f9]">
        <Plus className="size-6 text-[#94a3b8]" aria-hidden />
      </span>
      <h3 className="text-lg font-bold text-[#94a3b8]">{t("title")}</h3>
      <p className="mt-2 max-w-[14rem] text-sm leading-5 text-[#94a3b8]">
        {t("descriptionLine1")}
        <br />
        {t("descriptionLine2")}
      </p>
    </Link>
  );
}
