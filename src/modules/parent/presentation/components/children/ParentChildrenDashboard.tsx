"use client";

import Link from "next/link";
import {
  Eye,
  Filter,
  Plus,
  Search,
  Settings,
  Trash2,
  Trophy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useParentChildrenStats } from "@/modules/parent/application/hooks/useParentChildrenStats";
import { useParentChildren } from "@/modules/parent/application/hooks/useParentChildren";
import { useUnlinkParentChild } from "@/modules/parent/application/hooks/useParentChildrenMutations";
import { useParentHomeDashboard } from "@/modules/parent/application/hooks/useParentHomeDashboard";
import { useParentPaymentsDashboard } from "@/modules/parent/application/hooks/useParentPaymentsDashboard";
import {
  enrichChildrenCards,
  getChildGradeLabel,
  getChildStatusTone,
  type ParentChildCardModel,
} from "@/modules/parent/application/lib/parentChildren.utils";
import {
  formatPercent,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { ModalShell } from "@/shared/presentation/components/ui/modal-shell";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

function ChildCard({
  child,
  onUnlink,
}: {
  child: ParentChildCardModel;
  onUnlink: (studentUserId: string) => void;
}) {
  const t = useTranslations("parent.dashboard.childrenManagement");
  const locale = useLocale();
  const tone = getChildStatusTone(child.isActive, child.progressPercent);
  const gradeLabel = getChildGradeLabel(locale, child);
  const subscriptionName = child.subscription
    ? resolveLocalizedText(
        locale,
        child.subscription.productNameAr,
        child.subscription.productName,
      )
    : null;

  const statusLabel = !child.isActive
    ? t("statusInactive")
    : child.progressPercent >= 80
      ? t("statusActive")
      : t("statusRegular");

  return (
    <article className="relative flex h-full flex-col gap-5 overflow-hidden rounded-[16px] border border-[#f1f3f5] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <ParentAvatar
            url={child.profileImageUrl}
            name={child.fullName}
            className="size-20"
            roundedClassName="rounded-full"
          />
          <span
            className={cn(
              "absolute -bottom-1 start-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold",
              tone.badge,
            )}
          >
            {statusLabel}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#2b415e]">{child.fullName}</h3>
          <p className="mt-1 text-sm text-[#64748b]">{gradeLabel || "—"}</p>
          {child.schoolName ? (
            <p className="mt-0.5 text-xs text-[#94a3b8]">{child.schoolName}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#64748b]">{t("progressLabel")}</span>
          <span className="font-bold text-[#2b415e]">
            {formatPercent(child.progressPercent)}
          </span>
        </div>
        <ParentProgressBar value={child.progressPercent} barClassName={tone.progress} />
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f8f9fa] px-3 py-3 text-center">
        <div>
          <p className="text-sm font-bold text-[#2b415e]">
            {child.points.toLocaleString(locale)}
          </p>
          <p className="text-[10px] text-[#64748b]">{t("points")}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-[#2b415e]">{child.badgesCount}</p>
          <p className="text-[10px] text-[#64748b]">{t("badges")}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-[#2b415e]">
            {child.schoolRank != null ? `#${child.schoolRank}` : "—"}
          </p>
          <p className="text-[10px] text-[#64748b]">{t("rank")}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[rgba(199,175,109,0.12)] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Trophy className="size-4 shrink-0 text-[#c7af6d]" />
            <span className="truncate text-sm font-semibold text-[#2b415e]">
              {subscriptionName || t("noSubscription")}
            </span>
          </div>
          {child.subscription ? (
            <span className="rounded-full bg-[#58cc02] px-2 py-0.5 text-[10px] font-bold text-white">
              {t("subscriptionActive")}
            </span>
          ) : null}
        </div>
        {child.subscription?.endsAtDisplay || child.subscription?.endsAt ? (
          <p className="mt-1 text-xs text-[#64748b]">
            {t("subscriptionEnds", {
              date:
                child.subscription.endsAtDisplay ||
                child.subscription.endsAt ||
                "",
            })}
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-2">
        <div className="flex items-center gap-2">
          <Button
            asChild
            className={cn(
              "h-11 flex-1 rounded-xl text-sm font-bold text-white",
              tone.button,
            )}
          >
            <Link href={ROUTES.USER.PARENT.CHILD_DETAILS(child.studentUserId)}>
              <Eye className="size-4" />
              {t("viewProfile")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="size-11 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] p-0 text-[#64748b]"
          >
            <Link href={ROUTES.USER.PARENT.CHILD_SETTINGS(child.studentUserId)}>
              <Settings className="size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-11 rounded-xl border-red-100 bg-red-50 p-0 text-[#d33131] hover:bg-red-100"
            onClick={() => onUnlink(child.studentUserId)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
          <Link
            href={ROUTES.USER.PARENT.CHILD_REPORT(child.studentUserId)}
            className="text-[#2b415e] hover:underline"
          >
            {t("viewReport")}
          </Link>
          <Link
            href={`${ROUTES.USER.PARENT.PAYMENTS}?studentUserId=${encodeURIComponent(child.studentUserId)}`}
            className="text-[#c7af6d] hover:underline"
          >
            {t("payFees")}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ParentChildrenDashboard() {
  const t = useTranslations("parent.dashboard.childrenManagement");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const childrenQuery = useParentChildren();
  const homeQuery = useParentHomeDashboard();
  const statsQuery = useParentChildrenStats();
  const paymentsQuery = useParentPaymentsDashboard();
  const unlinkMutation = useUnlinkParentChild();

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [unlinkTarget, setUnlinkTarget] = useState<ParentChildCardModel | null>(
    null,
  );

  const cards = useMemo(
    () =>
      enrichChildrenCards({
        children: childrenQuery.data ?? [],
        homeChildren: homeQuery.data?.children,
        comparisons: statsQuery.data?.childrenComparison,
        subscriptions: paymentsQuery.data?.activeSubscriptions,
      }),
    [
      childrenQuery.data,
      homeQuery.data?.children,
      paymentsQuery.data?.activeSubscriptions,
      statsQuery.data?.childrenComparison,
    ],
  );

  const gradeOptions = useMemo(() => {
    const values = new Set<string>();
    for (const child of cards) {
      const grade = resolveLocalizedText(
        locale,
        child.gradeNameAr,
        child.gradeNameEn,
      );
      if (grade) values.add(grade);
    }
    return Array.from(values);
  }, [cards, locale]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    return cards.filter((child) => {
      const matchesSearch =
        !keyword ||
        child.fullName.toLocaleLowerCase().includes(keyword) ||
        (child.username ?? "").toLocaleLowerCase().includes(keyword);
      const grade = resolveLocalizedText(
        locale,
        child.gradeNameAr,
        child.gradeNameEn,
      );
      const matchesGrade = gradeFilter === "all" || grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [cards, gradeFilter, locale, search]);

  const isLoading =
    childrenQuery.isLoading ||
    (childrenQuery.isSuccess &&
      cards.length === 0 &&
      (homeQuery.isLoading || statsQuery.isLoading || paymentsQuery.isLoading) &&
      (childrenQuery.data?.length ?? 0) > 0);

  if (childrenQuery.isLoading) {
    return (
      <div className="flex w-full flex-col gap-8">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[420px] rounded-[16px]" />
          ))}
        </div>
      </div>
    );
  }

  if (childrenQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button
          type="button"
          onClick={() => childrenQuery.refetch()}
          disabled={childrenQuery.isFetching}
        >
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-start">
          <p className="text-xs text-[#64748b]">{t("breadcrumb")}</p>
          <h1 className="text-[30px] font-bold leading-9 text-[#2b415e]">
            {t("title")}
          </h1>
          <p className="text-base text-[#64748b]">{t("subtitle")}</p>
        </div>
        <Button
          asChild
          className="h-12 rounded-xl bg-[#2b415e] px-6 text-sm font-bold text-white hover:bg-[#24384f]"
        >
          <Link href={ROUTES.USER.PARENT.CHILDREN_ADD}>
            <Plus className="size-4" />
            {t("addChild")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[rgba(226,232,240,0.3)] bg-white p-[18px] shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6b7280]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 rounded-xl border-2 border-[#e2e8f0] bg-[#f8f9fa] ps-11"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          className="h-12 min-w-[151px] rounded-xl border-2 border-[#e2e8f0] bg-[#f8f9fa] px-4 text-sm font-medium text-[#0f172a]"
        >
          <option value="all">{t("allGrades")}</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        <Button
          type="button"
          className="h-12 rounded-xl bg-[#e9ecef] px-6 font-bold text-[#2b415e] hover:bg-[#dee2e6]"
          onClick={() => {
            /* filters apply live */
          }}
        >
          <Filter className="size-4" />
          {t("filter")}
        </Button>
      </div>

      {filtered.length === 0 && !isLoading ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-10 text-center text-[#64748b]">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((child) => (
            <ChildCard
              key={child.studentUserId}
              child={child}
              onUnlink={(studentUserId) => {
                const target =
                  filtered.find((item) => item.studentUserId === studentUserId) ??
                  null;
                setUnlinkTarget(target);
              }}
            />
          ))}
          <Link
            href={ROUTES.USER.PARENT.CHILDREN_ADD}
            className="flex min-h-[380px] flex-col items-center justify-center gap-4 rounded-[16px] border-2 border-dashed border-[#cbd5e1] bg-[rgba(219,227,243,0.25)] p-6 text-center transition hover:border-[#2b415e]/hover:bg-[rgba(219,227,243,0.45)]"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white text-[#2b415e] shadow-sm">
              <Plus className="size-8" />
            </span>
            <div>
              <p className="text-lg font-bold text-[#2b415e]">{t("addCardTitle")}</p>
              <p className="mt-2 max-w-[240px] text-sm text-[#64748b]">
                {t("addCardDescription")}
              </p>
            </div>
          </Link>
        </div>
      )}

      <ModalShell
        open={Boolean(unlinkTarget)}
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null);
        }}
        panelClassName="w-full max-w-md rounded-2xl bg-white p-6"
      >
        <h2 className="text-xl font-bold text-[#2b415e]">
          {t("unlinkConfirmTitle")}
        </h2>
        <p className="mt-2 text-sm text-[#64748b]">{t("unlinkConfirmMessage")}</p>
        {unlinkTarget ? (
          <p className="mt-3 font-semibold text-[#0f172a]">{unlinkTarget.fullName}</p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setUnlinkTarget(null)}
          >
            {t("unlinkCancel")}
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl bg-[#d33131] text-white hover:bg-[#b82a2a]"
            disabled={unlinkMutation.isPending}
            onClick={async () => {
              if (!unlinkTarget) return;
              try {
                await unlinkMutation.mutateAsync(unlinkTarget.studentUserId);
                notify.success(t("unlinkSuccess"));
                setUnlinkTarget(null);
              } catch (error) {
                notify.error(
                  error instanceof Error ? error.message : tCommon("error"),
                );
              }
            }}
          >
            {t("unlinkConfirm")}
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
