"use client";

import { Phone, Pencil, UserRound, EllipsisVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getUserManagementDetail,
  userManagementParentIcon,
  userManagementProfileIcon,
  userManagementSubscriptionIcon,
} from "@/modules/admin/domain/data/userManagementDetailsData";
import { cn } from "@/shared/application/lib/cn";
import {
  DashboardBadge,
  DashboardPageHeader,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import verify from "@/modules/admin/presentation/assets/icons/verify.svg";

function detailsStatusTone(statusId: "active" | "inactive") {
  return statusId === "active" ? "success" : "neutral";
}

function DetailStatCard({
  label,
  value,
  accentClassName,
  icon: Icon,
  iconToneClassName,
}: {
  label: string;
  value: string;
  accentClassName: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconToneClassName: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border-white/80 bg-white before:absolute before:bottom-0 before:right-0 before:top-auto before:h-1 before:w-full",
        accentClassName,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1.5 text-right">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            iconToneClassName,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyPerformanceChart({
  title,
  lessonsLabel,
  testsLabel,
  rows,
}: {
  title: string;
  lessonsLabel: string;
  testsLabel: string;
  rows: Array<{
    id: string;
    label: string;
    lessons: number;
    tests: number;
  }>;
}) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.lessons, row.tests]), 1);

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          <div className="flex items-center justify-end gap-4 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2B415E]" />
              {lessonsLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#58CC02]" />
              {testsLabel}
            </span>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[#FBFCFD] p-5">
          <div className="grid h-64 grid-cols-7 items-end gap-3">
            {rows.map((row) => (
              <div key={row.id} className="flex h-full flex-col items-center justify-end gap-3">
                <div className="flex h-full w-full items-end justify-center gap-1.5 bg-[#F8FAFC]">
                  <div
                    className="w-full rounded-t-2xl bg-[#2B415E33]"
                    style={{ height: `${(row.lessons / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserProfileCard({
  fullName,
  subtitle,
  schoolLabelTitle,
  statusLabelTitle,
  subscriptionLabelTitle,
  schoolLabel,
  statusLabel,
  subscriptionLabel,
  codeLabel,
  codeValue,
  profileTag,
  editLabel,
}: {
  fullName: string;
  subtitle: string;
  schoolLabelTitle: string;
  statusLabelTitle: string;
  subscriptionLabelTitle: string;
  schoolLabel: string;
  statusLabel: string;
  subscriptionLabel: string;
  codeLabel: string;
  codeValue: string;
  profileTag: string;
  editLabel: string;
}) {
  return (
    <Card className="rounded-[2rem] border-white/80 bg-white" style={{
      boxShadow: "0px 8px 0px 0px #0000000D"
    }}>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#DBE3F3] bg-[linear-gradient(135deg,#DBEEF6,#F6F8FB)] text-[#243B5A]"
            style={{
              boxShadow: "0px 2px 4px 4px #0000000D"
            }}
            >
              <UserRound className="h-14 w-14" aria-hidden />
            </div>
            <span className="w-[max-content] absolute bottom-0 right-[0] rounded-xl bg-[#67C23A] px-3 py-1 text-sm font-bold text-white">
              {profileTag}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#2B415E]">{fullName}</h2>
            <p className="text-lg font-medium text-[#C7AF6D]">{subtitle}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{schoolLabelTitle}</p>
            <p className="mt-1 font-semibold text-slate-800">{schoolLabel}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{statusLabelTitle}</p>
            <p className="mt-1 flex items-center gap-2 font-semibold text-[#58CC02]">
              <span className="block w-2 h-2 rounded-full bg-[#58CC02]" />{statusLabel}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{subscriptionLabelTitle}</p>
            <p className="mt-1 font-semibold text-slate-800">{subscriptionLabel}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{codeLabel}</p>
            <p dir="ltr" className="mt-1 font-semibold text-slate-800">{codeValue}</p>
          </div>
        </div>

        <Button
          type="button"
          className="h-14 w-full rounded-2xl bg-[#243B5A] text-base font-semibold text-white hover:bg-[#1D314B]"
          style={{
            boxShadow: "0px 4px 0px 0px #2B415E33"
          }}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          {editLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

function LinkedParentCard({
  title,
  parentType,
  name,
  phone,
  changeLabel,
  unlinkLabel,
  note,
}: {
  title: string;
  parentType: string;
  name: string;
  phone: string;
  changeLabel: string;
  unlinkLabel: string;
  note: string;
}) {
  const Icon = userManagementParentIcon;

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white"
      style={{
        boxShadow: "0px 8px 0px 0px #0000000D"
      }}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          <DashboardBadge tone="warning">{parentType}</DashboardBadge>
        </div>

        <div className="rounded-[1.5rem] p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-400">
              <Icon className="h-10 w-10" aria-hidden />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-800">{name}</h3>
              <p dir="ltr" className="text-sm text-slate-500">
                {phone}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" className="h-16 text-lg rounded-lg border-none text-[#334155] bg-[#F1F5F9] hover:bg-[#F1F5F9] hover:text-[#334155] cursor-pointer">
              {changeLabel}
            </Button>
            <Button type="button" variant="outline" className="h-16 text-lg rounded-lg border-none bg-rose-50 text-rose-500 hover:bg-rose-50 hover:text-rose-500 cursor-pointer">
              {unlinkLabel}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[#DCF4CB] bg-[#DCF4CB4D] px-4 py-3 text-right text-sm text-[#46A302]">
          <img src={verify.src} alt="verify" className="h-4 w-4" />
          {note}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitiesCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    toneClassName: string;
  }>;
}) {
  return (
    <Card className="rounded-[2rem] border-white/80 bg-white"
    style={{
      boxShadow: "0px 8px 0px 0px #0000000D"
    }}
    >
      <CardContent className="space-y-6 p-6">
        <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>

        <div className="space-y-5">
          {rows.map((row, index) => {
            const Icon = row.icon;

            return (
              <div key={row.id} className="flex items-start gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={cn("rounded-full p-2.5", row.toneClassName)}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  {index < rows.length - 1 ? (
                    <div className="mt-2 h-12 w-px bg-slate-200" />
                  ) : null}
                </div>
                <div className="mt-1 flex min-w-0 flex-1 flex-row text-right">
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-xl font-semibold text-slate-800">{row.title}</p>
                    <p className="text-sm text-slate-500">{row.description}</p>
                  </div>
                  <p className="text-xs text-slate-400">{row.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminUserManagementDetailsPage({ userId }: { userId: string }) {
  const t = useTranslations("admin.dashboard");
  const detail = getUserManagementDetail(userId);

  if (!detail) {
    return null;
  }

  const ProfileIcon = userManagementProfileIcon;
  const SubscriptionIcon = userManagementSubscriptionIcon;
  const ShareIcon = detail.floatingActions.shareIcon;
  const PrintIcon = detail.floatingActions.printIcon;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={detail.fullName}
        breadcrumbs={[
          { label: t("tabs.home.title") },
          { label: t("userManagement.page.title") },
          { label: detail.fullName },
        ]}
        description={t("userManagement.details.page.description")}
      />

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <UserProfileCard
          fullName={detail.fullName}
          subtitle={`${t(`userManagement.roles.${detail.roleId}`)}${detail.gradeId ? ` - ${t(`userManagement.grades.${detail.gradeId}`)}` : ""}`}
          schoolLabelTitle={t("userManagement.details.profile.school")}
          statusLabelTitle={t("userManagement.details.profile.status")}
          subscriptionLabelTitle={t("userManagement.details.profile.subscription")}
          schoolLabel={t(`userManagement.schools.${detail.schoolId}`)}
          statusLabel={t(`userManagement.status.${detail.statusId}`)}
          subscriptionLabel={t(`userManagement.subscriptions.${detail.subscriptionId}`)}
          codeLabel={t("userManagement.details.profile.code")}
          codeValue={detail.studentCode}
          profileTag={detail.profileTag}
          editLabel={t("userManagement.details.profile.edit")}
        />
        <div className="space-y-6">
          <div className="grid gap-4 md:gap-10 md:grid-cols-3">
            {detail.stats.map((stat) => (
              <DetailStatCard
                key={stat.id}
                label={t(stat.labelKey)}
                value={stat.value}
                accentClassName={stat.accentClassName}
                icon={stat.icon}
                iconToneClassName={stat.iconToneClassName}
              />
            ))}
          </div>

          <WeeklyPerformanceChart
            title={t("userManagement.details.chart.title")}
            lessonsLabel={t("userManagement.details.chart.lessons")}
            testsLabel={t("userManagement.details.chart.tests")}
            rows={detail.weeklyPerformance.map((row) => ({
              ...row,
              label: t(row.labelKey),
            }))}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ActivitiesCard
          title={t("userManagement.details.activities.title")}
          rows={detail.activities.map((activity) => ({
            id: activity.id,
            title: t(activity.titleKey),
            description: t(activity.descriptionKey),
            time: t(activity.timestampKey),
            icon: activity.icon,
            toneClassName: activity.toneClassName,
          }))}
        />

        <LinkedParentCard
          title={t("userManagement.details.parent.badge")}
          parentType={t("userManagement.details.parent.type")}
          name={detail.linkedParentName}
          phone={detail.linkedParentPhone}
          changeLabel={t("userManagement.details.parent.change")}
          unlinkLabel={t("userManagement.details.parent.unlink")}
          note={t("userManagement.details.parent.note")}
        />
      </section>

      <DashboardTableCard
        title={t("userManagement.details.subscriptions.title")}
        actions={
          <Button type="button" variant="ghost" className="text-slate-500">
            <SubscriptionIcon className="h-4 w-4" aria-hidden />
            {t("userManagement.details.subscriptions.download")}
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-[#F8FAFC]">
              <tr className="border-b border-slate-100 text-sm text-[#64748B]">
                <th className="px-6 py-5 font-medium">{t("userManagement.details.subscriptions.columns.plan")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.details.subscriptions.columns.startDate")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.details.subscriptions.columns.endDate")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.details.subscriptions.columns.status")}</th>
                <th className="px-6 py-5 font-medium">{t("userManagement.details.subscriptions.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {detail.subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-slate-100 text-sm text-slate-700">
                  <td className="px-6 py-5 font-semibold text-slate-800">{t(subscription.planKey)}</td>
                  <td className="px-6 py-5 text-slate-500">{t(subscription.startDateKey)}</td>
                  <td className="px-6 py-5 text-slate-500">{t(subscription.endDateKey)}</td>
                  <td className="px-6 py-5">
                    <DashboardBadge tone={detailsStatusTone(subscription.statusId)}>
                      {t(`userManagement.details.subscriptions.status.${subscription.statusId}`)}
                    </DashboardBadge>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={t("userManagement.details.subscriptions.columns.actions")}
                    >
                      <EllipsisVertical className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardTableCard>

      <div className="sticky bottom-6 z-20 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
          <Button
            type="button"
            className="dashboard-raised-button h-12 rounded-full bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B]"
            style={{
              boxShadow: "0px 4px 0px 0px #2B415E33"
            }}
          >
            <Phone className="h-4 w-4" aria-hidden />
            {t(detail.floatingActions.contactKey)}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-slate-500"
            aria-label={t(detail.floatingActions.shareLabelKey)}
          >
            <ShareIcon className="h-5 w-5" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-slate-500"
            aria-label={t(detail.floatingActions.printLabelKey)}
          >
            <PrintIcon className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
