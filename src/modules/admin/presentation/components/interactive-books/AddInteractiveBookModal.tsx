"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, Link2, PlusCircle, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";

type BookStatusUi = "draft" | "published";

export function AddInteractiveBookModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("admin.dashboard.interactiveBooks.addModal");
  const [bookName, setBookName] = useState("");
  const [subjectId, setSubjectId] = useState("math");
  const [gradeId, setGradeId] = useState("grade10");
  const [courseUrl, setCourseUrl] = useState("");
  const [status, setStatus] = useState<BookStatusUi>("draft");

  useEffect(() => {
    if (!open) {
      setBookName("");
      setSubjectId("math");
      setGradeId("grade10");
      setCourseUrl("");
      setStatus("draft");
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.99 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="dashboard-modal-panel fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3 text-right">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-info-soft)] text-[var(--dashboard-primary)]">
                      <BookMarked className="h-6 w-6" aria-hidden />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-[var(--dashboard-primary)]">
                        {t("title")}
                      </Dialog.Title>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={t("close")}
                    >
                      <X className="h-6 w-6" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="ib-book-name" className="text-slate-600">
                      {t("fields.bookName.label")}
                    </Label>
                    <Input
                      id="ib-book-name"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder={t("fields.bookName.placeholder")}
                      className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label className="text-slate-600">{t("fields.pdf.label")}</Label>
                    <label className="dashboard-modal-field flex cursor-pointer flex-col items-center gap-3 border-dashed px-4 py-10 transition-colors hover:bg-slate-50/80">
                      <input type="file" accept="application/pdf" className="sr-only" />
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dashboard-info-soft)] text-[var(--dashboard-primary)]">
                        <Upload className="h-7 w-7" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-slate-700">{t("fields.pdf.hint")}</p>
                      <p className="text-xs text-slate-400">{t("fields.pdf.subhint")}</p>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="ib-subject" className="text-slate-600">
                        {t("fields.subject.label")}
                      </Label>
                      <div className="relative">
                        <select
                          id="ib-subject"
                          value={subjectId}
                          onChange={(e) => setSubjectId(e.target.value)}
                          className="h-12 w-full appearance-none rounded-xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-3 text-right text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[var(--dashboard-gold)]/30"
                        >
                          <option value="math">{t("fields.subject.options.math")}</option>
                          <option value="arabic">{t("fields.subject.options.arabic")}</option>
                          <option value="science">{t("fields.subject.options.science")}</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <Label htmlFor="ib-grade" className="text-slate-600">
                        {t("fields.grade.label")}
                      </Label>
                      <div className="relative">
                        <select
                          id="ib-grade"
                          value={gradeId}
                          onChange={(e) => setGradeId(e.target.value)}
                          className="h-12 w-full appearance-none rounded-xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-3 text-right text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[var(--dashboard-gold)]/30"
                        >
                          <option value="grade10">{t("fields.grade.options.grade10")}</option>
                          <option value="grade11">{t("fields.grade.options.grade11")}</option>
                          <option value="grade12">{t("fields.grade.options.grade12")}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="dashboard-tag-chip text-xs">{t("fields.courseLink.badge")}</span>
                      <Label htmlFor="ib-course" className="text-slate-600">
                        {t("fields.courseLink.label")}
                      </Label>
                    </div>
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      <Input
                        id="ib-course"
                        value={courseUrl}
                        onChange={(e) => setCourseUrl(e.target.value)}
                        placeholder={t("fields.courseLink.placeholder")}
                        className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] pr-10 text-right"
                      />
                    </div>
                  </div>

                  <div className="dashboard-modal-field flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-right">
                      <p className="font-semibold text-slate-800">{t("fields.status.title")}</p>
                      <p className="text-xs text-slate-500">{t("fields.status.description")}</p>
                    </div>
                    <div
                      className="inline-flex rounded-2xl border border-[var(--dashboard-border-soft)] bg-white/80 p-1 shadow-inner"
                      role="group"
                    >
                      <button
                        type="button"
                        onClick={() => setStatus("draft")}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                          status === "draft"
                            ? "bg-white text-[var(--dashboard-primary)] shadow-sm"
                            : "text-slate-500",
                        )}
                      >
                        {t("fields.status.draft")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("published")}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                          status === "published"
                            ? "bg-white text-[var(--dashboard-primary)] shadow-sm"
                            : "text-slate-500",
                        )}
                      >
                        {t("fields.status.published")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-[var(--dashboard-border-strong)]"
                    onClick={() => onOpenChange(false)}
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="dashboard-raised-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary)]"
                    style={{ boxShadow: "var(--dashboard-shadow-button)" }}
                    onClick={() => onOpenChange(false)}
                  >
                    <PlusCircle className="h-5 w-5" aria-hidden />
                    {t("actions.submit")}
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
