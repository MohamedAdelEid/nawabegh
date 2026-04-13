"use client";

import type React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { useDropdown } from "../hooks";
import { dropdownVariants } from "../constants/animations";
import { ROUTES } from "@/shared/infrastructure/config/routes";

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
  return role === "Admin"
    ? t("header.user.roles.admin")
    : t("header.user.roles.student");
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  translationNamespace,
}) => {
  const { user } = useAuth();
  const t = useTranslations(translationNamespace);
  const { isOpen, toggle, dropdownRef } = useDropdown();
  const displayName = user?.name || t("header.user.guestName");
  const displayRole = roleLabel(user?.role, t);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 sm:px-3.5",
          "transition-colors duration-200 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/25"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
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
