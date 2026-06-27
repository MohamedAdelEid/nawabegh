"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Radio, Star, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getSubjectsPage, type SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import { useTeacherEndLiveSession } from "@/modules/teacher/application/hooks/useTeacherEndLiveSession";
import { useTeacherLiveSessions } from "@/modules/teacher/application/hooks/useTeacherLiveSessions";
import { getTeacherLiveSessionEditHref } from "@/modules/teacher/infrastructure/api/teacherLiveSessionsApi";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardDataTable } from "@/shared/presentation/components/dashboard/DashboardDataTable";
import { DashboardTableCard } from "@/shared/presentation/components/dashboard/DashboardTableCard";
import { DashboardPagination } from "@/shared/presentation/components/dashboard/DashboardPagination";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { TeacherLiveSessionsDashboardSkeleton } from "@/modules/teacher/presentation/components/live-sessions/TeacherLiveSessionsDashboardSkeleton";
import type {
  TeacherLiveSessionRow,
  TeacherLiveSessionStatus,
} from "@/modules/teacher/domain/types/teacher.types";

const statIcons = {
  totalStreaming: Radio,
  liveAttendance: Users,
  sessionsRating: Star,
} as const;

const statusTone = {
  live: "danger",
  upcoming: "gold",
  ended: "neutral",
  recorded: "success",
} as const;

const SEARCH_DEBOUNCE_MS = 350;

