"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalDescription, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
            <Button 
              className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white hover:bg-[#243751] cursor-pointer shadow-[var(--dashboard-shadow-button)]"
              onClick={() => router.push(ROUTES.USER.TEACHER.COURSES.DETAILS(courseId))}
            >
              {t("courses.create.success.startPaths")}
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white hover:bg-[#243751] cursor-pointer shadow-[var(--dashboard-shadow-button)]">
              {t("courses.create.success.startPaths")}
            </Button>
          )}
          <Button variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50 shadow-[var(--dashboard-shadow-button)]" onClick={() => 
           {
             router.push(ROUTES.USER.TEACHER.COURSES.LIST)
             router.refresh()
             onOpenChange(false)
          }
          }>
            {t("courses.create.success.continueLater")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
