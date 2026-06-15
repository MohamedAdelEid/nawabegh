"use client";

import { useRef, useState } from "react";
import { FileUp, Gift, RefreshCw, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useTeacherCreateCourse,
  useTeacherUpdateCourse,
} from "@/modules/teacher/application/hooks/useTeacherCourseMutations";
import { TeacherCourseCreatePreviewSidebar } from "@/modules/teacher/presentation/components/courses/TeacherCourseCreatePreviewSidebar";
import { TeacherCourseCreateSuccessModal } from "@/modules/teacher/presentation/components/courses/TeacherCourseCreateSuccessModal";
import { TeacherCourseFormStepper } from "@/modules/teacher/presentation/components/courses/TeacherCourseFormStepper";
import type { TeacherCoursePricingType } from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { cn } from "@/shared/application/lib/cn";

const GRADE_OPTIONS = [
  { value: "grade-1", labelKey: "courses.create.options.grade1" },
  { value: "grade-2", labelKey: "courses.create.options.grade2" },
  { value: "grade-3", labelKey: "courses.create.options.grade3" },
];

const SUBJECT_OPTIONS = [
  { value: "subject-math", labelKey: "courses.create.options.math" },
  { value: "subject-chem", labelKey: "courses.create.options.chemistry" },
  { value: "subject-physics", labelKey: "courses.create.options.physics" },
];

const TERM_OPTIONS = [
  { value: "1", labelKey: "courses.create.options.term1" },
  { value: "2", labelKey: "courses.create.options.term2" },
  { value: "3", labelKey: "courses.create.options.term3" },
];

const PRICING_OPTIONS: Array<{
  id: TeacherCoursePricingType;
  icon: typeof Gift;
}> = [
  { id: "free", icon: Gift },
  { id: "oneTime", icon: Wallet },
  { id: "monthly", icon: RefreshCw },
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
};

const initialForm: FormState = {
  title: "",
  description: "",
  gradeId: "",
  subjectId: "",
  termId: "2",
  pricingType: "oneTime",
  basePrice: "299",
  offerPrice: "150",
};

export function TeacherCourseCreateDashboard({ courseId }: { courseId?: string }) {
  const isEditMode = Boolean(courseId);
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const createMutation = useTeacherCreateCourse();
  const updateMutation = useTeacherUpdateCourse(courseId ?? "");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const gradeLabel = GRADE_OPTIONS.find((option) => option.value === form.gradeId)?.labelKey;
  const subjectLabel = SUBJECT_OPTIONS.find((option) => option.value === form.subjectId)?.labelKey;

  const submit = async (asDraft: boolean) => {
    void asDraft;
    const payload = {
      title: form.title,
      description: form.description,
      gradeId: form.gradeId,
      subjectId: form.subjectId,
      termId: form.termId,
      pricingType: form.pricingType,
      basePrice: form.basePrice,
      offerPrice: form.offerPrice,
    };

    if (isEditMode && courseId) {
      const result = await updateMutation.mutateAsync(payload);
      router.push(ROUTES.USER.TEACHER.COURSES.DETAILS(result.courseId));
      return;
    }

    const result = await createMutation.mutateAsync(payload);
    setCreatedCourseId(result.courseId);
    setSuccessOpen(true);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={isEditMode ? t("courses.create.editTitle") : t("courses.create.title")}
        description={t("courses.create.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={isSubmitting}
              onClick={() => void submit(true)}
            >
              {t("courses.create.actions.saveDraft")}
            </Button>
            <Button
              className="rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90"
              disabled={isSubmitting}
              onClick={() => void submit(false)}
            >
              {t("courses.create.actions.saveCourse")}
            </Button>
          </div>
        }
      />

      <TeacherCourseFormStepper activeStep="basic" />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <TeacherCourseCreatePreviewSidebar
          title={form.title}
          subjectLabel={subjectLabel ? t(subjectLabel) : ""}
          gradeLabel={gradeLabel ? t(gradeLabel) : ""}
          pricingType={form.pricingType}
          offerPrice={form.offerPrice}
          pathCount={2}
          lessonCount={13}
        />

        <div className="space-y-6">
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
                  options={[
                    { value: "", label: t("courses.create.fields.gradePlaceholder") },
                    ...GRADE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: t(option.labelKey),
                    })),
                  ]}
                />
                <LabeledSelect
                  label={t("courses.create.fields.term")}
                  value={form.termId}
                  onChange={(value) => update("termId", value)}
                  options={TERM_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey),
                  }))}
                />
              </div>

              <LabeledSelect
                label={t("courses.create.fields.subject")}
                value={form.subjectId}
                onChange={(value) => update("subjectId", value)}
                options={[
                  { value: "", label: t("courses.create.fields.subjectPlaceholder") },
                  ...SUBJECT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey),
                  })),
                ]}
              />

              <div className="space-y-2 text-right">
                <p className="text-sm font-medium text-slate-700">{t("courses.create.fields.cover")}</p>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-slate-500 transition hover:border-[#2C4260]/40"
                >
                  <FileUp className="h-8 w-8" />
                  <span className="text-sm">{t("courses.create.fields.coverHint")}</span>
                  <span className="text-xs text-slate-400">{t("courses.create.fields.coverRequirements")}</span>
                </button>
                <input ref={coverInputRef} type="file" accept="image/png,image/jpeg" className="hidden" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.create.sections.pricing")}
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
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

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={isSubmitting}
              onClick={() => void submit(true)}
            >
              {t("courses.create.actions.saveDraft")}
            </Button>
            <Button
              className="rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90"
              disabled={isSubmitting}
              onClick={() => void submit(false)}
            >
              {t("courses.create.actions.saveCourse")}
            </Button>
          </div>
        </div>
      </div>

      <TeacherCourseCreateSuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        courseId={createdCourseId}
      />
    </div>
  );
}
