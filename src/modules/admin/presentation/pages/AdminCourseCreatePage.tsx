"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Eye, FileUp, Lightbulb, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CoursePricingType, type CourseCreateDraft } from "@/modules/admin/domain/data/courseManagementData";
import { createCourse, getCourseForEdit, updateCourse } from "@/modules/admin/infrastructure/api/courseApi";
import { getSubjectsPage, type SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
  getUserManagementUsers,
  type UserManagementListRow,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { CourseSectionCard } from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { CourseAccessType, CourseTerm } from "@/shared/domain/enums/cms.enums";
import { isValidAccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import type { AccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { AccessDurationField } from "@/shared/presentation/components/ui/access-duration-field";
import { ModalDescription, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { cn } from "@/shared/application/lib/cn";
import { MoneyIcon } from "../assets/icons/Money";
import { GiftIcon } from "../assets/icons/Gift";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const COURSE_COVER_UPLOAD_FOLDER = "courses";

const pricingOptions: CoursePricingType[] = [
  {
    text: "free",
    icon: <GiftIcon className="h-6 w-6" />,
    iconTone: "primary",
  },
  {
    text: "oneTime",
    icon: <MoneyIcon className="h-6 w-6" />,
    iconTone: "primary",
  },
]

const initialDraft: CourseCreateDraft = {
  title: "",
  description: "",
  subject: "",
  grade: "",
  term: String(CourseTerm.FirstTerm),
  teacher: "",
  pricingType: "oneTime",
  basePrice: "",
  offerPrice: "",
  // lessonCount/pathCount are intentionally kept out of the UI because `/api/v1/Course` does not accept them.
  lessonCount: "",
  pathCount: "",
};

type SelectOption = {
  id: string;
  label: string;
};

function toNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function priceToNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function pricingTypeToAccessType(pricingType: CourseCreateDraft["pricingType"]): CourseAccessType {
  if (pricingType === "free") return CourseAccessType.Free;
  return CourseAccessType.Paid;
}

function accessTypeToPricingType(accessType: CourseAccessType): CourseCreateDraft["pricingType"] {
  if (accessType === CourseAccessType.Free) return "free";
  return "oneTime";
}

interface Props {
  courseId?: string;
}

export function AdminCourseCreatePage({ courseId }: Props = {}) {
  const isEditMode = Boolean(courseId);
  const t = useTranslations("admin.dashboard.courseManagement");
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const activeStep = "basic";
  const [draft, setDraft] = useState<CourseCreateDraft>(initialDraft);
  const [coverImage, setCoverImage] = useState<{ file: File | null; previewUrl: string | null }>({
    file: null,
    previewUrl: null,
  });
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState("");
  const [loadingCourse, setLoadingCourse] = useState(isEditMode);
  const [courseLoadError, setCourseLoadError] = useState(false);
  const [coverUploadState, setCoverUploadState] = useState<"idle" | "loading" | "error">("idle");
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [accessDurationDays, setAccessDurationDays] = useState<AccessDurationDays>(null);
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [gradeOptions, setGradeOptions] = useState<SelectOption[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<UserManagementListRow[]>([]);

  const update = (key: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }) as typeof prev);
  };

  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    const load = async () => {
      setLoadingCourse(true);
      setCourseLoadError(false);
      const result = await getCourseForEdit(courseId);
      if (!alive) return;
      if (result.errorMessage || !result.data) {
        setCourseLoadError(true);
        setLoadingCourse(false);
        notify.error(result.errorMessage ?? t("create.edit.notFound"));
        return;
      }

      const course = result.data;
      setDraft({
        title: course.title,
        description: course.description,
        subject: course.subjectId ? String(course.subjectId) : "",
        grade: course.gradeId ? String(course.gradeId) : "",
        term: String(course.term),
        teacher: course.teacherId,
        pricingType: accessTypeToPricingType(course.accessType),
        basePrice: course.originalPrice ? String(course.originalPrice) : "",
        offerPrice: course.discountedPrice ? String(course.discountedPrice) : "",
        lessonCount: "",
        pathCount: "",
      });
      setAccessDurationDays(course.accessDurationDays);
      setExistingCoverImageUrl(course.coverImageUrl);
      if (course.coverImageUrl) {
        setCoverImage({ file: null, previewUrl: course.coverImageUrl });
      }
      setLoadingCourse(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [courseId, t]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const result = await getSubjectsPage({ pageNumber: 1, pageSize: 240 });
      if (!alive) return;
      if (!result.errorMessage && result.data) {
        setSubjects(result.data.rows);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const teachers = await getUserManagementUsers({
        roleId: "teacher",
        pageNumber: 1,
        pageSize: 240,
      });
      if (!alive) return;
      if (!teachers.errorMessage && teachers.data) {
        setTeacherOptions(teachers.data.rows);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const countries = await getCountriesDropdown();
      if (!alive || countries.errorMessage || !countries.data?.length) return;
      const country = countries.data[0];
      if (!country) return;
      const levelsRes = await getEducationLevelsDropdown(country.id);
      if (!alive) return;
      const levels = levelsRes.data ?? [];
      const batches = await Promise.all(levels.map((level) => getUserManagementGradesDropdown(level.id)));
      const byId = new Map<number, string>();
      batches.forEach((batch, index) => {
        const levelName = levels[index]?.name ?? "";
        const prefix = levelName.trim() ? `${levelName.trim()} — ` : "";
        (batch.data ?? []).forEach((grade) => {
          const id = typeof grade.id === "number" ? grade.id : Number(grade.id);
          if (!Number.isNaN(id) && !byId.has(id)) {
            byId.set(id, `${prefix}${grade.name}`);
          }
        });
      });
      if (!alive) return;
      setGradeOptions(Array.from(byId.entries()).map(([id, label]) => ({ id: String(id), label })));
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const subjectOptions = useMemo<SelectOption[]>(
    () => subjects.map((subject) => ({ id: String(subject.id), label: subject.nameAr || subject.nameEn })),
    [subjects],
  );

  const teacherSelectOptions = useMemo<SelectOption[]>(
    () => teacherOptions.map((teacher) => ({ id: teacher.id, label: teacher.fullName })),
    [teacherOptions],
  );

  const termOptions = useMemo<SelectOption[]>(
    () => [
      { id: String(CourseTerm.FirstTerm), label: t("create.options.term.term1") },
      { id: String(CourseTerm.SecondTerm), label: t("create.options.term.term2") },
      { id: String(CourseTerm.ThirdTerm), label: t("create.options.term.term3") },
    ],
    [t],
  );

  const selectedSubjectLabel = subjectOptions.find((option) => option.id === draft.subject)?.label ?? "—";
  const selectedGradeLabel = gradeOptions.find((option) => option.id === draft.grade)?.label ?? "—";

  const submit = async () => {
    if (submitting) return;
    const subjectId = toNumber(draft.subject);
    const gradeId = toNumber(draft.grade);
    const term = toNumber(draft.term);
    if (!draft.title.trim() || !draft.description.trim() || subjectId === null || gradeId === null || term === null) {
      notify.error(t("create.messages.validation"));
      return;
    }
    if (!isEditMode && !draft.teacher) {
      notify.error(t("create.messages.validation"));
      return;
    }

    setSubmitting(true);
    let coverImageUrl = existingCoverImageUrl;
    if (coverImage.file) {
      setCoverUploadState("loading");
      const upload = await uploadAdminFile(coverImage.file, COURSE_COVER_UPLOAD_FOLDER);
      if (!upload.ok) {
        setSubmitting(false);
        setCoverUploadState("error");
        setCoverUploadError(upload.errorMessage);
        notify.error(upload.errorMessage);
        return;
      }
      coverImageUrl = upload.filePath;
      setCoverUploadState("idle");
    }

    const accessType = pricingTypeToAccessType(draft.pricingType);
    const resolvedAccessDurationDays =
      accessType === CourseAccessType.Free ? null : accessDurationDays;

    if (
      accessType !== CourseAccessType.Free &&
      !isValidAccessDurationDays(resolvedAccessDurationDays)
    ) {
      setSubmitting(false);
      notify.error(t("create.validation.accessDurationInvalid"));
      return;
    }

    if (isEditMode && courseId) {
      const result = await updateCourse(courseId, {
        id: courseId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        subjectId,
        gradeId,
        term: term as CourseTerm,
        coverImageUrl,
        accessType,
        accessDurationDays: resolvedAccessDurationDays,
        ...(accessType !== CourseAccessType.Free
          ? {
              originalPrice: priceToNumber(draft.basePrice),
              discountedPrice: priceToNumber(draft.offerPrice),
            }
          : {}),
      });
      setSubmitting(false);
      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? t("create.messages.updateError"));
        return;
      }
      notify.success(t("create.messages.updateSuccess"));
      router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(courseId));
      return;
    }

    const result = await createCourse({
      title: draft.title.trim(),
      description: draft.description.trim(),
      subjectId,
      gradeId,
      term: term as CourseTerm,
      teacherId: draft.teacher,
      coverImageUrl,
      accessType,
      accessDurationDays: resolvedAccessDurationDays,
      ...(accessType !== CourseAccessType.Free
        ? {
            originalPrice: priceToNumber(draft.basePrice),
            discountedPrice: priceToNumber(draft.offerPrice),
          }
        : {}),
      submitForReview: true,
    });
    setSubmitting(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("create.messages.error"));
      return;
    }
    setCreatedCourseId(result.data.id);
    setSuccessOpen(true);
  };

  const handleStartLearningPath = () => {
    if (!createdCourseId) return;
    router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(createdCourseId));
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setCoverUploadState("error");
      setCoverUploadError(t("create.upload.invalidType"));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setCoverUploadState("error");
      setCoverUploadError(t("create.upload.tooLarge"));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    setCoverUploadState("loading");
    setCoverUploadError(null);

    reader.onerror = () => {
      setCoverUploadState("error");
      setCoverUploadError(t("create.upload.readError"));
      event.target.value = "";
    };

    reader.onload = () => {
      setCoverImage({
        file,
        previewUrl: typeof reader.result === "string" ? reader.result : null,
      });
      setCoverUploadState("idle");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  if (loadingCourse) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  if (courseLoadError) {
    return (
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center text-sm text-amber-900">
        {t("create.edit.notFound")}
      </div>
    );
  }

  const cancelHref = isEditMode && courseId
    ? ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(courseId)
    : ROUTES.ADMIN.COURSE_MANAGEMENT.LIST;

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={isEditMode ? t("create.edit.title") : t("create.title")}
        description={isEditMode ? t("create.edit.description") : t("create.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.courseManagement"), href: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST },
          ...(isEditMode && courseId
            ? [
                {
                  label: draft.title || t("create.preview.titleFallback"),
                  href: ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(courseId),
                },
                { label: t("breadcrumbs.edit") },
              ]
            : [{ label: t("breadcrumbs.create") }]),
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(cancelHref)}
            >
              {t("create.actions.cancel")}
            </Button>
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-12 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void submit()}
              disabled={submitting}
            >
              {submitting
                ? t("create.actions.saving")
                : isEditMode
                  ? t("create.actions.updateCourse")
                  : t("create.actions.saveCourse")}
            </Button>
          </div>
        }
      />
      <div className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0px_8px_0px_0px_#0000000D]">
        <div className="flex justify-between">
          {[{
            text: "basic",
            icon: <PencilIcon />
          }, {
            text: "pricing",
            icon: <Tag />
          }].map((step: { text: string, icon: React.ReactNode }, index: number) => (
            <div key={step.text} className={cn("flex items-center cursor-pointer justify-center", index > 0 ? "flex-1" : "")}>
              {index > 0 ? <div className="h-[2px] flex-1 bg-slate-200" /> : null}
              <div className="flex flex-col items-center gap-2 text-xs font-semibold text-slate-500">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", activeStep === step.text ? "bg-[#2C4260] text-white" : "bg-slate-50 text-slate-500")}>
                  {step.icon}
                </span>
                {t(`create.steps.${step.text}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <CourseSectionCard title={t("create.sections.basic")} icon={PencilIcon}>
            <LabeledInput
              label={t("create.fields.title")}
              value={draft.title}
              placeholder={t("create.placeholders.title")}
              onChange={(value) => update("title", value)}
            />
            <LabeledTextarea
              label={t("create.fields.description")}
              value={draft.description}
              placeholder={t("create.placeholders.description")}
              onChange={(value) => update("description", value)}
              rows={4}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { field: "subject" as const, options: subjectOptions },
                { field: "grade" as const, options: gradeOptions },
                { field: "term" as const, options: termOptions },
                ...(isEditMode
                  ? []
                  : [{ field: "teacher" as const, options: teacherSelectOptions }]),
              ].map(({ field, options }) => (
                <LabeledSelect
                  key={field}
                  label={t(`create.fields.${field}`)}
                  value={draft[field]}
                  onChange={(value) => update(field, value)}
                  options={[
                    { value: "", label: t(`create.placeholders.${field}`) },
                    ...options.map((option) => ({
                      value: option.id,
                      label: option.label,
                    })),
                  ]}
                  labelClassName="text-sm font-semibold text-slate-600"
                  selectClassName="h-12 border-slate-200 text-sm"
                />
              ))}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={handleCoverImageChange}
            />
            <button
              type="button"
              className="relative min-h-52 w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-colors hover:border-[#C8AC59]/70 hover:bg-[#FFFCF4]"
              onClick={() => coverInputRef.current?.click()}
              aria-label={t("create.upload.title")}
            >
              {coverImage.previewUrl ? (
                <>              
                  <Image
                    src={coverImage.previewUrl}
                    alt={t("create.upload.previewAlt")}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </>
              ) : 
              <div
                className={cn(
                  "relative z-10 flex min-h-36 flex-col items-center justify-center rounded-xl",
                  coverImage.previewUrl && "bg-slate-950/45 text-white backdrop-blur-[1px]",
                )}
              >
                {coverUploadState === "loading" ? (
                  <>
                    <span className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-[#C8AC59]" />
                    <p className="mt-3 font-bold text-slate-700">{t("create.upload.uploading")}</p>
                  </>
                ) : (
                  <>
                    <FileUp
                      className={cn(
                        "mx-auto h-8 w-8",
                        coverImage.previewUrl ? "text-white" : "text-slate-400",
                      )}
                    />
                    <p className={cn("mt-2 font-bold", coverImage.previewUrl ? "text-white" : "text-slate-700")}>
                      {coverImage.file ? coverImage.file.name : t("create.upload.title")}
                    </p>
                    <p className={cn("text-xs", coverImage.previewUrl ? "text-white/80" : "text-slate-400")}>
                      {t("create.upload.hint")}
                    </p>
                  </>
                )}
              </div>
              }
              
            </button>
            {coverUploadError ? (
              <p className="text-right text-xs font-medium text-rose-500">{coverUploadError}</p>
            ) : null}
          </CourseSectionCard>

          <CourseSectionCard title={t("create.sections.pricing")} icon={Tag}>
            <div className="grid gap-3 md:grid-cols-2">
              {pricingOptions.map((option) => (
                <button
                  key={option.text}
                  type="button"
                  onClick={() => update("pricingType", option.text)}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-center text-sm font-bold transition-colors",
                    draft.pricingType === option.text
                      ? "border-[#C8AC59] bg-[#F8EFD5] text-[#8F6C0B]"
                      : "border-slate-200 bg-slate-50 text-slate-600",
                    "flex flex-col items-center gap-2 justify-center",
                  )}
                >
                  {option.icon}
                  {t(`create.pricing.${option.text}`)}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label={t("create.fields.basePrice")}
                value={draft.basePrice}
                placeholder="299"
                onChange={(value) => update("basePrice", value)}
              />
              <LabeledInput
                label={t("create.fields.offerPrice")}
                value={draft.offerPrice}
                placeholder="150"
                onChange={(value) => update("offerPrice", value)}
              />
            </div>
            {draft.pricingType !== "free" ? (
              <AccessDurationField
                value={accessDurationDays}
                onChange={setAccessDurationDays}
                labels={{
                  title: t("create.accessDuration.title"),
                  lifetime: t("create.accessDuration.lifetime"),
                  limited: t("create.accessDuration.limited"),
                  daysLabel: t("create.accessDuration.daysLabel"),
                  daysPlaceholder: t("create.accessDuration.daysPlaceholder"),
                  helpText: t("create.accessDuration.helpText"),
                  presetDays: (days) => t("create.accessDuration.presetDays", { days }),
                }}
              />
            ) : null}
          </CourseSectionCard>

          <div className="flex justify-end gap-3">
            {/* Draft saving is not shown because `/api/v1/Course` currently creates with `submitForReview`. */}
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-12 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void submit()}
              disabled={submitting}
            >
              {submitting
                ? t("create.actions.saving")
                : isEditMode
                  ? t("create.actions.updateCourse")
                  : t("create.actions.saveCourse")}
            </Button>
          </div>
        </main>
        <aside className="space-y-5">
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h2 className="font-bold">{t("create.preview.title")}</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/60">{t("create.fields.title")}</p>
                <p className="mt-1 font-bold">{draft.title || t("create.preview.titleFallback")}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/60">{t("create.preview.subject")}</p>
                  <p className="font-semibold">{selectedSubjectLabel}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/60">{t("create.preview.grade")}</p>
                  <p className="font-semibold">{selectedGradeLabel}</p>
                </div>
              </div>
              <div className="rounded-xl bg-[#C8AC59] p-3 text-center font-bold flex gap-2 justify-between">
                <p>
                  {t("create.preview.typeOfAccess")}: 
                  {draft.pricingType === "free" ? t("create.preview.free") : t("create.preview.paid")}
                </p>
                {draft.offerPrice}
              </div>
              {/* Learning-path actions are hidden because the create-course API does not accept path data. */}
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-[#BDEFA2] bg-[#E5FFD8] p-4 text-sm text-[#2B6D10] flex gap-2 justify-between">
            <Lightbulb className="mb-2 h-5 w-5" />
            {t("create.tip")}
          </div>
        </aside>
      </div>

      <ModalShell
        open={successOpen}
        onOpenChange={setSuccessOpen}
        overlayClassName="bg-[#2C4260]/45"
        panelClassName="w-[min(95vw,28rem)] p-7 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EFD5] text-[#A17B18]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <ModalTitle className="text-xl font-bold text-slate-800">
          {t("create.success.title")}
        </ModalTitle>
        <ModalDescription className="mt-2 text-sm leading-7 text-slate-800">
          {t("create.success.description")}
        </ModalDescription>
        <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
          {t("create.success.info")}
        </div>
        <div className="mt-6 grid gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-lg border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
            onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST)}
          >
            {t("create.success.later")}
          </Button>
          <Button
            className="h-12 rounded-lg bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
            onClick={() => void handleStartLearningPath()}
            disabled={!createdCourseId}
          >
            {t("create.success.startPaths")}
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BookOpen {...props} />;
}
