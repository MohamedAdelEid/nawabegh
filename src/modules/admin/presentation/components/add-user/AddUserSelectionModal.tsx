"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { addUserPickerCards } from "@/modules/admin/domain/data/addUserFormData";
import type { AddUserType } from "@/modules/admin/domain/types/addUser.types";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";

const cardToneClasses = {
  primary: "bg-[var(--dashboard-info-soft)] text-[var(--dashboard-primary)]",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-[var(--dashboard-warning-soft)] text-[var(--dashboard-gold-foreground)]",
} as const;

function routeForType(type: "student" | "teacher" | "parent") {
  switch (type) {
    case "student":
      return ROUTES.ADMIN.USER_MANAGEMENT.ADD.STUDENT;
    case "teacher":
      return ROUTES.ADMIN.USER_MANAGEMENT.ADD.TEACHER;
    case "parent":
      return ROUTES.ADMIN.USER_MANAGEMENT.ADD.PARENT;
  }
}

export function AddUserSelectionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AddUserType | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,58rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.16)] sm:p-8"
              >
                <div className="space-y-8">
                  <div className="flex items-start justify-between gap-4">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label={t("userManagement.addUser.modal.close")}
                      >
                        <X className="h-7 w-7" aria-hidden />
                      </button>
                    </Dialog.Close>

                    <div className="space-y-3 text-center sm:flex-1">
                      <Dialog.Title className="text-4xl font-bold text-[var(--dashboard-primary)]">
                        {t("userManagement.addUser.modal.title")}
                      </Dialog.Title>
                      <p className="text-xl text-slate-500">
                        {t("userManagement.addUser.modal.stepTitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    {addUserPickerCards.map((option) => {
                      const Icon = option.icon;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedType(option.id)}
                          className={cn(
                            "rounded-[1.75rem] border bg-[var(--dashboard-surface)] p-6 shadow-[var(--dashboard-shadow-soft)] transition-transform duration-200 hover:-translate-y-1",
                            selectedType === option.id
                              ? "border-[var(--dashboard-primary)] ring-2 ring-[var(--dashboard-gold)]/35"
                              : "border-[var(--dashboard-border-soft)]",
                          )}
                          aria-pressed={selectedType === option.id}
                        >
                          <div
                            className={cn(
                              "mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full",
                              cardToneClasses[option.accentTone],
                            )}
                          >
                            <Icon className="h-10 w-10" aria-hidden />
                          </div>
                          <h3 className="text-3xl font-bold text-[var(--dashboard-primary)]">
                            {t(option.titleKey)}
                          </h3>
                          <p className="mt-3 text-lg leading-8 text-slate-500">
                            {t(option.descriptionKey)}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      disabled={!selectedType}
                      className={cn(
                        "dashboard-raised-button h-16 min-w-[22rem] rounded-[1.25rem] text-2xl font-semibold",
                        selectedType
                          ? "bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary-pressed)]"
                          : "bg-slate-200 text-slate-500 hover:bg-slate-200",
                      )}
                      style={selectedType ? { boxShadow: "var(--dashboard-shadow-button)" } : undefined}
                      onClick={() => {
                        if (!selectedType) return;
                        onOpenChange(false);
                        router.push(routeForType(selectedType));
                      }}
                    >
                      {t("userManagement.addUser.modal.continue")}
                      <ArrowLeft className="h-8 w-8" aria-hidden />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
