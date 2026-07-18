"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ExamQuestionTypeId,
  FlashcardDifficultyId,
} from "@/modules/admin/domain/data/journeyEditorData";
import { mapExamQuestionToAddPayload } from "@/modules/admin/domain/utils/quizExamMappers";
import { addQuizQuestion } from "@/modules/admin/infrastructure/api/quizzesApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

type ChoiceForm = {
  id: string;
  text: string;
  isCorrect: boolean;
};

interface Props {
  open: boolean;
  quizId: string;
  onClose: () => void;
  onAdded: () => void;
}

const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];

function createInitialChoices(): ChoiceForm[] {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `choice-${index + 1}`,
    text: "",
    isCorrect: index === 0,
  }));
}

export function AddExamQuestionModal({ open, quizId, onClose, onAdded }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examEditQuestions.addModal");
  const tDiff = useTranslations("admin.dashboard.journeyEditor.examEditQuestions.difficulty");

  const [questionType, setQuestionType] = useState<ExamQuestionTypeId>("multipleChoice");
  const [difficulty, setDifficulty] = useState<FlashcardDifficultyId>("medium");
  const [points, setPoints] = useState(10);
  const [text, setText] = useState("");
  const [choices, setChoices] = useState<ChoiceForm[]>(createInitialChoices);
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<"true" | "false">("true");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setQuestionType("multipleChoice");
    setDifficulty("medium");
    setPoints(10);
    setText("");
    setChoices(createInitialChoices());
    setTrueFalseCorrect("true");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      onClose();
    }
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
    if (!validate()) return;

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
    const result = await addQuizQuestion(
      quizId,
      mapExamQuestionToAddPayload(quizId, {
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
    resetForm();
    onAdded();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      panelClassName="max-h-[90vh] w-[min(95vw,32rem)] overflow-y-auto"
    >
      <ModalTitle className="mb-4 text-right text-lg font-bold text-slate-800">
        {t("title")}
      </ModalTitle>

      <div className="space-y-4">
        <div className="space-y-1.5 text-right">
          <label className="text-sm font-semibold text-slate-600">{t("questionType")}</label>
          <div className="flex gap-2">
            {(["multipleChoice", "trueFalse"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setQuestionType(type)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors",
                  questionType === type
                    ? "bg-[#2C4260] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                )}
              >
                {type === "multipleChoice" ? t("multipleChoice") : t("trueFalse")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 text-right">
          <label className="text-sm font-semibold text-slate-600">{t("questionText")}</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#C8AC59]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 text-right">
            <label className="text-sm font-semibold text-slate-600">{t("points")}</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(event) => setPoints(Number(event.target.value) || 1)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59]"
            />
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
              triggerClassName="h-11 rounded-2xl border-slate-200 bg-slate-50 px-4 text-right text-sm shadow-none"
            />
          </div>
        </div>

        {questionType === "trueFalse" ? (
          <div className="flex gap-2">
            {(["true", "false"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTrueFalseCorrect(value)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                  trueFalseCorrect === value
                    ? "bg-[#C8AC59] text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {value === "true" ? t("trueOption") : t("falseOption")}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={choice.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-choice"
                  checked={choice.isCorrect}
                  onChange={() => setCorrectChoice(choice.id)}
                  className="accent-[#C8AC59]"
                />
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
                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59]"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button
            className="flex-1 rounded-xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
            onClick={() => void handleSubmit()}
            disabled={saving}
          >
            {t("submit")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
