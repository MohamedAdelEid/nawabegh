"use client";

import { motion } from "framer-motion";

export function ProgressPathSkeleton() {
  return (
    <div className="animate-pulse space-y-0 pb-10">
      <div className="flex items-center justify-between border-b border-[rgba(44,66,96,0.1)] bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-[#e2e8f0]" />
            <div className="h-3 w-16 rounded bg-[#f1f5f9]" />
          </div>
          <div className="size-10 rounded-full bg-[#e2e8f0]" />
        </div>
        <div className="space-y-2 text-end">
          <div className="ms-auto h-8 w-56 rounded bg-[#e2e8f0]" />
          <div className="ms-auto h-4 w-40 rounded bg-[#f1f5f9]" />
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-14 flex-1 rounded-xl bg-[#e2e8f0]"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-14 w-28 shrink-0 rounded-xl bg-[#f1f5f9]"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 h-36 rounded-[25px] bg-[#e2e8f0] md:mx-6" />

      <div className="relative mx-auto mt-8 flex max-w-xl flex-col items-center gap-8 py-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="size-[135px] rounded-full bg-[#e2e8f0]"
            style={{ alignSelf: index % 2 === 0 ? "flex-end" : "flex-start", marginInline: "18%" }}
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1, 0.9] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
