"use client";

import { useEffect, useState } from "react";
import { FilePenLine, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  ExamQuestion,
  ExamQuestionTypeId,
  FlashcardDifficultyId,
} from "@/modules/admin/domain/data/journeyEditorData";
import { mapExamQuestionToUpdatePayload } from "@/modules/admin/domain/utils/quizExamMappers";
import { updateQuizQuestion } from "@/modules/admin/infrastructure/api/quizzesApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalClose,
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

type ChoiceForm = {
  id: string;
  text: string;
  isCorrect: boolean;
};

interface Props {
  open: boolean;
  question: ExamQuestion | null;
  onClose: () => void;
  onUpdated: () => void;
}

const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function createMcqChoices(question?: ExamQuestion | null): ChoiceForm[] {
  if (question?.type === "multipleChoice" && question.options.length > 0) {
    return question.options.map((option) => ({
      id: option.id,
      text: option.text,
      isCorrect: option.id === question.correctOptionId,
    }));
  }

  return Array.from({ length: 4 }, (_, index) => ({
    id: `choice-${index + 1}`,
    text: "",
    isCorrect: index === 0,
  }));
}

export function EditExamQuestionModal({ open, question, onClose, onUpdated }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examEditQuestions.editModal");
  const tDiff = useTranslations("admin.dashboard.journeyEditor.examEditQuestions.difficulty");

  const [questionType, setQuestionType] = useState<ExamQuestionTypeId>("multipleChoice");
  const [difficulty, setDifficulty] = useState<FlashcardDifficultyId>("medium");
  const [points, setPoints] = useState(10);
  const [text, setText] = useState("");
  const [choices, setChoices] = useState<ChoiceForm[]>(createMcqChoices);
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<"true" | "false">("true");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !question) return;

    setQuestionType(question.type);
    setDifficulty(question.difficulty);
    setPoints(question.points > 0 ? question.points : 1);
    setText(question.text);
    setChoices(createMcqChoices(question));

    if (question.type === "trueFalse") {
      const correctIndex = question.options.findIndex(
        (option) => option.id === question.correctOptionId,
      );
      const correctText = (question.options[correctIndex]?.text ?? "").trim().toLowerCase();
      const looksFalse =
        correctText.includes("خطأ") ||
        correctText.includes("خطا") ||
        correctText === "false" ||
        correctText === "f";
      setTrueFalseCorrect(looksFalse ? "false" : correctIndex === 1 ? "false" : "true");
    }
  }, [open, question, t]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  const handleTypeChange = (nextType: ExamQuestionTypeId) => {
    setQuestionType(nextType);
    if (nextType === "trueFalse") {
      setTrueFalseCorrect("true");
      return;
    }
    setChoices((current) => {
      if (current.length >= 2) {
        return current.slice(0, 4).map((choice, index) => ({
          ...choice,
          isCorrect: index === 0,
        }));
      }
      return createMcqChoices();
    });
  };

  const setCorrectChoice = (selectedId: string) => {
    setChoices((current) =>
      current.map((item) => ({
        ...item,
        isCorrect: item.id === selectedId,
      })),
    );
  };

  const validate = () => {
    if (!text.trim()) {
      notify.error(t("validation.textRequired"));
      return false;
    }
    if (!(points > 0)) {
      notify.error(t("validation.pointsInvalid"));
      return false;
    }
    if (questionType === "multipleChoice") {
      if (choices.some((choice) => !choice.text.trim())) {
        notify.error(t("validation.choicesRequired"));
        return false;
      }
      if (!choices.some((choice) => choice.isCorrect)) {
        notify.error(t("validation.correctRequired"));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!question || !validate()) return;

    const payloadChoices =
      questionType === "trueFalse"
        ? [
            {
              text: t("trueOption"),
              isCorrect: trueFalseCorrect === "true",
              order: 0,
            },
            {
              text: t("falseOption"),
              isCorrect: trueFalseCorrect === "false",
              order: 1,
            },
          ]
        : choices.map((choice, index) => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
            order: index,
          }));

    setSaving(true);
    const result = await updateQuizQuestion(
      question.id,
      mapExamQuestionToUpdatePayload(question, {
        text,
        type: questionType,
        points,
        difficulty,
        choices: payloadChoices,
      }),
    );
    setSaving(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("saveError"));
      return;
    }

    notify.success(t("saveSuccess"));
    onUpdated();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      panelClassName="max-h-[90vh] w-[min(95vw,40rem)] overflow-y-auto"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3 text-right">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF2FD] text-[#243B5A]">
            <FilePenLine className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <ModalTitle className="text-xl font-bold text-slate-800">{t("title")}</ModalTitle>
            <ModalDescription className="text-sm text-slate-500">
              {question
                ? t("subtitle", { order: question.order })
                : t("subtitleFallback")}
            </ModalDescription>
          </div>
        </div>

        <ModalClose asChild>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            aria-label={t("cancel")}
          >
            <X className="h-5 w-5" />
          </button>
        </ModalClose>
      </div>

      <div className="space-y-5">
        <div className="space-y-2 text-right">
          <label className="text-sm font-semibold text-slate-600">{t("questionText")}</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm outline-none transition-colors focus:border-[#243B5A]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-right">
            <label className="text-sm font-semibold text-slate-600">{t("questionType")}</label>
            <div className="flex gap-2">
              {(["multipleChoice", "trueFalse"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors cursor-pointer",
                    questionType === type
                      ? "bg-[#243B5A] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {type === "multipleChoice" ? t("multipleChoice") : t("trueFalse")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-semibold text-slate-600">{t("points")}</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(event) => setPoints(Number(event.target.value) || 1)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm outline-none transition-colors focus:border-[#243B5A]"
            />
          </div>
        </div>

        <div className="text-right">
          <SearchableSelect
            label={t("difficulty")}
            value={difficulty}
            onChange={(value) => setDifficulty(value as FlashcardDifficultyId)}
            options={DIFFICULTY_OPTIONS.map((level) => ({
              value: level,
              label: tDiff(level),
            }))}
            className="gap-1.5"
            labelClassName="text-sm font-semibold text-slate-600"
            triggerClassName="h-11 rounded-2xl border-slate-200 bg-white px-4 text-right text-sm shadow-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-[#F8F1D8] px-3 py-1 text-xs font-semibold text-[#8A6A1D]">
              {t("selectCorrect")}
            </span>
            <label className="text-sm font-semibold text-slate-600">{t("options")}</label>
          </div>

          {questionType === "trueFalse" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {(["true", "false"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTrueFalseCorrect(value)}
                  className={cn(
                    "flex min-h-[3.5rem] items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer",
                    trueFalseCorrect === value
                      ? "border-[#243B5A] bg-white text-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full border-2",
                      trueFalseCorrect === value ? "border-[#243B5A]" : "border-slate-300",
                    )}
                  >
                    {trueFalseCorrect === value ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#243B5A]" />
                    ) : null}
                  </span>
                  {value === "true" ? t("trueOption") : t("falseOption")}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {choices.map((choice, index) => (
                <div
                  key={choice.id}
                  className={cn(
                    "rounded-2xl border p-3 transition-colors duration-200",
                    choice.isCorrect ? "border-[#243B5A]" : "border-slate-200",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectChoice(choice.id)}
                      className={cn(
                        "mt-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 cursor-pointer",
                        choice.isCorrect ? "border-[#243B5A]" : "border-slate-300",
                      )}
                      aria-label={t("selectCorrect")}
                    >
                      {choice.isCorrect ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#243B5A]" />
                      ) : null}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {OPTION_LABELS[index] ?? index + 1}
                      </span>
                      <input
                        value={choice.text}
                        onChange={(event) =>
                          setChoices((current) =>
                            current.map((item, idx) =>
                              idx === index ? { ...item, text: event.target.value } : item,
                            ),
                          )
                        }
                        placeholder={t("choicePlaceholder", { index: index + 1 })}
                        className="h-10 w-full rounded-xl border border-transparent bg-slate-50 px-3 text-right text-sm outline-none transition-colors focus:border-[#243B5A] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
        <Button
          type="button"
          className="dashboard-raised-button h-12 rounded-2xl bg-[#243B5A] px-6 text-sm font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
          style={{ boxShadow: "0px 4px 0px 0px #1E2E42" }}
          onClick={() => void handleSubmit()}
          disabled={saving}
        >
          {saving ? t("saving") : t("submit")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 rounded-2xl px-4 text-sm font-semibold text-slate-500 cursor-pointer"
          onClick={onClose}
          disabled={saving}
        >
          {t("cancel")}
        </Button>
      </div>
    </ModalShell>
  );
}
