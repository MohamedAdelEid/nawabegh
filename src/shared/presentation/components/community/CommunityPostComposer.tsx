"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Link2, Paperclip, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export function CommunityPostComposer() {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.composer");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();

  return (
    <section className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
      <div className="flex items-start gap-3">
        <UserAvatarImageOrInitials trackKey="composer-you" name={t("you")} imageUrl={null} size="md" />
        <button
          type="button"
          onClick={() => router.push(routes.knowledgeCommunity.CREATE)}
          className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm text-slate-400 transition hover:border-slate-300"
        >
          {t("placeholder")}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-500">
          <button type="button" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs hover:bg-slate-50">
            <ImageIcon className="h-4 w-4" />
            {t("image")}
          </button>
          <button type="button" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs hover:bg-slate-50">
            <Paperclip className="h-4 w-4" />
            {t("file")}
          </button>
          <button type="button" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs hover:bg-slate-50">
            <Link2 className="h-4 w-4" />
            {t("link")}
          </button>
        </div>
        <Button asChild className="rounded-xl bg-[#2C4260] px-5 hover:bg-[#243652]">
          <Link href={routes.knowledgeCommunity.CREATE}>
            <Send className="h-4 w-4" />
            {t("publish")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
