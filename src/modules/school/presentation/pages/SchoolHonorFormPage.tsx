"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useSchoolHonoredStudent,
  useSchoolHonorMutations,
  useSchoolStudentSearch,
} from "@/modules/school/application/hooks/useSchoolHonorBoard";
import type { SchoolStudentSearchResult } from "@/modules/school/domain/types/schoolHonorBoard.types";
import { SchoolHonorBoardSkeleton } from "@/modules/school/presentation/components/honor-board/SchoolHonorBoardSkeleton";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import {
  DashboardPageHeader,
  DashboardSearchFilter,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";

interface FormState {
  reason: string;
  reasonDetails: string;
  displayOrder: string;
  durationDays: string;
  achievementImageUrl: string;
  publishNow: boolean;
}

const INITIAL_FORM: FormState = {
  reason: "",
  reasonDetails: "",
  displayOrder: "1",
  durationDays: "7",
  achievementImageUrl: "",
  publishNow: true,
};

export function SchoolHonorFormPage({ honorId }: { honorId?: string }) {
  const t = useTranslations("school.dashboard.honorBoard");
  const tDash = useTranslations("school.dashboard");
  const router = useRouter();
  const isEdit = Boolean(honorId);
  const detailQuery = useSchoolHonoredStudent(honorId);
  const { create, update, uploadImage } = useSchoolHonorMutations();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<SchoolStudentSearchResult | null>(null);
  const [validationError, setValidationError] = useState("");
  const studentQuery = useSchoolStudentSearch(studentSearch);
  const detail = detailQuery.data;
  const isSaving = create.isPending || update.isPending || uploadImage.isPending;
  const achievementImagePreviewUrl = resolveFileUrl(form.achievementImageUrl);

  useEffect(() => {
    if (!detail) return;
    setSelectedStudent({
      userId: detail.studentUserId,
      studentProfileId: "",
      fullName: detail.fullName,
      profileImageUrl: detail.profileImageUrl,
      gradeLabel: detail.gradeLabel,
      referenceCode: detail.referenceCode,
    });
    setForm({
      reason: detail.reason,
      reasonDetails: detail.reasonDetails ?? "",
      displayOrder: String(detail.displayOrder),
      durationDays: String(detail.durationDays),
      achievementImageUrl: detail.achievementImageUrl ?? "",
      publishNow: detail.isVisible,
    });
  }, [detail]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error(t("form.validation.image"));
      return;
    }
    try {
      const url = await uploadImage.mutateAsync(file);
      setField("achievementImageUrl", url);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("form.messages.uploadError"));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError("");
    if (!selectedStudent) {
      setValidationError(t("form.validation.student"));
      return;
    }
    if (!form.reason.trim()) {
      setValidationError(t("form.validation.reason"));
      return;
    }
    const durationDays = Number(form.durationDays);
    const displayOrder = Number(form.displayOrder);
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
      setValidationError(t("form.validation.duration"));
      return;
    }
    if (!Number.isInteger(displayOrder) || displayOrder < 1) {
      setValidationError(t("form.validation.order"));
      return;
    }
    const payload = {
      studentUserId: selectedStudent.userId,
      reason: form.reason.trim(),
      reasonDetails: form.reasonDetails.trim() || null,
      displayOrder,
      durationDays,
      achievementImageUrl: form.achievementImageUrl || null,
      publishNow: form.publishNow,
    };
    try {
      if (honorId) await update.mutateAsync({ id: honorId, payload });
      else await create.mutateAsync(payload);
      notify.success(t(isEdit ? "form.messages.updated" : "form.messages.created"));
      router.push(ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.actionError"));
    }
  };

  if (isEdit && detailQuery.isLoading) return <SchoolHonorBoardSkeleton tableOnly />;

  return (
    <SchoolPageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <DashboardPageHeader
          title={t(isEdit ? "form.editTitle" : "form.createTitle")}
          description={t("form.subtitle")}
          breadcrumbs={[
            { label: tDash("sidebar.nav.home"), href: ROUTES.USER.SCHOOL.HOME },
            {
              label: tDash("sidebar.nav.honoredStudents"),
              href: ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS,
            },
            { label: t(isEdit ? "form.editTitle" : "form.createTitle") },
          ]}
          action={
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS}>
                {t("common.back")}
              </Link>
            </Button>
          }
        />

        {detailQuery.isError ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {t("common.loadError")}
          </p>
        ) : null}

        <form onSubmit={handleSubmit}>
          <DashboardTableCard
            footer={
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-12 rounded-xl bg-[#2C4260] px-7 text-white hover:bg-[#243751]"
                >
                  {create.isPending || update.isPending
                    ? t("common.saving")
                    : t(isEdit ? "form.save" : "form.publish")}
                </Button>
                <Button asChild type="button" variant="outline" className="h-12 rounded-xl">
                  <Link href={ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS}>
                    {t("common.cancel")}
                  </Link>
                </Button>
              </div>
            }
          >
            <div className="space-y-7 p-6 sm:p-8">
              <section className="space-y-3">
                <label className="text-sm font-medium text-slate-600">
                  {t("form.fields.student")}
                </label>
                {selectedStudent ? (
                  <div className="flex items-center justify-between rounded-2xl border border-[#DCE6F5] bg-[#F7FAFF] p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatarImageOrInitials
                        trackKey={selectedStudent.userId}
                        name={selectedStudent.fullName}
                        imageUrl={selectedStudent.profileImageUrl}
                        circleClassName="bg-[#DCE6F5] text-[#2C4260]"
                      />
                      <div className="text-start">
                        <p className="font-bold text-slate-800">{selectedStudent.fullName}</p>
                        <p className="text-xs text-slate-500">{selectedStudent.gradeLabel}</p>
                      </div>
                    </div>
                    {!isEdit ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStudent(null);
                          setStudentSearch("");
                        }}
                        aria-label={t("form.clearStudent")}
                        className="rounded-lg text-slate-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <DashboardSearchFilter
                      label={t("form.fields.student")}
                      placeholder={t("form.fields.studentSearch")}
                      value={studentSearch}
                      onChange={setStudentSearch}
                    />
                    {studentSearch.trim().length >= 2 ? (
                      <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-lg">
                        {studentQuery.isLoading ? (
                          <p className="p-4 text-center text-sm text-slate-400">
                            {t("common.loading")}
                          </p>
                        ) : studentQuery.data?.length ? (
                          studentQuery.data.map((student) => (
                            <button
                              key={student.userId}
                              type="button"
                              onClick={() => setSelectedStudent(student)}
                              className="flex w-full items-center gap-3 rounded-xl p-3 text-start hover:bg-slate-50"
                            >
                              <UserAvatarImageOrInitials
                                trackKey={student.userId}
                                name={student.fullName}
                                imageUrl={student.profileImageUrl}
                                circleClassName="bg-[#DCE6F5] text-[#2C4260]"
                              />
                              <div>
                                <p className="font-semibold text-slate-800">{student.fullName}</p>
                                <p className="text-xs text-slate-400">{student.gradeLabel}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="p-4 text-center text-sm text-slate-400">
                            {t("form.studentEmpty")}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </section>

              <LabeledInput
                label={t("form.fields.reason")}
                value={form.reason}
                onChange={(value) => setField("reason", value)}
                placeholder={t("form.fields.reasonPlaceholder")}
              />
              <LabeledTextarea
                label={t("form.fields.details")}
                value={form.reasonDetails}
                onChange={(value) => setField("reasonDetails", value)}
                placeholder={t("form.fields.detailsPlaceholder")}
                maxLength={4000}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <LabeledInput
                  type="number"
                  label={t("form.fields.duration")}
                  value={form.durationDays}
                  onChange={(value) => setField("durationDays", value)}
                  placeholder="7"
                />
                <LabeledInput
                  type="number"
                  label={t("form.fields.order")}
                  value={form.displayOrder}
                  onChange={(value) => setField("displayOrder", value)}
                  placeholder="1"
                />
              </div>

              <section className="space-y-3">
                <label className="text-sm font-medium text-slate-600">
                  {t("form.fields.image")}
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex h-28 w-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 hover:border-[#C7AF6E]">
                    <ImagePlus className="h-6 w-6" />
                    {uploadImage.isPending ? t("common.loading") : t("form.upload")}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadImage.isPending}
                      onChange={(event) => void handleImage(event.target.files?.[0])}
                    />
                  </label>
                  {achievementImagePreviewUrl ? (
                    <div className="relative h-28 w-36 overflow-hidden rounded-2xl border border-slate-100">
                      <img
                        src={achievementImagePreviewUrl}
                        alt={t("form.imagePreview")}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setField("achievementImageUrl", "")}
                        className="absolute end-2 top-2 h-8 w-8 rounded-full bg-white/90 text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </section>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <StatusSwitch
                  checked={form.publishNow}
                  onChange={(checked) => setField("publishNow", checked)}
                  activeLabel={t("form.fields.publishNow")}
                  inactiveLabel={t("form.fields.publishNow")}
                />
                <span className="text-sm font-semibold text-slate-700">
                  {t("form.fields.publishNow")}
                </span>
              </div>

              {validationError ? (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {validationError}
                </p>
              ) : null}
            </div>
          </DashboardTableCard>
        </form>
      </div>
    </SchoolPageTransition>
  );
}
