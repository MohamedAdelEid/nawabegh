"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Globe2,
  PlayCircle,
  RefreshCw,
  Timer,
} from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type ShortQuizInstructionsViewProps = {
  stationId: string;
};

export function ShortQuizInstructionsView({ stationId }: ShortQuizInstructionsViewProps) {
  const t = useTranslations("student.dashboard.shortQuiz");
  const router = useRouter();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const withQuery = (path: string) => (qs ? `${path}?${qs}` : path);

  const journeyHref = (() => {
    const params = new URLSearchParams();
    const courseId = searchParams.get("courseId");
    const pathId = searchParams.get("pathId");
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const query = params.toString();
    return query ? `${ROUTES.USER.STUDENT.JOURNEY}?${query}` : ROUTES.USER.STUDENT.JOURNEY;
  })();

  const rules = [
    {
      title: t("instructions.rules.internet.title"),
      description: t("instructions.rules.internet.description"),
      icon: Globe2,
    },
    {
      title: t("instructions.rules.refresh.title"),
      description: t("instructions.rules.refresh.description"),
      icon: RefreshCw,
    },
    {
      title: t("instructions.rules.timer.title"),
      description: t("instructions.rules.timer.description"),
      icon: Timer,
    },
    {
      title: t("instructions.rules.submit.title"),
      description: t("instructions.rules.submit.description"),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex min-h-full items-center justify-center bg-[#f6f7f7] px-4 py-10">
      <div className="w-full max-w-[768px] overflow-hidden rounded-xl border border-[#f1f5f9] bg-white shadow-xl">
        <div className="relative flex h-48 flex-col items-center justify-center gap-3 bg-[#2d4361] text-white">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <ClipboardList className="size-7" />
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t("instructions.title")}</h1>
        </div>

        <div className="space-y-8 p-6 sm:p-10">
          <ul className="space-y-6">
            {rules.map((rule) => (
              <li key={rule.title} className="flex items-start justify-end gap-4">
                <div className="text-end">
                  <h3 className="text-base font-bold text-[#1e293b]">{rule.title}</h3>
                  <p className="text-sm text-[#475569]">{rule.description}</p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[rgba(199,214,240,0.2)]">
                  <rule.icon className="size-5 text-[#2c4260]" />
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-3 rounded-lg border-r-4 border-[#f59e0b] bg-[#fffbeb] px-4 py-4">
            <p className="flex-1 text-end text-sm font-medium leading-relaxed text-[#92400e]">
              {t("instructions.warning")}
            </p>
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#f59e0b]" />
          </div>

          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <Button
              asChild
              variant="secondary"
              className="h-14 flex-1 rounded-xl bg-[rgba(199,214,240,0.3)] text-base font-bold text-[#2c4260] hover:bg-[rgba(199,214,240,0.45)]"
            >
              <Link href={journeyHref}>{t("actions.backToPath")}</Link>
            </Button>
            <Button
              type="button"
              className="h-14 flex-1 rounded-xl bg-[#2c4260] text-base font-bold text-white hover:bg-[#1e2e42]"
              onClick={() =>
                router.push(withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_ATTEMPT(stationId)))
              }
            >
              <PlayCircle className="size-5" />
              {t("actions.startNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
