"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type { CourseCardModel } from "@/shared/domain/types/course.types";
import type { DashboardViewMode } from "@/shared/presentation/components/dashboard";
import { CourseCard } from "./CourseCard";
import { FeaturedCourseCard } from "./FeaturedCourseCard";
import { ExploreCoursesGridSkeleton } from "./ExploreCoursesSkeleton";

type ExploreCoursesGridProps = {
  courses: CourseCardModel[];
  viewMode: DashboardViewMode;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
};

export function ExploreCoursesGrid({
  courses,
  viewMode,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
}: ExploreCoursesGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { featured, regular } = useMemo(() => {
    const bestSeller = courses.find((course) => course.isBestSeller);
    if (!bestSeller) {
      return { featured: null, regular: courses };
    }
    return {
      featured: bestSeller,
      regular: courses.filter((course) => course.id !== bestSeller.id),
    };
  }, [courses]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <ExploreCoursesGridSkeleton />;
  }

  return (
    <>
      <motion.div
        layout
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-6"
        }
      >
        {featured ? <FeaturedCourseCard course={featured} /> : null}
        {regular.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index + (featured ? 1 : 0)}
            layout={viewMode === "list" ? "list" : "grid"}
          />
        ))}
      </motion.div>
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
      {isFetchingNextPage ? (
        <div className="pt-6">
          <ExploreCoursesGridSkeleton />
        </div>
      ) : null}
    </>
  );
}
