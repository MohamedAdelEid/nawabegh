"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  CheckCheck,
  EyeOff,
  FileText,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useScopedInteractiveBooksTranslations } from "@/shared/application/hooks/useScopedDashboardTranslations";
import { cn } from "@/shared/application/lib/cn";
import {
  DashboardSegmentedControl,
  type DashboardSegmentOption,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";

type GradeSeg = "sec1" | "sec2" | "sec3";
type BookFilterStatus = "draft" | "published" | "hidden" | "editing";
type InteractionSeg = "none" | "hasPoints" | "moreThan10";
type UsageChoice = "mostReadWeek" | "mostUsed";

const STATUS_ICONS = {
  draft: FileText,
  published: CheckCircle2,
  hidden: EyeOff,
  editing: Pencil,
} as const;

export function InteractiveBooksFilterModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useScopedInteractiveBooksTranslations("filterModal");
  const [grade, setGrade] = useState<GradeSeg>("sec1");
  const [subjectTags, setSubjectTags] = useState<string[]>(["math", "arabic"]);
  const [schoolTags, setSchoolTags] = useState<string[]>(["schoolA", "schoolB"]);
  const [bookStatus, setBookStatus] = useState<BookFilterStatus>("published");
  const [interaction, setInteraction] = useState<InteractionSeg>("hasPoints");
  const [usage, setUsage] = useState<UsageChoice>("mostReadWeek");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!open) {
      setGrade("sec1");
      setSubjectTags(["math", "arabic"]);
      setSchoolTags(["schoolA", "schoolB"]);
      setBookStatus("published");
      setInteraction("hasPoints");
      setUsage("mostReadWeek");
      setDateFrom("");
      setDateTo("");
    }
  }, [open]);

  const gradeOptions: DashboardSegmentOption<GradeSeg>[] = [
    { id: "sec1", label: t("grades.sec1") },
    { id: "sec2", label: t("grades.sec2") },
    { id: "sec3", label: t("grades.sec3") },
  ];

  const interactionOptions: DashboardSegmentOption<InteractionSeg>[] = [
    { id: "none", label: t("interaction.none") },
    { id: "hasPoints", label: t("interaction.hasPoints") },
    { id: "moreThan10", label: t("interaction.moreThan10") },
  ];

  const removeSubject = (id: string) => {
    setSubjectTags((prev) => prev.filter((x) => x !== id));
  };

  const removeSchool = (id: string) => {
    setSchoolTags((prev) => prev.filter((x) => x !== id));
  };

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
                className="dashboard-modal-panel fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[min(96vw,40rem)] -translate-x-1/2 -translate-y-1/2 flex-col p-0"
              >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--dashboard-border-soft)] p-5 sm:p-6">
                  <div className="flex flex-1 items-center justify-end gap-2 text-right">
                    <SlidersHorizontal className="h-5 w-5 shrink-0 text-[var(--dashboard-primary)]" aria-hidden />
                    <Dialog.Title className="text-lg font-bold text-[var(--dashboard-primary)]">
                      {t("title")}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={t("close")}
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                  <div className="space-y-8 text-right">
                    <div className="grid gap-6 sm:grid-cols-2 sm:items-end">
                      <div className="space-y-3">
                        <Label className="text-slate-600">{t("subjects.label")}</Label>
                        <Input
                          readOnly
                          placeholder={t("subjects.placeholder")}
                          className="h-11 cursor-default rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                          {subjectTags.map((id) => (
                            <span key={id} className="dashboard-tag-chip">
                              {t(`subjects.tags.${id}`)}
                              <button
                                type="button"
                                className="ms-1 rounded-full p-0.5 hover:bg-black/10"
                                onClick={() => removeSubject(id)}
                                aria-label={t("subjects.removeTag")}
                              >
                                <X className="h-3 w-3" aria-hidden />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-600">{t("grade.label")}</Label>
                        <DashboardSegmentedControl
                          options={gradeOptions}
                          value={grade}
                          onChange={setGrade}
                          className="w-full justify-end"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-600">{t("school.label")}</Label>
                      <Input
                        placeholder={t("school.placeholder")}
                        className="h-11 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        {schoolTags.map((id) => (
                          <span key={id} className="dashboard-tag-chip">
                            {t(`school.tags.${id}`)}
                            <button
                              type="button"
                              className="ms-1 rounded-full p-0.5 hover:bg-black/10"
                              onClick={() => removeSchool(id)}
                              aria-label={t("school.removeTag")}
                            >
                              <X className="h-3 w-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-600">{t("bookStatus.label")}</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(Object.keys(STATUS_ICONS) as BookFilterStatus[]).map((id) => {
                          const Icon = STATUS_ICONS[id];
                          const active = bookStatus === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              data-state={active ? "active" : undefined}
                              onClick={() => setBookStatus(id)}
                              className="dashboard-choice-card"
                            >
                              <Icon
                                className={cn(
                                  "h-6 w-6",
                                  active ? "text-[var(--dashboard-success)]" : "text-slate-400",
                                )}
                                aria-hidden
                              />
                              {t(`bookStatus.options.${id}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-600">{t("interaction.label")}</Label>
                      <DashboardSegmentedControl
                        options={interactionOptions}
                        value={interaction}
                        onChange={setInteraction}
                        className="w-full flex-wrap justify-end"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-600">{t("usage.label")}</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setUsage("mostReadWeek")}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border-2 p-4 text-right transition-colors",
                            usage === "mostReadWeek"
                              ? "border-[var(--dashboard-primary)] bg-[var(--dashboard-info-soft)]"
                              : "border-[var(--dashboard-border-soft)] bg-white",
                          )}
                        >
                          <div className="flex flex-1 flex-col gap-1">
                            <span className="flex items-center justify-end gap-2 font-semibold text-slate-800">
                              {usage === "mostReadWeek" ? (
                                <span className="h-2 w-2 rounded-full bg-[var(--dashboard-primary)]" aria-hidden />
                              ) : null}
                              {t("usage.mostReadWeek")}
                            </span>
                          </div>
                          <BookOpen className="h-6 w-6 text-[var(--dashboard-primary)]" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsage("mostUsed")}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border-2 p-4 text-right transition-colors",
                            usage === "mostUsed"
                              ? "border-[var(--dashboard-primary)] bg-[var(--dashboard-info-soft)]"
                              : "border-[var(--dashboard-border-soft)] bg-white",
                          )}
                        >
                          <div className="flex flex-1 flex-col gap-1">
                            <span className="flex items-center justify-end gap-2 font-semibold text-slate-800">
                              {usage === "mostUsed" ? (
                                <span className="h-2 w-2 rounded-full bg-[var(--dashboard-primary)]" aria-hidden />
                              ) : null}
                              {t("usage.mostUsed")}
                            </span>
                          </div>
                          <TrendingUp className="h-6 w-6 text-[var(--dashboard-success)]" aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-600">{t("dateRange.label")}</Label>
                      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-2 text-right">
                          <span className="text-xs text-slate-500">{t("dateRange.from")}</span>
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="h-11 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
                          />
                        </div>
                        <ArrowLeftRight className="hidden h-5 w-5 shrink-0 text-slate-300 sm:mt-6 sm:block" aria-hidden />
                        <div className="flex flex-1 flex-col gap-2 text-right">
                          <span className="text-xs text-slate-500">{t("dateRange.to")}</span>
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="h-11 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--dashboard-border-soft)] p-5 sm:flex-row-reverse sm:items-center sm:gap-4 sm:p-6">
                  <Button
                    type="button"
                    className="dashboard-raised-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--dashboard-primary)] py-6 text-base font-semibold text-white sm:flex-[1.4]"
                    style={{ boxShadow: "var(--dashboard-shadow-button)" }}
                    onClick={() => onOpenChange(false)}
                  >
                    <CheckCheck className="h-5 w-5" aria-hidden />
                    {t("actions.apply")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[var(--dashboard-border-strong)] py-6 text-base font-semibold"
                    onClick={() => onOpenChange(false)}
                  >
                    <RotateCcw className="h-5 w-5" aria-hidden />
                    {t("actions.clear")}
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
