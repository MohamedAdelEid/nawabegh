"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useScopedInteractiveBooksTranslations } from "@/shared/application/hooks/useScopedDashboardTranslations";
import {
  DEFAULT_HOTSPOT_SIZE,
  type HotspotPlacement,
} from "@/modules/admin/presentation/components/interactive-books/interactiveBookPdfViewer.types";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

export type AddHotspotModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement: HotspotPlacement | null;
  submitting?: boolean;
  onSubmit: (values: {
    title: string;
    videoUrl: string;
    isActive: boolean;
    visibility: number;
  }) => void;
};

export function AddHotspotModal({
  open,
  onOpenChange,
  placement,
  submitting = false,
  onSubmit,
}: AddHotspotModalProps) {
  const t = useScopedInteractiveBooksTranslations("hotspotModal");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [visibleToStudents, setVisibleToStudents] = useState(true);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setVideoUrl("");
      setIsActive(true);
      setVisibleToStudents(true);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!placement || !title.trim()) return;
    onSubmit({
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      isActive,
      visibility: visibleToStudents ? 0 : 1,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && placement ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.99 }}
                className="dashboard-modal-panel fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3 text-right">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-info-soft)] text-[var(--dashboard-primary)]">
                      <MapPin className="h-6 w-6" aria-hidden />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-[var(--dashboard-primary)]">
                        {t("title")}
                      </Dialog.Title>
                      <p className="mt-1 text-xs text-slate-500">
                        {t("positionHint", {
                          page: placement.pageNumber,
                          x: placement.xPosition,
                          y: placement.yPosition,
                          size: DEFAULT_HOTSPOT_SIZE,
                        })}
                      </p>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={t("close")}
                    >
                      <X className="h-6 w-6" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="hotspot-title">{t("fields.title.label")}</Label>
                    <Input
                      id="hotspot-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("fields.title.placeholder")}
                      className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="hotspot-video">{t("fields.videoUrl.label")}</Label>
                    <div className="relative">
                      <Video className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      <Input
                        id="hotspot-video"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder={t("fields.videoUrl.placeholder")}
                        className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] pr-10 text-right"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-sm text-slate-600">{t("fields.active.label")}</span>
                    <StatusSwitch
                      checked={isActive}
                      onChange={setIsActive}
                      activeLabel={t("fields.active.on")}
                      inactiveLabel={t("fields.active.off")}
                      activeClassName="bg-emerald-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-sm text-slate-600">{t("fields.visibility.label")}</span>
                    <StatusSwitch
                      checked={visibleToStudents}
                      onChange={setVisibleToStudents}
                      activeLabel={t("fields.visibility.visible")}
                      inactiveLabel={t("fields.visibility.hidden")}
                      activeClassName="bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-xl"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="dashboard-raised-button h-12 flex-1 rounded-xl bg-[var(--dashboard-primary)] text-white"
                    style={{ boxShadow: "var(--dashboard-shadow-button)" }}
                    disabled={submitting || !title.trim()}
                    onClick={handleSubmit}
                  >
                    {submitting ? t("actions.saving") : t("actions.save")}
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
