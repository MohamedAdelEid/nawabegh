"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { GradeListItem } from "@/modules/admin/infrastructure/api/gradesApi";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

export type GradeFormValues = {
  countryId: string;
  educationLevelId: string;
  nameAr: string;
  nameEn: string;
  order: string;
};

interface GradeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: GradeListItem | null;
  onSubmit: (values: GradeFormValues) => Promise<boolean>;
  loading?: boolean;
}

const EMPTY_VALUES: GradeFormValues = {
  countryId: "",
  educationLevelId: "",
  nameAr: "",
  nameEn: "",
  order: "1",
};

export function GradeFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading = false,
}: GradeFormModalProps) {
  const t = useTranslations("admin.dashboard.curriculumManagement.grades.form");
  const [values, setValues] = useState<GradeFormValues>(EMPTY_VALUES);
  const [countryOptions, setCountryOptions] = useState<{ id: string; label: string }[]>([]);
  const [educationLevelOptions, setEducationLevelOptions] = useState<
    { id: string; label: string }[]
  >([]);

  useEffect(() => {
    if (!open) return;

    setValues(
      initial
        ? {
            countryId: String(initial.countryId),
            educationLevelId: String(initial.educationLevelId),
            nameAr: initial.nameAr,
            nameEn: initial.nameEn,
            order: String(initial.order),
          }
        : EMPTY_VALUES,
    );

    let cancelled = false;
    void getCountriesDropdown().then((result) => {
      if (cancelled) return;
      setCountryOptions((result.data ?? []).map((row) => ({ id: String(row.id), label: row.name })));
    });

    return () => {
      cancelled = true;
    };
  }, [initial, open]);

  useEffect(() => {
    if (!open || !values.countryId) {
      setEducationLevelOptions([]);
      return;
    }

    let cancelled = false;
    void getEducationLevelsDropdown(Number(values.countryId)).then((result) => {
      if (cancelled) return;
      setEducationLevelOptions(
        (result.data ?? []).map((row) => ({ id: String(row.id), label: row.name })),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [open, values.countryId]);

  const orderNumber = Number(values.order);
  const canSubmit =
    values.countryId.trim().length > 0 &&
    values.educationLevelId.trim().length > 0 &&
    values.nameAr.trim().length > 0 &&
    values.nameEn.trim().length > 0 &&
    Number.isInteger(orderNumber) &&
    orderNumber >= 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading) return;
    const saved = await onSubmit(values);
    if (saved) onOpenChange(false);
  };

  const inputClassName =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none transition-colors focus:border-[#C8AC59] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(95vw,31rem)] p-7"
    >
      <ModalTitle className="text-right text-xl font-bold text-slate-800">
        {mode === "create" ? t("createTitle") : t("editTitle")}
      </ModalTitle>
      <ModalDescription className="mt-2 text-right text-sm text-slate-500">
        {mode === "create" ? t("createDescription") : t("editDescription")}
      </ModalDescription>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("country")}</span>
          <select
            value={values.countryId}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                countryId: event.target.value,
                educationLevelId: "",
              }))
            }
            disabled={loading}
            className={inputClassName}
          >
            <option value="">{t("countryPlaceholder")}</option>
            {countryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("educationLevel")}</span>
          <select
            value={values.educationLevelId}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, educationLevelId: event.target.value }))
            }
            disabled={loading || !values.countryId}
            className={inputClassName}
          >
            <option value="">{t("educationLevelPlaceholder")}</option>
            {educationLevelOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("nameAr")}</span>
          <input
            value={values.nameAr}
            onChange={(event) => setValues((prev) => ({ ...prev, nameAr: event.target.value }))}
            placeholder={t("nameArPlaceholder")}
            disabled={loading}
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("nameEn")}</span>
          <input
            value={values.nameEn}
            onChange={(event) => setValues((prev) => ({ ...prev, nameEn: event.target.value }))}
            placeholder={t("nameEnPlaceholder")}
            disabled={loading}
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("order")}</span>
          <input
            type="number"
            min={0}
            step={1}
            value={values.order}
            onChange={(event) => setValues((prev) => ({ ...prev, order: event.target.value }))}
            placeholder={t("orderPlaceholder")}
            disabled={loading}
            className={inputClassName}
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("cancel")}
          </button>
          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className="h-12 flex-1 rounded-2xl bg-[#2C4260] text-white shadow-[0px_4px_0px_0px_#1E305080] hover:bg-[#1E3050]"
          >
            {loading ? t("saving") : mode === "create" ? t("create") : t("save")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
