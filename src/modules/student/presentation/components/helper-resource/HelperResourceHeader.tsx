"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, X } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type HelperResourceHeaderProps = {
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  displayName?: string;
  courseId?: string | null;
  pathId?: string | null;
  variant?: "grid" | "viewer";
  onBack?: () => void;
  className?: string;
  endSlot?: React.ReactNode;
};

export function HelperResourceHeader({
  title,
  subtitle,
  avatarUrl,
  displayName,
  courseId,
  pathId,
  variant = "grid",
  onBack,
  className,
  endSlot,
}: HelperResourceHeaderProps) {
  const t = useTranslations("student.dashboard.helperResource");
  const router = useRouter();

  const goToJourney = () => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const qs = params.toString();
    router.push(
      qs ? `${ROUTES.USER.STUDENT.JOURNEY}?${qs}` : ROUTES.USER.STUDENT.JOURNEY,
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    goToJourney();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md",
        variant === "viewer" && "bg-[#1e293b] border-[#1e293b]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label={t("backToJourney")}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition",
              variant === "viewer"
                ? "text-white/80 hover:bg-white/10"
                : "text-[#64748b] hover:bg-[#f1f5f9]",
            )}
          >
            {variant === "grid" ? (
              <X className="size-5" />
            ) : (
              <ArrowRight className="size-5 rtl:rotate-0" />
            )}
          </button>

          <div className="min-w-0 text-end">
            <p
              className={cn(
                "truncate text-base font-bold md:text-lg",
                variant === "viewer" ? "text-white" : "text-[#2c4260]",
              )}
            >
              {title || t("page.title")}
            </p>
            {subtitle ? (
              <p
                className={cn(
                  "truncate text-xs",
                  variant === "viewer" ? "text-white/60" : "text-[#94a3b8]",
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {endSlot}
          {(avatarUrl || displayName) && (
            <div className="hidden items-center gap-2 sm:flex">
              {displayName && variant === "grid" ? (
                <span className="text-sm font-medium text-[#334155]">
                  {displayName}
                </span>
              ) : null}
              <div className="size-10 overflow-hidden rounded-full border-2 border-[rgba(44,66,96,0.2)] bg-[#e2e8f0]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs font-bold text-[#64748b]">
                    {(displayName ?? "U").slice(0, 1)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
