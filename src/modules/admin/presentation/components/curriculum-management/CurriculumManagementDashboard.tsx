"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEducationLevelsTable } from "@/modules/admin/application/hooks/useEducationLevelsTable";
import { useGradesTable } from "@/modules/admin/application/hooks/useGradesTable";
import { useSubjectsTable } from "@/modules/admin/application/hooks/useSubjectsTable";
import type { CurriculumManagementTab } from "@/modules/admin/domain/types/curriculumManagementFilters.types";
import {
  createEducationLevel,
  deleteEducationLevel,
  updateEducationLevel,
  type EducationLevelListItem,
} from "@/modules/admin/infrastructure/api/educationLevelsApi";
import {
  createGrade,
  deleteGrade,
  updateGrade,
  type GradeListItem,
} from "@/modules/admin/infrastructure/api/gradesApi";
import {
  createSubject,
  deleteSubject,
  updateSubject,
  type SubjectListItem,
} from "@/modules/admin/infrastructure/api/subjectApi";
import { CurriculumDeleteConfirmModal } from "./CurriculumDeleteConfirmModal";
import { CurriculumManagementAnimatedSection } from "./CurriculumManagementAnimatedSection";
import { CurriculumManagementDashboardSkeleton } from "./CurriculumManagementDashboardSkeleton";
import { CurriculumManagementFilterBar } from "./CurriculumManagementFilterBar";
import {
  EducationLevelFormModal,
  type EducationLevelFormValues,
} from "./EducationLevelFormModal";
import { GradeFormModal, type GradeFormValues } from "./GradeFormModal";
import { SubjectFormModal, type SubjectFormValues } from "./SubjectFormModal";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

type DeleteTarget =
  | { tab: "educationLevels"; row: EducationLevelListItem }
  | { tab: "grades"; row: GradeListItem }
  | { tab: "subjects"; row: SubjectListItem };

