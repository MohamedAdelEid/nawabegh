"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSubscriptionDetails, type SubscriptionDetails } from "@/modules/admin/domain/data/pricingBillingData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardBadge, DashboardPageHeader, DashboardTableCard } from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface AdminPricingSubscriptionDetailsPageProps {
  subscriptionId: string;
}

export function AdminPricingSubscriptionDetailsPage({
  subscriptionId,
}: AdminPricingSubscriptionDetailsPageProps) {
  const t = useTranslations("admin.dashboard");
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);

  useEffect(() => {
    void getSubscriptionDetails(subscriptionId).then(setDetails);
  }, [subscriptionId]);

  if (!details) {
    return <div className="py-16 text-center text-slate-500">{t("pricingManagement.subscriptionDetails.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("pricingManagement.subscriptionDetails.title")}
        description={t("pricingManagement.subscriptionDetails.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("sidebar.nav.pricingManagement"), href: ROUTES.ADMIN.PRICING_MANAGEMENT.LIST },
          { label: t("pricingManagement.subscriptions.page.title"), href: ROUTES.ADMIN.PRICING_MANAGEMENT.SUBSCRIPTIONS.LIST },
          { label: details.id },
        ]}
      />

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="rounded-[1.5rem] bg-[#243B5A] text-white"><CardContent className="p-5 text-right"><p className="text-sm">{t("pricingManagement.subscriptionDetails.cards.paid")}</p><p className="text-4xl font-extrabold">{details.totalPaid}</p></CardContent></Card>
        <Card className="rounded-[1.5rem]"><CardContent className="p-5 text-right"><p className="text-sm text-slate-500">{t("pricingManagement.subscriptionDetails.cards.parent")}</p><p className="text-2xl font-bold text-[#1E3A66]">{details.parentName}</p><p className="text-sm text-slate-400">{details.parentEmail}</p></CardContent></Card>
        <Card className="rounded-[1.5rem]"><CardContent className="p-5 text-right"><p className="text-sm text-slate-500">{t("pricingManagement.subscriptionDetails.cards.student")}</p><p className="text-2xl font-bold text-[#1E3A66]">{details.studentName}</p><DashboardBadge tone="warning">LVL 12</DashboardBadge></CardContent></Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="rounded-[2rem]"><CardContent className="space-y-4 p-6 text-right"><h3 className="text-2xl font-bold text-[#1E3A66]">{t("pricingManagement.subscriptionDetails.timelineTitle")}</h3><div className="h-24 rounded-xl bg-slate-50" /></CardContent></Card>
        <Card className="rounded-[2rem]"><CardContent className="space-y-4 p-6 text-right"><h3 className="text-2xl font-bold text-[#1E3A66]">{t("pricingManagement.subscriptionDetails.packageTitle")}</h3><p className="text-sm text-slate-500">{t("pricingManagement.subscriptionDetails.packageBody")}</p></CardContent></Card>
      </div>

      <DashboardTableCard title={t("pricingManagement.subscriptionDetails.paymentsTitle")}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-400">
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptionDetails.table.invoice")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptionDetails.table.date")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptionDetails.table.amount")}</th>
                <th className="px-6 py-4 font-medium">{t("pricingManagement.subscriptionDetails.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 text-sm"><td className="px-6 py-5 font-bold text-[#1E3A66]">#INV-2023-001</td><td className="px-6 py-5">12 يناير 2023</td><td className="px-6 py-5">2,400 ر.ع.</td><td className="px-6 py-5"><DashboardBadge tone="success">ناجحة</DashboardBadge></td></tr>
              <tr className="text-sm"><td className="px-6 py-5 font-bold text-[#1E3A66]">#INV-2022-045</td><td className="px-6 py-5">12 يناير 2022</td><td className="px-6 py-5">1,200 ر.ع.</td><td className="px-6 py-5"><DashboardBadge tone="info">مرفوض</DashboardBadge></td></tr>
            </tbody>
          </table>
        </div>
      </DashboardTableCard>
    </div>
  );
}
