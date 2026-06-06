"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  CloudUpload,
  GraduationCap,
  LayoutGrid,
  PanelTop,
  Send,
  SquareArrowOutUpRight,
  Users,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdCreateWizardStepId, AdCreateWizardValues } from "@/modules/admin/domain/types/adCreateWizard.types";
import type { AdDisplayType, AdPublishMode, AdTargetAudience, InAppAdPlacement } from "@/modules/admin/domain/types/adManagement.types";
import {
  defaultPlacementForType,
  PLACEMENTS_BY_TYPE,
} from "@/modules/admin/presentation/lib/adCreateMappers";
import { AdCreateLivePreview } from "@/modules/admin/presentation/components/ad-management/AdCreateLivePreview";
import { cn } from "@/shared/application/lib/cn";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";

const AD_TYPES: AdDisplayType[] = ["banner", "popup", "card"];
const AUDIENCES: AdTargetAudience[] = ["all", "students", "parents", "teachers"];
const PUBLISH_MODES: AdPublishMode[] = ["now", "schedule"];

type StepProps = {
  values: AdCreateWizardValues;
  onChange: (patch: Partial<AdCreateWizardValues>) => void;
  schoolOptions?: Array<{ value: string; label: string }>;
  gradeOptions?: Array<{ value: string; label: string }>;
  subjectOptions?: Array<{ value: string; label: string }>;
};

export function AdCreateContentStep({ values, onChange }: StepProps) {
  const t = useTranslations("admin.dashboard.adManagement.create.content");

  return (
    <div className="space-y-6 rounded-[1.75rem] border border-white/80 bg-white p-6 md:p-8 shadow-[0px_8px_0px_0px_#0000000D]">
      <LabeledInput
        label={t("title.label")}
        value={values.title}
        onChange={(title) => onChange({ title })}
        placeholder={t("title.placeholder")}
      />
      <LabeledTextarea
        label={t("description.label")}
        value={values.description}
        onChange={(description) => onChange({ description })}
        placeholder={t("description.placeholder")}
        rows={5}
      />
      <div className="space-y-2 text-right">
        <label className="text-sm text-[#64748B]">{t("media.label")}</label>
        <label className="flex min-h-[10rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 transition hover:border-[#C7AF6E]/50">
          <CloudUpload className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">{t("media.hint")}</p>
          <p className="text-xs text-slate-400">{t("media.formats")}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,video/mp4"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onChange({ mediaFile: file, mediaUrl: "" });
            }}
          />
          {values.mediaFile ? (
            <p className="text-xs font-semibold text-[#2C4260]">{values.mediaFile.name}</p>
          ) : null}
        </label>
      </div>
      <LabeledInput
        label={t("cta.label")}
        value={values.ctaText}
        onChange={(ctaText) => onChange({ ctaText })}
        placeholder={t("cta.placeholder")}
      />
      <LabeledInput
        label={t("ctaUrl.label")}
        value={values.ctaUrl}
        onChange={(ctaUrl) => onChange({ ctaUrl })}
        placeholder={t("ctaUrl.placeholder")}
      />
    </div>
  );
}

export function AdCreateTypeStep({ values, onChange }: StepProps) {
  const t = useTranslations("admin.dashboard.adManagement.create.type");
  const placementOptions = PLACEMENTS_BY_TYPE[values.type];

  const icons: Record<AdDisplayType, React.ReactNode> = {
    banner: <PanelTop className="h-6 w-6" />,
    popup: <SquareArrowOutUpRight className="h-6 w-6" />,
    card: <LayoutGrid className="h-6 w-6" />,
  };

  const handleTypeChange = (type: AdDisplayType) => {
    const allowedPlacements = PLACEMENTS_BY_TYPE[type];
    const nextPlacement = allowedPlacements.includes(values.placement)
      ? values.placement
      : defaultPlacementForType(type);
    onChange({ type, placement: nextPlacement });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {AD_TYPES.map((type) => {
          const selected = values.type === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={cn(
                "relative rounded-[1.75rem] border-2 bg-white p-6 text-right transition shadow-[0px_4px_0px_0px_#0000000D]",
                selected ? "border-[#C7AF6E]" : "border-slate-100 hover:border-slate-200",
              )}
            >
              {selected ? (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C7AF6E]">
                  <Check className="h-4 w-4" />
                  {t("selected")}
                </span>
              ) : null}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[#2C4260]">
                {icons[type]}
              </div>
              <p className="text-lg font-bold text-slate-800">{t(`options.${type}.title`)}</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">{t(`options.${type}.description`)}</p>
            </button>
          );
        })}
      </div>
      <div className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
        <LabeledSelect
          label={t("placement.label")}
          value={values.placement}
          onChange={(placement) => onChange({ placement: placement as InAppAdPlacement })}
          options={placementOptions.map((placement) => ({
            value: placement,
            label: t(`placement.options.${placement}`),
          }))}
        />
      </div>
      <div className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
        <p className="mb-4 text-lg font-bold text-slate-800">{t("livePreview")}</p>
        <AdCreateLivePreview values={values} />
      </div>
    </div>
  );
}

