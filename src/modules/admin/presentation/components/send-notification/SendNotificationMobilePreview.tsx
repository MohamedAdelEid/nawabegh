"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Home, MessageCircle, Search, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Mobile } from "@/modules/admin/presentation/assets/images/Mobile";
import { Mobile2 } from "@/modules/admin/presentation/assets/images/Mobile2";
import type { SendNotificationFormValues } from "@/modules/admin/domain/types/sendNotification.types";
type SendNotificationMobilePreviewProps = {
  values: SendNotificationFormValues;
  expectedViews: number;
};

export function SendNotificationMobilePreview({
  values,
  expectedViews,
}: SendNotificationMobilePreviewProps) {
  const t = useTranslations("admin.dashboard.sendNotification.preview");
  const reduceMotion = useReducedMotion();

  const previewTitle = values.title.trim() || t("sampleTitle");
  const previewBody = values.body.trim() || t("sampleBody");
  const previewAction = values.actionLabel.trim() || t("sampleAction");
  const showAction = Boolean(values.actionLabel.trim() || values.actionUrl.trim());

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        {t("liveLabel")}
      </div>

      <div className="relative mx-auto w-full max-w-[22rem]">
        <div className="relative mx-auto aspect-[396/716] w-full min-h-[700px]">
          <div className="absolute inset-[9.5%_9.6%_11.5%_9.6%] overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#A855F7]"
            style={{
              boxShadow: "0px 0px 0px 15px #1E293B"
            }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
              <Mobile className="h-5 w-28" />
            </div>

            <div className="flex h-full flex-col justify-between p-3 pt-8">
              <motion.div
                key={`banner-${previewTitle}`}
                initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur"
              >
                <div className="flex items-start gap-2 text-right">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4338CA]">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-xs font-bold text-slate-800">{previewTitle}</p>
                    <p className="text-[10px] text-slate-400">{t("sampleTime")}</p>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${previewTitle}-${previewBody}-${previewAction}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                  transition={{ duration: 0.28 }}
                  className="space-y-3 rounded-2xl bg-white p-4 shadow-xl"
                >
                  <p className="text-right text-sm font-bold text-[#1E3A66]">{t("alertTitle")}</p>
                  <p className="text-right text-xs leading-6 text-slate-600">{previewBody}</p>
                  {showAction ? (
                    <button
                      type="button"
                      className="h-10 w-full rounded-xl bg-[#1E3A66] text-xs font-bold text-white"
                    >
                      {previewAction}
                    </button>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-around rounded-2xl bg-white/90 px-2 py-2 text-slate-500">
                <UserRound className="h-4 w-4" />
                <MessageCircle className="h-4 w-4" />
                <Search className="h-4 w-4" />
                <Home className="h-4 w-4" />
              </div>
            </div>
          </div>

          <Mobile2 className="pointer-events-none absolute inset-0 h-full w-full" />
        </div>
      </div>

      <div className="grid w-full max-w-[20rem] grid-cols-2 gap-3 text-center text-xs font-semibold text-slate-600">
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
          {t("expectedViews", { count: expectedViews.toLocaleString() })}
        </div>
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
          {t("guaranteedReach")}
        </div>
      </div>
    </div>
  );
}
