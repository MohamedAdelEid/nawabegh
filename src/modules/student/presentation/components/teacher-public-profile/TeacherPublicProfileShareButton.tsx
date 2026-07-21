"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";

type TeacherPublicProfileShareButtonProps = {
  teacherId: string;
  fullName: string;
};

export function TeacherPublicProfileShareButton({
  teacherId,
  fullName,
}: TeacherPublicProfileShareButtonProps) {
  const t = useTranslations("student.dashboard.teacherPublicProfile.page");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${ROUTES.USER.STUDENT.TEACHER_PROFILE(teacherId)}`
        : ROUTES.USER.STUDENT.TEACHER_PROFILE(teacherId);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: fullName, url: shareUrl });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setFeedback(t("shareCopied"));
      window.setTimeout(() => setFeedback(null), 2500);
    } catch {
      setFeedback(t("shareFailed"));
      window.setTimeout(() => setFeedback(null), 2500);
    }
  }, [fullName, t, teacherId]);

  return (
    <div className="flex flex-col items-stretch gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => void handleShare()}
        className="h-12 rounded-xl border-2 border-[#e2e8f0] bg-white px-6 text-sm font-bold text-[#2b415e] hover:bg-[#f8fafc]"
      >
        <Share2 className="size-4" aria-hidden />
        {t("shareProfile")}
      </Button>
      {feedback ? (
        <p className="text-center text-xs font-medium text-[#64748b]" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
