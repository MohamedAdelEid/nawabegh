"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getPricingPlanById,
  type PricingPlanForm,
  type PricingPlanTypeId,
} from "@/modules/admin/domain/data/pricingManagementData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

interface AdminPricingPlanFormPageProps {
  mode?: "create" | "edit";
  planId?: string;
}

const PLAN_TYPE_OPTIONS: PricingPlanTypeId[] = ["oneTime", "yearly", "monthly"];

const CONTENT_OPTIONS = [
  { value: "", labelKey: "pricingManagement.form.fields.linkedContent.placeholder" },
  { value: "python-basics-course", labelKey: "pricingManagement.form.fields.linkedContent.options.pythonBasics" },
  { value: "science-tracks", labelKey: "pricingManagement.form.fields.linkedContent.options.scienceTracks" },
  { value: "teachers-toolkit", labelKey: "pricingManagement.form.fields.linkedContent.options.teachersToolkit" },
];

export function AdminPricingPlanFormPage({
  mode = "create",
  planId,
}: AdminPricingPlanFormPageProps) {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [form, setForm] = useState<PricingPlanForm>({
    name: "",
    typeId: "oneTime",
    currency: "omr",
    basePrice: "0",
    offerPrice: "0",
    linkedContent: "",
    active: true,
  });

  useEffect(() => {
    if (mode !== "edit" || !planId) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      const existing = await getPricingPlanById(planId);
      if (!alive) return;
      if (existing) {
        setForm(existing);
      }
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [mode, planId]);

  const planTypeCards = useMemo(
    () =>
      PLAN_TYPE_OPTIONS.map((typeId) => ({
        id: typeId,
        title: t(`pricingManagement.form.types.${typeId}.title`),
        description: t(`pricingManagement.form.types.${typeId}.description`),
      })),
    [t],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("pricingManagement.form.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("pricingManagement.breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("pricingManagement.breadcrumbs.list"), href: ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.LIST },
          { label: mode === "edit" ? t("pricingManagement.breadcrumbs.edit") : t("pricingManagement.breadcrumbs.add") },
        ]} />
        <DashboardPageHeader
        title={mode === "edit" ? t("pricingManagement.form.editTitle") : t("pricingManagement.form.addTitle")}
        description={t("pricingManagement.form.description")}
      />
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="rounded-[2rem] border-0 bg-[#243B5A] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-6 text-right">
              <span className="inline-flex rounded-full bg-[#C7AF6E] px-3 py-1 text-xs font-bold">
                {t("pricingManagement.form.preview.badge")}
              </span>
              <h3 className="text-4xl font-extrabold">{form.name || t("pricingManagement.form.preview.planTitleFallback")}</h3>
              <p className="text-sm text-white/75">{t("pricingManagement.form.preview.subtitle")}</p>
              <p className="text-5xl font-extrabold">{form.basePrice}</p>
              <Button type="button" className="h-12 rounded-xl bg-white text-[#243B5A] hover:bg-white/95">
                {t("pricingManagement.form.preview.cta")}
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-[#EEDFB8] bg-[#FFF8E8] p-4 text-right text-sm text-[#8F6C0B]">
            {t("pricingManagement.form.warning")}
          </div>
        </aside>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="text-2xl font-bold text-[#1E3A66]">{t("pricingManagement.form.sections.planType")}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {planTypeCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, typeId: card.id }))}
                    className={[
                      "rounded-xl border-2 p-4 text-right transition-colors",
                      form.typeId === card.id ? "border-[#243B5A] bg-[#EEF4FD]" : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-800">{card.title}</p>
                    <p className="text-xs text-slate-500">{card.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="text-2xl font-bold text-[#1E3A66]">{t("pricingManagement.form.sections.pricing")}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                  label={t("pricingManagement.form.fields.planName.label")}
                  value={form.name}
                  onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                  placeholder={t("pricingManagement.form.fields.planName.placeholder")}
                />
                <LabeledSelect
                  label={t("pricingManagement.form.fields.currency.label")}
                  value={form.currency}
                  onChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}
                  options={[{ value: "omr", label: t("pricingManagement.form.fields.currency.omr") }]}
                />
                <LabeledInput
                  label={t("pricingManagement.form.fields.basePrice.label")}
                  value={form.basePrice}
                  onChange={(value) => setForm((prev) => ({ ...prev, basePrice: value }))}
                  placeholder="0.00"
                />
                <LabeledInput
                  label={t("pricingManagement.form.fields.offerPrice.label")}
                  value={form.offerPrice}
                  onChange={(value) => setForm((prev) => ({ ...prev, offerPrice: value }))}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="text-2xl font-bold text-[#1E3A66]">{t("pricingManagement.form.sections.linkContent")}</h3>
              <div className="relative">
                <LabeledSelect
                  label={t("pricingManagement.form.fields.linkedContent.label")}
                  value={form.linkedContent}
                  onChange={(value) => setForm((prev) => ({ ...prev, linkedContent: value }))}
                  options={CONTENT_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey) }))}
                />
                <Search className="pointer-events-none absolute left-4 top-[2.85rem] h-4 w-4 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <StatusSwitch
                  checked={form.active}
                  onChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
                  activeLabel={t("pricingManagement.form.fields.status.active")}
                  inactiveLabel={t("pricingManagement.form.fields.status.inactive")}
                  activeClassName="bg-[#6BCB1E]"
                />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#1E3A66]">{t("pricingManagement.form.fields.status.title")}</p>
                <p className="text-sm text-slate-400">{t("pricingManagement.form.fields.status.subtitle")}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-slate-200 px-6"
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.LIST)}
            >
              {t("pricingManagement.form.actions.cancel")}
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-[#243B5A] px-6 text-white hover:bg-[#1E3350]"
              onClick={() => router.push(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.LIST)}
            >
              {mode === "edit" ? t("pricingManagement.form.actions.save") : t("pricingManagement.form.actions.create")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
