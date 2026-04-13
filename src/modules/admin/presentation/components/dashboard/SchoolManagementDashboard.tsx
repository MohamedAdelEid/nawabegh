"use client";

import { useEffect } from "react";
import { Download, EllipsisVertical, SlidersHorizontal } from "lucide-react";
import AddSchoolIcon from "@/modules/admin/presentation/assets/icons/AddSchool.svg";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DashboardBadge,
  DashboardInsightCard,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { useSchoolsTable } from "@/modules/admin/application/hooks/useSchoolsTable";
import { schoolManagementDashboardData } from "@/modules/admin/domain/data/schoolManagementDashboardData";
import { ROUTES } from "@/shared/infrastructure/config/routes";

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("نشط")) return "success" as const;
  return "neutral" as const;
}

function performanceTone(
  status: "excellent" | "veryGood" | "good" | "neutral",
) {
  switch (status) {
    case "excellent":
      return "success" as const;
    case "veryGood":
      return "info" as const;
    case "good":
      return "primary" as const;
    default:
      return "neutral" as const;
  }
}

function TableState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="max-w-md text-sm leading-7 text-slate-500">{description}</p>
      {action}
    </div>
  );
}

function TableLoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-1 text-right">
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <Skeleton key={cellIndex} className="h-12 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SchoolManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const data = schoolManagementDashboardData;
  const schoolsTable = useSchoolsTable();
  const responseStatus = schoolsTable.data?.status ?? "Success";
  const page = schoolsTable.page;

  useEffect(() => {
    if (responseStatus === "Unauthorized") {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [responseStatus, router]);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("schoolManagement.page.title")}
        breadcrumbs={[
          { label: t("tabs.home.title") },
          { label: t("schoolManagement.page.title") },
        ]}
        description={t("schoolManagement.page.description")}
        action={
          <Button
            type="button"
            className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white shadow-[0_14px_30px_rgba(44,66,96,0.22)] hover:bg-[#243751] cursor-pointer"
            onClick={() => {
              router.push(ROUTES.ADMIN.SCHOOL_MANAGEMENT.ADD);
            }}
          >
            <img src={AddSchoolIcon.src} alt="Add School" width={22} height={22} aria-hidden />
            {t("schoolManagement.page.addSchool")}
          </Button>
        }
      />

      <section className="grid gap-5 lg:grid-cols-4">
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
        title={t("schoolManagement.table.title")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200 px-5 text-slate-700"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              {t("schoolManagement.table.actions.filter")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200 px-5 text-slate-700"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("schoolManagement.table.actions.export")}
            </Button>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("schoolManagement.table.pagination.summary", {
                visible: page?.rows.length ?? 0,
                total: page?.totalItems ?? 0,
              })}
            </p>
            <DashboardPagination
              pages={schoolsTable.pages}
              currentPage={page?.currentPage ?? schoolsTable.pageNumber}
              previousLabel={t("schoolManagement.table.pagination.previous")}
              nextLabel={t("schoolManagement.table.pagination.next")}
              onPageChange={schoolsTable.setPageNumber}
            />
          </div>
        }
      >
        {schoolsTable.isLoading ? (
          <TableLoadingState
            title={t("schoolManagement.table.states.loading.title")}
            description={t("schoolManagement.table.states.loading.description")}
          />
        ) : responseStatus === "Unauthorized" ? (
          <TableState
            title={t("schoolManagement.table.states.unauthorized.title")}
            description={t("schoolManagement.table.states.unauthorized.description")}
            action={
              <Button type="button" onClick={() => router.push(ROUTES.AUTH.LOGIN)}>
                {t("schoolManagement.table.states.actions.goToLogin")}
              </Button>
            }
          />
        ) : responseStatus === "Forbidden" ? (
          <TableState
            title={t("schoolManagement.table.states.forbidden.title")}
            description={t("schoolManagement.table.states.forbidden.description")}
          />
        ) : responseStatus === "NotFound" || (responseStatus === "Success" && (page?.rows.length ?? 0) === 0) ? (
          <TableState
            title={t("schoolManagement.table.states.empty.title")}
            description={t("schoolManagement.table.states.empty.description")}
          />
        ) : responseStatus === "BadRequest" || responseStatus === "Conflict" || responseStatus === "Error" || !page ? (
          <TableState
            title={t("schoolManagement.table.states.error.title")}
            description={
              schoolsTable.data?.errorMessage ||
              t("schoolManagement.table.states.error.description")
            }
            action={
              <Button type="button" onClick={() => void schoolsTable.refetch()}>
                {t("schoolManagement.table.states.actions.retry")}
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-400">
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.school")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.students")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.points")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.rank")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.performance")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.foundedAt")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.status")}</th>
                  <th className="px-6 py-5 font-medium">{t("schoolManagement.table.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-5">
                      <div className="flex min-w-[15rem] items-center justify-start gap-3">
                        <div className="text-3xl" aria-hidden>
                          {row.flag}
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="font-semibold text-slate-800">{row.schoolName}</p>
                          <p className="text-xs text-slate-400">{row.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600">{row.studentCount}</td>
                    <td className="px-6 py-5 font-bold text-slate-700">{row.totalPoints}</td>
                    <td className="px-6 py-5">
                      {row.ranking ? (
                        <DashboardBadge tone={row.ranking === 1 ? "gold" : "primary"}>
                          {row.ranking}
                        </DashboardBadge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <DashboardBadge tone={performanceTone(row.performanceStatus)}>
                        {row.performance}
                      </DashboardBadge>
                    </td>
                    <td className="px-6 py-5 text-slate-500">{row.foundedAt}</td>
                    <td className="px-6 py-5">
                      <DashboardBadge tone={statusTone(row.status)} withDot>
                        {row.status}
                      </DashboardBadge>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label={t("schoolManagement.table.actions.more")}
                      >
                        <EllipsisVertical className="h-5 w-5" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardTableCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardInsightCard
          title={t(data.insights.updates.titleKey)}
          description={t(data.insights.updates.descriptionKey)}
          actionLabel={t(data.insights.updates.actionLabelKey)}
          variant={data.insights.updates.variant}
          floatingIcon={data.insights.updates.floatingIcon}
        />
        <DashboardInsightCard
          title={t(data.insights.supervisorTip.titleKey)}
          description={t(data.insights.supervisorTip.descriptionKey)}
          actionLabel={t(data.insights.supervisorTip.actionLabelKey)}
          icon={data.insights.supervisorTip.icon}
          variant={data.insights.supervisorTip.variant}
        />
      </section>
    </div>
  );
}
