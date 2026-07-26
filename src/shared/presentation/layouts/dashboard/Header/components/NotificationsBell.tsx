"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useInAppNotificationsInbox,
  useInAppNotificationsUnreadCount,
  useMarkInAppNotificationRead,
} from "@/shared/application/hooks/useInAppNotifications";
import type { InAppNotification } from "@/shared/domain/types/notification.types";
import { formatNotificationRelativeTime } from "@/shared/domain/utils/notification.utils";
import { cn } from "@/shared/application/lib/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/presentation/components/ui/popover";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type NotificationsBellProps = {
  label: string;
  className?: string;
};

function resolveActionHref(actionUrl: string): { internal: boolean; href: string } {
  try {
    const url = new URL(actionUrl, window.location.origin);
    const internal = url.origin === window.location.origin;
    return { internal, href: internal ? `${url.pathname}${url.search}${url.hash}` : actionUrl };
  } catch {
    return { internal: actionUrl.startsWith("/"), href: actionUrl };
  }
}

function NotificationItem({
  notification,
  locale,
  onOpen,
}: {
  notification: InAppNotification;
  locale: string;
  onOpen: (notification: InAppNotification) => void;
}) {
  const t = useTranslations("common.notifications");
  const timeLabel = formatNotificationRelativeTime(notification.createdAtUtc, locale);

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        "w-full rounded-xl border px-3 py-3 text-start transition-colors",
        notification.isRead
          ? "border-slate-100 bg-white hover:bg-slate-50"
          : "border-[#dbeafe] bg-[#f8fbff] hover:bg-[#eff6ff]",
      )}
    >
      <div className="flex items-start gap-2">
        {!notification.isRead ? (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#2563eb]" aria-hidden />
        ) : (
          <span className="mt-1.5 size-2 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
            {timeLabel ? (
              <span className="shrink-0 text-[11px] text-slate-400">{timeLabel}</span>
            ) : null}
          </div>
          {notification.body ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {notification.body}
            </p>
          ) : null}
          {notification.actionUrl ? (
            <span className="mt-2 inline-flex text-xs font-semibold text-[#2563eb]">
              {notification.actionButtonText ?? t("openAction")}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({ label, className }) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common.notifications");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<InAppNotification | null>(null);
  const unreadCount = useInAppNotificationsUnreadCount();
  const inboxQuery = useInAppNotificationsInbox(open);
  const markReadMutation = useMarkInAppNotificationRead();

  const selectedTimeLabel = selected
    ? formatNotificationRelativeTime(selected.createdAtUtc, locale)
    : null;

  const handleOpenNotification = (notification: InAppNotification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setOpen(false);
    setSelected(notification);
  };

  const handleCloseDetail = () => {
    setSelected(null);
  };

  const handleFollowAction = () => {
    if (!selected?.actionUrl) return;
    const { internal, href } = resolveActionHref(selected.actionUrl);
    setSelected(null);

    if (internal) {
      router.push(href);
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={label}
            title={label}
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-2xl",
              "text-slate-500",
              "transition-colors duration-200 hover:bg-slate-50 hover:text-slate-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
              className,
            )}
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unreadCount > 0 ? (
              <span
                className="absolute end-2 top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#ff4b4b] px-1 text-[10px] font-bold text-white"
                aria-label={t("unreadBadge", { count: unreadCount })}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 p-0 shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-800">{t("title")}</h2>
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-3">
            {inboxQuery.isLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="size-5 animate-spin" aria-hidden />
              </div>
            ) : inboxQuery.isError ? (
              <div className="space-y-3 py-6 text-center">
                <p className="text-sm text-slate-500">{t("error")}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inboxQuery.refetch()}
                >
                  {t("retry")}
                </Button>
              </div>
            ) : (inboxQuery.data?.length ?? 0) === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">{t("empty")}</p>
            ) : (
              <div className="space-y-2">
                {inboxQuery.data?.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    locale={locale}
                    onOpen={handleOpenNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <ModalShell
        open={Boolean(selected)}
        onOpenChange={(next) => !next && handleCloseDetail()}
        panelClassName="w-[min(95vw,28rem)]"
      >
        {selected ? (
          <div className="space-y-5 text-start">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold text-slate-400">{t("detailTitle")}</p>
                <ModalTitle className="text-xl font-bold text-[#1e3a5f]">
                  {selected.title}
                </ModalTitle>
                {selectedTimeLabel ? (
                  <p className="text-xs text-slate-400">{selectedTimeLabel}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label={t("close")}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {selected.body ? (
              <ModalDescription className="max-h-[min(40vh,16rem)] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {selected.body}
              </ModalDescription>
            ) : (
              <ModalDescription className="sr-only">{selected.title}</ModalDescription>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDetail}
                className="min-h-11 rounded-xl hover:translate-y-0"
              >
                {t("close")}
              </Button>
              {selected.actionUrl ? (
                <Button
                  type="button"
                  onClick={handleFollowAction}
                  className="min-h-11 rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]"
                >
                  {selected.actionButtonText ?? t("openAction")}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </ModalShell>
    </>
  );
};
