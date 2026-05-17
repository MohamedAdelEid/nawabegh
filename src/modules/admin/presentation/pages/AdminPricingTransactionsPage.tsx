"use client";

import { useEffect, useMemo, useState } from "react";
import { EllipsisVertical, Eye, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTransactionsData, type TransactionRow } from "@/modules/admin/domain/data/pricingBillingData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardBadge, DashboardPageHeader, DashboardPagination, DashboardTableCard } from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";

export function AdminPricingTransactionsPage() {
  const t = useTranslations("admin.dashboard");
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [selected, setSelected] = useState<TransactionRow | null>(null);

  useEffect(() => {
    void getTransactionsData().then(setRows);
  }, []);

  const counts = useMemo(() => ({ total: 1324, success: 1280, failed: 14, pending: 45 }), []);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("pricingManagement.transactions.title")}
        description={t("pricingManagement.transactions.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("sidebar.nav.pricingManagement"), href: ROUTES.ADMIN.PRICING_MANAGEMENT.LIST },
          { label: t("pricingManagement.transactions.title") },
        ]}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MiniCard title={t("pricingManagement.transactions.cards.total")} value="124,500 ر.س" />
        <MiniCard title={t("pricingManagement.transactions.cards.success")} value={String(counts.success)} />
        <MiniCard title={t("pricingManagement.transactions.cards.failed")} value={String(counts.failed)} />
        <MiniCard title={t("pricingManagement.transactions.cards.pending")} value={String(counts.pending)} />
      </section>

      <DashboardTableCard
        title={t("pricingManagement.transactions.table.title")}
        footer={
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{t("pricingManagement.transactions.table.summary")}</p>
            <DashboardPagination pages={[1, 2, 3]} currentPage={1} previousLabel="‹" nextLabel="›" onPageChange={() => {}} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-400">
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.bankRef")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.user")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.student")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.type")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.amount")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.status")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.date")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.transactions.table.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-sm">
                  <td className="px-6 py-5 text-slate-400">{row.bankRef}</td>
                  <td className="px-6 py-5 font-semibold text-[#1E3A66]">{row.userName}</td>
                  <td className="px-6 py-5">{row.studentName}</td>
                  <td className="px-6 py-5">{row.typeLabel}</td>
                  <td className="px-6 py-5 font-bold text-[#1E3A66]">{row.amount}</td>
                  <td className="px-6 py-5">
                    <DashboardBadge tone={badgeTone(row.statusId)} withDot>
                      {t(`pricingManagement.transactions.status.${row.statusId}`)}
                    </DashboardBadge>
                  </td>
                  <td className="px-6 py-5 text-slate-500">{row.date}</td>
                  <td className="px-6 py-5">
                    <button type="button" className="dashboard-icon-btn" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardTableCard>

      {selected ? <TransactionDetailsPanel row={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function badgeTone(statusId: TransactionRow["statusId"]) {
  if (statusId === "success") return "success";
  if (statusId === "failed") return "danger";
  if (statusId === "pending") return "warning";
  return "info";
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-[1.5rem]"><CardContent className="space-y-2 p-5 text-right"><p className="text-sm text-slate-500">{title}</p><p className="text-4xl font-extrabold text-[#1E3A66]">{value}</p></CardContent></Card>
  );
}

function TransactionDetailsPanel({ row, onClose }: { row: TransactionRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40">
      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
          <div className="text-right"><p className="text-lg font-bold text-[#1E3A66]">تفاصيل المعاملة</p><p className="text-xs text-slate-400">{row.bankRef}</p></div>
        </div>
        <div className="space-y-4 p-4 text-right">
          <Card><CardContent className="space-y-2 p-4"><p className="text-sm text-slate-500">المبلغ</p><p className="text-5xl font-extrabold text-[#1E3A66]">{row.amount}</p></CardContent></Card>
          <Card><CardContent className="space-y-2 p-4"><p className="text-sm text-slate-500">ولي الأمر</p><p className="font-bold">{row.userName}</p><p className="text-sm text-slate-500">الطالب: {row.studentName}</p></CardContent></Card>
          <Card><CardContent className="space-y-2 p-4"><p className="text-sm text-slate-500">طريقة الدفع</p><p className="font-bold">{row.typeLabel}</p><p className="text-sm text-slate-500">التاريخ: {row.date}</p></CardContent></Card>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1">تواصل مع ولي الأمر</Button>
            <Button type="button" className="flex-1 bg-red-50 text-red-600 hover:bg-red-100">رد المبلغ</Button>
          </div>
          <div className="rounded-xl border p-3 text-xs text-slate-500"><p className="font-semibold text-slate-700">اكتمال المعاملة بنجاح</p><p>12 Oct, 16:35:45</p></div>
        </div>
      </div>
    </div>
  );
}
