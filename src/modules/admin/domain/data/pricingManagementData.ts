import { BadgeCheck, Banknote, Wallet } from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import type { IconTone } from "@/shared/domain/types/common.types";

export type PricingPlanTypeId = "oneTime" | "yearly" | "monthly";

export interface PricingStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: IconTone;
}

export interface PricingPlanRow {
  id: string;
  code: string;
  name: string;
  typeId: PricingPlanTypeId;
  linkedContentLabel: string;
  priceLabel: string;
  active: boolean;
}

export interface PricingManagementDashboardData {
  stats: PricingStat[];
  rows: PricingPlanRow[];
}

export interface PricingPlanForm {
  name: string;
  typeId: PricingPlanTypeId;
  currency: string;
  basePrice: string;
  offerPrice: string;
  linkedContent: string;
  active: boolean;
}

const DASHBOARD_DATA: PricingManagementDashboardData = {
  stats: [
    {
      id: "activePlans",
      labelKey: "pricingManagement.stats.activePlans.label",
      value: "24",
      indicatorKey: "pricingManagement.stats.activePlans.indicator",
      indicatorToneClassName: "text-slate-400",
      icon: BadgeCheck,
      iconTone: "info",
    },
    {
      id: "averageSubscription",
      labelKey: "pricingManagement.stats.averageSubscription.label",
      value: "150 ر.ع.",
      indicatorKey: "pricingManagement.stats.averageSubscription.indicator",
      indicatorToneClassName: "text-amber-700",
      icon: Banknote,
      iconTone: "warning",
    },
    {
      id: "expectedRevenue",
      labelKey: "pricingManagement.stats.expectedRevenue.label",
      value: "42.5K",
      indicatorKey: "pricingManagement.stats.expectedRevenue.indicator",
      indicatorToneClassName: "text-emerald-600",
      icon: Wallet,
      iconTone: "success",
    },
  ],
  rows: [
    {
      id: "plan-99012",
      code: "C",
      name: "أساسيات لغة بايثون",
      typeId: "oneTime",
      linkedContentLabel: "دورة البرمجة الشاملة",
      priceLabel: "299 ر.ع.",
      active: true,
    },
    {
      id: "plan-99055",
      code: "S",
      name: "الاشتراك الذهبي السنوي",
      typeId: "yearly",
      linkedContentLabel: "جميع مسارات العلوم",
      priceLabel: "1,499 ر.ع.",
      active: true,
    },
    {
      id: "plan-98122",
      code: "M",
      name: "باقة المعلم الفضية",
      typeId: "monthly",
      linkedContentLabel: "مجموعة أدوات المعلمين",
      priceLabel: "150 ر.ع.",
      active: false,
    },
  ],
};

const PLAN_FORM_DETAILS: Record<string, PricingPlanForm> = {
  "plan-99012": {
    name: "أساسيات لغة بايثون",
    typeId: "oneTime",
    currency: "omr",
    basePrice: "299",
    offerPrice: "0",
    linkedContent: "python-basics-course",
    active: true,
  },
};

export async function getPricingManagementDashboardData(): Promise<PricingManagementDashboardData> {
  await Promise.resolve();
  return DASHBOARD_DATA;
}

export async function getPricingPlanById(planId: string): Promise<PricingPlanForm | null> {
  await Promise.resolve();
  return PLAN_FORM_DETAILS[planId] ?? null;
}
