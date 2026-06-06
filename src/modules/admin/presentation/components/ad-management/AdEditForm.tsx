"use client";

import { CloudUpload, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdEditFormValues } from "@/modules/admin/presentation/lib/adEditMappers";
import type { AdDisplayType } from "@/modules/admin/domain/types/adManagement.types";
import { AdCreateLivePreview } from "@/modules/admin/presentation/components/ad-management/AdCreateLivePreview";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";

const AD_TYPES: AdDisplayType[] = ["popup", "banner"];

type AdEditFormProps = {
  values: AdEditFormValues;
  onChange: (patch: Partial<AdEditFormValues>) => void;
  schoolOptions: Array<{ value: string; label: string }>;
  gradeOptions: Array<{ value: string; label: string }>;
  subjectOptions: Array<{ value: string; label: string }>;
  isSubmitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function AdEditForm({
  values,
  onChange,
  schoolOptions,
  gradeOptions,
  subjectOptions,
  isSubmitting,
  onSubmit,
  onCancel,
}: AdEditFormProps) {
  const t = useTranslations("admin.dashboard.adManagement.edit");

  const toggleSubject = (subjectId: string) => {
    const exists = values.subjectIds.includes(subjectId);
    onChange({
      subjectIds: exists
        ? values.subjectIds.filter((id) => id !== subjectId)
        : [...values.subjectIds, subjectId],
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0px_8px_0px_0px_#0000000D]">
          <h3 className="mb-4 font-bold text-slate-800">{t("sidebar.displayType")}</h3>
          {AD_TYPES.map((type) => (
            <label
              key={type}
              className={cn(
                "mb-3 flex cursor-pointer gap-3 rounded-2xl border p-3 text-right",
                values.type === type ? "border-[#2C4260] bg-[#2C4260]/5" : "border-slate-100",
              )}
            >
              <input
                type="radio"
                name="ad-type"
                className="mt-1"
                checked={values.type === type}
                onChange={() => onChange({ type })}
              />
              <span>
                <span className="block font-semibold text-slate-800">{t(`types.${type}.title`)}</span>
                <span className="text-xs text-slate-500">{t(`types.${type}.description`)}</span>
              </span>
            </label>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0px_8px_0px_0px_#0000000D]">
          <h3 className="mb-4 font-bold text-slate-800">{t("sidebar.scheduling")}</h3>
          <label className="mb-3 block space-y-2 text-right">
            <span className="text-sm text-slate-500">{t("fields.startDate")}</span>
            <Input
              type="date"
              value={values.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="h-12 rounded-xl"
            />
          </label>
          <label className="block space-y-2 text-right">
            <span className="text-sm text-slate-500">{t("fields.endDate")}</span>
            <Input
              type="date"
              value={values.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="h-12 rounded-xl"
            />
          </label>
          <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-6 text-emerald-800">
            {t("sidebar.scheduleHint")}
          </p>
        </section>

        <Button type="button" variant="outline" className="h-12 w-full rounded-2xl">
          <Eye className="ms-2 h-4 w-4" />
          {t("sidebar.preview")}
        </Button>
      </aside>

      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
          <LabeledInput
            label={t("fields.title")}
            value={values.title}
            onChange={(title) => onChange({ title })}
            placeholder={t("fields.titlePlaceholder")}
          />
          <div className="mt-4">
            <LabeledTextarea
              label={t("fields.description")}
              value={values.description}
              onChange={(description) => onChange({ description })}
              placeholder={t("fields.descriptionPlaceholder")}
              rows={5}
            />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-[0px_8px_0px_0px_#0000000D]">
          <label className="cursor-pointer">
            <CloudUpload className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-semibold">{t("cover.hint")}</p>
            <p className="mt-1 text-xs text-slate-400">{t("cover.formats")}</p>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                onChange({ mediaFile: file, mediaUrl: "" });
              }}
            />
            {values.mediaFile ? (
              <p className="mt-2 text-sm text-[#C7AF6E]">{values.mediaFile.name}</p>
            ) : null}
          </label>
        </section>

        <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0px_8px_0px_0px_#0000000D]">
          <h3 className="mb-4 font-bold text-slate-800">{t("sections.targeting")}</h3>
          <LabeledSelect
            label={t("fields.school")}
            value={values.schoolId}
            onChange={(schoolId) => onChange({ schoolId })}
            options={[{ value: "", label: t("fields.allSchools") }, ...schoolOptions]}
          />
          <div className="mt-4">
            <LabeledSelect
              label={t("fields.grade")}
              value={values.gradeLevelId}
              onChange={(gradeLevelId) => onChange({ gradeLevelId })}
              options={[{ value: "", label: t("fields.allGrades") }, ...gradeOptions]}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjectOptions
              .filter((o) => !values.subjectIds.includes(o.value))
              .map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleSubject(option.value)}
                  className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500"
                >
                  + {option.label}
                </button>
              ))}
          </div>
        </section>

        <AdCreateLivePreview values={values} />

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" className="h-12 rounded-2xl px-6" onClick={onCancel}>
            {t("actions.cancel")}
          </Button>
          <Button
            type="button"
            className="h-12 rounded-2xl bg-[#C7AF6E] px-8 text-[#2C4260] hover:bg-[#b89d5e]"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {t("actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
