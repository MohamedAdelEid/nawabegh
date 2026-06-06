import type { AdDetail, AdKpis, AdTablePage } from "@/modules/admin/domain/types/adManagement.types";

/** Dev/demo seed until backend is connected. Enable with NEXT_PUBLIC_ADS_USE_MOCK=true */
export const AD_MANAGEMENT_SEED_KPIS: AdKpis = {
  activeAds: 24,
  scheduledAds: 8,
  totalViews: 12800,
  engagementRate: 4.2,
  activeAdsTrend: 12,
  totalViewsTrend: 45,
  engagementRateTrend: -2,
};

export const AD_MANAGEMENT_SEED_ROWS: AdTablePage["rows"] = [
  {
    id: "1",
    displayId: "ANN-9021",
    title: "تحدي القراءة السريعة",
    thumbnailUrl: "",
    type: "banner",
    audiences: ["students"],
    status: "active",
    createdAt: "2023-05-12",
    views: 4200,
    clicks: 180,
  },
  {
    id: "2",
    displayId: "ANN-8844",
    title: "تحديث جدول الاختبارات النهائية",
    thumbnailUrl: "",
    type: "popup",
    audiences: ["students", "teachers"],
    status: "scheduled",
    createdAt: "2023-05-10",
    views: 3100,
    clicks: 290,
  },
  {
    id: "3",
    displayId: "ANN-8702",
    title: "مسابقة المبتكرين الصغار",
    thumbnailUrl: "",
    type: "card",
    audiences: ["all"],
    status: "expired",
    createdAt: "2023-04-28",
    views: 8900,
    clicks: 410,
  },
];

export function getAdManagementSeedDetail(id: string): AdDetail | null {
  const row = AD_MANAGEMENT_SEED_ROWS.find((item) => item.id === id);
  if (!row) return null;

  return {
    id: row.id,
    displayId: row.displayId,
    title: row.title,
    description:
      "ندعو جميع طلابنا المبدعين للمشاركة في النسخة الجديدة من مسابقة نوابغ السنوية. هناك جوائز قيمة بانتظار الفائزين الأوائل!",
    ctaText: "جرب الآن",
    ctaUrl: "https://example.com/tests",
    mediaUrl: "",
    type: row.type,
    audiences: row.audiences,
    status: row.status,
    schoolIds: [],
    schoolLabels: ["مدرسة النوابغ الدولية", "مدارس القمة", "+12 أخرى"],
    gradeLevelIds: [],
    gradeLevelLabels: ["الصف العاشر", "الصف الحادي عشر"],
    subjectIds: [],
    subjectLabels: ["الرياضيات", "العلوم"],
    publishMode: "schedule",
    startAt: "2023-10-15T09:00:00",
    endAt: "2023-10-25T23:59:00",
    timezone: "Asia/Riyadh",
    createdAt: row.createdAt,
    createdBy: "الإدارة العليا",
    views: row.views,
    clicks: row.clicks,
    ctr: row.views > 0 ? (row.clicks / row.views) * 100 : 0,
    daysRemaining: 5,
    viewsTrend: 12,
    clicksTrend: 5,
  };
}
