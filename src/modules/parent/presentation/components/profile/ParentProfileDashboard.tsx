"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCopy,
  LockKeyhole,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Phone,
  PlusCircle,
  UserRound,
  Users,
} from "lucide-react";
import type {
  ParentProfileChild,
  ParentProfileNotification,
} from "@/modules/parent/domain/types/parentProfile.types";
import { useParentProfile } from "@/modules/parent/application/hooks/useParentProfile";
import { ParentProfileDialogs } from "@/modules/parent/presentation/components/profile/ParentProfileDialogs";
import { ParentProfileSkeleton } from "@/modules/parent/presentation/components/profile/ParentProfileSkeleton";
import { notify } from "@/shared/application/lib/toast";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function ProfileImage({
  url,
  name,
  className,
}: {
  url: string | null;
  name: string;
  className?: string;
}) {
  const resolvedUrl = resolveFileUrl(url);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50",
        className,
      )}
    >
      {resolvedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <UserRound className="h-9 w-9 text-slate-300" aria-hidden />
      )}
    </div>
  );
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
  const normalized = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 112 112" className="-rotate-90" aria-hidden>
          <circle
            cx="56"
            cy="56"
            r="45"
            fill="none"
            stroke="#EEF2F6"
            strokeWidth="7"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            pathLength="100"
            initial={{ strokeDasharray: "0 100" }}
            animate={{ strokeDasharray: `${normalized} 100` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-700">
          {Math.round(normalized)}%
        </span>
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function ChildCard({
  child,
  onComingSoon,
  viewDetailsLabel,
  progressLabel,
}: {
  child: ParentProfileChild;
  onComingSoon: () => void;
  viewDetailsLabel: string;
  progressLabel: string;
}) {
  const progress = Math.min(100, Math.max(0, child.progressPercent));
  return (
    <motion.article
      variants={cardMotion}
      className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]"
    >
      <div className="flex items-start gap-4">
        <ProfileImage
          url={child.profileImageUrl}
          name={child.fullName}
          className="h-16 w-16"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="truncate font-bold text-slate-800">
                {child.fullName}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {[child.gradeNameAr, child.educationLevelNameAr]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold",
                child.isActive
                  ? "bg-lime-100 text-lime-700"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {child.statusLabelAr}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>{progressLabel}</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-[#2C4260]"
          />
        </div>
      </div>
      <button
        type="button"
        aria-disabled="true"
        onClick={onComingSoon}
        className="mt-5 text-sm font-semibold text-[#2C4260] transition hover:text-[#C7AF6E]"
      >
        {viewDetailsLabel} ←
      </button>
    </motion.article>
  );
}

function NotificationRow({
  notification,
  locale,
}: {
  notification: ParentProfileNotification;
  locale: string;
}) {
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(notification.createdAtUtc));

  return (
    <li className="relative ps-6">
      <span
        className={cn(
          "absolute start-0 top-1.5 h-2 w-2 rounded-full",
          notification.isRead ? "bg-slate-300" : "bg-rose-400",
        )}
      />
      <p className="text-sm font-semibold leading-6 text-slate-700">
        {notification.title}
      </p>
      {notification.body ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
          {notification.body}
        </p>
      ) : null}
      <time className="mt-1 block text-[11px] text-slate-400">{date}</time>
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
      <Card className="rounded-[2rem] border-rose-100 bg-white">
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
  const comingSoon = () => notify.success(t("messages.comingSoon"));
  const summaryCards = [
    {
      label: t("labels.childrenCount"),
      value: data.summary.childrenCount,
      icon: Users,
      color: "border-e-[#2C4260]",
      iconColor: "bg-blue-50 text-[#2C4260]",
    },
    {
      label: t("labels.tracksCount"),
      value: data.summary.preferredTracksCount,
      icon: BookOpen,
      color: "border-e-lime-400",
      iconColor: "bg-lime-50 text-lime-500",
    },
    {
      label: t("labels.totalPoints"),
      value: data.summary.totalPoints,
      icon: Medal,
      color: "border-e-[#C7AF6E]",
      iconColor: "bg-amber-50 text-[#C7AF6E]",
    },
    {
      label: t("labels.sessionsCount"),
      value: data.summary.upcomingSessionsCount,
      icon: CalendarDays,
      color: "border-e-rose-400",
      iconColor: "bg-rose-50 text-rose-400",
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.07 }}
        className="space-y-6"
      >
        <motion.header variants={cardMotion}>
          <p className="text-sm text-slate-500">{t("breadcrumb")}</p>
          <h1 className="mt-1 text-3xl font-bold text-[#2C4260]">{t("title")}</h1>
        </motion.header>

        <motion.section
          variants={cardMotion}
          className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[var(--dashboard-shadow-soft)]"
        >
          <div className="h-14 bg-gradient-to-l from-[#2C4260] via-[#3D5878] to-[#C7AF6E]/70" />
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto]">
            <ProfileImage
              url={data.profileImageUrl}
              name={data.fullName}
              className="-mt-16 h-28 w-28 border-4 border-white shadow-lg"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  {data.fullName}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                    data.isActive
                      ? "bg-lime-100 text-lime-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t(data.isActive ? "status.active" : "status.inactive")}
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(data.userId);
                  notify.success(t("messages.copied"));
                }}
                className="mt-2 inline-flex max-w-full items-center gap-2 text-xs text-slate-400 transition hover:text-[#2C4260]"
                title={data.userId}
              >
                <ClipboardCopy className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {t("labels.userId")}: {data.userId}
                </span>
              </button>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#C7AF6E]" /> {phone}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C7AF6E]" /> {data.email}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#C7AF6E]" />
                  {data.address || data.countryNameAr}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#C7AF6E]" />
                  {t("labels.memberSince", { date: memberSince })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setEditOpen(true)} className="gap-2">
                <Pencil className="h-4 w-4" />
                {t("actions.edit")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPasswordOpen(true)}
                className="gap-2"
              >
                <LockKeyhole className="h-4 w-4" />
                {t("actions.changePassword")}
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={cardMotion}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {summaryCards.map(({ label, value, icon: Icon, color, iconColor }) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between rounded-[1.75rem] border border-white border-e-4 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]",
                color,
              )}
            >
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {new Intl.NumberFormat(locale).format(value)}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  iconColor,
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
            </div>
          ))}
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <motion.section variants={cardMotion}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <Users className="h-5 w-5" /> {t("labels.children")}
                </h2>
                <button
                  type="button"
                  aria-disabled="true"
                  onClick={comingSoon}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C4260]"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t("actions.addChild")}
                </button>
              </div>
              {data.children.length ? (
                <motion.div
                  variants={{
                    visible: { transition: { staggerChildren: 0.08 } },
                  }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {data.children.map((child) => (
                    <ChildCard
                      key={child.studentProfileId}
                      child={child}
                      onComingSoon={comingSoon}
                      viewDetailsLabel={t("actions.viewDetails")}
                      progressLabel={t("labels.academicProgress")}
                    />
                  ))}
                </motion.div>
              ) : (
                <Card className="rounded-[1.75rem] border-dashed bg-white">
                  <CardContent className="p-10 text-center text-slate-500">
                    {t("labels.noChildren")}
                  </CardContent>
                </Card>
              )}
            </motion.section>

            <motion.section
              variants={cardMotion}
              className="rounded-[2rem] border border-white bg-white p-6 shadow-[var(--dashboard-shadow-soft)]"
            >
              <h2 className="mb-6 text-xl font-bold text-slate-800">
                {t("labels.performance")}
              </h2>
              <div className="grid gap-8 sm:grid-cols-3">
                <PerformanceRing
                  value={data.performance.attendancePercent}
                  label={t("labels.attendance")}
                  color="#2C4260"
                />
                <PerformanceRing
                  value={data.performance.homeworkCompletionPercent}
                  label={t("labels.homework")}
                  color="#62C923"
                />
                <PerformanceRing
                  value={data.performance.examResultsPercent}
                  label={t("labels.exams")}
                  color="#C7AF6E"
                />
              </div>
            </motion.section>
          </div>

          <motion.aside
            variants={cardMotion}
            className="h-fit rounded-[2rem] border border-white bg-white p-6 shadow-[var(--dashboard-shadow-soft)]"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <Bell className="h-5 w-5" /> {t("labels.notifications")}
            </h2>
            {data.recentNotifications.length ? (
              <ul className="space-y-6">
                {data.recentNotifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    locale={locale}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                {t("labels.noNotifications")}
              </p>
            )}
            <button
              type="button"
              aria-disabled="true"
              onClick={comingSoon}
              className="mt-7 w-full border-t border-slate-100 pt-5 text-sm font-semibold text-[#2C4260]"
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
