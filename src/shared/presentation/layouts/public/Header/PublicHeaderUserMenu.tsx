"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { useDropdown } from "../../dashboard/Header/hooks/useDropdown";
import { dropdownVariants } from "../../dashboard/Header/constants/animations";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const isAdminRole = (role: string) => role === "Admin";

type PublicHeaderUserMenuProps = {
  /** لإغلاق قائمة الموبايل عند اختيار رابط */
  onNavigate?: () => void;
  className?: string;
};

export function PublicHeaderUserMenu({ onNavigate, className }: PublicHeaderUserMenuProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { isOpen, toggle, close, dropdownRef } = useDropdown();
  const [loginHovered, setLoginHovered] = useState(false);

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
  };

  if (isLoading) {
    return (
      <div
        className={cn("h-10 w-24 shrink-0 animate-pulse rounded-[10px] bg-white/15 sm:w-28", className)}
        aria-hidden
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href={ROUTES.AUTH.LOGIN}
        onClick={onNavigate}
        onMouseEnter={() => setLoginHovered(true)}
        onMouseLeave={() => setLoginHovered(false)}
        className={cn(
          "relative flex cursor-pointer items-center overflow-hidden rounded-[10px] border border-white px-4 py-2.5 text-sm font-medium transition-colors duration-300 md:px-5",
          loginHovered ? "text-[#002D27]" : "text-white",
          className
        )}
      >
        <motion.span
          className="pointer-events-none absolute inset-0 origin-left bg-white"
          animate={{ scaleX: loginHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <span className="relative z-10 flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">تسجيل الدخول</span>
        </span>
      </Link>
    );
  }

  const dashboardHref = isAdminRole(user.role) ? ROUTES.ADMIN.HOME : ROUTES.USER.HOME;

  return (
    <div className={cn("relative shrink-0", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggle}
        className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-opacity hover:opacity-90"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="قائمة الحساب"
      >
        <div className="relative h-10 w-10 sm:h-11 sm:w-11">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={44}
              height={44}
              unoptimized
              className="h-full w-full rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
              <span className="text-sm font-semibold text-white">{getInitials(user.name)}</span>
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#002d27] bg-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 z-[60] mt-2 w-52 rounded-lg border border-white/10 bg-white py-1 shadow-lg"
            role="menu"
          >
            <Link
              href={dashboardHref}
              className="block px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
              role="menuitem"
              onClick={() => {
                close();
                onNavigate?.();
              }}
            >
              لوحة التحكم
            </Link>
            {isAdminRole(user.role) && (
              <>
                {/* <Link
                  href={ROUTES.ADMIN.PROFILE}
                  className="block px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => {
                    close();
                    onNavigate?.();
                  }}
                >
                  الملف الشخصي
                </Link> */}
                <Link
                  href={ROUTES.ADMIN.SETTINGS}
                  className="block px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => {
                    close();
                    onNavigate?.();
                  }}
                >
                  الإعدادات
                </Link>
              </>
            )}
            <hr className="my-1 border-gray-200" />
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              تسجيل الخروج
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
