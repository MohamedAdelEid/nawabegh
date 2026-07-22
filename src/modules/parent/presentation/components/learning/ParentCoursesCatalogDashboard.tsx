"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentCoursesCatalog } from "@/modules/parent/application/hooks/useParentLearning";
import type { ParentCatalogCourseItem } from "@/modules/parent/domain/types/parentLearning.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

function formatPrice(
  originalPrice: number | null,
  discountedPrice: number | null,
  currency: string,
  freeLabel: string,
) {
  const price = discountedPrice ?? originalPrice;
  if (price == null || price <= 0) return freeLabel;
  if (discountedPrice != null && originalPrice != null && discountedPrice < originalPrice) {
    return `${discountedPrice} ${currency}`;
  }
  return `${price} ${currency}`;
}

function CatalogCard({
  course,
  studentUserId,
}: {
  course: ParentCatalogCourseItem;
  studentUserId: string | null;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const coverUrl = resolveFileUrl(course.coverImageUrl);
  const priceLabel = formatPrice(
    course.originalPrice,
    course.discountedPrice,
    course.currency,
    t("catalogFree"),
  );
  const subscribeHref = studentUserId
    ? `${ROUTES.USER.PARENT.COURSE_CHECKOUT(course.courseId)}?studentUserId=${encodeURIComponent(studentUserId)}`
    : ROUTES.USER.PARENT.COURSE_DETAIL(course.courseId);
  const detailHref = studentUserId
    ? `${ROUTES.USER.PARENT.COURSE_DETAIL(course.courseId)}?studentUserId=${encodeURIComponent(studentUserId)}`
    : ROUTES.USER.PARENT.COURSE_DETAIL(course.courseId);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
      <div className="relative h-32 w-full shrink-0 bg-[#eef4ff]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={course.title} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <BookOpen className="size-10 text-[#1e88e5]" aria-hidden />
          </div>
        )}
        {course.subjectNameAr ? (
          <span className="absolute end-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2b415e] shadow-sm">
            {course.subjectNameAr}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 text-start">
        <Link href={detailHref} className="hover:underline">
          <h3 className="line-clamp-2 text-base font-bold text-[#2b415e]">{course.title}</h3>
        </Link>
        <p className="text-xs text-[#64748b]">
          {[course.gradeNameAr, course.instructorName].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-[#eef2f6] pt-4">
          <span className="text-lg font-bold text-[#2b415e]">{priceLabel}</span>
          {course.isEnrolledForChild ? (
            <Link
              href={detailHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#dcf4cb] px-3 py-1.5 text-xs font-bold text-[#46a302]"
            >
              <CheckCircle2 className="size-3.5" aria-hidden />
              {course.actionLabelAr || t("details")}
            </Link>
          ) : (
            <Button
              asChild
              className="h-9 rounded-lg bg-[#c7af6d] px-4 text-xs font-bold text-white hover:bg-[#b89f5d]"
            >
              <Link href={subscribeHref}>{t("enrollNow")}</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ParentCoursesCatalogDashboard() {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const searchParams = useSearchParams();
  const studentUserId = searchParams.get("studentUserId");
  const [keyword, setKeyword] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const query = useMemo(
    () => ({
      studentUserId: studentUserId ?? undefined,
      keyword: keyword.trim() || undefined,
      pageNumber,
      pageSize: 12,
    }),
    [studentUserId, keyword, pageNumber],
  );

  const catalogQuery = useParentCoursesCatalog(query);

  if (catalogQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-16 w-96" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-[20px]" />
          ))}
        </div>
      </div>
    );
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => catalogQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const { items, hasNextPage } = catalogQuery.data;

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="text-end">
        <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{t("catalogTitle")}</h1>
        <p className="mt-1 text-sm text-[#64748b]">{t("catalogSubtitle")}</p>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={keyword}
          onChange={(event) => {
            setPageNumber(1);
            setKeyword(event.target.value);
          }}
          placeholder={t("catalogSearchPlaceholder")}
          className="h-11 rounded-xl border-[#e2e8f0] ps-10"
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-[#64748b] shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          {t("catalogEmpty")}
        </p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((course) => (
            <CatalogCard key={course.courseId} course={course} studentUserId={studentUserId} />
          ))}
        </section>
      )}

      {items.length > 0 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={pageNumber <= 1 || catalogQuery.isFetching}
            onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
          >
            ‹
          </Button>
          <span className="text-sm text-slate-500">{pageNumber}</span>
          <Button
            type="button"
            variant="outline"
            disabled={!hasNextPage || catalogQuery.isFetching}
            onClick={() => setPageNumber((value) => value + 1)}
          >
            ›
          </Button>
        </div>
      ) : null}
    </div>
  );
}