export function TeacherLiveSessionsDashboard({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations("teacher.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [subjectId, setSubjectId] = useState("all");
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<DashboardFilterOption<string>[]>([
    { id: "all", label: "" },
  ]);
  const [status, setStatus] = useState<"all" | TeacherLiveSessionStatus>("all");
  const [page, setPage] = useState(1);
  const [endTarget, setEndTarget] = useState<TeacherLiveSessionRow | null>(null);
  const endMutation = useTeacherEndLiveSession();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    let alive = true;

    const loadSubjects = async () => {
      try {
        const result = await getSubjectsPage({ pageNumber: 1, pageSize: 240 });
        if (!alive) return;

        const rows = result.data?.rows ?? [];
        setSubjects(rows);
        setSubjectOptions([
          { id: "all", label: t("liveSessions.filters.allSubjects") },
          ...rows.map((subject) => ({
            id: String(subject.id),
            label:
              (locale.startsWith("ar") ? subject.nameAr : subject.nameEn) ||
              subject.nameAr ||
              subject.nameEn,
          })),
        ]);
      } catch {
        if (!alive) return;
        setSubjects([]);
        setSubjectOptions([{ id: "all", label: t("liveSessions.filters.allSubjects") }]);
      }
    };

    void loadSubjects();
    return () => {
      alive = false;
    };
  }, [locale, t]);

  const subjectFilter = useMemo(() => {
    if (subjectId === "all") return undefined;
    const subject = subjects.find((item) => String(item.id) === subjectId);
    return subject?.nameAr?.trim() || undefined;
  }, [subjectId, subjects]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, subjectId, status]);

  const { data, isPending, isFetching, isError } = useTeacherLiveSessions({
    keyword: debouncedQuery,
    subject: subjectFilter,
    status,
    page,
    pageSize: 10,
  });

  const isInitialLoading = isPending && !data;
  const pages = useMemo(
    () =>
      data
        ? Array.from({ length: Math.max(data.pagination.totalPages, 1) }, (_, index) => index + 1)
        : [1],
    [data],
  );

  const statusOptions = useMemo(
    () =>
      (["all", "live", "upcoming", "ended", "recorded"] as const).map((option) => ({
        id: option,
        label: t(`liveSessions.filters.status.${option}`),
      })),
    [t],
  );

  const isTableRefetching = isFetching && !isPending;

  const confirmEndSession = async () => {
    if (!endTarget) return;
    try {
      await endMutation.mutateAsync(endTarget.id);
      notify.success(t("liveSessions.endModal.success"));
      setEndTarget(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.error"));
    }
  };

  if (isInitialLoading) {
    return (
      <TeacherLiveSessionsDashboardSkeleton
        label={t("common.loading")}
        withHeader={!embedded}
      />
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { pagination } = data;
  const from = pagination.totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  return (
    <div className="space-y-6">
      {!embedded ? (
        <DashboardPageHeader
          title={t("liveSessions.title")}
          description={t("liveSessions.description")}
        />
      ) : null}

      <DashboardFiltersPanel isLoading={isTableRefetching}>
        <DashboardFilterSelect
          label={t("liveSessions.filters.statusLabel")}
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={statusOptions}
        />
        
        <DashboardFilterSelect
          label={t("liveSessions.filters.subjectLabel")}
          value={subjectId}
          onChange={setSubjectId}
          options={subjectOptions}
        />
     <DashboardSearchFilter
          label={t("liveSessions.filters.searchLabel")}
          value={query}
          onChange={setQuery}
          placeholder={t("liveSessions.filters.searchPlaceholder")}
        />
      </DashboardFiltersPanel>

      <div className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Radio;
          let value = stat.value;
          if (stat.id === "totalStreaming") {
            value = `${stat.value} ${t("liveSessions.stats.hoursSuffix")}`;
          } else if (stat.id === "liveAttendance") {
            value = `${stat.value} ${t("liveSessions.stats.studentsSuffix")}`;
          }
          return (
            <DashboardStatCard key={stat.id} label={t(stat.labelKey)} value={value} icon={Icon} />
          );
        })}
      </div>

      <DashboardTableCard className={isTableRefetching ? "opacity-60 transition-opacity" : undefined}>
        <DashboardDataTable<TeacherLiveSessionRow>
          rows={data.sessions}
          getRowKey={(row) => row.id}
          emptyMessage={t("liveSessions.table.empty")}
          onRowClick={(row) => router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(row.id))}
          columns={[
            {
              id: "statusIcon",
              header: "",
              headerClassName: "w-12",
              renderCell: (row) =>
                row.status === "live" ? (
                  <Radio className="h-5 w-5 text-red-500" />
                ) : (
                  <span className="inline-block h-5 w-5" />
                ),
            },
            {
              id: "title",
              header: t("liveSessions.table.sessionName"),
              renderCell: (row) => (
                <span className="font-semibold text-slate-800">{row.title}</span>
              ),
            },
            {
              id: "subject",
              header: t("liveSessions.table.subject"),
              renderCell: (row) => row.subject,
            },
            {
              id: "lecturer",
              header: t("liveSessions.table.lecturer"),
              renderCell: (row) => row.lecturer,
            },
            {
              id: "dateTime",
              header: t("liveSessions.table.dateTime"),
              renderCell: (row) => row.dateTimeLabel,
            },
            {
              id: "duration",
              header: t("liveSessions.table.duration"),
              renderCell: (row) => row.durationLabel,
            },
            {
              id: "status",
              header: t("liveSessions.table.status"),
              renderCell: (row) => (
                <DashboardBadge tone={statusTone[row.status]}>
                  {t(`liveSessions.status.${row.status}`)}
                </DashboardBadge>
              ),
            },
          ]}
          actionsHeader={t("liveSessions.table.actions")}
          renderActions={(row) => {
            const editHref = getTeacherLiveSessionEditHref(row);
            const canEnd = row.status === "live" || row.status === "upcoming";

            return (
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t("liveSessions.table.view")}
                  asChild
                >
                  <Link href={ROUTES.USER.TEACHER.SESSION_DETAILS(row.id)}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {editHref ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("liveSessions.table.edit")}
                    asChild
                  >
                    <Link href={editHref}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("liveSessions.table.edit")}
                    disabled
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canEnd ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    aria-label={t("liveSessions.table.end")}
                    disabled={endMutation.isPending}
                    onClick={(event) => {
                      event.stopPropagation();
                      setEndTarget(row);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            );
          }}
        />
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {t("liveSessions.pagination.showing", {
              from,
              to,
              total: pagination.totalItems,
            })}
          </p>
          <DashboardPagination
            pages={pages}
            currentPage={pagination.currentPage}
            onPageChange={setPage}
            previousLabel={t("liveSessions.pagination.previous")}
            nextLabel={t("liveSessions.pagination.next")}
          />
        </div>
        {isFetching && !isPending ? (
          <p className="px-6 pb-4 text-xs text-slate-400">{t("common.loading")}</p>
        ) : null}
      </DashboardTableCard>

      <ContentFileDeleteModal
        open={Boolean(endTarget)}
        onOpenChange={(open) => {
          if (!open) setEndTarget(null);
        }}
        title={t("liveSessions.endModal.title")}
        description={t("liveSessions.endModal.description", {
          title: endTarget?.title ?? "",
        })}
        confirmLabel={t("liveSessions.endModal.confirm")}
        cancelLabel={t("liveSessions.endModal.cancel")}
        onConfirm={() => void confirmEndSession()}
      />
    </div>
  );
}
