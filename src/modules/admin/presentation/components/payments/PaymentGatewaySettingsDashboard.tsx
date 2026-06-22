"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { PaymentGatewaySettings } from "@/modules/admin/domain/types/payments.types";
import {
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings,
} from "@/modules/admin/infrastructure/api/paymentsApi";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { PaymentsSubNav } from "./PaymentsSubNav";
import { SecretInput } from "./PaymentTransactionDetailSheet";
import { isGatewayConnected } from "./paymentDisplay";

type GatewayFormState = {
  merchantId: string;
  secretKey: string;
  webhookSecret: string;
};

const EMPTY_FORM: GatewayFormState = {
  merchantId: "",
  secretKey: "",
  webhookSecret: "",
};

export function PaymentGatewaySettingsDashboard() {
  const t = useTranslations("admin.dashboard.paymentManagement");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState<PaymentGatewaySettings | null>(null);
  const [form, setForm] = useState<GatewayFormState>(EMPTY_FORM);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const result = await getPaymentGatewaySettings();
    if (result.data) {
      setInitial(result.data);
      setForm({
        merchantId: result.data.merchantId,
        secretKey: "",
        webhookSecret: "",
      });
    } else {
      notify.error(result.errorMessage ?? t("gateway.messages.loadError"));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const connected = initial ? isGatewayConnected(initial) : false;
  const isFirstSave = initial ? !connected : true;

  const unsavedCount = useMemo(() => {
    if (!initial) return 0;
    let count = 0;
    if (form.merchantId !== initial.merchantId) count += 1;
    if (form.secretKey.trim()) count += 1;
    if (form.webhookSecret.trim()) count += 1;
    return count;
  }, [form, initial]);

  const handleSave = async () => {
    if (!form.merchantId.trim()) {
      notify.error(t("gateway.messages.merchantRequired"));
      return;
    }
    if (isFirstSave && (!form.secretKey.trim() || !form.webhookSecret.trim())) {
      notify.error(t("gateway.messages.secretsRequired"));
      return;
    }

    setSaving(true);
    const result = await updatePaymentGatewaySettings({
      provider: "tap",
      merchantId: form.merchantId.trim(),
      ...(form.secretKey.trim() ? { secretKey: form.secretKey.trim() } : {}),
      ...(form.webhookSecret.trim() ? { webhookSecret: form.webhookSecret.trim() } : {}),
    });
    setSaving(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage ?? t("gateway.messages.saveError"));
      return;
    }

    notify.success(result.message ?? t("gateway.messages.saveSuccess"));
    await loadSettings();
  };

  const handleCancel = () => {
    if (!initial) {
      setForm(EMPTY_FORM);
      return;
    }
    setForm({ merchantId: initial.merchantId, secretKey: "", webhookSecret: "" });
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("gateway.title")}
        description={t("gateway.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.payments"), href: ROUTES.ADMIN.PAYMENTS.OVERVIEW },
          { label: t("subNav.settings") },
        ]}
      />

      <PaymentsSubNav />

      {loading ? (
        <Skeleton className="h-96 max-w-xl rounded-[2rem]" />
      ) : (
        <Card className="max-w-xl rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
          <CardContent className="space-y-4 p-5">
            <div className="text-right">
              <p className="text-3xl font-bold text-[#1E3A66]">{t("gateway.provider")}</p>
              <p
                className={`text-sm font-semibold ${connected ? "text-[#6BCB1E]" : "text-slate-400"}`}
              >
                {connected ? t("gateway.status.connected") : t("gateway.status.notConfigured")}
              </p>
            </div>

            <LabeledInput
              label={t("gateway.fields.merchantId")}
              value={form.merchantId}
              onChange={(merchantId) => setForm((prev) => ({ ...prev, merchantId }))}
              placeholder=""
            />

            <SecretInput
              label={t("gateway.fields.secretKey")}
              value={form.secretKey}
              onChange={(secretKey) => setForm((prev) => ({ ...prev, secretKey }))}
              placeholder={t("gateway.fields.secretKeyPlaceholder")}
              hint={
                initial?.secretKeyHint
                  ? t("gateway.fields.secretKeyHint", { hint: initial.secretKeyHint })
                  : null
              }
            />

            <SecretInput
              label={t("gateway.fields.webhookSecret")}
              value={form.webhookSecret}
              onChange={(webhookSecret) => setForm((prev) => ({ ...prev, webhookSecret }))}
              placeholder={t("gateway.fields.webhookSecretPlaceholder")}
              hint={
                initial?.webhookSecretHint
                  ? t("gateway.fields.webhookSecretHint", { hint: initial.webhookSecretHint })
                  : null
              }
            />

            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-[#C7AF6E] text-white hover:bg-[#B79F5D]"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {connected ? t("gateway.actions.updateSettings") : t("gateway.actions.linkAccount")}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[2rem] border border-dashed border-[#DDE6F2] bg-[#F8FBFF]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-[#243B5A]" />
            <div className="text-right">
              <h3 className="text-2xl font-bold text-[#1E3A66]">{t("gateway.security.title")}</h3>
              <p className="max-w-3xl text-sm text-slate-500">{t("gateway.security.body")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="h-12 rounded-xl border-slate-200 px-6" asChild>
              <Link href={ROUTES.ADMIN.PAYMENTS.TRANSACTIONS}>{t("gateway.security.transactionLog")}</Link>
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-[#243B5A] px-6 text-white hover:bg-[#1E3350]"
              onClick={() => router.push(ROUTES.ADMIN.SUPPORT_TICKETS.LIST)}
            >
              {t("gateway.security.contactSupport")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {unsavedCount > 0
            ? t("gateway.footer.unsavedChanges", { count: unsavedCount })
            : t("gateway.footer.noChanges")}
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="text-slate-400" onClick={handleCancel}>
            {t("gateway.footer.cancel")}
          </Button>
          <Button
            type="button"
            className="h-12 rounded-xl bg-[#243B5A] px-6 text-white hover:bg-[#1E3350]"
            disabled={saving || unsavedCount === 0}
            onClick={() => void handleSave()}
          >
            {t("gateway.footer.saveAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
