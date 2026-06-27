"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EllipsisVertical,
  Plus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  userManagementDashboardData,
  type UserManagementFilterOption,
  type UserManagementGradeId,
  type UserManagementRoleId,
  type UserManagementSchoolId,
  type UserManagementStatusId,
  type UserManagementSubscriptionId,
} from "@/modules/admin/domain/data/userManagementDashboardData";
import {
  deleteUserManagementUser,
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
  getUserManagementStats,
  getUserManagementUsers,
  normalizeUserManagementRole,
  toggleUserManagementStatus,
  type UserManagementListRow,
  type UserManagementListPage,
  type UserManagementStats,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { getSchoolFilterOptions } from "@/modules/admin/infrastructure/api/schoolApi";
import { cn } from "@/shared/application/lib/cn";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardFilterSelect,
  DashboardFiltersPanel,
  type DashboardBadgeTone,
  DashboardPageHeader,
  DashboardSearchFilter,
  DashboardTableCard,
  DashboardTableFooterPagination,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { AddUserSelectionModal as AddUserModal } from "@/modules/admin/presentation/components/add-user";
import { ChatGroupDeleteModal } from "@/modules/admin/presentation/components/chat-groups";
import {
  UserManagementAnimatedSection,
  UserManagementDashboardSkeleton,
} from "@/modules/admin/presentation/components/user-management";

type CountryFilterId = "all" | (string & {});
type EducationLevelFilterId = "all" | (string & {});

const USER_MANAGEMENT_PAGE_SIZE = 10;

function buildPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 0) return [1];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

type FilterState = {
  query: string;
  roleId: UserManagementRoleId;
  countryId: CountryFilterId;
  educationLevelId: EducationLevelFilterId;
  schoolId: UserManagementSchoolId;
  gradeId: UserManagementGradeId;
  subscriptionId: UserManagementSubscriptionId;
};

type DashboardUserRow = {
  id: string;
  fullName: string;
  phoneNumber: string;
  roleLabel: string;
  roleQuery: string;
  roleTone: DashboardBadgeTone;
  schoolLabel: string;
  gradeLabel: string;
  subscriptionId: Exclude<UserManagementSubscriptionId, "all">;
  statusId: UserManagementStatusId;
  lastActivityLabel: string;
  avatarClassName: string;
  avatarImageUrl: string | null;
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
        "relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white before:absolute before:bottom-5 before:start-0 before:top-5 before:w-1",
        accentClassName,
      )}
    style={{
      boxShadow: "0px 8px 0px 0px #0000000D"
    }}
    >
      <div className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-4 text-start">
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

function roleTone(roleId: string): DashboardBadgeTone {
  if (roleId === "teacher") return "warning";
  if (roleId === "parent") return "info";
  if (roleId === "admin") return "danger";
  return "primary";
}

function subscriptionTone(subscriptionId: Exclude<UserManagementSubscriptionId, "all">) {
  return subscriptionId === "active" ? "success" : "warning";
}

function statusTone(statusId: UserManagementStatusId) {
  return statusId === "active" ? "success" : "warning";
}

const avatarToneClasses: readonly [string, string, string, string] = [
  "bg-[#D9F2F7] text-[#127A9C]",
  "bg-[#FCE7D6] text-[#9A4B1D]",
  "bg-[#DBEEF6] text-[#255E8A]",
  "bg-[#FEE2E2] text-[#B42318]",
];

function getAvatarClassName(seed: string) {
  const sum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarToneClasses[sum % avatarToneClasses.length] ?? avatarToneClasses[0];
}

