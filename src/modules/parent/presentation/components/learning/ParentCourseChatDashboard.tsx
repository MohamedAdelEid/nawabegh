"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentChatThread } from "@/modules/parent/application/hooks/useParentChat";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentChatMessageBubble } from "@/modules/parent/presentation/components/chat/ParentChatMessageBubble";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentCourseChatDashboard({
  studentUserId,
  courseId,
}: {
  studentUserId: string;
  courseId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const tChat = useTranslations("parent.dashboard.conversations");
  const { data, isLoading, isError, error, refetch } = useParentChatThread(
    { kind: "course", id: courseId },
    null,
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          asChild
          variant="outline"
          className="order-2 h-11 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e] sm:order-1"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_COURSES(studentUserId)}>
            {t("backToCourses")}
          </Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbChat")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{t("courseChat")}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Eye className="size-4 shrink-0" aria-hidden />
        <div>
          <p className="font-bold">{t("readOnlyChat")}</p>
          <p className="text-xs">{t("readOnlyChatHint")}</p>
        </div>
      </div>

      <section className="flex min-h-[480px] flex-col overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
        {isLoading ? (
          <div className="flex-1 space-y-4 p-6">
            <Skeleton className="mx-auto h-6 w-16 rounded-lg" />
            <Skeleton className="ms-auto h-20 w-2/3 rounded-2xl" />
            <Skeleton className="me-auto h-16 w-1/2 rounded-2xl" />
          </div>
        ) : isError || !data ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : tCommon("error")}
            </p>
            <Button type="button" onClick={() => refetch()}>
              {tCommon("retry")}
            </Button>
          </div>
        ) : (
          <>
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-[#f8f9fa] px-6">
              <div className="text-start">
                <h3 className="text-sm font-bold text-[#2b415e]" dir="auto">
                  {data.title}
                </h3>
                {data.subtitle ? (
                  <p className="text-[11px] text-[#64748b]" dir="auto">
                    {data.subtitle}
                  </p>
                ) : null}
              </div>
              <ParentAvatar
                url={data.avatarUrl}
                name={data.title}
                className="size-10"
                roundedClassName="rounded-full"
              />
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#fdfdfd] p-6">
              <div className="space-y-4">
                {data.dateGroups.map((group) => (
                  <div key={group.label} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="rounded-lg bg-white/80 px-3 py-1 text-[10px] font-bold uppercase text-[#64748b] shadow-sm backdrop-blur-[2px]">
                        {group.label}
                      </span>
                    </div>
                    {group.messages.map((message) => (
                      <ParentChatMessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                ))}
                {data.dateGroups.length === 0 ? (
                  <p className="py-16 text-center text-sm text-slate-500">
                    {tChat("noMessages")}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
