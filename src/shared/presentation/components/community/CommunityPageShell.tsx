"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";

type CommunityPageShellProps = {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
};

export function CommunityPageShell({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  children,
  sidebar,
  className,
}: CommunityPageShellProps) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity");

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1 text-right">
          <h1 className="text-3xl font-bold text-[#2C4260]">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {onSearchChange ? (
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-full border border-slate-200 bg-white pe-4 ps-11 text-right text-sm outline-none ring-[#2C4260]/20 focus:ring-2"
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">{children}</div>
        <aside className="space-y-4">{sidebar}</aside>
      </div>
    </div>
  );
}

export function CommunitySidebarCard({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-right text-base font-bold text-[#2C4260]">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
