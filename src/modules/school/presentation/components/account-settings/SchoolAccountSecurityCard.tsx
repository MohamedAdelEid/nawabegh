"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Monitor, Shield, Smartphone } from "lucide-react";
import type { SchoolAccountSession } from "@/modules/school/domain/types/schoolAccount.types";
import { AddUserFormSectionCard } from "@/modules/admin/presentation/components/add-user/AddUserFormSectionCard";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

function formatRelativeLastSeen(value: string | null, fallbackLabel: string, locale: string): string {
  if (fallbackLabel.trim()) return fallbackLabel;
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return locale.startsWith("ar") ? "الآن" : "Now";
  if (diffMinutes < 60) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-diffDays, "day");
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SchoolAccountSecurityCard({
  sessions,
  canRevokeAllSessions,
  canRemoveSessions,
  isRevokingAll,
  removingSessionId,
  onRevokeAll,
  onRemoveSession,
}: {
  sessions: SchoolAccountSession[];
  canRevokeAllSessions: boolean;
  canRemoveSessions: boolean;
  isRevokingAll: boolean;
  removingSessionId?: string;
  onRevokeAll: () => void;
  onRemoveSession: (sessionId: string) => void;
}) {
  const t = useTranslations("school.dashboard.settingsPage");
  const locale = useLocale();

  return (
    <AddUserFormSectionCard title={t("sections.security")} icon={Shield}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{t("security.description")}</p>
        {canRevokeAllSessions ? (
          <Button
            type="button"
            variant="outline"
            disabled={isRevokingAll || sessions.length <= 1}
            onClick={onRevokeAll}
            className="rounded-2xl border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {isRevokingAll ? t("actions.revoking") : t("actions.revokeAll")}
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
          <span>{t("security.columns.device")}</span>
          <span>{t("security.columns.location")}</span>
          <span>{t("security.columns.lastSeen")}</span>
          <span>{t("security.columns.status")}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">{t("security.empty")}</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => {
              const Icon = session.isMobile ? Smartphone : Monitor;
              const title = [session.deviceLabel, session.browser].filter(Boolean).join(" · ");
              const lastSeen = formatRelativeLastSeen(
                session.lastSeenAt,
                session.lastSeenLabel,
                locale,
              );
              const isRemoving = removingSessionId === session.id;

              return (
                <motion.li
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50/80 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] md:items-center md:gap-4"
                >
                  <div className="flex items-start gap-3 text-right">
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#2C4260]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-[#2b415e]">{title || "—"}</p>
                      <p className="text-xs text-slate-500">
                        {session.ipAddress
                          ? t("security.ip", { ip: session.ipAddress })
                          : t("security.ipUnknown")}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 md:text-right">
                    <span className="md:hidden text-xs font-semibold text-slate-400">
                      {t("security.columns.location")}:{" "}
                    </span>
                    {session.location || "—"}
                  </div>

                  <div className="text-sm text-slate-600 md:text-right">
                    <span className="md:hidden text-xs font-semibold text-slate-400">
                      {t("security.columns.lastSeen")}:{" "}
                    </span>
                    {lastSeen}
                  </div>

                  <div className="md:text-right">
                    {session.isCurrent ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {t("security.active")}
                      </span>
                    ) : canRemoveSessions ? (
                      <button
                        type="button"
                        disabled={isRemoving}
                        onClick={() => onRemoveSession(session.id)}
                        className={cn(
                          "text-sm font-semibold text-red-500 transition hover:text-red-600",
                          isRemoving && "opacity-60",
                        )}
                      >
                        {isRemoving ? t("actions.removing") : t("actions.removeDevice")}
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </AddUserFormSectionCard>
  );
}
