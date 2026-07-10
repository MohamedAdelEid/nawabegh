"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Gift, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useTeacherCreateCourse,
  useTeacherUpdateCourse,
} from "@/modules/teacher/application/hooks/useTeacherCourseMutations";
import { useTeacherCourseForEdit } from "@/modules/teacher/application/hooks/useTeacherCourseDetails";
import { TeacherCourseCreatePreviewSidebar } from "@/modules/teacher/presentation/components/courses/TeacherCourseCreatePreviewSidebar";
import { TeacherCourseCreateSuccessModal } from "@/modules/teacher/presentation/components/courses/TeacherCourseCreateSuccessModal";
import { TeacherCourseFormStepper } from "@/modules/teacher/presentation/components/courses/TeacherCourseFormStepper";
import type { TeacherCoursePricingType } from "@/modules/teacher/domain/types/teacher.types";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { getGrades } from "@/shared/infrastructure/api/grade.api";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { TeacherCourseFormSkeleton } from "@/modules/teacher/presentation/components/courses/TeacherCourseFormSkeleton";
import { cn } from "@/shared/application/lib/cn";

const COURSE_COVER_UPLOAD_FOLDER = "courses";

const PRICING_OPTIONS: Array<{
  id: TeacherCoursePricingType;
  icon: typeof Gift;
}> = [
  { id: "free", icon: Gift },
  { id: "oneTime", icon: Wallet },
];

type FormState = {
  title: string;
  description: string;
  gradeId: string;
  subjectId: string;
  termId: string;
  pricingType: TeacherCoursePricingType;
  basePrice: string;
  offerPrice: string;
  coverImageUrl?: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  gradeId: "",
  subjectId: "",
  termId: "1",
  pricingType: "oneTime",
  basePrice: "",
  offerPrice: "",
};

type SelectOption = { value: string; label: string };

type SubmitErrorState = {
  message: string;
};

