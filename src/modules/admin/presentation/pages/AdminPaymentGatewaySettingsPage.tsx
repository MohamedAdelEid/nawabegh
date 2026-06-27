"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

interface GatewayState {
  enabled: boolean;
  testMode: boolean;
  key1: string;
  key2: string;
}

export function AdminPaymentGatewaySettingsPage() {
  const t = useTranslations("admin.dashboard");
  const [stripe, setStripe] = useState<GatewayState>({
    enabled: true,
    testMode: false,
    key1: "pk_live_51M...",
    key2: "sk_live_****************",
  });
  const [paymob, setPaymob] = useState<GatewayState>({
    enabled: false,
    testMode: false,
    key1: "",
    key2: "",
  });
  const [paypal, setPaypal] = useState<GatewayState>({
    enabled: true,
    testMode: true,
    key1: "AZ_vO6Y...",
    key2: "EO-****************",
  });

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("paymentGatewaySettings.page.title") },
        ]} />
        <DashboardPageHeader
        title={t("paymentGatewaySettings.page.title")}
        description={t("paymentGatewaySettings.page.description")}
      />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GatewayCard
          title="Stripe"
          statusLabel={stripe.enabled ? t("paymentGatewaySettings.status.connected") : t("paymentGatewaySettings.status.notConnected")}
          statusTone={stripe.enabled ? "text-[#6BCB1E]" : "text-slate-400"}
          enabled={stripe.enabled}
          onToggleEnabled={(checked) => setStripe((prev) => ({ ...prev, enabled: checked }))}
          testMode={stripe.testMode}
          onToggleTestMode={(checked) => setStripe((prev) => ({ ...prev, testMode: checked }))}
          field1Label={t("paymentGatewaySettings.fields.stripe.publicKey")}
          field1Value={stripe.key1}
          onField1Change={(value) => setStripe((prev) => ({ ...prev, key1: value }))}
          field2Label={t("paymentGatewaySettings.fields.stripe.secretKey")}
          field2Value={stripe.key2}
          onField2Change={(value) => setStripe((prev) => ({ ...prev, key2: value }))}
          primaryAction={t("paymentGatewaySettings.actions.saveChanges")}
          testModeLabel={t("paymentGatewaySettings.fields.testMode")}
          switchActiveLabel={t("paymentGatewaySettings.switch.active")}
          switchInactiveLabel={t("paymentGatewaySettings.switch.inactive")}
        />

        <GatewayCard
          title="Paymob"
          statusLabel={paymob.enabled ? t("paymentGatewaySettings.status.connected") : t("paymentGatewaySettings.status.notConnected")}
          statusTone={paymob.enabled ? "text-[#6BCB1E]" : "text-slate-400"}
          enabled={paymob.enabled}
          onToggleEnabled={(checked) => setPaymob((prev) => ({ ...prev, enabled: checked }))}
          testMode={paymob.testMode}
          onToggleTestMode={(checked) => setPaymob((prev) => ({ ...prev, testMode: checked }))}
          field1Label={t("paymentGatewaySettings.fields.paymob.apiKey")}
          field1Value={paymob.key1}
          onField1Change={(value) => setPaymob((prev) => ({ ...prev, key1: value }))}
          field2Label={t("paymentGatewaySettings.fields.paymob.iframeId")}
          field2Value={paymob.key2}
          onField2Change={(value) => setPaymob((prev) => ({ ...prev, key2: value }))}
          primaryAction={t("paymentGatewaySettings.actions.linkAccount")}
          testModeLabel={t("paymentGatewaySettings.fields.testMode")}
          switchActiveLabel={t("paymentGatewaySettings.switch.active")}
          switchInactiveLabel={t("paymentGatewaySettings.switch.inactive")}
        />

        <GatewayCard
          title="PayPal"
          statusLabel={paypal.enabled ? t("paymentGatewaySettings.status.connectedTrial") : t("paymentGatewaySettings.status.notConnected")}
          statusTone={paypal.enabled ? "text-[#6BCB1E]" : "text-slate-400"}
          enabled={paypal.enabled}
          onToggleEnabled={(checked) => setPaypal((prev) => ({ ...prev, enabled: checked }))}
          testMode={paypal.testMode}
          onToggleTestMode={(checked) => setPaypal((prev) => ({ ...prev, testMode: checked }))}
          field1Label={t("paymentGatewaySettings.fields.paypal.clientId")}
          field1Value={paypal.key1}
          onField1Change={(value) => setPaypal((prev) => ({ ...prev, key1: value }))}
          field2Label={t("paymentGatewaySettings.fields.paypal.clientSecret")}
          field2Value={paypal.key2}
          onField2Change={(value) => setPaypal((prev) => ({ ...prev, key2: value }))}
          primaryAction={t("paymentGatewaySettings.actions.updateSettings")}
          testModeLabel={t("paymentGatewaySettings.fields.testMode")}
          switchActiveLabel={t("paymentGatewaySettings.switch.active")}
          switchInactiveLabel={t("paymentGatewaySettings.switch.inactive")}
        />
      </div>

      <Card className="rounded-[2rem] border border-dashed border-[#DDE6F2] bg-[#F8FBFF]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-[#243B5A]" />
            <div className="text-right">
              <h3 className="text-3xl font-bold text-[#1E3A66]">{t("paymentGatewaySettings.security.title")}</h3>
              <p className="max-w-3xl text-sm text-slate-500">{t("paymentGatewaySettings.security.body")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="h-12 rounded-xl border-slate-200 px-6">
              {t("paymentGatewaySettings.security.logs")}
            </Button>
            <Button type="button" className="h-12 rounded-xl bg-[#243B5A] px-6 text-white hover:bg-[#1E3350]">
              {t("paymentGatewaySettings.security.contactSupport")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t("paymentGatewaySettings.footer.unsavedChanges")}</p>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="text-slate-400">
            {t("paymentGatewaySettings.footer.cancel")}
          </Button>
          <Button type="button" className="h-12 rounded-xl bg-[#243B5A] px-6 text-white hover:bg-[#1E3350]">
            {t("paymentGatewaySettings.footer.saveAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface GatewayCardProps {
  title: string;
  statusLabel: string;
  statusTone: string;
  enabled: boolean;
  onToggleEnabled: (value: boolean) => void;
  testMode: boolean;
  onToggleTestMode: (value: boolean) => void;
  field1Label: string;
  field1Value: string;
  onField1Change: (value: string) => void;
  field2Label: string;
  field2Value: string;
  onField2Change: (value: string) => void;
  primaryAction: string;
  testModeLabel: string;
  switchActiveLabel: string;
  switchInactiveLabel: string;
}

function GatewayCard({
  title,
  statusLabel,
  statusTone,
  enabled,
  onToggleEnabled,
  testMode,
  onToggleTestMode,
  field1Label,
  field1Value,
  onField1Change,
  field2Label,
  field2Value,
  onField2Change,
  primaryAction,
  testModeLabel,
  switchActiveLabel,
  switchInactiveLabel,
}: GatewayCardProps) {
  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-3xl font-bold text-[#1E3A66]">{title}</p>
            <p className={`text-sm font-semibold ${statusTone}`}>{statusLabel}</p>
          </div>
          <StatusSwitch
            checked={enabled}
            onChange={onToggleEnabled}
            activeLabel={switchActiveLabel}
            inactiveLabel={switchInactiveLabel}
          />
        </div>

        <LabeledInput label={field1Label} value={field1Value} onChange={onField1Change} placeholder="" />
        <LabeledInput label={field2Label} value={field2Value} onChange={onField2Change} placeholder="" />

        <div className="flex items-center justify-between rounded-xl border border-[#EEDFB8] bg-[#FFF8E8] px-3 py-2">
          <span className="text-sm font-semibold text-[#8F6C0B]">{testMode ? "(Test Mode)" : ""}</span>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#8F6C0B]">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(event) => onToggleTestMode(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            {testModeLabel}
          </label>
        </div>

        <Button type="button" className="h-12 w-full rounded-xl bg-[#C7AF6E] text-white hover:bg-[#B79F5D]">
          {primaryAction}
        </Button>
      </CardContent>
    </Card>
  );
}
