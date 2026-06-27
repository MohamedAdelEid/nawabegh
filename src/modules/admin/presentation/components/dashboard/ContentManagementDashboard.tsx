"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getContentManagementDashboardData,
  type ContentManagementDashboardData,
  type ContentManagementRow,
} from "@/modules/admin/domain/data/contentManagementData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/presentation/components/ui/card";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

const PAGE_SIZE = 10;

interface ContentManagementRouteConfig {
  ADD: string;
  VIEW: (fileId: string) => string;
  EDIT: (fileId: string) => string;
}

interface ContentManagementDashboardProps {
  routeConfig?: ContentManagementRouteConfig;
}

export function ContentManagementDashboard({
  routeConfig = ROUTES.ADMIN.CONTENT_MANAGEMENT,
}: ContentManagementDashboardProps) {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [data, setData] = useState<ContentManagementDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ContentManagementRow[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [fileType, setFileType] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const result = await getContentManagementDashboardData();
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

  const filteredRows = useMemo(() => {
    const text = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (subject !== "all" && row.subjectName !== t(`contentManagement.filters.subject.${subject}`)) {
        return false;
      }
      if (grade !== "all") {
        // Keep API shape; grade-specific filtering will use real row.grade value once backend is wired.
      }
      if (fileType !== "all" && row.fileTypeId !== fileType) {
        return false;
      }
      if (!text) return true;
      return (
        row.fileTitle.toLowerCase().includes(text) ||
        row.teacherName.toLowerCase().includes(text) ||
        row.courseName.toLowerCase().includes(text)
      );
    });
  }, [rows, search, subject, grade, fileType, t]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
  );

  const tableColumns = useMemo<Array<DashboardDataTableColumn<ContentManagementRow>>>(
    () => [
      {
        id: "fileName",
        header: t("contentManagement.table.columns.fileName"),
        renderCell: (row) => (
          <div className="space-y-1 text-right">
            <p className="font-semibold text-slate-800">{row.fileTitle}</p>
            <p className="text-xs text-slate-400">
              {row.extensionLabel} • {row.sizeLabel}
            </p>
          </div>
        ),
      },
      {
        id: "course",
        header: t("contentManagement.table.columns.course"),
        renderCell: (row) => row.courseName,
      },
      {
        id: "teacher",
        header: t("contentManagement.table.columns.teacher"),
        renderCell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <span>{row.teacherName}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DBEEF6] text-xs font-bold text-[#255E8A]">
              {row.teacherAvatarInitials}
            </div>
          </div>
        ),
      },
      {
        id: "policy",
        header: t("contentManagement.table.columns.policy"),
        renderCell: (row) => (
          <DashboardBadge tone={row.policyLabelKey.includes("subscribers") ? "warning" : "success"}>
            {t(row.policyLabelKey)}
          </DashboardBadge>
        ),
      },
      {
        id: "downloads",
        header: t("contentManagement.table.columns.downloads"),
        cellClassName: "font-semibold",
        renderCell: (row) => row.downloadsCount.toLocaleString(),
      },
      {
        id: "status",
        header: t("contentManagement.table.columns.status"),
        renderCell: (row) => (
          <StatusSwitch
            checked={row.active}
            onChange={(checked) => handleToggleActive(row.id, checked)}
            activeLabel={t("contentManagement.table.status.active")}
            inactiveLabel={t("contentManagement.table.status.inactive")}
            activeClassName="bg-emerald-500"
          />
        ),
      },
    ],
    [t],
  );

  const handleToggleActive = (id: string, checked: boolean) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, active: checked } : row)));
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("contentManagement.page.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("tabs.contentManagement.title") },
        ]} />
        <DashboardPageHeader
        title={t("contentManagement.page.title")}
        description={t("contentManagement.page.description")}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => router.push(routeConfig.ADD)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("contentManagement.page.addFile")}
          </Button>
        }
      />
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
        title={t("contentManagement.table.title")}
        actions={
          <div className="grid w-full gap-3 md:grid-cols-4">
            <FilterSelect
              label={t("contentManagement.filters.subject.label")}
              value={subject}
              onChange={setSubject}
              options={data.filters.subjects.map((item) => ({
                value: item.id,
                label: t(item.labelKey),
              }))}
            />
            <FilterSelect
              label={t("contentManagement.filters.grade.label")}
              value={grade}
              onChange={setGrade}
              options={data.filters.grades.map((item) => ({
                value: item.id,
                label: t(item.labelKey),
              }))}
            />
            <FilterSelect
              label={t("contentManagement.filters.fileType.label")}
              value={fileType}
              onChange={setFileType}
              options={data.filters.fileTypes.map((item) => ({
                value: item.id,
                label: t(item.labelKey),
              }))}
            />
            <label className="space-y-2 text-right">
              <span className="text-xs font-medium text-slate-500">
                {t("contentManagement.filters.search.label")}
              </span>
              <div className="relative">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("contentManagement.filters.search.placeholder")}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-10 text-right text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[var(--dashboard-gold)]/25"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>
          </div>
        }
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("contentManagement.table.pagination.summary", {
                visible: pageRows.length,
                total: filteredRows.length,
              })}
            </p>
            <DashboardPagination
              pages={Array.from({ length: pageCount }, (_, i) => i + 1)}
              currentPage={currentPage}
              previousLabel={t("contentManagement.table.pagination.previous")}
              nextLabel={t("contentManagement.table.pagination.next")}
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
          onRowClick={(row) => router.push(routeConfig.VIEW(row.id))}
          rowClassName="hover:bg-slate-50/80"
          actionsHeader={t("contentManagement.table.columns.actions")}
          renderActions={(row) => (
            <div className="flex items-center gap-2">
              <IconActionButton
                label={t("contentManagement.table.actions.view")}
                onClick={() => router.push(routeConfig.VIEW(row.id))}
              >
                <Eye className="h-4 w-4" />
              </IconActionButton>
              <IconActionButton
                label={t("contentManagement.table.actions.edit")}
                onClick={() => router.push(routeConfig.EDIT(row.id))}
              >
                <Pencil className="h-4 w-4" />
              </IconActionButton>
              <IconActionButton
                label={t("contentManagement.table.actions.delete")}
                danger
                onClick={() => router.push(routeConfig.VIEW(row.id))}
              >
                <Trash2 className="h-4 w-4" />
              </IconActionButton>
            </div>
          )}
        />
      </DashboardTableCard>

      <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <CardHeader className="border-b border-slate-100 p-6">
          <CardTitle className="text-right text-2xl font-bold text-slate-800">
            {t("contentManagement.activity.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {data.activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
            >
              <button
                type="button"
                className="text-sm font-semibold text-[var(--dashboard-primary)] hover:underline"
              >
                {t(item.actionLabelKey)}
              </button>
              <div className="text-right">
                <p className="font-semibold text-slate-700">{t(item.titleKey)}</p>
                <p className="text-xs text-slate-400">{t(item.detailKey)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <label className="space-y-2 text-right">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-right text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[var(--dashboard-gold)]/25"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

interface IconActionButtonProps {
  children: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

function IconActionButton({ children, label, danger = false, onClick }: IconActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        danger
          ? "border-red-100 text-[#FF4B4B] hover:bg-red-50"
          : "border-slate-200 text-slate-500 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
