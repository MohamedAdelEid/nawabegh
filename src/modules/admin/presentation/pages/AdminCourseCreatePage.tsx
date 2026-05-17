"use client";

import type React from "react";
import { useRef, useState } from "react";
import { BookOpen, CheckCircle2, Eye, FileUp, Lightbulb, PlayCircle, Route, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { courseManagementData, CoursePricingType, type CoursePricingTypeId } from "@/modules/admin/domain/data/courseManagementData";
import { createCourseDraft } from "@/modules/admin/infrastructure/api/courseManagementApi";
import { CourseSectionCard } from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { ModalDescription, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { cn } from "@/shared/application/lib/cn";
import { MoneyIcon } from "../assets/icons/Money";
import { ReCycleIcon } from "../assets/icons/ReCycle";
import { GiftIcon } from "../assets/icons/Gift";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
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
  }, {
    text: "monthly",
    icon: <ReCycleIcon className="h-6 w-6" />,
    iconTone: "primary",
  },
]

export function AdminCourseCreatePage() {
  const t = useTranslations("admin.dashboard.courseManagement");
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState("basic");
  const [draft, setDraft] = useState(courseManagementData.createDraft);
  const [coverImage, setCoverImage] = useState<{ file: File | null; previewUrl: string | null }>({
    file: null,
    previewUrl: null,
  });
  const [coverUploadState, setCoverUploadState] = useState<"idle" | "loading" | "error">("idle");
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }) as typeof prev);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await createCourseDraft(draft);
    setSubmitting(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("create.messages.error"));
      return;
    }
    setSuccessOpen(true);
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

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("create.title")}
        description={t("create.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.courseManagement"), href: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST },
          { label: t("breadcrumbs.create") },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST)}
            >
              {t("create.actions.saveDraft")}
            </Button>
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-12 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void submit()}
              disabled={submitting}
            >
              {submitting ? t("create.actions.saving") : t("create.actions.saveCourse")}
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
          }, {
            text: "paths",
            icon: <Route />
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
              {(["grade", "term", "teacher", "subject"] as const).map((field) => (
                <label key={field} className="space-y-2 text-right">
                  <span className="text-sm font-semibold text-slate-600">{t(`create.fields.${field}`)}</span>
                  <select
                    value={draft[field]}
                    onChange={(event) => update(field, event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                  >
                    <option value={draft[field]}>{t(`create.options.${field}.${draft[field]}`)}</option>
                  </select>
                </label>
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
            <div className="grid gap-3 md:grid-cols-3">
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
          </CourseSectionCard>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST)}
            >
              {t("create.actions.saveDraft")}
            </Button>
            <Button
              className="h-12 rounded-xl bg-[#C8AC59] px-12 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void submit()}
            >
              {t("create.actions.saveCourse")}
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
                  <p className="font-semibold">{t(`create.options.subject.${draft.subject}`)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-white/60">{t("create.preview.grade")}</p>
                  <p className="font-semibold">{t(`create.options.grade.${draft.grade}`)}</p>
                </div>
              </div>
              <div className="rounded-xl bg-[#C8AC59] p-3 text-center font-bold flex gap-2 justify-between">
                <p>
                  {t("create.preview.typeOfAccess")}: 
                  {draft.pricingType === "free" ? t("create.preview.free") : t("create.preview.paid")}
                </p>
                {draft.offerPrice}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3 text-center">
                  <p className="text-xl font-bold">{draft.lessonCount}</p>
                  <p className="text-xs text-white/60">{t("create.preview.lessons")}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-center">
                  <p className="text-xl font-bold">{draft.pathCount}</p>
                  <p className="text-xs text-white/60">{t("create.preview.paths")}</p>
                </div>
              </div>
              <Button className="h-11 w-full rounded-2xl bg-white text-[#2C4260] hover:bg-white">
                <BookOpen className="h-4 w-4" />
                {t("create.preview.viewPath")}
              </Button>
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-12 rounded-lg border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
            onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST)}
          >
            {t("create.success.later")}
          </Button>
          <Button className="h-12 rounded-lg bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]">
            <PlayCircle className="h-4 w-4" />
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
