"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DashboardFilterSelect,
  DashboardSearchFilter,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import { getCoursesPage } from "@/modules/admin/infrastructure/api/courseApi";
import { fetchTeacherMyCoursesOptions } from "@/modules/teacher/infrastructure/api/teacherCoursesApi";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { useScopedDashboardTranslations } from "@/shared/application/hooks/useScopedDashboardTranslations";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";

export type InteractiveBooksApiFilterState = {
  courseId: string;
  gradeId: string;
  status: "all" | "0" | "1";
  hasHotspots: "all" | "true" | "false";
  fromDate: string;
  toDate: string;
  keyword: string;
  pageNumber: string;
  pageSize: string;
  acceptLanguage: string;
};

const statusOptions: Array<DashboardFilterOption<InteractiveBooksApiFilterState["status"]>> = [
  { id: "all", label: "--" },
  { id: "0", label: "Draft" },
  { id: "1", label: "Published" },
];

const hotspotsOptions: Array<DashboardFilterOption<InteractiveBooksApiFilterState["hasHotspots"]>> = [
  { id: "all", label: "--" },
  { id: "true", label: "Yes" },
  { id: "false", label: "No" },
];

const languageOptions: Array<DashboardFilterOption<string>> = [
  { id: "ar", label: "ar" },
  { id: "en", label: "en" },
];

type InteractiveBooksFilterBarProps = {
  value: InteractiveBooksApiFilterState;
  onChange: (next: InteractiveBooksApiFilterState) => void;
};

function FilterInput({
  id,
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: "text" | "number" | "date";
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border-slate-100 bg-white text-right text-base"
      />
    </div>
  );
}

export function InteractiveBooksFilterBar({ value, onChange }: InteractiveBooksFilterBarProps) {
  const t = useScopedDashboardTranslations();
  const routes = useScopedDashboardRoutes();
  const isTeacherScope = routes.scope === "teacher";
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [coursesLoadState, setCoursesLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    let alive = true;
    (async () => {
      setCoursesLoadState("loading");
      try {
        if (isTeacherScope) {
          const teacherCourses = await fetchTeacherMyCoursesOptions({ pageSize: 240 });
          if (!alive) return;
          setCourses(
            teacherCourses.map((course) => ({
              id: course.courseId,
              title: [course.title, course.subject, course.gradeNameAr].filter(Boolean).join(" · "),
            })),
          );
          setCoursesLoadState("success");
          return;
        }

        const result = await getCoursesPage({ pageNumber: 1, pageSize: 240 });
        if (!alive) return;
        if (result.errorMessage || !result.data) {
          setCourses([]);
          setCoursesLoadState("error");
          return;
        }
        setCourses(
          result.data.rows.map((course) => ({
            id: course.id,
            title: course.title,
          })),
        );
        setCoursesLoadState("success");
      } catch {
        if (!alive) return;
        setCourses([]);
        setCoursesLoadState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [isTeacherScope]);

  const courseOptions = useMemo<Array<DashboardFilterOption<string>>>(() => {
    const placeholder = {
      id: "",
      label: t("interactiveBooks.filterBar.fields.courseId.placeholder"),
    };
    if (coursesLoadState === "loading") {
      return [{ id: "__loading__", label: t("interactiveBooks.filterBar.fields.courseId.loading") }];
    }
    if (coursesLoadState === "error") {
      return [{ id: "", label: t("interactiveBooks.filterBar.fields.courseId.loadError") }];
    }
    if (courses.length === 0) {
      return [placeholder];
    }
    return [
      placeholder,
      ...courses.map((course) => ({
        id: course.id,
        label: course.title,
      })),
    ];
  }, [courses, coursesLoadState, t]);

  return (
    <section
      className="rounded-[1.75rem] border border-white/80 bg-white p-5"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardFilterSelect
          label={t("interactiveBooks.filterBar.fields.courseId.label")}
          value={value.courseId}
          options={courseOptions}
          onChange={(courseId) => onChange({ ...value, courseId })}
          disabled={coursesLoadState === "loading"}
        />
        <DashboardFilterSelect
          label={t("interactiveBooks.filterBar.fields.status.label")}
          value={value.status}
          options={statusOptions.map((option) => ({
            ...option,
            label:
              option.id === "0"
                ? t("interactiveBooks.table.status.draft")
                : option.id === "1"
                  ? t("interactiveBooks.table.status.published")
                  : option.label,
          }))}
          onChange={(status) => onChange({ ...value, status })}
        />
        <DashboardFilterSelect
          label={t("interactiveBooks.filterBar.fields.hasHotspots.label")}
          value={value.hasHotspots}
          options={hotspotsOptions.map((option) => ({
            ...option,
            label:
              option.id === "true"
                ? t("interactiveBooks.filterBar.options.yes")
                : option.id === "false"
                  ? t("interactiveBooks.filterBar.options.no")
                  : option.label,
          }))}
          onChange={(hasHotspots) => onChange({ ...value, hasHotspots })}
        />
        {/* <FilterInput
          id="ib-filter-from-date"
          label={t("interactiveBooks.filterBar.fields.fromDate.label")}
          value={value.fromDate}
          placeholder={t("interactiveBooks.filterBar.fields.fromDate.placeholder")}
          type="date"
          onChange={(fromDate) => onChange({ ...value, fromDate })}
        />
        <FilterInput
          id="ib-filter-to-date"
          label={t("interactiveBooks.filterBar.fields.toDate.label")}
          value={value.toDate}
          placeholder={t("interactiveBooks.filterBar.fields.toDate.placeholder")}
          type="date"
          onChange={(toDate) => onChange({ ...value, toDate })}
        /> */}
        <DashboardSearchFilter
          label={t("interactiveBooks.filterBar.fields.keyword.label")}
          placeholder={t("interactiveBooks.filterBar.fields.keyword.placeholder")}
          value={value.keyword}
          onChange={(keyword) => onChange({ ...value, keyword })}
          className="flex-1 w-full" 
        />
      </div>
    </section>
  );
}
