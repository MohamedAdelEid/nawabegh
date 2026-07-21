"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CloudUpload,
  Filter,
  GraduationCap,
  HelpCircle,
  Info,
  Rocket,
  Save,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useSchoolEventDetail,
  useSchoolEventKpis,
  useSchoolEventMeta,
  useSchoolEventMutations,
} from "@/modules/school/application/hooks/useSchoolEvents";
import type { UpsertSchoolEventPayload } from "@/modules/school/domain/types/schoolEvents.types";
import { cn } from "@/shared/application/lib/cn";
import { formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { getGrades } from "@/shared/infrastructure/api/grade.api";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { DateTimePicker } from "@/shared/presentation/components/ui/date-time-picker";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { SchoolEventFormSkeleton } from "./SchoolEventsSkeletons";

type GradeOption = { id: number; label: string };

type FormState = {
  title: string;
  type: string;
  description: string;
  rules: string;
  coverImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  wholeSchool: boolean;
  gradeLevelIds: number[];
};

const EMPTY_FORM: FormState = {
  title: "",
  type: "",
  description: "",
  rules: "",
  coverImageUrl: null,
  startsAt: "",
  endsAt: "",
  wholeSchool: true,
  gradeLevelIds: [],
};

function toLocalDateTimeValue(value: string | null | undefined) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function localDateTimeToIso(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

export function SchoolEventCreateView({ eventId }: { eventId?: string }) {
  const t = useTranslations("school.dashboard.events.create");
  const common = useTranslations("school.dashboard.events.common");
  const locale = useLocale();
  const router = useRouter();
  const isEdit = Boolean(eventId);
  const metaQuery = useSchoolEventMeta();
  const kpisQuery = useSchoolEventKpis();
  const detailQuery = useSchoolEventDetail(eventId);
  const mutations = useSchoolEventMutations();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [gradePicker, setGradePicker] = useState("");
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const hydratedRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void getGrades({ pageNumber: 1, pageSize: 200 }).then((rows) => {
      if (cancelled) return;
      setGrades(
        rows.map((grade) => ({
          id: grade.id,
          label: locale.startsWith("ar") ? grade.nameAr || grade.nameEn : grade.nameEn || grade.nameAr,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!isEdit || !detailQuery.data || hydratedRef.current) return;
    const detail = detailQuery.data;
    setForm({
      title: detail.title,
      type: detail.type,
      description: detail.description,
      rules: detail.rules,
      coverImageUrl: detail.coverImageUrl,
      startsAt: toLocalDateTimeValue(detail.startsAt),
      endsAt: toLocalDateTimeValue(detail.endsAt),
      wholeSchool: detail.gradeLevelIds.length === 0,
      gradeLevelIds: detail.gradeLevelIds,
    });
    hydratedRef.current = true;
  }, [detailQuery.data, isEdit]);

  const typeOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.types ?? [];
    if (fromMeta.length > 0) {
      return fromMeta.map((item) => ({ value: item.value, label: item.label }));
    }
    return [
      { value: "sports", label: locale.startsWith("ar") ? "رياضي" : "Sports" },
      { value: "cultural", label: locale.startsWith("ar") ? "ثقافي" : "Cultural" },
      { value: "academic", label: locale.startsWith("ar") ? "أكاديمي" : "Academic" },
      { value: "behavioral", label: locale.startsWith("ar") ? "سلوكي" : "Behavioral" },
      { value: "scientific", label: locale.startsWith("ar") ? "علمي" : "Scientific" },
    ];
  }, [locale, metaQuery.data?.types]);

  const selectedGrades = grades.filter((grade) => form.gradeLevelIds.includes(grade.id));
  const availableGrades = grades.filter((grade) => !form.gradeLevelIds.includes(grade.id));

  const coverPreview = resolveFileUrl(form.coverImageUrl);

  const buildPayload = (publishNow: boolean): UpsertSchoolEventPayload | null => {
    if (!form.title.trim() || !form.type || !form.startsAt || !form.endsAt) return null;
    const startsAt = localDateTimeToIso(form.startsAt);
    const endsAt = localDateTimeToIso(form.endsAt);
    if (!startsAt || !endsAt) return null;
    return {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      rules: form.rules.trim(),
      coverImageUrl: form.coverImageUrl,
      startsAt,
      endsAt,
      gradeLevelIds: form.wholeSchool ? [] : form.gradeLevelIds,
      publishNow,
    };
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify.error(t("messages.uploadError"));
      return;
    }
    try {
      const result = await mutations.uploadImage.mutateAsync(file);
      if (!result.ok) {
        notify.error(result.errorMessage || t("messages.uploadError"));
        return;
      }
      setForm((current) => ({ ...current, coverImageUrl: result.filePath }));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.uploadError"));
    }
  };

  const submit = async (publishNow: boolean) => {
    const payload = buildPayload(publishNow);
    if (!payload) {
      notify.error(t("messages.validation"));
      return;
    }
    setSubmitting(publishNow ? "publish" : "draft");
    try {
      if (isEdit && eventId) {
        await mutations.update.mutateAsync({ id: eventId, payload });
        if (publishNow) {
          await mutations.publish.mutateAsync(eventId);
          notify.success(t("messages.published"));
        } else {
          notify.success(t("messages.updated"));
        }
        router.push(ROUTES.USER.SCHOOL.EVENTS.VIEW(eventId));
      } else {
        const created = await mutations.create.mutateAsync(payload);
        notify.success(publishNow ? t("messages.published") : t("messages.created"));
        if (created.id) {
          router.push(ROUTES.USER.SCHOOL.EVENTS.VIEW(created.id));
        } else {
          router.push(ROUTES.USER.SCHOOL.EVENTS.LIST);
        }
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    } finally {
      setSubmitting(null);
    }
  };

  if (isEdit && detailQuery.isLoading) {
    return <SchoolEventFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">
            {isEdit ? t("editTitle") : t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">
              {formatNumber(kpisQuery.data?.ongoingCount ?? 0, locale)}
            </p>
            <p className="text-xs text-emerald-700/80">{t("kpis.ongoing")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center">
            <p className="text-2xl font-bold text-[#1e3a5f]">
              {formatNumber(kpisQuery.data?.totalCount ?? 0, locale)}
            </p>
            <p className="text-xs text-slate-500">{t("kpis.total")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {[
          { id: 1, label: t("steps.info") },
          { id: 2, label: t("steps.audience") },
          { id: 3, label: t("steps.time") },
        ].map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                index === 0
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {step.id}
            </div>
            <span className={cn("text-sm font-semibold", index === 0 ? "text-[#1e3a5f]" : "text-slate-500")}>
              {step.label}
            </span>
            {index < 2 ? <div className="hidden h-px w-10 bg-slate-200 sm:block" /> : null}
          </div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:p-6"
      >
        <div className="flex items-center gap-2 text-[#1e3a5f]">
          <Info className="size-5" />
          <h2 className="text-lg font-bold">{t("sections.basic")}</h2>
        </div>
        <LabeledInput
          label={t("fields.name")}
          value={form.title}
          onChange={(title) => setForm((current) => ({ ...current, title }))}
          placeholder={t("fields.namePlaceholder")}
        />
        <SearchableSelect
          label={t("fields.type")}
          value={form.type || null}
          onChange={(type) => setForm((current) => ({ ...current, type }))}
          options={typeOptions}
          placeholder={t("fields.typePlaceholder")}
        />
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("fields.description")}</span>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder={t("fields.descriptionPlaceholder")}
            className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("fields.rules")}</span>
          <textarea
            value={form.rules}
            onChange={(event) => setForm((current) => ({ ...current, rules: event.target.value }))}
            placeholder={t("fields.rulesPlaceholder")}
            className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
          />
        </label>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("fields.cover")}</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-[#1e3a5f]/40"
          >
            {coverPreview ? (
              <div className="relative h-40 w-full max-w-md overflow-hidden rounded-xl">
                <Image src={coverPreview} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <>
                <CloudUpload className="size-8 text-slate-400" />
                <span className="font-semibold text-slate-700">{t("fields.coverHint")}</span>
                <span className="text-xs text-slate-500">{t("fields.coverLimit")}</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files?.[0])}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:p-6"
      >
        <div className="flex items-center gap-2 text-emerald-700">
          <Users className="size-5" />
          <h2 className="text-lg font-bold text-[#1e3a5f]">{t("sections.audience")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                wholeSchool: true,
                gradeLevelIds: [],
              }))
            }
            className={cn(
              "rounded-2xl border p-4 text-start transition",
              form.wholeSchool
                ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <GraduationCap className="mb-3 size-6 text-[#1e3a5f]" />
            <p className="font-bold text-[#1e3a5f]">{t("fields.wholeSchool")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("fields.wholeSchoolHint")}</p>
          </button>
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, wholeSchool: false }))}
            className={cn(
              "rounded-2xl border p-4 text-start transition",
              !form.wholeSchool
                ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <Filter className="mb-3 size-6 text-[#1e3a5f]" />
            <p className="font-bold text-[#1e3a5f]">{t("fields.specificGrades")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("fields.specificGradesHint")}</p>
          </button>
        </div>

        {!form.wholeSchool ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedGrades.map((grade) => (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      gradeLevelIds: current.gradeLevelIds.filter((id) => id !== grade.id),
                    }))
                  }
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  {grade.label} ×
                </button>
              ))}
            </div>
            <SearchableSelect
              label={t("fields.addGrade")}
              value={gradePicker || null}
              onChange={(value) => {
                const id = Number(value);
                if (!Number.isFinite(id)) return;
                setForm((current) => ({
                  ...current,
                  gradeLevelIds: current.gradeLevelIds.includes(id)
                    ? current.gradeLevelIds
                    : [...current.gradeLevelIds, id],
                }));
                setGradePicker("");
              }}
              options={availableGrades.map((grade) => ({
                value: String(grade.id),
                label: grade.label,
              }))}
              placeholder={t("fields.addGrade")}
            />
          </div>
        ) : null}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:p-6"
      >
        <div className="flex items-center gap-2 text-amber-600">
          <CalendarDays className="size-5" />
          <h2 className="text-lg font-bold text-[#1e3a5f]">{t("sections.timeline")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("fields.startsAt")}
            </label>
            <DateTimePicker
              value={form.startsAt}
              onChange={(startsAt) => {
                setForm((current) => ({
                  ...current,
                  startsAt,
                  endsAt:
                    current.endsAt && current.endsAt < startsAt
                      ? startsAt
                      : current.endsAt,
                }));
              }}
              locale={locale}
              ariaLabel={t("fields.startsAt")}
              placeholder={t("fields.dateTimePlaceholder")}
              timeLabel={t("fields.time")}
              confirmLabel={t("fields.confirmDate")}
              minDate={isEdit ? new Date(2000, 0, 1) : new Date()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("fields.endsAt")}
            </label>
            <DateTimePicker
              value={form.endsAt}
              onChange={(endsAt) => setForm((current) => ({ ...current, endsAt }))}
              locale={locale}
              ariaLabel={t("fields.endsAt")}
              placeholder={t("fields.dateTimePlaceholder")}
              timeLabel={t("fields.time")}
              confirmLabel={t("fields.confirmDate")}
              minDate={
                form.startsAt && !Number.isNaN(new Date(form.startsAt).getTime())
                  ? new Date(form.startsAt)
                  : isEdit
                    ? new Date(2000, 0, 1)
                    : new Date()
              }
            />
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <HelpCircle className="mt-0.5 size-4 shrink-0" />
          <p>{t("timelineNote")}</p>
        </div>
      </motion.section>

      <div className="flex flex-wrap gap-3">
        <Button
          className="min-h-12 rounded-xl bg-[#1e3a5f] px-6 text-white hover:bg-[#163049]"
          onClick={() => void submit(true)}
          disabled={Boolean(submitting)}
        >
          <Rocket className="size-4" />
          {submitting === "publish" ? common("saving") : t("actions.publish")}
        </Button>
        <Button
          variant="outline"
          className="min-h-12 rounded-xl px-6"
          onClick={() => void submit(false)}
          disabled={Boolean(submitting)}
        >
          <Save className="size-4" />
          {submitting === "draft" ? common("saving") : t("actions.saveDraft")}
        </Button>
      </div>
    </div>
  );
}
