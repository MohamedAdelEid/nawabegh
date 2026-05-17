"use client";

import {
  FileUp,
  ImagePlus,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FlashCard, FlashcardDifficultyId } from "@/modules/admin/domain/data/journeyEditorData";
import {
  addFlashCard,
  generateFlashCardsWithAi,
} from "@/modules/admin/infrastructure/api/journeyEditorApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

interface Props {
  journeyId: string;
  stationId: string;
  groupId?: string;
}

const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];
const CARD_COUNT_OPTIONS = [5, 10, 15, 20];
const REVIEW_TIME_OPTIONS = [10, 15, 20, 30];
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"] as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function AdminJourneyFlashcardAddPage({
  journeyId,
  stationId,
  groupId = "fcg-1",
}: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor");
  const router = useRouter();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState<FlashcardDifficultyId>("medium");
  const [reviewTime, setReviewTime] = useState(15);
  const [completionPct, setCompletionPct] = useState(70);
  const [saving, setSaving] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<FlashcardDifficultyId>("easy");
  const [aiCount, setAiCount] = useState(10);
  const [aiTime, setAiTime] = useState(15);
  const [aiGenerating, setAiGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string } | null>(null);
  const [imageUploadState, setImageUploadState] = useState<"idle" | "loading" | "ready">("idle");

  const revokePreviewUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    return () => revokePreviewUrl(imagePreviewUrl);
  }, [imagePreviewUrl, revokePreviewUrl]);

  const clearImage = () => {
    setImagePreviewUrl((prev) => {
      revokePreviewUrl(prev);
      return null;
    });
    setImageMeta(null);
    setImageUploadState("idle");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const processImageFile = (file: File) => {
    const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
    const allowed = ACCEPTED_IMAGE_TYPES.includes(mime as (typeof ACCEPTED_IMAGE_TYPES)[number]);
    if (!allowed) {
      notify.error(t("flashcardAdd.upload.imageFormats"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      notify.error(t("flashcardAdd.upload.imageFormats"));
      return;
    }

    setImageUploadState("loading");
    setImageMeta({ name: file.name, size: formatFileSize(file.size) });

    window.setTimeout(() => {
      setImagePreviewUrl((prev) => {
        revokePreviewUrl(prev);
        return URL.createObjectURL(file);
      });
      setImageUploadState("ready");
    }, 350);
  };

  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    processImageFile(file);
  };

  const handleSave = async (andAddAnother = false) => {
    if (!front.trim()) {
      notify.error("Question (front) is required");
      return;
    }
    setSaving(true);
    const result = await addFlashCard(groupId, { front, back, difficulty, reviewTimeSec: reviewTime });
    setSaving(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "Failed to save card");
      return;
    }
    notify.success("Card saved");
    if (andAddAnother) {
      setFront("");
      setBack("");
      clearImage();
    } else {
      router.push(ROUTES.ADMIN.JOURNEY_EDITOR.FLASHCARD_GROUP(journeyId, stationId));
    }
  };

  const handleAiGenerate = async () => {
    setAiGenerating(true);
    const result = await generateFlashCardsWithAi({
      groupId,
      difficulty: aiDifficulty,
      count: aiCount,
      reviewTimeSec: aiTime,
    });
    setAiGenerating(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "AI generation failed");
      return;
    }
    notify.success(`${result.data.length} cards generated`);
    setAiOpen(false);
    router.push(ROUTES.ADMIN.JOURNEY_EDITOR.FLASHCARD_GROUP(journeyId, stationId));
  };

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("flashcardAdd.title")}
        description={t("flashcardAdd.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          {
            label: t("breadcrumbs.journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          {
            label: t("breadcrumbs.flashcardGroup"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.FLASHCARD_GROUP(journeyId, stationId),
          },
          { label: t("breadcrumbs.addFlashcard") },
        ]}
        action={
          <Button
            className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
            onClick={() => setAiOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            {t("flashcardAdd.aiGenerate")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "flex h-10 w-12 items-center justify-center rounded-lg text-sm font-bold transition-colors cursor-pointer",
                  i === 0
                    ? "bg-[#2C4260] text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-200",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="p-5 space-y-2">
                <p className="text-md font-semibold text-slate-500">
                  {t("flashcardAdd.completionRate")}
                </p>
              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-right">
                <p className="mt-0.5 text-sm font-bold text-slate-700">
                  {t("flashcardAdd.completionRateLabel", { value: completionPct })}
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Card number nav */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="p-5">

              {/* AI button inline */}
              <Button
                variant="outline"
                className="mb-4 h-10 gap-2 rounded-xl border-[#C8AC59] text-[#C8AC59] hover:bg-[#FFF9EC]"
                onClick={() => setAiOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                {t("flashcardAdd.aiGenerate")}
              </Button>

              {/* Front */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-600">
                  {t("flashcardAdd.fields.front")}
                </label>
                <textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder={t("flashcardAdd.fields.frontPlaceholder")}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </div>

              {/* Back */}
              <div className="mt-4 space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">
                  {t("flashcardAdd.fields.back")}
                </label>
                <textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder={t("flashcardAdd.fields.backPlaceholder")}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-6">
            <Card className="flex-1 rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
              <CardContent className="flex flex-col w-full gap-4 p-5">
                <p className="font-semibold text-slate-600">
                  {t("flashcardAdd.fields.difficulty")}
                </p>
                <div className="flex gap-2 justify-between w-full">
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "h-12 flex-1 rounded-xl py-2 font-semibold transition-colors",
                        difficulty === d
                          ? "bg-[#C8AC59] text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {t(`flashcardAdd.difficulty.${d}`)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
              <CardContent className="flex flex-col w-full gap-4 p-5">
                <p className="text-sm font-semibold text-slate-600">
                  {t("flashcardAdd.fields.reviewTime")}
                </p>
                <div className="flex justify-between w-full items-center gap-2">
                  <input
                    type="number"
                    value={reviewTime}
                    onChange={(e) => setReviewTime(Number(e.target.value))}
                    min={5}
                    max={300}
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-sm outline-none focus:border-[#C8AC59]"
                  />
                  <span className="text-sm text-slate-400">SEC</span>
                </div>
              </CardContent>
            </Card>
          </div>
          

          {/* File upload */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="text-right text-sm font-bold text-slate-700">
                <span className="ml-2 text-slate-400">02.</span>
                {t("flashcardAdd.fields.sources")}
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.mp4"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile({
                      name: file.name,
                      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    });
                  }
                }}
              />

              {uploadedFile ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-rose-400 hover:text-rose-600 text-lg leading-none"
                  >
                    ×
                  </button>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-400">{uploadedFile.size}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                    <FileUp className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <div className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400">
                  <div
                    role="presentation"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 transition-colors hover:text-[#C8AC59]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp className="h-8 w-8" />
                    <p className="font-semibold">{t("flashcardAdd.upload.dragDrop")}</p>
                    <p className="text-xs">
                      {t("flashcardAdd.upload.formats")} · {t("flashcardAdd.upload.maxSize")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-slate-300 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("flashcardAdd.upload.browse")}
                  </Button>
                </div>
              )}

              {/* Image upload */}
              <h3 className="text-right text-sm font-bold text-slate-700">
                {t("flashcardAdd.fields.image")}
              </h3>
              <input
                ref={imageInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={handleImageInputChange}
              />
              {imageUploadState === "loading" ? (
                <div className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
                  <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
                  <p className="font-semibold">{t("flashcardAdd.upload.imageUploading")}</p>
                  {imageMeta ? (
                    <p className="text-xs text-slate-400">{imageMeta.name}</p>
                  ) : null}
                </div>
              ) : imagePreviewUrl ? (
                <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50">
                  <div className="relative mx-auto aspect-video max-h-56 w-full max-w-md">
                    <Image
                      src={imagePreviewUrl}
                      alt={t("flashcardAdd.upload.imagePreviewAlt")}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 28rem"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3">
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                    >
                      {t("flashcardAdd.upload.removeImage")}
                    </button>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-600">
                        {t("flashcardAdd.upload.imageUploaded")}
                      </p>
                      {imageMeta ? (
                        <p className="text-xs text-slate-400">
                          {imageMeta.name} · {imageMeta.size}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processImageFile(file);
                  }}
                >
                  <div
                    role="presentation"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 transition-colors hover:text-[#C8AC59]"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImagePlus className="h-8 w-8" />
                    <p className="font-semibold">{t("flashcardAdd.upload.imageDragDrop")}</p>
                    <p className="text-xs">{t("flashcardAdd.upload.imageFormats")}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-slate-300 text-xs"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {t("flashcardAdd.upload.browse")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="p-5">
              <p className="mb-3 text-right text-sm font-bold text-slate-600">
                {t("flashcardAdd.preview.title")}
              </p>

              {/* Card front preview */}
              <div className="mb-3 flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 p-4 text-center">
                {imagePreviewUrl ? (
                  <div className="relative h-24 w-full max-w-[200px]">
                    <Image
                      src={imagePreviewUrl}
                      alt=""
                      fill
                      unoptimized
                      className="rounded-lg object-cover"
                      sizes="200px"
                    />
                  </div>
                ) : null}
                {front ? (
                  <p className="font-semibold text-slate-700">{front}</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-400">
                      {t("flashcardAdd.preview.frontLabel")}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {t("flashcardAdd.preview.backLabel")}
                    </p>
                  </>
                )}
              </div>

              {/* Dots */}
              <div className="mb-3 flex justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2C4260]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              </div>

              {/* Tip */}
              <div className="flex gap-2 rounded-2xl border border-[#BDEFA2] bg-[#E5FFD8] p-3 text-xs text-[#2B6D10]">
                <Lightbulb className="h-4 w-4 shrink-0" />
                {t("flashcardAdd.tip.text")}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Button
            className="h-12 w-full rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
            onClick={() => void handleSave(true)}
            disabled={saving}
          >
            {t("flashcardAdd.actions.saveAndAddAnother")}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-2xl border-[#2C4260] text-[#2C4260] hover:bg-[#2C4260] hover:text-white"
            onClick={() => void handleSave(false)}
            disabled={saving}
          >
            {t("flashcardAdd.actions.addToGroup")}
          </Button>
        </aside>
      </div>

      {/* AI Generation Modal */}
      <ModalShell
        open={aiOpen}
        onOpenChange={setAiOpen}
        overlayClassName="bg-[#2C4260]/30"
        panelClassName="w-[min(95vw,30rem)] p-7"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8EFD5] text-[#A17B18]">
          <Sparkles className="h-6 w-6" />
        </div>
        <ModalTitle className="mb-1 text-xl font-bold text-slate-800 text-right">
          {t("aiGenerateModal.title")}
        </ModalTitle>
        <ModalDescription className="mb-5 text-sm text-slate-500 text-right">
          {t("aiGenerateModal.subtitle")}
        </ModalDescription>

        <div className="space-y-5">
          <div className="space-y-2 text-right">
            <p className="text-sm font-semibold text-slate-600">
              {t("aiGenerateModal.difficulty")}
            </p>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setAiDifficulty(d)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                    aiDifficulty === d
                      ? d === "easy"
                        ? "bg-emerald-500 text-white"
                        : d === "medium"
                          ? "bg-amber-500 text-white"
                          : "bg-rose-500 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {t(`flashcardAdd.difficulty.${d}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-right">
              <p className="text-sm font-semibold text-slate-600">
                {t("aiGenerateModal.reviewTime")}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={aiTime}
                  onChange={(e) => setAiTime(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-right text-sm outline-none"
                >
                  {REVIEW_TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className="shrink-0 text-sm text-slate-400">
                  {t("aiGenerateModal.seconds")}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <p className="text-sm font-semibold text-slate-600">
                {t("aiGenerateModal.count")}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-right text-sm outline-none"
                >
                  {CARD_COUNT_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="shrink-0 text-sm text-slate-400">
                  {t("aiGenerateModal.cards")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t("aiGenerateModal.cancel")}
            </button>
            <Button
              className="flex-1 h-12 gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void handleAiGenerate()}
              disabled={aiGenerating}
            >
              {aiGenerating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t("aiGenerateModal.startGeneration")}
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