export function CurriculumManagementDashboard() {
  const t = useTranslations("admin.dashboard.curriculumManagement");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<CurriculumManagementTab>("educationLevels");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const educationLevelsTable = useEducationLevelsTable();
  const gradesTable = useGradesTable();
  const subjectsTable = useSubjectsTable();

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [educationLevelTarget, setEducationLevelTarget] = useState<EducationLevelListItem | null>(
    null,
  );
  const [gradeTarget, setGradeTarget] = useState<GradeListItem | null>(null);
  const [subjectTarget, setSubjectTarget] = useState<SubjectListItem | null>(null);
  const [educationLevelModalOpen, setEducationLevelModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeTable =
    activeTab === "educationLevels"
      ? educationLevelsTable
      : activeTab === "grades"
        ? gradesTable
        : subjectsTable;

  useEffect(() => {
    if (!hasLoadedOnce && !activeTable.isLoading && activeTable.page) {
      setHasLoadedOnce(true);
    }
  }, [activeTable.isLoading, activeTable.page, hasLoadedOnce]);

  const isInitialLoading = !hasLoadedOnce && activeTable.isLoading;

  const localizedName = (nameAr: string, nameEn: string) =>
    locale.startsWith("ar") ? nameAr || nameEn : nameEn || nameAr;

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const educationLevelColumns = useMemo<Array<DashboardDataTableColumn<EducationLevelListItem>>>(
    () => [
      {
        id: "name",
        header: t("educationLevels.table.columns.name"),
        renderCell: (row) => (
          <div className="space-y-0.5 text-start">
            <p className="font-semibold text-slate-800">{localizedName(row.nameAr, row.nameEn)}</p>
            <p className="text-xs text-slate-400">
              {row.nameAr} / {row.nameEn}
            </p>
          </div>
        ),
      },
      {
        id: "country",
        header: t("educationLevels.table.columns.country"),
        renderCell: (row) =>
          localizedName(row.countryNameAr, row.countryNameEn),
      },
      {
        id: "order",
        header: t("educationLevels.table.columns.order"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.order,
      },
      {
        id: "gradeCount",
        header: t("educationLevels.table.columns.gradeCount"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.gradeCount,
      },
    ],
    [localizedName, t],
  );

  const gradeColumns = useMemo<Array<DashboardDataTableColumn<GradeListItem>>>(
    () => [
      {
        id: "name",
        header: t("grades.table.columns.name"),
        renderCell: (row) => (
          <div className="space-y-0.5 text-start">
            <p className="font-semibold text-slate-800">{localizedName(row.nameAr, row.nameEn)}</p>
            <p className="text-xs text-slate-400">
              {row.nameAr} / {row.nameEn}
            </p>
          </div>
        ),
      },
      {
        id: "educationLevel",
        header: t("grades.table.columns.educationLevel"),
        renderCell: (row) =>
          localizedName(row.educationLevelNameAr, row.educationLevelNameEn),
      },
      {
        id: "country",
        header: t("grades.table.columns.country"),
        renderCell: (row) =>
          localizedName(row.countryNameAr, row.countryNameEn),
      },
      {
        id: "order",
        header: t("grades.table.columns.order"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.order,
      },
      {
        id: "studentCount",
        header: t("grades.table.columns.studentCount"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.studentCount,
      },
    ],
    [localizedName, t],
  );

  const subjectColumns = useMemo<Array<DashboardDataTableColumn<SubjectListItem>>>(
    () => [
      {
        id: "name",
        header: t("subjects.table.columns.name"),
        renderCell: (row) => (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {resolveFileUrl(row.iconUrl) ? (
                <Image
                  src={resolveFileUrl(row.iconUrl)!}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <BookOpen className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="space-y-0.5 text-start">
              <p className="font-semibold text-slate-800">{localizedName(row.nameAr, row.nameEn)}</p>
              <p className="text-xs text-slate-400">
                {row.nameAr} / {row.nameEn}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "coursesCount",
        header: t("subjects.table.columns.coursesCount"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.coursesCount,
      },
      {
        id: "teachersCount",
        header: t("subjects.table.columns.teachersCount"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.teachersCount,
      },
      {
        id: "createdAt",
        header: t("subjects.table.columns.createdAt"),
        cellClassName: "text-sm text-slate-500",
        renderCell: (row) => formatDate(row.createdAt),
      },
    ],
    [formatDate, localizedName, t],
  );

  const openCreateModal = () => {
    setFormMode("create");
    if (activeTab === "educationLevels") {
      setEducationLevelTarget(null);
      setEducationLevelModalOpen(true);
    } else if (activeTab === "grades") {
      setGradeTarget(null);
      setGradeModalOpen(true);
    } else {
      setSubjectTarget(null);
      setSubjectModalOpen(true);
    }
  };

  const handleEducationLevelSubmit = async (values: EducationLevelFormValues) => {
    setIsSaving(true);
    const payload = {
      countryId: Number(values.countryId),
      nameAr: values.nameAr.trim(),
      nameEn: values.nameEn.trim(),
      order: Number(values.order),
    };

    const result =
      formMode === "create"
        ? await createEducationLevel(payload)
        : await updateEducationLevel(educationLevelTarget!.id, {
            id: educationLevelTarget!.id,
            ...payload,
          });

    setIsSaving(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return false;
    }

    notify.success(result.message ?? t("educationLevels.form.success"));
    await educationLevelsTable.refetch();
    return true;
  };

  const handleGradeSubmit = async (values: GradeFormValues) => {
    setIsSaving(true);
    const payload = {
      educationLevelId: Number(values.educationLevelId),
      nameAr: values.nameAr.trim(),
      nameEn: values.nameEn.trim(),
      order: Number(values.order),
    };

    const result =
      formMode === "create"
        ? await createGrade(payload)
        : await updateGrade(gradeTarget!.id, {
            id: gradeTarget!.id,
            ...payload,
          });

    setIsSaving(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return false;
    }

    notify.success(result.message ?? t("grades.form.success"));
    await gradesTable.refetch();
    return true;
  };

  const handleSubjectSubmit = async (values: SubjectFormValues) => {
    setIsSaving(true);
    const payload = {
      nameAr: values.nameAr.trim(),
      nameEn: values.nameEn.trim(),
      iconUrl: values.iconUrl.trim(),
    };

    const result =
      formMode === "create"
        ? await createSubject(payload)
        : await updateSubject(subjectTarget!.id, {
            id: subjectTarget!.id,
            ...payload,
          });

    setIsSaving(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return false;
    }

    notify.success(result.message ?? t("subjects.form.success"));
    await subjectsTable.refetch();
    return true;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const result =
      deleteTarget.tab === "educationLevels"
        ? await deleteEducationLevel(deleteTarget.row.id)
        : deleteTarget.tab === "grades"
          ? await deleteGrade(deleteTarget.row.id)
          : await deleteSubject(deleteTarget.row.id);

    setIsDeleting(false);
    setDeleteTarget(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("deleteModal.success"));

    if (deleteTarget.tab === "educationLevels") await educationLevelsTable.refetch();
    else if (deleteTarget.tab === "grades") await gradesTable.refetch();
    else await subjectsTable.refetch();
  };

  const deleteItemName = deleteTarget
    ? localizedName(deleteTarget.row.nameAr, deleteTarget.row.nameEn)
    : undefined;

  const tableTitle =
    activeTab === "educationLevels"
      ? t("educationLevels.table.title")
      : activeTab === "grades"
        ? t("grades.table.title")
        : t("subjects.table.title");

  const createLabel =
    activeTab === "educationLevels"
      ? t("educationLevels.page.create")
      : activeTab === "grades"
        ? t("grades.page.create")
        : t("subjects.page.create");

  const page = activeTable.page;
  const responseStatus = activeTable.data?.status ?? "Success";

  const header = (
    <DashboardPageHeader
      title={t("page.title")}
      description={t("page.description")}
      breadcrumbs={[
        { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
        { label: t("page.title") },
      ]}
      action={
        <Button
          type="button"
          className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white shadow-[var(--dashboard-shadow-button)] hover:bg-[#243751]"
          onClick={openCreateModal}
        >
          <Plus className="ms-2 h-5 w-5" aria-hidden />
          {createLabel}
        </Button>
      }
    />
  );

  const tabs = (
    <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-100 pb-1">
      {(
        [
          { id: "educationLevels" as const, label: t("tabs.educationLevels"), icon: Layers },
          { id: "grades" as const, label: t("tabs.grades"), icon: GraduationCap },
          { id: "subjects" as const, label: t("tabs.subjects"), icon: BookOpen },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            activeTab === tab.id
              ? "border-b-2 border-[var(--dashboard-primary)] text-[var(--dashboard-primary)]"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <tab.icon className="h-4 w-4" aria-hidden />
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderActions = (row: EducationLevelListItem | GradeListItem | SubjectListItem) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label={t("table.actions.edit")}
        onClick={() => {
          setFormMode("edit");
          if (activeTab === "educationLevels") {
            setEducationLevelTarget(row as EducationLevelListItem);
            setEducationLevelModalOpen(true);
          } else if (activeTab === "grades") {
            setGradeTarget(row as GradeListItem);
            setGradeModalOpen(true);
          } else {
            setSubjectTarget(row as SubjectListItem);
            setSubjectModalOpen(true);
          }
        }}
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        aria-label={t("table.actions.delete")}
        onClick={() => {
          if (activeTab === "educationLevels") {
            setDeleteTarget({ tab: "educationLevels", row: row as EducationLevelListItem });
          } else if (activeTab === "grades") {
            setDeleteTarget({ tab: "grades", row: row as GradeListItem });
          } else {
            setDeleteTarget({ tab: "subjects", row: row as SubjectListItem });
          }
        }}
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );

  if (isInitialLoading) {
    return (
      <section className="space-y-8">
        {header}
        <CurriculumManagementDashboardSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {header}

      <CurriculumManagementAnimatedSection delay={0.02}>{tabs}</CurriculumManagementAnimatedSection>

      <CurriculumManagementAnimatedSection delay={0.06}>
        {activeTab === "educationLevels" ? (
          <CurriculumManagementFilterBar
            activeTab="educationLevels"
            value={educationLevelsTable.filters}
            onChange={educationLevelsTable.setFilters}
          />
        ) : activeTab === "grades" ? (
          <CurriculumManagementFilterBar
            activeTab="grades"
            value={gradesTable.filters}
            onChange={gradesTable.setFilters}
          />
        ) : (
          <CurriculumManagementFilterBar
            activeTab="subjects"
            value={subjectsTable.filters}
            onChange={subjectsTable.setFilters}
          />
        )}
      </CurriculumManagementAnimatedSection>

      <CurriculumManagementAnimatedSection delay={0.14}>
        <DashboardTableCard
          title={tableTitle}
          className={activeTable.isRefetching ? "opacity-60 transition-opacity" : undefined}
          footer={
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-start text-sm text-slate-400">
                {t("table.pagination.summary", {
                  from: page?.rows.length ? (page.currentPage - 1) * page.pageSize + 1 : 0,
                  to: (page?.currentPage ?? 1) * (page?.pageSize ?? 10),
                  total: page?.totalItems ?? 0,
                })}
              </p>
              <DashboardPagination
                pages={activeTable.pages}
                currentPage={page?.currentPage ?? activeTable.pageNumber}
                previousLabel={t("table.pagination.previous")}
                nextLabel={t("table.pagination.next")}
                onPageChange={activeTable.setPageNumber}
              />
            </div>
          }
        >
          {activeTable.isLoading && !page ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : responseStatus === "Success" && (page?.rows.length ?? 0) === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="text-lg font-semibold text-slate-700">{t("table.states.empty.title")}</p>
              <p className="text-sm text-slate-500">{t("table.states.empty.description")}</p>
            </div>
          ) : !page ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-lg font-semibold text-slate-700">{t("table.states.error.title")}</p>
              <Button type="button" onClick={() => void activeTable.refetch()}>
                {t("table.states.error.retry")}
              </Button>
            </div>
          ) : activeTab === "educationLevels" ? (
            <DashboardDataTable
              rows={page.rows as EducationLevelListItem[]}
              columns={educationLevelColumns}
              getRowKey={(row) => String(row.id)}
              emptyMessage="—"
              actionsHeader={t("table.columns.actions")}
              renderActions={renderActions}
            />
          ) : activeTab === "grades" ? (
            <DashboardDataTable
              rows={page.rows as GradeListItem[]}
              columns={gradeColumns}
              getRowKey={(row) => String(row.id)}
              emptyMessage="—"
              actionsHeader={t("table.columns.actions")}
              renderActions={renderActions}
            />
          ) : (
            <DashboardDataTable
              rows={page.rows as SubjectListItem[]}
              columns={subjectColumns}
              getRowKey={(row) => String(row.id)}
              emptyMessage="—"
              actionsHeader={t("table.columns.actions")}
              renderActions={renderActions}
            />
          )}
        </DashboardTableCard>
      </CurriculumManagementAnimatedSection>

      <EducationLevelFormModal
        open={educationLevelModalOpen}
        onOpenChange={setEducationLevelModalOpen}
        mode={formMode}
        initial={educationLevelTarget}
        onSubmit={handleEducationLevelSubmit}
        loading={isSaving}
      />

      <GradeFormModal
        open={gradeModalOpen}
        onOpenChange={setGradeModalOpen}
        mode={formMode}
        initial={gradeTarget}
        onSubmit={handleGradeSubmit}
        loading={isSaving}
      />

      <SubjectFormModal
        open={subjectModalOpen}
        onOpenChange={setSubjectModalOpen}
        mode={formMode}
        initial={subjectTarget}
        onSubmit={handleSubjectSubmit}
        loading={isSaving}
      />

      <CurriculumDeleteConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemName={deleteItemName}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={() => void handleConfirmDelete()}
        isConfirming={isDeleting}
      />
    </section>
  );
}
