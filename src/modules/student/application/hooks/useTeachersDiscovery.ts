"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Subject } from "@/shared/domain/types/subject.types";
import type { Teacher, TeachersPage } from "@/shared/domain/types/teacher.types";
import { getSubjects } from "@/shared/infrastructure/api/subject.api";
import { getTeachersPage } from "@/shared/infrastructure/api/teacher.api";
import {
  TEACHERS_DISCOVERY_PAGE_SIZE,
  teachersDiscoveryQueryKeys,
  type TeachersDiscoveryFilterSnapshot,
} from "@/modules/student/application/constants/teachersDiscoveryQueryKeys";

const SEARCH_DEBOUNCE_MS = 300;

export type TeachersDiscoverySort = "topRated";

export type TeachersDiscoveryInitialData = {
  subjects: Subject[];
  teachersPage: TeachersPage;
};

type UseTeachersDiscoveryOptions = {
  initial?: TeachersDiscoveryInitialData;
};

function parseSubjectId(value: string | null): number | null {
  if (!value || value === "all") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePageNumber(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function sortTeachersByRating(teachers: Teacher[]): Teacher[] {
  return [...teachers].sort((left, right) => right.rating - left.rating);
}

export function useTeachersDiscovery({ initial }: UseTeachersDiscoveryOptions = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword.trim());
  const [subjectId, setSubjectId] = useState<number | null>(
    parseSubjectId(searchParams.get("subject")),
  );
  const [pageNumber, setPageNumber] = useState(parsePageNumber(searchParams.get("page")));
  const [sort, setSort] = useState<TeachersDiscoverySort>("topRated");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedKeyword) params.set("q", debouncedKeyword);
    else params.delete("q");
    if (subjectId != null) params.set("subject", String(subjectId));
    else params.delete("subject");
    if (pageNumber > 1) params.set("page", String(pageNumber));
    else params.delete("page");

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [debouncedKeyword, subjectId, pageNumber, pathname, router, searchParams]);

  const subjectsQuery = useQuery({
    queryKey: teachersDiscoveryQueryKeys.subjects(locale),
    queryFn: () => getSubjects({ pageNumber: 1, pageSize: 50 }),
    initialData: initial?.subjects,
    staleTime: 60_000,
  });

  const filterSnapshot = useMemo<TeachersDiscoveryFilterSnapshot>(
    () => ({
      keyword: debouncedKeyword || undefined,
      subjectId: subjectId ?? undefined,
      pageNumber,
    }),
    [debouncedKeyword, subjectId, pageNumber],
  );

  const teachersQuery = useQuery({
    queryKey: teachersDiscoveryQueryKeys.teachers(locale, filterSnapshot),
    queryFn: () =>
      getTeachersPage({
        pageNumber,
        pageSize: TEACHERS_DISCOVERY_PAGE_SIZE,
        keyword: debouncedKeyword || undefined,
        ...(subjectId != null ? { subjectId } : {}),
      }),
    initialData:
      pageNumber === 1 &&
      subjectId == null &&
      !debouncedKeyword &&
      initial?.teachersPage
        ? initial.teachersPage
        : undefined,
    staleTime: 30_000,
  });

  const subjects = useMemo(
    () => (subjectsQuery.data ?? []).filter((subject) => subject.teachersCount > 0),
    [subjectsQuery.data],
  );

  const teachers = useMemo(() => {
    const rows = teachersQuery.data?.rows ?? [];
    return sort === "topRated" ? sortTeachersByRating(rows) : rows;
  }, [sort, teachersQuery.data?.rows]);

  const totalPages = teachersQuery.data?.totalPages ?? 1;

  const handleSubjectChange = (nextSubjectId: number | null) => {
    setSubjectId(nextSubjectId);
    setPageNumber(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPageNumber(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    keyword,
    setKeyword,
    subjectId,
    setSubjectId: handleSubjectChange,
    pageNumber,
    setPageNumber: handlePageChange,
    sort,
    setSort,
    subjects,
    subjectsQuery,
    teachers,
    teachersQuery,
    totalPages,
    currentPage: teachersQuery.data?.currentPage ?? pageNumber,
  };
}
