"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  Lock,
  Pencil,
  Plus,
  PlusCircle,
  Settings2,
  Sparkles,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { StarTag } from "../assets/icons/StarTag";

type PrivacyMode = "public" | "school";

const ENGAGEMENT_PATTERN = "/images/article-editor/community-settings-hero-v2.png";

export function AdminCommunitySettingsPage() {
  const t = useTranslations("admin.dashboard.articleEditor.communitySettings");
  const [privacy, setPrivacy] = useState<PrivacyMode>("public");
  const [publishing, setPublishing] = useState(true);
  const [evaluation, setEvaluation] = useState(true);
  const [comments, setComments] = useState(true);
  const [likes, setLikes] = useState(true);
  const [following, setFollowing] = useState(false);

  return (
    <div className="space-y-8 text-right">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("page.breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("page.breadcrumbs.articleEditor"), href: ROUTES.ADMIN.ARTICLE_EDITOR.LIST },
          { label: t("page.breadcrumbs.current") },
        ]} />
        <DashboardPageHeader
        title={t("page.title")}
        description={t("page.description")}
      />
      </div>

      <div className="rounded-[1.75rem] border border-[#E8ECF2] bg-[#F8F9FB] p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-stretch">
          <Card className="flex min-h-0 flex-col rounded-[1.25rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D] lg:min-h-[28rem]">
            <CardContent className="flex flex-1 flex-col space-y-1 p-5 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-[#2D3E50] border-b-3 border-[#F8F9FA] pb-3">
                <Settings2 className="h-5 w-5 shrink-0 text-[#2B415E]" aria-hidden />
                <span>{t("controls.title")}</span>
              </h2>
              <div className="flex flex-1 flex-col justify-between gap-0">
                <ToggleRow
                  label={t("controls.publishing")}
                  description={t("controls.publishingDescription")}
                  checked={publishing}
                  onChange={setPublishing}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                />
                <ToggleRow
                  label={t("controls.evaluation")}
                  description={t("controls.evaluationDescription")}
                  checked={evaluation}
                  onChange={setEvaluation}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                />
                <ToggleRow
                  label={t("controls.comments")}
                  description={t("controls.commentsDescription")}
                  checked={comments}
                  onChange={setComments}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                />
                <ToggleRow
                  label={t("controls.likes")}
                  description={t("controls.likesDescription")}
                  checked={likes}
                  onChange={setLikes}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                />
                <ToggleRow
                  label={t("controls.following")}
                  description={t("controls.followingDescription")}
                  checked={following}
                  onChange={setFollowing}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            <Card className="rounded-[1.25rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#2D3E50]">
                  <Lock className="h-5 w-5 shrink-0 text-[#C7AF6E]" aria-hidden />
                  <span>{t("privacy.title")}</span>
                </h2>
                <PrivacyOption
                  selected={privacy === "public"}
                  title={t("privacy.publicTitle")}
                  description={t("privacy.publicDescription")}
                  onSelect={() => setPrivacy("public")}
                />
                <PrivacyOption
                  selected={privacy === "school"}
                  title={t("privacy.schoolTitle")}
                  description={t("privacy.schoolDescription")}
                  onSelect={() => setPrivacy("school")}
                />
              </CardContent>
            </Card>

            <Card className="relative flex-1 overflow-hidden rounded-[1.25rem] border-0 bg-gradient-to-br from-[#1a2f4a] to-[#243B5A] text-white shadow-[0px_8px_0px_0px_#00000014]">
              <Sparkles className="absolute -end-4 -bottom-4 h-32 w-32 text-white/10" aria-hidden />
              <CardContent className="relative space-y-4 p-6 sm:p-7">
                <p className="text-sm font-bold text-white/90">{t("engagement.sectionTitle")}</p>
                <p className="text-3xl font-black tracking-tight text-[#FFC857] sm:text-4xl">
                  {t("engagement.metricValue")}
                </p>
                <p className="text-sm text-white/80">{t("engagement.metricSubtitle")}</p>
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-[#C7AF6E] px-5 text-sm font-bold text-[#1E293B] shadow-sm hover:bg-[#b89a5c]"
                >
                  {t("engagement.cta")}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      <Card
        id="community-badges"
        className="overflow-hidden rounded-[1.5rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]"
      >
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center justify-end gap-2 text-lg font-extrabold text-[#2D3E50] border-b-3 border-[#F8F9FA] pb-3">
              <StarTag className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <span>{t("badges.title")}</span>
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-10 rounded-lg border-2 border-[#2D3E50] bg-white text-sm font-bold text-[#2D3E50] hover:bg-slate-50" asChild>
                <a href="#community-badges">{t("badges.manage")}</a>
              </Button>
              <Button
                type="button"
                className="h-10 rounded-lg bg-[#2D3E50] px-4 text-sm font-bold text-white shadow-[0px_3px_0px_0px_#1a2d45] hover:bg-[#243B5A]"
                asChild
              >
                <Link href={ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_BADGE_ADD} className="inline-flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" aria-hidden />
                  {t("badges.add")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EEF4FD] bg-[#FAFBFC]">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-[#F1F5F9] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t("badges.table.icon")}</th>
                  <th className="px-4 py-3">{t("badges.table.name")}</th>
                  <th className="px-4 py-3">{t("badges.table.condition")}</th>
                  <th className="px-4 py-3">{t("badges.table.recipients")}</th>
                  <th className="px-4 py-3">{t("badges.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF2]">
                <BadgeTableRow
                  accent="emerald"
                  icon={<Star className="h-5 w-5 text-emerald-600" />}
                  iconBg="bg-emerald-50"
                  name={t("badges.rows.star.name")}
                  condition={t("badges.rows.star.condition")}
                  recipientsLabel={t("badges.rows.star.recipients")}
                  showAvatarStack
                  actionLabel={t("badges.rows.star.action")}
                  actionVariant="danger"
                />
                <BadgeTableRow
                  accent="amber"
                  icon={<BadgeCheck className="h-5 w-5 text-amber-600" />}
                  iconBg="bg-amber-50"
                  name={t("badges.rows.factChecker.name")}
                  condition={t("badges.rows.factChecker.condition")}
                  recipientsLabel={t("badges.rows.factChecker.recipients")}
                  showAvatarStack
                  actionLabel={t("badges.rows.factChecker.action")}
                  actionVariant="danger"
                />
                <BadgeTableRow
                  accent="blue"
                  icon={<BookOpen className="h-5 w-5 text-blue-700" />}
                  iconBg="bg-blue-50"
                  name={t("badges.rows.researcher.name")}
                  condition={t("badges.rows.researcher.condition")}
                  recipientsLabel={t("badges.rows.researcher.recipients")}
                  showAvatarStack={false}
                  actionLabel={t("badges.rows.researcher.action")}
                  actionVariant="success"
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacyOption(props: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-xl border-2 p-4 text-right transition-colors",
        props.selected ? "border-[#2D3E50] bg-[#F0F4FA]" : "border-[#E8ECF2] bg-white hover:border-slate-300",
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-bold text-[#2D3E50]">{props.title}</p>
        <p className="text-sm leading-relaxed text-slate-500">{props.description}</p>
      </div>
      <span
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          props.selected ? "border-[#2D3E50] bg-[#2D3E50]" : "border-slate-300 bg-white",
        )}
        aria-hidden
      >
        {props.selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
    </button>
  );
}

function ToggleRow(props: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <div className="bg-[#F8F9FA] rounded-xl p-4 flex flex-col gap-2 border-b border-[#EEF2F6] py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
      <div className="min-w-0 space-y-0.5">
        <p className="font-bold text-[#2D3E50]">{props.label}</p>
        <p className="text-xs leading-relaxed text-slate-500">{props.description}</p>
      </div>
      <StatusSwitch
        checked={props.checked}
        onChange={props.onChange}
        activeLabel={props.activeLabel}
        inactiveLabel={props.inactiveLabel}
        activeClassName="bg-[#4CAF50]"
        inactiveClassName="bg-slate-200"
      />
    </div>
  );
}

function RecipientAvatarStack() {
  const colors = ["bg-sky-200", "bg-amber-200", "bg-emerald-200"];
  return (
    <div className="flex items-center justify-end">
      <div className="flex flex-row-reverse items-center">
        {colors.map((bg, i) => (
          <span
            key={`stack-${i}`}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-slate-700",
              bg,
              i > 0 && "-me-2",
            )}
            aria-hidden
          >
            {i === 0 ? "+" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function BadgeTableRow(props: {
  accent: "emerald" | "amber" | "blue";
  icon: ReactNode;
  iconBg: string;
  name: string;
  condition: string;
  recipientsLabel: string;
  showAvatarStack: boolean;
  actionLabel: string;
  actionVariant: "danger" | "success";
}) {
  const accentClass =
    props.accent === "emerald"
      ? "border-s-emerald-500"
      : props.accent === "amber"
        ? "border-s-amber-400"
        : "border-s-blue-500";

  return (
    <tr className={cn("border-s-4 bg-white hover:bg-[#FAFCFF]", accentClass)}>
      <td className="px-4 py-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg border border-[#E8ECF2]",
            props.iconBg,
          )}
        >
          {props.icon}
        </div>
      </td>
      <td className="px-4 py-4 font-bold text-[#2D3E50]">{props.name}</td>
      <td className="max-w-xs px-4 py-4 text-slate-600">{props.condition}</td>
      <td className="px-4 py-4">
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <span className="text-slate-600">{props.recipientsLabel}</span>
          {props.showAvatarStack ? <RecipientAvatarStack /> : null}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#E2E8F0] p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-bold",
              props.actionVariant === "danger"
                ? "border-[#F44336]/40 text-[#F44336] hover:bg-red-50"
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
            )}
          >
            {props.actionLabel}
          </Button>
        </div>
      </td>
    </tr>
  );
}
