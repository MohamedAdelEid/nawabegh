"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PenLine, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import {
  fetchUserManagementDisplayById,
  type UserManagementDisplay,
} from "@/modules/admin/presentation/lib/fetchUserManagementDisplayById";

function formatTimestamp(value: string | null, locale: string): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale.startsWith("ar") ? "ar" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PersonBlock({
  title,
  icon: Icon,
  userId,
  timestamp,
  timestampLabel,
}: {
  title: string;
  icon: typeof PenLine;
  userId: string | null;
  timestamp: string | null;
  timestampLabel: string;
}) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const [profile, setProfile] = useState<UserManagementDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      setLoadFailed(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadFailed(false);

    void (async () => {
      const result = await fetchUserManagementDisplayById(userId);
      if (cancelled) return;

      if (!result) {
        setProfile(null);
        setLoadFailed(true);
      } else {
        setProfile(result);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const formattedTimestamp = formatTimestamp(timestamp, locale);
  const roleLabel = profile
    ? t(`questionBankPreview.people.roles.${profile.roleId}`)
    : null;

  return (
    <section className="space-y-3 rounded-2xl bg-slate-50 p-4 text-right">
      <h5 className="flex items-center justify-end gap-2 text-sm font-bold text-[#2C4260]">
        <Icon className="h-4 w-4 text-[#C7AF6E]" aria-hidden />
        {title}
      </h5>

      {!userId ? (
        <p className="text-sm text-slate-500">{t("questionBankPreview.people.notAssigned")}</p>
      ) : isLoading ? (
        <div className="flex items-center justify-end gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="ms-auto h-4 w-32" />
            <Skeleton className="ms-auto h-3 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      ) : loadFailed ? (
        <p className="text-sm text-slate-500">{t("questionBankPreview.people.loadError")}</p>
      ) : profile ? (
        <div className="flex items-center justify-end gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-[#1E3A66]">{profile.fullName}</p>
            {roleLabel ? <p className="text-sm text-slate-500">{roleLabel}</p> : null}
            <p className="mt-1 truncate text-xs text-slate-500">{profile.email}</p>
            <p className="truncate text-xs text-slate-500" dir="ltr">
              {profile.phoneNumber}
            </p>
          </div>
          <UserAvatarImageOrInitials
            trackKey={profile.userId}
            name={profile.fullName}
            imageUrl={profile.profileImageUrl}
            size="md"
            circleClassName="bg-[#DBEEF6] text-[#255E8A]"
          />
        </div>
      ) : null}

      {formattedTimestamp ? (
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">{timestampLabel}: </span>
          {formattedTimestamp}
        </p>
      ) : null}
    </section>
  );
}

interface QuestionBankPreviewPeopleCardProps {
  authorUserId: string | null;
  submittedAtUtc: string | null;
  reviewedByUserId: string | null;
  reviewedAtUtc: string | null;
}

export function QuestionBankPreviewPeopleCard({
  authorUserId,
  submittedAtUtc,
  reviewedByUserId,
  reviewedAtUtc,
}: QuestionBankPreviewPeopleCardProps) {
  const t = useTranslations("admin.dashboard");

  return (
    <Card
      className="rounded-2xl border border-[#EEF4FD] border-s-4 border-s-[#C7AF6E] bg-white shadow-[0px_6px_0px_0px_#0000000A]"
    >
      <CardContent className="space-y-4 p-4 text-right">
        <h4 className="text-lg font-extrabold text-[#2C4260]">
          {t("questionBankPreview.people.title")}
        </h4>

        <PersonBlock
          title={t("questionBankPreview.people.author")}
          icon={PenLine}
          userId={authorUserId}
          timestamp={submittedAtUtc}
          timestampLabel={t("questionBankPreview.people.submittedAt")}
        />

        <PersonBlock
          title={t("questionBankPreview.people.reviewer")}
          icon={UserCheck}
          userId={reviewedByUserId}
          timestamp={reviewedAtUtc}
          timestampLabel={t("questionBankPreview.people.reviewedAt")}
        />
      </CardContent>
    </Card>
  );
}
