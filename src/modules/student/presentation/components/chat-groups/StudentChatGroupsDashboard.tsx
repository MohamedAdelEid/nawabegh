"use client";

import Link from "next/link";
import { BookOpen, Search, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStudentChatGroups } from "@/modules/student/application/hooks/useStudentChatGroups";
import type {
  StudentChatGroupListItem,
  StudentChatListFilter,
} from "@/modules/student/domain/chat-groups/student-chat.types";
import { StudentChatGroupsSkeleton } from "@/modules/student/presentation/components/chat-groups/StudentChatSkeletons";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

function GroupCard({ group }: { group: StudentChatGroupListItem }) {
  const t = useTranslations("student.dashboard.chatGroups");
  const coverUrl = resolveFileUrl(group.coverImageUrl);

  return (
    <Link
      href={ROUTES.USER.STUDENT.CHAT_GROUPS.VIEW(group.courseId)}
      className="flex w-full items-center gap-4 rounded-xl border border-[#f1f5f9] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[rgba(44,66,96,0.1)] text-[#2c4260]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="size-full object-cover" />
        ) : (
          <BookOpen className="size-7" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5 text-right">
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-xs text-[#94a3b8]">
            {group.lastMessageAtLabel ?? ""}
          </span>
          <h3 className="truncate text-lg font-bold text-[#1e293b]">{group.groupName}</h3>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 text-sm text-[#64748b]">
          <span className="inline-flex items-center gap-1">
            {group.instructorName}
            <User className="size-3.5" aria-hidden />
          </span>
          {group.participantsCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              {t("studentsCount", { count: group.participantsCount })}
              <Users className="size-3.5" aria-hidden />
            </span>
          ) : null}
        </div>

        {group.lastMessagePreview ? (
          <div className="rounded-lg border-r-4 border-[#c7af6d] bg-[#f8fafc] px-4 py-1.5 text-sm text-[#475569]">
            {group.lastMessageSender ? (
              <span className="font-bold text-[#2c4260]">{group.lastMessageSender}: </span>
            ) : null}
            <span>{group.lastMessagePreview}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

const FILTERS: StudentChatListFilter[] = ["all", "active"];

export function StudentChatGroupsDashboard() {
  const t = useTranslations("student.dashboard.chatGroups");
  const {
    groups,
    search,
    setSearch,
    filter,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch,
  } = useStudentChatGroups();

  if (isLoading) {
    return <StudentChatGroupsSkeleton label={t("loading")} />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={errorMessage ?? t("error")} />
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => void refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md lg:order-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-transparent bg-white py-2.5 pe-10 ps-4 text-right text-base text-slate-700 shadow-[0_0_0_1px_#e2e8f0,0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#6b7280] focus:border-[#2c4260]"
          />
        </div>

        <div className="space-y-2 text-right lg:order-2">
          <h1 className="text-3xl font-bold text-[#2c4260]">{t("title")}</h1>
          <p className="text-base text-[#64748b]">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-medium transition-colors",
              filter === item
                ? "bg-[#2c4260] text-white shadow-md"
                : "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50",
            )}
          >
            {t(`filters.${item}`)}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
          {search.trim() ? t("emptySearch") : t("empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <GroupCard key={group.courseId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
