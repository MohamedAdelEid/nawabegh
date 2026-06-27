"use client";

import type React from "react";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/application/lib/cn";
import { LOCALE_STORAGE_KEY, type AppLocale } from "@/config/locale";
import { textVariants, SIDEBAR_DURATION, SIDEBAR_EASE } from "../constants/animations";

const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

const NEXT_LABEL: Record<AppLocale, string> = {
  ar: "English",
  en: "العربية",
};

interface SidebarLanguageToggleProps {
  isCollapsed: boolean;
}

export const SidebarLanguageToggle: React.FC<SidebarLanguageToggleProps> = ({
  isCollapsed,
}) => {
  const locale = useLocale();
  const router = useRouter();

  const switchLanguage = useCallback(() => {
    const next: AppLocale = locale === "ar" ? "en" : "ar";
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
    }
    document.cookie = `${NEXT_LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }, [locale, router]);

  const label = NEXT_LABEL[(locale as AppLocale)] ?? NEXT_LABEL.ar;

  return (
    <motion.button
      layout
      type="button"
      onClick={switchLanguage}
      transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        "text-sidebar-foreground hover:bg-white/10 hover:text-white",
        isCollapsed && "justify-center w-fit"
      )}
      aria-label={label}
      title={isCollapsed ? label : undefined}
    >
      <Languages className="w-5 h-5 shrink-0 transition-colors" aria-hidden />
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            key="lang-label"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-md font-medium whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
