"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  HeaderActionButton,
  MobileMenuButton,
  UserDropdown,
  SearchInput,
} from "./components";
import { headerVariants } from "./constants/animations";

interface HeaderProps {
  translationNamespace: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  translationNamespace,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const router = useRouter();
  const t = useTranslations(translationNamespace);
  const { user } = useAuth();
  const settingsHref =
    user?.role === "Admin" ? ROUTES.ADMIN.SETTINGS : ROUTES.USER.SETTINGS;

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 border-b-2 border-slate-200 bg-white/50 backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6 xl:flex-nowrap">
        <MobileMenuButton
          isOpen={isMobileMenuOpen}
          onToggle={onMobileMenuToggle || (() => { })}
          openLabel={t("header.mobileMenu.open")}
          closeLabel={t("header.mobileMenu.close")}
        />
        <div className="order-3 min-w-0 basis-full xl:order-2 xl:basis-auto xl:flex-1">
          <SearchInput
            placeholder={t("header.searchPlaceholder")}
            className="w-full xl:ml-auto xl:max-w-[32rem] focus:outline-none"
          />
        </div>
        <div className="order-2 mr-auto flex items-center gap-2 sm:gap-3 xl:order-3 xl:mr-0">
          <UserDropdown translationNamespace={translationNamespace} />
          <HeaderActionButton
            icon={Bell}
            label={t("header.actions.notifications")}
            className="hidden sm:inline-flex"
          />
          <HeaderActionButton
            icon={Settings}
            label={t("header.actions.settings")}
            onClick={() => router.push(settingsHref)}
            className="hidden sm:inline-flex"
          />
        </div>
      </div>
    </motion.header>
  );
};
