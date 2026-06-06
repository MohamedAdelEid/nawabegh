"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Award,
  BookCheck,
  CloudUpload,
  FilePenLine,
  Heart,
  Lightbulb,
  List,
  MessageSquare,
  Save,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { ADMIN_COMMUNITY_BADGES_TABLE_QUERY_KEY } from "@/modules/admin/application/hooks/useCommunityBadgesTable";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import type { CommunityBadgeColor, CommunityBadgeRow } from "@/modules/admin/domain/types/communityBadges.types";
import {
  activityTypeToKey,
  buildCommunityBadgePayload,
  type CommunityBadgeActivityKey,
} from "@/modules/admin/domain/utils/communityBadgeMappers";
import {
  createCommunityBadge,
  getCommunityBadge,
  updateCommunityBadge,
} from "@/modules/admin/infrastructure/api/communityBadgesApi";
import {
  BADGE_ICON_UPLOAD_FOLDER,
  uploadAdminFile,
} from "@/modules/admin/infrastructure/api/fileUploadApi";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

type CommunityBadgeFormPageProps = {
  mode: "create" | "edit";
  badgeId?: string;
};

export function CommunityBadgeFormPage({ mode, badgeId }: CommunityBadgeFormPageProps) {
  const t = useTranslations("admin.dashboard.articleEditor.communityBadgeAdd");
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(mode === "edit");
  const [name, setName] = useState("");
  const [level, setLevel] = useState<CommunityBadgeColor>("gold");
  const [description, setDescription] = useState("");
  const [activity, setActivity] = useState<CommunityBadgeActivityKey>("posts");
  const [minimum, setMinimum] = useState("50");
  const [iconUrl, setIconUrl] = useState("");
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !badgeId) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      const result = await getCommunityBadge(badgeId);
      if (cancelled) return;

      if (!result.data) {
        notify.error(result.errorMessage ?? t("errors.loadFailed"));
        router.push(ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_BADGES);
        return;
      }

      applyBadgeToForm(result.data);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [badgeId, mode, router, t]);

  const applyBadgeToForm = (badge: CommunityBadgeRow) => {
    setName(badge.name);
    setLevel(badge.color);
    setDescription(badge.description);
    setActivity(activityTypeToKey(badge.activityType));
    setMinimum(String(badge.minCount));
    setIconUrl(badge.iconUrl ?? "");
    setIconPreviewUrl(badge.iconUrl ? resolveFileUrl(badge.iconUrl) : null);
  };

  const target = useMemo(() => {
    const n = Number.parseInt(minimum.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [minimum]);

  const previewCurrent = useMemo(
    () => Math.min(Math.max(0, Math.floor(target * 0.64)), target),
    [target],
  );

  const handleIconSelect = async (file: File | null) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notify.error(t("validation.iconType"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      notify.error(t("validation.iconSize"));
      return;
    }

    setIconPreviewUrl(URL.createObjectURL(file));
    setUploadingIcon(true);

    const upload = await uploadAdminFile(file, BADGE_ICON_UPLOAD_FOLDER);
    setUploadingIcon(false);

    if (!upload.ok) {
      notify.error(upload.errorMessage);
      return;
    }

    setIconUrl(upload.filePath);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notify.error(t("validation.nameRequired"));
      return;
    }
    if (!description.trim()) {
      notify.error(t("validation.descriptionRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = buildCommunityBadgePayload({
        name,
        description,
        color: level,
        activity,
        minCount: target,
        iconUrl: iconUrl.trim(),
      });

      const result =
        mode === "edit" && badgeId
          ? await updateCommunityBadge(badgeId, payload)
          : await createCommunityBadge(payload);

      if (result.status === "Success" || result.data) {
        notify.success(mode === "edit" ? t("actions.updated") : t("actions.saved"));
        await queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITY_BADGES_TABLE_QUERY_KEY] });
        router.push(ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_BADGES);
        router.refresh();
        return;
      }

      notify.error(result.errorMessage ?? t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = mode === "edit" ? t("page.editTitle") : t("page.title");
  const pageDescription = mode === "edit" ? t("page.editDescription") : t("page.description");
  const breadcrumbCurrent = mode === "edit" ? t("page.breadcrumbs.edit") : t("page.breadcrumbs.current");

  if (loading) {
    return (
      <div className="space-y-8 text-right">
        <Skeleton className="ms-auto h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-[1.75rem]" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FB]">
      <div className="mx-auto space-y-8 text-right">
        <DashboardPageHeader
          title={pageTitle}
          description={pageDescription}
          breadcrumbs={[
            { label: t("page.breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
            { label: t("page.breadcrumbs.articleEditor"), href: ROUTES.ADMIN.ARTICLE_EDITOR.LIST },
            {
              label: t("page.breadcrumbs.communitySettings"),
              href: ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_SETTINGS,
            },
            {
              label: t("page.breadcrumbs.badges"),
              href: ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_BADGES,
            },
            { label: breadcrumbCurrent },
          ]}
          action={
            <Button
              type="button"
              className="h-11 min-w-[7.5rem] rounded-xl bg-[#2D3E50] px-6 text-sm font-bold text-white shadow-[0px_4px_0px_0px_#1a2d45] hover:bg-[#243B5A] disabled:opacity-50"
              disabled={saving || uploadingIcon}
              onClick={() => void handleSave()}
            >
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" aria-hidden />
                {saving ? t("actions.saving") : t("actions.save")}
              </span>
            </Button>
          }
        />

        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 border-b-2 border-[#EEF4FD] pb-4 text-xl font-extrabold text-[#2D3E50]">
                  <FilePenLine className="h-6 w-6 shrink-0 text-[#2B415E]" aria-hidden />
                  <span>{t("identity.title")}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <LabeledInput
                    label={t("identity.nameLabel")}
                    value={name}
                    onChange={setName}
                    placeholder={t("identity.namePlaceholder")}
                    labelClassName="text-[#2D3E50] font-bold"
                    inputClassName="h-12 rounded-xl border-[#E2E8F0] bg-[#FAFBFC]"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3E50]" htmlFor="badge-level">
                      {t("identity.levelLabel")}
                    </label>
                    <select
                      id="badge-level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value as CommunityBadgeColor)}
                      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#FAFBFC] px-3 text-right text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D3E50]/20"
                    >
                      <option value="bronze">{t("identity.levels.bronze")}</option>
                      <option value="silver">{t("identity.levels.silver")}</option>
                      <option value="gold">{t("identity.levels.gold")}</option>
                    </select>
                  </div>
                </div>
                <LabeledTextarea
                  label={t("identity.descriptionLabel")}
                  value={description}
                  onChange={setDescription}
                  rows={5}
                  placeholder={t("identity.descriptionPlaceholder")}
                  textareaClassName="min-h-[9rem] rounded-xl border-[#E2E8F0] bg-[#FAFBFC] text-right"
                  labelClassName="text-[#2D3E50] font-bold"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    void handleIconSelect(file);
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingIcon}
                  className="w-full rounded-2xl border-2 border-dashed border-[#C5D4E8] bg-[#F5F8FC] px-4 py-12 text-center transition-colors hover:border-[#2D3E50]/30 disabled:opacity-60"
                >
                  {iconPreviewUrl ? (
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#E8ECF2] bg-white">
                      <Image
                        src={iconPreviewUrl}
                        alt=""
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <CloudUpload className="mx-auto mb-3 h-10 w-10 text-[#8DA3C4]" aria-hidden />
                  )}
                  <p className="text-sm font-bold text-[#2D3E50]">
                    {uploadingIcon ? t("identity.uploading") : t("identity.uploadTitle")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{t("identity.uploadHint")}</p>
                </button>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 border-b border-[#EEF4FD] pb-4 text-xl font-extrabold text-[#2D3E50]">
                  <Zap className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
                  <span>{t("eligibility.title")}</span>
                </h2>
                <p className="text-sm font-bold text-[#2D3E50]">{t("eligibility.activityLabel")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ActivityCard
                      label={t("eligibility.activity.posts")}
                      icon={<MessageSquare className="h-5 w-5" />}
                      selected={activity === "posts"}
                      onSelect={() => setActivity("posts")}
                    />
                    <ActivityCard
                      label={t("eligibility.activity.comments")}
                      icon={<List className="h-5 w-5" />}
                      selected={activity === "comments"}
                      onSelect={() => setActivity("comments")}
                    />
                    <ActivityCard
                      label={t("eligibility.activity.likes")}
                      icon={<Heart className="h-5 w-5" />}
                      selected={activity === "likes"}
                      onSelect={() => setActivity("likes")}
                    />
                    <ActivityCard
                      label={t("eligibility.activity.lessons")}
                      icon={<BookCheck className="h-5 w-5" />}
                      selected={activity === "lessons"}
                      onSelect={() => setActivity("lessons")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <LabeledInput
                      label={t("eligibility.minimumLabel")}
                      value={minimum}
                      onChange={setMinimum}
                      placeholder="50"
                      labelClassName="text-[#2D3E50] font-bold"
                      inputClassName="h-12 rounded-xl border-[#E2E8F0] bg-[#FAFBFC]"
                    />
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-[#8F6C0B]">
                      {t("eligibility.banner")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <BadgeLivePreview
              name={name}
              description={description}
              level={level}
              current={previewCurrent}
              target={target}
              iconPreviewUrl={iconPreviewUrl}
            />
            <Card className="rounded-[1.5rem] border-0 bg-gradient-to-br from-[#1a2f4a] to-[#243B5A] p-5 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#58CC02]" aria-hidden />
                <div>
                  <p className="font-bold text-[#58CC02]">{t("tip.title")}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">{t("tip.body")}</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ActivityCard(props: {
  label: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        "flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-colors",
        props.selected
          ? "border-[#2D3E50] bg-[#F0F4FA] text-[#2D3E50] shadow-sm"
          : "border-[#E8ECF2] bg-white text-slate-600 hover:border-slate-300",
      )}
    >
      {props.icon}
      <span className="text-[11px] font-bold leading-tight sm:text-xs">{props.label}</span>
    </button>
  );
}

function BadgeLivePreview(props: {
  name: string;
  description: string;
  level: CommunityBadgeColor;
  current: number;
  target: number;
  iconPreviewUrl: string | null;
}) {
  const t = useTranslations("admin.dashboard.articleEditor.communityBadgeAdd");
  const pct =
    props.target > 0 ? Math.min(100, Math.round((props.current / props.target) * 100)) : 0;
  const ribbon =
    props.level === "gold"
      ? t("preview.levelRibbon")
      : props.level === "silver"
        ? t("identity.levels.silver")
        : t("identity.levels.bronze");

  return (
    <Card className="overflow-hidden rounded-[1.5rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <p className="text-center text-sm font-extrabold text-[#2D3E50]">{t("preview.title")}</p>
        <div className="mx-auto max-w-[15rem] space-y-4 rounded-2xl p-6">
          <div className="relative mx-auto flex w-[5.5rem] justify-center">
            <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#3b6ea8] to-[#1e3a5f] shadow-md ring-4 ring-[#C7AF6E]/40">
              {props.iconPreviewUrl ? (
                <Image
                  src={props.iconPreviewUrl}
                  alt=""
                  width={88}
                  height={88}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Award className="h-9 w-9 text-[#FFC857]" aria-hidden />
              )}
            </div>
            <span className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#C7AF6E] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#1E293B] shadow">
              {ribbon}
            </span>
          </div>
          <div className="space-y-1 pt-2 text-center">
            <p className="text-base font-extrabold text-[#2D3E50]">
              {props.name.trim() || t("preview.nameFallback")}
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              {props.description.trim() || t("preview.descriptionFallback")}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>{t("preview.progress", { current: props.current, target: props.target })}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#C7AF6E] to-[#e8d5a3]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] leading-relaxed text-slate-400">{t("preview.caption")}</p>
      </CardContent>
    </Card>
  );
}
