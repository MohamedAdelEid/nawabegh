"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import {
  HOME_NAV_ENTRANCE_VISIBLE,
  getHomeNavEntranceInitial,
  type HomeNavEntranceDirection,
} from "@/modules/admin/domain/utils/homeNavEntrance";

type HomeNavIcon = ComponentType<SVGProps<SVGSVGElement> & { fillColor?: string }>;

const accentThemes = [
  {
    surface: "from-[#2C4260]/8 to-[#C8AC59]/10 border-[#2C4260]/12",
    hoverSurface: "group-hover:from-[#2C4260]/18 group-hover:to-[#C8AC59]/22 group-hover:border-[#2C4260]/35",
    glow: "bg-[#2C4260]/25 group-hover:bg-[#C8AC59]/35",
    sweep: "from-[#2C4260]/0 via-[#C8AC59]/30 to-[#2C4260]/0",
    icon: "bg-[#2C4260]/10 text-[#2C4260] group-hover:bg-[#2C4260] group-hover:text-white",
    title: "group-hover:text-[#2C4260]",
    badge: "group-hover:bg-[#2C4260]/10 group-hover:text-[#2C4260]",
    arrow: "group-hover:bg-[#2C4260] group-hover:text-white group-hover:shadow-[#2C4260]/30",
    shadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(44,66,96,0.28)]",
  },
  {
    surface: "from-[#C8AC59]/12 to-[#F8EFD5]/40 border-[#C8AC59]/20",
    hoverSurface: "group-hover:from-[#C8AC59]/28 group-hover:to-[#F8EFD5]/70 group-hover:border-[#C8AC59]/50",
    glow: "bg-[#C8AC59]/20 group-hover:bg-[#E8C96A]/45",
    sweep: "from-[#C8AC59]/0 via-[#F8EFD5]/70 to-[#C8AC59]/0",
    icon: "bg-[#C8AC59]/15 text-[#8F6C0B] group-hover:bg-[#C8AC59] group-hover:text-[#2C4260]",
    title: "group-hover:text-[#6B4F08]",
    badge: "group-hover:bg-[#C8AC59]/20 group-hover:text-[#6B4F08]",
    arrow: "group-hover:bg-[#C8AC59] group-hover:text-[#2C4260] group-hover:shadow-[#C8AC59]/35",
    shadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(200,172,89,0.35)]",
  },
  {
    surface: "from-sky-50 to-blue-50/60 border-sky-100",
    hoverSurface: "group-hover:from-sky-100 group-hover:to-blue-100 group-hover:border-sky-300",
    glow: "bg-sky-200/30 group-hover:bg-sky-300/50",
    sweep: "from-sky-200/0 via-sky-300/45 to-sky-200/0",
    icon: "bg-sky-100 text-sky-700 group-hover:bg-sky-500 group-hover:text-white",
    title: "group-hover:text-sky-800",
    badge: "group-hover:bg-sky-100 group-hover:text-sky-700",
    arrow: "group-hover:bg-sky-500 group-hover:text-white group-hover:shadow-sky-400/35",
    shadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(14,165,233,0.28)]",
  },
  {
    surface: "from-emerald-50 to-teal-50/50 border-emerald-100",
    hoverSurface: "group-hover:from-emerald-100 group-hover:to-teal-100 group-hover:border-emerald-300",
    glow: "bg-emerald-200/30 group-hover:bg-emerald-300/50",
    sweep: "from-emerald-200/0 via-emerald-300/45 to-emerald-200/0",
    icon: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white",
    title: "group-hover:text-emerald-800",
    badge: "group-hover:bg-emerald-100 group-hover:text-emerald-700",
    arrow: "group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-400/35",
    shadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.28)]",
  },
  {
    surface: "from-violet-50 to-purple-50/50 border-violet-100",
    hoverSurface: "group-hover:from-violet-100 group-hover:to-purple-100 group-hover:border-violet-300",
    glow: "bg-violet-200/30 group-hover:bg-violet-300/50",
    sweep: "from-violet-200/0 via-violet-300/45 to-violet-200/0",
    icon: "bg-violet-100 text-violet-700 group-hover:bg-violet-500 group-hover:text-white",
    title: "group-hover:text-violet-800",
    badge: "group-hover:bg-violet-100 group-hover:text-violet-700",
    arrow: "group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-violet-400/35",
    shadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(139,92,246,0.28)]",
  },
  {
    surface: "from-amber-50 to-orange-50/40 border-amber-100",
    hoverSurface: "group-hover:from-amber-100 group-hover:to-orange-100 group-hover:border-amber-300",
    glow: "bg-amber-200/30 group-hover:bg-amber-300/50",
    sweep: "from-amber-200/0 via-amber-300/45 to-amber-200/0",
    icon: "bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white",
    title: "group-hover:text-amber-800",
    badge: "group-hover:bg-amber-100 group-hover:text-amber-700",
    arrow: "group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-400/35",
    shadow: "group-hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.28)]",
  },
] as const;

