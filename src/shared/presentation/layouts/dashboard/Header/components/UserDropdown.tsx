"use client";

import type React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { useDropdown } from "../hooks";
import { getSettingsPathForRole } from "@/modules/auth/infrastructure/authSession";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserDropdownProps {
  translationNamespace: string;
}

function roleLabel(role: string | undefined, t: ReturnType<typeof useTranslations>) {
  if (role === "Admin") return t("header.user.roles.admin");
  if (role === "Teacher") return t("header.user.roles.teacher");
  if (role === "Parent") return t("header.user.roles.parent");
  return t("header.user.roles.student");
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  translationNamespace,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations(translationNamespace);
  const { dropdownRef } = useDropdown();
  const displayName = user?.name || t("header.user.guestName");
  const displayRole = roleLabel(user?.role, t);
  const settingsHref = getSettingsPathForRole(user?.role);

  const handleNavigateToAccount = () => {
    if (settingsHref) {
      router.push(settingsHref);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleNavigateToAccount}
        className={cn(
          "flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 sm:px-3.5",
          "cursor-pointer transition-colors duration-200 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/25"
        )}
        aria-label={t("header.user.menuLabel")}
      >
        <div className="relative h-11 w-11 shrink-0">
          {user?.avatar ? (
            <Image
              src={user.avatar}
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
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
          </div>
        </div>
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-sm font-semibold text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-500">{displayRole}</p>
        </div>
      </button>
    </div>
  );
};
