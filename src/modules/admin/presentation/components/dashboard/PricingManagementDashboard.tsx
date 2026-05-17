"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getPricingManagementDashboardData,
  type PricingManagementDashboardData,
  type PricingPlanRow,
} from "@/modules/admin/domain/data/pricingManagementData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

const PAGE_SIZE = 10;

export function PricingManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [data, setData] = useState<PricingManagementDashboardData | null>(null);
  const [rows, setRows] = useState<PricingPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const result = await getPricingManagementDashboardData();
      if (!alive) return;
      setData(result);
      setRows(result.rows);
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE),
    [rows, currentPage],
  );

  const handleToggleActive = (id: string, checked: boolean) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, active: checked } : row)));
  };

  const tableColumns = useMemo<Array<DashboardDataTableColumn<PricingPlanRow>>>(
    () => [
      {
        id: "planName",
        header: t("pricingManagement.table.columns.planName"),
        renderCell: (row) => (
          <div className="flex items-center justify-end gap-3">
            <div className="space-y-1 text-right">
              <p className="font-semibold text-slate-800">{row.name}</p>
              <p className="text-xs text-slate-400">ID: #{row.id.replace("plan-", "")}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FD] font-bold text-[#1E3A66]">
              {row.code}
            </span>
          </div>
        ),
      },
      {
        id: "type",
        header: t("pricingManagement.table.columns.type"),
        renderCell: (row) => (
          <DashboardBadge tone={row.typeId === "oneTime" ? "warning" : "info"}>
            {t(`pricingManagement.table.types.${row.typeId}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "linkedContent",
        header: t("pricingManagement.table.columns.linkedContent"),
        renderCell: (row) => row.linkedContentLabel,
      },
      {
        id: "price",
        header: t("pricingManagement.table.columns.price"),
        cellClassName: "font-semibold text-slate-800",
        renderCell: (row) => row.priceLabel,
      },
      {
        id: "status",
        header: t("pricingManagement.table.columns.status"),
        renderCell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <DashboardBadge tone={row.active ? "success" : "danger"} withDot>
              {row.active
                ? t("pricingManagement.table.status.active")
                : t("pricingManagement.table.status.inactive")}
            </DashboardBadge>
            <StatusSwitch
              checked={row.active}
              onChange={(checked) => handleToggleActive(row.id, checked)}
              activeLabel={t("pricingManagement.table.status.active")}
              inactiveLabel={t("pricingManagement.table.status.inactive")}
              activeClassName="bg-emerald-500"
            />
          </div>
        ),
      },
    ],
    [t],
  );

  if (loading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("pricingManagement.page.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("pricingManagement.page.title")}
        description={t("pricingManagement.page.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("pricingManagement.page.title") },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-2xl border-slate-200 px-6 text-base font-semibold text-slate-700"
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.PAYMENT_GATEWAYS)}
            >
              {t("pricingManagement.page.paymentGateways")}
            </Button>
            <Button
              type="button"
              className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
              style={{ boxShadow: "var(--dashboard-shadow-button)" }}
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.ADD)}
            >
              <Plus className="h-5 w-5" />
              {t("pricingManagement.page.addPlan")}
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.stats.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
            indicator={t(stat.indicatorKey)}
            indicatorClassName={stat.indicatorToneClassName}
            icon={stat.icon}
            iconTone={stat.iconTone}
          />
        ))}
      </section>

      <DashboardTableCard
        title={t("pricingManagement.table.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("pricingManagement.table.pagination.summary", {
                visible: pageRows.length,
                total: rows.length,
              })}
            </p>
            <DashboardPagination
              pages={Array.from({ length: pageCount }, (_, i) => i + 1)}
              currentPage={currentPage}
              previousLabel={t("pricingManagement.table.pagination.previous")}
              nextLabel={t("pricingManagement.table.pagination.next")}
              onPageChange={setPage}
            />
          </div>
        }
      >
        <DashboardDataTable
          rows={pageRows}
          columns={tableColumns}
          getRowKey={(row) => row.id}
          emptyMessage="—"
          actionsHeader={t("pricingManagement.table.columns.actions")}
          renderActions={(row) => (
            <button
              type="button"
              className="dashboard-icon-btn"
              aria-label={t("pricingManagement.table.actions.edit")}
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.EDIT(row.id))}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        />
      </DashboardTableCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
          <CardContent className="space-y-4 p-6 text-right">
            <h3 className="text-3xl font-bold text-[#1E3A66]">{t("pricingManagement.distribution.title")}</h3>
            <BarRow label={t("pricingManagement.distribution.monthly")} value={45} toneClassName="bg-[#243B5A]" />
            <BarRow label={t("pricingManagement.distribution.oneTime")} value={30} toneClassName="bg-[#C7AF6E]" />
            <BarRow label={t("pricingManagement.distribution.yearly")} value={25} toneClassName="bg-[#6BCB1E]" />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 bg-[#243B5A] text-white shadow-[0px_8px_0px_0px_#0000000D]">
          <CardContent className="space-y-4 p-6 text-right">
            <h3 className="text-3xl font-bold">{t("pricingManagement.tip.title")}</h3>
            <p className="text-sm text-white/80">{t("pricingManagement.tip.body")}</p>
            <Button type="button" className="h-12 rounded-xl bg-white text-[#243B5A] hover:bg-white/95">
              {t("pricingManagement.tip.button")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  toneClassName,
}: {
  label: string;
  value: number;
  toneClassName: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-500">{value}%</span>
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClassName}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
