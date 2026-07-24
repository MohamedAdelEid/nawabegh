"use client";

import { useEffect, useState } from "react";
import { FilePenLine, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { QuestionType } from "@/shared/domain/enums/question.enums";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalClose,
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import type {
  AdminOnboardingQuizOption,
  AdminOnboardingQuizQuestion,
} from "@/modules/admin/domain/types/adminOnboardingQuiz.types";

type OptionDraft = AdminOnboardingQuizOption & { key: string };

interface OnboardingQuizEditQuestionModalProps {
  open: boolean;
  question: AdminOnboardingQuizQuestion | null;
  onClose: () => void;
  onApply: (question: AdminOnboardingQuizQuestion) => void;
}

function createOptionKey(order: number, id?: string): string {
  return id ?? `option-${order}-${Math.random().toString(36).slice(2, 8)}`;
}

function toOptionDrafts(options: AdminOnboardingQuizOption[]): OptionDraft[] {
  return options.map((option) => ({
    ...option,
    key: createOptionKey(option.order, option.id),
  }));
}

function createMcqOptions(count = 3): OptionDraft[] {
  return Array.from({ length: count }, (_, index) => ({
    key: createOptionKey(index + 1),
    order: index + 1,
    text: "",
    isCorrect: index === 0,
  }));
}

function createTrueFalseOptions(trueLabel: string, falseLabel: string): OptionDraft[] {
  return [
    {
      key: createOptionKey(1),
      order: 1,
      text: trueLabel,
      isCorrect: true,
    },
    {
      key: createOptionKey(2),
      order: 2,
      text: falseLabel,
      isCorrect: false,
    },
  ];
}

export function OnboardingQuizEditQuestionModal({
  open,
  question,
  onClose,
  onApply,
}: OnboardingQuizEditQuestionModalProps) {
  const t = useTranslations("admin.dashboard.questionBankOnboardingQuiz.editModal");
  const tTypes = useTranslations("admin.dashboard.questionBankOnboardingQuiz.types");

  const [text, setText] = useState("");
  const [type, setType] = useState<QuestionType>(QuestionType.MultipleChoice);
  const [points, setPoints] = useState(100);
  const [options, setOptions] = useState<OptionDraft[]>(createMcqOptions());

  useEffect(() => {
    if (!open || !question) return;
    setText(question.text);
    setType(question.type);
    setPoints(question.points > 0 ? question.points : 100);
    setOptions(
      question.options.length > 0
        ? toOptionDrafts(question.options)
        : question.type === QuestionType.TrueOrFalse
          ? createTrueFalseOptions(t("trueOption"), t("falseOption"))
          : createMcqOptions(),
    );
  }, [open, question, t]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  const handleTypeChange = (nextType: QuestionType) => {
    setType(nextType);
    if (nextType === QuestionType.TrueOrFalse) {
      setOptions(createTrueFalseOptions(t("trueOption"), t("falseOption")));
      return;
    }
    setOptions((current) => {
      if (current.length >= 2 && current.length <= 4) {
        return current.map((option, index) => ({
          ...option,
          order: index + 1,
          isCorrect: index === 0 ? true : false,
        }));
      }
      return createMcqOptions();
    });
  };

  const setCorrectOption = (key: string) => {
    setOptions((current) =>
      current.map((option) => ({
        ...option,
        isCorrect: option.key === key,
      })),
    );
  };

  const updateOptionText = (key: string, nextText: string) => {
    setOptions((current) =>
      current.map((option) => (option.key === key ? { ...option, text: nextText } : option)),
    );
  };

  const addOption = () => {
    setOptions((current) => {
      if (current.length >= 4) return current;
      return [
        ...current,
        {
          key: createOptionKey(current.length + 1),
          order: current.length + 1,
          text: "",
          isCorrect: false,
        },
      ];
    });
  };

  const removeOption = (key: string) => {
    setOptions((current) => {
      if (current.length <= 2) return current;
      const next = current
        .filter((option) => option.key !== key)
        .map((option, index) => ({ ...option, order: index + 1 }));
      if (!next.some((option) => option.isCorrect) && next[0]) {
        next[0] = { ...next[0], isCorrect: true };
      }
      return next;
    });
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
    if (type === QuestionType.MultipleChoice && (options.length < 2 || options.length > 4)) {
      notify.error(t("validation.mcqOptionCount"));
      return false;
    }
    if (type === QuestionType.TrueOrFalse && options.length !== 2) {
      notify.error(t("validation.tfOptionCount"));
      return false;
    }
    if (options.some((option) => !option.text.trim())) {
      notify.error(t("validation.optionsRequired"));
      return false;
    }
    if (options.filter((option) => option.isCorrect).length !== 1) {
      notify.error(t("validation.correctRequired"));
      return false;
    }
    return true;
  };

  const handleApply = () => {
    if (!question || !validate()) return;

    onApply({
      ...question,
      text: text.trim(),
      type,
      points,
      options: options.map((option, index) => ({
        ...(option.id ? { id: option.id } : {}),
        order: index + 1,
        text: option.text.trim(),
        isCorrect: option.isCorrect,
      })),
    });
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
              {question?.id
                ? t("subtitle", { id: question.id.slice(0, 8) })
                : t("subtitleNoId")}
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
              {(
                [
                  { value: QuestionType.MultipleChoice, label: tTypes("multipleChoice") },
                  { value: QuestionType.TrueOrFalse, label: tTypes("trueOrFalse") },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTypeChange(item.value)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors cursor-pointer",
                    type === item.value
                      ? "bg-[#243B5A] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-semibold text-slate-600">{t("points")}</label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(event) => setPoints(Number(event.target.value) || 0)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm outline-none transition-colors focus:border-[#243B5A]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-[#F8F1D8] px-3 py-1 text-xs font-semibold text-[#8A6A1D]">
              {t("selectCorrect")}
            </span>
            <label className="text-sm font-semibold text-slate-600">{t("options")}</label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((option, index) => (
              <div
                key={option.key}
                className={cn(
                  "rounded-2xl border p-3 transition-colors duration-200",
                  option.isCorrect ? "border-[#243B5A]" : "border-slate-200",
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOption(option.key)}
                    className={cn(
                      "mt-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 cursor-pointer",
                      option.isCorrect ? "border-[#243B5A]" : "border-slate-300",
                    )}
                    aria-label={t("selectCorrect")}
                  >
                    {option.isCorrect ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#243B5A]" />
                    ) : null}
                  </button>

                  <input
                    value={option.text}
                    onChange={(event) => updateOptionText(option.key, event.target.value)}
                    placeholder={t("optionPlaceholder", { index: index + 1 })}
                    className="h-10 w-full rounded-xl border border-transparent bg-slate-50 px-3 text-right text-sm outline-none transition-colors focus:border-[#243B5A] focus:bg-white"
                  />

                  {type === QuestionType.MultipleChoice && options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeOption(option.key)}
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 cursor-pointer"
                      aria-label={t("removeOption")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {type === QuestionType.MultipleChoice && options.length < 4 ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-2xl border-dashed border-slate-300 text-slate-600 cursor-pointer"
              onClick={addOption}
            >
              <Plus className="me-2 h-4 w-4" />
              {t("addOption")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
        <Button
          type="button"
          className="dashboard-raised-button h-12 rounded-2xl bg-[#243B5A] px-6 text-sm font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
          style={{ boxShadow: "0px 4px 0px 0px #1E2E42" }}
          onClick={handleApply}
        >
          {t("apply")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 rounded-2xl px-4 text-sm font-semibold text-slate-500 cursor-pointer"
          onClick={onClose}
        >
          {t("cancel")}
        </Button>
      </div>
    </ModalShell>
  );
}
