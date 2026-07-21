"use client";

import { Lock, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useSchoolCommunitySettings } from "@/modules/school/application/hooks/useSchoolCommunitySettings";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { cn } from "@/shared/application/lib/cn";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  activeLabel,
  inactiveLabel,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  activeLabel: string;
  inactiveLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="space-y-1 text-right">
        <p className="font-bold text-[#2D3E50]">{label}</p>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <StatusSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        activeLabel={activeLabel}
        inactiveLabel={inactiveLabel}
      />
    </div>
  );
}

function OptionCard({
  selected,
  title,
  description,
  onSelect,
  disabled,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-right transition",
        selected
          ? "border-[#2B415E] bg-[#EEF4FD]"
          : "border-slate-200 bg-white hover:border-slate-300",
        disabled && "opacity-60",
      )}
    >
      <p className="font-bold text-[#2D3E50]">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </button>
  );
}

export function SchoolCommunitySettingsView() {
  const t = useTranslations("school.dashboard.articleEditor.settings");
  const common = useTranslations("school.dashboard.common");
  const messages = useTranslations("school.dashboard.articleEditor.messages");
  const settings = useSchoolCommunitySettings();
  const { form, isLoading, isSaving } = settings;
  const controlsDisabled = isLoading || isSaving || !form;

  const wrap = async (action: () => Promise<void>) => {
    try {
      await action();
      notify.success(messages("settingsSaved"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : messages("actionError"));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("breadcrumbs.home"), href: ROUTES.USER.SCHOOL.HOME },
            { label: t("breadcrumbs.articles"), href: ROUTES.USER.SCHOOL.ARTICLES.LIST },
            { label: t("breadcrumbs.current") },
          ]}
        />
        <DashboardPageHeader title={t("title")} description={t("description")} />
      </div>

      {settings.isError ? (
        <div className="space-y-3">
          <ApiFailureAlert
            message={
              settings.error instanceof Error ? settings.error.message : common("error")
            }
            fallbackMessage={common("error")}
          />
          <Button type="button" variant="outline" onClick={() => void settings.refetch()}>
            {common("retry")}
          </Button>
        </div>
      ) : null}

      {settings.isInheritedFromGlobal ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("inherited")}
        </p>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]"
      >
        <Card className="rounded-[1.25rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
          <CardContent className="space-y-1 p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 border-b border-[#F8F9FA] pb-3 text-lg font-extrabold text-[#2D3E50]">
              <Settings2 className="h-5 w-5 shrink-0 text-[#2B415E]" aria-hidden />
              <span>{t("controls.title")}</span>
            </h2>
            {isLoading || !form ? (
              <div className="space-y-4 py-2" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={`settings-toggle-${index}`} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <ToggleRow
                  label={t("controls.publishing")}
                  description={t("controls.publishingDescription")}
                  checked={form.enablePublishing}
                  onChange={(value) => void wrap(() => settings.setEnablePublishing(value))}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                  disabled={controlsDisabled}
                />
                <ToggleRow
                  label={t("controls.comments")}
                  description={t("controls.commentsDescription")}
                  checked={form.enableComments}
                  onChange={(value) => void wrap(() => settings.setEnableComments(value))}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                  disabled={controlsDisabled}
                />
                <ToggleRow
                  label={t("controls.likes")}
                  description={t("controls.likesDescription")}
                  checked={form.enableLikes}
                  onChange={(value) => void wrap(() => settings.setEnableLikes(value))}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                  disabled={controlsDisabled}
                />
                <ToggleRow
                  label={t("controls.ratings")}
                  description={t("controls.ratingsDescription")}
                  checked={form.enableRatings}
                  onChange={(value) => void wrap(() => settings.setEnableRatings(value))}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                  disabled={controlsDisabled}
                />
                <ToggleRow
                  label={t("controls.following")}
                  description={t("controls.followingDescription")}
                  checked={form.enableFollowing}
                  onChange={(value) => void wrap(() => settings.setEnableFollowing(value))}
                  activeLabel={t("controls.on")}
                  inactiveLabel={t("controls.off")}
                  disabled={controlsDisabled}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[1.25rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#2D3E50]">
                <Lock className="h-5 w-5 shrink-0 text-[#C7AF6E]" aria-hidden />
                <span>{t("privacy.title")}</span>
              </h2>
              {isLoading || !form ? (
                <div className="space-y-3" aria-hidden>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : (
                <>
                  <OptionCard
                    selected={form.privacyMode === "Public"}
                    title={t("privacy.publicTitle")}
                    description={t("privacy.publicDescription")}
                    onSelect={() => void wrap(() => settings.setPrivacyMode("Public"))}
                    disabled={controlsDisabled}
                  />
                  <OptionCard
                    selected={form.privacyMode === "SchoolPrivate"}
                    title={t("privacy.schoolTitle")}
                    description={t("privacy.schoolDescription")}
                    onSelect={() => void wrap(() => settings.setPrivacyMode("SchoolPrivate"))}
                    disabled={controlsDisabled}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.25rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-extrabold text-[#2D3E50]">{t("moderation.title")}</h2>
              {isLoading || !form ? (
                <div className="space-y-3" aria-hidden>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : (
                <>
                  <OptionCard
                    selected={form.moderationMode === "PreModeration"}
                    title={t("moderation.preTitle")}
                    description={t("moderation.preDescription")}
                    onSelect={() =>
                      void wrap(() => settings.setModerationMode("PreModeration"))
                    }
                    disabled={controlsDisabled}
                  />
                  <OptionCard
                    selected={form.moderationMode === "PostModeration"}
                    title={t("moderation.postTitle")}
                    description={t("moderation.postDescription")}
                    onSelect={() =>
                      void wrap(() => settings.setModerationMode("PostModeration"))
                    }
                    disabled={controlsDisabled}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.25rem] border border-[#E8ECF2] bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-extrabold text-[#2D3E50]">{t("feedSort.title")}</h2>
              {isLoading || !form ? (
                <div className="space-y-3" aria-hidden>
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : (
                <>
                  <OptionCard
                    selected={form.feedSortDefault === "Recent"}
                    title={t("feedSort.recent")}
                    description=""
                    onSelect={() => void wrap(() => settings.setFeedSortDefault("Recent"))}
                    disabled={controlsDisabled}
                  />
                  <OptionCard
                    selected={form.feedSortDefault === "Trending"}
                    title={t("feedSort.trending")}
                    description=""
                    onSelect={() => void wrap(() => settings.setFeedSortDefault("Trending"))}
                    disabled={controlsDisabled}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
