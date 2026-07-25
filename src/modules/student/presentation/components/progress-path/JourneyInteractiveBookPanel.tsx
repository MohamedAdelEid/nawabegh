"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { getInteractiveBookByCourseId } from "@/modules/admin/infrastructure/api/interactiveBooksApi";
import { resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type JourneyInteractiveBookPanelProps = {
  courseId: string;
  courseTitle?: string;
};

function isInteractiveBookUnavailable(status: string | undefined, errorMessage: string | undefined) {
  if (status === "Forbidden" || status === "NotFound") return true;
  return /forbidden|not\s*found|403|404/i.test(errorMessage ?? "");
}

export function JourneyInteractiveBookPanel({
  courseId,
  courseTitle,
}: JourneyInteractiveBookPanelProps) {
  const t = useTranslations("student.dashboard.progressPath.surfaces.interactiveBook");

  const bookQuery = useQuery({
    queryKey: ["student-interactive-book", courseId],
    queryFn: async () => {
      const result = await getInteractiveBookByCourseId(courseId);
      if (result.data) return result.data;

      if (isInteractiveBookUnavailable(String(result.status), result.errorMessage)) {
        return null;
      }

      throw new Error(result.errorMessage || t("loadError"));
    },
    enabled: Boolean(courseId),
    staleTime: 60_000,
    retry: false,
  });

  if (bookQuery.isLoading) {
    return (
      <div className="space-y-4 px-4 py-6 md:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[70vh] w-full rounded-2xl" />
      </div>
    );
  }

  if (bookQuery.isError) {
    return (
      <div className="space-y-4 px-4 py-6 md:px-6">
        <ApiFailureAlert
          message={bookQuery.error instanceof Error ? bookQuery.error.message : null}
          fallbackMessage={t("loadError")}
        />
        <Button type="button" variant="outline" onClick={() => void bookQuery.refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!bookQuery.data) {
    return (
      <div className="px-4 py-10 md:px-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(44,66,96,0.08)] text-[#2b415e]">
            <BookOpen className="size-7" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#0f172a]">{t("unavailableTitle")}</p>
            <p className="text-sm text-[#64748b]">{t("notFound")}</p>
          </div>
        </div>
      </div>
    );
  }

  const book = bookQuery.data;
  const pdfUrl = resolveProtectedFileUrl(book.pdfUrl);

  return (
    <div className="space-y-4 px-4 py-6 md:px-6">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(44,66,96,0.1)] text-[#2b415e]">
          <BookOpen className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 text-start">
          <h2 className="text-xl font-bold text-[#0f172a]">{book.title || t("title")}</h2>
          <p className="text-sm text-[#64748b]">
            {courseTitle ? t("forCourse", { course: courseTitle }) : t("subtitle")}
          </p>
        </div>
      </div>

      {pdfUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <iframe
            title={book.title || t("title")}
            src={pdfUrl}
            className="h-[70vh] w-full"
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center text-[#64748b]">
          {t("noPdf")}
        </p>
      )}
    </div>
  );
}
