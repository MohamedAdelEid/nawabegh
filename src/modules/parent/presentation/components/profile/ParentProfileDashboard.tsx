"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Phone,
  Plus,
  Star,
  Users,
  Video,
} from "lucide-react";
import type {
  ParentProfileChild,
  ParentProfileNotification,
} from "@/modules/parent/domain/types/parentProfile.types";
import { useParentProfile } from "@/modules/parent/application/hooks/useParentProfile";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { ParentProgressRing } from "@/modules/parent/presentation/components/home/ParentProgressRing";
import { ParentProfileDialogs } from "@/modules/parent/presentation/components/profile/ParentProfileDialogs";
import { ParentProfileSkeleton } from "@/modules/parent/presentation/components/profile/ParentProfileSkeleton";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

const CARD_SHADOW = "shadow-[0px_8px_0px_rgba(0,0,0,0.05)]";

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function formatRelativeTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMinutes < 1) return locale.startsWith("ar") ? "الآن" : "Just now";
  if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return rtf.format(-diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return rtf.format(-diffDays, "day");

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shortUserId(userId: string): string {
  const compact = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return compact ? `#${compact}` : userId;
}

function childStatusClass(label: string, progressPercent: number): string {
  const normalized = label.trim();
  if (
    normalized.includes("ممتاز") ||
    normalized.includes("متفوق") ||
    progressPercent >= 80
  ) {
    return "bg-[#46a302] text-white";
  }
  if (normalized.includes("غير نشط") || normalized.toLowerCase().includes("inactive")) {
    return "bg-slate-400 text-white";
  }
  return "bg-[#c7af6d] text-white";
}

function PerformanceRing({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ParentProgressRing value={value} size={96} strokeWidth={8} color={color}>
        <span className="text-lg font-bold" style={{ color }}>
          {Math.round(value)}%
        </span>
      </ParentProgressRing>
      <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
        {label}
      </p>
    </div>
  );
}

function ChildCard({
  child,
  viewDetailsLabel,
  progressLabel,
}: {
  child: ParentProfileChild;
  viewDetailsLabel: string;
  progressLabel: string;
}) {
  const progress = Math.min(100, Math.max(0, child.progressPercent));
  const barColor = progress >= 80 ? "bg-[#2b415e]" : "bg-[#c7af6d]";

  return (
    <motion.article
      variants={cardMotion}
      className={cn(
        "flex flex-col gap-4 rounded-[20px] border-2 border-[#e2e8f0] bg-white p-[22px]",
        CARD_SHADOW,
      )}
    >
      <div className="flex items-center gap-4">
        <ParentAvatar
          url={child.profileImageUrl}
          name={child.fullName}
          className="size-16 border-2 border-[#dbe3f3]"
          roundedClassName="rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-[#2b415e]">
            {child.fullName}
          </h3>
          <p className="mt-0.5 text-xs text-[#64748b]">
            {[child.gradeNameAr, child.educationLevelNameAr]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold",
            childStatusClass(child.statusLabelAr, child.progressPercent),
          )}
        >
          {child.statusLabelAr}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-[#64748b]">{progressLabel}</span>
          <span className="text-[#2b415e]">{Math.round(progress)}%</span>
        </div>
        <ParentProgressBar
          value={progress}
          heightClassName="h-2"
          className="bg-[#f1f3f5]"
          barClassName={barColor}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={ROUTES.USER.PARENT.CHILD_DETAILS(child.studentUserId)}
          className="text-xs font-bold text-[#2b415e] transition hover:text-[#c7af6d]"
        >
          {viewDetailsLabel} ←
        </Link>
        <div className="flex -space-x-2 space-x-reverse">
          {progress >= 80 ? (
            <>
              <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#58cc02]">
                <Check className="size-2.5 text-white" aria-hidden />
              </span>
              <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#c7af6d]">
                <Star className="size-2.5 fill-white text-white" aria-hidden />
              </span>
            </>
          ) : (
            <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#dbe3f3]">
              <BookOpen className="size-2.5 text-[#2b415e]" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

const notificationStyles = [
  { wrap: "bg-[#dbe3f3] text-[#2b415e]", Icon: Info },
  { wrap: "bg-[#dcf4cb] text-[#46a302]", Icon: Check },
  { wrap: "bg-[#f4ecd8] text-[#c7af6d]", Icon: Star },
] as const;

function NotificationRow({
  notification,
  locale,
  index,
}: {
  notification: ParentProfileNotification;
  locale: string;
  index: number;
}) {
  const style = notificationStyles[index % notificationStyles.length] ?? notificationStyles[0];
  const Icon = style.Icon;

  return (
    <li className="relative pe-8">
      <span
        className={cn(
          "absolute end-0 top-0 flex size-6 items-center justify-center rounded-full border-2 border-white shadow-sm",
          style.wrap,
        )}
      >
        <Icon className="size-2.5" aria-hidden />
      </span>
      <p
        className={cn(
          "text-xs font-bold leading-4 text-[#2b415e]",
          !notification.isRead && "opacity-100",
        )}
      >
        {notification.title}
      </p>
      <time className="mt-1 block text-[10px] leading-[15px] text-[#64748b]">
        {formatRelativeTime(notification.createdAtUtc, locale)}
      </time>
    </li>
  );
}

export function ParentProfileDashboard() {
  const t = useTranslations("parent.dashboard.profilePage");
  const locale = useLocale();
  const {
    data,
    isLoading,
    isError,
    refetch,
    updateProfile,
    changePassword,
    isUpdating,
    isChangingPassword,
  } = useParentProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (isLoading) return <ParentProfileSkeleton />;

  if (isError || !data) {
    return (
      <Card className={cn("rounded-[20px] border-[#e2e8f0] bg-white", CARD_SHADOW)}>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          <Bell className="h-10 w-10 text-rose-300" />
          <p className="font-semibold text-slate-700">{t("messages.loadError")}</p>
          <Button variant="outline" onClick={() => void refetch()}>
            {t("actions.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const memberSince = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(data.memberSinceUtc));
  const phone = `+${data.phoneCountryCode} ${data.phoneNumber}`;
  const displayId = shortUserId(data.userId);

  const summaryCards = [
    {
      label: t("labels.childrenCount"),
      value: data.summary.childrenCount,
      icon: Users,
      accent: "border-e-[#2b415e]",
      iconWrap: "bg-[#dbe3f3] text-[#2b415e]",
    },
    {
      label: t("labels.tracksCount"),
      value: data.summary.preferredTracksCount,
      icon: BookOpen,
      accent: "border-e-[#58cc02]",
      iconWrap: "bg-[#dcf4cb] text-[#58cc02]",
    },
    {
      label: t("labels.totalPoints"),
      value: data.summary.totalPoints,
      icon: Medal,
      accent: "border-e-[#c7af6d]",
      iconWrap: "bg-[#f4ecd8] text-[#c7af6d]",
    },
    {
      label: t("labels.sessionsCount"),
      value: data.summary.upcomingSessionsCount,
      icon: Video,
      accent: "border-e-[#ff4b4b]",
      iconWrap: "bg-[#ffe3e3] text-[#ff4b4b]",
    },
  ];

  const contactRows = [
    { icon: Phone, value: phone },
    { icon: MapPin, value: data.address || data.countryNameAr },
    { icon: Mail, value: data.email },
    { icon: CalendarDays, value: t("labels.memberSince", { date: memberSince }) },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.07 }}
        className="space-y-8"
      >
        <motion.header variants={cardMotion} className="space-y-2">
          <nav className="flex items-center gap-2 text-sm text-[#64748b]">
            <Link href={ROUTES.USER.PARENT.HOME} className="hover:text-[#2b415e]">
              {t("breadcrumbHome")}
            </Link>
            <span>/</span>
            <span className="font-medium text-[#2b415e]">{t("title")}</span>
          </nav>
          <h1 className="text-[30px] font-bold leading-9 text-[#2b415e]">
            {t("title")}
          </h1>
        </motion.header>

        <motion.section
          variants={cardMotion}
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-white p-[34px]",
            CARD_SHADOW,
          )}
        >
          <div className="pointer-events-none absolute -end-32 -top-32 size-64 rounded-full bg-[rgba(43,65,94,0.05)]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative shrink-0 self-start">
                <ParentAvatar
                  url={data.profileImageUrl}
                  name={data.fullName}
                  className="size-32 border-4 border-white shadow-lg"
                  roundedClassName="rounded-[20px]"
                />
                {data.isActive ? (
                  <span className="absolute -bottom-2 -end-2 inline-flex items-center gap-1 rounded-full border-2 border-white bg-[#58cc02] px-3.5 py-1.5 text-[10px] font-bold text-white shadow-sm">
                    <CheckCircle2 className="size-2.5" aria-hidden />
                    {t("status.verified")}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-[#2b415e]">{data.fullName}</h2>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(data.userId);
                    notify.success(t("messages.copied"));
                  }}
                  className="inline-flex items-center gap-2 font-mono text-sm text-[#64748b] transition hover:text-[#2b415e]"
                  title={data.userId}
                >
                  <ClipboardCopy className="size-[15px] shrink-0" aria-hidden />
                  <span>{displayId}</span>
                </button>

                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  {contactRows.map(({ icon: Icon, value }) => (
                    <div
                      key={`${Icon.displayName ?? Icon.name}-${value}`}
                      className="flex min-h-10 items-center gap-3 text-sm font-medium text-[#0f172a]"
                    >
                      <Icon className="size-[18px] shrink-0 text-[#c7af6d]" aria-hidden />
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 lg:items-stretch">
              <Button
                onClick={() => setEditOpen(true)}
                className="h-auto gap-2 rounded-xl bg-[#2b415e] px-6 py-3 text-sm font-bold text-white shadow-[0px_4px_0px_#1e2e42] hover:bg-[#243650]"
              >
                {t("actions.edit")}
                <Pencil className="size-5" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordOpen(true)}
                className="h-auto gap-2 rounded-xl border-2 border-[#e2e8f0] bg-[#e9ecef] px-6 py-3.5 text-sm font-bold text-[#64748b] hover:bg-[#dee2e6]"
              >
                {t("actions.changePassword")}
                <LockKeyhole className="size-5" aria-hidden />
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={cardMotion}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {summaryCards.map(({ label, value, icon: Icon, accent, iconWrap }) => (
            <div
              key={label}
              className={cn(
                "flex flex-col gap-2 rounded-[20px] border-e-4 bg-white py-6 pe-7 ps-6",
                CARD_SHADOW,
                accent,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#64748b]">{label}</p>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl",
                    iconWrap,
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
              </div>
              <p className="text-[30px] font-bold leading-9 text-[#2b415e]">
                {new Intl.NumberFormat(locale, {
                  minimumIntegerDigits: value < 10 ? 2 : 1,
                }).format(value)}
              </p>
            </div>
          ))}
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <motion.section variants={cardMotion}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-bold text-[#2b415e]">
                  {t("labels.children")}
                  <Users className="size-5" aria-hidden />
                </h2>
                <Link
                  href={ROUTES.USER.PARENT.CHILDREN}
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#2b415e] transition hover:text-[#c7af6d]"
                >
                  <Plus className="size-[15px]" aria-hidden />
                  {t("actions.addChild")}
                </Link>
              </div>

              {data.children.length ? (
                <motion.div
                  variants={{
                    visible: { transition: { staggerChildren: 0.08 } },
                  }}
                  className="grid gap-6 md:grid-cols-2"
                >
                  {data.children.map((child) => (
                    <ChildCard
                      key={child.studentProfileId}
                      child={child}
                      viewDetailsLabel={t("actions.viewDetails")}
                      progressLabel={t("labels.academicProgress")}
                    />
                  ))}
                </motion.div>
              ) : (
                <Card
                  className={cn(
                    "rounded-[20px] border-dashed border-[#e2e8f0] bg-white",
                    CARD_SHADOW,
                  )}
                >
                  <CardContent className="p-10 text-center text-[#64748b]">
                    {t("labels.noChildren")}
                  </CardContent>
                </Card>
              )}
            </motion.section>

            <motion.section
              variants={cardMotion}
              className={cn(
                "rounded-[20px] border-2 border-[#e2e8f0] bg-white p-[26px]",
                CARD_SHADOW,
              )}
            >
              <h2 className="mb-8 text-end text-base font-bold text-[#2b415e]">
                {t("labels.performance")}
              </h2>
              <div className="grid gap-8 sm:grid-cols-3">
                <PerformanceRing
                  value={data.performance.attendancePercent}
                  label={t("labels.attendance")}
                  color="#2b415e"
                />
                <PerformanceRing
                  value={data.performance.homeworkCompletionPercent}
                  label={t("labels.homework")}
                  color="#58cc02"
                />
                <PerformanceRing
                  value={data.performance.examResultsPercent}
                  label={t("labels.exams")}
                  color="#c7af6d"
                />
              </div>
            </motion.section>
          </div>

          <motion.aside
            variants={cardMotion}
            className={cn(
              "flex h-fit flex-col gap-6 rounded-[20px] border-2 border-[#e2e8f0] bg-white p-[26px]",
              CARD_SHADOW,
            )}
          >
            <div className="flex items-center justify-between gap-3">
              {data.recentNotifications.some((item) => !item.isRead) ? (
                <span className="size-2 rounded-full bg-[#ff4b4b]" aria-hidden />
              ) : (
                <span />
              )}
              <h2 className="flex items-center gap-2 text-base font-bold text-[#2b415e]">
                {t("labels.notifications")}
                <Bell className="size-5" aria-hidden />
              </h2>
            </div>

            {data.recentNotifications.length ? (
              <ul className="relative space-y-6">
                <span
                  className="absolute bottom-2 end-3 top-2 w-0.5 bg-[#e2e8f0]"
                  aria-hidden
                />
                {data.recentNotifications.map((notification, index) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    locale={locale}
                    index={index}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-[#64748b]">
                {t("labels.noNotifications")}
              </p>
            )}

            <button
              type="button"
              onClick={() => notify.success(t("messages.comingSoon"))}
              className="mt-auto w-full border-t border-[#e2e8f0] pt-5 text-sm font-bold text-[#2b415e]"
            >
              {t("actions.viewAll")}
            </button>
          </motion.aside>
        </div>
      </motion.div>

      <ParentProfileDialogs
        profile={data}
        editOpen={editOpen}
        passwordOpen={passwordOpen}
        onEditOpenChange={setEditOpen}
        onPasswordOpenChange={setPasswordOpen}
        onUpdate={updateProfile}
        onChangePassword={changePassword}
        isUpdating={isUpdating}
        isChangingPassword={isChangingPassword}
      />
    </MotionConfig>
  );
}
