"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import type { Transition } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/application/lib/cn";
import { PublicHeaderUserMenu } from "./PublicHeaderUserMenu";

const NAV_ITEMS = [
  { label: "الرئيسية", href: "/" },
  { label: "المكتبة", href: "/library" },
  { label: "عن المنصة", href: "/about-platform" },
  { label: "المؤلف", href: "/author" },
] as const;

function isNotFixedHeader(pathname: string): boolean {
  return /^\/user\/books\/[^/]+\/read(\/.*)?$/.test(pathname);
}


function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname === "/landing";
  }
  if (href === "/library") {
    return pathname === "/library" || pathname.startsWith("/library/");
  }
  if (href === "/about-platform") {
    return pathname === "/about-platform" || pathname.startsWith("/about-platform/");
  }
  if (href === "/author") {
    return pathname === "/author" || pathname.startsWith("/author/");
  }
  return pathname === href;
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const SPRING: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
};

interface MenuIconProps {
  isOpen: boolean;
  onClick: () => void;
}

function MenuIcon({ isOpen, onClick }: MenuIconProps) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(isOpen ? "animate" : "normal");
  }, [isOpen, controls]);

  const handleMouseEnter = useCallback(() => {
    if (!isOpen) controls.start("animate");
  }, [controls, isOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!isOpen) controls.start("normal");
  }, [controls, isOpen]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="القائمة"
      className="flex h-[38px] w-9 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 md:hidden"
    >
      <svg
        fill="none"
        height={18}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={18}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.rect
          animate={controls}
          height="6"
          rx="2"
          transition={SPRING}
          variants={{ normal: { scaleY: 1 }, animate: { scaleY: 0.75 } }}
          width="10"
          x="7"
          y="9"
        />
        <motion.path
          animate={controls}
          d="M22 20H2"
          transition={SPRING}
          variants={{
            normal: { translateY: 0, scaleX: 1 },
            animate: { translateY: -2.5, scaleX: 0.88 },
          }}
        />
        <motion.path
          animate={controls}
          d="M22 4H2"
          transition={SPRING}
          variants={{
            normal: { translateY: 0, scaleX: 1 },
            animate: { translateY: 2.5, scaleX: 0.88 },
          }}
        />
      </svg>
    </button>
  );
}

function NavLink({
  href,
  label,
  isActive,
  id,
}: {
  href: string;
  label: string;
  isActive: boolean;
  id?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const lit = isActive || hovered;

  return (
    <Link
      id={id}
      href={href}
      className={`relative py-1 text-sm font-medium transition-colors duration-300 ${
        lit ? "text-public-accent" : "text-white/80"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-right rounded-full bg-public-accent"
        animate={{ scaleX: lit ? 1 : 0 }}
        transition={{ duration: 0.28, ease: EASE_OUT }}
      />
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lit = isActive || hovered;

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex w-full items-center justify-end rounded-xl px-5 py-3.5 text-base font-medium transition-all duration-200 ${
        lit
          ? "bg-[rgba(199,161,122,0.10)] text-public-accent"
          : "text-white/85"
      }`}
    >
      <span className="relative">
        {label}
        <motion.span
          className="absolute bottom-0 left-0 right-0 h-[1.5px] origin-right rounded-full bg-public-accent"
          animate={{ scaleX: lit ? 1 : 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
        />
      </span>
    </Link>
  );
}

export function PublicHeader({
  transparentOnTop = false,
}: {
  transparentOnTop?: boolean;
}) {
  const pathname = usePathname();
  const headerScrollsWithPage = isNotFixedHeader(pathname);
  const [scrolled, setScrolled] = useState(() => !transparentOnTop);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nextScrolled = transparentOnTop ? window.scrollY > 20 : true;
      setScrolled(nextScrolled);
      setMenuOpen((prev) => (prev ? false : prev));
    };

    // تعيين حالة التمرير في الإطار التالي حتى لا يُغلق المينو عند فتحه (الـ effect كان يعيد التشغيل ويستدعي onScroll)
    const raf = requestAnimationFrame(() => {
      setScrolled(transparentOnTop ? (typeof window !== "undefined" ? window.scrollY > 20 : false) : true);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [transparentOnTop]);

  useEffect(() => {
    // close menu on route change
    const rafId = requestAnimationFrame(() => {
      setMenuOpen(false);
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className={cn(
          "z-50 h-[90px] w-full transition-all duration-500",
          headerScrollsWithPage ? "relative" : "fixed inset-x-0 top-0",
          scrolled || menuOpen
            ? "bg-[#002d27]/95 shadow-[0_4px_40px_rgba(0,0,0,0.28)] backdrop-blur-lg"
            : "bg-transparent"
        )}
      >
        <div className="container flex h-full items-center justify-between">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <div className="relative h-16 w-16 ">
              <Image
                src="/assets/images/logos/main_logo.png"
                alt="شعار منصة ابن القيم"
                fill
                className="object-contain"
                sizes="190px"
                priority
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                href={item.href}
                label={item.label}
                isActive={isNavItemActive(pathname, item.href)}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <PublicHeaderUserMenu />

            <MenuIcon isOpen={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "fixed z-60 bg-black/45 md:hidden",
                headerScrollsWithPage ? "inset-0" : "inset-x-0 bottom-0 top-[90px]"
              )}
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
              className={cn(
                "fixed z-70 flex flex-col overflow-hidden border-white/10 bg-[#002d27]/97 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[20px] md:hidden",
                headerScrollsWithPage
                  ? "inset-0 max-h-dvh min-h-0 pt-[env(safe-area-inset-top)]"
                  : "inset-x-0 bottom-0 top-[90px] min-h-0 border-b border-white/10"
              )}
              dir="rtl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-sm font-semibold text-white">القائمة</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.3,
                      ease: EASE_OUT,
                    }}
                  >
                    <MobileNavLink
                      href={item.href}
                      label={item.label}
                      isActive={isNavItemActive(pathname, item.href)}
                      onClick={() => setMenuOpen(false)}
                    />
                    {i < NAV_ITEMS.length - 1 && <div className="mx-4 h-px bg-white/8" />}
                  </motion.div>
                ))}
              </nav>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                type="button"
                onClick={() => setMenuOpen(false)}
                className="mb-[max(1.25rem,env(safe-area-inset-bottom))] flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-xs text-white/40 transition-colors hover:text-white/70"
              >
                <X className="h-3.5 w-3.5" />
                <span>إغلاق</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
