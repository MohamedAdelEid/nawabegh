"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { BoldIcon, Check , CheckCircle2, Image as ImageIcon, ItalicIcon, List, ListChecks, ListIcon, Save, X } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import {
  createQuestionBankQuestion,
  getQuestionBankEnums,
  type CreateQuestionBankChoicePayload,
  type QuestionBankEnumOption,
} from "@/modules/admin/infrastructure/api/questionBankApi";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  QUESTION_BANK_UPLOAD_FOLDER,
  uploadAdminFile,
} from "@/modules/admin/infrastructure/api/fileUploadApi";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import {
  QuestionBankAddPageSkeleton,
  QuestionBankAnimatedSection,
} from "@/modules/admin/presentation/components/question-bank";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

type QuestionKind = "multipleChoice" | "trueFalse";

/** Backend `QuestionBank` questionType values (fixed contract). */
const QUESTION_TYPE_API_MCQ = 0;
const QUESTION_TYPE_API_TRUE_FALSE = 1;

type ChoiceForm = {
  id: string;
  text: string;
  isCorrect: boolean;
};

function getEnumLabel(option: QuestionBankEnumOption, locale: string): string {
  return locale.startsWith("ar") ? option.displayNameAr : option.displayNameEn;
}

function createInitialChoices(): ChoiceForm[] {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `choice-${index + 1}`,
    text: "",
    isCorrect: index === 0,
  }));
}