export function AdCreateTargetingStep({
  values,
  onChange,
  schoolOptions = [],
  gradeOptions = [],
  subjectOptions = [],
}: StepProps) {
  const t = useTranslations("admin.dashboard.adManagement.create.targeting");

  const audienceCards: Array<{ id: AdTargetAudience; icon: React.ReactNode }> = [
    { id: "all", icon: <Users className="h-6 w-6" /> },
    { id: "students", icon: <GraduationCap className="h-6 w-6" /> },
    { id: "parents", icon: <UserRound className="h-6 w-6" /> },
    { id: "teachers", icon: <UserRound className="h-6 w-6" /> },
  ];

  const toggleSubject = (subjectId: string) => {
    const exists = values.subjectIds.includes(subjectId);
    onChange({
      subjectIds: exists
        ? values.subjectIds.filter((id) => id !== subjectId)
        : [...values.subjectIds, subjectId],
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6 rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
        <Input
          placeholder={t("searchPlaceholder")}
          className="h-14 rounded-2xl border-slate-100 text-right"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {audienceCards.slice(0, 3).map(({ id, icon }) => {
            const selected = values.audience === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ audience: id })}
                className={cn(
                  "rounded-2xl border-2 p-4 text-right transition",
                  selected ? "border-[#2C4260] bg-[#2C4260]/5" : "border-slate-100",
                )}
              >
                <div className="mb-3 text-[#2C4260]">{icon}</div>
                <p className="font-semibold text-slate-800">{t(`audience.${id}`)}</p>
              </button>
            );
          })}
        </div>
        <LabeledSelect
          label={t("school.label")}
          value={values.schoolId}
          onChange={(schoolId) => onChange({ schoolId })}
          options={[
            { value: "", label: t("school.all") },
            ...schoolOptions,
          ]}
        />
        <LabeledSelect
          label={t("grade.label")}
          value={values.gradeLevelId}
          onChange={(gradeLevelId) => onChange({ gradeLevelId })}
          options={[
            { value: "", label: t("grade.all") },
            ...gradeOptions,
          ]}
        />
        <div className="space-y-2 text-right">
          <label className="text-sm text-[#64748B]">{t("subjects.label")}</label>
          <div className="flex flex-wrap gap-2">
            {values.subjectIds.map((id) => {
              const label = subjectOptions.find((o) => o.value === id)?.label ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSubject(id)}
                  className="rounded-full bg-[#2C4260] px-3 py-1 text-xs font-semibold text-white"
                >
                  {label} ×
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {subjectOptions
              .filter((o) => !values.subjectIds.includes(o.value))
              .map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleSubject(option.value)}
                  className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-[#C7AF6E]"
                >
                  + {option.label}
                </button>
              ))}
          </div>
        </div>
      </div>
      <aside className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0px_8px_0px_0px_#0000000D] lg:sticky lg:top-6">
        <p className="text-lg font-bold text-slate-800">{t("summary.title")}</p>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400">{t("summary.estimatedAudience")}</p>
          <p className="text-2xl font-bold text-[#2C4260]">12,450</p>
        </div>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>
            <span className="text-slate-400">{t("summary.category")}: </span>
            {t(`audience.${values.audience}`)}
          </li>
          <li>
            <span className="text-slate-400">{t("summary.schools")}: </span>
            {values.schoolId
              ? schoolOptions.find((o) => o.value === values.schoolId)?.label
              : t("school.all")}
          </li>
          <li>
            <span className="text-slate-400">{t("summary.subjects")}: </span>
            {values.subjectIds.length || t("subjects.none")}
          </li>
        </ul>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-6 text-emerald-800">
          {t("summary.tip")}
        </div>
        <AdCreateLivePreview values={values} />
      </aside>
    </div>
  );
}

