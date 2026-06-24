"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";

export function useQuestionBankSubjects() {
  const locale = useLocale();

  return useQuery({
    queryKey: ["admin-question-bank-subjects", locale],
    queryFn: () => getSubjectsPage({ pageNumber: 1, pageSize: 240 }),
  });
}
