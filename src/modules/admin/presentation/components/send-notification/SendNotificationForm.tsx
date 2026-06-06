"use client";

import {
  Grid3x3,
  Loader2,
  Search,
  SendHorizontal,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { SendNotificationFormValues } from "@/modules/admin/domain/types/sendNotification.types";
import type {
  SendNotificationAudience,
  SendNotificationScheduleMode,
} from "@/modules/admin/domain/types/sendNotification.types";
import { cn } from "@/shared/application/lib/cn";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type SendNotificationFormProps = {
  values: SendNotificationFormValues;
  onChange: (patch: Partial<SendNotificationFormValues>) => void;
  countryOptions: Array<{ value: string; label: string }>;
  schoolOptions: Array<{ value: string; label: string }>;
  isLoadingSchools: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
};

const AUDIENCE_IDS: SendNotificationAudience[] = [
  "all",
  "students_teachers_parents",
  "students",
  "teachers",
  "parents",
];

const SCHEDULE_IDS: SendNotificationScheduleMode[] = ["now", "schedule"];

type DeliveryChannelId = "mobile" | "inApp";
const CHANNEL_IDS: DeliveryChannelId[] = ["mobile", "inApp"];

export function SendNotificationForm({
  values,
  onChange,
  countryOptions,
  schoolOptions,
  isLoadingSchools,
  isSubmitting,
  onSubmit,
}: SendNotificationFormProps) {
  const t = useTranslations("admin.dashboard.sendNotification");

  const audienceOptions = AUDIENCE_IDS.map((id) => ({
    value: id,
    label: t(`targeting.audience.${id}`),
  }));

  const scheduleOptions = SCHEDULE_IDS.map((id) => ({
    id,
    label: t(`scheduling.mode.${id}`),
  }));

  const submitLabel =
    values.scheduleMode === "now" ? t("actions.sendNow") : t("actions.scheduleSend");

  return (
    <div
      className="space-y-8 rounded-[1.75rem] border border-white/80 bg-white p-6 md:p-8"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[#1E3A66]">{t("sections.targeting.title")}</h2>
        <LabeledSelect
          label={t("targeting.audience.label")}
          value={values.audience}
          onChange={(audience) =>
            onChange({ audience: audience as SendNotificationAudience })
          }
          options={audienceOptions}
        />

        <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
          <p className="text-sm font-semibold text-slate-700">
            {t("targeting.advanced.title")}
          </p>

          <LabeledSelect
            label={t("targeting.country.label")}
            value={values.countryId}
            onChange={(countryId) => onChange({ countryId, schoolId: "" })}
            options={
              countryOptions.length > 0
                ? countryOptions
                : [{ value: "", label: t("targeting.country.all") }]
            }
          />

          <div className="space-y-2 text-right">
            <label className="text-sm text-[#64748B]">{t("targeting.school.label")}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={values.schoolSearch}
                onChange={(event) =>
                  onChange({ schoolSearch: event.target.value, schoolId: "" })
                }
                placeholder={t("targeting.school.placeholder")}
                className="h-14 rounded-2xl border-slate-100 bg-white pe-4 ps-11 text-right placeholder:text-[#94A3B8] focus-visible:ring-[#C7AF6E]/40"
              />
            </div>
            {isLoadingSchools ? (
              <Skeleton className="h-14 w-full rounded-2xl" />
            ) : schoolOptions.length > 0 ? (
              <LabeledSelect
                label={t("targeting.school.selectLabel")}
                value={values.schoolId}
                onChange={(schoolId) => onChange({ schoolId })}
                options={[
                  { value: "", label: t("targeting.school.all") },
                  ...schoolOptions,
                ]}
                className="pt-1"
              />
            ) : null}
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm text-[#64748B]">{t("targeting.users.label")}</label>
            <div className="relative">
              <UserPlus className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={values.specificUsers}
                onChange={(event) => onChange({ specificUsers: event.target.value })}
                placeholder={t("targeting.users.placeholder")}
                className="h-14 rounded-2xl border-slate-100 bg-white pe-4 ps-11 text-right placeholder:text-[#94A3B8] focus-visible:ring-[#C7AF6E]/40"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#1E3A66]">{t("sections.content.title")}</h2>
        <LabeledInput
          label={t("content.title.label")}
          value={values.title}
          placeholder={t("content.title.placeholder")}
          onChange={(title) => onChange({ title })}
        />
        <LabeledTextarea
          label={t("content.body.label")}
          value={values.body}
          placeholder={t("content.body.placeholder")}
          onChange={(body) => onChange({ body })}
          rows={5}
        />

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-700">{t("content.action.title")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledInput
              label={t("content.action.label")}
              value={values.actionLabel}
              placeholder={t("content.action.labelPlaceholder")}
              onChange={(actionLabel) => onChange({ actionLabel })}
            />
            <LabeledInput
              label={t("content.action.url")}
              value={values.actionUrl}
              placeholder={t("content.action.urlPlaceholder")}
              onChange={(actionUrl) => onChange({ actionUrl })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-bold text-[#1E3A66]">{t("sections.scheduling.title")}</h2>

        <div className="space-y-2 text-right">
          <p className="text-sm text-[#64748B]">{t("scheduling.time.label")}</p>
          <DashboardSegmentedControl
            options={scheduleOptions}
            value={values.scheduleMode}
            onChange={(scheduleMode) => onChange({ scheduleMode })}
            className="w-full justify-stretch [&>button]:flex-1"
          />
        </div>

        {values.scheduleMode === "schedule" ? (
          <div className="space-y-2 text-right">
            <label className="text-sm text-[#64748B]">{t("scheduling.datetime.label")}</label>
            <Input
              type="datetime-local"
              value={values.scheduledAt}
              onChange={(event) => onChange({ scheduledAt: event.target.value })}
              className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 text-left ltr focus-visible:ring-[#C7AF6E]/40"
            />
          </div>
        ) : null}

        <div className="space-y-3 text-right">
          <p className="text-sm text-[#64748B]">{t("scheduling.channel.label")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHANNEL_IDS.map((channelId) => {
              const selected =
                channelId === "mobile" ? values.sendMobilePush : values.sendInApp;
              const Icon = channelId === "mobile" ? Smartphone : Grid3x3;
              return (
                <button
                  key={channelId}
                  type="button"
                  onClick={() =>
                    onChange(
                      channelId === "mobile"
                        ? { sendMobilePush: !values.sendMobilePush }
                        : { sendInApp: !values.sendInApp },
                    )
                  }
                  className={cn(
                    "flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-white px-4 py-5 transition-colors",
                    selected
                      ? "border-[#C8AC59] bg-[#FFFBF0] shadow-[0px_4px_0px_0px_#8F6C0B33]"
                      : "border-slate-100 hover:border-slate-200",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-7 w-7",
                      selected ? "text-[#C8AC59]" : "text-slate-400",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-bold",
                      selected ? "text-[#1E3A66]" : "text-slate-500",
                    )}
                  >
                    {t(`scheduling.channel.${channelId}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <Button
        type="button"
        disabled={isSubmitting}
        onClick={() => void onSubmit()}
        className="h-14 w-full rounded-2xl bg-[#1E3A66] text-base font-bold text-white shadow-[0px_6px_0px_0px_#0F172A66] hover:bg-[#173052]"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendHorizontal className="h-5 w-5" />
        )}
        {submitLabel}
      </Button>
    </div>
  );
}
