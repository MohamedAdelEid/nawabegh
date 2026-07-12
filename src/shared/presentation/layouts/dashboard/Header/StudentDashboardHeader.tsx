"use client";

import type React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CalendarDays, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useStudentHomeNotifications,
  useStudentHomeProfile,
} from "@/modules/student/application/hooks/useStudentHomeDashboard";
import {
  deriveStudentLevel,
  deriveStudentLevelSubtitle,
} from "@/modules/student/domain/home/student-home.utils";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { getSettingsPathForRole } from "@/modules/auth/infrastructure/authSession";
import { useAuth } from "@/shared/application/hooks/useAuth";
import {
  HeaderActionButton,
  MobileMenuButton,
  SearchInput,
} from "./components";
import { headerVariants } from "./constants/animations";

interface StudentDashboardHeaderProps {
  translationNamespace: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const StudentDashboardHeader: React.FC<StudentDashboardHeaderProps> = ({
  translationNamespace,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const router = useRouter();
  const t = useTranslations(translationNamespace);
  const tHome = useTranslations("student.dashboard.home.header");
  const { user } = useAuth();
  const profileQuery = useStudentHomeProfile();
  const notificationsQuery = useStudentHomeNotifications();
  const settingsHref = getSettingsPathForRole(user?.role);

  const profile = profileQuery.data;
  const displayName = profile?.fullName || user?.name || t("header.user.guestName");
  const avatarUrl = profile?.profileImageUrl || user?.avatar || null;
  const level = profile ? deriveStudentLevel(profile.points) : null;
  const badgeName = profile ? deriveStudentLevelSubtitle(profile) : "";
  const unreadCount =
    notificationsQuery.data?.filter((item) => !item.isRead).length ?? 0;

  const subtitle =
    level != null
      ? badgeName
        ? tHome("levelWithBadge", { level, badge: badgeName })
        : tHome("levelOnly", { level })
      : t("header.user.roles.student");

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 border-b-2 border-slate-200 bg-white/80 backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6 xl:flex-nowrap">
        <MobileMenuButton
          isOpen={isMobileMenuOpen}
          onToggle={onMobileMenuToggle || (() => {})}
          openLabel={t("header.mobileMenu.open")}
          closeLabel={t("header.mobileMenu.close")}
        />

        <div className="order-3 min-w-0 basis-full xl:order-2 xl:basis-auto xl:flex-1">
          <SearchInput
            placeholder={tHome("searchPlaceholder")}
            className="w-full xl:me-auto xl:max-w-[32rem]"
          />
        </div>

        <div className="order-2 ms-auto flex items-center gap-2 sm:gap-3 xl:order-3 xl:ms-0">
          <button
            type="button"
            onClick={() => router.push(settingsHref)}
            className={cn(
              "hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 sm:flex",
              "transition-colors hover:bg-slate-50",
            )}
            aria-label={t("header.user.menuLabel")}
          >
            <div className="text-end leading-tight">
              <p className="text-sm font-semibold text-slate-800">{displayName}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className="relative h-11 w-11 shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={44}
                  height={44}
                  unoptimized
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2C4260]">
                  <span className="text-sm font-semibold text-white">
                    {getInitials(displayName)}
                  </span>
                </div>
              )}
              <span className="absolute -bottom-1 -end-1 rounded-md bg-emerald-500 px-1 text-[9px] font-bold text-white">
                PRO
              </span>
            </div>
          </button>

          <HeaderActionButton
            icon={CalendarDays}
            label={tHome("calendar")}
            className="hidden md:inline-flex"
            onClick={() => router.push(ROUTES.USER.STUDENT.SCHEDULE)}
          />
          <HeaderActionButton icon={Mail} label={tHome("messages")} className="hidden md:inline-flex" />
          <div className="relative">
            <HeaderActionButton icon={Bell} label={t("header.actions.notifications")} />
            {unreadCount > 0 ? (
              <span className="absolute end-2 top-2 size-2 rounded-full bg-[#ff4b4b]" aria-hidden />
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