export function TeacherCourseCreateDashboard({ courseId }: { courseId?: string }) {
  const isEditMode = Boolean(courseId);
  const t = useTranslations("teacher.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [gradeOptions, setGradeOptions] = useState<SelectOption[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SelectOption[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitErrorState | null>(null);

  const createMutation = useTeacherCreateCourse();
  const updateMutation = useTeacherUpdateCourse(courseId ?? "");
  const { data: editData, isLoading: editLoading } = useTeacherCourseForEdit(courseId ?? "");

  useEffect(() => {
    let alive = true;
    const loadLookups = async () => {
      setLookupsLoading(true);
      try {
        const [grades, subjectsResult] = await Promise.all([
          getGrades({ pageNumber: 1, pageSize: 100 }),
          getSubjectsPage({ pageNumber: 1, pageSize: 100 }),
        ]);
        if (!alive) return;
        setGradeOptions(
          grades.map((grade) => ({
            value: String(grade.id),
            label: locale.startsWith("ar") ? grade.nameAr : grade.nameEn,
          })),
        );
        setSubjectOptions(
          (subjectsResult.data?.rows ?? []).map((subject) => ({
            value: String(subject.id),
            label: locale.startsWith("ar") ? subject.nameAr : subject.nameEn,
          })),
        );
      } catch (error) {
        notify.error(error instanceof Error ? error.message : t("common.error"));
      } finally {
        if (alive) setLookupsLoading(false);
      }
    };
    void loadLookups();
    return () => {
      alive = false;
    };
  }, [locale, t]);

  useEffect(() => {
    if (!editData) return;
    setForm({
      title: editData.title,
      description: editData.description,
      gradeId: editData.gradeId,
      subjectId: editData.subjectId,
      termId: editData.termId,
      pricingType: editData.pricingType,
      basePrice: editData.basePrice,
      offerPrice: editData.offerPrice,
      coverImageUrl: editData.coverImageUrl,
    });
  }, [editData]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setSubmitError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validatePricing = () => {
    if (form.pricingType === "free") return true;

    const basePrice = Number(form.basePrice);
    const offerPrice = Number(form.offerPrice);

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      setSubmitError({ message: t("courses.create.validation.basePriceRequired") });
      return false;
    }

    if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
      setSubmitError({ message: t("courses.create.validation.offerPriceRequired") });
      return false;
    }

    if (offerPrice >= basePrice) {
      setSubmitError({ message: t("courses.create.validation.discountedPriceLessThanOriginal") });
      return false;
    }

    return true;
  };

  const gradeLabel = gradeOptions.find((option) => option.value === form.gradeId)?.label ?? "";
  const subjectLabel = subjectOptions.find((option) => option.value === form.subjectId)?.label ?? "";

  const handleCoverPick = async (file: File | null) => {
    if (!file) return;
    setUploadingCover(true);
    const upload = await uploadAdminFile(file, COURSE_COVER_UPLOAD_FOLDER);
    setUploadingCover(false);
    if (!upload.ok) {
      notify.error(upload.errorMessage);
      return;
    }
    update("coverImageUrl", upload.filePath);
  };

  const submit = async (asDraft: boolean) => {
    setSubmitError(null);

    if (!form.title.trim() || !form.gradeId || !form.subjectId) {
      setSubmitError({ message: t("courses.create.validation.required") });
      return;
    }

    if (!validatePricing()) {
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      gradeId: form.gradeId,
      subjectId: form.subjectId,
      termId: form.termId,
      pricingType: form.pricingType,
      basePrice: form.basePrice,
      offerPrice: form.offerPrice,
      coverImageUrl: form.coverImageUrl,
    };

    try {
      if (isEditMode && courseId) {
        const result = await updateMutation.mutateAsync(payload);
        router.push(ROUTES.USER.TEACHER.COURSES.DETAILS(result.courseId));
        return;
      }

      const result = await createMutation.mutateAsync({
        payload,
        submitForReview: !asDraft,
      });
      setCreatedCourseId(result.courseId);
      setSuccessOpen(true);
    } catch (error) {
      setSubmitError({
        message: error instanceof Error ? error.message : t("common.error"),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && editLoading) {
    return <TeacherCourseFormSkeleton label={t("common.loading")} />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={isEditMode ? t("courses.create.editTitle") : t("courses.create.title")}
        description={t("courses.create.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50 shadow-[var(--dashboard-shadow-button)]"
              disabled={isSubmitting || lookupsLoading}
              onClick={() => void submit(true)}
            >
              {t("courses.create.actions.saveDraft")}
            </Button>
            <Button
              className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white hover:bg-[#243751] cursor-pointer shadow-[var(--dashboard-shadow-button)]"
              disabled={isSubmitting || lookupsLoading}
              onClick={() => void submit(false)}
            >
              {isEditMode
                ? t("courses.create.actions.saveCourse")
                : t("courses.create.actions.submitForReview")}
            </Button>
          </div>
        }
      />

      {/* <TeacherCourseFormStepper activeStep="basic" /> */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {submitError ? (
            <ApiFailureAlert
              message={submitError.message}
              fallbackMessage={t("common.error")}
            />
          ) : null}

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.create.sections.basic")}
              </h2>

              <LabeledInput
                label={t("courses.create.fields.title")}
                value={form.title}
                onChange={(value) => update("title", value)}
                placeholder={t("courses.create.fields.titlePlaceholder")}
              />

              <LabeledTextarea
                label={t("courses.create.fields.description")}
                value={form.description}
                onChange={(value) => update("description", value)}
                placeholder={t("courses.create.fields.descriptionPlaceholder")}
                rows={5}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <LabeledSelect
                  label={t("courses.create.fields.grade")}
                  value={form.gradeId}
                  onChange={(value) => update("gradeId", value)}
                  disabled={lookupsLoading}
                  options={[
                    { value: "", label: t("courses.create.fields.gradePlaceholder") },
                    ...gradeOptions,
                  ]}
                />
                <LabeledSelect
                  label={t("courses.create.fields.term")}
                  value={form.termId}
                  onChange={(value) => update("termId", value)}
                  options={[
                    { value: "1", label: t("courses.create.options.term1") },
                    { value: "2", label: t("courses.create.options.term2") },
                    { value: "3", label: t("courses.create.options.term3") },
                  ]}
                />
              </div>

              <LabeledSelect
                label={t("courses.create.fields.subject")}
                value={form.subjectId}
                onChange={(value) => update("subjectId", value)}
                disabled={lookupsLoading}
                options={[
                  { value: "", label: t("courses.create.fields.subjectPlaceholder") },
                  ...subjectOptions,
                ]}
              />

              <div className="space-y-2 text-right">
                <p className="text-sm font-medium text-slate-700">{t("courses.create.fields.cover")}</p>
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-slate-500 transition hover:border-[#2C4260]/40"
                >
                  <FileUp className="h-8 w-8" />
                  <span className="text-sm">
                    {uploadingCover
                      ? t("courses.create.fields.coverUploading")
                      : form.coverImageUrl
                        ? t("courses.create.fields.coverUploaded")
                        : t("courses.create.fields.coverHint")}
                  </span>
                  <span className="text-xs text-slate-400">{t("courses.create.fields.coverRequirements")}</span>
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) => void handleCoverPick(event.target.files?.[0] ?? null)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.create.sections.pricing")}
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {PRICING_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = form.pricingType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => update("pricingType", option.id)}
                      className={cn(
                        "rounded-2xl border-2 p-5 text-right transition",
                        selected
                          ? "border-[#C9A227] bg-amber-50"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200",
                      )}
                    >
                      <Icon className="mb-3 h-6 w-6 text-[#2C4260]" />
                      <p className="font-semibold text-slate-800">
                        {t(`courses.create.pricing.${option.id}`)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {form.pricingType !== "free" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <LabeledInput
                    label={t("courses.create.fields.basePrice")}
                    value={form.basePrice}
                    onChange={(value) => update("basePrice", value)}
                    placeholder="0"
                  />
                  <LabeledInput
                    label={t("courses.create.fields.offerPrice")}
                    value={form.offerPrice}
                    onChange={(value) => update("offerPrice", value)}
                    placeholder="0"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <TeacherCourseCreatePreviewSidebar
          title={form.title}
          subjectLabel={subjectLabel}
          gradeLabel={gradeLabel}
          pricingType={form.pricingType}
          offerPrice={form.offerPrice}
          coverImageUrl={form.coverImageUrl}
        />
      </div>

      <TeacherCourseCreateSuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        courseId={createdCourseId}
      />
    </div>
  );
}
