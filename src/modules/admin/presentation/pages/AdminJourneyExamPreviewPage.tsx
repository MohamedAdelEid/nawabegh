"use client";

import {
  CheckCircle2,
  Download,
  Pencil,
  Shuffle,
  Star,
  Timer,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ExamStation } from "@/modules/admin/domain/data/journeyEditorData";
import { getExamStation } from "@/modules/admin/infrastructure/api/journeyEditorApi";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

const DIFFICULTY_TONE: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-rose-50 text-rose-600",
};

export function AdminJourneyExamPreviewPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examPreview");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [exam, setExam] = useState<ExamStation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await getExamStation(stationId);
      if (result.data) setExam(result.data);
      setLoading(false);
    })();
  }, [stationId]);

  if (loading || !exam) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title", { name: exam.name })}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: ROUTES.ADMIN.HOME },
          {
            label: tBc("journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          {
            label: tBc("examEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_EDITOR(journeyId, stationId),
          },
          { label: tBc("examPreview") },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 gap-2 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
            >
              <Download className="h-4 w-4" />
              {t("actions.exportPdf")} PDF
            </Button>
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() =>
                router.push(
                  ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_EDIT_QUESTIONS(journeyId, stationId),
                )
              }
            >
              <Pencil className="h-4 w-4" />
              {t("actions.editQuestions")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Questions */}
        <main className="space-y-6">
          {/* Exam header */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      "bg-emerald-50 text-emerald-600",
                    )}
                  >
                    {t("status.published")}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {t("lastEdit")} {t("today")}، 10:30 صباحاً
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
                  <span className="text-sm font-bold text-slate-700">
                    {exam.questions.length}
                  </span>
                  <span className="text-xs text-slate-400">
                    {t("stats.totalQuestions")} {t("stats.questions")}
                  </span>
                </div>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-800">{exam.name}</h2>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-[#C8AC59]" />
                  {t("info.subject")}: {t("info.secondary")}
                </span>
                <span>·</span>
                <span>{t("info.level")}: {t("info.secondary")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Questions list */}
          <div className="space-y-5">
            {exam.questions.map((question, index) => (
              <Card
                key={question.id}
                className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]"
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 text-right">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          "bg-slate-100 text-slate-500",
                        )}
                      >
                        {question.type === "multipleChoice"
                          ? "خيارات متعددة"
                          : "صح أو خطأ"}
                      </span>
                      <span className="font-bold text-slate-500">{index + 1}</span>
                    </div>
                  </div>

                  <p className="text-right text-base font-bold text-slate-800">
                    {question.text}
                  </p>

                  {question.imageUrl ? (
                    <div className="relative h-40 overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={question.imageUrl}
                        alt="question"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const isCorrect = option.id === question.correctOptionId;
                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border-2 px-4 py-3",
                            isCorrect
                              ? "border-[#C8AC59] bg-[#F8EFD5]"
                              : "border-slate-200 bg-slate-50",
                          )}
                        >
                          <span className="text-xs font-semibold text-slate-400">
                            {option.label}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {option.text}
                          </span>
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-[#C8AC59]" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>

        {/* Right: exam settings */}
        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Star className="h-4 w-4 text-[#C8AC59]" />
                {t("settings.title")}
              </h3>

              {[
                {
                  label: t("settings.passing"),
                  value: `${exam.passingGradePct}%`,
                  className: "text-[#C8AC59] font-bold text-lg",
                },
                {
                  label: t("settings.duration"),
                  value: `${exam.durationMin} ${t("settings.minutes")}`,
                  className: "text-slate-800 font-bold text-lg",
                },
                {
                  label: t("settings.totalPoints"),
                  value: `${totalPoints}`,
                  className: "text-[#C8AC59] font-bold text-lg",
                },
              ].map(({ label, value, className }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={className}>{value}</span>
                  <span className="text-sm text-slate-500">{label}</span>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-9 rounded-full bg-[#C8AC59]" />
                  <span className="text-xs font-semibold text-slate-500">
                    {t("settings.enabled")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Shuffle className="h-4 w-4" />
                  <span>{t("settings.randomOrder")}</span>
                </div>
              </div>

              {/* Ready badge */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-emerald-700">{t("readyBadge")}</p>
                <p className="mt-1 text-xs text-emerald-600">{t("readyDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