function formatLastActivity(value: string | null, locale: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function mapStatsValues(
  stats: typeof userManagementDashboardData.stats,
  apiStats: UserManagementStats | null,
) {
  if (!apiStats) return stats;

  return stats.map((stat) => {
    switch (stat.id) {
      case "totalStudents":
        return { ...stat, value: apiStats.totalStudents.toLocaleString() };
      case "teachers":
        return { ...stat, value: apiStats.totalTeachers.toLocaleString() };
      case "activeSubscriptions":
        return { ...stat, value: apiStats.totalActiveUsers.toLocaleString() };
      case "blockedAccounts":
        return { ...stat, value: apiStats.totalInactiveUsers.toLocaleString() };
      default:
        return stat;
    }
  });
}

function buildRoleLabel(
  role: string,
  t: ReturnType<typeof useTranslations>,
) {
  const normalizedRole = normalizeUserManagementRole(role);
  if (normalizedRole === "student") return t("userManagement.roles.student");
  if (normalizedRole === "teacher") return t("userManagement.roles.teacher");
  if (normalizedRole === "parent") return t("userManagement.roles.parent");
  if (normalizedRole === "admin") return t("userManagement.roles.admin");
  return role || "—";
}

function mapApiRowsToViewModel(
  rows: UserManagementListRow[],
  locale: string,
  t: ReturnType<typeof useTranslations>,
): DashboardUserRow[] {
  return rows.map((row) => {
    const normalizedRole = normalizeUserManagementRole(row.role);
    const subscriptionId: Exclude<UserManagementSubscriptionId, "all"> = row.isActive
      ? "active"
      : "inactive";

    return {
      id: row.id,
      fullName: row.fullName,
      phoneNumber: row.phoneNumber,
      roleLabel: buildRoleLabel(row.role, t),
      roleQuery: normalizedRole,
      roleTone: roleTone(normalizedRole),
      schoolLabel: row.schoolName || "—",
      gradeLabel: row.gradeName || "—",
      subscriptionId,
      statusId: row.isActive ? "active" : "inactive",
      lastActivityLabel: formatLastActivity(row.lastActivity, locale),
      avatarClassName: getAvatarClassName(row.id || row.fullName),
      avatarImageUrl: row.profileImageUrl,
    };
  });
}

export function UserManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = userManagementDashboardData;
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    roleId: "all",
    countryId: "all",
    educationLevelId: "all",
    schoolId: "all",
    gradeId: "allGrades",
    subscriptionId: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [statsData, setStatsData] = useState<UserManagementStats | null>(null);
  const [usersPage, setUsersPage] = useState<UserManagementListPage | null>(null);
  const [countryOptions, setCountryOptions] = useState<
    Array<UserManagementFilterOption<CountryFilterId> & { label: string }>
  >([]);
  const [educationLevelOptions, setEducationLevelOptions] = useState<
    Array<UserManagementFilterOption<EducationLevelFilterId> & { label: string }>
  >([]);
  const [schoolOptions, setSchoolOptions] = useState<
    Array<UserManagementFilterOption<UserManagementSchoolId> & { label: string }>
  >([]);
  const [gradeOptions, setGradeOptions] = useState<
    Array<UserManagementFilterOption<UserManagementGradeId> & { label: string }>
  >([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [menuOpenUserId, setMenuOpenUserId] = useState<string | null>(null);
  const [pendingToggleUserId, setPendingToggleUserId] = useState<string | null>(null);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<DashboardUserRow | null>(null);
  const requestSequenceRef = useRef(0);

  const debouncedQuery = useMemo(() => filters.query.trim(), [filters.query]);
  const refreshKey = searchParams.get("refresh");

  const loadUsers = useCallback(async () => {
    const requestId = ++requestSequenceRef.current;
    setIsLoadingUsers(true);

    const result = await getUserManagementUsers({
      roleId: filters.roleId,
      schoolId: filters.schoolId,
      gradeId: filters.gradeId,
      isActive:
        filters.subscriptionId === "all"
          ? undefined
          : filters.subscriptionId === "active",
      keyword: debouncedQuery,
      pageNumber: currentPage,
      pageSize: USER_MANAGEMENT_PAGE_SIZE,
    });

    if (requestId !== requestSequenceRef.current) return;

    if (result.data) {
      setUsersPage(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
    }

    setIsLoadingUsers(false);
  }, [
    currentPage,
    debouncedQuery,
    filters.gradeId,
    filters.roleId,
    filters.schoolId,
    filters.subscriptionId,
    refreshKey,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.roleId,
    filters.countryId,
    filters.educationLevelId,
    filters.schoolId,
    filters.gradeId,
    filters.subscriptionId,
    debouncedQuery,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  useEffect(() => {
    const totalPages = usersPage?.totalPages ?? 1;
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, usersPage?.totalPages]);

  useEffect(() => {
    let mounted = true;

    const loadDashboardMetadata = async () => {
      const [statsResult, schoolsResult, countriesResult] = await Promise.all([
        getUserManagementStats(),
        getSchoolFilterOptions(),
        getCountriesDropdown(),
      ]);

      if (!mounted) return;

      if (statsResult.data) {
        setStatsData(statsResult.data);
      } else if (statsResult.errorMessage) {
        notify.error(statsResult.errorMessage);
      }

      if (schoolsResult.errorMessage) {
        notify.error(schoolsResult.errorMessage);
      }

      if (schoolsResult.data && schoolsResult.data.length > 0) {
        setSchoolOptions([
          {
            id: "all",
            labelKey: "userManagement.filters.schools.all",
            label: t("userManagement.filters.schools.all"),
          },
          ...schoolsResult.data.map((option) => ({
            id: option.id as UserManagementSchoolId,
            labelKey: "",
            label: option.name,
          })),
        ]);
      } else if (!schoolsResult.errorMessage) {
        setSchoolOptions(
          data.filters.schools.map((option) => ({
            ...option,
            label: t(option.labelKey),
          })),
        );
      }

      if (countriesResult.data && countriesResult.data.length > 0) {
        setCountryOptions([
          {
            id: "all",
            labelKey: "userManagement.filters.countries.all",
            label: t("userManagement.filters.countries.all"),
          },
          ...countriesResult.data.map((option) => ({
            id: String(option.id) as CountryFilterId,
            labelKey: "",
            label: option.name,
          })),
        ]);
      } else {
        setCountryOptions([]);
        if (countriesResult.errorMessage) {
          notify.error(countriesResult.errorMessage);
        }
      }
    };

    void loadDashboardMetadata();

    return () => {
      mounted = false;
    };
  }, [data.filters.schools, t]);

  useEffect(() => {
    let cancelled = false;

    if (filters.countryId === "all") {
      setEducationLevelOptions([
        {
          id: "all",
          labelKey: "userManagement.filters.educationLevels.all",
          label: t("userManagement.filters.educationLevels.all"),
        },
      ]);
      setGradeOptions([
        {
          id: "allGrades",
          labelKey: "userManagement.filters.grades.all",
          label: t("userManagement.filters.grades.all"),
        },
      ]);
      return;
    }

    const countryId = Number(filters.countryId);
    if (Number.isNaN(countryId)) return;

    void (async () => {
      const result = await getEducationLevelsDropdown(countryId);
      if (cancelled) return;

      if (result.data && result.data.length > 0) {
        setEducationLevelOptions([
          {
            id: "all",
            labelKey: "userManagement.filters.educationLevels.all",
            label: t("userManagement.filters.educationLevels.all"),
          },
          ...result.data.map((option) => ({
            id: String(option.id) as EducationLevelFilterId,
            labelKey: "",
            label: option.name,
          })),
        ]);
      } else {
        setEducationLevelOptions([
          {
            id: "all",
            labelKey: "userManagement.filters.educationLevels.all",
            label: t("userManagement.filters.educationLevels.all"),
          },
        ]);
        if (result.errorMessage) {
          notify.error(result.errorMessage);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.countryId, t]);

  useEffect(() => {
    let cancelled = false;

    if (filters.countryId === "all" || filters.educationLevelId === "all") {
      setGradeOptions([
        {
          id: "allGrades",
          labelKey: "userManagement.filters.grades.all",
          label: t("userManagement.filters.grades.all"),
        },
      ]);
      return;
    }

    const educationLevelId = Number(filters.educationLevelId);
    if (Number.isNaN(educationLevelId)) return;

    void (async () => {
      const result = await getUserManagementGradesDropdown(educationLevelId);
      if (cancelled) return;

      if (result.data && result.data.length > 0) {
        setGradeOptions([
          {
            id: "allGrades",
            labelKey: "userManagement.filters.grades.all",
            label: t("userManagement.filters.grades.all"),
          },
          ...result.data.map((option) => ({
            id: String(option.id) as UserManagementGradeId,
            labelKey: "",
            label: option.name,
          })),
        ]);
      } else {
        setGradeOptions([
          {
            id: "allGrades",
            labelKey: "userManagement.filters.grades.all",
            label: t("userManagement.filters.grades.all"),
          },
        ]);
        if (result.errorMessage) {
          notify.error(result.errorMessage);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.countryId, filters.educationLevelId, t]);

  const statCards = useMemo(
    () => mapStatsValues(data.stats, statsData),
    [data.stats, statsData],
  );
  const resolvedCountryOptions = useMemo(
    () =>
      countryOptions.length > 0
        ? countryOptions
        : [
            {
              id: "all" as CountryFilterId,
              labelKey: "userManagement.filters.countries.all",
              label: t("userManagement.filters.countries.all"),
            },
          ],
    [countryOptions, t],
  );
  const resolvedEducationLevelOptions = useMemo(
    () =>
      educationLevelOptions.length > 0
        ? educationLevelOptions
        : [
            {
              id: "all" as EducationLevelFilterId,
              labelKey: "userManagement.filters.educationLevels.all",
              label: t("userManagement.filters.educationLevels.all"),
            },
          ],
    [educationLevelOptions, t],
  );
  const resolvedSchoolOptions = useMemo(
    () =>
      schoolOptions.length > 0
        ? schoolOptions
        : data.filters.schools.map((option) => ({
            ...option,
            label: t(option.labelKey),
          })),
    [data.filters.schools, schoolOptions, t],
  );
  const resolvedGradeOptions = useMemo(
    () =>
      gradeOptions.length > 0
        ? gradeOptions
        : [
            {
              id: "allGrades",
              labelKey: "userManagement.filters.grades.all",
              label: t("userManagement.filters.grades.all"),
            },
          ],
    [gradeOptions, t],
  );

  const tableRows = useMemo(
    () => mapApiRowsToViewModel(usersPage?.rows ?? [], locale, t),
    [locale, t, usersPage?.rows],
  );

  const visibleRows = tableRows;
  const tableColumns = useMemo<Array<DashboardDataTableColumn<DashboardUserRow>>>(
    () => [
      {
        id: "avatar",
        header: t("userManagement.table.columns.avatar"),
        renderCell: (row) => (
          <UserAvatarImageOrInitials
            trackKey={row.id}
            name={row.fullName}
            imageUrl={row.avatarImageUrl}
            size="md"
            circleClassName={cn("font-bold", row.avatarClassName)}
          />
        ),
      },
      {
        id: "fullName",
        header: t("userManagement.table.columns.fullName"),
        renderCell: (row) => (
          <div className="min-w-[14rem] space-y-1 text-start">
            <p className="font-semibold text-slate-800">{row.fullName}</p>
            <p dir="ltr" className="text-xs text-slate-400">{row.phoneNumber}</p>
          </div>
        ),
      },
      {
        id: "role",
        header: t("userManagement.table.columns.role"),
        renderCell: (row) => (
          <DashboardBadge tone={row.roleTone}>
            {row.roleLabel}
          </DashboardBadge>
        ),
      },
      {
        id: "school",
        header: t("userManagement.table.columns.school"),
        cellClassName: "text-slate-700",
        renderCell: (row) => row.schoolLabel,
      },
      {
        id: "grade",
        header: t("userManagement.table.columns.grade"),
        cellClassName: "text-slate-600",
        renderCell: (row) => row.gradeLabel,
      },
      {
        id: "subscription",
        header: t("userManagement.table.columns.subscription"),
        renderCell: (row) => (
          <DashboardBadge tone={subscriptionTone(row.subscriptionId)} withDot>
            {t(`userManagement.subscriptions.${row.subscriptionId}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "status",
        header: t("userManagement.table.columns.status"),
        renderCell: (row) => (
          <StatusSwitch
            checked={row.statusId === "active"}
            activeLabel={t("userManagement.status.active")}
            inactiveLabel={t("userManagement.status.inactive")}
            disabled={pendingToggleUserId === row.id}
            onChange={() => {
              void handleToggleStatus(row);
            }}
          />
        ),
      },
      {
        id: "lastActivity",
        header: t("userManagement.table.columns.lastActivity"),
        cellClassName: "text-slate-400",
        renderCell: (row) => row.lastActivityLabel,
      },
    ],
    [pendingToggleUserId, t],
  );

  const activePage = usersPage?.currentPage ?? currentPage;
  const totalPages = usersPage?.totalPages ?? 1;

  const paginationPages = useMemo(
    () => buildPaginationPages(activePage, totalPages),
    [activePage, totalPages],
  );

  const summaryTotal = usersPage?.totalItems ?? 0;
  const summaryVisible = usersPage?.rows.length ?? visibleRows.length;
  const showContentSkeleton = isLoadingUsers;

  const handleOpenUser = (row: DashboardUserRow) => {
    router.push(`${ROUTES.ADMIN.USER_MANAGEMENT.VIEW(row.id)}?role=${row.roleQuery}`);
  };

  const handleToggleStatus = async (row: DashboardUserRow) => {
    setPendingToggleUserId(row.id);
    const result = await toggleUserManagementStatus(row.id);
    console.log(result);
    if (
      result.status !== "Success" ||
      !result.data ||
      result.data.userId !== row.id
    ) {
      notify.error(result.errorMessage ?? "Failed to update user status");
      setPendingToggleUserId(null);
      return;
    }

    await loadUsers();
    setPendingToggleUserId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    setPendingDeleteUserId(userId);
    const result = await deleteUserManagementUser(userId);

    if (+result.status !== +"200" || !result.data) {
      notify.error(result.errorMessage ?? "Failed to delete user");
      setPendingDeleteUserId(null);
      return;
    }

    setMenuOpenUserId(null);
    setDeleteModalUser(null);
    if (visibleRows.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      await loadUsers();
    }
    setPendingDeleteUserId(null);
  };

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
      <ChatGroupDeleteModal
        open={deleteModalUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalUser(null);
          }
        }}
        groupName={deleteModalUser?.fullName}
        title={t("userManagement.deleteModal.title")}
        description={t("userManagement.deleteModal.description")}
        confirmLabel={t("userManagement.deleteModal.confirm")}
        cancelLabel={t("userManagement.deleteModal.cancel")}
        onConfirm={() => {
          if (deleteModalUser) {
            void handleDeleteUser(deleteModalUser.id);
          }
        }}
      />

      {showContentSkeleton ? (
        <UserManagementDashboardSkeleton />
      ) : (
        <>
          <UserManagementAnimatedSection delay={0.02}>
            <section className="grid gap-5 lg:grid-cols-4">
              {statCards.map((stat) => (
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
          </UserManagementAnimatedSection>

          <UserManagementAnimatedSection delay={0.05}>
            <DashboardFiltersPanel isLoading={isLoadingUsers}>
              <DashboardFilterSelect
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
              <DashboardFilterSelect
                label={t("userManagement.filters.countries.label")}
                value={filters.countryId}
                options={resolvedCountryOptions}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    countryId: value as CountryFilterId,
                    educationLevelId: "all",
                    gradeId: "allGrades",
                  }))
                }
              />
              {/* <DashboardFilterSelect
                label={t("userManagement.filters.educationLevels.label")}
                value={filters.educationLevelId}
                options={resolvedEducationLevelOptions}
                disabled={filters.countryId === "all"}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    educationLevelId: value as EducationLevelFilterId,
                    gradeId: "allGrades",
                  }))
                }
              /> */}
              <DashboardFilterSelect
                label={t("userManagement.filters.schools.label")}
                value={filters.schoolId}
                options={resolvedSchoolOptions}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, schoolId: value }))
                }
              />
              {/* <DashboardFilterSelect
                label={t("userManagement.filters.grades.label")}
                value={filters.gradeId}
                options={resolvedGradeOptions}
                disabled={
                  filters.countryId === "all" || filters.educationLevelId === "all"
                }
                onChange={(value) =>
                  setFilters((current) => ({ ...current, gradeId: value }))
                }
              /> */}
              <DashboardFilterSelect
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
              <DashboardSearchFilter
                label={t("userManagement.filters.search.label")}
                placeholder={t("userManagement.filters.search.placeholder")}
                value={filters.query}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, query: value }))
                }
              />
            </DashboardFiltersPanel>
          </UserManagementAnimatedSection>

          <UserManagementAnimatedSection delay={0.08}>
            <DashboardTableCard
              title={t("userManagement.table.title")}
              footer={
                <DashboardTableFooterPagination
                  summary={t("userManagement.table.pagination.summary", {
                    visible: summaryVisible,
                    total: summaryTotal,
                  })}
                  pages={paginationPages}
                  currentPage={activePage}
                  previousLabel={t("userManagement.table.pagination.previous")}
                  nextLabel={t("userManagement.table.pagination.next")}
                  onPageChange={setCurrentPage}
                />
              }
            >
              <DashboardDataTable
                rows={visibleRows}
                columns={tableColumns}
                getRowKey={(row) => row.id}
                emptyMessage={t("userManagement.table.empty")}
                onRowClick={handleOpenUser}
                actionsHeader={t("userManagement.table.columns.actions")}
                renderActions={(row) => (
                  <>
                    <button
                      type="button"
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={t("userManagement.table.actions.more")}
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpenUserId((current) => (current === row.id ? null : row.id));
                      }}
                    >
                      <EllipsisVertical className="h-5 w-5" aria-hidden />
                    </button>
                    <div className="relative">
                      {menuOpenUserId === row.id ? (
                        <div
                          className="absolute end-0 top-2 z-20 min-w-[8rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={pendingDeleteUserId === row.id}
                            className="w-full rounded-xl px-3 py-2 text-start text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                            onClick={() => {
                              setMenuOpenUserId(null);
                              setDeleteModalUser(row);
                            }}
                          >
                            {t("userManagement.table.actions.delete")}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              />
            </DashboardTableCard>
          </UserManagementAnimatedSection>
        </>
      )}
    </div>
  );
}
