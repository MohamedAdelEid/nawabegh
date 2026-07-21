"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { studentChatQueryKeys } from "@/modules/student/application/constants/studentChatQueryKeys";
import type { StudentChatListFilter } from "@/modules/student/domain/chat-groups/student-chat.types";
import { fetchStudentChatGroups } from "@/modules/student/infrastructure/api/studentChat.api";

export function useStudentChatGroups() {
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StudentChatListFilter>("all");

  const query = useQuery({
    queryKey: studentChatQueryKeys.groups(locale),
    queryFn: () => fetchStudentChatGroups(locale),
    staleTime: 30_000,
  });

  const groups = useMemo(() => {
    const rows = query.data ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((group) => {
      if (filter === "active" && !group.isActiveEnrollment) return false;
      if (!normalizedSearch) return true;
      return (
        group.groupName.toLowerCase().includes(normalizedSearch) ||
        group.instructorName.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [query.data, search, filter]);

  return {
    query,
    groups,
    search,
    setSearch,
    filter,
    setFilter,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