export function AdminQuestionBankAddPage() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [subjectId, setSubjectId] = useState("");
  const [difficultyLevelId, setDifficultyLevelId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [selectedAttachmentName, setSelectedAttachmentName] = useState("");
  const [selectedAttachmentPreview, setSelectedAttachmentPreview] = useState("");
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [explanation, setExplanation] = useState("");
  const [hint, setHint] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [isGeneralQuestion, setIsGeneralQuestion] = useState(true);
  const [submitForReview, setSubmitForReview] = useState(false);
  const [choices, setChoices] = useState<ChoiceForm[]>(createInitialChoices());
  const [shortAnswer, setShortAnswer] = useState("");
  const [questionType, setQuestionType] = useState<"trueFalse" | "multipleChoice">("multipleChoice");
  
  /** Which option is correct for true/false (UI + API). */
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<"true" | "false">("true");
  const [isSaving, setIsSaving] = useState(false);

  const enumsQuery = useQuery({
    queryKey: ["admin-question-bank-enums", locale],
    queryFn: getQuestionBankEnums,
  });

  const subjectsQuery = useQuery({
    queryKey: ["admin-subjects-page", locale],
    queryFn: () => getSubjectsPage({ keyword: "", pageNumber: 1, pageSize: 500 }),
  });

  const enums = enumsQuery.data?.data;

  const subjectOptions = useMemo(() => {
    const rows = subjectsQuery.data?.data?.rows ?? [];
    return [
      { value: "", label: t("questionBankAdd.fields.selectSubject") },
      ...rows.map((item) => ({
        value: String(item.id),
        label: locale.startsWith("ar") ? item.nameAr : item.nameEn,
      })),
    ];
  }, [subjectsQuery.data?.data?.rows, locale, t]);

  const questionKind: QuestionKind = questionType;

  const previewQuestion = questionText.trim() || t("questionBankAdd.placeholders.questionText");

  const previewChoices = useMemo(() => {
    if (questionKind === "trueFalse") {
      return [
        { id: "true", text: t("questionBankAdd.answers.trueOption"), isCorrect: trueFalseCorrect === "true" },
        { id: "false", text: t("questionBankAdd.answers.falseOption"), isCorrect: trueFalseCorrect === "false" },
      ];
    }
    return choices.map((choice, index) => ({
      id: choice.id,
      arabicIndex: index + 1,
      text: choice.text.trim() || t("questionBankAdd.placeholders.choice", { index: index + 1 }),
      isCorrect: choice.isCorrect,
    }));
  }, [choices, questionKind, t, trueFalseCorrect]);

  const handleChoiceTextChange = (index: number, text: string) => {
    setChoices((current) => current.map((item, idx) => (idx === index ? { ...item, text } : item)));
  };

  const setCorrectChoice = (selectedId: string) => {
    setChoices((current) =>
      current.map((item) => ({
        ...item,
        isCorrect: item.id === selectedId,
      })),
    );
  };

  const buildPayloadChoices = (): CreateQuestionBankChoicePayload[] => {
    if (questionKind === "trueFalse") {
      return [
        {
          text: t("questionBankAdd.answers.trueOption"),
          isCorrect: trueFalseCorrect === "true",
          order: 0,
          imageUrl: "",
        },
        {
          text: t("questionBankAdd.answers.falseOption"),
          isCorrect: trueFalseCorrect === "false",
          order: 1,
          imageUrl: "",
        },
      ];
    }

    return choices.map((choice, index) => ({
      text: choice.text.trim(),
      isCorrect: choice.isCorrect,
      order: index,
      imageUrl: "",
    }));
  };

  const validate = () => {
    if (!questionText.trim()) {
      notify.error(t("questionBankAdd.validation.questionTextRequired"));
      return false;
    }
    if (!difficultyLevelId || !subjectId) {
      notify.error(t("questionBankAdd.validation.enumsRequired"));
      return false;
    }
    if (questionKind === "multipleChoice" && choices.some((choice) => !choice.text.trim())) {
      notify.error(t("questionBankAdd.validation.choiceTextRequired"));
      return false;
    }
    if (questionKind === "multipleChoice" && !choices.some((choice) => choice.isCorrect)) {
      notify.error(t("questionBankAdd.validation.correctChoiceRequired"));
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSubjectId("");
    setDifficultyLevelId("");
    setQuestionText("");
    setAttachmentUrl("");
    setAttachmentFile(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    setExplanation("");
    setHint("");
    setTimerEnabled(false);
    setIsGeneralQuestion(true);
    setSubmitForReview(false);
    setChoices(createInitialChoices());
    setShortAnswer("");
    setTrueFalseCorrect("true");
    setQuestionType("multipleChoice");
  };

  const handleSave = async (addAnother: boolean) => {
    if (!validate()) return;

    const resolvedSubjectId = Number(subjectId);
    if (!Number.isFinite(resolvedSubjectId)) {
      notify.error(t("questionBankAdd.validation.enumsRequired"));
      return;
    }

    let finalAttachmentUrl = attachmentUrl.trim();
    if (attachmentFile) {
      setIsSaving(true);
      const upload = await uploadAdminFile(attachmentFile, QUESTION_BANK_UPLOAD_FOLDER);
      setIsSaving(false);
      if (!upload.ok) {
        notify.error(upload.errorMessage);
        return;
      }
      finalAttachmentUrl = upload.filePath;
    }

    setIsSaving(true);
    const result = await createQuestionBankQuestion({
      subjectId: resolvedSubjectId,
      questionText: questionText.trim(),
      hint: hint.trim(),
      explanation: explanation.trim(),
      attachmentUrl: finalAttachmentUrl,
      difficultyLevel: Number(difficultyLevelId),
      questionType:
        questionType === "trueFalse" ? QUESTION_TYPE_API_TRUE_FALSE : QUESTION_TYPE_API_MCQ,
      choices: buildPayloadChoices(),
      submitForReview,
    });
    setIsSaving(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage || t("questionBankAdd.messages.createError"));
      return;
    }

    notify.success(result.message ?? t("questionBankAdd.messages.createSuccess"));
    if (addAnother) {
      resetForm();
      return;
    }
    router.push(ROUTES.ADMIN.QUESTION_BANK.PREVIEW_All);
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAttachmentFile(file);
    setSelectedAttachmentName(file?.name ?? "");
    if (file) {
      setSelectedAttachmentPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    } else {
      setSelectedAttachmentPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
    }
    setAttachmentUrl("");
  };

  useEffect(() => {
    return () => {
      if (selectedAttachmentPreview) {
        URL.revokeObjectURL(selectedAttachmentPreview);
      }
    };
  }, [selectedAttachmentPreview]);

  const isFormLoading = enumsQuery.isPending || subjectsQuery.isPending;

  const header = (
    <DashboardPageHeader
      title={t("questionBankAdd.title")}
      description={t("questionBankAdd.description")}
      breadcrumbs={[
        { label: t("questionBank.title"), href: ROUTES.ADMIN.QUESTION_BANK.LIST },
        { label: t("questionBankAdd.title") },
      ]}
      action={
        <Button
          type="button"
          disabled={isSaving || isFormLoading}
          onClick={() => void handleSave(false)}
          className="dashboard-raised-button h-14 rounded-2xl bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
          style={{ boxShadow: "0px 4px 0px 0px #1E2E42" }}
        >
          <Save className="h-4 w-4" aria-hidden />
          {t("questionBankAdd.actions.save")}
        </Button>
      }
    />
  );

  return (
    <div className="space-y-8">
      {header}

      {isFormLoading ? (
        <div aria-busy="true" aria-label={t("questionBankAdd.messages.loading")}>
          <QuestionBankAddPageSkeleton />
        </div>
      ) : (
        <QuestionBankAnimatedSection delay={0.04}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <h1 className="text-[#334155] font-bold text-md">{t("questionBankAdd.fields.questionType")}</h1>
                <div className="flex items-center gap-4">
                  <label htmlFor="true-false" className={cn(
                    "flex items-center gap-2",
                    "px-8 py-3 rounded-lg cursor-pointer border-2 border-[#E2E8F0] text-base transition-all duration-300",
                    questionType === "trueFalse" ? "border-[#2C4260] bg-[#fff] text-[#2C4260] shadow-[0px_4px_0px_0px_#2C4260] font-bold" : "bg-[#F8FAFC] text-[#64748B]",
                  )} onClick={() => setQuestionType("trueFalse")}>
                    <CheckCircle2 className="h-5 w-5" />
                    {t("questionBank.filters.questionType.tf")}
                  </label>
                  <input type="radio" name="question-type" id="true-false" className="hidden"/>
                  <label htmlFor="multiple-choice" className={cn (
                    "flex items-center gap-2",
                    "px-8 py-3 rounded-lg cursor-pointer border-2 border-[#E2E8F0] text-base transition-all duration-300",
                    questionType === "multipleChoice" ? "border-[#2C4260] bg-[#fff] text-[#2C4260] shadow-[0px_4px_0px_0px_#2C4260] font-bold" : "bg-[#F8FAFC] text-[#64748B]",
                  )} onClick={() => setQuestionType("multipleChoice")}>
                    <ListChecks className="h-5 w-5" />
                    {t("questionBank.filters.questionType.mcq")}
                  </label>
                  <input type="radio" name="question-type" id="multiple-choice" className="hidden"/>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[#334155] font-bold text-md">{t("questionBankAdd.fields.questionText")}</p>
                <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white">
                  <textarea
                    value={questionText}
                    onChange={(event) => setQuestionText(event.target.value)}
                    placeholder={t("questionBankAdd.placeholders.questionText")}
                    rows={5}
                    className="w-full resize-none bg-white px-4 py-3 text-right text-base outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-[#334155] font-bold text-md">{t("questionBankAdd.answers.title")}</h1>
                {questionType === "trueFalse" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setTrueFalseCorrect("false")}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-center transition",
                        trueFalseCorrect === "false"
                          ? "border-[#FDA4AF] bg-[#FFF5F5]"
                          : "border-[#E2E8F0] bg-white",
                      )}
                    >
                      <div
                        className={cn(
                          "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full",
                          trueFalseCorrect === "false" ? "bg-[#FEE2E2]" : "bg-[#F8FAFC]",
                        )}
                      >
                        <X className={cn("h-7 w-7", trueFalseCorrect === "false" ? "text-[#EF4444]" : "text-slate-400")} />
                      </div>
                      <p className={cn("text-3xl font-black", trueFalseCorrect === "false" ? "text-[#1E3A8A]" : "text-slate-400")}>
                        {t("questionBankAdd.answers.falseOption")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrueFalseCorrect("true")}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-center transition",
                        trueFalseCorrect === "true"
                          ? "border-[#86EFAC] bg-[#F0FDF4]"
                          : "border-[#E2E8F0] bg-white",
                      )}
                    >
                      <div
                        className={cn(
                          "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full",
                          trueFalseCorrect === "true" ? "bg-[#DCFCE7]" : "bg-[#F8FAFC]",
                        )}
                      >
                        <Check className={cn("h-7 w-7", trueFalseCorrect === "true" ? "text-[#22C55E]" : "text-slate-400")} />
                      </div>
                      <p className={cn("text-3xl font-black", trueFalseCorrect === "true" ? "text-[#1E3A8A]" : "text-slate-400")}>
                        {t("questionBankAdd.answers.trueOption")}
                      </p>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {previewChoices.map((choice, index) => {
                      const arabicIndex = index + 1;
                      return (
                        <div
                          key={choice.id}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2",
                            choice.isCorrect ? "border-[#C7AF6E] bg-[#FFFCF2]" : "border-slate-100 bg-white",
                          )}
                        >
                          <span className="rounded-sm bg-[#2C4260] px-2 py-1 text-xs font-bold text-[#fff]">
                            {arabicIndex}
                          </span>
                          <input
                            type="text"
                            value={choices[index]?.text ?? ""}
                            onChange={(event) => handleChoiceTextChange(index, event.target.value)}
                            placeholder={t("questionBankAdd.placeholders.choice", { index: index + 1 })}
                            className="h-10 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-right text-sm outline-none placeholder:text-slate-400 focus:border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setCorrectChoice(choice.id)}
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              choice.isCorrect ? "border-[#C7AF6E] bg-[#C7AF6E] text-white" : "border-slate-300",
                            )}
                            aria-label={t("questionBankAdd.answers.markAsCorrect")}
                          >
                            {choice.isCorrect ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-300" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-5 p-5">
            <LabeledTextarea
                label={t("questionBankAdd.fields.explanation")}
                value={explanation}
                onChange={setExplanation}
                placeholder={t("questionBankAdd.placeholders.explanation")}
                rows={4}
                className="flex flex-col gap-2"
                labelClassName="text-[#334155] font-bold text-md"
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-5 p-5">
            <LabeledTextarea
                label={t("questionBankAdd.fields.hint")}
                value={hint}
                onChange={setHint}
                placeholder={t("questionBankAdd.placeholders.hint")}
                rows={3}
                className="flex flex-col gap-2"
                labelClassName="text-[#334155] font-bold text-md"
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-right text-base font-bold text-[#243B5A]">
                  {t("questionBankAdd.side.studentPreviewTitle")}
                </h3>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  {t("questionBankAdd.side.studentPreviewTag")}
                </span>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                {selectedAttachmentPreview ? (
                  <div className="max-h-64 overflow-hidden">
                    <img
                      src={selectedAttachmentPreview}
                      alt={selectedAttachmentName || t("questionBankAdd.side.attachmentTitle")}
                      className="max-h-64 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <p className="text-right text-xl font-bold text-[#243B5A]">{previewQuestion}</p>
                {previewChoices.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {previewChoices.map((choice, index) => (
                      <div
                        key={choice.id}
                        className={cn(
                          "rounded-md border-2 px-3 py-2 text-sm text-slate-600 space-x-2",
                          choice.isCorrect ? "border-[#2C4260] bg-[#EEF2FF4D] text-[#2C4260]" : "border-slate-200",
                        )}
                      >
                        <span className="ms-2 text-[#243B5A]">({index + 1})</span>
                        {choice.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 px-3 py-2 text-right text-sm text-slate-600">
                    {shortAnswer.trim() || t("questionBankAdd.placeholders.shortAnswer")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3">
                <p className="text-[#334155] font-bold text-md text-right">
                  {t("questionBankAdd.side.attachmentTitle")}
                </p>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleAttachmentChange}
                />
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className="w-full h-[10rem] rounded-lg border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F3F7FC] transition-colors"
                >
                  {selectedAttachmentPreview ? (
                    <div className="h-full w-full p-2">
                      <img
                        src={selectedAttachmentPreview}
                        alt={selectedAttachmentName || t("questionBankAdd.side.attachmentTitle")}
                        className="h-full w-full rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-[#94A3B8]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                        <ImageIcon className="h-7 w-7" />
                      </div>
                      <p className="font-bold text-[#7284A2]">{t("questionBankAdd.side.chooseImage")}</p>
                      <p className="text-[#94A3B8]">{t("questionBankAdd.side.imageFormats")}</p>
                    </div>
                  )}
                </button>
                {selectedAttachmentName ? (
                  <p className="text-right text-xs text-slate-500">{selectedAttachmentName}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-4 p-4">
              <p className="text-right text-sm font-bold text-[#243B5A]">
                {t("questionBankAdd.side.questionSettingsTitle")}
              </p>
              <LabeledSelect
                label={t("questionBankAdd.fields.subject")}
                value={subjectId}
                onChange={setSubjectId}
                options={subjectOptions}
                disabled={subjectsQuery.isLoading}
              />
              <div className="space-y-2 text-right">
                <p className="text-xs font-medium text-[#64748B]">{t("questionBankAdd.fields.difficulty")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(enums?.difficultyLevels ?? []).map((item) => {
                    const id = String(item.value);
                    const active = difficultyLevelId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDifficultyLevelId(id)}
                        className={cn(
                          "h-10 rounded-md border text-xs font-semibold transition",
                          active
                            ? "border-[#243B5A] bg-[#EEF4FF] text-[#243B5A]"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                        )}
                      >
                        {getEnumLabel(item, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 shadow-[0px_6px_0px_0px_#0000000A]">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#243B5A]">{t("questionBankAdd.side.generalQuestion")}</span>
                <StatusSwitch
                  checked={isGeneralQuestion}
                  onChange={setIsGeneralQuestion}
                  activeLabel={t("questionBankAdd.side.generalQuestion")}
                  inactiveLabel={t("questionBankAdd.side.generalQuestion")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#243B5A]">{t("questionBankAdd.side.timerToggle")}</span>
                <StatusSwitch
                  checked={timerEnabled}
                  onChange={setTimerEnabled}
                  activeLabel={t("questionBankAdd.side.timerToggle")}
                  inactiveLabel={t("questionBankAdd.side.timerToggle")}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => void handleSave(true)}
            className="h-12 w-full rounded-lg border-[#C7AF6E] text-[#8F7A47] hover:bg-[#F8F3E3] shadow-[0px_4px_0px_0px_#C7AF6E]"
          >
            {t("questionBankAdd.actions.saveAndAdd")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.PREVIEW_All)}
            className="h-12 w-full rounded-xl text-slate-500 hover:text-slate-700"
          >
            {t("questionBankAdd.actions.cancel")}
          </Button>
        </div>
      </div>
        </QuestionBankAnimatedSection>
      )}
    </div>
  );
}
