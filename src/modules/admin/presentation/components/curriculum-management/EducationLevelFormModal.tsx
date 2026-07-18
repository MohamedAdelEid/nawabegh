"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { EducationLevelListItem } from "@/modules/admin/infrastructure/api/educationLevelsApi";
import { getCountriesDropdown } from "@/modules/admin/infrastructure/api/userManagementApi";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

export type EducationLevelFormValues = {
  countryId: string;
  nameAr: string;
  nameEn: string;
  order: string;
};

interface EducationLevelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: EducationLevelListItem | null;
  onSubmit: (values: EducationLevelFormValues) => Promise<boolean>;
  loading?: boolean;
}

const EMPTY_VALUES: EducationLevelFormValues = {
  countryId: "",
  nameAr: "",
  nameEn: "",
  order: "1",
};

export function EducationLevelFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading = false,
}: EducationLevelFormModalProps) {
  const t = useTranslations("admin.dashboard.curriculumManagement.educationLevels.form");
  const [values, setValues] = useState<EducationLevelFormValues>(EMPTY_VALUES);
  const [countryOptions, setCountryOptions] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    if (!open) return;

    setValues(
      initial
        ? {
            countryId: String(initial.countryId),
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

  const orderNumber = Number(values.order);
  const canSubmit =
    values.countryId.trim().length > 0 &&
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
        <LabeledSelect
            label={t("country")}
            value={values.countryId}
            onChange={(countryId) => setValues((prev) => ({ ...prev, countryId }))}
            disabled={loading}
            options={[
              { value: "", label: t("countryPlaceholder") },
              ...countryOptions.map((option) => ({ value: option.id, label: option.label })),
            ]}
            labelClassName="text-sm font-semibold text-slate-600"
            selectClassName={inputClassName}
        />

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
