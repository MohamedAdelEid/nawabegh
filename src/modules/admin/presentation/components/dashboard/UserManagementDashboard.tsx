"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  EllipsisVertical,
  Plus,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  userManagementDashboardData,
  type UserManagementDashboardData,
  type UserManagementFilterOption,
  type UserManagementGradeId,
  type UserManagementRoleId,
  type UserManagementSchoolId,
  type UserManagementStatusId,
  type UserManagementSubscriptionId,
} from "@/modules/admin/domain/data/userManagementDashboardData";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardPageHeader,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { AddUserSelectionModal as AddUserModal } from "@/modules/admin/presentation/components/add-user";

type FilterState = {
  query: string;
  roleId: UserManagementRoleId;
  schoolId: UserManagementSchoolId;
  gradeId: UserManagementGradeId;
  subscriptionId: UserManagementSubscriptionId;
};

function UserManagementStatCard({
  label,
  value,
  indicator,
  accentClassName,
  icon: Icon,
  iconToneClassName,
}: {
  label: string;
  value: string;
  indicator?: string;
  accentClassName: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconToneClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white before:absolute before:bottom-5 before:right-0 before:top-5 before:w-1",
        accentClassName,
      )}
    style={{
      boxShadow: "0px 8px 0px 0px #0000000D"
    }}
    >
      <div className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-4 text-right">
          {indicator ? (
            <p dir="ltr" className="text-sm font-semibold text-emerald-500">{indicator}</p>
          ) : (
            <div />
          )}
          <div className="space-y-1.5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-4xl font-bold tracking-tight text-slate-800">{value}</p>
          </div>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              iconToneClassName,
            )}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<UserManagementFilterOption<T> & { label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="min-w-[10rem] space-y-2 text-right">
      <span className="block text-xs font-medium text-slate-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-white px-4 text-right text-base text-slate-700 shadow-sm outline-none transition focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function SearchFilter({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-[18rem] flex-1 space-y-2 text-right">
      <span className="block text-xs font-medium text-slate-400">{label}</span>
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-slate-100 bg-white pr-4 pl-12 text-right text-base text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20"
        />
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function StatusSwitch({
  checked,
  onChange,
  activeLabel,
  inactiveLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? activeLabel : inactiveLabel}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
        checked ? "bg-[#243B5A]" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[-0.2rem]" : "-translate-x-7",
        )}
      />
    </button>
  );
}

function roleTone(roleId: Exclude<UserManagementRoleId, "all">) {
  return roleId === "teacher" ? "warning" : "primary";
}

function subscriptionTone(subscriptionId: Exclude<UserManagementSubscriptionId, "all">) {
  return subscriptionId === "active" ? "success" : "warning";
}

function statusTone(statusId: UserManagementStatusId) {
  return statusId === "active" ? "success" : "warning";
}

function matchesFilters(
  row: UserManagementDashboardData["rows"][number],
  filters: FilterState,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const matchesQuery =
    normalizedQuery.length === 0 ||
    row.fullName.toLowerCase().includes(normalizedQuery) ||
    row.phoneNumber.toLowerCase().includes(normalizedQuery);

  const matchesRole = filters.roleId === "all" || row.roleId === filters.roleId;
  const matchesSchool =
    filters.schoolId === "all" || row.schoolId === filters.schoolId;
  const matchesGrade =
    filters.gradeId === "allGrades" || row.gradeId === filters.gradeId;
  const matchesSubscription =
    filters.subscriptionId === "all" ||
    row.subscriptionId === filters.subscriptionId;

  return (
    matchesQuery &&
    matchesRole &&
    matchesSchool &&
    matchesGrade &&
    matchesSubscription
  );
}

