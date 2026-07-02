"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type { ChatGroupStatistics } from "@/modules/admin/infrastructure/api/chatGroupsApi";
import { mapChatGroupListItemToRow } from "@/modules/admin/domain/utils/chatGroupMappers";
import type { ChatGroupRow } from "@/modules/admin/domain/types/chatGroups.types";
import { keepPreviousTableData } from "@/shared/application/lib/tableQueryState";
import {
  getTeacherChatGroupsPage,
  getTeacherChatGroupsStatistics,
} from "@/modules/teacher/infrastructure/api/teacherChatGroupsApi";

const DEFAULT_PAGE_SIZE = 10;

export type TeacherChatGroupsFilterState = {
  status: "all" | "active" | "locked" | "activeNow";
  gradeId: string;
  subjectId: string;
  keyword: string;
};

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

function mapStatusToApi(status: TeacherChatGroupsFilterState["status"]): string | undefined {
  if (status === "all") return undefined;
  return status;
}

export function useTeacherChatGroups(
  filters: TeacherChatGroupsFilterState,
  pageNumber: number,
) {
  const locale = useLocale();
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword.trim());

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim());
    }, 320);
    return () => window.clearTimeout(handle);
  }, [filters.keyword]);

  const subjectIdParam =
    filters.subjectId !== "all" ? Number(filters.subjectId) : undefined;
  const gradeIdParam = filters.gradeId !== "all" ? Number(filters.gradeId) : undefined;

  const listQuery = useQuery({
    queryKey: [
      "teacher-chat-groups",
      locale,
      pageNumber,
      DEFAULT_PAGE_SIZE,
      debouncedKeyword,
      filters.status,
      subjectIdParam,
      gradeIdParam,
    ],
    queryFn: () =>
      getTeacherChatGroupsPage({
        pageNumber,
        pageSize: DEFAULT_PAGE_SIZE,
        keyword: debouncedKeyword || undefined,
        status: mapStatusToApi(filters.status),
        subjectId:
          subjectIdParam !== undefined && !Number.isNaN(subjectIdParam)
            ? subjectIdParam
            : undefined,
        gradeId:
          gradeIdParam !== undefined && !Number.isNaN(gradeIdParam) ? gradeIdParam : undefined,
      }),
    placeholderData: keepPreviousTableData,
  });

  const statsQuery = useQuery({
    queryKey: ["teacher-chat-groups-statistics", locale],
    queryFn: getTeacherChatGroupsStatistics,
  });

  const page = listQuery.data?.data ?? null;

  const rows: ChatGroupRow[] = useMemo(
    () =>
      (page?.rows ?? []).map((item) =>
        mapChatGroupListItemToRow(item, formatLastActivity(item.lastActivityAt, locale)),
      ),
    [locale, page?.rows],
  );

  return {
    rows,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    listQuery,
    statsQuery,
    statistics: statsQuery.data?.data ?? null,
  };
}

export function formatChatGroupStatValue(
  statId: string,
  statistics: ChatGroupStatistics | null,
  locale: string,
  fallback: string,
): string {
  if (!statistics) return fallback;

  const formatter = new Intl.NumberFormat(locale);

  switch (statId) {
    case "totalGroups":
      return formatter.format(statistics.totalGroupsCount);
    case "activeMessages":
      return formatter.format(statistics.dailyMessagesCount);
    case "interactionRate":
      return `${formatter.format(statistics.interactionPercentage)}%`;
    case "activeNow":
      return formatter.format(statistics.currentlyActiveGroupsCount);
    default:
      return fallback;
  }
}