export function AdCreateSchedulingStep({ values, onChange }: StepProps) {
  const t = useTranslations("admin.dashboard.adManagement.create.scheduling");
  const modeOptions = PUBLISH_MODES.map((id) => ({
    id,
    label: t(`mode.${id}.title`),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-6">
        <DashboardSegmentedControl
          value={values.publishMode}
          options={modeOptions}
          onChange={(publishMode) => onChange({ publishMode: publishMode as AdPublishMode })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {PUBLISH_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ publishMode: mode })}
              className={cn(
                "rounded-2xl border-2 p-5 text-right transition",
                values.publishMode === mode ? "border-[#2C4260]" : "border-slate-100",
              )}
            >
              <div className="mb-3 text-[#2C4260]">
                {mode === "now" ? <Send className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
              </div>
              <p className="font-bold text-slate-800">{t(`mode.${mode}.title`)}</p>
              <p className="mt-1 text-sm text-slate-500">{t(`mode.${mode}.description`)}</p>
            </button>
          ))}
        </div>
        {values.publishMode === "schedule" ? (
          <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D] sm:grid-cols-2">
            {(
              [
                ["startDate", values.startDate, t("startDate"), "date"],
                ["startTime", values.startTime, t("startTime"), "time"],
                ["endDate", values.endDate, t("endDate"), "date"],
                ["endTime", values.endTime, t("endTime"), "time"],
              ] as const
            ).map(([key, fieldValue, label, inputType]) => (
              <label key={key} className="space-y-2 text-right">
                <span className="text-sm text-[#64748B]">{label}</span>
                <Input
                  type={inputType}
                  value={fieldValue}
                  onChange={(event) => onChange({ [key]: event.target.value })}
                  className="h-14 rounded-2xl border-slate-100 text-right"
                />
              </label>
            ))}
          </div>
        ) : null}
      </div>
      <aside className="space-y-4 rounded-[1.75rem] border border-amber-100 bg-amber-50 p-5">
        <p className="font-semibold text-amber-900">{t("tip.title")}</p>
        <p className="text-sm leading-7 text-amber-800">{t("tip.body")}</p>
        <p className="text-xs text-amber-700">{t("tip.timezone")}</p>
      </aside>
    </div>
  );
}

export function AdCreatePreviewStep({
  values,
  onPublish,
  onSaveDraft,
  isSubmitting,
}: Omit<StepProps, "onChange"> & {
  onPublish: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}) {
  const t = useTranslations("admin.dashboard.adManagement.create.previewStep");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
        <p className="text-lg font-bold text-slate-800">{t("summaryTitle")}</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-400">{t("sections.content")}</p>
            <p className="font-semibold text-slate-800">{values.title || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">{t("sections.type")}</p>
            <p className="font-semibold text-slate-800">{values.type}</p>
          </div>
          <div>
            <p className="text-slate-400">{t("sections.placement")}</p>
            <p className="font-semibold text-slate-800">{values.placement}</p>
          </div>
          <div>
            <p className="text-slate-400">{t("sections.targeting")}</p>
            <p className="font-semibold text-slate-800">{values.audience}</p>
          </div>
        </div>
        <Button
          type="button"
          className="h-12 w-full rounded-2xl bg-[#C7AF6E] text-[#2C4260] hover:bg-[#b89d5e]"
          onClick={onPublish}
          disabled={isSubmitting}
        >
          {t("publishNow")}
        </Button>
        <Button type="button" variant="outline" className="h-12 w-full rounded-2xl" onClick={onSaveDraft}>
          {t("saveDraft")}
        </Button>
      </aside>
      <div className="space-y-4">
        <DashboardSegmentedControl
          value={viewport}
          options={[
            { id: "desktop", label: t("viewport.desktop") },
            { id: "mobile", label: t("viewport.mobile") },
          ]}
          onChange={(v) => setViewport(v as "desktop" | "mobile")}
        />
        <AdCreateLivePreview values={values} variant="browser" viewport={viewport} />
      </div>
    </div>
  );
}
