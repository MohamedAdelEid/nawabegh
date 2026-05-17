"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type LoginHeroPanelProps = {
  badge: string;
  title: string;
  description: string;
};

export function LoginHeroPanel({ badge, title, description }: LoginHeroPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] bg-[var(--auth-panel)] px-6 py-7 text-white shadow-[var(--auth-panel-shadow)] sm:px-8 sm:py-9"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_60%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90">
            {badge}
          </span>
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl font-bold leading-tight sm:text-[2.25rem]">
              {title}
            </h1>
            <p className="max-w-lg text-sm leading-7 text-white/80 sm:text-base">{description}</p>
          </div>
        </div>
        <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] bg-white/10 backdrop-blur sm:flex">
          <Image
            src="/images/logo.png"
            alt="Nawabegh"
            width={64}
            height={64}
            priority
            className="h-16 w-16 object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
}
