"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Lightbulb,
  MonitorPlay,
  Pencil,
  Plus,
  Trash2,
  Video,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { InteractiveBookDetail } from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import { emptyInteractiveBookManagePageData } from "@/modules/admin/domain/data/interactiveBookManagePageData";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  createHotspot,
  deleteHotspot,
  getHotspotsByInteractiveBookId,
  toggleHotspotActivation,
  type InteractiveBookHotspot,
} from "@/modules/admin/infrastructure/api/hotspotsApi";
import {
  createInteractiveBook,
  getInteractiveBookByCourseId,
} from "@/modules/admin/infrastructure/api/interactiveBooksApi";
import { getCoursesPage, type CourseListItemDto } from "@/modules/admin/infrastructure/api/courseApi";
import { getSubjectsPage, type SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import { AddHotspotModal } from "@/modules/admin/presentation/components/interactive-books/AddHotspotModal";
import {
  DEFAULT_HOTSPOT_SIZE,
  type HotspotPlacement,
} from "@/modules/admin/presentation/components/interactive-books/interactiveBookPdfViewer.types";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import {
  DashboardBadge,
  DashboardBreadcrumb,
  DashboardFilterSelect,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { resolveFileUrl, resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

const INTERACTIVE_BOOK_PDF_UPLOAD_FOLDER = "interactive-books";
const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
const PDF_SCALE_MIN = 0.5;
const PDF_SCALE_MAX = 2;
const PDF_SCALE_STEP = 0.25;

const InteractiveBookPdfViewer = dynamic(
  () =>
    import("@/modules/admin/presentation/components/interactive-books/InteractiveBookPdfViewer").then(
      (module) => module.InteractiveBookPdfViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[22rem] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        …
      </div>
    ),
  },
);

export type AdminInteractiveBookManagePageProps = {
  /** When set, loads the interactive book for this course via `GET /api/v1/InteractiveBook/course/{courseId}`. */
  editCourseId?: string;
};

export function AdminInteractiveBookManagePage({ editCourseId }: AdminInteractiveBookManagePageProps) {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const createDefaults = emptyInteractiveBookManagePageData;
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [subjectSelectValue, setSubjectSelectValue] = useState(createDefaults.subjectSelectValue);
  const [courseSelectValue, setCourseSelectValue] = useState("");
  const [bookStatus, setBookStatus] = useState<0 | 1>(0);
  const [courses, setCourses] = useState<CourseListItemDto[]>([]);
  const [coursesLoadState, setCoursesLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [savingBook, setSavingBook] = useState(false);
  const [hotspots, setHotspots] = useState<InteractiveBookHotspot[]>([]);
  const [hotspotsReloadKey, setHotspotsReloadKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfScale, setPdfScale] = useState(1);
  const [placementMode, setPlacementMode] = useState(false);
  const [hotspotModalOpen, setHotspotModalOpen] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<HotspotPlacement | null>(null);
  const [submittingHotspot, setSubmittingHotspot] = useState(false);
  const [hotspotActionId, setHotspotActionId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [subjectsLoadState, setSubjectsLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLocalUrl, setPdfLocalUrl] = useState<string | null>(null);
  const [pdfUploadedPath, setPdfUploadedPath] = useState<string | null>(null);
  const [pdfUploadState, setPdfUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [book, setBook] = useState<InteractiveBookDetail | null>(null);
  const [bookLoadState, setBookLoadState] = useState<"idle" | "loading" | "success" | "error" | "notFound">(
    "idle",
  );

  const isEditMode = Boolean(editCourseId?.trim());
  const interactiveBookId = book?.id ?? null;

  const bumpHotspotsReload = useCallback(() => {
    setHotspotsReloadKey((key) => key + 1);
  }, []);

  const loadHotspots = useCallback(async (bookId: string) => {
    const result = await getHotspotsByInteractiveBookId(bookId);
    if (!result.errorMessage && result.data) {
      setHotspots(result.data);
      bumpHotspotsReload();
    }
  }, [bumpHotspotsReload]);

  useEffect(() => {
    if (!interactiveBookId) {
      setHotspots([]);
      return;
    }
    void loadHotspots(interactiveBookId);
  }, [interactiveBookId, loadHotspots]);

  useEffect(() => {
    if (book?.pageCount && book.pageCount > 0) {
      setTotalPages(book.pageCount);
    }
  }, [book?.pageCount]);

  useEffect(() => {
    if (isEditMode) return;
    let alive = true;
    (async () => {
      setSubjectsLoadState("loading");
      const result = await getSubjectsPage({ pageNumber: 1, pageSize: 240 });
      if (!alive) return;
      if (result.errorMessage || !result.data) {
        setSubjects([]);
        setSubjectsLoadState("error");
        return;
      }
      setSubjects(result.data.rows);
      setSubjectsLoadState("success");
    })();
    return () => {
      alive = false;
    };
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode || !subjectSelectValue.trim()) {
      setCourses([]);
      setCourseSelectValue("");
      setCoursesLoadState("idle");
      return;
    }

    const subjectId = Number(subjectSelectValue);
    if (!Number.isFinite(subjectId)) return;

    let alive = true;
    (async () => {
      setCoursesLoadState("loading");
      setCourseSelectValue("");
      const result = await getCoursesPage({
        subjectId,
        pageNumber: 1,
        pageSize: 240,
      });
      if (!alive) return;
      if (result.errorMessage || !result.data) {
        setCourses([]);
        setCoursesLoadState("error");
        return;
      }
      setCourses(result.data.rows);
      setCoursesLoadState("success");
    })();

    return () => {
      alive = false;
    };
  }, [isEditMode, subjectSelectValue]);

  useEffect(() => {
    return () => {
      if (pdfLocalUrl) URL.revokeObjectURL(pdfLocalUrl);
    };
  }, [pdfLocalUrl]);

  useEffect(() => {
    if (!isEditMode || !editCourseId?.trim()) {
      setBook(null);
      setBookLoadState("idle");
      return;
    }
    let alive = true;
    (async () => {
      setBookLoadState("loading");
      const res = await getInteractiveBookByCourseId(editCourseId);
      if (!alive) return;
      if (res.errorMessage || res.data == null) {
        setBook(null);
        setBookLoadState(res.errorMessage?.toLowerCase().includes("not found") ? "notFound" : "error");
        return;
      }
      setBook(res.data);
      setBookLoadState("success");
      if (res.data.pageCount > 0) {
        setTotalPages(res.data.pageCount);
      }
    })();
    return () => {
      alive = false;
    };
  }, [editCourseId, isEditMode]);

  const pdfFileName = useMemo(() => {
    if (isEditMode && book && bookLoadState === "success") {
      return (
        book.pdfFileName?.trim() || `${book.title.replace(/\s+/g, "_").slice(0, 48) || "book"}.pdf`
      );
    }
    return pdfFile?.name ?? "";
  }, [book, bookLoadState, isEditMode, pdfFile?.name]);

  const subjectFilterOptions = useMemo(() => {
    const placeholder = {
      id: "",
      label: t("interactiveBooks.managePage.config.subjectPlaceholder"),
    };
    if (subjectsLoadState === "loading") {
      return [{ id: "", label: t("interactiveBooks.managePage.config.subjectsLoading") }];
    }
    if (subjectsLoadState === "error" || subjects.length === 0) {
      return [
        placeholder,
        ...(subjectsLoadState === "error"
          ? [{ id: "", label: t("interactiveBooks.managePage.config.subjectsLoadError") }]
          : []),
      ];
    }
    return [
      placeholder,
      ...subjects.map((subject) => ({
        id: String(subject.id),
        label: subject.nameAr?.trim() || subject.nameEn?.trim() || "—",
      })),
    ];
  }, [subjects, subjectsLoadState, t]);

  const courseFilterOptions = useMemo(() => {
    const placeholder = {
      id: "",
      label: t("interactiveBooks.managePage.config.coursePlaceholder"),
    };
    if (!subjectSelectValue.trim()) return [placeholder];
    if (coursesLoadState === "loading") {
      return [{ id: "", label: t("interactiveBooks.managePage.config.coursesLoading") }];
    }
    if (coursesLoadState === "error" || courses.length === 0) {
      return [
        placeholder,
        ...(coursesLoadState === "error"
          ? [{ id: "", label: t("interactiveBooks.managePage.config.coursesLoadError") }]
          : []),
      ];
    }
    return [
      placeholder,
      ...courses.map((course) => ({
        id: course.id,
        label: course.title,
      })),
    ];
  }, [courses, coursesLoadState, subjectSelectValue, t]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseSelectValue) ?? null,
    [courseSelectValue, courses],
  );

  /** Raw path from book API or upload — loaded in the viewer via authenticated fetch. */
  const serverPdfPath = useMemo(() => {
    if (isEditMode && book?.pdfUrl?.trim()) return book.pdfUrl.trim();
    if (pdfUploadedPath?.trim()) return pdfUploadedPath.trim();
    return null;
  }, [book?.pdfUrl, isEditMode, pdfUploadedPath]);

  /** Link for “View PDF” in a new tab — uses the same path as API `pdfUrl`. */
  const pdfHref = useMemo(() => {
    if (pdfLocalUrl) return pdfLocalUrl;
    if (serverPdfPath) return resolveProtectedFileUrl(serverPdfPath) ?? resolveFileUrl(serverPdfPath);
    return null;
  }, [pdfLocalUrl, serverPdfPath]);

  const handlePdfInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      notify.error(t("interactiveBooks.managePage.config.pdfInvalidType"));
      return;
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      notify.error(t("interactiveBooks.managePage.config.pdfTooLarge"));
      return;
    }

    setPdfFile(file);
    setPdfUploadedPath(null);
    setPdfUploadState("uploading");
    setPdfLocalUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });

    const upload = await uploadAdminFile(file, INTERACTIVE_BOOK_PDF_UPLOAD_FOLDER);
    if (!upload.ok) {
      setPdfUploadState("error");
      notify.error(upload.errorMessage);
      return;
    }
    setPdfUploadedPath(upload.filePath);
    setPdfUploadState("idle");
  };

  const openPdfPicker = () => {
    if (pdfUploadState === "uploading") return;
    pdfInputRef.current?.click();
  };

  const handleDocumentLoadSuccess = useCallback((numPages: number) => {
    setTotalPages(Math.max(1, numPages));
    setCurrentPage((page) => Math.min(page, Math.max(1, numPages)));
  }, []);

  const handleTogglePlacement = () => {
    if (!interactiveBookId) {
      notify.error(t("interactiveBooks.managePage.viewer.saveBookFirst"));
      return;
    }
    if (!pdfLocalUrl && !serverPdfPath) {
      notify.error(t("interactiveBooks.managePage.viewer.noPdf"));
      return;
    }
    setPlacementMode((active) => !active);
  };

  const handlePageClickForHotspot = (placement: HotspotPlacement) => {
    setPendingPlacement(placement);
    setHotspotModalOpen(true);
    setPlacementMode(false);
  };

  const handleHotspotSubmit = async (values: {
    title: string;
    videoUrl: string;
    isActive: boolean;
    visibility: number;
  }) => {
    if (!interactiveBookId || !pendingPlacement) return;

    setSubmittingHotspot(true);
    const result = await createHotspot({
      interactiveBookId,
      title: values.title,
      pageNumber: pendingPlacement.pageNumber,
      xPosition: pendingPlacement.xPosition,
      yPosition: pendingPlacement.yPosition,
      width: DEFAULT_HOTSPOT_SIZE,
      height: DEFAULT_HOTSPOT_SIZE,
      videoUrl: values.videoUrl,
      isActive: values.isActive,
      visibility: values.visibility,
    });
    setSubmittingHotspot(false);

    if (result.errorMessage || !result.data) {
      notify.error(
        result.errorMessage ?? t("interactiveBooks.hotspotModal.messages.createError"),
      );
      return;
    }

    notify.success(
      result.message ?? t("interactiveBooks.hotspotModal.messages.createSuccess"),
    );
    if (interactiveBookId) {
      await loadHotspots(interactiveBookId);
    } else {
      setHotspots((prev) => [...prev, result.data!]);
    }
    setHotspotModalOpen(false);
    setPendingPlacement(null);
  };

  const handleDeleteHotspot = async (hotspotId: string) => {
    if (!interactiveBookId || hotspotActionId) return;

    setHotspotActionId(hotspotId);
    const result = await deleteHotspot(hotspotId);
    setHotspotActionId(null);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("interactiveBooks.managePage.points.deleteError"));
      return;
    }

    notify.success(result.message ?? t("interactiveBooks.managePage.points.deleteSuccess"));
    setHotspots((prev) => prev.filter((item) => item.id !== hotspotId));
    bumpHotspotsReload();
  };

  const handleToggleHotspotActive = async (hotspotId: string) => {
    if (!interactiveBookId || hotspotActionId) return;

    setHotspotActionId(hotspotId);
    const result = await toggleHotspotActivation(hotspotId);
    setHotspotActionId(null);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("interactiveBooks.managePage.points.toggleError"));
      return;
    }

    const { id, isActive } = result.data;
    setHotspots((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive } : item)),
    );
    bumpHotspotsReload();
    notify.success(result.message ?? t("interactiveBooks.managePage.points.toggleSuccess"));
  };

  const pointsCount = hotspots.length;

  const ensurePdfUploaded = async (): Promise<string | null> => {
    const existing = pdfUploadedPath?.trim() ?? "";
    if (existing) return existing;

    if (!pdfFile) return null;
    if (pdfUploadState === "uploading") return null;

    setPdfUploadState("uploading");
    const upload = await uploadAdminFile(pdfFile, INTERACTIVE_BOOK_PDF_UPLOAD_FOLDER);
    setPdfUploadState(upload.ok ? "idle" : "error");

    if (!upload.ok) {
      notify.error(upload.errorMessage);
      return null;
    }

    setPdfUploadedPath(upload.filePath);
    return upload.filePath;
  };

  const handleSaveBook = async () => {
    if (isEditMode || savingBook) return;

    const title = bookTitle.trim();
    const courseId = courseSelectValue.trim();

    if (!title) {
      notify.error(t("interactiveBooks.managePage.create.titleRequired"));
      return;
    }
    if (!subjectSelectValue.trim()) {
      notify.error(t("interactiveBooks.managePage.create.subjectRequired"));
      return;
    }
    if (!courseId || !selectedCourse) {
      notify.error(t("interactiveBooks.managePage.create.courseRequired"));
      return;
    }
    if (!pdfFile && !pdfUploadedPath?.trim()) {
      notify.error(t("interactiveBooks.managePage.create.pdfRequired"));
      return;
    }
    if (pdfUploadState === "uploading") {
      notify.error(t("interactiveBooks.managePage.create.pdfStillUploading"));
      return;
    }

    const pdfUrl = await ensurePdfUploaded();
    if (!pdfUrl) {
      if (pdfFile) return;
      notify.error(t("interactiveBooks.managePage.create.pdfRequired"));
      return;
    }

    setSavingBook(true);
    const result = await createInteractiveBook({
      title,
      courseId,
      gradeId: selectedCourse.gradeId,
      pdfFileName: pdfFileName.trim() || pdfFile?.name || "book.pdf",
      pdfUrl,
      pageCount: totalPages,
      status: bookStatus,
    });
    setSavingBook(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("interactiveBooks.managePage.create.error"));
      return;
    }

    notify.success(result.message ?? t("interactiveBooks.managePage.create.success"));
    router.push(ROUTES.ADMIN.INTERACTIVE_BOOKS.MANAGE_BY_COURSE(result.data.courseId));
  };

  if (isEditMode && bookLoadState === "loading") {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        {t("interactiveBooks.table.loading")}
      </div>
    );
  }

  if (isEditMode && bookLoadState === "error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-800">
        {t("interactiveBooks.managePage.edit.loadError")}
      </div>
    );
  }

  if (isEditMode && bookLoadState === "notFound") {
    return (
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center text-sm text-amber-900">
        {t("interactiveBooks.managePage.edit.notFound")}
      </div>
    );
  }

  const pageTitle = isEditMode ? t("interactiveBooks.managePage.editTitle") : t("interactiveBooks.managePage.title");
  const pageDescription =
    isEditMode && book && bookLoadState === "success"
      ? t("interactiveBooks.managePage.edit.description", { title: book.title })
      : t("interactiveBooks.managePage.description");

  const breadcrumbs = isEditMode
    ? [
        { label: t("interactiveBooks.managePage.breadcrumbs.dashboard"), href: ROUTES.ADMIN.HOME },
        { label: t("tabs.interactiveBooks.title"), href: `${ROUTES.ADMIN.HOME}?tab=interactiveBooks` },
        {
          label: t("interactiveBooks.managePage.breadcrumbs.content"),
          href: ROUTES.ADMIN.INTERACTIVE_BOOKS.MANAGE,
        },
        { label: t("interactiveBooks.managePage.breadcrumbs.editBook") },
      ]
    : [
        { label: t("interactiveBooks.managePage.breadcrumbs.dashboard"), href: ROUTES.ADMIN.HOME },
        { label: t("tabs.interactiveBooks.title"), href: `${ROUTES.ADMIN.HOME}?tab=interactiveBooks` },
        { label: t("interactiveBooks.managePage.breadcrumbs.content") },
      ];

  const viewerChapterTitle =
    book && bookLoadState === "success" && book.title.trim()
      ? book.title
      : !isEditMode && bookTitle.trim()
        ? bookTitle.trim()
        : isEditMode
          ? t("interactiveBooks.managePage.viewer.chapterTitle")
          : "";

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={breadcrumbs} />
        <DashboardPageHeader
        title={pageTitle}
        description={pageDescription}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 cursor-pointer rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            disabled={isEditMode ? true : savingBook || pdfUploadState === "uploading"}
            onClick={() => void handleSaveBook()}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {savingBook
              ? t("interactiveBooks.hotspotModal.actions.saving")
              : t("interactiveBooks.managePage.actions.saveBook")}
          </Button>
        }
      />
      </div>

      <Card className="border-[var(--dashboard-border-soft)] shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-2 text-[var(--dashboard-primary)]">
            <BookOpen className="h-6 w-6" aria-hidden />
            <h2 className="text-xl font-bold text-slate-800">
              {t("interactiveBooks.managePage.config.sectionTitle")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {isEditMode && book && bookLoadState === "success" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ib-book-title">{t("interactiveBooks.managePage.config.bookTitleLabel")}</Label>
                  <Input
                    id="ib-book-title"
                    readOnly
                    value={book.title}
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ib-course">{t("interactiveBooks.managePage.config.courseLabel")}</Label>
                  <Input
                    id="ib-course"
                    readOnly
                    value={book.courseTitle}
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] outline-none"
                  />
                  <p className="text-xs text-slate-500">
                    {t("interactiveBooks.managePage.edit.courseContext", {
                      course: book.courseTitle,
                      grade: book.gradeName,
                    })}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ib-book-title-create">
                    {t("interactiveBooks.managePage.config.bookTitleLabel")}
                  </Label>
                  <Input
                    id="ib-book-title-create"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder={t("interactiveBooks.addModal.fields.bookName.placeholder")}
                    className="h-12 rounded-xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] outline-none"
                  />
                </div>
                <DashboardFilterSelect
                  label={t("interactiveBooks.managePage.config.subjectLabel")}
                  value={subjectSelectValue}
                  options={subjectFilterOptions}
                  onChange={setSubjectSelectValue}
                  disabled={subjectsLoadState === "loading"}
                />
                <DashboardFilterSelect
                  label={t("interactiveBooks.managePage.config.courseLabel")}
                  value={courseSelectValue}
                  options={courseFilterOptions}
                  onChange={setCourseSelectValue}
                  disabled={!subjectSelectValue.trim() || coursesLoadState === "loading"}
                />
                <div className="flex flex-col gap-3">
                  <Label>{t("interactiveBooks.managePage.config.statusLabel")}</Label>
                  <div
                    className="w-fit rounded-2xl border border-[var(--dashboard-border-soft)] bg-white/80 p-2 shadow-inner"
                    role="group"
                  >
                    <button
                      type="button"
                      onClick={() => setBookStatus(0)}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                        bookStatus === 0
                          ? "bg-white text-[var(--dashboard-primary)] shadow-sm"
                          : "text-slate-500",
                      )}
                    >
                      {t("interactiveBooks.managePage.config.statusDraft")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookStatus(1)}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                        bookStatus === 1
                          ? "bg-white text-[var(--dashboard-primary)] shadow-sm"
                          : "text-slate-500",
                      )}
                    >
                      {t("interactiveBooks.managePage.config.statusPublished")}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2 md:col-span-2 md:col-start-1">
              <Label htmlFor="ib-pdf-input">{t("interactiveBooks.managePage.config.pdfLabel")}</Label>
              <input
                ref={pdfInputRef}
                id="ib-pdf-input"
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => void handlePdfInputChange(event)}
              />
              <div className="flex h-12 items-center justify-between gap-3 rounded-xl border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-4">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileText className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {pdfUploadState === "uploading"
                      ? t("interactiveBooks.managePage.config.pdfUploading")
                      : pdfFileName || t("interactiveBooks.managePage.config.pdfPlaceholder")}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {pdfHref ? (
                    <a
                      href={pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--dashboard-primary)] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      {t("interactiveBooks.managePage.config.viewFile")}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={openPdfPicker}
                    disabled={pdfUploadState === "uploading"}
                    className="text-sm font-semibold text-[var(--dashboard-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pdfHref
                      ? t("interactiveBooks.managePage.config.changeFile")
                      : t("interactiveBooks.managePage.config.uploadPdf")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Card className="order-2 overflow-hidden border-[var(--dashboard-border-soft)] bg-white shadow-[var(--dashboard-shadow-soft)] lg:order-1">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                aria-label={t("interactiveBooks.managePage.viewer.prevPage")}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
              <span>
                {t("interactiveBooks.managePage.viewer.pageOf", {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                aria-label={t("interactiveBooks.managePage.viewer.nextPage")}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-white disabled:opacity-40"
                  aria-label={t("interactiveBooks.managePage.viewer.zoomOut")}
                  disabled={pdfScale <= PDF_SCALE_MIN}
                  onClick={() =>
                    setPdfScale((scale) => Math.max(PDF_SCALE_MIN, scale - PDF_SCALE_STEP))
                  }
                >
                  <ZoomOut className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-white disabled:opacity-40"
                  aria-label={t("interactiveBooks.managePage.viewer.zoomIn")}
                  disabled={pdfScale >= PDF_SCALE_MAX}
                  onClick={() =>
                    setPdfScale((scale) => Math.min(PDF_SCALE_MAX, scale + PDF_SCALE_STEP))
                  }
                >
                  <ZoomIn className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <Button
              type="button"
              variant={placementMode ? "outline" : "default"}
              className={cn(
                "h-11 rounded-xl px-4 text-sm font-semibold",
                placementMode
                  ? "border-[var(--dashboard-primary)] text-[var(--dashboard-primary)]"
                  : "bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary-pressed)]",
              )}
              onClick={handleTogglePlacement}
            >
              <Plus className="ms-2 h-4 w-4" aria-hidden />
              {placementMode
                ? t("interactiveBooks.managePage.viewer.cancelPlacement")
                : t("interactiveBooks.managePage.viewer.addInteractionPoint")}
            </Button>
          </div>
          <CardContent className="p-6">
            {viewerChapterTitle ? (
              <p className="mb-4 text-center text-lg font-bold text-slate-700">{viewerChapterTitle}</p>
            ) : null}
            <InteractiveBookPdfViewer
              localFileUrl={pdfLocalUrl}
              serverPdfPath={pdfLocalUrl ? null : serverPdfPath}
              currentPage={currentPage}
              scale={pdfScale}
              placementMode={placementMode}
              interactiveBookId={interactiveBookId}
              hotspotsReloadKey={hotspotsReloadKey}
              onDocumentLoadSuccess={handleDocumentLoadSuccess}
              onPageClick={handlePageClickForHotspot}
            />
          </CardContent>
        </Card>

        <aside className="order-1 space-y-6 lg:order-2">
          <Card className="border-[var(--dashboard-border-soft)] bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardHeader className="relative space-y-2 border-b border-slate-100 pb-4 text-right">
              <div className="absolute left-4 top-4">
                <DashboardBadge tone="warning">
                  {t("interactiveBooks.managePage.points.badge", { count: pointsCount })}
                </DashboardBadge>
              </div>
              <div className="flex items-start gap-3 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[var(--dashboard-primary)]">
                    <MonitorPlay className="h-5 w-5 shrink-0" aria-hidden />
                    <h2 className="text-lg font-bold">{t("interactiveBooks.managePage.points.title")}</h2>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {t("interactiveBooks.managePage.points.subtitle")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {hotspots.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  {t("interactiveBooks.managePage.points.empty")}
                </p>
              ) : hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="rounded-2xl border border-slate-100 bg-[var(--dashboard-surface-muted)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success)]">
                      <Video className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 text-right">
                      <p className="font-semibold text-slate-800">{hotspot.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>
                          {t("interactiveBooks.managePage.points.pageLabel", {
                            page: hotspot.pageNumber,
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                          <Video className="h-3 w-3" aria-hidden />
                          {t("interactiveBooks.managePage.points.type.video")}
                        </span>
                        <button
                          type="button"
                          className="dashboard-icon-btn disabled:opacity-50"
                          disabled={hotspotActionId === hotspot.id}
                          onClick={() => void handleDeleteHotspot(hotspot.id)}
                          aria-label={t("interactiveBooks.managePage.points.deletePoint")}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
                        <span className="text-xs text-slate-500">
                          {t("interactiveBooks.managePage.points.visibilityLabel")}
                        </span>
                        <StatusSwitch
                          checked={hotspot.isActive}
                          disabled={hotspotActionId === hotspot.id}
                          onChange={() => void handleToggleHotspotActive(hotspot.id)}
                          activeLabel={t("interactiveBooks.managePage.points.activeLabel")}
                          inactiveLabel={t("interactiveBooks.managePage.points.hidden")}
                          activeClassName="bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-[var(--dashboard-primary)]/40 hover:text-[var(--dashboard-primary)]"
                onClick={handleTogglePlacement}
              >
                <Plus className="h-5 w-5" aria-hidden />
                {t("interactiveBooks.managePage.points.addNew")}
              </button>
            </CardContent>
          </Card>

          <AddHotspotModal
            open={hotspotModalOpen}
            onOpenChange={setHotspotModalOpen}
            placement={pendingPlacement}
            submitting={submittingHotspot}
            onSubmit={(values) => void handleHotspotSubmit(values)}
          />

          <div className="dashboard-tip-card flex gap-3 p-4 text-right">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-amber-950/90">
              {t("interactiveBooks.managePage.tip.body")}
            </p>
          </div>
        </aside>
      </div>

    </div>
  );
}
