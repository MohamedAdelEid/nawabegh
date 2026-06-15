"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalDescription, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";

export function TeacherCourseCreateSuccessModal({
  open,
  onOpenChange,
  courseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
}) {
  const t = useTranslations("teacher.dashboard");

  return (
    <ModalShell open={open} onOpenChange={onOpenChange}>
      <div className="space-y-6 p-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <ModalTitle>{t("courses.create.success.title")}</ModalTitle>
          <ModalDescription>{t("courses.create.success.description")}</ModalDescription>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-right text-sm text-slate-600">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{t("courses.create.success.stepLabel", { current: 2, total: 3 })}</span>
            <span>{t("courses.create.success.progressHint")}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-2/3 rounded-full bg-[#C9A227]" />
          </div>
          <p className="mt-3 text-xs text-slate-500">{t("courses.create.success.note")}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          {courseId ? (
            <Button className="rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90" asChild>
              <Link href={ROUTES.USER.TEACHER.COURSES.DETAILS(courseId)}>
                {t("courses.create.success.startPaths")}
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button className="rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90">
              {t("courses.create.success.startPaths")}
            </Button>
          )}
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} asChild>
            <Link href={ROUTES.USER.TEACHER.COURSES.LIST}>
              {t("courses.create.success.continueLater")}
            </Link>
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
