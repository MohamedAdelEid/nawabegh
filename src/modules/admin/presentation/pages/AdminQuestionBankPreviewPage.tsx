"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";
import { BookOpen, GraduationCap, BarChart3, WandSparkles, Save } from "lucide-react";
import {
  getQuestionBankEnums,
  getQuestionBankQuestionById,
  type QuestionBankQuestionDetail,
  type QuestionBankEnumOption,
} from "@/modules/admin/infrastructure/api/questionBankApi";
import {
  QuestionBankPreviewChoiceCard,
  QuestionBankPreviewInfoItem,
  QuestionBankPreviewStatCard,
} from "@/modules/admin/presentation/components/question-bank";
import { notify } from "@/shared/application/lib/toast";
import { Light } from "../assets/icons/Light";

function getEnumLabel(option: QuestionBankEnumOption, locale: string): string {
  return locale.startsWith("ar") ? option.displayNameAr : option.displayNameEn;
}

export function AdminQuestionBankPreviewPage() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("id");
  const [question, setQuestion] = useState<QuestionBankQuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});
  const [difficultyMap, setDifficultyMap] = useState<Record<number, string>>({});
  const [questionTypeMap, setQuestionTypeMap] = useState<Record<number, string>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!questionId) {
        setQuestion(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [detailResult, enumsResult] = await Promise.all([
        getQuestionBankQuestionById(questionId),
        getQuestionBankEnums(),
      ]);
      if (!alive) return;

      if (detailResult.errorMessage || !detailResult.data) {
        notify.error(detailResult.errorMessage ?? t("questionBankPreview.messages.loadError"));
        setQuestion(null);
      } else {
        setQuestion(detailResult.data);
      }

      const enums = enumsResult.data;
      if (enums) {
        setStatusMap(
          Object.fromEntries(enums.statuses.map((item) => [item.value, getEnumLabel(item, locale)])),
        );
        setDifficultyMap(
          Object.fromEntries(enums.difficultyLevels.map((item) => [item.value, getEnumLabel(item, locale)])),
        );
        setQuestionTypeMap(
          Object.fromEntries(enums.questionTypes.map((item) => [item.value, getEnumLabel(item, locale)])),
        );
      }

      setIsLoading(false);
    };

    void load();
    return () => {
      alive = false;
    };
  }, [locale, questionId, t]);

  const sortedChoices = useMemo(
    () => [...(question?.choices ?? [])].sort((a, b) => a.order - b.order),
    [question?.choices],
  );
  const correctChoicesCount = useMemo(
    () => sortedChoices.filter((choice) => choice.isCorrect).length,
    [sortedChoices],
  );
  const accuracyPercent = useMemo(() => {
    if (!sortedChoices.length) return 0;
    return Math.round((correctChoicesCount / sortedChoices.length) * 100);
  }, [correctChoicesCount, sortedChoices.length]);

  if (isLoading) {
    return <div className="py-14 text-center text-slate-500">{t("questionBankPreview.messages.loading")}</div>;
  }

  if (!questionId || !question) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-right">
        <p className="text-lg font-bold text-red-600">{t("questionBankPreview.messages.notFoundTitle")}</p>
        <p className="text-sm text-red-500">{t("questionBankPreview.messages.notFoundDescription")}</p>
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.LIST)}>
          {t("questionBankPreview.actions.close")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("questionBank.title"), href: ROUTES.ADMIN.QUESTION_BANK.LIST },
          { label: t("questionBankPreview.title") },
        ]} />
        <DashboardPageHeader
        title={t("questionBankPreview.title")}
        description={t("questionBankPreview.description")}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
            style={{
              boxShadow: "0px 4px 0px 0px #1E2E42"
            }}
            // onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.ADD)}
          >
            {t("questionBankPreview.actions.save")}
          <Save className="h-4 w-4" aria-hidden />
          </Button>
        }
      />
      </div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-[0px_6px_0px_0px_#0000000A]">
          <CardContent className="space-y-6 p-6">
            <div className="inline-flex w-fit items-center rounded-full bg-[#F2EEFF] px-3 py-1 text-xs font-bold text-[#6A4EF5]">
              {question.questionType !== null
                ? (questionTypeMap[question.questionType] ?? t("questionBankPreview.questionTypeBadge"))
                : t("questionBankPreview.questionTypeBadge")}
            </div>
            <div className="flex items-center gap-4 flex-col">
              <div className="bg-[#EEF2FF] w-16 h-16 rounded-full flex items-center justify-center">
              <Light />
              </div>
            <h3 className="text-4xl font-black leading-tight text-[#2B415E]">{question.questionText}</h3>
            </div>
            {/* {question.hint ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                {question.hint}
              </p>
            ) : null} */}
            {question.attachmentUrl ? (
              // Keep media preview when backend returns question image attachment.
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <img src={question.attachmentUrl} alt={t("questionBankPreview.attachmentAlt")} className="max-h-72 w-full object-cover" />
              </div>
            ) : null}
            <div className="flex flex-wrap gap-6 justify-center place-items-center">
              {sortedChoices.map((choice) => (
                <QuestionBankPreviewChoiceCard
                  key={choice.id}
                  text={choice.text || t("questionBankPreview.emptyChoice")}
                  isCorrect={choice.isCorrect}
                  type={question.questionType ?? -1}
                />
              ))}
            </div>
            {question.explanation ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-lg font-bold text-slate-700">{t("questionBankPreview.explanationTitle")}</p>
                <p className="mt-2 text-slate-700">{question.explanation}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <div className="space-y-8">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-3 p-4 text-right">
              <h4 className="text-lg font-extrabold text-slate-700">{t("questionBankPreview.meta.title")}</h4>
              <QuestionBankPreviewInfoItem
                label={t("questionBank.table.columns.subject")}
                value={question.subjectName}
                icon={BookOpen}
              />
              <QuestionBankPreviewInfoItem
                label={t("questionBank.table.columns.status")}
                value={question.status !== null ? (statusMap[question.status] ?? String(question.status)) : "—"}
                icon={GraduationCap}
                />
              <QuestionBankPreviewInfoItem
                value={
                  question.difficultyLevel !== null
                  ? (difficultyMap[question.difficultyLevel] ?? String(question.difficultyLevel))
                  : "—"
                }
                label={t("questionBank.table.columns.difficulty")}
                icon={BarChart3}
                tone={question.difficultyLevel === 0 ? "success" : question.difficultyLevel === 1 ? "warning" : "danger"}
              />
            </CardContent>
          </Card>
          <Card className="bg-[#243B5A] rounded-2xl border border-slate-200 shadow-[0px_8px_0px_0px_#0000000A]">
            <CardContent className="space-y-4 p-4 text-right">
              <h4 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <WandSparkles className="h-4 w-4" />
                {t("questionBankPreview.quickActions.title")}
              </h4>
              <Button
                type="button"
                className="w-full rounded-xl bg-white text-[#A38F5A] hover:bg-slate-100 min-h-14 font-bold shadow-[0px_4px_0px_0px_#A38F5A]"
                // onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.ADD)}
              >
                {t("questionBankPreview.actions.edit")}
              </Button>
              <Button
                variant="secondary"
                className="w-full rounded-xl bg-[#3A5273] text-white hover:bg-[#334B6B] min-h-14 font-bold shadow-[0px_4px_0px_0px_#334B6B]"
                // onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.LIST)}
              >
                {t("questionBankPreview.actions.close")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <section className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <QuestionBankPreviewStatCard
          value={String(sortedChoices.length)}
          label={t("questionBankPreview.stats.totalChoices")}
        />
        <QuestionBankPreviewStatCard
          value={String(correctChoicesCount)}
          label={t("questionBankPreview.stats.correctChoices")}
        />
        <QuestionBankPreviewStatCard
          value={`${accuracyPercent}%`}
          label={t("questionBankPreview.stats.correctRatio")}
        />
      </section>
    </div>
  );
}