function getAccentTheme(index: number) {
  return accentThemes[index % accentThemes.length] ?? accentThemes[0];
}

interface HomeNavCardProps {
  title: string;
  description: string;
  href: string;
  icon?: HomeNavIcon;
  accentIndex?: number;
  animationDelay?: number;
  entranceDirection?: HomeNavEntranceDirection;
  openLabel: string;
  onNavigate: (href: string) => void;
}

export function HomeNavCard({
  title,
  description,
  href,
  icon: Icon,
  accentIndex = 0,
  animationDelay = 0,
  entranceDirection = "top",
  openLabel,
  onNavigate,
}: HomeNavCardProps) {
  const reduceMotion = useReducedMotion();
  const theme = getAccentTheme(accentIndex);
  const [isHovered, setIsHovered] = useState(false);
  const [sweepCycle, setSweepCycle] = useState(0);

  const handleHoverStart = () => {
    setIsHovered(true);
    if (!reduceMotion) {
      setSweepCycle((cycle) => cycle + 1);
    }
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
  };

  return (
    <motion.button
      type="button"
      onClick={() => onNavigate(href)}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className={cn(
        "group relative flex h-[16rem] w-full flex-col justify-between overflow-hidden rounded-[1.5rem] border bg-gradient-to-br p-5 text-right shadow-sm transition-[box-shadow,border-color,background] duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8AC59]/50 focus-visible:ring-offset-2",
        theme.surface,
        theme.hoverSurface,
        theme.shadow,
      )}
      initial={reduceMotion ? false : getHomeNavEntranceInitial(entranceDirection, false)}
      animate={reduceMotion ? undefined : HOME_NAV_ENTRANCE_VISIBLE}
      transition={{
        duration: reduceMotion ? 0.18 : 0.62,
        ease: [0.22, 1, 0.36, 1],
        delay: reduceMotion ? 0 : animationDelay,
      }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500 ease-out scale-100 opacity-50 group-hover:scale-[1.4] group-hover:opacity-95",
          theme.glow,
        )}
        aria-hidden
      />

      <div
        className={cn(
          "pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full blur-3xl transition-all duration-500 ease-out scale-100 opacity-30 group-hover:scale-[1.3] group-hover:opacity-80",
          theme.glow,
        )}
        aria-hidden
      />

      {!reduceMotion && isHovered ? (
        <motion.div
          key={sweepCycle}
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-r",
            theme.sweep,
          )}
          aria-hidden
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 0.75, 0] }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        />
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          {Icon ? (
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-400 ease-out group-hover:scale-110 group-hover:-rotate-3",
                theme.icon,
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0" />
          )}

          <span
            className={cn(
              "rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#2C4260]/70 opacity-0 transition-all duration-400 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1",
              theme.badge,
            )}
          >
            {openLabel}
          </span>
        </div>

        <div className="space-y-2">
          <h3
            className={cn(
              "text-lg font-bold leading-snug text-[#1E3A66] transition-colors duration-400",
              theme.title,
            )}
          >
            {title}
          </h3>
          <p className="line-clamp-4 text-sm leading-6 text-slate-600 transition-colors duration-400 group-hover:text-slate-700">
            {description}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-end">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#2C4260] shadow-sm transition-all duration-400 group-hover:-translate-x-1",
            theme.arrow,
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </motion.button>
  );
}
