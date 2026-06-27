"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader, DashboardStatCard, DashboardBadge,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ModalShell, ModalDescription, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { BookOpen, ListChecks, Shuffle, FileQuestion } from "lucide-react";

export function AdminQuestionBankManagePage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("questionBank.title"), href: ROUTES.ADMIN.QUESTION_BANK.LIST },
          { label: t("questionBankManage.title") },
        ]} />
        <DashboardPageHeader
        title={t("questionBankManage.title")}
        description={t("questionBankManage.description")}
        action={<Button onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.ADD)}>{t("questionBankManage.actions.addQuestion")}</Button>}
      />
      </div>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label={t("questionBankManage.stats.total")} value="1,284" indicator="" icon={BookOpen} iconTone="info" />
        <DashboardStatCard label={t("questionBankManage.stats.mcq")} value="842" indicator="" icon={ListChecks} iconTone="success" />
        <DashboardStatCard label={t("questionBankManage.stats.tf")} value="442" indicator="" icon={Shuffle} iconTone="warning" />
        <DashboardStatCard label={t("questionBankManage.stats.level")} value="40%" indicator="" icon={FileQuestion} iconTone="danger" />
      </section>
      <Card><CardContent className="space-y-4 p-6 text-right"><div className="flex items-center justify-between"><h3 className="text-2xl font-bold text-[#1E3A66]">{t("questionBankManage.listTitle")}</h3><Button variant="outline" onClick={() => setDeleteOpen(true)}>{t("questionBankManage.actions.deleteSample")}</Button></div><div className="rounded-xl border border-slate-100 p-4"><p className="font-semibold">ما هو ناتج حل المعادلة التربيعية 0 = 6 + 5x - x^2؟</p><DashboardBadge tone="success">صحيح</DashboardBadge></div></CardContent></Card>

      <ModalShell open={deleteOpen} onOpenChange={setDeleteOpen}>
        <div className="space-y-4 text-right">
          <ModalTitle className="text-2xl font-bold text-[#1E3A66]">
            {t("questionBankManage.deleteModal.title")}
          </ModalTitle>
          <ModalDescription className="text-sm text-slate-500">
            {t("questionBankManage.deleteModal.description")}
          </ModalDescription>
          <p className="rounded-xl border border-slate-100 p-3 text-sm">{t("questionBankManage.deleteModal.item")}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t("questionBankManage.deleteModal.cancel")}</Button>
            <Button className="bg-red-500 hover:bg-red-600" onClick={() => setDeleteOpen(false)}>{t("questionBankManage.deleteModal.confirm")}</Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
