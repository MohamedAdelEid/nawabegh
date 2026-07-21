"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Info,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useShortQuizIntro } from "@/modules/student/application/hooks/useShortQuizStation";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { ShortQuizSkeleton } from "./ShortQuizSkeleton";

type ShortQuizIntroViewProps = {
  stationId: string;
  theme?: "navy" | "gold";
};

export function ShortQuizIntroView({
  stationId,
  theme = "navy",
}: ShortQuizIntroViewProps) {
  const t = useTranslations("student.dashboard.shortQuiz");
  const router = useRouter();
  const searchParams = useSearchParams();
  const introQuery = useShortQuizIntro({ stationId });

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

  const isGold = theme === "gold";
  const accent = isGold ? "#c7af6d" : "#2c4260";
  const heroClass = isGold
    ? "bg-[#c7af6d]"
    : "bg-gradient-to-r from-[#334155] to-[#10294a]";

  if (introQuery.isLoading) return <ShortQuizSkeleton variant="intro" />;

  if (introQuery.error || !introQuery.data) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4 p-6">
        <ApiFailureAlert
          message={
            introQuery.error instanceof Error
              ? introQuery.error.message
              : t("errors.load")
          }
          fallbackMessage={t("errors.load")}
        />
        <Button type="button" variant="outline" onClick={() => void introQuery.refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const intro = introQuery.data;
  const stats = [
    {
      value: String(intro.questionCount || "—"),
      label: t("intro.stats.questions"),
      icon: ClipboardList,
    },
    {
      value: t("intro.stats.durationValue", { minutes: intro.durationMinutes }),
      label: t("intro.stats.duration"),
      icon: Timer,
    },
    {
      value: `${intro.passScore}%`,
      label: t("intro.stats.passScore"),
      icon: ShieldCheck,
    },
    {
      value: String(intro.maxAttempts),
      label: t("intro.stats.attempts"),
      icon: RotateCcw,
    },
  ];

  const instructions = [
    t("intro.instructions.internet"),
    t("intro.instructions.timer"),
    t("intro.instructions.review"),
    t("intro.instructions.support"),
  ];

  return (
    <div className="min-h-full bg-[#f6f7f7]">
      <header className="sticky top-0 z-10 border-b border-[rgba(44,66,96,0.1)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: accent }}
            >
              <ClipboardList className="size-[18px]" />
            </div>
            <div className="text-end">
              <h1 className="text-lg font-bold text-[#2c4260]">{t("intro.headerTitle")}</h1>
              <p className="text-xs text-[#64748b]">{t("intro.headerSubtitle")}</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-[#f1f5f9]">
            <Link href={journeyHref} aria-label={t("actions.back")}>
              <ArrowLeft className="size-5 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] space-y-8 px-4 py-8 sm:px-6">
        <section
          className={cn(
            "relative overflow-hidden rounded-2xl p-6 text-white shadow-xl sm:p-8",
            heroClass,
          )}
        >
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3 text-end">
              {(intro.subjectName || intro.name) && (
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur">
                  {intro.subjectName || intro.name}
                </span>
              )}
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
                {intro.quizTitle}
              </h2>
              {intro.learningPathTitle ? (
                <p className="text-base text-white/80 sm:text-lg">{intro.learningPathTitle}</p>
              ) : null}
            </div>
            <div className="min-w-[140px] rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-center backdrop-blur">
              <p className="text-sm text-white/80">{t("intro.totalScore")}</p>
              <p className="text-5xl font-bold">{intro.totalPoints || 100}</p>
              <p className="text-xs text-white/70">{t("intro.points")}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
            >
              <div
                className="mb-3 flex size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${accent}1a` }}
              >
                <stat.icon className="size-5" style={{ color: accent }} />
              </div>
              <p className="text-2xl font-bold text-[#2c4260]">{stat.value}</p>
              <p className="text-sm text-[#64748b]">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-end gap-3">
            <h3 className="text-xl font-bold text-[#1e293b]">{t("intro.instructionsTitle")}</h3>
            <Info className="size-5 text-[#2c4260]" />
          </div>
          <ul className="space-y-4">
            {instructions.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-xl bg-[#f8fafc] px-4 py-4"
              >
                <p className="flex-1 text-end text-base leading-relaxed text-[#334155]">{item}</p>
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                  <CheckCircle2 className="size-3.5 text-[#16a34a]" />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col-reverse gap-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-14 flex-1 rounded-2xl border-2 text-base font-bold sm:max-w-[300px]"
            onClick={() => router.push(journeyHref)}
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("actions.back")}
          </Button>
          <Button
            type="button"
            className="h-14 flex-[2] rounded-2xl text-base font-bold text-white"
            style={{ backgroundColor: accent }}
            onClick={() =>
              router.push(withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_INSTRUCTIONS(stationId)))
            }
          >
            <PlayCircle className="size-5" />
            {t("actions.startNow")}
          </Button>
        </section>
      </main>
    </div>
  );
}