export function UserManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const data = userManagementDashboardData;
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    roleId: "all",
    schoolId: "all",
    gradeId: "allGrades",
    subscriptionId: "all",
  });
  const [currentPage, setCurrentPage] = useState(data.pagination.currentPage);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [rowStatuses, setRowStatuses] = useState<Record<string, UserManagementStatusId>>(
    () =>
      Object.fromEntries(
        data.rows.map((row) => [row.id, row.statusId]),
      ) as Record<string, UserManagementStatusId>,
  );

  const filteredRows = useMemo(
    () => data.rows.filter((row) => matchesFilters(row, filters)),
    [data.rows, filters],
  );

  const paginationPages = Array.from(
    { length: data.pagination.totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("userManagement.page.title")}
        breadcrumbs={[
          { label: t("tabs.home.title") },
          { label: t("userManagement.page.title") },
        ]}
        description={t("userManagement.page.description")}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
            style={{
              boxShadow: "0px 4px 0px 0px #1E2E42"
            }}
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("userManagement.page.addUser")}
          </Button>
        }
      />

      <AddUserModal
        open={isAddUserModalOpen}
        onOpenChange={setIsAddUserModalOpen}
      />

      <section className="grid gap-5 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <UserManagementStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
            indicator={stat.indicatorKey ? t(stat.indicatorKey) : undefined}
            accentClassName={stat.accentClassName}
            icon={stat.icon}
            iconToneClassName={stat.iconToneClassName}
          />
        ))}
      </section>

      <div className="rounded-[1.75rem] border border-white/80 bg-white p-5" style={{
        boxShadow: "0px 8px 0px 0px #0000000D"
      }}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <FilterSelect
            label={t("userManagement.filters.roles.label")}
            value={filters.roleId}
            options={data.filters.roles.map((option) => ({
              ...option,
              label: t(option.labelKey),
            }))}
            onChange={(value) =>
              setFilters((current) => ({ ...current, roleId: value }))
            }
          />
          <FilterSelect
            label={t("userManagement.filters.schools.label")}
            value={filters.schoolId}
            options={data.filters.schools.map((option) => ({
              ...option,
              label: t(option.labelKey),
            }))}
            onChange={(value) =>
              setFilters((current) => ({ ...current, schoolId: value }))
            }
          />
          <FilterSelect
            label={t("userManagement.filters.grades.label")}
            value={filters.gradeId}
            options={data.filters.grades.map((option) => ({
              ...option,
              label: t(option.labelKey),
            }))}
            onChange={(value) =>
              setFilters((current) => ({ ...current, gradeId: value }))
            }
          />
          <FilterSelect
            label={t("userManagement.filters.subscriptions.label")}
            value={filters.subscriptionId}
            options={data.filters.subscriptions.map((option) => ({
              ...option,
              label: t(option.labelKey),
            }))}
            onChange={(value) =>
              setFilters((current) => ({ ...current, subscriptionId: value }))
            }
          />
          <SearchFilter
            label={t("userManagement.filters.search.label")}
            placeholder={t("userManagement.filters.search.placeholder")}
            value={filters.query}
            onChange={(value) =>
              setFilters((current) => ({ ...current, query: value }))
            }
          />
        </div>
      </div>

      <DashboardTableCard
        title={t("userManagement.table.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("userManagement.table.pagination.summary", {
                visible:
                  filteredRows.length > 0
                    ? data.pagination.visibleItems
                    : 0,
                total: data.pagination.totalItems,
              })}
            </p>
            <DashboardPagination
              pages={paginationPages}
              currentPage={currentPage}
              previousLabel={t("userManagement.table.pagination.previous")}
              nextLabel={t("userManagement.table.pagination.next")}
              onPageChange={setCurrentPage}
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-400">
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.avatar")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.fullName")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.role")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.school")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.grade")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.subscription")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.status")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.lastActivity")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.table.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                    {t("userManagement.table.empty")}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const currentStatus = rowStatuses[row.id] ?? row.statusId;

                  return (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-slate-100 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-50/70"
                      onClick={() => router.push(ROUTES.ADMIN.USER_MANAGEMENT.VIEW(row.id))}
                    >
                      <td className="px-6 py-5">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
                            row.avatarClassName,
                          )}
                        >
                          {row.avatarInitials}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="min-w-[14rem] space-y-1 text-right">
                          <p className="font-semibold text-slate-800">{row.fullName}</p>
                          <p dir="ltr" className="text-xs text-slate-400">{row.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <DashboardBadge tone={roleTone(row.roleId)}>
                          {t(`userManagement.roles.${row.roleId}`)}
                        </DashboardBadge>
                      </td>
                      <td className="px-6 py-5 text-slate-700">
                        {t(`userManagement.schools.${row.schoolId}`)}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {row.gradeId ? t(`userManagement.grades.${row.gradeId}`) : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <DashboardBadge tone={subscriptionTone(row.subscriptionId)} withDot>
                          {t(`userManagement.subscriptions.${row.subscriptionId}`)}
                        </DashboardBadge>
                      </td>
                      <td className="px-6 py-5">
                        <StatusSwitch
                          checked={currentStatus === "active"}
                          activeLabel={t("userManagement.status.active")}
                          inactiveLabel={t("userManagement.status.inactive")}
                          onChange={(checked) =>
                            setRowStatuses((current) => ({
                              ...current,
                              [row.id]: checked ? "active" : "inactive",
                            }))
                          }
                        />
                      </td>
                      <td className="px-6 py-5 text-slate-400">
                        {t(row.lastActivityKey)}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label={t("userManagement.table.actions.more")}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <EllipsisVertical className="h-5 w-5" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DashboardTableCard>
    </div>
  );
}
